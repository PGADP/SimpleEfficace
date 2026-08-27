<purpose>
Execute small, ad-hoc tasks as a **mini-phase**: same guarantees as a full phase, less ceremony. A quick task is short, not sloppy.

**SIMPLE & EFFICACE, what a quick task always runs:**
- `Skill(se-interview)` before planning. The human decides, Claude recommends. It self-limits: nothing left to decide means no question asked.
- a focused research pass. A discussion cannot check an API contract.
- the SIMPLIFY / JANITOR / SECURITY gates on the resulting diff, in ONE parallel batch and ONE checkpoint.
- the measured visual checkpoint (`/se-ui` ritual) **when the task touched frontend files**. It is also what unblocks the `se-ui-gate` commit hook.
- `Skill(se-humanizer)` **when the task touched user-facing text**: inside the visual checkpoint when there is a screen, standalone otherwise.
- `gsd-verifier` on the task goal.

Flags: `--full` adds the plan-checker loop (max 2 iterations) before execution. `--no-research` skips the research pass for a task whose approach is already settled.
</purpose>

<required_reading>
Read all files referenced by the invoking prompt's execution_context before starting.
</required_reading>

<available_agent_types>
Valid GSD subagent types (use exact names, do not fall back to 'general-purpose' except where this workflow explicitly asks for it to host a Skill):
- gsd-phase-researcher : Researches technical approaches for a phase
- gsd-planner : Creates detailed plans from phase scope
- gsd-plan-checker : Reviews plan quality before execution
- gsd-executor : Executes plan tasks, commits, creates SUMMARY.md
- gsd-verifier : Verifies phase completion, checks quality gates
</available_agent_types>

<process>
**Step 1: Parse arguments and get task description**

Parse `$ARGUMENTS` for:
- `--full` flag → store as `$FULL_MODE` (true/false)
- `--no-research` flag → store as `$SKIP_RESEARCH` (true/false)
- Remaining text → use as `$DESCRIPTION` if non-empty

Legacy flags `--discuss` and `--research` are accepted and ignored: interview and research are now the default. If either is present, note once: `--discuss/--research sont le défaut maintenant (ignorés).`

If `$DESCRIPTION` is empty after parsing, prompt user interactively:

```
AskUserQuestion(
  header: "Quick Task",
  question: "What do you want to do?",
  followUp: null
)
```

Store response as `$DESCRIPTION`.

If still empty, re-prompt: "Please provide a task description."

Display banner:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► QUICK TASK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

◆ Mini-phase : interview → recherche → plan → exécution → gates → vérification
${FULL_MODE ? '◆ Plan-checker activé (--full)' : ''}
${SKIP_RESEARCH ? '◆ Recherche désactivée (--no-research)' : ''}
```

---

**Step 2: Initialize**

```bash
INIT=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" init quick "$DESCRIPTION")
if [[ "$INIT" == @file:* ]]; then INIT=$(cat "${INIT#@file:}"); fi
AGENT_SKILLS_PLANNER=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" agent-skills gsd-planner 2>/dev/null)
AGENT_SKILLS_EXECUTOR=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" agent-skills gsd-executor 2>/dev/null)
AGENT_SKILLS_CHECKER=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" agent-skills gsd-checker 2>/dev/null)
AGENT_SKILLS_VERIFIER=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" agent-skills gsd-verifier 2>/dev/null)
```

Parse JSON for: `planner_model`, `executor_model`, `checker_model`, `verifier_model`, `commit_docs`, `branch_name`, `quick_id`, `slug`, `date`, `timestamp`, `quick_dir`, `task_dir`, `roadmap_exists`, `planning_exists`.

**If `roadmap_exists` is false:** Error, Quick mode requires an active project with ROADMAP.md. Run `/gsd:new-project` first.

Quick tasks can run mid-phase: validation only checks ROADMAP.md exists, not phase status.

---

**Step 2.5: Handle quick-task branching**

**If `branch_name` is empty/null:** Skip and continue on the current branch.

**If `branch_name` is set:** Check out the quick-task branch before any planning commits:

```bash
git checkout -b "$branch_name" 2>/dev/null || git checkout "$branch_name"
```

All quick-task commits for this run stay on that branch. User handles merge/rebase afterward.

---

**Step 3: Create quick task directory**

```bash
QUICK_DIR=".planning/quick/${quick_id}-${slug}"
mkdir -p "$QUICK_DIR"
```

Report to user:
```
Creating quick task ${quick_id}: ${DESCRIPTION}
Directory: ${QUICK_DIR}
```

Store `$QUICK_DIR` for use in orchestration.

---

**Step 4: Interview (always)**

**SIMPLE & EFFICACE : le primitif d'interview, pas un questionnaire maison.** Une tâche courte se rate exactement comme une longue : sur une décision supposée en silence. L'interview coûte zéro question quand il n'y a rien à trancher, donc elle tourne toujours.

Display banner:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► CADRAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

◆ Interview : ${DESCRIPTION}
```

