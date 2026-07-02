---
name: marketing-video
description: Production de videos marketing - Reels IG, TikTok, YouTube Shorts. Scripts + storyboards + recommandations outils IA (Veo, Runway, HeyGen, Remotion).
risk: low
source: adapted-from-coreyhaines31/marketingskills/video
date_added: 2026-05-10
---

# Marketing Video

## Ton role

Concevoir scripts video courts pour Reels/TikTok/Shorts adaptes My Mozaica + recommander les outils IA quand pertinents (genre HeyGen pour avatars, Runway/Veo pour generation, Remotion pour videos data-driven). 60% des viewers 35-65 ans en 2026 consomment short-form video : ne pas en faire = -50% portee organique.

## Avant de commencer

1. Lire `.planning/marketing/CONTEXT.md`
2. Lire `~/.claude/commands/marketing/references/plateformes-fr.md`
3. Demander :
   - "Tu veux un script ou un brief tournage ?"
   - "Plateforme cible (Reel IG, TikTok, Short YT, ad) ?"
   - "Tu tournes toi-meme ou tu utilises des outils IA ?"

## Formats short-form (15-60s)

### Plateformes et durees optimales 2026

| Plateforme | Duree ideale | Aspect ratio | Specs |
|------------|--------------|--------------|-------|
| Instagram Reel | 30-45s | 9:16 | 1080x1920, son obligatoire |
| TikTok | 15-30s | 9:16 | 1080x1920, son obligatoire |
| YouTube Shorts | 30-60s | 9:16 | 1080x1920, son obligatoire |
| Facebook Reel | 30-45s | 9:16 | identique IG |
| Instagram Feed | 60s max | 1:1 ou 4:5 | Vertical conseille |

## Structures narratives prouvees

### Structure A : Problem-Solution (60% des Reels efficaces)

```
[0-3s]   Hook : probleme aigu, montre dans 1 image
[3-8s]   Aggravation : pourquoi c'est urgent
[8-25s]  Solution : My Mozaica entre en scene
[25-35s] Demo / preuve concrete
[35-45s] CTA : "Lien en bio"
```

Ex MM :
- 0-3s : "J'ai pleure en regardant les videos de ma grand-mere disparue..."
- 3-8s : "Aucun son. Juste des images muettes."
- 8-25s : "Avec My Mozaica, j'ai interviewe ma mere avant qu'il soit trop tard..."
- 25-35s : montrer le livre imprime
- 35-45s : "Le lien est en bio. Faites-le pour vos parents."

### Structure B : Storytelling chronologique

```
[0-3s]   Hook in medias res (au cœur de l'action)
[3-15s]  Flashback / contexte
[15-30s] Climax : le moment cle
[30-45s] Resolution / morale
[45-60s] CTA
```

Ex MM :
- 0-3s : "Hier, ma mere a pleure en lisant ce livre."
- 3-15s : "Il y a 3 mois, je lui avais offert My Mozaica..."
- 15-30s : "Elle a passe 6h a raconter sa vie a une IA..."
- 30-45s : "Et quand le livre est arrive, elle a vu son histoire ecrite."
- 45-60s : "Si vos parents sont encore la, faites-le. Lien en bio."

### Structure C : List / Tutorial

```
[0-3s]   Hook avec promesse
[3-10s]  Setup
[10-50s] Liste de N elements (5 conseils, 7 questions, etc.)
[50-60s] CTA
```

Ex MM :
- 0-3s : "5 questions a poser a vos parents avant qu'il soit trop tard."
- 3-10s : "Je suis fondateur de My Mozaica..."
- 10-50s : Question 1 / 2 / 3 / 4 / 5 avec overlay text
- 50-60s : "Recevez les 100 questions complete dans le PDF gratuit. Lien en bio."

### Structure D : Reverse Chronological (curiosity)

```
[0-3s]   Conclusion choquante / scene finale
[3-25s]  Comment on en est arrive la
[25-50s] Detail des etapes
[50-60s] CTA
```

Ex MM :
- 0-3s : "Voici le seul livre que ma mere relit 3 fois par an."
- 3-25s : "Il y a 1 an, je l'ai offert pour ses 70 ans..."
- 25-50s : "L'interview a dure 4 sessions de 1h..."
- 50-60s : "C'est 79€. Lien en bio."

## 3-Second Rule (Hook)

Trois elements simultanes en 3 secondes :
1. **Visuel** : action, contraste, ou close-up emotionnel
2. **Verbal** : 1ere phrase qui ouvre une boucle
3. **Overlay text** : 5-10 mots resumant

Sans ca = perte 70% viewers.

## Outils IA recommandes

