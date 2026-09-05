# Conventions du système — loi de rangement et de nommage

> **Source unique.** Ce document fait autorité sur l'arborescence. `docs/SYSTEME.md` ne la duplique pas, il pointe ici.
> Lu par les hooks (`placement-guard`, `size-gate`) et par tous les skills.
> But : tout est rangé et lié, **jamais greppé**. Une destination unique par type d'artefact.

---

## 1. La carte (anti-grep)

`INDEX.md` est la carte de tout. On le lit pour s'orienter, jamais une recherche à l'aveugle.
Il est **maintenu en continu** par le step `update_planning_index` du workflow `execute-phase`, pas à la main (sinon il pourrit).

## 2. L'arborescence

```
.planning/
├── INDEX.md              carte de tout
├── STATE.md              présent only, ≤ 500 lignes / 33 000 car. / 300 car. par ligne (size-gate)
├── ROADMAP.md            phases à venir + en cours (3 horizons), mêmes plafonds (size-gate)
├── PHASES.md             registre des phases et quicks LIVRÉS, une ligne par entrée, sans plafond
├── STRATEGY.md           vision, deadlines business
├── STRATEGY-ARCHIVE.md   décisions stratégiques sorties de STRATEGY.md
├── PROJECT.md            description produit + Key Decisions
├── PRD.md                cahier des charges initial
├── REQUIREMENTS.md       exigences du milestone courant
├── MILESTONES.md         historique des milestones
├── RETROSPECTIVE.md      leçons transverses
├── CONVENTIONS.md        ce fichier
├── config.json           toggles du cycle GSD
├── HANDOFF.json          état de session en pause (/gsd-pause-work), effacé à la reprise
├── ARCHIVE.log           journal append-only des archivages (/se-archive)
│
├── phases/               phases ACTIVES uniquement
├── research/             recherches transverses
├── audits/               rapports d'audit transverses persistants
├── brainstorming/        sessions /se-brainstorm-*
├── design/               design-system, personas, journeys, templates Playwright
├── rules/                banques de règles typées (JSON)
├── codebase/             cartographie /gsd-map-codebase
├── debug/                sessions de debug (+ resolved/)
├── decisions/            décisions techniques isolées (si le cycle en produit)
├── todos/                capture zéro-friction (pending/ + done/)
├── _templates/           gabarits du système
└── _archive/             tout le validé migre ici
    ├── milestones/{vX.Y}/
    ├── phases/{NN}-{slug}/
    ├── research/
    └── audits/
```

**Rien à la racine de `.planning/` hors de la liste ci-dessus.** Tout nouveau dossier doit d'abord être déclaré ici (et dans `hooks/rules/placement-rules.json`), sinon `placement-guard` alerte.

**Surcharge par projet** : un projet peut déclarer ses dossiers légitimes supplémentaires dans `.planning/rules/placement-overrides.json` (fusion additive avec la banque globale, mêmes clés que `placement-rules.json`). À réserver aux dossiers vivants propres au projet ; documenter chaque entrée dans le `CONVENTIONS.md` du projet.

## 3. Une destination unique par type d'artefact

