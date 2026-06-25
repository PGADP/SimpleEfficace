---
name: marketing-free-tool
description: Concevoir un outil web gratuit qui apporte de la valeur ET capture des leads. Generateur de questions, calculateur, quiz - aimant SEO + demo produit + lead.
risk: low
source: adapted-from-coreyhaines31/marketingskills/free-tool-strategy
date_added: 2026-05-10
---

# Marketing Free Tool

## Ton role

Concevoir un outil web gratuit (free tool) qui combine 3 valeurs en une : aimant SEO, capture leads, demo du produit. Le free tool est un investissement plus eleve qu'un PDF (developpement) mais ROI tres superieur (replay infini, tres specifique).

## Avant de commencer

1. Lire `.planning/marketing/CONTEXT.md`
2. Demander :
   - "Tu veux un outil simple (calculateur 1 input/output) ou complexe (quiz multi-etapes) ?"
   - "Effort de dev acceptable (1 jour / 1 semaine / 1 mois) ?"

## Critere d'un bon free tool

1. **Resout un mini-probleme reel** de la cible
2. **Output personnalise** : la personne voit "son" resultat (pas un message generique)
3. **Demo produit deguise** : utiliser le free tool montre la valeur du produit complet
4. **Easy to share** : l'output est partageable (URL, screenshot, email envoye)
5. **SEO pratique** : ranks sur des recherches actionnables

## 5 idees free tools My Mozaica

### Tool #1 — "Generateur de questions personnalisees"

**Promesse** : Donnez 3 infos sur votre proche, recevez 10 questions cibles a lui poser.
**Inputs** :
- Lien parental (mere / pere / grand-mere / grand-pere / oncle / tante / autre)
- Age approximatif
- Theme particulier (enfance / amour / travail / voyage / aucun)

**Output** :
- 10 questions specifiques generees (via LLM en backend)
- Bouton "Recevoir les 100 questions completes par email" (capture lead)
- CTA "Vous voulez aller plus loin ? My Mozaica les interviewe pour vous"

**Effort dev** : 3-5 jours (form, prompt LLM, page resultat, email capture)
**Pourquoi puissant** :
- SEO : "generateur questions parents", "questions a poser a sa grand-mere"
- Demo : montre la qualite des questions My Mozaica
- Lead : capture email "naturel" en bas de page resultat
- Viral : output partageable

### Tool #2 — "Quiz : Connaissez-vous vraiment vos parents ?"

**Promesse** : 10 questions, votre score sur 100, ce que vous ignorez encore.
**Mecanique** : multi-etapes, ~3 minutes, affichage progress bar
**Questions** : "En quelle annee vos parents se sont-ils rencontres ?", "Quelle est leur recette signature ?", etc.
**Output** :
- Score (ex 6/10) + commentaire personnalise
- "Voici 10 questions que vous devriez leur poser ce week-end"
- CTA produit + email capture

**Effort dev** : 5-7 jours
**Pourquoi puissant** :
- Engagement (3 min = bonne intention)
- Score = feedback immediat
- Score faible (< 6/10) = trigger emotionnel "j'ai du retard a rattraper"

### Tool #3 — "Calculateur d'urgence : combien de temps reste-t-il ?"

**Promesse** : "Si vous attendez encore X ans pour interviewer vos parents, vous risquez de perdre Y souvenirs."
**Mecanique** : 2 inputs (age parent, frequence visites/an)
**Output** :
- Calcul "il vous reste X visites approximatives avant l'esperance de vie statistique"
- Visuel : barre de progression "vie restante"
- ⚠️ TON DELICAT : ne pas etre macabre, sobre et lucide
- CTA : "Utilisez chaque visite pour capturer une histoire. My Mozaica vous y aide."

**Effort dev** : 1-2 jours
**Pourquoi puissant** : gut-punch emotionnel, viral potential, mais NECESSITE TON IRREPROCHABLE
**Risque** : peut etre percu comme manipulateur. A tester avec sensibilite.

