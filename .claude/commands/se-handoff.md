---
description: Passation de session hors phase. Compacte la conversation en cours en un document qu'un agent neuf reprend sans rien deviner, écrit hors du dépôt. En phase, c'est /gsd-pause-work qui fait foi.
---

# Handoff

## La frontière, avant d'écrire quoi que ce soit

Une passation **en phase** appartient à `/gsd-pause-work` : elle écrit `.continue-here.md` dans le dossier de la phase, commite en WIP, et `/gsd-resume-work` la relit. Ne la double jamais.

Ce skill couvre tout le reste, et c'est là qu'il n'y avait rien : sparring avec le pilot, debug hors phase, exploration, recherche, séance de décision. Trois heures où dix choses ont été tranchées, et aucune phase à laquelle accrocher un fichier.

Donc : si une phase est en cours **et** que la conversation portait sur elle, dis-le en une ligne et bascule sur `/gsd-pause-work`. Sinon, continue ici.

## Où ça s'écrit

Dans le répertoire temporaire de l'OS (`$TMPDIR`, `%TEMP%`, sinon `/tmp`), jamais dans le dépôt. Une passation est un état de session, pas un livrable : elle se consomme à la reprise, elle ne se versionne pas. Nom du fichier : `handoff-{YYYY-MM-DD-HHMM}.md`. Donne le chemin complet, seul sur sa ligne, en fin de réponse.

## Ce que le document contient

```
# Handoff : {sujet}, {date}

## Objet de la prochaine session
{une phrase : ce que l'agent suivant doit accomplir}

## Où on en est
{trois lignes maximum : l'état réel, pas le récit de la séance}

## Tranché
- {décision} : {la raison, en une demi-ligne}

## Encore ouvert
- {question} : {ce qui bloque, ou ce qui manque pour trancher}

## Pointeurs
- {chemin ou URL} : {ce qu'on y trouve}

## Skills à appeler
- {/skill} : {pourquoi celui-là}
```

## Règles dures

1. **Ne duplique rien.** Ce qui vit déjà dans un PLAN, un SUMMARY, une recherche, un commit ou un diff se **référence par son chemin**. Un handoff qui recopie est un handoff qui périme.
2. **Le durable ne passe pas par ici.** Un terme tranché pendant la séance va dans `.planning/GLOSSARY.md`. Une décision structurante va dans `PROJECT.md`. Écris-les **là-bas d'abord**, puis pointe-les. Le handoff ne garde que le périssable : l'état, le fil, ce qui reste ouvert.
3. **Caviarde.** Aucune clé, aucun jeton, aucun mot de passe, aucune donnée personnelle dans le fichier. En cas de doute, remplace par `[REDACTED]` et dis où retrouver la valeur.
4. **L'état, pas le récit.** Personne ne relit le déroulé d'une séance. Ce qui compte, c'est ce qui est vrai maintenant et ce qui manque.
5. **Nomme les skills.** L'agent suivant démarre à froid : dis-lui quoi appeler, et pourquoi celui-là plutôt qu'un autre.

---
**À quoi servira la prochaine session** : $ARGUMENTS
