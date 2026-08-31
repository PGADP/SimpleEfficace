# Grille — prompt applicatif

Cible : tout prompt assemblé dans du code et envoyé à une API (system prompt de service,
extraction, rédaction, scoring, agent applicatif). Ici on contrôle ce qu'un `SKILL.md` ne
contrôle pas : la température, le schéma de sortie, l'ordre d'assemblage, le modèle, le cache.

`[M]` = appuyé par une mesure publiée. `[R]` = recommandation d'éditeur sans mesure.
Sévérité : **CRITICAL** (le service peut produire du faux ou laisser passer un abus)
· **MAJEUR** (qualité ou coût mesurés) · **MINEUR** (coût sans contrepartie).

## Sommaire

1. Les cinq invariants
2. Grille des 16 anti-patterns
3. Ce qui ne se transpose pas entre fournisseurs
4. Checks déterministes

## 1. Les cinq invariants

Cinq règles s'appliquent sans mesure préalable, elles sont établies.

1. **Préfixe stable en tête, volatil en queue.** Un horodatage, un identifiant de corrélation ou
   un compteur en tête de system prompt annule le cache à chaque appel. Le cache se facture autour
   de 10 % du prix d'entrée chez les fournisseurs qui ne facturent pas l'écriture, et jusqu'à
   80 % de latence en moins. Chez un fournisseur à premium d'écriture, moins de 2 lectures par
   écriture coûte **plus cher** que pas de cache du tout.
2. **La justification précède le verdict dans le schéma.** L'ordre des champs est l'ordre de
   génération : placer `answer` avant `reasoning` fait chuter un benchmark de 94,2 % à 31,8 %,
   et un autre de 90,0 % à 2,67 %. C'est le correctif le plus rentable de cette grille.
3. **Un fait daté ou chiffré porte sa preuve verbatim, vérifiée en code.** Le champ `evidence`
   précède le fait, et une vérification de sous-chaîne rejette ce qui n'est pas dans la source.
   Un pipeline mesuré valide 90,12 % de ses lignes ainsi : les 10 % restants sont exactement la
   population à rejeter automatiquement.
4. **L'abstention est nommée et autorisée.** « Si l'âge n'est pas dans le contexte, écris la scène
   sans âge, c'est la bonne réponse » vaut mieux que « n'invente pas », qui ne dit pas quoi faire
   à la place. Cause racine mesurée : l'entraînement récompense la devinette sur l'aveu d'incertitude.
5. **Aucun contrôle de sécurité ne vit dans le texte.** Les défenses par délimiteurs passent de 1 %
   de succès d'attaque en statique à plus de 95 % sous attaque adaptative. Le texte utilisateur est
   balisé et sans autorité ; l'autorisation vit en base, et aucun identifiant n'est produit par le
   modèle.

## 2. Grille des 16 anti-patterns

| # | Sévérité | Symptôme observable | Cause | Correctif |
|---|---|---|---|---|
| 1 | CRITICAL `[M]` | Le service affirme un fait absent de la source | Aucun champ de preuve, ou preuve non vérifiée en code | Champ `evidence` verbatim avant le fait, test de sous-chaîne, rejet automatique |
| 2 | CRITICAL `[M]` | Le verdict est juste sur les cas faciles, faux dès que ça se complique | Champ de verdict placé avant sa justification dans le schéma | Inverser l'ordre des champs |
| 3 | CRITICAL `[M]` | Une phrase du contenu utilisateur change le comportement | Texte utilisateur non balisé, ou traité comme instruction | Bloc balisé, consigne de clôture après lui, sortie contrainte par schéma |
| 4 | CRITICAL `[R]` | Un utilisateur atteint une donnée qui ne lui appartient pas | Contrôle d'autorisation confié au prompt | Le contrôle vit en base ; aucun identifiant produit par le modèle |
| 5 | MAJEUR `[M]` | Facture d'entrée qui ne baisse jamais malgré un prompt répétitif | Contenu volatil en tête, ou pas de clé de cache stable | Préfixe figé, volatil en queue, clé de cache par session |
| 6 | MAJEUR `[M]` | Sortie parfois non conforme au schéma, parsing défensif partout | `json_object` ou function calling là où un schéma strict suffit | `json_schema` strict, `additionalProperties: false` |
| 7 | MAJEUR `[M]` | Qualité qui s'effondre sur un petit modèle alors que le gros passe | Coût de la contrainte de format sur un modèle proche de sa limite | Séparer raisonnement et formatage en deux étapes, ou monter de modèle |
| 8 | MAJEUR `[M]` | La qualité baisse quand le schéma grossit | Dégradation monotone avec la lourdeur du schéma | Réduire le nombre de champs, découper l'appel |
| 9 | MAJEUR `[M]` | Le service hallucine plus quand on lui donne plus de contexte | Sous-ensemble récupéré non borné, voisins non pertinents | Top-K borné, plafond de tokens en constante unique, résumé pour le reste |
| 10 | MAJEUR `[M]` | Passer à un modèle plus gros n'a rien réglé | Contexte récupéré bruité : les gros modèles y sont plus sensibles | Nettoyer la sélection avant de changer de modèle |
| 11 | MAJEUR `[M]` | Ajouter des exemples ne fait plus rien, ou dégrade | Optimum de few-shots dépassé, ou cas limites empilés | Un exemple d'abord, exemples canoniques et divers, monter sur preuve |
| 12 | MAJEUR `[M]` | Aucune comparaison avant / après reconstituable | Version de prompt non journalisée | Constante de version, journalisée à chaque appel avec l'identifiant de corrélation |
| 13 | MAJEUR `[M]` | Latence et coût en hausse sans gain de justesse | CoT explicite demandé à un modèle à raisonnement | Le supprimer, garder le découpage en étapes |
| 14 | MINEUR `[M]` | Une même constante de température sert extraction et rédaction | Réglage unique pour deux tâches opposées | Basse pour le déterministe, haute pour le créatif, deux constantes |
| 15 | MINEUR `[R]` | Le schéma est recopié en prose dans le system prompt | Doublon de tokens et seconde source de vérité | Décrire la sémantique que le schéma ne porte pas, jamais sa structure |
| 16 | MINEUR `[R]` | Balisage XML et markdown mélangés dans le même prompt | Convention changée en cours de route | Une seule convention, tenue jusqu'au bout |

