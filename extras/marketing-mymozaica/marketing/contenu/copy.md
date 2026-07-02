---
name: marketing-copy
description: Ecriture de copy pour pages publiques (landing, pricing, FAQ, about). Cible B2C FR cadeau emotionnel. Frameworks classiques + ton My Mozaica.
risk: low
source: adapted-from-coreyhaines31/marketingskills/copywriting
date_added: 2026-05-10
---

# Marketing Copy

## Ton role

Ecrire ou reformuler du copy pour pages publiques en respectant le ton My Mozaica : maison d'edition familiale, vouvoiement bienveillant, pas de jargon startup, pas d'urgence agressive.

## Avant de commencer

1. Lire `.planning/marketing/CONTEXT.md` (ton, verbatim VOC, positionnement)
2. Lire `~/.claude/commands/marketing/references/hook-formulas.md`
3. Demander :
   - "Tu travailles sur quelle page ? (hero landing / pricing / FAQ / about / page cadeau / autre)"
   - "Tu as un brief ou un draft existant a partir duquel partir ?"
   - "Public principal : acheteur cadeau (35-55) ou utilisateur final (60-85) ?"

## Principes fondamentaux

### 1. Clarity over cleverness
Une phrase claire qui dit ce qu'on fait > une phrase clever que personne ne comprend.
- ❌ "Reveiller l'inoubliable" (poetique mais flou)
- ✅ "Le livre des memoires de vos parents, sans qu'ils aient a ecrire une ligne"

### 2. Plus court = plus fort
Couper tout ce qui n'apporte rien. Test : si on enleve le mot, est-ce que la phrase perd du sens ?
- ❌ "My Mozaica est une plateforme innovante qui revolutionne..."
- ✅ "My Mozaica transforme la voix de vos parents en livre."

### 3. Specifique > generique
Specificite cree confiance.
- ❌ "Beaucoup de personnes ont apprecie My Mozaica"
- ✅ "Marie, 47 ans, a offert My Mozaica a sa mere de 73 ans pour ses 50 ans de mariage"

### 4. Voix active
- ❌ "Le livre est genere par notre IA"
- ✅ "Notre IA genere le livre" (encore mieux : "On rediger le livre" si plus humain)

### 5. Bannir les anglicismes inutiles
- ❌ "Boostez", "Disrupt", "Empowerment", "Game changer"
- ✅ Le mot francais courant

## Frameworks d'ecriture

### Headlines : 3 formules eprouvees

**Formule 1 : Outcome sans pain**
"Le {resultat} sans {effort/douleur}"
- Ex MM : "Le livre des memoires de vos parents, sans qu'ils aient a ecrire une ligne"
- Ex MM : "Preserver la voix de vos parents, sans avoir a leur arracher les mots"

**Formule 2 : The {category} for {audience}**
"Le/La {categorie} pour {public specifique}"
- Ex MM : "La maison d'edition familiale pour les enfants qui veulent transmettre"
- Ex MM : "Le cadeau d'anniversaire que vos parents vont relire toute leur vie"

**Formule 3 : Plus jamais {evenement redoute}**
"Plus jamais {regret futur}"
- Ex MM : "Plus jamais 'j'aurais voulu enregistrer mamie avant qu'elle parte'"
- Ex MM : "Plus jamais l'oubli des anecdotes qu'on aimait reentendre"

### Sub-headline (sous le headline)

Role : preciser, rassurer, ouvrir au CTA.

Pattern : 1-2 phrases avec
- Comment ca se passe (mecanique)
- Pour qui c'est
- Ce qu'on recoit concretement

Ex MM : "Une conversation IA chaleureuse avec votre proche, et 4 a 6 semaines plus tard, un livre imprime de 200 pages livre chez vous."

### CTA : la formule

**Action verb + What they get + Qualifier**

- ❌ "Cliquez ici"
- ❌ "Commencer" (vague)
- ❌ "En savoir plus" (passif)
- ✅ "Decouvrir la demo" (action + what)
- ✅ "Offrir un livre maintenant" (action + what + qualifier)
- ✅ "Recevoir 100 questions inspirantes" (action + what)

### Page-Specific Guidelines

#### Landing Hero (au-dessus de la ligne)

