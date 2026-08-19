#!/usr/bin/env node
// se-server-reaper — hook SessionEnd. Tue les process longs que la session a laissés.
//
// La règle « un serveur lancé = un serveur tué » existait en prose dans les skills depuis
// le début, et personne ne l'appliquait : une consigne que rien n'exécute est une consigne
// morte. Au bout de quelques sessions, dix serveurs de dev tournaient encore.
//
// Ne tue QUE ce que scripts/se-serve.cjs a enregistré : un `npm run dev` lancé par l'humain
// dans son terminal n'est pas au registre, donc jamais touché.
//
// Contrat: exit 0 TOUJOURS. Un hook de fin de session qui plante ne doit rien casser.

const { isSeProject } = require('./guard-lib.cjs');
const { reap } = require('./server-registry.cjs');

let input = '';
process.stdin.on('data', (chunk) => { input += chunk; });
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input || '{}');
    const projectDir = process.env.CLAUDE_PROJECT_DIR || data.cwd || process.cwd();
    if (!isSeProject(projectDir)) process.exit(0);

    const { killed, failed } = reap(projectDir);
    if (killed.length) console.log(`se-server-reaper: arrêtés — ${killed.join(', ')}`);
    if (failed.length) console.log(`se-server-reaper: résistent — ${failed.join(', ')}`);
  } catch {
    // silencieux : rien ne justifie de faire échouer une fin de session
  }
  process.exit(0);
});
