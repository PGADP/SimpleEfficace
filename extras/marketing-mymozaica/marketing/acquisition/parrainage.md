---
name: marketing-parrainage
description: Programme parrainage / referral pour produit cadeau. Mecanique virale native B2C - chaque client est un ambassadeur potentiel.
risk: low
source: adapted-from-coreyhaines31/marketingskills/referral-program
date_added: 2026-05-10
---

# Marketing Parrainage

## Ton role

Concevoir un programme de parrainage adapte a un produit cadeau B2C. Mecanique : un client paye 79€ → le livre est OFFERT a quelqu'un → ce quelqu'un peut a son tour devenir client (effet ricochet). Output = brief programme complet (mecanique, incentive, comm, tech).

## Avant de commencer

1. Lire `.planning/marketing/CONTEXT.md`
2. Demander :
   - "Phase : pre-launch (avant beta) / post-beta / public launch ?"
   - "Effort technique acceptable (1 jour / 1 semaine / 1 mois) ?"

## Pourquoi un parrainage est puissant pour My Mozaica

1. **Produit cadeau natif** : chaque achat touche au moins 2 personnes (offrant + beneficiaire)
2. **Bouche-a-oreille emotionnel** : le moment de remise du livre = moment Instagrammable
3. **LTV faible mais clients passionnes** : le parrainage peut multiplier le LTV par 1.5-2x
4. **CAC tres bas** : un parrainage coute 5-15€ vs 25-30€ Meta Ads

## Mecaniques de parrainage

### Mecanique A : "Donner / Recevoir" classique

**Setup** :
- Le parrain (existing customer) recoit un code unique
- Le filleul utilise le code → -10€ sur son achat
- Le parrain recoit -10€ sur son prochain achat (ou 10€ donate via virement / amazon card)

**Avantages** : simple, evident, deja vu = pas de confusion
**Inconvenient** : si parrain n'a pas envie d'un 2e livre, l'incentive est faible

### Mecanique B : "Donate to charity"

**Setup** :
- Pour chaque parrainage reussi, My Mozaica donne 10€ a une asso (EHPAD, Petits Freres des Pauvres)
- Le parrain est mis en avant : "Marie a permis le don de 50€ a [asso]"

**Avantages** : alignement valeurs, ton MM, presse-friendly
**Inconvenient** : moins fort comme incentive personnel

### Mecanique C : "Tier rewards" (parrainage gamifie)

**Setup** :
- 1er parrainage reussi : carte cadeau Amazon 10€
- 3 parrainages : un livre My Mozaica gratuit (pour offrir a un autre proche)
- 5 parrainages : statut "Ambassadeur" + meet le fondateur + gift bag
- 10 parrainages : commission 15% (programme affilie)

**Avantages** : engagement progressif, ambassadeurs identifies
**Inconvenient** : complexe a implementer

### Mecanique D : "First gift unlocks"

**Setup** :
- Apres 1er achat, l'offrant recoit lien parrainage perso a partager dans les 30 jours
- Si 2 amis utilisent le code dans 30j → reduction sur 3e livre + thank you fondateur

**Avantages** : urgence + valeur claire pour parrain
**Inconvenient** : limite dans le temps

## Recommandation pour My Mozaica

**Pre-beta / beta (mai-juin 2026)** : pas de parrainage formel encore. Trop tot, pas assez de clients pour activer un programme.

**Post-beta (juillet 2026)** : commencer avec **Mecanique A simple** (-10€ / -10€). C'est le plus simple a tester et la plus universellement comprise.

**Phase scale (sept 2026+)** : evoluer vers **Mecanique C tier rewards** quand 100+ clients identifies comme ambassadeurs naturels.

**Long terme (2027+)** : evaluer Mecanique D (urgency-driven) ou Mecanique B (charity) selon retours.

## Brief programme Mecanique A (premiere implementation)

### Wording client

**Pour le parrain** :
- "Vous avez offert My Mozaica. Et si vous le partagiez ?"
- "Pour chaque proche qui utilise votre code, vous recevez -10€ sur votre prochain achat ET il economise 10€ sur le sien."

**Pour le filleul** :
- "[Marie] vous a recommande My Mozaica."
- "Voici 10€ de reduction pour offrir un livre de memoires a vos parents."

### Mecanique technique

1. **Generation code unique** par client apres achat (ex MARIE-1234)
2. **Page parrainage dediee** `/parrainer` avec :
   - Code du client
   - Lien partageable (auto pre-fill au checkout)
   - Compteur "X amis ont utilise votre code"
   - Boutons partage : email / SMS / WhatsApp / IG / FB
3. **Email automatique** 3 jours apres reception livre : "Vous l'avez recu ? Voici votre code parrainage"
4. **Stripe coupon** auto-applique si `?ref=MARIE-1234` dans URL
5. **Tracking** : event `referral_used` + email parrain "Marie, votre code vient d'etre utilise !"

### Communication

- **Page dediee** `/parrainer` (cf architecture-site)
- **Email** post-livraison (cf email-sequences sequence 4 email 3)
- **Mention discrete** sur landing : "Ils nous ont recommandes" (preuve sociale)
- **PAS** de pop-up agressive
- **PAS** de pression sociale ("Partagez maintenant !")

### KPIs

- **K-factor** (viralite) : combien de filleuls par parrain en moyenne (objectif > 0.3 = sain)
- **Taux activation parrain** : % clients qui partagent au moins 1 fois (objectif > 30%)
- **CAC referral** : 10€ + 10€ = 20€ vs CAC paid 25-30€ → win
- **LTV referral vs LTV paid** : referrals souvent +20-40% LTV (qualite client)

## Brief programme Mecanique C (long terme)

### Tiers

```
Tier 1 — "Ambassadeur" (1 parrainage reussi)
- Carte cadeau Amazon 10€
- Badge sur le profil dashboard
- Newsletter privee mensuelle

Tier 2 — "Ambassadeur+" (3 parrainages)
- 1 livre My Mozaica gratuit (pour offrir)
- Meeting Zoom 30 min avec fondateur
- Mention dans newsletter publique

Tier 3 — "Ambassadeur Elite" (5 parrainages)
- Gift bag (livre + marque-page imprime + lettre fondateur)
- Beta access produits futurs
- Mention sur la page "Avis clients"

Tier 4 — "Ambassadeur Affilie" (10 parrainages)
- Commission 15% sur tous les achats avec code (passe a vrai affilie)
- Profil dedie sur le site (si accepte)
- Acces conferences MM
```

### Implementation tech

Plus complexe : necessite dashboard ambassadeur, tracking precis, notif automatique a chaque tier debloque.

## Anti-patterns

- ❌ Pression sociale agressive ("Partagez ou perdez votre reduction !")
- ❌ Wording transactionnel ("Gagnez 10€ par ami !") — incompatible avec ton MM
- ❌ Code parrainage qui expire trop vite (perd l'usage)
- ❌ Pas de tracking robuste (perd les attributions)
- ❌ Lancer un programme sans masse critique (50+ clients minimum)
- ❌ Ne pas remercier les parrains a chaque utilisation code (deception)
- ❌ Recompense delayed sans communication (parrain croit que ca marche pas)

## Skills lies

- `marketing/email-sequences` : sequence post-livraison declenche le partage
- `marketing/copy` : wording program
- `marketing/strategie-contenu` : page parrainage + posts de promotion
- `marketing/cro-page` : optimiser conversion `/parrainer`
