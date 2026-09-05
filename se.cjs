#!/usr/bin/env node
// se — CLI du système Simple & Efficace (installation globale).
//
// Le repo se clone une fois par machine (idéalement dans ~/.claude/se/) puis :
//   node ~/.claude/se/se.cjs install     # installe skills, agents, hooks, patches GSD
//   node ~/.claude/se/se.cjs update      # git pull + réinstall + migrations + changelog
//   node ~/.claude/se/se.cjs init [dir]  # sème un nouveau projet depuis scaffold/
//   node ~/.claude/se/se.cjs sync-project # rattrape un projet existant sur le scaffold courant
//   node ~/.claude/se/se.cjs doctor      # diagnostic d'installation (--repo : checks CI)
//
// Testability rule: the system root is __dirname (wherever the repo lives) and
// everything under "~/.claude" goes through SE_HOME || os.homedir(), so tests
// can point SE_HOME at a temp dir and never touch the real home.

const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');

const REPO_ROOT = __dirname;
const STATE_FILENAME = 'se-state.json';
const SETTINGS_FILENAME = 'settings.json';
const VERSION_FILENAME = 'VERSION';
const CHANGELOG_FILENAME = 'CHANGELOG.md';
const MIGRATIONS_DIRNAME = 'migrations';
const GSD_DIRNAME = 'gsd-core';
const GSD_MANIFEST_FILENAME = 'se-patches-manifest.json';
const EXPECTED_REPO_LOCATION = ['.claude', 'se'];
const JSON_INDENT = 2;
const INITIAL_MIGRATION = 0;
const PROJECT_DIR_TOKEN = '${CLAUDE_PROJECT_DIR}';
// An SE-managed hook entry is recognizable by its command path.
const SE_HOOK_COMMAND_RE = /\/hooks\/se-[\w.-]+\.cjs/;
const SEMVER_RE = /^\d+\.\d+\.\d+$/;
const CHANGELOG_HEADING_RE = /^## \[(\d+\.\d+\.\d+)\]/;
const MIGRATION_FILE_RE = /^(\d+)-[\w-]+\.cjs$/;
// scripts/se.test.cjs n'est PAS dans cette liste : il lance lui-meme `doctor --repo`,
// qui relancerait la suite, en boucle. Le CI l'execute a part (.github/workflows/ci.yml),
// et CLAUDE.md demande de la lancer a la main avant de rendre une modification.
const REPO_TEST_SUITES = [
  path.join('hooks', 'se-guard.test.cjs'),
  path.join('hooks', 'se-gates.test.cjs'),
  path.join('scripts', 'ui-verdict.test.cjs'),
  path.join('scripts', 'se-serve.test.cjs'),
];
const SCAFFOLD_REQUIRED_FILES = ['CLAUDE.md', '.gitignore', path.join('.planning', 'config.json'), path.join('.planning', 'INDEX.md'), path.join('.planning', 'PHASES.md'), path.join('.planning', 'GLOSSARY.md')];

// ---------------------------------------------------------------------------
// Path & IO helpers
// ---------------------------------------------------------------------------

function seHome() {
  return process.env.SE_HOME || os.homedir();
}

function claudeDir() {
  return path.join(seHome(), '.claude');
}

function statePath() {
  return path.join(claudeDir(), STATE_FILENAME);
}

function toPosix(p) {
  return p.replace(/\\/g, '/');
}

function log(msg) {
  process.stdout.write(`${msg}\n`);
}

function fail(msg) {
  console.error(`✗ ${msg}`);
  process.exit(1);
}

