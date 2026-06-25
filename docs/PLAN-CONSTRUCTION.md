# PLAN DE CONSTRUCTION — SIMPLE & EFFICACE

> Document de référence ultra-détaillé du cherry-picking. Pour chaque chantier : **ce qu'on récupère** (et d'où exactement dans `_sources/`), puis **le plan de modification** (garder tel quel / adapter / créer / sanctuariser).
>
> Méthode : on ne recrée RIEN de zéro. ~70% est déjà sur disque. On crée vraiment de zéro seulement les hooks (sur pattern existant) et l'expert UX.
> Compagnon de [SYSTEME.md](SYSTEME.md) (la conception). Ce fichier-ci est la checklist d'exécution.
> Dernière mise à jour : 2026-06-24.

## Légende des actions
- 🟢 **SANCTUARISER** — excellent, on garde tel quel, on n'y touche pas.
- 🔵 **ADAPTER** — bon, modification ciblée (stack, structure).
- 🟡 **EXTRAIRE** — la valeur existe mais enfouie ; on la sort en fichier standalone.
- 🔴 **CRÉER** — n'existe pas ; on bâtit (sur un pattern existant quand possible).

## ⚠️ Règle de sécurité (permanente)
`_sources/claude-config/config.json` (clé API) et `mcp.json` (mots de passe Postgres) sont en clair → **JAMAIS** cherry-pickés, jamais commités. Exclus de tout.

## 🎯 OBJECTIF FINAL (à ne jamais perdre de vue)
À la fin, **`_sources/` est SUPPRIMÉ**. Il ne reste qu'**un seul dossier** : `SimpleEfficace/` devient le nouveau repo de config (successeur de `claude-config`), versionné git, contenant uniquement les skills/agents/hooks gardés et améliorés.

**Conséquence de méthode, valable à CHAQUE chantier :**
- Rien de construit ne doit **dépendre** de `_sources/`. On lit `_sources/` une fois, on **copie+adapte dans le dossier final**, on ne le **référence jamais**.
- Test de validité permanent : *« si je supprime `_sources/` maintenant, est-ce que ça casse ? »* → la réponse doit toujours être non.
- On écrit l'amélioré **directement dans la structure finale** (pas d'atelier `_wip/`).

## Structure cible du dossier final (`SimpleEfficace/`)
```
SimpleEfficace/                ← futur repo de config (remplace claude-config)
├── commands/                  ← skills gardés/améliorés (pilot, dev, humanizer, ux, research…)
├── agents/                    ← sous-agents (gsd-*, researcher, ui-*…)
├── hooks/                     ← se-guard.mjs + guard-lib.mjs + rules/
├── .planning/                 ← templates, conventions, index (déjà posé)
├── SYSTEME.md · PLAN-CONSTRUCTION.md
├── _design/                   ← specs de chantier
└── _sources/                  ← ATELIER TEMPORAIRE — supprimé à la toute fin
```
Déploiement vers `~/.claude/` : à la fin, push GitHub puis copie/sync. (Étape finale, pas maintenant.)

---

# CHANTIER 0 — Fondations ✅ FAIT

Déjà construit. Pour mémoire :
- `.planning/` : phases/ research/ design/ rules/ todos/ _archive/ _templates/
- `.planning/CONVENTIONS.md`, `.planning/INDEX.md`
- `.planning/_templates/STATE.template.md` (plafond 150), `ROADMAP.template.md` (plafond 200)

**Reste à créer dans ce chantier** (petit) :
- 🔴 `.planning/_templates/phase-template/` : CONTEXT, RESEARCH, PLAN, SUMMARY, VERIFICATION, CHECKPOINTS, UI-SPEC (noms fixes, cf. CONVENTIONS §4). Source d'inspiration : `_sources/get-shit-done/get-shit-done/templates/*.md`.

---

# CHANTIER — Diète de contexte ✅ FAIT

