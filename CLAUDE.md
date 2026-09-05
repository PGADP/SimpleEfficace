# CLAUDE.md — Développement du système Simple & Efficace

Ce repo EST le système **Simple & Efficace** (skills + hooks + scripts + corpus design). Il s'installe une fois par machine dans `~/.claude/se/` et se met à jour par `git pull`. Ce n'est **pas** un projet applicatif : ici on développe le système lui-même.

## Frontière système / scaffold

- **Racine du repo** = le système : `hooks/`, `scripts/`, `vendor/`, `references/`, `templates/`, `rules/`, `gsd-patches/`, `CONVENTIONS.md`. Mis à jour via git pull, jamais dupliqué dans les projets.
- **`scaffold/`** = la semence projet : copiée une fois dans chaque nouveau projet par `se init`, puis elle appartient au projet (le système ne la retouche plus).

## Tests (à lancer avant de rendre toute modification)

```bash
node hooks/se-guard.test.cjs
node hooks/se-gates.test.cjs
node hooks/se-branch-sweep.test.cjs
node scripts/ui-verdict.test.cjs
node scripts/se-serve.test.cjs
node scripts/se.test.cjs
```

## Conventions

- Français pour tout le contenu user-facing, anglais technique (code, noms de fichiers, commandes, commentaires).
- Conventional Commits obligatoires, commits atomiques.
- **Jamais éditer `vendor/` à la main** : le contenu vient des upstreams via `scripts/sync-design-vendors.cjs`.
