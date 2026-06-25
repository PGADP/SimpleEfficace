---
name: marketing-ads-strategie
description: Strategie campagnes payantes Meta Ads / Google Ads - audience, budget, structure compte, scaling. Adapte B2C FR cadeau saisonnier 79€.
risk: low
source: adapted-from-coreyhaines31/marketingskills/paid-ads
date_added: 2026-05-10
---

# Marketing Ads Strategie

## Ton role

Definir la strategie macro des campagnes payantes : structure de compte, audiences, budgets, sequencing, scaling. **Pas le copy des ads** (cf `marketing/ads-creas` pour ca). Output = plan strategique 3-6 mois.

## Avant de commencer

1. Lire `.planning/marketing/CONTEXT.md`
2. Demander :
   - "Plateforme principale (Meta / Google / les deux) ?"
   - "Budget mensuel envisage ?"
   - "Tracking installe (Meta Pixel + GA4 + PostHog) ?"
   - "Phase (premier test / scaling / optimisation) ?"

## Plateformes pour My Mozaica

### Meta Ads (Facebook + Instagram) — PRIORITE 1

**Pourquoi #1** :
- ICP 35-55 ans tres present
- Targeting precis sur "interets cadeaux famille / heritage"
- Creatives visuelles puissantes (cadeau emotionnel)
- Lookalike audiences efficaces
- CPM raisonnable cible FR

**Inconvenients** :
- iOS 14+ (perte signal post-clic)
- Saturation marche FR
- Penalise text-heavy creatives

### Google Ads — PRIORITE 2

**Search** : capture intent commercial
- "cadeau fete des meres original"
- "biographie personnalisee parents"
- "ecrire memoires de mes parents"
- ROAS plus haut quand intent eleve

**Display** : retargeting + awareness
- Reseaux GDN
- YouTube ads (Reels syndiques)

### LinkedIn — PAS DE BUDGET pour l'instant

Trop cher CPM pour B2C cadeau. Reserver pour eventuel pivot B2B (cabinets notaires, RH).

### TikTok Ads — A TESTER PETIT

Audience plus jeune mais penetration 35+ progresse. Test petit budget (200€) pour valider.

## Phases d'investissement

### Phase 1 : Validation (mois 1, budget total 500€-1500€)

**Objectif** : valider que le marche reagit aux ads.

**Setup** :
- 1 campagne Meta acquisition cold
- 3-5 creatives a tester
- Audience 1 large (interets larges)
- Budget : 25€/jour x 7 jours = 175€ par cycle de test
- Stop critere : si CPA < 30€ a 7 jours, scale. Sinon, iterer creatives.

**KPI cible** :
- CPM < 12€
- CTR > 1.5%
- CPA < 30€ (objectif idealement < 20€)

### Phase 2 : Scale lookalikes (mois 2-3, budget 1500€-3000€/mois)

**Objectif** : multiplier les conversions sur audiences performantes.

**Setup** :
- Garder campagne validee Phase 1
- Ajouter Lookalike 1% (basee sur 100+ purchasers)
- Ajouter retargeting (visiteurs site 30j sans achat)
- Ajouter Google Ads Search (3-5 campagnes intent)

**Audiences testees** :
- Cold large (interets generiques)
- Cold ciblee (interets niche bio / genealogie / EHPAD)
- Lookalike 1% purchasers
- Lookalike 1% lead magnet downloaders
- Retargeting site 30j
- Retargeting cart abandoners

### Phase 3 : Optimisation (mois 4+, budget 3000€-10000€/mois)

**Objectif** : reduire CPA, augmenter ROAS, identifier scale ceiling.

**Setup** :
- Killer audiences performantes
- A/B test creatives au quotidien
- Audience expansion progressive
- Sequencing : cold → retargeting → conversion

**Saisonnier** :
- Boost massive 6 sem avant fete des meres
- Boost Noel decembre
- Maintenance reguliere autre periode

## Structure compte Meta Ads recommandee