Structure :
1. **Headline** (15-25 mots) : claim principal, formule "outcome sans pain" ou "plus jamais regret"
2. **Sub-headline** (30-50 mots) : preciser le mecanisme, pour qui
3. **CTA principal** (2-4 mots) : "Offrir un livre"
4. **CTA secondaire** (3-6 mots) : "Voir comment ca marche" ou "Recevoir 100 questions"
5. **Trust signal** (1 phrase) : "Deja 50 familles francaises l'ont offert"
6. **Visuel** : photo emotionnelle, pas de gradient/abstract (cf `/generate-image --mode marketing-hero-landing`)

#### Pricing

Structure :
1. **Headline** : "79€. Une fois. Le livre arrive chez vous."
2. **Sub** : "Pas d'abonnement. Pas de frais caches. TVA et livraison incluses."
3. **Bullets** valeur :
   - "Livre imprime 200 pages, couverture rigide creme"
   - "Interview IA conversationnelle, 4-6h cumulees"
   - "Livre livre 4-6 semaines apres la fin de l'interview"
   - "Garantie satisfait ou rembourse pendant 14 jours apres reception"
4. **Comparaison** : "Pour comparer : un biographe humain pro coute 4000-8000€. Un livre photo basic 40-60€ mais sans aucun texte."
5. **CTA**
6. **FAQ pricing** (objections : prix, abonnement, livraison)

#### FAQ

Structure pour chaque question :
- Question dans les MOTS du client (pas reformulee)
- Reponse directe (1ere phrase = la reponse, pas du blabla)
- Detail apres
- Lien vers page liee si applicable

Ex :
- Q : "L'IA va-t-elle denaturer la voix de mon pere ?"
- R : "Non. Notre IA est calibree pour conserver le style, le vocabulaire et les expressions caracteristiques de votre proche. Elle ne reformule pas, elle structure les souvenirs racontes."

#### About / Notre histoire

Structure :
1. **Pourquoi on existe** (l'histoire personnelle du fondateur, 1 paragraphe)
2. **Ce qu'on croit** (manifesto, 3-5 convictions)
3. **Comment on travaille** (transparence sur l'IA, l'impression, le SAV)
4. **Equipe** (visages, prenoms, roles)
5. **CTA secondaire** : "Decouvrir le livre"

## Workflow

### Etape 1 : Brief
- Page concernee
- Public principal
- Action visee
- Existant (si applicable)

### Etape 2 : Verbatim recherche
Lire `.planning/marketing/CONTEXT.md` section Verbatim VOC.
Si pas de verbatim reels (avant beta) : utiliser hypotheses + signaler.
Si verbatim reels : citer 2-3 phrases directement.

### Etape 3 : 3 variantes headline minimum
Toujours proposer 3 angles differents avec les 3 formules. Justifier laquelle on recommande.

### Etape 4 : Iterer
"Tu preferes laquelle ? Pourquoi ?"
Affiner selon retour.

### Etape 5 : Production complete
Une fois headline valide, produire :
- Sub-headline
- Body (si applicable)
- CTAs
- Trust signals
- Microcopy (placeholders, errors, success)

### Etape 6 : Verification ton My Mozaica

Checklist finale :
- [ ] Aucun jargon startup ("disrupte", "boost", "scale")
- [ ] Aucun anglicisme inutile
- [ ] Vouvoiement coherent (sauf chat produit ou tutoiement)
- [ ] "Tatie" pas "Tati" si reference apparait
- [ ] Police Aqua sans accents si utilisee dans visuel
- [ ] Pas d'urgence factice ("Plus que 2h !" alors que c'est faux)
- [ ] Pas de pression emotionnelle deplacee (deuil cru)
- [ ] Specificite (chiffres, prenoms, exemples concrets)

## Anti-patterns transversaux

- ❌ "Revolutionnez votre [...]" / "Transformez radicalement [...]"
- ❌ "Et si je vous disais que..." (intro creuse)
- ❌ Trois adjectifs d'affilee ("simple, rapide, efficace")
- ❌ Question rhetorique au lecteur ("Vous voulez X ? Vous etes au bon endroit !")
- ❌ Generaliser ("De plus en plus de Francais...")
- ❌ Marketing-talk ("Notre solution est concue pour vous accompagner...")
- ❌ "Pour seulement 79€" (le "seulement" devalue)

## Skills lies

- `marketing/psycho` : quels biais cognitifs activer dans ce copy
- `marketing/copy-edit` : passe d'edition sur copy existant
- `marketing/cro-page` : test variantes en A/B
- `marketing/strategie-contenu` : aligne avec piliers thematiques
- `marketing/recherche-utilisateur` : source verbatim VOC
