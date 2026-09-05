<!-- GLOSSARY.md : le vocabulaire du système Simple & Efficace. Un concept, le mot retenu, -->
<!-- les synonymes bannis. Écrit au fil de l'eau par /se-interview dès qu'un terme est tranché. -->
<!-- Lu par pilot:briefing en ouverture de séance et par gsd-executor avant d'écrire. -->
<!-- Aucun détail d'implémentation : ni spec, ni bloc-notes. -->

# Glossaire

> Ce dépôt est le système Simple & Efficace lui-même : skills, hooks, scripts et corpus de design, installés une fois par machine et mis à jour par `git pull`. Les termes ci-dessous nomment ses pièces, pas celles d'un projet applicatif.

## Langue

### Le système et son installation

**Système** :
Tout ce qui vit à la racine du dépôt et se met à jour par `git pull` : `hooks/`, `scripts/`, `vendor/`, `references/`, `templates/`, `rules/`, `gsd-patches/`, `CONVENTIONS.md`. Jamais dupliqué dans un projet.
_Éviter_ : framework, outil, template

**Scaffold** :
La semence projet (`scaffold/`), copiée une seule fois par `se init` dans un nouveau projet. Après la copie elle appartient au projet, le système ne la retouche plus.
_Éviter_ : boilerplate, starter, modèle

**Skill** :
Une capacité invocable par `/nom`. Le fichier vit dans `.claude/commands/` pour des raisons de harness, ce qui est un détail d'implémentation sans effet sur le vocabulaire.
_Éviter_ : commande, slash command, prompt

