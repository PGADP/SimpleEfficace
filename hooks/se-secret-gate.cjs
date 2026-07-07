#!/usr/bin/env node
// se-secret-gate — PreToolUse hook (matcher Bash) BLOQUANT au commit.
// Refuse `git commit` si les LIGNES AJOUTÉES du diff stagé contiennent un secret
// (clé API, token, clé privée — cf. hooks/rules/secret-patterns.json, SOURCE UNIQUE,
// la même que le détecteur advisory detectSecurity de guard-lib.cjs).
//
// Hook harness (pas un hook git) : il voit passer la commande AVANT exécution,
// donc un `git commit --no-verify` ne le contourne pas.
//
// Contrat : exit 0 toujours, silent fail, en cas de doute → laisse passer.

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const RULES = path.join(__dirname, 'rules', 'secret-patterns.json');

function loadRules() {
  try { return JSON.parse(fs.readFileSync(RULES, 'utf8')); } catch { return null; }
}

function deny(reason) {
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: reason },
  }));
  process.exit(0);
}

// `git commit -a` / `--all` stages tracked-file changes at commit time, so the
// working-tree diff must be scanned too (it is not in --cached yet).
function stagesAll(cmd) {
  return /\bgit\s+commit\b[^|;&]*?\s(--all\b|-[a-zA-Z]*a)/.test(cmd);
}

// Scans added lines of a diff (`--cached` or working tree), keyed by file. Returns [{file, label}].
function scanDiff(rules, diffArgs) {
  let diff = '';
  try {
    diff = execSync(`git diff ${diffArgs}--unified=0 --no-color`, {
      encoding: 'utf8', timeout: 3000, maxBuffer: 10 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'],
    });
  } catch { return []; } // pas un repo git / diff énorme → ne bloque pas

  const allow = rules.allowPatterns.map((p) => new RegExp(p, 'i'));
  const checks = rules.patterns.map((p) => ({ label: p.label, re: new RegExp(p.regex, 'i') }));
  const excluded = rules.excludeFilePatterns.map((p) => new RegExp(p, 'i'));

  const findings = [];
  let file = '';
  let skipFile = false;
  for (const line of diff.split('\n')) {
    if (line.startsWith('+++ b/')) {
      file = line.slice(6);
      skipFile = excluded.some((re) => re.test(file));
      continue;
    }
    if (skipFile || !line.startsWith('+') || line.startsWith('+++')) continue;
    const added = line.slice(1);
    for (const { label, re } of checks) {
      // allowPatterns are tested against the MATCHED TOKEN only: testing the whole
      // line would let any placeholder-looking word on the line mask a real secret.
      const m = re.exec(added);
      if (m && !allow.some((a) => a.test(m[0]))) { findings.push({ file, label }); break; }
    }
  }
  return findings;
}

let input = '';
const stdinTimeout = setTimeout(() => process.exit(0), 3000);
process.stdin.setEncoding('utf8');
process.stdin.on('data', (c) => (input += c));
process.stdin.on('end', () => {
  clearTimeout(stdinTimeout);
  try {
    const data = JSON.parse(input);
    if (data.tool_name !== 'Bash') process.exit(0);
    const cmd = data.tool_input?.command || '';
    if (!/\bgit\s+commit\b/.test(cmd)) process.exit(0);

    const rules = loadRules();
    if (!rules) process.exit(0);

    let findings = scanDiff(rules, '--cached ');
    if (stagesAll(cmd)) findings = findings.concat(scanDiff(rules, ''));
    if (!findings.length) process.exit(0);

    const seen = new Set();
    const list = findings
      .filter((x) => { const k = `${x.file}|${x.label}`; if (seen.has(k)) return false; seen.add(k); return true; })
      .map((x) => `  • ${x.file} — ${x.label}`)
      .join('\n');
    deny(
      `secret-gate: secret(s) détecté(s) dans le diff stagé :\n${list}\n` +
      `Déplace la valeur dans .env (jamais commité) et lis-la via process.env. ` +
      `Si c'est un faux positif, ajuste hooks/rules/secret-patterns.json (allowPatterns).`
    );
  } catch {
    process.exit(0); // silent fail — ne JAMAIS bloquer un commit par accident
  }
});
