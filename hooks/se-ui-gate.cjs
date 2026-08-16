#!/usr/bin/env node
// se-ui-gate — PreToolUse hook (matcher Bash) BLOQUANT au commit.
// Refuse `git commit` quand un fichier front STAGÉ n'a pas passé le rituel /se-ui :
//   1. anti-patterns mesurés par le détecteur impeccable vendorisé (déterministe),
//   2. passe /se-ui enregistrée pour CE contenu exact (registre .planning/design/ui-passes.json),
//   3. checkpoint humain avec URL de la page et GO explicite.
//
// Pourquoi au commit et pas à l'édition : une UI se juge finie, pas à chaque frappe. Le
// commit est le seul moment où « c'est livrable » est affirmé — donc le seul où l'exiger.
//
// Pas d'event PreCommit natif → on s'accroche à PreToolUse Bash (même montage que se-slop-gate).
// Bloque via permissionDecision: "deny". Contrat: exit 0 toujours, silent fail.

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execSync, spawnSync } = require('child_process');
const { isSeProject, isFrontCodeFile, seFlag } = require('./guard-lib.cjs');
const { contentHash, readLedger, entryStatus, STATUS_LABEL } = require('./ui-ledger.cjs');

const DETECTOR = path.join(__dirname, '..', 'vendor', 'design', 'impeccable', 'detect.mjs');
const DETECTOR_TIMEOUT_MS = 10000;
const GIT_TIMEOUT_MS = 3000;
const MAX_LISTED = 12;

function deny(reason) {
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: reason },
  }));
  process.exit(0);
}

/**
 * Scan the exact content being committed, not the working tree. Staged content and disk
 * content diverge as soon as a file is edited after `git add` — judging the wrong one
 * makes the gate both bypassable and randomly wrong. Blobs land in a temp dir keeping
 * their basename so the detector still sees the real extension.
 */
function detectOnBlobs(files, projectDir) {
  if (!fs.existsSync(DETECTOR)) return [];
  let tmp;
  try { tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'se-ui-gate-')); } catch { return []; }
  const written = [];
  try {
    files.forEach((f, i) => {
      const dir = path.join(tmp, String(i));
      fs.mkdirSync(dir, { recursive: true });
      const target = path.join(dir, path.basename(f.rel));
      fs.writeFileSync(target, f.content);
      written.push({ target, rel: f.rel });
    });
    if (!written.length) return [];

    // cwd = projectDir : le détecteur y résout une éventuelle config .impeccable/ du projet.
    const result = spawnSync(process.execPath, [DETECTOR, '--json', '--no-advisory', ...written.map((w) => w.target)], {
      encoding: 'utf8', timeout: DETECTOR_TIMEOUT_MS, cwd: projectDir, maxBuffer: 10 * 1024 * 1024,
    });
    if (!result.stdout) return [];
    const findings = JSON.parse(result.stdout);
    if (!Array.isArray(findings)) return [];

    // Re-mapper les chemins temporaires vers les chemins du repo, sinon le message parle
    // de fichiers que l'humain ne trouvera jamais.
    return findings.map((f) => {
      const match = written.find((w) => w.target === f.file || path.resolve(w.target) === path.resolve(f.file || ''));
      return { rel: match ? match.rel : path.basename(f.file || '?'), name: f.name, antipattern: f.antipattern, line: f.line, snippet: f.snippet };
    });
  } catch {
    return []; // un détecteur qui plante ne bloque pas : on ne refuse pas sur ce qu'on n'a pas su mesurer
  } finally {
    try { fs.rmSync(tmp, { recursive: true, force: true }); } catch { /* temp dir */ }
  }
}

