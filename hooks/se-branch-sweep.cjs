#!/usr/bin/env node
// se-branch-sweep — SessionStart hook, NON bloquant.
// Fait respecter la règle 4 de la loi de branche (CONVENTIONS.md §13) : une branche
// meurt à la fusion, et son worktree avec elle.
//
// POURQUOI CE N'EST PAS `git branch --merged` : cette commande ne voit que le merge
// commit et le fast-forward. Un squash-merge ou un rebase-merge GitHub réécrit les
// SHA, la branche reste vue comme non fusionnée et s'accumule pour toujours. C'est
// la cause mécanique des branches qui s'entassent. On croise donc quatre signaux,
// du plus autoritaire au plus faible.
//
// SÛRETÉ : mode annonce par défaut. Rien n'est supprimé tant que le projet n'a pas
// mis `workflow.branch_sweep: true` dans .planning/config.json. Supprimer une branche
// détruit son reflog, donc le SHA est journalisé AVANT.
//
// Contrat : exit 0 TOUJOURS, silent fail. Un balayage qui plante ne doit jamais
// empêcher une session de démarrer.

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { seFlag } = require('./guard-lib.cjs');

const PROTECTED = ['main', 'master', 'production', 'HEAD'];
const MAX_BRANCHES = 200;      // garde-fou de temps sur un dépôt pathologique
// Le réseau ne doit pas retarder le démarrage, mais 5 s ne suffisent pas à fetch un
// gros dépôt : en dessous, le balayage travaille sur des refs périmées sans le dire.
const FETCH_TIMEOUT_MS = 10000;
const GIT_TIMEOUT_MS = 5000;
const MAX_LISTED = 15;         // au-delà, le rapport devient un mur illisible

function git(cwd, args, timeout = GIT_TIMEOUT_MS) {
  return execSync(`git ${args}`, {
    cwd, encoding: 'utf8', timeout, maxBuffer: 8 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'],
  }).trim();
}

function tryGit(cwd, args, timeout) {
  try { return git(cwd, args, timeout); } catch { return null; }
}

// Branches whose PR is merged on GitHub. ONE call, not one per branch: the
// authoritative signal must not cost 46 network round-trips at session start.
function mergedPullRequests(cwd) {
  try {
    const raw = execSync('gh pr list --state merged --limit 200 --json headRefName', {
      cwd, encoding: 'utf8', timeout: FETCH_TIMEOUT_MS, stdio: ['ignore', 'pipe', 'ignore'],
    });
    return new Set(JSON.parse(raw).map((pr) => pr.headRefName));
  } catch {
    return null; // gh absent, non authentifié, ou dépôt hors GitHub
  }
}

// Squash-merge: rebuild the commit GitHub would have produced (branch tree on top of
// the merge base) and ask git whether that patch already exists upstream.
// Known blind spot: if the squash required conflict resolution, the patch-id differs
// and the branch is reported as not integrated. False negative, never a wrong delete.
function squashedInto(cwd, base, branch) {
  const mergeBase = tryGit(cwd, `merge-base ${base} ${branch}`);
  if (!mergeBase) return false;
  // `show -s --format=%T` plutôt que `rev-parse <branch>^{tree}` : sous cmd.exe, `^`
  // est le caractère d'échappement et la révision arrive tronquée côté git.
  const tree = tryGit(cwd, `show -s --format=%T ${branch}`);
  if (!tree) return false;
  const synthetic = tryGit(cwd, `commit-tree ${tree} -p ${mergeBase} -m _`);
  if (!synthetic) return false;
  const cherry = tryGit(cwd, `cherry ${base} ${synthetic}`);
  return !!cherry && cherry.startsWith('-');
}

// Returns the reason the branch is considered integrated, or null.
//
// A merged pull request says what the PR CONTAINED, never what was pushed onto the
// branch afterwards — and a commit added after the merge is exactly the work a
// forced delete would destroy. So content is checked first, always: the PR signal
// only names the reason, and authorises the `-D` that git itself refuses on a
// squash or rebase merge.
function integrationReason(cwd, base, branch, mergedPrs, mergedList) {
  const cherry = tryGit(cwd, `cherry ${base} ${branch}`);
  const allUpstream = cherry !== null && !cherry.split('\n').some((l) => l.startsWith('+'));
  if (!allUpstream && !squashedInto(cwd, base, branch)) return null;

  if (mergedPrs && mergedPrs.has(branch)) return 'PR fusionnée';
  if (mergedList.has(branch)) return 'merge commit';
  return allUpstream ? 'patchs déjà en amont' : 'squash-merge';
}

