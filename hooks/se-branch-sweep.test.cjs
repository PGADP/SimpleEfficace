#!/usr/bin/env node
// se-branch-sweep.test.cjs — tests du balayage des branches fusionnées.
// Le cœur du test est la détection des TROIS modes de fusion (merge commit, rebase,
// squash) : `git branch --merged` n'en voit qu'un, et c'est pour ça que les branches
// s'accumulent. On vérifie aussi qu'une branche porteuse de travail neuf survit.
// Run: node hooks/se-branch-sweep.test.cjs

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync, execSync } = require('child_process');

let pass = 0;
let fail = 0;
function check(name, ok) {
  if (ok) { pass++; console.log(`  PASS  ${name}`); }
  else { fail++; console.log(`  FAIL  ${name}`); }
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'se-sweep-'));
const originDir = path.join(tmp, 'origin.git');
const work = path.join(tmp, 'work');

execSync(`git init --bare -q -b main "${originDir}"`, { stdio: 'ignore' });
execSync(`git clone -q "${originDir}" "${work}"`, { stdio: 'ignore' });

const git = (args, cwd = work) => execSync(`git ${args}`, {
  cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'],
});
git('config user.email test@test.local');
git('config user.name test');
git('config commit.gpgsign false');

function commit(file, content, message) {
  fs.writeFileSync(path.join(work, file), content);
  git(`add ${file}`);
  git(`commit -q -m "${message}"`);
}

// base
commit('base.txt', 'base\n', 'init');
git('push -q -u origin main');

// 1. fusionnée par merge commit
git('checkout -q -b merged-commit');
commit('a.txt', 'a\n', 'feat: a');
git('checkout -q main');
git('merge -q --no-ff merged-commit -m "merge a"');

// 2. rebase / cherry-pick : même patch, autre SHA
git('checkout -q -b rebased main');
commit('b.txt', 'b\n', 'feat: b');
const bSha = git('rev-parse HEAD').trim();
git('checkout -q main');
git(`cherry-pick ${bSha}`);

// 3. squash-merge : un seul commit en amont pour deux commits de branche
git('checkout -q -b squashed main');
commit('c1.txt', 'c1\n', 'feat: c1');
commit('c2.txt', 'c2\n', 'feat: c2');
git('checkout -q main');
git('merge -q --squash squashed');
git('commit -q -m "feat: c (squash)"');

// 4. du vrai travail non intégré
git('checkout -q -b vraiment-neuve main');
commit('d.txt', 'd\n', 'feat: d');
git('checkout -q main');

// 5. fusionnée PUIS reprise : un commit posé sur la branche APRÈS son merge.
//    Le signal « PR fusionnée » dit ce que la PR contenait, jamais ce qui a été
//    poussé ensuite. Sans contrôle du contenu, ce commit serait détruit.
git('checkout -q -b reprise-apres-merge main');
commit('e.txt', 'e\n', 'feat: e');
git('checkout -q main');
git('merge -q --no-ff reprise-apres-merge -m "merge e"');
git('checkout -q reprise-apres-merge');
commit('e2.txt', 'e2\n', 'feat: e2 apres le merge');
git('checkout -q main');

git('push -q origin main');

function runSweep(cwd = work) {
  return spawnSync(process.execPath, [path.join(__dirname, 'se-branch-sweep.cjs')], {
    input: JSON.stringify({ cwd }), encoding: 'utf8', cwd, timeout: 30000,
    env: { ...process.env, CLAUDE_PROJECT_DIR: '' },
  });
}

console.log('se-branch-sweep (mode annonce) :');
const dry = runSweep();
check('sortie produite', dry.status === 0 && dry.stdout.length > 0);
check('détecte la branche fusionnée par merge commit', /merged-commit/.test(dry.stdout));
check('détecte la branche rebasée (patch déjà en amont)', /rebased/.test(dry.stdout));
check('détecte la branche squashée', /squashed \(squash-merge\)/.test(dry.stdout));
check('ne propose PAS la branche qui porte du travail neuf', !/vraiment-neuve/.test(dry.stdout));
check('ne propose PAS une branche fusionnée mais reprise depuis', !/reprise-apres-merge/.test(dry.stdout));
check('annonce qu\'il n\'a rien supprimé', /Mode annonce/.test(dry.stdout));
const branchesAfterDry = git('branch --format=%(refname:short)').split('\n').filter(Boolean);
check('mode annonce : aucune branche supprimée', branchesAfterDry.includes('merged-commit'));

console.log('\nse-branch-sweep (nettoyage activé) :');
fs.mkdirSync(path.join(work, '.planning'), { recursive: true });
fs.writeFileSync(path.join(work, '.planning', 'config.json'),
  JSON.stringify({ workflow: { branch_sweep: true } }));
const live = runSweep();
const branchesAfter = git('branch --format=%(refname:short)').split('\n').filter(Boolean);
check('supprime la branche fusionnée par merge commit', !branchesAfter.includes('merged-commit'));
check('conserve la branche qui porte du travail neuf', branchesAfter.includes('vraiment-neuve'));
check('conserve la branche fusionnée puis reprise', branchesAfter.includes('reprise-apres-merge'));
check('conserve main', branchesAfter.includes('main'));
check('journalise le SHA dans ARCHIVE.log',
  fs.existsSync(path.join(work, '.planning', 'ARCHIVE.log'))
  && /branch merged-commit [0-9a-f]+ supprimée/.test(fs.readFileSync(path.join(work, '.planning', 'ARCHIVE.log'), 'utf8')));
check('rend un rapport de suppression', /supprimée\(s\)/.test(live.stdout));

// Sans remote origin, aucun workflow de PR à protéger : le hook se tait.
console.log('\nse-branch-sweep (hors périmètre) :');
const norem = path.join(tmp, 'norem');
fs.mkdirSync(norem);
execSync('git init -q -b main', { cwd: norem, stdio: 'ignore' });
const quiet = runSweep(norem);
check('dépôt sans remote origin → aucune sortie', quiet.status === 0 && quiet.stdout === '');

fs.rmSync(tmp, { recursive: true, force: true });
console.log(`\n${pass} pass / ${fail} fail`);
process.exit(fail ? 1 : 0);