let input = '';
const stdinTimeout = setTimeout(() => process.exit(0), 3000);
process.stdin.setEncoding('utf8');
process.stdin.on('data', (c) => (input += c));
process.stdin.on('end', () => {
  clearTimeout(stdinTimeout);
  try {
    const data = JSON.parse(input);

    const projectDir = process.env.CLAUDE_PROJECT_DIR || data.cwd || process.cwd();
    if (!isSeProject(projectDir)) process.exit(0);
    if (data.tool_name !== 'Bash') process.exit(0);

    const cmd = data.tool_input?.command || '';
    if (!/\bgit\s+commit\b/.test(cmd)) process.exit(0);
    if (!seFlag(projectDir, 'ui_commit_gate', true)) process.exit(0);

    // `git commit -a` stage les fichiers suivis au moment du commit : sans ça, la gate
    // se contourne en ne stageant rien (même raisonnement que se-slop-gate).
    const stagesAll = /\bgit\s+commit\b[^|;&]*?\s(--all\b|-[a-zA-Z]*a)/.test(cmd);

    const listFiles = (args) => execSync(`git diff ${args}--name-only`, {
      cwd: projectDir, encoding: 'utf8', timeout: GIT_TIMEOUT_MS, stdio: ['ignore', 'pipe', 'ignore'],
    }).split('\n').map((s) => s.trim()).filter(Boolean);

    let candidates = [];
    try {
      candidates = listFiles('--cached ');
      if (stagesAll) candidates = candidates.concat(listFiles(''));
    } catch { process.exit(0); } // pas un repo git → ne bloque pas

    const front = [...new Set(candidates)].filter(isFrontCodeFile);
    if (!front.length) process.exit(0);

    const readCommitted = (rel) => {
      if (stagesAll) return fs.readFileSync(path.join(projectDir, rel), 'utf8');
      try {
        return execSync(`git show ":${rel}"`, {
          cwd: projectDir, encoding: 'utf8', timeout: GIT_TIMEOUT_MS, maxBuffer: 10 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'],
        });
      } catch {
        return fs.readFileSync(path.join(projectDir, rel), 'utf8'); // fichier hors index (cas -a)
      }
    };

    const files = [];
    for (const rel of front) {
      if (rel.includes('"')) continue; // pathologique, pas de quoting sûr cross-platform
      try { files.push({ rel, content: readCommitted(rel) }); } catch { /* fichier supprimé */ }
    }
    if (!files.length) process.exit(0);

    const ledger = readLedger(projectDir);
    const unpassed = files
      .map((f) => ({ rel: f.rel, status: entryStatus(ledger.entries[f.rel], contentHash(f.content)) }))
      .filter((x) => x.status !== 'ok');

    const findings = detectOnBlobs(files, projectDir);

    if (!unpassed.length && !findings.length) process.exit(0);

    const blocks = [];
    if (findings.length) {
      blocks.push(
        `Anti-patterns mesures (detecteur impeccable) :\n` +
        findings.slice(0, MAX_LISTED).map((f) => `  • ${f.rel}${f.line ? `:${f.line}` : ''} — ${f.name}${f.snippet ? ` (${f.snippet})` : ''}`).join('\n')
      );
    }
    if (unpassed.length) {
      blocks.push(
        `Fichiers front sans passe /se-ui valide :\n` +
        unpassed.slice(0, MAX_LISTED).map((x) => `  • ${x.rel} — ${STATUS_LABEL[x.status]}`).join('\n')
      );
    }

    deny(
      `ui-gate: ${findings.length + unpassed.length} point(s) bloquant(s) avant commit.\n\n` +
      blocks.join('\n\n') + '\n\n' +
      'A FAIRE, dans cet ordre :\n' +
      '  1. /se-ui polish <fichiers> — cycle craft -> CRITIQUE -> polish, corriger les anti-patterns.\n' +
      '  2. Checkpoint humain : lancer le serveur, DONNER L\'URL EXACTE de la page a l\'humain,\n' +
      '     presenter ce que la mesure ne dit pas, attendre son GO. Ne jamais lui demander de lancer une commande.\n' +
      '  3. Enregistrer la passe :\n' +
      '     node "$HOME/.claude/se/scripts/ui-pass.cjs" record <fichiers> --url <url> --go "<reponse humaine>"\n' +
      '  4. Recommiter (inclure .planning/design/ui-passes.json dans le commit).\n\n' +
      'Echappatoire assumee : `workflow.ui_commit_gate: false` dans .planning/config.json.'
    );
  } catch {
    process.exit(0); // silent fail — ne JAMAIS bloquer un commit par accident
  }
});
