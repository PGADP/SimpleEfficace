# INDEX — repo Simple & Efficace

> Carte du repo SE lui-même (le système, pas un projet applicatif).
> Ce `.planning/` accueille les éventuels dossiers de phases du développement du système.

## Suivi

- [GLOSSARY.md](GLOSSARY.md) : le vocabulaire du système, un concept, le mot retenu, les synonymes bannis

## Système (racine — mis à jour via git pull)

- [../CONVENTIONS.md](../CONVENTIONS.md) — loi de rangement et de nommage (source unique)
- `../rules/ui-rules.json` — règles UI par défaut (un projet peut les surcharger dans son `.planning/rules/`)
- `../references/design/` — savoir design du système (heuristics, routage corpus)
- `../references/prompt/` — grilles d'audit de prompts (`grid-agent.md`, `grid-app.md`) + routage, lues par `/se-prompt`
- `../templates/` — templates copiés dans les projets (playwright.config, ui-verify, SUMMARY)
- `../hooks/`, `../scripts/`, `../vendor/`, `../gsd-patches/` — moteur du système

## Semence projet

- `../scaffold/` — copiée une fois par `se init` dans chaque nouveau projet (CLAUDE.md, .planning/, .gitignore)

## Documentation

- [../CLAUDE.md](../CLAUDE.md) — développer le système SE
- [../docs/SYSTEME.md](../docs/SYSTEME.md) — conception du système
