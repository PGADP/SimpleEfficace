# Suite Marketing — My Mozaica (FR/B2C biographie cadeau)

Suite de 23 skills marketing adaptes du repo `coreyhaines31/marketingskills` pour le contexte My Mozaica :
- B2C francais (pas SaaS US)
- Produit cadeau emotionnel (pas abonnement)
- Cible 35-65 ans (pas tech early adopters)
- Maison d'edition familiale (pas startup tech)
- Conformite RGPD/CNIL FR

## Philosophie

**Tous les skills lisent d'abord** `.planning/marketing/CONTEXT.md` du projet courant + les references mutualisees du dossier `references/`. Le contenu y est ancre pour ne PAS produire de blabla SaaS US generique.

**Si `.planning/marketing/CONTEXT.md` n'existe pas**, le skill demande a l'utilisateur de lancer d'abord `/marketing/contexte` pour le creer.

## Arborescence

```
marketing/
├── _fondation/
│   └── contexte.md                    Hub a remplir EN PREMIER
│
├── strategie/                         Penser avant de produire
│   ├── recherche-utilisateur.md
│   ├── concurrents.md
│   ├── idees.md
│   ├── psycho.md
│   └── strategie-contenu.md
│
├── seo/                               4 angles SEO complementaires
│   ├── seo-technique.md
│   ├── seo-ia.md
│   ├── schema.md
│   └── architecture-site.md
│
├── contenu/                           Produire (texte + son ; les visuels passent par /generate-image enrichi)
│   ├── copy.md
│   ├── copy-edit.md
│   ├── social.md
│   ├── video.md
│   └── ads-creas.md
│
├── acquisition/                       Mecaniques business
│   ├── lead-magnets.md
│   ├── free-tool.md
│   ├── email-sequences.md
│   ├── ads-strategie.md
│   ├── parrainage.md
│   ├── lancement.md
│   └── cro-page.md
│
└── references/                        Annexes mutualisees
    ├── frameworks-cognitifs.md
    ├── plateformes-fr.md
    ├── hook-formulas.md
    ├── sources-recherche-fr.md
    ├── patterns-contenu-bio.md
    ├── verbatim-voc.md
    ├── concurrents-bio-fr.md
    ├── calendrier-editorial-2026.md
    ├── glossaire-marketing-fr.md
    └── conformite-rgpd-fr.md
```

## Workflow recommande pour My Mozaica

### Avant beta (semaine S20-S21)
1. `/marketing/contexte` → remplir CONTEXT.md (45 min)
2. `/marketing/concurrents` → dossier StoryWorth/Remento/RaconteurDeVie
3. `/marketing/lancement` → plan 31 mai
4. `/marketing/lead-magnets` → PDF "100 questions a poser"
5. `/marketing/email-sequences` → 3 sequences (offrant + beneficiaire + post-livraison)
6. `/marketing/social` → calendrier IG/FB fete des meres
7. `/marketing/copy` → relecture landing
8. `/marketing/parrainage` → mecanique virale post-livraison

### Post-beta (juin)
9. `/marketing/recherche-utilisateur` → analyser 50 verbatim reels
10. `/marketing/cro-page` → audit conversion landing
11. `/marketing/seo-technique` + `seo-ia` + `schema` + `architecture-site` → suite SEO complete
12. `/marketing/ads-strategie` + `ads-creas` → premiere campagne Meta
13. `/marketing/free-tool` → "generateur 1ere question interview"

### A la demande
- `/marketing/idees` → brainstorm initial 139 idees
- `/marketing/psycho` → quel biais activer sur quelle page
- `/marketing/copy-edit` → passe sur copy existant
- `/marketing/strategie-contenu` → topic clusters + calendrier
- `/marketing/video` → Reels temoignages + Veo/Runway

## Production de visuels

**Pas de skill `/marketing/visuels` separe.** On utilise le `/generate-image` existant (Gemini Nano Banana, script tsx local du projet) qui a deja le contexte My Mozaica. Pour les usages marketing, ajouter `--mode marketing-<usage>` (hero-landing, post-instagram, ad-meta, lead-magnet-cover, email-header).

## Conventions

- **Langue de sortie** : francais (TOUTES les generations utilisateur, sauf prompts d'images en anglais)
- **Ton** : maison d'edition familiale, vouvoiement par defaut sur pages publiques, tutoiement dans le chat produit
- **Anti-patterns** : pas de jargon startup, pas d'urgence agressive, pas d'anglicisme inutile, pas de "Tati" (c'est "Tatie"), pas de larmoyant
- **Cible mentionnee dans chaque skill** : ICP primaire = enfant adulte 35-55 acheteur, ICP secondaire = parent 60-85 utilisateur final

## Source d'origine

Adapte de https://github.com/coreyhaines31/marketingskills (Corey Haines, MIT) — 41 skills B2B SaaS US originaux, 23 retenus + reecrits FR/B2C, 18 ecartes (B2B pur ou hors scope produit cadeau one-shot).
