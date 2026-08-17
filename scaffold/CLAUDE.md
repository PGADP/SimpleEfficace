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
node "$HOME/.claude/se/scripts/install-gsd-patches.cjs"   # applique les enrichissements SE au moteur global
                                       # (à relancer après chaque /gsd:update)
```

## Ce qui est actif dans ce projet

- **Skills** (`.claude/commands/`) : `/se-pilot`, `/se-interview`, `/se-new-project`, `/se-ui`, `/se-ux`, `/se-research`, `/se-humanizer`, `/se-dev`, `/se-review` (+ modes `lint`/`perf`), `/se-security`, `/se-test`, `/se-gate-simplify`, `/se-gate-janitor`, etc.
- **Garde-fous** (`.claude/settings.json` → `~/.claude/se/hooks/`) — actifs au démarrage de session :
  - advisory (dispatcher `se-guard.cjs`) : `humanizer-guard` (contenu user-facing), `ui-guard` (front), `hardcode-guard`, `hygiene-guard`, `monolith-guard`, `security-guard` (secrets, XSS, eval, Zod manquant), `placement-guard` (fichier de suivi rangé hors de sa destination unique)
  - bloquants : `size-gate` (STATE.md > 300 / ROADMAP.md > 300 lignes), `slop-gate` (commit de contenu AI-slop), `secret-gate` (commit de secrets — insensible au `--no-verify`), `ui-contract-gate` (écriture front refusée tant que DESIGN-SYSTEM.md §0 et §2.1 hiérarchie visuelle ne sont pas remplis ; injecte le plancher de qualité impeccable à la première édition front de la session), `ui-gate` (commit de fichiers front refusé sans passe `/se-ui` validée : anti-patterns mesurés + GO humain avec URL, registre `.planning/design/ui-passes.json`)
- **Cycle GSD enrichi** (`~/.claude/se/gsd-patches/` → moteur global) : gates simplify + janitor + **security** + visual-checkpoint, activées via `.planning/config.json`.
- **Contrats** : `~/.claude/se/CONVENTIONS.md` (**loi de rangement — source unique de l'arborescence**), `.planning/design/DESIGN-SYSTEM.md` (dont §0.1 plateforme et public cible, §0.2 direction esthétique, §0.3 molettes, §2.1 hiérarchie visuelle), `.planning/design/JOURNEYS.md` (parcours E2E, maintenu par `/se-ux`), `~/.claude/se/references/design/` (heuristiques + table de routage), règles UI : `.planning/rules/ui-rules.json` du projet s'il existe, sinon `~/.claude/se/rules/ui-rules.json` (10 piliers, critères mesurables).
- **Corpus de design** (`~/.claude/se/vendor/design/`) : impeccable, platform-design-skills, ui-ux-pro-max — sous-ensembles curatés, versions épinglées, **jamais édités à la main** (`node "$HOME/.claude/se/scripts/sync-design-vendors.cjs"`). Chargés à la demande, une référence par tâche.
- **Headers de sécurité** : dès la première route publique, poser le bloc `headers()` de `.planning/_templates/security-headers.md` dans `next.config.ts` (la gate SECURITY le rappelle).
- **Règle des rapports** : un rapport ne s'écrit sur disque que s'il sera relu. Éphémère (`/se-review`, `/se-test`, `/se-deploy`, `/se-health-check`) → chat, aucun fichier. Lié à une phase → `phases/{NN}-{slug}/CHECKPOINTS.md`. Transverse persistant → `.planning/audits/{YYYY-MM-DD}-{type}-{slug}.md`. **Jamais à la racine du repo.**
- **Contrat de design obligatoire** : sur un projet avec interface, `/se-new-project` étape 6 remplit DESIGN-SYSTEM.md §0.1 (plateforme et public cible), §0.2 (direction esthétique), §0.3 (molettes) et §2.1 (hiérarchie visuelle : ratio titre/corps, focal point unique, niveaux d'action) avant toute ligne de front. Tout ce qui écrit du code visible — `/se-dev`, `/se-fix`, `gsd-executor` — lit ce contrat **avant** d'écrire. Tant qu'il est au statut `SQUELETTE`, `ui-guard` le signale à chaque édition front.
- **Rituel UI** (toute création/modif/suppression d'élément visible), dans l'ordre :
  1. **Contrat** — DESIGN-SYSTEM.md lu, direction esthétique déclarée, molettes respectées, hiérarchie §2.1 appliquée.
  2. **Cycle craft → CRITIQUE → polish** — la passe de critique n'est pas optionnelle. Un premier jet n'est jamais beau, il est correct.
  3. **Parcours** — cohérence avec JOURNEYS.md.
  4. **Humanizer** — sur les textes réellement affichés (`text.visible` du `ui-report.json`).
  5. **Mesure** — `UI_ROUTE=… npx playwright test tests/e2e/ui-verify.spec.ts` puis `node "$HOME/.claude/se/scripts/ui-verdict.cjs" --name <écran>`.
  6. **Checkpoint humain + passe** — lancer le serveur, donner à l'humain l'**URL exacte** de la page, attendre son GO explicite, puis enregistrer : `node "$HOME/.claude/se/scripts/ui-pass.cjs" record <fichiers> --url <url> --go "<réponse>"`. Sans passe enregistrée, `ui-gate` **refuse le commit**.

  Rappelé par le hook `ui-guard`, imposé par `ui-contract-gate` (écriture) et `ui-gate` (commit). Un BLOCK mesuré arrête la livraison (`workflow.ui_gate_blocking`) ; une métrique absente ne bloque jamais.

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
