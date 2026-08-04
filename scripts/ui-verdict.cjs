#!/usr/bin/env node
/**
 * ui-verdict — croise les mesures de `tests/e2e/ui-verify.spec.ts` avec les critères
 * de `.planning/rules/ui-rules.json` et rend un verdict BLOCK / FLAG / PASS.
 *
 * Le point de tout ce dispositif : un checkpoint visuel qui MESURE au lieu de juger
 * à l'œil. Ce script ne contient aucun critère — ils vivent tous dans ui-rules.json.
 *
 * Usage :
 *   node scripts/ui-verdict.cjs --name dashboard
 *   node scripts/ui-verdict.cjs --name dashboard --json
 *   node scripts/ui-verdict.cjs --name dashboard --advisory   # ne sort jamais en erreur
 *
 * Code de sortie : 1 s'il reste au moins un BLOCK (sauf --advisory), 0 sinon.
 *
 * Deux principes non négociables :
 *  - une métrique absente du rapport donne SKIPPED, jamais BLOCK. On ne bloque pas
 *    sur ce qu'on n'a pas su mesurer.
 *  - entre plusieurs breakpoints, on retient toujours le PIRE cas. Une UI cassée sur
 *    mobile est une UI cassée.
 */

const fs = require('node:fs');
const path = require('node:path');

const ROOT = process.cwd();
// Cascade des critères (sauf --rules, qui garde priorité absolue) :
//   1. la copie du projet courant, si elle existe,
//   2. sinon le défaut système livré avec l'installation SE (ce repo).
const PROJECT_RULES = path.join(ROOT, '.planning', 'rules', 'ui-rules.json');
const SYSTEM_RULES = path.join(__dirname, '..', 'rules', 'ui-rules.json');
const DEFAULT_REPORT_DIR = path.join(ROOT, '.planning', '_ui');
const DEFAULT_EXCEPTIONS = path.join(ROOT, '.planning', 'design', 'ui-exceptions.json');

const VERDICT = { BLOCK: 'BLOCK', FLAG: 'FLAG', PASS: 'PASS', SKIPPED: 'SKIPPED' };
const MAX_DETAIL_ITEMS = 5;

function parseArgs(argv) {
  const args = { name: null, json: false, advisory: false, reportDir: DEFAULT_REPORT_DIR, rulesFile: null };
  for (let i = 0; i < argv.length; i += 1) {
    const flag = argv[i];
    if (flag === '--name') args.name = argv[++i];
    else if (flag === '--json') args.json = true;
    else if (flag === '--advisory') args.advisory = true;
    else if (flag === '--report-dir') args.reportDir = path.resolve(argv[++i]);
    else if (flag === '--rules') args.rulesFile = path.resolve(argv[++i]);
  }
  return args;
}

/** Read `a.b.c` out of a report; returns undefined as soon as a segment is missing. */
function readMetric(report, metricPath) {
  return metricPath.split('.').reduce((node, key) => (node == null ? undefined : node[key]), report);
}

/**
 * Reduce one metric across breakpoints to its WORST value, given the comparison the
 * rule will apply. Worst depends on the operator: for `lte` the largest value is the
 * worst, for `gte` the smallest one is.
 */
function worstAcross(values, op) {
  const present = values.filter((v) => v !== undefined && v !== null);
  if (present.length === 0) return undefined;

  if (Array.isArray(present[0])) {
    const merged = [];
    const seen = new Set();
    for (const list of present) {
      for (const item of list) {
        const key = String(item);
        if (!seen.has(key)) {
          seen.add(key);
          merged.push(item);
        }
      }
    }
    return merged;
  }

  if (typeof present[0] === 'boolean') {
    return op === 'isFalse' ? present.some(Boolean) : present.every(Boolean);
  }

  const numbers = present.map(Number).filter((n) => Number.isFinite(n));
  if (numbers.length === 0) return undefined;
  if (op === 'gte' || op === 'gt') return Math.min(...numbers);
  return Math.max(...numbers);
}

