# Loi de branche — contexte du chantier

> Spec de chantier système. Écrite avant implémentation, validée par Paul, exécutée en 7 phases.
> Statut : **en attente de GO**. Rien n'est écrit tant que ce document n'est pas validé.

---

## 1. Le problème, mesuré

Sur mymozaica, au 2026-09-01 :

| Constat | Mesure |
|---|---|
| Commits déposés sur `main` local, non poussables en PR | 173 |
| Branche courante `fix/interview-double-question` | 382 commits, 862 fichiers, 97 000 lignes |
| Branche `feat/126.4-le-banc-apprend-a-voir` | 179 commits, 303 fichiers, 65 000 lignes |
| Branches `worktree-agent-*` jamais supprimées | 23 |
| Worktrees d'agents abandonnés | 25 |

Aucune de ces branches n'est relisable, donc aucune n'a jamais donné lieu à une PR, donc `main`
local a servi de dépotoir. Les gates de qualité (SIMPLIFY, JANITOR, SECURITY, `/se-review`)
tournent sur ces diffs : à cette taille elles ne trouvent plus rien. **Le premier bénéfice du
chantier n'est pas l'hygiène git, c'est de rendre la review possible.**

### La cause racine

`branching_strategy` vaut `"none"` par défaut dans gsd-core
(`gsd-core/references/planning-config.md:12`) et `scaffold/.planning/config.json` ne déclare
aucune clé `git`. L'étape `handle_branching` d'`execute-phase` est donc sautée, et tout commit
tombe sur la branche courante, quelle qu'elle soit.

Ce n'est **pas** un manque de consigne dans les skills : aucun skill du cycle n'a besoin de
savoir créer une branche, le moteur sait le faire. Il est éteint.

---

## 2. La loi

1. **Une phase égale une branche** `feat/{NN}-{slug}`, forkée d'un `origin/main` frais, créée au
   premier commit de la phase.
2. **Rien ne se commite sur `main`, `master` ni `production`.** Un `main` local ne fait que
   recopier `origin/main`. `production` ne reçoit que du fast-forward depuis `main`.
3. **Une branche égale une PR. Un chat égale un dossier.**
4. **La branche meurt à la fusion**, et son worktree avec elle.

Cette loi vit à **un seul endroit normatif** : `CONVENTIONS.md` §13. Les autres documents y
renvoient, ils ne la recopient pas. Un garde-fou mécanique la fait respecter, parce qu'une
consigne écrite dans 29 skills est une consigne que le modèle peut ignorer.

---

## 3. Les décisions tranchées, et pourquoi

### 3.1 L'unité de PR est la phase, pas le plan

Mesure des scopes de commit sur mymozaica :

| Unité | Volume de code (hors `.planning/` et `docs/`) |
|---|---|
| Un plan (`241.1-04`, `244-03`…) | 770 à 6 400 lignes, médiane ~1 200 |
| Une phase entière | 1 700 lignes (243) à 12 000 (241.1) |

La littérature 2026 plafonne une PR relisable à 400-500 lignes. Une phase dépasse ce seuil.
On choisit quand même la phase comme unité, pour deux raisons :

- C'est l'unité que le moteur sait déjà brancher (`branching_strategy: "phase"`). Descendre au
  plan demanderait de réécrire le branchement de gsd-core : sur-ingénierie.
- Le rythme reste tenable : 2 à 4 PR par semaine, pas vingt.

**Le levier de taille est en amont, au planning** : une phase qui dépasse ~2 000 lignes de code
se coupe en deux phases. Une phase à 12 000 lignes n'est pas une phase.

### 3.2 Le multi-chat se règle par le worktree, pas par la branche

Git ne garde **qu'un HEAD par dossier**. Deux chats ouverts sur le même répertoire partagent la
même branche courante : le `git switch` de l'un déplace l'autre. Le branchement seul aggraverait
donc le problème au lieu de le résoudre.

La règle : **un chat, un dossier**.

```bash
git worktree add ../projet-241 -b feat/241-mon-sujet origin/main
# ... travail dans ce dossier ...
git worktree remove ../projet-241
```

