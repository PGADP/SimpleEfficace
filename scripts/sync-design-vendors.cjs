#!/usr/bin/env node
/**
 * sync-design-vendors — refetch and re-curate the design corpora under vendor/design/.
 *
 * Simple & Efficace vendors a CURATED SUBSET of three upstream repos: only the
 * payloads the SE skills actually read (design language, platform rules, design
 * databases). Installers, browser extensions, live-editing servers, demos and
 * test suites are excluded on purpose — they are dead weight in a system repo.
 *
 * Every vendored payload must stay dependency-free (node: builtins / python
 * stdlib only) so the system works right after a clone, offline.
 *
 * Usage:
 *   node scripts/sync-design-vendors.cjs           # refetch + rewrite vendor/design/
 *   node scripts/sync-design-vendors.cjs --check   # report drift, write nothing
 *   node scripts/sync-design-vendors.cjs --only impeccable
 */

const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { execFileSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const VENDOR_DIR = path.join(ROOT, 'vendor', 'design');
const VERSIONS_FILE = path.join(VENDOR_DIR, 'VERSIONS.json');

const BYTES_PER_KB = 1024;
const SHORT_SHA_LEN = 8;
const ISO_DATE_LEN = 10;

/**
 * Curation manifest. `copy` entries are [sourcePathInRepo, destPathInVendor].
 * Anything not listed here is deliberately left upstream.
 */
const SOURCES = [
  {
    name: 'impeccable',
    repo: 'https://github.com/pbakaus/impeccable.git',
    license: 'Apache-2.0',
    author: 'Paul Bakaus',
    why: 'Design language (7 reference axes + command playbooks) and the deterministic anti-pattern detector.',
    excluded: 'cli/, extension/, plugin/, demos/, tests/, scripts/live-* (live browser editing server, ~1 MB).',
    copy: [
      ['LICENSE', 'LICENSE'],
      ['NOTICE.md', 'NOTICE.upstream.md'],
      ['skill/SKILL.src.md', 'SKILL.src.md'],
      ['skill/reference', 'reference'],
      ['skill/scripts/command-metadata.json', 'command-metadata.json'],
      ['.claude/skills/impeccable/scripts/detect.mjs', 'detect.mjs'],
      ['.claude/skills/impeccable/scripts/detector', 'detector'],
      // detector/cli/main.mjs resolves config helpers at ../../lib — required, not optional
      ['.claude/skills/impeccable/scripts/lib', 'lib'],
    ],
  },
  {
    name: 'platform-design-skills',
    repo: 'https://github.com/ehmo/platform-design-skills.git',
    license: 'MIT',
    author: 'ehmo',
    why: 'Apple HIG / Material Design 3 / WCAG 2.2 rules for 8 platforms — the only corpus covering desktop (macOS) and native apps.',
    excluded: 'Apple_HIG.pdf (~5 MB binary), CHANGELOG.md.',
    copy: [
      ['LICENSE', 'LICENSE'],
      ['README.md', 'README.upstream.md'],
      ['skills', 'skills'],
    ],
  },
  {
    name: 'ui-ux-pro-max',
    repo: 'https://github.com/nextlevelbuilder/ui-ux-pro-max-skill.git',
    license: 'MIT',
    author: 'nextlevelbuilder',
    why: 'Design databases (styles, palettes, font pairings, UX guidelines, product-type reasoning rules) + BM25 search engine. Bootstrap only — see vendor/design/README.md.',
    excluded: 'cli/ (npm installer), projects/, screenshots/, docs/, scripts/tests/.',
    copy: [
      ['LICENSE', 'LICENSE'],
      ['src/ui-ux-pro-max/data', 'data'],
      ['src/ui-ux-pro-max/scripts', 'scripts'],
      ['src/ui-ux-pro-max/templates', 'templates'],
    ],
    prune: ['scripts/tests'],
  },
];

const args = process.argv.slice(2);
const CHECK_ONLY = args.includes('--check');
const onlyIdx = args.indexOf('--only');
const ONLY = onlyIdx !== -1 ? args[onlyIdx + 1] : null;

function log(msg) {
  process.stdout.write(`${msg}\n`);
}

function git(cwd, ...gitArgs) {
  return execFileSync('git', gitArgs, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

function copyRecursive(from, to) {
  const stat = fs.statSync(from);
  if (stat.isDirectory()) {
    fs.mkdirSync(to, { recursive: true });
    for (const entry of fs.readdirSync(from)) {
      copyRecursive(path.join(from, entry), path.join(to, entry));
    }
    return;
  }
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
}

function dirSizeKb(dir) {
  let total = 0;
  const walk = (p) => {
    for (const entry of fs.readdirSync(p, { withFileTypes: true })) {
      const full = path.join(p, entry.name);
      if (entry.isDirectory()) walk(full);
      else total += fs.statSync(full).size;
    }
  };
  if (fs.existsSync(dir)) walk(dir);
  return Math.round(total / BYTES_PER_KB);
}

function readVersions() {
  if (!fs.existsSync(VERSIONS_FILE)) return { sources: {} };
  return JSON.parse(fs.readFileSync(VERSIONS_FILE, 'utf8'));
}

function syncSource(source, tmpRoot) {
  const clonePath = path.join(tmpRoot, source.name);
  log(`  → clone ${source.repo}`);
  execFileSync('git', ['clone', '--depth', '1', '--quiet', source.repo, clonePath], { stdio: ['ignore', 'pipe', 'pipe'] });
  const sha = git(clonePath, 'rev-parse', 'HEAD');
  const date = git(clonePath, 'log', '-1', '--format=%cI');

  const dest = path.join(VENDOR_DIR, source.name);
  if (!CHECK_ONLY) {
    fs.rmSync(dest, { recursive: true, force: true });
    for (const [src, out] of source.copy) {
      const fullSrc = path.join(clonePath, src);
      if (!fs.existsSync(fullSrc)) {
        throw new Error(`${source.name}: upstream path missing "${src}" — the manifest is stale, fix scripts/sync-design-vendors.cjs`);
      }
      copyRecursive(fullSrc, path.join(dest, out));
    }
    for (const pruned of source.prune || []) {
      fs.rmSync(path.join(dest, pruned), { recursive: true, force: true });
    }
  }

  return { sha, date, sizeKb: dirSizeKb(dest) };
}

function renderNotice(versions) {
  const lines = [
    '# NOTICE — corpus de design vendorisés',
    '',
    '> Généré par `scripts/sync-design-vendors.cjs`. Ne pas éditer à la main.',
    '',
    'Simple & Efficace redistribue un sous-ensemble curaté des projets ci-dessous.',
    'Chaque payload conserve sa licence d\'origine, présente dans son dossier.',
    '',
  ];
  for (const source of SOURCES) {
    const v = versions.sources[source.name];
    lines.push(`## ${source.name}`);
    lines.push('');
    lines.push(`- Source : ${source.repo.replace(/\.git$/, '')}`);
    lines.push(`- Auteur : ${source.author}`);
    lines.push(`- Licence : **${source.license}** (voir \`vendor/design/${source.name}/LICENSE\`)`);
    lines.push(`- Version épinglée : \`${v ? v.sha : 'non synchronisé'}\`${v ? ` (${v.date.slice(0, ISO_DATE_LEN)})` : ''}`);
    lines.push(`- Poids vendorisé : ${v ? `${v.sizeKb} Ko` : '—'}`);
    lines.push(`- Pourquoi : ${source.why}`);
    lines.push(`- Exclu : ${source.excluded}`);
    lines.push('');
  }
  lines.push('---');
  lines.push('');
  lines.push('Aucune modification n\'est apportée aux fichiers vendorisés. Les adaptations');
  lines.push('Simple & Efficace vivent dans `.planning/design/references/`, qui cite ces sources.');
  lines.push('');
  return lines.join('\n');
}

function main() {
  const selected = ONLY ? SOURCES.filter((s) => s.name === ONLY) : SOURCES;
  if (selected.length === 0) {
    log(`Source inconnue: ${ONLY}. Sources: ${SOURCES.map((s) => s.name).join(', ')}`);
    process.exit(1);
  }

  const previous = readVersions();
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'se-vendor-'));
  const versions = { syncedAt: new Date().toISOString(), sources: { ...previous.sources } };
  let drift = false;

  try {
    for (const source of selected) {
      log(`\n[${source.name}]`);
      const result = syncSource(source, tmpRoot);
      const before = previous.sources[source.name];
      if (before && before.sha !== result.sha) {
        drift = true;
        log(`  ⚠ upstream a bougé : ${before.sha.slice(0, SHORT_SHA_LEN)} → ${result.sha.slice(0, SHORT_SHA_LEN)}`);
      } else if (before) {
        log(`  ✓ à jour (${result.sha.slice(0, SHORT_SHA_LEN)})`);
      } else {
        log(`  + nouveau (${result.sha.slice(0, SHORT_SHA_LEN)}, ${result.sizeKb} Ko)`);
      }
      versions.sources[source.name] = result;
    }
  } finally {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  }

  if (CHECK_ONLY) {
    log(drift ? '\nDrift détecté. Relancer sans --check pour resynchroniser.' : '\nAucun drift.');
    process.exit(drift ? 1 : 0);
  }

  fs.mkdirSync(VENDOR_DIR, { recursive: true });
  fs.writeFileSync(VERSIONS_FILE, `${JSON.stringify(versions, null, 2)}\n`, 'utf8');
  fs.writeFileSync(path.join(VENDOR_DIR, 'NOTICE.md'), renderNotice(versions), 'utf8');
  log(`\nVendor écrit dans vendor/design/ (${dirSizeKb(VENDOR_DIR)} Ko au total).`);
}

main();
