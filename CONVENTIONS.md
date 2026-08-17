# Conventions du système — loi de rangement et de nommage

> **Source unique.** Ce document fait autorité sur l'arborescence. `docs/SYSTEME.md` ne la duplique pas, il pointe ici.
> Lu par les hooks (`placement-guard`, `size-gate`) et par tous les skills.
> But : tout est rangé et lié, **jamais greppé**. Une destination unique par type d'artefact.

---

## 1. La carte (anti-grep)

`INDEX.md` est la carte de tout. On le lit pour s'orienter, jamais une recherche à l'aveugle.
Il est **maintenu en continu** par le step `update_planning_index` du workflow `execute-phase`, pas à la main (sinon il pourrit).

## 2. L'arborescence

```
.planning/
├── INDEX.md              carte de tout
├── STATE.md              présent only, ≤ 300 lignes (size-gate)
├── ROADMAP.md            3 horizons, ≤ 300 lignes (size-gate)
├── STRATEGY.md           vision, deadlines business
├── STRATEGY-ARCHIVE.md   décisions stratégiques sorties de STRATEGY.md
├── PROJECT.md            description produit + Key Decisions
├── PRD.md                cahier des charges initial
├── REQUIREMENTS.md       exigences du milestone courant
├── MILESTONES.md         historique des milestones
├── RETROSPECTIVE.md      leçons transverses
├── CONVENTIONS.md        ce fichier
├── config.json           toggles du cycle GSD
│
├── phases/               phases ACTIVES uniquement
├── research/             recherches transverses
├── audits/               rapports d'audit transverses persistants
├── brainstorming/        sessions /se-brainstorm-*
├── design/               design-system, personas, journeys, templates Playwright
├── rules/                banques de règles typées (JSON)
├── codebase/             cartographie /gsd:map-codebase
├── debug/                sessions de debug (+ resolved/)
├── decisions/            décisions techniques isolées (si le cycle en produit)
├── todos/                capture zéro-friction (pending/ + done/)
├── _templates/           gabarits du système
└── _archive/             tout le validé migre ici
    ├── milestones/{vX.Y}/
    ├── phases/{NN}-{slug}/
    ├── research/
    └── audits/
```

**Rien à la racine de `.planning/` hors de la liste ci-dessus.** Tout nouveau dossier doit d'abord être déclaré ici (et dans `hooks/rules/placement-rules.json`), sinon `placement-guard` alerte.

**Surcharge par projet** : un projet peut déclarer ses dossiers légitimes supplémentaires dans `.planning/rules/placement-overrides.json` (fusion additive avec la banque globale, mêmes clés que `placement-rules.json`). À réserver aux dossiers vivants propres au projet ; documenter chaque entrée dans le `CONVENTIONS.md` du projet.

## 3. Une destination unique par type d'artefact

| Tu cherches… | C'est ici, et nulle part ailleurs |
|---|---|
| L'état du jour | `.planning/STATE.md` |
| Les jalons / planning | `.planning/ROADMAP.md` |
| La vision / deadlines business | `.planning/STRATEGY.md` |
| La description produit + décisions | `.planning/PROJECT.md` |
| Une phase active | `.planning/phases/{NN}-{slug}/` |
| Une phase terminée | `.planning/_archive/phases/{NN}-{slug}/` |
| Une recherche | `.planning/research/{YYYY-MM-DD}-{slug}.md` |
| Un audit transverse persistant | `.planning/audits/{YYYY-MM-DD}-{type}-{slug}.md` |
| Une session de brainstorming | `.planning/brainstorming/se-brainstorm-{light\|heavy}-{slug}-{YYYY-MM-DD}.md` |
| Une session de debug | `.planning/debug/{slug}.md` → `.planning/debug/resolved/` |
| La cartographie du code | `.planning/codebase/{ARCHITECTURE,STACK,STRUCTURE,…}.md` |
| Le design-system | `.planning/design/DESIGN-SYSTEM.md` |
| Les personas UX | `.planning/design/PERSONAS.md` |
| Les parcours E2E | `.planning/design/JOURNEYS.md` |
| Une banque de règles | `.planning/rules/{nom}.json` (données typées) |
| Une idée capturée | `.planning/todos/pending/` puis `done/` |
| Un milestone archivé | `.planning/_archive/milestones/{vX.Y}/` |
| Une spec de chantier système | `docs/_design/{NN}-{nom}.md` |
| La conception du système | `docs/SYSTEME.md` |

À la racine du repo, seuls `README.md`, `CLAUDE.md`, `AGENTS.md`, `CHANGELOG.md`, `LICENSE.md`, `CONTRIBUTING.md` sont admis. **Aucun rapport, aucune analyse, aucune note ne s'écrit à la racine.**

## 4. La règle des rapports (durée de vie)

Un rapport ne s'écrit sur disque **que s'il sera relu**. Trois classes, une destination par classe :

