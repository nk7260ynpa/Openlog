# feat(apply): drop summary report, add README sync, commit per sub-task in /oplg:apply

- **Date:** 2026-05-02
- **Author:** nk7260ynpa
- **Related commit:** 54def7a

## Summary

Refined the `/oplg:apply` workflow template (`src/core/templates/workflows/apply.ts`)
so that the slash command installed by `openlog init` runs as a per-entry loop:
modify code → sync README → locally verify → commit and push, repeated for each
sub-task. The standalone "Summary report" step is removed; commits and pushes
are the record of progress now.

## Motivation / context

The previous `/oplg:apply` template ended with a summary-bullet step and was
explicitly hands-off about git (no auto-commit, no push). Two pain points
followed:

1. After multi-step actions, callers had to manually trigger `/oplg:record` and
   `git commit` separately, and large actions ended up as one giant commit.
2. README drift was easy: `/oplg:apply` deliberately steered clear of `README.md`,
   so user-facing CLI/API changes silently went out of sync until someone
   noticed.

The user requested three concrete edits in one go:

- Remove the summary-report step (1).
- Add a README-sync step (2).
- Commit and push **per entry** instead of once at the end (3).

## Key changes

- `src/core/templates/workflows/apply.ts`: rewrote `SHARED_BODY`. New step list
  is Interpret → Survey → Modify → Update README → Local verify → Commit &
  push, with steps 3–6 looping per entry. Output-format example removed
  (no summary). Guardrails updated: `git add` / `git commit` / `git push` to
  the existing upstream are now allowed; force-push, `reset --hard`, branch
  deletion, history rewrites still require explicit user instruction. README
  carve-out added so step 4 doesn't violate the "out-of-scope docs" rule.
- `README.md`: rewrote the `/oplg:apply` row in the slash-commands table to
  match the new behavior (per-sub-task commit & push, README sync).
- `dist/core/templates/workflows/apply.{js,d.ts.map,js.map}`: rebuilt via
  `npm run build` so the committed `dist/` matches the source (required for
  `npm i -g github:...` installs that skip `prepare`).

## Impact

- Affects every project that re-runs `openlog init` after this commit: the
  installed `.claude/skills/openlog-apply/SKILL.md` and
  `.claude/commands/oplg/apply.md` (plus the GitHub Copilot prompt) will carry
  the new instructions.
- Existing installations will keep the old behavior until users re-run
  `openlog init`. No automatic migration.
- Behavior change for callers: `/oplg:apply` will now create commits and push
  on the user's behalf (one per sub-task). Previously it would not.
- No breaking change to the CLI surface itself; only the generated workflow
  prompt content changed.

## Verification

- `npm run build`: pass (TypeScript 5.9.3, clean compile).
- Manual: re-read the rewritten `SHARED_BODY` to confirm step numbering, the
  per-entry loop wording, and the guardrail consistency. Did not re-run
  `openlog init` against `/tmp` for this entry — the change is template text
  only and the build is the load-bearing check.

## Follow-ups

- [ ] Re-run `openlog init` in a clean target repo to eyeball the rendered
      `SKILL.md` / `apply.md` once both apply and record refinements have
      landed.
- [ ] Decide whether to bump the package version (currently `0.4.1`) before
      next publish so installers can tell the workflow content shifted.
