#!/usr/bin/env node
// Vérification déterministe de se-guard. On exécute la lib sur des cas propres ET piégés.
// Lancer: node hooks/se-guard.test.cjs  → affiche PASS/FAIL et sort 0 si tout passe.

const { runAll } = require('./guard-lib.cjs');

let pass = 0, fail = 0;
function check(name, cond) {
  if (cond) { pass++; console.log(`  PASS  ${name}`); }
  else { fail++; console.log(`  FAIL  ${name}`); }
}
function has(findings, id) { return findings.some((f) => f.id === id); }

// --- CAS PROPRES (doivent produire 0 finding ou pas le finding concerné) ---

check('code propre TS → pas de hardcode/hygiene/monolith',
  runAll({ filePath: 'src/lib/userService.ts', content:
    'export function getUser(id: string) {\n  return db.user.findUnique({ where: { id } });\n}\n' })
    .length === 0);

check('contenu user-facing naturel → pas de slop',
  !has(runAll({ filePath: 'src/app/(public)/landing.copy.ts', content:
    'export const hero = "Offrez le livre de votre vie a ceux que vous aimez.";\n' }), 'humanizer-guard'));

check('fichier de constantes exclu du hardcode-guard',
  !has(runAll({ filePath: 'src/constants.ts', content:
    'export const CATEGORIES = ["a","b","c","d"];\nexport const MAX = 42;\n' }), 'hardcode-guard'));

// --- CAS PIÉGÉS (doivent produire le finding attendu) ---

check('contenu user-facing AI-slop (>=2 familles) → humanizer-guard',
  has(runAll({ filePath: 'src/app/(public)/about.copy.ts', content:
    'Ce produit véritable se présente comme une expérience incontournable, une nouvelle ère pour vos souvenirs.' }),
    'humanizer-guard'));

check('chemin absolu en dur → hardcode-guard',
  has(runAll({ filePath: 'src/lib/config.ts', content:
    'const p = "C:\\\\Users\\\\Yo\\\\data";\n' }), 'hardcode-guard'));

check('liste de strings en dur → hardcode-guard',
  has(runAll({ filePath: 'src/lib/roles.ts', content:
    'const roles = ["admin", "editor", "viewer", "guest"];\n' }), 'hardcode-guard'));

check('console.log résiduel → hygiene-guard',
  has(runAll({ filePath: 'src/lib/x.ts', content:
    'export function f() { console.log("debug"); return 1; }\n' }), 'hygiene-guard'));

check('fichier front → ui-guard',
  has(runAll({ filePath: 'src/components/Button.tsx', content:
    'export function Button() { return <button>ok</button>; }\n' }), 'ui-guard'));

check('gros fichier → monolith-guard',
  has(runAll({ filePath: 'src/lib/huge.ts', content:
    'const x = 1;\n'.repeat(450) }), 'monolith-guard'));

// --- SÉCURITÉ (security-guard) ---

check('clé API sk- en dur → security-guard',
  has(runAll({ filePath: 'src/lib/client.ts', content:
    'const key = "sk-abc123def456ghi789jkl012mno";\n' }), 'security-guard'));

check('placeholder de clé (process.env / your-api-key) → PAS de security-guard',
  !has(runAll({ filePath: 'src/lib/client.ts', content:
    'const key = process.env.OPENAI_API_KEY;\nconst doc = "mets your-api-key ici";\n' }), 'security-guard'));

check('dangerouslySetInnerHTML → security-guard',
  has(runAll({ filePath: 'src/components/Rich.tsx', content:
    'export function Rich({ html }) { return <div dangerouslySetInnerHTML={{ __html: html }} />; }\n' }), 'security-guard'));

check('eval() → security-guard',
  has(runAll({ filePath: 'src/lib/calc.ts', content:
    'export function run(expr: string) { return eval(expr); }\n' }), 'security-guard'));

check('route API POST sans Zod → security-guard',
  has(runAll({ filePath: 'src/app/api/users/route.ts', content:
    'export async function POST(request: Request) {\n  const body = await request.json();\n  return Response.json(body);\n}\n' }), 'security-guard'));

check('route API POST avec Zod → PAS de security-guard',
  !has(runAll({ filePath: 'src/app/api/users/route.ts', content:
    'import { z } from "zod";\nconst S = z.object({ name: z.string() });\nexport async function POST(request: Request) {\n  const body = S.safeParse(await request.json());\n  return Response.json(body);\n}\n' }), 'security-guard'));

check('fichier hooks/ exclu du security-guard',
  !has(runAll({ filePath: 'hooks/guard-lib.cjs', content:
    'const re = /dangerouslySetInnerHTML/;\n' }), 'security-guard'));

// --- RANGEMENT (placement-guard) ---