```
Skill(skill="se-interview", args="tâche quick ${quick_id} : ${DESCRIPTION}. Cadrage court avant plan. Périmètre : une tâche atomique de 1 à 3 étapes. Ne pose que les décisions qui changent le résultat livré ; si la frontière est vide, dis-le et n'invente pas de question.")
```

Rules:
- The interview is the primitive: it asks in rounds, numbered, each question carrying Claude's recommended answer. Do not re-implement a question flow here.
- Facts about the repo are Claude's job, not the human's: send them to subagents rather than asking.
- **Frontière vide → no CONTEXT.md, skip straight to Step 5** and report `Cadrage : rien à trancher.`

**Write CONTEXT.md** at `${QUICK_DIR}/${quick_id}-CONTEXT.md` when at least one decision was taken:

```markdown
# Quick Task ${quick_id}: ${DESCRIPTION} - Context

**Gathered:** ${date}
**Status:** Ready for planning

<domain>
## Task Boundary

${DESCRIPTION}

</domain>

<decisions>
## Implementation Decisions

### ${area_name}
- ${decision_verbatim_from_interview}

### Claude's Discretion
${areas_the_human_explicitly_left_to_claude}

</decisions>

<specifics>
## Specific Ideas

${specific_references_or_examples_from_the_interview}

[If none: "No specific requirements, open to standard approaches"]

</specifics>

<canonical_refs>
## Canonical References

${specs_adrs_or_docs_referenced_during_the_interview}

[If none: omit this section]

</canonical_refs>
```

Quick task CONTEXT.md omits `<code_context>` and `<deferred>` (no codebase scouting, no phase scope to defer to). Keep it lean.

Set `$CONTEXT_EXISTS` accordingly and report: `Contexte capturé : ${QUICK_DIR}/${quick_id}-CONTEXT.md`

---

**Step 5: Research (always, unless `--no-research`)**

**SIMPLE & EFFICACE : la recherche vérifie des faits extérieurs, l'interview tranche des intentions.** Les deux tournent : une discussion ne peut pas lire un contrat d'API ni connaître la version qui casse. Sur une tâche courte, la recherche est courte : ciblée, pas un panorama de domaine.

Skip only if `$SKIP_RESEARCH`. Display then: `Recherche désactivée (--no-research).`

Display banner:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► RECHERCHE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

