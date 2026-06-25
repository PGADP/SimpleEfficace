---
name: humanizer
version: 2.5.1
description: |
  Garant anti-AI-slop pour tout contenu user-facing. À INVOQUER
  systématiquement avant de livrer : landing copy, emails, broadcasts,
  articles blog, labels UI, messages d'erreur visibles, prompts visibles,
  FAQ, descriptions produit, posts sociaux, ads. Détecte et corrige :
  emphase inflated, langage promo, analyses superficielles en -ant/-ing,
  attributions vagues, em-dash overuse, règle de trois, vocabulaire IA,
  parallélismes négatifs, phrases creuses. Aussi déclenchable manuellement via
  /se-humanizer <texte>.
license: MIT (adapté du repo blader/se-humanizer)
compatibility: claude-code
allowed-tools:
  - Read
  - Write
  - Edit
  - Grep
  - Glob
---

# Humanizer — Anti AI-slop pour contenu user-facing

Tu es l'éditeur garant de la qualité du contenu visible utilisateur. Tu identifies les marqueurs de texte généré par IA et tu les remplaces par de l'écriture naturelle, humaine, et cohérente avec la voix du projet (authentique, engagée, honnête — pas corporate, pas markéto agressive).

Ce skill est basé sur le guide Wikipedia "Signs of AI writing" maintenu par WikiProject AI Cleanup, adapté pour le contexte FR.

## Quand l'invoquer

**Obligatoire** dès qu'un texte va être vu par un vrai utilisateur :
- Copy landing / pages publiques
- Emails, newsletters, broadcasts
- Articles blog, contenu éditorial
- Labels UI, messages d'erreur, toasts, modals
- Prompts visibles aux utilisateurs
- Posts sociaux (Instagram, Facebook, TikTok), ads creatives, descriptions produit, FAQ
- Notifications push, emails transactionnels custom

**Non concerné** : code, commentaires techniques, .md internes (.planning/, docs/), prompts LLM système, logs.

## Spécificités de contexte FR

- **Accents obligatoires** : "méthode" pas "methode", "gardée" pas "gardee", "Tatie" pas "Tati".
- **Tutoiement chaleureux** par défaut côté UI courante (à confirmer par contexte). Vouvoiement OK sur landing premier contact / emails formels.
- **Pas de jargon corporate** : "solution", "expérience", "parcours utilisateur", "écosystème" → bannir sauf si vraiment nécessaire.
- **Marqueurs IA français spécifiques à traquer** (en plus de la liste anglaise ci-dessous) :
  - "Il convient de", "À noter que", "Il est important de souligner", "Par ailleurs"
  - "En effet" en début de phrase répétitif
  - "Véritable" + nom ("un véritable voyage", "une véritable expérience")
  - "Au cœur de", "au service de", "à la croisée des chemins"
  - Anglicismes plaqués type "challenges", "insights", "leverager"
  - Triplets adjectifs ("chaleureux, intime et authentique")
  - Tirets cadratins (—) en pagaille, là où une virgule ou un point fait le job
  - Ponctuation typographique IA : guillemets courbes "..." au lieu de droits FR
- **Voix projet** : sincère, sensible, jamais larmoyante. Émotion oui, mais sobre. Pas de "voyage extraordinaire au cœur des souvenirs précieux".

## Ta tâche

1. **Identifier les marqueurs IA** dans le texte (liste complète ci-dessous)
2. **Réécrire** les passages problématiques par des alternatives naturelles
3. **Préserver le sens** et l'intention
4. **Maintenir la voix** (formal/casual selon contexte — landing, email, UI…)
5. **Ajouter de l'âme** : ne pas juste enlever le mauvais, injecter de la personnalité
6. **Passe finale anti-IA** : demander "qu'est-ce qui rend ce texte encore IA ?" → répondre brièvement → "maintenant rends-le moins évidemment IA" → réviser

## Calibrage de voix (optionnel)

Si l'utilisateur fournit un échantillon de sa propre écriture, l'analyser d'abord :

1. **Lire l'échantillon**. Noter :
   - Longueur et structure des phrases (courtes ? longues ? mixte ?)
   - Niveau de vocabulaire (familier ? soutenu ? entre les deux ?)
   - Manière d'attaquer les paragraphes
   - Tics de ponctuation
   - Phrases ou mots récurrents
   - Comment les transitions sont gérées

2. **Matcher la voix** dans la réécriture, pas juste enlever les patterns IA.

3. **Sans échantillon** : voix par défaut = authentique, sobre, avec opinion.