Pièges à documenter avec la règle : le worktree ne checkout que les fichiers suivis, donc
`node_modules`, `.venv` et les caches sont absents et les dépendances doivent être installées
dans chaque worktree ; `.env` est gitignoré donc non copié ; les ports et bases locales entrent
en collision entre agents ; une branche ne peut vivre que dans un seul worktree à la fois.

### 3.3 Le verrou de session avertit, il ne bloque pas

Idée initiale : mémoriser la branche au premier commit, refuser tout commit ultérieur ailleurs.
Trop de faux positifs certains :

- HEAD détachée pendant un rebase ou un bisect fait renvoyer la chaîne littérale `HEAD` par
  `git rev-parse --abbrev-ref HEAD` ;
- `git commit --amend`, un hotfix décidé en séance, un changement de branche assumé ;
- le `session_id` est partagé par les sous-agents et ne survit pas forcément à un `/clear`.

On garde donc le **blocage dur sur la règle stable** (`main`, `master`, `production`), qui couvre
l'essentiel du risque, et on descend le changement de branche en cours de session à un simple
avertissement.

### 3.4 `production` déploie, `main` non

État actuel Railway (projet My Mozaïca, `7ce53d2f-…`) : un seul environnement, deux services
(`mymozaica` et `Worker-p2`) tous deux branchés sur `main`, avec `checkSuites: false`. Donc
chaque merge déploie en prod, sans même attendre que la CI GitHub soit verte.

Cible : `main` est l'intégration, toujours livrable, jamais livrée automatiquement. `production`
est une branche protégée qui déclenche le déploiement, avancée volontairement en fast-forward.

Pas de staging pour l'instant : monter un environnement supplémentaire dupliquerait les deux
services et la facture, pour un besoin que la CI et le local couvrent déjà.

Le mode de panne dominant de ce schéma est la **divergence silencieuse** : un seul commit direct
sur `production` et les deux branches ne se rejoignent plus jamais. Le garde-fou de la règle 2 le
couvre. On ajoute un tag à chaque mise en prod, pour pouvoir revenir sur un état précis.

---

## 4. Ce que le moteur fait déjà (à ne pas réécrire)

Vérifié dans `~/.claude/gsd-core/` :

| Mécanisme | Où |
|---|---|
| Fork de la branche de phase depuis `origin/main`, `--no-track`, avertissement si `main` local est en avance | `workflows/execute-phase.md:280-313` |
| Même logique pour un quick | `workflows/quick.md:208-265` |
| Création de la branche dès le premier commit d'artefact | `bin/lib/commands.cjs:1044` |
| Un worktree et une branche `worktree-agent-*` par agent, manifeste de vague | `workflows/execute-phase.md:781` |
| Merge des worktrees dans la branche de phase puis suppression, en fin de vague | `workflows/execute-phase.md:872-915` |
| Refus de lancer une vague si le cwd a dérivé dans un worktree d'agent | `workflows/execute-phase.md:477-546` |
| Push et ouverture de PR | `workflows/ship.md:184`, `:364` |
| Suppression des branches fusionnées en fin de milestone | `workflows/complete-milestone.md:829` |

**Conclusion : il n'y a presque rien à construire.** Le chantier consiste à allumer ce qui
existe, à ajouter un garde-fou mécanique, et à fermer les branches.

### Le piège à désamorcer

`scripts/install-gsd-patches.cjs:31` vise encore `~/.claude/get-shit-done/`, l'ancien moteur, et
procède par **écrasement complet du fichier**. La copie du repo
`gsd-patches/workflows/execute-phase.md` fait 1 111 lignes, contre 1 807 pour le fichier vivant :
elle ne contient ni le fork depuis `origin/main`, ni le nettoyage des worktrees. Repointer ce
script sur `gsd-core` sans le refondre réintroduirait les deux bugs d'un coup.

---

## 5. Les 7 phases

### Phase 1 — Écrire la loi, une seule fois

- `CONVENTIONS.md` : nouvelle section 13 « Loi de branche ». Les quatre règles, la règle
  « un chat, un dossier » avec ses pièges, le seuil de 2 000 lignes qui coupe une phase en deux.
