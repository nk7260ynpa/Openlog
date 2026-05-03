# docs: Update README Project layout tree

- **Date:** 2026-05-03
- **Author:** nk7260ynpa
- **Related commit:** d1d8576

## Summary

The README.md Project layout tree previously listed only representative files, omitting several actually existing modules. This update adds `generator.ts`, `types.ts`, `registry.ts` under `command-generation/`, `skill-generation.ts` and `tool-detection.ts` under `shared/`, and the `test/` directory along with `vitest.config.ts`.

## Motivation / context

An `/oplg:explore` investigation found the tree was inconsistent with the actual file structure, potentially misleading new readers — especially since the Development commands section listed `npm test` and similar commands, but the tree showed no `test/` directory at all.

## Key changes

- `README.md`: Added 9 lines to the Project layout tree, covering `command-generation/` internal modules, `shared/` subfiles, `test/` directory, and `vitest.config.ts`.

## Impact

- Documentation-only change, no impact on any functionality or API.

## Verification

- `npm run build` compiled successfully.
- Each newly added path in the tree was confirmed to actually exist on disk via `/oplg:verify`.

## Follow-ups

- [ ] The tree comment for `test/core/` says "9 test files" — this number needs to be updated when tests are added in the future.