function logDeletion(cwd, line) {
  const logFile = path.join(cwd, '.planning', 'ARCHIVE.log');
  try {
    if (!fs.existsSync(path.dirname(logFile))) return;
    fs.appendFileSync(logFile, `${line}\n`, 'utf8');
  } catch { /* best effort: the report on stdout already carries the SHA */ }
}

function sweep(cwd) {
  let root;
  try {
    root = git(cwd, 'rev-parse --show-toplevel');
    git(cwd, 'remote get-url origin');
  } catch { return null; }

  const base = tryGit(cwd, 'symbolic-ref --quiet --short refs/remotes/origin/HEAD')
    || (tryGit(cwd, 'rev-parse --verify --quiet refs/remotes/origin/main') ? 'origin/main' : null);
  if (!base) return null;

  // Sans fetch --prune, origin/main est périmé et tout le calcul « fusionnée » est faux.
  const fetched = tryGit(cwd, 'fetch --prune --quiet origin', FETCH_TIMEOUT_MS) !== null;

  const current = tryGit(cwd, 'rev-parse --abbrev-ref HEAD');
  const all = (tryGit(cwd, "branch --format=%(refname:short)") || '').split('\n').filter(Boolean);
  const candidates = all
    .filter((b) => !PROTECTED.includes(b) && b !== current)
    .slice(0, MAX_BRANCHES);
  if (!candidates.length) return null;

  const mergedPrs = mergedPullRequests(root);
  const mergedList = new Set((tryGit(cwd, `branch --merged ${base} --format=%(refname:short)`) || '').split('\n').filter(Boolean));

  const integrated = [];
  for (const branch of candidates) {
    const reason = integrationReason(cwd, base, branch, mergedPrs, mergedList);
    if (reason) integrated.push({ branch, reason, sha: tryGit(cwd, `rev-parse --short ${branch}`) });
  }

  // Worktrees dont l'admin pointe vers un dossier disparu : sans effet sur les données.
  tryGit(cwd, 'worktree prune');

  const enabled = seFlag(root, 'branch_sweep', false) === true;
  if (!integrated.length) return null;

  if (!enabled) {
    const list = integrated.slice(0, MAX_LISTED).map((x) => `  • ${x.branch} (${x.reason})`).join('\n');
    const more = integrated.length > MAX_LISTED ? `\n  … et ${integrated.length - MAX_LISTED} autre(s)` : '';
    return `branch-sweep: ${integrated.length} branche(s) intégrée(s) et supprimable(s) :\n${list}${more}\n`
      + `Mode annonce : rien n'a été supprimé. Pour activer le nettoyage automatique, `
      + `passe workflow.branch_sweep à true dans .planning/config.json.`
      + (fetched ? '' : '\n⚠ fetch impossible : la liste peut être périmée.');
  }

  const removed = [];
  const kept = [];
  for (const { branch, reason, sha } of integrated) {
    logDeletion(root, `${new Date().toISOString()} branch ${branch} ${sha} supprimée (${reason})`);
    if (tryGit(cwd, `branch -d ${branch}`) !== null) { removed.push(branch); continue; }
    // -d refuse dès que git ne VOIT pas le merge : c'est le cas de tout squash et de
    // tout rebase, précisément les branches qui s'accumulent le plus. Forcer est
    // légitime ici parce qu'integrationReason ne rend un motif qu'après avoir prouvé
    // le contenu (patch-id, ou squash reconstruit) : rien de non intégré n'y arrive.
    if (tryGit(cwd, `branch -D ${branch}`) !== null) removed.push(branch);
    else kept.push(branch);
  }
  if (!removed.length && !kept.length) return null;

  let report = `branch-sweep: ${removed.length} branche(s) supprimée(s)`;
  if (removed.length) report += ` : ${removed.slice(0, MAX_LISTED).join(', ')}${removed.length > MAX_LISTED ? '…' : ''}`;
  if (kept.length) report += `\n${kept.length} conservée(s) faute de signal autoritaire : ${kept.slice(0, MAX_LISTED).join(', ')}`;
  return report;
}

try {
  let input = '';
  try { input = fs.readFileSync(0, 'utf8'); } catch { /* pas de stdin */ }
  let data = {};
  try { data = JSON.parse(input); } catch { /* SessionStart sans payload */ }

  const cwd = data.cwd || process.env.CLAUDE_PROJECT_DIR || process.cwd();
  const report = sweep(cwd);
  if (report) process.stdout.write(`${report}\n`);
} catch { /* silent fail — ne jamais empêcher une session de démarrer */ }
process.exit(0);
