# SIMPLE & EFFICACE — Document de conception du système

> Système de pilotage de développement personnel, conçu pour **Paul** (Next.js / Tailwind / Railway / Postgres / Prisma / Vitest, auth Supabase ou BetterAuth).
> Successeur du système GSD + Pilot de My Mozaica. Objectif : **lourd quand il faut, invisible le reste du temps. Propre par mécanique, pas par vigilance.**
>
> Statut : CONSTRUIT (v1.0.0). Le système décrit ici est implémenté (hooks, gates, skills, patches GSD) ; ce fichier reste la référence du design et est maintenu aligné sur le réel.
> Dernière mise à jour : 2026-08-04.
>
> **Modèle de distribution (v1.0.0)** : le repo n'est plus un template qu'on clone par projet — il s'installe **une fois par machine** dans `~/.claude/se/` (`node se.cjs install`) et tous les projets le partagent. Un projet ne contient que ses données (`.planning/` + `CLAUDE.md`), semées par `se init` depuis `scaffold/`. Mise à jour : `se update` (git pull + réinstall + migrations + changelog) — rien à faire dans les projets. Les hooks sont câblés globalement et ne s'activent que dans les projets porteurs d'un `.planning/` ; les défauts système (`rules/ui-rules.json`, `CONVENTIONS.md`) sont surchargeables par copie projet, la copie projet gagnant toujours. Migration d'un projet de l'ancien modèle : `/se-migrate` (dry-run, archivage, zéro perte).
>
> **Méthode imposée par Paul : CHERRY-PICKING, pas from-scratch.** On relit l'existant (GSD, ui-ux-pro-max, impeccable, hyperresearch, skills perso), on l'adapte à la nouvelle structure, on vérifie que l'ensemble tient. On ne recrée RIEN de zéro. Sources clonées dans `_sources/`.

---

## Table des matières