◆ Investigating approaches for: ${DESCRIPTION}
```

One focused researcher (not the 4 parallel researchers of a full phase):

```
Task(
  prompt="
<research_context>

**Mode:** quick-task
**Task:** ${DESCRIPTION}
**Output:** ${QUICK_DIR}/${quick_id}-RESEARCH.md

<files_to_read>
- .planning/STATE.md (Project state, what's already built)
- .planning/PROJECT.md (Project context)
- ./CLAUDE.md (if exists, project-specific guidelines)
${CONTEXT_EXISTS ? '- ' + QUICK_DIR + '/' + quick_id + '-CONTEXT.md (User decisions, research aligns with these and never revisits them)' : ''}
</files_to_read>

${AGENT_SKILLS_PLANNER}

</research_context>

<focus>
This is a quick task, not a full phase. Concise and targeted:
1. Best library/pattern for this specific task
2. Common pitfalls and how to avoid them
3. Integration points with the existing codebase
4. Constraints or gotchas worth knowing before planning

Do NOT produce a domain survey. Target 1-2 pages of actionable findings. Verify facts against the real source (docs, source code, the repo): a plausible answer is not an answer.
</focus>

<output>
Write research to: ${QUICK_DIR}/${quick_id}-RESEARCH.md
Use standard research format but keep it lean, skip sections that don't apply.
Return: ## RESEARCH COMPLETE with file path
</output>
",
  subagent_type="gsd-phase-researcher",
  model="{planner_model}",
  description="Research: ${DESCRIPTION}"
)
```

After researcher returns:
1. Verify research exists at `${QUICK_DIR}/${quick_id}-RESEARCH.md`, set `$RESEARCH_EXISTS`
2. Report: `Recherche : ${QUICK_DIR}/${quick_id}-RESEARCH.md`

If research file not found, warn but continue: "Research agent did not produce output, proceeding to planning without research."

---

**Step 6: Spawn planner (quick mode)**

**If `$FULL_MODE`:** Use `quick-full` mode with stricter constraints.

**If NOT `$FULL_MODE`:** Use standard `quick` mode.

```
Task(
  prompt="
<planning_context>

**Mode:** ${FULL_MODE ? 'quick-full' : 'quick'}
**Directory:** ${QUICK_DIR}
**Description:** ${DESCRIPTION}

<files_to_read>
- .planning/STATE.md (Project State)
- ./CLAUDE.md (if exists, follow project-specific guidelines)
${CONTEXT_EXISTS ? '- ' + QUICK_DIR + '/' + quick_id + '-CONTEXT.md (User decisions, locked, do not revisit)' : ''}
${RESEARCH_EXISTS ? '- ' + QUICK_DIR + '/' + quick_id + '-RESEARCH.md (Research findings, use to inform implementation choices)' : ''}
</files_to_read>

${AGENT_SKILLS_PLANNER}

**Project skills:** Check .claude/skills/ or .agents/skills/ directory (if either exists), read SKILL.md files, plans should account for project skill rules

</planning_context>

<constraints>
- Create a SINGLE plan with 1-3 focused tasks
- Quick tasks should be atomic and self-contained
${RESEARCH_EXISTS ? '- Research findings are available, use them to inform library/pattern choices' : '- No research available'}
- MUST generate `must_haves` in plan frontmatter (truths, artifacts, key_links): a quick task is verified like a phase
- Each task MUST have `files`, `action`, `verify`, `done` fields
${FULL_MODE ? '- Target ~40% context usage (structured for plan checking)' : '- Target ~30% context usage (simple, focused)'}
</constraints>

<output>
Write plan to: ${QUICK_DIR}/${quick_id}-PLAN.md
Return: ## PLANNING COMPLETE with plan path
</output>
",
  subagent_type="gsd-planner",
  model="{planner_model}",
  description="Quick plan: ${DESCRIPTION}"
)
```

After planner returns:
1. Verify plan exists at `${QUICK_DIR}/${quick_id}-PLAN.md`
2. Report: "Plan created: ${QUICK_DIR}/${quick_id}-PLAN.md"

If plan not found, error: "Planner failed to create ${quick_id}-PLAN.md"

---

**Step 6.5: Plan-checker loop (only when `$FULL_MODE`)**

Skip this step entirely if NOT `$FULL_MODE`.

Display banner:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► CHECKING PLAN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

◆ Spawning plan checker...
```

Checker prompt:

```markdown
<verification_context>
**Mode:** quick-full
**Task Description:** ${DESCRIPTION}

<files_to_read>
- ${QUICK_DIR}/${quick_id}-PLAN.md (Plan to verify)
</files_to_read>

${AGENT_SKILLS_CHECKER}

**Scope:** This is a quick task, not a full phase. Skip checks that require a ROADMAP phase goal.
</verification_context>

<check_dimensions>
- Requirement coverage: Does the plan address the task description?
- Task completeness: Do tasks have files, action, verify, done fields?
- Key links: Are referenced files real?
- Scope sanity: Is this appropriately sized for a quick task (1-3 tasks)?
- must_haves derivation: Are must_haves traceable to the task description?

Skip: cross-plan deps (single plan), ROADMAP alignment
${CONTEXT_EXISTS ? '- Context compliance: Does the plan honor locked decisions from CONTEXT.md?' : '- Skip: context compliance (no CONTEXT.md)'}
</check_dimensions>

<expected_output>
- ## VERIFICATION PASSED, all checks pass
- ## ISSUES FOUND, structured issue list
</expected_output>
```

```
Task(
  prompt=checker_prompt,
  subagent_type="gsd-plan-checker",
  model="{checker_model}",
  description="Check quick plan: ${DESCRIPTION}"
)
```

**Handle checker return:**

- **`## VERIFICATION PASSED`:** Display confirmation, proceed to step 7.
- **`## ISSUES FOUND`:** Display issues, check iteration count, enter revision loop.

**Revision loop (max 2 iterations):**

Track `iteration_count` (starts at 1 after initial plan + check).

**If iteration_count < 2:**

Display: `Sending back to planner for revision... (iteration ${N}/2)`

Revision prompt:

```markdown
<revision_context>
**Mode:** quick-full (revision)

<files_to_read>
- ${QUICK_DIR}/${quick_id}-PLAN.md (Existing plan)
</files_to_read>

${AGENT_SKILLS_PLANNER}

**Checker issues:** ${structured_issues_from_checker}

</revision_context>

<instructions>
Make targeted updates to address checker issues.
Do NOT replan from scratch unless issues are fundamental.
Return what changed.
</instructions>
```

```
Task(
  prompt=revision_prompt,
  subagent_type="gsd-planner",
  model="{planner_model}",
  description="Revise quick plan: ${DESCRIPTION}"
)
```

After planner returns → spawn checker again, increment iteration_count.

**If iteration_count >= 2:**

Display: `Max iterations reached. ${N} issues remain:` + issue list

Offer: 1) Force proceed, 2) Abort