function evaluate(check, value) {
  switch (check.op) {
    case 'empty':
      return Array.isArray(value) ? value.length === 0 : !value;
    case 'lte':
      return value <= check.value;
    case 'lt':
      return value < check.value;
    case 'gte':
      return value >= check.value;
    case 'gt':
      return value > check.value;
    case 'eq':
      return value === check.value;
    case 'isTrue':
      return value === true;
    case 'isFalse':
      return value === false;
    default:
      throw new Error(`Opérateur inconnu dans ui-rules.json: "${check.op}"`);
  }
}

function describeValue(value) {
  if (Array.isArray(value)) {
    const head = value.slice(0, MAX_DETAIL_ITEMS).map((v) => `    · ${v}`).join('\n');
    const rest = value.length > MAX_DETAIL_ITEMS ? `\n    · … et ${value.length - MAX_DETAIL_ITEMS} autre(s)` : '';
    return `${value.length} occurrence(s) :\n${head}${rest}`;
  }
  return String(value);
}

function loadReports(reportDir, name) {
  if (!fs.existsSync(reportDir)) return [];
  const prefix = name ? `ui-report.${name}.` : 'ui-report.';
  return fs
    .readdirSync(reportDir)
    .filter((file) => file.startsWith(prefix) && file.endsWith('.json'))
    .map((file) => {
      try {
        return JSON.parse(fs.readFileSync(path.join(reportDir, file), 'utf8'));
      } catch (error) {
        throw new Error(`Rapport illisible: ${file} — ${error.message}`);
      }
    });
}

function loadExceptions() {
  if (!fs.existsSync(DEFAULT_EXCEPTIONS)) return {};
  try {
    return JSON.parse(fs.readFileSync(DEFAULT_EXCEPTIONS, 'utf8'));
  } catch {
    return {};
  }
}

function judge(rules, reports, exceptions) {
  const findings = [];

  for (const rule of rules.rules) {
    if (!rule.check) {
      findings.push({
        slug: rule.slug,
        pillar: rule.pillar,
        verdict: VERDICT.SKIPPED,
        reason: `à juger (${rule.verifiedBy})`,
        norm: rule.norm,
        verifiedBy: rule.verifiedBy,
      });
      continue;
    }

    const values = reports.map((report) => readMetric(report, rule.check.metric));
    const value = worstAcross(values, rule.check.op);

    if (value === undefined) {
      findings.push({
        slug: rule.slug,
        pillar: rule.pillar,
        verdict: VERDICT.SKIPPED,
        reason: `métrique absente des rapports (${rule.check.metric})`,
        norm: rule.norm,
        verifiedBy: rule.verifiedBy,
      });
      continue;
    }

    if (evaluate(rule.check, value)) {
      findings.push({ slug: rule.slug, pillar: rule.pillar, verdict: VERDICT.PASS, norm: rule.norm, verifiedBy: rule.verifiedBy });
      continue;
    }

    // DOWNGRADE: a documented exception turns BLOCK into FLAG — never on a
    // non-negotiable dimension.
    let verdict = rule.severity;
    let downgradeNote = null;
    const exception = exceptions[rule.slug];
    if (
      verdict === VERDICT.BLOCK &&
      exception &&
      (rules.downgradeableDimensions || []).includes(rule.pillar) &&
      !(rules.nonNegotiableDimensions || []).includes(rule.pillar)
    ) {
      verdict = VERDICT.FLAG;
      downgradeNote = exception;
    }

    findings.push({
      slug: rule.slug,
      pillar: rule.pillar,
      verdict,
      norm: rule.norm,
      verifiedBy: rule.verifiedBy,
      metric: rule.check.metric,
      measured: value,
      expected: rule.check.value !== undefined ? `${rule.check.op} ${rule.check.value}` : rule.check.op,
      downgradeNote,
    });
  }

  return findings;
}