function sha256(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

function readJson(file, fallback) {
  if (!fs.existsSync(file)) return fallback;
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(data, null, JSON_INDENT)}\n`, 'utf8');
}

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function readRepoVersion() {
  const file = path.join(REPO_ROOT, VERSION_FILENAME);
  if (!fs.existsSync(file)) fail(`fichier ${VERSION_FILENAME} introuvable dans le repo (${REPO_ROOT})`);
  const version = fs.readFileSync(file, 'utf8').trim();
  if (!SEMVER_RE.test(version)) fail(`${VERSION_FILENAME} invalide : "${version}" (attendu x.y.z)`);
  return version;
}

function readState() {
  return readJson(statePath(), null);
}

/** Lists files under dir, as paths relative to dir (recursive, includes dotfiles). */
function listFilesRecursive(dir, prefix = '') {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = prefix ? path.join(prefix, entry.name) : entry.name;
    if (entry.isDirectory()) out.push(...listFilesRecursive(path.join(dir, entry.name), rel));
    else out.push(rel);
  }
  return out;
}

/** Copies src into dst, overwriting same-name files, never deleting anything. */
function copyTreeOverwrite(src, dst) {
  let copied = 0;
  for (const rel of listFilesRecursive(src)) {
    const to = path.join(dst, rel);
    fs.mkdirSync(path.dirname(to), { recursive: true });
    fs.copyFileSync(path.join(src, rel), to);
    copied++;
  }
  return copied;
}

/** Copies src into dst but never overwrites an existing file. Returns what was skipped. */
function copyTreeNoOverwrite(src, dst) {
  const skipped = [];
  let copied = 0;
  for (const rel of listFilesRecursive(src)) {
    const to = path.join(dst, rel);
    if (fs.existsSync(to)) {
      skipped.push(rel);
      continue;
    }
    fs.mkdirSync(path.dirname(to), { recursive: true });
    fs.copyFileSync(path.join(src, rel), to);
    copied++;
  }
  return { copied, skipped };
}

function backupTimestamp(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}

function compareVersions(a, b) {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < pa.length; i++) {
    if (pa[i] !== pb[i]) return pa[i] - pb[i];
  }
  return 0;
}

// ---------------------------------------------------------------------------
// Hook wiring merge (pure, exported for tests)
// ---------------------------------------------------------------------------

function isSeHookCommand(command) {
  return typeof command === 'string' && SE_HOOK_COMMAND_RE.test(toPosix(command));
}

/** Rewrites the repo wiring: ${CLAUDE_PROJECT_DIR} → absolute repo root (posix). */
function rewriteWiring(hooksObj, repoRoot) {
  const root = toPosix(repoRoot);
  const rewritten = deepClone(hooksObj);
  for (const groups of Object.values(rewritten)) {
    for (const group of groups) {
      for (const hook of group.hooks || []) {
        if (typeof hook.command === 'string') {
          hook.command = hook.command.split(PROJECT_DIR_TOKEN).join(root);
        }
      }
    }
  }
  return rewritten;
}

/**
 * Non-destructive merge of the SE hook wiring into a user's settings.json.
 * - keeps every non-SE hook the user already has
 * - replaces any existing SE entry (command contains /hooks/se-) — no duplicates
 * - pure: never mutates its inputs
 */
function mergeHookSettings(existingJson, seWiring, repoRoot) {
  const merged = deepClone(existingJson || {});
  const wiring = rewriteWiring(seWiring, repoRoot);
  if (!merged.hooks) merged.hooks = {};

  for (const [event, seGroups] of Object.entries(wiring)) {
    // Strip previous SE entries (stale paths included), keep user hooks intact.
    const groups = (merged.hooks[event] || [])
      .map((group) => ({ ...group, hooks: (group.hooks || []).filter((h) => !isSeHookCommand(h.command)) }))
      .filter((group) => group.hooks.length > 0);

    for (const seGroup of seGroups) {
      const target = groups.find((g) => g.matcher === seGroup.matcher);
      if (target) target.hooks.push(...deepClone(seGroup.hooks));
      else groups.push(deepClone(seGroup));
    }
    merged.hooks[event] = groups;
  }
  return merged;
}

// ---------------------------------------------------------------------------
// Changelog parsing (exported for tests)
// ---------------------------------------------------------------------------

function parseChangelog(text) {
  const sections = [];
  let current = null;
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(CHANGELOG_HEADING_RE);
    if (match) {
      current = { version: match[1], lines: [line] };
      sections.push(current);
    } else if (current) {
      current.lines.push(line);
    }
  }
  return sections.map((s) => ({ version: s.version, body: s.lines.join('\n').trim() }));
}

/** Returns the changelog sections with fromVersion < version <= toVersion. */
function changelogBetween(text, fromVersion, toVersion) {
  const floor = fromVersion || '0.0.0';
  return parseChangelog(text)
    .filter((s) => compareVersions(s.version, floor) > 0 && compareVersions(s.version, toVersion) <= 0)
    .map((s) => s.body)
    .join('\n\n');
}

// ---------------------------------------------------------------------------
// install
// ---------------------------------------------------------------------------

function installCopyStep(repoSubdir, label) {
  const src = path.join(REPO_ROOT, '.claude', repoSubdir);
  const dst = path.join(claudeDir(), repoSubdir);
  if (!fs.existsSync(src)) {
    log(`⚠ ${label} : dossier source absent (${src}) — ignoré`);
    return;
  }
  const copied = copyTreeOverwrite(src, dst);
  log(`✓ ${label} : ${copied} fichier(s) copiés vers ${toPosix(dst)}`);
}

function installSettingsStep() {
  const repoSettings = readJson(path.join(REPO_ROOT, '.claude', SETTINGS_FILENAME), null);
  if (!repoSettings || !repoSettings.hooks) {
    log('⚠ câblage hooks : .claude/settings.json du repo introuvable — ignoré');
    return;
  }
  const userSettingsPath = path.join(claudeDir(), SETTINGS_FILENAME);
  const existing = readJson(userSettingsPath, {});
  const merged = mergeHookSettings(existing, repoSettings.hooks, REPO_ROOT);

  const before = JSON.stringify(existing);
  const after = JSON.stringify(merged);
  if (before === after) {
    log('✓ câblage hooks : déjà à jour dans settings.json');
    return;
  }
  if (fs.existsSync(userSettingsPath)) {
    const backup = `${userSettingsPath}.backup-${backupTimestamp()}`;
    fs.copyFileSync(userSettingsPath, backup);
    log(`✓ backup : ${path.basename(backup)}`);
  }
  writeJson(userSettingsPath, merged);
  log('✓ câblage hooks : fusionné dans settings.json (hooks existants préservés)');
}

function installGsdPatchesStep() {
  const gsdDir = path.join(claudeDir(), GSD_DIRNAME);
  if (!fs.existsSync(gsdDir)) {
    log('⚠ GSD non installé — les patches seront appliqués au premier install de GSD');
    return;
  }
  const script = path.join(REPO_ROOT, 'scripts', 'install-gsd-patches.cjs');
  const result = spawnSync(process.execPath, [script], { stdio: 'inherit', env: process.env });
  if (result.status !== 0) {
    log('⚠ install-gsd-patches a échoué — relance `node scripts/install-gsd-patches.cjs` après correction');
  }
}

function installWriteState(version) {
  const previous = readState();
  writeJson(statePath(), {
    version,
    installedAt: new Date().toISOString(),
    lastMigration: previous && typeof previous.lastMigration === 'number' ? previous.lastMigration : INITIAL_MIGRATION,
  });
  log(`✓ état écrit : ${toPosix(statePath())} (v${version})`);
}

function runInstallSteps() {
  const version = readRepoVersion();
  log(`Simple & Efficace v${version} — installation depuis ${toPosix(REPO_ROOT)}\n`);
  installCopyStep('commands', 'skills');
  installCopyStep('agents', 'agents');
  installSettingsStep();
  installGsdPatchesStep();
  installWriteState(version);
  return version;
}

function cmdInstall() {
  runInstallSteps();
  log('');
  printDoctorChecks(collectDoctorChecks());
  log('\nInstallation terminée. Lance `node se.cjs doctor` à tout moment pour re-vérifier.');
}

// ---------------------------------------------------------------------------
// update
// ---------------------------------------------------------------------------

function pendingMigrations(lastMigration) {
  const dir = path.join(REPO_ROOT, MIGRATIONS_DIRNAME);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .map((name) => {
      const match = name.match(MIGRATION_FILE_RE);
      return match ? { num: Number(match[1]), name, file: path.join(dir, name) } : null;
    })
    .filter((m) => m && m.num > lastMigration)
    .sort((a, b) => a.num - b.num);
}

function runMigrations() {
  const state = readState();
  const last = state && typeof state.lastMigration === 'number' ? state.lastMigration : INITIAL_MIGRATION;
  const pending = pendingMigrations(last);
  if (pending.length === 0) {
    log('✓ migrations : aucune en attente');
    return;
  }
  for (const migration of pending) {
    const mod = require(migration.file);
    log(`→ migration ${migration.name} : ${mod.description || '(sans description)'}`);
    try {
      mod.run({ repoRoot: REPO_ROOT, home: seHome() });
    } catch (err) {
      fail(`migration ${migration.name} a échoué : ${err.message}. Corrige puis relance \`se update\`.`);
    }
    const current = readState() || {};
    writeJson(statePath(), { ...current, lastMigration: migration.num });
    log(`✓ migration ${migration.name} appliquée`);
  }
}