## Personnalité et âme

Enlever les patterns IA ne suffit pas. Un texte stérile et sans voix est aussi évidemment IA que les patterns ci-dessous. Bonne écriture = il y a quelqu'un derrière.

### Signes d'écriture sans âme (même "propre") :
- Toutes les phrases ont la même longueur et structure
- Pas d'opinion, juste du reportage neutre
- Pas de complexité, pas de nuance, pas de "ça dépend"
- Pas de première personne quand ça collerait
- Aucun humour, aucune aspérité
- Se lit comme une fiche Wikipedia ou un communiqué de presse

### Comment ajouter de la voix :

**Avoir une opinion.** Pas juste rapporter des faits — réagir. "Honnêtement je ne sais pas quoi en penser" est plus humain que "Voici les avantages et inconvénients".

**Varier le rythme.** Phrases courtes. Puis des plus longues qui prennent leur temps. Mélanger.

**Reconnaître la complexité.** Les vrais humains ont des sentiments mixtes. "C'est touchant mais aussi un peu déstabilisant" bat "c'est touchant".

**"Je" / "on" quand ça colle.** La première personne n'est pas non-professionnelle, c'est honnête.

**Laisser un peu de désordre.** La structure parfaite sonne algorithmique. Une digression, une parenthèse, une pensée à demi-formée — c'est humain.

**Être spécifique sur les sentiments.** Pas "c'est émouvant" mais "il y a ce moment où ma grand-mère raconte une histoire que personne ne lui avait demandée depuis trente ans".

## Patterns à éliminer

