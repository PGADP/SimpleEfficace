# References — Conformite RGPD / CNIL / FR

Banque centrale des obligations legales et reglementaires pour un produit B2C francais. Lue par tous les skills marketing pour eviter erreurs juridiques.

**⚠️ Ce document n'est PAS un avis juridique.** Pour validation finale, consulter un avocat specialise. Mais le contenu ici reflete l'etat de l'art 2026 pour un produit comme My Mozaica.

## RGPD (Reglement General sur la Protection des Donnees)

### Mentions obligatoires sur le site

#### Page "Politique de confidentialite" (`/politique-confidentialite`)
Doit contenir :
- Identite et coordonnees du responsable de traitement
- Coordonnees du DPO (Delegue a la Protection des Donnees) si nomme
- Finalites du traitement (pourquoi on collecte les donnees)
- Bases legales (consentement / contrat / interet legitime)
- Categories de donnees collectees
- Destinataires des donnees (Stripe, Mistral, Resend, Supabase, etc.)
- Transferts hors UE (Mistral est UE, Stripe Ireland UE, Supabase / Resend / Mistral hebergement Europe a verifier)
- Duree de conservation
- Droits utilisateur (acces, rectification, effacement, opposition, portabilite, retrait consentement)
- Procedure exercice des droits (email contact)
- Droit de saisine CNIL
- Cookies / analytics

#### Page "Mentions legales" (`/mentions-legales`)
Doit contenir :
- Editeur du site (forme juridique, RCS, capital, siege, dirigeants)
- Hebergeur (nom, adresse, telephone)
- Conditions d'utilisation
- Propriete intellectuelle
- Limites de responsabilite

#### Banniere cookies
Obligatoire si cookies non-strictement-necessaires (analytics, ads).
Doit permettre :
- Accepter tous
- Refuser tous (pas plus difficile que accepter)
- Personnaliser (granularite type cookie)
Sans deja avoir trace.

### Email marketing

#### Consentement obligatoire
- Opt-in actif (case a cocher non pre-cochee)
- Consentement granulaire (newsletter, ads, etc.)
- Possibilite retrait facile (lien desinscription dans CHAQUE email)

#### Information avant collecte
A chaque form email :
- Pourquoi on collecte
- Qui recoit
- Combien de temps stocke
- Lien vers politique de confidentialite

### Capture d'enfants
Si l'utilisateur final peut etre mineur (improbable MM mais a verifier), seuil 15 ans en France (RGPD 16 par defaut), consentement parental obligatoire.

### Sous-traitants (DPA - Data Processing Agreement)

Pour CHAQUE service tiers qui traite des donnees personnelles : signer un DPA.

Pour My Mozaica :
- ✅ Supabase (DPA disponible)
- ✅ Stripe (DPA disponible)
- ✅ Mistral (DPA a verifier - hebergement Europe atout)
- ✅ Resend (DPA disponible)
- ✅ Vercel / Railway (DPA disponible)
- ⚠️ Outils analytics / ads : verifier pour PostHog, Meta Pixel, Google Analytics

### Transferts hors UE

Verifier pour chaque service :
- Hebergement physique des donnees
- Si hors UE (US, autres) : clauses contractuelles types ou Privacy Shield equivalent

Mistral = atout (UE pure). Eviter US si possible.

### Droits utilisateurs

Procedure a documenter et permettre :
- **Droit d'acces** : sur demande, fournir copie de toutes ses donnees
- **Droit de rectification** : corriger donnees inexactes
- **Droit a l'effacement** ("droit a l'oubli") : supprimer compte + donnees liees
- **Droit a la portabilite** : fournir donnees dans format reutilisable (JSON ?)
- **Droit d'opposition** : opposer au traitement
- **Droit de retrait du consentement** : retirer consentement marketing

Delai legal : 1 mois (extensible 2 mois si justifie).

### Violations de donnees

En cas de fuite (data breach) :
- Notification CNIL : sous 72h si risque pour utilisateurs
- Notification utilisateurs : sans delai si risque eleve
- Documenter tous les incidents (registre)

### Sanctions

Non-conformite :
- Avertissement / mise en demeure CNIL
- Amende jusqu'a 20M€ ou 4% CA mondial (le plus eleve)
- Sanctions reputationelles

## CNIL specifique France