| Tu cherches… | C'est ici, et nulle part ailleurs |
|---|---|
| L'état du jour | `.planning/STATE.md` |
| Les jalons / planning (à venir, en cours) | `.planning/ROADMAP.md` |
| La trace courte d'une phase ou d'un quick livré | `.planning/PHASES.md` |
| La vision / deadlines business | `.planning/STRATEGY.md` |
| La description produit + décisions | `.planning/PROJECT.md` |
| Le vocabulaire du projet (un concept, un mot) | `.planning/GLOSSARY.md` |
| Une phase active | `.planning/phases/{NN}-{slug}/` |
| Une phase terminée | `.planning/_archive/phases/{NN}-{slug}/` |
| Une recherche | `.planning/research/{YYYY-MM-DD}-{slug}.md` |
| Un audit transverse persistant | `.planning/audits/{YYYY-MM-DD}-{type}-{slug}.md` |
| Une session de brainstorming | `.planning/brainstorming/se-brainstorm-{light\|heavy}-{slug}-{YYYY-MM-DD}.md` |
| Une session de debug | `.planning/debug/{slug}.md` → `.planning/debug/resolved/` |
| La cartographie du code | `.planning/codebase/{ARCHITECTURE,STACK,STRUCTURE,…}.md` |
| Le design-system | `.planning/design/DESIGN-SYSTEM.md` |
| Les personas UX | `.planning/design/PERSONAS.md` |
| Les parcours E2E | `.planning/design/JOURNEYS.md` |
| Une banque de règles | `.planning/rules/{nom}.json` (données typées) |
| Une idée capturée | `.planning/todos/pending/` puis `done/` |
| Un handoff de session en pause | `.planning/HANDOFF.json` (machine) + `.planning/phases/{NN}-{slug}/.continue-here.md` (humain) |
| Un handoff hors phase | répertoire temporaire de l'OS, jamais dans le dépôt (`/se-handoff`) |
| Un milestone archivé | `.planning/_archive/milestones/{vX.Y}/` |
| Une spec de chantier système | `docs/_design/{NN}-{nom}.md` |
| La conception du système | `docs/SYSTEME.md` |

À la racine du repo, seuls `README.md`, `CLAUDE.md`, `AGENTS.md`, `CHANGELOG.md`, `LICENSE.md`, `CONTRIBUTING.md` sont admis. **Aucun rapport, aucune analyse, aucune note ne s'écrit à la racine.**

## 4. La règle des rapports (durée de vie)

Un rapport ne s'écrit sur disque **que s'il sera relu**. Trois classes, une destination par classe :

| Classe | Qui | Où |
|---|---|---|
| **Éphémère** — verdict consommé en séance | `/se-review`, `/se-test`, `/se-deploy`, `/se-health-check`, `/se-fix`, `/se-plan`, `/se-explain`, `/se-refactor` | **Rien sur disque.** Réponse en chat + `TodoWrite`. Fichier seulement si l'utilisateur le demande explicitement → `.planning/audits/` |
| **Liée à une phase** | gates SIMPLIFY / JANITOR / SECURITY / PROMPT / visuel, `/se-debug` en phase | `.planning/phases/{NN}-{slug}/CHECKPOINTS.md` — part à l'archive avec la phase |
| **Transverse persistante** | `/se-security` (audit complet), `/se-ux` (audit), `/gsd-ui-review`, `/se-prompt` (audit complet), `/se-refactor` (stratégie globale demandée) | `.planning/audits/{YYYY-MM-DD}-{type}-{slug}.md` |

`{type}` ∈ `security` · `ux` · `ui` · `prompt` · `refactor` · `review` · `health`.

Pourquoi pas un dossier par type : trois dossiers à trois fichiers, c'est de l'entropie. Un dossier unique trié par date se lit d'un `ls`.

## 5. Nommage des phases

- Dossier : `{NN}-{slug-kebab-case}/` — NN sur 2-3 chiffres, slug court en anglais.
- Insertion urgente : décimale `{72.1}-...` sans renuméroter la suite.
- Backlog : `999.x-...`.
- Archive : miroir exact sous `_archive/phases/`.

## 6. Nommage des fichiers DANS une phase (FIXES, MAJUSCULES)

Noms invariants pour qu'un parser les trouve sans grep :

| Fichier | Contenu |
|---|---|
| `CONTEXT.md` | décisions figées par DISCUSS |
| `RESEARCH.md` | recherche de la phase |
| `PLAN.md` | tâches, vagues, dépendances |
| `SUMMARY.md` | ce qui a réellement été fait |
| `VERIFICATION.md` | vérif goal-backward |
| `UI-SPEC.md` | contrat de design (si front) |
| `CHECKPOINTS.md` | journal des gates (simplify, janitor, security, visuel) + verdicts |

