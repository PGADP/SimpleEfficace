#!/usr/bin/env node
// prune-legacy-global — archive les skills GLOBAUX non préfixés supersédés par
// les skills se-* de ce repo. Rien n'est supprimé : tout part dans un dossier
// de backup horodaté sous ~/.claude/, restaurable d'un simple move.
//
// Pourquoi : le menu / charge les skills globaux ET projet à chaque session.
// Les doublons (pilot + se-pilot, dev + se-dev…) coûtent du contexte et créent
// de l'ambiguïté. Règle générique, pas de liste en dur :
//   ~/.claude/commands/<name>.md est archivé SSI .claude/commands/se-<name>.md
//   existe dans ce repo. Idem pour un dossier <name>/ si le repo a le même.
//
//   node scripts/prune-legacy-global.cjs           → dry-run (montre ce qui partirait)
//   node scripts/prune-legacy-global.cjs --apply   → archive réellement

const fs = require('fs');
const path = require('path');
const os = require('os');

const REPO_CMDS = path.resolve(__dirname, '..', '.claude', 'commands');
const GLOBAL_CMDS = path.join(os.homedir(), '.claude', 'commands');
const APPLY = process.argv.includes('--apply');
const stamp = new Date().toISOString().slice(0, 10);
const BACKUP = path.join(os.homedir(), '.claude', `_backup-legacy-skills-${stamp}`);

if (!fs.existsSync(GLOBAL_CMDS)) {
  console.log('Pas de ~/.claude/commands — rien à faire.');
  process.exit(0);
}

const toArchive = [];
for (const entry of fs.readdirSync(GLOBAL_CMDS, { withFileTypes: true })) {
  if (entry.isFile() && entry.name.endsWith('.md')) {
    const base = entry.name.replace(/\.md$/, '');
    if (fs.existsSync(path.join(REPO_CMDS, `se-${base}.md`))) toArchive.push(entry.name);
  } else if (entry.isDirectory() && entry.name !== 'gsd') {
    // dossier support (ex: brainstorming/) archivé si le repo embarque sa propre copie
    if (fs.existsSync(path.join(REPO_CMDS, entry.name))) toArchive.push(entry.name);
  }
}

if (!toArchive.length) {
  console.log('Aucun doublon global à archiver — déjà propre.');
  process.exit(0);
}

console.log(`${APPLY ? 'Archivage' : 'DRY-RUN (relance avec --apply)'} — ${toArchive.length} entrée(s) globale(s) supersédée(s) par un se-* du repo :`);
for (const name of toArchive) console.log(`  • ~/.claude/commands/${name}`);

if (!APPLY) process.exit(0);

fs.mkdirSync(BACKUP, { recursive: true });
for (const name of toArchive) {
  fs.renameSync(path.join(GLOBAL_CMDS, name), path.join(BACKUP, name));
}
console.log(`\n✓ Archivé dans ${BACKUP} (restaurer = redéplacer le fichier).`);
