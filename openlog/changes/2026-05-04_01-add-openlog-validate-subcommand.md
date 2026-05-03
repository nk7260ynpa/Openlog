# feat(cli): add `openlog validate` subcommand

- **Date:** 2026-05-04
- **Author:** nk7260ynpa
- **Related commit:** eebcd7e, fcc2756

## Summary

Added a new `openlog validate` CLI subcommand that checks the `openlog/`
directory for structural and format consistency. It validates that
`project.md` exists and starts with a heading, that `changes/` filenames
follow the `<YYYY-MM-DD>(_<NN>)-<slug>.md` pattern, that each change record
includes required header fields (`**Date:**`, `**Author:**`), and that spec
files include a `**Status:**` field. Exit code is 0 on pass, 1 on failure.

## Motivation / context

The README roadmap previously listed a broad "Spec / change management
subcommands (list, validate, archive, ...)" item. Since only `validate` is
concretely planned, the roadmap was narrowed to just that single item, and
then the subcommand was implemented. This enables users (and CI) to verify
that their `openlog/` directory maintains format consistency as records
accumulate over time.

## Key changes

- `src/core/validate.ts`: new `ValidateCommand` class with checks for
  `project.md`, `changes/` filenames and headers, and `specs/` headers.
- `src/cli/index.ts`: register the `validate [path]` subcommand in
  commander.
- `README.md`: updated intro quote, project layout tree, added a
  "Validate the openlog directory" section with usage and checks table,
  and marked the roadmap item as complete.
- `dist/`: rebuilt artifacts.

## Impact

- New user-facing CLI command: `openlog validate [path]`.
- No breaking changes to existing commands.
- The regex allows `.` in slugs (for version numbers like `0.5.8`).

## Verification

- `pnpm run build` — TypeScript compiled cleanly (tsc 5.9.3).
- `node bin/openlog.js validate` — correctly identified 1 pre-existing
  format issue in `openlog/changes/2026-05-02_03-…` (first line is not a
  `# ` heading).
- `node bin/openlog.js validate /tmp` — correctly reported missing
  `openlog/` directory with exit code 1.

## Follow-ups

- [ ] Add unit tests (`test/core/validate.test.ts`) to match the coverage
      pattern of other commands.
- [ ] Consider allowing `_` in slug regex for future-proofing.
