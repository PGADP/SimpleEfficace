# SIMPLE & EFFICACE — Document de conception du système

> Système de pilotage de développement personnel, conçu pour **Paul** (Next.js / Tailwind / Railway / Postgres / Prisma / Vitest, auth Supabase ou BetterAuth).
> Successeur du système GSD + Pilot de My Mozaica. Objectif : **lourd quand il faut, invisible le reste du temps. Propre par mécanique, pas par vigilance.**
>
> Statut : CONCEPTION (v0.2). Rien n'est encore construit. Ce fichier est la source de vérité du design.
> Dernière mise à jour : 2026-06-24.
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
8. [L'arborescence standardisée](#8-larborescence-standardisée)
9. [La convention de nommage](#9-la-convention-de-nommage)
10. [Les fichiers de suivi & l'anti-entropie](#10-les-fichiers-de-suivi--lanti-entropie)
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
│  • humanizer-guard→ contenu user-facing : EXIGE /se-humanizer           │
│  • hygiene-guard  → après Edit : souffle code mort / imports / log   │
│  • hardcode-guard → après Edit : détecte valeurs hardcodées          │
│  • slop-gate      → au commit : BLOQUE si marqueurs AI non traités   │
│  • size-gate      → écriture STATE/ROADMAP : BLOQUE si trop long     │
│  • archive-hook   → phase shippée : déplace en _archive/ auto        │
└──────────────────────────────────┬───────────────────────────────────┘
                                   │ garantissent en continu
┌─ STRATE B — LE COFONDATEUR (/se-pilot, RICHE) ─────────────────────────┐
│  Sparring, challenge, vision, "teste tes idées". INTACT.            │
│  Routeur mince à l'intérieur : modes lourds = sous-skills lazy.     │
└──────────────────────────────────┬───────────────────────────────────┘
                                   │ dispatche vers
┌─ STRATE C — LE CYCLE DE PHASE ──────────────────────────────────────┐
│  SCOUT → DISCUSS → RESEARCH → PLAN(+TDD) → CHECK → EXECUTE →         │
│  VERIFY → SIMPLIFY → JANITOR → SHIP                                  │
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
│  Cofondateur-sparring · UX-expert(personas) · UI · Humanizer v2 ·   │
│  Recherche · skills projet · marketing (étanche, inchangé)          │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 3. Strate A — Les garde-fous

Un hook = script déclaré dans `settings.json`, lancé par le harness sur un événement. Il rend un `additionalContext` (system-reminder que Claude voit forcément) ou **bloque** (exit 2). Claude ne peut ni l'oublier ni l'ignorer.

**Contrat commun (volé à impeccable) :** jamais casser un tour · exit 0 sauf gate explicite · garde de ré-entrance (variable d'env de profondeur) · timeout 5s · audit-log optionnel.

| Hook | Événement | Déclencheur | Action | Bloquant ? |
|------|-----------|-------------|--------|------------|
| **humanizer-guard** | `PostToolUse` Edit/Write | fichier user-facing (heuristique chemin + contenu FR) | system-reminder : « passe /se-humanizer avant de finir » | non (rappel) |
| **slop-gate** | au commit (clean-commit) | contenu user-facing avec marqueurs `slop-rules` | refuse le commit | **oui** |
| **ui-guard** | `PostToolUse` Edit/Write | `.tsx`/`.css`/composant front | si pas de design-system lu OU pas d'UI-spec de phase → rappel ; sinon lance détecteur déterministe (contraste, tailles) | non (rappel) |
| **hardcode-guard** | `PostToolUse` Edit/Write | code source | détecte valeurs magiques / listes hardcodées (cf. règle CLAUDE.md) | non (rappel) |
| **hygiene-guard** | `PostToolUse` Edit | code source | scan rapide imports inutilisés / console.log / code mort | non (rappel) |
| **size-gate** | `PostToolUse` Write | STATE.md / ROADMAP.md | si dépasse le plafond → refuse + exige archivage | **oui** |
| **archive-hook** | à `ship` réussi | phase passée en `shipped` | déplace le dossier de phase en `_archive/` | auto |

**Note d'implémentation :** chaque hook est un petit script Node (`.mjs`), thin adapter stdin/stdout, logique testable dans une lib séparée (modèle impeccable `hook.mjs` + `hook-lib.mjs`). On veut **peu** de scripts, donc un seul dispatcher de hooks qui route par type d'événement, pas un script par hook.

---

## 4. Strate B — Le Cofondateur

**Ce qui ne change PAS (le cœur de la valeur) :**
- Persona cofondateur technique : challenge systématique, avis tranchés, vision produit, « teste tes idées », honnêteté, pédagogie.
- Le réflexe « est-ce déjà fait / déjà planifié ? » avant d'agir.
- Les 5 modes (briefing, conversation/sparring, clôture, discussion stratégique, redirection marketing).

**Ce qui change (la plomberie) :**
- `/se-pilot` devient un **routeur mince**. Le mode Conversation (sparring) se charge instantané. Les modes lourds (briefing, clôture) = sous-skills `user-invocable: false` chargés à la demande.
- Le briefing lit **un seul** `STATE.md` consolidé (≤150 lignes), pas la cascade STRATEGY→ROADMAP→STATE.

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
| 10 | **SHIP** | GSD + slop-gate + archive-hook | commit propre → PR → archivage auto |

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
- `ui-rules` — 6 piliers + ~250 règles chiffrées sourcées, Severity → BLOCK/FLAG/PASS.
- `slop-rules` — marqueurs AI-slop FR (lus par Humanizer ET slop-gate).
- `code-rules` — patterns code mort / hardcode / anti-patterns (lus par janitor ET hygiene/hardcode-guard).
- `personas-ux` — personas clients/utilisateurs (lus par l'expert UX).

---

## 7. Strate E — Les spécialistes

- **Cofondateur-sparring** — cf. Strate B.
- **Expert UX** (🆕) — relit les features à l'aune des `personas-ux` (utilisateurs potentiels). Pose la question « est-ce que [persona] comprend / réussit / a envie ? ». Distinct de l'UI (qui fait le visuel) : l'UX challenge le *parcours* et la *valeur perçue*.
- **UI** — branché sur `design-system` + `ui-rules`. Auto-trigger optimisé.
- **Humanizer v2** — boucle audit→re-rewrite, section anti-faux-positifs, réinjection de voix gatée par type de contenu.
- **Skills projet My Mozaica** — inchangés.
- **Marketing** — étanche, inchangé.

---

## 7bis. Maquettage UI/UX & Playwright (la vision)

Demande de Paul : un skill maquette + Playwright configuré d'office et intégré aux tests et vérifications UI/UX.

**Principe : le système doit VOIR, pas seulement lire le code.** Source : tip n°1 Boris (« donner à Claude un moyen de vérifier = ×2-3 qualité ») + détecteur visuel d'impeccable (screenshot + contraste réel).

### Maquettage — 3 niveaux (pas un skill isolé, un mode du flux UI/UX, AVANT le code)

| Niveau | Outil | Quand | Sortie |
|--------|-------|-------|--------|
| Texte/ASCII | skill UX | exploration layout rapide | wireframe ASCII inline |
| Visuel statique | `/generate-image` + design-system | valider direction visuelle | PNG d'écran |
| Live (code jetable) | Next.js + Playwright screenshot | valider l'interaction réelle | page preview + capture |

Cherry-pick : mode `live` d'impeccable (overlay navigateur + variantes), AI-prompt-keywords d'ui-ux-pro-max, `/generate-image` existant.

### Playwright — configuré une fois, 3 points d'ancrage

1. **Garde-fou `ui-guard` (Strate A)** : screenshot la page via Playwright + détecteur visuel (contraste réel, débordements, layout cassé). Niveau impeccable.
2. **Gate VERIFY + checkpoints (Strate C)** : avant chaque checkpoint visuel, Claude lance le serveur et capture les 3 breakpoints (desktop/tablet/mobile). Paul valide sur images, pas sur une URL à ouvrir.
3. **Tests (cycle)** : Playwright = moteur E2E/visuel par défaut (Vitest reste pour l'unitaire). Config posée dans les fondations.

**« Moins de scripts » respecté** : Playwright n'est pas un script par feature. C'est UN outil de vision configuré une fois, réutilisé par garde-fou + checkpoints + tests. Il renforce le test manuel intelligent (Claude montre déjà la capture, Paul tranche plus vite).

---

## 8. L'arborescence standardisée

```
.planning/
├── INDEX.md                  ← carte de TOUT (liens vers chaque artefact). Jamais greppé.
├── STATE.md                  ← présent only, ≤150 lignes (size-gate)
├── ROADMAP.md                ← 3 horizons, court détaillé / moyen+long en lignes
├── STRATEGY.md               ← vision, deadlines business, décisions majeures
├── PROJECT.md                ← description produit + Key Decisions (log)
│
├── phases/                   ← phases ACTIVES uniquement (jamais l'archive)
│   └── {NN}-{slug}/          ← une phase = un dossier (cf. §9)
│       ├── CONTEXT.md
│       ├── RESEARCH.md
│       ├── PLAN.md
│       ├── SUMMARY.md
│       ├── VERIFICATION.md
│       ├── UI-SPEC.md        (si front)
│       └── CHECKPOINTS.md    (journal des gates visuels)
│
├── research/                 ← recherches transverses (.planning/se-research/{slug}.md)
├── design/                   ← design-system + personas-ux (lus par UI/UX)
│   ├── DESIGN-SYSTEM.md
│   └── PERSONAS.md
├── rules/                    ← banques de règles (ui-rules, slop-rules, code-rules)
├── todos/                    ← capture zéro-friction (pending/ + done/)
│
└── _archive/                 ← TOUT le validé migre ici (archive-hook)
    ├── milestones/{vX.Y}/
    └── phases/{NN}-{slug}/   ← phases shippées, hors du chemin de travail
```

**Règle d'or :** une seule destination par type d'artefact. Si tu cherches une recherche → `research/`. Une décision → `PROJECT.md`. Un design token → `design/DESIGN-SYSTEM.md`. Jamais d'ambiguïté, jamais de grep.

---

## 9. La convention de nommage

**Dossiers de phase :** `{NN}-{slug-kebab-case}/` — NN sur 2-3 chiffres, slug court en anglais.
- Insertion urgente : décimale (`72.1-`) sans renuméroter.
- Backlog : `999.x-`.

**Fichiers dans une phase :** noms FIXES et MAJUSCULES (CONTEXT, RESEARCH, PLAN, SUMMARY, VERIFICATION, UI-SPEC, CHECKPOINTS). Pas de variation. Un parser peut les trouver sans grep.

**Recherches transverses :** `research/{YYYY-MM-DD}-{slug}.md`.

**Archive :** miroir exact de la structure active, sous `_archive/`.

---

## 10. Les fichiers de suivi & l'anti-entropie

Le problème de Paul : STATE/ROADMAP qui gonflent à 10 000 lignes, 250 phases jamais archivées. Trois mécanismes :

### a) Plafonds DURS (size-gate, bloquant)
- `STATE.md` ≤ 150 lignes. Ne contient que le présent. Au-delà → le hook refuse l'écriture et exige de pousser le vieux en archive.
- `ROADMAP.md` : horizon court détaillé, moyen+long en une ligne chacun. Plafond ~200 lignes.

### b) Archivage automatique (archive-hook, auto)
- Phase `shipped` → son dossier migre en `_archive/phases/` immédiatement. `phases/` ne contient QUE l'actif.
- `complete-milestone` → ROADMAP+REQUIREMENTS du milestone migrent en `_archive/milestones/{vX.Y}/`, la roadmap active repart propre.

### c) INDEX.md (la carte)
- Un fichier maître qui liste, avec liens, où se trouve chaque chose (phases actives, archive, recherches, design, règles). Mis à jour par les hooks. C'est lui qu'on lit pour s'orienter, jamais un grep.

---

## 11. Les checkpoints humains repensés

GSD a la bonne philosophie (« humain = jugement seul, Claude automate ») mais le mode par défaut `end-of-phase` balance tout en bloc à la fin → validation à l'aveugle, trop tard. On corrige :

**Principes :**
1. **Au bon moment, pas en bloc.** Un checkpoint juste après le livrable concerné, tant que c'est frais.
2. **Visuel d'abord.** Claude démarre le serveur, te donne l'URL + 3-4 points précis à regarder. Tu valides avec tes yeux.
3. **Décision claire.** GO / NO-GO / NO-GO-avec-raison. Pas de rapport à lire.
4. **Test manuel > script** quand c'est du fonctionnel/visuel. On ne code pas un test E2E pour vérifier « est-ce que ça a la bonne tête ».
5. **Claude ne te demande JAMAIS de lancer une commande.** Serveur, build, migrations = Claude. Toi = regarder et trancher.

**3 types :**
- `human-verify` (visuel/fonctionnel) — 90%. Claude a tout fait, tu confirmes.
- `decision` (choix d'archi/techno) — 9%. Options avec pour/contre.
- `human-action` (auth gate uniquement) — 1%. Seul cas où tu fais un truc.

**Journal :** chaque checkpoint et son verdict sont consignés dans `{phase}/CHECKPOINTS.md`.

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

**Spécialistes (E)** : `/se-ux` (🆕 personas), `/se-ui`, `/se-humanizer` v2, `/se-research`, skills projet, marketing.

**Détail exhaustif des skills retenus / fusionnés / supprimés : à produire au chantier dédié.**

---

## 13bis. Registre de cherry-picking (la vérité du terrain)

Après analyse des sources réelles (`_sources/claude-config` = config perso de Paul, + les 5 repos), voici ce qu'on a VRAIMENT vs ce qu'on croit manquer. **~70% est déjà sur disque et se cherry-pick.**

| Brique cible | Statut réel | Action |
|---|---|---|
| Moteur GSD (18 agents, 57 cmds, workflows, v1.29) | ✅ sur disque, mûr | **Garder, adapter config** |
| Skills dev (dev/se-plan/se-review/se-fix/se-test/se-deploy/se-janitor/se-refactor/se-debug/se-clean-commit/se-lint/se-perf/se-security/se-health-check) | ✅ sur disque | **Garder, adapter stack** |
| `/se-pilot` + `/se-planning` | ✅ sur disque | **Garder, rendre mince** |
| Brainstorming (light+heavy+62 techniques CSV) | ✅ sur disque | **SANCTUARISER** (Paul l'adore) |
| `/se-research` (méthodo hyperresearch déjà intégrée : Decompose→Verify, 4 lenses, CoVe) | ✅ `~/.claude/commands/se-research.md` | **SANCTUARISER** (Paul l'adore). Ajout optionnel : 4 APIs académiques dans le sous-agent `researcher` |
| `/se-humanizer` v2.5.1 (29 marqueurs + FR + boucle audit + calibrage voix + âme) | ✅ `~/.claude/commands/se-humanizer.md` | **Garder**. 2 ajouts ciblés : section anti-faux-positifs + 4 patterns récents (staccato, aphorismes, ouvreurs candides, diff-anchored) |
| Marketing (33 fichiers) | ✅ sur disque | **Garder, étanche** |
| skill-creator + scripts d'éval Python | ✅ sur disque | **Réutiliser pour fabriquer les nouveaux skills** |
| Design-system standalone + 6 piliers UI | 🔶 enfoui dans gsd-ui-checker/auditor + UI-SPEC.md | **EXTRAIRE** en `design/DESIGN-SYSTEM.md` |
| Checkpoints visuels | ✅ `references/checkpoints.md` + `ui-brand.md` | **Garder, inverser le défaut end-of-phase** |
| Garde-fous (hooks Humanizer/UI/hardcode/slop/monolithe/size/se-archive) | ❌ aucun. Pattern de hook propre existe (`gsd-prompt-guard.js`) | **CRÉER sur le pattern existant** |
| Expert UX personas | ❌ inexistant (gsd-user-profiler = profil DEV pas clients) | **CRÉER** (réutilise matière marketing) |
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
