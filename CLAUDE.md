# CLAUDE.md — Projet sous Simple & Efficace

> Ce projet est piloté par le système **Simple & Efficace** (skills + agents + hooks + cycle GSD).
> Au clone, le projet est **vierge** : pas encore de code applicatif, juste le système.

## Premier réflexe

Si le projet n'a pas encore de code (pas de `package.json`, pas de `src/`) :
→ **Lance `/se-new-project "<ton idée>"`** pour le cadrer (pilot → brainstorm → PRD → research → roadmap).
→ Ou `/se-pilot` pour discuter d'abord avec le cofondateur.

Ne **jamais** inventer une architecture ou un CLAUDE.md détaillé tant qu'il n'y a pas de code réel à documenter.

## Prérequis (une fois par machine)

Le système s'appuie sur **GSD installé globalement** (`~/.claude/get-shit-done/`) + les patches SE :

```bash
node scripts/install-gsd-patches.cjs   # applique les enrichissements SE au moteur global
                                       # (à relancer après chaque /gsd:update)
```

## Ce qui est actif dans ce projet

- **Skills** (`.claude/commands/`) : `/se-pilot`, `/se-new-project`, `/se-ui`, `/se-ux`, `/se-research`, `/se-humanizer`, `/se-dev`, `/se-review` (+ modes `lint`/`perf`), `/se-security`, `/se-test`, `/se-gate-simplify`, `/se-gate-janitor`, etc.
- **Garde-fous** (`.claude/settings.json` → `hooks/`) — actifs au démarrage de session :
  - advisory (dispatcher `se-guard.cjs`) : `humanizer-guard` (contenu user-facing), `ui-guard` (front), `hardcode-guard`, `hygiene-guard`, `monolith-guard`, `security-guard` (secrets, XSS, eval, Zod manquant)
  - bloquants : `size-gate` (STATE.md > 150 / ROADMAP.md > 200 lignes), `slop-gate` (commit de contenu AI-slop), `secret-gate` (commit de secrets — insensible au `--no-verify`)
- **Cycle GSD enrichi** (`gsd-patches/` → moteur global) : gates simplify + janitor + **security** + visual-checkpoint, activées via `.planning/config.json`.
- **Contrats** (`.planning/`) : `design/DESIGN-SYSTEM.md`, `rules/ui-rules.json`, `CONVENTIONS.md`.
- **Hors template** : la suite marketing (spécifique My Mozaica) vit dans `extras/marketing-mymozaica/` et s'installe par projet.

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
