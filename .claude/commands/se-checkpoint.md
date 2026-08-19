---
description: Primitif de checkpoint humain. Impose la forme unique de toute demande de validation (ce qui a été fait, ce que la machine a mesuré, les points que l'humain seul peut juger, où regarder, une question fermée). Invoqué par les gates et par tout skill qui demande un GO, ou directement pour formater une validation.
---

# Checkpoint

Un checkpoint demande un **jugement**, pas une lecture. L'humain doit pouvoir trancher en regardant, sans ouvrir un rapport et sans reconstituer le contexte. « Le rendu est bon ? » n'est pas un checkpoint, c'est une abdication.

## La forme, toujours la même

```
CHECKPOINT · <nom court>                              [human-verify]

Fait        <ce que tu as livré, 3 lignes maximum>
Mesuré      <verdict chiffré de la machine, ou « rien de mesurable ici »>
À juger     1. <point précis, tranché à l'oeil, pas à la réflexion>
            2. <...>
Regarder    <URL exacte, ou UNE commande copiable>

→ <question fermée> [GO / NO-GO + raison]
```

## Les trois types

| Type | Part | Forme |
|---|---|---|
| `human-verify` | 90% | celle ci-dessus. Tout est fait, l'humain confirme. |
| `decision` | 9% | 2 à 4 options, une ligne de pour et une de contre chacune, ta recommandation nommée. Passer par `AskUserQuestion`. |
| `human-action` | 1% | l'humain doit faire quelque chose (auth, secret, accès). La commande ou l'URL est donnée en un bloc copiable, seule sur sa ligne. |

## Règles dures

1. **« À juger » : 4 points maximum**, et chacun se tranche en regardant. Ce qui demande de réfléchir, de comparer deux fichiers ou de relire une spec n'est pas un point de checkpoint.
2. **Ce que la machine sait mesurer ne va jamais dans « À juger »**, il va dans « Mesuré ». Un checkpoint qui demande de compter, vérifier un contraste ou relire une liste est un bug du skill appelant.
3. **Rien à lire avant de trancher.** Les détails vont dans le journal, pas dans la question. Si l'humain doit ouvrir un rapport pour répondre, le checkpoint est mal écrit.
4. **Une seule question fermée**, en fin de bloc, avec les réponses possibles entre crochets.
5. **« Regarder » est actionnable** : une URL cliquable ou une commande d'une ligne. Jamais « lance le serveur et va voir ».
6. **Un checkpoint par groupe de résultats, pas par analyse.** Trois analyses lancées en parallèle produisent un seul bloc à trois sections, pas trois interruptions (cf. `CONVENTIONS.md` §11).
7. **Le silence n'est pas un GO.** Attendre la réponse, puis la consigner mot pour mot.

## Journal

Tout checkpoint rendu pendant une phase s'ajoute à `.planning/phases/{NN}-{slug}/CHECKPOINTS.md` (gabarit : `.planning/_templates/CHECKPOINTS.template.md`) : date, type, ce qui a été mesuré, la réponse humaine littérale, ce qui a été fait ensuite. C'est la trace, pas le support de la décision.

Hors phase, rien sur disque : le verdict est consommé en séance (cf. `CONVENTIONS.md` §4).

---
**Sujet du checkpoint** : $ARGUMENTS
