# INDEX — repo Simple & Efficace

> Carte du repo SE lui-même (le système, pas un projet applicatif).
> Ce `.planning/` accueille les éventuels dossiers de phases du développement du système.

## Système (racine — mis à jour via git pull)

- [../CONVENTIONS.md](../CONVENTIONS.md) — loi de rangement et de nommage (source unique)
- `../rules/ui-rules.json` — règles UI par défaut (un projet peut les surcharger dans son `.planning/rules/`)
- `../references/design/` — savoir design du système (heuristics, routage corpus)
- `../templates/` — templates copiés dans les projets (playwright.config, ui-verify, checkpoint-shots)
- `../hooks/`, `../scripts/`, `../vendor/`, `../gsd-patches/` — moteur du système

## Semence projet

- `../scaffold/` — copiée une fois par `se init` dans chaque nouveau projet (CLAUDE.md, .planning/, .gitignore)

## Documentation

- [../CLAUDE.md](../CLAUDE.md) — développer le système SE
- [../docs/SYSTEME.md](../docs/SYSTEME.md) — conception du système
