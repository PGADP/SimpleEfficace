<purpose>
Execute small, ad-hoc tasks with GSD guarantees (atomic commits, STATE.md tracking). Quick mode spawns gsd-planner (quick mode) + gsd-executor(s), tracks tasks in `.planning/quick/`, and updates STATE.md's "Quick Tasks Completed" table.

**SIMPLE & EFFICACE, what a quick task always runs:**
- `Skill(se-interview)` before planning. The human decides, Claude recommends. It self-limits: nothing left to decide means no question asked.
- a focused research pass. A discussion cannot check an API contract.
- the SIMPLIFY / JANITOR / SECURITY / PROMPT gates on the resulting diff, in ONE parallel batch and ONE checkpoint. PROMPT only fires when the task touched a prompt (`/se-prompt`, advisory, no commit hook).
- the measured visual checkpoint (`/se-ui` ritual) **when the task touched frontend files**. It is also what unblocks the `se-ui-gate` commit hook.
- `Skill(se-humanizer)` **when the task touched user-facing text**: inside the visual checkpoint when there is a screen, standalone otherwise.
- `gsd-verifier` on the task goal.


With `--full` flag: enables the complete quality pipeline — discussion + research + plan-checking + verification. One flag for everything.

With `--validate` flag: enables plan-checking (max 2 iterations) and post-execution verification only. Use when you want quality guarantees without discussion or research.

With `--discuss` flag: lightweight discussion phase before planning. Surfaces assumptions, clarifies gray areas, captures decisions in CONTEXT.md so the planner treats them as locked.

With `--research` flag: spawns a focused research agent before planning. Investigates implementation approaches, library options, and pitfalls. Use when you're unsure how to approach a task.

Granular flags are composable: `--discuss --research --validate` gives the same result as `--full`.
</purpose>

<required_reading>
Read all files referenced by the invoking prompt's execution_context before starting.
</required_reading>

<available_agent_types>
Valid GSD subagent types (use exact names — do not fall back to 'general-purpose'):
- gsd-phase-researcher — Researches technical approaches for a phase
- gsd-planner — Creates detailed plans from phase scope
- gsd-plan-checker — Reviews plan quality before execution
- gsd-executor — Executes plan tasks, commits, creates SUMMARY.md
- gsd-verifier — Verifies phase completion, checks quality gates
- gsd-code-reviewer — Reviews source files for bugs, security issues, and code quality
</available_agent_types>

<process>
**Step 1: Parse arguments and get task description**

Parse `$ARGUMENTS` for:
- `--full` flag → store `$FULL_MODE=true`, `$DISCUSS_MODE=true`, `$RESEARCH_MODE=true`, `$VALIDATE_MODE=true`
- `--validate` flag → store `$VALIDATE_MODE=true`
- `--discuss` flag → store `$DISCUSS_MODE=true`
- `--research` flag → store `$RESEARCH_MODE=true`
- Remaining text → use as `$DESCRIPTION` if non-empty

After parsing, normalize: if `$DISCUSS_MODE` and `$RESEARCH_MODE` and `$VALIDATE_MODE` are all true, set `$FULL_MODE=true`. This ensures `--discuss --research --validate` is treated identically to `--full`.

```bash
_GSD_SHIM_NAME="gsd-tools.cjs"; _GSD_RUNTIME_ROOT="${RUNTIME_DIR:-$(git rev-parse --show-toplevel 2>/dev/null || pwd)}"; GSD_TOOLS="${_GSD_RUNTIME_ROOT}/gsd-core/bin/${_GSD_SHIM_NAME}"; if [ -f "$GSD_TOOLS" ]; then gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${_GSD_RUNTIME_ROOT}/.claude/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${_GSD_RUNTIME_ROOT}/.claude/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${_GSD_RUNTIME_ROOT}/.codex/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${_GSD_RUNTIME_ROOT}/.codex/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif command -v gsd-tools >/dev/null 2>&1; then GSD_TOOLS="$(command -v gsd-tools)"; gsd_run() { "$GSD_TOOLS" "$@"; }; elif [ -f "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${CLAUDE_CONFIG_DIR:-$HOME/.claude}/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${HERMES_HOME:-$HOME/.hermes}/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${HERMES_HOME:-$HOME/.hermes}/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${CURSOR_CONFIG_DIR:-$HOME/.cursor}/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${CURSOR_CONFIG_DIR:-$HOME/.cursor}/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${CODEX_HOME:-$HOME/.codex}/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${CODEX_HOME:-$HOME/.codex}/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${GEMINI_CONFIG_DIR:-$HOME/.gemini}/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${GEMINI_CONFIG_DIR:-$HOME/.gemini}/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${COPILOT_CONFIG_DIR:-$HOME/.copilot}/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${COPILOT_CONFIG_DIR:-$HOME/.copilot}/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${WINDSURF_CONFIG_DIR:-$HOME/.codeium/windsurf}/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${WINDSURF_CONFIG_DIR:-$HOME/.codeium/windsurf}/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${AUGMENT_CONFIG_DIR:-$HOME/.augment}/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${AUGMENT_CONFIG_DIR:-$HOME/.augment}/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${TRAE_CONFIG_DIR:-$HOME/.trae}/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${TRAE_CONFIG_DIR:-$HOME/.trae}/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${QWEN_CONFIG_DIR:-$HOME/.qwen}/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${QWEN_CONFIG_DIR:-$HOME/.qwen}/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${CODEBUDDY_CONFIG_DIR:-$HOME/.codebuddy}/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${CODEBUDDY_CONFIG_DIR:-$HOME/.codebuddy}/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${CLINE_CONFIG_DIR:-$HOME/.cline}/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${CLINE_CONFIG_DIR:-$HOME/.cline}/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${GROK_AGENTS_HOME:-$HOME/.agents}/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${GROK_AGENTS_HOME:-$HOME/.agents}/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${ANTIGRAVITY_CONFIG_DIR:-$HOME/.gemini/antigravity}/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${ANTIGRAVITY_CONFIG_DIR:-$HOME/.gemini/antigravity}/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${OPENCODE_CONFIG_DIR:-${XDG_CONFIG_HOME:-$HOME/.config}/opencode}/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${OPENCODE_CONFIG_DIR:-${XDG_CONFIG_HOME:-$HOME/.config}/opencode}/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; elif [ -f "${KILO_CONFIG_DIR:-${XDG_CONFIG_HOME:-$HOME/.config}/kilo}/gsd-core/bin/${_GSD_SHIM_NAME}" ]; then GSD_TOOLS="${KILO_CONFIG_DIR:-${XDG_CONFIG_HOME:-$HOME/.config}/kilo}/gsd-core/bin/${_GSD_SHIM_NAME}"; gsd_run() { node "$GSD_TOOLS" "$@"; }; else echo "ERROR: gsd-tools.cjs not found at $GSD_TOOLS and gsd-tools is not on PATH. Run: npx -y @opengsd/gsd-core@latest --claude --local" >&2; exit 1; fi; if [ -n "${CLAUDE_ENV_FILE:-}" ] && [ -n "${GSD_TOOLS:-}" ]; then printf "export PATH='%s':\"\$PATH\"\n" "${GSD_TOOLS%/*}" >> "$CLAUDE_ENV_FILE" 2>/dev/null || true; fi
RESPONSE_LANGUAGE=$(gsd_run query config-get response_language --default "" 2>/dev/null || echo "")
```

