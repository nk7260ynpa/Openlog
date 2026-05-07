/**
 * `/oplg:verify` workflow: review code changes made by `/oplg:apply` in the
 * current session.
 *
 * Outputs:
 *   - Skill: `openlog-verify`, triggered when the user asks to review recent
 *     apply changes or runs `/oplg:verify`.
 *   - Command: `/oplg:verify`, explicitly invoked by the user.
 */
const SHARED_BODY = `Review code changes made by \`/oplg:apply\` in the current conversation session.

**Output rules**

- 簡潔為先：每個 section 3–5 行；沒有 issue 的 section 直接省略。
- 優先用 bullet list，避免長段落敘事。

**Scope**: Only commits created by \`/oplg:apply\` during this session (Conventional Commits after session-start HEAD). If none found, report and stop.

**Steps**

1. **Identify session changes** — Find \`/oplg:apply\` commits via conversation context or \`git log\`. Run \`git diff <base>..HEAD\`.

2. **Collect changed files** — \`git diff --name-only <base>..HEAD\`, then read relevant diff hunks.

3. **Review** — Check for: correctness (logic errors, edge cases), security (OWASP top-10), code quality & type safety, error handling, and README consistency if user-facing behavior changed.

4. **Report** — Use the template below. **省略沒有內容的 section。**

   \`\`\`markdown
   # /oplg:verify Review

   ## Scope
   Commits: <short SHAs> | Files changed: <count>

   ## Critical Issues (must fix) *(omit if none)*
   - [file:line] Description

   ## Important Issues (should fix) *(omit if none)*
   - [file:line] Description

   ## Suggestions *(omit if none)*
   - [file:line] Description

   ## Positive Observations *(omit if none)*
   - What's well-done

   ## Verdict
   PASS | NEEDS_FIXES
   \`\`\`

   **PASS** = no critical or important issues. **NEEDS_FIXES** = one or more exist, with actionable fix suggestions.

**Guardrails**

- **Read-only**: do not modify files, commit, or push.
- Scope only to session \`/oplg:apply\` diffs; \`openlog/\` is out of scope.
- If diff > 2000 lines, focus on critical/important issues and note partial coverage.
`;
export function getVerifySkillTemplate() {
    return {
        name: 'openlog-verify',
        description: 'Review code changes made by /oplg:apply in the current session. Triggers when the user runs /oplg:verify or asks to "review my apply changes".',
        instructions: SHARED_BODY,
        license: 'MIT',
        compatibility: 'Requires openlog CLI.',
        metadata: { author: 'openlog', version: '1.0' },
    };
}
export function getOplgVerifyCommandTemplate() {
    return {
        name: 'OPLG: Verify',
        description: 'Review code changes made by /oplg:apply in the current session (usage: /oplg:verify)',
        category: 'Workflow',
        tags: ['workflow', 'verify', 'review', 'openlog'],
        content: SHARED_BODY,
    };
}
//# sourceMappingURL=verify.js.map