```
COMPTE
├── Campagne 1 : Acquisition Cold
│   ├── Ad set : Audience large (interets generiques)
│   │   ├── Ad : Variant A (verbatim VOC)
│   │   ├── Ad : Variant B (UVP factuelle)
│   │   ├── Ad : Variant C (urgence saisonniere)
│   │   └── Ad : Variant D (curiosity hook)
│   ├── Ad set : Audience niche (interets specifiques)
│   │   └── Ads...
│   └── Ad set : Lookalike 1%
│       └── Ads...
├── Campagne 2 : Retargeting
│   ├── Ad set : Visiteurs 30j
│   ├── Ad set : Cart abandoners
│   └── Ad set : Lead magnet sans achat
├── Campagne 3 : Conversion (warm)
│   └── ...
```

**Objectifs campagnes** :
- Acquisition cold : Conversions (pas Awareness)
- Retargeting : Conversions
- Lead magnet promo : Lead generation (form Meta direct)

**Budget allocation** :
- 60% acquisition
- 25% retargeting
- 15% lead generation

## Targeting Meta Ads detail

### Cold audience large (Phase 1)
- Geo : France metropole + DOM-TOM
- Age : 35-55
- Genre : tous (mais 65% F en general)
- Interets : "Cadeaux", "Famille", "Photos famille", "Heritage"
- Comportements : "Acheteurs cadeaux engages"

### Cold audience niche
- Idem + interets : "Genealogie", "Maison de retraite", "EHPAD", "Senior", "Heritage"
- Plus eleve en LTV mais audience plus petite

### Lookalike 1% purchasers
- Source : 100+ achats client
- Geo : FR
- Age : 35-55 (refine)

### Retargeting visitors
- Visiteurs site 30j sans achat
- Exclure : purchasers, current trial

### Cart abandoners
- Initiated checkout sans purchase
- Window : 7 jours

## Budget mensuel par phase

### Phase 1 — Validation (juin 2026)
- Meta Ads : 500€/mois
- Total : 500€

### Phase 2 — Lancement public (juillet-aout 2026)
- Meta Ads : 1500-2000€/mois
- Google Ads Search : 500€/mois
- Total : 2000-2500€/mois

### Phase 3 — Scale (sept 2026+)
- Meta Ads : 3000-7000€/mois
- Google Ads : 1500€/mois
- TikTok Ads test : 300€/mois
- Total : 5000-9000€/mois

### Saisonnier
- Fete des meres 2027 (mai) : x2-3 budget habituel pour 6 sem avant
- Noel 2026 : x2 budget pour decembre
- Hors saison : maintien Phase 3 normal

## Tracking obligatoire

### Avant de lancer la moindre ad

1. **Meta Pixel** install correct
2. **Conversions API** (CAPI) cote serveur (Next.js API route)
3. **GA4** + Google Tag
4. **PostHog** (deja en place chez MM Phase 49)
5. **Events trackes** :
   - PageView
   - ViewContent (page produit)
   - InitiateCheckout
   - AddPaymentInfo
   - Purchase (avec montant)
   - Lead (lead magnet capture)
6. **UTM parameters** systematiques sur tous les liens ads

## KPIs a suivre

Quotidien :
- Spend
- Impressions
- Reach
- Frequency (alerter si > 4 = saturation)

Hebdo :
- CPC, CPM
- CTR
- CVR (conversion rate)
- CPA
- ROAS

Mensuel :
- LTV / CAC ratio
- Payback period
- Audience saturation
- Creative fatigue

## Anti-patterns

- ❌ Lancer ads sans pixel + tracking complet (= jeter argent)
- ❌ Trop de campagnes / ad sets (dilution budget, pas d'apprentissage Meta)
- ❌ Changer creatives tous les jours (Meta n'a pas le temps d'apprendre, 7j minimum)
- ❌ Toucher budget pendant phase d'apprentissage (50 conversions minimum avant ajustement)
- ❌ Audiences trop petites (< 500k = Meta a du mal)
- ❌ Pas de retargeting (passer a cote des warm leads)
- ❌ Mesurer juste CPA sans LTV (CAC eleve OK si LTV >> CAC)

## Skills lies

- `marketing/ads-creas` : creatives texte par variantes
- `generate-image` : visuels (`--mode marketing-ad-meta`)
- `marketing/cro-page` : optimisation landing post-click
- `marketing/email-sequences` : nurturing leads ads