---

**Step 7: Spawn executor**

Record the baseline BEFORE execution. The gates and the visual checkpoint need the exact diff this task produced, and a commit-message grep is not a diff:

```bash
BASE_SHA=$(git rev-parse HEAD)
```

```
Task(
  prompt="
Execute quick task ${quick_id}.

<files_to_read>
- ${QUICK_DIR}/${quick_id}-PLAN.md (Plan)
- .planning/STATE.md (Project state)
- ./CLAUDE.md (Project instructions, if exists)
- .claude/skills/ or .agents/skills/ (Project skills, if either exists: list skills, read SKILL.md for each, follow relevant rules during implementation)
</files_to_read>

${AGENT_SKILLS_EXECUTOR}

<constraints>
- Execute all tasks in the plan
- Commit each task atomically
- Create summary at: ${QUICK_DIR}/${quick_id}-SUMMARY.md
- Do NOT update ROADMAP.md (quick tasks are separate from planned phases)
</constraints>
",
  subagent_type="gsd-executor",
  model="{executor_model}",
  isolation="worktree",
  description="Execute: ${DESCRIPTION}"
)
```

After executor returns:
1. Verify summary exists at `${QUICK_DIR}/${quick_id}-SUMMARY.md`
2. Extract commit hash from executor output
3. Compute the task diff, used by every gate below:

```bash
CHANGED=$(git diff --name-only "${BASE_SHA}"..HEAD)
[ -z "$CHANGED" ] && CHANGED=$(git diff --name-only HEAD~1..HEAD)
```

**Known Claude Code bug (classifyHandoffIfNeeded):** If executor reports "failed" with error `classifyHandoffIfNeeded is not defined`, this is a Claude Code runtime bug, not a real failure. Check if summary file exists and git log shows commits. If so, treat as successful.

If summary not found, error: "Executor failed to create ${quick_id}-SUMMARY.md"

---

**Step 8: Quality gates (SIMPLIFY + JANITOR + SECURITY)**

**SIMPLE & EFFICACE gates**: quality + cleanup + security before goal verification. Advisory: they surface opportunities, the human decides (GO/NO-GO). They never block the flow.

**A quick task gets the same three gates as a phase.** Short is not an excuse: dead code and a missing auth check cost the same whatever the size of the task that introduced them.

**The three gates read the same diff and write nothing until the human says GO.** So they run in ONE parallel batch and produce ONE checkpoint. Running them in sequence triples the wall-clock and, worse, wakes the human three times for the same diff (loi : `~/.claude/se/CONVENTIONS.md` §11).

**Config gates** (same keys and same defaults as `execute-phase`: one source of truth, no second dialect):
```bash
SIMPLIFY_ENABLED=$(gsd-sdk query config-get workflow.simplify_gate 2>/dev/null || node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" config-get workflow.simplify_gate 2>/dev/null || echo "false")
JANITOR_ENABLED=$(gsd-sdk query config-get workflow.janitor_gate 2>/dev/null || node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" config-get workflow.janitor_gate 2>/dev/null || echo "false")
SECURITY_ENABLED=$(gsd-sdk query config-get workflow.security_gate 2>/dev/null || node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" config-get workflow.security_gate 2>/dev/null || echo "false")

DEPS_CHANGED=$(echo "$CHANGED" | grep -E '^(package\.json|package-lock\.json|pnpm-lock\.yaml|bun\.lock)$' | sort -u)
```

Unlike `execute-phase`, SECURITY here has **no sensitive-surface condition**: an enabled gate always runs. A quick task is exactly where a lone route or a lone dependency slips in without anyone calling it a security change.

**Step 8a, spawn every enabled gate IN PARALLEL, in a SINGLE message.**

Each gate is invoked in `--report-only` mode: it reads, it reports, it changes nothing.

