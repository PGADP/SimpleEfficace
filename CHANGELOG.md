# Changelog

Toutes les évolutions notables du système Simple & Efficace.
Format : [Keep a Changelog](https://keepachangelog.com/fr/) simplifié — une section `## [x.y.z]` par version, affichée par `se update` lors d'une montée de version.

## [1.1.0] - 2026-08-13

### Ajouté
- **Surcharge projet du placement-guard** : un projet peut déclarer des dossiers/fichiers supplémentaires autorisés dans `.planning/rules/placement-overrides.json` (clés `repoRootAllow`, `planningRootAllow`, `planningDirs`, `phaseFileAllow`, `reportAllowDirs` : fusion additive avec la banque globale, rien ne peut être retiré). Besoin révélé par la migration d'un projet existant (My Mozaica) porteur de dossiers légitimes hors norme (`issues/`, `marketing/`, `test-users/`...). JSON invalide ou absent : ignoré en silence, règles globales seules. 4 tests ajoutés.

## [1.0.0] - 2026-08-03

### Ajouté
- **Installation globale** : le repo se clone une fois par machine dans `~/.claude/se/`, au lieu d'être copié dans chaque projet. Les skills, agents et hooks sont installés dans `~/.claude/` et partagés entre tous les projets.
- **CLI `se.cjs`** : `install` (idempotent), `update` (git pull + réinstall + migrations + changelog), `init [dir]` (sème un projet depuis `scaffold/`), `doctor` (diagnostic, `--repo` pour la CI), `version`.
- **Scaffold par projet** (`scaffold/`) : CLAUDE.md, `.gitignore` et `.planning/` copiés dans chaque nouveau projet via `se init`, avec la version du système estampillée dans `.planning/config.json` (`seVersion`).
- **Mécanisme de migrations** (`migrations/`) : scripts numérotés rejoués par `se update` pour accompagner les changements de structure entre versions.
- **Cascade ui-rules** : `.planning/rules/ui-rules.json` du projet s'il existe, sinon `rules/ui-rules.json` du système global.
- **Checkpoint visuel mesuré** : vérification Playwright (`ui-verify.spec.ts`) + verdict déterministe (`scripts/ui-verdict.cjs`) sur les 10 piliers UI, branché sur le cycle GSD (`visual_checkpoint`, `ui_gate_blocking`).

### Modifié
- Le câblage des hooks dans `~/.claude/settings.json` pointe désormais en chemins absolus vers le repo global (fusion non destructive, backup automatique).