- `README.md` : section « Le cycle de livraison » après « Le système au travail ». Compteur des
  garde-fous porté de 10 à 11 (deux hooks ajoutés, un seul bloquant).
- `scaffold/CLAUDE.md` : la liste des garde-fous gagne `branch-gate`, avec renvoi vers §13.
- `docs/SYSTEME.md` : pointeur vers §13, pas de recopie.

→ **vérif** : `grep -rn "Loi de branche"` trouve un seul énoncé normatif, tout le reste est un
renvoi. `node hooks/se-size-gate.test.cjs` passe (le README n'est pas plafonné, mais on vérifie
qu'aucun document de suivi ne l'est).

### Phase 2 — Le garde-fou bloquant

`hooks/se-branch-gate.cjs`, dans la chaîne PreToolUse `Bash`, à côté de `se-secret-gate`.

- Refuse `git commit`, `git merge` et `git push` quand HEAD vaut `main`, `master` ou `production`.
- Message de refus : la commande exacte pour créer la branche depuis `origin/main`.
- Avertit sans bloquer si la branche a changé depuis le premier commit de la session.
- Laisse passer sans rien dire : HEAD détachée, rebase, merge, cherry-pick, revert ou bisect en
  cours (`git rev-parse --git-path` sur `rebase-merge`, `rebase-apply`, `MERGE_HEAD`,
  `CHERRY_PICK_HEAD`, `REVERT_HEAD`, `BISECT_LOG`), dépôt sans remote, hors dépôt git.
- Contrat des hooks SE : exit 0 toujours, décision par le JSON, silent fail si le hook plante.
- **Ne pas interdire `--no-verify`** : les exécuteurs parallèles s'en servent volontairement pour
  éviter la contention des hooks entre worktrees (`execute-phase.md:242`). Le garde-fou est un
  hook du harness, que `--no-verify` n'atteint pas de toute façon.
- Le matcher reste `"matcher": "Bash"` et le hook lit la commande lui-même, comme
  `se-secret-gate` et `se-slop-gate`. Un matcher de la forme `Bash(git commit:*)` ne se
  déclencherait jamais, sans erreur visible.

Câblage ajouté dans `.claude/settings.json` du repo (source du wiring, propagée par `se install`).

→ **vérif** : `node hooks/se-branch-gate.test.cjs` (refus sur `main`, passage sur une branche de
feature, passage en rebase, passage hors dépôt), puis un vrai `git commit` refusé sur `main` dans
un dépôt jetable.

### Phase 3 — La fermeture des branches

`hooks/se-branch-sweep.cjs`, SessionStart, non bloquant, conservateur.

Détection de « branche réellement intégrée », dans cet ordre :

1. `git fetch --prune` d'abord, sinon `origin/main` est périmé et le calcul est faux ;
2. `gh pr list --head "$b" --state merged` : signal autoritaire, couvre merge, squash et rebase ;
3. repli hors ligne : `git cherry origin/main "$b"` sans ligne `+` (cas rebase), et pour le
   squash, reconstruction du commit squashé par `git commit-tree` sur le `merge-base` puis
   comparaison de patch-id ;
4. `git branch --merged origin/main` ne sert que de dernier filet : il ne voit ni squash ni
   rebase, c'est la raison pour laquelle les branches s'accumulent aujourd'hui.

Règles de sûreté :

- jamais la branche courante, jamais `main`, `master` ni `production` ;
- `git branch -d` d'abord ; `-D` seulement si la PR est confirmée fusionnée ;
- le SHA supprimé est journalisé avant suppression : supprimer une branche détruit son reflog ;
- `git worktree prune`, puis retrait des worktrees propres dont la branche est intégrée ;
- **mode annonce par défaut au premier lancement** : le balayage liste et ne supprime rien tant
  que Paul n'a pas validé la liste.

Côté GitHub, à activer une fois : suppression automatique de la branche au merge.

→ **vérif** : sur mymozaica, le balayage liste les 23 branches `worktree-agent-*` comme
candidates sans rien toucher. Puis `node hooks/se-branch-sweep.test.cjs` sur un dépôt jetable
couvrant les trois modes de fusion.

