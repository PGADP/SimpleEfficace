# Références design — protocole de chargement

Le volume de connaissance UI/UX ne vit pas dans les skills : `/se-ui` et `/se-ux` restent
courts et **chargent une référence à la demande**, selon la tâche. Charger tout le corpus
à chaque invocation coûterait des dizaines de milliers de tokens et diluerait les
instructions.

## Table de routage

| Tâche | Charger | Poids |
|-------|---------|-------|
| Auditer un parcours, chercher de la friction | `heuristics.md` (ici) | ~4 Ko |
| Concevoir / critiquer / polir du visuel | `vendor/design/impeccable/reference/<commande>.md` | 5-20 Ko |
| Avant toute édition d'UI | `vendor/design/impeccable/reference/craft-floor.md` | ~15 Ko |
| Respecter les conventions d'une plateforme | `vendor/design/platform-design-skills/skills/<plateforme>/rules/_sections.md` | ~40 Ko |
| Choisir une direction esthétique (projet vierge) | `vendor/design/ui-ux-pro-max/scripts/search.py` | exécuté, pas lu |
| Critères de verdict | `.planning/rules/ui-rules.json` | ~9 Ko |

## Règles

1. **Une seule référence plateforme par session**, celle déclarée en section 0.1 de
   `DESIGN-SYSTEM.md`. Pas de chargement « au cas où ».
2. **Une seule référence impeccable par tâche**, celle qui correspond au mode invoqué
   (`critique.md` pour une critique, `polish.md` pour un polish). La table complète est
   dans `vendor/design/impeccable/SKILL.src.md`.
3. Les fichiers `vendor/` sont **en lecture seule** — voir `vendor/design/README.md`.
4. Le contrat du projet (`DESIGN-SYSTEM.md`, `ui-rules.json`, `JOURNEYS.md`) prime
   toujours sur une référence externe en cas de conflit. Les corpus vendorisés sont des
   sources de savoir, pas des sources d'autorité.

## Ajouter une référence propre au projet

Un fichier `.md` ici, plus une ligne dans la table ci-dessus. Le critère d'admission :
la connaissance est réutilisée sur plusieurs phases et n'existe dans aucun corpus
vendorisé. Sinon, elle appartient à l'UI-SPEC de la phase concernée.
