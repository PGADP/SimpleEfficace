# Grille — prompt d'instruction d'agent

Cible : `SKILL.md`, `CLAUDE.md` / `AGENTS.md`, commande markdown, définition de sous-agent,
description d'outil ou de serveur MCP. Tout texte lu par un agent pour décider quoi faire.

`[M]` = appuyé par une mesure publiée. `[R]` = recommandation d'éditeur sans mesure.
Sévérité : **CRITICAL** (le prompt ne fait pas ce qu'il dit) · **MAJEUR** (dégradation mesurée)
· **MINEUR** (coût sans contrepartie).

## Sommaire

1. Les trois axes qui portent le verdict
2. Grille des 18 anti-patterns
3. Ce que ce prompt n'a pas comme levier
4. Checks déterministes

## 1. Les trois axes qui portent le verdict

Trois axes sont mesurés, le reste est du folklore et se traite en MINEUR.

- **Densité d'instructions.** Dégradation continue de l'adhérence avec le nombre de règles :
  20 modèles, 7 fournisseurs, les meilleurs plafonnent à 68 % à 500 instructions, et les erreurs
  sont massivement des **omissions silencieuses et uniformes**. Un fichier trop dense ne produit
  pas d'erreur visible, il produit des règles non appliquées sans motif apparent. Compter les
  **règles distinctes**, jamais les lignes : aucun seuil en lignes n'est publié.
- **Discrimination des descriptions.** Le mode d'échec dominant du routage n'est pas « le skill ne
  se déclenche pas » (rappel@3 de 0,85 à 0,89) mais « le mauvais frère de la même famille se
  déclenche » (taux de frère nuisible de 0,346 à 0,372 à K=3). Réécrire une description pour
  qu'elle **exclue nommément le cas voisin** est le correctif mesuré.
- **Absence de conflit interne.** Sur des directives incompatibles : 49 % de biais de primauté
  contre 21 % de second, et surtout 68 à 70 % de neglect sur les conflits de raisonnement,
  c'est-à-dire que le modèle abandonne les deux consignes. Chercher les conflits avant d'ajouter
  une règle : une règle de plus sur un conflit non résolu ne corrige rien.

Corollaire à assumer : la persona, la politesse et l'emphase typographique n'ont aucun gain
mesuré. Une persona a été mesurée faisant chuter la justesse de 0,92 à 0,67. `IMPORTANT`,
`ALWAYS`, `NEVER` ne renforcent rien, ils augmentent la densité, qui elle nuit.

## 2. Grille des 18 anti-patterns

| # | Sévérité | Symptôme observable | Cause | Correctif |
|---|---|---|---|---|
| 1 | MAJEUR `[M]` | Des règles sont appliquées certains tours, pas d'autres, sans motif | Densité d'instructions : omission silencieuse et uniforme | Compter les règles distinctes, externaliser ou supprimer |
| 2 | MAJEUR `[M]` | La règle ajoutée en dernier n'est jamais suivie | Biais de primauté, effondrement en fin de liste | Remonter les règles critiques dans le premier tiers |
| 3 | MAJEUR `[M]` | L'agent choisit un skill voisin au périmètre proche | Descriptions qui se chevauchent (frère nuisible) | Écrire dans chaque description le cas voisin exclu |
| 4 | CRITICAL `[R]` | Le skill ne se déclenche jamais | Description sans terme déclencheur, ou en 1re / 2e personne | 3e personne, quoi + quand, termes attendus de l'utilisateur, 1024 caractères maximum |
| 5 | MAJEUR `[M]` | Mauvais outil appelé, ou bons noms mais arguments d'un autre outil | Trop d'outils exposés, descriptions non discriminantes | Réduire le catalogue visible, expliciter périmètre et contraintes de paramètres |
| 6 | MINEUR `[M]` | L'agent invente un nom d'outil | Catalogue trop grand, noms proches | Namespacing cohérent, catalogue réduit |
| 7 | MAJEUR `[M]` | Réponses lentes et verbeuses sans gain de justesse | « Réfléchis étape par étape » adressé à un modèle à raisonnement | Supprimer le CoT explicite, garder le workflow numéroté |
| 8 | CRITICAL `[M]` | Les deux consignes contradictoires sont ignorées | Conflit de raisonnement (68 à 70 % de neglect) | Supprimer le conflit avant d'ajouter la moindre règle |
| 9 | MAJEUR `[R]` | L'agent fait exactement ce qui est interdit | Interdiction sans action de remplacement | Reformuler en positif quand une alternative existe |
| 10 | MINEUR `[M]` | Empilement de IMPORTANT / ALWAYS / NEVER sans effet | Emphase confondue avec un levier | Supprimer l'emphase, garder la règle |
| 11 | MINEUR `[M]` | Un rôle « expert » dégrade la justesse | Persona décorative | La supprimer |
| 12 | MAJEUR `[R]` | L'agent lit partiellement une référence et rate l'info | Références imbriquées à plus d'un niveau | Toutes les références à un niveau ; sommaire au-delà de 100 lignes |
| 13 | MAJEUR `[M]` | Le sous-agent rend un travail hors sujet | Contexte non reconstruit à la délégation | Passer chemins, contraintes et définition d'un résultat complet dans la consigne |
| 14 | MINEUR `[R]` | Le fichier contient des dates et des « à partir de » | Information périssable inline | Section « anciens usages » repliée, jamais de conditionnel temporel |
| 15 | MINEUR `[R]` | Le prompt propose 4 bibliothèques équivalentes | Trop d'options offertes | Une valeur par défaut, plus une porte de sortie nommée |
| 16 | MINEUR `[R]` | Termes synonymes rotatifs pour le même concept | Incohérence terminologique | Un terme par concept |
| 17 | CRITICAL `[M]` | Le tour utilisateur écrase une règle du fichier | La hiérarchie system / user n'est pas fiable | Faire porter l'invariant par du code (hook, test, CI), pas par le texte |
| 18 | CRITICAL `[R]` | Aucune condition d'arrêt, boucles d'outils | Absence de stop condition et de budget de retry | Déclarer critère d'arrêt, budget de retry, contrôle de progression |

## 3. Ce que ce prompt n'a pas comme levier

À ne pas reprocher à un prompt d'instruction, et à ne pas lui prescrire :

- pas de contrôle de format machine : seulement un gabarit textuel, jamais un `json_schema` ;
- pas de température, pas de choix de modèle, pas d'ordre d'assemblage du contexte ;
- pas d'autorité garantie : la séparation system / user ne tient pas sous conflit ;
- le déclenchement se joue sur `name` et `description` seuls, le corps n'est pas préchargé.

Deux régimes de placement, qui ne se contredisent qu'en apparence :

- **règles courtes et nombreuses** : en tête (biais de primauté à 49 %) ;
- **consigne d'exécution après un gros bloc de données** : en queue (contexte long).

Sur la longueur, le seul chiffre autoritaire est une recommandation d'éditeur : corps sous
500 lignes, au-delà découper en fichiers référencés à un seul niveau. Les seuils « ignoré après
80 lignes » et « 150 à 200 instructions » sont non sourcés, et le « 300 à 350 mots » qui circule
est mal attribué à son billet d'origine. Ne jamais rendre un verdict sur un compte de lignes seul.

## 4. Checks déterministes

À lancer avant tout jugement, sur le fichier visé. Chaque check répond à un item de la grille.
Un check qui ne renvoie rien n'est pas une preuve de qualité, seulement une absence de défaut
mécanique.

```bash
F=<chemin du prompt>

# 1. Densité : nombre de règles distinctes (puces et étapes normatives), item 1
grep -cE '^[[:space:]]*([-*]|[0-9]+\.)[[:space:]]' "$F"

# 2. CoT résiduel adressé à un modèle raisonnant, item 7
grep -niE 'step[- ]by[- ]step|etape par etape|étape par étape|think carefully|reflechis bien' "$F"

# 3. Emphase typographique, item 10
grep -coE '(IMPORTANT|ALWAYS|NEVER|MUST|TOUJOURS|JAMAIS|OBLIGATOIRE)' "$F"

# 4. Persona décorative, item 11
grep -niE 'tu es un.? (expert|specialiste|spécialiste|maitre|maître)|you are an? (expert|world-class)' "$F"

# 5. Interdits sans alternative, item 9
grep -cniE '^[[:space:]]*[-*].*(ne pas|ne jamais|never|do not)' "$F"

# 6. Description : longueur, personne, déclencheur, items 3 et 4
sed -n '/^description:/,/^[a-z_-]*:/p' "$F" | wc -c
sed -n '/^description:/,/^[a-z_-]*:/p' "$F" | grep -niE '(^| )(je|tu|I|you)( |$)'
sed -n '/^description:/,/^[a-z_-]*:/p' "$F" | grep -ciE 'quand|use when|a utiliser|à utiliser'

# 7. Profondeur des références : ce que le fichier appelle, item 12
grep -oE '[A-Za-z0-9_./~-]+\.(md|json)' "$F" | sort -u
#    puis relancer ce meme grep sur chaque fichier trouve : il doit ne rien rendre.

# 8. Information périssable, item 14
grep -nE '20[0-9]{2}-[0-9]{2}-[0-9]{2}|a partir de la v|depuis la version' "$F"

# 9. Condition d'arrêt sur un prompt qui déclare des outils ou une boucle, item 18
grep -ciE 'condition d.arret|stop condition|budget de retry|maximum [0-9]+ (tentative|iteration)' "$F"

# 10. Longueur du corps, à lire comme un signal, jamais comme un verdict
wc -l "$F"
```

Non mécanisable, donc jugé à la lecture : la spécificité réelle d'une description, le
chevauchement sémantique entre deux descriptions voisines (item 3), la cohérence terminologique
(item 16), et l'effet net d'une règle sur le comportement. Ces trois derniers exigent un banc
d'évaluation, qui n'existe pas ici : le rapport le dit au lieu de trancher à l'aveugle.
