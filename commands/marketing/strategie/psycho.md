---
name: marketing-psycho
description: Applique les biais cognitifs et frameworks de persuasion au marketing B2C FR. Recommande quels leviers activer selon la page/email/post.
risk: low
source: adapted-from-coreyhaines31/marketingskills/marketing-psychology
date_added: 2026-05-10
---

# Marketing Psycho

## Ton role

Recommander quels biais cognitifs et frameworks de persuasion activer selon le contexte (page produit, email, post social, ad). Output = liste priorisee de 3-5 leviers + comment les implementer concretement pour My Mozaica.

## Avant de commencer

1. Lire `.planning/marketing/CONTEXT.md`
2. Lire `~/.claude/commands/marketing/references/frameworks-cognitifs.md` (banque centrale)
3. Demander : "Tu travailles sur quoi exactement ? (landing hero, email welcome, ad Meta, FAQ, etc.)"

## Frameworks principaux

### Cialdini 6+1 (persuasion fondamentale)

1. **Reciprocite** : "donner avant de recevoir". Ex MM : PDF "100 questions" gratuit.
2. **Engagement & coherence** : petit oui mene a grand oui. Ex MM : tester 1 question avant de payer.
3. **Preuve sociale** : "les autres l'ont fait". Ex MM : verbatim beta-testeurs sur landing.
4. **Autorite** : credibilite source. Ex MM : "valide par biographe pro X".
5. **Sympathie** : on achete a ceux qu'on apprecie. Ex MM : ton "tatie", chaleureux familial.
6. **Rarete** : ce qui est limite est valorise. Ex MM : 50 places beta uniquement.
7. **Unite** (ajout 2016) : appartenance partagee. Ex MM : "nous, enfants qui voulons preserver".

### BJ Fogg Behavior Model
**B = MAT** : Behavior = Motivation × Ability × Trigger
- Si une action n'a pas lieu, c'est UN des 3 qui manque.
- Ex MM : si un visiteur n'achete pas, est-ce M (pas envie), A (trop difficile/cher), ou T (pas de trigger emotionnel) ?

### EAST (Behavioural Insights Team)
- **Easy** : reduire friction
- **Attractive** : visuellement engageant
- **Social** : montrer que d'autres le font
- **Timely** : moment opportun (fete des meres = trigger temporel parfait)

### COM-B (sante comportementale, transferable)
- **Capability** : savoir/pouvoir faire
- **Opportunity** : contexte permet
- **Motivation** : envie/raison de faire

### Prospect Theory (Kahneman/Tversky)
- Aversion a la perte > attrait du gain (perte d'une chose comptee 2x plus qu'un gain equivalent)
- Ex MM : "Avant que la voix de mamie disparaisse" > "Preservez la voix de mamie"

### Anchoring (ancrage)
- Premier prix vu = reference
- Ex MM : montrer "Biographe pro 4000-8000€" avant 79€

### Decoy Effect
- 3 options : la moyenne devient attractive face a un "leurre"
- Ex MM : Standard 79€ / Premium 119€ / Luxe 249€ — le 119€ devient attractif

### Peak-End Rule
- On retient le pic emotionnel + la fin
- Ex MM : moment peak = remise du livre imprime (memorable). Bien soigner unboxing.

### Goal-Gradient Effect
- Plus on est proche de l'objectif, plus on accelere
- Ex MM : barre de progression interview (1/7 blocs → 7/7), donne envie de finir.

### Zeigarnik Effect
- Tache inachevee = tension psychique
- Ex MM : "Vous avez commence l'interview, il vous reste 3 questions" → email relance

### AIDA classique
- Attention → Interest → Desire → Action
- Ex MM landing : Hero (Attention) → Verbatim (Interest) → Demo (Desire) → CTA (Action)

### Hick's Law
- Plus de choix = plus de paralysie
- Ex MM : 1 seul prix 79€ vs 5 packs differents.

## Workflow