| Classe | Qui | Où |
|---|---|---|
| **Éphémère** — verdict consommé en séance | `/se-review`, `/se-test`, `/se-deploy`, `/se-health-check`, `/se-fix`, `/se-plan`, `/se-explain`, `/se-refactor` | **Rien sur disque.** Réponse en chat + `TodoWrite`. Fichier seulement si l'utilisateur le demande explicitement → `.planning/audits/` |
| **Liée à une phase** | gates SIMPLIFY / JANITOR / SECURITY / visuel, `/se-debug` en phase | `.planning/phases/{NN}-{slug}/CHECKPOINTS.md` — part à l'archive avec la phase |
| **Transverse persistante** | `/se-security` (audit complet), `/se-ux` (audit), `/gsd:ui-review`, `/se-refactor` (stratégie globale demandée) | `.planning/audits/{YYYY-MM-DD}-{type}-{slug}.md` |

`{type}` ∈ `security` · `ux` · `ui` · `refactor` · `review` · `health`.

Pourquoi pas un dossier par type : trois dossiers à trois fichiers, c'est de l'entropie. Un dossier unique trié par date se lit d'un `ls`.

## 5. Nommage des phases

- Dossier : `{NN}-{slug-kebab-case}/` — NN sur 2-3 chiffres, slug court en anglais.
- Insertion urgente : décimale `{72.1}-...` sans renuméroter la suite.
- Backlog : `999.x-...`.
- Archive : miroir exact sous `_archive/phases/`.

## 6. Nommage des fichiers DANS une phase (FIXES, MAJUSCULES)

Noms invariants pour qu'un parser les trouve sans grep :

| Fichier | Contenu |
|---|---|
| `CONTEXT.md` | décisions figées par DISCUSS |
| `RESEARCH.md` | recherche de la phase |
| `PLAN.md` | tâches, vagues, dépendances |
| `SUMMARY.md` | ce qui a réellement été fait |
| `VERIFICATION.md` | vérif goal-backward |
| `UI-SPEC.md` | contrat de design (si front) |
| `CHECKPOINTS.md` | journal des gates (simplify, janitor, security, visuel) + verdicts |

Les workflows GSD préfixent : `{phase}-{plan}-PLAN.md`, `{phase}-{plan}-SUMMARY.md`. Le suffixe reste invariant.

## 7. Anti-entropie (plafonds DURS)

- `STATE.md` ≤ 300 lignes. Présent only. Au-delà → `size-gate` refuse l'écriture.
- `ROADMAP.md` ≤ 300 lignes. Horizon court détaillé, moyen+long en une ligne.
- Phase `complete` + `SUMMARY.md` → migrée en `_archive/phases/` par `/se-archive`. `phases/` ne contient QUE l'actif.
- `research/` et `audits/` de plus d'un milestone → `_archive/research/`, `_archive/audits/`.
- Binaires (screenshots) : jamais commités (cf. `.gitignore`).

## 8. Langue

- Contenu user-facing et `.md` de suivi : **français**.
- Code, noms de fichiers, commandes, termes techniques : **anglais**.
- Commentaires de code : anglais.

## 9. Modèle des agents (règle DURE)

**Aucune règle globale de modèle.** Pas de `CLAUDE_CODE_SUBAGENT_MODEL` dans les settings : une variable d'environnement qui s'applique à tout downgrade en silence des agents dont la tâche demande du raisonnement.

Chaque agent porte son modèle, à deux endroits qui doivent rester d'accord :

- **Définition d'agent** (`~/.claude/agents/*.md`) : `model:` obligatoire dans le frontmatter.
- **Skill qui spawne un agent générique** (sans `subagent_type` dédié) : `model` explicite dans l'appel au tool Agent.

Pour les agents GSD, le modèle passé au spawn vient de `get-shit-done/bin/lib/model-profiles.cjs`, qui **écrase** le frontmatter. Ce fichier est patché par `gsd-patches/lib/` : toutes les colonnes de profil y portent la même valeur, donc aucun profil (`quality`, `balanced`, `budget`) ne peut downgrader un agent.

Le choix du tier :

| Tier | Quand | Exemples |
|------|-------|----------|
| `opus` | Décision, jugement, conception, audit, debug — le défaut | planner, plan-checker, roadmapper, executor, verifier, debugger, researchers, ui-*, sous-agents de `/se-review` |
| `sonnet` | Travail mécanique : exploration en volume, agrégation d'output déjà produit, scoring sur grille fixe | codebase-mapper, research-synthesizer, user-profiler |

`haiku` n'est le modèle d'aucun agent. Un agent absent de la table retombe sur `sonnet`, jamais plus bas.

## 10. Stack par défaut (cf. SYSTEME.md §12)

Next.js 15 · React 19 · TS strict · Tailwind · Railway · Postgres (Railway/Supabase) · Prisma · Vitest · Playwright (E2E/visuel) · Zod · Auth Supabase ou BetterAuth.
