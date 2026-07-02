---
name: marketing-cro-page
description: Audit conversion d'une page (landing, pricing, checkout, etc.) avec recommandations priorisees. Frameworks UX + psycho + analytics.
risk: low
source: adapted-from-coreyhaines31/marketingskills/page-cro
date_added: 2026-05-10
---

# Marketing CRO Page

## Ton role

Auditer une page existante du point de vue de la conversion (CRO = Conversion Rate Optimization). Identifier les frictions, les opportunites, recommander des changements priorises (impact x effort). Output = liste actionable d'A/B tests ou changements directs.

## Avant de commencer

1. Lire `.planning/marketing/CONTEXT.md`
2. Demander :
   - "Quelle page tu veux auditer (URL ou nom) ?"
   - "Tu as les analytics (taux conversion actuel, bounce, scroll heatmaps) ?"
   - "Audience principale qui visite cette page (cold traffic / repeat / paid / organique) ?"

## Framework d'audit (ordre)

### 1. Clarity (clarte du message)

**Premiere question : en 5 secondes, le visiteur comprend-il ?**
- Que vendez-vous ?
- A qui ?
- Pour quel benefit ?
- Que dois-je faire (CTA) ?

Test : montrer la page 5 secondes a quelqu'un, demander "qu'est-ce que c'est ?"

**Recommandations type** :
- Headline trop poetique → reformuler clarte
- UVP cachee dans 3eme paragraphe → remonter
- CTA "En savoir plus" alors que produit est en vente → "Acheter"

### 2. Confidence (confiance / preuve)

**Question : pourquoi croire ?**
- Y a-t-il des temoignages ?
- Y a-t-il des chiffres / stats ?
- Y a-t-il des logos / mentions media ?
- Y a-t-il une garantie / facilites ?

**Recommandations type** :
- Pas de temoignage → en ajouter (verbatim VOC)
- Trust badges absents → ajouter (RGPD, paiement secure, made in France)
- Pas de FAQ pour objections → ajouter

### 3. Friction (frottements parcours)

**Question : qu'est-ce qui rend l'achat difficile ?**
- Form trop long ?
- Trop d'options ?
- Process pas clair ?
- Erreurs / bugs / lenteur ?
- Mobile non-optimal ?

**Recommandations type** :
- Reduire champs form
- Simplifier choix (Hicks Law)
- Optimiser perf (LCP < 2.5s)
- Tester mobile 320px

### 4. Motivation (envie d'acheter maintenant)

**Question : qu'est-ce qui pousse a agir ?**
- Y a-t-il une raison "maintenant" ?
- Y a-t-il aversion a la perte declenchee ?
- Y a-t-il preuve sociale visible ?

**Recommandations type** :
- Manque trigger temporel → ajouter "Avant fete des meres"
- Pas d'aversion perte → ajouter angle "avant qu'il soit trop tard"
- Compteur stock visible si pertinent

### 5. Psychology (biais actives)

Cf `marketing/psycho` pour le detail. Verifier que la page active :
- Sympathie (ton chaleureux)
- Preuve sociale (verbatim, chiffres)
- Aversion a la perte
- Reciprocite (lead magnet ?)
- Anchoring prix

### 6. Mobile-first

**Question : la page marche-t-elle sur mobile 320px ?**
- Texte lisible sans zoom (>= 16px)
- Tap targets >= 44px
- Pas de scroll horizontal
- CTA visible avant fold mobile
- Forms remplissables au pouce

## Workflow

### Etape 1 : Recolter les inputs
- URL ou contenu page
- Heuristiques rapides (5 sec test, etc.)
- Analytics si dispo : taux conversion, bounce, scroll depth

### Etape 2 : Auditer chaque dimension

Pour chaque dimension (Clarity / Confidence / Friction / Motivation / Psychology / Mobile), noter :
- Score 1-10
- Issues identifiees
- Recommandations

### Etape 3 : Prioriser les changements (ICE scoring)

Pour chaque recommandation :
- **Impact** : 1-10 (effet attendu sur conversion)
- **Confidence** : 1-10 (probabilite que ca marche)
- **Effort** : 1-10 (10 = trivial, 1 = enorme)
- **ICE score** = Impact x Confidence x Effort / 1000

Trier par ICE descendant.

### Etape 4 : Recommander 3-5 actions priorit

Format livraison :

```
# Audit CRO — <URL/Page>

## Score global
- Clarity : X/10
- Confidence : X/10
- Friction : X/10
- Motivation : X/10
- Psychology : X/10
- Mobile : X/10

## Issues identifiees (ordonnees par ICE score)

### #1 — <Issue> (ICE: 240)
- **Probleme** : <description>
- **Impact attendu** : <effet>
- **Effort** : <complexite>
- **Recommandation** : <action concrete>
- **A/B test** : <hypothese testable>

### #2 — <Issue> (ICE: 180)
[idem]

[etc...]

## Quick wins (ICE > 200)
[liste actions a faire cette semaine]

## Tests A/B recommandes
[liste hypotheses testables avec scope]

## Sujets pour audits ulterieurs
[Ce qui releve du gros chantier, pas urgent]
```

### Etape 5 : Suivre l'impact

Pour chaque changement implemente, mesurer :
- Avant : taux conversion baseline
- Apres : taux conversion sur 7-14 jours minimum
- Significativite statistique (besoin volume)

## Issues specifiques landing My Mozaica (audit type)

### Hero
- [ ] Headline assez clair / specifique ?
- [ ] Sub-headline precise mecanique ?
- [ ] Photo emotionnelle (pas stock generique) ?
- [ ] CTA visible mobile sans scroll ?
- [ ] Trust signal sub-CTA (ex: "Deja 50 familles") ?

### Section "Comment ca marche"
- [ ] 3-5 etapes (pas 8)
- [ ] Visuel par etape ?
- [ ] Duree par etape annoncee ?

### Section "Temoignages"
- [ ] Verbatim VOC reels (pas inventes) ?
- [ ] Photo + prenom + age + lien parental client ?
- [ ] Au moins 3-5 ?

### Section "Pricing"
- [ ] Prix transparent ?
- [ ] TVA / livraison incluse claire ?
- [ ] Pas d'abonnement cache ?
- [ ] Comparison vs alternatives (4000-8000€ biographe) ?

### Section "FAQ"
- [ ] Au moins 8 questions ?
- [ ] Couvre les 3-5 objections principales ?
- [ ] Schema FAQ markup ?

### Section "Garantie / SAV"
- [ ] Garantie satisfaction visible ?
- [ ] Delai retraction visible ?
- [ ] Made in France visible ?
- [ ] Contact direct accessible ?

### Footer
- [ ] CGV / Mentions / RGPD / Cookies presents ?
- [ ] Reseaux sociaux ?
- [ ] Newsletter ?

## Anti-patterns d'audit

- ❌ Liste de 50 issues sans priorisation (paralysie)
- ❌ Recommandations "ajoutez du contenu" non actionable
- ❌ Pas de chiffrement effort vs impact (=> tout pareil = chaos prio)
- ❌ Auditer sans connaitre l'objectif page (commerce vs lead gen vs awareness)
- ❌ Generiques "ameliorer le design" sans specifique

## Skills lies

- `marketing/copy` : implementer changements copy
- `marketing/psycho` : verifier biais actives
- `marketing/seo-technique` : verifier perf / SEO en parallele
- `marketing/strategie-contenu` : verifier coherence avec hub
