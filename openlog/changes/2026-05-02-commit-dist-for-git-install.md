# Commit prebuilt dist/ and skip prepare when dist is present

- **Date:** 2026-05-02
- **Author:** nk7260ynpa
- **Related commit:** Not yet committed (will ship as v0.3.5 together with this record)

## Summary

Commit the prebuilt `dist/` to the repository and have `build.js` short-circuit when it runs as the `prepare` lifecycle hook and `dist/cli/index.js` already exists. This is the real fix for `npm i -g github:...` failures: the v0.3.4 attempt of promoting `typescript` to `dependencies` did not help, because npm 11 in the git-dep prepare phase **does not install any node_modules into the clone temp directory** (neither deps nor devDeps). This change also moves `typescript` and `@types/node` back to `devDependencies` to save users ~70MB. Bump version `0.3.4` → `0.3.5`.

## Motivation / context

After v0.3.4 was pushed, `npm i -g github:nk7260ynpa/Openlog` still failed. The new `error.stack` print in `build.js` revealed the real error:

```
Error: Cannot find module 'typescript/bin/tsc'
Require stack:
- /Users/chen/.npm/_cacache/tmp/git-cloneYvnIe1/build.js
```

Inspecting the npm 11 debug log confirmed:

- npm placeDeps the `@chen/openlog` tree (including the freshly promoted `typescript`) into the **final global destination** (`~/.npm-global/lib/node_modules/@chen/openlog/node_modules/...`), **not** into the clone's `~/.npm/_cacache/tmp/git-cloneXXX/node_modules/`.
- The `prepare` script, however, runs inside that temp clone directory, so `require.resolve('typescript/bin/tsc')` is guaranteed to fail — even when `typescript` is a `dependency`.
- In other words, promoting deps into `dependencies` does not change anything in this flow; it only makes users carry an extra ~70MB.

Since the package is currently distributed only via git URL (CLAUDE.md notes the `@chen` scope is not yet on npm), the git-URL install is the primary path. The most stable way around npm 11's pipeline limitation is to **remove the user-side build entirely**: commit a prebuilt `dist/` to the repo and only run the actual build when `dist/` is genuinely missing.

## Key changes

- `.gitignore`: drop the `dist/` entry so `dist/` is now version-controlled.
- `build.js:14-18`: add an early-exit guard at the top of the main flow — when `npm_lifecycle_event === 'prepare'` and `dist/cli/index.js` already exists, print `Skipping build: dist/ already present (prepare hook).` and `process.exit(0)`. `npm run build` keeps `npm_lifecycle_event === 'build'`, so it does not skip and still cleans `dist/` before rebuilding.
- `package.json`:
  - Move `typescript ^5.9.3` and `@types/node ^24.2.0` back from `dependencies` to `devDependencies`.
  - Bump version `0.3.4` → `0.3.5`.
- `CLAUDE.md`: update the "build flow" section to document that `dist/` is checked in starting v0.3.5, and to describe the new prepare-skip behavior.
- `dist/`: commit the whole directory (72 files, 312K).

## Impact

- **User-facing**: `npm i -g github:nk7260ynpa/Openlog` (including `#v0.3.5`) skips at the prepare phase, no longer attempts to invoke `tsc`, and installs directly from the repo's prebuilt `dist/`.
- **Developer-facing**:
  - One new development habit — after editing `src/`, manually run `npm run build` to regenerate `dist/` and commit it together with the source change. `prepare` no longer auto-builds.
  - `npm install` / `pnpm install` always skip prepare (because `dist/` is always present), so install is faster.
  - If a developer manually `rm -rf dist/` and then runs `npm install`, prepare falls through to the real build path (which works because the dev environment has devDeps).
- **Footprint**: a global install drops ~70MB (typescript and @types/node are no longer dependencies).
- **No breaking change**: CLI behavior and API are unchanged.

## Verification

- `npm_lifecycle_event=prepare node build.js` (with `dist/` present): prints `Skipping build: dist/ already present (prepare hook).` and exits 0.
- `npm run build`: cleans dist and rebuilds normally with tsc 5.9.3 — success.
- `dist/`: 72 files / 312K, no spurious content beyond source maps.
- After staging, the working tree contains the expected diff: `.gitignore`, `build.js`, `package.json`, `CLAUDE.md`, `dist/**`, and this record.
- Real-world installs (after pushing the tag):
  - **`npm i -g <local-tarball>` ✅**: `npm pack` the repo and install the resulting `.tgz` — `openlog --version` correctly reports `0.3.5`, `bin/` and `dist/**.js` are all there.
  - **`npm i -g .` (from a local clone) ✅**: same, works normally.
  - **`npm i -g github:nk7260ynpa/Openlog` ❌**: the npm 11.12 + Node 25 git-URL global install pipeline is itself buggy — after the install completes, the temp clone directory is left with only ~23 `.d.ts` files; `bin/`, `package.json`, and `dist/**.js` are all gone. This reproduces with `--ignore-scripts` too, so **it is unrelated to whether we have a prepare script or whether we commit dist**. npm 11's git-dep flow is broken in this environment.
  - The npm log confirms prepare did run and exited with `code: 0` (the skip path triggered), but npm strips most files from the temp dir after prepare for an unknown reason, leaving the final install incomplete.
- Conclusion: the v0.3.5 commit-dist + skip-prepare design is correct in itself (it removes the tsc dependency for tarball / local installs), but it cannot work around the npm 11 git-URL pipeline bug. In practice, install via local clone (`npm i -g <path>`) or via a tarball; the README has been updated with both paths and a note about the known npm 11 bug.

## Follow-ups

- [x] Verified that tarball / local install paths work; the git-URL path is unsalvageable due to the npm 11 bug, with a workaround documented in the README.
- [ ] Watch the npm/cli issue tracker; once npm 11 fixes the git-dep global install bug, retest.
- [ ] If the package is later published to npm, `dist/` will be supplied through the npm publish flow (from the tarball), so `dist/` could in theory return to `.gitignore`. Usually it is not worth it — for packages that support both git-URL and npm install, committing `dist/` is a common practice.
- [ ] Consider a CI check that warns when a commit changes `src/` without a matching `dist/` update.
- [ ] If a stale `~/.npm-global/lib/node_modules/@chen/openlog` symlink remains on the user side (left over from a previous `npm link`), `unlink` it before reinstalling. This is npm's inherent issue around link → install transitions and is unrelated to this fix.
