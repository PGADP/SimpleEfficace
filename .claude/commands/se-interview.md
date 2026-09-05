---
description: Primitif d'interview. Interroge l'humain par rounds jusqu'à ce que toutes les décisions soient tranchées, chaque question numérotée avec sa réponse recommandée. Construit le glossaire du projet au passage. Invoqué par les skills qui doivent cadrer avant d'écrire (phase, parcours, projet), ou directement quand l'utilisateur veut faire challenger un plan, une idée ou une décision.
---

# Interview

Interroge l'humain jusqu'à ce que vous partagiez la même compréhension. Les décisions forment un **arbre** : chacune ouvre celles qui en dépendent.

La **frontière**, ce sont les décisions dont les prérequis sont déjà réglés : les questions posables maintenant, sans deviner une réponse que tu n'as pas encore entendue. Pose **toute la frontière en un seul round**, numérotée, chaque question accompagnée de ta réponse recommandée. Puis attends.

```
❓ **Q1** - **<titre de la question>** : <la question, choix possibles inclus>

➡️ <ta réponse recommandée>
```

Chaque round de réponses redessine l'arbre : ce qui vient d'être tranché repousse la frontière et débloque des questions qui en dépendaient. Recalcule la frontière, pose le round suivant. Une question dont la réponse dépend d'une autre question du round en cours appartient au round **suivant**, pas à celui-ci.

**Les faits sont ton travail.** Une question de la frontière qui attend un fait de l'environnement (dépôt, fichiers, commandes, web) part en sous-agent, avec `model: "sonnet"` pour une recherche mécanique (retrouver un fichier, lire une valeur, vérifier une commande) et `model: "opus"` dès qu'il faut juger ou synthétiser. Ne bloque pas dessus : une recherche en cours est un prérequis non réglé, donc seules les questions qui en dépendent attendent son retour. Pose le reste de la frontière maintenant.

**Les décisions sont les siennes.** Tu recommandes, il tranche. Tu ne réponds jamais à ta propre question pour avancer.

La session est finie quand la frontière est vide : chaque branche de l'arbre visitée, rien de supposé en silence. N'agis pas sur le résultat tant que l'humain n'a pas confirmé que la compréhension est partagée.

## Le vocabulaire se construit pendant l'interview

Interroger produit des décisions. Le même effort produit gratuitement un **vocabulaire**, à condition de l'écrire au passage. Il vit dans `.planning/GLOSSARY.md` : un concept, le mot retenu, les synonymes bannis. Lis-le avant le premier round.

Quatre gestes, pendant les rounds, jamais après :

- **Opposer le glossaire.** Un terme employé qui contredit `GLOSSARY.md` se relève sur-le-champ : « le glossaire dit que *phase* désigne X, là tu sembles dire Y. C'est lequel ? » Un glossaire qu'on n'oppose jamais est un glossaire mort.
- **Affûter le flou.** Un mot fourre-tout se remplace par un terme canonique, tout de suite : « tu dis *compte* : c'est le Client ou l'Utilisateur ? Ce sont deux choses. »
- **Éprouver par scénarios.** Quand deux concepts se touchent, invente le cas limite qui force à trancher la frontière. Un modèle qui n'a jamais rencontré son cas tordu n'est pas un modèle.
- **Croiser avec le code.** Quand il affirme comment quelque chose marche, vérifie par `/se-scout`. Contradiction trouvée, contradiction remontée avec son `chemin:ligne` : « `src/orders.ts:88` annule la commande entière, tu viens de dire que l'annulation partielle existe. » Sans la citation, c'est ta parole contre la sienne, et il a de bonnes raisons de croire la sienne.

**Écris au fil de l'eau.** Un terme tranché s'ajoute à `GLOSSARY.md` dans la foulée, pas en lot en fin de session. Ce qui est repoussé à la fin est ce qui se perd.

**Le glossaire ne contient aucun détail d'implémentation.** Ce n'est ni une spec, ni un bloc-notes. Un terme y entre seulement s'il est propre à ce projet. Le test avant d'ajouter : est-ce un concept de ce domaine, ou un concept de programmation générale ? « Timeout » n'y a pas sa place, « offrant » oui.

**Une décision n'est pas un terme.** Elle ne se consigne que si les trois conditions tiennent : dure à inverser, incompréhensible sans son contexte, issue d'un vrai arbitrage entre options réelles. Deux sur trois, on ne consigne rien.

Les trois tenues, la destination dépend de sa nature. Une décision **produit** (ce qu'on construit, pour qui, à quel prix) va dans `PROJECT.md`, Key Decisions. Une décision **technique** (comment, avec quoi, à quel endroit) va dans un ADR : `.planning/decisions/{NNNN}-{slug}.md`, depuis `.planning/_templates/ADR.template.md`. Écris-le dans la foulée du round, comme le glossaire : ce qui est repoussé à la fin se perd.

**Un ADR ne se réédite jamais.** Une décision révisée s'écrit dans un ADR suivant qui marque le précédent « remplacé par », et le précédent reste en place. C'est l'enchaînement qui a de la valeur, pas l'état final : sans lui, on rouvre chaque année le même débat sans savoir qu'il a déjà été tranché.

C'est le pendant durable de la loi §0 : un ADR ne décrit pas le code, il dit **pourquoi** le code est comme il est. Le code peut démentir un document, il ne peut pas démentir un pourquoi.

---
**Sujet** : $ARGUMENTS
