---
name: marketing-email-sequences
description: Sequences email lifecycle pour produit cadeau B2C - welcome, nurture lead magnet, post-purchase, post-livraison, dual flow offrant/beneficiaire.
risk: low
source: adapted-from-coreyhaines31/marketingskills/email-sequence
date_added: 2026-05-10
---

# Marketing Email Sequences

## Ton role

Concevoir des sequences email lifecycle pour My Mozaica avec specificites produit cadeau (dual flow : email differencies pour l'offrant et pour le beneficiaire). Output = sequence complete avec subject, preview, body, CTA, timing.

## Avant de commencer

1. Lire `.planning/marketing/CONTEXT.md` (ton, ICP, verbatim VOC)
2. Demander :
   - "Quelle sequence (welcome lead / post-purchase offrant / post-purchase beneficiaire / post-livraison / win-back / abandon panier) ?"
   - "Outil utilise (Resend / Mailchimp / autre) ?"

## Sequences prioritaires My Mozaica

### Sequence 1 — Welcome lead magnet (PDF "100 questions")

**Trigger** : Email submit via lead magnet
**Duree** : 3 semaines, 5 emails
**Objectif** : Convertir lead en client

#### Email 1 (J+0, immediate)
- **Subject** : "Voici votre PDF : 100 questions pour vos parents"
- **Preview** : "Merci. Voici comment l'utiliser au mieux."
- **Body** : confirmation download + 1 conseil "commencez par cette question"
- **CTA** : "Telecharger le PDF" (rappel link)

#### Email 2 (J+2)
- **Subject** : "Le piege quand on interviewe ses parents"
- **Preview** : "Et comment l'eviter."
- **Body** : 1 erreur classique (vouloir tout enregistrer d'un coup, parents se braquent), comment l'eviter
- **CTA** : aucun (valeur pure)

#### Email 3 (J+5)
- **Subject** : "Marie a interviewe sa mere de 73 ans. Voici ce qu'elle a appris."
- **Preview** : "Histoire vraie, accord prealable."
- **Body** : verbatim authentique d'1 beta-testeuse, ce qu'elle a decouvert
- **CTA** : "Decouvrir My Mozaica" (soft, secondaire)

#### Email 4 (J+10)
- **Subject** : "Et apres l'interview ? 3 options pour garder une trace"
- **Preview** : "Un classement honnete (oui, mon produit y est)."
- **Body** : comparaison transparente : enregistrement audio brut / transcription manuelle / My Mozaica. Forces et limites de chaque
- **CTA** : "Decouvrir My Mozaica" (primary)

#### Email 5 (J+21)
- **Subject** : "Votre code -10€ expire dans 7 jours"
- **Preview** : "Reserve aux lecteurs du PDF."
- **Body** : code reduction + rappel UVP + 1 verbatim
- **CTA** : "Utiliser mon code MAMIE10" (primary)

### Sequence 2 — Post-purchase OFFRANT (qui achete cadeau)

**Trigger** : Achat cadeau confirme via Stripe
**Duree** : suivi jusqu'a livraison du livre
**Objectif** : rassurer + amplifier moment cadeau + faciliter remise

#### Email 1 (J+0, post-paiement)
- **Subject** : "Merci ! Voici la suite"
- **Preview** : "Tout est pret pour [Prenom beneficiaire]"
- **Body** : confirmation achat + recap : votre carte cadeau (lien) + delais + comment ca va se passer pour [Prenom]
- **CTA** : "Telecharger ma carte cadeau" (PDF imprimable immediate)

#### Email 2 (J+1, sequence delegation OU pas)
**Branche A : Vous remettez le cadeau vous-meme**
- **Subject** : "Comment offrir ce cadeau de la meilleure maniere"
- **Body** : 3 idees mise en scene (apero famille, anniversaire, surprise par mail)

**Branche B : Vous deleguez l'envoi**
- **Subject** : "[Prenom beneficiaire] recevra son code le [date]"
- **Body** : confirmation programmation + comment voir le code envoye

#### Email 3 (J+7 si Branche A pas encore active)
- **Subject** : "Vous avez offert My Mozaica a [Prenom] ?"
- **Preview** : "Comment ca s'est passe ?"
- **Body** : check-in chaleureux, demander temoignage si applicable

#### Email 4 (Beneficiaire commence interview)
- **Subject** : "[Prenom] a commence son livre !"
- **Preview** : "Voici ou en est l'aventure."
- **Body** : update : interview demarree, X% complete

#### Email 5 (Livre redige)
- **Subject** : "Le livre de [Prenom] est en cours d'impression"
- **Body** : update production + ETA

#### Email 6 (Livre expedie)
- **Subject** : "Livre expedie ! Tracking [numero]"
- **Body** : confirmation expedition + tracking + ce qui se passe ensuite

### Sequence 3 — Post-purchase BENEFICIAIRE (qui parle au livre)

**Trigger** : Activation code beneficiaire
**Duree** : pendant tout le parcours interview
**Objectif** : accompagnement chaleureux, eviter abandon, montrer progres

#### Email 1 (J+0, activation)
- **Subject** : "Bienvenue [Prenom], voici votre livre de memoires"
- **Preview** : "[Offrant] vous a offert un cadeau pas comme les autres."
- **Body** : message chaleureux signe humain + comment commencer + rassurance "prenez votre temps, pas de pression"
- **CTA** : "Demarrer ma premiere interview" (primary)

#### Email 2 (J+3 si pas demarre)
- **Subject** : "Comment se passe le demarrage ?"
- **Preview** : "Quelques conseils pour bien commencer."
- **Body** : encouragement + 3 conseils + lien support si besoin

#### Email 3 (J+7 milieu interview)
- **Subject** : "Vous avez deja raconte tellement de choses"
- **Preview** : "Voici quelques moments forts."
- **Body** : recap personnalise des themes deja abordes + encouragement a continuer

#### Email 4 (J+15 en fin interview)
- **Subject** : "On approche du livre"
- **Preview** : "Plus que quelques questions."
- **Body** : message progression + ce qui va se passer ensuite

#### Email 5 (Interview terminee)
- **Subject** : "Bravo, l'interview est terminee !"
- **Preview** : "Place a la magie. On redige."
- **Body** : feliciter + expliquer suite (redaction 4-6 sem) + remerciement

### Sequence 4 — Post-livraison (apres reception livre)

**Trigger** : 5 jours apres expedition (laisser temps reception)
**Duree** : 30 jours, 3 emails
**Objectif** : NPS + temoignage + bouche-a-oreille

#### Email 1 (J+5 post-expedition)
- **Subject** : "Comment trouvez-vous votre livre ?"
- **Body** : question simple + lien NPS 1-10
- **CTA** : "Donner mon avis (1 clic)"

#### Email 2 (Si NPS >= 9)
- **Subject** : "Merci [Prenom] ! Une faveur ?"
- **Body** : demander temoignage video / photo + Trustpilot
- **CTA** : "Laisser un avis Trustpilot"

#### Email 3 (J+30 post-livraison)
- **Subject** : "Et si vous offriez la meme chose a [autre parent] ?"
- **Body** : suggestion offrir un autre livre (autre parent / grand-parent) + code parrainage
- **CTA** : "Offrir un livre" + lien parrainage

### Sequence 5 — Cart abandonment

**Trigger** : Checkout entame mais non termine apres 2h
**Duree** : 72h, 3 emails
**Objectif** : recuperation conversion

#### Email 1 (T+1h)
- **Subject** : "Vous avez oublie quelque chose ?"
- **Body** : rappel chaleureux + reassurance objection commune (delai / qualite / RGPD)

#### Email 2 (T+24h)
- **Subject** : "Le temps passe, et la voix de votre mere aussi"
- **Body** : aversion a la perte (douce, pas culpabilisante) + verbatim VOC

#### Email 3 (T+72h)
- **Subject** : "5€ pour vous decider"
- **Body** : code -5€ valable 24h
- **CTA** : checkout link

### Sequence 6 — Win-back (clients qui ont achete il y a > 6 mois)

**Trigger** : Pas d'achat additionnel apres 6 mois
**Objectif** : second achat pour un autre parent

#### Email 1
- **Subject** : "Il y a 6 mois, vous offriez My Mozaica..."
- **Body** : reminisce moment cadeau, demander si l'experience etait positive

#### Email 2 (J+7)
- **Subject** : "Et l'autre parent ? Et les grand-parents ?"
- **Body** : suggerer d'offrir a une autre personne + code reduction

## Frameworks subject lines

### Best practices subject FR
- 30-50 caracteres ideal (mobile)
- Pas d'emoji par defaut (a tester, depend cible)
- Personnalisation prenom OK mais pas obligatoire
- Pas de SPAM triggers ("GRATUIT", "URGENT", "!!!")
- Mystere / curiosite + clarte > clickbait

### Patterns qui marchent
- Question : "Vous avez oublie quelque chose ?"
- Specifique : "Le piege quand on interviewe ses parents"
- Verbatim : "'C'est le seul cadeau qu'elle a relu 3 fois.'"
- Update : "Le livre de [Prenom] est en cours d'impression"
- Soft urgency : "Votre code expire dans 7 jours"

## Anti-patterns

- ❌ Trop d'emails (>5 dans la 1ere semaine = unsubscribe)
- ❌ Subject "Newsletter Mai 2026" (mort)
- ❌ Tout en HTML pour avoir l'air pro (texte simple convertit mieux souvent)
- ❌ CTAs multiples par email (Hicks Law)
- ❌ Generiques "L'equipe My Mozaica" (preferer signature humain : "Paul, fondateur")
- ❌ Ignorer specificites cadeau (ne pas confondre offrant/beneficiaire)
- ❌ Spam beneficiaire (qui n'a pas demande, juste recu un cadeau)

## Mesure

Par sequence, tracker :
- Open rate (subject lines)
- Click rate (body + CTAs)
- Conversion rate (achat / temoignage / partage)
- Unsubscribe rate (si > 0.5% = trop, ajuster)

## Skills lies

- `marketing/copy` : ecriture body
- `marketing/lead-magnets` : trigger sequence 1
- `marketing/parrainage` : trigger sequence 4 email 3
- `marketing/cro-page` : optimiser landing apres click email