function cmdUpdate() {
  const previousState = readState();
  const previousVersion = previousState ? previousState.version : null;

  log('→ git pull --ff-only…');
  const pull = spawnSync('git', ['pull', '--ff-only'], { cwd: REPO_ROOT, encoding: 'utf8' });
  if (pull.error || pull.status !== 0) {
    const detail = pull.error ? pull.error.message : (pull.stderr || '').trim();
    fail(`git pull a échoué : ${detail}\nRésous le conflit dans ${toPosix(REPO_ROOT)} puis relance \`se update\`.`);
  }
  log((pull.stdout || '').trim() || '✓ repo à jour');

  const newVersion = readRepoVersion();
  if (previousVersion && previousVersion !== newVersion) {
    log(`\nMise à jour ${previousVersion} → ${newVersion}\n`);
  }

  runInstallSteps();
  runMigrations();

  if (previousVersion && compareVersions(newVersion, previousVersion) > 0) {
    const changelogFile = path.join(REPO_ROOT, CHANGELOG_FILENAME);
    if (fs.existsSync(changelogFile)) {
      const section = changelogBetween(fs.readFileSync(changelogFile, 'utf8'), previousVersion, newVersion);
      if (section) log(`\n--- Nouveautés (${previousVersion} → ${newVersion}) ---\n\n${section}`);
    }
  }
  log('\nMise à jour terminée.');
}

