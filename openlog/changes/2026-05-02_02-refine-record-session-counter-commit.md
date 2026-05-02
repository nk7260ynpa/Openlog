# feat(record): session-aware inventory, daily _NN counter, and commit & push in /oplg:record

- **Date:** 2026-05-02
- **Author:** nk7260ynpa
- **Related commit:** c20792e

## Summary

Refined the `/oplg:record` workflow template
(`src/core/templates/workflows/record.ts`) so the slash command installed by
`openlog init`:

1. enumerates every entry from the **current session** that has not yet been
   recorded and emits **one record file per entry** (instead of one bulk
   record);
2. uses a per-day completion counter in the filename
   (`<YYYY-MM-DD>_<NN>-<slug>.md`, e.g. `2026-05-02_01-foo.md`);
3. no longer touches `README.md` — that responsibility now belongs to
   `/oplg:apply`;
4. ends with a Commit & push step (fast-forward only).

## Motivation / context

The previous `/oplg:record` template was structured around "the most recent
changes" as a single pile, which had three downsides:

1. Multi-entry sessions collapsed into one record, hiding the order in which
   things were done and making `git mv`/rename later hard.
2. `README.md` was on its sync list, but with the new `/oplg:apply` taking
   ownership of README updates, having both workflows touch the same file
   risked drift / double-edits.
3. Records were generated but never committed, leaving the working tree in a
   half-done state that the user had to clean up by hand.

The user requested four concrete edits:

- Inventory unrecorded entries from the current session (4).
- Drop the README sync from this workflow (5).
- Use `<YYYY-MM-DD>_<NN>-<slug>.md` filenames (6).
- Commit and push at the end (7).

## Key changes

- `src/core/templates/workflows/record.ts`: rewrote `SHARED_BODY`. New step
  list is Inventory unrecorded entries → Auto-generate title/path per entry →
  Generate record file per entry → Sync internal docs → Commit & push →
  Summary report. The path step now describes the `_NN` counter and the rule
  for incrementing past existing files for the same date. Step 4's bullet
  list lost the README entry; an explicit "README is out of scope here"
  carve-out was added. Guardrails updated to allow `git add` / `git commit` /
  `git push` to the existing upstream and to forbid force-push / history
  rewrites without explicit user instruction. Output-format example refreshed
  to show two `_NN`-numbered records, the commit SHA, and the push result.
- `README.md`: rewrote the `/oplg:record` row in the slash-commands table to
  describe the session-aware inventory, the `_NN` filename pattern, the
  README carve-out, and the auto-commit-and-push behavior.
- `dist/core/templates/workflows/record.{js,d.ts.map,js.map}`: rebuilt via
  `npm run build` so the committed `dist/` matches the source.

## Impact

- Every project that re-runs `openlog init` after this commit gets the new
  behavior in `.claude/skills/openlog-record/SKILL.md` and
  `.claude/commands/oplg/record.md` (and the equivalent GitHub Copilot
  prompt).
- Filenames going forward will look different from historical records (which
  use `<date>-<slug>.md` without a counter). Both formats coexist; sort order
  is preserved because `_` (0x5F) is greater than `-` (0x2D), so new
  numbered files sort after legacy unnumbered files for the same date.
- `/oplg:record` will now commit and push the records itself. Existing
  installations keep the old (no-commit) behavior until users re-run
  `openlog init`.
- Removing `README.md` from `/oplg:record`'s sync list is a deliberate split:
  `/oplg:apply` handles user-facing doc updates, `/oplg:record` handles
  internal-only docs (`openlog/project.md`, `openlog/specs/`,
  `CHANGELOG.md`, team `CLAUDE.md`).

## Verification

- `npm run build`: pass (TypeScript 5.9.3, clean compile).
- Manual: re-read `SHARED_BODY` to confirm step numbering, the README
  carve-out, the `_NN` counter description, and that the Commit & push step
  is fast-forward-only. Did not run `openlog init` against `/tmp` — change
  is template text only.

## Follow-ups

- [ ] Re-run `openlog init` in a clean target repo and eyeball the rendered
      record-workflow prompt once both refinements (apply + record) have
      landed.
- [ ] Consider migrating older same-day records to the `_NN` format if the
      ordering becomes load-bearing; for now they are left as-is.
