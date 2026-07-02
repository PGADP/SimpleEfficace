// se-guard — pure detection logic. No I/O here so it stays unit-testable.
// Each detector takes ({ filePath, content }) and returns an array of { id, message }.
// Advisory only: detectors never throw; the dispatcher swallows everything anyway.

const fs = require('fs');
const path = require('path');

const RULES_DIR = path.join(__dirname, 'rules');

function loadJson(name) {
  try {
    return JSON.parse(fs.readFileSync(path.join(RULES_DIR, name), 'utf8'));
  } catch {
    return null;
  }
}

// ---- file-type heuristics (patterns, not hardcoded lists) ----

function isSourceFile(filePath) {
  return /\.(ts|tsx|js|jsx|mjs|cjs)$/.test(filePath) && !/\.(test|spec)\./.test(filePath);
}

function isFrontFile(filePath) {
  return /\.(tsx|jsx|css|scss)$/.test(filePath) || /\/components?\//i.test(filePath);
}

function isUserFacingFile(filePath) {
  const p = filePath.replace(/\\/g, '/');
  return /\(public\)|\/emails?\/|\/blog\/|\.copy\.|\/landing|\/content\/|faq/i.test(p);
}

function isExcluded(filePath, excludePatterns) {
  return (excludePatterns || []).some((re) => new RegExp(re).test(filePath));
}

// ---- detectors ----

// 1. humanizer-guard: >=clusterThreshold distinct slop categories present in user-facing content.
function detectSlop({ filePath, content }) {
  if (!isUserFacingFile(filePath)) return [];
  const rules = loadJson('slop-rules.json');
  if (!rules) return [];
  const hit = [];
  for (const cat of rules.categories) {
    if (cat.patterns.some((p) => new RegExp(p, 'i').test(content))) hit.push(cat.label);
  }
  if (hit.length < (rules.clusterThreshold || 2)) return [];
  return [{
    id: 'humanizer-guard',
    message: `Contenu user-facing avec ${hit.length} familles de marqueurs AI-slop (${hit.join(', ')}). Passe /se-humanizer avant de finir.`,
  }];
}

// 2. ui-guard: touching front without an obvious design-system reference (phase 1: simple reminder).
function detectUi({ filePath }) {
  if (!isFrontFile(filePath)) return [];
  return [{
    id: 'ui-guard',
    message: 'Edition front detectee. Contrat: .planning/design/DESIGN-SYSTEM.md (tokens, 6 piliers) + criteres: .planning/rules/ui-rules.json. Respecte-les avant de livrer le visuel.',
  }];
}

// 3. hardcode-guard
function detectHardcode({ filePath, content }) {
  if (!isSourceFile(filePath)) return [];
  const rules = loadJson('hardcode-patterns.json');
  if (!rules) return [];
  if (isExcluded(filePath, rules.excludeFilePatterns)) return [];
  const findings = [];
  const lines = content.split('\n');
  for (const rule of rules.patterns) {
    // magic-number is too noisy as a global scan: only flag inside comparisons/assignments, skip JSX-ish lines
    if (rule.id === 'magic-number') {
      const suspicious = lines.some((l) => {
        if (/^\s*(\/\/|\*)/.test(l)) return false;        // comment
        if (/[<>]/.test(l)) return false;                  // likely JSX/markup
        if (!/[=<>]=?|return\s/.test(l)) return false;     // only assignments/comparisons/returns
        return new RegExp(rule.regex).test(l);
      });
      if (suspicious) findings.push(`${rule.label}`);
      continue;
    }
    const re = new RegExp(rule.regex);
    if (lines.some((l) => !/^\s*(\/\/|\*)/.test(l) && re.test(l))) findings.push(rule.label);
  }
  if (!findings.length) return [];
  return [{
    id: 'hardcode-guard',
    message: `Valeur(s)/liste(s) potentiellement hardcodees: ${findings.join(' ; ')}. Extraire en constante / config ?`,
  }];
}

