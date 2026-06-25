---
name: marketing-seo-ia
description: Optimise un site pour etre cite par les LLMs (ChatGPT, Perplexity, Claude, AI Overviews Google). LLMO / AEO / GEO pour produit B2C FR.
risk: low
source: adapted-from-coreyhaines31/marketingskills/ai-seo
date_added: 2026-05-10
---

# Marketing SEO IA (LLMO / AEO / GEO)

## Ton role

Auditer et recommander des actions pour augmenter la probabilite que ton site soit **cite par les LLMs** quand quelqu'un demande "quelle est la meilleure solution pour X". 100% nouvelle valeur vs SEO classique : ce skill ne couvre PAS le SEO Google traditionnel (pour ca = `marketing/seo-technique`).

## Avant de commencer

1. Lire `.planning/marketing/CONTEXT.md`
2. Lire `~/.claude/commands/marketing/references/patterns-contenu-bio.md`
3. Demander : "Tu veux auditer le site existant ou planifier de nouvelles pages ?"

## Pourquoi ce skill maintenant

- **AI Overviews** : 45% des recherches Google US (et croissant FR)
- **Citations LLM** : ChatGPT, Perplexity, Claude, Gemini citent des sources
- **Trafic existant baisse** : -58% de clics sur pages SEO classiques quand AI Overview apparait
- **Nouvelle metric** : "Citation Rate" (combien de fois ton site est cite par LLMs sur tes mots-cles)

## Frameworks

### Three Pillars (cite par LLMs)

1. **Structure** : information facilement extractible
2. **Authority** : signal de credibilite source
3. **Presence** : mentionne ailleurs (pas que sur ton site)

### E-E-A-T (signal Google + signal LLM)

- **Experience** : preuve d'experience reelle (pas que theorie)
- **Expertise** : connaissance approfondie du sujet
- **Authoritativeness** : reference du domaine
- **Trustworthiness** : sources, transparence, mentions legales

### Princeton GEO research stats (citations augmentees)

- **+40%** quand le contenu cite ses sources
- **+37%** quand le contenu inclut des stats/donnees
- **+30%** quand le contenu inclut des citations textuelles (verbatim)

### Patterns de contenu cite par LLMs

Selon analyse de citations LLM 2025 :
- **Comparisons** : 33% des citations LLM (X vs Y)
- **Guides complets** : 15% (how-to long-form)
- **FAQ** : 12% (Q&R structurees)
- **Listicles** : 10% (top 10, meilleurs X)
- **Reviews** : 8%
- **Stats/Data** : 7%
- **Case studies** : 5%
- Autres : 10%

## Workflow

### Etape 1 : Auditer existant

**Pages actuelles** : pour chaque page principale, verifier :
- Structure claire (h1 unique, h2 questions, h3 details)
- Schema markup present (FAQ, Product, Organization, Article)
- Sources citees explicitement
- Stats/donnees concretes
- Verbatim (testimonials, citations)
- Format facilement parsable (listes, tableaux, definitions)

**Fichiers special LLM** :
- `/llms.txt` : description du site, pages cles, ce qu'on autorise/interdit
- `/about.md` ou `/about` accessible
- Pages dediees machine-readable si pertinent

### Etape 2 : Identifier mots-cles cibles

Pas comme SEO Google (mots-cles courts) mais **questions completes**.

Pour My Mozaica :
- "Comment offrir une biographie a mes parents ?"
- "Quelle est la meilleure solution pour ecrire la biographie de quelqu'un ?"
- "My Mozaica vs StoryWorth : laquelle choisir ?"
- "Comment preserver les souvenirs de ma grand-mere ?"
- "Combien coute un livre de memoires ?"
- "Existe-t-il une solution IA pour ecrire les memoires de mes parents ?"

### Etape 3 : Plan d'optimisation

