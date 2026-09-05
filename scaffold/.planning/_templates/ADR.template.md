<!-- ADR : une décision technique durable, son pourquoi, et ce qu'on a écarté. -->
<!-- Destination : .planning/decisions/{NNNN}-{slug}.md, NNNN sur 4 chiffres, jamais réutilisé. -->
<!-- Écrit par /se-interview dans la foulée du round où la décision tombe, jamais en lot. -->
<!-- Trois conditions, toutes les trois : dure à inverser, incompréhensible sans son contexte, -->
<!-- issue d'un vrai arbitrage entre options réelles. Deux sur trois, on n'écrit pas d'ADR. -->
<!-- Une décision produit (ce qu'on construit, pour qui, à quel prix) ne vient pas ici : -->
<!-- elle va dans PROJECT.md, Key Decisions. -->
<!-- Ne se réédite JAMAIS une fois accepté. Une décision révisée s'écrit dans un ADR suivant -->
<!-- qui marque celui-ci « remplacé par », et celui-ci reste en place. C'est l'enchaînement -->
<!-- qui a de la valeur, pas l'état final. -->

# {NNNN}. {La décision, en une phrase, à l'impératif}

**Date** : {YYYY-MM-DD}
**Statut** : accepté
**Ancre** : {sha court du commit où la décision est entrée dans le code, ou « pas encore implémenté »}

## Le problème

Ce qui a forcé la décision. Le contexte **du jour où elle a été prise**, pas celui d'aujourd'hui : c'est justement ce qu'on ne saura plus reconstituer.

## Ce qu'on a écarté

Une ligne par option réellement envisagée, avec la raison du rejet. Une option qu'on n'a jamais pesée n'a rien à faire ici. C'est la section qui empêche de rouvrir le débat dans six mois, donc c'est la plus utile de la page.

| Option | Pourquoi non |
|---|---|
| | |

## Ce qui rendrait cette décision fausse

Le signal qui justifierait de la reprendre : une contrainte qui saute, un volume qui change d'ordre de grandeur, une dépendance qui meurt. Sans cette ligne, un ADR devient un dogme que personne n'ose plus toucher.
