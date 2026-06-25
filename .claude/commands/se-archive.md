---
description: Anti-entropie — archive les phases terminées vers .planning/_archive/phases/ pour garder phases/ propre. Déplace seulement ce qui est vraiment shippé (status complete + SUMMARY présent), met à jour INDEX.md. Confirmation avant tout déplacement (opération sur dossiers).
---

# /se-archive — anti-entropie des phases

Tu déplaces les phases TERMINÉES de `.planning/phases/` vers `.planning/_archive/phases/` pour que le dossier de travail ne contienne que l'actif. Tu ne perds rien — tu ranges.

**Règle de sécurité** : déplacer des dossiers est irréversible à la légère. Tu confirmes TOUJOURS avant de déplacer, et tu listes exactement ce qui bouge.

## Étape 1 — Détecter les phases archivables
Une phase est archivable si TOUTES ces conditions sont vraies :
1. Son dossier est dans `.planning/phases/{NN}-{slug}/`.
2. Elle est marquée **complete** dans ROADMAP.md (ou STATE.md).
3. Elle a un `SUMMARY.md` (preuve qu'elle a été exécutée, pas juste planifiée).
4. Elle n'est PAS la phase active courante.

```bash
# Phases marquées complete dans la roadmap
grep -iE "complete|✓|shipped" .planning/ROADMAP.md
# Pour chaque candidate, vérifier la présence d'un SUMMARY
ls .planning/phases/{NN}-*/*-SUMMARY.md 2>/dev/null
```

Ne JAMAIS archiver une phase :
- sans SUMMARY (peut-être juste planifiée, pas exécutée),
- décimale dont la phase parente est encore active (gap-closure en cours),
- mentionnée comme bloqueur/dépendance dans STATE.md.

## Étape 2 — Présenter le plan d'archivage (confirmation OBLIGATOIRE)
```
Phases archivables détectées :
- 01-fondations          (complete, SUMMARY ✓)
- 02-auth                (complete, SUMMARY ✓)

Restent actives (non touchées) :
- 03-extraction          (en cours)

→ Déplacer ces 2 phases vers _archive/phases/ ? [GO / sélection / NO-GO]
```
Attendre confirmation explicite. Pas de GO implicite.

## Étape 3 — Déplacer + tracer
Pour chaque phase confirmée :
```bash
mkdir -p .planning/_archive/phases
git mv ".planning/phases/{NN}-{slug}" ".planning/_archive/phases/{NN}-{slug}" 2>/dev/null \
  || mv ".planning/phases/{NN}-{slug}" ".planning/_archive/phases/{NN}-{slug}"
echo "[$(date +%F)] archive: phases/{NN}-{slug} -> _archive/phases/" >> .planning/ARCHIVE.log
```
(Préférer `git mv` si le projet est versionné — préserve l'historique.)

## Étape 4 — Mettre à jour INDEX.md
- Retirer la phase de la section "Phases actives".
- L'ajouter sous "Archive — Phases".
- Mettre à jour la date de l'INDEX.

## Étape 5 — Commit
```bash
git add -A .planning/
git commit -m "chore(archive): déplace {N} phases terminées vers _archive/"
```

## Milestones
Pour archiver un milestone entier terminé : déplacer ROADMAP+REQUIREMENTS vers `_archive/milestones/{vX.Y}/` (cf. /gsd:complete-milestone qui le fait déjà — préférer ce skill GSD natif pour les milestones, /se-archive sert surtout aux phases).

## Quand l'utiliser
- Le pilot le propose en triggers de maintenance ("ça fait 5 phases archivables, on range ?").
- Manuellement quand `.planning/phases/` devient chargé.
- En fin de milestone (mais /gsd:complete-milestone gère le gros).

---
**Cible** : $ARGUMENTS
