---
description: Migration d'un projet de l'ancien modèle (système SE cloné dans le repo) vers le nouveau (installation globale ~/.claude/se). Zéro perte — tout ce qui est retiré part dans .planning/_archive/migration-{date}/, jamais supprimé. Dry-run par défaut : inventaire + plan, exécution seulement après GO explicite. Un commit isolé, revert-able.
---

# /se-migrate — bascule vers l'installation globale SE

Tu migres un projet créé sous l'ANCIEN modèle (copie complète du système SE embarquée : `hooks/`, `scripts/`, `vendor/`, `gsd-patches/`, skills `se-*`…) vers le NOUVEAU modèle (système global dans `~/.claude/se`, projet léger). Le système global fait désormais tout ce que faisait la copie locale : elle est du poids mort.

**Règles absolues** (à respecter noir sur blanc, aucune exception) :
- **Jamais de suppression.** Tout ce qui part est déplacé (`git mv`) vers `.planning/_archive/migration-{YYYY-MM-DD}/`. Restauration = move inverse ou `git revert`.
- **Jamais toucher un skill non-`se-*`** dans `.claude/commands/` : c'est une création de l'utilisateur, intouchable.
- **Jamais exécuter sans GO explicite.** Par défaut ce skill est en dry-run : il ne fait QUE l'inventaire et le plan.
- **Jamais migrer avec un working tree sale.** La migration doit être un commit isolé, revert-able d'un seul `git revert`.
- **En cas de doute sur un fichier → « conservé »**, et le signaler à l'utilisateur. On n'archive jamais dans le doute.

## Étape 0 — Préconditions (stop si l'une échoue)

1. **Installation globale présente ?**
   ```bash
   test -f ~/.claude/se/se.cjs && echo OK || echo ABSENT
   ```
   Si ABSENT → stop, afficher :
   ```
   L'installation globale SE est absente. Installe-la d'abord :
     git clone https://github.com/PGADP/SimpleEfficace.git ~/.claude/se
     node ~/.claude/se/se.cjs install
   Puis relance /se-migrate.
   ```

2. **Projet de l'ancien modèle ?** Chercher au moins UN marqueur :
   ```bash
   ls hooks/se-guard.cjs vendor/design gsd-patches 2>/dev/null
   ```
   Aucun marqueur (projet déjà migré, ou créé par `se init`) → « Rien à migrer — ce projet est déjà sur le modèle global. », stop.

3. **Working tree propre ?**
   ```bash
   git status --porcelain
   ```
   Si sale → stop et proposer de committer d'abord (ou `/se-clean-commit`). Ne JAMAIS mélanger la migration avec du travail en cours.

## Étape 1 — Inventaire et classification (AFFICHER avant toute action)