// ---------------------------------------------------------------------------
// init
// ---------------------------------------------------------------------------

function cmdInit(dirArg) {
  const target = path.resolve(dirArg || process.cwd());
  const scaffold = path.join(REPO_ROOT, 'scaffold');
  if (!fs.existsSync(scaffold)) fail(`scaffold/ introuvable dans le repo (${scaffold})`);
  if (fs.existsSync(path.join(target, '.planning'))) {
    fail(`${toPosix(target)} est déjà un projet SE (.planning présent) — utilise /se-migrate pour un projet d'un ancien clone.`);
  }

  fs.mkdirSync(target, { recursive: true });
  const { copied, skipped } = copyTreeNoOverwrite(scaffold, target);
  log(`✓ scaffold copié : ${copied} fichier(s) vers ${toPosix(target)}`);
  for (const rel of skipped) {
    log(`⚠ ${toPosix(rel)} existe déjà — conservé tel quel`);
  }

  const version = readRepoVersion();
  const configPath = path.join(target, '.planning', 'config.json');
  const config = readJson(configPath, {});
  config.seVersion = version;
  writeJson(configPath, config);
  log(`✓ version estampillée : seVersion ${version} dans .planning/config.json`);

  log('\nProchaines étapes :');
  log(`  1. cd "${toPosix(target)}"`);
  log('  2. claude');
  log('  3. /se-new-project "<ton idée>"');
}

// ---------------------------------------------------------------------------
// sync-project
// ---------------------------------------------------------------------------

// scaffold/ n'est copié qu'au `se init` : un projet créé avant une évolution du système
// garde sa config et son contrat de design pour toujours. C'est comme ça qu'un projet a
// tourné avec toutes ses gates optionnelles éteintes sans que personne ne le voie.
// Cette commande rattrape l'écart sans jamais écraser un choix explicite.

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/** Ajoute dans `target` les clés absentes de `defaults`. Ne modifie JAMAIS une valeur
 *  déjà présente : un flag mis à false volontairement reste à false. Retourne les
 *  chemins pointés ajoutés. */
function fillMissingKeys(target, defaults, prefix = '') {
  const added = [];
  for (const [key, value] of Object.entries(defaults)) {
    const dotted = prefix ? `${prefix}.${key}` : key;
    if (isPlainObject(value)) {
      if (target[key] === undefined) {
        target[key] = deepClone(value);
        added.push(dotted);
      } else if (isPlainObject(target[key])) {
        added.push(...fillMissingKeys(target[key], value, dotted));
      }
      // type divergent (scalaire là où le scaffold a un objet) : on ne touche à rien
    } else if (target[key] === undefined) {
      target[key] = value;
      added.push(dotted);
    }
  }
  return added;
}

