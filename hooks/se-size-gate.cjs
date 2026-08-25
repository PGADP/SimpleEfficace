#!/usr/bin/env node
// se-size-gate : PreToolUse hook BLOQUANT pour l'anti-entropie.
// Refuse d'écrire STATE.md ou ROADMAP.md au-delà de trois plafonds (cf. CONVENTIONS) :
// lignes, caractères du fichier, largeur d'une ligne.
// Le plafond de lignes seul se contourne trivialement : 300 lignes de 1000 caractères
// coûtent autant de contexte que 3000 lignes normales. Le plafond de caractères mesure
// le coût réel ; la largeur max attrape la ligne fourre-tout qui remplace un paragraphe.
// Avertit (sans bloquer) dès 90% d'un plafond.
//
// SENS DE VARIATION : on ne refuse que l'AGGRAVATION. Un fichier déjà hors plafond
// (projet antérieur à la règle, ou plafond durci depuis) reste modifiable tant que
// l'écriture ne l'alourdit pas. Sans cette règle, le gate refuserait l'étape de
// /se-archive qui vient précisément l'assainir : on bloquerait le remède au motif
// que le patient est malade.
//
// LIGNES DE TABLEAU : exemptées du plafond de largeur. La largeur d'un tableau markdown
// aligné est mécanique, pas un choix de rédaction ; la contraindre reviendrait à
// interdire les tableaux. Elles restent comptées dans les plafonds lignes et caractères.
//
// Bloque via: { hookSpecificOutput: { hookEventName, permissionDecision: "deny", permissionDecisionReason } }
// Contrat: exit 0 TOUJOURS (la décision passe par le JSON, pas par le code de sortie).
//          Silent fail = ne JAMAIS bloquer une écriture par accident si le hook plante.
//
// Robustesse input: on lit content | file_text pour un Write ; pour Edit/MultiEdit on
// SIMULE l'édition sur le fichier disque (sinon on ne mesurerait que le fragment édité,
// et ajouter 40 lignes à un fichier déjà au plafond passerait sous le radar).

const fs = require('fs');
const { isSeProject } = require('./guard-lib.cjs');

// Plafonds (source: .planning/CONVENTIONS.md). Patterns, pas chemins en dur.
// `lines`, `chars`, `width` : mêmes noms que les métriques rendues par measure(),
// pour que le contrôle se lise sans table de correspondance. `width` ne s'applique
// qu'aux lignes hors tableau.
const CAPS = [
  { match: /(^|[\\/])STATE\.md$/i, lines: 300, chars: 20000, width: 300, label: 'STATE.md' },
  { match: /(^|[\\/])ROADMAP\.md$/i, lines: 300, chars: 20000, width: 300, label: 'ROADMAP.md' },
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

// Une ligne de tableau markdown : `| a | b |`, ou son separateur `|---|---|`.
function isTableRow(line) {
  return /^\s*\|/.test(line);
}

// Metriques d'un contenu. `chars` ignore les CR : un fichier CRLF ne doit pas etre
// plafonne plus severement que le meme fichier en LF. `width` ignore les tableaux.
function measure(content) {
  const body = content.replace(/\r/g, '');
  const lines = body.replace(/\n$/, '').split('\n');
  let width = 0;
  let widthAt = 0;
  for (let i = 0; i < lines.length; i++) {
    if (isTableRow(lines[i])) continue; // largeur mecanique, pas redactionnelle
    if (lines[i].length > width) { width = lines[i].length; widthAt = i + 1; }
  }
  return { lines: lines.length, chars: body.length, width, widthAt };
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

    // Hook câblé globalement : hors d'un projet SE (pas de .planning/), laisse passer.
    if (!isSeProject(process.env.CLAUDE_PROJECT_DIR || data.cwd || process.cwd())) process.exit(0);

    if (data.tool_name !== 'Write' && data.tool_name !== 'Edit' && data.tool_name !== 'MultiEdit') process.exit(0);

    const filePath = data.tool_input?.file_path || '';
    const cap = CAPS.find((c) => c.match.test(filePath.replace(/\\/g, '/')));
    if (!cap) process.exit(0); // pas un fichier plafonné

    const content = projectedContent(data.tool_name, data.tool_input);
    if (content == null) process.exit(0); // rien à mesurer → laisse passer

    const after = measure(content);

    // Contenu actuel sur disque : sert de référence de comparaison. Absent (création,
    // fichier illisible) = pas de tolérance, les plafonds s'appliquent tels quels.
    let before = null;
    try { before = measure(fs.readFileSync(data.tool_input.file_path, 'utf8')); } catch { before = null; }

    // Une métrique ne bloque que si elle dépasse ET qu'elle empire.
    const busts = (key) => after[key] > cap[key] && (!before || after[key] > before[key]);

    if (busts('lines')) {
      deny(
        `size-gate: ${cap.label} ferait ${after.lines} lignes (plafond ${cap.lines}). ` +
        `Archive le contenu passe dans _archive/ ou PROJECT.md avant d'ecrire. ` +
        `${cap.label} ne doit contenir que le present vivant.`
      );
    }
    if (busts('chars')) {
      deny(
        `size-gate: ${cap.label} ferait ${after.chars} caracteres (plafond ${cap.chars}) sur ${after.lines} lignes. ` +
        `Le compte de lignes ne dit pas le cout reel : des lignes longues coutent autant que des lignes nombreuses. ` +
        `Condense en empreintes d'une ligne et renvoie le detail vers _archive/.`
      );
    }
    if (busts('width')) {
      deny(
        `size-gate: ${cap.label} contiendrait une ligne de ${after.width} caracteres (plafond ${cap.width}), ligne ${after.widthAt}. ` +
        `Une ligne n'est pas un paragraphe : coupe-la, ou renvoie le detail vers _archive/. ` +
        `(Les lignes de tableau markdown sont exemptees de ce plafond.)`
      );
    }

    // Un seul avertissement, sinon le premier warn() sort et masque les autres.
    const near = [];
    if (after.lines >= Math.floor(cap.lines * 0.9)) near.push(`lignes ${after.lines}/${cap.lines}`);
    if (after.chars >= Math.floor(cap.chars * 0.9)) near.push(`caracteres ${after.chars}/${cap.chars}`);
    if (before && (after.lines > cap.lines || after.chars > cap.chars || after.width > cap.width)) {
      near.push('deja hors plafond, ecriture toleree car elle n\'aggrave pas');
    }
    if (near.length) {
      warn(`size-gate (advisory): ${cap.label} — ${near.join(' ; ')}. Pense a archiver bientot.`);
    }
    process.exit(0);
  } catch {
    process.exit(0); // silent fail — ne JAMAIS bloquer par accident
  }
});
