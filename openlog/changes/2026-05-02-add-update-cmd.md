# Add `openlog update` to auto-update the CLI from GitHub

- **Date:** 2026-05-02
- **Author:** nk7260ynpa
- **Related commit:** Not yet committed (will ship as v0.4.0 together with this record)

## Summary

Add a new top-level command `openlog update` that auto-updates the
globally-installed CLI to the latest version on GitHub. The command
follows the README's recommended install path — clone the repo into a
fresh temp directory, then `npm i -g <tmp-clone>` — because
`npm i -g github:...` is unreliable on npm 11 (documented in the
v0.3.5 record). Bumps the version `0.3.5` → `0.4.0` (new feature →
minor).

## Motivation / context

Until v0.3.5 the only way to upgrade `openlog` was for the user to
manually `git pull` inside their clone and re-run
`npm i -g <path>` (or `npm pack` + install the tarball). The git-URL
install path is broken on npm 11, so users could not rely on
`npm update -g @chen/openlog`-style commands either. This left every
upgrade as a multi-step manual chore.

`openlog update` packages the recommended install path behind a single
command. It also supports a `--check` mode for "is there a newer
version?" without side effects, and `--ref <tag>` for installing
specific releases (e.g. `--ref v0.4.0`).

## Key changes

- `src/core/update.ts` (new, ~210 lines):
  - `UpdateCommand` class with options `check`, `force`, `ref`,
    `source`, `npm`, `repo`.
  - Resolves the latest version by fetching
    `https://raw.githubusercontent.com/nk7260ynpa/Openlog/main/package.json`
    using Node's built-in `fetch` (Node ≥ 20.19.0). When `--source` is
    provided, reads the `package.json` from that local path instead.
  - Compares versions with a small in-house `compareVersions` helper
    (avoids pulling in a `semver` dependency for what is essentially a
    `1.2.3` → `1.2.4` comparison).
  - Performs the update by `git clone --depth 1 --branch <ref>` into a
    `mkdtemp` directory, then `<npm-bin> i -g <clone>`. Always cleans up
    the temp directory in `finally` (unless `--source` was used, in
    which case the user-supplied path is left alone).
  - `runCommand` helper wraps `child_process.spawn` with quiet stdio
    capture; on non-zero exit, the last 10 lines of stderr/stdout are
    appended to the thrown error so failures stay diagnosable.
- `src/cli/index.ts`:
  - Register the new `update` command with all six flags (`--check`,
    `--force`, `--ref`, `--source`, `--npm`, `--repo`). Lazy-imports
    `UpdateCommand` to keep CLI startup fast (matches the existing
    `init` pattern).
- `README.md`:
  - Top blurb: list `openlog update` alongside the other implemented
    commands.
  - New section `### Update to the latest version: openlog update` with
    usage examples and a flag table.
  - Roadmap: mark `openlog update` as completed.
- `package.json`:
  - Bump version `0.3.5` → `0.4.0`.
- `dist/`: rebuilt to pick up `src/cli/index.ts` and the new
  `src/core/update.{js,d.ts,…}` (project policy: `dist/` is checked in
  since v0.3.5).

## Impact

- **User-facing**:
  - New command `openlog update`. Existing commands (`openlog --version`,
    `openlog init`) are unchanged.
  - `openlog update --check` is a safe, side-effect-free probe that hits
    GitHub raw and prints `current vs latest`.
  - `openlog update` (no flags) clones to `$TMPDIR/openlog-update-XXXX/openlog`
    and runs `npm i -g <clone>` — same effect as the manual install path
    documented in the README.
- **Developer-facing**:
  - No changes to the build flow or to `init`. The new file
    `src/core/update.ts` is self-contained and only imports from
    `chalk`, `ora`, and Node built-ins.
  - The `prepare` skip behavior (added in v0.3.5) still applies — `dist/`
    is shipped in the commit, so end-user installs do not need `tsc`.
- **No breaking change**: nothing existing was renamed or removed.
- **Network dependency**: `openlog update` (without `--source`) requires
  internet access. With `--source <path>`, it works fully offline.

## Verification

- `npm run build`: passes (tsc 5.9.3 clean).
- `node bin/openlog.js --help`: lists the new `update` subcommand.
- `node bin/openlog.js update --help`: lists all six flags with
  descriptions.
- `node bin/openlog.js update --check` (network): correctly reaches
  `raw.githubusercontent.com`, parses the remote `package.json`, and
  reports `Latest version: 0.3.5 / ✔ Already at the latest version`
  while the local version was still `0.3.5`. After bumping to `0.4.0`
  locally the same command reports `Latest version: 0.3.5` and prints
  no upgrade prompt (because the local version is now ahead — expected).
- A real `openlog update` (without `--check`) was **not** executed during
  development to avoid mutating the global npm prefix on the dev
  machine. The clone + `npm i -g` flow exactly mirrors the documented
  install path, which is verified by the v0.3.5 work.

## Follow-ups

- [ ] After publishing the v0.4.0 tag, run `openlog update --check` on
      a machine still on v0.3.5 to confirm the end-to-end "newer version
      detected → install" flow.
- [ ] Consider adding a periodic-update reminder (similar to npm's
      "package update available" banner) once telemetry / opt-in is
      thought through.
- [ ] If `@chen/openlog` is eventually published to the npm registry,
      add an `--source npm` mode (or auto-detect) that runs
      `npm i -g @chen/openlog@latest` instead of cloning.
- [ ] If `--ref` becomes commonly used to pin versions, expose
      `openlog update --list` to query GitHub releases / tags.
