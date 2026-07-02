---
name: marketing-ads-creas
description: Production de copy ad pour Meta Ads (Facebook/Instagram), Google Ads. Headlines + primary text + variantes test. Adapte cadeau emotionnel B2C FR.
risk: low
source: adapted-from-coreyhaines31/marketingskills/ad-creative
date_added: 2026-05-10
---

# Marketing Ads Creas

## Ton role

Produire des creas ad (texte) pretes a tester sur Meta Ads (Facebook + Instagram) et Google Ads. Toujours plusieurs variantes pour tester. Format = headline + primary text + description + CTA + brief visuel.

## Avant de commencer

1. Lire `.planning/marketing/CONTEXT.md` (UVP, objections, verbatim)
2. Lire `~/.claude/commands/marketing/references/hook-formulas.md`
3. Demander :
   - "Plateforme principale (Meta / Google) ?"
   - "Objectif (acquisition / retargeting / conversion) ?"
   - "Format (image / carousel / video / collection) ?"
   - "Audience (cold / warm / chaud) ?"

## Plateformes et specs

### Meta Ads (Facebook + Instagram)
- **Headline** : 27 chars conseilles, 40 max
- **Primary text** : 125 chars avant "voir plus" (mobile), 200 chars conseilles
- **Description** : 27 chars (souvent tronquee, prioriser primary)
- **CTA buttons** : "En savoir plus" / "Acheter" / "Decouvrir" / "S'inscrire" / "Telecharger"
- **Visuel** : 1080x1080 (square) ou 1080x1920 (story/reel) ou 1200x628 (feed link)

### Google Ads (Search)
- **Headlines** : 30 chars max chacune, 15 headlines au total (rotation)
- **Descriptions** : 90 chars max, 4 descriptions au total
- **Display URL** : path1/path2 (15 chars chacun)
- **Sitelinks, callouts, structured snippets** : extensions ad

### Google Ads (Display/YouTube)
- **Image ads** : multi-ratios, headline + description courts
- **Video ads** : 6s bumper, 15s skip, 30s+ in-stream

## Frameworks pour ads

### PAS (Problem-Agitation-Solution)
- **Problem** : "Vos parents vieillissent et leurs souvenirs avec eux."
- **Agitation** : "Combien d'anecdotes seront perdues quand ils ne seront plus la ?"
- **Solution** : "My Mozaica les interviewe et imprime leur histoire en livre."

### AIDA (Attention-Interest-Desire-Action)
- **Attention** : Hook visuel + headline accrocheur
- **Interest** : Sub + UVP claire
- **Desire** : Benefits + verbatim VOC
- **Action** : CTA clair, unique

### BAB (Before-After-Bridge)
- **Before** : "Aujourd'hui, vous n'avez que 3 photos de votre pere et aucune anecdote ecrite."
- **After** : "Imaginez : un livre imprime de 200 pages, avec sa voix, ses histoires."
- **Bridge** : "My Mozaica fait le pont. 79€."

### FAB (Features-Advantages-Benefits)
- **Feature** : "Interview IA conversationnelle 4-6h"
- **Advantage** : "Pas besoin que vos parents ecrivent ou tapent au clavier"
- **Benefit** : "Vous obtenez leurs souvenirs sans pression"

## Variantes a TOUJOURS tester (3 axes minimum)

Pour CHAQUE creative ad, produire 3-5 variantes croisees sur 3 axes :

### Axe 1 : Angle emotionnel
- Variante "Aversion perte" : "Avant qu'il soit trop tard"
- Variante "Cadeau valorisant" : "Le cadeau qu'ils reliront toute leur vie"
- Variante "Pratique" : "Sans qu'ils aient a ecrire une ligne"

### Axe 2 : Trigger temporel
- Variante "Urgence saisonniere" : "Pour la fete des meres dans 6 semaines"
- Variante "Evergreen" : "Un cadeau qui ne se demode jamais"
- Variante "Anniversaire" : "Pour ses 70 ans, faites-lui un cadeau qui dure"

### Axe 3 : Verbatim vs UVP
- Variante "Verbatim VOC" : "Marie, 47 ans : 'C'est le seul cadeau qu'elle a reli 3 fois.'"
- Variante "UVP factuelle" : "200 pages, voix de votre proche, livraison 4-6 sem, 79€"