Parcourir le projet et classer chaque élément dans une des quatre catégories. Utiliser `ls`/`test -e` fichier par fichier — ne rien supposer présent (les clones datent d'époques différentes du système).

### A. Système → à archiver
- `hooks/`
- `gsd-patches/`
- `vendor/`
- `templates/` **ou** `.planning/design/*.template.ts` (selon l'époque du clone)
- `references/` **ou** `.planning/design/references/`
- `scaffold/` si présent
- `rules/` **ou** `.planning/rules/ui-rules.json` — **seulement si identique au défaut système** :
  ```bash
  diff -q ".planning/rules/ui-rules.json" ~/.claude/se/rules/ui-rules.json
  ```
  Identique → archiver. **Différent → surcharge projet : GARDER en `.planning/rules/`** et le signaler.
- Dans `scripts/`, **uniquement** les scripts SE : `install-gsd-patches.cjs`, `prune-legacy-global.cjs`, `sync-design-vendors.cjs`, `ui-verdict*.cjs`, `se*.cjs`. **Tout autre script appartient au projet : garder.**
- `docs/SYSTEME.md` et docs système (`docs/_design/` du système SE, pas les specs du projet — en cas de doute : garder).
- `CONVENTIONS.md` racine — seulement si identique au système (`diff -q CONVENTIONS.md ~/.claude/se/CONVENTIONS.md`) ; différent → garder.

### B. Skills et agents
- `.claude/commands/se-*.md` et `.claude/commands/pilot/` → archiver (globaux désormais).
- **Tout autre `.claude/commands/*.md` ou dossier = créé par l'utilisateur : INTOUCHABLE.** Le lister explicitement comme « conservé ».
- `.claude/agents/` : pour chaque agent, archiver **seulement si un fichier du même nom existe** dans `~/.claude/se/.claude/agents/` ; sinon garder.

### C. Câblage — `.claude/settings.json` (nettoyage, pas archivage)
- Retirer **uniquement** les entrées de hooks dont la `command` contient `hooks/se-` (chemin projet). Conserver tout le reste du fichier (autres hooks, permissions, env…).
- Backup obligatoire avant modification (voir étape 3).
- Si le fichier ne contient plus rien d'utile après nettoyage → le dire, et proposer de l'archiver aussi (sur accord).

### D. Projet — jamais touché
`.planning/` (données), `src/`, `CLAUDE.md`, `README.md`, `package.json`, et tout ce qui n'est pas listé en A/B/C.

## Étape 2 — Plan affiché + accord explicite

Présenter un tableau complet AVANT toute action :

```
Plan de migration — dry-run (rien n'a été fait)

À ARCHIVER → .planning/_archive/migration-2026-08-03/
  hooks/                        → migration-2026-08-03/hooks/
  gsd-patches/                  → migration-2026-08-03/gsd-patches/
  vendor/                       → migration-2026-08-03/vendor/
  scripts/install-gsd-patches.cjs → migration-2026-08-03/scripts/…
  .claude/commands/se-pilot.md  → migration-2026-08-03/.claude/commands/…
  …

CONSERVÉ (jamais touché)
  .claude/commands/mon-skill.md   (skill utilisateur)
  .planning/rules/ui-rules.json   (surcharge projet — diffère du défaut système)
  scripts/build-data.cjs          (script projet)
  …

NETTOYÉ (avec backup)
  .claude/settings.json — retrait des N entrées de hooks se-* ; le reste inchangé

DOUTES (classés « conservé » par prudence)
  docs/notes-archi.md — pas sûr que ce soit du système → conservé, à toi de voir

→ GO pour exécuter ? [GO / ajustements / NO-GO]
```

Attendre un **GO humain explicite**. Pas de GO implicite, pas d'exécution partielle avant le GO.

## Étape 3 — Exécution (après GO uniquement)

1. **Archiver** — préserver l'arborescence relative sous l'archive :
   ```bash
   STAMP=$(date +%F)
   mkdir -p ".planning/_archive/migration-${STAMP}"
   # pour chaque entrée du plan (créer le parent dans l'archive si besoin) :
   mkdir -p ".planning/_archive/migration-${STAMP}/scripts"
   git mv "hooks" ".planning/_archive/migration-${STAMP}/hooks"
   git mv "scripts/install-gsd-patches.cjs" ".planning/_archive/migration-${STAMP}/scripts/install-gsd-patches.cjs"
   # … etc. Toujours quoter les chemins (espaces possibles sous Windows).
   ```
   `git mv` uniquement — rien n'est supprimé, l'historique est préservé.

2. **Nettoyer `.claude/settings.json`** :
   ```bash
   cp ".claude/settings.json" ".claude/settings.json.backup-migration-${STAMP}"
   ```
   Puis éditer (Read + Edit) : retirer les entrées de hooks dont la `command` contient `hooks/se-`, garder tout le reste. Vérifier que le JSON reste valide (`node -e "JSON.parse(require('fs').readFileSync('.claude/settings.json','utf8'))"`).

3. **Stamper la version** dans `.planning/config.json` :
   ```bash
   cat ~/.claude/se/VERSION
   ```
   Ajouter/mettre à jour la clé `"seVersion"` avec cette valeur (Read + Edit du JSON, pas de sed).

4. **CLAUDE.md du projet** : s'il référence des chemins archivés (`hooks/`, `scripts/install-gsd-patches.cjs`, `gsd-patches/`…), proposer un diff qui les remplace par leurs équivalents globaux (ex. `hooks/` → `~/.claude/se/hooks/`, `node scripts/install-gsd-patches.cjs` → `node ~/.claude/se/scripts/install-gsd-patches.cjs`). **Appliquer seulement sur accord.**

5. **UN commit** (tout, y compris le backup settings) — branche : cf. `~/.claude/se/CONVENTIONS.md` §13 :
   ```bash
   git add -A
   git commit -m "chore(se): migre vers l'installation globale SE (archive dans .planning/_archive/migration-${STAMP}/)"
   ```

## Étape 4 — Vérification

```bash
node ~/.claude/se/se.cjs doctor
```

Puis rappeler à l'utilisateur :
- Restauration complète = `git revert` du commit de migration.
- Restauration ciblée = move inverse depuis `.planning/_archive/migration-{date}/`.
- Redémarrer la session Claude Code pour que le câblage hooks (désormais global) soit rechargé.

## Anti-patterns (rappel — ne JAMAIS faire)

- Supprimer quoi que ce soit (`rm`, `git rm`) — archivage seulement.
- Toucher un skill `.claude/commands/` non-`se-*` / non-`pilot/`.
- Exécuter quoi que ce soit avant le GO explicite de l'humain.
- Migrer avec un working tree sale, ou mélanger la migration à d'autres changements.
- Archiver un fichier dont on n'est pas sûr — dans le doute : conservé + signalé.

---
**Cible** : $ARGUMENTS