### Obligations declarations
Depuis RGPD : plus de declaration prealable (sauf cas particuliers). Mais :
- **Registre des traitements** obligatoire (interne, pas declare)
- **DPIA** (analyse d'impact) si traitement a haut risque
- Pour MM : produit traite des donnees sensibles familiales → DPIA recommandee

### Recommandations CNIL specifiques
- Pseudonymisation des donnees quand possible
- Minimisation : ne collecter que ce qui est necessaire
- Securite : chiffrement, access control, backups
- Privacy by design / by default

## TVA et facturation

### TVA
- Taux normal France : 20%
- My Mozaica : prix 79€ TTC (TVA 20% incluse) → HT = 65,83€
- A indiquer clairement sur landing : "TVA 20% incluse"
- Facture obligatoire avec mention TVA

### Mentions obligatoires facture
- Numero de facture unique
- Date emission
- Identite vendeur (nom, adresse, SIRET, forme juridique, RCS)
- Identite acheteur
- Designation produit
- Quantite, prix unitaire, total HT
- TVA (taux + montant)
- Total TTC
- Conditions paiement
- Penalites de retard

## Conditions Generales de Vente (CGV)

### Mentions obligatoires
- Identite vendeur
- Description produit
- Prix
- Modalites paiement
- Modalites livraison
- Modalites retractation (article L221-18 et suivants)
- Garanties legales (conformite + vices caches)
- SAV
- Mediation (mediation conso obligatoire)
- Tribunaux competents

### Droit de retractation 14 jours

**Cas general** : 14 jours apres reception pour retractation sans justification.

**Exception My Mozaica importante** : Article L221-28 du Code de la consommation
> "Le droit de retractation ne peut etre exerce pour les contrats de fourniture de biens confectionnes selon les specifications du consommateur ou nettement personnalises."

→ My Mozaica peut **ECARTER** le droit de retractation pour les livres deja generes/imprimes (ils sont par nature personnalises).

**MAIS** :
- L'exception doit etre clairement indiquee dans les CGV
- Le consentement de l'acheteur doit etre obtenu avant production
- Tant que l'interview n'a pas commence, le droit de retractation s'applique
- Best practice : clause "satisfaction garantie" volontaire pour pas se cacher derriere l'exception

### Mediation conso
Obligatoire pour B2C en France :
- Adherer a un service de mediation conso (CMAP, AME conso, etc.)
- Indiquer les coordonnees du mediateur dans les CGV
- Cout : ~150-300€/an

### Garanties legales
- Garantie de conformite (2 ans, vendeur professionnel) : article L217-3
- Garantie des vices caches (2 ans depuis decouverte) : article 1641 Code civil
- Garantie commerciale (volontaire en plus, ex MM "satisfait ou rembourse 14j post-reception")

## Reglementation specifique cadeaux / paiement

### Si paiement programme (delegation envoi cadeau)
- Verifier conformite Stripe / DSP2
- 3D Secure obligatoire pour montants >30€
- Confirmer paiement avant programmation envoi

### Carte cadeau / bon cadeau
- Obligation duree minimum : pas de duree legale en FR mais usage 1 an minimum
- Soumis a TVA si activation immediate

## Email marketing specifique

### CNIL position B2C
- Opt-in obligatoire (pas opt-out)
- Pas de soft opt-in (B2B uniquement)
- Lien desinscription dans CHAQUE email
- Reponse en 30 jours max aux demandes acces / suppression

### Cas specifique cadeau MM
- L'acheteur (offrant) consent pour lui
- Le beneficiaire recoit un cadeau, pas du marketing → distinction email transactionnel (livraison cadeau) vs marketing (newsletter)
- Demander consentement explicite pour newsletter beneficiaire (pas presume)

## Checklist conformite minimale My Mozaica

### Avant lancement public
- [ ] Mentions legales completes
- [ ] Politique de confidentialite RGPD-conforme
- [ ] Banniere cookies fonctionnelle (accepter / refuser symetrique)
- [ ] CGV redigees avec clause article L221-28 (personnalise) + mediateur conso
- [ ] DPAs signees avec tous les sous-traitants
- [ ] Registre des traitements interne tenu a jour
- [ ] DPIA si haut risque
- [ ] Procedure droits utilisateurs documentee + email contact dedie (privacy@mymozaica.com)
- [ ] Mention TVA 20% incluse partout
- [ ] Process retractation clair (etape avant production = retractable, apres = non)
- [ ] Mentions facturation completes
- [ ] Adhesion mediateur conso

### Avant chaque campagne marketing
- [ ] Verifier consentement opt-in mailing list
- [ ] Verifier lien desinscription email
- [ ] Si reduction promotionnelle : indiquer prix barre legalement
- [ ] Si scarcity / urgence : verite (pas faux compteur)
- [ ] Pas de claims sante / medical sans preuves

## Skills consommateurs

- `marketing/copy` (mentions trust badges legales)
- `marketing/email-sequences` (conformite emailing)
- `marketing/cro-page` (verifier pages legales presentes)
- `marketing/lancement` (checklist conformite avant lancement)
- `marketing/seo-technique` (mentions legales accessibles)
