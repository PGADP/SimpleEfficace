---
name: marketing-concurrents
description: Profile structuree d'un concurrent (positionnement, pricing, messaging, points faibles) a partir de son site web et ses reseaux. Cible marche FR bio/cadeau.
risk: low
source: adapted-from-coreyhaines31/marketingskills/competitor-profiling
date_added: 2026-05-10
---

# Marketing Concurrents

## Ton role

Profiler un concurrent de maniere structuree pour aider a positionner My Mozaica. Output = dossier `.planning/marketing/concurrents/<nom>.md` reutilisable par tous les skills marketing.

## Avant de commencer

1. Lire `.planning/marketing/CONTEXT.md`
2. Lire `~/.claude/commands/marketing/references/concurrents-bio-fr.md` (banque deja constituee ou template)

## Workflow

### Etape 1 : Identifier le concurrent
Trois categories possibles :
- **Direct** : meme produit + meme cible (ex : StoryWorth, Remento, RaconteurDeVie pour My Mozaica)
- **Secondaire** : produit different, meme besoin emotionnel (ex : Wecandoo experiences cadeaux, Smartbox)
- **Indirect** : alternative pas-cher / DIY (ex : Photobox albums photos, journal intime, biographe humain pro)

### Etape 2 : Sources de donnees a explorer

**Site web**
- Homepage / hero (positionnement principal)
- Pricing page (modele commercial)
- About / Notre histoire (raison d'etre revendiquee)
- FAQ (objections anticipees)
- Testimonials (proof social)
- Blog / contenu (strategie SEO)

**Reseaux sociaux**
- Instagram : style visuel, frequence, type de contenu
- Facebook : groupes ? page ? engagement ?
- YouTube : tutos, demos, temoignages ?
- TikTok : presence ?
- LinkedIn : equipe, taille, levees de fonds ?

**Reviews**
- Trustpilot.fr / Google Reviews / Amazon.fr
- Verbatim positifs (ce qui marche)
- Verbatim negatifs (failles a exploiter)

**Donnees business publiques**
- Funding (Crunchbase, Pitchbook si dispo)
- Annee de creation
- Equipe (LinkedIn)
- Pays de provenance (US, UK, FR, autre ?)

### Etape 3 : Profile structure

Generer fichier `.planning/marketing/concurrents/<nom-kebab>.md` :

```markdown
# Concurrent : <Nom>

**Categorie** : Direct | Secondaire | Indirect
**Url** : <url>
**Pays d'origine** : <FR / US / UK / autre>
**Annee creation** : <annee>
**Statut** : Actif | En declin | Pivot recent

## Positionnement (1 phrase)
<Comment ils se decrivent dans le hero>

## Cible declarée
<Qui est leur ICP affiche>

## Cible reelle (ce que je deduis)
<Qui je pense vraiment qu'ils touchent vu leur ton/visuels/prix>

## Pricing
- Produit principal : <prix>
- Variantes / packs : <details>
- Modele : one-shot | abonnement | freemium

## Proposition de valeur unique (UVP)
<En quoi ils se distinguent, dans LEURS mots>

## Forces (objectives)
- Force 1
- Force 2
- Force 3

## Faiblesses (objectives, exploitables)
- Faiblesse 1 (verbatim avis negatifs si possible)
- Faiblesse 2

## Messaging / Tone
- Mots-cles recurrents : <liste>
- Ton : <chaleureux / professionnel / startup / corporate / artisanal>
- Anglicismes : <oui/non>

## Strategie SEO observable
- Pages cles indexees
- Mots-cles probables ciblés
- Contenu blog (frequence, qualite)

## Strategie sociale observable
- Plateforme #1 : <nom> + <pourquoi>
- Frequence : <X posts/semaine>
- Type de contenu dominant

## Differenciation My Mozaica vs eux
- Ce qu'on fait MIEUX : <points concrets>
- Ce qu'ils font MIEUX : <points honnetes>
- Le terrain qu'on devrait CLAIMER : <axe non-occupe>

## Verbatim avis (top 3 positifs + top 3 negatifs)
**Positifs**
1. "..."
2. "..."
3. "..."

**Negatifs (failles a exploiter)**
1. "..."
2. "..."
3. "..."

## Red flags / risques
<Pivot recent ? levee massive ? aggression marketing ?>

## Notes / opportunites
<Idees pour My Mozaica suite a cette analyse>
```

### Etape 4 : Mise a jour banque centrale

Apres chaque profile, ajouter une ligne dans `~/.claude/commands/marketing/references/concurrents-bio-fr.md` (table de tous les concurrents profiles).

## Concurrents a profiler en priorite pour My Mozaica

**Tier 1 (direct, indispensable)**
- StoryWorth (US, leader mondial, prix ~99$/an, abonnement annuel, modele questions hebdo)
- Remento (US, plus jeune, focus video + livre)
- RaconteurDeVie (FR, biographe humain coordonne, premium)

**Tier 2 (secondaire, important)**
- Wecandoo (FR, experiences artisanales cadeaux)
- Heirloom (US, similar a Remento)
- Famicity (FR, arbre genealogique + memoires)

**Tier 3 (indirect, contexte)**
- Photobox / CEWE (livres photos)
- Smartbox (cadeaux experiences)
- Biographes humains pro (4000-8000€)

## Anti-patterns

- ❌ Copier leur strategie sans comprendre leur cible (ils peuvent cibler differemment)
- ❌ Profile superficiel (juste pricing + url) — sans messaging/ton, inutile
- ❌ Ignorer les Indirects — souvent le vrai competitor pour le budget de l'acheteur

## Skills lies

- `marketing/contexte` : section Concurrents s'enrichit de chaque profile
- `marketing/copy` : exploite faiblesses concurrentes pour positionner
- `marketing/seo-ia` : pages "vs" (My Mozaica vs StoryWorth, etc.)
- `marketing/strategie-contenu` : exploite gaps de contenu non couverts par concurrents
