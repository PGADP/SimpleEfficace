---
description: Gate JANITOR du cycle de phase. Détecte et supprime le code mort (imports inutilisés, fichiers orphelins, deps non utilisées, console.log, types dupliqués, hardcode) via détecteur déterministe + jugement LLM croisés. S'insère après SIMPLIFY, avant SHIP. Supprime le mort, ne refactore pas le vivant.
---

# Gate JANITOR — nettoyage avant ship

Tu es la gate de nettoyage du cycle. Tu supprimes ce qui est **mort**, tu ne réorganises pas ce qui est vivant (ça, c'est SIMPLIFY/refactor).

Pattern : **deux assesseurs isolés puis croisés**, comme la gate SIMPLIFY. Le code mort qui n'est pas vraiment mort (import dynamique, usage par réflexion) est le piège n°1 → la catégorie SUSPECT ne se supprime jamais sans confirmation.

## Étape 1 — Assesseur déterministe (B)
Scan des fichiers modifiés + impact (réutilise la logique de /janitor) :
- imports/exports morts,
- fichiers orphelins (0 référence hors d'eux-mêmes),
- deps npm déclarées mais jamais importées,
- `console.log`/`console.debug` résiduels (hors logger) — cf. `hooks/rules` hygiene,
- types/constantes dupliqués (même nom, 2+ fichiers).

Classe chaque trouvaille : `DEAD` (0 référence, suppression sûre) / `VIOLATION` (console.log hors logger, doublon) / `SUSPECT` (1 seule référence, ou usage potentiel dynamique).

## Étape 2 — Assesseur LLM (A), isolé
Sans la sortie de B, relis pour confirmer : un « mort » est-il utilisé via `require(variable)`, un re-export, un test, une config runtime ? Un SUSPECT est-il en fait vivant ?

## Étape 3 — Synthèse croisée
- Accord A+B sur DEAD → suppression sûre.
- B dit DEAD, A doute → reclasser SUSPECT (ne pas supprimer).
- VIOLATION → migrer (console.log → logger) ou centraliser (doublon).
- SUSPECT → JAMAIS supprimé automatiquement.

## Étape 4 — Checkpoint humain (GO / NO-GO)
```
Gate JANITOR — Phase {N}
DEAD (suppression sûre) : {n}   VIOLATION : {m}   SUSPECT (à valider) : {k}

[liste DEAD + VIOLATION avec fichier:ligne]
[liste SUSPECT — nécessite ton avis, NON supprimés]

→ Supprimer DEAD + corriger VIOLATION ? [GO / NO-GO]
```
Si GO → supprimer DEAD, migrer VIOLATION, en **commits séparés par catégorie** (cf. /janitor), puis `npm run build && npm run type-check`. Consigner dans `{phase}/CHECKPOINTS.md`.

## Règles
- Supprime le mort, ne refactore pas le vivant.
- SUSPECT ne se supprime jamais sans validation humaine explicite.
- Commits atomiques séparés par catégorie.

---
**Phase / fichiers** : $ARGUMENTS