**If `response_language` is set:** All user-facing questions, prompts, and explanations in this workflow MUST be presented in `{response_language}`. Technical terms, code, file paths, and subagent prompts stay in English — only user-facing output is translated.

If `$DESCRIPTION` is empty after parsing, prompt user interactively:

**Text mode (`workflow.text_mode: true` in config or `--text` flag):** Set `TEXT_MODE=true` if `--text` is present in `$ARGUMENTS` OR `text_mode` from init JSON is `true`. When TEXT_MODE is active, replace every `AskUserQuestion` call with a plain-text numbered list and ask the user to type their choice number. This is required for non-Claude runtimes (OpenAI Codex, Gemini CLI, etc.) where `AskUserQuestion` is not available.

```
AskUserQuestion(
  header: "Quick Task",
  question: "What do you want to do?",
  followUp: null
)
```

Store response as `$DESCRIPTION`.

If still empty, re-prompt: "Please provide a task description."

Display banner based on active flags:

If `$FULL_MODE` (all phases enabled — `--full` or all granular flags):
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► QUICK TASK (FULL)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

◆ Discussion + research + plan checking + verification enabled
```

If `$DISCUSS_MODE` and `$VALIDATE_MODE` (no research):
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► QUICK TASK (DISCUSS + VALIDATE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

◆ Discussion + plan checking + verification enabled
```

If `$DISCUSS_MODE` and `$RESEARCH_MODE` (no validate):
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► QUICK TASK (DISCUSS + RESEARCH)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

◆ Discussion + research enabled
```

If `$RESEARCH_MODE` and `$VALIDATE_MODE` (no discuss):
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► QUICK TASK (RESEARCH + VALIDATE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

◆ Research + plan checking + verification enabled
```

If `$DISCUSS_MODE` only:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► QUICK TASK (DISCUSS)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

◆ Discussion phase enabled — surfacing gray areas before planning
```

If `$RESEARCH_MODE` only:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► QUICK TASK (RESEARCH)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

◆ Research phase enabled — investigating approaches before planning
```

