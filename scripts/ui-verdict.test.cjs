#!/usr/bin/env node
// ui-verdict.test.cjs — tests du moteur de verdict UI.
// Couvre la logique non triviale : agrégation pire-cas entre breakpoints selon
// l'opérateur, SKIPPED sur métrique absente, règle DOWNGRADE, code de sortie.
// Run: node scripts/ui-verdict.test.cjs

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { judge, worstAcross, evaluate, readMetric } = require('./ui-verdict.cjs');

let pass = 0;
let fail = 0;
function check(name, ok) {
  if (ok) { pass++; console.log(`  PASS  ${name}`); }
  else { fail++; console.log(`  FAIL  ${name}`); }
}

const RULES = {
  downgradeableDimensions: ['typography', 'spacing'],
  nonNegotiableDimensions: ['accessibility'],
  rules: [
    { slug: 'sizes', pillar: 'typography', severity: 'BLOCK', verifiedBy: 'measured', norm: '≤ 4 tailles', check: { metric: 'typography.sizeCount', op: 'lte', value: 4 } },
    { slug: 'lh', pillar: 'typography', severity: 'FLAG', verifiedBy: 'measured', norm: 'line-height ≥ 1.4', check: { metric: 'typography.bodyLineHeightRatio', op: 'gte', value: 1.4 } },
    { slug: 'overflow', pillar: 'visuals', severity: 'BLOCK', verifiedBy: 'measured', norm: 'pas de débordement', check: { metric: 'layout.horizontalOverflow', op: 'empty' } },
    { slug: 'lang', pillar: 'accessibility', severity: 'BLOCK', verifiedBy: 'measured', norm: 'lang déclaré', check: { metric: 'a11y.hasPageLang', op: 'isTrue' } },
    { slug: 'perf', pillar: 'performance', severity: 'FLAG', verifiedBy: 'measured', norm: 'LCP ≤ 2500', check: { metric: 'perf.lcpMs', op: 'lte', value: 2500 } },
    { slug: 'absente', pillar: 'states', severity: 'BLOCK', verifiedBy: 'measured', norm: 'états complets', check: { metric: 'states.missing', op: 'empty' } },
    { slug: 'humain', pillar: 'visuals', severity: 'BLOCK', verifiedBy: 'human', norm: 'passe critique faite' },
  ],
};

const verdictOf = (findings, slug) => findings.find((f) => f.slug === slug).verdict;

console.log('\n== readMetric ==');
check('lit un chemin imbriqué', readMetric({ a: { b: { c: 3 } } }, 'a.b.c') === 3);
check('undefined si un segment manque', readMetric({ a: {} }, 'a.b.c') === undefined);
check('ne jette pas sur null intermédiaire', readMetric({ a: null }, 'a.b') === undefined);

console.log('\n== worstAcross : le pire cas selon l\'opérateur ==');
check('lte retient le maximum', worstAcross([3, 7, 4], 'lte') === 7);
check('gte retient le minimum', worstAcross([1.6, 1.2, 1.5], 'gte') === 1.2);
check('eq retient le maximum', worstAcross([0, 2], 'eq') === 2);
check('les tableaux fusionnent sans doublon', JSON.stringify(worstAcross([['a', 'b'], ['b', 'c']], 'empty')) === '["a","b","c"]');
check('isTrue exige que tous soient vrais', worstAcross([true, false], 'isTrue') === false);
check('isFalse retient qu\'un seul soit vrai', worstAcross([false, true], 'isFalse') === true);
check('ignore null et undefined', worstAcross([undefined, 5, null], 'lte') === 5);
check('undefined si rien de mesuré', worstAcross([undefined, null], 'lte') === undefined);

console.log('\n== evaluate ==');
check('empty passe sur tableau vide', evaluate({ op: 'empty' }, []) === true);
check('empty échoue sur tableau rempli', evaluate({ op: 'empty' }, ['x']) === false);
check('lte inclusif à la borne', evaluate({ op: 'lte', value: 4 }, 4) === true);
check('eq strict', evaluate({ op: 'eq', value: 0 }, 0) === true);
let threw = false;
try { evaluate({ op: 'inconnu' }, 1); } catch { threw = true; }
check('opérateur inconnu lève une erreur', threw);

