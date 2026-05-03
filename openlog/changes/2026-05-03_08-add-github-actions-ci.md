# ci: Add GitHub Actions pipeline triggered on tag push

- **Date:** 2026-05-03
- **Author:** nk7260ynpa
- **Related commit:** fe61fc7

## Summary

Created a GitHub Actions CI workflow (`.github/workflows/ci.yml`) that
runs build and test on every `v*` tag push. The workflow uses a Node.js
20/22 matrix to validate compatibility across supported runtimes.

## Motivation / context

The project lacked any CI pipeline. With unit tests now in place, a CI
workflow ensures every tagged release passes build and test before it
reaches users. The tag-only trigger avoids unnecessary runs on every push
while still gating release quality.

## Key changes

- `.github/workflows/ci.yml`: new workflow file.
  - Trigger: `on.push.tags: ['v*']`.
  - Matrix: Node 20, 22 on `ubuntu-latest`.
  - Steps: checkout → setup-node → `npm ci` → `npm run build` →
    `npm test`.
- `README.md`: added CI badge, added Vitest and CI rows to the tech
  choices table.

## Impact

- No impact on existing code or behavior.
- CI runs are billed only on tag pushes, not on every commit.
- Node 20 and 22 are both validated.

## Verification

- YAML syntax checked manually.
- The pipeline will execute on the next `v*` tag push.

## Follow-ups

- [ ] Consider adding a PR-triggered lighter check (build-only, no test)
  if the team wants pre-merge validation.