### Pour avatars / temoignages (eviter de tourner)
- **HeyGen** : avatar IA realiste, voix clonable, ~$30/mois
- **Synthesia** : avatars + 140 langues, ~$30/mois
- **Use case MM** : creer 10 temoignages "video" en 1h sans tourner

### Pour generation video pure
- **Runway Gen-4** : video text-to-video, ~$15-95/mois, 5-10s clips
- **Google Veo 3** : video text-to-video, dispo via Vertex AI
- **Use case MM** : sequences emotionnelles abstraites (mains qui se tiennent, livre qui s'ouvre, papier qui jaunit)

### Pour data-driven / dynamique
- **Remotion** : video programmable React, code-based, gratuit (open source)
- **Use case MM** : video personnalisee par client (montre son livre cover unique)

### Pour montage rapide
- **Capcut** (gratuit) : standard TikTok/Reels, IA pour subtitles auto
- **Descript** : edition video par texte (plus intuitive), ~$24/mois
- **Premiere Pro** : pro mais courbe apprentissage

### Pour subtitles (CRITIQUE)
**85% des Reels sont regardes sans son.** Subtitles = obligatoires.
- Capcut auto-subtitles (FR fonctionnel)
- Descript (meilleure precision FR)
- Submagic (~$12/mois, dedie subtitles fancy)

## Workflow

### Etape 1 : Brief
- Plateforme cible
- Duree
- Pilier de contenu (cf `marketing/social`)
- Output : tournage / outil IA / mix

### Etape 2 : Choisir structure
A / B / C / D selon angle.

### Etape 3 : Script complet

Format livraison :

```
# Video : <titre>

**Plateforme** : <Reel IG / TikTok / Short YT>
**Duree** : <Xs>
**Aspect ratio** : 9:16
**Pilier** : <nom>

## Script

### [0-3s] HOOK
- **Visuel** : <description>
- **Voice** : "<phrase parlee>"
- **Overlay text** : <5-10 mots>

### [3-Xs] BODY
- **Visuel** : <description>
- **Voice** : "<phrase>"
- **Overlay text** : <text>

[etc...]

### [Xs-fin] CTA
- **Visuel** : <description>
- **Voice** : "<phrase>"
- **Overlay text** : <CTA>

## Specs production

**Tournage requis** : oui / non
**Outils IA** : [HeyGen / Runway / Veo / aucun]
**Audio** : voix-off [oui/non] + musique [genre]
**Subtitles** : auto-generation Capcut / Descript

## Caption (description du post)

[texte caption complet, 200 mots max]

[hashtags : 8-15]
```

### Etape 4 : Brief tournage (si applicable)

Si tournage requis :
- Lieu : <description>
- Materiel : <iphone, micro lavalier, eclairage naturel>
- Plans : <liste plans / shots>
- Story : <bouclage narratif>

## Idees video starter pack My Mozaica

### 5 Reels temoignages (apres beta)
1. "Voici la reaction de ma mere quand elle a recu son livre"
2. "Avant My Mozaica, je n'avais que 3 photos de mes grand-parents..."
3. "Mon pere a 75 ans. Il a tout raconte a une IA. Voici ce qui est sorti."
4. "J'ai offert My Mozaica pour les 50 ans de mariage de mes parents."
5. "Voici ce que ma grand-mere m'a raconte qu'elle ne m'avait jamais dit"

### 5 Reels coulisses
1. "Comment notre IA respecte la voix de votre proche (demo 60s)"
2. "Une journee chez My Mozaica : du chat au livre imprime"
3. "Pourquoi j'ai cree My Mozaica (histoire personnelle fondateur)"
4. "Le moment ou un livre arrive chez un client : unboxing"
5. "On ouvre les avis de nos beta-testeurs en direct"

### 5 Reels pedagogie
1. "5 questions surprenantes a poser a vos parents"
2. "Comment briser la pudeur de vos parents (3 techniques)"
3. "Vos parents disent 'y a rien a raconter' ? Voici la solution"
4. "Interview vos grand-parents en 4 etapes simples"
5. "L'erreur n°1 quand on interview ses parents"

## Anti-patterns

- ❌ Pas de subtitles (85% sans son)
- ❌ Hook lent (intro "Bonjour aujourd'hui je vais vous parler de...")
- ❌ Plus d'1 CTA
- ❌ Faire pleurer pour faire pleurer (manipulation)
- ❌ Stock footage sans valeur ajoutee
- ❌ Voix robotique generique (HeyGen/IA dois rester sub-perceptible)
- ❌ Music libre de droits par defaut sans verification
- ❌ Trop de coupes (perdre l'attention emotionnelle)

## Skills lies

- `marketing/social` : alimente le calendrier
- `marketing/copy` : ecrit le caption
- `generate-image` : visuels still si pas de tournage
- `marketing/ads-creas` : variantes pour ads payantes
