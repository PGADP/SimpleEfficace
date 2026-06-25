# References — Verbatim VOC (Voice of Customer)

Banque centrale des verbatim clients reels (citations textuelles). **Ce fichier est PRESQUE VIDE avant la beta.** Il sera enrichi systematiquement post-beta avec les 50 verbatim des testeurs reels.

## Statut actuel : pre-beta (10 mai 2026)

**Verbatim disponibles** : 0 reels. Hypotheses en attente de validation.

**Prochaine update** : post-beta (juin 2026) apres collecte des 50 testeurs.

## Hypotheses verbatim (a valider post-beta)

Pour rappel : ces phrases sont des **hypotheses**, pas des citations reelles. Ne jamais les presenter comme des temoignages clients tant qu'elles ne sont pas validees.

### Pains (avant My Mozaica)
- "J'aurais voulu enregistrer mamie avant qu'elle parte."
- "Mon pere a tellement de choses a raconter mais il n'ecrira jamais."
- "Pour la fete des meres, j'ai jamais d'idee originale."
- "On a 3 photos de mon grand-pere et zero anecdote ecrite."
- "Mes parents disent 'y a rien a raconter' alors qu'ils ont vecu tellement."

### Gains (apres My Mozaica - hypothetique)
- "C'est le seul cadeau qu'elle a relu 3 fois."
- "Mon pere n'avait jamais raconte cette histoire en 47 ans."
- "Je decouvre ma mere a travers ce livre."
- "Mes enfants pourront lire l'histoire de leur grand-mere quand ils seront grands."
- "Ca a debloque des conversations qu'on n'avait jamais eues."

### Objections (avant achat)
- "C'est cher pour de l'IA."
- "Mes parents vont vouloir parler a une vraie personne."
- "Et si le resultat est mauvais ?"
- "Ils sont pas a l'aise avec la technologie."
- "C'est trop pousse comme cadeau, ils vont trouver ca bizarre."

### Discovery moments (comment ils nous ont trouves)
- "Une amie m'en a parle."
- "J'ai vu une pub Instagram."
- "Je cherchais 'idee cadeau original 70 ans'."
- "C'etait dans un article de Madame Figaro."

## Structure du verbatim valide

Pour chaque verbatim reel, capturer :

```markdown
### Verbatim #N (date YYYY-MM-DD)

**Citation** : "[texte exact, intact]"

**Contexte** :
- Personne : [Prenom + age + role : acheteur / beneficiaire]
- Stage : [pre-achat / pendant interview / post-livraison]
- Source : [email / chat support / Trustpilot / interview qualitative / Instagram DM / etc.]
- Sentiment : [positif / negatif / nuance]

**Categorie JTBD** :
- [ ] Functional
- [ ] Emotional
- [ ] Social

**Pain ou Gain** : [pain / gain / neutral]

**Theme/cluster** :
- [ex : aversion perte voix]
- [ex : objection prix]
- [ex : moment de remise emotional]

**Confidence Level** :
- [ ] High : converge avec 5+ autres verbatim similaires
- [ ] Medium : converge avec 3-4 verbatim
- [ ] Low : 1-2 occurrences, anecdotique

**Notes** :
- [Observations contextuelles]
- [Permissions d'usage : public / anonymise / interne seulement]
```

## Patterns d'usage des verbatim

### Pour landing hero
Utiliser un verbatim emotionnel court : "Le seul cadeau qu'elle a relu 3 fois." — Marie, 47 ans

### Pour FAQ
Reformuler l'objection avec verbatim : "Le tarif vaut-il le coup ? Sophie nous a dit : '79€ pour avoir l'histoire complete de mon pere, c'est rien.'"

### Pour ads
Utiliser en primary text : "Marie, 47 ans : 'Quand j'ai offert ce livre a ma mere, elle a pleure pendant 3 minutes.'"

### Pour social
Reels temoignages : montrer le client + verbatim a l'ecran + CTA.

### Pour email sequences
Email 3 sequence welcome lead : 1 verbatim entier en focus.

## Ethique d'usage

### A FAIRE
- Demander permission ecrite avant publication (cas par cas)
- Anonymiser si pas de permission complete (Marie L., 47 ans, sans nom complet)
- Citer fidelement, sans modifier
- Rendre verifiable (au moins en interne)

### A NE PAS FAIRE
- ❌ Inventer des verbatim
- ❌ Mixer plusieurs verbatim en un seul (= manipulation)
- ❌ Couper / modifier le texte sans signaler
- ❌ Attribuer a une personne fictive
- ❌ Utiliser un verbatim negatif comme positif (cherry-picking trompeur)

## Plan post-beta (juin 2026)

### Etape 1 : Collecte
- Email automatique J+5 apres reception livre
- Question simple : "En 2-3 phrases, comment trouvez-vous votre livre ?"
- Demander explicite : "Acceptez-vous qu'on partage votre temoignage (anonyme ou avec prenom) ?"

### Etape 2 : Synthese
Apres 50 verbatim collectes :
- Lancer `/marketing/recherche-utilisateur` mode ANALYZE
- Output : top verbatim, JTBD consolide, pains/gains, objections, themes

### Etape 3 : Mise a jour
- Mettre a jour ce fichier avec les 50 verbatim valides
- Mettre a jour `.planning/marketing/CONTEXT.md` section Verbatim VOC
- Reecriture landing avec verbatim reels

## Skills consommateurs

- `marketing/recherche-utilisateur` (principal, alimente cette banque)
- `marketing/copy` (utilise pour landing / pricing / FAQ)
- `marketing/social` (Reels + carrousels temoignages)
- `marketing/ads-creas` (variantes verbatim)
- `marketing/email-sequences` (subject lines + body)
- `marketing/cro-page` (audit confidence d'une page)