### Etape 1 : Comprendre le contexte
"Tu es sur quelle page/contenu et a quelle etape du funnel ?"
- Awareness (decouverte produit)
- Interest (compare options)
- Desire (proche d'acheter)
- Action (checkout)
- Retention (apres achat)

### Etape 2 : Identifier le frein principal
Pour chaque etape, le frein est different :
- **Awareness** : "qu'est-ce que c'est ?" → activer reciprocite (lead magnet) + sympathie (ton)
- **Interest** : "est-ce pour moi ?" → preuve sociale (verbatim) + engagement (demo)
- **Desire** : "ai-je raison de payer ?" → autorite + ancrage prix + aversion perte
- **Action** : "et si je me trompe ?" → garantie + scarcity (deadline) + unite
- **Retention** : "etait-ce une bonne decision ?" → peak-end (unboxing) + reciprocite (cadeau bonus)

### Etape 3 : Recommander 3-5 leviers concrets

Format :
```
**Levier 1 : <nom>**
- Pourquoi maintenant : <raison liee au contexte>
- Implementation My Mozaica : <action concrete>
- Mesure : <comment savoir si ca marche>

**Levier 2 : <nom>**
...
```

### Etape 4 : Anti-patterns a eviter

Lister les biais a NE PAS activer :
- Pas de fausse rarete (deceptive)
- Pas d'urgence agressive (incompatible avec ton MM)
- Pas de manipulation emotionnelle (deuil, peur extreme)
- Pas de dark patterns (cancel difficile, opt-in cache)

## Cas type : Landing hero My Mozaica

**Frein principal** : "qu'est-ce que c'est exactement ? est-ce serieux ?"

**Leviers recommandes** :
1. **Sympathie** : ton chaleureux, vouvoiement bienveillant, mots-cles "tatie/famille/transmission" (PAS "platform/innovation/AI-powered")
2. **Preuve sociale** : verbatim d'1 beta-testeuse en sous-titre (avec photo + prenom + age)
3. **Aversion a la perte** : headline qui evoque la perte ("Avant que la voix de mamie...") plutot que le gain
4. **Reciprocite** : CTA secondaire "Recevez 100 questions a poser a vos parents" (lead magnet)

**Anti-patterns** :
- ❌ Compteur "247 livres vendus aujourd'hui !" (artificial scarcity)
- ❌ Pop-up "Offre se termine dans 03:14:22" (pression incompatible)
- ❌ "Don't miss out" / "Last chance" (anglicismes pression)

## Cas type : Email cart abandonment

**Frein principal** : "j'ai hesite, ai-je bien fait de ne pas conclure ?"

**Leviers recommandes** :
1. **Aversion a la perte** : "Le temps passe, et la voix de votre mere aussi"
2. **Engagement** : rappeler qu'ils ont COMMENCE le checkout (effort sunk cost)
3. **Reciprocite** : offrir 5€ de reduction "parce que vous etes deja venus jusqu'ici"
4. **Sympathie** : email signe par un humain (fondateur), pas "L'equipe My Mozaica"

## Cas type : Post Instagram acquisition

**Frein principal** : "scroll vite, captez 3 secondes ou perdez moi"

**Leviers recommandes** :
1. **Curiosite gap** : hook qui ouvre une question ("Hier, j'ai pose 1 question a ma mere. Voici ce qu'elle a repondu...")
2. **Preuve sociale** : verbatim ou temoignage en visuel
3. **Peak emotionnel** : montrer le moment de la remise du livre, pas le produit
4. **Hicks Law** : 1 CTA unique en bio, pas 5 liens

## Anti-patterns transversaux My Mozaica

- ❌ Faire pleurer (emotional manipulation) — ton sobre, pas larmoyant
- ❌ Urgence factice — preferer urgence reelle (fete des meres dans X jours)
- ❌ Surenchere d'arguments — Hicks law, choisir 1 angle par communication
- ❌ Jargon psy ("activez votre biais d'engagement") — formulation naturelle

## Skills lies

- `marketing/copy` : applique les leviers en formulation
- `marketing/cro-page` : test l'efficacite reelle des leviers
- `marketing/email-sequences` : sequences = orchestre plusieurs leviers dans le temps
- `marketing/social` : leviers sociaux (preuve, sympathie, curiosite)
