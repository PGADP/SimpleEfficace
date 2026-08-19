#!/usr/bin/env node
// se-serve.test.cjs — tests du registre de process longs et du hook de fin de session.
// Un vrai process est lancé (node qui ne rend jamais la main), puis tué par les deux
// chemins : `se-serve stop` et le reaper SessionEnd.
// Run: node scripts/se-serve.test.cjs

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { isAlive } = require(path.join(__dirname, '..', 'hooks', 'server-registry.cjs'));

let pass = 0;
let fail = 0;
function check(name, ok) {
  if (ok) { pass++; console.log(`  PASS  ${name}`); }
  else { fail++; console.log(`  FAIL  ${name}`); }
}

const SERVE = path.join(__dirname, 'se-serve.cjs');
const REAPER = path.join(__dirname, '..', 'hooks', 'se-server-reaper.cjs');
// Un process qui ne se termine jamais tout seul : c'est exactement le cas qu'on traque.
// Il bat dans un fichier, ce qui permet de vérifier que c'est bien LUI qui meurt et pas
// seulement le relais qui l'a lancé (tuer le relais en laissant le serveur tenir le port,
// c'est le bug d'origine).
const beatsDir = fs.mkdtempSync(path.join(os.tmpdir(), 'se-serve-beat-'));
const HEARTBEAT_SCRIPT = path.join(beatsDir, 'idle.cjs');
fs.writeFileSync(HEARTBEAT_SCRIPT,
  "setInterval(() => require('fs').writeFileSync(process.argv[2], String(Date.now())), 200);");
let beatSeq = 0;
function idleCommand() {
  const beat = path.join(beatsDir, `beat-${beatSeq++}.txt`);
  return { command: `${JSON.stringify(process.execPath)} ${JSON.stringify(HEARTBEAT_SCRIPT)} ${JSON.stringify(beat)}`, beat };
}
/** Le process de travail bat-il encore ? On compare deux lectures espacées. */
function stillBeating(beat) {
  const first = fs.existsSync(beat) ? fs.readFileSync(beat, 'utf8') : null;
  spawnSync(process.execPath, ['-e', 'setTimeout(()=>{},900)'], { timeout: 5000 });
  const second = fs.existsSync(beat) ? fs.readFileSync(beat, 'utf8') : null;
  return first !== second;
}

function serve(cwd, args, env = {}) {
  return spawnSync(process.execPath, [SERVE, ...args], {
    cwd, encoding: 'utf8', timeout: 30000, env: { ...process.env, ...env },
  });
}
function reaper(cwd, input) {
  return spawnSync(process.execPath, [REAPER], {
    input: JSON.stringify(input), cwd, encoding: 'utf8', timeout: 20000,
    env: { ...process.env, CLAUDE_PROJECT_DIR: '' },
  });
}
function registry(cwd) {
  try { return JSON.parse(fs.readFileSync(path.join(cwd, '.planning', '_servers', 'registry.json'), 'utf8')); }
  catch { return { entries: {} }; }
}
/** Le kill est asynchrone côté OS : on laisse au process le temps de disparaître. */
function waitDead(pid, timeoutMs = 8000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (!isAlive(pid)) return true;
    spawnSync(process.execPath, ['-e', 'setTimeout(()=>{},150)'], { timeout: 2000 });
  }
  return !isAlive(pid);
}

function seProject(prefix) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  fs.mkdirSync(path.join(dir, '.planning'), { recursive: true });
  return dir;
}

console.log('\n== se-serve start / status / stop ==');

const projA = seProject('se-serve-a-');
const idleA = idleCommand();
let out = serve(projA, ['start', 'dev', '--cmd', idleA.command]);
check('start : sortie 0', out.status === 0);
const entryA = registry(projA).entries.dev;
check('start : entrée écrite au registre', !!entryA && Number.isInteger(entryA.pid));
check('start : le process tourne', !!entryA && isAlive(entryA.pid));
check('start : la commande d\'arrêt est donnée à l\'humain', /se-serve\.cjs" stop dev/.test(out.stdout));
check('start : un log est ouvert pour le process',
  fs.existsSync(path.join(projA, '.planning', '_servers', 'dev.log')));

out = serve(projA, ['status']);
check('status : liste le process vivant', /dev\s+pid \d+\s+vivant/.test(out.stdout));

const pidA = entryA.pid;
out = serve(projA, ['start', 'dev', '--cmd', idleCommand().command]);
check('start deux fois : réutilise au lieu de doubler', /tourne déjà/.test(out.stdout));
check('start deux fois : le pid ne change pas', registry(projA).entries.dev.pid === pidA);

out = serve(projA, ['stop', 'dev']);
check('stop : sortie 0', out.status === 0);
check('stop : le process est mort', waitDead(pidA));
check('stop : l\'entrée sort du registre', registry(projA).entries.dev === undefined);
check('stop : un nom inconnu ne casse rien', serve(projA, ['stop', 'inexistant']).status === 0);

console.log('\n== se-serve --wait ==');

const projW = seProject('se-serve-w-');
out = serve(projW, ['start', 'web', '--cmd', idleCommand().command, '--url', 'http://127.0.0.1:59999', '--wait'],
  { SE_SERVE_WAIT_TIMEOUT_MS: '3000' });
check('--wait : échoue si l\'URL ne répond jamais', out.status === 1);
check('--wait : le process avorté est tué et déréférencé', registry(projW).entries.web === undefined);

console.log('\n== hook SessionEnd (se-server-reaper) ==');

const projR = seProject('se-serve-r-');
const idleR = idleCommand();
serve(projR, ['start', 'dev', '--cmd', idleR.command]);
serve(projR, ['start', 'worker', '--cmd', idleCommand().command]);
const pids = Object.values(registry(projR).entries).map((e) => e.pid);
check('reaper : deux process enregistrés avant la fin de session', pids.length === 2 && pids.every(isAlive));

out = reaper(projR, { hook_event_name: 'SessionEnd', cwd: projR, reason: 'exit' });
check('reaper : sortie 0', out.status === 0);
check('reaper : tous les process sont morts', pids.every((pid) => waitDead(pid)));
check('reaper : le registre est vidé', Object.keys(registry(projR).entries).length === 0);
check('reaper : le process de travail meurt aussi, pas seulement le relais', !stillBeating(idleR.beat));

const notSe = fs.mkdtempSync(path.join(os.tmpdir(), 'se-serve-x-'));
out = reaper(notSe, { hook_event_name: 'SessionEnd', cwd: notSe });
check('reaper : hors projet SE, ne fait rien et sort 0', out.status === 0 && out.stdout.trim() === '');

console.log(`\n${pass} PASS, ${fail} FAIL`);
process.exit(fail === 0 ? 0 : 1);