### Phase 4 — Allumer le branchement

`scaffold/.planning/config.json` gagne :

```json
"git": {
  "branching_strategy": "phase",
  "phase_branch_template": "feat/{phase}-{slug}",
  "quick_branch_template": "fix/{slug}"
}
```

Le format `feat/…` suit la convention retenue et correspond déjà aux branches existantes de
mymozaica.

Et `scripts/install-gsd-patches.cjs` est désamorcé : il ne doit plus pouvoir écraser le moteur
vivant par la copie périmée. Soit il est retiré, soit il refuse de tourner tant qu'il n'a pas été
refondu sur `gsd-core`. Décision à prendre en phase 4, pas avant.

→ **vérif** : sur un projet neuf créé par `se init`, `/gsd-execute-phase` crée bien
`feat/NN-slug` depuis `origin/main`, et non depuis le HEAD courant.

> **Dépendance.** Modifier le scaffold est sans risque : seuls les projets neufs le lisent. Mais
> **`se sync-project` ne doit pas être lancé sur un projet dont le travail en cours n'est pas
> encore sur `origin/main`.** Sinon les phases suivantes forkeraient d'une base qui ignore ce
> travail, et les agents réécriraient du code existant. Pour mymozaica, cela veut dire : annexe A
> d'abord, `se sync-project` ensuite. Voir annexe A, étape 8.

### Phase 5 — Fermer les dérives dans les skills

Les fichiers qui commitent reçoivent **une ligne de renvoi** vers §13, jamais une copie de la
règle :

`.claude/commands/pilot/closure.md:36`, `.claude/commands/se-archive.md:103`,
`.claude/commands/se-clean-commit.md`, `.claude/commands/se-migrate.md:138`,
`.claude/commands/se-deploy.md`, `gsd-patches/agents/gsd-executor.md:433`.

→ **vérif** : aucun fichier contenant `git commit` sans renvoi vers §13.
`grep -rln "git commit" .claude/commands gsd-patches | xargs grep -L "§13"` rend une liste vide.

### Phase 6 — GitHub et Railway (Paul, hors repo, 15 minutes)

1. Créer `production` à l'état actuel de `main`, la pousser.
2. GitHub : protéger `main` (PR obligatoire, CI verte) et `production` (aucun push direct,
   fast-forward seulement). Activer la suppression automatique des branches au merge.
3. Railway, projet My Mozaïca : basculer la branche source des **deux** services de `main` à
   `production`, ensemble, et activer l'attente de la CI. Séparément, le site et le worker
   divergeraient.
4. Livrer devient un geste volontaire, suivi d'un tag :

```bash
git switch production && git merge --ff-only main && git push
git tag -a v1.4.2 -m "Release" && git push origin v1.4.2
```

→ **vérif** : un merge sur `main` ne déclenche plus aucun déploiement ; un push sur `production`
en déclenche un.

### Phase 7 — La diffusion aux machines

Le système sait déjà se mettre à jour (`se.cjs:358`) : `se update` fait `git pull`, réinjecte le
câblage de `.claude/settings.json` dans celui de l'utilisateur en préservant ses hooks perso,
puis rejoue les migrations en attente. Les deux nouveaux hooks arrivent donc tout seuls.

Ce qui reste à faire :

- bump du `VERSION` et entrée `CHANGELOG.md` (c'est ce que `se update` affiche à l'utilisateur) ;
- une migration numérotée `migrations/NNN-loi-de-branche.cjs` **seulement** si la phase 4 décide
  de retirer ou neutraliser `install-gsd-patches.cjs` sur les machines déjà installées. Migration
  idempotente, jamais destructive sans filet, tout chemin sous le home passe par le paramètre
  `home` ;
- les **projets existants** ne reçoivent pas les nouvelles clés de config par `se update` : c'est
  `se sync-project` qui les ajoute, projet par projet (`se.cjs:465`). À lancer une fois dans
  mymozaica.

→ **vérif** : `node scripts/se.test.cjs` passe. Sur une installation simulée via `SE_HOME`,
`se update` injecte bien les deux hooks sans écraser un hook perso, et `se sync-project` ajoute
les clés `git.*` à un `.planning/config.json` qui ne les avait pas.

