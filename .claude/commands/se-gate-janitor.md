---
description: Gate JANITOR du cycle de phase. Détecte et supprime le code mort (imports inutilisés, fichiers orphelins, deps non utilisées, console.log, types dupliqués, hardcode) via détecteur déterministe + jugement LLM croisés. S'insère après SIMPLIFY, avant SHIP. Supprime le mort, ne refactore pas le vivant.
---

# Gate JANITOR — nettoyage avant ship

Tu es la gate de nettoyage du cycle. Tu supprimes ce qui est **mort**, tu ne réorganises pas ce qui est vivant (ça, c'est SIMPLIFY/se-refactor).

Pattern : **deux assesseurs isolés puis croisés**, comme la gate SIMPLIFY. Le code mort qui n'est pas vraiment mort (import dynamique, usage par réflexion) est le piège n°1 → la catégorie SUSPECT ne se supprime jamais sans confirmation.

## Étape 1 — Assesseur déterministe (B)
Scan des fichiers modifiés + impact (réutilise la logique de /se-janitor) :
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

## Étape 4 — Sortie

**Mode rapport** (argument `--report-only`, c'est ainsi que le cycle t'invoque) : tu t'arrêtes ici. Tu ne supprimes RIEN, tu ne commites RIEN, tu ne poses AUCUNE question. Tu retournes ce bloc, et rien d'autre :

```
GATE JANITOR · phase {N}
DEAD {n} · VIOLATION {m} · SUSPECT {k}
- [DEAD] fichier:ligne · <quoi>
- [VIOLATION] fichier:ligne · <quoi> · fix : <migration proposée>
- [SUSPECT] fichier:ligne · <pourquoi le doute> · NON supprimé
```

Le cycle lance les gates en parallèle et groupe les rapports en un seul checkpoint (cf. `execute-phase`, step `quality_gates`). Trois gates ne réveillent pas l'humain trois fois.

**Mode direct** (invocation manuelle) : rends le checkpoint toi-même. Invoque `Skill(se-checkpoint)` de type `human-verify`, et respecte sa forme :

- `Fait` : le périmètre scanné.
- `Mesuré` : `DEAD {n} · VIOLATION {m} · SUSPECT {k}`.
- `À juger` : les SUSPECT seulement, 4 maximum. DEAD et VIOLATION sont mesurés, ils n'ont rien à faire dans la question : ils passent avec le GO.
- `Regarder` : les fichiers:lignes des SUSPECT.
- Question : `→ Supprimer DEAD + corriger VIOLATION ? [GO / NO-GO / sélection]`

Sur GO : supprimer DEAD, migrer VIOLATION, en **commits séparés par catégorie** (cf. /se-janitor), puis `npm run build && npm run type-check`. Consigner dans `{phase}/CHECKPOINTS.md`.

## Règles
- Supprime le mort, ne refactore pas le vivant.
- SUSPECT ne se supprime jamais sans validation humaine explicite.
- Commits atomiques séparés par catégorie.
- En mode rapport, supprimer un fichier ou commiter est une faute : tu es une lecture, tu tournes en parallèle d'autres lectures.

---
**Phase / fichiers** : $ARGUMENTS
