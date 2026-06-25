#!/usr/bin/env node
// se-guard — SIMPLE & EFFICACE advisory guard. PostToolUse hook.
// Calqué sur le pattern gsd-prompt-guard.js (lecture stdin JSON, additionalContext, silent fail).
//
// Triggers on: Edit | Write | MultiEdit
// Action: ADVISORY only. Never blocks. Surfaces findings as a system reminder.
// Contract: never break a turn — always exit 0. Re-entrancy guard via SE_GUARD_DEPTH.

const path = require('path');
const { runAll } = require('./guard-lib.cjs');

// Re-entrancy guard: if a child process already ran the guard, do nothing.
if (process.env.SE_GUARD_DEPTH) process.exit(0);
process.env.SE_GUARD_DEPTH = '1';

let input = '';
const stdinTimeout = setTimeout(() => process.exit(0), 3000);
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => (input += chunk));
process.stdin.on('end', () => {
  clearTimeout(stdinTimeout);
  try {
    const data = JSON.parse(input);
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

    const findings = runAll({ filePath, content });
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