/** Bloc `## <num> …` complet, jusqu'au prochain titre de niveau 2. null si absent. */
function sectionBlock(md, num) {
  const match = new RegExp(`^##\\s+${num.replace(/\./g, '\\.')}(?![\\d.])`, 'm').exec(md);
  if (!match) return null;
  const after = md.slice(match.index + match[0].length);
  const next = /^##\s/m.exec(after);
  return match[0] + (next ? after.slice(0, next.index) : after);
}

function cmdSyncProject(dirArg) {
  const target = path.resolve(dirArg || process.cwd());
  const planning = path.join(target, '.planning');
  if (!fs.existsSync(planning)) {
    fail(`${toPosix(target)} n'est pas un projet SE (pas de .planning/) — utilise \`se init\` pour en créer un.`);
  }
  const scaffold = path.join(REPO_ROOT, 'scaffold');
  if (!fs.existsSync(scaffold)) fail(`scaffold/ introuvable dans le repo (${scaffold})`);

  const todo = [];

  // 1. config.json — clés manquantes seulement.
  const configPath = path.join(planning, 'config.json');
  const defaults = readJson(path.join(scaffold, '.planning', 'config.json'), {});
  const config = readJson(configPath, {});
  // Relevé AVANT le remplissage : on ne veut signaler que les `false` choisis par le
  // projet, pas les défauts que la commande vient elle-même d'écrire.
  const off = Object.entries(config.workflow || {}).filter(([, v]) => v === false).map(([k]) => k);
  const added = fillMissingKeys(config, defaults);
  if (added.length) {
    config.seVersion = readRepoVersion();
    writeJson(configPath, config);
    log(`✓ config.json : ${added.length} clé(s) ajoutée(s) — ${added.join(', ')}`);
  } else {
    log('✓ config.json : à jour, aucune clé manquante');
  }
  if (off.length) {
    log(`⚠ réglages workflow à false dans ce projet (conservés tels quels) : ${off.join(', ')}`);
    todo.push(`Vérifier que ces réglages doivent rester à false : ${off.join(', ')}`);
  }

  // 2. DESIGN-SYSTEM.md — §2.1 hiérarchie visuelle, absente de tout contrat écrit
  //    avant que la règle existe. Sans elle, chaque agent invente son échelle.
  const dsPath = path.join(planning, 'design', 'DESIGN-SYSTEM.md');
  if (!fs.existsSync(dsPath)) {
    log('· pas de DESIGN-SYSTEM.md — projet sans front, ou contrat à créer via /se-ui');
  } else {
    const ds = fs.readFileSync(dsPath, 'utf8');
    if (sectionBlock(ds, '2.1')) {
      log('✓ DESIGN-SYSTEM.md : §2.1 hiérarchie visuelle présente');
    } else {
      const reference = fs.readFileSync(path.join(scaffold, '.planning', 'design', 'DESIGN-SYSTEM.md'), 'utf8');
      const block = sectionBlock(reference, '2.1');
      if (!block) fail('§2.1 introuvable dans le gabarit scaffold — repo incomplet, relance un git pull.');
      const anchor = /^##\s+3\./m.exec(ds);
      const updated = anchor
        ? ds.slice(0, anchor.index) + block + ds.slice(anchor.index)
        : `${ds.trimEnd()}\n\n${block}`;
      fs.writeFileSync(dsPath, updated, 'utf8');
      log('✓ DESIGN-SYSTEM.md : §2.1 hiérarchie visuelle insérée (à remplir)');
      todo.push('Remplir §2.1 de DESIGN-SYSTEM.md AVEC l\'humain — ratio titre/corps, focal point, niveaux d\'action. Tant qu\'elle porte « à remplir », toute écriture front est refusée.');
    }
    // Le champ public cible vit dans un tableau existant : on le signale, on ne l'injecte
    // pas. Une insertion à l'aveugle dans un tableau déjà édité casse plus qu'elle ne répare.
    if (!/\|\s*Public cible\s*\|/.test(ds)) {
      todo.push('Ajouter la ligne `| Public cible | … |` au tableau §0.1 de DESIGN-SYSTEM.md (elle durcit les planchers : âge, aisance numérique, contexte d\'usage).');
    }
  }

  // 3. INDEX.md : la carte anti-grep. Un projet créé avant qu'elle existe n'en a pas,
  //    et sans elle le step `update_planning_index` d'execute-phase se saute en silence :
  //    les phases archivées deviennent alors introuvables. Copie non destructive.
  const indexPath = path.join(planning, 'INDEX.md');
  if (fs.existsSync(indexPath)) {
    log('✓ INDEX.md : présent');
  } else {
    fs.copyFileSync(path.join(scaffold, '.planning', 'INDEX.md'), indexPath);
    log('✓ INDEX.md : créé depuis le scaffold (squelette vide)');
    todo.push('Remplir INDEX.md : lister les phases actives et les phases déjà archivées (sections "Phases actives" et "Phases archivées").');
  }

  // 3bis. PHASES.md : le registre du livré. Un projet créé avant qu'il existe n'en a pas,
  //    et /se-archive n'aurait nulle part où transférer les empreintes. Copie non destructive.
  const phasesRegistryPath = path.join(planning, 'PHASES.md');
  if (fs.existsSync(phasesRegistryPath)) {
    log('✓ PHASES.md : présent');
  } else {
    fs.copyFileSync(path.join(scaffold, '.planning', 'PHASES.md'), phasesRegistryPath);
    log('✓ PHASES.md : créé depuis le scaffold (registre vide)');
    todo.push('Remplir PHASES.md : y transférer les empreintes des phases déjà livrées (section "## Phases livrées" de ROADMAP.md, si elle existe) et les quicks du tableau de STATE.md.');
  }

  // 3ter. GLOSSARY.md : le vocabulaire du projet. Un projet créé avant qu'il existe n'en a pas,
  //    et /se-interview n'aurait aucun glossaire à opposer ni à enrichir. Copie non destructive.
  const glossaryPath = path.join(planning, 'GLOSSARY.md');
  if (fs.existsSync(glossaryPath)) {
    log('✓ GLOSSARY.md : présent');
  } else {
    fs.copyFileSync(path.join(scaffold, '.planning', 'GLOSSARY.md'), glossaryPath);
    log('✓ GLOSSARY.md : créé depuis le scaffold (glossaire vide)');
    todo.push('Ouvrir GLOSSARY.md au prochain /se-interview : y noter les termes du projet au fil des rounds, un concept, un mot, les synonymes bannis sous _Éviter_.');
  }

  // 4. _templates/ : gabarits ajoutés au système APRÈS la création du projet (un projet
  //    d'avant n'a jamais eu CHECKPOINTS.template.md). Copie non destructive : un gabarit
  //    déjà présent a pu être adapté par le projet, on ne le touche pas.
  const templatesSrc = path.join(scaffold, '.planning', '_templates');
  if (fs.existsSync(templatesSrc)) {
    const { copied: tplCopied } = copyTreeNoOverwrite(templatesSrc, path.join(planning, '_templates'));
    if (tplCopied) log(`✓ _templates/ : ${tplCopied} gabarit(s) ajouté(s)`);
    else log('✓ _templates/ : à jour, aucun gabarit manquant');
  }

  if (todo.length) {
    log('\nÀ FAIRE (aucune de ces actions ne se fait sans l\'humain) :');
    todo.forEach((item, i) => log(`  ${i + 1}. ${item}`));
  } else {
    log('\nRien à reprendre : le projet est aligné sur le système.');
  }
}

