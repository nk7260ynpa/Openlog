# feat(workflows): add /oplg:explore read-only investigation command

- **Date:** 2026-05-03
- **Author:** nk7260ynpa
- **Related commit:** 039993e

## Summary

Added a third `/oplg:*` workflow, `/oplg:explore`, positioned as a read-only
codebase investigation tool. It surveys the repo and produces a structured
report — summary, key files with `file:line` citations, gaps / open
questions, suggested next actions, and a paste-ready `/oplg:apply` handoff
block — but it does not modify any file, build, commit, or push. Any code or
content change found during exploration must be delegated to `/oplg:apply`.

## Motivation / context

`/oplg:apply` is the only workflow that can edit code, but for non-trivial
changes the user often wants a map of the relevant code first — "where is X?",
"how does Y work?", "what would it take to change Z?". Doing that
investigation inline with `/oplg:apply` blurs the boundary between research
and edit, and makes it easy to start touching files before the user agrees on
scope. `/oplg:explore` separates the two phases: read-only research → explicit
handoff → `/oplg:apply` does the edits.

## Key changes

- `src/core/templates/workflows/explore.ts`: new workflow body. Hard guardrails
  prohibit Edit / Write / NotebookEdit and any mutating shell commands
  (`git add/commit/push/checkout/reset/...`, `npm i`, `pnpm run build`, etc.).
  Output format is fixed: Summary → Key files → How it works → Gaps →
  Suggested next actions → Handoff block.
- `src/core/templates/index.ts`: re-export `getExploreSkillTemplate` and
  `getOplgExploreCommandTemplate`.
- `src/core/shared/skill-generation.ts`: register the explore skill
  (`openlog-explore`) and command (`explore`) in `getSkillTemplates()` /
  `getCommandTemplates()`.
- `src/core/shared/tool-detection.ts`: add `openlog-explore` to `SKILL_NAMES`
  and `explore` to `COMMAND_IDS`.
- `src/core/init.ts`: usage banner now lists all three commands
  (`/oplg:explore <topic>`, `/oplg:apply <action>`, `/oplg:record`).
- `README.md`: slash-commands table, layout block, supported-AI-tools row, and
  roadmap line all updated to include `/oplg:explore`.
- `dist/`: rebuilt to keep the committed artifacts in sync with `src/`.

## Impact

- `openlog init` now scaffolds three skills + three commands per AI tool
  instead of two; existing projects re-running `openlog init` will see one
  new `[created]` skill (`openlog-explore/SKILL.md`) and one new command file
  (`apply.md` / `record.md` stay `[unchanged]`).
- No breaking changes to the existing `/oplg:apply` or `/oplg:record`
  workflows; their templates were not modified.
- Tool-detection constants now include the explore entries, so future
  cleanup or enumeration logic that iterates `SKILL_NAMES` / `COMMAND_IDS`
  will pick up the new workflow automatically.

## Verification

- `node build.js` — TypeScript compiled cleanly with tsc 5.9.3.
- `node bin/openlog.js init /tmp/openlog-explore-smoke --tools all` — first
  run reported 6 created files (3 skills + 3 commands for Claude, 3 prompts
  for Copilot); second run reported all 9 files as `[unchanged]`,
  confirming idempotent diff sync.
- `node bin/openlog.js init . --tools claude` — local repo dogfood; the new
  `openlog-explore` skill became visible in the available-skills list.

## Follow-ups

- [ ] Author a spec under `openlog/specs/` describing the
      explore → apply → record pipeline contract (currently only described
      inline in template bodies and `README.md`).
- [ ] Consider adding a guardrail test: assert that the explore template
      body does not mention any mutating verb (`commit`, `push`, `Write`,
      `Edit`) outside the "Hard guardrails" section.
