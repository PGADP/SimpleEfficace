#!/usr/bin/env node
// se-serve — la SEULE façon dont Claude lance un process long (dev server, worker, tunnel).
//
// Règle du système (CONVENTIONS §12) : les commandes qui se terminent seules (build,
// type-check, tests, Playwright) sont lancées par Claude ; les process qui survivent à la
// commande sont lancés par l'humain, dans son terminal. Quand un flux autonome oblige
// quand même Claude à en lancer un (checkpoint visuel, E2E), il passe par ici : le PID est
// enregistré, donc il peut être tué, et le hook de fin de session tue ce qui reste.
//
// Usage :
//   node se-serve.cjs start <nom> --cmd "npm run dev" [--url http://localhost:3000] [--wait]
//   node se-serve.cjs stop <nom>|--all
//   node se-serve.cjs status
//
// Codes de sortie : 0 OK ; 1 échec (process mort au démarrage, URL jamais prête) ; 2 mauvais usage.

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const {
  serversDir, logPath, readRegistry, writeRegistry, isAlive, killTree, reap,
} = require(path.join(__dirname, '..', 'hooks', 'server-registry.cjs'));

// Paramétrable pour que la suite de tests n'attende pas une minute sur un port muet.
// Relais lancé par `node -e` : argv[1] porte la commande. stdio hérité, donc la sortie
// du serveur atterrit dans le même log, et le relais meurt quand son enfant meurt.
const RELAY_SRC = "const{spawn}=require('child_process');"
  + "const c=spawn(process.argv[1],{shell:true,windowsHide:true,stdio:'inherit'});"
  + "c.on('exit',(code)=>process.exit(code||0));";

const WAIT_TIMEOUT_MS = Number(process.env.SE_SERVE_WAIT_TIMEOUT_MS) || 60000;
const WAIT_POLL_MS = 500;
const NAME_RE = /^[a-z0-9][a-z0-9-]*$/i;

function fail(msg) { console.error(msg); process.exit(1); }
function usage() {
  console.error('Usage:\n  se-serve start <nom> --cmd "<commande>" [--url <url>] [--wait]\n  se-serve stop <nom>|--all\n  se-serve status');
  process.exit(2);
}

function parseArgs(argv) {
  const args = { cmd: argv[0], name: null, command: null, url: null, wait: false, all: false };
  for (let i = 1; i < argv.length; i += 1) {
    if (argv[i] === '--cmd') args.command = argv[++i];
    else if (argv[i] === '--url') args.url = argv[++i];
    else if (argv[i] === '--wait') args.wait = true;
    else if (argv[i] === '--all') args.all = true;
    else if (!args.name) args.name = argv[i];
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));
if (!['start', 'stop', 'status'].includes(args.cmd)) usage();

const projectDir = process.cwd();
if (!fs.existsSync(path.join(projectDir, '.planning'))) {
  fail('se-serve: pas un projet SE (aucun .planning/ ici) — lancer depuis la racine du projet.');
}

/** L'URL répond-elle ? Toute réponse HTTP compte, y compris une 404 : le serveur écoute. */
async function urlReady(url) {
  try {
    await fetch(url, { method: 'GET', signal: AbortSignal.timeout(2000) });
    return true;
  } catch {
    return false;
  }
}

async function waitForUrl(url, pid) {
  const deadline = Date.now() + WAIT_TIMEOUT_MS;
  while (Date.now() < deadline) {
    if (!isAlive(pid)) return { ok: false, reason: 'le process est mort au démarrage' };
    if (await urlReady(url)) return { ok: true };
    await new Promise((r) => setTimeout(r, WAIT_POLL_MS));
  }
  return { ok: false, reason: `pas de réponse sur ${url} après ${WAIT_TIMEOUT_MS / 1000}s` };
}

async function cmdStart() {
  if (!args.name || !NAME_RE.test(args.name)) usage();
  if (!args.command) usage();

  const registry = readRegistry(projectDir);
  const existing = registry.entries[args.name];
  if (existing && isAlive(existing.pid)) {
    // Réutiliser plutôt que doubler : c'est ainsi qu'on se retrouve avec dix serveurs.
    console.log(`✓ ${args.name} tourne déjà (pid ${existing.pid})${existing.url ? ` — ${existing.url}` : ''}`);
    return;
  }

  fs.mkdirSync(serversDir(projectDir), { recursive: true });
  const log = fs.openSync(logPath(projectDir, args.name), 'a');
  // On ne spawn PAS la commande avec `shell: true, detached: true` : sur Windows, un
  // cmd.exe détaché ouvre une fenêtre de console visible à chaque démarrage, et le même
  // cmd.exe détaché avec CREATE_NO_WINDOW meurt à la naissance (pas de console du tout).
  // D'où le relais : un node.exe détaché (qui, lui, survit sans console) relance la
  // commande shell en enfant. Le PID enregistré est celui du relais ; killTree tue l'arbre.
  const child = spawn(process.execPath, ['-e', RELAY_SRC, args.command], {
    cwd: projectDir, detached: true, windowsHide: true, stdio: ['ignore', log, log],
  });
  child.unref();
  fs.closeSync(log);

  registry.entries[args.name] = {
    pid: child.pid,
    command: args.command,
    url: args.url || null,
    startedAt: new Date().toISOString(),
  };
  writeRegistry(projectDir, registry);

  if (args.wait && args.url) {
    const ready = await waitForUrl(args.url, child.pid);
    if (!ready.ok) {
      killTree(child.pid);
      delete registry.entries[args.name];
      writeRegistry(projectDir, registry);
      fail(`se-serve: ${args.name} n'a pas démarré — ${ready.reason}.\nLog : ${path.relative(projectDir, logPath(projectDir, args.name))}`);
    }
  }
  console.log(`✓ ${args.name} démarré (pid ${child.pid})${args.url ? ` — ${args.url}` : ''}`);
  console.log(`  log : ${path.relative(projectDir, logPath(projectDir, args.name))}`);
  console.log(`  à tuer avec : node "$HOME/.claude/se/scripts/se-serve.cjs" stop ${args.name}`);
}

function cmdStop() {
  if (args.all) {
    const { killed, failed } = reap(projectDir);
    if (killed.length) console.log(`✓ arrêtés : ${killed.join(', ')}`);
    if (failed.length) console.log(`⚠ résistent (à tuer à la main) : ${failed.join(', ')}`);
    if (!killed.length && !failed.length) console.log('✓ aucun process enregistré à arrêter');
    return;
  }
  if (!args.name) usage();
  const registry = readRegistry(projectDir);
  const entry = registry.entries[args.name];
  if (!entry) { console.log(`· ${args.name} n'est pas au registre — rien à arrêter`); return; }
  const ok = killTree(entry.pid);
  delete registry.entries[args.name];
  writeRegistry(projectDir, registry);
  console.log(ok ? `✓ ${args.name} arrêté (pid ${entry.pid})` : `⚠ ${args.name} (pid ${entry.pid}) résiste — à tuer à la main`);
}

function cmdStatus() {
  const entries = Object.entries(readRegistry(projectDir).entries);
  if (!entries.length) { console.log('Aucun process enregistré.'); return; }
  for (const [name, entry] of entries) {
    const state = isAlive(entry.pid) ? 'vivant' : 'mort (entrée périmée)';
    console.log(`${name.padEnd(16)} pid ${String(entry.pid).padEnd(8)} ${state}  ${entry.url || ''}`);
  }
}

(async () => {
  if (args.cmd === 'start') await cmdStart();
  else if (args.cmd === 'stop') cmdStop();
  else cmdStatus();
})();
