---
name: marketing-lead-magnets
description: Conception de lead magnets (PDF, ebooks, checklists) pour capturer emails. Idees concretes My Mozaica + plan de production.
risk: low
source: adapted-from-coreyhaines31/marketingskills/lead-magnets
date_added: 2026-05-10
---

# Marketing Lead Magnets

## Ton role

Concevoir un lead magnet pertinent pour My Mozaica (PDF a telecharger contre email) qui apporte une vraie valeur a la cible et oriente naturellement vers le produit. Output = brief complet : sujet, structure, design indicatif, plan de promotion.

## Avant de commencer

1. Lire `.planning/marketing/CONTEXT.md`
2. Lire `~/.claude/commands/marketing/references/patterns-contenu-bio.md`
3. Demander :
   - "Tu veux quoi ? (premier lead magnet flagship / variante saisonniere / niche specifique)"
   - "Audience cible (acheteur cadeau 35-55 / utilisateur final 60-85) ?"
   - "Format prefere (PDF / video / email course / web tool) ?"

## Critere d'un bon lead magnet

1. **Specifique** : pas "Guide marketing" mais "100 questions a poser a vos parents avant qu'il soit trop tard"
2. **Actionable** : la personne peut l'utiliser dans les 24h
3. **Aligne au produit** : la personne qui le consomme est un futur client probable
4. **Rapide a consommer** : 5-15 min max
5. **Beau** : PDF qui reflete la marque, pas un Word genereux

## Lead magnets recommandes My Mozaica

### Tier 1 — Flagship (a creer en premier)

#### Magnet #1 : "100 questions a poser a vos parents avant qu'il soit trop tard"

**Format** : PDF 30 pages
**Promesse** : 100 questions classees par theme (enfance, jeunesse, amour, travail, regrets, transmission), avec conseils d'usage
**Pour qui** : tous les ICP, tres large
**Pourquoi ca marche** :
- Promesse specifique et chiffree (100)
- Urgence emotionnelle ("avant qu'il soit trop tard")
- Action immediate (lire, choisir 5, demarrer)
- Aligne 100% au produit (My Mozaica utilise des questions)

**Structure** :
- Page 1 : couverture + sous-titre
- Page 2 : "Comment utiliser ce guide" (intro 1 page)
- Page 3 : "Les regles pour bien interviewer" (5 conseils essentiels)
- Pages 4-25 : 100 questions reparties en 10 themes, 10 questions par theme
  - Enfance et famille d'origine
  - Adolescence et jeunesse
  - Amour et relations
  - Travail et vocations
  - Voyages et lieux
  - Joies et fierte
  - Epreuves et resilience
  - Convictions et valeurs
  - Regrets et lecons
  - Transmission et heritage
- Pages 26-28 : "Et apres ? Comment garder une trace de leurs reponses" (intro a My Mozaica, sans pression)
- Page 29 : Code reduction beneficiare uniquement (-10€ sur My Mozaica)
- Page 30 : Liens utiles + contact

**Design** : palette MM (creme + ocre + encre), typo Cormorant Garamond, illustrations sobres (pas de stock photo)

#### Magnet #2 : "5 emails pour interviewer vos parents en 1 semaine"

**Format** : Email course (5 emails sur 7 jours)
**Promesse** : Une methode etape-par-etape pour structurer une interview avec ses parents
**Pour qui** : ICP acheteur 35-55 ans
**Avantage email vs PDF** : permission email durable, sequence de nurturing, taux ouverture eleve

**Structure des 5 emails** :
- Jour 1 : "Pourquoi maintenant ? Le piege de l'attente" (hook emotionnel)
- Jour 3 : "Demarrer l'interview : comment briser la pudeur" (5 techniques)
- Jour 5 : "Les 20 questions qui revelent le plus" (subset du PDF complet)
- Jour 7 : "Comment garder une trace : 3 options + recommandation" (intro MM)
- Jour 10 : "Le code de reduction qui expire" (CTA conversion)

