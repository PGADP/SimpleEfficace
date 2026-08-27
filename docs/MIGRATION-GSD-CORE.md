# Migration get-shit-done → GSD Core

Analyse et plan de migration du moteur GSD sous Simple & Efficace.
Rédigé le 2026-08-27. État des lieux : SE 1.8.0, GSD `get-shit-done-cc` 1.29.0.

---

## 1. Constat

Le paquet npm qu'on utilise, `get-shit-done-cc`, est **déprécié** ("Package no longer supported", dernière version 1.42.3 du 16/05/2026). Le repo `gsd-build/get-shit-done` est archivé en lecture seule depuis le 26/06/2026. On tourne sur 1.29.0, soit treize versions mineures de retard sur une branche morte.

Le projet a été renommé `@opengsd/gsd-core` et continue activement : 1.11.0 le 19/08/2026, commits quotidiens, 8770 étoiles. Le compteur de version a été remis à zéro au renommage, d'où la confusion 1.42 → 1.2.

Ce n'est pas une décision de confort. C'est une sortie de branche morte.

À ne pas confondre avec `@opengsd/gsd-pi` (ex `gsd-2`), qui est un CLI autonome remplaçant Claude Code. Hors sujet pour nous : voir l'annexe.

---

## 2. Ce qui change

### 2.1 Chemin d'installation

| | Avant | Après |
|---|---|---|
| Moteur | `~/.claude/get-shit-done/` | `~/.claude/gsd-core/` |
| Workflows | `~/.claude/get-shit-done/workflows/` | `~/.claude/gsd-core/workflows/` |
| Outils | `~/.claude/get-shit-done/bin/gsd-tools.cjs` | `~/.claude/gsd-core/bin/gsd-tools.cjs` |
| Agents | `~/.claude/agents/gsd-*.md` | inchangé |
| Commandes | `~/.claude/commands/gsd/*.md` | inchangé |

Les trois cibles de `scripts/install-gsd-patches.cjs` doivent être repointées.

### 2.2 Nom des commandes

`/gsd:execute-phase` devient `/gsd-execute-phase`. Deux-points remplacé par tiret, partout. SE référence l'ancienne forme **177 fois**, dont environ 45 dans des fichiers qui nous appartiennent (le reste est dans `gsd-patches/`, qui sera régénéré depuis le nouvel upstream).

Fichiers SE les plus touchés : `.claude/commands/se-pilot.md` (20), `se-brainstorm-heavy.md` (4), `CONVENTIONS.md` (3), `pilot/strategic-discussion.md` (3).

### 2.3 Surface de commandes

71 commandes contre 55 aujourd'hui.

**Plus exposées par défaut** : `add-backlog`, `add-phase`, `add-todo`, `check-todos`, `do`, `insert-phase`, `list-phase-assumptions`, `list-workspaces`, `new-workspace`, `note`, `plan-milestone-gaps`, `plant-seed`, `remove-phase`, `remove-workspace`, `research-phase`, `session-report`, `set-profile`.

Nuance importante : la plupart de ces workflows **existent toujours** dans `gsd-core/workflows/` (add-backlog.md, plant-seed.md, note.md, insert-phase.md, session-report.md sont bien présents). Seule leur exposition en commande change selon le profil d'installation. À confirmer après installation réelle.

**Nouvelles qui recouvrent des skills SE** : `code-review`, `secure-phase`, `audit-fix`, `docs-update`, `explore`, `undo`, `spike`, `sketch`, `spec-phase`, `mvp-phase`, `ultraplan-phase`, `extract-learnings`, plus six commandes `ns-*` et deux `mempalace-*`.

C'est du recouvrement direct avec `/se-review`, `/se-security`, `/se-fix`, `/se-explain`. Il faudra arbitrer : garder la version SE (qui parle français et applique nos conventions) ou adopter l'upstream.

### 2.4 Profils d'installation

