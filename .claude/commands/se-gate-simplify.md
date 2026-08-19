---
description: Gate SIMPLIFY du cycle de phase. Vérifie la simplicité du code modifié (duplication, complexité, sur-ingénierie, monolithes) via détecteur déterministe + jugement LLM croisés. S'insère entre VERIFY et SHIP. Quality only — ne chasse pas les bugs (c'est /se-review).
---

# Gate SIMPLIFY — simplicité avant ship

Tu es la gate de simplification du cycle. Tu vérifies que le code livré dans la phase est **simple, découplé, non dupliqué** — pas qu'il est correct (ça, c'est VERIFY / review).

Pattern : **deux assesseurs isolés puis croisés** (modèle impeccable). On ne fait jamais confiance à un seul regard.

## Étape 1 — Assesseur déterministe (B)
Lance le détecteur sur les fichiers modifiés de la phase :
- duplication de blocs (grep de patterns répétés),
- complexité (fonctions > 60 lignes, imbrication profonde),
- monolithes (fichiers > 400 lignes, > 12 exports) — cohérent avec `hooks/rules/monolith-thresholds.json`,
- logique dupliquée vs utilitaires centralisés existants (cf. Checklist Centralisation de /se-refactor),
- valeurs/listes hardcodées (cf. `hooks/rules/hardcode-patterns.json`).

Produit une liste factuelle `{ fichier, ligne, catégorie }`. AUCUN jugement à ce stade.

## Étape 2 — Assesseur LLM (A), isolé du détecteur
Sans regarder la sortie du détecteur, relis les fichiers modifiés et juge sémantiquement :
- une abstraction est-elle prématurée (factory pour une seule instance) ?
- une opportunité de réutiliser un composant/util existant a-t-elle été ratée ?
- la lisibilité souffre-t-elle d'une complexité évitable ?

## Étape 3 — Synthèse croisée
Croise A et B :
- **Accord A+B** → opportunité sûre, à proposer.
- **B seul** (détecteur signale, LLM ne confirme pas) → possible faux positif, à examiner.
- **A seul** (LLM voit, détecteur muet) → nuance que le scan rate.

Classe chaque opportunité : `P0` (à corriger avant ship) / `P1` (nice-to-have) / `rejet` (faux positif).

## Étape 4 — Sortie

**Mode rapport** (argument `--report-only`, c'est ainsi que le cycle t'invoque) : tu t'arrêtes ici. Tu ne modifies AUCUN fichier et tu ne poses AUCUNE question. Tu retournes ce bloc, et rien d'autre :

```
GATE SIMPLIFY · phase {N}
P0 {n} · P1 {m}
- [P0] fichier:ligne · <raison en une ligne> · fix : <le changement précis>
- [P1] fichier:ligne · <raison> · fix : <...>
```

Le cycle lance les gates en parallèle et groupe les rapports en un seul checkpoint (cf. `execute-phase`, step `quality_gates`). Trois gates ne réveillent pas l'humain trois fois.

**Mode direct** (invocation manuelle) : rends le checkpoint toi-même. Invoque `Skill(se-checkpoint)` de type `human-verify`, et respecte sa forme :

- `Fait` : les fichiers examinés et le périmètre.
- `Mesuré` : `P0 {n} · P1 {m}`, plus les catégories du détecteur.
- `À juger` : les P0 seulement, 4 maximum, chacun avec son fix en une ligne. Les P1 vont dans le journal, pas dans la question.
- `Regarder` : `git diff` du périmètre, ou les fichiers:lignes concernés.
- Question : `→ Appliquer les simplifications P0 ? [GO / NO-GO / sélection]`

Sur GO : appliquer (édition ciblée ou `/se-refactor`, Minimal Viable Change), puis `npm run build && npm run type-check`. Consigner dans `{phase}/CHECKPOINTS.md`.

## Règles
- Quality only. Si tu trouves un bug, NE le corrige PAS ici : note-le pour /se-review.
- Minimal Viable Change : pas de refacto opportuniste hors scope.
- Respecte CLAUDE.md : « no over-engineered solutions », « source unique », découplage.
- En mode rapport, écrire un fichier ou lancer un build est une faute : tu es une lecture, tu tournes en parallèle d'autres lectures.

---
**Phase / fichiers** : $ARGUMENTS
