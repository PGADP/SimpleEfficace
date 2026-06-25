#!/usr/bin/env node
// se-slop-gate — PreToolUse hook (matcher Bash) BLOQUANT au commit.
// Refuse `git commit` si des fichiers user-facing STAGÉS contiennent du slop AI non traité
// (>= clusterThreshold familles de marqueurs, cf. hooks/rules/slop-rules.json — SOURCE UNIQUE,
// la même que le humanizer-guard advisory).
//
// Pas d'event PreCommit natif → on s'accroche à PreToolUse Bash et on ne réagit que si
// la commande est un `git commit`.
//
// Bloque via permissionDecision: "deny". Contrat: exit 0 toujours, silent fail, ne bloque
// jamais par accident (en cas de doute → laisse passer).

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const RULES = path.join(__dirname, 'rules', 'slop-rules.json');

function isUserFacing(filePath) {
  const p = filePath.replace(/\\/g, '/');
  return /\(public\)|\/emails?\/|\/blog\/|\.copy\.|\/landing|\/content\/|faq/i.test(p);
}

function loadRules() {
  try { return JSON.parse(fs.readFileSync(RULES, 'utf8')); } catch { return null; }
}

// Compte les familles de marqueurs slop présentes dans un texte.
function slopFamilies(content, rules) {
  const hit = [];
  for (const cat of rules.categories) {
    if (cat.patterns.some((p) => new RegExp(p, 'i').test(content))) hit.push(cat.label);
  }
  return hit;
}

function deny(reason) {
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: reason },
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
    if (data.tool_name !== 'Bash') process.exit(0);
    const cmd = data.tool_input?.command || '';
    // ne réagit qu'aux vrais commits (pas git status/diff/log)
    if (!/\bgit\s+commit\b/.test(cmd)) process.exit(0);

    const rules = loadRules();
    if (!rules) process.exit(0);

    // fichiers stagés. stdio stderr ignoré: un hook ne crache jamais de bruit.
    let staged = [];
    try {
      staged = execSync('git diff --cached --name-only', { encoding: 'utf8', timeout: 2000, stdio: ['ignore', 'pipe', 'ignore'] })
        .split('\n').map((s) => s.trim()).filter(Boolean);
    } catch { process.exit(0); } // pas un repo git / erreur → ne bloque pas

    const userFacing = staged.filter(isUserFacing);
    if (!userFacing.length) process.exit(0);

    const flagged = [];
    for (const f of userFacing) {
      let content = '';
      try { content = fs.readFileSync(f, 'utf8'); } catch { continue; }
      const fams = slopFamilies(content, rules);
      if (fams.length >= (rules.clusterThreshold || 2)) flagged.push({ f, fams });
    }

    if (!flagged.length) process.exit(0);

    const list = flagged.map((x) => `  • ${x.f} (${x.fams.join(', ')})`).join('\n');
    deny(
      `slop-gate: ${flagged.length} fichier(s) user-facing avec marqueurs AI-slop non traites :\n${list}\n` +
      `Passe /humanizer dessus avant de commiter. (Source: hooks/rules/slop-rules.json)`
    );
  } catch {
    process.exit(0); // silent fail — ne JAMAIS bloquer un commit par accident
  }
});