// ---------------------------------------------------------------------------
// doctor
// ---------------------------------------------------------------------------

const CHECK_OK = 'ok';
const CHECK_KO = 'ko';
const CHECK_WARN = 'warn';

function check(status, label) {
  return { status, label };
}

function collectDoctorChecks() {
  const checks = [];
  const version = readRepoVersion();
  const state = readState();

  // Installed version vs repo version.
  if (!state) checks.push(check(CHECK_KO, `pas de ${STATE_FILENAME} — lance \`se install\``));
  else if (state.version === version) checks.push(check(CHECK_OK, `version installée = version repo (${version})`));
  else checks.push(check(CHECK_KO, `version installée ${state.version} ≠ repo ${version} — lance \`se update\``));

  // Repo location (warning only). Compared on the REAL path: ~/.claude/se is often a junction
  // (or symlink) to the repo checkout, which is exactly the recommended setup — comparing the
  // literal paths would then warn about a repo that is precisely where it should be.
  const expected = path.join(seHome(), ...EXPECTED_REPO_LOCATION);
  const realPath = (p) => { try { return fs.realpathSync(p); } catch { return path.resolve(p); } };
  if (realPath(REPO_ROOT) === realPath(expected)) {
    checks.push(check(CHECK_OK, `repo au bon endroit (${toPosix(expected)})`));
  } else {
    checks.push(check(CHECK_WARN, `repo hors de l'emplacement conseillé (${toPosix(expected)}) — fonctionne, mais les docs supposent ce chemin`));
  }

  // Installed skills up to date (hash compare of every file the repo ships).
  const repoCommands = path.join(REPO_ROOT, '.claude', 'commands');
  const homeCommands = path.join(claudeDir(), 'commands');
  const stale = listFilesRecursive(repoCommands).filter((rel) => {
    const installed = path.join(homeCommands, rel);
    if (!fs.existsSync(installed)) return true;
    return sha256(fs.readFileSync(installed)) !== sha256(fs.readFileSync(path.join(repoCommands, rel)));
  });
  if (stale.length === 0) checks.push(check(CHECK_OK, 'skills installés à jour'));
  else checks.push(check(CHECK_KO, `${stale.length} skill(s) absent(s) ou obsolète(s) (ex : ${toPosix(stale[0])}) — lance \`se install\``));

  // Hook wiring present in the user's settings.json.
  const repoWiring = readJson(path.join(REPO_ROOT, '.claude', SETTINGS_FILENAME), { hooks: {} }).hooks || {};
  const userSettings = readJson(path.join(claudeDir(), SETTINGS_FILENAME), {});
  const wired = JSON.stringify(userSettings.hooks || {});
  const missingHooks = [];
  for (const groups of Object.values(repoWiring)) {
    for (const group of groups) {
      for (const hook of group.hooks || []) {
        const scriptName = (hook.command.match(SE_HOOK_COMMAND_RE) || [''])[0];
        if (scriptName && !wired.includes(scriptName)) missingHooks.push(scriptName);
      }
    }
  }
  if (missingHooks.length === 0) checks.push(check(CHECK_OK, 'câblage hooks présent dans settings.json'));
  else checks.push(check(CHECK_KO, `câblage hooks incomplet (${missingHooks.join(', ')}) — lance \`se install\``));

  // GSD engine + patch manifest.
  const gsdDir = path.join(claudeDir(), GSD_DIRNAME);
  if (!fs.existsSync(gsdDir)) {
    checks.push(check(CHECK_KO, 'GSD absent (~/.claude/gsd-core) : installe gsd-core (npx @opengsd/gsd-core@latest --claude --global) puis relance `se install`'));
  } else if (!fs.existsSync(path.join(gsdDir, GSD_MANIFEST_FILENAME))) {
    checks.push(check(CHECK_KO, `GSD présent mais patches SE non appliqués (${GSD_MANIFEST_FILENAME} absent) — lance \`se install\``));
  } else {
    checks.push(check(CHECK_OK, 'GSD présent, patches SE appliqués (manifest trouvé)'));
  }

  // Vendored design corpora.
  if (fs.existsSync(path.join(REPO_ROOT, 'vendor', 'design', 'VERSIONS.json'))) {
    checks.push(check(CHECK_OK, 'vendor/design présent avec VERSIONS.json'));
  } else {
    checks.push(check(CHECK_KO, 'vendor/design incomplet (VERSIONS.json absent) — lance `node scripts/sync-design-vendors.cjs`'));
  }

  return checks;
}

