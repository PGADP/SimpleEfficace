<div align="center">

# ⚡ Simple & Efficace

**Un système de pilotage de développement pour Claude Code.**
Lourd quand il faut, invisible le reste du temps. Propre par mécanique, pas par vigilance.

`28 skills` · `10 garde-fous` · `84 tests` · `cycle GSD enrichi` · `loi de rangement`

</div>

---

## En 30 secondes

Tu écris du code. Le système intervient tout seul, au bon moment :

```
🛡️ se-guard sur RAPPORT-AUDIT.md (advisory, rien n'est bloqué) :
  • [placement-guard] `RAPPORT-AUDIT.md` est à la racine du repo — un .md de suivi
    n'y a pas sa place ; soit il est éphémère (réponds en chat, n'écris rien),
    soit il va dans .planning/audits/{YYYY-MM-DD}-{type}-{slug}.md (CONVENTIONS §4)
```

```
⛔ size-gate : STATE.md ferait 341 lignes (plafond 300).
   Archive le passé avant d'écrire le présent.
```

```
⛔ secret-gate : le diff stagé contient une clé API (OpenAI sk-...).
   Commit refusé. Ce hook est insensible au --no-verify.
```

Ces messages ne viennent pas d'une consigne que Claude *pourrait* suivre. Ce sont des scripts que le harness exécute.

---

## Le principe fondateur

**Ce qui DOIT arriver ne dépend pas de la mémoire de Claude.**

Ce qui est obligatoire — humaniser le contenu user-facing, respecter le design-system, ranger un rapport au bon endroit — devient un **garde-fou mécanique**, un hook qu'on ne peut ni oublier ni contourner. Ce qui relève du jugement — challenger une idée, trancher une archi — reste un **skill riche** qu'on invoque.

La conséquence pratique : après 200 heures d'usage, le repo est encore lisible. Pas parce que quelqu'un a fait le ménage, mais parce que rien n'a jamais pu se poser au mauvais endroit.

> Pensé pour une stack **Next.js 15 · Tailwind · Railway · Postgres/Supabase · Prisma · Vitest · Playwright**, mais le cœur est projet-agnostique.

---

## Les 5 strates

```
┌─ A · GARDE-FOUS (hooks, mécaniques, invisibles) ──────────────────────┐
│  humanizer · ui · hardcode · hygiène · monolithe · sécurité · placement│
│  size-gate · slop-gate · secret-gate                        (bloquants)│
└───────────────────────────────┬───────────────────────────────────────┘
┌─ B · COFONDATEUR (/se-pilot) ─┴───────────────────────────────────────┐
│  Sparring, challenge, vision. Routeur mince : la plomberie est lazy.  │
└───────────────────────────────┬───────────────────────────────────────┘
┌─ C · CYCLE DE PHASE (GSD enrichi) ────────────────────────────────────┐
│  scout → discuss → research → plan(+TDD) → execute →                  │
│  verify → SIMPLIFY → JANITOR → SECURITY → checkpoint visuel → ship    │
└───────────────────────────────┬───────────────────────────────────────┘
┌─ D · MOTEURS PARTAGÉS ────────┴───────────────────────────────────────┐
│  recherche 4 niveaux (code · web · scientifique · projets)            │
│  banques de règles : ui-rules (10 piliers, 36 règles) · slop · secrets│
│  · hardcode · monolithe · placement          — toutes en JSON, lisibles│
└───────────────────────────────┬───────────────────────────────────────┘
┌─ E · SPÉCIALISTES ────────────┴───────────────────────────────────────┐
│  UX (personas + parcours E2E) · UI (mesuré, pas jugé à l'œil)         │
│  Humanizer · skills dev (dev, review, test, debug, deploy…)           │
└───────────────────────────────────────────────────────────────────────┘
```

---

## Ce que ça change concrètement

| Tu fais… | Le système fait… |
|---|---|
| Tu ouvres `/se-pilot` | Un cofondateur qui te challenge, instantané et léger |
| Tu démarres `/se-new-project` | pilot → brainstorm → PRD → recherches → roadmap |
| Tu écris un email/landing | Le hook **réclame `/se-humanizer`** ; le commit **refuse** l'AI-slop |
| Tu touches un composant | Rappel du design-system, du cycle craft → critique → polish, et de la **mesure** avant livraison |
| Tu hardcodes une valeur | Le hook le signale (no magic values) |
| Tu hardcodes une clé API | Signalé à l'édition ; le **secret-gate refuse le commit** |
| Tu codes une route API sans Zod | Le hook `security-guard` te le rappelle |
| Tu poses un rapport à la racine | Le hook `placement-guard` te dit **où il va vraiment** |
| Une phase se termine | **simplify + janitor + security + checkpoint visuel** avant le ship |
| `STATE.md` gonfle | Le **size-gate bloque** à 300 lignes — fini les fichiers de 10 000 lignes |
| 5 phases sont shippées | `/se-archive` propose de les sortir du chemin de travail |

