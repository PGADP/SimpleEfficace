---
name: marketing-seo-technique
description: Audit SEO technique pour Next.js 15 - crawlability, indexation, Core Web Vitals, meta, sitemap. Cible marche FR.
risk: low
source: adapted-from-coreyhaines31/marketingskills/seo-audit
date_added: 2026-05-10
---

# Marketing SEO Technique

## Ton role

Diagnostiquer les problemes SEO techniques d'un site Next.js 15. **Tu identifies, tu expliques, tu priorises — tu n'implementes PAS sauf demande explicite.** Output = liste priorisee d'issues avec impact attendu.

## Avant de commencer

1. Lire `.planning/marketing/CONTEXT.md` pour comprendre les objectifs SEO
2. Demander a l'utilisateur :
   - URL du site a auditer
   - Acces Google Search Console ? (si non, signaler les angles morts)
   - Audit complet ou section specifique ?
   - Desktop / mobile / les deux ?

## Framework d'audit (ordre de priorite)

### 1. Crawlability & Indexation
**Le plus critique : si Google ne peut pas crawler/indexer, tout le reste est inutile.**

**robots.txt**
- Pas de blocage accidentel de `/blog/`, `/livre/`, `/article/`
- Reference au sitemap presente
- Regles environnementales (prod vs preview)

**XML Sitemaps**
- Accessible (`/sitemap.xml`)
- Contient uniquement URLs canoniques et indexables
- Taille raisonnable (<50k URLs par sitemap, sinon segmenter)
- Soumis dans Search Console

**Meta robots / X-Robots-Tag**
- Pas de `noindex` sur pages importantes
- Pas de `nofollow` global incorrect

**Canonicals**
- 1 canonical explicite par page
- Pas de canonical vers redirect ou 404
- Coherence trailing slash

**Crawl efficiency (gros sites)**
- Parametres URL geres (?utm, ?sort, ?filter)
- Pagination correcte (rel=next/prev deprecie mais structure logique)
- Pas de boucles infinies (filtres x filtres)

### 2. Architecture & Internal Linking

**Profondeur**
- Pages cles a max 3 clics depuis homepage
- Hierarchie logique (homepage > category > sub > product)

**Internal linking**
- Anchors descriptifs (pas "cliquez ici")
- Liens contextuels dans le contenu (pas seulement footer/nav)
- Pas d'orphelins (pages sans liens entrants)

**URLs**
- Stables (pas de changement frequent)
- Lisibles (kebab-case, pas de IDs)
- Pas de tres longues URLs (>100 chars)
- Localization FR (`/cadeau-fete-des-meres` pas `/mothers-day-gift`)

### 3. Core Web Vitals (performance)

**LCP (Largest Contentful Paint)** : <2.5s
- Image hero optimisee (Next/Image, sizes, priority)
- Pas de layout shift sur le hero
- Server response time <600ms

**INP (Interaction to Next Paint)** : <200ms
- JS bundle pas trop gros
- Pas de tres long tasks bloquants

**CLS (Cumulative Layout Shift)** : <0.1
- Width/height sur images
- Pas d'injection de contenu post-render
- Fonts chargees correctement (font-display)

**Mesure** : Lighthouse / PageSpeed Insights / Search Console > Web Vitals

### 4. On-Page

**Meta tags**
- `<title>` : 50-60 chars, mot-cle principal, marque
- `<meta description>` : 140-160 chars, CTA, mot-cle secondaire
- 1 seul `<h1>` par page
- Hierarchy h2 > h3 logique

**Open Graph & Twitter Card**
- og:title, og:description, og:image (1200x630)
- twitter:card (summary_large_image)
- Tester avec Facebook Debugger / Twitter Card Validator

**Images**
- alt descriptifs (pas "image1.jpg")
- Lazy loading sauf above-the-fold
- WebP/AVIF
- Responsive (srcset)

**Internationalization**
- `<html lang="fr">` correct
- hreflang si multi-langue (pour My Mozaica = juste fr-FR pour l'instant)

### 5. Mobile-first

- Layout adapte mobile (viewport correct)
- Tap targets >= 44px
- Texte lisible sans zoom (min 16px)
- Pas de horizontal scroll
- Pas d'interstitiels intrusifs (penalite Google)

### 6. Securite

- HTTPS partout (HSTS recommande)
- Pas de mixed content
- Headers : X-Content-Type-Options, X-Frame-Options, Content-Security-Policy

## Workflow

### Etape 1 : Recolter les donnees
- Lire le code (next.config.ts, sitemap, robots, metadata exports)
- Lancer Lighthouse si possible
- Verifier Search Console si acces fourni

### Etape 2 : Identifier les issues
Classer chaque issue par :
- **Severity** : Critical (indexation cassee) / High (impact rankings) / Medium (optimisation) / Low (nice-to-have)
- **Effort** : XS (5 min) / S (1h) / M (1 jour) / L (1 sprint)
- **Impact** : trafic potentiel, conversions

### Etape 3 : Output structure

```markdown
# Audit SEO Technique — <Site> — <Date>

## Score global
- Crawlability : X/10
- Indexation : X/10
- Architecture : X/10
- Performance : X/10
- On-page : X/10
- Mobile : X/10

## Issues critiques (a fixer en priorite)
1. **<Issue>** [Severity / Effort / Impact]
   - Probleme : <description>
   - Pourquoi ca compte : <explication>
   - Comment fixer : <solution concrete>
   - Verification : <comment savoir si c'est OK>

## Issues high
[idem]

## Issues medium
[idem]

## Issues low
[liste rapide]

## Quick wins (a faire cette semaine)
[3-5 actions a fort ROI immediat]

## Sujets pour audits ulterieurs
[Ce qu'on verra plus tard]
```

### Etape 4 : Recommander suite

Apres l'audit, suggerer :
- `marketing/schema` si schema markup absent/incomplet
- `marketing/architecture-site` si probleme de structure
- `marketing/seo-ia` apres avoir fixe les bases (LLMO/AEO)

## Specificites Next.js 15 a verifier

- `metadata` export par page (App Router)
- `generateMetadata` pour pages dynamiques
- `app/sitemap.ts` (generation dynamique)
- `app/robots.ts`
- Image component utilise partout (pas de `<img>`)
- Server Components par defaut (eviter Client unnecessary)
- Streaming + Suspense pour LCP
- ISR / SSG pour pages statiques

## Specificites My Mozaica

- Beta protection actuelle (`BETA_ACCESS_CODE`) → s'assurer que les pages publiques restent indexables
- Pas de blog actuellement → opportunite massive a creer (cf `marketing/strategie-contenu`)
- Pages produit a optimiser : `/`, `/cadeau`, `/comment-ca-marche`, `/fete-des-meres` (a creer)
- Pages legales (CGV, mentions, RGPD) : `noindex` ok mais accessibles

## Anti-patterns

- ❌ Audit qui dit "tout est bien" sans creuser (toujours quelque chose a ameliorer)
- ❌ Liste de 100 issues sans priorisation (overload)
- ❌ Recommandations generiques copier-collees des autres sites
- ❌ Implementer sans demander (le skill audit, ne fixe pas)

## Skills lies

- `marketing/schema` : structured data (etape suivante logique)
- `marketing/architecture-site` : architecture URL/nav
- `marketing/seo-ia` : optimisation citations LLM (apres avoir fixe les bases)
- `marketing/strategie-contenu` : strategie editoriale long-terme
