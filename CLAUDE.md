# CLAUDE.md — Projet sous Simple & Efficace

> Ce projet est piloté par le système **Simple & Efficace** (skills + agents + hooks + cycle GSD).
> Au clone, le projet est **vierge** : pas encore de code applicatif, juste le système.

## Premier réflexe

Si le projet n'a pas encore de code (pas de `package.json`, pas de `src/`) :
→ **Lance `/se-new-project "<ton idée>"`** pour le cadrer (pilot → brainstorm → PRD → research → roadmap).
→ Ou `/se-pilot` pour discuter d'abord avec le cofondateur.

Ne **jamais** inventer une architecture ou un CLAUDE.md détaillé tant qu'il n'y a pas de code réel à documenter.

## Ce qui est actif dans ce projet

- **Skills** (`.claude/commands/`) : `/se-pilot`, `/se-new-project`, `/se-ui`, `/se-ux`, `/se-research`, `/se-humanizer`, `/se-dev`, `/se-review`, `/se-test`, `/se-gate-simplify`, `/se-gate-janitor`, etc.
- **Garde-fous** (`.claude/settings.json` → `hooks/`) — actifs au démarrage de session :
  - `humanizer-guard` : rappelle `/se-humanizer` sur le contenu user-facing
  - `ui-guard` : rappelle le design-system sur l'édition front
  - `hardcode-guard` / `hygiene-guard` / `monolith-guard` : qualité (advisory)
  - `size-gate` : bloque STATE.md > 150 / ROADMAP.md > 200 lignes
  - `slop-gate` : bloque le commit de contenu AI-slop
- **Cycle GSD enrichi** (`get-shit-done/`) : gates simplify/se-janitor/visual-checkpoint actives (cf. `.planning/config.json`).
- **Contrats** (`.planning/`) : `design/DESIGN-SYSTEM.md`, `rules/ui-rules.json`, `CONVENTIONS.md`.

## Stack par défaut

Next.js 15 (App Router) · React 19 · TypeScript strict · Tailwind · Railway · Postgres (Railway) ou Supabase · Prisma · Vitest · Playwright. Auth : Supabase ou BetterAuth. Validation : Zod.
*(À confirmer / adapter via `/se-new-project` selon le projet.)*

## Conventions

- Français user-facing, anglais technique (code, noms, commandes).
- Pas de valeurs/listes hardcodées quand une règle générique existe.
- Source unique pour les types/config partagés.
- Commits atomiques, Conventional Commits.

---
*Système : voir [docs/SYSTEME.md](docs/SYSTEME.md). Documentation complète sur [github.com/PGADP/SimpleEfficace](https://github.com/PGADP/SimpleEfficace).*
