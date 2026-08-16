# Changelog

Toutes les évolutions notables du système Simple & Efficace.
Format : [Keep a Changelog](https://keepachangelog.com/fr/) simplifié — une section `## [x.y.z]` par version, affichée par `se update` lors d'une montée de version.

## [1.2.0] - 2026-08-16

### Ajouté
- **Gate `ui-contract-gate`** (bloquante, PreToolUse Edit/Write) : refuse toute écriture de code front tant que `DESIGN-SYSTEM.md` §0 (plateforme, direction esthétique, molettes) est absent ou squelette. Contrat rempli : injecte le plancher de qualité impeccable (`craft-floor.md`) + le §0 du contrat à la première édition front de la session — l'information arrive avant le premier jet, pas en review. Toggle `workflow.ui_contract_gate`.
- **Gate `ui-gate`** (bloquante, PreToolUse Bash `git commit`) : refuse de commiter des fichiers front qui portent des anti-patterns mesurés (détecteur impeccable sur le contenu stagé) ou qui n'ont pas de passe `/se-ui` valide. Toggle `workflow.ui_commit_gate`.
- **Registre des passes UI** (`.planning/design/ui-passes.json`, commité) : une passe n'existe que si `scripts/ui-pass.cjs record` a reçu l'URL que l'humain a regardée et son GO explicite ; le script relance le détecteur avant d'accepter, et la passe se périme au moindre re-edit du fichier (hash de contenu).
- **Checkpoint humain obligatoire avec URL** : le rituel `/se-ui` (§5.6) et le checkpoint visuel d'`execute-phase` donnent l'URL exacte de la page à l'humain et attendent son GO avant d'enregistrer la passe.
- **Kill des serveurs de checkpoint** : un serveur dev lancé pour un checkpoint est tué à la fin (GO ou pas) — rappelé par `ui-pass.cjs`, le rituel `/se-ui` et le workflow `execute-phase`.

### Modifié
- `se-gates.test.cjs` passe de 23 à 44 tests (couverture des deux nouvelles gates + `ui-pass.cjs`).
- `guard-lib.cjs` : ajout de `isFrontCodeFile` (variante stricte de `isFrontFile` pour les gates bloquantes) et `seFlag` (lecture des toggles `workflow.*`).

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
