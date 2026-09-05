#!/usr/bin/env node
// se-gates.test.cjs — tests d'intégration des gates BLOQUANTES (size/slop/secret/ui).
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
const CAP = Number((gateSrc.match(/STATE\\\.md\$\/i,\s*lines:\s*(\d+)/) || [])[1]);
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

// SIZE-2 : le plafond de lignes se contourne avec des lignes longues. Les plafonds
// caractères et largeur ferment la porte. Seuils lus depuis le source du gate.
const CHARS = Number((gateSrc.match(/STATE[^\n]*chars:\s*(\d+)/) || [])[1]);
const WIDTH = Number((gateSrc.match(/STATE[^\n]*width:\s*(\d+)/) || [])[1]);
if (!CHARS || !WIDTH) { console.error('  FAIL  plafonds chars/lineWidth illisibles dans se-size-gate.cjs'); process.exit(1); }

// Chaque ligne reste sous la largeur max et le total sous le plafond de lignes,
// mais le poids en caractères déborde : c'est exactement le contournement visé.
const wide = (n, w) => Array.from({ length: n }, () => 'x'.repeat(w)).join('\n') + '\n';
const underWidth = WIDTH - 1;
const linesToBust = Math.ceil(CHARS / underWidth) + 1;
check(`${linesToBust} lignes de ${underWidth} caractères (sous le plafond de lignes) → deny sur les caractères`,
  linesToBust <= CAP && denies(runHook('se-size-gate.cjs', {
    tool_name: 'Write', tool_input: { file_path: statePath, content: wide(linesToBust, underWidth) },
  }, repo)));

check(`une seule ligne de ${WIDTH + 1} caractères → deny sur la largeur`, denies(runHook('se-size-gate.cjs', {
  tool_name: 'Write', tool_input: { file_path: statePath, content: `# titre\n${'x'.repeat(WIDTH + 1)}\n` },
}, repo)));

check(`une ligne de ${WIDTH} caractères pile → laisse passer`, !denies(runHook('se-size-gate.cjs', {
  tool_name: 'Write', tool_input: { file_path: statePath, content: `# titre\n${'x'.repeat(WIDTH)}\n` },
}, repo)));

check('STATE.md court et étroit → laisse passer', !denies(runHook('se-size-gate.cjs', {
  tool_name: 'Write', tool_input: { file_path: statePath, content: lines(20) },
}, repo)));

// SIZE-3 : les tableaux markdown alignés dépassent couramment la largeur max (mesuré
// jusqu'à 556 caractères sur un ROADMAP.md réel). Leur largeur est mécanique, pas
// rédactionnelle : elle est exemptée, sinon le gate interdirait les tableaux.
const tableRow = `| ${'colonne'.padEnd(WIDTH, ' ')} | x |`;
check(`ligne de tableau de ${tableRow.length} caractères → laisse passer`, !denies(runHook('se-size-gate.cjs', {
  tool_name: 'Write', tool_input: { file_path: statePath, content: `# titre\n${tableRow}\n` },
}, repo)));

// SIZE-4 : sens de variation. Un fichier déjà hors plafond (projet antérieur à la règle)
// reste modifiable tant que l'écriture ne l'aggrave pas — sinon le gate refuserait
// l'étape de /se-archive qui vient l'assainir.
write('STATE.md', lines(CAP + 50));
check('fichier déjà hors plafond, écriture qui réduit → laisse passer', !denies(runHook('se-size-gate.cjs', {
  tool_name: 'Write', tool_input: { file_path: statePath, content: lines(CAP + 10) },
}, repo)));
check('fichier déjà hors plafond, écriture à taille égale → laisse passer', !denies(runHook('se-size-gate.cjs', {
  tool_name: 'Write', tool_input: { file_path: statePath, content: lines(CAP + 50) },
}, repo)));
check('fichier déjà hors plafond, écriture qui aggrave → deny', denies(runHook('se-size-gate.cjs', {
  tool_name: 'Write', tool_input: { file_path: statePath, content: lines(CAP + 51) },
}, repo)));

// SIZE-5 : un fichier CRLF ne doit pas être plafonné plus sévèrement que le même
// fichier en LF (tous les .planning/ de la machine sont en CRLF).
fs.rmSync(statePath, { force: true });
const justUnder = lines(CAP - 1);
check('même contenu en CRLF et en LF → même verdict', (() => {
  const lf = denies(runHook('se-size-gate.cjs', {
    tool_name: 'Write', tool_input: { file_path: statePath, content: justUnder },
  }, repo));
  const crlf = denies(runHook('se-size-gate.cjs', {
    tool_name: 'Write', tool_input: { file_path: statePath, content: justUnder.replace(/\n/g, '\r\n') },
  }, repo));
  return lf === crlf && !lf;
})());

