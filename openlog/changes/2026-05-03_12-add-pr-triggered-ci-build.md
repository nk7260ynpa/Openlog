# ci: Add PR-triggered build-only CI check

- **Date:** 2026-05-03
- **Author:** nk7260ynpa
- **Related commit:** 06dd08d

## Summary

Added a `pull_request` trigger (targeting the `main` branch) to `.github/workflows/ci.yml`, with a `build` job that only runs `npm ci` + `npm run build` (Node 20/22 matrix). The existing tag push trigger (build + test) is preserved with an `if: github.event_name == 'push'` condition.

## Motivation / context

The follow-up in `2026-05-03_08-add-github-actions-ci.md` suggested "Consider adding a PR-triggered lighter check (build-only, no test) if the team wants pre-merge validation". This change implements that suggestion, giving PRs a basic type-compilation check before merging while avoiding running the full test suite on every PR.

## Key changes

- `.github/workflows/ci.yml`: Added `pull_request` trigger and `build` job; added `if: github.event_name == 'push'` condition to the existing `build-and-test` job.
- `README.md`: Updated CI description from "runs on tag push" to "build on PR, build + test on tag push".

## Impact

- PRs opened or updated will automatically trigger a compile check, providing a pre-merge quality gate.
- Existing tag push CI behavior is unchanged.

## Verification

- YAML syntax manually verified.
- `npm run build`: compiled successfully.

## Follow-ups

- [ ] None
