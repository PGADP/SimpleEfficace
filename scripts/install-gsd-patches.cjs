#!/usr/bin/env node
// install-gsd-patches — applies the Simple & Efficace enrichments to the GLOBAL
// GSD engine (~/.claude/gsd-core/ and ~/.claude/agents/).
//
// Why global: /gsd-* commands are user-level and user-level always shadows
// project-level, so project-local copies of workflows/agents are never loaded.
// The only reliable wiring is to patch the engine itself.
//
// Safe by design:
// - every patched file is backed up as <name>.md.orig; a manifest of applied
//   patch hashes distinguishes "target = our previous patch" (backup kept as is)
//   from "target = fresh upstream after /gsd-update" (backup refreshed + warning,
//   so upstream improvements are never silently shadowed by a stale .orig)
// - idempotent: re-running only copies files whose content differs
// - enriched workflows are config-gated (.planning/config.json toggles), so
//   other projects using the global engine are unaffected unless they opt in
//
// Run after: cloning this template, and after every /gsd-update.
//   node scripts/install-gsd-patches.cjs

const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

const REPO = path.resolve(__dirname, '..');
const HOME = os.homedir();
const EXPECTED_GSD_VERSION = '1.11.0';

const TARGETS = [
  { src: path.join(REPO, 'gsd-patches', 'workflows'), dst: path.join(HOME, '.claude', 'gsd-core', 'workflows'), ext: '.md' },
  { src: path.join(REPO, 'gsd-patches', 'agents'), dst: path.join(HOME, '.claude', 'agents'), ext: '.md' },
  // model policy: no more model-profiles.cjs patch — gsd-core exposes model
  // profiles as official config (.planning/config.json + gsd-config).
];

function fail(msg) {
  console.error(`✗ ${msg}`);
  process.exit(1);
}

const versionFile = path.join(HOME, '.claude', 'gsd-core', 'VERSION');
if (!fs.existsSync(versionFile)) {
  fail(`GSD introuvable (${versionFile}). Installe gsd-core d'abord : npx @opengsd/gsd-core@latest --claude --global`);
}
const installed = fs.readFileSync(versionFile, 'utf8').trim();
if (installed !== EXPECTED_GSD_VERSION) {
  console.warn(`⚠ GSD ${installed} installé, patches écrits pour ${EXPECTED_GSD_VERSION}. Ils s'appliquent quand même — vérifie le comportement après un /gsd-update majeur.`);
}

// Manifest: target path → sha256 of the last patch content we wrote there.
const MANIFEST = path.join(HOME, '.claude', 'gsd-core', 'se-patches-manifest.json');
const sha = (s) => crypto.createHash('sha256').update(s).digest('hex');
let manifest = {};
try { manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8')); } catch { /* first run */ }

let applied = 0, unchanged = 0, refused = 0;
for (const { src, dst, ext } of TARGETS) {
  if (!fs.existsSync(src)) continue;
  fs.mkdirSync(dst, { recursive: true });
  for (const name of fs.readdirSync(src).filter((f) => f.endsWith(ext))) {
    const from = path.join(src, name);
    const to = path.join(dst, name);
    const next = fs.readFileSync(from, 'utf8');
    const current = fs.existsSync(to) ? fs.readFileSync(to, 'utf8') : null;
    if (current === next) { manifest[to] = sha(next); unchanged++; continue; }
    if (current !== null) {
      const backup = `${to}.orig`;
      if (!fs.existsSync(backup)) {
        fs.copyFileSync(to, backup);
      } else if (manifest[to] && sha(current) !== manifest[to]) {
        // Target changed since our last install (typically /gsd-update wrote a fresh
        // upstream). Re-archive it, otherwise .orig goes stale and the update's
        // improvements are lost without trace — then REFUSE the file.
        //
        // Overwriting here would silently replace a newer engine with a patch built
        // against an older one, reintroducing whatever upstream has fixed since.
        // MIGRATION-GSD-CORE.md risk #3 already settled the rule: do not re-apply,
        // rebuild the patch from the new upstream file.
        fs.writeFileSync(backup, current);
        console.warn(`⛔ ${path.relative(HOME, to)} : upstream modifié depuis le dernier install — fichier NON patché.`);
        console.warn(`   .orig rafraîchi. Reconstruis le patch depuis le nouvel upstream : diff ${name}.orig vs gsd-patches/, puis relance.`);
        refused++;
        continue;
      }
    }
    fs.writeFileSync(to, next);
    manifest[to] = sha(next);
    console.log(`✓ patché ${path.relative(HOME, to)}`);
    applied++;
  }
}

try { fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2)); } catch { /* non bloquant */ }

console.log(applied ? `\n${applied} fichier(s) patché(s), ${unchanged} déjà à jour. Backups upstream en *.orig.` : `Tout est déjà à jour (${unchanged} fichiers).`);
if (refused) {
  console.warn(`\n⛔ ${refused} fichier(s) NON patché(s) : l'upstream a bougé depuis le dernier install.`);
  console.warn(`   Reconstruis ces patches avant de relancer, sinon les enrichissements SE ne sont pas actifs sur eux.`);
}
