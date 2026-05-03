/**
 * `/oplg:verify` workflow: review code changes made by `/oplg:apply` in the
 * current session.
 *
 * Outputs:
 *   - Skill: `openlog-verify`, triggered when the user asks to review recent
 *     apply changes or runs `/oplg:verify`.
 *   - Command: `/oplg:verify`, explicitly invoked by the user.
 */

import type { SkillTemplate, CommandTemplate } from '../types.js';

const SHARED_BODY = `Review code changes made by \`/oplg:apply\` in the current conversation session.

**Scope**

Unlike a full PR review, this command focuses exclusively on commits created by \`/oplg:apply\` during the current session. It identifies those commits by scanning the git log for Conventional Commits made since the session began (i.e. commits after the HEAD at conversation start).

**Steps**

1. **Identify session changes**
   - Determine the commits created by \`/oplg:apply\` in this session. Use the conversation context to find which commits were pushed, or fall back to \`git log --oneline\` to identify recent commits authored by the current user during today's date.
   - Run \`git diff <base>..HEAD\` where \`<base>\` is the commit before the first \`/oplg:apply\` commit in this session.
   - If no \`/oplg:apply\` commits are found in this session, report "No /oplg:apply changes detected in this session" and stop.

2. **Collect changed files**
   - Run \`git diff --name-only <base>..HEAD\` to list all files modified.
   - Read the full content of each changed file (or the relevant diff hunks for large files).

3. **Review aspects**
   Perform the following checks on the changed code:

   - **Correctness**: Logic errors, off-by-one mistakes, null/undefined risks, unhandled edge cases.
   - **Security**: Injection vulnerabilities, exposed secrets, unsafe deserialization, OWASP top-10 patterns.
   - **Code quality**: Naming clarity, function length, duplication, dead code, adherence to the project's existing style.
   - **Type safety**: Proper TypeScript types, avoid \`any\`, correct generics usage (if applicable).
   - **Error handling**: Silent failures, overly broad catches, missing error propagation.
   - **Tests**: Whether new/modified logic has corresponding test coverage (if the project has a test framework).
   - **README consistency**: If the change affects user-facing behavior, verify that README.md was updated accordingly.

4. **Produce the report**
   Output a structured review:

   \`\`\`markdown
   # /oplg:verify Review

   ## Scope
   Commits reviewed: <list of short SHAs and messages>
   Files changed: <count>

   ## Critical Issues (must fix)
   - [file:line] Description

   ## Important Issues (should fix)
   - [file:line] Description

   ## Suggestions (nice to have)
   - [file:line] Description

   ## Positive Observations
   - What's well-done

   ## Verdict
   PASS | NEEDS_FIXES
   \`\`\`

5. **Verdict logic**
   - **PASS**: No critical or important issues found.
   - **NEEDS_FIXES**: One or more critical or important issues exist. List them with actionable fix suggestions.

**Guardrails**

- This is a **read-only** workflow. Do not modify any files, create commits, or push.
- Do not review files outside the session's \`/oplg:apply\` diff scope.
- If the diff is too large (>2000 lines changed), focus on critical/important issues and note that a full review was not feasible in one pass.
- The \`openlog/\` directory is out of scope — do not review changes under \`openlog/\`.
`;

export function getVerifySkillTemplate(): SkillTemplate {
  return {
    name: 'openlog-verify',
    description:
      'Review code changes made by /oplg:apply in the current session. Triggers when the user runs /oplg:verify or asks to "review my apply changes".',
    instructions: SHARED_BODY,
    license: 'MIT',
    compatibility: 'Requires openlog CLI.',
    metadata: { author: 'openlog', version: '1.0' },
  };
}

export function getOplgVerifyCommandTemplate(): CommandTemplate {
  return {
    name: 'OPLG: Verify',
    description:
      'Review code changes made by /oplg:apply in the current session (usage: /oplg:verify)',
    category: 'Workflow',
    tags: ['workflow', 'verify', 'review', 'openlog'],
    content: SHARED_BODY,
  };
}