function render(findings, reports, name) {
  const blocks = findings.filter((f) => f.verdict === VERDICT.BLOCK);
  const flags = findings.filter((f) => f.verdict === VERDICT.FLAG);
  const passes = findings.filter((f) => f.verdict === VERDICT.PASS);
  const skipped = findings.filter((f) => f.verdict === VERDICT.SKIPPED);
  const toJudge = skipped.filter((f) => f.verifiedBy === 'llm' || f.verifiedBy === 'human');

  const lines = [];
  const breakpoints = reports.map((r) => r.meta?.breakpoint).filter(Boolean);
  lines.push(`Verdict UI — ${name || 'tous écrans'} (${reports.length} rapport(s) : ${breakpoints.join(', ') || '—'})`);
  lines.push('');
  lines.push(`  BLOCK ${blocks.length}   FLAG ${flags.length}   PASS ${passes.length}   à juger ${toJudge.length}   non mesuré ${skipped.length - toJudge.length}`);
  lines.push('');

  const section = (title, items) => {
    if (items.length === 0) return;
    lines.push(title);
    for (const item of items) {
      lines.push(`  [${item.pillar}] ${item.slug}`);
      lines.push(`    ${item.norm}`);
      if (item.measured !== undefined) lines.push(`    mesuré : ${describeValue(item.measured)}`);
      if (item.expected) lines.push(`    attendu : ${item.expected}`);
      if (item.downgradeNote) lines.push(`    exception documentée : ${item.downgradeNote}`);
      lines.push('');
    }
  };

  section('BLOCK — à corriger avant livraison', blocks);
  section('FLAG — à trancher', flags);

  if (toJudge.length > 0) {
    lines.push('À juger (non automatisable) :');
    for (const item of toJudge) lines.push(`  · ${item.slug} — ${item.norm}`);
    lines.push('');
  }

  lines.push(blocks.length > 0 ? 'VERDICT : NO-GO' : 'VERDICT : GO');
  return lines.join('\n');
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  const explicitRules = args.rulesFile !== null;
  if (!explicitRules) {
    args.rulesFile = fs.existsSync(PROJECT_RULES) ? PROJECT_RULES : SYSTEM_RULES;
  }

  if (!fs.existsSync(args.rulesFile)) {
    process.stderr.write(explicitRules
      ? `Critères introuvables: ${args.rulesFile}\n`
      : `Critères introuvables: ni ${PROJECT_RULES} (copie projet) ni ${SYSTEM_RULES} (défaut système)\n`);
    process.exit(args.advisory ? 0 : 1);
  }

  const rules = JSON.parse(fs.readFileSync(args.rulesFile, 'utf8'));
  const reports = loadReports(args.reportDir, args.name);

  if (reports.length === 0) {
    const message = `Aucun rapport dans ${args.reportDir}${args.name ? ` pour « ${args.name} »` : ''}. Lancer tests/e2e/ui-verify.spec.ts d'abord.`;
    if (args.json) process.stdout.write(`${JSON.stringify({ verdict: 'SKIPPED', reason: message, findings: [] }, null, 2)}\n`);
    else process.stdout.write(`${message}\n`);
    process.exit(0);
  }

  const findings = judge(rules, reports, loadExceptions());
  const blockCount = findings.filter((f) => f.verdict === VERDICT.BLOCK).length;

  if (args.json) {
    process.stdout.write(`${JSON.stringify({ verdict: blockCount > 0 ? 'NO-GO' : 'GO', blockCount, name: args.name, findings }, null, 2)}\n`);
  } else {
    process.stdout.write(`${render(findings, reports, args.name)}\n`);
  }

  process.exit(blockCount > 0 && !args.advisory ? 1 : 0);
}

if (require.main === module) main();

module.exports = { judge, worstAcross, evaluate, readMetric };
