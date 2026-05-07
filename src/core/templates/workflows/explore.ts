/**
 * `/oplg:explore` workflow: read-only investigation that produces a
 * structured handoff payload for `/oplg:apply`.
 *
 * Outputs:
 *   - Skill: `openlog-explore`, triggered when the user runs /oplg:explore
 *     or asks to "investigate / survey / map out X" before any code change.
 *   - Command: `/oplg:explore <topic>`, explicitly invoked by the user.
 *
 * Hard rule: this workflow MUST NOT modify any file in the repo, MUST NOT
 * commit, MUST NOT push, and MUST NOT install or run side-effecting commands.
 * Any code or content modification has to be deferred to `/oplg:apply`.
 */

import type { SkillTemplate, CommandTemplate } from '../types.js';

const SHARED_BODY = `Read the "topic to explore" from user input (free-form text, e.g. \`/oplg:explore how does init wire up adapters?\`) and produce a **structured, read-only investigation report**. This workflow does not modify code, content, or git state — its job is to organize findings so that the user (or \`/oplg:apply\`) can act on them next.

**Output rules**

- 簡潔為先：每個 section 控制在 3–5 行；沒有發現的 section 直接省略。
- 不要重複模板指示文字；只輸出實際內容。
- 優先用 bullet list，避免長段落敘事。
- 每個 claim 必須引用 \`file:line\`；不確定的標記 "unverified"。
- 不要編造檔案路徑、函式名稱、commit hash 或行為。

**Input**

Everything after \`/oplg:explore <topic>\` is the topic. If the topic is empty or extremely vague (e.g. just the word \`look\`), you **must** call AskUserQuestion to clarify before continuing. If the topic contains an edit request, split it: investigate here, defer the edit to \`/oplg:apply\`.

**Hard guardrails (read-only)**

- **Do not** call Edit, Write, NotebookEdit, or any tool that mutates files.
- **Do not** run state-mutating shell commands (\`git add/commit/push/checkout/reset/stash/tag/merge/rebase/pull\`, \`npm i\`, \`pnpm i\`, \`pnpm run build\`, package installs, etc.).
- Read-only commands are fine: \`git log/status/diff/show/blame\`, \`ls\`, Read, \`grep\`/\`rg\`, \`find\`, \`tree\`.
- If the user asks to "just fix it", **stop** and tell them to use the handoff block with \`/oplg:apply\`.

**Steps**

1. **Frame the question** — Restate the topic in one sentence. Decide the smallest set of evidence needed.

2. **Gather evidence** — Use Read, Grep, and read-only Bash. Capture \`path:line\` and a short summary per finding. Stay focused on the topic scope.

3. **Report** — Use the template below. **省略沒有內容的 section。**

   \`\`\`markdown
   ## /oplg:explore — <one-line topic>

   ### Summary
   2–4 sentences, conclusion first.

   ### Key files
   - \`path/to/file.ts:LINE\` — role

   ### How it works
   Walk-through narrative, cite \`file:line\` inline.

   ### Gaps or open questions *(omit if none)*
   - Bullet list.

   ### Suggested next actions for \`/oplg:apply\` *(omit if none)*
   - Actionable bullets, each paste-ready for \`/oplg:apply\`.

   ### Handoff block *(omit if no actions needed)*
   \`\`\`text
   /oplg:apply <action>
   \`\`\`
   \`\`\`

4. **Stop** — Do not modify any file, commit, or push.
`;

export function getExploreSkillTemplate(): SkillTemplate {
  return {
    name: 'openlog-explore',
    description:
      "Read-only investigation of the codebase that produces a structured report and a paste-ready handoff for /oplg:apply. Triggers when the user runs /oplg:explore or asks to \"investigate / survey / where is X / how does Y work\" before any code change. Must not modify files, commit, or push.",
    instructions: SHARED_BODY,
    license: 'MIT',
    compatibility: 'Requires openlog CLI.',
    metadata: { author: 'openlog', version: '1.0' },
  };
}

export function getOplgExploreCommandTemplate(): CommandTemplate {
  return {
    name: 'OPLG: Explore',
    description:
      "Read-only investigation that organizes findings and hands them off to /oplg:apply (usage: /oplg:explore <topic>)",
    category: 'Workflow',
    tags: ['workflow', 'explore', 'openlog'],
    content: SHARED_BODY,
  };
}