---

## 6. Hors périmètre

**Le rattrapage de mymozaica.** Chantier distinct, décrit en annexe A. Il ne fait pas partie des
7 phases, mais la phase 4 en dépend pour ce projet précis.

**Le staging.** Pas avant d'en avoir le besoin.

**La PR par plan.** Écartée en 3.1 : demanderait de réécrire le branchement de gsd-core.

---

## 7. Ordre d'exécution

Les phases 1 à 5 et 7 ne touchent pas la production et peuvent s'enchaîner. La phase 6 est
manuelle et se fait quand Paul veut. La phase 4 ne doit pas précéder la phase 2 : allumer le
branchement sans le garde-fou laisserait les chats créer des branches sans empêcher les commits
sur `main`.

Ordre retenu : **2, 3, 1, 5, 4, 7**, puis 6.

---

## Annexe A — Rattrapage de mymozaica

Chantier distinct des 7 phases, à mener sur le projet et non sur le système. Mesuré le
2026-09-05, après `git fetch` :

| Constat | Mesure |
|---|---|
| `main` local vs `origin/main` | 6 commits **en retard**, zéro en avance |
| Branche courante `fix/interview-double-question` | 401 commits d'avance sur `origin/main` |
| Commits dont le patch n'existe pas dans `origin/main` | **378 sur 401** |
| Diff réel vs `origin/main` | 919 fichiers, 111 326 insertions |
| Dont code seul (hors `.planning/` et `docs/`) | 451 fichiers, 81 525 insertions |
| Fichiers non commités dans le dossier principal | 121 |
| Worktrees avec du travail non commité | 4 |
| Branches `worktree-agent-*` | 46, dont 17 déjà intégrées |

Lecture : ce n'est pas du désordre à jeter, c'est **des mois de travail réel qui ne sont pas en
production**. `origin/main` est vivant (dernier commit 2026-09-04), donc des PR passent déjà de
temps en temps ; c'est cette branche-ci qui n'a jamais atterri.

### La procédure, dans l'ordre

**1. Geler.** Finir ou parquer ce qui tourne. Les 121 fichiers non commités et les 4 worktrees
sales : chacun commité sur sa branche, ou jeté sciemment. Rien en suspens.

**2. Poser le filet.** Taguer l'état de production actuel avant d'y toucher :

```bash
git tag -a prod-avant-rattrapage origin/main && git push origin prod-avant-rattrapage
```

**3. Rapatrier les 6 commits manquants.** `git merge origin/main` depuis la branche, résoudre les
conflits, revérifier.

**4. Prouver que ça passe.** `npm run type-check`, `npm run build`, les tests, puis `/se-deploy`
pour un verdict GO/NO-GO.

**5. Une seule PR de rattrapage.** Découper les 378 commits en PR thématiques est écarté : ils
sont entremêlés sur des mois, le cherry-pick conflicterait en continu, et la review d'un code
tourné depuis des mois n'apporte presque rien face au coût. Une PR, la CI verte, le merge. C'est
une exception assumée et datée, pas le nouveau normal.

**6. Déployer volontairement.** Une fois `production` en place (phase 6), avancer la branche,
taguer, surveiller. Le tag de l'étape 2 est le retour arrière.

**7. Balayer.** Là seulement. Une fois la grosse branche fusionnée, les 46 branches d'agents
deviennent détectables comme intégrées et le balayage les propose à la suppression. Lancé avant,
il ne verrait presque rien : leurs commits ne sont pas dans `origin/main`.

**8. Lancer `se sync-project`.** `origin/main` contient enfin tout : les clés `git.*` peuvent
arriver dans `.planning/config.json` et le branchement automatique forkera sur une base complète.

### Pourquoi cet ordre

- 7 avant 5 ne trouve rien à supprimer.
- 8 avant 5 fait forker les nouvelles phases d'une base amputée de 81 000 lignes, donc fait
  réécrire aux agents du code qui existe déjà.
- 2 après 6 supprime le seul retour arrière possible.
