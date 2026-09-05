#!/usr/bin/env node
// se-branch-gate — PreToolUse hook (matcher Bash) BLOQUANT.
// Fait respecter la règle 2 de la loi de branche (CONVENTIONS.md §13) :
// rien ne se commite sur `main`, `master` ni `production`.
//
// Hook harness (pas un hook git) : il voit la commande AVANT exécution, donc
// `--no-verify` ne le contourne pas. C'est aussi pourquoi il n'interdit PAS
// `--no-verify` : les exécuteurs parallèles s'en servent volontairement pour
// éviter la contention des hooks entre worktrees (execute-phase.md).
//
// Le matcher est "Bash" et le hook lit la commande lui-même. Un matcher de la
// forme `Bash(git commit:*)` ne se déclencherait jamais : le matcher PreToolUse
// ne voit que le NOM de l'outil, jamais ses arguments.
//
// Deux niveaux, volontairement asymétriques :
//   - BLOQUANT sur la règle stable (branche protégée). Zéro faux positif connu.
//   - AVERTISSEMENT (stderr, exit 0) si la branche a changé depuis le premier
//     commit de la session. Bloquer ici coûterait plus en faux positifs qu'il ne
//     rapporte : --amend, hotfix décidé en séance, changement assumé, session_id
//     partagé par les sous-agents.
//
// Contrat : exit 0 TOUJOURS (la décision passe par le JSON), silent fail.

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { seFlag } = require('./guard-lib.cjs');

const PROTECTED = ['main', 'master', 'production'];

// Git states where HEAD is detached or mid-operation: a branch name comparison is
// meaningless there, and blocking would break rebase/bisect entirely.
const IN_PROGRESS = ['rebase-merge', 'rebase-apply', 'MERGE_HEAD', 'CHERRY_PICK_HEAD', 'REVERT_HEAD', 'BISECT_LOG'];

const LOCK_MAX_AGE_MS = 12 * 60 * 60 * 1000; // a session_id does not survive /clear

function git(cwd, args) {
  return execSync(`git ${args}`, {
    cwd, encoding: 'utf8', timeout: 3000, stdio: ['ignore', 'pipe', 'ignore'],
  }).trim();
}

function deny(reason) {
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: reason },
  }));
  process.exit(0);
}

// Non-blocking notice. stderr + exit 0 is the only channel that reaches the user
// without touching the permission decision.
function warn(message) {
  process.stderr.write(`branch-gate: ${message}\n`);
  process.exit(0);
}

function operationInProgress(cwd) {
  return IN_PROGRESS.some((name) => {
    try { return fs.existsSync(git(cwd, `rev-parse --git-path ${name}`)); } catch { return false; }
  });
}

// Git global options that consume the NEXT token, so `git -c k=v commit` still
// resolves to `commit`. Options in `--opt=value` form need no entry: they are a
// single token and are skipped by the leading-dash test.
const GIT_OPTS_WITH_VALUE = new Set(['-C', '-c', '--git-dir', '--work-tree', '--namespace', '--exec-path']);
const WATCHED_VERBS = ['commit', 'merge', 'push'];

// Which git verb is this, and on which repository? Returns {verb, dir} or null.
// Tokenised rather than matched by regex: the verb is the first non-option token
// after `git`, which is the only reading that survives `git -c k=v commit` and
// refuses to see a verb inside a commit message.
//
// `dir` matters as much as the verb: `git -C <path> commit` acts on ANOTHER
// repository than the session's. Reading the branch of the session's cwd would
// both refuse harmless commands and miss a real commit on that repo's main.
function gitVerb(cmd) {
  for (const segment of cmd.split(/(?:&&|\|\||[;|\n])/)) {
    const tokens = segment.trim().split(/\s+/).filter(Boolean);
    const start = tokens.findIndex((t) => t === 'git' || t.endsWith('/git'));
    if (start === -1) continue;
    let dir = null;
    for (let j = start + 1; j < tokens.length; j++) {
      const token = tokens[j];
      if (token.startsWith('-')) {
        if (token === '-C') dir = unquote(tokens[j + 1]);
        else if (token.startsWith('--work-tree=')) dir = unquote(token.slice('--work-tree='.length));
        if (GIT_OPTS_WITH_VALUE.has(token)) j++;
        continue;
      }
      if (WATCHED_VERBS.includes(token)) return { verb: token, dir };
      break; // first non-option token is the verb, watched or not
    }
  }
  return null;
}

