---
name: marketing-architecture-site
description: Conception de la hierarchie URL, navigation, maillage interne pour un site B2C FR. A lancer AVANT de finaliser le copy/le contenu.
risk: low
source: adapted-from-coreyhaines31/marketingskills/site-architecture
date_added: 2026-05-10
---

# Marketing Architecture Site

## Ton role

Definir la structure URL, la navigation principale, le maillage interne, AVANT de produire le copy. **Faire le copy avant l'architecture = refaire deux fois le SEO et perdre du temps.**

## Avant de commencer

1. Lire `.planning/marketing/CONTEXT.md`
2. Demander :
   - "Tu refais l'architecture complete ou tu ajoutes une section ?"
   - "Quels parcours utilisateur sont prioritaires ?"

## Principes

### 1. Profondeur max 3 clics
Toute page importante a max 3 clics depuis homepage.
- Niveau 0 : homepage
- Niveau 1 : sections principales (hub pages)
- Niveau 2 : pages produit / categorie / cluster
- Niveau 3 : articles / details

### 2. Hierarchie logique
URL reflete la hierarchie. Pas de `/page-3284` mais `/cadeaux/fete-des-meres/biographie-personnalisee`.

### 3. Pages-pilier (pillar pages)
Chaque grand sujet a UNE page pilier longue (3000-5000 mots) qui linke vers ses satellites. Tous les satellites linkent vers la pilier (cluster topic).

### 4. Internal linking contextuel
Pas seulement footer/nav. Liens dans le contenu, anchors descriptifs, ratio raisonnable (1 lien par 200 mots).

### 5. URL canoniques stables
Une fois publiee, une URL ne bouge plus. Si elle bouge → 301.

## Architecture proposee My Mozaica

### Niveau 0 : Homepage
`/`

### Niveau 1 : Sections principales (max 5 dans nav principale)

```
/comment-ca-marche      Pour les hesitants, demystifier
/cadeau                 Pour les acheteurs cadeau (= 80% des ICP)
/livre                  Page produit (ce qu'on recoit physiquement)
/avis                   Temoignages clients structures
/blog                   Hub editorial (vide au lancement, croit ensuite)
```

### Niveau 1bis : Footer (pas dans nav principale, mais accessibles)

```
/about                  Notre histoire / mission / equipe
/contact                Formulaire contact + email
/faq                    FAQ ultra-complete
/cgv                    Conditions generales de vente
/mentions-legales       Mentions obligatoires FR
/politique-confidentialite  RGPD / privacy policy
/cookies                Politique cookies
```

### Niveau 2 : Sous-sections cadeau (clusters thematiques)

```
/cadeau/fete-des-meres
/cadeau/fete-des-peres
/cadeau/anniversaire-70-ans
/cadeau/anniversaire-80-ans
/cadeau/depart-retraite
/cadeau/noel
/cadeau/fete-des-grand-parents
```

### Niveau 2 : Pages-pilier comparison (SEO concurrentiel + LLM citations)

```
/comparaison/my-mozaica-vs-storyworth
/comparaison/my-mozaica-vs-biographe-humain
/comparaison/my-mozaica-vs-livre-photo
/comparaison/my-mozaica-vs-raconteurdevie
```

### Niveau 2 : Pages-pilier guides

```
/guides/comment-interviewer-ses-parents
/guides/100-questions-a-poser-a-vos-parents
/guides/comment-offrir-une-biographie
/guides/preserver-souvenirs-grand-parents
/guides/combien-coute-livre-memoires
```

### Niveau 3 : Articles blog (satellites des piliers)

```
/blog/<slug-article>
```

Exemples articles :
- `/blog/poser-questions-difficiles-parents-sans-froisser`
- `/blog/interviewer-grand-mere-maladie-alzheimer`
- `/blog/heritage-immateriel-pourquoi-important`

### Niveau 2 : App produit (apres login)

```
/dashboard
/dashboard/livre
/dashboard/interview
/dashboard/parametres
/start                  Onboarding entree
/start/gift             Flow cadeau
```

### Pages techniques (noindex)

```
/admin
/dev/*                  Maquettes, design system
/api/*                  Endpoints (deja noindex par defaut)
```

## Navigation principale (mobile-first)

### Header
- Logo (gauche)
- Menu burger (droite, mobile) ou nav inline (desktop) :
  - Comment ca marche
  - Cadeau
  - Livre
  - Avis
  - Blog (si contenu publie)
- CTA principal : "Offrir un livre" (different couleur)

### Footer
3 colonnes :
1. **Decouvrir** : Comment ca marche, Livre, Cadeau, Avis
2. **Aide** : FAQ, Contact, Blog
3. **Legal** : CGV, Mentions, RGPD, Cookies

## Maillage interne strategique

### Depuis homepage
- Vers `/cadeau` (CTA primary)
- Vers `/comment-ca-marche` (CTA secondary)
- Vers `/avis` (preuve sociale en bas de page)
- Vers 3 articles blog phares (en bas)

### Depuis pages cadeau
- Vers la page produit `/livre`
- Vers FAQ
- Vers `/avis`
- Vers `/comparaison/*` quand pertinent

### Depuis articles blog
- 1 lien vers page-pilier de leur cluster
- 2-3 liens vers articles du meme cluster
- 1 CTA produit en milieu d'article (pas en fin uniquement)

### Depuis pages-pilier
- Vers tous les satellites du cluster
- Vers landing produit
- Vers FAQ pour objections

## Trailing slash

Decision a faire UNE fois pour tout le site :
- Avec slash : `/cadeau/`
- Sans slash : `/cadeau`

**Recommandation** : sans slash (Next.js par defaut), cohesion totale, redirection 301 si quelqu'un tape avec slash.

## Convention URLs

- **kebab-case** : `/fete-des-meres` (pas `fete_des_meres` ni `feteDesMeres`)
- **français** : `/cadeau` pas `/gift`
- **stable** : pas de date dans l'URL (`/blog/2026/05/...`) sauf vraie raison
- **descriptif** : `/100-questions-a-poser-a-ses-parents` (pas `/article-3284`)
- **court mais explicite** : ideal 30-60 chars

## Sitemap.xml

Generer dynamiquement via `app/sitemap.ts` Next.js 15. Inclure :
- Toutes pages publiques
- Articles blog publies
- Pages cadeau / comparaison / guides

Exclure :
- Pages dashboard / login (non-public)
- Pages admin
- Pages legal `noindex` (mais accessibles via footer)
- Pages dev/maquettes

## Anti-patterns

- ❌ Mega-menus avec 30 liens (paralysie + dilution authority)
- ❌ Profondeur > 4 niveaux (pages orphelines en pratique)
- ❌ URLs en anglais sur site FR (`/gift-mom`)
- ❌ Changements URL sans 301 (perte SEO accumule)
- ❌ Faire le copy avant l'archi (= retravailler les liens 3 fois)

## Output type

Document `.planning/marketing/architecture-site.md` :
- Sitemap visuel (mermaid ou liste indented)
- Convention URLs validee
- Plan navigation principale
- Tableau pages a creer / a modifier / a supprimer

## Skills lies

- `marketing/seo-technique` : verifier crawlability, sitemap
- `marketing/strategie-contenu` : alimente blog hierarchie
- `marketing/copy` : ecrit le contenu APRES avoir verrouille structure
- `marketing/schema` : breadcrumbs + structured data sur chaque niveau
