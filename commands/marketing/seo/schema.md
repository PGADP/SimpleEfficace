---
name: marketing-schema
description: Implementation JSON-LD / structured data pour rich results Google et citations LLM. Schemas adaptes maison d'edition / produit physique B2C FR.
risk: low
source: adapted-from-coreyhaines31/marketingskills/schema-markup
date_added: 2026-05-10
---

# Marketing Schema Markup

## Ton role

Recommander et generer le code JSON-LD / structured data adapte a chaque page. Output = blocs `<script type="application/ld+json">` prets a coller dans `metadata` Next.js 15.

## Avant de commencer

1. Lire `.planning/marketing/CONTEXT.md` (donnees produit, pricing, NAP entreprise)
2. Demander : "Quelle page tu veux schema ? (homepage / page produit / FAQ / article / about / temoignages)"

## Schemas prioritaires My Mozaica

### 1. Organization (a mettre sur layout root, partout)

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "My Mozaica",
  "alternateName": "Mozaica",
  "url": "https://mymozaica.com",
  "logo": "https://mymozaica.com/logo.png",
  "description": "Maison d'edition francaise qui transforme les memoires d'un proche en livre imprime via interview IA conversationnelle.",
  "foundingDate": "2025",
  "founder": {
    "@type": "Person",
    "name": "<Prenom Nom fondateur>"
  },
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "FR"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer service",
    "email": "contact@mymozaica.com",
    "availableLanguage": ["French"]
  },
  "sameAs": [
    "https://www.instagram.com/mymozaica",
    "https://www.facebook.com/mymozaica"
  ]
}
```

### 2. Product (page produit principale)

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Livre de memoires personnalise My Mozaica",
  "description": "Livre imprime sur-mesure de 200 pages relatant l'histoire d'un proche, genere via interview conversationnelle IA respectueuse de la voix originale.",
  "image": [
    "https://mymozaica.com/images/livre-1x1.jpg",
    "https://mymozaica.com/images/livre-4x3.jpg",
    "https://mymozaica.com/images/livre-16x9.jpg"
  ],
  "brand": {
    "@type": "Brand",
    "name": "My Mozaica"
  },
  "offers": {
    "@type": "Offer",
    "url": "https://mymozaica.com/commander",
    "priceCurrency": "EUR",
    "price": "79.00",
    "priceValidUntil": "2027-12-31",
    "itemCondition": "https://schema.org/NewCondition",
    "availability": "https://schema.org/InStock",
    "seller": {
      "@type": "Organization",
      "name": "My Mozaica"
    },
    "shippingDetails": {
      "@type": "OfferShippingDetails",
      "shippingDestination": {
        "@type": "DefinedRegion",
        "addressCountry": "FR"
      }
    }
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "47",
    "bestRating": "5",
    "worstRating": "1"
  }
}
```

> ⚠️ Ne mettre `aggregateRating` que si tu as **vraiment** des reviews (apres beta). Sinon retirer.

### 3. FAQPage (sur landing + page FAQ)

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Comment fonctionne My Mozaica ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "My Mozaica interviewe votre proche via une conversation IA chaleureuse, extrait les souvenirs structures, puis genere un livre imprime de 200 pages livre chez vous en 4-6 semaines."
      }
    },
    {
      "@type": "Question",
      "name": "Combien coute un livre My Mozaica ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Le livre My Mozaica coute 79€ TTC, livraison incluse en France metropolitaine. Aucun abonnement, paiement unique."
      }
    },
    {
      "@type": "Question",
      "name": "L'IA va-t-elle denaturer la voix de mon parent ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Non. My Mozaica respecte la voix originale en preservant le style, les expressions et le vocabulaire de votre proche. L'IA structure les souvenirs sans reformuler."
      }
    }
  ]
}
```

> Recommander 8-15 questions sur la page FAQ principale, 3-5 sur landing.

### 4. HowTo (pour guides "comment faire")

```json
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "Comment offrir une biographie a vos parents",
  "description": "Guide etape par etape pour offrir un livre de memoires personnalise.",
  "totalTime": "PT15M",
  "estimatedCost": {
    "@type": "MonetaryAmount",
    "currency": "EUR",
    "value": "79"
  },
  "step": [
    {
      "@type": "HowToStep",
      "position": 1,
      "name": "Choisir la formule cadeau",
      "text": "Allez sur mymozaica.com et selectionnez la formule cadeau."
    },
    {
      "@type": "HowToStep",
      "position": 2,
      "name": "Remplir les infos du beneficiaire",
      "text": "Entrez le prenom de votre parent, votre lien avec lui, un message personnel."
    }
  ]
}
```

### 5. Article (blog posts)

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Comment interviewer ses parents : 100 questions essentielles",
  "image": "https://mymozaica.com/blog/100-questions-cover.jpg",
  "datePublished": "2026-05-15",
  "dateModified": "2026-05-15",
  "author": {
    "@type": "Person",
    "name": "<Auteur>",
    "url": "https://mymozaica.com/about"
  },
  "publisher": {
    "@type": "Organization",
    "name": "My Mozaica",
    "logo": {
      "@type": "ImageObject",
      "url": "https://mymozaica.com/logo.png"
    }
  }
}
```

### 6. Review (temoignages clients)

```json
{
  "@context": "https://schema.org",
  "@type": "Review",
  "itemReviewed": {
    "@type": "Product",
    "name": "Livre de memoires My Mozaica"
  },
  "reviewRating": {
    "@type": "Rating",
    "ratingValue": "5",
    "bestRating": "5"
  },
  "name": "Le plus beau cadeau que j'ai jamais offert",
  "author": {
    "@type": "Person",
    "name": "Marie L."
  },
  "datePublished": "2026-06-15",
  "reviewBody": "J'ai offert My Mozaica a ma mere pour ses 70 ans. Voir son emotion en lisant le livre vaut tous les 79€ du monde."
}
```

### 7. BreadcrumbList (toutes pages internes)

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Accueil", "item": "https://mymozaica.com/" },
    { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://mymozaica.com/blog" },
    { "@type": "ListItem", "position": 3, "name": "<Article>" }
  ]
}
```

## Implementation Next.js 15

### Pattern recommande

Dans chaque page (`page.tsx`), exporter un objet JSON-LD :

```tsx
export default function ProductPage() {
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    // ...
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      {/* contenu page */}
    </>
  );
}
```

### Layout root

L'Organization schema va dans `app/layout.tsx` pour etre present partout.

## Verification

Apres deploiement :
1. **Google Rich Results Test** : https://search.google.com/test/rich-results
2. **Schema.org Validator** : https://validator.schema.org/
3. **Search Console > Enhancements** : suivi des erreurs et coverage
4. **Bing Webmaster Tools** : meme infos cote Bing/AI

## Anti-patterns

- ❌ Schema avec data fausse ou inventee (penalite Google + perte trust LLM)
- ❌ Schema sur pages cachees / no-content (cargo cult)
- ❌ Trop de schemas types sur une meme page (bruit)
- ❌ Aggregate ratings inventes (visible et penalise)
- ❌ Oublier de mettre a jour datePublished/dateModified

## Skills lies

- `marketing/seo-technique` : ensemble bases SEO
- `marketing/seo-ia` : schema = signal de credibilite pour LLMs
- `marketing/architecture-site` : breadcrumbs + structure
