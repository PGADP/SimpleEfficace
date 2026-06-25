#!/usr/bin/env node
// se-size-gate — PreToolUse hook BLOQUANT pour l'anti-entropie.
// Refuse d'écrire STATE.md > 150 lignes ou ROADMAP.md > 200 lignes (cf. CONVENTIONS).
// Avertit (sans bloquer) dès 90% du plafond.
//
// Bloque via: { hookSpecificOutput: { hookEventName, permissionDecision: "deny", permissionDecisionReason } }
// Contrat: exit 0 TOUJOURS (la décision passe par le JSON, pas par le code de sortie).
//          Silent fail = ne JAMAIS bloquer une écriture par accident si le hook plante.
//
// Robustesse input: on lit content | new_string | file_text | edits[] — selon ce que le
// harness envoie (le nom du champ a varié entre versions). Pour Edit on ne peut pas toujours
// connaître le fichier final exact ; on borne sur la meilleure info disponible.

const path = require('path');

// Plafonds (source: .planning/CONVENTIONS.md). Patterns, pas chemins en dur.
const CAPS = [
  { match: /(^|[\\/])STATE\.md$/i, limit: 150, label: 'STATE.md' },
  { match: /(^|[\\/])ROADMAP\.md$/i, limit: 200, label: 'ROADMAP.md' },
];

function pickContent(toolInput) {
  if (!toolInput) return null;
  if (typeof toolInput.content === 'string') return toolInput.content;
  if (typeof toolInput.file_text === 'string') return toolInput.file_text;
  if (typeof toolInput.new_string === 'string') return toolInput.new_string;
  if (Array.isArray(toolInput.edits)) return toolInput.edits.map((e) => e.new_string || e.new_text || '').join('\n');
  if (Array.isArray(toolInput.replacement_spans)) return toolInput.replacement_spans.map((s) => s.new_text || '').join('\n');
  return null;
}

function deny(reason) {
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'deny',
      permissionDecisionReason: reason,
    },
  }));
  process.exit(0);
}

function warn(context) {
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: { hookEventName: 'PreToolUse', additionalContext: context },
  }));
  process.exit(0);
}

let input = '';
const stdinTimeout = setTimeout(() => process.exit(0), 3000);
process.stdin.setEncoding('utf8');
process.stdin.on('data', (c) => (input += c));
process.stdin.on('end', () => {
  clearTimeout(stdinTimeout);
  try {
    const data = JSON.parse(input);
    if (data.tool_name !== 'Write' && data.tool_name !== 'Edit' && data.tool_name !== 'MultiEdit') process.exit(0);

    const filePath = data.tool_input?.file_path || '';
    const cap = CAPS.find((c) => c.match.test(filePath.replace(/\\/g, '/')));
    if (!cap) process.exit(0); // pas un fichier plafonné

    const content = pickContent(data.tool_input);
    if (content == null) process.exit(0); // rien à mesurer (ex: Edit partiel sans contenu complet)

    const lineCount = content.split('\n').length;

    if (lineCount > cap.limit) {
      deny(
        `size-gate: ${cap.label} ferait ${lineCount} lignes (plafond ${cap.limit}). ` +
        `Archive le contenu passe dans _archive/ ou PROJECT.md avant d'ecrire. ` +
        `${cap.label} ne doit contenir que le present vivant.`
      );
    }
    if (lineCount >= Math.floor(cap.limit * 0.9)) {
      warn(`size-gate (advisory): ${cap.label} approche le plafond (${lineCount}/${cap.limit}). Pense a archiver bientot.`);
    }
    process.exit(0);
  } catch {
    process.exit(0); // silent fail — ne JAMAIS bloquer par accident
  }
});
