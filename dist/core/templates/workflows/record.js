/**
 * `/oplg:record` workflow: turn the most recent changes into a documentation
 * record under `openlog/` and update internal docs as needed.
 *
 * Outputs:
 *   - Skill: `openlog-record`
 *   - Command: `/oplg:record`
 */
const SHARED_BODY = `Find every unrecorded entry (individual change or sub-task) in the current session, write one record file per entry under \`openlog/changes/\`, and update internal docs as needed.

**Output rules**

- 簡潔為先：summary report 每個 section 3–5 行；沒有內容的 section 直接省略。
- 不要重複模板指示文字；只輸出實際內容。
- 優先用 bullet list，避免長段落敘事。
- Record 內容必須來自真實 diff / commit / 對話事實；不要編造。

**Input**

\`/oplg:record\` takes no arguments. Title, slug, and filename are all inferred from actual changes — text after the command is supplementary context only, never a title override.

**Pre-flight**: no \`openlog/\` → prompt \`openlog init\` and stop. No \`openlog/changes/\` → create it.

**Steps**

1. **Inventory unrecorded entries** — Gather from \`git log\` (session commits), \`git status/diff\` (uncommitted), conversation context, and plan files (\`~/.claude/plans/*.md\`, only if relevant to this session). Cross-check against existing \`openlog/changes/\` to skip already-recorded items. One logical change = one entry. If nothing to record, report and stop.

2. **Auto-generate title and path (per entry)** — Derive title from the diff (not from user input). Write title in the user's preferred language; prefix with Conventional Commits verb when fitting. Slug: English, kebab-case, ~6 words max. Path: \`openlog/changes/<YYYY-MM-DD>_<NN>-<slug>.md\` (\`<NN>\` = two-digit counter, increment past existing).

3. **Generate record file (per entry)** — Use this skeleton (user's preferred language; code identifiers verbatim):

   \`\`\`markdown
   # <title>

   - **Date:** YYYY-MM-DD
   - **Author:** <git user>
   - **Related commit:** <hash or "uncommitted">

   ## Summary
   One paragraph: what changed and why.

   ## Motivation / context
   Why this change is needed.

   ## Key changes
   - \`path/to/file.ts\`: one-line summary

   ## Impact
   Affected features / breaking changes.

   ## Verification
   Steps performed and outcome.

   ## Follow-ups *(omit if none)*
   - [ ] TODO
   \`\`\`

   If a relevant plan file exists, weave its rationale into Summary and Motivation naturally — don't quote it verbatim or add a separate Plan section. Key changes must derive from actual diffs only.

4. **Sync openlog/ internal docs** — This workflow may **only** modify files under \`openlog/\`. Update \`openlog/project.md\` or \`openlog/specs/\` when: CLI flags change, public API contracts change, cross-workflow invariants are affected, specs drifted, or breaking changes are introduced. Skip for: internal refactors, perf, dep upgrades, bug fixes restoring spec'd behavior. Out-of-\`openlog/\` docs that need updating → list under "needs user decision", defer to \`/oplg:apply\`.

5. **Validate** — Run \`openlog validate\`. Fix errors before committing; if stuck, report to user.

6. **Commit and push** — Stage record files + internal-doc updates. Conventional Commits style. \`git push\` to current upstream; stop and report on failure.

7. **Tag (if version changed)** — If \`package.json\` version was updated this session, create and push \`v<version>\` tag. Skip silently otherwise.

8. **Summary report** — Short bullets: new files, updated docs, commit SHA, push result, skipped items. **省略沒有內容的 section。**

**Guardrails**

- Allowed: \`git add/commit/push\` (current upstream), \`git tag/push tag\`. Not allowed without user instruction: \`reset --hard\`, \`push --force\`, branch deletion, history rewrites.
- **openlog/-only**: do not touch files outside \`openlog/\`.
- Never overwrite existing record files; use next free \`<NN>\`.
`;
export function getRecordSkillTemplate() {
    return {
        name: 'openlog-record',
        description: "Turn the most recent code changes into a record under openlog/, with the title auto-derived from the diff, and update README, project.md, and specs as needed. Triggers when the user runs /oplg:record or asks to \"log this change\".",
        instructions: SHARED_BODY,
        license: 'MIT',
        compatibility: 'Requires openlog CLI and an initialized openlog/ directory.',
        metadata: { author: 'openlog', version: '1.0' },
    };
}
export function getOplgRecordCommandTemplate() {
    return {
        name: 'OPLG: Record',
        description: 'Write a record of recent changes to openlog/, with the title auto-derived (usage: /oplg:record, no arguments)',
        category: 'Workflow',
        tags: ['workflow', 'record', 'openlog'],
        content: SHARED_BODY,
    };
}
//# sourceMappingURL=record.js.map