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

// Per-project extension of the placement rules. A project may declare extra
// allowed dirs/files in .planning/rules/placement-overrides.json (additive only:
// arrays are concatenated with the global bank, nothing can be removed).
const PLACEMENT_OVERRIDE_KEYS = ['repoRootAllow', 'planningRootAllow', 'planningDirs', 'phaseFileAllow', 'reportAllowDirs'];

function loadPlacementRules(projectDir) {
  const rules = loadJson('placement-rules.json');
  if (!rules || !projectDir) return rules;
  let overrides = null;
  try {
    overrides = JSON.parse(fs.readFileSync(path.join(projectDir, '.planning', 'rules', 'placement-overrides.json'), 'utf8'));
  } catch {
    return rules;
  }
  if (!overrides || typeof overrides !== 'object') return rules;
  const merged = { ...rules };
  for (const key of PLACEMENT_OVERRIDE_KEYS) {
    if (Array.isArray(overrides[key])) {
      merged[key] = [...(rules[key] || []), ...overrides[key].filter((v) => typeof v === 'string')];
    }
  }
  return merged;
}

// ---- SE project detection ----

// Hooks are wired in the GLOBAL ~/.claude/settings.json, so they fire in every repo
// the user opens. A project is SE-managed iff it carries a .planning/ directory —
// anywhere else, every hook must stay silent (advisory) or allow (gates).
function isSeProject(projectDir) {
  if (!projectDir) return false;
  try {
    return fs.statSync(path.join(projectDir, '.planning')).isDirectory();
  } catch {
    return false;
  }
}

// Read a `workflow.*` toggle from the project's .planning/config.json. Single source for
// every gate that can be turned off per project. Unreadable config = the default, never
// a crash: a gate must decide on its own rules, not on a parse error.
function seFlag(projectDir, name, fallback) {
  try {
    const cfg = JSON.parse(fs.readFileSync(path.join(projectDir, '.planning', 'config.json'), 'utf8'));
    const value = (cfg.workflow || {})[name];
    return typeof value === 'boolean' ? value : fallback;
  } catch {
    return fallback;
  }
}

// ---- file-type heuristics (patterns, not hardcoded lists) ----

function isSourceFile(filePath) {
  return /\.(ts|tsx|js|jsx|mjs|cjs)$/.test(filePath) && !/\.(test|spec)\./.test(filePath);
}

function isFrontFile(filePath) {
  return /\.(tsx|jsx|css|scss)$/.test(filePath) || /\/components?\//i.test(filePath);
}

// Stricter sibling of isFrontFile, for the BLOCKING gates. isFrontFile matches anything
// under components/ — including a README.md or a fixture — which is fine for an advisory
// reminder but would deny legitimate writes. Here we require actual front CODE.
function isFrontCodeFile(filePath) {
  const p = filePath.replace(/\\/g, '/');
  if (/\.(test|spec|stories)\./.test(p)) return false; // tests and stories carry no design
  if (/\.(tsx|jsx|css|scss)$/.test(p)) return true;
  return /\/components?\//i.test(p) && /\.(ts|js)$/.test(p);
}

function isUserFacingFile(filePath) {
  // Slash de tête forcé pour que les chemins relatifs au repo (git diff --name-only)
  // matchent aussi au premier niveau (content/hero.md → /content/hero.md).
  const p = '/' + filePath.replace(/\\/g, '/').replace(/^\/+/, '');
  // "faq"/"landing" ancrés : sinon n'importe quel chemin contenant la sous-chaîne matche
  // (src/myfaqtool.ts, /landingpad/...).
  return /\(public\)|\/emails?\/|\/blog\/|\.copy\.|\/landing([\/.-]|page)|\/content\/|\/faq([\/.-]|$)/i.test(p);
}

