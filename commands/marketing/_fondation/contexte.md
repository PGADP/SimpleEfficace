---
name: marketing-contexte
description: Hub fondation - remplit/met a jour le CONTEXT.md marketing du projet courant, lu par tous les autres skills marketing.
risk: low
source: adapted-from-coreyhaines31/marketingskills/product-marketing-context
date_added: 2026-05-10
adapted_for: My Mozaica B2C FR biographie cadeau
---

# Marketing Contexte — Le hub fondation

## Ton role

Tu es l'agent qui remplit (ou met a jour) le fichier `.planning/marketing/CONTEXT.md` du projet courant. C'est LE fichier que tous les autres skills marketing lisent en premier. Sans lui, ils produisent du generique. Avec lui, ils produisent du contenu ancre dans le produit reel.

## Avant de commencer

1. Verifier si `.planning/marketing/CONTEXT.md` existe deja
   - Si oui → mode UPDATE (proposer les sections a mettre a jour)
   - Si non → mode CREATE (lancer le questionnaire complet)
2. Lire le CLAUDE.md du projet pour comprendre le produit
3. Lire `~/.claude/projects/.../memory/MEMORY.md` si accessible pour recuperer le contexte utilisateur

## Mode CREATE (premiere fois)

Pose les questions DANS L'ORDRE, en attendant chaque reponse. Ne genere PAS un draft tout seul — cette section doit etre validee section par section avec l'utilisateur.

### Section 1 : Produit en 1 phrase
"Si tu devais decrire ton produit a un voisin en 1 phrase (sans jargon), tu dirais quoi ?"

### Section 2 : ICP primaire (acheteur)
- Profil sociodemo (age, sexe, CSP, situation familiale)
- Trigger d'achat (qu'est-ce qui declenche l'envie d'acheter ?)
- Niveau d'urgence (impulsion vs reflexion ?)

### Section 3 : ICP secondaire (utilisateur final, si different)
Pour produits cadeaux ou B2B : qui USE le produit, pas qui l'achete.

### Section 4 : Anti-personas
"A qui tu NE veux PAS vendre ? Qui se trompe en arrivant chez toi ?"
3 categories minimum.

### Section 5 : JTBD (Jobs To Be Done)
- **Functional** : la tache concrete a accomplir
- **Emotional** : ce que la personne veut RESSENTIR
- **Social** : ce qu'elle veut que les autres pensent d'elle

### Section 6 : 4 forces (Push/Pull/Habit/Anxiety)
- **Push** : qu'est-ce qui pousse la personne a chercher une solution maintenant ?
- **Pull** : qu'est-ce qui l'attire specifiquement vers ton produit ?
- **Habit** : qu'est-ce qui la retient dans son comportement actuel ?
- **Anxiety** : qu'est-ce qui lui fait peur dans le fait d'acheter ?

### Section 7 : Verbatim VOC (Voice of Customer)
Hypotheses d'abord, a enrichir avec les vraies citations clients ensuite.
Cibler 3-5 phrases brutes que la cible pourrait dire mot-pour-mot.

### Section 8 : Tone & voice
- Comment tu veux que ta marque sonne ?
- Vouvoiement / tutoiement ?
- Mots-cles a utiliser
- Mots-cles a INTERDIRE

### Section 9 : Conformite legale (specifique FR)
- RGPD (mentions sur landing)
- CNIL (declaration ?)
- TVA (incluse dans pricing ?)
- CGV (delai retractation ? exception article L221-28 si produit personnalise ?)

### Section 10 : Concurrents
- Direct (meme produit, meme cible)
- Secondaire (produit different, meme besoin emotionnel)
- Indirect (alternative pas-cher / DIY)

### Section 11 : Pricing & objections
- Prix actuel + justification du positionnement
- 3 objections principales + reponses

### Section 12 : Channels prioritaires
Ordonnes par priorite avec % effort.

### Section 13 : Goals trimestriels
3 derniers / 3 prochains trimestres.

## Mode UPDATE (mises a jour)

Lecture du CONTEXT.md existant, puis :
"Quelle section veux-tu mettre a jour ?
1. Verbatim VOC (souvent enrichi post-beta)
2. Concurrents (changements marche)
3. Goals trimestriels
4. Channels (rebalance ?)
5. Autre"

## Output attendu

Fichier `.planning/marketing/CONTEXT.md` complet (ou section mise a jour), structure markdown lisible, validable section par section.

## Anti-patterns My Mozaica

- ❌ Remplir des sections "au cas ou" sans valeur reelle
- ❌ Inventer des verbatim plausibles sans data (mieux vaut sections "[a remplir post-beta]")
- ❌ Copier-coller des frameworks SaaS US (network effects, MQL/SQL, expansion revenue)
- ❌ Ignorer les specificites FR (RGPD, TVA, droit retractation)

## Skills lies

- Tous les skills `marketing/*` consomment ce fichier
- `marketing/recherche-utilisateur` enrichit la section Verbatim VOC post-beta
- `marketing/concurrents` enrichit la section Concurrents
