#!/usr/bin/env node
// se-ui-contract-gate — PreToolUse hook BLOQUANT sur l'écriture de code front.
//
// Deux rôles, dans cet ordre :
//   1. VERROU  — pas de contrat de design (DESIGN-SYSTEM.md absent ou §0 encore squelette)
//                => deny. Sans direction déclarée, tout agent glisse vers le même défaut
//                (Inter + dégradé violet + cartes arrondies) et la gate visuelle bloquera
//                en fin de phase. Interdire l'écriture coûte moins cher que 25 reviews.
//   2. AMORÇAGE — contrat rempli => on injecte le plancher de qualité (craft-floor.md)
//                AVANT l'écriture, une fois par session. C'est le point clé : un rappel
//                envoyé en PostToolUse arrive quand le code est déjà écrit, donc il ne
//                change que la correction, jamais le premier jet.
//
// Bloque via: { hookSpecificOutput: { permissionDecision: "deny", permissionDecisionReason } }
// Contrat: exit 0 TOUJOURS, silent fail — un hook ne casse jamais un tour.

const fs = require('fs');
const path = require('path');
const { isSeProject, isFrontCodeFile, designContractState, seFlag } = require('./guard-lib.cjs');

const CRAFT_FLOOR = path.join(__dirname, '..', 'vendor', 'design', 'impeccable', 'reference', 'craft-floor.md');
const SESSION_MARKER = path.join('.planning', '_ui', 'craft-floor-session.json');
// Sans session_id dans le payload, on retombe sur le temps : ré-injecter au bout de 8h
// plutôt que jamais (une session de travail dépasse rarement la journée).
const REINJECT_AFTER_MS = 8 * 60 * 60 * 1000;
const MAX_HEADER_CHARS = 4000;

function deny(reason) {
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: reason },
  }));
  process.exit(0);
}

function inject(context) {
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: { hookEventName: 'PreToolUse', additionalContext: context },
  }));
  process.exit(0);
}

/** §0 du contrat (plateforme, direction, molettes) — ce qui cadre le premier jet. Le reste
 *  du DESIGN-SYSTEM (tokens, piliers) se lit à la demande, on ne l'injecte pas. */
