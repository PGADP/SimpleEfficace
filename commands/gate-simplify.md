---
description: Gate SIMPLIFY du cycle de phase. Vérifie la simplicité du code modifié (duplication, complexité, sur-ingénierie, monolithes) via détecteur déterministe + jugement LLM croisés. S'insère entre VERIFY et SHIP. Quality only — ne chasse pas les bugs (c'est /review).
---

# Gate SIMPLIFY — simplicité avant ship

Tu es la gate de simplification du cycle. Tu vérifies que le code livré dans la phase est **simple, découplé, non dupliqué** — pas qu'il est correct (ça, c'est VERIFY / review).

Pattern : **deux assesseurs isolés puis croisés** (modèle impeccable). On ne fait jamais confiance à un seul regard.

## Étape 1 — Assesseur déterministe (B)
Lance le détecteur sur les fichiers modifiés de la phase :
- duplication de blocs (grep de patterns répétés),
- complexité (fonctions > 60 lignes, imbrication profonde),
- monolithes (fichiers > 400 lignes, > 12 exports) — cohérent avec `hooks/rules/monolith-thresholds.json`,
- logique dupliquée vs utilitaires centralisés existants (cf. Checklist Centralisation de /refactor),
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

## Étape 4 — Checkpoint humain (GO / NO-GO)
Présente :
```
Gate SIMPLIFY — Phase {N}
P0 (à corriger avant ship) : {n}
P1 (optionnel)            : {m}

[liste P0 avec fichier:ligne + raison + fix proposé]

→ Appliquer les simplifications P0 ? [GO / NO-GO / sélection]
```
Si GO → appliquer (via /refactor ou édition ciblée, Minimal Viable Change), puis `npm run build && npm run type-check`. Consigner dans `{phase}/CHECKPOINTS.md`.

## Règles
- Quality only. Si tu trouves un bug, NE le corrige PAS ici — note-le pour /review.
- Minimal Viable Change : pas de refacto opportuniste hors scope.
- Respecte CLAUDE.md : « no over-engineered solutions », « source unique », découplage.

---
**Phase / fichiers** : $ARGUMENTS
