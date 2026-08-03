# JOURNEYS — parcours utilisateur end-to-end (source unique)

> Fichier de suivi des parcours clients, maintenu par `/se-ux` (mode build pour créer, mode audit pour vérifier).
> Lu par : `/se-ux`, `/se-ui` (cohérence d'une étape avec son parcours), le checkpoint visuel du cycle (quelles routes capturer), et `gsd-ui-researcher`.
> Règles : un parcours = une section. Statuts d'étape : `à-construire` / `construit` / `vérifié` (vérifié = passé au checkpoint visuel + audit UX). Plafond ~30 lignes par parcours — le détail vit dans les UI-SPEC de phase.

*(vierge — lance `/se-ux build "<nom du parcours>"` après le cadrage pour créer le premier parcours)*

---

## Template (copier pour chaque parcours)

```markdown
## J{N} — {Nom du parcours} · persona : {nom} · statut : à-construire

**JTBD** : Quand {situation}, je veux {tâche}, pour {gain}.
**Entrée** : {d'où vient l'utilisateur — ad, SEO, email, lien direct}
**Succès** : {l'action mesurable qui clôt le parcours}

| # | Étape | Route/écran | États couverts | Statut | Friction connue |
|---|-------|-------------|----------------|--------|-----------------|
| 1 | {étape} | `/{route}` | vide·erreur·loading | à-construire | — |

**Points de mesure** : {où on saura si ça convertit — events, funnel}
**Dernier audit UX** : {date ou jamais} · **Dernier checkpoint visuel** : {date ou jamais}
```
