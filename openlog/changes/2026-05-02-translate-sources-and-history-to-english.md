# Translate sources and pushed git history to English

- **Date:** 2026-05-02
- **Author:** nk7260ynpa
- **Related commits:** `a040c7e`, `f81183e` (plus history rewrite: `0134ab1 → 556aaa7`, `fa5da61 → 52674ce`, `347fbea → 08f37cd`, `cbb5fdb → 9f6de92`, `1525a39 → a040c7e`)

## Summary

Aligned the entire repository with the project rule "all files except CLAUDE.md
must be in English". Translated TSDoc comments, user-facing CLI strings, README,
and the `/oplg:apply` / `/oplg:record` skill bodies. Also rewrote the three
already-pushed commits whose subjects were in Traditional Chinese, re-created the
three annotated tags whose messages were in Traditional Chinese, and force-pushed
`main` plus all five tags. Bumped the package version from 0.3.1 to 0.3.2 and
added `CLAUDE.md` and `.claude/` to `.gitignore` (these hold per-developer
context that should not ship with the repo).

## Motivation / context

CLAUDE.md (project layer) explicitly mandates English for every file in the
repo, with CLAUDE.md itself as the only exception. The earlier history pre-dated
that rule: source comments, user-facing strings, README, and three commit
subjects/tag annotations were written in Traditional Chinese. Bringing the
codebase, history, and tags into compliance unblocks publishing the package and
keeps git log / GitHub UI readable for English-only collaborators.

## Key changes

- `.gitignore`: ignore `CLAUDE.md` and `.claude/` (per-developer artifacts).
- `package.json`: bump to `0.3.2`.
- `README.md`: full translation to English; structure unchanged.
- `src/cli/index.ts`: translate `--version`, `init`, `--tools`, and `--force` descriptions.
- `src/core/init.ts`: translate every spinner message, error string, and the
  inline `project.md` template; comments translated.
- `src/core/config.ts`: TSDoc translated.
- `src/core/templates/types.ts`, `src/core/command-generation/types.ts`: TSDoc translated.
- `src/core/templates/workflows/apply.ts`, `src/core/templates/workflows/record.ts`:
  rewrite the `SHARED_BODY` (skill instructions shipped to user projects via
  `openlog init`) and the skill/command `description` strings in English.
- `src/core/shared/skill-generation.ts`, `src/core/shared/tool-detection.ts`,
  `src/core/shared/index.ts`: comment translation.
- `src/core/command-generation/{generator,registry,index}.ts` and
  `src/core/command-generation/adapters/{claude,github-copilot,index}.ts`:
  comment translation.
- Three commit subjects + bodies rewritten via `git filter-branch --msg-filter`:
  - `feat: 建立 Openlog CLI 並支援 --version` →
    `feat: bootstrap Openlog CLI with --version support`
  - `feat(init): 新增 openlog init 指令` →
    `feat(init): add openlog init command`
  - `feat: 安裝 /oplg:apply 與 /oplg:record commands 與 skills` →
    `feat: install /oplg:apply and /oplg:record commands and skills`
- Three annotated tags re-created with English messages:
  `v0.1.0`, `v0.2.0`, `v0.3.0`. (`v0.3.1` and `v0.3.2` annotations were already
  English; only their target commits moved.)
- `openlog/project.md` (untracked local artifact) translated to match the new
  English template baked into `src/core/init.ts`.

## Impact

- **Behavioral**: the skill bodies that ship to user projects via `openlog init`
  are now English. Anyone who previously ran `openlog init` will keep their
  Chinese skills until they re-run it (or accept the divergence).
- **Backwards compatibility**: every commit hash on `main` and every tag's
  target SHA changed. Existing clones must `git fetch && git reset --hard
  origin/main` to recover; old tags must be re-fetched.
- **No code-behavior change**: zero TS/runtime logic changed. Build is green.
- **No spec changes**: `openlog/specs/` is still empty.

## Verification

- `npm run build`: pass.
- Tracked-file CJK scan (`grep -lP '\p{Han}'` over `git ls-files | grep -v
  CLAUDE.md`): zero matches.
- Remote verification after force-push:
  - `git log origin/main` shows all English subjects.
  - All five tag annotations (`v0.1.0`–`v0.3.2`) show English content.

## Follow-ups

- [ ] Decide whether to delete the old `refs/original/refs/...` filter-branch
      backups now that the rewrite is confirmed (or let GC reap them).
- [ ] Consider re-running `openlog init --force` in any consumer project that
      installed the old Chinese skill bodies.
- [ ] Audit `src/index.ts` (currently a near-empty placeholder) once a real
      library API is needed; CLAUDE.md notes the `exports` field is already
      pointing at it.
