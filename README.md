<div align="center">

# Simple &amp; Efficace

### Va vite sans laisser le projet pourrir derrière toi.

Un système complet pour [Claude Code](https://claude.com/claude-code) : des garde-fous qui s'exécutent tout seuls, et des skills qu'on invoque quand on a besoin d'un avis. Installé une fois par machine, partagé par tous les projets.

[![CI](https://github.com/PGADP/SimpleEfficace/actions/workflows/ci.yml/badge.svg)](https://github.com/PGADP/SimpleEfficace/actions/workflows/ci.yml)

`30 skills` · `10 garde-fous` · `153 tests` · `cycle GSD enrichi` · `UI mesurée` · `loi de rangement`

</div>

---

## Le problème

Sur mon projet précédent, le `STATE.md` avait atteint 10 000 lignes et 250 phases traînaient dans `phases/` sans avoir jamais été archivées. À côté de ça : des rapports d'audit posés à la racine, du copy de landing qui sentait le texte généré, et une interface partie toute seule vers `Inter` + dégradé violet parce que personne n'avait déclaré de direction.

Coder avec un agent va vite. C'est tout le reste qui ne suit pas.

Rien de ça n'arrive par négligence. Ça arrive parce qu'on a demandé à l'agent de s'en souvenir.

## L'idée

**Ce qui doit arriver ne dépend jamais de la mémoire de l'agent.**

| Type de règle | Comment le système la traite |
|---|---|
| Obligatoire (humaniser un texte visible, respecter le design-system, ranger un rapport) | Un **hook** que le harness exécute. Ni oubliable, ni contournable |
| Affaire de jugement (challenger une idée, trancher une archi, choisir une direction) | Un **skill** riche, qu'on invoque et avec qui on discute |

Ça se voit dans la durée. Au bout de 200 heures d'usage, le dépôt est encore lisible : pas parce que quelqu'un a fait le ménage, mais parce que rien n'a jamais pu se poser au mauvais endroit.

```
     ┌──────────────────────────────────────────────────┐
     │                                                  │
  cadrer ──→ discuter ──→ planifier ──→ construire ──→ vérifier ──→ livrer
     │           │            │             │              │
     │           │            │             │              └─ simplify · janitor
     │           │            │             │                 security · visuel mesuré
     │           │            │             └─ garde-fous à chaque écriture
     │           │            └─ recherche + plan relu avant d'écrire
     │           └─ décisions figées dans un fichier, pas dans le chat
     └─ PRD · recherches · roadmap · contrat de design
```

## « Dix garde-fous, ça a l'air pénible »

Sept d'entre eux se contentent de parler. Ils déposent un rappel que l'agent lit, et le travail continue sans interruption. Trois seulement bloquent, et sur des choses dont on ne discute pas : un secret dans un commit, du contenu généré non relu, un fichier d'état qui explose son plafond.

Les advisory se trompent parfois. `hardcode-guard` m'a signalé un « nombre magique » dans un script jetable de dix lignes, ce qui n'intéressait personne. C'est le prix du déterministe : il ne comprend pas le contexte, il applique. Les seuils vivent dans `~/.claude/se/hooks/rules/*.json` justement pour qu'on puisse les corriger quand ils crient trop.

Un garde-fou qui plante n'interrompt jamais rien : le contrat commun impose de sortir en silence plutôt que de coûter un tour.

## Installer (une fois par machine)

Le système vit dans `~/.claude/se/` et se partage entre tous les projets de la machine. Les projets, eux, ne contiennent que leurs données (`.planning/` + `CLAUDE.md`). Prérequis : le moteur [GSD Core](https://github.com/open-gsd/gsd-core) (paquet @opengsd/gsd-core), que les patches SE enrichissent à l'installation.

```bash
git clone https://github.com/PGADP/SimpleEfficace.git ~/.claude/se
node ~/.claude/se/se.cjs install
```

`install` copie les skills et agents dans `~/.claude/`, fusionne le câblage des hooks dans ton `settings.json` **sans toucher à ce qui s'y trouve** (backup horodaté automatique), applique les patches GSD, puis affiche un diagnostic. Relançable à volonté.

## Démarrer un projet

```bash
node ~/.claude/se/se.cjs init mon-projet
cd mon-projet
claude
```

Puis, dans Claude :

```
/se-new-project "mon idée de produit"
```

Le skill déroule le cadrage complet : accueil, brainstorming, PRD, recherches, roadmap, contrat de design. Les hooks et les gates qualité tournent déjà — et **seulement dans les projets SE** : dans n'importe quel autre dépôt de la machine, ils se taisent (la règle est simple : pas de `.planning/`, pas de garde-fou).

## Mettre à jour (une commande, tous les projets suivent)

```bash
node ~/.claude/se/se.cjs update
```

`update` tire la dernière version, réinstalle, rejoue les migrations de structure en attente et affiche les nouveautés du changelog entre ta version et la nouvelle. Il n'y a **rien à faire dans les projets** : ils utilisent le système global, ils sont à jour dès la commande terminée. Sur une autre machine, la même commande.

```bash
cd mon-projet && node ~/.claude/se/se.cjs sync-project
```

`sync-project` rattrape un projet **créé avant** une évolution du scaffold : il ajoute les clés de config manquantes et insère les sections de contrat de design apparues depuis. Il n'écrase jamais un choix explicite (une gate coupée reste coupée, elle est seulement signalée). Nécessaire parce que `scaffold/` n'est copié qu'au `se init` : sans cette commande, un projet garde ses trous pour toujours.

```bash
node ~/.claude/se/se.cjs doctor    # quelque chose cloche ? diagnostic complet, exit 1 si problème
```

> **Projet issu de l'ancien modèle** (le système cloné dans le repo) : ouvre-le dans Claude et lance `/se-migrate`. Inventaire, plan affiché, accord explicite, puis archivage — tout ce qui est retiré part dans `.planning/_archive/migration-{date}/`, tes skills à toi ne sont jamais touchés, et un seul commit revert-able porte l'opération.

## Le système au travail

Voilà ce que ça donne pendant une session ordinaire.

Tu poses un rapport d'audit à la racine du dépôt :

```
🛡️ [placement-guard] `RAPPORT-AUDIT.md` est à la racine du repo — un .md de suivi
   n'y a pas sa place ; soit il est éphémère (réponds en chat, n'écris rien),
   soit il va dans .planning/audits/{YYYY-MM-DD}-{type}-{slug}.md (CONVENTIONS §4)
```

Ton fichier d'état déborde :

```
⛔ size-gate : STATE.md ferait 341 lignes (plafond 300).
   Archive le passé avant d'écrire le présent.
```

Le compte de lignes ne suffit pas : 300 lignes de 1000 caractères coûtent autant de contexte que 3000 lignes normales. Deux autres plafonds mesurent le poids réel (20 000 caractères par fichier, 300 par ligne, les tableaux exemptés). Un fichier déjà trop gros reste modifiable tant que l'écriture ne l'alourdit pas : sinon la gate refuserait le ménage qu'elle réclame.

Une clé traîne dans le diff que tu t'apprêtes à commiter :

```
⛔ secret-gate : le diff stagé contient une clé API (OpenAI sk-...).
   Commit refusé. Ce hook est insensible au --no-verify.
```

Tu t'apprêtes à écrire un composant alors qu'aucune direction esthétique n'est déclarée :

```
⛔ ui-contract-gate : le contrat de design est encore un SQUELETTE
   (manque : §0.2 direction esthétique). Écriture refusée.
   Remplis DESIGN-SYSTEM.md avec l'humain avant toute ligne de front.
```

Tu commites de l'UI qui n'a pas été validée sur le rendu réel :

```
⛔ ui-gate : 2 fichiers front sans passe /se-ui valide.
   Checkpoint humain requis : donner l'URL de la page, attendre le GO,
   puis node scripts/ui-pass.cjs record <fichiers> --url <url> --go "<réponse>"
```

Ce sont des scripts que le harness exécute, pas des consignes que l'agent peut laisser passer.

## Les skills

<details>
<summary><b>Cadrage &amp; pilotage</b> — 10 skills</summary>

| Skill | Rôle |
|---|---|
| `/se-pilot` | Cofondateur : sparring, challenge, orchestration du cycle |
| `/se-interview` | Primitif d'interview : arbre de décision vidé par rounds, avant d'écrire quoi que ce soit |
| `/se-checkpoint` | Primitif de checkpoint : la forme unique de toute demande de GO, 4 points à juger maximum |
| `/se-new-project` | Démarrage complet d'un projet vierge, contrat de design inclus |
| `/se-planning` | Chef de projet : STATE/ROADMAP, briefings, arbitrages de séquençage |
| `/se-research` | Recherche web approfondie (quick/deep), rapport persistant et citable |
| `/se-brainstorm-light` | 20 idées ciblées en 10 minutes |
| `/se-brainstorm-heavy` | 60-80 idées, 61 techniques créatives, multi-session |
| `/se-archive` | Sort les phases shippées du chemin de travail et recale INDEX, ROADMAP et STATE, avec confirmation |
| `/se-migrate` | Migre un projet de l'ancien modèle (système cloné) vers l'installation globale — dry-run, zéro perte |

</details>

<details>
<summary><b>Conception &amp; interface</b> — 3 skills</summary>

| Skill | Rôle |
|---|---|
| `/se-ui` | Design-system, 10 piliers, cycle craft → critique → polish, verdict mesuré |
| `/se-ux` | Parcours E2E, personas, JTBD, heuristiques de Nielsen |
| `/se-humanizer` | Anti-AI-slop sur tout contenu qu'un humain verra |

</details>

<details>
<summary><b>Développement</b> — 15 skills</summary>

| Skill | Rôle |
|---|---|
| `/se-plan` · `/se-dev` · `/se-fix` | Concevoir · implémenter · corriger |
| `/se-review` (+ `lint`, `perf`) | Audit de code, rapport actionnable |
| `/se-test` · `/se-debug` | Vitest et Playwright · investigation méthodique d'un bug |
| `/se-refactor` · `/se-janitor` | Stratégie de dette · suppression du code mort |
| `/se-explain` | Pédagogie sur un morceau de code |
| `/se-security` | Audit sécurité, verdict GO/NO-GO |
| `/se-deploy` · `/se-health-check` | Gate avant push · diagnostic global du projet |
| `/se-clean-commit` | Découpe le travail en cours en commits atomiques |
| `/se-gate-simplify` · `/se-gate-janitor` | Gates du cycle : détecteur déterministe × jugement LLM |

</details>

## Les garde-fous

Sept scripts que `se install` câble dans ton `settings.json` global, dont un dispatcher qui porte sept détecteurs. Ils ne s'activent que dans les projets SE (présence de `.planning/`) et les critères vivent tous dans `~/.claude/se/hooks/rules/*.json`, où on peut les relire et les changer sans toucher au code.

| Garde-fou | Se déclenche sur | Ce qu'il fait | Bloque |
|---|---|---|---|
| `humanizer-guard` | contenu visible par un humain | réclame `/se-humanizer` (7 familles de marqueurs) | non |
| `ui-guard` | édition front | rappelle le rituel design ; alerte si le contrat est vide | non |
| `hardcode-guard` | code source | valeurs et listes en dur | non |
| `hygiene-guard` | code source | `console.log`, blocs de code commentés | non |
| `monolith-guard` | code source | fichiers et exports trop gros | non |
| `security-guard` | code source | secrets, XSS, `eval`, route API sans Zod | non |
| `placement-guard` | `.md` de suivi | fichier rangé hors de sa destination unique | non |
| `size-gate` | écriture STATE/ROADMAP | refuse au-delà de 300 lignes, 20 000 caractères ou 300 caractères sur une ligne — et seulement si l'écriture aggrave | **oui** |
| `slop-gate` | `git commit` | refuse le contenu généré non relu | **oui** |
| `secret-gate` | `git commit` | refuse un secret dans le diff, malgré `--no-verify` | **oui** |
| `ui-contract-gate` | écriture de code front | refuse tant que DESIGN-SYSTEM.md §0 et §2.1 (hiérarchie visuelle) ne sont pas remplis ; injecte le plancher de qualité impeccable à la 1ʳᵉ édition front de la session | **oui** |
| `ui-gate` | `git commit` de fichiers front | refuse sans passe `/se-ui` validée : anti-patterns mesurés + GO humain avec URL (registre `ui-passes.json`) | **oui** |
| `server-reaper` | fin de session | tue les process longs que Claude a enregistrés (`se-serve.cjs`) — jamais ceux lancés par l'humain | — |

```bash
cd ~/.claude/se
node hooks/se-guard.test.cjs     # 63 tests — détecteurs + activation hors projet SE
node hooks/se-gates.test.cjs     # 46 tests — gates bloquantes
node scripts/ui-verdict.test.cjs # 47 tests — moteur de verdict UI + cascade
node scripts/se.test.cjs         # 56 tests — CLI install/init/doctor/merge
node scripts/se-serve.test.cjs   # 20 tests — registre des process longs + reaper
```

## Le contrat de design vient avant le premier composant

Un agent sans direction esthétique déclarée glisse toujours au même endroit : `Inter`, dégradé violet, cartes arrondies, ombres douces. C'est le défaut par gravité, et c'est devenu la signature visuelle du contenu généré.

Alors sur un projet avec interface, `/se-new-project` ne passe pas l'étape du contrat de design. Trois blocs se remplissent avec toi avant la première ligne de front :

| Bloc | Ce que ça verrouille |
|---|---|
| **§0.1 Plateforme** | `web` · `macos` · `ios` · `android`… Détermine quel corpus de règles fait foi. Un desktop conçu comme une page web est un desktop raté |
| **§0.2 Direction** | Son nom, ce qu'elle doit faire ressentir et à qui, l'anti-référence, le registre. Une direction se choisit, elle ne se découvre pas en codant |
| **§0.3 Molettes** | `DESIGN_VARIANCE` · `MOTION_INTENSITY` · `VISUAL_DENSITY`, de 1 à 10. « C'est trop chargé » devient « baisse VISUAL_DENSITY à 4 » |

Les tokens précis attendent la phase fondations : ils se corrigent sans douleur. La direction coûte cher à changer une fois le premier composant écrit.

Ensuite, tout ce qui produit du code visible lit ce contrat avant d'écrire : `/se-dev`, `/se-fix`, et `gsd-executor`, l'agent qui fabrique réellement les composants pendant une phase. Ils appliquent un contrat au lieu d'en inventer un. Tant qu'il reste vide, chaque édition front le rappelle :

```
🛡️ [ui-guard] Édition front alors que DESIGN-SYSTEM.md est encore un SQUELETTE.
   Manque : §0.1 plateforme cible, §0.2 direction esthétique.
   Sans direction déclarée, le checkpoint visuel BLOQUERA.
```

Sur une stack sans interface (CLI, librairie, API pure), toute l'étape est sautée.

## L'UI ne se juge pas à l'œil

Un checkpoint qui affiche trois captures et demande « c'est bon ? » ne vérifie rien. Or les cinq échecs d'accessibilité les plus fréquents — contraste, `alt` manquant, liens vides, labels de formulaire, `lang` absent — se détectent tous automatiquement. Le système sépare donc ce qui se mesure de ce qui se juge.

```
UI_ROUTE=/dashboard UI_NAME=dashboard npx playwright test tests/e2e/ui-verify.spec.ts
node ~/.claude/se/scripts/ui-verdict.cjs --name dashboard
```

```
Verdict UI — dashboard (3 rapports : desktop, tablet, mobile)

  BLOCK 2   FLAG 1   PASS 22   à juger 10   non mesuré 1

BLOCK — à corriger avant livraison
  [spacing] spacing-touch-target
    Cible interactive ≥ 44×44px (WCAG 2.5.5 / Apple HIG)
    mesuré : button « Fermer » — 24×24px
  [accessibility] a11y-page-lang
    L'attribut lang est déclaré sur <html>
    mesuré : false   attendu : isTrue

VERDICT : NO-GO
```

Un seul runner produit tout : violations WCAG 2.2 AA via axe-core, tailles et poids typographiques réellement rendus, espacements hors grille, cibles tactiles, débordements horizontaux, focus visible, pièges au clavier, animations sous `prefers-reduced-motion`, Core Web Vitals. Il extrait aussi tous les textes affichés, qui partent directement dans `/se-humanizer`, y compris ceux venus de composants tiers, qu'une relecture de code rate systématiquement.

Ce que la machine ne dira jamais, l'humain le tranche : *la direction esthétique est-elle visible, ou seulement déclarée ? Où l'œil se pose-t-il en premier ?*

Deux principes protègent la gate de sa propre rigidité :

- **Une métrique absente donne SKIPPED, jamais BLOCK.** On ne refuse pas une livraison sur ce qu'on n'a pas su mesurer.
- **Entre breakpoints, le pire cas gagne.** Une UI cassée sur mobile est une UI cassée.

Un BLOCK arrête la livraison (`workflow.ui_gate_blocking`, réglable), sauf exception écrite avec sa raison. Aucune exception ne rétrograde quoi que ce soit sur l'accessibilité, le copywriting ou la provenance des composants.

<details>
<summary><b>Les corpus de design vendorisés</b></summary>

`vendor/design/` porte un sous-ensemble curaté de trois corpus open-source, aux versions épinglées et jamais édités à la main. Les deux moteurs embarqués n'ont aucune dépendance (Node natif, Python stdlib) : tout fonctionne dès le clone, hors ligne. Licences et attributions dans `NOTICE.md`.

| Corpus | Rôle | Quand |
|---|---|---|
| **impeccable** | Langage de design (34 playbooks) + détecteur déterministe d'anti-patterns | Écrire, critiquer, polir, juger |
| **platform-design-skills** | Apple HIG · Material 3 · WCAG 2.2, sur 8 plateformes | Conformité — seul corpus couvrant le desktop |
| **ui-ux-pro-max** | Bases de direction (styles, palettes, pairings) + moteur BM25 | Bootstrap seulement : il génère un design-system, il n'en juge aucun |

Ils se chargent à la demande, une référence par tâche, selon la table de routage de `~/.claude/se/references/design/README.md`. Tout charger d'un coup coûterait des dizaines de milliers de tokens et diluerait les instructions.

```bash
node ~/.claude/se/scripts/sync-design-vendors.cjs --check   # y a-t-il du drift upstream ?
```

La synchro reste manuelle par choix : ces dépôts bougent vite, et une mise à jour automatique changerait le comportement des gates sans que personne ne l'ait décidé.

</details>

## La loi de rangement

Un système qui écrit des fichiers en produit vite plus qu'on n'en range. [`CONVENTIONS.md`](CONVENTIONS.md) — livré avec le système, surchargeable par projet — est la source unique de l'arborescence : une destination par type d'artefact, des noms de fichiers invariants, et `placement-guard` qui alerte dès qu'un fichier dévie.

La règle qui pèse le plus lourd sur la durée : **un rapport ne s'écrit sur disque que s'il sera relu.**

| Durée de vie | Qui | Où |
|---|---|---|
| Éphémère — verdict consommé en séance | `/se-review`, `/se-test`, `/se-deploy`, `/se-health-check`… | **Rien.** Chat + `TodoWrite` |
| Liée à une phase | gates SIMPLIFY, JANITOR, SECURITY, checkpoint visuel | `phases/{NN}-{slug}/CHECKPOINTS.md`, qui part à l'archive avec la phase |
| Transverse et persistante | `/se-security` (audit complet), `/se-ux` (audit), `/gsd-ui-review` | `.planning/audits/{YYYY-MM-DD}-{type}-{slug}.md` |

Trois mécanismes d'anti-entropie complètent le dispositif : les plafonds durs de `size-gate`, l'archivage des phases shippées par `/se-archive`, et `INDEX.md` maintenu en continu à la clôture de chaque phase. On lit `INDEX.md` pour s'orienter, jamais un `grep` à l'aveugle.

Ranger n'est pas oublier. Une phase archivée laisse trois traces, sans quoi elle deviendrait un chemin mort : son entrée passe de « Phases actives » à « Phases archivées » dans `INDEX.md`, elle se condense en une ligne d'empreinte de 80 caractères sous `## Phases livrées` dans `ROADMAP.md`, et les chemins qui la citaient sont réécrits dans `STATE.md`. Les agents qui cherchent le passé lisent `INDEX.md` et fouillent `_archive/phases/`, jamais `phases/` seul, qui ne contient que l'actif.

## Anatomie

Le dépôt (installé dans `~/.claude/se/`) porte le **système** ; chaque projet ne porte que ses **données**. La frontière est le cœur du modèle : ce qui est identique partout vit en un seul exemplaire et se met à jour d'un `se update` ; ce qui appartient au projet n'est jamais touché par une mise à jour.

```
~/.claude/se/               LE SYSTÈME — un exemplaire par machine
├── se.cjs                  # CLI : install · update · init · sync-project · doctor
├── VERSION · CHANGELOG.md  # semver + nouveautés affichées par update
├── migrations/             # scripts rejoués par update entre deux versions
├── hooks/                  # garde-fous .cjs + rules/*.json (critères en données)
├── scripts/                # ui-verdict · sync-design-vendors · install-gsd-patches
├── gsd-patches/            # workflows + agents GSD enrichis
├── vendor/design/          # corpus de design épinglés, jamais édités à la main
├── rules/ui-rules.json     # 10 piliers, 36 règles — défaut système, surchargeable
├── references/ templates/  # savoir design + gabarits Playwright, à la demande
├── CONVENTIONS.md          # la loi de rangement
├── scaffold/               # la semence : ce que `se init` pose dans un projet
└── .claude/commands/       # 30 skills /se-* → copiés dans ~/.claude/commands/

mon-projet/                 UN PROJET — ses données, rien d'autre
├── CLAUDE.md
├── .planning/              # contrat de design rempli, personas, parcours,
│                           # phases, state, audits, surcharges éventuelles
└── src/ …
```

Un projet peut surcharger un défaut système (ses seuils `ui-rules.json`, par exemple) en créant sa copie dans `.planning/rules/` : la copie projet gagne toujours, et un projet qui ne surcharge rien profite de chaque mise à jour sans lever le petit doigt.

## Ce que ce n'est pas

Un outil multi-langage. Le cœur (rangement, garde-fous, cycle) fonctionne partout, mais les détecteurs et le dispositif UI visent **Next.js 15 · React 19 · TypeScript · Tailwind**, avec Railway, Postgres ou Supabase, Prisma, Vitest et Playwright autour.

Un produit fini avec une communauté et un support. C'est un système personnel, publié parce qu'il peut servir à d'autres.

## Philosophie

- **Automatique plutôt que consigne.** Un hook garantit ; une instruction espère.
- **Déterministe et LLM, croisés.** Un script objectif tranche, le modèle nuance, la synthèse signale les faux positifs.
- **On mesure au lieu de juger à l'œil.** Le checkpoint visuel produit des métriques croisées avec `ui-rules.json`.
- **Anti-entropie par défaut.** Des plafonds durs et un archivage gaté : rien ne gonfle sans limite.
- **Source unique.** Chaque critère vit dans une donnée que lisent celui qui propose et celui qui vérifie.
- **Une métrique absente ne bloque jamais.** On ne refuse pas ce qu'on n'a pas su mesurer.

La conception détaillée est dans [`docs/SYSTEME.md`](docs/SYSTEME.md).

## Crédits

Ce système est un travail de cherry-picking : il assemble et adapte plusieurs projets open-source remarquables. Rien n'a été réinventé là où l'existant était bon. Merci à leurs auteurs.

<details>
<summary><b>Les huit sources et ce qu'on en a tiré</b></summary>

| Source | Auteur | Ce qu'on en a tiré |
|---|---|---|
| [gsd-core](https://github.com/open-gsd/gsd-core) | open-gsd | Le moteur GSD : cycle par phases, workflows, sous-agents, checkpoints |
| [ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | nextlevelbuilder | Le format de règles UI externalisées, le pattern MASTER+overrides, les bases de direction |
| [impeccable](https://github.com/pbakaus/impeccable) | Paul Bakaus | Le pattern détecteur déterministe × jugement LLM, le contrat des hooks, le langage de design |
| [platform-design-skills](https://github.com/ehmo/platform-design-skills) | ehmo | Les critères de design par plateforme : web, desktop, mobile |
| [taste-skill](https://github.com/leonxlnx/taste-skill) | Leonxlnx | Les trois molettes `DESIGN_VARIANCE` / `MOTION_INTENSITY` / `VISUAL_DENSITY` |
| [hyperresearch](https://github.com/jordan-gibbs/hyperresearch) | Jordan Gibbs | L'orchestrateur mince à étapes lazy, les 4 APIs académiques, la méthodo de recherche |
| [humanizer](https://github.com/blader/humanizer) | Siqi Chen (blader) | La règle des clusters anti-faux-positifs et les patterns AI-slop récents |
| [claude-code-best-practice](https://github.com/shanraisshan/claude-code-best-practice) | shanraisshan | Les patterns d'orchestration, la token efficiency, la gestion de contexte |

Corpus vendorisés dans `vendor/design/` : versions épinglées dans `VERSIONS.json`, licences et attributions dans `NOTICE.md`.
Méthodologie humanizer basée sur [Wikipedia: Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing) (WikiProject AI Cleanup).

</details>

Construit avec [Claude Code](https://claude.com/claude-code).