Appliqué dans `~/.claude/settings.json` (backup `.bak-2026-06-24`) :
- `ENABLE_TOOL_SEARCH: "auto:5"` · `CLAUDE_CODE_SUBAGENT_MODEL: "claude-haiku-4-5-20251001"`
- `skillListingBudgetFraction: 0.02` · `skillListingMaxDescChars: 1536`

Note : le validateur de settings est lui-même un garde-fou (il a bloqué un nom de clé inventé). À garder en tête comme preuve du concept Strate A.

---

# CHANTIER 1 — Garde-fous (Strate A) 🔴 cœur de la demande

8 garde-fous = **du code que le harness exécute, pas Claude.** Pattern volé à `gsd-prompt-guard.js` (Paul) + `hook.mjs` (impeccable).

## 1.1 À récupérer

| Élément | Source exacte | Quoi en prendre | Action |
|---|---|---|---|
| Pattern de hook propre | `_sources/claude-config/hooks/gsd-prompt-guard.js` + `gsd-context-monitor.js` | structure stdin JSON → `hookSpecificOutput.additionalContext`, fail-silent | 🔵 modèle à copier |
| Hook impeccable (réf) | `_sources/impeccable/.claude/skills/impeccable/scripts/hook.mjs` + `hook-lib.mjs` | thin adapter + lib testable, garde de ré-entrance (env depth), exit 0 toujours | 🔵 modèle |
| Détecteur déterministe | `_sources/impeccable/cli/engine/detect-antipatterns.mjs` | règles `{id, snippet}`, exit 0/2, fonctions pures | 🔵 modèle pour slop/hardcode/monolithe |
| Marqueurs slop FR | `~/.claude/commands/se-humanizer.md` (29 marqueurs) | la liste → `rules/slop-rules` | 🟡 extraire en données |
| Patterns hardcode | `_sources/get-shit-done/tests/hardcoded-paths.test.cjs` | patterns chemins en dur | 🔵 étendre |

## 1.2 Les 8 garde-fous — plan de modification

| # | Garde-fou | Événement | Déclencheur | Action | Bloquant |
|---|---|---|---|---|---|
| 1 | **humanizer-guard** | PostToolUse Edit/Write | fichier user-facing (chemins : `(public)/`, `emails/`, `*.copy.ts`, blog, FAQ + heuristique contenu FR) | rappel « passe /se-humanizer » | non |
| 2 | **slop-gate** | au commit (clean-commit) | contenu user-facing avec ≥2 marqueurs slop (règle des clusters) | refuse le commit | **oui** |
| 3 | **ui-guard** | PostToolUse Edit/Write | `.tsx`/`.css`/composant front | si pas de DESIGN-SYSTEM lu / pas d'UI-spec → rappel ; sinon détecteur visuel | non |
| 4 | **hardcode-guard** | PostToolUse Edit/Write | code source | valeurs magiques + listes hardcodées (cf. règle CLAUDE.md « no hardcoded lists ») | non |
| 5 | **hygiene-guard** | PostToolUse Edit | code source | imports inutilisés, console.log, code mort | non |
| 6 | **monolith-guard** | PostToolUse Edit | code source | fichier > seuil lignes, fonction > seuil, trop d'exports | **non (advisory — décidé)** |
| 7 | **size-gate** | PostToolUse Write | STATE.md / ROADMAP.md | refuse si > plafond (150 / 200) | **oui** |
| 8 | **archive-hook** | à ship réussi | phase passée en shipped | déplace dossier en `_archive/` + maj INDEX | auto |

**Garde-fous bloquants = 2 seulement** (slop-gate, size-gate). Le reste souffle. Cohérent avec « advisory par défaut, on ne bride pas ».