const REPO = '/repo';
function place(rel) {
  return runAll({ filePath: `${REPO}/${rel}`, content: '# doc\n', projectDir: REPO });
}

check('rapport à la racine du repo → placement-guard',
  has(place('RAPPORT-REVIEW-2026-08-03.md'), 'placement-guard'));

check('README.md à la racine → PAS de placement-guard',
  !has(place('README.md'), 'placement-guard'));

check('.md libre à la racine de .planning/ → placement-guard',
  has(place('.planning/NOTES-DIVERSES.md'), 'placement-guard'));

check('.planning/STATE.md → PAS de placement-guard',
  !has(place('.planning/STATE.md'), 'placement-guard'));

check('dossier .planning/ non déclaré → placement-guard',
  has(place('.planning/rapports/truc.md'), 'placement-guard'));

check('audit rangé dans .planning/audits/ → PAS de placement-guard',
  !has(place('.planning/audits/2026-08-03-security-auth.md'), 'placement-guard'));

check('recherche datée dans research/ → PAS de placement-guard',
  !has(place('.planning/research/2026-08-03-mem0-vs-graphiti.md'), 'placement-guard'));

check('fichier de phase au nom fixe → PAS de placement-guard',
  !has(place('.planning/phases/03-auth/CONTEXT.md'), 'placement-guard'));

check('fichier de phase préfixé GSD → PAS de placement-guard',
  !has(place('.planning/phases/03-auth/03-01-PLAN.md'), 'placement-guard'));

check('fichier de phase au nom libre → placement-guard',
  has(place('.planning/phases/03-auth/notes.md'), 'placement-guard'));

check('phase archivée → PAS de placement-guard',
  !has(place('.planning/_archive/phases/01-fondations/SUMMARY.md'), 'placement-guard'));

check('skill se-review.md (dossier système) → PAS de placement-guard',
  !has(place('.claude/commands/se-review.md'), 'placement-guard'));

check('doc de conception docs/ → PAS de placement-guard',
  !has(place('docs/SYSTEME.md'), 'placement-guard'));

check('audit posé dans docs/ → placement-guard',
  has(place('docs/AUDIT-perf.md'), 'placement-guard'));

check('fichier hors projet (chemin absolu non ancré) → PAS de placement-guard',
  !has(runAll({ filePath: '/ailleurs/AUDIT.md', content: '# x\n', projectDir: REPO }), 'placement-guard'));

check('fichier source .ts → PAS de placement-guard',
  !has(runAll({ filePath: `${REPO}/src/lib/x.ts`, content: 'export const a = 1;\n', projectDir: REPO }), 'placement-guard'));

// --- détecteur impeccable vendorisé (I/O réelle, donc testé à part de guard-lib) ---
const fsx = require('fs');
const osx = require('os');
const pathx = require('path');
const { detectAntipatterns } = require('./se-guard.cjs');

// REPO ci-dessus est un chemin fictif pour les détecteurs purs. Ici on a besoin du
// vrai dépôt : le détecteur est un vrai binaire à spawner.
const PROJECT_ROOT = pathx.resolve(__dirname, '..');
const hasVendoredDetector = fsx.existsSync(pathx.join(PROJECT_ROOT, 'vendor', 'design', 'impeccable', 'detect.mjs'));

check('fichier non-front → détecteur non lancé',
  detectAntipatterns(`${PROJECT_ROOT}/scripts/x.cjs`, PROJECT_ROOT).length === 0);

check('projet sans vendor/ → aucun finding, aucune erreur',
  detectAntipatterns(`${PROJECT_ROOT}/a.css`, osx.tmpdir()).length === 0);

if (hasVendoredDetector) {
  const probe = pathx.join(osx.tmpdir(), `se-guard-probe-${process.pid}.css`);
  fsx.writeFileSync(probe, 'body { font-family: Inter, sans-serif; }\n');
  const found = detectAntipatterns(probe, PROJECT_ROOT);
  // Le détecteur sort en code 2 quand il TROUVE quelque chose : on parse stdout
  // quel que soit le status, sinon on jette silencieusement tous les findings.
  check('anti-pattern réel remonté malgré le code de sortie non nul',
    found.length > 0 && found[0].id.startsWith('impeccable:'));
  check('le message porte la règle et le contexte',
    found.length > 0 && /ligne 1/.test(found[0].message));

  fsx.writeFileSync(probe, 'body { font-family: Charter, Georgia, serif; }\n');
  check('fichier sain → aucun finding', detectAntipatterns(probe, PROJECT_ROOT).length === 0);
  fsx.rmSync(probe, { force: true });
} else {
  console.log('  SKIP  détecteur impeccable non vendorisé (node scripts/sync-design-vendors.cjs)');
}

console.log(`\n${pass} pass / ${fail} fail`);
process.exit(fail === 0 ? 0 : 1);