Les workflows GSD préfixent : `{phase}-{plan}-PLAN.md`, `{phase}-{plan}-SUMMARY.md`. Le suffixe reste invariant.

### Fichier d'état transitoire

Un dossier de phase accepte **un seul** nom hors de cette table : `.continue-here.md`, le handoff humain écrit par `/gsd-pause-work` et relu par `/gsd-resume-work`.

Ce n'est pas un onzième artefact de phase, c'est une autre classe. Les noms MAJUSCULES ci-dessus sont des produits durables : ils partent à l'archive avec la phase. Celui-là est un état de session, consommé à la reprise. Le point et les minuscules signalent cette différence, ce n'est pas une entorse.

Règles : nom exact, aucun préfixe `{phase}-{plan}-` toléré, un seul par dossier de phase. À la reprise il est périmé, donc on le supprime au lieu de le laisser voyager jusqu'à `_archive/`.

Déclaré dans `hooks/rules/placement-rules.json` sous `phaseTransientAllow`, surchargeable par projet.

## 7. Anti-entropie (plafonds DURS)

`STATE.md` et `ROADMAP.md` ont trois plafonds, tous tenus par `size-gate` :

| Plafond | Valeur | Pourquoi |
|---|---|---|
| Lignes | 500 | La mesure historique. |
| Caractères | 33 000 | Le compte de lignes se contourne : 500 lignes de 1000 caractères coûtent autant que 5000 lignes normales. C'est le coût de contexte réel. |
| Largeur d'une ligne | 300 | Attrape le paragraphe entassé sur une ligne. **Les lignes de tableau markdown en sont exemptées** : leur largeur est mécanique, la contraindre reviendrait à interdire les tableaux. |

`PHASES.md` n'a **pas** de plafond : c'est le registre append-only des phases et quicks livrés, une ligne courte par entrée. Il grandit avec le projet, c'est sa fonction. Le format d'une entrée est fixé dans son en-tête de template (scaffold).

Deux règles de fonctionnement :

- **Seule l'aggravation est refusée.** Un fichier déjà hors plafond (projet antérieur à la règle) reste modifiable tant que l'écriture ne l'alourdit pas. Sans cela, le gate bloquerait l'étape de `/se-archive` qui vient précisément l'assainir.
- **Les CR ne comptent pas.** Un fichier en CRLF n'est pas plafonné plus sévèrement que le même fichier en LF.

Le reste :

- `STATE.md` : présent only. `ROADMAP.md` : horizon court détaillé, moyen+long en une ligne, phases à venir et en cours UNIQUEMENT (le livré vit dans `PHASES.md`).
- Phase `complete` + `SUMMARY.md` → migrée en `_archive/phases/` par `/se-archive`. `phases/` ne contient QUE l'actif, et la phase sort de `ROADMAP.md` en laissant UNE ligne d'empreinte dans `PHASES.md` plus une entrée dans `INDEX.md`. Déplacer sans laisser ces deux traces rend la phase introuvable.
- `research/` et `audits/` de plus d'un milestone → `_archive/research/`, `_archive/audits/`.
- Binaires (screenshots) : jamais commités (cf. `.gitignore`).

## 8. Langue

- Contenu user-facing et `.md` de suivi : **français**.
- Code, noms de fichiers, commandes, termes techniques : **anglais**.
- Commentaires de code : anglais.

## 9. Modèle des agents (règle DURE)

**Aucune règle globale de modèle.** Pas de `CLAUDE_CODE_SUBAGENT_MODEL` dans les settings : une variable d'environnement qui s'applique à tout downgrade en silence des agents dont la tâche demande du raisonnement.

Chaque agent porte son modèle, à deux endroits qui doivent rester d'accord :

- **Définition d'agent** (`~/.claude/agents/*.md`) : `model:` obligatoire dans le frontmatter.
- **Skill qui spawne un agent générique** (sans `subagent_type` dédié) : `model` explicite dans l'appel au tool Agent.

