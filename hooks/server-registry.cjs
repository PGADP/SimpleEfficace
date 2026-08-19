// server-registry — registre des process longs (dev server, worker, tunnel) lancés par
// Claude. SOURCE UNIQUE, écrite par scripts/se-serve.cjs et lue par se-server-reaper.cjs
// (le hook de fin de session qui tue ce qui reste).
//
// Pourquoi un registre : un process lancé en fond sort du champ de vision de l'agent dès
// le tour suivant. Sans PID écrit quelque part, personne ne peut plus le tuer, et le port
// reste pris jusqu'au reboot. Le registre est la mémoire que l'agent n'a pas.
//
// Il n'est PAS commité (.planning/_servers/ est gitignoré) : un PID n'a de sens que sur
// la machine qui l'a produit.

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const SERVERS_DIR_REL = path.join('.planning', '_servers');
const REGISTRY_REL = path.join(SERVERS_DIR_REL, 'registry.json');
const REGISTRY_VERSION = 1;
const KILL_TIMEOUT_MS = 5000;
const KILL_GRACE_MS = 3000;   // délai laissé à un SIGTERM pour faire son travail
const KILL_FINAL_MS = 2000;   // délai accordé après le coup de grâce
const KILL_POLL_MS = 50;

function serversDir(projectDir) { return path.join(projectDir, SERVERS_DIR_REL); }
function registryPath(projectDir) { return path.join(projectDir, REGISTRY_REL); }
function logPath(projectDir, name) { return path.join(serversDir(projectDir), `${name}.log`); }

function readRegistry(projectDir) {
  try {
    const raw = JSON.parse(fs.readFileSync(registryPath(projectDir), 'utf8'));
    return { version: raw.version || REGISTRY_VERSION, entries: raw.entries || {} };
  } catch {
    return { version: REGISTRY_VERSION, entries: {} };
  }
}

function writeRegistry(projectDir, registry) {
  const target = registryPath(projectDir);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  const entries = {};
  for (const key of Object.keys(registry.entries).sort()) entries[key] = registry.entries[key];
  fs.writeFileSync(target, JSON.stringify({ version: REGISTRY_VERSION, entries }, null, 2) + '\n');
}

/** Un zombie répond encore à kill(0) alors qu'il ne tient plus rien : ni port, ni fichier.
 *  Le compter comme vivant ferait attendre un kill qui n'arrivera jamais. */
function isZombie(pid) {
  if (process.platform === 'win32') return false;
  try {
    const stat = fs.readFileSync(`/proc/${pid}/stat`, 'utf8');
    return stat.slice(stat.lastIndexOf(')') + 2)[0] === 'Z';
  } catch {
    return false;   // pas de /proc (macOS) : on s'en remet à kill(0)
  }
}

/** Le process existe-t-il encore ? Signal 0 = test de présence, il ne tue rien. */
function isAlive(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
  } catch (err) {
    return err.code === 'EPERM'; // vivant mais appartient à quelqu'un d'autre
  }
  return !isZombie(pid);
}

/** Pause synchrone : le registre est lu par un hook qui doit rendre un verdict, pas
 *  enchaîner des promesses. Atomics.wait bloque sans brûler le CPU. */
function sleepSync(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function waitDeath(pid, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (!isAlive(pid)) return true;
    sleepSync(KILL_POLL_MS);
  }
  return !isAlive(pid);
}

function signalTree(pid, signal) {
  // detached: true a fait du process un chef de groupe, donc -pid vise tout le groupe.
  // Repli sur le PID seul si le groupe n'existe pas (process déjà réparenté).
  try { process.kill(-pid, signal); return; } catch { /* pas de groupe */ }
  try { process.kill(pid, signal); } catch { /* déjà mort */ }
}

/** Tue le process ET ses enfants, puis ATTEND la mort. `npm run dev` spawn le vrai
 *  serveur : tuer le parent seul laisse l'enfant tenir le port, ce qui est le bug qu'on
 *  corrige. Et un SIGTERM n'est pas instantané : rendre un verdict juste après l'envoi
 *  ferait dire « il résiste » à un process en train de mourir proprement. */
function killTree(pid) {
  if (!isAlive(pid)) return true;
  if (process.platform === 'win32') {
    spawnSync('taskkill', ['/PID', String(pid), '/T', '/F'], { timeout: KILL_TIMEOUT_MS, stdio: 'ignore' });
    return waitDeath(pid, KILL_FINAL_MS);
  }
  signalTree(pid, 'SIGTERM');
  if (waitDeath(pid, KILL_GRACE_MS)) return true;
  // Ce qui traîne finit en SIGKILL : un serveur qui ignore SIGTERM garde son port.
  signalTree(pid, 'SIGKILL');
  return waitDeath(pid, KILL_FINAL_MS);
}

/** Tue tout ce qui traîne et vide le registre. Retourne ce qui a été tué et ce qui résiste. */
function reap(projectDir) {
  const killed = [];
  const remaining = {};   // ce qui résiste reste au registre : le prochain stop réessaiera
  for (const [name, entry] of Object.entries(readRegistry(projectDir).entries)) {
    if (!isAlive(entry.pid)) continue;      // déjà mort : rien à signaler
    if (killTree(entry.pid)) killed.push(name);
    else remaining[name] = entry;
  }
  writeRegistry(projectDir, { version: REGISTRY_VERSION, entries: remaining });
  return { killed, failed: Object.keys(remaining) };
}

module.exports = {
  SERVERS_DIR_REL, REGISTRY_REL, REGISTRY_VERSION,
  serversDir, registryPath, logPath,
  readRegistry, writeRegistry, isAlive, killTree, reap,
};
