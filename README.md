<div align="center">

# ⚡ Simple & Efficace

**Un système de pilotage de développement pour Claude Code.**
Lourd quand il faut, invisible le reste du temps. Propre par mécanique, pas par vigilance.

`skills` · `agents` · `hooks` · `cycle GSD enrichi` · `garde-fous automatiques`

</div>

---

## C'est quoi ?

Simple & Efficace est une configuration complète pour [Claude Code](https://claude.com/claude-code) : un ensemble de **skills**, **sous-agents** et **hooks** qui transforment l'assistant en une vraie chaîne de production logicielle — du démarrage de projet jusqu'au ship, avec des garde-fous qui *garantissent* la qualité au lieu de l'espérer.

Le principe fondateur : **ce qui DOIT arriver ne dépend pas de la mémoire de Claude.** Ce qui est obligatoire (humaniser le contenu user-facing, respecter le design-system, éviter le code mort) devient un **garde-fou mécanique** — un hook que le harness exécute, qu'on ne peut ni oublier ni contourner. Ce qui relève du jugement (challenger une idée, trancher une archi) reste un **skill riche**.

> Pensé pour une stack **Next.js 15 · Tailwind · Railway · Postgres/Supabase · Prisma · Vitest · Playwright**, mais le cœur est projet-agnostique.

---

## Les 5 strates

```
┌─ A · GARDE-FOUS (hooks, mécaniques, invisibles) ───────────────────┐
│  Du code que le harness exécute. Ne peut être ni oublié ni contourné.│
│  humanizer · ui · hardcode · hygiène · monolithe · sécurité (advisory)│
│  size-gate · slop-gate · secret-gate (bloquants)                     │
└───────────────────────────────┬──────────────────────────────────────┘
┌─ B · COFONDATEUR (/se-pilot) ─────┴──────────────────────────────────────┐
│  Sparring, challenge, vision. Routeur mince : la plomberie est lazy.   │
└───────────────────────────────┬──────────────────────────────────────┘
┌─ C · CYCLE DE PHASE (GSD enrichi) ────────────────────────────────────┐
│  scout → discuss → research → plan(+TDD) → execute →                  │
│  verify → SIMPLIFY → JANITOR → SECURITY → ship                        │
└───────────────────────────────┬──────────────────────────────────────┘
┌─ D · MOTEURS PARTAGÉS ─────────┴──────────────────────────────────────┐
│  recherche 4 niveaux (code · web · scientifique · projets)            │
│  banques de règles : design-system · ui-rules · slop-rules            │
└───────────────────────────────┬──────────────────────────────────────┘
┌─ E · SPÉCIALISTES ─────────────┴──────────────────────────────────────┐
│  UX (personas) · UI · Humanizer · skills dev · marketing              │
└───────────────────────────────────────────────────────────────────────┘
```

---

## Ce que ça apporte concrètement

| Tu fais… | Le système fait… |
|---|---|
| Tu ouvres `/se-pilot` | Un cofondateur qui te challenge, instantané et léger |
| Tu démarres un projet `/se-new-project` | pilot → brainstorm → PRD → recherches → roadmap |
| Tu écris un email/landing | Le hook **réclame `/se-humanizer`** ; le commit **refuse** le contenu AI-slop |
| Tu touches un composant | Le hook **rappelle le design-system** et souffle les écarts |
| Tu hardcodes une valeur | Le hook le **signale** (no magic values) |
| Tu hardcodes une clé API | Le hook le signale à l'édition ; le **secret-gate refuse le commit** |
| Tu codes une route API sans Zod | Le hook **security-guard** te le rappelle |
| Une phase se termine | **simplify + janitor + security** passent en gate avant le ship |
| `STATE.md` gonfle | Le **size-gate bloque** à 150 lignes — fini les fichiers de 10 000 lignes |

---

## Installation

Le repo **est** un projet Claude Code prêt à l'emploi : skills, hooks et contrats sont au niveau projet. Une seule dépendance globale : le moteur [GSD](https://github.com/gsd-build/get-shit-done) (installé une fois par machine), que les patches SE enrichissent.

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

C'est tout. `/se-new-project` cadre le projet (pilot → brainstorm → PRD → research → roadmap), les hooks et les gates qualité sont déjà actifs.

> Les hooks se chargent au démarrage de la session — lance `claude` après le clone.
> Après un `/gsd:update`, relance `node scripts/install-gsd-patches.cjs` (les workflows patchés sont sauvegardés en `*.orig`).
> Si tu viens de l'ancien système (skills non préfixés dans `~/.claude/commands/`) : `node scripts/prune-legacy-global.cjs --apply` archive les doublons.

---

## Anatomie du dépôt

```
.
├── CLAUDE.md          # comment ce projet est piloté (lu par Claude au démarrage)
├── .claude/
│   ├── commands/      # skills : /se-pilot /se-new-project /se-ui /se-ux /se-research /se-humanizer /se-gate-* + dev
│   │   └── pilot/     # sous-skills lazy du pilot (briefing, closure, strategic-discussion)
│   ├── agents/        # sous-agent researcher (les agents gsd-* enrichis vivent dans gsd-patches/)
│   └── settings.json  # câblage des hooks (niveau projet)
├── hooks/             # garde-fous .cjs + rules/ (slop, hardcode, secrets, monolithe) — source unique
├── gsd-patches/       # workflows + agents GSD enrichis (gates SE) → appliqués au moteur global
├── scripts/           # install-gsd-patches.cjs · prune-legacy-global.cjs
├── extras/            # hors template : suite marketing My Mozaica (à installer par projet)
├── .planning/         # design-system, personas, ui-rules, conventions, config (gates actives)
└── docs/              # conception du système (SYSTEME.md, plan, specs)
```

---

## Garde-fous (Strate A)

Trois scripts câblés dans `settings.json`, dont un dispatcher qui porte six détecteurs advisory (source unique des critères dans `hooks/rules/*.json`) :

| Hook | Déclencheur | Action | Bloquant |
|------|-------------|--------|----------|
| `humanizer-guard` | édition contenu user-facing | rappel `/se-humanizer` | non |
| `ui-guard` | édition front | rappel design-system | non |
| `hardcode-guard` | code source | signale valeurs/listes en dur | non |
| `hygiene-guard` | code source | console.log / code commenté | non |
| `monolith-guard` | code source | fichier/exports trop gros | non |
| `security-guard` | code source | secrets en dur, XSS, eval, route API sans Zod | non |
| `size-gate` | écriture STATE/ROADMAP | refuse au-delà du plafond | **oui** |
| `slop-gate` | `git commit` | refuse le contenu AI-slop user-facing stagé | **oui** |
| `secret-gate` | `git commit` | refuse un diff stagé contenant un secret (clé API, token, PEM) — hook harness, insensible au `--no-verify` | **oui** |

Contrat commun : *jamais casser un tour · exit 0 sauf gate · silent fail*. Un hook qui plante ne bloque jamais ton travail. Les six premiers = un seul dispatcher (`se-guard.cjs`), testé par `node hooks/se-guard.test.cjs`.

---

## Philosophie

- **Automatique > consigne.** Un hook garantit ; une instruction espère.
- **Déterministe + LLM, croisés.** Un script objectif tranche, le modèle nuance, la synthèse signale les faux positifs.
- **Moins de scripts, plus de manuel intelligent.** Le déterministe là où il est imbattable ; le test manuel guidé pour le fonctionnel.
- **Anti-entropie par défaut.** Plafonds de taille + archivage. Rien ne gonfle sans limite.
- **Source unique.** Les critères (design, slop, hardcode) vivent dans des données lues par celui qui propose ET celui qui vérifie.

Détail complet dans [`SYSTEME.md`](SYSTEME.md).

---

## Crédits

Ce système est un travail de **cherry-picking** : il assemble et adapte le meilleur de plusieurs projets open-source remarquables. Rien n'a été réinventé là où l'existant était bon. Merci à leurs auteurs.

| Source | Auteur | Ce qu'on en a tiré |
|--------|--------|--------------------|
| [get-shit-done](https://github.com/gsd-build/get-shit-done) | gsd-build | Le moteur GSD : cycle par phases, workflows, sous-agents, checkpoints |
| [ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | nextlevelbuilder | Le format de règles UI externalisées (Do/Don't/Code/Severity), pattern MASTER+overrides |
| [impeccable](https://github.com/pbakaus/impeccable) | Paul Bakaus | Le pattern détecteur déterministe + LLM croisés, le contrat des hooks, le détecteur visuel |
| [hyperresearch](https://github.com/jordan-gibbs/hyperresearch) | Jordan Gibbs | L'orchestrateur mince + étapes lazy, les 4 APIs académiques, la méthodo de recherche |
| [humanizer](https://github.com/blader/humanizer) | Siqi Chen (blader) | La règle des clusters anti-faux-positifs + les patterns AI-slop récents |
| [claude-code-best-practice](https://github.com/shanraisshan/claude-code-best-practice) | shanraisshan | Les patterns d'orchestration, la token efficiency, la gestion de contexte |

Méthodologie humanizer basée sur [Wikipedia: Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing) (WikiProject AI Cleanup).

Construit avec [Claude Code](https://claude.com/claude-code).

---

<div align="center">
<sub>Simple & Efficace — parce qu'un bon système se voit à ce qu'il garantit, pas à ce qu'il promet.</sub>
</div>
