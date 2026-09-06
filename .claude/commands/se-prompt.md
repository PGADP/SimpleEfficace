---
description: Expert prompt engineering, deux modes. Mode audit (défaut) rend un verdict mesuré sur un prompt existant sans rien modifier ; mode implémentation (mot-clé fix) écrit ou refond le prompt demandé, puis se relit. Couvre les deux familles : prompt applicatif assemblé dans du code (schéma de sortie, caching, few-shots, contexte injecté) et prompt d'instruction d'agent (SKILL.md, CLAUDE.md, commande markdown, description d'outil ou de sous-agent). À utiliser dès qu'un prompt, un system prompt, une description d'outil ou un fichier d'instructions est écrit, refondu ou audité. Ne traite pas le texte lu par l'utilisateur final : c'est /se-humanizer.
---

# /se-prompt — Audit et écriture de prompts

Deux modes, un seul par invocation :

- **audit** (défaut) : lit, mesure, rend un verdict. Ne modifie aucun fichier.
- **implémentation** : écrit ou refond le prompt demandé, puis se relit en audit.

Déclenché par `/se-prompt <cible>` ou `/se-prompt audit <cible>` (audit), par
`/se-prompt fix <cible ou tâche>` (implémentation), ou automatiquement par la gate PROMPT du
cycle quand une phase ou un quick touche un prompt. Sans le mot-clé `fix`, c'est un audit :
le mode implémentation ne se devine jamais.

Frontière : le texte affiché à l'utilisateur final relève de `/se-humanizer`, l'interface relève de
`/se-ui`. Ici, seul compte ce qui est lu par un modèle.

## 1. Identifier la famille, charger une seule grille

(`~/.claude/se/references/prompt/README.md` est une doc mainteneur : ne pas la charger en séance,
la table ci-dessous suffit.)

| Cible | Charger |
|---|---|
| `SKILL.md`, `CLAUDE.md`, `AGENTS.md`, commande markdown, définition de sous-agent, description d'outil MCP | `~/.claude/se/references/prompt/grid-agent.md` |
| Prompt assemblé dans du code : appel d'API, system prompt de service, schéma de sortie, few-shots, contexte récupéré | `~/.claude/se/references/prompt/grid-app.md` |

Une cible qui relève des deux familles se traite en deux passes séparées, jamais avec une grille
hybride : les leviers ne se recouvrent pas. Le verdict d'une famille ne se prononce jamais sur les
critères de l'autre.

Lire aussi, quand ils existent, avant de juger :

- le `CLAUDE.md` du projet, qui prime sur les grilles en cas de conflit ;
- `.planning/research/` du projet, si une recherche prompt y a déjà tranché un arbitrage.

## 2. Mode audit

Ne rien écrire, ne rien lancer d'autre que des lectures. Un audit tourne en parallèle des autres
gates (loi : `~/.claude/se/CONVENTIONS.md` §11).

**2a. Cadrer le périmètre.** Nommer les fichiers audités. Sur un périmètre large (tous les prompts
d'un service, tous les skills d'un dossier), un sous-agent par famille, `model: "opus"`, dans un
seul message. Sur deux ou trois fichiers, l'audit reste inline : un aller-retour d'agent coûterait
plus que le gain.

**2b. Mesurer avant de juger.** Lancer les checks déterministes de la grille chargée. Un finding
qui contredit une mesure ne se rend pas. Un item non mesurable est jugé à la lecture et **marqué
comme tel** dans le rapport : « jugé, non mesuré ».

Sur une cible applicative, mesurer ne se fait pas sur le texte du prompt : la moitié de la grille
se juge dans le code autour de lui. Passer par `/se-scout` avant de rendre un finding, sur les
questions que le prompt seul ne tranche pas : qui assemble ce prompt et dans quel ordre, où tombe la
coupure de cache, le schéma est-il passé en strict à l'API, la preuve est-elle vérifiée en code, qui
consomme la sortie. Un finding applicatif sans `chemin:ligne` réellement lu ne se rend pas
(loi : `~/.claude/se/CONVENTIONS.md` §0).

Sur une cible d'instruction d'agent, pas de scout : la cible est le fichier lui-même. Une seule
exception, quand le fichier affirme un comportement du code (« le hook bloque le commit », « la
commande écrit dans tel dossier ») : là, `/se-scout` tranche, et le code gagne.

**2c. Juger sur la grille.** Un finding = un item de la grille + le fichier et la ligne + le
symptôme observable + le correctif. Un finding sans symptôme observable n'est pas un finding, c'est
une préférence de style : le supprimer.

Sévérité, reprise de la grille : **CRITICAL** · **MAJEUR** · **MINEUR**. La pondération
`[M]` / `[R]` est définie dans la grille chargée.

**2d. Rendre le verdict.** Forme fixe, la même que les autres gates :

```
PROMPT · {cible}                                       [audit]

Famille     instruction d'agent | applicatif
Mesuré      règles distinctes {n} · emphase {n} · CoT résiduel {n} · description {n} car.
            (ou, en applicatif : cache {oui/non} · schéma strict {oui/non} · version {oui/non})
Findings    CRITICAL {a} · MAJEUR {b} · MINEUR {c}
1. [CRITICAL] fichier:ligne · item {n} · <symptôme> · fix : <correctif>
2. [MAJEUR]   fichier:ligne · item {n} · <symptôme> · fix : <correctif>

Verdict     GO | NO-GO
Non mesuré  <ce qui exigerait un banc d'évaluation, dit au lieu d'être tranché à l'aveugle>
```

`NO-GO` dès un CRITICAL. Le verdict est **consultatif** : aucun hook ne bloque le commit sur un
prompt, l'humain tranche. Un CRITICAL laissé tel quel n'est légal qu'avec une raison écrite au
journal (§4).

**Condition d'arrêt.** Une seule passe d'audit par cible. Sur un désaccord, une seule boucle de
re-mesure, puis on rend ce qui reste et on laisse trancher.

## 3. Mode implémentation

**3a. Avant d'écrire, scouter.** `/se-scout` sur le prompt existant, ce qu'il alimente et ce qui le
consomme en aval. Ne pas empiler une couche sur un mécanisme non compris (loi : modifications
chirurgicales).

**3b. Écrire selon les invariants de la grille chargée.** Les cinq invariants applicatifs et les
trois axes d'un prompt d'agent sont dans les grilles, ils ne sont pas répétés ici : une seule source.

**3c. Se relire en mode audit**, sur le prompt qu'on vient d'écrire. Une seule boucle
réécriture → re-audit. Si le re-audit reste NO-GO, livrer quand même, avec le verdict et ce qui
n'a pas pu être corrigé : l'humain tranche, comme en audit.

**3d. Ce qui n'est pas une modification de prompt.** Si le correctif est un contrôle de sécurité,
une vérification de preuve ou une condition d'arrêt, il s'écrit en **code**, pas dans le texte du
prompt. Un invariant confié au texte seul n'en est pas un.

## 4. Où s'inscrit ce que produit cette commande

Loi de rangement : `~/.claude/se/CONVENTIONS.md` §3 et §4. Une destination par nature de sortie,
et rien à inventer ailleurs.

| Ce que produit `/se-prompt` | Destination |
|---|---|
| Verdict de gate pendant une phase ou un quick | section `## Gates` de `{phase}/CHECKPOINTS.md` ou `{quick}-CHECKPOINTS.md` : ce qui a été mesuré, la réponse humaine verbatim, ce qui a été appliqué, toute exception avec sa raison écrite |
| Audit ponctuel consommé en séance | rien sur disque, réponse en chat |
| Audit complet demandé explicitement (tous les prompts d'un service, tous les skills) | `.planning/audits/{YYYY-MM-DD}-prompt-{slug}.md`, plus une ligne dans `.planning/INDEX.md` |
| Décision structurante prise en séance (découpage d'un appel, stratégie de cache, refonte d'un schéma) | `CONTEXT.md` de la phase si on est en phase, sinon `.planning/decisions/` ; jamais seulement dans le chat |
| Prompt écrit ou modifié | le fichier lui-même, dans le commit de la tâche. Le `SUMMARY.md` de la phase le mentionne comme n'importe quel changement de code |
| Une constante de version de prompt introduite | le code, et la ligne correspondante au journal de la phase |

Rien à la racine du projet, rien dans un dossier non déclaré en `CONVENTIONS.md` §2.

## 5. Bornes

Ce que cette commande ne fait pas, et qu'il ne faut pas lui demander :

- **Aucun banc d'évaluation.** Elle mesure ce qu'un grep mesure et juge le reste. La justesse
  réelle d'un routage, la spécificité d'une description et l'effet net d'une règle exigent des cas
  dorés et un traitement de la variance sur plusieurs runs. Elle le dit, elle ne le simule pas.
- **Aucun blocage.** Pas de hook de commit sur les prompts : le verdict est consultatif.
- **Aucun jugement sur le texte visible par l'utilisateur** : c'est `/se-humanizer`.
- **Aucune réécriture en mode audit.** Un audit qui modifie un fichier est une faute, pas un raccourci.
