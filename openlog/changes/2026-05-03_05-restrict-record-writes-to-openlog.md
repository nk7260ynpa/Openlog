# feat: Restrict `/oplg:record` writes to `openlog/`

- **Date:** 2026-05-03
- **Author:** nk7260ynpa
- **Related commit:** bc02656

## Summary

Tightened the `/oplg:record` workflow so it may only create or modify
files under the `openlog/` directory. Removed `CHANGELOG.md` and
team-shared `CLAUDE.md` from its proactive sync list, and reframed
out-of-`openlog/` drift (e.g. README) as a "needs user decision" handoff
back to `/oplg:apply` rather than something `/oplg:record` should fix
itself. The README slash-command table was updated accordingly.

## Motivation / context

The `/oplg:record` template previously allowed proactive edits to
`CHANGELOG.md` and team-shared `CLAUDE.md` "when applicable", which
overlapped with `/oplg:apply`'s ownership of non-`openlog/` files. Paired
with the sibling change that makes `openlog/` read-only for
`/oplg:apply`, this commit closes the loop: each surface has exactly one
owner.

- Code, configuration, `README.md`, `CLAUDE.md`, `CHANGELOG.md`, and
  rebuilt artifacts → owned by `/oplg:apply` (Stage 2).
- Everything under `openlog/` (`project.md`, `specs/`, `changes/`) →
  owned by `/oplg:record` (Stage 3).

Drift in either direction now produces a structured handoff (Stage 3
emits a "needs user decision" note pointing back at Stage 2) instead of
silent cross-surface edits.

## Key changes

- `src/core/templates/workflows/record.ts`:
  - Step 4 retitled to "Sync internal docs under `openlog/` (when
    applicable)"; removed `CHANGELOG.md` and `CLAUDE.md` bullets;
    explicit instruction to defer out-of-`openlog/` drift to `/oplg:apply`
    via the "needs user decision" section.
  - Guardrails section updated: replaced the README-only exclusion with a
    blanket rule that this workflow may only touch files under
    `openlog/`.
  - Output-format example: replaced the spec-creation suggestion with a
    concrete "README drifted → run `/oplg:apply ...`" handoff line.
- `README.md`: rewrote the `/oplg:record` row in the "Slash commands"
  table to state the `openlog/`-only write rule and the handoff back to
  `/oplg:apply`.
- `dist/core/templates/workflows/record.{js,js.map,d.ts.map}`:
  regenerated via `node build.js`.

## Impact

- `/oplg:record` users: any drift in `README.md`, `CLAUDE.md`,
  `CHANGELOG.md`, or source code is no longer fixed inline. The workflow
  reports it under "needs user decision" so the user can run a follow-up
  `/oplg:apply` to handle it.
- `/oplg:apply` users: unchanged here; the complementary read-only rule
  for `openlog/` landed in `2026-05-03_04`.
- No CLI surface change (`openlog init` / `openlog update` flags
  unchanged). Build artifacts (`dist/`) refreshed and committed.

## Verification

- `node build.js` — clean build, `tsc` passed.
- `node bin/openlog.js init . --tools claude` —
  `.claude/skills/openlog-record/SKILL.md` and
  `.claude/commands/oplg/record.md` both reported `[updated]`,
  confirming the new template body propagated. Other skills/commands
  reported `[unchanged]` as expected (no spillover).
- `git diff --stat` reviewed before commit; only `record.ts`, the three
  matching `dist/` files, and `README.md` changed.

## Follow-ups

- [ ] Update `openlog/specs/oplg-pipeline-contract.md` Stage 3 MUST /
  MUST NOT lists and cross-stage invariant #1 to drop `CHANGELOG.md` /
  shared `CLAUDE.md` from Stage 3's sync targets and broaden Stage 3's
  surface ownership to the entire `openlog/` directory. — handled in
  this same `/oplg:record` invocation.