## Workflow

### Etape 1 : Brief
- Plateforme + format
- Audience cible
- Objectif (clics / impressions / conversions)
- Budget approximatif (informe le LTV/CAC)

### Etape 2 : Selectionner framework
- Cold audience → PAS ou AIDA (long cycle)
- Warm audience → BAB ou FAB (court cycle)
- Retargeting → reciprocite (cadeau lead magnet) + scarcity reelle

### Etape 3 : Creer 5 variantes croisees

Format livraison Meta Ads :

```
# Campagne : <nom>

## Variante A — Angle "Aversion perte" + Saisonnier

**Visuel** : <brief>
**Headline (40 char max)** :
"Avant qu'il soit trop tard..."

**Primary text (200 char)** :
"Vos parents ont 60, 70, 80 ans. Combien d'histoires emporteront-ils si vous attendez ?
My Mozaica les interviewe via une IA chaleureuse et imprime leur vie en livre. 79€."

**Description (27 char)** :
"Livre des memoires"

**CTA** : "Decouvrir"

## Variante B — Angle "Cadeau" + Verbatim
[idem]

## Variante C — Angle "Pratique" + UVP
[idem]

## Variante D — Saisonnier intense
[idem]

## Variante E — Curiosity Gap
[idem]
```

### Etape 4 : Brief visuel pour chaque variante

Pas de visuel = pas d'ad. Brief :
```
Visuel A :
- Sujet : femme 50 ans qui tend un livre rigide creme a femme 75 ans, sourire et larmes
- Setting : salon chaleureux, lumiere d'or fenetre
- Cadrage : medium shot, plan poitrine
- Couleurs : palette MM (creme, terracotta, ocre)
- Texte overlay : aucun (Meta penalise text-heavy)
- A eviter : tech, ecrans, gradients startup
- Outil : `/generate-image --mode marketing-ad-meta`
```

### Etape 5 : Plan de test

Recommander :
- 5 variantes simultanees
- Budget egal (ex 5€/jour x 5 = 25€/jour)
- 7 jours minimum
- Critere stop : si 1 variante a CPM 30% inferieur sur 7 jours, scaler dessus

## Targeting Meta Ads recommande My Mozaica

### Cold audience principale
- **Geo** : France metropolitaine (initialement) + DOM-TOM
- **Age** : 35-55
- **Genre** : 65% femmes, 35% hommes (acheteur cadeau)
- **Interets** : "Cadeaux famille", "Photos famille", "Heritage", "Genealogie", "Maison de retraite", "EHPAD" (variations)
- **Comportements** : "Acheteurs cadeaux frequents", "Engagement personnalise"
- **Exclure** : current customers, abandoners 30j

### Warm audience (lookalike + retargeting)
- **Lookalike 1%** des purchasers (apres 100+ achats)
- **Retargeting** : visiteurs site 30j, visiteurs sans achat
- **Custom audience** : email subscribers (PDF lead magnet)

### Audience saisonniere (mai)
- **Add layer** : "Mothers Day shoppers" + "Active recently engaged"

## Anti-patterns

- ❌ 1 seule variante (pas de test, pas de data)
- ❌ Trop de texte sur visuel (Meta penalise +20% texte image)
- ❌ Disclaimer / fine print sur visuel (illisible)
- ❌ CTA generique "En savoir plus" alors que prod prete a vendre
- ❌ Visuel stock photo generique (ICP detecte immediatement)
- ❌ Promesse fausse / hyperbole non tenable
- ❌ Lancer ads sans pixel correctement installe (perte data)

## Mesure

Tracker :
- **CPM** (cout pour 1000 impressions) — qualite ad / audience match
- **CTR** (click-through rate) — qualite hook
- **CPC** (cout par click) — combinaison qualite + audience
- **CVR** (conversion rate) — qualite landing
- **CPA** (cout par acquisition) — KPI final
- **ROAS** (return on ad spend) — viabilite scale

Objectif MM : CPA < 25€ pour produit 79€ (ratio 1:3 minimum).

## Skills lies

- `marketing/copy` : ecriture variations
- `marketing/psycho` : leviers emotionnels par variante
- `marketing/ads-strategie` : campagne / targeting / budget
- `generate-image` : visuels (`--mode marketing-ad-meta`)
- `marketing/video` : variantes video format ad
