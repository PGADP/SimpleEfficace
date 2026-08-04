#!/usr/bin/env node
// se-guard — SIMPLE & EFFICACE advisory guard. PostToolUse hook.
// Calqué sur le pattern gsd-prompt-guard.js (lecture stdin JSON, additionalContext, silent fail).
//
// Triggers on: Edit | Write | MultiEdit
// Action: ADVISORY only. Never blocks. Surfaces findings as a system reminder.
// Contract: never break a turn — always exit 0. Re-entrancy guard via SE_GUARD_DEPTH.

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { runAll, isFrontFile, isSeProject } = require('./guard-lib.cjs');

const DETECTOR_TIMEOUT_MS = 4000;
const MAX_DETECTOR_FINDINGS = 3;
const STDIN_TIMEOUT_MS = 3000;

// The vendored detector ships WITH the system (this repo, installed in ~/.claude/se/),
// not with the audited project — resolve it relative to the hook, never to projectDir.
const SYSTEM_DETECTOR = path.join(__dirname, '..', 'vendor', 'design', 'impeccable', 'detect.mjs');

/**
 * Run the vendored impeccable detector on the edited file. Static-file scanning only
 * catches the subset that does not need a browser (overused fonts, gradient text, AI
 * palettes, em-dash overuse) — the contrast and layout rules need a live URL and belong
 * to the visual gate, not to a per-edit hook.
 *
 * Stays advisory and silent on any failure: a guard must never cost a turn.
 */
function detectAntipatterns(filePath, projectDir, detectorPath = SYSTEM_DETECTOR) {
  if (!isFrontFile(filePath)) return [];
  if (!fs.existsSync(detectorPath)) return [];

  // projectDir is still the spawn cwd: the detector picks up a project-level
  // .impeccable/ config from there when one exists.
  const result = spawnSync(process.execPath, [detectorPath, '--json', '--no-advisory', filePath], {
    encoding: 'utf8',
    timeout: DETECTOR_TIMEOUT_MS,
    cwd: projectDir,
  });
  // The detector exits non-zero when it FINDS something — parse stdout regardless of
  // status, and let the JSON parse be the real guard.
  if (!result.stdout) return [];

  try {
    const findings = JSON.parse(result.stdout);
    if (!Array.isArray(findings)) return [];
    return findings.slice(0, MAX_DETECTOR_FINDINGS).map((f) => ({
      id: `impeccable:${f.antipattern}`,
      message: `${f.name}${f.line ? ` (ligne ${f.line}` : ''}${f.snippet ? ` — ${f.snippet}` : ''}${f.line ? ')' : ''}. ${f.description}`,
    }));
  } catch {
    return [];
  }
}

function readHookInput() {
  let input = '';
  const stdinTimeout = setTimeout(() => process.exit(0), STDIN_TIMEOUT_MS);
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (chunk) => (input += chunk));
  process.stdin.on('end', () => {
    clearTimeout(stdinTimeout);
    try {
      const data = JSON.parse(input);

      // Globally-wired hook: stay silent outside SE-managed projects (no .planning/).
      const projectDir = process.env.CLAUDE_PROJECT_DIR || data.cwd || process.cwd();
      if (!isSeProject(projectDir)) process.exit(0);

      const toolName = data.tool_name;
      if (toolName !== 'Edit' && toolName !== 'Write' && toolName !== 'MultiEdit') process.exit(0);

      const filePath = data.tool_input?.file_path || '';
      if (!filePath) process.exit(0);

      // content for Write; new_string for Edit; concat edits for MultiEdit
      let content = data.tool_input?.content || data.tool_input?.new_string || '';
      if (Array.isArray(data.tool_input?.edits)) {
        content = data.tool_input.edits.map((e) => e.new_string || '').join('\n');
      }
      if (!content) process.exit(0);

      const findings = [...runAll({ filePath, content, projectDir }), ...detectAntipatterns(filePath, projectDir)];
      if (!findings.length) process.exit(0);

      const lines = findings.map((f) => `  • [${f.id}] ${f.message}`).join('\n');
      const output = {
        hookSpecificOutput: {
          hookEventName: 'PostToolUse',
          additionalContext:
            `\u{1F6E1}️ se-guard sur ${path.basename(filePath)} (advisory, rien n'est bloque) :\n${lines}`,
        },
      };
      process.stdout.write(JSON.stringify(output));
      process.exit(0);
    } catch {
      process.exit(0); // silent fail — never block tool execution
    }
  });
}

if (require.main === module) readHookInput();

module.exports = { detectAntipatterns };