// Repo-relative, forward-slashed path. Returns null when the file is outside the project
// (an absolute path we cannot anchor) — placement is then none of our business.
function toRepoRelative(filePath, projectDir) {
  const p = filePath.replace(/\\/g, '/');
  const base = (projectDir || '').replace(/\\/g, '/').replace(/\/+$/, '');
  if (base && p.toLowerCase().startsWith(base.toLowerCase() + '/')) return p.slice(base.length + 1);
  const isAbsolute = /^([A-Za-z]:)?\//.test(p);
  return isAbsolute ? null : p.replace(/^\.\//, '');
}

function isExcluded(filePath, excludePatterns) {
  const p = filePath.replace(/\\/g, '/'); // les patterns sont écrits avec des slashs
  return (excludePatterns || []).some((re) => new RegExp(re, 'i').test(p));
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

// Le contrat de design est-il encore un squelette ? On ne regarde que §0 (plateforme,
// direction, molettes) : les tokens se raffinent en cours de route, la direction non.
// Renvoie null quand le fichier est illisible — on ne prétend rien de ce qu'on n'a pas lu.
function designContractState(projectDir) {
  if (!projectDir) return null;
  let ds;
  try {
    ds = fs.readFileSync(path.join(projectDir, '.planning', 'design', 'DESIGN-SYSTEM.md'), 'utf8');
  } catch {
    return null;
  }
  const section0 = ds.split(/^##\s+1\./m)[0];
  const missing = [];
  if (/^##\s+0\.1[\s\S]*?à remplir/m.test(section0)) missing.push('§0.1 plateforme cible');
  if (/^##\s+0\.2[\s\S]*?à remplir/m.test(section0)) missing.push('§0.2 direction esthétique');
  return { isSkeleton: /Statut\s*:\s*SQUELETTE/i.test(ds) || missing.length > 0, missing };
}

// 2. ui-guard: touching front without an obvious design-system reference (phase 1: simple reminder).
function detectUi({ filePath, projectDir }) {
  if (!isFrontFile(filePath)) return [];

  const contract = designContractState(projectDir);
  if (contract && contract.isSkeleton) {
    const detail = contract.missing.length ? ` Manque : ${contract.missing.join(', ')}.` : '';
    return [{
      id: 'ui-guard',
      message: `Edition front alors que DESIGN-SYSTEM.md est encore un SQUELETTE.${detail} Sans direction declaree, tout agent glisse vers le meme defaut par gravite (Inter + degrade violet + cartes arrondies) et le checkpoint visuel BLOQUERA. Remplis §0.1/§0.2/§0.3 avec l'humain AVANT de continuer (cf. /se-new-project etape 6).`,
    }];
  }

  return [{
    id: 'ui-guard',
    message: 'Edition front detectee. Rituel /se-ui : (1) contrat DESIGN-SYSTEM.md — plateforme §0.1, direction §0.2, molettes §0.3 — + ui-rules.json, (2) cycle craft -> CRITIQUE -> polish, la critique n\'est pas optionnelle, (3) coherence parcours JOURNEYS.md, (4) textes UI via /se-humanizer, (5) mesure : ui-verify.spec.ts puis node scripts/ui-verdict.cjs avant livraison.',
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
        if (/<[A-Za-z!/]/.test(l)) return false;           // JSX/HTML tag — a bare `x > 42` comparison stays eligible
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
    // allow testé sur le TOKEN matché, pas la ligne : un placeholder ailleurs sur la
    // ligne ne doit pas masquer un vrai secret (même logique que se-secret-gate).
    const hit = rules.patterns.find((p) => {
      const re = new RegExp(p.regex, 'i');
      return lines.some((l) => {
        const m = re.exec(l);
        return m && !allow.some((a) => a.test(m[0]));
      });
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

// 7. placement-guard: un .md de suivi écrit hors de sa destination unique (cf. CONVENTIONS §2-3-4).
function detectPlacement({ filePath, projectDir }) {
  if (!/\.md$/i.test(filePath)) return [];
  const rel = toRepoRelative(filePath, projectDir);
  if (!rel) return [];
  const rules = loadPlacementRules(projectDir);
  if (!rules) return [];
  // system code (skills, patches, hooks) is not a tracking artifact — never our business
  if ((rules.skipDirPatterns || []).some((re) => new RegExp(re, 'i').test(rel))) return [];

  const segments = rel.split('/');
  const base = segments[segments.length - 1];
  const findings = [];

  if (segments.length === 1 && !rules.repoRootAllow.includes(base)) {
    findings.push(`\`${base}\` est à la racine du repo — un .md de suivi n'y a pas sa place (cf. CONVENTIONS §3)`);
  }

  if (segments[0] === '.planning') {
    if (segments.length === 2 && !rules.planningRootAllow.includes(base)) {
      findings.push(`\`${base}\` est à la racine de .planning/ — range-le dans un dossier déclaré (research/, audits/, phases/…)`);
    }
    if (segments.length > 2 && !rules.planningDirs.includes(segments[1])) {
      findings.push(`\`.planning/${segments[1]}/\` n'est pas un dossier déclaré — ajoute-le à CONVENTIONS §2 ET à placement-rules.json, ou range ailleurs`);
    }
    // fichiers d'une phase : suffixe invariant en MAJUSCULES (le préfixe GSD {phase}-{plan}- est toléré)
    if (segments[1] === 'phases' && segments.length >= 3) {
      const allowed = (rules.phaseFileAllow || []).some((n) => base === n || base.endsWith('-' + n));
      if (!allowed) {
        findings.push(`\`${base}\` n'est pas un nom de fichier de phase valide — attendus : ${(rules.phaseFileAllow || []).join(', ')}`);
      }
    }
  }

  const isReport = new RegExp(rules.reportNamePattern, 'i').test(base);
  const inAllowedDir = (rules.reportAllowDirs || []).some((d) => rel.startsWith(d));
  if (isReport && !inAllowedDir) {
    findings.push(`\`${base}\` ressemble à un rapport hors destination — soit il est éphémère (réponds en chat, n'écris rien), soit il va dans .planning/audits/{YYYY-MM-DD}-{type}-{slug}.md (cf. CONVENTIONS §4)`);
  }

  if (!findings.length) return [];
  return [{ id: 'placement-guard', message: `Rangement : ${findings.join(' ; ')}.` }];
}

const DETECTORS = [detectSlop, detectUi, detectHardcode, detectHygiene, detectMonolith, detectSecurity, detectPlacement];

function runAll({ filePath, content, projectDir }) {
  const out = [];
  for (const d of DETECTORS) {
    try { out.push(...d({ filePath, content, projectDir })); } catch { /* advisory: ignore detector errors */ }
  }
  return out;
}

module.exports = {
  runAll, isSeProject, seFlag,
  detectSlop, detectUi, detectHardcode, detectHygiene, detectMonolith, detectSecurity, detectPlacement,
  isSourceFile, isFrontFile, isFrontCodeFile, isUserFacingFile, toRepoRelative, designContractState,
};