---

## Installation

Le repo **est** un projet Claude Code prêt à l'emploi : skills, hooks et contrats sont au niveau projet. Une seule dépendance globale : le moteur [GSD](https://github.com/gsd-build/get-shit-done), installé une fois par machine, que les patches SE enrichissent.

```bash
git clone https://github.com/PGADP/SimpleEfficace.git mon-projet
cd mon-projet
node scripts/install-gsd-patches.cjs   # enrichit le moteur GSD global (gates SE)
claude
```

Puis, dans Claude :

```
/se-new-project "mon idée de produit"
```

C'est tout. `/se-new-project` cadre le projet (pilot → brainstorm → PRD → research → roadmap) ; les hooks et les gates qualité sont déjà actifs.

> Les hooks se chargent au démarrage de la session — lance `claude` après le clone.
> Après un `/gsd:update`, relance `node scripts/install-gsd-patches.cjs` (les workflows patchés sont sauvegardés en `*.orig`).
> Si tu viens de l'ancien système (skills non préfixés dans `~/.claude/commands/`) : `node scripts/prune-legacy-global.cjs --apply` archive les doublons.

---

## Les skills

| Cadrage & pilotage | |
|---|---|
| `/se-pilot` | Cofondateur : sparring, challenge, orchestration du cycle |
| `/se-new-project` | Démarrage complet d'un projet vierge |
| `/se-planning` | Chef de projet : STATE/ROADMAP, briefings, arbitrages |
| `/se-research` | Recherche web approfondie (quick/deep), rapport persistant |
| `/se-brainstorm-light` · `-heavy` | 20 idées en 10 min · 60-80 idées, 61 techniques |
| `/se-archive` | Anti-entropie : sort les phases shippées du chemin de travail |

| Conception & interface | |
|---|---|
| `/se-ui` | Design-system, 10 piliers, cycle craft → critique → polish, verdict **mesuré** |
| `/se-ux` | Parcours E2E, personas, JTBD, heuristiques de Nielsen |
| `/se-humanizer` | Anti-AI-slop sur tout contenu visible par un humain |

| Développement | |
|---|---|
| `/se-plan` · `/se-dev` · `/se-fix` | Concevoir · implémenter · corriger |
| `/se-review` (+ `lint`, `perf`) · `/se-test` · `/se-debug` | Auditer · tester · investiguer |
| `/se-refactor` · `/se-janitor` · `/se-explain` | Stratégie de dette · code mort · pédagogie |
| `/se-security` · `/se-deploy` · `/se-health-check` | Audit sécu · gate GO/NO-GO · diagnostic global |
| `/se-clean-commit` | Découpe le travail en cours en commits atomiques |
| `/se-gate-simplify` · `/se-gate-janitor` | Gates du cycle : détecteur déterministe × jugement LLM |

---

## Garde-fous (Strate A)

Quatre scripts câblés dans `settings.json`, dont un dispatcher qui porte sept détecteurs advisory. Tous les critères vivent dans `hooks/rules/*.json` — source unique, lisible, modifiable sans toucher au code.

| Hook | Déclencheur | Action | Bloquant |
|------|-------------|--------|----------|
| `humanizer-guard` | contenu user-facing | rappel `/se-humanizer` (7 familles de marqueurs) | non |
| `ui-guard` | édition front | rituel design-system + mesure avant livraison | non |
| `hardcode-guard` | code source | valeurs/listes en dur | non |
| `hygiene-guard` | code source | console.log, code commenté | non |
| `monolith-guard` | code source | fichier/exports trop gros | non |
| `security-guard` | code source | secrets, XSS, eval, route API sans Zod | non |
| `placement-guard` | `.md` de suivi | fichier rangé hors de sa destination unique | non |
| `size-gate` | écriture STATE/ROADMAP | refuse au-delà de 300 lignes | **oui** |
| `slop-gate` | `git commit` | refuse le contenu AI-slop user-facing stagé | **oui** |
| `secret-gate` | `git commit` | refuse un diff contenant un secret — insensible au `--no-verify` | **oui** |

Contrat commun : *jamais casser un tour · exit 0 sauf gate · silent fail*. Un hook qui plante ne bloque jamais ton travail.

```bash
node hooks/se-guard.test.cjs     # 32 tests — détecteurs advisory
node hooks/se-gates.test.cjs     # 17 tests — gates bloquantes
node scripts/ui-verdict.test.cjs # 35 tests — moteur de verdict UI
```

---

## La loi de rangement

Un système qui produit des fichiers finit noyé sous ses propres fichiers. [`.planning/CONVENTIONS.md`](.planning/CONVENTIONS.md) est la **source unique** de l'arborescence : une destination par type d'artefact, des noms de fichiers invariants, et `placement-guard` qui alerte dès qu'un fichier dévie.