Nouveau : `--minimal` (alias `--core-only`, `--profile=core`) n'installe que 8 skills et aucun sous-agent. Le coût en contexte au démarrage passe d'environ 1200 tokens de descriptions à environ 130.

C'est notre levier contre le bloat des 71 commandes. Le profil choisi est mémorisé dans `.gsd-profile` et réappliqué à chaque `/gsd-update`.

### 2.5 Le vrai changement : les Capabilities

GSD Core expose un **système d'extension officiel**. Une capability est un dossier avec un manifeste :

```
capabilities/<id>/
  capability.json
  fragments/plan-pre.md
```

Le manifeste déclare `skills`, `agents`, `hooks`, `config`, et surtout trois mécanismes d'accroche :

- **`steps`** : injecter une étape à un point d'extension de la boucle.
- **`contributions`** : injecter un fragment de prompt dans un agent nommé (rendu comme `<contribution from="se">…</contribution>`).
- **`gates`** : vérifier une condition et bloquer ou non la progression.

Les **12 points d'extension** sont un vocabulaire fermé et additif :

`discuss:pre` · `discuss:post` · `plan:pre` · `plan:post` · `execute:pre` · `execute:wave:pre` · `execute:wave:post` · `execute:post` · `verify:pre` · `verify:post` · `ship:pre` · `ship:post`

Trois formes de vérification pour une gate :
- `query` : code déterministe first-party, peut bloquer.
- `predicate` : déclaratif (`artifact-exists`, `config-equals`…), peut bloquer.
- `agentVerdict` : évaluation LLM, **forcée en consultatif** (ne peut jamais bloquer).

Une capability tierce s'installe depuis une URL :

```bash
gsd capability install https://github.com/PGADP/gsd-cap-se.git#v1.0.0
```

### 2.6 Le patch model-profiles disparaît

`gsd-patches/lib/model-profiles.cjs` cible `~/.claude/get-shit-done/bin/lib/model-profiles.cjs`. Ce fichier **n'existe plus** dans gsd-core : la logique est passée en TypeScript compilé (`src/model-profiles.cts`, `model-resolver.cts`, `model-catalog.cts`, `install-model-override-resolver.cts`).

Bonne nouvelle : les profils de modèles sont maintenant configurables officiellement. Voir `docs/how-to/configure-model-profiles.md`. Notre patch devient une entrée de config au lieu d'un fichier écrasé.

### 2.7 Structure `.planning/` préservée

Aucune casse de ce côté. `PROJECT.md`, `ROADMAP.md`, `REQUIREMENTS.md`, `STATE.md`, `config.json`, `phases/<NN>-<slug>/<NN>-CONTEXT.md`, `<NN>-<PP>-PLAN.md`, `<NN>-VERIFICATION.md` : tout est identique, avec des ajouts optionnels (`LEARNINGS.md`, `DECISIONS-INDEX.md`, `intel/`, `onboarding/`).

`/se-archive`, `/se-planning` et le Pilot continuent de lire les mêmes fichiers.

### 2.8 Prérequis

Node >= 24, npm >= 10. Machine actuelle : Node 24.11.0, npm 11.6.1. **OK.**

---

## 3. Ce que deviennent nos 13 patches

Mesure du delta réel (fins de ligne neutralisées) entre chaque patch et sa sauvegarde `.orig` :

| Patch | Ajouts | Suppressions | Sort |
|---|---|---|---|
| `workflows/execute-phase.md` | +237 | -2 | À porter en capability |
| `workflows/quick.md` | +313 | -267 | À porter, le plus lourd |
| `workflows/ui-phase.md` | +30 | -12 | À porter |
| `workflows/new-milestone.md` | +18 | -3 | À porter |
| `workflows/new-project.md` | +8 | -8 | À porter |
| `workflows/plan-phase.md` | +1 | -1 | Trivial |
| `agents/gsd-executor.md` | +42 | -1 | → `contributions` |
| `agents/gsd-planner.md` | +40 | -1 | → `contributions` |
| `agents/gsd-phase-researcher.md` | +4 | -1 | → `contributions` |
| `workflows/execute-plan.md` | 0 | 0 | **Mort, à supprimer** |
| `agents/gsd-ui-auditor.md` | 0 | 0 | **Mort, à supprimer** |
| `agents/gsd-ui-checker.md` | 0 | 0 | **Mort, à supprimer** |
| `agents/gsd-ui-researcher.md` | 0 | 0 | **Mort, à supprimer** |