function collectRepoChecks() {
  const checks = [];

  // VERSION readable.
  const versionFile = path.join(REPO_ROOT, VERSION_FILENAME);
  const rawVersion = fs.existsSync(versionFile) ? fs.readFileSync(versionFile, 'utf8').trim() : null;
  if (rawVersion && SEMVER_RE.test(rawVersion)) checks.push(check(CHECK_OK, `VERSION lisible (${rawVersion})`));
  else checks.push(check(CHECK_KO, 'VERSION absent ou invalide'));

  // Scaffold completeness.
  const missingScaffold = SCAFFOLD_REQUIRED_FILES.filter((rel) => !fs.existsSync(path.join(REPO_ROOT, 'scaffold', rel)));
  if (missingScaffold.length === 0) checks.push(check(CHECK_OK, 'scaffold complet (CLAUDE.md, .gitignore, .planning/config.json, .planning/INDEX.md, .planning/PHASES.md, .planning/GLOSSARY.md)'));
  else checks.push(check(CHECK_KO, `scaffold incomplet : ${missingScaffold.map(toPosix).join(', ')}`));

  // Vendored corpora present.
  if (fs.existsSync(path.join(REPO_ROOT, 'vendor', 'design', 'VERSIONS.json'))) {
    checks.push(check(CHECK_OK, 'vendor/design présent'));
  } else {
    checks.push(check(CHECK_KO, 'vendor/design absent (VERSIONS.json manquant)'));
  }

  // Syntax check every .cjs in hooks/ and scripts/.
  const badSyntax = [];
  for (const dir of ['hooks', 'scripts']) {
    const full = path.join(REPO_ROOT, dir);
    for (const rel of listFilesRecursive(full).filter((f) => f.endsWith('.cjs'))) {
      const result = spawnSync(process.execPath, ['--check', path.join(full, rel)], { encoding: 'utf8' });
      if (result.status !== 0) badSyntax.push(path.join(dir, rel));
    }
  }
  if (badSyntax.length === 0) checks.push(check(CHECK_OK, 'syntaxe OK sur tous les .cjs de hooks/ et scripts/'));
  else checks.push(check(CHECK_KO, `erreur de syntaxe : ${badSyntax.map(toPosix).join(', ')}`));

  // Existing test suites.
  for (const suite of REPO_TEST_SUITES) {
    const result = spawnSync(process.execPath, [path.join(REPO_ROOT, suite)], { cwd: REPO_ROOT, encoding: 'utf8' });
    if (result.status === 0) checks.push(check(CHECK_OK, `tests verts : ${toPosix(suite)}`));
    else checks.push(check(CHECK_KO, `tests en échec : ${toPosix(suite)}`));
  }

  return checks;
}