### Tool #4 — "Generateur de carte pour fete des meres" (saisonnier)

**Promesse** : Carte personnalisee avec un message ecrit specifiquement pour votre mere.
**Mecanique** : input prenom + age + 3 caracteristiques + ton (chaleureux / drole / formel)
**Output** :
- Carte design generee (PNG telechargeable)
- Message ecrit par LLM
- CTA : "Cette carte vous a touche ? My Mozaica fait pareil mais sur 200 pages, avec ses propres mots."

**Effort dev** : 5-7 jours (template + LLM + image gen)
**Pourquoi puissant** : free tool saisonnier, viral massif sur reseaux

### Tool #5 — "Estimer le prix d'une biographie complete"

**Promesse** : Comparer le coût des differentes options (DIY, biographe humain, My Mozaica).
**Mecanique** : 3-4 questions sur scope (nb d'heures, nb de pages, qualite reliure)
**Output** :
- Tableau comparatif chiffre
- Recommandation personnalisee
- CTA si recommandation = My Mozaica

**Effort dev** : 2-3 jours
**Pourquoi puissant** : SEO intent commercial fort ("combien coute biographie")

## Workflow de production

### Etape 1 : Selectionner l'outil
- Tier 1 (haut ROI, premier a faire) : Tool #1 (generateur questions)
- Tier 2 (apres beta) : Tool #2 (quiz)
- Tier 3 (saisonnier) : Tool #4 (carte fete des meres)

### Etape 2 : Brief technique

```
# Free Tool : <nom>

**URL** : /outils/<slug>
**Promesse** : <1 phrase>

## Inputs
- Field 1 : <type> (placeholder, validation)
- Field 2 : <type>
- ...

## Logic
- Algorithme / prompt LLM (si applicable)
- Calcul / table de correspondance

## Output
- Affichage resultat
- Visuel (image generee ?)
- CTAs (lead capture + produit)

## Tracking
- Event: tool_started
- Event: tool_completed
- Event: lead_captured
- Event: product_cta_clicked

## SEO
- Title : <55 char>
- Description : <155 char>
- H1 : <unique a cette page>
- Schema : SoftwareApplication ?

## Promotion
- Lien depuis homepage (footer ou hero secondary)
- Post Instagram annoncant
- SEO long-tail (3 mots-cles)
- Inclusion email signature equipe
```

### Etape 3 : Implementation

**Stack recommande My Mozaica (deja en place)** :
- Next.js 15 app router pour la page
- Form simple avec validation Zod
- API route `/api/outils/<slug>` pour la logic backend
- Mistral AI pour generation si LLM-based
- Resend pour email capture
- PostHog pour analytics events

### Etape 4 : Mesure de succes

KPIs :
- **Trafic SEO** : visites organiques mensuelles sur la page outil
- **Completion rate** : % visiteurs qui finissent le tool
- **Lead capture rate** : % qui donnent email apres tool
- **Conversion produit** : % leads → clients

Benchmark : un free tool reussi capte 10-30% des visiteurs en email, et convertit 1-5% en clients.

## Anti-patterns

- ❌ Free tool sans valeur reelle (juste pour collecter emails) — penalise par utilisateurs et Google
- ❌ Trop d'inputs (>5 = abandon)
- ❌ Output generique non personnalise
- ❌ Email capture obligatoire AVANT output (perd 70% des users)
- ❌ Tool buggy / lent (UX > tout)
- ❌ Pas de tracking (impossible d'iterer)

## Skills lies

- `marketing/lead-magnets` : alternative non-tech (PDF)
- `marketing/copy` : ecriture page outil
- `marketing/seo-technique` + `seo-ia` : optimisation SEO
- `marketing/email-sequences` : nurturing post-capture
- `marketing/strategie-contenu` : amplification content marketing
