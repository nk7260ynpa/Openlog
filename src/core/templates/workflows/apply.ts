/**
 * `/oplg:apply` workflow: directly modify code based on the user's described action.
 *
 * Outputs:
 *   - Skill: `openlog-apply`, triggered when the user asks to modify code or
 *     runs `/oplg:apply`.
 *   - Command: `/oplg:apply <action>`, explicitly invoked by the user.
 */

import type { SkillTemplate, CommandTemplate } from '../types.js';

const SHARED_BODY = `Read the "action to perform" from user input (free-form text, e.g. \`/oplg:apply add --dry-run to init\`) and modify the code directly.

**Input**

Everything after \`/oplg:apply <action>\` is the action description. If the description is empty or extremely vague (e.g. just the word \`fix\`), you **must** call AskUserQuestion to clarify before continuing.

**Steps**

1. **Interpret the action**
   - Translate the action description into a concrete edit plan: which files to touch, what to add/change/remove, and whether new tests are needed.
   - If the description contains multiple sub-tasks ("entries"), list the plan in your reply and execute them **one entry at a time**, looping through steps 3–6 per entry.
   - If the action depends on locally-disabled dependencies or external services, check whether you can proceed; otherwise stop and report.

2. **Survey the current state**
   - Run \`git status --short\` and \`git diff --stat\` to learn whether there are uncommitted changes, so you do not overwrite the user's in-progress work.
   - If the working tree is clean: start editing immediately.
   - If there are uncommitted changes: briefly summarize them first, then proceed; do not discard existing changes unless the user asked you to.

3. **Modify the code (per entry)**
   - Use Read → Edit/Write to change the relevant files.
   - Keep the scope minimal: only touch files related to the current entry; do not refactor neighboring code on the side.
   - Comments and messages follow the existing file's language convention.
   - If the entry requires new tests or updates to existing ones, **complete those in this step too**.

4. **Update README.md (per entry)**
   - If the entry affects user-facing CLI commands, install steps, public APIs, configuration, or dependencies, update \`README.md\` with a minimal diff to keep it in sync.
   - If the entry is internal-only (refactoring, internal helpers, comments), explicitly skip this step and note "no README change needed".

5. **Local verification (per entry)**
   - If the project has a fast check command (\`pnpm run build\`, \`npm test\`, \`pytest\`, \`tsc --noEmit\`, ...), run the most relevant one.
   - If the build/test fails: try to fix it; if you cannot fix it after a couple of attempts, stop and paste the full error to the user instead of forcing a workaround.

6. **Commit and push (per entry)**
   - Stage the files modified for the current entry (source + README + any rebuilt artifacts such as \`dist/\`).
   - Create a commit using Conventional Commits (\`feat\`, \`fix\`, \`docs\`, \`refactor\`, \`chore\`, \`test\`, ...) and the project's existing commit-message style.
   - Run \`git push\` to the current branch's existing upstream.
   - Do **not** batch multiple entries into one commit; one entry → one commit → one push.
   - If \`git push\` fails (no upstream, network error, non-fast-forward rejection), stop and report; do not force-push.
   - After the push succeeds, move on to the next entry and repeat steps 3–6.

**Guardrails**

- Allowed git operations without further confirmation: \`git add\`, \`git commit\`, \`git push\` to the current branch's existing upstream. **Not allowed without explicit user instruction**: \`reset --hard\`, \`push --force\`, \`push --force-with-lease\`, branch deletion, history rewrites.
- The \`openlog/\` directory is **read-only** for this workflow. You may read it (e.g. \`openlog/project.md\`, \`openlog/specs/\`, \`openlog/changes/\`) for context, but **must not** create, modify, rename, or delete any file under \`openlog/\`. Writing to \`openlog/\` is the exclusive responsibility of \`/oplg:record\`. If an entry seems to require an \`openlog/\` change, stop and ask the user to run \`/oplg:record\` instead.
- README.md updates are part of this workflow (step 4). Other docs (\`CLAUDE.md\`, \`settings.json\`, etc.) are still out of scope unless the entry explicitly targets them — if you discover such changes are needed, mention them and let the user decide.
- Do not leave \`TODO\` / \`FIXME\` / \`HACK\` markers in the final commit (unless the entry itself is to add a TODO).
- If the action is high-risk (mass deletion, data overwrite, CI/CD changes, secret handling), **stop and confirm** before acting.
`;

export function getApplySkillTemplate(): SkillTemplate {
  return {
    name: 'openlog-apply',
    description:
      "Directly modify the project's code based on the user's described action. Triggers when the user runs /oplg:apply or asks to \"change X to Y / add Z / fix this bug\".",
    instructions: SHARED_BODY,
    license: 'MIT',
    compatibility: 'Requires openlog CLI.',
    metadata: { author: 'openlog', version: '1.0' },
  };
}

export function getOplgApplyCommandTemplate(): CommandTemplate {
  return {
    name: 'OPLG: Apply',
    description: "Modify code directly based on the user's description (usage: /oplg:apply <action>)",
    category: 'Workflow',
    tags: ['workflow', 'apply', 'openlog'],
    content: SHARED_BODY,
  };
}
