---
description: Anti-entropie : trie et archive les phases terminées. Ne garde de chaque phase que ce qu'un humain a jugé (SUMMARY, CHECKPOINTS, HUMAN-UAT) et supprime ce qui décrivait une intention ou un état du code (CONTEXT, RESEARCH, PLAN, VERIFICATION, UI-SPEC), récupérable par git à l'ancre consignée dans ARCHIVE.log. Puis recale les quatre documents de suivi : INDEX.md, ROADMAP.md (la phase en sort), PHASES.md (empreinte d'une ligne) et STATE.md (chemins + quicks). Confirmation obligatoire avant tout déplacement et toute suppression.
---

# /se-archive — anti-entropie des phases

Tu tries les phases TERMINÉES, puis tu déplaces ce qui mérite de survivre de `.planning/phases/` vers `.planning/_archive/phases/`. Tu ne perds rien : git garde l'intégralité, et l'ancre consignée dans `ARCHIVE.log` rend n'importe quel fichier supprimé en une commande.

**Déplacer un dossier ne suffit pas.** Quatre documents pointent vers les phases : `INDEX.md` (la carte), `ROADMAP.md` (l'à-venir et l'en-cours), `PHASES.md` (le registre du livré) et `STATE.md` (la position). Une phase déplacée sans les recaler devient un chemin mort : les agents cherchent dans `phases/`, ne trouvent rien, et concluent que le travail n'a jamais eu lieu. Les étapes 4 à 6 sont donc aussi obligatoires que le déplacement lui-même.

**Règle de sécurité** : déplacer des dossiers et supprimer des fichiers est irréversible à la légère. Tu confirmes TOUJOURS avant, et tu listes exactement ce qui bouge ET ce qui disparaît, phase par phase, avec le compte.

## Étape 1 : Détecter les phases archivables
Une phase est archivable si TOUTES ces conditions sont vraies :
1. Son dossier est dans `.planning/phases/{NN}-{slug}/`.
2. Elle est marquée **complete** dans ROADMAP.md (ou STATE.md).
3. Elle a un `SUMMARY.md` (preuve qu'elle a été exécutée, pas juste planifiée). Sa complétude décide du tri : cf. étape 1.5.
4. Elle n'est PAS la phase active courante.

```bash
# Phases marquées complete dans l'horizon court (s'arrêter avant `## Phases livrées` si la
# section existe encore : c'est un simple renvoi vers PHASES.md, ou d'anciennes empreintes
# sur un projet antérieur au registre — dans les deux cas, déjà archivé, les reprendre ferait boucler)
sed '/^## Phases livrées/,$d' .planning/ROADMAP.md | grep -iE "complete|✓|shipped"
# Pour chaque candidate, vérifier la présence d'un SUMMARY (le nom réel est
# {phase}-{plan}-SUMMARY.md côté GSD : globber, ne jamais deviner le préfixe)
ls .planning/phases/{NN}-*/*SUMMARY.md 2>/dev/null
```

Ne JAMAIS archiver une phase :
- sans SUMMARY (peut-être juste planifiée, pas exécutée),
- décimale dont la phase parente est encore active (gap-closure en cours),
- mentionnée comme bloqueur/dépendance dans STATE.md.

## Étape 1.5 : Le tri (mesure, avant toute confirmation)

Une phase archivée ne part pas entière. La règle : **on garde ce qu'un humain a jugé, on supprime ce qui décrivait une intention (avant l'implémentation) ou un état du code (après)**. Un `PLAN.md` de 2026 relu en 2027 décrit un code qui n'existe plus, et il le décrit avec assurance : c'est un piège, pas une archive.

| Fichier | Sort |
|---|---|
| `*SUMMARY.md` | **conservé** : c'est le survivant de la phase |
| `CHECKPOINTS.md` | **conservé** : verdicts de gates validés par un humain |
| `HUMAN-UAT.md` | **conservé** : verdict humain |
| `*CONTEXT.md` · `*RESEARCH.md` · `*PLAN.md` | supprimés : de l'intention, périmée dès la première tâche |
| `*VERIFICATION.md` · `UI-SPEC.md` · `UI-REVIEW.md` · `REVIEWS.md` | supprimés : un état du code à une date |
| `.continue-here.md` | supprimé : transitoire de reprise |

**Le verrou : on ne supprime que si le SUMMARY est complet.** Sur chaque phase confirmée, vérifier avant de toucher à quoi que ce soit :

```bash
S=$(ls .planning/phases/{NN}-*/*SUMMARY.md | head -1)
grep -q '^commits:' "$S" && echo "ancre ok" || echo "ancre MANQUANTE"
for T in "Pourquoi c'est comme ça" "Ce qu'on a refusé" "Ce qui nous a résisté" \
         "Ce que le plan n'avait pas vu" "Dette laissée sciemment"; do
  grep -qF "## $T" "$S" && echo "ok   $T" || echo "MANQUE $T"
done
```

Une seule ligne manquante et **la phase s'archive entière, sans aucune suppression**. Tu le dis à l'humain en nommant ce qui manque : `03-extraction : SUMMARY d'ancien format (pas de champ commits), archivée telle quelle`. Supprimer les jetables autour d'un SUMMARY incomplet, c'est perdre pour de bon ce qu'il aurait dû reprendre.

**Jetable ne veut pas dire perdu.** Git garde tout. Avant la première suppression, capturer l'ancre de récupération :

```bash
ANCRE=$(git rev-parse --short HEAD)
```

N'importe quel fichier supprimé se relit ensuite par `git show {ANCRE}:.planning/phases/{NN}-{slug}/{fichier}`. Ce qu'on retire, ce n'est pas le contenu : c'est la possibilité qu'un agent le relise par accident en croyant lire le présent.

## Étape 2 : Présenter le plan d'archivage (confirmation OBLIGATOIRE)
```
Phases archivables détectées :
- 01-fondations          (complete, SUMMARY complet)        → 5 jetables supprimés
- 02-auth                (complete, SUMMARY complet)        → 4 jetables supprimés
- 03-extraction          (complete, SUMMARY ancien format)  → archivée entière, rien supprimé

Restent actives (non touchées) :
- 04-export              (en cours)

Récupération : git show {ANCRE}:.planning/phases/{NN}-{slug}/{fichier}

→ Déplacer ces 3 phases et supprimer les 9 jetables ? [GO / sélection / NO-GO]
```
Attendre confirmation explicite. Pas de GO implicite. Le compte de jetables se lit phase par phase : l'humain doit voir combien de fichiers disparaissent avant de dire oui.

## Étape 3 : Supprimer, déplacer, tracer
Pour chaque phase confirmée, dans cet ordre :
```bash
# $ANCRE vient de l'étape 1.5, capturée avant toute suppression
P=".planning/phases/{NN}-{slug}"

# 1. Les jetables (seulement si le verrou de l'étape 1.5 est passé)
git rm -q "$P"/*CONTEXT.md "$P"/*RESEARCH.md "$P"/*PLAN.md "$P"/*VERIFICATION.md \
          "$P"/UI-SPEC.md "$P"/UI-REVIEW.md "$P"/REVIEWS.md "$P"/.continue-here.md 2>/dev/null

# 2. Ce qui reste (SUMMARY, CHECKPOINTS, HUMAN-UAT)
mkdir -p .planning/_archive/phases
{ git mv "$P" ".planning/_archive/phases/{NN}-{slug}" 2>/dev/null \
  || mv "$P" ".planning/_archive/phases/{NN}-{slug}" ; } \
  && echo "[$(date +%F)] archive: phases/{NN}-{slug} -> _archive/phases/ · {N} jetables supprimés · récupérables à $ANCRE" >> .planning/ARCHIVE.log
```
(Préférer `git mv` si le projet est versionné : préserve l'historique.)
Le `&&` est délibéré : un journal qui consigne un déplacement raté est pire que pas de journal.

L'ancre dans le journal n'est pas décorative. C'est elle qui rend la suppression réversible, donc c'est elle qui rend la suppression acceptable. Un archivage consigné sans ancre est un archivage qu'on ne peut pas défaire.

## Étape 4 : Recaler INDEX.md
- Retirer la phase de la section « Phases actives ».
- L'ajouter sous « Phases archivées », avec le lien vers le SUMMARY à son nouveau chemin :
  `- ✓ {NN}-{slug} ([SUMMARY](_archive/phases/{NN}-{slug}/{nom réel du fichier}))`
  Le nom réel est celui trouvé à l'étape 1 : les workflows GSD préfixent (`{phase}-{plan}-SUMMARY.md`, par exemple `01-01-SUMMARY.md`). Copier le nom observé, ne jamais le reconstruire.
- Mettre à jour la date en tête de l'INDEX.

Note : l'INDEX est maintenu en continu à la clôture de chaque phase via le step `update_planning_index` du workflow execute-phase. Cette étape ne refait pas l'entrée : elle la déplace de « Phases actives » vers « Phases archivées » et corrige le chemin du lien, sans recréer la ligne.

Si `INDEX.md` n'existe pas, le créer depuis le scaffold avant d'archiver quoi que ce soit (`se sync-project` le fait) : sans la carte, une phase archivée est introuvable.

## Étape 5 : Sortir la phase de ROADMAP.md, écrire l'empreinte dans PHASES.md
`ROADMAP.md` ne contient que l'à-venir et l'en-cours. La phase livrée en **sort entièrement** et laisse **une seule ligne d'empreinte** dans `.planning/PHASES.md`, section `## Phases`.

Format d'une entrée :
```
- {YYYY-MM-DD} · {NN}-{slug} · {vX.Y} · {ce que ça a livré, 10 mots max} · [SUMMARY](_archive/phases/{NN}-{slug}/{fichier réel})
```
Exemple :
```
- 2026-08-28 · 02-extraction · v0.1 · parseur PDF vers JSON · [SUMMARY](_archive/phases/02-extraction/02-01-SUMMARY.md)
```

Règles :
- **Pas de nom de code inventé.** L'identifiant est `{NN}-{slug}`, le même que le dossier archivé : un seul identifiant par phase, et il sert de chemin.
- Le nom du SUMMARY est celui observé à l'étape 1, jamais reconstruit.
- Dans `ROADMAP.md` : supprimer la ligne du tableau de l'horizon court, ainsi que tout bloc de détail (plans, gates, checklists) que la phase y avait laissé.
- Ne jamais rallonger l'empreinte pour « garder le contexte » : le contexte est dans le SUMMARY archivé.
- Si `PHASES.md` n'existe pas, le créer depuis le scaffold (`scaffold/.planning/PHASES.md`) avant d'écrire.

`PHASES.md` n'a pas de plafond : il grandit avec le projet, c'est sa fonction. `ROADMAP.md` et `STATE.md`, eux, restent sous size-gate (500 lignes, 33 000 caractères, 300 caractères par ligne) : le transfert des empreintes est précisément ce qui les maintient sous les plafonds.

### Quicks réalisés
Même mouvement pour les quicks : les lignes du tableau « Quick Tasks Completed » de `STATE.md` (écrites par `/gsd-quick`) migrent vers la section `## Quicks` de `PHASES.md`, une ligne par quick :
```
- {YYYY-MM-DD} · quick {id} · {ce que ça a livré, 10 mots max} · [dossier](quick/{id}-{slug}/)
```
Le lien pointe vers `.planning/quick/{id}-{slug}/` (ces dossiers ne sont pas déplacés). Supprimer les lignes transférées de `STATE.md`.

## Étape 6 : Corriger les chemins dans STATE.md
Les phases déplacées laissent des chemins morts. Réécrire chaque occurrence :
```bash
# Repérer les chemins devenus faux (ne rien modifier à l'aveugle)
grep -n "phases/{NN}-{slug}" .planning/STATE.md .planning/INDEX.md
```
- `phases/{NN}-{slug}` → `_archive/phases/{NN}-{slug}` dans `STATE.md` et `INDEX.md`.
- Si `Fichier de reprise` pointait vers une phase archivée, le remettre à `Aucun` : une phase archivée n'est pas reprenable.
- Purger de « Contexte vivant » les décisions et bloqueurs qui appartenaient aux phases archivées.

Puis invoquer `/se-planning` avec l'argument « post-archivage : {N} phases sorties de l'horizon court, recaler la vue semaine et l'avancement du milestone ». C'est /se-planning qui tient ROADMAP/STRATEGY/STATE cohérents, pas ce skill.

## Étape 7 : Commit
```bash
git add -A .planning/
git commit -m "chore(archive): archive {N} phases terminées, supprime {M} jetables (ancre $ANCRE)"
```

## Étape 8 : Recherches et audits périmés (même confirmation)

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
