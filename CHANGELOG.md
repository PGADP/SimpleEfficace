# Changelog

Toutes les évolutions notables du système Simple & Efficace.
Format : [Keep a Changelog](https://keepachangelog.com/fr/) simplifié — une section `## [x.y.z]` par version, affichée par `se update` lors d'une montée de version.

## [1.10.0] - 2026-08-31

Un prompt était le seul artefact que le système laissait passer sans grille. L'UI a `/se-ui` et son contrat, le texte visible a `/se-humanizer`, le code a trois gates : le texte lu par un modèle, lui, se relisait à vue.

### Ajouté
- **`/se-prompt`, deux modes.** `audit` (défaut) rend un verdict mesuré sans rien modifier ; `implémentation` écrit ou refond le prompt, puis se relit. Une invocation traite **une seule famille** : prompt d'instruction d'agent (`SKILL.md`, `CLAUDE.md`, commande markdown, description d'outil ou de sous-agent) ou prompt applicatif assemblé dans du code (schéma de sortie, caching, few-shots, contexte injecté). Les leviers des deux familles ne se recouvrent pas, une grille hybride jugerait à côté.
- **`references/prompt/`** : `README.md` (routage), `grid-agent.md` (18 anti-patterns + 10 checks déterministes), `grid-app.md` (16 anti-patterns + 10 checks). Chaque item porte sa mesure et distingue `[M]` (mesuré) de `[R]` (recommandation d'éditeur) : un `[R]` ne justifie jamais un CRITICAL seul.
- **Recherche source** : `.planning/research/2026-08-31-prompt-engineering-generique.md`, volet multi-fournisseurs et instruction d'agent, complémentaire du volet applicatif mesuré côté pipeline Mistral.
- **Gate PROMPT** dans `quick` et `execute-phase` : rejoint le batch parallèle SIMPLIFY / JANITOR / SECURITY, même checkpoint unique (§11), déclenchée par un prompt modifié dans la tâche. Détection en deux temps, chemin puis contenu : un prompt assemblé dans du code ne se voit pas au nom de fichier. Clé `workflow.prompt_gate`, défaut `true`.

### Décidé
- **Pas de hook bloquant au commit.** Le gate `/se-ui` bloque parce qu'il dispose d'un détecteur déterministe et d'un GO humain sur un rendu réel. L'équivalent pour un prompt est un banc d'évaluation, qui n'existe dans aucun projet : un blocage sans banc serait un tampon administratif. Le verdict PROMPT est consultatif, l'humain tranche.
- **`prompt` entre dans le type d'audit transverse** (`CONVENTIONS.md` §4) : un audit complet s'écrit dans `.planning/audits/{date}-prompt-{slug}.md`, un verdict de gate reste dans le `CHECKPOINTS.md` de la phase, un audit de séance ne s'écrit pas.

## [1.9.0] - 2026-08-28

Les empreintes des phases livrées s'accumulaient dans `ROADMAP.md`, qui portait donc deux rôles contradictoires : le planning de l'à-venir et l'archive du passé. Le second rongeait le plafond du premier.

### Ajouté
- **`PHASES.md`, registre du livré.** Nouveau document de suivi à la racine de `.planning/` : une ligne formatée par phase ou quick livré (`{date} · {NN}-{slug} · {vX.Y} · {livré} · lien SUMMARY`), sans plafond de taille — il grandit avec le projet, c'est sa fonction. Semé par le scaffold (`se init`), créé sur les projets antérieurs par `se sync-project`, exigé par `se doctor --repo`, déclaré dans `CONVENTIONS.md` §2-3-7 et `placement-rules.json`.

### Modifié
- **Plafonds `size-gate` relevés : 500 lignes et 33 000 caractères** (même densité qu'avant, largeur de ligne inchangée à 300) pour `STATE.md` et `ROADMAP.md`.
- **`ROADMAP.md` ne contient plus que l'à-venir et l'en-cours.** `/se-archive` sort la phase livrée de l'horizon court et écrit son empreinte dans `PHASES.md` ; il y transfère aussi les quicks du tableau « Quick Tasks Completed » de `STATE.md`. La section `## Phases livrées` du template devient un simple renvoi.
- **Recâblage des consommateurs** : `/se-planning` lit `PHASES.md` (jamais n'y écrit) pour l'avancement ; le patch `new-milestone` y écrit les empreintes de masse ; `INDEX.md` (scaffold) le référence ; README et `scaffold/CLAUDE.md` recalés.

## [1.5.1] - 2026-08-19

`placement-guard` refusait `.continue-here.md` dans un dossier de phase, alors que c'est le nom que `/gsd:pause-work` écrit et que le gabarit `STATE.template.md` du scaffold cite lui-même. La loi de rangement contredisait la pratique livrée par le système, sur un fichier produit à chaque pause de session.

C'est le guard qui cède, pas la pratique : renommer aurait demandé de patcher quatre workflows GSD amont (`pause-work`, `resume-project`, `transition`, `templates/state.md`), qu'un `/gsd:update` aurait pu défaire en silence.

### Ajouté
- **Classe « fichier d'état transitoire » en §6** : un dossier de phase accepte un seul nom hors de la table MAJUSCULES, `.continue-here.md`. Ce n'est pas un onzième artefact de phase mais une autre nature : les noms MAJUSCULES sont des produits durables qui partent à l'archive, celui-là est un état de session consommé à la reprise. Le point et les minuscules signalent cette différence.
- **Clé `phaseTransientAllow`** dans `hooks/rules/placement-rules.json`, en match exact : aucun préfixe `{phase}-{plan}-` toléré, pour que la porte s'ouvre sur un nom et pas sur la catégorie « dotfile ». Ajoutée à `PLACEMENT_OVERRIDE_KEYS`, donc surchargeable par projet via `placement-overrides.json`.
- **`HANDOFF.json` déclaré** dans l'arborescence §2 et dans la table des destinations §3. Il ne déclenchait rien (le guard sort tôt sur tout ce qui n'est pas `.md`) mais la loi restait muette sur un fichier que `/gsd:pause-work` écrit à la racine de `.planning/`.

### Modifié
- `STATE.template.md` nomme le chemin complet `.planning/phases/{NN}-{slug}/.continue-here.md` au lieu du nom nu, pour qu'on ne l'écrive pas à la racine de `.planning/` où il serait refusé à juste titre.
- `se-guard.test.cjs` 58 → 63 tests.

## [1.8.0] - 2026-08-26

`/se-archive` déplaçait les dossiers de phases vers `_archive/` sans toucher aux trois documents qui pointent dessus. La phase devenait un chemin mort : `ROADMAP.md` gardait son détail intégral, `STATE.md` gardait des chemins vers un dossier disparu, et aucun agent ne lisait jamais `_archive/`. Le pilot répondait « on n'a jamais fait ça » sur du travail livré trois semaines plus tôt.

En remontant la chaîne, la carte censée rendre l'archive retrouvable n'existait dans aucun projet, et deux gates UI étaient éteintes en silence par un chemin devenu faux.

### Ajouté
- **`INDEX.md` dans le scaffold.** `CONVENTIONS.md` l'annonçait comme la carte anti-grep et `execute-phase` la maintenait à chaque clôture de phase, mais rien ne la semait : le step se sautait donc toujours, et l'archivage reposait sur une carte inexistante. `se init` la pose, `se sync-project` la crée sur les projets antérieurs, `se doctor --repo` l'exige. Ses sections vides portent « ⚠ NON RENSEIGNÉ » et non « (aucune) » : un INDEX vide affirmerait qu'aucune phase n'existe, ce qui ment plus qu'un INDEX absent.
- **Section `## Phases livrées` dans `ROADMAP.template.md`.** Une phase archivée y laisse une ligne d'empreinte de 80 caractères, `{NN}-{slug} · {vX.Y} · {6 mots}`. L'identifiant reste celui du dossier archivé : pas de nom de code inventé, un seul identifiant par phase et il sert de chemin.
- **Deux plafonds au `size-gate` : 20 000 caractères par fichier, 300 par ligne.** Le compte de lignes se contournait trivialement — mesuré sur un `STATE.md` réel à 197 lignes pour 162 000 caractères, dont une ligne de 27 500. Les lignes de tableau markdown sont exemptées de la largeur : mesuré 43 lignes de tableau au-dessus de 300 sur un `ROADMAP.md` réel, leur largeur est mécanique et la contraindre reviendrait à interdire les tableaux.
- **Étapes 4 à 6 de `/se-archive`** : recaler `INDEX.md`, condenser dans `ROADMAP.md`, réécrire les chemins de `STATE.md` puis déléguer à `/se-planning`. Aussi obligatoires que le déplacement lui-même.

### Corrigé
- **Le `size-gate` ne refuse plus que l'aggravation.** Un fichier déjà hors plafond reste modifiable tant que l'écriture ne l'alourdit pas. Sans cette règle les nouveaux plafonds bloquaient les 6 projets de la machine, dont l'étape de `/se-archive` qui vient précisément les assainir : on refusait le remède au motif que le patient est malade. Les CR ne comptent plus non plus, un fichier CRLF n'étant pas plus gros que le même fichier en LF.
- **Cinq consommateurs cherchaient le passé dans `.planning/phases/`**, qui ne contient que l'actif : `briefing`, `se-pilot`, `gsd-phase-researcher`, `execute-phase` et `new-milestone`. Ils lisent `INDEX.md` ou fouillent les deux racines. `new-milestone` déplaçait en masse les phases vers l'archive du milestone sans jamais toucher la carte — second chemin d'archivage, mêmes dégâts.
- **Le front pass UI testait un chemin de skill obsolète.** `ui-phase` skippait l'enrichissement de la UI-SPEC quand `.claude/commands/se-ui.md` manquait dans le projet. Depuis l'installation globale les skills vivent dans `~/.claude/commands/` et `/se-migrate` archive justement les copies projet : le fichier est absent des 5 projets de la machine sur 5, donc le pass était sauté dans 100 % des cas, avec un message qui laissait croire à un choix. Même déduction fautive dans `gsd-executor`.
- **Le checkpoint visuel s'éteignait sur une clé absente.** `execute-phase` traitait `workflow.visual_checkpoint` manquant comme un refus, alors qu'elle manque sur tout projet créé avant que la gate existe : mesuré absent sur 3 projets sur 5, où Playwright n'a donc jamais tourné. Le défaut passe à `true`, la convention des hooks : absent = actif.
- **Le journal `ARCHIVE.log` consignait les déplacements ratés** : le `echo` était une commande séparée du `mv`, pas sa suite conditionnelle.

### Modifié
- **`CONVENTIONS.md` §7 devient la source unique des plafonds** : un tableau des trois mesures avec le pourquoi de chacune, la règle du sens de variation, l'exemption des tableaux, et la trace obligatoire laissée par un archivage. Quatre documents donnaient trois valeurs différentes — les templates disaient 200 et 150 lignes là où la loi et le hook disaient 300. Les docs n'énoncent plus les valeurs, elles y renvoient.
- **`hooks/se-gates.test.cjs` 50 → 55 tests** : contournement par lignes longues, tableau large, fichier déjà hors plafond dans les trois sens, équivalence CRLF/LF.

## [1.7.1] - 2026-08-19

`killTree` rendait son verdict juste après l'envoi du signal. Sur Windows, `taskkill /F` est synchrone et le process est déjà mort au retour ; sur Linux et macOS, un SIGTERM ne l'est pas, donc un process en train de mourir proprement était déclaré « il résiste » et son entrée restait au registre. Le système marchait sur la machine où il a été écrit, ce que la CI Ubuntu a dit tout de suite.

### Corrigé
- **`killTree` attend la mort, avec escalade** : SIGTERM, trois secondes de grâce, puis SIGKILL. Un serveur qui ignore SIGTERM garde son port ; il ne peut pas avoir le dernier mot.
- **`isAlive` ignore les zombies** : un process réparenté et non collecté répond encore à `kill(0)` alors qu'il ne tient plus ni port ni fichier. L'attendre, c'est attendre un kill qui n'arrivera jamais.
- **`scripts/se-serve.test.cjs` gagne son étape CI** : lancée seulement via `doctor --repo`, sa sortie était avalée et un échec ne disait pas quel test cassait.

## [1.7.0] - 2026-08-19

Des serveurs de dev restaient allumés session après session, chacun tenant son port. La règle « un serveur lancé = un serveur tué » était pourtant écrite à deux endroits depuis le début : personne ne l'exécutait. Le système disait aussi « Claude ne te demande JAMAIS de lancer une commande », ce qui est juste pour un build et faux pour un process qui survit à la commande.

### Ajouté
- **`scripts/se-serve.cjs` et son registre** (`hooks/server-registry.cjs`) : `start` / `stop` / `status` pour les process longs, avec PID, log et URL enregistrés dans `.planning/_servers/` (gitignoré). Un `start` sur un nom déjà vivant réutilise au lieu de doubler, ce qui est exactement comme on se retrouve avec dix serveurs. `--wait` attend que l'URL réponde et échoue proprement si le process meurt au démarrage.
- **`hooks/se-server-reaper.cjs`, hook SessionEnd** : tue ce que la session a laissé tourner. Il ne touche qu'au registre, donc jamais au serveur que l'humain a lancé dans son terminal.
- **`CONVENTIONS.md` §12, la frontière des commandes** : éphémère (build, type-check, tests, Playwright, migrations) pour Claude ; process long (dev server, worker, tunnel, docker) pour l'humain, sur une commande d'une ligne donnée une fois par session. Deux exceptions nommées : Playwright, qui gère son serveur seul via `webServer`, et les flux autonomes, qui passent par `se-serve.cjs`.
- **`scripts/se-serve.test.cjs`, 20 tests** : de vrais process sont lancés, et un battement de fichier vérifie que c'est bien le process de travail qui meurt, pas seulement le relais qui l'a lancé.

### Modifié
- **Le lancement d'un process long ne passe plus par `shell + detached`** : sur Windows, un `cmd.exe` détaché ouvre une fenêtre de console visible à chaque démarrage, et le même avec `CREATE_NO_WINDOW` meurt à la naissance. Un relais node détaché relance la commande en enfant. Les quatre combinaisons ont été mesurées avant de choisir.
- **Alignés sur §12** : `SYSTEME.md` §11 principe 5, le rituel 6 de `/se-ui`, le checkpoint visuel d'`execute-phase`, le gabarit `playwright.config` et le `CLAUDE.md` du scaffold, qui affirmaient tous l'inverse.
- **Les audits qui restaient mono-agent passent en parallèle** : `/se-ui audit` (un agent par écran), la mesure Playwright multi-écrans (un run par écran dans le même message), `/se-ux audit` de parcours (un agent par étape, les transitions restant au thread principal), `/se-refactor` (structure et qualité ensemble, par axe sur un gros projet), `/se-security` (un agent par bloc de la grille sur un périmètre large).

## [1.6.0] - 2026-08-19

Une phase coûtait trois interruptions pour un seul diff. Les gates SIMPLIFY, JANITOR et SECURITY s'enchaînaient en file, chacune avec son checkpoint et son build, alors qu'elles lisent le même diff et n'écrivent rien avant le GO. Et chaque skill improvisait la forme de sa demande de validation, jusqu'au « Le rendu est bon ? » du checkpoint visuel, qui ne vérifie rien.

### Ajouté
- **`/se-checkpoint`, primitif de checkpoint humain** : une forme unique pour toute demande de GO (Fait / Mesuré / À juger / Regarder / une question fermée) et des règles dures qui la rendent utile. Quatre points à juger au maximum, jamais un point que la machine a déjà mesuré, rien à lire avant de trancher, un checkpoint par groupe de résultats et non par analyse, le silence n'est pas un GO. Les trois types restent ceux de GSD : `human-verify`, `decision`, `human-action`.
- **`CHECKPOINTS.template.md` dans le scaffold** : gabarit du journal de phase, avec la réponse humaine recopiée mot pour mot. C'est la trace, pas un résumé.
- **`CONVENTIONS.md` §11, la loi de parallélisation** : ce qui lit part ensemble, ce qui écrit part en file. Les analyses, audits et mesures partent en un seul message ; l'écriture reste séquentielle ou en vagues à fichiers disjoints. L'anti-pattern nommé : une suite d'étapes numérotées qui appellent chacune un skill de lecture et attendent sa réponse.
- **`se sync-project` copie les gabarits `_templates/` manquants** : sans ça, un projet créé avant l'arrivée d'un gabarit ne l'aurait jamais eu. Copie non destructive, un gabarit adapté par le projet n'est jamais écrasé.

### Modifié
- **Step `simplify_janitor_gate` renommé `quality_gates`** dans `execute-phase` : les trois gates partent dans un seul message, en `--report-only`, et rendent **un** checkpoint groupé à trois sections. L'application des fixes reste séquentielle après le GO (sécurité, puis simplification, puis nettoyage, pour ne pas supprimer du code qu'une simplification vient de déplacer), avec un seul `build && type-check` pour l'ensemble au lieu d'un par gate. La supply-chain rejoint le sous-agent SECURITY plutôt que d'être un step de plus.
- **Mode `--report-only` sur `/se-gate-simplify`, `/se-gate-janitor` et `/se-security`** : la gate lit, rapporte, et ne touche à rien. Écrire un fichier ou lancer un build depuis ce mode est une faute, pas un raccourci : elle tourne à côté d'autres lectures.
- **Les checkpoints du cycle prennent la forme du primitif** : le checkpoint visuel d'`execute-phase` et le rituel 6 de `/se-ui`. « Le rendu est bon ? » devient une question fermée précédée de points à juger nommés, et les mesures déjà rendues ne sont plus soumises au jugement humain.
- `scripts/se.test.cjs` 54 → 56 tests.

## [1.5.0] - 2026-08-17

Le contrat de design ne disait rien de la hiérarchie visuelle. Trois écrans conçus par trois agents sont sortis avec trois échelles différentes sans qu'aucun ne soit en faute, et neuf défauts sont arrivés jusqu'à l'humain. Les garde-fous avaient bien tourné : le plancher de qualité avait été injecté, la gate de contrat avait laissé passer. Un garde-fou ne rattrape pas un contrat muet.

### Ajouté
- **§2.1 Hiérarchie visuelle dans `DESIGN-SYSTEM.md`** : ratio titre principal / corps (plancher 1.6), écart minimal entre deux niveaux de titre, focal point unique et nommé, hiérarchie des actions en trois niveaux (primaire / secondaire / tertiaire) avec leurs règles d'emploi, et sortie obligatoire sur tout écran à changement de contexte. `designContractState` la traite comme §0.1 et §0.2 : absente ou marquée « à remplir », le contrat est un squelette et `ui-contract-gate` refuse l'écriture front.
- **Champ « public cible » en §0.1** : tranche d'âge, aisance numérique, contexte d'usage. Il durcit les planchers et ne les assouplit jamais (public senior : corps 18px, contraste AAA, cibles 48px, aucune action en icône seule).
- **Règle mesurée `hierarchy-title-dominance` (BLOCK)** : le titre dominant de l'écran doit faire au moins 1.6× le corps de texte réellement rendu. Un écran peut respecter « ≤ 4 tailles » et rester illisible si ces quatre tailles sont 16/17/18/20 — c'est le rapport de force qui dit où l'œil se pose, pas le nombre de tailles.
- **Règle mesurée `single-primary-action` (FLAG)** : compte les contrôles portant l'accent en fond. FLAG et non BLOCK, parce qu'un onglet ou un item de nav actif porte légitimement l'accent.
- **Bloc `hierarchy` dans le runner `ui-verify`** : titre dominant et sa taille, taille de corps la plus répandue (mode, pas première occurrence), ratio des deux, actions accent. Sans token d'accent résolu, la métrique reste absente et la règle passe en SKIPPED plutôt que de mentir.
- **Étape `ui_plan_protocol` dans `gsd-executor`** : sur un plan `ui: true` (ou dès qu'un fichier front est touché, la frontmatter pouvant précéder la règle), la conception passe par `Skill(se-ui)`. Improviser un cycle craft → critique → polish équivalent est explicitement interdit : le rapport est indiscernable d'une vraie passe alors qu'il saute le contrat, les 10 piliers et la mesure.
- **Frontmatter `ui` et section « Front Plans » dans `gsd-planner`** : un plan front sans contrat de design ne doit pas entrer en exécution, et chaque plan front se termine par une tâche de passe design non optionnelle.
- **Commande `se sync-project`** : rattrape un projet créé avant une évolution du scaffold — clés de config manquantes ajoutées, §2.1 insérée dans le contrat de design à sa place (entre §2 et §3). N'écrase jamais un choix explicite : une gate coupée reste coupée, elle est seulement signalée. `scaffold/` n'étant copié qu'au `se init`, sans cette commande un projet gardait ses trous pour toujours.

### Modifié
- `se-guard.test.cjs` 51 → 58 tests, `se-gates.test.cjs` 44 → 46, `ui-verdict.test.cjs` 39 → 47, `se.test.cjs` 42 → 54.

## [1.4.0] - 2026-08-17

### Modifié
- **Le modèle est une propriété de l'agent, plus d'un réglage global.** `CLAUDE_CODE_SUBAGENT_MODEL` est retiré de `settings.json` : cette variable s'appliquait à tous les sous-agents sans distinction et faisait tourner en Haiku des agents dont la tâche demande du raisonnement (planner, reviewers, verifier). Chaque agent porte désormais son `model:` dans son frontmatter, et chaque skill qui spawne un agent générique nomme son modèle à l'appel.
- **Table des profils GSD neutralisée** (`gsd-patches/lib/model-profiles.cjs`, nouveau patch) : les colonnes `quality`, `balanced` et `budget` portent la même valeur pour chaque agent, donc aucun profil ne peut downgrader un agent sous le tier que sa tâche exige. Opus partout où il faut décider, juger ou concevoir ; sonnet réservé au mécanique (codebase-mapper, research-synthesizer, user-profiler). `haiku` n'est le modèle d'aucun agent, et un agent absent de la table retombe sur sonnet.
- `scripts/install-gsd-patches.cjs` accepte une extension par cible et patche aussi `get-shit-done/bin/lib/`, pour que la politique de modèles survive à un `/gsd:update`.
- `/se-review` impose `model: "opus"` à ses deux sous-agents, `/se-research` à l'agent `researcher`, `/se-interview` choisit sonnet pour une recherche mécanique et opus dès qu'il faut juger.
- `CONVENTIONS.md` §9 écrit la règle et la table des tiers.

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
