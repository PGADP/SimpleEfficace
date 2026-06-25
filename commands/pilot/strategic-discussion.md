---
name: pilot:strategic-discussion
description: Sous-skill du Pilot — discussion stratégique de phase. Recherche code, débat vision (méthode Rodin/steelmanning), produit CONTEXT.md au standard GSD. Chargé à la demande par /pilot quand "on discute la phase X". Non destiné à l'invocation directe.
user-invocable: false
allowed-tools:
  - Skill
  - Read
  - Grep
  - Glob
  - Edit
  - Write
  - Bash
---

# Pilot — Discussion stratégique de phase

Procédure lourde du Mode 4, chargée à la demande. Le Pilot ajoute une couche top-down (vision, compromis, ambition) à `/gsd:discuss-phase`, puis traduit le débat en CONTEXT.md standard GSD.

## Étape 1 : Recherche préalable (OBLIGATOIRE, silencieuse)
Avant toute question, explorer en parallèle (agents Explore ou calls directs) :
1. **ROADMAP.md** — goal, requirements, scope de la phase.
2. **Phases antérieures** — CONTEXT/SUMMARY/VERIFICATION récents pour l'état actuel du produit.
3. **Code existant** — Grep/Glob les composants/services/routes concernés ; lire les fichiers clés (patterns, limites, dette) ; identifier réutilisable vs à créer.
4. **STRATEGY.md** — priorités business et contraintes.

## Étape 1.5 : Réflexion profonde (si décision lourde)
Si archi / refactoring structurel / pivot / choix irréversible : raisonner en profondeur AVANT de questionner, présenter 2-3 options réalistes avec trade-offs + recommandation argumentée. Sinon SKIP.

## Étape 2 : Cadrage stratégique (~10 lignes)
```
## Phase X : [Nom]
**Ce que je comprends** : [ce que la phase doit livrer]
**Etat du code** : [existe / manque / patterns]
**Enjeu business** : [pourquoi ça compte]
**Tension principale** : [le compromis central]
```

## Étape 3 : Débat stratégique (3-5 questions max, VISION pas technique)
Questions type : niveau d'ambition (MVP vs complet) ? critique pour le lancement ? entre A et B lequel a le plus de valeur ? qu'est-ce qui te ferait dire "c'est raté" ? une référence qui t'inspire ?
Ne PAS demander : choix de libs, patterns techniques, détails d'implémentation, ce que le code dit déjà.

### Rigueur (méthode Rodin)
- **Steelmanning obligatoire** : reformuler la position adverse dans sa forme la plus forte avant de trancher.
- **Classification** : ✓ correct · ~ contestable · ⚡ simplification · ◐ angle mort · ✗ faux. Utiliser quand ça clarifie une décision.
- **Pendant le débat** : continuer à chercher dans le code pour challenger avec des faits.
- **Anti-complaisance** : si 3 validations consécutives sans objection, s'arrêter et chercher la faille.

## Étape 4 : Synthèse
```
## Decisions strategiques
### Vision / ### Compromis acceptes / ### Criteres de succes (utilisateur)
### References / ### Elements techniques identifies (code reutilisable, limites, patterns)
```
Confirmer : "Ca capture bien notre discussion. Je lance la formalisation GSD ?"

## Étape 5 : Production du CONTEXT.md (standard GSD strict)
Écrire directement le CONTEXT.md. Mapping : vision→`<decisions>`, compromis→`<decisions>`+`<deferred>`, références→`<specifics>`, technique→`<decisions>` "Contraintes techniques identifiees", critères de succès→`<domain>`.

Format obligatoire :
```markdown
# Phase [X]: [Name] - Context

**Gathered:** [date]
**Status:** Ready for planning
**Source:** Pilot strategic discussion

<domain>
## Phase Boundary
[Scope ROADMAP + criteres de succes enrichis]
</domain>

<decisions>
## Implementation Decisions
### [Categorie 1] / ### [Categorie 2]
### Contraintes techniques identifiees
### Claude's Discretion
</decisions>

<specifics>
## Specific Ideas
</specifics>

<deferred>
## Deferred Ideas
</deferred>

---
*Phase: XX-name*
*Context gathered: [date]*
```

## Étape 6 : Commit + suite
```bash
node ./.claude/get-shit-done/bin/gsd-tools.js commit "docs(${padded_phase}): capture phase context (pilot discussion)" --files "${phase_dir}/${padded_phase}-CONTEXT.md"
```
Puis : "Prochaine étape : /gsd:plan-phase X. /clear d'abord → contexte frais pour le planner."

## Règles
1. Recherche code OBLIGATOIRE — jamais de débat à vide.
2. Max 5 questions. 3. Le Pilot tranche si hésitation. 4. Pas de re-ask. 5. CONTEXT.md au standard GSD strict. 6. Pas d'appel à /gsd:discuss-phase. 7. Anti-complaisance active. 8. Steelmanning avant de trancher. 9. Pas de validation molle.
