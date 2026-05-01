/**
 * `/oplg:record` workflow: turn the most recent changes into a documentation
 * record under `openlog/` and update internal docs as needed.
 *
 * Outputs:
 *   - Skill: `openlog-record`
 *   - Command: `/oplg:record`
 */

import type { SkillTemplate, CommandTemplate } from '../types.js';

const SHARED_BODY = `Turn the "most recent changes" into a documentation record under the project's \`openlog/\` directory, and update internal documentation as needed.

**Input**

\`/oplg:record\` takes no arguments. Title, slug, and filename are inferred from the actual changes. Even if the user types text after the command, treat it as **supplementary context**, not a title override — the title still derives from the diff itself.

**Pre-flight checks**

- If there is no \`openlog/\` at the project root: prompt the user to run \`openlog init\` first and stop.
- If \`openlog/changes/\` does not exist: create it automatically.

**Steps**

1. **Inventory the changes to record**
   - Start with \`git status --short\` and \`git diff --stat\` to confirm there is something to record.
   - If nothing has been committed yet: use \`git diff\` for uncommitted changes as the primary material.
   - If a commit just landed: use \`git log -1 --stat\` and \`git show HEAD\` for the latest commit.
   - If both come up empty: ask the user which range to record (e.g. commit hash range \`A..B\`); do not fabricate content.
   - **Also include** design decisions and trade-offs from the current conversation that have not been committed yet.

2. **Auto-generate title and file path**

   Derive the title from the changes themselves. **Do not** ask the user for a title, and **do not** use whatever text follows \`/oplg:record\` as the title.

   - **Title (sentence describing the change)**: a single sentence covering "what was done + what it affects", e.g.:
     - "Add --dry-run flag to \`openlog init\`"
     - "Fix git check logic in \`/oplg:apply\` when working tree is clean"
     - When fitting, prefix with a Conventional Commits verb (feat/fix/refactor/docs/test/chore).
   - **slug (filename, alphanumeric + hyphen)**: distill the title into a concise English slug, lower-case, kebab-case, ~6 words max. Examples: \`add-dry-run-to-init\`, \`fix-apply-clean-state-check\`. **Avoid non-ASCII filenames.**
   - **Path**: \`openlog/changes/<YYYY-MM-DD>-<slug>.md\`. If the same date+slug already exists, append \`-2\`, \`-3\`, etc.; **do not** overwrite an existing file.
   - List the inferred title and slug in your report so the user can rename via \`git mv\` later if desired.

3. **Generate the record file**

   Use the following skeleton (English content; keep code/paths verbatim):

   \`\`\`markdown
   # <title>

   - **Date:** YYYY-MM-DD
   - **Author:** <git config user.name or current user>
   - **Related commit:** <commit hash if any; otherwise "uncommitted">

   ## Summary

   One paragraph describing what changed and why.

   ## Motivation / context

   Why this change is needed (bug, requirement, tech debt, experiment, ...).

   ## Key changes

   - \`path/to/file.ts\`: <one-line summary>
   - \`path/to/other.ts\`: <one-line summary>

   ## Impact

   - Which features / modules are affected? Any breaking changes?

   ## Verification

   - Tests / builds / manual steps performed.
   - Outcome.

   ## Follow-ups

   - [ ] TODO 1
   - [ ] TODO 2
   \`\`\`

4. **Sync internal docs (when applicable)**

   Based on the change, **proactively** decide whether the following files need updates; if so, update them and list each one in the final report:

   - \`README.md\`: update when CLI commands, public APIs, install steps, or dependencies change.
   - \`openlog/project.md\`: update when the tech stack, layout, or workflow changes.
   - Existing specs under \`openlog/specs/\`: update or add a spec when the implementation diverges.
   - \`CHANGELOG.md\` (if present): add an entry following the project's existing style.
   - \`CLAUDE.md\` (if present and team-shared): only touch when the change affects AI collaboration workflows or conventions.
   - **Do not** modify the user's global \`~/.claude/CLAUDE.md\`.

   Use minimal diffs for each update; do not rewrite whole documents.

5. **Summary report**

   Produce a short bulleted summary:
   - Path of the new record file (link).
   - List of updated internal docs (one-line reason each).
   - Any files you skipped or were unsure about, so the user can decide.

**Guardrails**

- Do not run \`git commit\` or \`git push\` on your own unless the user asks.
- Record content must come from real diffs / commits / conversation facts; **do not** fabricate code changes or test results.
- If a same-named file already exists in \`openlog/changes/\` with different content: create a new file with a numeric suffix; **do not** overwrite the existing one.
- For internal docs you are unsure about, list them in a "needs user decision" section instead of forcing a change.

**Output format example**

\`\`\`
## /oplg:record done

### New
- openlog/changes/2026-05-01-add-dry-run-flag.md

### Updated
- README.md: documented \`--dry-run\` usage
- openlog/project.md: added dry-run note in the dev commands section

### Needs user decision
- Should we add an init-flags spec under \`openlog/specs/\`?
\`\`\`
`;

export function getRecordSkillTemplate(): SkillTemplate {
  return {
    name: 'openlog-record',
    description:
      "Turn the most recent code changes into a record under openlog/, with the title auto-derived from the diff, and update README, project.md, and specs as needed. Triggers when the user runs /oplg:record or asks to \"log this change\".",
    instructions: SHARED_BODY,
    license: 'MIT',
    compatibility: 'Requires openlog CLI and an initialized openlog/ directory.',
    metadata: { author: 'openlog', version: '1.0' },
  };
}

export function getOplgRecordCommandTemplate(): CommandTemplate {
  return {
    name: 'OPLG: Record',
    description: 'Write a record of recent changes to openlog/, with the title auto-derived (usage: /oplg:record, no arguments)',
    category: 'Workflow',
    tags: ['workflow', 'record', 'openlog'],
    content: SHARED_BODY,
  };
}