// ---------- se-ui-contract-gate ----------
console.log('se-ui-contract-gate:');

const editFront = (rel) => ({
  tool_name: 'Write',
  tool_input: { file_path: path.join(repo, rel), content: 'export function Card() { return <div>ok</div>; }\n' },
});
const DS_PATH = '.planning/design/DESIGN-SYSTEM.md';
const DS_SKELETON = '# DESIGN-SYSTEM\nStatut : SQUELETTE\n\n## 0.1 Plateforme cible\nà remplir\n\n## 0.2 Direction esthétique\nà remplir\n\n## 1. Tokens\n';
const DS_FILLED = '# DESIGN-SYSTEM\nStatut : REMPLI\n\n## 0.1 Plateforme cible\nweb, seniors 65+\n\n## 0.2 Direction esthétique\nBrutalisme éditorial, palette encre + craie\n\n## 0.3 Molettes\nvariance 6\n\n## 1. Tokens\n\n## 2.1 Hiérarchie visuelle\nratio titre/corps 1.8, une action primaire par écran\n\n## 3. Espacement\ngrille 4px\n';

// Pas de contrat du tout → deny
check('front sans DESIGN-SYSTEM.md → deny',
  denies(runHook('se-ui-contract-gate.cjs', editFront('src/components/Card.tsx'), repo)));

// Contrat squelette → deny
write(DS_PATH, DS_SKELETON);
check('front avec contrat SQUELETTE → deny',
  denies(runHook('se-ui-contract-gate.cjs', editFront('src/components/Card.tsx'), repo)));

// Fichier non-front → silence même sans contrat valide
check('fichier backend avec contrat SQUELETTE → laisse passer',
  !denies(runHook('se-ui-contract-gate.cjs', {
    tool_name: 'Write', tool_input: { file_path: path.join(repo, 'src/service.ts'), content: 'export const x = 1;\n' },
  }, repo)));