## 1.3 Architecture — UN dispatcher, pas 8 scripts
```
.claude/hooks/
├── se-guard.mjs            ← dispatcher unique (thin stdin/stdout adapter)
├── guard-lib.mjs           ← logique testable (1 fonction par garde-fou)
└── rules/                  ← données (partagées avec les skills, source unique)
    ├── slop-rules.json
    ├── hardcode-patterns.json
    └── monolith-thresholds.json
```
Le dispatcher route par événement + type de fichier. Respecte « moins de scripts ».

## 1.4 Déclaration settings.json (à AJOUTER aux hooks existants, pas remplacer)
Les hooks GSD actuels (`gsd-context-monitor` sur PostToolUse, `gsd-prompt-guard` sur PreToolUse) restent. On ajoute notre dispatcher en parallèle sur PostToolUse Edit/Write/MultiEdit. Le slop-gate s'accroche au flux commit (à câbler dans clean-commit, pas un event natif).

## 1.5 Risques
- **Faux positifs humanizer/hardcode** → exclure `test/`, `*.config.*`, lignes commentées ; règle des clusters pour slop.
- **Ré-entrance** → env `SE_GUARD_DEPTH`.
- **Cohabitation hooks GSD** → vérifier que 2 hooks PostToolUse coexistent (ils s'additionnent, OK).
- **`PreCommit` n'est pas un event natif** (cf. schéma settings : events sont PreToolUse/PostToolUse/Stop…). Le slop-gate doit donc être déclenché DANS le skill clean-commit ou via un PreToolUse matcher sur `Bash(git commit*)`, pas un event `PreCommit` inventé.

---

# CHANTIER 2 — Anti-entropie + Checkpoints (Strate A/C)

## 2.1 Anti-entropie — à récupérer
| Élément | Source | Action |
|---|---|---|
| Plafond STATE (idée) | `_sources/get-shit-done/.../templates/state.md` (100 lignes conseillé) | 🔵 durcir en 150 + le FORCER (size-gate) |
| Archivage milestones | `_sources/get-shit-done/.../workflows/cleanup.md`, `complete-milestone.md`, `templates/milestone-archive.md` | 🔵 généraliser en archive-hook auto |

## 2.2 Les 3 mécanismes — plan
- **size-gate** (hook #7) : compte lignes après écriture, refuse si > plafond, message « archive le vieux ». Avertit dès ~90% avant de bloquer.
- **archive-hook** (hook #8) : phase shippée (SUMMARY + statut completed, ou via ship) → `mv` vers `_archive/phases/` + log `ARCHIVE.log` + maj INDEX.
- **INDEX vivant** : un hook régénère les sections « Phases actives » et « Archive » après chaque archivage. Maintenu, jamais greppé.

## 2.3 Checkpoints repensés — à récupérer puis MODIFIER
| Élément | Source | Action |
|---|---|---|
| 3 types (human-verify/decision/human-action) | `_sources/get-shit-done/.../references/checkpoints.md` | 🟢 garder |
| Golden rule « si Claude peut, Claude fait » | idem | 🟢 garder |
| Boîtes ASCII | idem (lignes ~288-363) | 🟢 garder |
| Table services CLI | idem (lignes ~387+) | 🔵 réduire à Railway/Supabase/GitHub/Node |
| **Défaut end-of-phase** | idem (#3309) | 🔴 **INVERSER** → checkpoints visuels ciblés au bon moment |

**Modification clé :** mode mid-flight, un checkpoint juste après le livrable visible. Playwright capture 3 breakpoints, Claude présente les images + GO/NO-GO. Journal dans `{phase}/CHECKPOINTS.md`.

## 2.4 Risques
- Archivage trop tôt → ne déclencher qu'après SUMMARY + verif OK ; archives lisibles via INDEX.
- size-gate au mauvais moment → garder STATE strictement « présent », avertir avant bloquer.
- checkpoints trop fréquents → seulement sur étapes visibles (~3-5/phase), grouper les tâches invisibles.

---

# CHANTIER 3 — Design-system + UI/UX + Maquette + Playwright

## 3.1 À récupérer
| Élément | Source exacte | Action |
|---|---|---|
| 6 piliers UI (Hierarchy, Copywriting, Registry Safety, Typography, Spacing, Color) | `_sources/claude-config/agents/gsd-ui-checker.md` + `gsd-ui-auditor.md` | 🟡 EXTRAIRE |
| Contrat UI-SPEC | `_sources/get-shit-done/.../templates/UI-SPEC.md` | 🔵 base de DESIGN-SYSTEM |
| Schéma de règles (le format données) | `_sources/ui-ux-pro-max-skill/` → CSV `data/ux-guidelines.csv` (colonnes : Issue/Do/Don't/Code Good/Code Bad/Severity) | 🟡 modèle pour `rules/ui-rules` |
| Pattern MASTER + overrides | ui-ux-pro-max `design_system.py` | 🔵 idée d'archi |
| Mode live / craft | `_sources/impeccable/.claude/skills/impeccable/reference/live.md`, `craft.md` | 🔵 maquette niveau 3 |
| Détecteur visuel (contraste réel) | `_sources/impeccable/cli/engine/` (screenshot/contrast) | 🔵 pour ui-guard |
| Matière personas | `_sources/claude-config/commands/marketing/strategie/recherche-utilisateur.md` + `references/verbatim-voc.md` | 🟡 base de PERSONAS |

## 3.2 Plan de modification
- 🟡 **`design/DESIGN-SYSTEM.md`** : créer depuis UI-SPEC + 6 piliers, tokens Tailwind/OKLCH, pattern MASTER + overrides par page. LE fichier lu par tous les skills UI.
- 🟡 **`rules/ui-rules`** : externaliser les critères des 6 piliers au format `slug | norme chiffrée | Do | Don't | Code Good | Code Bad | Severity | source`. Severity → BLOCK/FLAG/PASS mécanique. (Format JSON/TS typé plutôt que CSV, cohérent avec la stack ; ne PAS répliquer le moteur BM25 Python d'ui-ux-pro-max — juste les données.)
- 🔵 **gsd-ui-researcher / checker / auditor** : les brancher sur DESIGN-SYSTEM + ui-rules au lieu de critères inline. checker/auditor : description auto-trigger-optimisée.
- 🔴 **`/se-ux`** (expert personas) : créer. Lit `design/PERSONAS.md`, challenge le parcours/JTBD par persona. Distinct de `/se-ui` (visuel).
- 🟡 **`design/PERSONAS.md`** : créer depuis matière marketing (3-5 personas ancrés VOC réel).

## 3.3 Maquette — 3 niveaux (mode du flux UI/UX, AVANT le code)
| Niveau | Outil | Sortie |
|---|---|---|
| ASCII/texte | inline (skill UX) | wireframe |
| Visuel statique | `/generate-image` + design-system | PNG d'écran |
| Live | Next.js + Playwright screenshot | preview + capture |

## 3.4 Playwright — config une fois, 3 ancrages
- Config : `playwright.config.ts` (Next.js, 3 projects desktop/tablet/mobile, `webServer` réutilise dev). Deps `@playwright/se-test`.
- Ancrage 1 : détecteur visuel dans **ui-guard** (screenshot + contraste réel).
- Ancrage 2 : screenshots 3 breakpoints aux **checkpoints VERIFY**.
- Ancrage 3 : moteur **E2E** par défaut.
- **⚠️ Garde-fou « moins de scripts » :** PAS un fichier `.spec.ts` par feature (un agent a proposé 8 fichiers — refusé). UN helper de screenshot réutilisable + tests E2E seulement sur les parcours critiques. Le reste = test manuel guidé.

## 3.5 Risques
- Sur-rigidité du design-system → max d'exceptions documentées, règle DOWNGRADE.
- Faux positifs visuels → screenshots déterministes, tolérance pixels.
- Coût Playwright → opt-in, niveaux 1-2 couvrent la majorité.
- Maintenance des règles → source unique + validation de schéma.

---

# CHANTIER 4 — Cycle de phase enrichi (Strate C)

## 4.1 État réel de chaque étape
| Étape | Existe ? | Source | Action |
|---|---|---|---|
| SCOUT | ✅ (étape `scout_codebase` non conditionnelle) | `workflows/discuss-phase.md` + `references/scout-codebase.md` | 🔵 amplifier + anti-monolithe |
| DISCUSS | ✅ | `workflows/discuss-phase.md` | 🔵 + décision TDD-éligibilité |
| RESEARCH | ✅ | `workflows/se-plan-phase.md` §5 + `gsd-phase-researcher` | 🔵 brancher recherche 4 niveaux |
| PLAN+TDD | ⚙️ off | `references/tdd.md` | 🔵 activer toggles |
| CHECK | ✅ | `gsd-plan-checker` | 🟢 garder |
| EXECUTE | ✅ | `workflows/execute-phase.md` | 🟢 + gate MVP+TDD |
| VERIFY | ✅ | `gsd-verifier` | 🔵 + déterministe×LLM croisé + anti-monolithe + Playwright |
| SIMPLIFY | ❌ gate | `_sources/claude-config/commands/se-refactor.md` (+ `~/.claude/commands/simplify.md` si présent) | 🔴 créer gate |
| JANITOR | ❌ gate | `_sources/claude-config/commands/se-janitor.md` | 🔴 créer gate |
| SHIP | ✅ | `workflows/ship.md` | 🔵 + slop-gate + archive-hook |

## 4.2 Toggles GSD config.json (par projet, à activer)
| Clé | Valeur | Effet |
|---|---|---|
| `workflow.tdd_mode` | `true` | active gates RED/GREEN/REFACTOR |
| `workflow.verifier` | `true` (déjà) | gsd-verifier |
| `workflow.plan_check` | `true` (déjà) | gsd-plan-checker |
| (nouveau) `simplify_gate` | `true` | gate simplify post-VERIFY |
| (nouveau) `janitor_gate` | `true` | gate janitor post-SIMPLIFY |

Note : `simplify_gate`/`janitor_gate` ne sont PAS des toggles GSD natifs — à implémenter dans nos workflows, ou gérer comme étapes manuelles gatées au début. Ne pas prétendre que GSD les connaît.

## 4.3 Pattern des nouvelles gates (SIMPLIFY, JANITOR, VERIFY)
Modèle impeccable `reference/critique.md` : **2 assesseurs isolés** (A = LLM jugement, B = détecteur déterministe), puis **synthèse croisée** (accords = sûr, désaccords = faux positif à examiner). Aucun n'écrit/commit sans validation.

## 4.4 Anti-monolithe (transverse, advisory)
SCOUT le cartographie · VERIFY le liste au checkpoint · `monolith-guard` souffle en continu. Jamais bloquant.

## 4.5 Risques
- Sur-gating (VERIFY+SIMPLIFY+JANITOR+visuel = lourd) → gates opt-in, détecteurs en Haiku, paralléliser.
- Faux positifs déterministes (code « mort » en réalité utilisé via import dynamique) → catégorie SUSPECT non touchée, exclusions.
- Conflits d'agents → orchestrateur séquentialise, aucun agent ne commit seul.

---

# CHANTIER 5 — Cofondateur / Pilot mince (Strate B)

## 5.1 Anatomie actuelle (à récupérer)
Source : `_sources/claude-config/commands/se-pilot.md` + `planning.md`.

| Mode | Rôle | Verdict |
|---|---|---|
| 1 Briefing | lit l'état | 🔵 externaliser en sous-skill |
| 2 Conversation (sparring) | challenge, vision | 🟢 GARDER intact, dans pilot |
| 3 Clôture | écrit l'état | 🔵 externaliser |
| 4 Discussion stratégique | débat + CONTEXT | 🔵 externaliser (lourd : recherche code) |
| 5 Marketing | dispatch | 🔵 alléger |

## 5.2 Plan de refonte
- `/se-pilot` = routeur mince + sparring (Mode 2) chargé d'emblée. Détecte le mode et délègue.
- Sous-skills `user-invocable:false` : `pilot:briefing`, `pilot:closure`, `pilot:strategic-discussion`. Chargés à la demande (pattern hyperresearch : routeur mince + étapes fraîches).
- Briefing lit **un** STATE.md consolidé (≤150 lignes), pas la cascade.

## 5.3 Décision tranchée
**Sparring INTÉGRÉ dans /se-pilot** (pas skill dédié). Raison : fluidité « je parle, il challenge » sans saut d'invocation. Le routeur mince suffit à régler le poids. → à confirmer par Paul.

## 5.4 Risques
- Compaction évince le routeur → STATE mince + dispatch table dans le fichier (re-lisible).
- Détection de mode ratée → règle explicite en tête (« /se-pilot seul → briefing ; sinon sparring »).

---

# CHANTIER 6 — Recherche 4 niveaux + Humanizer + Brainstorming (Strates D/E)

## 6.1 Recherche — à récupérer
| Niveau | Source | Action |
|---|---|---|
| 1 Code local | `gsd-phase-researcher` / scout | 🟢 sanctuariser |
| 2 Web tech | `~/.claude/commands/se-research.md` + `~/.claude/agents/researcher.md` | 🟢 SANCTUARISER (Paul l'adore) |
| 3 Scientifique | `_sources/hyperresearch/` (4 APIs) | 🔵 ajout optionnel |
| 4 Projets existants | `gsd-project-researcher` | 🟢 sanctuariser |

**Ajout niveau 3 (optionnel, recommandé si sujets tech/ML) :** endpoints dans `researcher.md` —
Semantic Scholar `api.semanticscholar.org/graph/v1/paper/search` · arXiv `export.arxiv.org/api/query` · OpenAlex `api.openalex.org/works` · PubMed `eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi`. Principe « academic-APIs-first » avant WebSearch. Le `researcher.md` a DÉJÀ la structure (ligne ~114-121), il manque juste les endpoints exacts.

## 6.2 Humanizer — 🟢 garder + 2 ajouts ciblés (non destructifs)
Source du skill : `~/.claude/commands/se-humanizer.md` (v2.5.1, déjà excellent : 29 marqueurs, boucle audit, calibrage voix, âme).
Source des ajouts : `_sources/se-humanizer/SKILL.md` (v2.8.0 blader).
- **Ajout 1 — section anti-faux-positifs** (CRUCIAL) : règle des clusters (1 marqueur ≠ IA, 2+ = signal), « ce qui N'est PAS une preuve » (tiret cadratin seul, guillemets « » FR, grammaire parfaite), « signes d'écriture humaine à préserver ». Sinon il massacre la bonne prose.
- **Ajout 2 — 4 patterns récents** (§30-33) adaptés FR : diff-anchored, staccato manufacturé, formules d'aphorisme « X est le Y de Z », ouvreurs candides « Honnêtement ? ».

## 6.3 Brainstorming — 🟢 SANCTUARISER
`brainstorm-light.md`, `brainstorm-heavy.md`, `brain-methods.csv` (62 techniques). Aucune modif nécessaire (option : une ligne « capture via /gsd:add-backlog »).

## 6.4 Risques
- Sur-fetch académique → lens B optionnelle, déclenchée si littérature.
- Humanizer trop agressif → l'ajout 1 (anti-faux-positifs) est précisément le correctif.

---

# CHANTIER 7 — Skills dev (cherry-pick + adaptation stack)

Source : `_sources/claude-config/commands/`. Tous alignés stack sauf 2.

| Skill | Action | Adaptation |
|---|---|---|
| dev, plan, review, fix, test, debug, clean-commit, lint, perf, security, refactor, janitor, explain | 🔵 garder | aucune (stack OK) |
| **deploy** | 🔵 adapter | Railway (pas Vercel) — via MCP railway |
| **health-check** | 🔵 adapté générique | checks Railway + build/type-check/se-test. **Décision Paul : version générique (projet-agnostique). Les checks data spécifiques (Supabase/pipeline/KI) seront recréés comme skill PROJET dans mymozaica, PAS dans cette config globale.** |

> **Note phase 2 (audit rapatriement) :** l'audit a trouvé 4 anomalies, toutes corrigées : pilot.md re-restauré (Mode 5 + icebox + dispatch, 467 lignes), pilot-marketing.md + planning-marketing.md rapatriés (n'étaient que dans ~/.claude). health-check générique confirmé OK. Les 27 autres fichiers sont fidèles.

`test` : confirmer Vitest (unitaire) + Playwright (E2E/visuel). `simplify` : à localiser (`~/.claude/commands/simplify.md` ou créer depuis refactor.md).

---

# ÉTAT D'AVANCEMENT (construit + vérifié)

| # | Chantier | Statut |
|---|----------|--------|
| 0 | Fondations (.planning, conventions, INDEX, templates) | ✅ |
| — | Diète de contexte (settings global) | ✅ |
| 1 | Garde-fous : se-guard (5 advisory) + se-size-gate (bloquant), testés 9/9 + 7/7, câblés local | ✅ |
| 3 | Design-system + ui-rules.json (18 règles, 6 piliers) + agents UI branchés | ✅ |
| 3 | /se-ux + PERSONAS.md (expert UX) | ✅ |
| 3 | Playwright (config + helper, templates projet-agnostiques) | ✅ |
| 4 | Gates SIMPLIFY + JANITOR (pattern détecteur+LLM croisés) | ✅ |
| 6 | Humanizer +2 ajouts (anti-faux-positifs cluster + patterns 30-33) | ✅ |
| 6 | Recherche niveau 3 (4 APIs académiques dans researcher) | ✅ |
| 5 | Pilot mince (467→214 l.) + 3 sous-skills lazy, sparring intact | ✅ |
| 7 | Skills dev rapatriés + adaptés (deploy/se-health-check Railway) | ✅ |

**Câblage opérationnel (fait après la 1re relance "tout doit être branché") :**
- ✅ gates SIMPLIFY/JANITOR branchées dans `get-shit-done/workflows/execute-phase.md` (step `simplify_janitor_gate`, vérifié 18/18 steps)
- ✅ moteur GSD rapatrié dans le dossier (`get-shit-done/`, v1.29) → système autonome
- ✅ `/init` créé (pilot → brainstorm → PRD → research → roadmap)
- ✅ template config (`_templates/config.template.json`) active tdd_mode/simplify_gate/janitor_gate — chaîne config→gate vérifiée cohérente
- ✅ archive-hook livré en **skill `/se-archive`** (plus sûr qu'un hook auto pour déplacer des dossiers)
- ✅ slop-gate au commit (bloquant, testé) — câblage settings au déploiement
- ✅ README + crédits GitHub

**Reste (non bloquant) :**
- **Câbler les hooks en global** (décidé : à l'étape DEPLOY, pas avant)
- **Checkpoints visuels mid-flight** : templates Playwright prêts, mais l'INVERSION du défaut GSD `end-of-phase` dans le workflow verify n'est pas faite (SYSTEME §11)
- **`/se-ui` skill standalone** : les agents gsd-ui-* existent, mais pas de commande `/se-ui` directe — à clarifier
- remplir DESIGN-SYSTEM.md / PERSONAS.md avec les vraies valeurs au 1er projet (voulu : ce sont des templates)
- phase-template/ dans _templates/
- TEST en conditions réelles (nouvelle session)
- déploiement final : supprimer _sources/, push GitHub, sync vers ~/.claude