function contractHeader(projectDir) {
  try {
    const ds = fs.readFileSync(path.join(projectDir, '.planning', 'design', 'DESIGN-SYSTEM.md'), 'utf8');
    const section0 = ds.split(/^##\s+1\./m)[0].trim();
    return section0.length > 4000 ? section0.slice(0, 4000) + '\n[…]' : section0;
  } catch {
    return null;
  }
}

/** True la première fois qu'on touche du front dans cette session (ou après 8h). */
function shouldInjectFloor(projectDir, sessionId) {
  const marker = path.join(projectDir, SESSION_MARKER);
  let previous = null;
  try { previous = JSON.parse(fs.readFileSync(marker, 'utf8')); } catch { /* première fois */ }

  const fresh = previous
    && previous.sessionId === sessionId
    && Date.now() - Date.parse(previous.at || 0) < REINJECT_AFTER_MS;

  if (!fresh) {
    try {
      fs.mkdirSync(path.dirname(marker), { recursive: true });
      fs.writeFileSync(marker, JSON.stringify({ sessionId, at: new Date().toISOString() }));
    } catch { /* marqueur non écrit : on ré-injectera, c'est du bruit, pas une panne */ }
  }
  return !fresh;
}

const RITUAL = [
  'RITUEL OBLIGATOIRE sur ce fichier (le commit sera REFUSE sinon) :',
  '  1. craft -> CRITIQUE -> polish. La critique n\'est pas optionnelle : 3 a 6 defauts nommes.',
  '  2. Checkpoint humain sur le rendu REEL : lancer le serveur, donner l\'URL exacte de la',
  '     page a l\'humain, et attendre son GO. Claude lance les commandes, jamais l\'humain.',
  '  3. Enregistrer la passe, sinon le commit est bloque :',
  '     node "$HOME/.claude/se/scripts/ui-pass.cjs" record <fichiers> --url <url> --go "<reponse humaine>"',
].join('\n');

let input = '';
const stdinTimeout = setTimeout(() => process.exit(0), 3000);
process.stdin.setEncoding('utf8');
process.stdin.on('data', (c) => (input += c));
process.stdin.on('end', () => {
  clearTimeout(stdinTimeout);
  try {
    const data = JSON.parse(input);

    const projectDir = process.env.CLAUDE_PROJECT_DIR || data.cwd || process.cwd();
    if (!isSeProject(projectDir)) process.exit(0);
    if (!['Write', 'Edit', 'MultiEdit'].includes(data.tool_name)) process.exit(0);

    const filePath = data.tool_input?.file_path || '';
    if (!filePath || !isFrontCodeFile(filePath)) process.exit(0);
    if (!seFlag(projectDir, 'ui_contract_gate', true)) process.exit(0);

    const contract = designContractState(projectDir);

    if (contract === null) {
      deny(
        'ui-contract-gate: aucun contrat de design. `.planning/design/DESIGN-SYSTEM.md` est introuvable, ' +
        'et on n\'ecrit pas de front sans direction declaree — c\'est ce qui produit les UI generiques ' +
        'et les boucles de correction sans fin.\n' +
        'AVANT TOUTE CHOSE : creer le contrat et le remplir AVEC L\'HUMAIN (§0.1 plateforme et public cible, ' +
        '§0.2 direction esthetique, §0.3 molettes, §2.1 hierarchie visuelle). ' +
        'Gabarit : "$HOME/.claude/se/scaffold/.planning/design/DESIGN-SYSTEM.md". ' +
        'Le choix de la direction est humain, jamais celui de l\'agent — proposer 2-3 directions argumentees ' +
        'via /se-ui, puis faire trancher.\n' +
        'Echappatoire assumee : `workflow.ui_contract_gate: false` dans .planning/config.json.'
      );
    }

    if (contract.isSkeleton) {
      const missing = contract.missing.length ? contract.missing.join(', ') : 'statut encore marque SQUELETTE';
      deny(
        `ui-contract-gate: le contrat de design est encore un SQUELETTE (manque : ${missing}).\n` +
        'AVANT TOUTE CHOSE : remplir ces sections de `.planning/design/DESIGN-SYSTEM.md` avec l\'humain. ' +
        'Sans direction, la gate visuelle de fin de phase BLOQUERA et tout le travail sera a refaire.\n' +
        'Proposer 2-3 directions argumentees (avec anti-reference), faire trancher l\'humain, inscrire le choix en §0.2.\n' +
        'Si §2.1 manque : la section n\'existe pas encore dans ce contrat (ecrit avant la regle). La copier depuis ' +
        'le gabarit et l\'ancrer sur le public cible de §0.1 — ratio titre/corps, focal point unique, ' +
        'hierarchie primaire/secondaire/tertiaire des actions. C\'est la section dont l\'absence laisse trois ecrans ' +
        'sortir avec trois echelles differentes sans qu\'aucune gate ne bronche.\n' +
        'Echappatoire assumee : `workflow.ui_contract_gate: false` dans .planning/config.json.'
      );
    }

    // Contrat OK — on amorce au lieu de bloquer.
    if (!shouldInjectFloor(projectDir, data.session_id || 'no-session')) {
      inject(`Edition front. ${RITUAL}`);
    }

    let floor = '';
    try { floor = fs.readFileSync(CRAFT_FLOOR, 'utf8'); } catch { /* corpus absent : on injecte au moins le contrat */ }
    const header = contractHeader(projectDir);

    inject([
      'Premiere edition front de la session — le plancher de qualite s\'applique a tout ce qui suit.',
      '',
      RITUAL,
      '',
      header ? `--- CONTRAT DU PROJET (DESIGN-SYSTEM.md §0) ---\n${header}` : '',
      '',
      floor ? `--- PLANCHER DE QUALITE (impeccable/craft-floor) ---\n${floor}` : '',
    ].filter(Boolean).join('\n'));
  } catch {
    process.exit(0); // silent fail — ne JAMAIS bloquer une ecriture par accident
  }
});
