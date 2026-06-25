# INDEX — carte du projet

> La carte de tout. On lit ce fichier pour s'orienter, jamais un grep.
> Maintenu par hook (à terme). Pour l'instant : tenu à jour manuellement pendant la construction du système.
> Dernière mise à jour : 2026-06-24.

## Pilotage

- [SYSTEME.md](../SYSTEME.md) — conception complète du système (source de vérité du design)
- [CONVENTIONS.md](CONVENTIONS.md) — loi de rangement et de nommage
- STATE.md — état du jour *(à créer au premier projet réel)*
- ROADMAP.md — jalons *(à créer au premier projet réel)*
- STRATEGY.md — vision / deadlines *(à créer au premier projet réel)*
- PROJECT.md — produit + décisions *(à créer au premier projet réel)*

## Phases actives

*(aucune — le système est en construction)*

## Design

- [design/DESIGN-SYSTEM.md](design/DESIGN-SYSTEM.md) — ✅ contrat unique (tokens OKLCH/Tailwind, typo, spacing, 6 piliers, MASTER+overrides)
- [design/PERSONAS.md](design/PERSONAS.md) — ✅ template personas (lu par /ux)
- [design/playwright.config.template.ts](design/playwright.config.template.ts) + [checkpoint-shots.template.ts](design/checkpoint-shots.template.ts) — ✅ vision (config + helper screenshot, projet-agnostiques)

## Cycle GSD enrichi (get-shit-done/ rapatrié, v1.29)

- [get-shit-done/workflows/execute-phase.md](../get-shit-done/workflows/execute-phase.md) — ✅ modifié : steps `simplify_janitor_gate` + `visual_checkpoint_gate` (Playwright) branchés dans le cœur
- [commands/init.md](../commands/init.md) — ✅ démarrage projet (pilot→brainstorm→PRD→research→roadmap)
- [.planning/_templates/config.template.json](_templates/config.template.json) — ✅ toggles : tdd_mode, simplify_gate, janitor_gate, visual_checkpoint

## Skills clés (commands/)

- [commands/pilot.md](../commands/pilot.md) — ✅ routeur mince (214 l.), sparring intact + renvois lazy
- [commands/pilot/](../commands/pilot/) — ✅ sous-skills briefing / closure / strategic-discussion (user-invocable:false)
- [commands/ux.md](../commands/ux.md) — ✅ expert UX personas (distinct de /ui)
- [commands/gate-simplify.md](../commands/gate-simplify.md) + [gate-janitor.md](../commands/gate-janitor.md) — ✅ gates cycle (détecteur+LLM croisés)
- [commands/humanizer.md](../commands/humanizer.md) — ✅ 33 marqueurs + anti-faux-positifs (règle des clusters)
- [agents/researcher.md](../agents/researcher.md) — ✅ + 4 APIs académiques (niveau scientifique)

## Règles (banques source-unique)

- [rules/ui-rules.json](rules/ui-rules.json) — ✅ 18 règles, 6 piliers, Severity→BLOCK/FLAG, règle DOWNGRADE. Lu par checker/auditor/researcher + ui-guard.
- hooks/rules/slop-rules.json — ✅ marqueurs AI-slop FR (chantier 1)
- rules/code-rules.json — *(à créer si besoin — patterns hardcode déjà dans hooks/rules/)*

## Recherches

*(aucune)*

## Chantiers système (specs)

- [_design/01-garde-fous.md](../_design/01-garde-fous.md) — spec hooks Strate A

## Hooks (Strate A) — construits

- [hooks/se-guard.cjs](../hooks/se-guard.cjs) — dispatcher PostToolUse advisory (5 garde-fous : humanizer, ui, hardcode, hygiene, monolith)
- [hooks/guard-lib.cjs](../hooks/guard-lib.cjs) — logique pure testable
- [hooks/rules/](../hooks/rules/) — slop-rules, hardcode-patterns, monolith-thresholds (source unique)
- [hooks/se-guard.test.cjs](../hooks/se-guard.test.cjs) — vérif déterministe (9/9 pass)
- [hooks/se-size-gate.cjs](../hooks/se-size-gate.cjs) — **BLOQUANT** : refuse STATE.md >150 / ROADMAP.md >200 lignes, avertit à 90% (7/7 cas vérifiés)
- [.claude/settings.json](../.claude/settings.json) — câblage LOCAL au projet (PreToolUse size-gate + PostToolUse se-guard)
- ⏳ à venir : slop-gate au commit (bloquant), archive-hook

## Archive

- _archive/phases/ — phases terminées
- _archive/milestones/ — milestones clos

## Sources clonées (référence cherry-pick, hors système)

- _sources/get-shit-done · ui-ux-pro-max-skill · impeccable · hyperresearch · humanizer · claude-code-best-practice · claude-config