function unquote(value) {
  if (typeof value !== 'string') return null;
  const trimmed = value.replace(/^["']/, '').replace(/["']$/, '');
  return trimmed || null;
}

function isFastForwardOnly(cmd) {
  return /\s--ff-only\b/.test(cmd);
}

// Session lock lives in the worktree's OWN git dir, never a shared path: a hook
// writing to one global file would collide across parallel agent worktrees.
function lockPath(cwd, sessionId) {
  if (!sessionId) return null;
  const safe = String(sessionId).replace(/[^A-Za-z0-9_-]/g, '');
  if (!safe) return null;
  try { return path.join(git(cwd, 'rev-parse --absolute-git-dir'), `se-branch-lock-${safe}`); } catch { return null; }
}

function checkSessionLock(cwd, sessionId, branch) {
  const file = lockPath(cwd, sessionId);
  if (!file) return;
  let previous = null;
  try {
    const stat = fs.statSync(file);
    if (Date.now() - stat.mtimeMs < LOCK_MAX_AGE_MS) previous = fs.readFileSync(file, 'utf8').trim();
  } catch { /* first commit of the session */ }
  if (previous && previous !== branch) {
    try { fs.writeFileSync(file, branch, 'utf8'); } catch { /* best effort */ }
    warn(
      `cette session a commencé sur « ${previous} » et commite maintenant sur « ${branch} ». ` +
      `Si c'est voulu, ignore ce message. Sinon : git switch ${previous}`
    );
  }
  try { fs.writeFileSync(file, branch, 'utf8'); } catch { /* best effort */ }
}

let input = '';
const stdinTimeout = setTimeout(() => process.exit(0), 3000);
process.stdin.setEncoding('utf8');
process.stdin.on('data', (c) => (input += c));
process.stdin.on('end', () => {
  clearTimeout(stdinTimeout);
  try {
    const data = JSON.parse(input);
    if (data.tool_name !== 'Bash') process.exit(0);

    const cmd = data.tool_input?.command || '';
    const parsed = gitVerb(cmd);
    if (!parsed) process.exit(0);
    const { verb, dir } = parsed;

    const sessionCwd = data.cwd || process.env.CLAUDE_PROJECT_DIR || process.cwd();
    // `git -C <path>` retargets the command: judge that repository, not this one.
    const cwd = dir ? path.resolve(sessionCwd, dir) : sessionCwd;
    if (!fs.existsSync(cwd)) process.exit(0);

    // A repo with no `origin` has no PR workflow to protect: scratch clones and
    // local-only experiments must stay usable.
    let root;
    try {
      root = git(cwd, 'rev-parse --show-toplevel');
      git(cwd, 'remote get-url origin');
    } catch { process.exit(0); }

    // Per-project opt-out, for a project that deliberately works another way.
    if (seFlag(root, 'branch_gate', true) === false) process.exit(0);

    if (operationInProgress(cwd)) process.exit(0);

    let branch;
    try {
      git(cwd, 'symbolic-ref -q HEAD');           // throws when HEAD is detached
      branch = git(cwd, 'rev-parse --abbrev-ref HEAD');
    } catch { process.exit(0); }
    if (!branch || branch === 'HEAD') process.exit(0);

    if (!PROTECTED.includes(branch)) {
      if (verb === 'commit') checkSessionLock(cwd, data.session_id, branch);
      process.exit(0);
    }

    // `production` receives fast-forward merges and their push: that IS the release
    // gesture. Only a commit written directly on it is forbidden, because it makes
    // production diverge from main permanently.
    if (branch === 'production' && (verb === 'push' || (verb === 'merge' && isFastForwardOnly(cmd)))) process.exit(0);

    deny(
      `branch-gate: « ${branch} » est une branche protégée, on n'y fait pas de « git ${verb} » (CONVENTIONS.md §13).\n` +
      `Ouvre une branche depuis une base fraîche, puis recommence :\n` +
      `  git fetch origin && git checkout -b feat/mon-sujet origin/main --no-track\n` +
      (branch === 'production'
        ? `Pour livrer : git merge --ff-only main puis git push. Jamais de commit direct sur production.`
        : `main ne fait que recopier origin/main : git switch main && git pull --ff-only.`)
    );
  } catch {
    process.exit(0); // silent fail — ne JAMAIS bloquer un commit par accident
  }
});