Le vrai contenu SE fait environ **700 lignes ajoutées sur 8 fichiers**. Quatre patches ne font déjà plus rien : leur contenu est identique à l'upstream, ils écrasent un fichier avec lui-même.

Ce que ces 700 lignes contiennent, concrètement :
- les gates SIMPLIFY / JANITOR / SECURITY lancées en parallèle après exécution, avec checkpoint groupé,
- le checkpoint visuel mesuré Playwright,
- la recherche des VERIFICATION.md dans `_archive/phases/`,
- les enrichissements de prompt du planner, de l'executor et du chercheur.

**Tout cela se traduit en capability.** Les gates deviennent des `gates` en `execute:post` avec `agentVerdict` (donc consultatives, ce qui correspond exactement à notre design actuel : "advisory, elles remontent, l'humain décide"). Le checkpoint visuel devient un `step` en `execute:post`. Les enrichissements d'agents deviennent des `contributions`.

C'est le point le plus important de toute cette analyse : **on passe d'un patch qui écrase des fichiers upstream à une extension déclarée.** Fini le `.orig`, fini le manifeste de hashes, fini le "réapplique après chaque update".

---

## 4. Plan d'implémentation

Cinq étapes. Chacune a son critère de vérification. Aucune ne se lance sans que la précédente soit verte.

### Étape 0 — Filet de sécurité

```bash
cp -r ~/.claude ~/.claude-backup-pre-gsd-core
```

Puis, dans SimpleEfficace : `git switch -c feat/migration-gsd-core`.

**Vérif :** `ls ~/.claude-backup-pre-gsd-core/get-shit-done/VERSION` affiche `1.29.0`.

### Étape 1 — Reconnaissance à blanc

```bash
npx -y --package=@opengsd/gsd-core@latest -- gsd-core --claude --global --dry-run
```

Le `--dry-run` imprime le plan de suppression fichier par fichier avec la raison, et sort sans rien toucher.

**Vérif sémantique :** lire la liste de suppression et confirmer qu'aucun fichier `se-*` ni aucun hook SE n'y figure. L'installeur annonce supprimer "tout fichier qui référence l'ancien nom de paquet" : nos patches en contiennent, donc ils vont sauter. C'est attendu. Ce qui ne doit pas sauter : `~/.claude/skills/se-*`, `~/.claude/commands/se-*.md`, les entrées `se-*` de `settings.json`.

**Si un fichier SE apparaît dans le plan : arrêt.** On ajuste avant d'exécuter.

### Étape 2 — Installation

```bash
npx -y --package=@opengsd/gsd-core@latest -- gsd-core --claude --global --minimal
```

`--minimal` d'abord, on élargit ensuite. Objectif : voir tourner la boucle à cinq temps avant d'ajouter la surface.

**Vérif :**

```bash
ls ~/.claude/gsd-core/workflows/execute-phase.md
```

Puis contrôler que les sept hooks SE (`se-guard`, `se-size-gate`, `se-slop-gate`, `se-ui-gate`, `se-ui-contract-gate`, `se-secret-gate`, `se-server-reaper`) sont toujours câblés dans `settings.json`. Si l'installeur les a mangés : `node se.cjs install` les remet sans toucher au reste.

### Étape 3 — Repointer et élaguer les patches

Trois modifications dans `scripts/install-gsd-patches.cjs` :

