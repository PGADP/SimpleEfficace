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

/** Le process existe-t-il encore ? Signal 0 = test de présence, il ne tue rien. */
function isAlive(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (err) {
    return err.code === 'EPERM'; // vivant mais appartient à quelqu'un d'autre
  }
}

/** Tue le process ET ses enfants. `npm run dev` spawn le vrai serveur : tuer le parent
 *  seul laisse l'enfant tenir le port, ce qui est exactement le bug qu'on corrige. */
function killTree(pid) {
  if (!isAlive(pid)) return true;
  if (process.platform === 'win32') {
    spawnSync('taskkill', ['/PID', String(pid), '/T', '/F'], { timeout: KILL_TIMEOUT_MS, stdio: 'ignore' });
  } else {
    // detached: true a fait du process un chef de groupe, donc -pid tue tout le groupe.
    try { process.kill(-pid, 'SIGTERM'); } catch { try { process.kill(pid, 'SIGTERM'); } catch { /* déjà mort */ } }
  }
  return !isAlive(pid);
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