Pour les agents GSD, le modèle passé au spawn est résolu par gsd-core depuis `.planning/config.json` : `models` (par type de phase) puis `model_overrides` (par agent), qui **écrasent** le frontmatter. La politique SE vit dans le scaffold (`scaffold/.planning/config.json`) : opus partout où l'agent raisonne, sonnet pour la synthèse et la cartographie. Référence : `~/.claude/gsd-core/references/model-profiles.md`.

Le choix du tier :

| Tier | Quand | Exemples |
|------|-------|----------|
| `opus` | Décision, jugement, conception, audit, debug — le défaut | planner, plan-checker, roadmapper, executor, verifier, debugger, researchers, ui-*, sous-agents de `/se-review` |
| `sonnet` | Travail mécanique : exploration en volume, agrégation d'output déjà produit, scoring sur grille fixe | codebase-mapper, research-synthesizer, user-profiler |

`haiku` n'est le modèle d'aucun agent. Un agent absent de la table retombe sur `sonnet`, jamais plus bas.

## 10. Stack par défaut (cf. SYSTEME.md §12)

Next.js 15 · React 19 · TS strict · Tailwind · Railway · Postgres (Railway/Supabase) · Prisma · Vitest · Playwright (E2E/visuel) · Zod · Auth Supabase ou BetterAuth.

## 11. Parallélisation (règle DURE)

Le temps d'attente d'une phase vient surtout de ce qui s'exécute en file alors que rien ne l'y oblige. La règle tient en une ligne : **ce qui lit part ensemble, ce qui écrit part en file.**

| Nature du travail | Comment |
|---|---|
| Lecture, analyse, audit, mesure, recherche (aucun fichier touché) | **En parallèle, dans un seul message.** Un appel par angle, jamais un agent unique qui fait tout. |
| Écriture de code | Séquentiel, ou en vagues GSD à `files_modified` disjoints. Deux agents sur un même fichier coûtent plus cher que le temps gagné. |
| Application d'un fix validé | Séquentiel, après le GO. |

Trois conséquences :

- **Un checkpoint par groupe, pas par analyse.** Trois gates lancées ensemble rendent un seul bloc à trois sections (`/se-checkpoint`, règle 6). Le vrai coût n'est pas le temps machine, c'est le nombre de fois où l'humain est réveillé pour le même diff.
- **Chaque agent spawné nomme son modèle** (§9) : `sonnet` pour une lecture mécanique, `opus` dès qu'il faut juger.
- **Un skill invoqué en mode rapport n'écrit rien.** Il tourne à côté d'autres lectures : y écrire un fichier ou y lancer un build est une faute, pas un raccourci.

Anti-pattern à ne pas réintroduire : une suite d'étapes numérotées qui appellent chacune un skill de lecture et attendent sa réponse avant de passer à la suivante.

## 12. Commandes : qui lance quoi (règle DURE)

Une commande qui se termine seule ne laisse rien derrière elle. Un process qui survit à la commande, si.

| Type | Qui lance | Pourquoi |
|---|---|---|
| Éphémère : build, type-check, lint, tests, Playwright, migration de dev, git | **Claude** | Elle rend la main, rien ne survit. |
| Process long : dev server, worker, queue, tunnel, docker compose | **L'humain**, dans son terminal | Claude le perd de vue dès le tour suivant. Il ne le tue jamais, le port reste pris, et les orphelins s'empilent. |

Quand Claude a besoin d'un process long, il ne le lance pas : il donne la commande en **un bloc copiable d'une ligne**, seule sur sa ligne, et attend. Une fois par session, pas une fois par checkpoint.

Deux exceptions, pas une de plus :

