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

**Input**

Everything after \`/oplg:explore <topic>\` is the topic. If the topic is empty or extremely vague (e.g. just the word \`look\`), you **must** call AskUserQuestion to clarify what to investigate (which subsystem, which files, which question to answer) before continuing.

**Hard guardrails (read-only)**

- **Do not** call Edit, Write, NotebookEdit, or any tool that mutates files.
- **Do not** run shell commands that mutate state: no \`git add\`, \`git commit\`, \`git push\`, \`git checkout\`, \`git reset\`, \`git stash\`, \`git mv\`, \`git rm\`, \`git tag\`, \`git merge\`, \`git rebase\`, \`git pull\`, \`git fetch --prune\`, \`npm i\`, \`pnpm i\`, \`pnpm run build\`, \`pnpm run dev*\`, package installs, schema migrations, container restarts, or anything that touches \`dist/\`, \`node_modules/\`, the database, or external services.
- Read-only commands are fine: \`git log\`, \`git status\`, \`git diff\`, \`git show\`, \`git blame\`, \`ls\`, Read for files, \`grep\` / \`rg\`, \`find\`, \`tree\`, \`node --version\`.
- If the user asks this workflow to "just go ahead and fix it", **stop** and tell them to re-run as \`/oplg:apply <action>\` using the handoff block this workflow produces. Do not start editing.

**Steps**

1. **Frame the question**
   - Restate the topic in one sentence so the user can confirm you understood it.
   - If the topic mixes investigation with a clear edit request, **split it**: keep the investigation part for this workflow and explicitly note the edit part as a follow-up for \`/oplg:apply\`.
   - Decide the smallest set of evidence needed to answer it (which directories, which files, which git history range, which docs).

2. **Gather evidence (read-only)**
   - Use Read, Grep, Glob, and read-only Bash commands listed above.
   - For each piece of evidence, capture: \`path\`, \`line range\` (when known), and a short quote or summary. Always cite \`file_path:line_number\` so the user can jump to source.
   - Do not load files outside the topic's scope just because they are nearby. Stay focused.
   - If you must check external information, prefer WebFetch / WebSearch over guessing — but **never** download or install anything.

3. **Organize the findings**

   Produce a single markdown report with the sections below. Keep it tight; quality over volume.

   \`\`\`markdown
   ## /oplg:explore — <one-line topic restatement>

   ### Summary
   2–4 sentences answering the topic directly. Lead with the conclusion.

   ### Key files
   - \`path/to/file.ts:LINE\` — one-line role in the topic
   - \`path/to/other.ts:LINE-LINE\` — …

   ### How it works (or: what's there today)
   Short narrative of the current behavior / structure, in the order a reader would walk through it. Cite \`file:line\` inline.

   ### Gaps, risks, or open questions
   - Bullet list of things that are missing, ambiguous, or worth confirming with the user before any change.

   ### Suggested next actions for \`/oplg:apply\`
   A bulleted, **actionable** list. Each bullet is phrased so it can be pasted after \`/oplg:apply\` verbatim. Group related edits into a single bullet (one entry → one commit, per /oplg:apply rules); keep unrelated edits as separate bullets.

   ### Handoff block (paste-ready)
   \`\`\`text
   /oplg:apply <copy-paste action description here, derived from "Suggested next actions">
   \`\`\`
   If multiple unrelated actions are needed, emit one paste-ready line per action — \`/oplg:apply\` will turn each into its own commit.
   \`\`\`

4. **Stop without changing anything**
   - Do not stage, commit, or push. Do not run builds. Do not modify \`README.md\`, \`CLAUDE.md\`, \`openlog/\`, or any source.
   - End the response with the report above and the handoff block. The user decides whether to run \`/oplg:apply\` next.

**When to call this workflow**

- Before non-trivial edits, when the user wants a map of the relevant code first.
- When the user asks "where is X?", "how does Y work?", "what would it take to change Z?", "is there already something that does W?".
- When a previous \`/oplg:apply\` failed or was rolled back and the user wants to re-investigate before retrying.

**When NOT to call this workflow**

- When the user clearly wants an edit ("add X", "fix Y", "rename Z") — go straight to \`/oplg:apply\`.
- When the user just wants to record what already happened — that's \`/oplg:record\`.

**Output discipline**

- Cite \`file:line\` for every concrete claim about the codebase.
- Never invent file paths, function names, commit hashes, or behaviors. If unsure, say "unverified" and list how the user could verify.
- Keep the report focused on the topic; do not slip into unrelated refactor suggestions.
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
