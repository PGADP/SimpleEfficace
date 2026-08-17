---
description: Primitif d'interview. Interroge l'humain par rounds jusqu'à ce que toutes les décisions soient tranchées, chaque question numérotée avec sa réponse recommandée. Invoqué par les skills qui doivent cadrer avant d'écrire (phase, parcours, projet), ou directement quand l'utilisateur veut faire challenger un plan, une idée ou une décision.
---

# Interview

Interroge l'humain jusqu'à ce que vous partagiez la même compréhension. Les décisions forment un **arbre** : chacune ouvre celles qui en dépendent.

La **frontière**, ce sont les décisions dont les prérequis sont déjà réglés : les questions posables maintenant, sans deviner une réponse que tu n'as pas encore entendue. Pose **toute la frontière en un seul round**, numérotée, chaque question accompagnée de ta réponse recommandée. Puis attends.

```
❓ **Q1** - **<titre de la question>** : <la question, choix possibles inclus>

➡️ <ta réponse recommandée>
```

Chaque round de réponses redessine l'arbre : ce qui vient d'être tranché repousse la frontière et débloque des questions qui en dépendaient. Recalcule la frontière, pose le round suivant. Une question dont la réponse dépend d'une autre question du round en cours appartient au round **suivant**, pas à celui-ci.

**Les faits sont ton travail.** Une question de la frontière qui attend un fait de l'environnement (dépôt, fichiers, commandes, web) part en sous-agent. Ne bloque pas dessus : une recherche en cours est un prérequis non réglé, donc seules les questions qui en dépendent attendent son retour. Pose le reste de la frontière maintenant.

**Les décisions sont les siennes.** Tu recommandes, il tranche. Tu ne réponds jamais à ta propre question pour avancer.

La session est finie quand la frontière est vide : chaque branche de l'arbre visitée, rien de supposé en silence. N'agis pas sur le résultat tant que l'humain n'a pas confirmé que la compréhension est partagée.

---
**Sujet** : $ARGUMENTS