console.log('\n== judge : verdicts ==');
const conforme = [{ meta: { breakpoint: 'desktop' }, typography: { sizeCount: 4, bodyLineHeightRatio: 1.6 }, layout: { horizontalOverflow: [] }, a11y: { hasPageLang: true }, perf: { lcpMs: 1200 } }];
let findings = judge(RULES, conforme, {});
check('rapport conforme : aucun BLOCK', findings.filter((f) => f.verdict === 'BLOCK').length === 0);
check('métrique absente donne SKIPPED, pas BLOCK', verdictOf(findings, 'absente') === 'SKIPPED');
check('règle sans check reste à juger', verdictOf(findings, 'humain') === 'SKIPPED');

const casse = [{ meta: { breakpoint: 'desktop' }, typography: { sizeCount: 9 }, layout: { horizontalOverflow: ['div dépasse de 40px'] }, a11y: { hasPageLang: false } }];
findings = judge(RULES, casse, {});
check('trop de tailles → BLOCK', verdictOf(findings, 'sizes') === 'BLOCK');
check('débordement → BLOCK', verdictOf(findings, 'overflow') === 'BLOCK');
check('lang manquant → BLOCK', verdictOf(findings, 'lang') === 'BLOCK');
check('la valeur mesurée est remontée', findings.find((f) => f.slug === 'sizes').measured === 9);

console.log('\n== judge : le pire breakpoint gagne ==');
const mixte = [
  { meta: { breakpoint: 'desktop' }, typography: { sizeCount: 3, bodyLineHeightRatio: 1.6 }, layout: { horizontalOverflow: [] }, a11y: { hasPageLang: true } },
  { meta: { breakpoint: 'mobile' }, typography: { sizeCount: 3, bodyLineHeightRatio: 1.1 }, layout: { horizontalOverflow: ['table déborde'] }, a11y: { hasPageLang: true } },
];
findings = judge(RULES, mixte, {});
check('un débordement sur mobile seul suffit à bloquer', verdictOf(findings, 'overflow') === 'BLOCK');
check('un line-height trop faible sur mobile seul suffit à flaguer', verdictOf(findings, 'lh') === 'FLAG');

console.log('\n== judge : règle DOWNGRADE ==');
findings = judge(RULES, casse, { sizes: 'Charte de marque imposée par le client, 6 tailles historiques' });
check('exception documentée sur dimension downgradeable : BLOCK → FLAG', verdictOf(findings, 'sizes') === 'FLAG');
check('la raison de l\'exception est conservée', typeof findings.find((f) => f.slug === 'sizes').downgradeNote === 'string');
findings = judge(RULES, casse, { lang: 'on verra plus tard' });
check('exception ignorée sur dimension non négociable (accessibility)', verdictOf(findings, 'lang') === 'BLOCK');
findings = judge(RULES, casse, { overflow: 'tableau large assumé' });
check('exception ignorée sur dimension non downgradeable (visuals)', verdictOf(findings, 'overflow') === 'BLOCK');

console.log('\n== CLI : code de sortie ==');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'se-uiverdict-'));
const reportDir = path.join(tmp, '_ui');
fs.mkdirSync(reportDir, { recursive: true });
const rulesFile = path.join(tmp, 'ui-rules.json');
fs.writeFileSync(rulesFile, JSON.stringify(RULES));

const runCli = (extra = []) => spawnSync(process.execPath, [
  path.join(__dirname, 'ui-verdict.cjs'), '--name', 'ecran', '--report-dir', reportDir, '--rules', rulesFile, ...extra,
], { encoding: 'utf8' });

let cli = runCli();
check('sans rapport : sortie 0 et message explicite', cli.status === 0 && /Aucun rapport/.test(cli.stdout));

fs.writeFileSync(path.join(reportDir, 'ui-report.ecran.desktop.json'), JSON.stringify(casse[0]));
cli = runCli();
check('avec BLOCK : sortie 1', cli.status === 1);
check('avec BLOCK : affiche NO-GO', /VERDICT : NO-GO/.test(cli.stdout));
cli = runCli(['--advisory']);
check('--advisory : sortie 0 malgré les BLOCK', cli.status === 0);
cli = runCli(['--json']);
check('--json : JSON valide avec blockCount', JSON.parse(cli.stdout).blockCount >= 3);

