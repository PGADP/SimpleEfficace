# Références prompt — protocole de chargement

`/se-prompt` reste court et **charge une seule grille**, celle de la famille du prompt visé.
Charger les deux coûterait le double de tokens pour des leviers qui ne se recouvrent pas :
un `SKILL.md` n'a ni température, ni `response_format`, ni ordre d'assemblage du contexte.

## Table de routage

| Ce que tu audites ou écris | Charger | Poids |
|---|---|---|
| `SKILL.md`, `CLAUDE.md`, `AGENTS.md`, commande markdown, définition de sous-agent, description d'outil MCP | `grid-agent.md` | ~9 Ko |
| Prompt assemblé dans du code : appel d'API, system prompt applicatif, schéma de sortie, few-shots, injection de contexte | `grid-app.md` | ~9 Ko |
| Les deux (une phase qui touche les deux familles) | les deux, en deux passes séparées | |

## Règles

1. **Une famille, une grille.** Le verdict d'une famille ne se prononce jamais sur les critères de l'autre.
2. **Une seule profondeur de référence.** Ces deux fichiers ne renvoient à aucun troisième fichier :
   au-delà d'un niveau, l'agent lit en `head -100` et récupère de l'information incomplète.
3. **Mesure d'abord.** Les checks déterministes en fin de grille tournent avant tout jugement.
   Un item non mesurable est jugé, pas deviné, et il est marqué comme tel dans le rapport.
4. **`[M]` prime sur `[R]`.** Un item appuyé par une mesure publiée pèse plus qu'une recommandation
   d'éditeur. Un item `[R]` ne justifie jamais un CRITICAL à lui seul.
5. Le contrat du projet prime sur ces grilles en cas de conflit (`CLAUDE.md` du projet,
   `.planning/` du projet). Ces fichiers sont une source de savoir, pas d'autorité.

## Source

Les deux grilles sont distillées de deux recherches deep du 31 août 2026 : un volet instruction
d'agent multi-fournisseurs (18 anti-patterns, 13 checks déterministes) et un volet applicatif
mesuré sur un pipeline Mistral (caching, sorties structurées, injection de graphe, éval).

Ces rapports sont de la **matière première locale, non livrée avec le système** (`.planning/research/`
est gitignoré côté repo SE) : ce qui doit voyager est ici, dans les grilles. Les chiffres cités dans
`grid-agent.md` et `grid-app.md` sont donc autoportants et se relisent sans le rapport d'origine.

Toute mise à jour d'une grille cite sa mesure. Une règle sans mesure ni source d'éditeur ne rentre pas.