function printDoctorChecks(checks) {
  for (const { status, label } of checks) {
    const mark = status === CHECK_OK ? '✓' : status === CHECK_WARN ? '⚠' : '✗';
    log(`${mark} ${label}`);
  }
}

function cmdDoctor(repoMode) {
  const checks = repoMode ? collectRepoChecks() : collectDoctorChecks();
  printDoctorChecks(checks);
  const broken = checks.filter((c) => c.status === CHECK_KO).length;
  log(broken === 0 ? '\nTout est en ordre.' : `\n${broken} problème(s) détecté(s).`);
  process.exit(broken === 0 ? 0 : 1);
}

// ---------------------------------------------------------------------------
// version & help
// ---------------------------------------------------------------------------

function cmdVersion() {
  const version = readRepoVersion();
  const state = readState();
  log(`Simple & Efficace v${version} (repo)`);
  log(state ? `Installé : v${state.version} le ${state.installedAt}` : 'Non installé — lance `se install`.');
}

function printHelp() {
  log(`Simple & Efficace — CLI du système

Usage : node se.cjs <commande>

Commandes :
  install         Installe skills, agents et câblage hooks dans ~/.claude, applique les patches GSD (idempotent)
  update          git pull + réinstall + migrations + affichage du changelog
  init [dir]      Sème un nouveau projet depuis scaffold/ (défaut : dossier courant)
  sync-project    Rattrape un projet existant sur le scaffold courant : clés de config
                  manquantes, §2.1 du contrat de design. N'écrase aucun choix explicite.
  doctor          Diagnostic de l'installation (exit 1 si problème)
  doctor --repo   Checks côté repo uniquement (mode CI : VERSION, scaffold, syntaxe, tests)
  version         Affiche la version du repo et de l'installation
  --help          Cette aide`);
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

function main() {
  const [command, ...rest] = process.argv.slice(2);
  switch (command) {
    case 'install': return cmdInstall();
    case 'update': return cmdUpdate();
    case 'init': return cmdInit(rest[0]);
    case 'sync-project': return cmdSyncProject(rest[0]);
    case 'doctor': return cmdDoctor(rest.includes('--repo'));
    case 'version': return cmdVersion();
    case undefined:
    case '--help':
    case 'help': return printHelp();
    default:
      printHelp();
      fail(`commande inconnue : ${command}`);
  }
}

module.exports = { mergeHookSettings, rewriteWiring, isSeHookCommand, changelogBetween, parseChangelog, compareVersions };

if (require.main === module) main();