fs.rmSync(path.join(reportDir, 'ui-report.ecran.desktop.json'));
fs.writeFileSync(path.join(reportDir, 'ui-report.ecran.desktop.json'), JSON.stringify(conforme[0]));
cli = runCli();
check('rapport conforme : sortie 0 et GO', cli.status === 0 && /VERDICT : GO/.test(cli.stdout));

fs.rmSync(tmp, { recursive: true, force: true });

console.log('\n== CLI : cascade des critères (copie projet > défaut système, --rules absolu) ==');
// Le script tourne depuis n'importe quel projet : sans --rules il prend la copie
// projet <cwd>/.planning/rules/ui-rules.json si elle existe, sinon le défaut
// système rules/ui-rules.json du repo SE (résolu depuis scripts/).
const SYSTEM_RULES_FILE = path.join(__dirname, '..', 'rules', 'ui-rules.json');

const cascadeTmp = fs.mkdtempSync(path.join(os.tmpdir(), 'se-uicascade-'));
const cascadeReports = path.join(cascadeTmp, '_ui');
fs.mkdirSync(cascadeReports, { recursive: true });
fs.writeFileSync(path.join(cascadeReports, 'ui-report.ecran.desktop.json'), JSON.stringify({ meta: { breakpoint: 'desktop' } }));

const runCliFrom = (cwd, extra = []) => spawnSync(process.execPath, [
  path.join(__dirname, 'ui-verdict.cjs'), '--name', 'ecran', '--report-dir', cascadeReports, '--json', ...extra,
], { encoding: 'utf8', cwd });
const slugsOf = (cli) => JSON.parse(cli.stdout).findings.map((f) => f.slug);

// 1. projet sans copie → cascade vers le vrai défaut système du repo
const systemSlugs = JSON.parse(fs.readFileSync(SYSTEM_RULES_FILE, 'utf8')).rules.map((r) => r.slug);
let cascadeCli = runCliFrom(cascadeTmp);
check('sans copie projet : cascade vers rules/ui-rules.json du système',
  cascadeCli.status === 0 && slugsOf(cascadeCli).length > 0 && slugsOf(cascadeCli).every((s) => systemSlugs.includes(s)));

// 2. copie projet présente → elle gagne sur le défaut système
const projectRules = { rules: [{ slug: 'regle-projet-uniquement', pillar: 'typography', severity: 'FLAG', verifiedBy: 'measured', norm: 'x', check: { metric: 'typography.sizeCount', op: 'lte', value: 4 } }] };
fs.mkdirSync(path.join(cascadeTmp, '.planning', 'rules'), { recursive: true });
fs.writeFileSync(path.join(cascadeTmp, '.planning', 'rules', 'ui-rules.json'), JSON.stringify(projectRules));
cascadeCli = runCliFrom(cascadeTmp);
check('copie projet présente : elle est prioritaire sur le défaut système',
  JSON.stringify(slugsOf(cascadeCli)) === '["regle-projet-uniquement"]');

// 3. --rules garde priorité absolue, même face à une copie projet
const cliRules = path.join(cascadeTmp, 'autres-regles.json');
fs.writeFileSync(cliRules, JSON.stringify({ rules: [{ ...projectRules.rules[0], slug: 'regle-cli' }] }));
cascadeCli = runCliFrom(cascadeTmp, ['--rules', cliRules]);
check('--rules explicite : priorité absolue sur la copie projet',
  JSON.stringify(slugsOf(cascadeCli)) === '["regle-cli"]');

// 4. rien nulle part + --rules cassé → erreur qui cite le chemin ; sans --rules, les deux chemins
cascadeCli = runCliFrom(cascadeTmp, ['--rules', path.join(cascadeTmp, 'absent.json')]);
check('--rules introuvable : erreur citant le chemin explicite',
  cascadeCli.status === 1 && /Critères introuvables/.test(cascadeCli.stderr) && /absent\.json/.test(cascadeCli.stderr));

fs.rmSync(cascadeTmp, { recursive: true, force: true });

console.log(`\n${pass} PASS, ${fail} FAIL\n`);
process.exit(fail > 0 ? 1 : 0);
