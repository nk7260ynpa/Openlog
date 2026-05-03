# feat: Make `openlog/` read-only for `/oplg:apply`

- **Date:** 2026-05-03
- **Author:** nk7260ynpa
- **Related commit:** 6a5aa3b

## Summary

Added an explicit guardrail to the `/oplg:apply` workflow template stating
that the `openlog/` directory is read-only for that workflow: it may read
files under `openlog/` (e.g. `project.md`, `specs/`, `changes/`) for
context, but must not create, modify, rename, or delete any file there.
Writing to `openlog/` is now exclusively the responsibility of
`/oplg:record`. The README slash-command table was updated to surface this
restriction to end users.

## Motivation / context

Until this change, `/oplg:apply`'s guardrail list only excluded
`openlog/changes/` implicitly via the pipeline-contract spec, while the
template itself never restated the rule. Since the slash command is what
agents actually load at runtime, the rule needed to live in the template
body too — otherwise an agent following the template alone could
plausibly edit `openlog/project.md` or a spec while shipping a feature,
blurring stage ownership and creating drift between Stage 2 commits and
Stage 3 records.

Making the boundary explicit (`openlog/` is read-only here; defer to
`/oplg:record`) keeps the three-stage pipeline's surface ownership
exclusive: `/oplg:apply` owns code, `README.md`, and rebuilt artifacts;
`/oplg:record` owns everything under `openlog/`.

## Key changes

- `src/core/templates/workflows/apply.ts`: added a new bullet to the
  `**Guardrails**` section declaring `openlog/` read-only for this
  workflow and pointing writes at `/oplg:record`.
- `README.md`: appended a clause to the `/oplg:apply` row in the
  "Slash commands" table noting the `openlog/` read-only rule.
- `dist/core/templates/workflows/apply.{js,js.map,d.ts.map}`: regenerated
  by `node build.js` so global installs pick up the new template body.

## Impact

- `/oplg:apply` users: edits that previously might have touched
  `openlog/project.md` or a spec must now be deferred to `/oplg:record`,
  or the user must run a separate workflow. No silent failure mode — the
  guardrail tells the agent to stop and ask.
- `/oplg:record` users: unchanged behavior here; the complementary
  restriction lands in a separate change.
- No breaking change to the CLI surface (`openlog init` / `openlog update`
  flags unchanged). `dist/` was rebuilt and committed alongside.

## Verification

- `node build.js` — clean build, `tsc` passed.
- `node bin/openlog.js init . --tools claude` — re-synced
  `.claude/skills/openlog-apply/SKILL.md` and
  `.claude/commands/oplg/apply.md` (gitignored, dogfooded only); both
  reported `[updated]`, confirming the new guardrail propagated through
  `getApplySkillTemplate` / `getOplgApplyCommandTemplate`.
- `git diff --stat` reviewed before commit; only the expected files
  changed.

## Follow-ups

- [ ] Update `openlog/specs/oplg-pipeline-contract.md` Stage 2 MUST NOT and
  cross-stage invariant #1 to reflect the broadened restriction (the
  whole `openlog/` directory, not just `openlog/changes/`). — handled in
  this same `/oplg:record` invocation.
