/**
 * `/oplg:apply` workflow: directly modify code based on the user's described action.
 *
 * Outputs:
 *   - Skill: `openlog-apply`, triggered when the user asks to modify code or
 *     runs `/oplg:apply`.
 *   - Command: `/oplg:apply <action>`, explicitly invoked by the user.
 */
const SHARED_BODY = `Read the "action to perform" from user input (free-form text, e.g. \`/oplg:apply add --dry-run to init\`) and modify the code directly.

**Input**

Everything after \`/oplg:apply <action>\` is the action description. If the description is empty or extremely vague (e.g. just the word \`fix\`), you **must** call AskUserQuestion to clarify before continuing.

**Steps**

1. **Interpret the action**
   - Translate the action description into a concrete edit plan: which files to touch, what to add/change/remove, and whether new tests are needed.
   - If the description contains multiple sub-tasks, list the plan in your reply and execute them one by one.
   - If the action depends on locally-disabled dependencies or external services, check whether you can proceed; otherwise stop and report.

2. **Survey the current state**
   - Run \`git status --short\` and \`git diff --stat\` to learn whether there are uncommitted changes, so you do not overwrite the user's in-progress work.
   - If the working tree is clean: start editing immediately.
   - If there are uncommitted changes: briefly summarize them first, then proceed; do not discard existing changes unless the user asked you to.

3. **Modify the code**
   - Use Read → Edit/Write to change the relevant files.
   - Keep the scope minimal: only touch files related to the action; do not refactor neighboring code on the side.
   - Comments and messages follow the existing file's language convention.
   - If the task requires new tests or updates to existing ones, **complete those in this step too**.

4. **Local verification**
   - If the project has a fast check command (\`pnpm run build\`, \`npm test\`, \`pytest\`, \`tsc --noEmit\`, ...), run the most relevant one.
   - If the build/test fails: try to fix it; if you cannot fix it after a couple of attempts, stop and paste the full error to the user instead of forcing a workaround.

5. **Summary report**
   - Provide a short bulleted summary covering:
     - Which files changed (with paths)
     - Why the change was made
     - Any recommended follow-ups (e.g. the user should run e2e manually, or there are TODOs to track)
   - End with a suggestion: if the user wants to log this change, run \`/oplg:record\`.

**Guardrails**

- Do not run destructive git operations automatically (reset --hard, push --force, branch deletion). Confirm before committing unless the user explicitly asked.
- Do not touch files outside the task scope (e.g. README, CLAUDE.md, settings.json). If you discover such changes are needed, mention them in the report and let the user decide.
- Do not leave \`TODO\` / \`FIXME\` / \`HACK\` markers in the final commit (unless the action itself is to add a TODO).
- If the action is high-risk (mass deletion, data overwrite, CI/CD changes, secret handling), **stop and confirm** before acting.

**Output format example**

\`\`\`
## /oplg:apply done

**Action:** <action summary>

### Changes
- src/foo.ts: add behavior X
- tests/foo.test.ts: cover X

### Verification
- \`pnpm run build\`: pass
- \`pnpm test\`: pass (12 passed)

### Follow-ups
- To log this change, run \`/oplg:record\`.
\`\`\`
`;
export function getApplySkillTemplate() {
    return {
        name: 'openlog-apply',
        description: "Directly modify the project's code based on the user's described action. Triggers when the user runs /oplg:apply or asks to \"change X to Y / add Z / fix this bug\".",
        instructions: SHARED_BODY,
        license: 'MIT',
        compatibility: 'Requires openlog CLI.',
        metadata: { author: 'openlog', version: '1.0' },
    };
}
export function getOplgApplyCommandTemplate() {
    return {
        name: 'OPLG: Apply',
        description: "Modify code directly based on the user's description (usage: /oplg:apply <action>)",
        category: 'Workflow',
        tags: ['workflow', 'apply', 'openlog'],
        content: SHARED_BODY,
    };
}
//# sourceMappingURL=apply.js.map