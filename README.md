# Openlog

[![CI](https://github.com/nk7260ynpa/Openlog/actions/workflows/ci.yml/badge.svg)](https://github.com/nk7260ynpa/Openlog/actions/workflows/ci.yml)

AI-native logging companion CLI, built on the same TypeScript + Node.js stack as [OpenSpec](https://github.com/Fission-AI/OpenSpec).

> The current release implements `openlog --version`, `openlog init`, and `openlog update`. More commands will follow.

## Requirements

- **Node.js ≥ 20.19.0** (matches OpenSpec)
- Recommended package manager: `pnpm` (also compatible with `npm` / `yarn` / `bun`)

## Project layout

```text
Openlog/
├── bin/
│   └── openlog.js                          # CLI entry point, requires dist/cli/index.js
├── src/
│   ├── index.ts                            # Library entry point
│   ├── cli/
│   │   └── index.ts                        # commander definitions (--version, init, update)
│   └── core/
│       ├── config.ts                       # AI tool list and constants
│       ├── init.ts                         # InitCommand: create openlog/ + skills/commands
│       ├── update.ts                       # UpdateCommand: re-install latest source globally
│       ├── templates/                      # Skill / slash command bodies (tool-neutral)
│       │   ├── types.ts
│       │   ├── workflows/apply.ts          # /oplg:apply template
│       │   ├── workflows/record.ts         # /oplg:record template
│       │   ├── workflows/explore.ts        # /oplg:explore template
│       │   └── workflows/verify.ts         # /oplg:verify template
│       ├── command-generation/             # Convert templates into per-tool file formats
│       │   ├── generator.ts                # Orchestrates template → file generation
│       │   ├── types.ts                    # Adapter interface definitions
│       │   ├── registry.ts                 # CommandAdapterRegistry: lookup adapter by toolId
│       │   ├── adapters/claude.ts          # → .claude/commands/oplg/<id>.md
│       │   └── adapters/github-copilot.ts  # → .github/prompts/oplg-<id>.prompt.md
│       └── shared/
│           ├── skill-generation.ts         # SkillTemplate aggregation + frontmatter generation
│           └── tool-detection.ts           # Detect installed AI tools in target project
├── test/                                   # Unit tests (Vitest)
│   └── core/                               # Mirrors src/core/ structure (9 test files)
├── build.js                                # Drives the TypeScript compiler into dist/
├── vitest.config.ts                        # Vitest configuration (V8 coverage)
├── tsconfig.json                           # TS config (ES2022 / NodeNext / strict)
├── package.json                            # ESM, bin entry, scripts
├── .gitignore
└── README.md
```

### Tech choices (mirrors OpenSpec)

| Area | Choice |
|------|--------|
| Primary language | TypeScript (compiled to ES2022 + NodeNext ESM) |
| Runtime | Node.js ≥ 20.19.0 |
| CLI framework | [`commander`](https://www.npmjs.com/package/commander) |
| Module format | ESM (`"type": "module"`) |
| Build | `build.js` invokes the local `tsc`, output to `dist/` |
| Test | [Vitest](https://vitest.dev/) |
| CI | GitHub Actions — build on PR, build + test on tag push (`v*`) |
| Bin entry | `bin/openlog.js` → `dist/cli/index.js` |

## Install

The compiled `dist/` is checked in (since v0.3.5), so end users do not
need a TypeScript toolchain to install.

### From a local clone (recommended)

```bash
git clone https://github.com/nk7260ynpa/Openlog /tmp/openlog
npm i -g /tmp/openlog
openlog --version
```

This is the most reliable install path. To upgrade later, `git pull`
inside the clone and re-run `npm i -g /tmp/openlog`.

### From a tarball

```bash
git clone https://github.com/nk7260ynpa/Openlog /tmp/openlog
cd /tmp/openlog && npm pack
npm i -g /tmp/openlog/chen-openlog-*.tgz
```

### From source (development)

```bash
git clone https://github.com/nk7260ynpa/Openlog
cd Openlog
pnpm install        # install devDependencies
pnpm run build      # rebuild dist/
pnpm link --global  # expose `openlog` from this clone
```

### Known issue: `npm i -g github:...` is broken on npm 11

`npm i -g github:nk7260ynpa/Openlog` and `npm i -g
git+https://github.com/nk7260ynpa/Openlog.git` are NOT reliable on npm
11.12.x with Node 25 — npm leaves the global install directory with
only a partial set of `.d.ts` files (no `bin/`, no compiled `.js`),
which is an npm bug, not an Openlog problem. Use one of the methods
above instead. If you have already attempted a git-URL install and
have a stale symlink at
`~/.npm-global/lib/node_modules/@chen/openlog`, remove it with
`unlink` before re-installing.

### After publishing to npm

> **Not yet published.** `@chen/openlog` is not on npm yet. The
> instructions below will apply once the package is published.

```bash
npm install -g @chen/openlog@latest
# or
pnpm add -g @chen/openlog@latest
```

## Usage

### Show version

```bash
openlog --version   # or -v
```

### Initialize a project: `openlog init`

Create the Openlog working directory and AI-tool scaffolding at the given path (defaults to the current directory).

```bash
# Interactively pick AI tools
openlog init

# Non-interactive (use all / none / a comma-separated list)
openlog init --tools claude
openlog init ./my-project --tools claude,github-copilot
openlog init --tools all

# Re-run after a CLI upgrade — openlog/ structure and AI-tool files
# are diff-synced (created / updated / unchanged) without --force.
openlog init

# --force only regenerates openlog/project.md (structure and tool
# files are always synced idempotently).
openlog init --force
```

The result looks like:

```text
my-project/
├── openlog/
│   ├── specs/                       # Spec documents
│   ├── changes/                     # Change records
│   └── project.md                   # Project overview (auto-generated)
├── .claude/                         # When Claude Code is selected
│   ├── skills/
│   │   ├── openlog-apply/SKILL.md   # Skill for /oplg:apply
│   │   ├── openlog-record/SKILL.md  # Skill for /oplg:record
│   │   ├── openlog-explore/SKILL.md # Skill for /oplg:explore
│   │   └── openlog-verify/SKILL.md  # Skill for /oplg:verify
│   └── commands/oplg/
│       ├── apply.md                 # → /oplg:apply
│       ├── record.md                # → /oplg:record
│       ├── explore.md               # → /oplg:explore
│       └── verify.md                # → /oplg:verify
└── .github/                         # When GitHub Copilot is selected
    └── prompts/
        ├── oplg-apply.prompt.md
        ├── oplg-record.prompt.md
        ├── oplg-explore.prompt.md
        └── oplg-verify.prompt.md
```

### Supported AI tools

| Tool | `--tools` value | Created directory | Skills | Slash commands |
|------|-----------------|-------------------|--------|----------------|
| Claude Code | `claude` | `.claude/` | ✅ | ✅ `/oplg:apply`, `/oplg:record`, `/oplg:explore`, `/oplg:verify` |
| GitHub Copilot | `github-copilot` | `.github/` | ➖ | ✅ `oplg-*.prompt.md` |

### Update to the latest version: `openlog update`

Auto-update the globally-installed `openlog` CLI by cloning the latest source
and reinstalling globally. This follows the recommended install path (clone
+ `npm i -g <path>`) because `npm i -g github:...` is unreliable on npm 11.

```bash
# Update to the latest version on the main branch
openlog update

# Just check whether a newer version is available, without installing
openlog update --check

# Install a specific tag, branch, or commit
openlog update --ref v0.4.0

# Reinstall from an existing local clone (skip the network clone)
openlog update --source /tmp/openlog

# Reinstall even if the local version already matches the latest
openlog update --force

# Use a different package manager for the global install
openlog update --npm pnpm
```

Available flags:

| Flag | Purpose |
|------|---------|
| `--check` | Print "current vs latest" only; do not install. |
| `--force` | Reinstall even when the version is already up to date. |
| `--ref <ref>` | Git ref (branch / tag / commit) to install from. Defaults to `main`. |
| `--source <path>` | Reinstall from an existing local clone instead of cloning. |
| `--npm <bin>` | npm-compatible binary used for the global install. Defaults to `npm`. |
| `--repo <url>` | Override the git remote URL. Defaults to the public Openlog repo. |

### Slash commands

`openlog init` installs the following slash commands for the selected AI tools:

| Command | Purpose |
|---------|---------|
| `/oplg:explore <topic>` | **Read-only** investigation that maps out the relevant code/docs and returns a structured report (summary, key files with `file:line` citations, gaps, suggested next actions, and a paste-ready handoff line for `/oplg:apply`). Does **not** modify any file, run builds, or commit; any code change must be done via `/oplg:apply` afterwards. |
| `/oplg:apply <action>` | Modify code based on the user's described action: plan, edit, sync `README.md` when user-facing behavior changes, locally verify, then commit and push **per sub-task** (one entry → one commit → one push). The `openlog/` directory is **read-only** for this command — recording goes through `/oplg:record`. |
| `/oplg:record` | Find every entry from the current session that is **not yet recorded** under `openlog/changes/` and write one record file per entry. **Title is auto-derived from the actual diff** (no manual title needed); filenames use `<YYYY-MM-DD>_<NN>-<slug>.md` where `<NN>` is a per-day completion counter (`_01`, `_02`, ...). This command may **only write to the `openlog/` directory** — `openlog/project.md` and `openlog/specs/` are updated when applicable, but anything outside `openlog/` (`README.md`, `CLAUDE.md`, source code, ...) is owned by `/oplg:apply` and must not be touched here. After writing records, the workflow commits and pushes. |
| `/oplg:verify` | **Read-only** code review of changes made by `/oplg:apply` in the current session. Identifies the session's commits, reviews correctness, security, code quality, type safety, error handling, and README consistency, then outputs a structured report with a PASS or NEEDS_FIXES verdict. Does **not** modify files, commit, or push. |

## Development commands

| Command | Purpose |
|---------|---------|
| `npm run build` | One-shot compile (clean `dist/`, then `tsc`) |
| `npm test` | Run unit tests via [Vitest](https://vitest.dev/) |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with V8 coverage report |
| `npm run dev` | TypeScript watch mode |
| `npm run dev:cli` | Compile and run `bin/openlog.js` |

## Roadmap

- [x] `openlog --version`
- [x] `openlog init`: create `openlog/` and pick AI-tool scaffolding
- [x] Install `/oplg:apply`, `/oplg:record`, `/oplg:explore`, and `/oplg:verify` commands / skills under `.claude/` and `.github/`
- [x] `openlog update`: auto-update the globally-installed CLI from GitHub
- [ ] `openlog validate`: validate file structure and format under `openlog/`

## License

MIT
