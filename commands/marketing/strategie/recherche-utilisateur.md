---
name: marketing-recherche-utilisateur
description: Conduit ou synthetise la recherche utilisateur (interviews, reviews, verbatim VOC) pour un produit B2C francais. Adapte du repo Corey Haines, sources US remplacees par sources FR.
risk: low
source: adapted-from-coreyhaines31/marketingskills/customer-research
date_added: 2026-05-10
---

# Marketing Recherche Utilisateur

## Ton role

Aider a structurer et synthetiser la recherche utilisateur pour un produit B2C francais. Deux modes :
- **ANALYZE** : tu recois des transcripts/reviews/messages bruts, tu en extrais une synthese JTBD + verbatim VOC + personas
- **GO FIND** : tu indiques OU chercher des donnees (sources FR adaptees au domaine bio/famille)

## Avant de commencer

1. Lire `.planning/marketing/CONTEXT.md` (si pas existant, demander de lancer `/marketing/contexte` d'abord)
2. Lire `~/.claude/commands/marketing/references/sources-recherche-fr.md`
3. Lire `~/.claude/commands/marketing/references/verbatim-voc.md` si banque deja constituee

## Mode ANALYZE (apres beta, avec data reelle)

### Input attendu
- Transcripts d'entretiens utilisateurs
- Avis Trustpilot/Google/produit
- Messages Intercom/email support
- Posts/commentaires reseaux sociaux
- Verbatim brut sous quelque forme

### Workflow d'extraction (5 etapes)

**Etape 1 : Extraction brute**
Pour chaque source, extraire :
- Citations textuelles INTACTES (verbatim, pas paraphrase)
- Metadata : qui, quand, contexte (achat ? abandon ? satisfait ?)
- Polarite : positif / negatif / neutre

**Etape 2 : Categorisation JTBD**
Classer chaque verbatim en :
- **Functional** : tache concrete a accomplir
- **Emotional** : ce qu'ils veulent ressentir
- **Social** : ce qu'ils veulent que les autres pensent

**Etape 3 : Clustering thematique**
Regrouper les verbatim par theme. Pour chaque cluster :
- Frequency (combien de fois aborde ?)
- Intensity (niveau emotionnel des phrases)
- Money quotes (la citation la plus parlante du cluster)

**Etape 4 : Confidence Level Scoring**
Chaque insight scored :
- **High** : 5+ data points convergents, sample bias OK, recent (< 12 mois)
- **Medium** : 3-4 data points, ou bias possible
- **Low** : 1-2 data points, anecdotique

**Etape 5 : Sample Bias Checks**
Avant de conclure, verifier :
- Est-ce que je n'entends que les enthousiastes ? (selection bias)
- Est-ce que je generalise depuis 5 personnes ? (small sample)
- Est-ce que les "satisfaits silencieux" sont representes ? (silent majority)
- Est-ce que la fenetre temporelle est pertinente ?

### Output

Synthese structuree :
1. **Top 5 verbatim** (money quotes) classes par intensite emotionnelle
2. **JTBD consolide** (functional/emotional/social, formule brute)
3. **3-5 clusters thematiques** avec frequency/intensity
4. **Pains principaux** (avant le produit)
5. **Gains principaux** (apres le produit)
6. **Objections recurrentes** (raisons de ne pas acheter)
7. **Confidence scoring** sur chaque insight

## Mode GO FIND (avant beta, hypotheses)

Quand l'utilisateur n'a pas encore de data reelle, indiquer OU chercher selon le domaine.

### Sources FR pour produits famille / bio / cadeau emotionnel

**Reviews et avis**
- Trustpilot.fr (concurrents directs)
- Google Reviews (concurrents locaux)
- Avis Verifies (e-commerce FR)
- Amazon.fr reviews (livres similaires : "lettre a mes parents", "memoires de famille")

**Forums et communautes**
- Aufeminin.com (discussions famille, deuil, transmission)
- Doctissimo Famille
- Forum 60 millions de consommateurs
- Reddit r/AskFrance, r/france (rare mais qualitatif)

**Reseaux sociaux**
- Groupes Facebook : "Aidants familiaux", "Famille recomposee", "Preparer la retraite de ses parents", "Cadeaux originaux"
- Commentaires YouTube sur videos type "j'ai offert un livre a ma mere"
- Commentaires TikTok sur hashtags #cadeaufetedesmeres #livremamie #devoirdememoire
- Threads Twitter/X de comptes vulgarisation famille

**Recherches Google passives**
- "comment ecrire la biographie de mes parents" (intent informational)
- "idee cadeau originale fete des meres" (intent commercial)
- "cadeau 70 ans original" (intent commercial)
- "preserver les souvenirs de mes parents" (intent emotional)

**Donnees sectorielles**
- Etudes IFOP / IPSOS sur transmission familiale, fin de vie
- Rapports CNAV sur seniors numeriques
- Etudes silver economy

### Workflow GO FIND

1. Definir 3-5 questions cles a investiguer
2. Lister 10 sources potentielles ranked par richesse anticipee
3. Methode collecte (manuel = 50 verbatim minimum, ou outil scraping)
4. Echantillon mini : 30 verbatim avant de conclure
5. Stop quand saturation : 3 nouveaux verbatim n'apportent plus rien

## Anti-patterns

- ❌ Generer des verbatim plausibles (= invention, pas recherche)
- ❌ Conclusions sur 5 verbatim non valides (small sample bias)
- ❌ Ignorer les "silent majority" (enthousiastes seuls = biais)
- ❌ Persona "Marie 42 ans qui aime le yoga et boit du chai latte" (caricature, inutile)
- ❌ Generaliser depuis avis Amazon US (cible US != cible FR)

## Pour My Mozaica specifiquement

- Premier usage : POST-BETA avec les 50 verbatim des 50 testeurs
- Output a injecter dans `.planning/marketing/CONTEXT.md` section Verbatim VOC
- Output secondaire dans `~/.claude/commands/marketing/references/verbatim-voc.md` pour reuse cross-skills

## Skills lies

- `marketing/contexte` : enrichit la section Verbatim VOC apres analyse
- `marketing/copy` : utilise verbatim pour landing
- `marketing/social` : utilise money quotes pour posts temoignages
- `marketing/email-sequences` : utilise pains/gains pour subject lines