```
Task(subagent_type="general-purpose", model="opus",
     prompt="Invoke Skill(se-gate-simplify) with args 'quick ${quick_id} --report-only, fichiers modifiés : ${CHANGED}'. Return its report block verbatim and nothing else. Modify no file, run no build, ask no question.")

Task(subagent_type="general-purpose", model="opus",
     prompt="Invoke Skill(se-gate-janitor) with args 'quick ${quick_id} --report-only, fichiers modifiés : ${CHANGED}'. Return its report block verbatim and nothing else. Delete no file, commit nothing, ask no question.")

Task(subagent_type="general-purpose", model="opus",
     prompt="Invoke Skill(se-security) with args 'quick ${quick_id} --report-only, fichiers modifiés : ${CHANGED}'. ${DEPS_CHANGED:+Dependencies changed (${DEPS_CHANGED}): also run the supply-chain grid (§5 of the skill), audit, install scripts of NEW deps, pinning, provenance.} If this task exposes the project's first public route and next.config.* declares no headers(), report 'Headers de sécurité absents, template : .planning/_templates/security-headers.md'. Return findings and verdict, nothing else. Modify no file, ask no question.")
```

A disabled gate is simply not spawned: display `Gate {name} skipped (désactivée dans config.json)` and move on. Model per `~/.claude/se/CONVENTIONS.md` §9: these gates judge, so `opus`.

**Step 8b, one grouped checkpoint** (form imposed by `Skill(se-checkpoint)`, type `human-verify`):

```
CHECKPOINT · Gates quick ${quick_id}                   [human-verify]

Fait        {n} fichiers modifiés · gates lancées en parallèle : {liste}
Mesuré      SIMPLIFY  P0 {a} · P1 {b}
            JANITOR   DEAD {c} · VIOLATION {d} · SUSPECT {e}
            SECURITY  CRITICAL {f} · HIGH {g}
À juger     1. [SUSPECT] fichier:ligne · <pourquoi le doute>
            2. [CRITICAL] fichier:ligne · <attaque> · fix : <...>
            (4 maximum, ce qui est mesuré ne se juge pas, il passe avec le GO)
Regarder    <fichiers:lignes concernés>

→ Appliquer P0 + DEAD + VIOLATION + les fixes CRITICAL ? [GO / sélection / NO-GO]
```

Ce qui est déjà tranché par la mesure (P0, DEAD, VIOLATION) n'entre pas dans « À juger » : seuls les SUSPECT et les CRITICAL demandent l'avis humain. Les P1 vont au journal.

**Step 8c, apply sequentially, after the GO.** Writing is never parallel (§11). Order matters:

1. CRITICAL security fixes,
2. SIMPLIFY P0,
3. JANITOR DEAD + VIOLATION (cleaning last: it must not delete code a simplification just moved).

Atomic commits separated by category, then `npm run build && npm run type-check` **once for the whole batch**, not once per gate.

**Journal:** one `## Gates` section in `${QUICK_DIR}/${quick_id}-CHECKPOINTS.md` (gabarit `.planning/_templates/CHECKPOINTS.template.md`): what each gate measured, the human's answer verbatim, what was applied, and every accepted exception with its written reason. A CRITICAL left unfixed is only legal with that written reason.

**Error handling:** if a subagent fails or throws, display "Gate {name} encountered an error (non-blocking): {error}" and keep the other reports. A missing tool (npm absent, detector unavailable) is noted "non vérifiable" in the report, never a blocker. Gate failures must NEVER block execution.

Regardless of gate results, ALWAYS proceed to Step 9.

---

**Step 9: Visual checkpoint (frontend tasks only)**

**SIMPLE & EFFICACE, checkpoint visuel MESURÉ (Playwright).** Une tâche quick qui touche du front est livrée sous les mêmes yeux qu'une phase : mesurer le rendu réel, rendre un verdict chiffré, puis présenter les captures à l'humain. C'est aussi ce qui enregistre la passe `/se-ui` : sans elle, le hook `se-ui-gate` refusera le commit final.

Ce que la machine tranche : WCAG 2.2 AA, tailles et poids typographiques réellement rendus, espacements hors grille, cibles < 44px, débordements, focus visible, pièges clavier, `prefers-reduced-motion`, Core Web Vitals, anti-patterns. Ce que l'humain tranche : est-ce que c'est beau, est-ce que la direction se voit.

**Config gate:**
```bash
# Défaut `true` : une clé absente veut dire « projet créé avant que la gate existe »,
# pas « l'humain n'en veut pas ». Même convention que les hooks (seFlag, guard-lib.cjs).
VISUAL_ENABLED=$(gsd-sdk query config-get workflow.visual_checkpoint 2>/dev/null || node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" config-get workflow.visual_checkpoint 2>/dev/null || echo "true")
UI_GATE_BLOCKING=$(gsd-sdk query config-get workflow.ui_gate_blocking 2>/dev/null || node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" config-get workflow.ui_gate_blocking 2>/dev/null || echo "true")

# Front touché par CETTE tâche ?
FRONT_CHANGED=$(echo "$CHANGED" | grep -E '\.(tsx|jsx|css|scss|vue|svelte)$|(^|/)(components|pages|app)/' | sort -u)
```