// §0 complet mais §2.1 absente : c'est l'état de tout contrat écrit avant la règle, et
// celui qui a laissé trois écrans sortir avec trois hiérarchies différentes.
write(DS_PATH, DS_FILLED.replace(/## 2\.1[\s\S]*?(?=## 3\.)/, ''));
const sansHierarchie = runHook('se-ui-contract-gate.cjs', editFront('src/components/Card.tsx'), repo);
check('contrat sans §2.1 hiérarchie → deny', denies(sansHierarchie));
check('le deny nomme §2.1', /2\.1/.test(sansHierarchie?.permissionDecisionReason || ''));

// Contrat rempli → pas de deny, et injection du craft-floor à la 1re édition de la session
write(DS_PATH, DS_FILLED);
const firstEdit = runHook('se-ui-contract-gate.cjs', { ...editFront('src/components/Card.tsx'), session_id: 's1' }, repo);
check('contrat rempli → laisse passer', !denies(firstEdit));
check('1re édition front de la session → craft-floor injecté',
  !!firstEdit && /craft floor/i.test(firstEdit.additionalContext || ''));
check('1re édition front → contrat §0 injecté aussi',
  !!firstEdit && /Brutalisme éditorial/.test(firstEdit.additionalContext || ''));
const secondEdit = runHook('se-ui-contract-gate.cjs', { ...editFront('src/components/Card.tsx'), session_id: 's1' }, repo);
check('2e édition même session → rappel court, pas le craft-floor complet',
  !!secondEdit && !/craft floor/i.test(secondEdit.additionalContext || '') && /RITUEL/i.test(secondEdit.additionalContext || ''));

// Flag off → silence total
write('.planning/config.json', JSON.stringify({ workflow: { ui_contract_gate: false } }));
fs.rmSync(path.join(repo, DS_PATH));
check('ui_contract_gate=false → laisse passer sans contrat',
  !denies(runHook('se-ui-contract-gate.cjs', editFront('src/components/Card.tsx'), repo)));
fs.rmSync(path.join(repo, '.planning', 'config.json'));
write(DS_PATH, DS_FILLED);

// ---------- se-ui-gate + ui-pass ----------
console.log('se-ui-gate:');

const UI_PASS = path.join(__dirname, '..', 'scripts', 'ui-pass.cjs');
const runUiPass = (argv) => spawnSync(process.execPath, [UI_PASS, ...argv], { cwd: repo, encoding: 'utf8', timeout: 30000 });
const CLEAN_TSX = 'export function StatRow({ label }: { label: string }) {\n  return <div className="flex gap-2 p-4">{label}</div>;\n}\n';
const SLOPPY_TSX = 'export function Hero() {\n  return <h1 className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">Bienvenue</h1>;\n}\n';

// Fichier front stagé sans passe → deny
write('src/components/StatRow.tsx', CLEAN_TSX);
git('add src/components/StatRow.tsx');
check('front stagé sans passe /se-ui → deny au commit',
  denies(runHook('se-ui-gate.cjs', bash('git commit -m "x"'), repo)));

// ui-pass refuse sans URL ou sans GO
check('ui-pass record sans --url → refus (exit 1)',
  runUiPass(['record', 'src/components/StatRow.tsx', '--go', 'GO']).status === 1);
check('ui-pass record avec --go negatif → refus (exit 1)',
  runUiPass(['record', 'src/components/StatRow.tsx', '--url', 'http://localhost:3000/stats', '--go', 'non pas encore']).status === 1);

// ui-pass refuse d'enregistrer un fichier avec anti-patterns
write('src/components/Hero.tsx', SLOPPY_TSX);
check('ui-pass record sur fichier avec anti-patterns → refus (exit 1)',
  runUiPass(['record', 'src/components/Hero.tsx', '--url', 'http://localhost:3000/', '--go', 'GO']).status === 1);
fs.rmSync(path.join(repo, 'src/components/Hero.tsx'));

// Passe valide enregistrée → le commit passe
check('ui-pass record valide (url + GO) → exit 0',
  runUiPass(['record', 'src/components/StatRow.tsx', '--url', 'http://localhost:3000/stats', '--go', 'GO nickel']).status === 0);
check('front stagé avec passe valide → laisse passer',
  !denies(runHook('se-ui-gate.cjs', bash('git commit -m "x"'), repo)));

// Fichier re-modifié après la passe → hash périmé → deny
write('src/components/StatRow.tsx', CLEAN_TSX + '// changed after pass\n');
git('add src/components/StatRow.tsx');
const staleDeny = runHook('se-ui-gate.cjs', bash('git commit -m "x"'), repo);
check('fichier modifié depuis la passe → deny (hash périmé)', denies(staleDeny));
check('le deny nomme la cause (modifié depuis la passe)',
  !!staleDeny && /modifie depuis la passe/.test(staleDeny.permissionDecisionReason || ''));

// Anti-patterns stagés → deny même avec une passe (le détecteur juge le contenu commité)
git('reset -q');
write('src/components/StatRow.tsx', CLEAN_TSX);
write('src/components/Hero.tsx', SLOPPY_TSX);
git('add src/components/Hero.tsx');
const slopDeny = runHook('se-ui-gate.cjs', bash('git commit -m "x"'), repo);
check('anti-patterns stagés → deny avec le nom de l\'anti-pattern',
  denies(slopDeny) && /Gradient text|gradient/i.test(slopDeny.permissionDecisionReason || ''));
git('reset -q');
fs.rmSync(path.join(repo, 'src/components/Hero.tsx'));

// commande non-commit → silence ; flag off → silence
check('commande non-commit → laisse passer', !denies(runHook('se-ui-gate.cjs', bash('git status'), repo)));
write('src/components/Hero.tsx', SLOPPY_TSX);
git('add src/components/Hero.tsx');
write('.planning/config.json', JSON.stringify({ workflow: { ui_commit_gate: false } }));
check('ui_commit_gate=false → laisse passer malgré anti-patterns stagés',
  !denies(runHook('se-ui-gate.cjs', bash('git commit -m "x"'), repo)));
fs.rmSync(path.join(repo, '.planning', 'config.json'));
git('reset -q');
fs.rmSync(path.join(repo, 'src/components/Hero.tsx'));
fs.rmSync(path.join(repo, 'src'), { recursive: true, force: true });

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
check('ui-gate: repo sans .planning → laisse passer',
  !denies(runHook('se-ui-gate.cjs', bash('git commit -m "x"'), alien)));
check('ui-contract-gate: repo sans .planning → laisse passer un front sans contrat',
  !denies(runHook('se-ui-contract-gate.cjs', {
    tool_name: 'Write', tool_input: { file_path: path.join(alien, 'src/components/X.tsx'), content: 'export const X = () => null;\n' },
  }, alien)));
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

// ---------- se-branch-gate ----------
// Fixture dédiée : contrairement aux autres gates, branch-gate ne s'active QUE si le
// dépôt a un remote `origin` (pas de remote = pas de workflow PR à protéger).
console.log('\nse-branch-gate:');

const brepo = fs.mkdtempSync(path.join(os.tmpdir(), 'se-branch-'));
const bgit = (args) => execSync(`git ${args}`, { cwd: brepo, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
bgit('init -q -b main');
bgit('config user.email test@test.local');
bgit('config user.name test');
bgit('config commit.gpgsign false');
bgit('remote add origin https://example.invalid/x.git');
fs.writeFileSync(path.join(brepo, 'a.txt'), 'x\n');
bgit('add a.txt');
bgit('commit -q -m "init"');

const bgate = (command, extra = {}) => runHook('se-branch-gate.cjs', { ...bash(command), cwd: brepo, ...extra }, brepo);

check('branch-gate: commit sur main → refusé', denies(bgate('git commit -m "x"')));
check('branch-gate: push sur main → refusé', denies(bgate('git push')));
check('branch-gate: merge sur main → refusé', denies(bgate('git merge autre')));
check('branch-gate: commande non-git → laisse passer', !denies(bgate('npm run build')));
check('branch-gate: git status → laisse passer', !denies(bgate('git status --porcelain')));
check('branch-gate: --no-verify ne change rien au refus', denies(bgate('git commit --no-verify -m "x"')));
check('branch-gate: flag global avant le verbe → refus quand même',
  denies(bgate('git -c core.hooksPath=/dev/null commit -m "x"')));

bgit('checkout -q -b feat/sujet');
check('branch-gate: commit sur une branche de feature → laisse passer', !denies(bgate('git commit -m "x"')));
check('branch-gate: push sur une branche de feature → laisse passer', !denies(bgate('git push -u origin HEAD')));

bgit('checkout -q -b production');
check('branch-gate: commit sur production → refusé', denies(bgate('git commit -m "x"')));
check('branch-gate: merge --ff-only sur production → laisse passer (c\'est le geste de release)',
  !denies(bgate('git merge --ff-only main')));
check('branch-gate: merge sans --ff-only sur production → refusé', denies(bgate('git merge main')));
check('branch-gate: push sur production → laisse passer', !denies(bgate('git push')));

// Opération en cours : HEAD est détachée ou instable, comparer un nom de branche n'a
// plus de sens et bloquer casserait le rebase.
bgit('checkout -q main');
fs.mkdirSync(path.join(brepo, '.git', 'rebase-merge'));
check('branch-gate: rebase en cours → laisse passer', !denies(bgate('git commit -m "x"')));
fs.rmSync(path.join(brepo, '.git', 'rebase-merge'), { recursive: true, force: true });

bgit('checkout -q --detach');
check('branch-gate: HEAD détachée → laisse passer', !denies(bgate('git commit -m "x"')));
bgit('checkout -q main');

// Verrou de session : avertit sur stderr, ne refuse jamais.
const SID = 'sess-test-1';
bgit('checkout -q feat/sujet');
bgate('git commit -m "x"', { session_id: SID }); // pose le verrou sur feat/sujet
bgit('checkout -q -b feat/autre');
const moved = runHookRaw('se-branch-gate.cjs',
  { ...bash('git commit -m "x"'), cwd: brepo, session_id: SID }, brepo);
check('branch-gate: changement de branche dans la session → avertit sans refuser',
  moved.status === 0 && /branch-gate:/.test(moved.stderr) && !/"deny"/.test(moved.stdout));

// Opt-out projet
bgit('checkout -q main');
fs.mkdirSync(path.join(brepo, '.planning'), { recursive: true });
fs.writeFileSync(path.join(brepo, '.planning', 'config.json'), JSON.stringify({ workflow: { branch_gate: false } }));
check('branch-gate: workflow.branch_gate=false → laisse passer', !denies(bgate('git commit -m "x"')));
fs.rmSync(path.join(brepo, '.planning'), { recursive: true, force: true });

// Dépôt sans origin : pas de workflow PR à protéger.
const norem = fs.mkdtempSync(path.join(os.tmpdir(), 'se-branch-norem-'));
execSync('git init -q -b main', { cwd: norem, stdio: 'ignore' });
check('branch-gate: dépôt sans remote origin → laisse passer',
  !denies(runHook('se-branch-gate.cjs', { ...bash('git commit -m "x"'), cwd: norem }, norem)));
fs.rmSync(norem, { recursive: true, force: true });
fs.rmSync(brepo, { recursive: true, force: true });

// --- cleanup + verdict ---
fs.rmSync(repo, { recursive: true, force: true });
console.log(`\n${pass} pass / ${fail} fail`);
process.exit(fail ? 1 : 0);