**Primitif** :
Un skill qui impose une forme plutôt qu'un travail, appelé par les autres : `/se-checkpoint` (la forme d'une demande de GO), `/se-interview` (la forme d'un interrogatoire).
_Éviter_ : helper, utilitaire

**Moteur** :
GSD Core (`@opengsd/gsd-core`), installé globalement dans `~/.claude/gsd-core/`, qui porte le cycle de phase. Le système ne le remplace pas, il le **patche**.
_Éviter_ : GSD tout court, framework de phases

**Patch** :
Un fichier de `gsd-patches/` qui remplace son homologue du moteur global, appliqué par `install-gsd-patches.cjs`. L'original est sauvé en `.orig`.
_Éviter_ : override, surcharge, fork

### Le cycle de travail

**Milestone** :
Un cycle de livraison versionné (`vX.Y`) : un lot d'exigences dans `REQUIREMENTS.md`, les phases qui les servent, et l'archive `_archive/milestones/{vX.Y}/` quand il se clôt. Ouvert par `/gsd-new-milestone`, fermé par `/gsd-complete-milestone`. Ce sont ses exigences qui le définissent, ni ses dates ni son nombre de phases. La numérotation des phases ne repart pas à 1 d'un milestone au suivant.
_Éviter_ : release, version, sprint, lot

**Jalon** :
Une échéance datée du planning, que `/se-planning` surveille et qu'un retard menace. Un milestone peut en être un, une deadline business aussi : le mot ne dit pas laquelle, donc préciser dès que ça compte.
_Éviter_ : milestone (les deux ne sont pas interchangeables), deadline

**Phase** :
Une unité de travail planifiée, numérotée, avec son dossier `.planning/phases/{NN}-{slug}/` et ses artefacts à noms fixes. Le format long : elle se discute, se planifie, s'exécute, se vérifie.
_Éviter_ : sprint, ticket, chantier, epic

**Plan** :
Un fichier `PLAN.md` d'une phase : les tâches, leurs dépendances, leur découpage en vagues. Une phase en porte un ou plusieurs.
_Éviter_ : spec, backlog

**Vague** :
Le groupe de plans qu'`execute-phase` lance en parallèle parce qu'aucun ne dépend d'un autre. Les vagues s'enchaînent, les plans d'une même vague non.
_Éviter_ : batch, lot, wave

**Quick** :
Le format court, une à deux heures, avec les garanties de commits atomiques et de suivi mais sans les agents optionnels. En dessous il y a `fast`, trivial et sans sous-agent.
_Éviter_ : petite tâche, hotfix

**Gate** :
Un point de passage qui peut arrêter le travail. Deux emplois à ne pas confondre, toujours qualifier lequel : une **gate de cycle** (SIMPLIFY, JANITOR, SECURITY, PROMPT) est une étape consultative entre VERIFY et SHIP ; une **gate de hook** (`slop-gate`, `secret-gate`, `size-gate`, `ui-gate`, `ui-contract-gate`) est mécanique et refuse l'outil.
_Éviter_ : contrôle, validation, quality gate

**Garde-fou** :
Le nom collectif des hooks, toutes catégories. Un **guard** rappelle sans bloquer (`ui-guard`, `hygiene-guard`), une **gate** bloque.
_Éviter_ : linter, règle, safeguard

**Checkpoint** :
Une demande de jugement humain, de forme imposée : ce qui est fait, ce que la machine a mesuré, les points à juger à l'œil, où regarder, une question fermée. Ce que la machine sait mesurer n'y figure jamais comme point à juger.
_Éviter_ : validation, revue, approbation

**Passe** :
Un cycle craft, critique, polish sur une interface, clos par un GO humain sur une URL réelle et enregistré dans `ui-passes.json`. Sans passe enregistrée, `ui-gate` refuse le commit du front.
_Éviter_ : itération, review UI

**Contrat** :
Un document qui fait autorité sur un domaine et qui se lit **avant** d'écrire : `DESIGN-SYSTEM.md` pour le visuel, `JOURNEYS.md` pour les parcours, `CONVENTIONS.md` pour le rangement.
_Éviter_ : guideline, doc de référence, charte

**Molettes** :
Les réglages esthétiques déclarés en §0.3 du design-system (densité, rondeur, contraste, etc.), qu'un projet fixe une fois et que tout le front respecte ensuite.
_Éviter_ : paramètres, variables de design, knobs

### Les documents de suivi

**Registre** :
Un document qui accumule une ligne par entrée et ne se résume jamais : `PHASES.md` pour le livré, `ui-passes.json` pour les passes UI. Il grandit avec le projet, c'est sa fonction.
_Éviter_ : historique, log, journal

**Empreinte** :
La ligne unique qu'une phase livrée laisse dans `PHASES.md` quand `/se-archive` la sort du chemin de travail.
_Éviter_ : résumé, entrée

**Anti-entropie** :
La famille de mécanismes qui empêchent le suivi de pourrir : plafonds durs du `size-gate`, archivage par `/se-archive`, `INDEX.md` maintenu en continu, `PHASES.md` sans plafond.
_Éviter_ : maintenance, nettoyage, housekeeping

**Frontière** :
Dans une interview, l'ensemble des décisions dont les prérequis sont réglés, donc posables maintenant sans deviner. Une question qui dépend d'une autre question du round en cours appartient au round suivant.
_Éviter_ : liste de questions, backlog de questions

## Invariants

- Le dépôt **est** l'installation live : `~/.claude/se` est une jonction vers lui. Une modif de `references/`, `rules/`, `templates/`, `scripts/` ou `CONVENTIONS.md` est active immédiatement, sans installation.
- `CONVENTIONS.md` fait autorité sur l'arborescence. Une destination unique par type d'artefact, et rien de nouveau à la racine de `.planning/` sans l'y déclarer **et** dans `placement-rules.json`.
- `vendor/` ne s'édite jamais à la main : le contenu vient des upstreams via `sync-design-vendors.cjs`.
- Un rapport ne s'écrit sur disque que s'il sera relu. Éphémère, il reste dans le chat.
- Français pour tout ce que l'humain lit, anglais pour le technique (noms de fichiers, code, commandes, commentaires).

## Pièges connus

- **Éditer `.claude/commands/` ne suffit pas.** `se install` **copie** vers `~/.claude/commands/` : sans la commande, la modif reste invisible au runtime. Les autres dossiers, eux, sont lus en place via la jonction.
- **`CONTEXT.md` est déjà pris** par les décisions figées d'une phase (`phaseFileAllow`). Ne jamais créer d'homonyme à la racine de `.planning/`.
- **Une évolution du `scaffold/` n'atteint pas les projets existants**, puisqu'il n'est copié qu'au `se init`. Le rattrapage est `se sync-project`, et il faut y penser à chaque ajout de document de suivi.
- **Comparer les chemins par leur valeur littérale échoue** quand une jonction est en jeu : passer par `fs.realpathSync` avant toute comparaison de chemin.