## 3. Ce qui ne se transpose pas entre fournisseurs

Le contenu se transpose, le placement et les réglages non. À vérifier avant tout portage :

- **Placement en contexte long** : instructions critiques en début ou en fin selon les uns,
  explicitement **après** les données pour les gros contextes selon les autres. Deux régimes :
  règles courtes et nombreuses en tête, consigne d'exécution après un gros bloc de données en queue.
- **Rôle système** : paramètre dédié chez les uns, message développeur chez les autres sur les
  modèles à raisonnement. Un portage mécanique du tableau de messages ne suffit pas.
- **Cache** : seuil d'amorçage, granularité de bloc, durée de vie et surcoût d'écriture varient du
  simple au décuple. La durée de vie n'est pas toujours publiée : elle se mesure sur le compteur de
  tokens cachés, elle ne se suppose pas.
- **Verbosité par défaut** et **prefill de la réponse** : disponibles ici, absents ou contraints là.
- **Injection automatique du schéma** dans le system prompt : faite par certains fournisseurs, ce
  qui rend la reduplication manuelle inutile.

Sur un modèle à raisonnement : partir sans exemple, n'en ajouter qu'aligné avec la consigne.

## 4. Checks déterministes

Sur le ou les fichiers qui construisent le prompt. Ils cadrent le jugement, ils ne le remplacent pas.

```bash
F=<fichier qui assemble le prompt>

# 1. Contenu volatil en tête de prompt, item 5
grep -nE 'Date\.now\(\)|new Date\(|toISOString|correlationId|randomUUID|Math\.random' "$F"

# 2. Clé de cache et préfixe stable, item 5
grep -nE 'cache_key|cacheKey|cache_control|prompt_cache' "$F"

# 3. Contrainte de sortie, items 6 et 8
grep -nE 'json_schema|json_object|response_format|strict|additionalProperties' "$F"

# 4. Ordre des champs du schéma : justification avant verdict, item 2
grep -nE 'z\.object\(|reasoning|justification|evidence|verdict|answer|result' "$F"
#    a lire : le champ de justification doit apparaitre AVANT le champ de verdict.

# 5. Preuve verbatim et sa vérification en code, item 1
grep -rnE 'evidence' "$F" ; grep -rnE '\.includes\(|indexOf\(|substring' "$F"

# 6. Version de prompt journalisée, item 12
grep -nE 'PROMPT_VERSION|promptVersion' "$F"

# 7. Températures, item 14
grep -nE 'temperature' "$F"

# 8. CoT manuel, item 13
grep -niE 'step by step|etape par etape|think step|réfléchis étape' "$F"

# 9. Balisage du contenu utilisateur, item 3
grep -nE '<user|<contenu|<document|</user|BEGIN USER|```user' "$F"

# 10. Identifiant produit par le modèle, item 4
grep -nE '\bid\b.*z\.string|uuid.*z\.string' "$F"
```

Non mécanisable, donc jugé à la lecture : la pertinence réelle du contexte injecté, l'optimum de
few-shots, et l'effet net d'un changement de prompt. Ces trois-là exigent un banc d'évaluation :
30 à 50 cas dorés issus des données réelles, juges déterministes d'abord, juge LLM seulement sur
les critères que le code ne peut pas capturer, et comparaison par paire entre deux versions.