**Skip conditions:** if VISUAL_ENABLED is `"false"`, OR `FRONT_CHANGED` is empty → display `Checkpoint visuel non applicable (aucun fichier front modifié)` and proceed to Step 10.

**Step 9a, préparer Playwright (Claude le fait, pas l'humain):**
```bash
HAS_CONFIG=$([ -f "playwright.config.ts" ] || [ -f "playwright.config.js" ] && echo 1 || echo 0)
HAS_RUNNER=$([ -f "tests/e2e/ui-verify.spec.ts" ] && echo 1 || echo 0)
HAS_DEP=$([ -d "node_modules/@playwright/test" ] && echo 1 || echo 0)
HAS_AXE=$([ -d "node_modules/@axe-core/playwright" ] && echo 1 || echo 0)
```
- `HAS_CONFIG=0` → proposer de copier `$HOME/.claude/se/templates/playwright.config.template.ts` → `playwright.config.ts`
- `HAS_RUNNER=0` → proposer de copier `$HOME/.claude/se/templates/ui-verify.template.ts` → `tests/e2e/ui-verify.spec.ts`
- `HAS_DEP=0` → proposer `npm i -D @playwright/test`
- `HAS_AXE=0` → proposer `npm i -D @axe-core/playwright` (sans lui, les règles WCAG passent SKIPPED)

Le serveur de dev n'est PAS lancé ici : Playwright le gère seul via `webServer`. Pour l'URL du checkpoint humain en Step 9f, demander à l'humain de lancer `npm run dev` s'il n'en a pas déjà un (loi : `~/.claude/se/CONVENTIONS.md` §12) ; en flux autonome uniquement, passer par `se-serve.cjs start`. Si l'humain décline une installation, la gate passe en non-bloquant : on ne bloque jamais sur un outil absent.

**Step 9b, mesurer.** Les écrans à vérifier = ceux touchés par `FRONT_CHANGED`, complétés par les étapes des parcours concernés dans `.planning/design/JOURNEYS.md` (étape amont et aval : la friction vit dans les transitions). Une tâche quick ne touche en général qu'un écran, n'en mesurer plus que si le parcours l'exige.

Plusieurs écrans : **un seul message, un run par écran** (§11).

```bash
UI_ROUTE="<route>" UI_NAME="<ecran>" npx playwright test tests/e2e/ui-verify.spec.ts
# → .planning/_ui/ui-report.<ecran>.{desktop,tablet,mobile}.json + les captures
#   (.planning/_ui/ est gitignoré : jamais dans le dossier de la tâche)
```

**Step 9c, verdict mesuré:**
```bash
node "$HOME/.claude/se/scripts/ui-verdict.cjs" --name "<ecran>"          # BLOCK / FLAG / PASS, sortie 1 sur BLOCK

node "$HOME/.claude/se/vendor/design/impeccable/detect.mjs" --json "http://localhost:3000<route>"
node "$HOME/.claude/se/vendor/design/impeccable/detect.mjs" --json --viewport 390x844 "http://localhost:3000<route>"
```

**Step 9d, humanizer sur les textes réellement affichés.** Le rapport contient `text.visible` : tous les textes du rendu, y compris ceux venus de composants tiers ou de props par défaut, que la relecture de source rate.
```
Skill(skill="se-humanizer", args="textes visibles de l'écran <ecran>, voir text.visible dans .planning/_ui/ui-report.<ecran>.desktop.json")
```
Priorité aux CTA, messages d'erreur et états vides : ce sont des BLOCK dans `ui-rules.json`. **Cette passe vaut pour la Step 10** : ne pas relancer le humanizer sur les mêmes textes.

**Step 9e, traitement des BLOCK.** Si `ui-verdict.cjs` sort en 1 et `UI_GATE_BLOCKING` est `"true"` : les BLOCK doivent être **corrigés**, ou explicitement acceptés par l'humain avec une raison écrite dans `.planning/design/ui-exceptions.json` et en §6 de `DESIGN-SYSTEM.md`. Une exception ne rétrograde rien sur Copywriting, Registry Safety et Accessibility.

Après correction, relancer 9b et 9c. Une seule boucle de correction, puis on présente ce qui reste à l'humain.

**Step 9f, checkpoint humain (ce que la mesure ne dit pas).** Donner l'**URL exacte**. Si aucun serveur ne tourne, donner la commande, seule sur sa ligne, et attendre :
```bash
npm run dev
```

Forme imposée par `Skill(se-checkpoint)`, type `human-verify` : quatre points à juger au maximum, et jamais un point que la mesure a déjà tranché.
```
CHECKPOINT · écran {nom} (quick ${quick_id})           [human-verify]

Fait        <ce qui a été livré sur cet écran, 3 lignes maximum>
Mesuré      BLOCK {n} · FLAG {n} · PASS {n}   (détail : node "$HOME/.claude/se/scripts/ui-verdict.cjs" --name {nom})
            captures desktop / tablet / mobile dans .planning/_ui/
À juger     1. la direction §0.2 se voit-elle, ou est-elle seulement écrite ?
            2. l'oeil se pose-t-il sur le focal point déclaré ?
            3. qu'est-ce qui trahit une origine générique ici ?
Regarder    http://localhost:3000{route}   ← le rendu réel, pas seulement les captures

→ Le rendu part en commit ? [GO / décrire les problèmes]
```

Consigner verdict mesuré + verdict humain + chemins des captures dans `${QUICK_DIR}/${quick_id}-CHECKPOINTS.md`. Sur GO :
1. enregistrer la passe, sans quoi le hook `se-ui-gate` refusera le commit final de la Step 13 :
```bash
node "$HOME/.claude/se/scripts/ui-pass.cjs" record <fichiers front de la tâche> --url "http://localhost:3000{route}" --go "<réponse humaine>"
```
(le registre `.planning/design/ui-passes.json` s'inclut dans le commit de la tâche) ;
2. passer les étapes de parcours concernées à `vérifié` dans `.planning/design/JOURNEYS.md` (+ date du checkpoint) ;
3. **ne rien laisser tourner.** Le serveur de l'humain lui appartient, on n'y touche pas. Ce qu'un flux autonome a démarré se tue tout de suite, GO ou NO-GO, chemin d'erreur compris :
```bash
node "$HOME/.claude/se/scripts/se-serve.cjs" stop --all
```
Le hook `se-server-reaper` repasse en fin de session, mais c'est un filet, pas une dispense.

**Error handling:** si Playwright échoue (serveur, timeout, outil absent), display "Checkpoint visuel non disponible (non-bloquant): {error}" et proceed. Un échec de MESURE ne bloque jamais : seul un BLOCK mesuré bloque. On ne refuse pas une livraison sur ce qu'on n'a pas su vérifier.

Regardless of result, ALWAYS proceed to Step 10.

---

**Step 10: Humanizer (user-facing text outside the front)**

**SIMPLE & EFFICACE, l'anti-slop sur ce que l'humain lira.** Le checkpoint visuel couvre les textes rendus à l'écran. Reste tout le reste : README, docs publiées, copy d'emails, messages d'erreur de CLI, libellés de scripts.

Detect user-facing text in `CHANGED` with the same heuristic as the `se-slop-gate` hook (`isUserFacingFile` dans `~/.claude/se/hooks/guard-lib.cjs`, SOURCE UNIQUE) : `*.md` hors `.planning/`, copy, emails, i18n, chaînes affichées.

**Skip conditions:**
- No user-facing text in `CHANGED` → display `Humanizer non applicable (aucun texte user-facing modifié).` and proceed.
- Step 9d already ran AND every user-facing file is a front file already covered by it → display `Humanizer déjà passé sur les textes rendus.` and proceed.

```
Skill(skill="se-humanizer", args="textes user-facing modifiés par la tâche quick ${quick_id} : <liste des fichiers>")
```

Appliquer les corrections, puis commit atomique `fix(quick-${quick_id}): passe humanizer`. Sans cette passe, le hook `se-slop-gate` bloquera le commit final si le texte porte assez de marqueurs.

---

**Step 11: Verification**

**Une tâche quick prouve son objectif comme une phase.** Le `must_haves` du plan a été écrit pour ça.

Display banner:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► VERIFYING RESULTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

◆ Spawning verifier...
```

```
Task(
  prompt="Verify quick task goal achievement.
Task directory: ${QUICK_DIR}
Task goal: ${DESCRIPTION}

<files_to_read>
- ${QUICK_DIR}/${quick_id}-PLAN.md (Plan)
</files_to_read>

${AGENT_SKILLS_VERIFIER}

Check must_haves against actual codebase. A grep that finds the symbol proves nothing: verify the behaviour end to end. Create VERIFICATION.md at ${QUICK_DIR}/${quick_id}-VERIFICATION.md.",
  subagent_type="gsd-verifier",
  model="{verifier_model}",
  description="Verify: ${DESCRIPTION}"
)
```

Read verification status:
```bash
grep "^status:" "${QUICK_DIR}/${quick_id}-VERIFICATION.md" | cut -d: -f2 | tr -d ' '
```

Store as `$VERIFICATION_STATUS`.

| Status | Action |
|--------|--------|
| `passed` | Store `$VERIFICATION_STATUS = "Verified"`, continue to step 12 |
| `human_needed` | Display items needing manual check, store `$VERIFICATION_STATUS = "Needs Review"`, continue |
| `gaps_found` | Display gap summary, offer: 1) Re-run executor to fix gaps, 2) Accept as-is. Store `$VERIFICATION_STATUS = "Gaps"` |

---

**Step 12: Update STATE.md**

**12a. Check if "Quick Tasks Completed" section exists** in STATE.md (`### Quick Tasks Completed`).

**12b. If it doesn't exist, create it** after the `### Blockers/Concerns` section:

```markdown
### Quick Tasks Completed

| # | Description | Date | Commit | Status | Directory |
|---|-------------|------|--------|--------|-----------|
```

If the table already exists without a Status column, add the Status column to the header and separator rows and leave Status empty for existing rows.

**12c. Append new row:**

```markdown
| ${quick_id} | ${DESCRIPTION} | ${date} | ${commit_hash} | ${VERIFICATION_STATUS} | [${quick_id}-${slug}](./quick/${quick_id}-${slug}/) |
```

**12d. Update "Last activity" line:**

```
Last activity: ${date} - Completed quick task ${quick_id}: ${DESCRIPTION}
```

Use Edit tool to make these changes atomically.

---

**Step 13: Final commit and completion**

Build file list:
- `${QUICK_DIR}/${quick_id}-PLAN.md`
- `${QUICK_DIR}/${quick_id}-SUMMARY.md`
- `.planning/STATE.md`
- If context file exists: `${QUICK_DIR}/${quick_id}-CONTEXT.md`
- If research file exists: `${QUICK_DIR}/${quick_id}-RESEARCH.md`
- If checkpoints file exists: `${QUICK_DIR}/${quick_id}-CHECKPOINTS.md`
- If verification file exists: `${QUICK_DIR}/${quick_id}-VERIFICATION.md`
- If the visual checkpoint recorded a pass: `.planning/design/ui-passes.json`

```bash
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" commit "docs(quick-${quick_id}): ${DESCRIPTION}" --files ${file_list}
```

Get final commit hash:
```bash
commit_hash=$(git rev-parse --short HEAD)
```

Display completion output:

```
---

GSD > QUICK TASK COMPLETE

Quick Task ${quick_id}: ${DESCRIPTION}

${CONTEXT_EXISTS ? 'Contexte: ' + QUICK_DIR + '/' + quick_id + '-CONTEXT.md' : ''}
${RESEARCH_EXISTS ? 'Recherche: ' + QUICK_DIR + '/' + quick_id + '-RESEARCH.md' : ''}
Gates: ${gates_summary}
${FRONT_CHANGED ? 'Checkpoint visuel: ' + verdict_mesure + ' / ' + verdict_humain : ''}
Summary: ${QUICK_DIR}/${quick_id}-SUMMARY.md
Verification: ${QUICK_DIR}/${quick_id}-VERIFICATION.md (${VERIFICATION_STATUS})
Commit: ${commit_hash}

---

Ready for next task: /gsd:quick ${GSD_WS}
```

</process>

<success_criteria>
- [ ] ROADMAP.md validation passes
- [ ] User provides task description
- [ ] `--full` and `--no-research` flags parsed; legacy `--discuss`/`--research` accepted and ignored
- [ ] Quick ID generated (YYMMDD-xxx format), directory created at `.planning/quick/YYMMDD-xxx-slug/`
- [ ] `Skill(se-interview)` invoked; `${quick_id}-CONTEXT.md` written when at least one decision was taken
- [ ] Research agent spawned (unless `--no-research`), `${quick_id}-RESEARCH.md` created
- [ ] `${quick_id}-PLAN.md` created with `must_haves`, honoring CONTEXT.md and RESEARCH.md
- [ ] (--full) Plan checker validates plan, revision loop capped at 2
- [ ] `BASE_SHA` recorded before execution, `CHANGED` computed from the real diff
- [ ] `${quick_id}-SUMMARY.md` created by executor
- [ ] Enabled gates SIMPLIFY / JANITOR / SECURITY spawned in ONE parallel message, ONE grouped checkpoint, applied sequentially after GO
- [ ] Front files touched → measured visual checkpoint run, humanizer on `text.visible`, human GO recorded via `ui-pass.cjs record`
- [ ] User-facing text outside the front → `Skill(se-humanizer)` run
- [ ] `${quick_id}-CHECKPOINTS.md` journals gates + visual verdicts and the human's verbatim answers
- [ ] `${quick_id}-VERIFICATION.md` created by verifier
- [ ] STATE.md updated with quick task row including Status
- [ ] Artifacts committed
</success_criteria>
