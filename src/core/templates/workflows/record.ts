/**
 * `/oplg:record` workflow: turn the most recent changes into a documentation
 * record under `openlog/` and update internal docs as needed.
 *
 * Outputs:
 *   - Skill: `openlog-record`
 *   - Command: `/oplg:record`
 */

import type { SkillTemplate, CommandTemplate } from '../types.js';

const SHARED_BODY = `Find every "entry" (an individual change or sub-task) in the current session that has **not yet been recorded** under \`openlog/changes/\`, then write one record file per entry and update internal documentation as needed.

**Input**

\`/oplg:record\` takes no arguments. Title, slug, and filename are inferred from the actual changes. Even if the user types text after the command, treat it as **supplementary context**, not a title override — the title still derives from the diff itself.

**Pre-flight checks**

- If there is no \`openlog/\` at the project root: prompt the user to run \`openlog init\` first and stop.
- If \`openlog/changes/\` does not exist: create it automatically.

**Steps**

1. **Inventory the unrecorded entries**

   The goal is to enumerate every entry from the **current session** that has not yet been written into a record file, and produce one record file per entry. Treat each logically distinct change (one feature, one fix, one refactor, ...) as its own entry — do not merge unrelated changes into a single record.

   - Gather candidate entries from:
     - \`git log\` for commits made during the session (e.g. since the previous record's commit, or since the session-start ref).
     - \`git status --short\` + \`git diff\` for uncommitted changes still in the working tree.
     - Conversation context: design decisions and trade-offs that were agreed but not yet written to disk.
   - Cross-check against existing files under \`openlog/changes/\`. Skip entries that are already represented; treat as new only those without a matching record.
   - If both git history and the working tree are empty and the conversation has nothing new: ask the user which range to record (e.g. commit hash range \`A..B\`); do not fabricate content.
   - If everything is already recorded: report "nothing new to record" and stop.

2. **Auto-generate title and file path (per entry)**

   For each unrecorded entry, derive its title from the changes themselves. **Do not** ask the user for a title, and **do not** use whatever text follows \`/oplg:record\` as the title.

   - **Title (sentence describing the change)**: a single sentence covering "what was done + what it affects", e.g.:
     - "Add --dry-run flag to \`openlog init\`"
     - "Fix git check logic in \`/oplg:apply\` when working tree is clean"
     - When fitting, prefix with a Conventional Commits verb (feat/fix/refactor/docs/test/chore).
   - **slug (filename, alphanumeric + hyphen)**: distill the title into a concise English slug, lower-case, kebab-case, ~6 words max. Examples: \`add-dry-run-to-init\`, \`fix-apply-clean-state-check\`. **Avoid non-ASCII filenames.**
   - **Path**: \`openlog/changes/<YYYY-MM-DD>_<NN>-<slug>.md\`, where \`<NN>\` is a two-digit completion-order counter for that date.
     - The first record of a given date starts at \`_01\`; the next is \`_02\`, then \`_03\`, and so on.
     - Determine \`<NN>\` by listing existing files under \`openlog/changes/\` whose name starts with the same date and incrementing past the highest existing number.
     - If a same-named file already exists, do not overwrite it; use the next free \`<NN>\`.
   - List each inferred title, slug, and path in your final report so the user can rename via \`git mv\` later if desired.

3. **Generate the record file (per entry)**

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

4. **Sync internal docs under \`openlog/\` (when applicable)**

   This workflow may **only** create or modify files under the \`openlog/\` directory. Anything outside \`openlog/\` (e.g. \`README.md\`, \`CLAUDE.md\`, \`CHANGELOG.md\`, source code, configuration) is **out of scope** and must not be modified here — those belong to \`/oplg:apply\` or another workflow.

   Based on the change, **proactively** decide whether the following \`openlog/\`-internal docs need updates; if so, update them and list each one in the final report.

   - \`openlog/project.md\`: update when the tech stack, layout, or workflow changes.
   - Existing specs under \`openlog/specs/\`: update or add a spec when **any** of the following applies to a recorded entry:
     1. A user-facing CLI flag, subcommand, or argument is added, removed, or renamed.
     2. A public API contract changes (exported function signature, config schema, template output format).
     3. A cross-workflow invariant is affected (e.g. surface ownership, handoff protocol, file naming convention).
     4. An existing spec's Requirement or Scenario no longer matches the implementation (the WHEN/THEN drifted).
     5. A capability is deprecated or removed (the spec must note Reason and Migration).
     6. A breaking change is introduced (anything that forces downstream consumers to adapt).

     Do **not** update specs for: internal refactors that preserve behavior, performance optimizations, dependency upgrades that don't change behavior, bug fixes that restore originally-specified behavior, or test-only changes.

   If you find that an out-of-\`openlog/\` doc clearly needs updating (e.g. \`README.md\` drifted), **do not** modify it here. List it under "needs user decision" in the final report so the user can re-run \`/oplg:apply\` to handle it.

   Use minimal diffs for each update; do not rewrite whole documents.

5. **Validate**

   After all record files and internal-doc updates have been written (steps 3–4), run \`openlog validate\` to check format consistency across \`openlog/\`.

   - If validation passes: proceed to step 6.
   - If validation reports errors: fix them before committing. If a fix is not obvious after a couple of attempts, stop and report the validation output to the user.

6. **Commit and push**

   - Stage the new record file(s) and any internal-doc updates from step 4.
   - Create a commit using Conventional Commits (typically \`docs(openlog): ...\`) and the project's existing commit-message style.
   - Run \`git push\` to the current branch's existing upstream.
   - If \`git push\` fails (no upstream, network error, non-fast-forward rejection), stop and report; do not force-push.

7. **Summary report**

   Produce a short bulleted summary:
   - Path of each new record file (link).
   - List of updated internal docs (one-line reason each).
   - Commit SHA and push result.
   - Any files you skipped or were unsure about, so the user can decide.

**Guardrails**

- Allowed git operations without further confirmation: \`git add\`, \`git commit\`, \`git push\` to the current branch's existing upstream. **Not allowed without explicit user instruction**: \`reset --hard\`, \`push --force\`, branch deletion, history rewrites.
- This workflow may **only** create or modify files under \`openlog/\`. Do **not** touch any file outside \`openlog/\` — including \`README.md\`, \`CLAUDE.md\`, \`CHANGELOG.md\`, source code, or settings. Defer all out-of-\`openlog/\` changes to \`/oplg:apply\` (or whichever workflow owns them).
- Record content must come from real diffs / commits / conversation facts; **do not** fabricate code changes or test results.
- If a same-named file already exists in \`openlog/changes/\`: pick the next free \`<NN>\` counter; **do not** overwrite the existing one.
- For \`openlog/\`-internal docs you are unsure about, list them in a "needs user decision" section instead of forcing a change.

**Output format example**

\`\`\`
## /oplg:record done

### New
- openlog/changes/2026-05-01_01-add-dry-run-flag.md
- openlog/changes/2026-05-01_02-fix-apply-clean-state-check.md

### Updated
- openlog/project.md: added dry-run note in the dev commands section

### Commit
- 7f3d1ab — docs(openlog): record dry-run + apply clean-state fixes
- pushed to origin/main

### Needs user decision
- README drifted on the new --dry-run flag — please run \`/oplg:apply update README for --dry-run\` to sync it (out of scope for /oplg:record).
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
    metadata: { author: 'openlog', version: '0.5.9' },
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
