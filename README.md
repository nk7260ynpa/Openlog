# Openlog

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
│   │   └── index.ts                        # commander definitions (--version, init)
│   └── core/
│       ├── config.ts                       # AI tool list and constants
│       ├── init.ts                         # InitCommand: create openlog/ + skills/commands
│       ├── templates/                      # Skill / slash command bodies (tool-neutral)
│       │   ├── types.ts
│       │   ├── workflows/apply.ts          # /oplg:apply template
│       │   └── workflows/record.ts         # /oplg:record template
│       ├── command-generation/             # Convert templates into per-tool file formats
│       │   ├── adapters/claude.ts          # → .claude/commands/oplg/<id>.md
│       │   └── adapters/github-copilot.ts  # → .github/prompts/oplg-<id>.prompt.md
│       └── shared/                         # SkillTemplate aggregation + frontmatter generation
├── build.js                                # Drives the TypeScript compiler into dist/
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

# Force re-initialization when openlog/ already exists
openlog init --force
```

The result looks like:

```text
my-project/
├── openlog/
│   ├── specs/                       # Spec documents
│   ├── changes/                     # In-flight changes
│   │   └── archive/                 # Completed and archived
│   └── project.md                   # Project overview (auto-generated)
├── .claude/                         # When Claude Code is selected
│   ├── skills/
│   │   ├── openlog-apply/SKILL.md   # Skill for /oplg:apply
│   │   └── openlog-record/SKILL.md  # Skill for /oplg:record
│   └── commands/oplg/
│       ├── apply.md                 # → /oplg:apply
│       └── record.md                # → /oplg:record
└── .github/                         # When GitHub Copilot is selected
    └── prompts/
        ├── oplg-apply.prompt.md
        └── oplg-record.prompt.md
```

### Supported AI tools

| Tool | `--tools` value | Created directory | Skills | Slash commands |
|------|-----------------|-------------------|--------|----------------|
| Claude Code | `claude` | `.claude/` | ✅ | ✅ `/oplg:apply`, `/oplg:record` |
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
| `/oplg:apply <action>` | Modify code based on the user's described action: plan, edit, locally verify, summarize. |
| `/oplg:record` | Write the most recent changes as a record under `openlog/changes/`. **Title is auto-derived from the actual diff** (no manual title needed) and internal docs such as `README.md`, `openlog/project.md`, and `openlog/specs/` are updated when applicable. |

## Development commands

| Command | Purpose |
|---------|---------|
| `pnpm run build` | One-shot compile (clean `dist/`, then `tsc`) |
| `pnpm run dev` | TypeScript watch mode |
| `pnpm run dev:cli` | Compile and run `bin/openlog.js` |

## Roadmap

- [x] `openlog --version`
- [x] `openlog init`: create `openlog/` and pick AI-tool scaffolding
- [x] Install `/oplg:apply` and `/oplg:record` commands / skills under `.claude/` and `.github/`
- [x] `openlog update`: auto-update the globally-installed CLI from GitHub
- [ ] Spec / change management subcommands (list, validate, archive, ...)

## License

MIT
