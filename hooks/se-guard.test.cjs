#!/usr/bin/env node
// Vérification déterministe de se-guard. On exécute la lib sur des cas propres ET piégés.
// Lancer: node hooks/se-guard.test.cjs  → affiche PASS/FAIL et sort 0 si tout passe.

const { runAll, isSeProject, designContractState: designContractStateExport } = require('./guard-lib.cjs');

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

// --- CONTRAT DE DESIGN (ui-guard sait distinguer un squelette d'un contrat rempli) ---

{
  const fsd = require('fs');
  const osd = require('os');
  const pathd = require('path');

  function fakeProject(dsContent) {
    const root = fsd.mkdtempSync(pathd.join(osd.tmpdir(), 'se-ds-'));
    const dir = pathd.join(root, '.planning', 'design');
    fsd.mkdirSync(dir, { recursive: true });
    fsd.writeFileSync(pathd.join(dir, 'DESIGN-SYSTEM.md'), dsContent);
    return root;
  }
  const uiMsg = (root) => runAll({
    filePath: pathd.join(root, 'src/components/Card.tsx'),
    content: 'export function Card() { return <div />; }\n',
    projectDir: root,
  }).find((f) => f.id === 'ui-guard')?.message || '';

  const REMPLI = `# DESIGN-SYSTEM\n\n## 0.1 Plateforme cible\n| Plateforme principale | web |\n\n## 0.2 Direction esthétique\n| Nom de la direction | éditorial suisse |\n\n## 0.3 Molettes\n| DESIGN_VARIANCE | 4 |\n\n## 1. Tokens\n`;
  const SQUELETTE = `# DESIGN-SYSTEM\n> Statut : SQUELETTE — à remplir au premier projet réel.\n\n## 0.1 Plateforme cible\n| Plateforme principale | *(à remplir)* |\n\n## 0.2 Direction esthétique\n| Nom de la direction | *(à remplir)* |\n\n## 1. Tokens\n`;
  const DIRECTION_MANQUANTE = `# DESIGN-SYSTEM\n\n## 0.1 Plateforme cible\n| Plateforme principale | web |\n\n## 0.2 Direction esthétique\n| Nom de la direction | *(à remplir)* |\n\n## 1. Tokens\n`;

  check('DS rempli → ui-guard rappelle le rituel normal',
    uiMsg(fakeProject(REMPLI)).includes('Rituel /se-ui'));

  check('DS squelette → ui-guard alerte sur le contrat vide',
    uiMsg(fakeProject(SQUELETTE)).includes('SQUELETTE'));

  check('DS squelette → ui-guard nomme les sections manquantes',
    uiMsg(fakeProject(SQUELETTE)).includes('§0.1 plateforme cible'));

  check('direction non déclarée seule → ui-guard alerte et cible §0.2',
    uiMsg(fakeProject(DIRECTION_MANQUANTE)).includes('§0.2 direction esthétique'));

  check('projet sans DESIGN-SYSTEM.md → rituel normal, aucune erreur',
    uiMsg(fsd.mkdtempSync(pathd.join(osd.tmpdir(), 'se-nods-'))).includes('Rituel /se-ui'));

  check('tokens à remplir mais §0 complet → PAS considéré comme squelette',
    !designContractStateExport(fakeProject(REMPLI + '| --color-accent | (à remplir) |\n')).isSkeleton);
}

// --- DÉTECTION PROJET SE (isSeProject) ---

{
  const fsp = require('fs');
  const osp = require('os');
  const pathp = require('path');

  const seRoot = fsp.mkdtempSync(pathp.join(osp.tmpdir(), 'se-proj-'));
  fsp.mkdirSync(pathp.join(seRoot, '.planning'));
  check('dossier avec .planning/ → projet SE', isSeProject(seRoot) === true);

  const bareRoot = fsp.mkdtempSync(pathp.join(osp.tmpdir(), 'se-noproj-'));
  check('dossier sans .planning/ → pas un projet SE', isSeProject(bareRoot) === false);

  const fileRoot = fsp.mkdtempSync(pathp.join(osp.tmpdir(), 'se-fileproj-'));
  fsp.writeFileSync(pathp.join(fileRoot, '.planning'), 'pas un dossier');
  check('.planning fichier (pas dossier) → pas un projet SE', isSeProject(fileRoot) === false);

  check('projectDir vide → pas un projet SE', isSeProject('') === false);
  check('projectDir null → pas un projet SE', isSeProject(null) === false);
  check('projectDir inexistant → pas un projet SE, aucune erreur',
    isSeProject(pathp.join(bareRoot, 'nulle-part')) === false);
}

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

// --- surcharge projet (placement-overrides.json) ---
{
  const fsp = require('fs');
  const osp = require('os');
  const pathp = require('path');
  const ovRoot = fsp.mkdtempSync(pathp.join(osp.tmpdir(), 'se-override-'));
  fsp.mkdirSync(pathp.join(ovRoot, '.planning', 'rules'), { recursive: true });
  const placeIn = (root, rel) => runAll({ filePath: pathp.join(root, rel), content: '# doc\n', projectDir: root });

  check('dossier non déclaré sans override → placement-guard',
    has(placeIn(ovRoot, pathp.join('.planning', 'issues', 'truc.md')), 'placement-guard'));

  fsp.writeFileSync(
    pathp.join(ovRoot, '.planning', 'rules', 'placement-overrides.json'),
    JSON.stringify({ planningDirs: ['issues'] }),
  );
  check('dossier déclaré via placement-overrides.json → PAS de placement-guard',
    !has(placeIn(ovRoot, pathp.join('.planning', 'issues', 'truc.md')), 'placement-guard'));
  check('override n\'affecte pas les autres dossiers non déclarés',
    has(placeIn(ovRoot, pathp.join('.planning', 'rapports', 'truc.md')), 'placement-guard'));

  fsp.writeFileSync(pathp.join(ovRoot, '.planning', 'rules', 'placement-overrides.json'), '{invalid json');
  check('override JSON invalide → ignoré sans erreur, règles globales seules',
    has(placeIn(ovRoot, pathp.join('.planning', 'issues', 'truc.md')), 'placement-guard'));
}

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

// Le détecteur vient TOUJOURS du système désormais (path résolu depuis hooks/, pas
// depuis le projet). Le cas « projet sans vendor/ » n'existe plus ; on teste à la
// place « système sans vendor » via l'override de chemin prévu pour ça.
check('système sans vendor → aucun finding, aucune erreur',
  detectAntipatterns(`${PROJECT_ROOT}/a.css`, osx.tmpdir(), pathx.join(osx.tmpdir(), 'detect-absent.mjs')).length === 0);

if (hasVendoredDetector) {
  const probe = pathx.join(osx.tmpdir(), `se-guard-probe-${process.pid}.css`);
  fsx.writeFileSync(probe, 'body { font-family: Inter, sans-serif; }\n');
  // projectDir ne sert plus qu'au cwd du spawn : un tmpdir sans vendor/ doit suffire,
  // le détecteur étant résolu côté système.
  const found = detectAntipatterns(probe, osx.tmpdir());
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