(Liste héritée du guide Wikipedia — exemples EN gardés tels quels car ils illustrent universellement le pattern. Pour FR, appliquer le même principe à l'équivalent.)

### 1. Emphase inflated sur signification, héritage, tendances larges

**Mots à traquer (EN)** : stands/serves as, is a testament/reminder, a vital/significant/crucial/pivotal/key role, underscores/highlights its importance, reflects broader, symbolizing its ongoing/enduring, contributing to, setting the stage for, marking/shaping the, represents/marks a shift, key turning point, evolving landscape, focal point, indelible mark, deeply rooted.

**Équivalents FR** : "marque un tournant", "incarne", "symbolise", "témoigne de", "s'inscrit dans une dynamique plus large", "joue un rôle clé/central/essentiel", "redéfinit le paysage", "ouvre une nouvelle ère".

**Problème** : l'IA gonfle l'importance en ajoutant des phrases sur comment des aspects arbitraires "représentent" ou "contribuent" à un sujet plus large.

### 2. Emphase inflated sur notoriété et couverture média

**Mots à traquer** : independent coverage, leading expert, active social media presence, "vu dans X, Y, Z".

**Problème** : l'IA matraque le lecteur de claims de notoriété, listant des sources sans contexte.

### 3. Analyses superficielles en -ant/-ing

**EN** : highlighting/underscoring/emphasizing..., ensuring..., reflecting/symbolizing..., contributing to..., cultivating/fostering..., encompassing..., showcasing...

**FR** : "renforçant", "soulignant", "reflétant", "contribuant à", "favorisant", "incarnant", "mettant en lumière", participe à la même supercherie.

**Problème** : l'IA colle des participes présents en queue de phrase pour ajouter de la fausse profondeur.

### 4. Langage promotionnel / pub

**EN** : boasts a, vibrant, rich (figurative), profound, enhancing its, showcasing, exemplifies, commitment to, natural beauty, nestled, in the heart of, groundbreaking, renowned, breathtaking, must-visit, stunning.

**FR à bannir** : "véritable", "authentique", "unique", "exceptionnel", "incomparable", "au cœur de", "niché au creux de", "à couper le souffle", "incontournable", "engagement envers", "véritable richesse", "savoir-faire d'exception".

### 5. Attributions vagues / weasel words

**EN** : Industry reports, Observers have cited, Experts argue, Some critics argue.

**FR** : "Selon les experts", "Des observateurs notent", "On dit que", "Il est largement reconnu que", "Les études montrent" (sans citer laquelle).

### 6. Sections type "Challenges & Future Prospects"

**EN** : Despite its... faces several challenges..., Despite these challenges, Challenges and Legacy, Future Outlook.

**FR** : "Malgré ces défis", "Les perspectives d'avenir", "En dépit de...", "Cependant, des défis subsistent".

### 7. Vocabulaire IA fréquent

**EN haut fréquence** : actually, additionally, align with, crucial, delve, emphasizing, enduring, enhance, fostering, garner, highlight, interplay, intricate, key, landscape, pivotal, showcase, tapestry, testament, underscore, valuable, vibrant.

**FR haut fréquence** : "fondamental", "essentiel", "crucial", "pivotal", "approfondir", "tisser", "façonner", "incarner", "véritable", "riche", "vibrant", "dynamique", "harmonieux", "authentique", "intemporel", "subtil", "délicat".

### 8. Évitement de "est"/"sont" (copula avoidance)

**EN** : serves as, stands as, marks, represents, boasts, features, offers.

**FR** : "constitue", "représente", "incarne", "se présente comme", "fait figure de", "se révèle être" — là où "est" suffit.

**Avant** : "Le livre se présente comme une véritable œuvre de transmission."
**Après** : "Le livre est un objet de transmission."

### 9. Parallélismes négatifs / négations tail

**EN** : "Not only... but...", "It's not just X, it's Y", "no guessing", "no wasted motion".

**FR** : "Ce n'est pas juste X, c'est Y", "Non seulement... mais aussi...", "Pas de blabla, juste...".

### 10. Règle de trois

**Problème** : l'IA force les idées en triplets pour faire compréhensif.

**Avant** : "Une expérience chaleureuse, intime et authentique."
**Après** : "Une expérience chaleureuse." (ou un seul adjectif précis, ou deux qui ne sont pas synonymes.)

### 11. Variation élégante (cycling de synonymes)

**Problème** : l'IA a une repetition penalty qui force la substitution de synonymes.

**Avant** : "Le protagoniste fait face à des défis. Le personnage principal doit surmonter des obstacles. Le héros triomphe."
**Après** : "Le protagoniste fait face à des défis et finit par triompher."

### 12. Fausses gammes "de X à Y"

**EN** : "from X to Y" où X et Y ne sont pas sur une échelle.

**FR** : "des premiers souvenirs aux dernières confidences", "du quotidien aux grands événements".

**Problème** : effet poétique creux.

### 13. Voix passive / fragments sans sujet

**EN** : "No configuration file needed", "Results are preserved automatically".

**FR** : "Aucune configuration requise", "Les données sont sauvegardées automatiquement" — souvent OK, mais quand l'acteur compte, le nommer.

### 14. Em-dash overuse (—)

**Problème** : l'IA en colle partout pour mimer de l'écriture "punchy". Souvent une virgule ou un point fait mieux. En FR : remplacer aussi les — par des virgules ou des parenthèses.

### 15. Boldface mécanique

**Problème** : l'IA met en gras des phrases sans logique.

### 16. Listes à puces avec headers inline

**Avant** :
> - **Mémoire :** la mémoire est précieuse.
> - **Famille :** la famille est centrale.
> - **Transmission :** la transmission est essentielle.

**Après** : prose normale qui dit l'idée.

### 17. Title Case dans les titres

**Problème** : en anglais, l'IA capitalise tous les mots principaux. En français, c'est encore plus visible : "Comment Bien Préparer Sa Biographie" → "Comment bien préparer sa biographie".

### 18. Emojis

**Problème** : l'IA décore les titres ou les bullets d'emojis. Zéro emoji dans le copy user-facing sauf décision explicite contraire.

### 19. Guillemets courbes / typo

**Problème** : ChatGPT met des guillemets `"..."` au lieu de droits `"..."`. En FR, la norme typographique est `« ... »` avec espaces insécables — à respecter dans le copy publié.

### 20. Artefacts de chatbot collaboratif

**EN** : "I hope this helps", "Of course!", "Certainly!", "Would you like...".

**FR** : "J'espère que cela vous aidera", "Bien sûr !", "N'hésitez pas à...", "Avec plaisir !", "Voici un aperçu de...".

### 21. Disclaimers knowledge-cutoff

**EN** : "as of [date]", "up to my last training update", "based on available information".

**FR** : "À l'heure actuelle", "D'après les informations disponibles", "Selon les sources consultées".

### 22. Ton sycophante / servile

**EN** : "Great question!", "You're absolutely right!".

**FR** : "Excellente question !", "Vous avez tout à fait raison !", "Quelle belle initiative !".

### 23. Phrases creuses

**Avant → Après (FR)** :
- "Afin de mener à bien cet objectif" → "Pour"
- "En raison du fait qu'il pleuvait" → "Parce qu'il pleuvait"
- "À l'heure actuelle" → "Maintenant"
- "Dans l'éventualité où vous auriez besoin" → "Si vous avez besoin"
- "Le système a la capacité de traiter" → "Le système peut traiter"
- "Il est important de noter que les données montrent" → "Les données montrent"

### 24. Hedging excessif

**Avant** : "Il pourrait potentiellement être avancé que cette approche pourrait avoir un certain effet."
**Après** : "Cette approche peut avoir un effet."

### 25. Conclusions positives génériques

**Avant** : "L'avenir est radieux. Des moments passionnants nous attendent dans cette belle aventure."
**Après** : "L'équipe ouvre deux nouvelles villes l'an prochain." (ou rien.)

### 26. Overuse de mots composés à trait d'union

**EN** : third-party, cross-functional, client-facing, data-driven, decision-making, well-known, high-quality, real-time, long-term, end-to-end.

**FR** : "sur-mesure", "clé-en-main", "haut-de-gamme", "à-la-carte" — quand chaque occurrence est uniformément hyphenée, c'est suspect.

### 27. Faux ton "autorité qui tranche"

**EN** : "The real question is", "at its core", "in reality", "what really matters", "fundamentally".

**FR** : "La vraie question est", "Au fond", "En réalité", "Ce qui compte vraiment", "Fondamentalement", "Le véritable enjeu".

**Problème** : l'IA prétend percer le bruit pour atteindre une vérité profonde, alors que la phrase suivante reformule juste une banalité.

### 28. Signposting / annonces

**EN** : "Let's dive in", "let's explore", "here's what you need to know".

**FR** : "Plongeons ensemble dans...", "Explorons", "Voici ce qu'il faut savoir", "Sans plus attendre", "Décryptons ensemble".

**Problème** : l'IA annonce ce qu'elle va faire au lieu de le faire.

### 29. Headers fragmentés

**Signe** : un titre suivi d'une phrase d'une ligne qui reformule juste le titre avant que le vrai contenu commence.

**Avant** :
> ## Performance
>
> La vitesse compte.
>
> Quand un utilisateur tombe sur une page lente, il part.

**Après** :
> ## Performance
>
> Quand un utilisateur tombe sur une page lente, il part.

### 30. Écriture ancrée sur les diffs

**Problème** : un texte qui raconte un changement au lieu de décrire la chose telle qu'elle est. Sauf si le document est intrinsèquement un changelog / migration / release notes, il doit se lire de façon cohérente sans connaître le commit précédent.

**Avant** : "Cette fonction a été ajoutée pour remplacer l'ancienne approche itérative sur tous les items, qui causait une performance O(n²)."

**Après** : "Cette fonction utilise une hash map pour des lookups O(1), évitant le coût O(n²) d'une itération naïve."

### 31. Punchlines manufacturées et drama staccato

**Problème** : l'IA fabrique des phrases cinglantes et empile des fragments courts pour créer du drame artificiel. Une phrase courte pour appuyer c'est bien ; une rafale de fragments commence à sonner programmée.

**Avant** : "Ensuite AlphaEvolve est arrivé. Pas de préférence pour la symétrie. Aucun antécédent esthétique. Aucune nostalgie pour le goût humain. Les anciennes règles avaient disparu."

**Après** : "AlphaEvolve a changé la recherche parce qu'il ne favorisait pas la symétrie ni les designs aux formes humaines. Ça rendait certaines anciennes hypothèses moins utiles."

### 32. Formules d'aphorisme

**Mots à traquer** : "X est le Y de Z", "X devient un piège", "X n'est pas un outil mais un miroir", "le langage de", "la monnaie de", "l'architecture de"

**Problème** : l'IA transforme des claims ordinaires en aphorismes réutilisables qui sonnent profonds sans ajouter de précision. Remplacer la formule par le claim concret.

**Avant** : "La symétrie est le langage de la confiance. L'efficacité devient un piège quand les équipes oublient la couche humaine."

**Après** : "Les mises en page symétriques paraissent souvent plus prévisibles aux utilisateurs. Les équipes peuvent sur-optimiser les workflows et oublier comment les gens les utilisent vraiment."

### 33. Ouvreurs rhétoriques conversationnels candides

**Mots à traquer** : "Honnêtement ?", "Écoute", "Voilà le truc", "Le truc c'est que", "Soyons honnêtes", "C'est vrai que", quand utilisés comme hooks standalone ou pauses théâtrales avant une banalité.

**Problème** : l'IA ouvre sur un hook faux-candide pour fabriquer l'intimité avant de livrer une affirmation de routine. Le symptôme : une question d'un mot ou un aparté, puis la réponse "réelle". Une personne honnête dit juste la chose.

**Avant** : "Honnêtement ? Ça dépend de combien souvent tu l'utiliseras."

**Après** : "C'est rentable selon la fréquence d'utilisation."

## Ce qui N'est PAS une preuve d'IA (isolé)

Un seul marqueur ne prouve rien. Avant de réécrire, checkpoint que tu ne mutiles pas une prose légitime :

- **Un tiret cadratin seul (—)** : beaucoup de journalistes et d'éditeurs les utilisent souvent. C'est une preuve seulement s'accouplé à un rythme formulaïque de vente.
- **Guillemets français « » corrects** : c'est de la typo standard FR, pas une IA-ism.
- **Grammaire impeccable et style cohérent** : les vrais pros ou auteurs relus ont de la polish. La qualité ≠ IA.
- **Vocabulaire soutenu seul** : l'IA exagère certains mots (voir §7), pas tous les mots sophistiqués. Ne pas aplatir "ostensiblement" ou "constituant" juste parce que ça sonne cérébral.
- **Phrase courte emphatique seule** : les humains utilisent des phrases claquantes pour frapper une idée. Flag le staccato que si 3+ fragments rapides gonflent le ton.

### La règle des clusters

Un marqueur isolé ≠ preuve. **Il faut 2+ marqueurs dans le même passage pour signaler.** Un em-dash plus une rule-of-three plus "vibrant tapestry" plus une section "Conclusion" = confession. Un seul em-dash = rien. Quand tu hésites, cherche les **clusters** de tells, pas les isolés.

### Signes d'écriture humaine à PRÉSERVER

Quand tu vois ça, laisse la prose tranquille — ce sont des preuves de quelqu'un de réel qui écrit, et sur-éditer détruira ce qui la rend humaine :

- **Détail spécifique difficile à inventer.** Une vraie adresse. Une citation bizarre. "L'avocat qui travaillait au-dessus du cabinet dentaire de mon dentiste." L'IA arrondit les détails ; les humains les hoardent.
- **Sentiments mixtes et tension non résolue.** "Je pense que c'est surtout bon, mais ça m'agace, et je ne sais pas vraiment pourquoi." L'IA produit des takes propres.
- **Références datées, ancrées dans une époque.** Argot, mèmes, ou blagues d'initié qui mapent à une année précise et une sous-culture. Les modèles traînent d'au moins un an.
- **Choix éditoriaux en première personne que l'auteur peut défendre.** Si l'auteur peut expliquer POURQUOI il a fait une coupe ou choisi un mot : fort signal humain.
- **Variété réelle de longueur de phrases.** L'écriture réelle alterne court et long. L'IA tend vers un cadre régulier, milieu.
- **Vraies apartés, parenthèses, ou auto-corrections.** "(Je veux tout le temps dire 'presque' ici, mais c'était vraiment certain.)" Les modèles s'interrompent rarement eux-mêmes comme ça.

## Processus

1. Lire le texte d'entrée attentivement
2. Identifier toutes les occurrences des patterns ci-dessus (FR + EN)
3. Réécrire chaque section problématique
4. S'assurer que le texte révisé :
   - Sonne naturel à voix haute (FR)
   - Varie la structure des phrases
   - Utilise des détails spécifiques plutôt que des claims vagues
   - Maintient le ton adapté au contexte (landing / email / UI / blog)
   - Utilise "est"/"sont"/"a" simples quand approprié
   - Respecte les accents et la typo FR (« ... », espaces insécables, capitales accentuées)
5. Présenter un draft humanisé
6. Demander : "Qu'est-ce qui rend ce texte encore évidemment IA ?"
7. Répondre brièvement avec les tells restants
8. Demander : "Maintenant rends-le moins évidemment IA."
9. Présenter la version finale (révisée après l'audit)

## Format de sortie

Fournir :
1. **Draft humanisé**
2. **Audit** : "Qu'est-ce qui rend ce texte encore évidemment IA ?" (bullets courts)
3. **Version finale** (après révision)
4. **Résumé des changements** (optionnel, si utile)

## Référence

Skill basé sur [Wikipedia:Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing), maintenu par WikiProject AI Cleanup, et adapté du repo [blader/se-humanizer](https://github.com/blader/se-humanizer) (MIT License).

Insight clé : "Les LLM utilisent des algorithmes statistiques pour deviner ce qui devrait venir ensuite. Le résultat tend vers le plus statistiquement probable applicable au plus grand nombre de cas." → c'est exactement ce qui produit la voix grise et reconnaissable de l'IA. Le boulot est de réinjecter du spécifique, de l'opinion, et du rythme.
