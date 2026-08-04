#!/usr/bin/env node
// se-gates.test.cjs — tests d'intégration des 3 gates BLOQUANTES (size/slop/secret).
// Chaque gate est spawnée comme le fait Claude Code (JSON sur stdin) dans un repo git jetable.
// Complète se-guard.test.cjs (qui ne couvre que les détecteurs advisory de guard-lib).
// Run: node hooks/se-gates.test.cjs

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync, execSync } = require('child_process');

let pass = 0;
let fail = 0;
function check(name, ok) {
  if (ok) { pass++; console.log(`  PASS  ${name}`); }
  else { fail++; console.log(`  FAIL  ${name}`); }
}

// CLAUDE_PROJECT_DIR est neutralisé : quand la suite tourne DANS le repo SE via
// Claude Code, cette variable pointerait vers le repo SE (qui a un .planning/) et
// court-circuiterait la résolution data.cwd/process.cwd() des fixtures.
function runHookRaw(hookFile, input, cwd) {
  return spawnSync(process.execPath, [path.join(__dirname, hookFile)], {
    input: JSON.stringify(input), encoding: 'utf8', cwd, timeout: 15000,
    env: { ...process.env, CLAUDE_PROJECT_DIR: '' },
  });
}
function runHook(hookFile, input, cwd) {
  const r = runHookRaw(hookFile, input, cwd);
  try { return JSON.parse(r.stdout).hookSpecificOutput || null; } catch { return null; }
}
const denies = (out) => !!out && out.permissionDecision === 'deny';
const bash = (command) => ({ tool_name: 'Bash', tool_input: { command } });

