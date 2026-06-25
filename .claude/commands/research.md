---
description: Lance une recherche approfondie sur internet via le sous-agent `researcher`. Couvre tech/archi/libs, papers académiques, recherche marketing/concurrents. Demande quick/deep au lancement, produit un fichier .planning/research/<slug>.md persistant + résumé inline tranché. Méthodologie Decompose→Plan→Search→Read→Reflect→Iterate→Synthesize→Verify (inspirée Anthropic multi-agent + hyperresearch), coverage matrix + atomic items, 4 lenses (breadth/depth/adversarial/period-pinned), required_section_headings, integrate-by-scoping vs append-as-caveat, Chain of Verification, lateral reading, structural mirror check. Usage : /research <sujet libre>. Tout l'output en français.
---

# /research — Recherche approfondie sur internet

Tu lances une recherche structurée via le sous-agent `researcher`. Ta valeur ajoutée par rapport à un simple WebSearch dans le main thread : **isolation de contexte** (le rapport et les fetches restent dans le sous-agent), **méthodologie imposée** (Decompose → Plan → Search → Read → Reflect → Iterate → Synthesize → Verify), **verdict tranché scopé** et **livrable persistant** avec coverage matrix auditable.

## Quand utiliser

✅ Bon usage :
- Décision archi structurante ("Mem0 vs Graphiti vs pgvector pour V4 analyst ?")
- Benchmark de libs/outils ("meilleure lib FR pour embeddings sémantiques 2026 ?")
- Recherche concurrents/marché ("qui sont les acteurs cadeau biographie FR ?")
- État de l'art académique ("papers récents sur RAG memory layers")
- Recherche marketing ciblée ("CRO patterns landing FR B2C 35-65 ans")

❌ Mauvais usage :
- Question simple qu'un WebSearch unique résout (juste fais le WebSearch)
- Question répondable depuis le codebase (utilise Grep/Read, pas /research)
- Question sur un sujet qu'on a déjà recherché → vérifier `.planning/research/` AVANT

## Flux

### 1. Vérifie qu'il n'y a pas déjà une recherche existante

Avant de spawner l'agent, regarde `.planning/research/` (et `.planning/strategy/` qui contient parfois des recherches archivées). Si un fichier semble proche du sujet :

- Si <2 mois : suggère à l'utilisateur de relire le fichier existant plutôt que de relancer. "On a déjà `2026-05-27-v4-analyst-decision.md` — tu veux que je le relise et te résume, ou tu veux une recherche fraîche ?"
- Si >2 mois : propose de relancer pour rafraîchir, en briefant le sous-agent sur le fichier existant.

### 2. Reformule la question si floue

Si l'argument de l'utilisateur est très flou (1-3 mots ou expression ambiguë), pose UNE question de clarification avant de spawner. Pas plus. Ex :

> "Recherche Mem0" → "Tu veux : (a) comprendre ce qu'est Mem0, (b) le comparer à d'autres libs memory, (c) audit de production-readiness ?"

Si l'argument est déjà clair → spawn direct.

### 3. Spawn le sous-agent `researcher`

Utilise le tool Agent avec `subagent_type: "researcher"`. Le prompt d'invocation doit contenir :

- **Question reformulée propre** (1 phrase)
- **Mode** si l'utilisateur l'a précisé (`quick` ou `deep`). Sinon laisse le sous-agent demander.
- **Contexte projet pertinent** : extrais 2-4 phrases de CLAUDE.md / MEMORY si la question touche au projet My Mozaica (stack, pivot en cours, contraintes connues). Le sous-agent ne voit pas la conversation.
- **Périmètre** : ce qui est dans le scope et ce qui ne l'est pas
- **Critères de succès** : à quoi ressemble une "bonne réponse" pour CE sujet
- **Fichiers de recherche déjà existants** sur sujet proche (s'il y en a) — référence + indication de relire

**Anti-pattern** : ne spawne JAMAIS avec un prompt vague type "fais une recherche sur X". Le sous-agent partira dans tous les sens et produira un rapport plat.

**Note** : le sous-agent commence systématiquement par une phase **Decompose** (atomic items + coverage matrix + required_section_headings) avant de chercher. C'est intégré à son flux, tu n'as rien à demander de plus — mais si la question contient une énumération explicite ("compare X, Y, Z"), précise-le dans le prompt d'invocation pour qu'il dérive les bons H2.

### 4. Récupère le résumé inline + le chemin du fichier

Le sous-agent renvoie un résumé ≤300 mots avec verdict tranché et le chemin du fichier `.planning/research/<slug>.md`. Tu le relaies à l'utilisateur tel quel, sans paraphraser. Si tu veux ajouter une réaction (genre "ça confirme ce qu'on disait sur X, on peut maintenant trancher Y"), tu le fais APRÈS le résumé du sous-agent, pas à la place.

### 5. Suggère une action de suivi (optionnel)

Selon le verdict :
- Verdict tranché actionnable → "On enchaîne avec une phase GSD pour implémenter ?"
- Verdict incertain avec POC recommandé → "Tu veux que je scaffolde le POC ?"
- Recherche purement informative → ne propose rien, laisse l'utilisateur digérer

## Arguments

```
/research <sujet libre>
/research deep <sujet>     # force le mode deep
/research quick <sujet>    # force le mode quick
```

Si le mode est dans l'argument, passe-le au sous-agent dans le prompt. Sinon, le sous-agent le demandera.

## Format de réponse à l'utilisateur

Une fois le sous-agent terminé, ta réponse à l'utilisateur tient en :

```
[verdict du sous-agent — relayé verbatim]

[ta réaction courte si pertinente — 1-2 lignes max]

[suggestion d'action de suivi — optionnel, 1 ligne]
```

Pas de récap de la méthode, pas de "voici ce que j'ai fait". Le main thread reste léger : le rapport est dans le fichier.

## Cas particuliers

**Recherche multi-sujets** : si l'utilisateur veut comparer 3 trucs très différents, propose de spawner 3 agents `researcher` en parallèle (un par sujet) plutôt qu'un seul agent qui fait tout. Plus économe en contexte, plus rapide, plus profond par sujet.

**Recherche urgente / contexte chargé** : si le main thread est déjà bien chargé en contexte, force le mode `deep` pour que le sous-agent absorbe la complexité au lieu de polluer le main thread.

**Pas de fichier persistant souhaité** : si l'utilisateur dit explicitement "pas besoin de fichier, juste un avis rapide" → ne lance PAS /research. Fais un WebSearch dans le main thread, c'est suffisant.

## Intégration avec /pilot

`/pilot` peut détecter qu'une question mérite une recherche profonde (décision archi, choix de lib, audit concurrent) et proposer à l'utilisateur de lancer `/research`. Dans ce cas, `/pilot` formule la question proprement puis suggère : "Je lance `/research deep <question reformulée>` ?" — l'utilisateur valide, `/pilot` invoque la commande.

Réciproquement, après une `/research` qui produit un verdict structurant, l'utilisateur peut enchaîner avec `/pilot` pour transformer le verdict en plan d'action.
