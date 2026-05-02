# Fix git-URL global install failure and improve build.js error output

- **Date:** 2026-05-02
- **Author:** nk7260ynpa
- **Related commit:** Not yet committed (will ship as v0.3.4 together with this record)

## Summary

Move `typescript` and `@types/node` from `devDependencies` to `dependencies` to fix a build failure when users run `npm i -g github:nk7260ynpa/Openlog` on macOS / Node 25 / npm 11, where the `prepare` step could not find `tsc`. Also add `error.stack` printing to the catch block in `build.js` so future build failures show the real error instead of a bare `❌ Build failed!` line. Bump the package version from `0.3.3` to `0.3.4`.

## Motivation / context

Reproducing the user's failure chain:

1. The first `npm i -g github:nk7260ynpa/Openlog` failed with `ENOTDIR: rename`, because `~/.npm-global/lib/node_modules/@chen/openlog` was a symlink left over from a previous `npm link` and npm tried to "retire" it as if it were a directory.
2. After unlinking the symlink and reinstalling, the `prepare` script (`node build.js`) failed with only `❌ Build failed!`, with no further detail.
3. A local `git clone` + `npm install` builds fine. The difference is that during `npm i -g <git-url>`, even though the inner npm command carries `--include=dev`, devDependencies are not fully installed into the prepare environment, so `require.resolve('typescript/bin/tsc')` fails.

Since this package is currently distributed only via git URL (CLAUDE.md notes the `@chen` scope is not yet published to npm), `prepare` must always run `tsc` on the user's machine. The lowest-risk fix is to promote the build-time essentials (`typescript` and `@types/node`) into regular `dependencies` so that the prepare environment is guaranteed to find them.

The original `build.js` catch swallowed the error and printed only a one-liner. If the build ever truly fails (TypeScript compile error, broken tsconfig, etc.) developers would have nothing to go on, so the stack is now printed alongside the failure banner.

## Key changes

- `package.json`:
  - Remove the `devDependencies` block.
  - Add `typescript ^5.9.3` and `@types/node ^24.2.0` into `dependencies` in alphabetical order.
  - Bump version `0.3.3` → `0.3.4`.
- `build.js:28`: add `console.error(error.stack || error.message || String(error))` inside the catch block so build failures expose their underlying cause.

## Impact

- **User-facing**: `npm i -g github:nk7260ynpa/Openlog` now passes the prepare phase; local `npm i -g .` is unaffected.
- **Footprint**: a global install pulls an extra typescript (~70MB) and `@types/node`. Acceptable for a CLI; if the package is later published to npm with prebuilt `dist/` baked into the tarball, these can move back to `devDependencies`.
- **Behavior**: CLI runtime behavior is unchanged; only the install-time build pipeline is touched.
- **No breaking change.**

## Verification

- `npm run build`: pass (tsc 5.9.3, dist rebuilt cleanly).
- `package.json` shape check: `dependencies` holds 6 packages (including `typescript` and `@types/node`); `devDependencies` is empty.
- Working tree is clean, only the 3 expected files changed (`package.json`, `build.js`, plus this record).
- Real-world `npm i -g github:...` not yet verified (the tag needs to be pushed first; the user will verify after commit + push).

## Follow-ups

- [ ] After pushing, run `npm i -g github:nk7260ynpa/Openlog#v0.3.4` for real to confirm prepare no longer fails.
- [ ] If the package is later published to npm (with `dist/` shipped in the tarball), move `typescript` and `@types/node` back to `devDependencies` to shrink the user-facing install.
- [ ] Consider adding a "git-URL install notes" paragraph to the README explaining that the prepare flow depends on typescript.