If `$VALIDATE_MODE` only:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► QUICK TASK (VALIDATE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

◆ Plan checking + verification enabled
```

---

**Step 2: Initialize**

```bash
DISCUSS_PARAM=""; if [[ "$ARGUMENTS" =~ (^|[[:space:]])--discuss([[:space:]]|$) ]]; then DISCUSS_PARAM="--discuss"; fi
RESEARCH_PARAM=""; if [[ "$ARGUMENTS" =~ (^|[[:space:]])--research([[:space:]]|$) ]]; then RESEARCH_PARAM="--research"; fi
VALIDATE_PARAM=""; if [[ "$ARGUMENTS" =~ (^|[[:space:]])--validate([[:space:]]|$) ]]; then VALIDATE_PARAM="--validate"; fi
FULL_PARAM=""; if [[ "$ARGUMENTS" =~ (^|[[:space:]])--full([[:space:]]|$) ]]; then FULL_PARAM="--full"; fi
INIT=$(gsd_run query init.quick "$DESCRIPTION" $DISCUSS_PARAM $RESEARCH_PARAM $VALIDATE_PARAM $FULL_PARAM)
if [[ "$INIT" == @file:* ]]; then INIT=$(cat "${INIT#@file:}"); fi
AGENT_SKILLS_PLANNER=$(gsd_run query agent-skills gsd-planner)
AGENT_SKILLS_EXECUTOR=$(gsd_run query agent-skills gsd-executor)
AGENT_SKILLS_CHECKER=$(gsd_run query agent-skills gsd-plan-checker)
AGENT_SKILLS_VERIFIER=$(gsd_run query agent-skills gsd-verifier)
```

Parse JSON for: `planner_model`, `executor_model`, `checker_model`, `verifier_model`, `reviewer_model`, `commit_docs`, `branch_name`, `quick_id`, `slug`, `date`, `timestamp`, `quick_dir`, `task_dir`, `roadmap_exists`, `planning_exists`, `response_language`.

`init.quick` does not emit dedicated `state_path`/`project_path` fields, so derive them from the already-absolute `quick_dir` (#2376 — files handed to a spawned subagent must resolve regardless of that subagent's own cwd):
```bash
STATE_PATH="$(dirname "${quick_dir}")/STATE.md"
PROJECT_PATH="$(dirname "${quick_dir}")/PROJECT.md"
```

```bash
USE_WORKTREES=$(gsd_run query config-get workflow.use_worktrees --raw 2>/dev/null || echo "true")
RUNTIME=$(gsd_run query config-get runtime --default claude --raw 2>/dev/null || echo "claude")
```

**Resolve isolation now (#2584/#2652).** Read @gsd-core/references/dispatch-isolation-gate.md
and run its `Resolve ISOLATION`, `Single-agent dispatch sites`, and `Resolve the harness flag`
blocks in order; they set `ISOLATION`/`HARNESS_FLAG` via `query dispatch-isolation`.
`ISOLATION` — not `RUNTIME` — gates every worktree decision below. Substitute `{harnessFlag}`
in Step 6's `Agent()` with `$HARNESS_FLAG`+comma when `ISOLATION = "harness-worktree"`, else
empty. `{harnessFlag}`
is a template placeholder, not a shell variable.

If `USE_WORKTREES` is not `"false"`, run a startup orphan sweep before spawning any executors. This reaps locked worktrees whose lock-owner process is dead, whose branch is merged into the default branch, and whose lock file mtime is older than 5 minutes. Running it at startup prevents accumulation of orphaned worktrees from prior sessions that exited without cleanup (#3707).

```bash
if [ "$USE_WORKTREES" != "false" ]; then
  gsd_run query worktree.reap-orphans 2>/dev/null || true
fi
```

If the project uses git submodules, worktree isolation is unsafe **only when the quick task touches a submodule path**. The previous behavior unconditionally disabled worktree isolation whenever `.gitmodules` existed, which penalised every quick task in a submodule project even when the task was nowhere near a submodule. Parse submodule paths from `.gitmodules` so the executor can act on actual submodule paths rather than the mere file's existence:

```bash
# Parse submodule paths from .gitmodules once (empty if no .gitmodules).
# SUBMODULE_PATHS is a newline-separated list of repo-relative paths used as
# a fail-loud commit-time guard inside the quick-task executor — if the
# executor stages any path that falls inside SUBMODULE_PATHS, it must abort
# the commit and surface the conflict rather than silently corrupting the
# submodule state.
if [ -f .gitmodules ]; then
  SUBMODULE_PATHS=$(git config --file .gitmodules --get-regexp '^submodule\..*\.path$' 2>/dev/null | awk '{print $2}')
else
  SUBMODULE_PATHS=""
fi
```

Quick mode does not have a pre-declared `files_modified` list (the task is freeform), so use a fail-loud guard at commit time: when the executor stages files for the quick-task commit, if any staged path falls inside a `SUBMODULE_PATHS` entry, abort with a clear error explaining that worktree-isolated commits cannot safely span submodule boundaries — the user can re-run with `workflow.use_worktrees=false` to fall back to sequential execution on the main tree. If `SUBMODULE_PATHS` is empty (no `.gitmodules` in the repo), worktree isolation proceeds normally.

**If `roadmap_exists` is false:** Error — Quick mode requires an active project with ROADMAP.md. Run `/gsd-new-project` first.

Quick tasks can run mid-phase - validation only checks ROADMAP.md exists, not phase status.

---

**Step 2.5: Handle quick-task branching**

**If `branch_name` is empty/null:** Skip and continue on the current branch.

**If `branch_name` is set:** Check out the quick-task branch before any planning commits.

The new branch must fork off the project's default branch (`origin/HEAD`), not
off whatever HEAD happens to be checked out — otherwise consecutive quick tasks
compound on top of each other and stay unpushed (#2916). If `$branch_name`
already exists locally, reuse it as-is so resumed work is not rebased.

```bash
DEFAULT_BRANCH=$(gsd_run query git.base-branch 2>/dev/null \
  || git symbolic-ref --quiet --short refs/remotes/origin/HEAD 2>/dev/null | sed 's|^origin/||' \
  || echo main)

if git show-ref --verify --quiet "refs/heads/$branch_name"; then
  git switch "$branch_name" \
    || { echo "ERROR: Could not switch to existing quick-task branch '$branch_name'." >&2; exit 1; }
else
  # Fetch the default branch so origin/$DEFAULT_BRANCH is current. If the fetch
  # fails (offline, no remote, auth failure) AND we have no local copy of
  # origin/$DEFAULT_BRANCH to fall back on, abort — creating the branch off
  # arbitrary HEAD is exactly the bug #2916 fixed.
  if ! git fetch --quiet origin "$DEFAULT_BRANCH"; then
    if ! git show-ref --verify --quiet "refs/remotes/origin/$DEFAULT_BRANCH"; then
      echo "ERROR: Could not fetch origin/$DEFAULT_BRANCH and no local copy exists. Refusing to create '$branch_name' off the current HEAD (#2916). Resolve the remote/network issue and retry." >&2
      exit 1
    fi
    echo "WARNING: git fetch origin $DEFAULT_BRANCH failed; using the local copy of origin/$DEFAULT_BRANCH as base." >&2
  fi

  if [ -n "$(git status --porcelain)" ]; then
    echo "WARNING: Uncommitted changes present. Carrying them onto the new quick-task branch — they will be branched off origin/$DEFAULT_BRANCH (not the previous-task HEAD)."
  else
    # Best-effort: fast-forward the local default branch so subsequent local
    # work sees the latest tip. Failure here is non-fatal because we always
    # create the new branch directly from origin/$DEFAULT_BRANCH below.
    git switch --quiet "$DEFAULT_BRANCH" 2>/dev/null \
      && git merge --ff-only --quiet "origin/$DEFAULT_BRANCH" 2>/dev/null \
      || true
  fi

  # Pin the new branch to origin/$DEFAULT_BRANCH so the start point is
  # deterministic regardless of which branch we are currently on (#2916).
  # On success HEAD is exactly at origin/$DEFAULT_BRANCH, so a post-creation
  # merge-base / "ahead-of" guard would be unreachable — the explicit base
  # argument here is the single source of correctness for #2916.
  # --no-track: with the default branch.autoSetupMerge=true, checkout -b from a
  # remote-tracking ref wires branch.<name>.merge to refs/heads/$DEFAULT_BRANCH
  # (origin/master), so a GUI sync pushes quick-task commits straight onto
  # origin/$DEFAULT_BRANCH, bypassing PR review (#2498).
  git checkout -b "$branch_name" "origin/$DEFAULT_BRANCH" --no-track \
    || { echo "ERROR: Could not create '$branch_name' from origin/$DEFAULT_BRANCH (#2916)." >&2; exit 1; }
fi
```

All quick-task commits for this run stay on that branch. User handles merge/rebase afterward.

---

**Step 3: Create task directory**

```bash
mkdir -p "${task_dir}"
```

---

**Step 4: Create quick task directory**

Create the directory for this quick task:

```bash
QUICK_DIR="${task_dir}"
mkdir -p "$QUICK_DIR"
```

Report to user:
```
Creating quick task ${quick_id}: ${DESCRIPTION}
Directory: ${QUICK_DIR}
```

Store `$QUICK_DIR` for use in orchestration.

---

If `section_manifest` is `null` or `"discussion-phase"` is in its `included` list: read and execute `gsd-core/workflows/quick/steps/discussion-phase.md`. Otherwise skip — do not read the file.

---

If `section_manifest` is `null` or `"research-phase"` is in its `included` list: read and execute `gsd-core/workflows/quick/steps/research-phase.md`. Otherwise skip — do not read the file.

---

---

**Step 4.5: Interview SE (always)**

**Skip this step if the upstream discussion already ran in this invocation (`--full` or `--discuss`): one interview, never two.**

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

**Step 4.6: Research SE (always, unless `--no-research`)**

**Skip this step if the upstream research already ran in this invocation (`--full` or `--research`).**

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


**Step 5: Spawn planner (quick mode)**

**If `$VALIDATE_MODE`:** Use `quick-full` mode with stricter constraints.

**If NOT `$VALIDATE_MODE`:** Use standard `quick` mode.

Display: `◆ Spawning planner... (runs in a subagent — no output until it returns, ~1–5 min; expected, not a freeze)`

```
Agent(
  prompt="
<planning_context>

**Mode:** ${VALIDATE_MODE ? 'quick-full' : 'quick'}
**Directory:** ${QUICK_DIR}
**Description:** ${DESCRIPTION}

<required_reading>
- ${STATE_PATH} (Project State)
- ./CLAUDE.md or ./.claude/CLAUDE.md (if exists — follow project-specific guidelines)
${DISCUSS_MODE ? '- ' + QUICK_DIR + '/' + quick_id + '-CONTEXT.md (User decisions — locked, do not revisit)' : ''}
${RESEARCH_MODE ? '- ' + QUICK_DIR + '/' + quick_id + '-RESEARCH.md (Research findings — use to inform implementation choices)' : ''}
</required_reading>

${AGENT_SKILLS_PLANNER}

**Project skills:** Check .claude/skills/ or .agents/skills/ directory (if either exists) — read SKILL.md files, plans should account for project skill rules

</planning_context>

<constraints>
- Create a SINGLE plan with 1-3 focused tasks
- Quick tasks should be atomic and self-contained
${RESEARCH_MODE ? '- Research findings are available — use them to inform library/pattern choices' : '- No research phase'}
${VALIDATE_MODE ? '- Target ~40% context usage (structured for verification)' : '- Target ~30% context usage (simple, focused)'}
${VALIDATE_MODE ? '- MUST generate `must_haves` in plan frontmatter (truths, artifacts, key_links)' : ''}
${VALIDATE_MODE ? '- Each task MUST have `files`, `action`, `verify`, `done` fields' : ''}
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

> **ORCHESTRATOR RULE — CODEX RUNTIME**: After calling Agent() above, stop working on this task immediately. Do not read more files, edit code, or run tests related to this task while the subagent is active. Wait for the subagent to return its result. This prevents duplicate work, conflicting edits, and wasted context. Only resume when the subagent result is available.

After planner returns:
1. Verify plan exists at `${QUICK_DIR}/${quick_id}-PLAN.md`
2. Extract plan count (typically 1 for quick tasks)
3. Report: "Plan created: ${QUICK_DIR}/${quick_id}-PLAN.md"

If plan not found, error: "Planner failed to create ${quick_id}-PLAN.md"

---

If `section_manifest` is `null` or `"plan-checker-loop"` is in its `included` list: read and execute `gsd-core/workflows/quick/steps/plan-checker-loop.md`. Otherwise skip — do not read the file.

---

If `section_manifest` is `null` or `"worktree-pre-dispatch-commit"` is in its `included` list: read and execute `gsd-core/workflows/quick/steps/worktree-pre-dispatch-commit.md`. Otherwise skip — do not read the file.

---

**Step 6: Spawn executor**

Auto-degrade to sequential if HEAD has diverged from the worktree fork base (#1941, mirrors
execute-phase's #683/#1369 guard). Claude Code's `isolation="worktree"` forks new worktrees from
`origin/HEAD`, not the live local HEAD. If a prior quick task in this session (or the Step 5.6
pre-dispatch plan commit above) advanced local HEAD without an intervening `git push`,
`origin/HEAD` stays pinned to a stale ancestor and the executor's `worktree_branch_check` guard
halts with a base-mismatch fatal — potentially many commits behind, not just one. Run this check
immediately before capturing `EXPECTED_BASE` so it reflects the most current local state.

```bash
if [ "$ISOLATION" = "harness-worktree" ] && [ "${USE_WORKTREES:-true}" != "false" ]; then
  _QUICK_SHOULD_DEGRADE=$(gsd_run query worktree.base-check --pick shouldDegrade 2>/dev/null || true)
  if [ "$_QUICK_SHOULD_DEGRADE" = "true" ]; then
    _QUICK_DEGRADE_MSG=$(gsd_run query worktree.base-check --pick message 2>/dev/null || true)
    [ -n "$_QUICK_DEGRADE_MSG" ] && printf '%s\n' "$_QUICK_DEGRADE_MSG" >&2
    echo "⚠ [#1941] Worktree fork base diverged from orchestrator HEAD — auto-degrading to sequential mode for this quick task to avoid a base-mismatch halt." >&2
    USE_WORKTREES=false
    ISOLATION=none
  fi
fi

# Re-resolve (and, as a side effect, re-persist) now that the base-check
# auto-degrade above may have changed $ISOLATION since the Step 2 gate's
# `dispatch-isolation` call (#3045). That first call recorded the NATURALLY
# resolved mode into the run-scoped sentinel the isolation guard hooks read
# (hooks/gsd-agent-isolation-guard.js, hooks/gsd-cursor-subagent-start.js via
# hooks/lib/isolation-sentinel.js). The degrade above is decided HERE, in
# shell — the resolver cannot see it — so without this the sentinel still
# asserts `harness-worktree` while the dispatch below correctly omits the
# harness flag, and the guard denies the dispatch with exit 2. `--force-isolation`
# pushes the FINAL, shell-computed value through that SAME single write path
# (`none` also clears the stored harnessFlag, since none applies to sequential
# dispatch). Best-effort: a write failure here must never fail the task — the
# guards' own sentinel-absent fallback is safe, just less precise.
gsd_run query dispatch-isolation --raw --force-isolation "$ISOLATION" >/dev/null 2>&1 || true
```

Capture current HEAD before spawning (used for worktree branch check):
```bash
EXPECTED_BASE=$(git rev-parse HEAD)
if [ "$ISOLATION" = "harness-worktree" ]; then   # keyed on ISOLATION like every other dispatch-coupled branch (#2652)
  # BSD/macOS mktemp only randomizes XXXXXX when it is the final path component, so make a
  # suffixless temp then append the extension — portable across BSD + GNU (#1520).
  QUICK_WORKTREE_MANIFEST=$(mktemp "${TMPDIR:-/tmp}/gsd-quick-worktree-XXXXXX") && mv "$QUICK_WORKTREE_MANIFEST" "${QUICK_WORKTREE_MANIFEST}.json" && QUICK_WORKTREE_MANIFEST="${QUICK_WORKTREE_MANIFEST}.json" || exit 1
  printf '{"worktrees":[]}\n' > "$QUICK_WORKTREE_MANIFEST"
  export QUICK_WORKTREE_MANIFEST
fi
```

Spawn gsd-executor with plan reference:

```
Agent(
  prompt="
Execute quick task ${quick_id}.

${ISOLATION === "harness-worktree" ? `
<worktree_branch_check>
ORCHESTRATOR build-time embed (NOT a sub-agent runtime step): before this dispatch, read \`gsd-core/references/worktree-branch-check.md\`, substitute \`{EXPECTED_BASE}\` with the base SHA captured above (${EXPECTED_BASE}), substitute \`{EXPECTED_BASE_ALTERNATE}\` with \`${QUICK_PLAN_PARENT}\` when it differs from \`${EXPECTED_BASE}\` (otherwise empty), and replace this note with that fragment's \`<worktree_branch_check>\` block so the dispatched prompt carries the runnable guard verbatim — do not pass this instruction through in its place.
</worktree_branch_check>

FIRST ACTION after the worktree branch check: ensure the quick PLAN.md exists at a worktree-rooted relative path before any Read/Edit/Write path can be primed. If \`${QUICK_DIR}/${quick_id}-PLAN.md\` is absent, materialize it from the shared git object store:

\`\`\`bash
QUICK_PLAN_COMMIT="${QUICK_PLAN_COMMIT}"
QUICK_PLAN_PATH="${QUICK_DIR}/${quick_id}-PLAN.md"
if [ ! -f "$QUICK_PLAN_PATH" ]; then
  mkdir -p "$(dirname "$QUICK_PLAN_PATH")"
  git show "${QUICK_PLAN_COMMIT}:${QUICK_PLAN_PATH}" > "$QUICK_PLAN_PATH" || {
    echo "FATAL: unable to materialize quick plan from ${QUICK_PLAN_COMMIT}:${QUICK_PLAN_PATH}; refusing to continue." >&2
    exit 42
  }
fi
\`\`\`
` : ''}

<required_reading>
- ${QUICK_DIR}/${quick_id}-PLAN.md (Plan)
- ${STATE_PATH} (Project state)
- ./CLAUDE.md or ./.claude/CLAUDE.md (Project instructions, if exists)
- .claude/skills/ or .agents/skills/ (Project skills, if either exists — list skills, read SKILL.md for each, follow relevant rules during implementation)
</required_reading>

${AGENT_SKILLS_EXECUTOR}

<submodule_commit_guard>
SUBMODULE_PATHS for this project: ${SUBMODULE_PATHS}

If SUBMODULE_PATHS is non-empty, you MUST run this fail-loud guard immediately
before EVERY git commit you create during this quick task (after \`git add\`,
before \`git commit\`). Quick mode does not have a pre-declared files_modified
list, so the guard runs at commit time:

\`\`\`bash
SUBMODULE_PATHS=\"${SUBMODULE_PATHS}\"
if [ -n \"\$SUBMODULE_PATHS\" ]; then
  STAGED=\$(git diff --cached --name-only)
  for sm_raw in \$SUBMODULE_PATHS; do
    sm=\"\${sm_raw#./}\"
    sm=\"\${sm%/}\"
    [ -z \"\$sm\" ] && continue
    for f_raw in \$STAGED; do
      f=\"\${f_raw#./}\"
      f=\"\${f%/}\"
      case \"\$f\" in
        \"\$sm\"|\"\$sm\"/*)
          echo \"ABORT: staged path \$f_raw falls inside submodule \$sm — worktree-isolated commits cannot safely span submodule boundaries. Re-run with workflow.use_worktrees=false.\" >&2
          exit 1 ;;
      esac
    done
  done
fi
\`\`\`

If the guard aborts, do NOT attempt the commit, do NOT remove the staged files,
and do NOT continue subsequent tasks. Surface the abort message in your
SUMMARY.md and stop — the user must rerun with worktrees disabled.
</submodule_commit_guard>

<constraints>
- Execute all tasks in the plan
- Commit each task atomically (code changes only)
- Run the <submodule_commit_guard> bash block before every \`git commit\` if SUBMODULE_PATHS is non-empty
- Create summary at: ${QUICK_DIR}/${quick_id}-SUMMARY.md with `status: complete` in SUMMARY frontmatter (required so the audit-open milestone-close scanner recognises the task as done, not [unknown])
- Do NOT commit docs artifacts (SUMMARY.md, STATE.md, PLAN.md) — the orchestrator handles the docs commit in Step 8
- Do NOT update ROADMAP.md (quick tasks are separate from planned phases)
</constraints>
",
  subagent_type="gsd-executor",
  model="{executor_model}",
  {harnessFlag}
  description="Execute: ${DESCRIPTION}"
)
```

> **ORCHESTRATOR RULE — CODEX RUNTIME**: After calling Agent() above, stop working on this task immediately. Do not read more files, edit code, or run tests related to this task while the subagent is active. Wait for the subagent to return its result. This prevents duplicate work, conflicting edits, and wasted context. Only resume when the subagent result is available.

If the executor ran isolated (`ISOLATION = "harness-worktree"` at dispatch), append its returned `{agent_id, worktree_path, branch, expected_base, allowed_bases}` metadata to `QUICK_WORKTREE_MANIFEST` before cleanup. Set `expected_base` to `${EXPECTED_BASE}` and `allowed_bases` to `["${EXPECTED_BASE}", "${QUICK_PLAN_PARENT}"]` with duplicates removed. If any required field is unavailable, stop and ask for recovery; do not discover global worktrees.

After executor returns:
1. **Worktree cleanup:** If the executor ran isolated (`ISOLATION = "harness-worktree"` at dispatch), merge the worktree branch back and clean up:
   ```bash
   QUICK_WORKTREE_MANIFEST=${QUICK_WORKTREE_MANIFEST:-$WAVE_WORKTREE_MANIFEST}
   [ -n "${QUICK_WORKTREE_MANIFEST:-}" ] && [ -f "$QUICK_WORKTREE_MANIFEST" ] || {
     echo "BLOCKED: missing QUICK_WORKTREE_MANIFEST; refusing broad worktree cleanup (#3384)." >&2
     exit 1
   }

   # Prefer the bounded cleanup helper. It verifies branch identity, expected
   # base, deletion diffs, merge result, and worktree removal before branch
   # deletion. If it blocks, resolve the reported manifest entry and rerun.
   # Fail closed: SDK refusal (safety guard #3174/#3384) must surface — do not swallow exit 1.
   gsd_run query worktree.cleanup-wave --manifest "$QUICK_WORKTREE_MANIFEST" || exit 1
   ```
   If `ISOLATION` was not `"harness-worktree"` at dispatch (including a #1941 base-check degrade — that is *this* file's degrade; #2649 is the `diagnose-issues.md` / `execute-plan.md` one), skip this step.

   > **ISOLATED-RUN RECOVERY — FAIL SAFE (#1292):** When an isolated (worktree) run is *rejected* — the user declines to merge it, the orchestrator surfaces recovery guidance for a blocked/halted plan, or the run over-reached the requested scope — the worktree-isolation contract MUST hold through recovery. Do **NOT** propose continuing on `main`/the primary checkout as the default or recommended recovery path. Default to a **safe halt** and offer: (a) re-attempt in a **fresh, narrowly-scoped worktree**, or (b) inspect or discard the rejected worktree without merging. Any path that edits the primary checkout requires an **explicit, clearly-labeled confirmation** from the user first — editing `main` directly is never the proposed or default option for a run the user configured to be isolated.

2. Verify summary exists at `${QUICK_DIR}/${quick_id}-SUMMARY.md`
3. Extract commit hash from executor output
4. Report completion status

**Known Claude Code bug (classifyHandoffIfNeeded):** If executor reports "failed" with error `classifyHandoffIfNeeded is not defined`, this is a Claude Code runtime bug — not a real failure. Check if summary file exists and git log shows commits. If so, treat as successful.

If summary not found, error: "Executor failed to create ${quick_id}-SUMMARY.md"

Note: For quick tasks producing multiple plans (rare), spawn executors in parallel waves per execute-phase patterns.

---

**Step 6.25: Code review (auto)**

Skip this step entirely if `$FULL_MODE` is false.

**Capability gate:**
```bash
EXECUTE_POST_HOOKS_JSON=$(gsd_run loop render-hooks execute:post --raw)
```

Resolve active step hooks from `EXECUTE_POST_HOOKS_JSON` where `kind == "step"` and `ref.skill == "code-review"`.

If no active code-review step hook exists, skip with message "Code review skipped (code-review capability inactive)".

**Scope files from executor's commits:**
```bash
# Find the diff base: last commit before quick task started
# Use git log to find commits referencing the quick task id, then take the parent of the oldest
QUICK_COMMITS=$(git log --oneline --format="%H" --grep="${quick_id}" 2>/dev/null)
if [ -n "$QUICK_COMMITS" ]; then
  DIFF_BASE=$(echo "$QUICK_COMMITS" | tail -1)^
  # Verify parent exists (guard against first commit in repo)
  git rev-parse "${DIFF_BASE}" >/dev/null 2>&1 || DIFF_BASE=$(echo "$QUICK_COMMITS" | tail -1)
else
  # No commits found for this quick task — skip review
  DIFF_BASE=""
fi

if [ -n "$DIFF_BASE" ]; then
  CHANGED_FILES=$(git diff --name-only "${DIFF_BASE}..HEAD" -- . ':!.planning' 2>/dev/null | tr '\n' ' ')
else
  CHANGED_FILES=""
fi
```

If `CHANGED_FILES` is empty, skip with "No source files changed — skipping code review."

**Invoke review:**
```
Agent(
  prompt="Review these files for bugs, security issues, and code quality.
  Files: ${CHANGED_FILES}
  Output: ${QUICK_DIR}/${quick_id}-REVIEW.md
  Depth: quick",
  subagent_type="gsd-code-reviewer",
  model="{reviewer_model}"
)
```

> **ORCHESTRATOR RULE — CODEX RUNTIME**: After calling Agent() above, stop working on this task immediately. Do not read more files, edit code, or run tests related to this task while the subagent is active. Wait for the subagent to return its result. This prevents duplicate work, conflicting edits, and wasted context. Only resume when the subagent result is available.

If review produces findings, display advisory message. **Error handling:** Failures are non-blocking — catch and proceed.

---

If `section_manifest` is `null` or `"quick-verification"` is in its `included` list: read and execute `gsd-core/workflows/quick/steps/quick-verification.md`. Otherwise skip — do not read the file.

---

**Step 6.5: Quality gates (SIMPLIFY + JANITOR + SECURITY + PROMPT)**

**SIMPLE & EFFICACE gates**: quality + cleanup + security before goal verification. Advisory: they surface opportunities, the human decides (GO/NO-GO). They never block the flow.

**A quick task gets the same three gates as a phase.** Short is not an excuse: dead code and a missing auth check cost the same whatever the size of the task that introduced them.

**The gates read the same diff and write nothing until the human says GO.** So they run in ONE parallel batch and produce ONE checkpoint. Running them in sequence multiplies the wall-clock and, worse, wakes the human once per gate for the same diff (loi : `~/.claude/se/CONVENTIONS.md` §11).

**Config gates** (same keys and same defaults as `execute-phase`: one source of truth, no second dialect):
```bash
SIMPLIFY_ENABLED=$(gsd_run config-get workflow.simplify_gate 2>/dev/null || echo "false")
JANITOR_ENABLED=$(gsd_run config-get workflow.janitor_gate 2>/dev/null || echo "false")
SECURITY_ENABLED=$(gsd_run config-get workflow.security_gate 2>/dev/null || echo "false")
# Défaut `true` : une clé absente veut dire « projet créé avant que la gate existe »,
# pas « l'humain n'en veut pas ». Même convention que le checkpoint visuel.
PROMPT_ENABLED=$(gsd_run config-get workflow.prompt_gate 2>/dev/null || echo "true")

DEPS_CHANGED=$(echo "$CHANGED" | grep -E '^(package\.json|package-lock\.json|pnpm-lock\.yaml|bun\.lock)$' | sort -u)

# Prompt touché par CETTE tâche ? Deux détections, le chemin puis le contenu : un prompt
# assemblé dans du code ne se voit pas au nom de fichier.
PROMPT_BY_PATH=$(echo "$CHANGED" | grep -E '(^|/)(prompts?|skills|commands|agents)/|\.prompt\.[jt]sx?$|(^|/)(CLAUDE|AGENTS|SKILL)\.md$')
PROMPT_IN_CODE=$(echo "$CHANGED" | grep -E '\.(ts|tsx|js|mjs|cjs|py)$' | xargs -r grep -lE "systemPrompt|system_instruction|role: ?['\"]system|\.messages\.create|\.chat\.complete" 2>/dev/null)
PROMPT_TOUCHED=$(printf '%s\n%s\n' "$PROMPT_BY_PATH" "$PROMPT_IN_CODE" | grep -v '^$' | sort -u)
```

Unlike `execute-phase`, SECURITY here has **no sensitive-surface condition**: an enabled gate always runs. A quick task is exactly where a lone route or a lone dependency slips in without anyone calling it a security change.

PROMPT, itself, needs its trigger: empty `PROMPT_TOUCHED` → display `Gate PROMPT skipped (aucun prompt modifié)` and do not spawn it.

**Step 6.5a, spawn every enabled gate IN PARALLEL, in a SINGLE message.**

Each gate is invoked in `--report-only` mode: it reads, it reports, it changes nothing.

```
Task(subagent_type="general-purpose", model="opus",
     prompt="Invoke Skill(se-gate-simplify) with args 'quick ${quick_id} --report-only, fichiers modifiés : ${CHANGED}'. Return its report block verbatim and nothing else. Modify no file, run no build, ask no question.")

Task(subagent_type="general-purpose", model="opus",
     prompt="Invoke Skill(se-gate-janitor) with args 'quick ${quick_id} --report-only, fichiers modifiés : ${CHANGED}'. Return its report block verbatim and nothing else. Delete no file, commit nothing, ask no question.")

Task(subagent_type="general-purpose", model="opus",
     prompt="Invoke Skill(se-security) with args 'quick ${quick_id} --report-only, fichiers modifiés : ${CHANGED}'. ${DEPS_CHANGED:+Dependencies changed (${DEPS_CHANGED}): also run the supply-chain grid (§5 of the skill), audit, install scripts of NEW deps, pinning, provenance.} If this task exposes the project's first public route and next.config.* declares no headers(), report 'Headers de sécurité absents, template : .planning/_templates/security-headers.md'. Return findings and verdict, nothing else. Modify no file, ask no question.")

Task(subagent_type="general-purpose", model="opus",
     prompt="Invoke Skill(se-prompt) with args 'audit quick ${quick_id}, prompts modifiés : ${PROMPT_TOUCHED}'. Return its verdict block verbatim and nothing else. Modify no file, ask no question.")
```

A disabled gate is simply not spawned: display `Gate {name} skipped (désactivée dans config.json)` and move on. Model per `~/.claude/se/CONVENTIONS.md` §9: these gates judge, so `opus`.

**Step 6.5b, one grouped checkpoint** (form imposed by `Skill(se-checkpoint)`, type `human-verify`):

```
CHECKPOINT · Gates quick ${quick_id}                   [human-verify]

Fait        {n} fichiers modifiés · gates lancées en parallèle : {liste}
Mesuré      SIMPLIFY  P0 {a} · P1 {b}
            JANITOR   DEAD {c} · VIOLATION {d} · SUSPECT {e}
            SECURITY  CRITICAL {f} · HIGH {g}
            PROMPT    CRITICAL {h} · MAJEUR {i} · MINEUR {j}
À juger     1. [SUSPECT] fichier:ligne · <pourquoi le doute>
            2. [CRITICAL] fichier:ligne · <attaque> · fix : <...>
            (4 maximum, ce qui est mesuré ne se juge pas, il passe avec le GO)
Regarder    <fichiers:lignes concernés>

→ Appliquer P0 + DEAD + VIOLATION + les fixes CRITICAL ? [GO / sélection / NO-GO]
```

Ce qui est déjà tranché par la mesure (P0, DEAD, VIOLATION) n'entre pas dans « À juger » : seuls les SUSPECT et les CRITICAL demandent l'avis humain. Les P1 vont au journal.

**Step 6.5c, apply sequentially, after the GO.** Writing is never parallel (§11). Order matters:

1. CRITICAL security fixes,
2. PROMPT CRITICAL (they carry the same nature: a prompt that can produce a false fact or let an abuse through),
3. SIMPLIFY P0,
4. JANITOR DEAD + VIOLATION (cleaning last: it must not delete code a simplification just moved).

A PROMPT fix that turns out to belong in code (a verification, an authorization check, a stop condition) is written in code, never in the prompt text.

Atomic commits separated by category, then `npm run build && npm run type-check` **once for the whole batch**, not once per gate.

**Journal:** one `## Gates` section in `${QUICK_DIR}/${quick_id}-CHECKPOINTS.md` (gabarit `.planning/_templates/CHECKPOINTS.template.md`): what each gate measured, the human's answer verbatim, what was applied, and every accepted exception with its written reason. A CRITICAL left unfixed is only legal with that written reason.

**Error handling:** if a subagent fails or throws, display "Gate {name} encountered an error (non-blocking): {error}" and keep the other reports. A missing tool (npm absent, detector unavailable) is noted "non vérifiable" in the report, never a blocker. Gate failures must NEVER block execution.

Regardless of gate results, ALWAYS proceed to Step 9.

---


**Step 6.6: Visual checkpoint (frontend tasks only)**

**SIMPLE & EFFICACE, checkpoint visuel MESURÉ (Playwright).** Une tâche quick qui touche du front est livrée sous les mêmes yeux qu'une phase : mesurer le rendu réel, rendre un verdict chiffré, puis présenter les captures à l'humain. C'est aussi ce qui enregistre la passe `/se-ui` : sans elle, le hook `se-ui-gate` refusera le commit final.

Ce que la machine tranche : WCAG 2.2 AA, tailles et poids typographiques réellement rendus, espacements hors grille, cibles < 44px, débordements, focus visible, pièges clavier, `prefers-reduced-motion`, Core Web Vitals, anti-patterns. Ce que l'humain tranche : est-ce que c'est beau, est-ce que la direction se voit.

**Config gate:**
```bash
# Défaut `true` : une clé absente veut dire « projet créé avant que la gate existe »,
# pas « l'humain n'en veut pas ». Même convention que les hooks (seFlag, guard-lib.cjs).
VISUAL_ENABLED=$(gsd_run config-get workflow.visual_checkpoint 2>/dev/null || echo "true")
UI_GATE_BLOCKING=$(gsd_run config-get workflow.ui_gate_blocking 2>/dev/null || echo "true")

# Front touché par CETTE tâche ?
FRONT_CHANGED=$(echo "$CHANGED" | grep -E '\.(tsx|jsx|css|scss|vue|svelte)$|(^|/)(components|pages|app)/' | sort -u)
```

**Skip conditions:** if VISUAL_ENABLED is `"false"`, OR `FRONT_CHANGED` is empty → display `Checkpoint visuel non applicable (aucun fichier front modifié)` and proceed to Step 10.

**Step 6.6a, préparer Playwright (Claude le fait, pas l'humain):**
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

**Step 6.6b, mesurer.** Les écrans à vérifier = ceux touchés par `FRONT_CHANGED`, complétés par les étapes des parcours concernés dans `.planning/design/JOURNEYS.md` (étape amont et aval : la friction vit dans les transitions). Une tâche quick ne touche en général qu'un écran, n'en mesurer plus que si le parcours l'exige.

Plusieurs écrans : **un seul message, un run par écran** (§11).

```bash
UI_ROUTE="<route>" UI_NAME="<ecran>" npx playwright test tests/e2e/ui-verify.spec.ts
# → .planning/_ui/ui-report.<ecran>.{desktop,tablet,mobile}.json + les captures
#   (.planning/_ui/ est gitignoré : jamais dans le dossier de la tâche)
```

**Step 6.6c, verdict mesuré:**
```bash
node "$HOME/.claude/se/scripts/ui-verdict.cjs" --name "<ecran>"          # BLOCK / FLAG / PASS, sortie 1 sur BLOCK

node "$HOME/.claude/se/vendor/design/impeccable/detect.mjs" --json "http://localhost:3000<route>"
node "$HOME/.claude/se/vendor/design/impeccable/detect.mjs" --json --viewport 390x844 "http://localhost:3000<route>"
```

**Step 6.6d, humanizer sur les textes réellement affichés.** Le rapport contient `text.visible` : tous les textes du rendu, y compris ceux venus de composants tiers ou de props par défaut, que la relecture de source rate.
```
Skill(skill="se-humanizer", args="textes visibles de l'écran <ecran>, voir text.visible dans .planning/_ui/ui-report.<ecran>.desktop.json")
```
Priorité aux CTA, messages d'erreur et états vides : ce sont des BLOCK dans `ui-rules.json`. **Cette passe vaut pour la Step 10** : ne pas relancer le humanizer sur les mêmes textes.

**Step 6.6e, traitement des BLOCK.** Si `ui-verdict.cjs` sort en 1 et `UI_GATE_BLOCKING` est `"true"` : les BLOCK doivent être **corrigés**, ou explicitement acceptés par l'humain avec une raison écrite dans `.planning/design/ui-exceptions.json` et en §6 de `DESIGN-SYSTEM.md`. Une exception ne rétrograde rien sur Copywriting, Registry Safety et Accessibility.

Après correction, relancer 9b et 9c. Une seule boucle de correction, puis on présente ce qui reste à l'humain.

**Step 6.6f, checkpoint humain (ce que la mesure ne dit pas).** Donner l'**URL exacte**. Si aucun serveur ne tourne, donner la commande, seule sur sa ligne, et attendre :
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


**Step 6.7: Humanizer (user-facing text outside the front)**

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


**Step 6.8: Verification SE (always)**

**Skip this step if the upstream verification already ran in this invocation (`--full` or `--validate`).**

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


**Step 7: Update STATE.md**

Update STATE.md with quick task completion record.

**7a. Check if "Quick Tasks Completed" section exists:**

Read STATE.md and check for `### Quick Tasks Completed` section.

**7b. If section doesn't exist, create it:**

Insert after `### Blockers/Concerns` section:

**If `$VALIDATE_MODE`:**
```markdown
### Quick Tasks Completed

| # | Description | Date | Commit | Status | Directory |
|---|-------------|------|--------|--------|-----------|
```

**If NOT `$VALIDATE_MODE`:**
```markdown
### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
```

**Note:** If the table already exists, match its existing column format. If adding `--validate` (or `--full`) to a project that already has quick tasks without a Status column, add the Status column to the header and separator rows, and leave Status empty for the new row's predecessors.

**7c. Append new row to table:**

Use `date` from init:

**If `$VALIDATE_MODE` (or table has Status column):**
```markdown
| ${quick_id} | ${DESCRIPTION} | ${date} | ${commit_hash} | ${VERIFICATION_STATUS} | [${quick_id}-${slug}](./quick/${quick_id}-${slug}/) |
```

**If NOT `$VALIDATE_MODE` (and table has no Status column):**
```markdown
| ${quick_id} | ${DESCRIPTION} | ${date} | ${commit_hash} | [${quick_id}-${slug}](./quick/${quick_id}-${slug}/) |
```

For a schema-safe append outside this workflow (e.g. from fast.md), `gsd_run quick-tasks-append --task <text>` performs the equivalent write via the shared, schema-backed `appendQuickTaskRow` helper (#2133, ADR-2143 §3/§7).

**7d. Update "Last activity" line:**

Use `date` from init:
```
Last activity: ${date} - Completed quick task ${quick_id}: ${DESCRIPTION}
```

Use Edit tool to make these changes atomically

---

**Step 8: Final commit and completion**

Stage and commit quick task artifacts. This step MUST always run — even if the executor already committed some files (e.g. when running without worktree isolation). The `gsd-tools.cjs query commit` command (or legacy `gsd-tools.cjs` commit) handles already-committed files gracefully.

Build file list:
- `${QUICK_DIR}/${quick_id}-PLAN.md`
- `${QUICK_DIR}/${quick_id}-SUMMARY.md`
- `.planning/STATE.md`
- If `$DISCUSS_MODE` and context file exists: `${QUICK_DIR}/${quick_id}-CONTEXT.md`
- If `$RESEARCH_MODE` and research file exists: `${QUICK_DIR}/${quick_id}-RESEARCH.md`
- If `$VALIDATE_MODE` and verification file exists: `${QUICK_DIR}/${quick_id}-VERIFICATION.md`
- If `${QUICK_DIR}/${quick_id}-deferred-items.md` exists: `${QUICK_DIR}/${quick_id}-deferred-items.md`

```bash
# Explicitly stage all artifacts before commit — PLAN.md may be untracked
# if the executor ran without worktree isolation and committed docs early
# Filter .planning/ files from staging if commit_docs is disabled (#1783)
COMMIT_DOCS=$(gsd_run query config-get commit_docs 2>/dev/null || echo "true")
if [ "$COMMIT_DOCS" = "false" ]; then
  file_list_filtered=$(echo "${file_list}" | tr ' ' '\n' | grep -v '^\.planning/' | tr '\n' ' ')
  git add ${file_list_filtered} 2>/dev/null
else
  git add ${file_list} 2>/dev/null
fi
gsd_run query commit "docs(quick-${quick_id}): ${DESCRIPTION}" --files ${file_list}
```

Get final commit hash:
```bash
commit_hash=$(git rev-parse --short HEAD)
```

Display completion output:

**If `$VALIDATE_MODE`:**
```
---

GSD > QUICK TASK COMPLETE (VALIDATED)

Quick Task ${quick_id}: ${DESCRIPTION}

${RESEARCH_MODE ? 'Research: ' + QUICK_DIR + '/' + quick_id + '-RESEARCH.md' : ''}
Summary: ${QUICK_DIR}/${quick_id}-SUMMARY.md
Verification: ${QUICK_DIR}/${quick_id}-VERIFICATION.md (${VERIFICATION_STATUS})
Commit: ${commit_hash}

---

Ready for next task: /gsd-quick ${GSD_WS}
```

**If NOT `$VALIDATE_MODE`:**
```
---

GSD > QUICK TASK COMPLETE

Quick Task ${quick_id}: ${DESCRIPTION}

${RESEARCH_MODE ? 'Research: ' + QUICK_DIR + '/' + quick_id + '-RESEARCH.md' : ''}
Summary: ${QUICK_DIR}/${quick_id}-SUMMARY.md
Commit: ${commit_hash}

---

Ready for next task: /gsd-quick ${GSD_WS}
```

</process>

<success_criteria>
- [ ] ROADMAP.md validation passes
- [ ] User provides task description
- [ ] `--full`, `--validate`, `--discuss`, and `--research` flags parsed from arguments when present
- [ ] `--full` sets all booleans (`$FULL_MODE`, `$DISCUSS_MODE`, `$RESEARCH_MODE`, `$VALIDATE_MODE`)
- [ ] Slug generated (lowercase, hyphens, max 40 chars)
- [ ] Quick ID generated (YYMMDD-xxx format, 2s Base36 precision)
- [ ] Directory created at `.planning/quick/YYMMDD-xxx-slug/`
- [ ] (--discuss) Gray areas identified and presented, decisions captured in `${quick_id}-CONTEXT.md`
- [ ] (--research) Research agent spawned, `${quick_id}-RESEARCH.md` created
- [ ] `${quick_id}-PLAN.md` created by planner (honors CONTEXT.md decisions when --discuss, uses RESEARCH.md findings when --research)
- [ ] (--validate) Plan checker validates plan, revision loop capped at 2
- [ ] `${quick_id}-SUMMARY.md` created by executor
- [ ] (--validate) `${quick_id}-VERIFICATION.md` created by verifier
- [ ] STATE.md updated with quick task row (Status column when --validate)
- [ ] Artifacts committed
</success_criteria>