// --- repo git jetable ---
const repo = fs.mkdtempSync(path.join(os.tmpdir(), 'se-gates-'));
const git = (args) => execSync(`git ${args}`, { cwd: repo, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
git('init -q');
git('config user.email test@test.local');
git('config user.name test');
git('config commit.gpgsign false');
// Les hooks ne s'activent que dans un projet SE : la fixture doit en être un.
fs.mkdirSync(path.join(repo, '.planning'));

function write(rel, content) {
  const p = path.join(repo, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content);
}

// Secrets de fixture construits dynamiquement pour que CE fichier ne déclenche
// jamais lui-même le secret-gate au commit.
const FAKE_SECRET = 'sk-' + 'a1b2c3'.repeat(4); // matche le pattern openai-anthropic-key
const PLACEHOLDER_SECRET = 'sk-' + 'x'.repeat(24); // token allowlisté (xxx+)

// ---------- se-secret-gate ----------
console.log('se-secret-gate:');

write('a.ts', `const key = "${FAKE_SECRET}";\n`);
git('add a.ts');
check('secret stagé → deny au commit', denies(runHook('se-secret-gate.cjs', bash('git commit -m "x"'), repo)));
check('commande non-commit → laisse passer', !denies(runHook('se-secret-gate.cjs', bash('git status'), repo)));
git('reset -q');
fs.rmSync(path.join(repo, 'a.ts'));

// SEC-2 (régression) : un placeholder ailleurs sur la ligne ne masque pas le secret
write('b.ts', `const key = "${FAKE_SECRET}"; // example placeholder\n`);
git('add b.ts');
check('secret + placeholder sur la même ligne → deny quand même', denies(runHook('se-secret-gate.cjs', bash('git commit -m "x"'), repo)));
git('reset -q');
fs.rmSync(path.join(repo, 'b.ts'));

// SEC-1 (régression) : git commit -a stage les fichiers suivis au moment du commit
write('c.ts', 'export const ok = true;\n');
git('add c.ts');
git('commit -q -m "base"');
write('c.ts', `export const key = "${FAKE_SECRET}";\n`); // modif suivie, NON stagée
check('secret non stagé + commit normal → laisse passer', !denies(runHook('se-secret-gate.cjs', bash('git commit -m "x"'), repo)));
check('secret non stagé + commit -am → deny', denies(runHook('se-secret-gate.cjs', bash('git commit -am "x"'), repo)));
check('secret non stagé + commit --all → deny', denies(runHook('se-secret-gate.cjs', bash('git commit --all -m "x"'), repo)));
git('checkout -q -- c.ts');

write('d.ts', `const key = "${PLACEHOLDER_SECRET}";\n`);
git('add d.ts');
check('token placeholder (xxx…) stagé → laisse passer', !denies(runHook('se-secret-gate.cjs', bash('git commit -m "x"'), repo)));
git('reset -q');
fs.rmSync(path.join(repo, 'd.ts'));

// ---------- se-slop-gate ----------
console.log('se-slop-gate:');

const SLOP = 'Une offre incontournable qui marque un tournant pour le secteur.\n'; // 2 familles: promo + ai-vocab
const CLEAN = 'Notre offre couvre trois cas simples, décrits ci-dessous.\n';

write('content/hero.md', SLOP);
git('add content/hero.md');
check('slop stagé dans fichier user-facing → deny au commit', denies(runHook('se-slop-gate.cjs', bash('git commit -m "x"'), repo)));

// SLOP-1 (régression) : la gate juge la version INDEX, pas le working tree
write('content/hero.md', CLEAN);
git('add content/hero.md');
write('content/hero.md', SLOP); // re-sali sur disque, NON stagé
check('index propre + disque sali + commit normal → laisse passer', !denies(runHook('se-slop-gate.cjs', bash('git commit -m "x"'), repo)));
check('index propre + disque sali + commit -am → deny', denies(runHook('se-slop-gate.cjs', bash('git commit -am "x"'), repo)));
git('reset -q');
fs.rmSync(path.join(repo, 'content'), { recursive: true, force: true });

check('fichier non user-facing slopé → laisse passer', (() => {
  write('src/service.ts', `// ${SLOP}`);
  git('add src/service.ts');
  const ok = !denies(runHook('se-slop-gate.cjs', bash('git commit -m "x"'), repo));
  git('reset -q');
  return ok;
})());

// ---------- se-size-gate ----------
console.log('se-size-gate:');

// Plafond lu depuis le source du gate (source unique) : le test suit le seuil réel,
// il ne le re-hardcode pas.
const gateSrc = fs.readFileSync(path.join(__dirname, 'se-size-gate.cjs'), 'utf8');
const CAP = Number((gateSrc.match(/STATE\\\.md\$\/i,\s*limit:\s*(\d+)/) || [])[1]);
if (!CAP) { console.error('  FAIL  impossible de lire le plafond STATE.md dans se-size-gate.cjs'); process.exit(1); }

const statePath = path.join(repo, 'STATE.md');
const lines = (n) => Array.from({ length: n }, (_, i) => `ligne ${i + 1}`).join('\n') + '\n';

check(`Write STATE.md ${CAP + 1} lignes → deny`, denies(runHook('se-size-gate.cjs', {
  tool_name: 'Write', tool_input: { file_path: statePath, content: lines(CAP + 1) },
}, repo)));
check(`Write STATE.md ${CAP - 50} lignes → laisse passer`, !denies(runHook('se-size-gate.cjs', {
  tool_name: 'Write', tool_input: { file_path: statePath, content: lines(CAP - 50) },
}, repo)));
check(`\\n final non compté comme ligne (${CAP} pile → pas de deny)`, !denies(runHook('se-size-gate.cjs', {
  tool_name: 'Write', tool_input: { file_path: statePath, content: lines(CAP) },
}, repo)));

// SIZE-1 (régression) : un Edit qui fait déborder le fichier existant est bien mesuré
write('STATE.md', lines(CAP - 1));
check(`Edit qui pousse STATE.md au-delà du plafond (${CAP}) → deny`, denies(runHook('se-size-gate.cjs', {
  tool_name: 'Edit',
  tool_input: { file_path: statePath, old_string: `ligne ${CAP - 1}`, new_string: `ligne ${CAP - 1}\na\nb\nc\nd` },
}, repo)));
check('Edit neutre sur STATE.md sous plafond → laisse passer', !denies(runHook('se-size-gate.cjs', {
  tool_name: 'Edit',
  tool_input: { file_path: statePath, old_string: `ligne ${CAP - 1}`, new_string: 'ligne renommée' },
}, repo)));
check('fichier non plafonné → laisse passer', !denies(runHook('se-size-gate.cjs', {
  tool_name: 'Write', tool_input: { file_path: path.join(repo, 'NOTES.md'), content: lines(CAP + 200) },
}, repo)));

// ---------- hors projet SE (pas de .planning/) : les 4 hooks se taisent ----------
console.log('hors projet SE:');

// repo git jetable SANS .planning/ — les hooks câblés globalement doivent l'ignorer
const alien = fs.mkdtempSync(path.join(os.tmpdir(), 'se-alien-'));
const agit = (args) => execSync(`git ${args}`, { cwd: alien, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
agit('init -q');
agit('config user.email test@test.local');
agit('config user.name test');
agit('config commit.gpgsign false');
fs.writeFileSync(path.join(alien, 'a.ts'), `const key = "${FAKE_SECRET}";\n`);
fs.mkdirSync(path.join(alien, 'content'));
fs.writeFileSync(path.join(alien, 'content', 'hero.md'), SLOP);
agit('add .');

check('secret-gate: repo sans .planning → laisse passer malgré un secret stagé',
  !denies(runHook('se-secret-gate.cjs', bash('git commit -m "x"'), alien)));
check('slop-gate: repo sans .planning → laisse passer malgré du slop stagé',
  !denies(runHook('se-slop-gate.cjs', bash('git commit -m "x"'), alien)));
check('size-gate: repo sans .planning → laisse passer un STATE.md hors plafond',
  !denies(runHook('se-size-gate.cjs', {
    tool_name: 'Write', tool_input: { file_path: path.join(alien, 'STATE.md'), content: lines(CAP + 100) },
  }, alien)));

// se-guard (advisory) : silence total hors projet SE, actif dans la fixture SE
const guardInput = (dir) => ({
  tool_name: 'Write',
  tool_input: { file_path: path.join(dir, 'src', 'x.ts'), content: 'export function f() { console.log("d"); return 1; }\n' },
});
const guardOut = runHookRaw('se-guard.cjs', guardInput(alien), alien);
check('se-guard: repo sans .planning → aucune sortie, exit 0',
  guardOut.status === 0 && guardOut.stdout === '');
const guardOutSe = runHookRaw('se-guard.cjs', guardInput(repo), repo);
check('se-guard: projet SE → findings toujours émis',
  guardOutSe.status === 0 && /hygiene-guard/.test(guardOutSe.stdout));

// la résolution du projet passe aussi par data.cwd quand le JSON le porte
check('secret-gate: data.cwd sans .planning → laisse passer',
  !denies(runHook('se-secret-gate.cjs', { ...bash('git commit -m "x"'), cwd: alien }, alien)));

fs.rmSync(alien, { recursive: true, force: true });

// --- cleanup + verdict ---
fs.rmSync(repo, { recursive: true, force: true });
console.log(`\n${pass} pass / ${fail} fail`);
process.exit(fail ? 1 : 0);
