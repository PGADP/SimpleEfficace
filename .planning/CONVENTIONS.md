# Conventions du système — loi de rangement et de nommage

> Document court et FIXE. Toute la machine s'y conforme. Lu par les hooks et les skills.
> But : tout est rangé et lié, **jamais greppé**. Une destination unique par type d'artefact.

---

## 1. La carte (anti-grep)

`INDEX.md` est la carte de tout. On le lit pour s'orienter, jamais une recherche à l'aveugle.
Il est **maintenu par hook**, pas à la main (sinon il pourrit).

## 2. Une destination unique par type d'artefact

| Tu cherches… | C'est ici, et nulle part ailleurs |
|---|---|
| L'état du jour | `.planning/STATE.md` |
| Les jalons / planning | `.planning/ROADMAP.md` |
| La vision / deadlines business | `.planning/STRATEGY.md` |
| La description produit + décisions | `.planning/PROJECT.md` |
| Une phase active | `.planning/phases/{NN}-{slug}/` |
| Une phase terminée | `.planning/_archive/phases/{NN}-{slug}/` |
| Une recherche | `.planning/research/{YYYY-MM-DD}-{slug}.md` |
| Le design-system | `.planning/design/DESIGN-SYSTEM.md` |
| Les personas UX | `.planning/design/PERSONAS.md` |
| Une banque de règles | `.planning/rules/{nom}.json` (données typées) |
| Une idée capturée | `.planning/todos/pending/` puis `done/` |
| Un milestone archivé | `.planning/_archive/milestones/{vX.Y}/` |
| Une spec de chantier système | `_design/{NN}-{nom}.md` |

## 3. Nommage des phases

- Dossier : `{NN}-{slug-kebab-case}/` — NN sur 2-3 chiffres, slug court en anglais.
- Insertion urgente : décimale `{72.1}-...` sans renuméroter la suite.
- Backlog : `999.x-...`.
- Archive : miroir exact sous `_archive/phases/`.

## 4. Nommage des fichiers DANS une phase (FIXES, MAJUSCULES)

Noms invariants pour qu'un parser les trouve sans grep :

| Fichier | Contenu |
|---|---|
| `CONTEXT.md` | décisions figées par DISCUSS |
| `RESEARCH.md` | recherche de la phase |
| `PLAN.md` | tâches, vagues, dépendances |
| `SUMMARY.md` | ce qui a réellement été fait |
| `VERIFICATION.md` | vérif goal-backward |
| `UI-SPEC.md` | contrat de design (si front) |
| `CHECKPOINTS.md` | journal des gates visuels + verdicts |

## 5. Anti-entropie (plafonds DURS)

- `STATE.md` ≤ 150 lignes. Présent only. Au-delà → `size-gate` refuse l'écriture.
- `ROADMAP.md` ≤ 200 lignes. Horizon court détaillé, moyen+long en une ligne.
- Phase `shipped` → migrée en `_archive/` automatiquement (`archive-hook`). `phases/` ne contient QUE l'actif.

## 6. Langue

- Contenu user-facing et `.md` de suivi : **français**.
- Code, noms de fichiers, commandes, termes techniques : **anglais**.
- Commentaires de code : anglais.

## 7. Stack par défaut (cf. SYSTEME.md §12)

Next.js 15 · React 19 · TS strict · Tailwind · Railway · Postgres (Railway/Supabase) · Prisma · Vitest · Playwright (E2E/visuel) · Zod · Auth Supabase ou BetterAuth.
