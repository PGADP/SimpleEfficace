# Changelog

Toutes les évolutions notables du système Simple & Efficace.
Format : [Keep a Changelog](https://keepachangelog.com/fr/) simplifié — une section `## [x.y.z]` par version, affichée par `se update` lors d'une montée de version.

## [1.3.0] - 2026-08-17

### Ajouté
- **Skill `/se-interview`** : le primitif d'interview du système. Arbre de décision, frontière (les décisions dont les prérequis sont réglés), rounds de questions numérotées portant chacune sa réponse recommandée, fin quand la frontière est vide. Deux règles dures : les faits sont le travail de l'agent (sous-agent, jamais l'humain), les décisions sont celles de l'humain (l'agent ne répond jamais à sa propre question). Les gates vérifiaient que le code était bon, jamais qu'il était le bon : ce skill ferme l'entrée de la boucle.
- **Axe Spec dans `/se-review`** : la review lit désormais `CONTEXT.md`, `PLAN.md` (et `UI-SPEC.md` si le diff touche du front) de la phase courante et rend un second verdict, indépendant de l'axe Standards : exigence manquante, comportement hors périmètre, exigence mal implémentée, chaque constat citant sa ligne de spec. Sans spec lisible, l'axe s'annonce non applicable et n'invente jamais d'exigence.
- **Base des code smells de Fowler** dans l'axe Standards de `/se-review`, bornée par deux règles : une convention documentée du projet écrase toujours le smell, et tout ce que l'outillage attrape déjà (eslint, tsc) est ignoré.
- **Phase 1 bloquante dans `/se-debug`** : plus d'hypothèse tant qu'une commande, déjà lancée et dont la sortie est collée, ne passe pas au rouge sur ce bug précis (symptôme exact décrit par l'humain, déterministe, rapide, lançable sans humain). Avec les dix façons de construire la boucle par ordre de préférence, la minimisation, trois à cinq hypothèses falsifiables, le préfixe de log `[DEBUG-xxxx]` et une checklist de sortie.
- **Signal "pas de couture correcte" vers la gate SIMPLIFY** : quand aucune couture ne permet de poser un test de non-régression honnête, `/se-debug` traite l'absence de couture comme le résultat de l'enquête et la remonte à l'architecture au lieu de poser un test qui donne une fausse confiance.

### Modifié
- `pilot:strategic-discussion` (étape 3), `/se-new-project` (étape 1) et `/se-ux` (mode build) délèguent la mécanique d'interview à `/se-interview` et gardent leur contenu métier. Le garde-fou anti-complaisance disparaît de `strategic-discussion` : ce sous-skill n'est jamais chargé autrement que par `/se-pilot`, qui porte déjà la règle.
- `/se-review` s'ancre sur un point fixe (`git diff <ref>...HEAD`) au lieu des "fichiers modifiés récemment", et échoue immédiatement sur une ref invalide ou un diff vide, avant de lancer le moindre sous-agent. Les deux axes tournent en sous-agents parallèles ; les fusionner, les reclasser ou désigner un pire défaut toutes catégories confondues est explicitement interdit. Modes focus `lint` et `perf` inchangés.

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