La règle qui fait le plus de différence à long terme — **un rapport ne s'écrit sur disque que s'il sera relu** :

| Durée de vie | Qui | Où |
|---|---|---|
| Éphémère (verdict consommé en séance) | `/se-review`, `/se-test`, `/se-deploy`, `/se-health-check`… | **Rien.** Chat + `TodoWrite` |
| Liée à une phase | gates SIMPLIFY, JANITOR, SECURITY, checkpoint visuel | `phases/{NN}-{slug}/CHECKPOINTS.md` — part à l'archive avec la phase |
| Transverse persistante | `/se-security` (audit complet), `/se-ux` (audit), `/gsd:ui-review` | `.planning/audits/{YYYY-MM-DD}-{type}-{slug}.md` |

Trois mécanismes d'anti-entropie complètent le dispositif : plafonds durs (`size-gate`), archivage des phases shippées (`/se-archive`, avec confirmation), et `INDEX.md` maintenu en continu à la clôture de chaque phase. On lit `INDEX.md` pour s'orienter, jamais un `grep` à l'aveugle.

---

## Anatomie du dépôt

```
.
├── CLAUDE.md            # comment ce projet est piloté (lu par Claude au démarrage)
├── .claude/
│   ├── commands/        # 25 skills /se-* (+ pilot/ : sous-skills lazy)
│   ├── agents/          # sous-agent researcher
│   └── settings.json    # câblage des hooks (niveau projet)
├── hooks/               # garde-fous .cjs + rules/*.json (source unique des critères)
├── gsd-patches/         # workflows + agents GSD enrichis → appliqués au moteur global
├── scripts/             # install-gsd-patches · prune-legacy-global · sync-design-vendors
│                        # · ui-verdict (mesure → verdict BLOCK/FLAG/PASS)
├── vendor/design/       # corpus de design vendorisés, épinglés, jamais édités à la main
├── .planning/           # CONVENTIONS (loi) · design-system · journeys · personas
│                        # · ui-rules · phases · research · audits · _archive
└── docs/                # conception du système (SYSTEME.md, specs de chantier)
```

---

## Philosophie

- **Automatique > consigne.** Un hook garantit ; une instruction espère.
- **Déterministe + LLM, croisés.** Un script objectif tranche, le modèle nuance, la synthèse signale les faux positifs.
- **On mesure, on ne juge pas à l'œil.** Le checkpoint visuel produit des métriques croisées avec `ui-rules.json`, pas une impression.
- **Anti-entropie par défaut.** Plafonds, archivage, loi de rangement. Rien ne gonfle sans limite.
- **Source unique.** Chaque critère vit dans une donnée lue par celui qui propose ET celui qui vérifie.
- **Une métrique absente ne bloque jamais.** On ne refuse pas ce qu'on n'a pas su mesurer.

Détail complet dans [`docs/SYSTEME.md`](docs/SYSTEME.md).

---

## Crédits

Ce système est un travail de **cherry-picking** : il assemble et adapte le meilleur de plusieurs projets open-source remarquables. Rien n'a été réinventé là où l'existant était bon. Merci à leurs auteurs.

| Source | Auteur | Ce qu'on en a tiré |
|--------|--------|--------------------|
| [get-shit-done](https://github.com/gsd-build/get-shit-done) | gsd-build | Le moteur GSD : cycle par phases, workflows, sous-agents, checkpoints |
| [ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | nextlevelbuilder | Le format de règles UI externalisées (Do/Don't/Code/Severity), pattern MASTER+overrides |
| [impeccable](https://github.com/pbakaus/impeccable) | Paul Bakaus | Le pattern détecteur déterministe + LLM croisés, le contrat des hooks, le détecteur visuel |
| [platform-design-skills](https://github.com/ehmo/platform-design-skills) | ehmo | Les critères de design par plateforme (web, desktop, mobile) |
| [hyperresearch](https://github.com/jordan-gibbs/hyperresearch) | Jordan Gibbs | L'orchestrateur mince + étapes lazy, les 4 APIs académiques, la méthodo de recherche |
| [humanizer](https://github.com/blader/humanizer) | Siqi Chen (blader) | La règle des clusters anti-faux-positifs + les patterns AI-slop récents |
| [claude-code-best-practice](https://github.com/shanraisshan/claude-code-best-practice) | shanraisshan | Les patterns d'orchestration, la token efficiency, la gestion de contexte |

Corpus vendorisés dans `vendor/design/` : versions épinglées dans `VERSIONS.json`, licences et attributions dans `NOTICE.md`.
Méthodologie humanizer basée sur [Wikipedia: Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing) (WikiProject AI Cleanup).

Construit avec [Claude Code](https://claude.com/claude-code).

---

<div align="center">
<sub>Simple & Efficace — parce qu'un bon système se voit à ce qu'il garantit, pas à ce qu'il promet.</sub>
</div>