- **Playwright** lance et tue son serveur lui-même (`webServer` dans la config, `reuseExistingServer` réutilise celui de l'humain s'il tourne déjà). C'est le mécanisme natif, on ne le double pas.
- **Un flux autonome** qui doit vraiment démarrer un serveur passe par `se-serve.cjs`, jamais par `run_in_background` ni par un `&`. Le PID est enregistré, donc le process reste tuable, et le hook `se-server-reaper` (SessionEnd) tue ce qui reste quand la session se termine.

```bash
node "$HOME/.claude/se/scripts/se-serve.cjs" start dev --cmd "npm run dev" --url http://localhost:3000 --wait
node "$HOME/.claude/se/scripts/se-serve.cjs" status
node "$HOME/.claude/se/scripts/se-serve.cjs" stop dev        # ou --all
```

## 13. Loi de branche (règle DURE)

> **Source unique.** Aucun skill ne recopie cette section, tous y renvoient.
> Deux hooks la font respecter : `se-branch-gate` (bloquant) et `se-branch-sweep` (annonce).

Quatre règles, dans cet ordre :

1. **Une phase égale une branche** `feat/{NN}-{slug}`, forkée d'un `origin/main` frais, créée au premier commit de la phase. Un quick suit la même loi en `fix/{slug}`.
2. **Rien ne se commite sur `main`, `master` ni `production`.** Un `main` local ne fait que recopier `origin/main` (`git switch main && git pull --ff-only`). `production` ne reçoit que du fast-forward depuis `main`.
3. **Une branche égale une PR. Un chat égale un dossier.**
4. **La branche meurt à la fusion**, et son worktree avec elle.

### Pourquoi un hook et pas une consigne

Une règle écrite dans 29 skills est une règle que le modèle peut oublier. `se-branch-gate` est un hook du harness : il voit la commande avant exécution, donc `--no-verify` ne le contourne pas. Il n'interdit pas ce flag pour autant, les exécuteurs parallèles s'en servent volontairement pour éviter la contention des hooks entre worktrees.

Il laisse passer sans rien dire ce qui n'a pas de nom de branche stable : HEAD détachée, rebase, merge, cherry-pick, revert ou bisect en cours. Il avertit sans bloquer quand la session change de branche en route : `--amend`, hotfix décidé en séance et changement assumé sont trop fréquents pour un refus.

Désactivation par projet : `workflow.branch_gate: false` dans `.planning/config.json`.

### Un chat, un dossier

Git ne garde **qu'un HEAD par dossier**. Deux chats ouverts sur le même répertoire partagent la même branche courante : le `git switch` de l'un déplace l'autre. Le branchement seul n'y change rien, seul le worktree sépare vraiment.

```bash
git worktree add ../projet-241 -b feat/241-mon-sujet origin/main
git worktree remove ../projet-241        # après la fusion
```

Ce que le worktree n'apporte pas et qu'il faut refaire dans chaque dossier : les dépendances (`node_modules` n'est pas suivi par git), le `.env` (gitignoré), et un port ou une base distincts si deux agents tournent en même temps. Une branche ne peut vivre que dans un seul worktree à la fois.

### Fermer les branches

`se-branch-sweep` tourne au démarrage de session. `git branch --merged` ne suffit pas : un squash-merge ou un rebase-merge GitHub réécrit les SHA et la branche reste vue comme non fusionnée pour toujours. Le balayage croise donc quatre signaux, du plus autoritaire au plus faible : PR fusionnée (`gh`), merge commit, patchs déjà en amont (`git cherry`), squash reconstruit par `commit-tree`.

Il **annonce** par défaut et ne supprime rien. Le nettoyage automatique s'active par `workflow.branch_sweep: true`. Chaque SHA supprimé part dans `ARCHIVE.log` avant la suppression, parce que supprimer une branche détruit son reflog.

### La taille d'une PR

Une phase qui dépasse **2 000 lignes de code** ne se relit plus : elle se coupe en deux phases au planning, jamais après coup. Le seuil ne compte que le code, `.planning/` et `docs/` en sont exclus.
