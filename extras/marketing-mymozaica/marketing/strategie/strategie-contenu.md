---
name: marketing-strategie-contenu
description: Plan editorial structure - topic clusters, piliers de contenu, calendrier multi-canal. Adapte B2C FR cible 35-65 ans.
risk: low
source: adapted-from-coreyhaines31/marketingskills/content-strategy
date_added: 2026-05-10
---

# Marketing Strategie Contenu

## Ton role

Construire un plan editorial multi-canal coherent : topic clusters SEO, piliers de contenu social, calendrier mensuel. Eviter le syndrome "1 article par mois sans fil rouge".

## Avant de commencer

1. Lire `.planning/marketing/CONTEXT.md`
2. Lire `~/.claude/commands/marketing/references/calendrier-editorial-2026.md`
3. Lire `~/.claude/commands/marketing/references/patterns-contenu-bio.md`
4. Demander : "Tu veux le plan pour quel horizon ? (1 mois, 1 trimestre, 6 mois)"

## Workflow

### Etape 1 : Definir 3-5 piliers de contenu

Un pilier = un grand theme qui couvre plusieurs sous-sujets. Pour My Mozaica, exemples :

**Pilier 1 : Transmettre avant qu'il soit trop tard** (30%)
- Sous-themes : urgence emotionnelle, demarche d'interview, deuil anticipe, regret
- Formats : temoignages, conseils pratiques, citations

**Pilier 2 : L'art d'interviewer ses parents** (25%)
- Sous-themes : techniques de questions, briser le mur de la pudeur, ecoute active
- Formats : tutos, listes, exemples

**Pilier 3 : Les souvenirs qui meritent d'etre garde** (20%)
- Sous-themes : anecdotes, moments anodins qui comptent, photos retrouvees
- Formats : storytelling, carrousel, video

**Pilier 4 : Coulisses My Mozaica** (15%)
- Sous-themes : equipe, process, fabrication livre, IA respectueuse de la voix
- Formats : behind-the-scenes, fondateur

**Pilier 5 : Idees cadeaux moments cles** (10%)
- Sous-themes : fete des meres/peres, anniversaires ronds, Noel, retraite
- Formats : guides cadeaux, edition limitee

### Etape 2 : Topic clusters SEO

Pour chaque pilier, identifier 1 page-pilier (long format 3000-5000 mots) + 5-10 articles satellites (1500-2500 mots) qui linkent vers le pilier.

**Exemple cluster Pilier 2** :
- **Pilier (page hub)** : "Guide complet pour interviewer vos parents : 100 questions, methode, conseils" (5000 mots)
- **Satellites** :
  1. "Comment poser des questions difficiles a ses parents sans froisser"
  2. "Les 20 questions qui revelent le plus sur vos parents"
  3. "Que faire si mes parents ne veulent pas parler de leur enfance"
  4. "Interviewer un parent atteint d'Alzheimer : comment proceder"
  5. "Doit-on enregistrer ses parents ? Aspects juridiques et ethiques"
  6. "Interviewer ses grand-parents : differences avec ses parents"

### Etape 3 : Calendrier multi-canal

Un meme contenu peut etre repurpose en 5+ formats (atom-based content). Format calendrier mensuel :

```
Semaine 1 — Theme : <theme du mois>
- Lun : Article blog 2000 mots (SEO)
- Mar : Carrousel IG 8 slides (resume article)
- Mer : Reel IG 30s (1 insight clé du carrousel)
- Jeu : Newsletter (lien article + 1 reflexion bonus)
- Ven : Post Facebook (groupe famille)
- Sam : Story IG question (interaction audience)

Semaine 2 — Theme suivant
...
```

### Etape 4 : Calendrier saisonnier FR

Croiser avec les dates cles du marche FR :

**Q1 (jan-mars)**
- Janvier : Bonne resolution "interviewer mes parents cette annee"
- Fevrier : Saint Valentin (angle amour familial)
- Mars : Fete des grand-meres (1er dimanche)

**Q2 (avr-juin)**
- Mai : **Fete des meres FR (dernier dimanche, hors Pentecote)** = pic absolu
- Juin : Fete des peres (3e dimanche)

**Q3 (juil-sept)**
- Juillet-Aout : vacances (interview pendant vacances en famille)
- Septembre : rentree (anniversaires automne)
- Octobre : **Fete des grand-parents (1er dimanche)** + Toussaint approche

**Q4 (oct-dec)**
- Novembre : Toussaint (memoire des disparus, ton delicat)
- Decembre : Noel = pic 2 (cadeau intergenerationnel)

### Etape 5 : Repartition effort

Pour un solo founder non-marketeur :
- **30 min/jour** = 1 post court + interaction communautaire
- **2h/semaine** = 1 article blog ou 1 video Reel
- **1 jour/mois** = preparation calendrier mois suivant + analytics review

## Output type

Document `.planning/marketing/strategie-contenu/<periode>.md` :

```markdown
# Strategie Contenu — <Q3 2026 par exemple>

## Piliers et %
[liste]

## Topic clusters SEO actifs
[liste avec progression]

## Calendrier mensuel (3 mois)
[tableau detaille]

## Dates cles a ne pas rater
[liste avec preparation J-30/J-7]

## KPIs a suivre
- Trafic SEO (Search Console)
- Engagement social (saves IG > likes)
- Conversion lead magnet
- Email open rate

## Stop-doing
[Ce qu'on ne va PAS produire pour rester focus]
```

## Anti-patterns

- ❌ Plus de 5 piliers (perte focus, diluez la marque)
- ❌ Plan a 6 mois detaille (contexte change, refaire toutes les 4-6 semaines)
- ❌ Vouloir etre present partout (LinkedIn + IG + TikTok + YT + Twitter + ...) — choisir 2-3 max
- ❌ Imiter calendrier US (Thanksgiving, Black Friday) — vrai marche FR a son rythme

## Skills lies

- `marketing/social` : implementation tactique des posts
- `marketing/copy` : ecriture des articles
- `marketing/seo-ia` + `seo-technique` : optimisation pages-piliers
- `marketing/email-sequences` : newsletter mensuelle
- `marketing/idees` : alimente le brainstorm
