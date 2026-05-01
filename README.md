# Openlog

AI-native logging companion CLI, built on the same TypeScript + Node.js stack as [OpenSpec](https://github.com/Fission-AI/OpenSpec).

> The current release implements `openlog --version` and `openlog init`. More commands will follow.

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

### From source (development)

```bash
cd /Users/chen/AI/Openlog
pnpm install      # install dependencies
pnpm run build    # compile to dist/
```

### Global link (during development)

```bash
pnpm link --global
openlog --version
```

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
- [ ] Spec / change management subcommands (list, validate, archive, ...)

## License

MIT
