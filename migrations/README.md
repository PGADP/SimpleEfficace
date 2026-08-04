# migrations/ — migrations d'installation

Scripts rejoués par `se update` pour accompagner les changements de structure du système entre deux versions (déplacement de fichiers dans `~/.claude`, renommage de clés de config, nettoyage d'anciens emplacements…).

## Mécanisme

- Un fichier par migration, nommé `NNN-slug.cjs` (ex : `001-move-rules-dir.cjs`). `NNN` est un entier croissant qui fixe l'ordre d'exécution.
- Chaque fichier exporte :

  ```js
  module.exports = {
    description: 'Ce que fait la migration, en une phrase',
    run({ repoRoot, home }) {
      // repoRoot : racine du repo SE (où qu'il soit cloné)
      // home     : home effectif (SE_HOME en test, os.homedir() sinon)
      // Lever une erreur = migration en échec, se update s'arrête là.
    },
  };
  ```

- `se update` lit `lastMigration` dans `~/.claude/se-state.json`, exécute dans l'ordre toutes les migrations dont le `NNN` est strictement supérieur, et met à jour `lastMigration` après **chaque** migration réussie. À la première qui échoue, il s'arrête : corriger, puis relancer `se update` reprend exactement où on en était.

## Règles d'écriture

- **Idempotente** : une migration peut être rejouée sans casse (tester l'état avant d'agir).
- **Node builtins uniquement**, zéro dépendance — comme tout le repo.
- **Jamais destructive sans filet** : déplacer ou archiver plutôt que supprimer.
- Tout chemin sous le home passe par le paramètre `home`, jamais par `os.homedir()` directement — c'est ce qui rend les migrations testables avec `SE_HOME`.
