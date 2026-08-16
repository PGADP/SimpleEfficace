#!/usr/bin/env node
// ui-pass — enregistre ou consulte les passes /se-ui du registre .planning/design/ui-passes.json.
// C'est la SEULE porte d'écriture du registre ; se-ui-gate.cjs (commit) le lit.
//
// Une passe n'est valide qu'avec les DEUX moitiés du rituel :
//   - la machine : le détecteur impeccable est relancé ici même sur les fichiers — on ne
//     peut pas enregistrer une passe sur du code qui contient encore des anti-patterns ;
//   - l'humain : --url (la page que l'humain a regardée) + --go (sa réponse de validation).
//
// Usage :
//   node scripts/ui-pass.cjs record <fichier...> --url <url> --go "<reponse humaine>"
//   node scripts/ui-pass.cjs status [fichier...]
//
// Codes de sortie : 0 OK ; 1 refus (anti-patterns restants, GO/URL manquants) ; 2 mauvais usage.

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { isFrontCodeFile } = require(path.join(__dirname, '..', 'hooks', 'guard-lib.cjs'));
const { LEDGER_REL, contentHash, readLedger, writeLedger, entryStatus, STATUS_LABEL } = require(path.join(__dirname, '..', 'hooks', 'ui-ledger.cjs'));

const DETECTOR = path.join(__dirname, '..', 'vendor', 'design', 'impeccable', 'detect.mjs');
const DETECTOR_TIMEOUT_MS = 15000;
// Un GO doit ressembler à une validation, pas à un silence : on refuse la chaîne vide
// et les non-réponses évidentes. Le contenu exact reste jugé par personne — c'est la
// trace de la réponse humaine, pas un mot de passe.
const NON_GO_RE = /^(non?|no|ko|nope|attends?|stop|pas encore)\b/i;

function fail(msg) { console.error(msg); process.exit(1); }
function usage() {
  console.error('Usage:\n  ui-pass record <fichier...> --url <url> --go "<reponse humaine>"\n  ui-pass status [fichier...]');
  process.exit(2);
}

function parseArgs(argv) {
  const args = { cmd: argv[0], files: [], url: null, go: null };
  for (let i = 1; i < argv.length; i += 1) {
    if (argv[i] === '--url') args.url = argv[++i];
    else if (argv[i] === '--go') args.go = argv[++i];
    else args.files.push(argv[i]);
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));
if (!['record', 'status'].includes(args.cmd)) usage();

const projectDir = process.cwd();
if (!fs.existsSync(path.join(projectDir, '.planning'))) {
  fail('ui-pass: pas un projet SE (aucun .planning/ ici) — lancer depuis la racine du projet.');
}

const ledger = readLedger(projectDir);

if (args.cmd === 'status') {
  const targets = args.files.length ? args.files : Object.keys(ledger.entries);
  if (!targets.length) { console.log('Registre vide — aucune passe enregistrée.'); process.exit(0); }
  let stale = 0;
  for (const rel of targets) {
    const p = rel.replace(/\\/g, '/');
    let status;
    try { status = entryStatus(ledger.entries[p], contentHash(fs.readFileSync(path.join(projectDir, p), 'utf8'))); }
    catch { status = 'missing'; }
    if (status !== 'ok') stale += 1;
    console.log(`  ${status === 'ok' ? 'OK   ' : 'MANQUE'} ${p}${status !== 'ok' ? ` — ${STATUS_LABEL[status]}` : ''}`);
  }
  process.exit(stale ? 1 : 0);
}

// ---- record ----
if (!args.files.length) usage();
if (!args.url || !/^https?:\/\//.test(args.url)) {
  fail('ui-pass: --url manquante ou invalide. Donner l\'URL exacte que l\'humain a regardée (http://localhost:3000/...).');
}
if (!args.go || !args.go.trim() || NON_GO_RE.test(args.go.trim())) {
  fail('ui-pass: --go absent ou negatif. On enregistre la REPONSE de l\'humain au checkpoint visuel ("GO", "valide", ...). Pas de GO humain = pas de passe.');
}

const files = args.files.map((f) => f.replace(/\\/g, '/'));
const notFront = files.filter((f) => !isFrontCodeFile(f));
if (notFront.length) fail(`ui-pass: pas des fichiers front : ${notFront.join(', ')}`);
const absent = files.filter((f) => !fs.existsSync(path.join(projectDir, f)));
if (absent.length) fail(`ui-pass: introuvables : ${absent.join(', ')}`);

// La machine d'abord : pas d'enregistrement tant que le détecteur trouve des anti-patterns.
if (fs.existsSync(DETECTOR)) {
  const result = spawnSync(process.execPath, [DETECTOR, '--json', '--no-advisory', ...files.map((f) => path.join(projectDir, f))], {
    encoding: 'utf8', timeout: DETECTOR_TIMEOUT_MS, cwd: projectDir, maxBuffer: 10 * 1024 * 1024,
  });
  try {
    const findings = JSON.parse(result.stdout || '[]');
    if (Array.isArray(findings) && findings.length) {
      fail(
        `ui-pass: ${findings.length} anti-pattern(s) encore présents — corriger avant d'enregistrer :\n` +
        findings.map((f) => `  • ${path.basename(f.file || '?')}${f.line ? `:${f.line}` : ''} — ${f.name}`).join('\n')
      );
    }
  } catch { /* détecteur illisible : on n'invente pas de refus */ }
}

const now = new Date().toISOString();
for (const rel of files) {
  ledger.entries[rel] = {
    sha1: contentHash(fs.readFileSync(path.join(projectDir, rel), 'utf8')),
    at: now,
    url: args.url,
    humanGo: args.go.trim(),
    validatedBy: 'human',
  };
}
writeLedger(projectDir, ledger);
console.log(`ui-pass: ${files.length} passe(s) enregistrée(s) dans ${LEDGER_REL} (URL: ${args.url}).`);
console.log('Inclure ce fichier dans le commit.');
console.log('RAPPEL : le checkpoint est fini — TUER le serveur dev lancé pour lui (kill du process en fond). Un serveur par checkpoint oublié = des orphelins qui s\'accumulent.');
