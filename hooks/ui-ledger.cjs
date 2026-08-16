// ui-ledger — registre des passes /se-ui. SOURCE UNIQUE, lue par se-ui-gate.cjs
// (qui refuse le commit) et écrite par scripts/ui-pass.cjs (qui enregistre la passe).
//
// Le registre répond à une seule question : ce fichier front, dans l'état exact où il
// va être commité, a-t-il reçu une passe /se-ui ET un GO humain sur le rendu réel ?
//
// Il est COMMITÉ (.planning/design/, cf. CONVENTIONS §3) : la passe voyage avec le repo,
// sinon un clone neuf repartirait avec zéro historique et bloquerait tout.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const LEDGER_REL = path.join('.planning', 'design', 'ui-passes.json');
const LEDGER_VERSION = 1;

function ledgerPath(projectDir) {
  return path.join(projectDir, LEDGER_REL);
}

/** Content hash of what will actually be committed. Line endings normalized so a CRLF
 *  checkout does not invalidate every pass recorded on LF (Windows + git autocrlf). */
function contentHash(content) {
  return crypto.createHash('sha1').update(String(content).replace(/\r\n/g, '\n'), 'utf8').digest('hex');
}

function readLedger(projectDir) {
  try {
    const raw = JSON.parse(fs.readFileSync(ledgerPath(projectDir), 'utf8'));
    return { version: raw.version || LEDGER_VERSION, entries: raw.entries || {} };
  } catch {
    return { version: LEDGER_VERSION, entries: {} };
  }
}

function writeLedger(projectDir, ledger) {
  const target = ledgerPath(projectDir);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  // Clés triées : un registre qui se réordonne à chaque écriture produit des diffs illisibles.
  const entries = {};
  for (const key of Object.keys(ledger.entries).sort()) entries[key] = ledger.entries[key];
  fs.writeFileSync(target, JSON.stringify({ version: LEDGER_VERSION, entries }, null, 2) + '\n');
}

/**
 * Verdict on one file. Four outcomes, each with its own fix — a gate that says
 * "non conforme" without naming which of the four is useless.
 */
function entryStatus(entry, hash) {
  if (!entry) return 'missing';
  if (entry.sha1 !== hash) return 'stale';
  if (entry.validatedBy !== 'human' || !entry.url || !entry.humanGo) return 'unvalidated';
  return 'ok';
}

const STATUS_LABEL = {
  missing: 'jamais passe par /se-ui',
  stale: 'modifie depuis la passe enregistree',
  unvalidated: 'passe enregistree sans checkpoint humain (url + GO manquants)',
};

module.exports = { LEDGER_REL, LEDGER_VERSION, ledgerPath, contentHash, readLedger, writeLedger, entryStatus, STATUS_LABEL };