// 4. hygiene-guard
function detectHygiene({ filePath, content }) {
  if (!isSourceFile(filePath)) return [];
  const findings = [];
  const lines = content.split('\n');
  if (lines.some((l) => /\bconsole\.(log|debug)\(/.test(l) && !/logger/.test(l))) {
    findings.push('console.log/debug residuel');
  }
  // crude commented-out code block: 3+ consecutive comment lines containing code-like tokens
  let streak = 0;
  for (const l of lines) {
    if (/^\s*\/\/.*[;{}()=]/.test(l)) { streak++; if (streak >= 3) { findings.push('bloc de code commente'); break; } }
    else streak = 0;
  }
  if (!findings.length) return [];
  return [{
    id: 'hygiene-guard',
    message: `Hygiene: ${findings.join(' ; ')}.`,
  }];
}

// 5. monolith-guard (advisory)
function detectMonolith({ filePath, content }) {
  if (!isSourceFile(filePath)) return [];
  const t = loadJson('monolith-thresholds.json');
  if (!t) return [];
  const lines = content.split('\n');
  const findings = [];
  if (lines.length > t.fileLines) findings.push(`fichier ${lines.length} lignes (> ${t.fileLines})`);
  const exportCount = (content.match(/^\s*export\s/gm) || []).length;
  if (exportCount > t.maxExports) findings.push(`${exportCount} exports (> ${t.maxExports})`);
  // longest function body by brace counting is fragile; use a cheap proxy: lines between function/=> { and matching depth
  if (!findings.length) return [];
  return [{
    id: 'monolith-guard',
    message: `Service volumineux: ${findings.join(' ; ')}. Decouper ? (advisory)`,
  }];
}

// 6. security-guard: secrets en dur, sinks XSS, eval, route API sans validation Zod.
function detectSecurity({ filePath, content }) {
  if (!isSourceFile(filePath)) return [];
  // the guards themselves legitimately contain these patterns as regex literals
  if (/(^|[\\/])hooks[\\/]/.test(filePath)) return [];
  const findings = [];
  const lines = content.split('\n').filter((l) => !/^\s*(\/\/|\*)/.test(l));

  const rules = loadJson('secret-patterns.json');
  if (rules && !isExcluded(filePath, rules.excludeFilePatterns)) {
    const allow = rules.allowPatterns.map((p) => new RegExp(p, 'i'));
    const hit = rules.patterns.find((p) => {
      const re = new RegExp(p.regex, 'i');
      return lines.some((l) => re.test(l) && !allow.some((a) => a.test(l)));
    });
    if (hit) findings.push(`secret en dur (${hit.label}) — mets-le dans .env, le secret-gate refusera le commit`);
  }

  if (lines.some((l) => /dangerouslySetInnerHTML/.test(l))) {
    findings.push('dangerouslySetInnerHTML — sanitize le HTML (ou évite-le)');
  }
  if (lines.some((l) => /\beval\s*\(|new\s+Function\s*\(/.test(l))) {
    findings.push('eval()/new Function() — exécution de code arbitraire, à bannir');
  }

  const isApiRoute = /(^|\/)route\.(ts|js)$|\/api\//.test(filePath.replace(/\\/g, '/'));
  const handlesBody = /export\s+(async\s+)?function\s+(POST|PUT|PATCH)|request\.json\(\)|req\.body/.test(content);
  const hasZod = /\bz\.|zod|safeParse|\.parse\(/.test(content);
  if (isApiRoute && handlesBody && !hasZod) {
    findings.push('route API avec body sans validation Zod apparente — valide les inputs (règle CLAUDE.md)');
  }

  if (!findings.length) return [];
  return [{ id: 'security-guard', message: `Sécurité: ${findings.join(' ; ')}.` }];
}

const DETECTORS = [detectSlop, detectUi, detectHardcode, detectHygiene, detectMonolith, detectSecurity];

function runAll({ filePath, content }) {
  const out = [];
  for (const d of DETECTORS) {
    try { out.push(...d({ filePath, content })); } catch { /* advisory: ignore detector errors */ }
  }
  return out;
}

module.exports = {
  runAll,
  detectSlop, detectUi, detectHardcode, detectHygiene, detectMonolith, detectSecurity,
  isSourceFile, isFrontFile, isUserFacingFile,
};
