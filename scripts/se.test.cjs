#!/usr/bin/env node
// se.test.cjs — tests du CLI se.cjs.
// Tout passe par un SE_HOME temporaire : le vrai ~/.claude n'est JAMAIS touché.
// Run: node scripts/se.test.cjs

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const REPO = path.resolve(__dirname, '..');
const SE_CLI = path.join(REPO, 'se.cjs');
const { mergeHookSettings, changelogBetween } = require(SE_CLI);

const REPO_VERSION = fs.readFileSync(path.join(REPO, 'VERSION'), 'utf8').trim();
const REPO_WIRING = JSON.parse(fs.readFileSync(path.join(REPO, '.claude', 'settings.json'), 'utf8')).hooks;

let pass = 0;
let fail = 0;
function check(name, ok) {
  if (ok) { pass++; console.log(`  PASS  ${name}`); }
  else { fail++; console.log(`  FAIL  ${name}`); }
}

function tmpDir(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function runCli(seHome, args) {
  return spawnSync(process.execPath, [SE_CLI, ...args], {
    encoding: 'utf8',
    cwd: REPO,
    env: { ...process.env, SE_HOME: seHome },
  });
}

// ---------------------------------------------------------------------------
console.log('\n== mergeHookSettings ==');
// ---------------------------------------------------------------------------

const FAKE_ROOT = 'C:\\fake\\se';
const FAKE_ROOT_POSIX = 'C:/fake/se';

let merged = mergeHookSettings({}, REPO_WIRING, FAKE_ROOT);
check('settings vide : les événements du câblage sont injectés',
  Array.isArray(merged.hooks.PreToolUse) && Array.isArray(merged.hooks.PostToolUse));
const allCommands = (m) => Object.values(m.hooks).flat().flatMap((g) => g.hooks.map((h) => h.command));
check('les commandes pointent en absolu (forward-slash) vers le repo',
  allCommands(merged).every((c) => c.includes(`${FAKE_ROOT_POSIX}/hooks/se-`)));
check('plus aucun ${CLAUDE_PROJECT_DIR} après réécriture',
  allCommands(merged).every((c) => !c.includes('${CLAUDE_PROJECT_DIR}')));

const userSettings = {
  permissions: { allow: ['Bash(npm run *)'] },
  hooks: {
    PreToolUse: [
      { matcher: 'Bash', hooks: [{ type: 'command', command: 'node C:/perso/mon-hook.cjs' }] },
    ],
    SessionStart: [
      { matcher: '*', hooks: [{ type: 'command', command: 'echo bonjour' }] },
    ],
  },
};
merged = mergeHookSettings(userSettings, REPO_WIRING, FAKE_ROOT);
check('le hook perso Bash est préservé',
  merged.hooks.PreToolUse.some((g) => g.hooks.some((h) => h.command === 'node C:/perso/mon-hook.cjs')));
check('l\'événement perso SessionStart est préservé',
  JSON.stringify(merged.hooks.SessionStart) === JSON.stringify(userSettings.hooks.SessionStart));
check('les autres clés du settings sont conservées (permissions)',
  JSON.stringify(merged.permissions) === JSON.stringify(userSettings.permissions));
check('l\'objet d\'entrée n\'est pas muté (fonction pure)',
  userSettings.hooks.PreToolUse[0].hooks.length === 1);

const remerged = mergeHookSettings(merged, REPO_WIRING, FAKE_ROOT);
check('relance : pas de doublons (résultat identique)',
  JSON.stringify(remerged) === JSON.stringify(merged));

const staleSettings = {
  hooks: {
    PreToolUse: [
      { matcher: 'Bash', hooks: [{ type: 'command', command: 'node "C:/vieux/clone/hooks/se-slop-gate.cjs"' }] },
    ],
  },
};
merged = mergeHookSettings(staleSettings, REPO_WIRING, FAKE_ROOT);
const slopEntries = allCommands(merged).filter((c) => c.includes('se-slop-gate.cjs'));
check('entrée SE obsolète remplacée (une seule entrée slop-gate)', slopEntries.length === 1);
check('l\'entrée restante pointe vers le nouveau repo', slopEntries[0].includes(FAKE_ROOT_POSIX));

// ---------------------------------------------------------------------------
console.log('\n== changelogBetween ==');
// ---------------------------------------------------------------------------

const FAKE_CHANGELOG = [
  '# Changelog', '',
  '## [1.2.0] - 2026-09-01', '### Ajouté', '- truc récent', '',
  '## [1.1.0] - 2026-08-15', '### Corrigé', '- bug corrigé', '',
  '## [1.0.0] - 2026-08-03', '### Ajouté', '- version initiale', '',
].join('\n');

let section = changelogBetween(FAKE_CHANGELOG, '1.0.0', '1.2.0');
check('inclut les versions strictement après from', section.includes('[1.1.0]') && section.includes('[1.2.0]'));
check('exclut la version de départ', !section.includes('[1.0.0]'));
check('le corps des sections est présent', section.includes('bug corrigé') && section.includes('truc récent'));
check('from == to : rien à afficher', changelogBetween(FAKE_CHANGELOG, '1.2.0', '1.2.0') === '');
check('from null : tout jusqu\'à to', changelogBetween(FAKE_CHANGELOG, null, '1.1.0').includes('[1.0.0]'));

// ---------------------------------------------------------------------------
console.log('\n== se init ==');
// ---------------------------------------------------------------------------

const initHome = tmpDir('se-test-home-');
const proj = path.join(tmpDir('se-test-proj-'), 'mon-projet');

let cli = runCli(initHome, ['init', proj]);
check('init : sortie 0', cli.status === 0);
check('init : CLAUDE.md copié', fs.existsSync(path.join(proj, 'CLAUDE.md')));
check('init : dotfile .gitignore copié', fs.existsSync(path.join(proj, '.gitignore')));
check('init : .planning/config.json copié', fs.existsSync(path.join(proj, '.planning', 'config.json')));
const projConfig = JSON.parse(fs.readFileSync(path.join(proj, '.planning', 'config.json'), 'utf8'));
check('init : seVersion estampillé', projConfig.seVersion === REPO_VERSION);
check('init : la config scaffold est conservée (workflow présent)', typeof projConfig.workflow === 'object');

cli = runCli(initHome, ['init', proj]);
check('init : refuse si .planning existe déjà', cli.status !== 0);
check('init : le refus mentionne /se-migrate', /se-migrate/.test(cli.stderr + cli.stdout));

const proj2 = path.join(tmpDir('se-test-proj2-'), 'existant');
fs.mkdirSync(proj2, { recursive: true });
const CUSTOM_CLAUDE_MD = '# Mon CLAUDE.md à moi\n';
fs.writeFileSync(path.join(proj2, 'CLAUDE.md'), CUSTOM_CLAUDE_MD);
cli = runCli(initHome, ['init', proj2]);
check('init : fichier existant jamais écrasé', fs.readFileSync(path.join(proj2, 'CLAUDE.md'), 'utf8') === CUSTOM_CLAUDE_MD);
check('init : le fichier conservé est signalé', /CLAUDE\.md/.test(cli.stdout) && /conservé|existe déjà/.test(cli.stdout));
check('init : le reste du scaffold est quand même copié', fs.existsSync(path.join(proj2, '.planning', 'config.json')));

// ---------------------------------------------------------------------------
console.log('\n== se install (SE_HOME temporaire) ==');
// ---------------------------------------------------------------------------

const home = tmpDir('se-test-install-');
const homeClaude = path.join(home, '.claude');
fs.mkdirSync(path.join(homeClaude, 'commands'), { recursive: true });
// Pre-existing user skill and settings, both sacred.
const USER_SKILL = path.join(homeClaude, 'commands', 'mon-skill-perso.md');
fs.writeFileSync(USER_SKILL, '# skill perso\n');
const settingsPath = path.join(homeClaude, 'settings.json');
fs.writeFileSync(settingsPath, JSON.stringify({
  hooks: { PreToolUse: [{ matcher: 'Bash', hooks: [{ type: 'command', command: 'node C:/perso/mon-hook.cjs' }] }] },
}, null, 2));

cli = runCli(home, ['install']);
check('install : sortie 0', cli.status === 0);
check('install : skills copiés (se-pilot.md présent)', fs.existsSync(path.join(homeClaude, 'commands', 'se-pilot.md')));
check('install : skill perso préservé', fs.existsSync(USER_SKILL));
check('install : agents copiés', fs.readdirSync(path.join(homeClaude, 'agents')).length > 0);
check('install : GSD absent signalé sans échec', /GSD non installé/.test(cli.stdout));

const installedSettings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
const installedCommands = Object.values(installedSettings.hooks).flat().flatMap((g) => g.hooks.map((h) => h.command));
check('install : câblage SE injecté dans settings.json', installedCommands.some((c) => c.includes('/hooks/se-size-gate.cjs')));
check('install : hook perso préservé dans settings.json', installedCommands.includes('node C:/perso/mon-hook.cjs'));
check('install : commandes en chemin absolu vers le repo', installedCommands.some((c) => c.includes(REPO.replace(/\\/g, '/'))));

const backups = () => fs.readdirSync(homeClaude).filter((f) => f.startsWith('settings.json.backup-'));
check('install : backup du settings.json créé', backups().length === 1);

const state = JSON.parse(fs.readFileSync(path.join(homeClaude, 'se-state.json'), 'utf8'));
check('install : se-state.json écrit avec la version', state.version === REPO_VERSION);
check('install : lastMigration initialisé', typeof state.lastMigration === 'number');

const settingsBefore = fs.readFileSync(settingsPath, 'utf8');
cli = runCli(home, ['install']);
check('install : relance idempotente (sortie 0)', cli.status === 0);
check('install : pas de second backup si rien ne change', backups().length === 1);
check('install : settings.json inchangé à la relance', fs.readFileSync(settingsPath, 'utf8') === settingsBefore);

// ---------------------------------------------------------------------------
console.log('\n== se doctor --repo ==');
// ---------------------------------------------------------------------------

const doctorHome = tmpDir('se-test-doctor-');
cli = runCli(doctorHome, ['doctor', '--repo']);
if (cli.status !== 0) console.log(cli.stdout, cli.stderr);
check('doctor --repo : sortie 0 sur le repo actuel', cli.status === 0);
check('doctor --repo : sortie lisible avec ✓', /✓/.test(cli.stdout));

// ---------------------------------------------------------------------------

for (const dir of [initHome, path.dirname(proj), path.dirname(proj2), home, doctorHome]) {
  fs.rmSync(dir, { recursive: true, force: true });
}

console.log(`\n${pass} PASS, ${fail} FAIL\n`);
process.exit(fail > 0 ? 1 : 0);