1. Chemin cible : `get-shit-done` → `gsd-core`.
2. `EXPECTED_GSD_VERSION` : `1.29.0` → la version réellement installée.
3. Retirer la cible `lib/` (model-profiles n'existe plus).

Puis supprimer les quatre patches morts : `workflows/execute-plan.md`, `agents/gsd-ui-auditor.md`, `agents/gsd-ui-checker.md`, `agents/gsd-ui-researcher.md`.

Puis, pour chacun des 8 patches restants : repartir du **nouveau** fichier upstream et y réinjecter le delta SE. Ne surtout pas copier l'ancien patch tel quel : il est bâti sur un upstream vieux de treize versions.

**Vérif :** `node scripts/install-gsd-patches.cjs` passe sans avertissement, puis `/gsd-plan-phase` sur un projet jetable produit un PLAN.md complet.

### Étape 4 — Renommer `/gsd:` en `/gsd-`

```bash
grep -rl "/gsd:" --include="*.md" --include="*.cjs" . | grep -v node_modules | grep -v "\.planning/" | xargs sed -i 's|/gsd:|/gsd-|g'
```

**Vérif :** plus aucune occurrence de `/gsd:` hors `_archive`, et les quatre suites de tests passent :

```bash
node hooks/se-guard.test.cjs && node hooks/se-gates.test.cjs && node scripts/ui-verdict.test.cjs && node scripts/se-serve.test.cjs
```

### Étape 5 — Porter les patches en capability

C'est le chantier réel, à faire **après** que les étapes 0 à 4 soient stables et commitées.

Créer `capabilities/se/capability.json` dans un repo dédié :

```json
{
  "id": "se",
  "role": "feature",
  "version": "1.0.0",
  "title": "Simple & Efficace",
  "tier": "standard",
  "engines": { "gsd": ">=1.11.0" },
  "runtimeCompat": { "supported": ["claude"], "unsupported": [] },
  "skills": ["se-gate-simplify", "se-gate-janitor", "se-security", "se-checkpoint"],
  "gates": [
    { "point": "execute:post", "blocking": false, "onError": "skip",
      "when": "se.simplify_gate",
      "check": { "agentVerdict": { "ref": { "skill": "se-gate-simplify" } } } }
  ],
  "steps": [
    { "point": "execute:post", "ref": { "skill": "se-ui" },
      "produces": ["UI-VERDICT.md"], "consumes": [], "onError": "skip" }
  ],
  "contributions": [
    { "point": "plan:pre", "into": "planner",
      "fragment": { "path": "fragments/planner-se.md" } }
  ]
}
```

Puis installer en local pour tester :

```bash
gsd capability install ./capabilities/se
```

**Vérif sémantique :** lancer une phase complète de bout en bout sur un projet jetable. Les trois gates doivent se déclencher en `execute:post`, produire un checkpoint groupé, et **zéro fichier de `~/.claude/gsd-core/` ne doit avoir été modifié**. C'est le critère qui prouve que le patch est mort et que l'extension a pris le relais.

Quand cette étape est verte : supprimer `gsd-patches/` et `scripts/install-gsd-patches.cjs`.

---

## 5. Analyse de risque

| # | Risque | Gravité | Probabilité | Parade |
|---|---|---|---|---|
| 1 | L'installeur supprime des fichiers SE ("tout fichier qui référence l'ancien nom de paquet") | Haute | Moyenne | `--dry-run` obligatoire à l'étape 1 + backup complet de `~/.claude` |
| 2 | L'installeur réécrit les hooks de `settings.json` et perd les entrées SE | Haute | Moyenne | `node se.cjs install` refusionne les hooks sans toucher aux autres (`mergeHookSettings`, déjà en place) |
| 3 | Les 8 patches ne se réappliquent pas sur un upstream vieilli de treize versions | Haute | **Élevée** | Ne pas réappliquer : reconstruire chaque patch depuis le nouveau fichier upstream |
| 4 | `model-profiles.cjs` n'existe plus, la politique modèle SE saute en silence | Moyenne | **Certaine** | Porter en config via `docs/how-to/configure-model-profiles.md`, puis vérifier qu'un spawn utilise bien le modèle attendu |
| 5 | Des commandes GSD utilisées par SE ne sont plus exposées (`note`, `plant-seed`, `add-todo`, `session-report`) | Moyenne | Moyenne | Inventaire après install ; les workflows existent toujours, seul le profil d'exposition change |
| 6 | Recouvrement des nouveaux `code-review` / `secure-phase` avec `/se-review` et `/se-security` | Basse | Certaine | `--minimal` puis élargissement choisi ; arbitrage explicite, pas subi |
| 7 | Les hooks gsd-core (`write-guard`, `read-guard`, `workflow-guard`, `prompt-guard`) entrent en conflit avec les gates SE | Moyenne | Moyenne | Test sur projet jetable avant tout usage réel ; désactivation ciblée si double blocage |
| 8 | `agentVerdict` est forcé en consultatif : une gate SE ne pourra jamais bloquer | Basse | Certaine | Correspond déjà à notre design. Pour un vrai blocage : passer par `predicate` |
| 9 | Le vocabulaire des 12 points d'extension ne couvre pas un besoin SE | Moyenne | Faible | Repli sur le patch de fichier pour ce cas précis, en gardant le reste en capability |
| 10 | Régression silencieuse sur un projet en cours pendant la migration | Haute | Faible | Migrer entre deux phases, jamais au milieu d'une phase ouverte |

**Le risque n°3 est le vrai coût du chantier.** Treize versions mineures d'écart signifient que `execute-phase.md` et `quick.md` upstream ont beaucoup bougé. Nos +237 et +313 lignes doivent être relues et réinsérées à la main, pas appliquées mécaniquement.

---

## 6. Coût et verdict

**Étapes 0 à 4** : une demi-journée. Mécanique, réversible, testée.
**Étape 5** : deux à trois jours. C'est de la conception, pas du portage.

Le raccourci existe : s'arrêter après l'étape 4 et garder les patches. On sort de la branche morte, on garde nos gates, on continue à réappliquer après chaque update. C'est un état intermédiaire acceptable, et c'est ce qu'il faut viser en premier.

L'étape 5 est ce qui rend SE durable. Un patch qui écrase des fichiers upstream casse à chaque montée de version : c'est exactement ce qui nous a laissés bloqués en 1.29.0 pendant que la branche mourait. Une capability déclarée survit aux mises à jour.

**Recommandation : faire 0 à 4 maintenant, planifier 5 comme une phase GSD à part entière.**

---

## Annexe — Pourquoi pas GSD Pi

`@opengsd/gsd-pi` (1.16.2, ex `gsd-build/gsd-2`) n'est pas une version plus récente de GSD Core. C'est un produit différent : un CLI autonome bâti sur le SDK Pi, avec son propre harnais d'agent, son propre stockage (`.gsd/` et non `.planning/`), son propre routage multi-modèles.

Il ne tourne pas dans Claude Code, il le remplace. Or Simple & Efficace **est** un système Claude Code : 40+ skills, 7 hooks, les primitifs `se-checkpoint` et `se-interview`, les commandes `/se-*`. Rien de tout cela n'a d'équivalent dans Pi.

Y aller voudrait dire réécrire le système pour une autre plateforme. La question se reposera si Pi mûrit et si on repart d'une page blanche. Pas avant.

---

## Sources

- [open-gsd/gsd-core](https://github.com/open-gsd/gsd-core) — repo actif, 1.11.0
- [gsd-build/get-shit-done](https://github.com/gsd-build/get-shit-done) — archivé le 26/06/2026
- `docs/reference/capability-manifest.md` — schéma complet, 12 points d'extension
- `docs/how-to/develop-a-capability.md` — guide de développement
- `docs/how-to/import-a-capability-from-a-url.md` — installation tierce
- `docs/how-to/install-minimal-and-add-skills.md` — profils d'installation
- `docs/how-to/configure-model-profiles.md` — remplacement de model-profiles.cjs
- `docs/cleanup-get-shit-done-cc.md` — procédure de nettoyage de l'ancien paquet
