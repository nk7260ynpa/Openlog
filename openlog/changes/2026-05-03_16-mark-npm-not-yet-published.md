# docs: Note that npm package is not yet published

- **Date:** 2026-05-03
- **Author:** nk7260ynpa
- **Related commit:** 34ba4d4

## Summary

Added a blockquote before the "After publishing to npm" section in README.md stating that `@nk7260ynpa/openlog` is not yet published to npm registry, preventing users from following the instructions and encountering a 404 error.

## Motivation / context

An `/oplg:explore` investigation found that `npm view @nk7260ynpa/openlog` returned 404, but README already listed `npm install -g @nk7260ynpa/openlog@latest` instructions without any "not yet published" notice.

## Key changes

- `README.md`: Added a blockquote below the "After publishing to npm" heading, with bold "Not yet published" note explaining when the instructions will apply.

## Impact

- Documentation-only change, no impact on any functionality or API.

## Verification

- `npm run build` compiled successfully.

## Follow-ups

- [ ] Remove this blockquote notice after officially publishing to npm.
