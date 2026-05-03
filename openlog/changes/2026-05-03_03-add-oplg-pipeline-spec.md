# docs(openlog): add /oplg:* pipeline contract spec

- **Date:** 2026-05-03
- **Author:** nk7260ynpa
- **Related commit:** uncommitted (will be committed alongside this record
  and the 2d196a7 backfill)

## Summary

Authored the first formal spec under `openlog/specs/`, defining the
contract for the three `/oplg:*` workflows
(`/oplg:explore` → `/oplg:apply` → `/oplg:record`). The spec captures each
stage's role, MUST / MUST NOT lists, and four cross-stage invariants
(surface ownership, mutating-tool gating, one-entry-one-commit-one-record,
handoff-is-data). Until now this contract only lived inline inside each
workflow's template body.

## Motivation / context

`/oplg:explore` was added in commit `039993e` and the follow-up after
`/oplg:record` flagged that the three-stage pipeline contract was scattered
across template bodies and `README.md` — there was no single document
describing how the workflows fit together or which surfaces each one owns.
Without that, future template edits could silently drift (e.g. letting
`/oplg:record` touch `README.md`, or letting `/oplg:explore` run a build)
and there would be no canonical reference to check against. The spec also
gives `openlog/specs/` its first occupant, which had been empty since
`openlog init` shipped.

## Key changes

- `openlog/specs/oplg-pipeline-contract.md` (new): full spec covering
  - Stage 1 (`/oplg:explore`): role, MUST, MUST NOT, allowed read-only
    commands, handoff format.
  - Stage 2 (`/oplg:apply`): role, MUST, MUST NOT, one-entry-one-commit
    rule, README ownership.
  - Stage 3 (`/oplg:record`): role, MUST, MUST NOT, filename pattern,
    internal-doc sync rules.
  - Cross-stage invariants and implementation pointers
    (`src/core/templates/workflows/*.ts`,
    `src/core/shared/skill-generation.ts`, etc.).
  - A `Change history` section so future amendments are traceable.

## Impact

- Documentation-only; no code, build, or runtime change.
- Future edits to the three workflow templates can be reviewed against
  this spec for divergence.
- `openlog/specs/` is no longer empty; existing references to it (in
  `README.md`, in `openlog/project.md`, and in this repo's own CLAUDE.md)
  now point to a real document.

## Verification

- Authored content from the actual workflow template bodies
  (`src/core/templates/workflows/{explore,apply,record}.ts`) and from the
  per-stage rules already written into `README.md` and `CLAUDE.md`. Did
  not invent any new constraint.
- No build needed; pure docs.

## Follow-ups

- [ ] If a fourth `/oplg:*` workflow is added, extend this spec with its
      stage definition and update the cross-stage invariants section.
- [ ] Consider adding a CI / pre-commit check that grep-asserts the
      MUST NOT lists against the corresponding template body — e.g. the
      `/oplg:explore` template must not contain `git commit` outside its
      `Hard guardrails` section.