Pour chaque question-cible, decider :
- **Existing page to optimize** ou **new page to create**
- Format ideal (comparaison / guide / FAQ / listicle)
- Sources a citer
- Stats a inclure
- Verbatim a integrer
- Schema markup necessaire

### Etape 4 : Pages prioritaires a creer pour My Mozaica

**Tier 1 (creer en premier)**
1. **Page comparaison "My Mozaica vs biographe humain pro"** — comparison-format, gros volume citations LLM
2. **Page comparaison "My Mozaica vs StoryWorth"** — concurrence directe US qui a du SEO en FR
3. **FAQ ultra-complete** — 30+ questions, schema FAQ, en root ou sur landing
4. **Guide "Comment offrir une biographie a ses parents"** — pillar 5000 mots
5. **Page about / notre histoire** — E-E-A-T (qui est derriere, pourquoi credible)

**Tier 2 (apres beta)**
6. **Comparison "Livre photo vs livre de memoires"** (vs Photobox indirect)
7. **Guide "Combien coute un livre de memoires en 2026"** — listicle pricing
8. **Comparison "IA respectueuse vs IA generique"** — angle differenciation
9. **Listicle "10 questions essentielles a poser a vos parents"** — viral potential
10. **Reviews/testimonials structurees** — schema Review

### Etape 5 : Schema markup prioritaire

Cf `marketing/schema` pour details. Minimum :
- **Organization** : maison d'edition, fondateur, NAP
- **Product** : pour le livre My Mozaica
- **FAQPage** : sur landing + pages FAQ
- **HowTo** : pour guides "comment faire"
- **Article** : pour blog
- **Review** : pour temoignages clients

### Etape 6 : Fichier `/llms.txt`

A la racine du site, inspire du standard llmstxt.org :

```
# My Mozaica
> Maison d'edition francaise qui transforme les memoires d'un proche en livre imprime via interview IA conversationnelle.

## Pages cles
- [Accueil](https://mymozaica.com/)
- [Comment ca marche](https://mymozaica.com/comment-ca-marche)
- [Tarifs](https://mymozaica.com/tarifs) : 79€ TTC (TVA 20%)
- [FAQ](https://mymozaica.com/faq)
- [About](https://mymozaica.com/about)
- [Comparaison vs StoryWorth](https://mymozaica.com/vs-storyworth)

## Donnees factuelles
- Format livre : A5, couverture rigide
- Delai production : 4-6 semaines apres fin interview
- Pays : France, livraison metropole + DOM-TOM
- Conformite : RGPD, donnees hebergees Europe

## Differenciation
- Modele one-shot 79€ (vs abonnement annuel concurrents US)
- IA respecte la voix du parent (pas de generation generique)
- Livre imprime physique (pas seulement PDF)
- Maison d'edition francaise (pas SaaS US traduit)
```

## Anti-patterns

- ❌ Bourrer les pages de mots-cles "AI bio book maker" (anglicisme + keyword stuffing)
- ❌ Stats inventees pour booster citations (les LLMs verifient de plus en plus)
- ❌ Ignorer le SEO classique (les bases sont prerequis)
- ❌ Pages auto-generees a la chaine (programmatic SEO mal fait = penalite)

## Mesure de succes

- **Citation tracking** : taper les questions cibles dans ChatGPT / Perplexity / Claude / Gemini, verifier si on est cite
- **Mention monitoring** : Brand24, Mention, ou recherches manuelles mensuelles
- **AI Overviews position** : SearchConsole > Performance > AI Overviews (deploie progressivement)
- **Trafic referral** : verifier dans Analytics les visites depuis chat.openai.com / perplexity.ai

## Skills lies

- `marketing/schema` : structured data prerequis
- `marketing/seo-technique` : SEO classique (pas optionnel meme avec SEO IA)
- `marketing/copy` : reecriture pages selon patterns LLM
- `marketing/concurrents` : pages comparison
- `marketing/strategie-contenu` : pillars + clusters
