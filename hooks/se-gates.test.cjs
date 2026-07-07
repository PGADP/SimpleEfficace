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

function runHook(hookFile, input, cwd) {
  const r = spawnSync(process.execPath, [path.join(__dirname, hookFile)], {
    input: JSON.stringify(input), encoding: 'utf8', cwd, timeout: 15000,
  });
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

const statePath = path.join(repo, 'STATE.md');
const lines = (n) => Array.from({ length: n }, (_, i) => `ligne ${i + 1}`).join('\n') + '\n';

check('Write STATE.md 151 lignes → deny', denies(runHook('se-size-gate.cjs', {
  tool_name: 'Write', tool_input: { file_path: statePath, content: lines(151) },
}, repo)));
check('Write STATE.md 100 lignes → laisse passer', !denies(runHook('se-size-gate.cjs', {
  tool_name: 'Write', tool_input: { file_path: statePath, content: lines(100) },
}, repo)));
check('\\n final non compté comme ligne (150 pile → pas de deny)', !denies(runHook('se-size-gate.cjs', {
  tool_name: 'Write', tool_input: { file_path: statePath, content: lines(150) },
}, repo)));

// SIZE-1 (régression) : un Edit qui fait déborder le fichier existant est bien mesuré
write('STATE.md', lines(149));
check('Edit qui pousse STATE.md à 153 lignes → deny', denies(runHook('se-size-gate.cjs', {
  tool_name: 'Edit',
  tool_input: { file_path: statePath, old_string: 'ligne 149', new_string: 'ligne 149\na\nb\nc\nd' },
}, repo)));
check('Edit neutre sur STATE.md sous plafond → laisse passer', !denies(runHook('se-size-gate.cjs', {
  tool_name: 'Edit',
  tool_input: { file_path: statePath, old_string: 'ligne 149', new_string: 'ligne cent-quarante-neuf' },
}, repo)));
check('fichier non plafonné → laisse passer', !denies(runHook('se-size-gate.cjs', {
  tool_name: 'Write', tool_input: { file_path: path.join(repo, 'NOTES.md'), content: lines(500) },
}, repo)));

// --- cleanup + verdict ---
fs.rmSync(repo, { recursive: true, force: true });
console.log(`\n${pass} pass / ${fail} fail`);
process.exit(fail ? 1 : 0);
