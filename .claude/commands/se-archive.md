---
description: Anti-entropie — archive les phases terminées vers .planning/_archive/phases/ pour garder phases/ propre. Déplace seulement ce qui est vraiment shippé (status complete + SUMMARY présent), puis recale les trois documents de suivi : INDEX.md, ROADMAP.md (empreinte d'une ligne) et STATE.md (chemins). Confirmation avant tout déplacement (opération sur dossiers).
---

# /se-archive — anti-entropie des phases

Tu déplaces les phases TERMINÉES de `.planning/phases/` vers `.planning/_archive/phases/` pour que le dossier de travail ne contienne que l'actif. Tu ne perds rien, tu ranges.

**Déplacer un dossier ne suffit pas.** Trois documents pointent vers les phases : `INDEX.md` (la carte), `ROADMAP.md` (le suivi) et `STATE.md` (la position). Une phase déplacée sans les recaler devient un chemin mort : les agents cherchent dans `phases/`, ne trouvent rien, et concluent que le travail n'a jamais eu lieu. Les étapes 4 à 6 sont donc aussi obligatoires que le déplacement lui-même.

**Règle de sécurité** : déplacer des dossiers est irréversible à la légère. Tu confirmes TOUJOURS avant de déplacer, et tu listes exactement ce qui bouge.

## Étape 1 — Détecter les phases archivables
Une phase est archivable si TOUTES ces conditions sont vraies :
1. Son dossier est dans `.planning/phases/{NN}-{slug}/`.
2. Elle est marquée **complete** dans ROADMAP.md (ou STATE.md).
3. Elle a un `SUMMARY.md` (preuve qu'elle a été exécutée, pas juste planifiée).
4. Elle n'est PAS la phase active courante.

```bash
# Phases marquées complete dans l'horizon court (s'arrêter avant `## Phases livrées` :
# cette section ne liste que des phases DÉJÀ archivées, les reprendre ferait boucler)
sed '/^## Phases livrées/,$d' .planning/ROADMAP.md | grep -iE "complete|✓|shipped"
# Pour chaque candidate, vérifier la présence d'un SUMMARY (le nom réel est
# {phase}-{plan}-SUMMARY.md côté GSD : globber, ne jamais deviner le préfixe)
ls .planning/phases/{NN}-*/*SUMMARY.md 2>/dev/null
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
{ git mv ".planning/phases/{NN}-{slug}" ".planning/_archive/phases/{NN}-{slug}" 2>/dev/null \
  || mv ".planning/phases/{NN}-{slug}" ".planning/_archive/phases/{NN}-{slug}" ; } \
  && echo "[$(date +%F)] archive: phases/{NN}-{slug} -> _archive/phases/" >> .planning/ARCHIVE.log
```
(Préférer `git mv` si le projet est versionné — préserve l'historique.)
Le `&&` est délibéré : un journal qui consigne un déplacement raté est pire que pas de journal.

## Étape 4 — Recaler INDEX.md
- Retirer la phase de la section « Phases actives ».
- L'ajouter sous « Phases archivées », avec le lien vers le SUMMARY à son nouveau chemin :
  `- ✓ {NN}-{slug} ([SUMMARY](_archive/phases/{NN}-{slug}/{nom réel du fichier}))`
  Le nom réel est celui trouvé à l'étape 1 : les workflows GSD préfixent (`{phase}-{plan}-SUMMARY.md`, par exemple `01-01-SUMMARY.md`). Copier le nom observé, ne jamais le reconstruire.
- Mettre à jour la date en tête de l'INDEX.

Note : l'INDEX est maintenu en continu à la clôture de chaque phase via le step `update_planning_index` du workflow execute-phase. Cette étape ne refait pas l'entrée : elle la déplace de « Phases actives » vers « Phases archivées » et corrige le chemin du lien, sans recréer la ligne.

Si `INDEX.md` n'existe pas, le créer depuis le scaffold avant d'archiver quoi que ce soit (`se sync-project` le fait) : sans la carte, une phase archivée est introuvable.

## Étape 5 — Condenser la phase dans ROADMAP.md
La phase sort de l'horizon court et laisse **une seule ligne d'empreinte** sous `## Phases livrées`.

Format, 80 caractères maximum, jamais plus :
```
- {NN}-{slug} · {vX.Y} · {ce que ça a livré, 6 mots max}
```
Exemple :
```
- 02-extraction · v0.1 · parseur PDF vers JSON
```

Règles :
- **Pas de nom de code inventé.** L'identifiant est `{NN}-{slug}`, le même que le dossier archivé : un seul identifiant par phase, et il sert de chemin.
- Supprimer la ligne correspondante du tableau de l'horizon court, ainsi que tout bloc de détail (plans, gates, checklists) que la phase y avait laissé.
- Ne jamais rallonger l'empreinte pour « garder le contexte » : le contexte est dans le SUMMARY archivé, dont le chemin se déduit du slug.

Le size-gate refuse `ROADMAP.md` au-delà de 300 lignes, 20 000 caractères, ou 300 caractères sur une seule ligne. Une empreinte de 80 caractères tient 40 phases sans approcher aucun plafond ; un paragraphe par phase les fait tous sauter.

## Étape 6 — Corriger les chemins dans STATE.md
Les phases déplacées laissent des chemins morts. Réécrire chaque occurrence :
```bash
# Repérer les chemins devenus faux (ne rien modifier à l'aveugle)
grep -n "phases/{NN}-{slug}" .planning/STATE.md .planning/INDEX.md
```
- `phases/{NN}-{slug}` → `_archive/phases/{NN}-{slug}` dans `STATE.md` et `INDEX.md`.
- Si `Fichier de reprise` pointait vers une phase archivée, le remettre à `Aucun` : une phase archivée n'est pas reprenable.
- Purger de « Contexte vivant » les décisions et bloqueurs qui appartenaient aux phases archivées.

Puis invoquer `/se-planning` avec l'argument « post-archivage : {N} phases sorties de l'horizon court, recaler la vue semaine et l'avancement du milestone ». C'est /se-planning qui tient ROADMAP/STRATEGY/STATE cohérents, pas ce skill.

## Étape 7 — Commit
```bash
git add -A .planning/
git commit -m "chore(archive): déplace {N} phases terminées vers _archive/"
```

## Étape 8 — Recherches et audits périmés (même confirmation)

Les phases ne sont pas la seule source d'entropie. `research/` et `audits/` gonflent aussi.

Est archivable un fichier dont le milestone d'origine est clos (date antérieure au dernier `complete-milestone`) :
```bash
mkdir -p .planning/_archive/research .planning/_archive/audits
git mv .planning/research/{YYYY-MM-DD}-{slug}.md .planning/_archive/research/
git mv .planning/audits/{YYYY-MM-DD}-{type}-{slug}.md .planning/_archive/audits/
```
Ne JAMAIS archiver une recherche citée par une phase active (grep du slug dans `.planning/phases/`).
Même règle qu'à l'étape 2 : lister, confirmer, puis déplacer. Recaler ensuite l'INDEX (section « Recherches et audits ») comme à l'étape 4.

## Milestones
Pour archiver un milestone entier terminé : déplacer ROADMAP+REQUIREMENTS vers `_archive/milestones/{vX.Y}/` (cf. /gsd-complete-milestone qui le fait déjà — préférer ce skill GSD natif pour les milestones, /se-archive sert surtout aux phases).

## Quand l'utiliser
- Le pilot le propose en triggers de maintenance ("ça fait 5 phases archivables, on range ?").
- Manuellement quand `.planning/phases/` devient chargé.
- En fin de milestone (mais /gsd-complete-milestone gère le gros).

---
**Cible** : $ARGUMENTS