1. [Les 8 principes fondateurs](#1-les-8-principes-fondateurs)
2. [L'architecture en 5 strates](#2-larchitecture-en-5-strates)
3. [Strate A — Les garde-fous (hooks mécaniques)](#3-strate-a--les-garde-fous)
4. [Strate B — Le Cofondateur (Pilot)](#4-strate-b--le-cofondateur)
5. [Strate C — Le cycle de phase](#5-strate-c--le-cycle-de-phase)
6. [Strate D — Les moteurs partagés](#6-strate-d--les-moteurs-partagés)
7. [Strate E — Les spécialistes](#7-strate-e--les-spécialistes)
8-10. [Arborescence, nommage, anti-entropie](#8-9-10-arborescence-nommage-anti-entropie) → source unique : [.planning/CONVENTIONS.md](../.planning/CONVENTIONS.md)
11. [Les checkpoints humains repensés](#11-les-checkpoints-humains-repensés)
12. [La stack & les défauts projet](#12-la-stack--les-défauts-projet)
13. [Inventaire des skills](#13-inventaire-des-skills)
14. [Plan de construction](#14-plan-de-construction)

---

## 1. Les 8 principes fondateurs

1. **Ce qui DOIT arriver ne dépend pas de la mémoire de Claude.** Obligatoire = hook mécanique. Jugement = skill riche. On ne mélange jamais.
2. **Lourd quand il faut, invisible sinon.** La machine reste grosse pour le complexe, mais ne *coûte* gros que quand elle *travaille* gros.
3. **Tout est rangé et lié, jamais greppé.** Un chemin prévisible par type d'artefact. Un index. Zéro recherche à l'aveugle.
4. **Anti-entropie par défaut.** Plafond de taille sur les fichiers d'état + archivage automatique gaté. Rien ne grossit sans limite.
5. **Vérifier = déterministe + LLM, croisés.** Un script objectif tranche (exit 0/2), le LLM nuance, la synthèse signale les faux positifs. Pas d'agent qui juge seul à l'aveugle.
6. **Moins de scripts, plus de manuel intelligent.** Le déterministe sert là où il est imbattable (hardcode, slop, contraste). Le fonctionnel privilégie le test manuel guidé (« ouvre, regarde, valide »).
7. **Checkpoints visuels et décisionnels.** L'humain ne fait que le jugement (visuel, UX, GO/NO-GO). Claude automate tout le reste. Au bon moment, pas en bloc à la fin.
8. **Source unique pour les règles.** Critères UI, marqueurs slop, patterns de code mort : un fichier de données lu par celui qui propose ET celui qui vérifie.

---

## 2. L'architecture en 5 strates

```
┌─ STRATE A — GARDE-FOUS (hooks, MÉCANIQUES, invisibles) ─────────────┐
│  Code que le harness exécute, pas Claude. Ne peut être ni oublié    │
│  ni contourné.                                                       │
│  • ui-guard       → édition front sans design-system/UI-spec : rappel│
│  • humanizer-guard→ contenu user-facing : EXIGE /se-humanizer        │
│  • hygiene-guard  → après Edit : souffle code mort / imports / log   │
│  • hardcode-guard → après Edit : détecte valeurs hardcodées          │
│  • monolith-guard → après Edit : souffle les god services            │
│  • security-guard → après Edit : secrets/XSS/eval/Zod manquant       │
│  • slop-gate      → au commit : BLOQUE si marqueurs AI non traités   │
│  • secret-gate    → au commit : BLOQUE si secret dans le diff        │
│  • size-gate      → écriture STATE/ROADMAP : BLOQUE si trop long     │
│  • ui-contract-gate→ écriture front : BLOQUE sans design-system §0   │
│  • ui-gate        → commit front : BLOQUE sans passe /se-ui + GO     │
└──────────────────────────────────┬───────────────────────────────────┘
                                   │ garantissent en continu
┌─ STRATE B — LE COFONDATEUR (/se-pilot, RICHE) ─────────────────────────┐
│  Sparring, challenge, vision, "teste tes idées". INTACT.            │
│  Routeur mince à l'intérieur : modes lourds = sous-skills lazy.     │
└──────────────────────────────────┬───────────────────────────────────┘
                                   │ dispatche vers
┌─ STRATE C — LE CYCLE DE PHASE ──────────────────────────────────────┐
│  SCOUT → DISCUSS → RESEARCH → PLAN(+TDD) → CHECK → EXECUTE →         │
│  VERIFY → SIMPLIFY → JANITOR → SECURITY → SHIP                       │
│  Chaque flèche = un artefact rangé. Checkpoints visuels aux gates.  │
└──────────────────────────────────┬───────────────────────────────────┘
                                   │ s'appuie sur
┌─ STRATE D — MOTEURS PARTAGÉS ───────────────────────────────────────┐
│  • Recherche unifiée 4 niveaux (code / web / science / projets)     │
│  • Banques de règles : design-system, ui-rules, slop-rules,         │
│    code-rules, personas-ux  → source unique propose+vérifie         │
└──────────────────────────────────┬───────────────────────────────────┘
                                   │ alimentent
┌─ STRATE E — SPÉCIALISTES ───────────────────────────────────────────┐
│  Cofondateur-sparring · UX-expert(personas) · UI· Humanizer v2      │
│  Recherche · skills projet          │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 3. Strate A — Les garde-fous

Un hook = script déclaré dans `settings.json`, lancé par le harness sur un événement. Il rend un `additionalContext` (system-reminder que Claude voit forcément) ou **bloque** (`permissionDecision: deny` en PreToolUse). Claude ne peut ni l'oublier ni l'ignorer.

**Contrat commun (volé à impeccable) :** jamais casser un tour · exit 0 sauf gate explicite · garde de ré-entrance (variable d'env de profondeur) · timeout 5s · audit-log optionnel.

| Hook | Événement | Déclencheur | Action | Bloquant ? |
|------|-----------|-------------|--------|------------|
| **humanizer-guard** | `PostToolUse` Edit/Write | fichier user-facing (heuristique chemin + contenu FR) | system-reminder : « passe /se-humanizer avant de finir » | non (rappel) |
| **slop-gate** | `PreToolUse` Bash (`git commit`) | contenu user-facing à commiter avec marqueurs `slop-rules` | refuse le commit | **oui** |
| **ui-guard** | `PostToolUse` Edit/Write | `.tsx`/`.css`/composant front | si pas de design-system lu OU pas d'UI-spec de phase → rappel ; sinon lance détecteur déterministe (contraste, tailles) | non (rappel) |
| **hardcode-guard** | `PostToolUse` Edit/Write | code source | détecte valeurs magiques / listes hardcodées (cf. règle CLAUDE.md) | non (rappel) |
| **hygiene-guard** | `PostToolUse` Edit | code source | scan rapide imports inutilisés / console.log / code mort | non (rappel) |
| **monolith-guard** | `PostToolUse` Edit/Write | code source | seuils fichier/exports (`monolith-thresholds.json`) — souffle les god services | non (rappel) |
| **security-guard** | `PostToolUse` Edit/Write | code source | secrets en dur, XSS, eval, route API sans Zod | non (rappel) |
| **placement-guard** | `PostToolUse` Edit/Write | fichier `.md` de suivi | `.md` à la racine du repo, à la racine de `.planning/`, dans un dossier non déclaré, ou nom de rapport hors destination (`placement-rules.json`) | non (rappel) |
| **secret-gate** | `PreToolUse` Bash (`git commit`) | secret dans le diff à commiter (`secret-patterns.json`) | refuse le commit (insensible au `--no-verify`) | **oui** |
| **size-gate** | `PreToolUse` Edit/Write | STATE.md / ROADMAP.md | si dépasse un plafond (lignes, caractères, largeur) **et** aggrave l'existant → refuse + exige archivage | **oui** |
| **ui-contract-gate** | `PreToolUse` Edit/Write | code front (`.tsx`/`.jsx`/`.css`) | refuse tant que DESIGN-SYSTEM.md §0 (plateforme, public cible, direction, molettes) ou §2.1 (hiérarchie visuelle) est absent ou squelette ; contrat rempli → injecte le craft-floor impeccable + le §0 du contrat à la 1ʳᵉ édition front de la session (`workflow.ui_contract_gate`) | **oui** |
| **ui-gate** | `PreToolUse` Bash (`git commit`) | fichiers front stagés | refuse si anti-patterns mesurés (détecteur impeccable sur le contenu stagé) OU passe `/se-ui` absente/périmée/sans GO humain (registre `.planning/design/ui-passes.json`, écrit par `scripts/ui-pass.cjs` seul, `workflow.ui_commit_gate`) | **oui** |

L'archivage des phases shippées n'est pas un hook : c'est le skill **`/se-archive`** (confirmation humaine avant tout déplacement de dossier).

**Note d'implémentation :** les hooks sont des scripts Node `.cjs` (`hooks/`), thin adapters stdin/stdout ; les 7 détecteurs advisory vivent dans `guard-lib.cjs` (testable, dispatché par `se-guard.cjs`), les 5 gates bloquantes sont des scripts dédiés. Peu de scripts : un dispatcher unique pour l'advisory, pas un script par détecteur.

**Le rituel UI est fermé mécaniquement, aux deux bouts.** En amont, `ui-contract-gate` interdit d'écrire du front sans direction déclarée et injecte le plancher de qualité avant le premier jet (l'information arrive AVANT l'écriture, pas en review). En aval, `ui-gate` interdit de commiter du front qui n'a pas été validé par un humain sur le rendu réel : la passe n'existe que si `ui-pass.cjs record` a reçu l'URL regardée et le GO explicite, et elle se périme au moindre re-edit (hash du contenu). Entre les deux, le checkpoint visuel du cycle mesure (Playwright + ui-verdict). Un serveur dev lancé pour un checkpoint est tué à la fin du checkpoint, GO ou pas.

---

## 4. Strate B — Le Cofondateur

**Ce qui ne change PAS (le cœur de la valeur) :**
- Persona cofondateur technique : challenge systématique, avis tranchés, vision produit, « teste tes idées », honnêteté, pédagogie.
- Le réflexe « est-ce déjà fait / déjà planifié ? » avant d'agir.
- Les 4 modes (briefing, conversation/sparring, clôture, discussion stratégique).

**Ce qui change (la plomberie) :**
- `/se-pilot` devient un **routeur mince**. Le mode Conversation (sparring) se charge instantané. Les modes lourds (briefing, clôture) = sous-skills `user-invocable: false` chargés à la demande.
- Le briefing lit **un seul** `STATE.md` consolidé (plafonds dans CONVENTIONS.md), pas la cascade STRATEGY→ROADMAP→STATE.

**Ouvert à décider avec Paul :** garder le sparring DANS `/se-pilot`, ou en faire un skill cofondateur dédié appelé par Pilot. (Paul a évoqué cette option.)

---

## 5. Strate C — Le cycle de phase

| # | Étape | Origine | Nouveauté |
|---|-------|---------|-----------|
| 1 | **SCOUT** (code local) | GSD (existe) | Amplifié : map plus profonde avant discuss |
| 2 | **DISCUSS** | GSD + sparring | On décide ici les features TDD-éligibles |
| 3 | **RESEARCH** | GSD | Branché sur la recherche unifiée 4 niveaux |
| 4 | **PLAN (+TDD)** | GSD (à activer) | `tdd_mode` ON, tests = artefact de plan |
| 5 | **CHECK** | GSD | plan-checker, inchangé |
| 6 | **EXECUTE** | GSD | vagues + gate MVP+TDD (bloque code sans test rouge) |
| 7 | **VERIFY** | GSD (upgrade) | déterministe (exit 0/2) + LLM, isolés puis croisés |
| 8 | **SIMPLIFY** | 🆕 gate | détecteur duplication/complexité + LLM |
| 9 | **JANITOR** | 🆕 gate | code mort + hardcode, déterministe + LLM |
| 10 | **SECURITY** | 🆕 gate | audit /se-security si la phase touche auth/API/DB — CRITICAL bloquant |
| 11 | **SHIP** | GSD + slop-gate + secret-gate | commit propre → PR → archivage via /se-archive |

---

## 6. Strate D — Les moteurs partagés

### Recherche unifiée à 4 niveaux (pipeline tier-adaptatif, modèle hyperresearch)
1. **Code local** — scout profond avant discuss
2. **Web tech/archi** — l'existant (gsd-phase-researcher)
3. **Scientifique** — Semantic Scholar · arXiv · OpenAlex · PubMed (APIs prêtes)
4. **Projets existants** — repos/patterns comparables

Coverage matrix anti-rétrécissement · `required_section_headings` · pré-fetch « quelle source renverserait ma reco ? » (CoVe avant synthèse).

### Banques de règles externalisées (source unique, modèle ui-ux-pro-max)
- `design-system` — LE fichier lu par TOUS les skills UI (tokens, couleurs, typo, espacement, composants). Cf. §12.
- `ui-rules` — 10 piliers (copywriting, visuals, color, typography, spacing, registry-safety, accessibility, motion, states, performance), Severity → BLOCK/FLAG/PASS. Chaque règle déclare `verifiedBy` (`measured` / `llm` / `human`) et, quand elle est mesurable, un `check` évalué sur `ui-report.json`.
- `slop-rules` — marqueurs AI-slop FR (lus par Humanizer ET slop-gate).
- `code-rules` — patterns code mort / hardcode / anti-patterns (lus par janitor ET hygiene/hardcode-guard).
- `personas-ux` — personas clients/utilisateurs (lus par l'expert UX).

---

## 7. Strate E — Les spécialistes

- **Cofondateur-sparring** — cf. Strate B.
- **Expert UX** — relit les features à l'aune des `personas-ux`. Pose la question « est-ce que [persona] comprend / réussit / a envie ? ». Distinct de l'UI (qui fait le visuel) : l'UX challenge le *parcours* et la *valeur perçue*. Outillé par la grille des 10 heuristiques de Nielsen (gravité 0-4), les lois d'interaction (Fitts, Hick, Jakob, Miller, crête-fin) et les conventions par plateforme — dont le desktop, qui ne s'audite pas avec des critères web.
- **UI** — branché sur `design-system` + `ui-rules`. Cycle **craft → critique → polish** obligatoire : un premier jet n'est jamais beau, il est correct. Verrou de direction esthétique en amont (aucun composant sans direction nommée), verdict mesuré en aval.
- **Humanizer v2** — boucle audit→re-rewrite, section anti-faux-positifs, réinjection de voix gatée par type de contenu.
- **Skills projet My Mozaica** — inchangés.

---

## 7bis. Maquettage UI/UX & Playwright (réalisé)

**Principe : le système doit VOIR et MESURER, pas seulement lire le code.** Source : tip n°1 Boris (« donner à Claude un moyen de vérifier = ×2-3 qualité ») + détecteur déterministe d'impeccable.

Le point qui fait la différence : un checkpoint qui capture trois PNG que Claude *regarde* ne vérifie rien. Or les cinq échecs WCAG les plus fréquents en 2026 — contraste, alt, liens vides, labels de formulaire, `lang` — sont tous détectables automatiquement. Ce qui est mesurable doit être mesuré ; le jugement humain se réserve à ce qu'aucune mesure ne dit.

### Maquettage — 3 niveaux (pas un skill isolé, un mode du flux UI/UX, AVANT le code)

| Niveau | Outil | Quand | Sortie |
|--------|-------|-------|--------|
| Texte/ASCII | skill UX | exploration layout rapide | wireframe ASCII inline |
| Direction esthétique | `search.py --design-system` d'ui-ux-pro-max | projet vierge, avant tout composant | 2-3 directions argumentées, choix humain, inscrit en §0.2 |
| Live | Next.js + `ui-verify.spec.ts` | valider le rendu réel | captures 3 breakpoints + `ui-report.json` |

### Playwright — configuré une fois, 4 points d'ancrage

1. **Garde-fou `ui-guard` (Strate A)** : à chaque édition front, rappel du rituel + détecteur impeccable sur le fichier. Advisory, jamais bloquant.
2. **Runner de mesure** : `tests/e2e/ui-verify.spec.ts` produit un `ui-report.json` par breakpoint — axe-core WCAG 2.2 AA, typographie et espacements réellement rendus, cibles < 44px, débordements, focus visible, pièges clavier, `prefers-reduced-motion`, Core Web Vitals, et tous les textes visibles extraits.
3. **Gate visuelle (Strate C)** : `scripts/ui-verdict.cjs` croise le rapport avec `ui-rules.json` → BLOCK / FLAG / PASS. Les BLOCK arrêtent la livraison (`workflow.ui_gate_blocking`), sauf exception écrite dans `ui-exceptions.json`. Puis Claude présente les captures et ne demande à l'humain que le jugement : la direction est-elle visible, où se pose l'œil.
4. **Tests (cycle)** : Playwright reste le moteur E2E des parcours critiques (Vitest pour l'unitaire).

Deux garde-fous de principe : une métrique absente donne SKIPPED, jamais BLOCK — on ne bloque pas sur ce qu'on n'a pas su mesurer ; et entre breakpoints, on retient toujours le pire cas — une UI cassée sur mobile est une UI cassée.

**« Moins de scripts » respecté** : UN runner pour toutes les dimensions, pas un script par métrique ni un spec par feature.

### Corpus de design vendorisés

`vendor/design/` porte un sous-ensemble curaté de trois corpus open-source, versions épinglées, jamais édités à la main (`scripts/sync-design-vendors.cjs`) :

| Corpus | Rôle | Quand |
|--------|------|-------|
| [impeccable](https://github.com/pbakaus/impeccable) (Apache-2.0) | Langage de design (34 playbooks) + détecteur déterministe | Écrire, critiquer, polir, juger |
| [platform-design-skills](https://github.com/ehmo/platform-design-skills) (MIT) | Apple HIG / Material 3 / WCAG 2.2, 8 plateformes | Conformité plateforme — seul corpus couvrant le desktop |
| [ui-ux-pro-max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) (MIT) | Bases de direction + moteur BM25 | **Bootstrap uniquement** — il génère un design-system, il n'en juge aucun |

La contrainte qui les rend utilisables : ils sont chargés **à la demande**, une référence par tâche, selon la table de routage de `.planning/design/references/README.md`. Tout charger coûterait des dizaines de milliers de tokens et diluerait les instructions.

---

## 8-9-10. Arborescence, nommage, anti-entropie

> **Ces trois chapitres ne sont plus décrits ici.** Leur source unique et faisant autorité est
> [.planning/CONVENTIONS.md](../.planning/CONVENTIONS.md) — c'est le fichier que lisent les hooks
> (`placement-guard`, `size-gate`) et les skills.
>
> Ce document décrit *pourquoi* le système est ainsi ; CONVENTIONS.md décrit *où* les choses vont.
> Dupliquer l'arbre ici a déjà produit une divergence (plafonds STATE/ROADMAP annoncés à 150/200
> alors que la loi et le hook disaient 300/300) : on ne recommence pas.

**Ce qu'il faut retenir de la conception :**

- **Une seule destination par type d'artefact.** Une recherche → `research/`. Un audit transverse → `audits/`. Une décision produit → `PROJECT.md`. Un design token → `design/DESIGN-SYSTEM.md`. Jamais d'ambiguïté, jamais de grep.
- **Un artefact lié à une phase vit DANS la phase.** Il part à l'archive avec elle : `phases/` reste propre par construction, sans ménage manuel.
- **Un rapport ne s'écrit que s'il sera relu.** La plupart des verdicts (`/se-deploy`, `/se-review`, `/se-test`) sont consommés en séance et ne laissent aucun fichier. C'est ce qui évite le repo noyé sous les rapports après 200 h d'usage.
- **Noms de fichiers FIXES en majuscules dans une phase** — un parser les trouve sans grep.
- **Trois mécanismes d'anti-entropie** : plafonds durs (`size-gate`, bloquant), archivage des phases shippées (`/se-archive`, avec confirmation), et `INDEX.md` maintenu en continu à la clôture de chaque phase.
- **Un garde-fou d'emplacement** (`placement-guard`, advisory) alerte dès qu'un `.md` atterrit à la racine du repo, à la racine de `.planning/`, dans un dossier non déclaré, ou porte un nom de rapport hors de sa destination.

---

## 11. Les checkpoints humains repensés

GSD a la bonne philosophie (« humain = jugement seul, Claude automate ») mais le mode par défaut `end-of-phase` balance tout en bloc à la fin → validation à l'aveugle, trop tard. On corrige :

**Principes :**
1. **Au bon moment, pas en bloc.** Un checkpoint juste après le livrable concerné, tant que c'est frais.
2. **Visuel d'abord.** Claude démarre le serveur, te donne l'URL + 3-4 points précis à regarder. Tu valides avec tes yeux.
3. **Décision claire.** GO / NO-GO / NO-GO-avec-raison. Pas de rapport à lire.
4. **Test manuel > script** quand c'est du fonctionnel/visuel. On ne code pas un test E2E pour vérifier « est-ce que ça a la bonne tête ».
5. **Tu ne lances que ce qui survit à la commande.** Build, migrations, tests, Playwright : Claude, elles rendent la main. Le serveur de dev, un worker, un tunnel : toi, dans ton terminal, sur une commande d'une ligne que Claude te donne. Il le perdrait de vue au tour suivant et ne le tuerait jamais, d'où les serveurs qui s'empilent (loi : `CONVENTIONS.md` §12). Le peu que Claude doit lancer en autonomie passe par `se-serve.cjs`, donc par un PID enregistré que le hook de fin de session tue.

**3 types :**
- `human-verify` (visuel/fonctionnel) — 90%. Claude a tout fait, tu confirmes.
- `decision` (choix d'archi/techno) — 9%. Options avec pour/contre.
- `human-action` (auth gate uniquement) — 1%. Seul cas où tu fais un truc.

**Une forme unique, portée par un primitif.** Chaque skill improvisait son bloc de validation, donc la qualité du checkpoint dépendait du skill qui le rendait. `/se-checkpoint` porte désormais la forme (Fait / Mesuré / À juger / Regarder / une question fermée) et les règles dures : quatre points à juger au maximum, jamais un point que la machine a déjà mesuré, rien à lire avant de trancher, une seule question. Les gates et `/se-ui` l'invoquent au lieu d'inventer leur format.

**Un checkpoint par groupe, pas par analyse.** Les trois gates de fin de phase (SIMPLIFY, JANITOR, SECURITY) lisent le même diff et n'écrivent rien avant le GO : elles partent donc en un seul lancement parallèle et rendent un seul bloc à trois sections. Le coût d'un cycle ne se compte pas en secondes de machine, il se compte en nombre de fois où l'humain est réveillé pour le même diff (loi : `CONVENTIONS.md` §11).

**Journal :** chaque checkpoint et son verdict sont consignés dans `{phase}/CHECKPOINTS.md`, sur le gabarit `.planning/_templates/CHECKPOINTS.template.md`. La réponse humaine s'y recopie mot pour mot : c'est la trace, pas un résumé.

---

## 12. La stack & les défauts projet

Système calé sur la stack de Paul. Défauts assumés (modifiables par projet) :

- **Framework** : Next.js 15 (App Router) + React 19 + TypeScript strict
- **Styling** : Tailwind CSS
- **Déploiement** : Railway
- **Base de données** : Postgres (Railway) OU Supabase selon le projet
- **ORM** : Prisma
- **Auth** : Supabase Auth (si Supabase) OU BetterAuth
- **Tests** : Vitest
- **Validation** : Zod sur tous les inputs API

Conséquences sur le système :
- Le `checkpoints.md` (table CLI services) est réduit à : Railway, Supabase, GitHub, Node/npm. Pas de Vercel/Convex/Fly inutiles.
- Les exemples de code des skills (plan, dev, research) utilisent CETTE stack, pas une stack générique.
- `DESIGN-SYSTEM.md` est en tokens compatibles Tailwind (OKLCH dans le thème).

---

## 13. Inventaire des skills

Paul a noté « on a beaucoup moins de skills, mais c'est pas mal ». C'est volontaire : moins de skills visibles (moins de pollution du menu `/`, moins de contexte), plus de garanties mécaniques. Cible :

**Garde-fous (Strate A)** — pas des skills, des hooks. Invisibles.

**Orchestration (B)** : `/se-pilot` (+ sparring intégré ou dédié — à décider).

**Cycle (C)** : commandes GSD enrichies (scout, discuss, research, plan, check, execute, verify, simplify, janitor, ship) + gestion (insert-phase, complete-milestone, archive auto).

**Spécialistes (E)** : `/se-ux` (personas + parcours E2E), `/se-ui`, `/se-humanizer` v2, `/se-research`, skills projet.

**Détail exhaustif des skills retenus / fusionnés / supprimés : à produire au chantier dédié.**

---

## 13bis. Registre de cherry-picking (la vérité du terrain)

Après analyse des sources réelles (`_sources/claude-config` = config perso de Paul, + les 5 repos), voici ce qu'on a VRAIMENT vs ce qu'on croit manquer. **~70% est déjà sur disque et se cherry-pick.**

| Brique cible | Statut réel | Action |
|---|---|---|
| Moteur GSD (18 agents, 57 cmds, workflows, v1.29) | ✅ sur disque, mûr | **Garder, adapter config** |
| Skills dev (dev/se-plan/se-review/se-fix/se-test/se-deploy/se-janitor/se-refactor/se-debug/se-clean-commit/se-security/se-health-check) | ✅ sur disque | **Garder, adapter stack** |
| `/se-pilot` + `/se-planning` | ✅ sur disque | **Garder, rendre mince** |
| Brainstorming (light+heavy+61 techniques CSV) | ✅ sur disque | **SANCTUARISER** (Paul l'adore) |
| `/se-research` (méthodo hyperresearch déjà intégrée : Decompose→Verify, 4 lenses, CoVe) | ✅ `~/.claude/commands/se-research.md` | **SANCTUARISER** (Paul l'adore). Ajout optionnel : 4 APIs académiques dans le sous-agent `researcher` |
| `/se-humanizer` v2.5.1 (29 marqueurs + FR + boucle audit + calibrage voix + âme) | ✅ `~/.claude/commands/se-humanizer.md` | **Garder**. 2 ajouts ciblés : section anti-faux-positifs + 4 patterns récents (staccato, aphorismes, ouvreurs candides, diff-anchored) |
| skill-creator + scripts d'éval Python | ✅ sur disque | **Réutiliser pour fabriquer les nouveaux skills** |
| Design-system standalone + 6 piliers UI | 🔶 enfoui dans gsd-ui-checker/auditor + UI-SPEC.md | **EXTRAIRE** en `design/DESIGN-SYSTEM.md` |
| Checkpoints visuels | ✅ `references/checkpoints.md` + `ui-brand.md` | **Garder, inverser le défaut end-of-phase** |
| Garde-fous (hooks Humanizer/UI/hardcode/slop/monolithe/size/se-archive) | ❌ aucun. Pattern de hook propre existe (`gsd-prompt-guard.js`) | **CRÉER sur le pattern existant** |
| Expert UX personas | ❌ inexistant (gsd-user-profiler = profil DEV pas clients) | **CRÉER** |
| Diète contexte (skillListingBudget, MCP deferral) | ❌ absente de settings.json | **AJOUTER** (gain gratuit) |
| Anti-entropie (size-gate, archive auto, INDEX vivant) | 🔶 partiel (`/gsd:cleanup`, milestone-archive) | **GÉNÉRALISER** |

**Ce qu'on crée vraiment de zéro :** uniquement les hooks (sur pattern existant) + l'expert UX. Tout le reste = cherry-pick ou extraction.

**Sécurité :** `_sources/claude-config/config.json` (clé API) et `mcp.json` (2 mots de passe Postgres) sont en clair → EXCLUS de tout cherry-pick et commit.

---

## 13ter. Le critère anti-monolithe (transverse)

Demande de Paul : « les scouts et vérificateurs regardent et évitent les services monolithiques. »

- **`monolith-guard`** (hook `PostToolUse`, **advisory seulement** — souffle, ne bloque jamais) : seuils sur lignes/fichier, lignes/fonction, nombre de responsabilités, fan-in/fan-out. Signale les « god services ».
- **SCOUT** : cartographie les monolithes existants dans son rapport (ne pas ajouter à un fichier déjà obèse sans le dire).
- **VERIFY / review** : critère explicite « est-ce qu'on a nourri un monolithe ? » au checkpoint. Paul tranche.
- Cohérent avec la culture CLAUDE.md : « source unique », « no over-engineered solutions », découplage.

---

## 14. Plan de construction

Ordre recommandé (impact/effort) :

0. **Fondations** — arborescence `.planning/` + conventions + INDEX + config stack. *(socle de tout)*
1. **Strate A** — les garde-fous (Humanizer/UI auto, hardcode, slop, size, archive). *(la demande explicite de Paul)*
2. **Anti-entropie** — size-gate + archive-hook + INDEX vivant.
3. **Strate D** — design-system + personas + banques de règles.
4. **Strate C** — gates Simplify + Janitor + checkpoints visuels.
5. **Strate B** — Pilot mince + sparring.
6. **Recherche unifiée** — pipeline 4 niveaux.
7. **Spécialistes** — UX expert, UI branché, Humanizer v2.

> Chaque chantier produira son propre doc de spec dans `_design/{NN}-{nom}.md`, lié depuis ce SYSTEME.md.
