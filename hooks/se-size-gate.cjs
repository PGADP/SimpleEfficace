#!/usr/bin/env node
// se-size-gate — PreToolUse hook BLOQUANT pour l'anti-entropie.
// Refuse d'écrire STATE.md > 150 lignes ou ROADMAP.md > 200 lignes (cf. CONVENTIONS).
// Avertit (sans bloquer) dès 90% du plafond.
//
// Bloque via: { hookSpecificOutput: { hookEventName, permissionDecision: "deny", permissionDecisionReason } }
// Contrat: exit 0 TOUJOURS (la décision passe par le JSON, pas par le code de sortie).
//          Silent fail = ne JAMAIS bloquer une écriture par accident si le hook plante.
//
// Robustesse input: on lit content | file_text pour un Write ; pour Edit/MultiEdit on
// SIMULE l'édition sur le fichier disque (sinon on ne mesurerait que le fragment édité,
// et ajouter 40 lignes à un fichier déjà au plafond passerait sous le radar).

const fs = require('fs');

// Plafonds (source: .planning/CONVENTIONS.md). Patterns, pas chemins en dur.
const CAPS = [
  { match: /(^|[\\/])STATE\.md$/i, limit: 150, label: 'STATE.md' },
  { match: /(^|[\\/])ROADMAP\.md$/i, limit: 200, label: 'ROADMAP.md' },
];

// Projette le contenu du fichier APRÈS l'opération. null = pas mesurable → laisse passer.
function projectedContent(toolName, toolInput) {
  if (!toolInput) return null;
  if (typeof toolInput.content === 'string') return toolInput.content;    // Write
  if (typeof toolInput.file_text === 'string') return toolInput.file_text; // Write (variante)

  // Edit / MultiEdit : rejoue les remplacements sur le fichier existant.
  let base;
  try { base = fs.readFileSync(toolInput.file_path, 'utf8'); } catch { return null; }
  const edits = Array.isArray(toolInput.edits) ? toolInput.edits
    : (typeof toolInput.new_string === 'string' ? [toolInput] : null);
  if (!edits) return null;
  for (const e of edits) {
    const oldS = e.old_string ?? e.old_text;
    const newS = e.new_string ?? e.new_text;
    if (typeof oldS !== 'string' || typeof newS !== 'string') continue;
    base = e.replace_all ? base.split(oldS).join(newS) : base.replace(oldS, newS);
  }
  return base;
}

// Nombre de lignes "réelles" : un \n final ne compte pas une ligne de plus.
function countLines(content) {
  return content.replace(/\r?\n$/, '').split('\n').length;
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

    const content = projectedContent(data.tool_name, data.tool_input);
    if (content == null) process.exit(0); // rien à mesurer → laisse passer

    const lineCount = countLines(content);

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
