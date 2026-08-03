---
description: Explication pédagogique d'un code — vue d'ensemble, flux d'exécution, concepts clés, pièges. Pour apprendre, pas pour auditer (ça c'est /se-review).
---

Explique ce code comme si tu faisais une code review pédagogique :

1. **Vue d'ensemble** — Quel problème ce code résout (1-2 phrases)
2. **Flux d'exécution** — Étape par étape, que se passe-t-il
3. **Concepts clés** — Patterns, techniques, APIs utilisées
4. **Points d'attention** — Subtilités, pièges potentiels
5. **Dépendances** — Ce dont ce code a besoin pour fonctionner

Niveau de détail adapté à un dev intermédiaire.

Cible : $ARGUMENTS

## Où ça se range

**Rien sur disque.** Ce rapport est éphémère : verdict consommé en séance. Tu réponds en chat et tu crées les todos avec `TodoWrite`. Tu n'écris **aucun** fichier `.md`, ni à la racine du repo, ni dans `.planning/`.

Exception unique : l'utilisateur demande explicitement une trace écrite → `.planning/audits/{YYYY-MM-DD}-explain-{slug}.md`.

Loi complète : `~/.claude/se/CONVENTIONS.md` §4. Le hook `placement-guard` alerte si tu déposes un rapport ailleurs.
