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

console.log(`\n${pass} pass / ${fail} fail`);
process.exit(fail === 0 ? 0 : 1);