### Tier 2 — Variantes saisonnieres

#### Magnet #3 : "Le guide cadeau fete des meres 2026" (avril-mai uniquement)

**Format** : PDF 15 pages, design cadeau
**Promesse** : 10 idees cadeau classees par budget + tendance + originalite
**Cliffhanger** : My Mozaica = idee #1 ou #2, presente comme un choix (pas un argumentaire pousse)

#### Magnet #4 : "Lettre a mes parents : 7 modeles a personnaliser"

**Format** : PDF 20 pages
**Promesse** : Modeles de lettres pour exprimer ce qu'on n'arrive pas a dire (avant/apres une interview, ou en complement)

### Tier 3 — Specifiques niches

#### Magnet #5 : "Interviewer un parent atteint d'Alzheimer : guide adapte"

**Format** : PDF 12 pages
**Promesse** : Adaptation des techniques d'interview pour une personne a memoire reduite
**Pour qui** : niche delicate mais haute intention (aidants familiaux, audience tres ciblee)

#### Magnet #6 : "Conserver la voix : guide juridique RGPD pour enregistrer ses parents"

**Format** : PDF 10 pages
**Promesse** : Aspects legaux et ethiques d'enregistrer un proche en France
**Pour qui** : public sensible aux questions juridiques

## Workflow de production

### Etape 1 : Choisir le magnet
Si premier magnet → flagship #1 (largest reach).
Si saisonnier → #3 ou #4 selon date.
Si niche → #5 ou #6.

### Etape 2 : Brief detaille
Format livraison :

```
# Lead Magnet : <nom>

**Format** : PDF / Email course / Web tool
**Public cible** : <ICP>
**Promesse principale** : <1 phrase>
**Pourquoi ca convertit** : <hypothese>

## Plan de contenu
[outline complete page par page ou email par email]

## Brief design
- Palette : <hex codes>
- Typo : <font primaire / secondaire>
- Style illustrations : <style>
- Outil de production : <Canva / Figma / Word + Pandoc>

## Plan de promotion
- Pop-up landing : <wording>
- Footer landing : <CTA>
- Bio Instagram : <wording>
- Posts dedies : <2-3 idees>
- Ad Meta dediee : <budget hypothese>

## Plan de nurturing post-download
- Email 1 (D+0) : confirmation download + premier insight
- Email 2 (D+3) : <sujet>
- Email 3 (D+7) : <sujet>
- Email 4 (D+14) : <sujet>
- Email 5 (D+21) : <CTA produit>
```

### Etape 3 : Production
- Texte : ecrit avec `marketing/copy`
- Visuels : `/generate-image --mode marketing-lead-magnet`
- Layout : Canva ou Figma (template a creer une fois)
- Export : PDF haute qualite, optimise web (~2-5 Mo)

### Etape 4 : Implementation technique
- Page de capture (landing dediee `/pdf-questions-parents`) avec form email simple
- Tag dans email service (Mailchimp/ConvertKit/Resend)
- Sequence email automation
- Trigger evenement analytics (`lead_magnet_downloaded`)

### Etape 5 : Mesure
- Taux conversion landing (visit → email submit)
- Taux ouverture sequence emails
- Taux clic CTA produit dans sequence
- Conversion finale lead → client

## Anti-patterns

- ❌ Lead magnet "guide complet sur le marketing" (trop generique)
- ❌ Demander trop d'infos au form (juste email, pas prenom + telephone + entreprise)
- ❌ PDF mal designe (Word sortie ASCII)
- ❌ Pas de sequence apres download (le magnet seul ne convertit pas)
- ❌ CTA produit immediat (laisser respirer 2-3 emails)
- ❌ Bait & switch (promettre X, livrer Y)

## Skills lies

- `marketing/free-tool` : alternative web/interactive
- `marketing/email-sequences` : nurturing post-download
- `marketing/copy` : ecriture texte magnet
- `marketing/cro-page` : landing capture
- `generate-image` : visuels (`--mode marketing-lead-magnet`)
