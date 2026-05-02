# Translate Chinese change records under openlog/ to English

- **Date:** 2026-05-02
- **Author:** nk7260ynpa
- **Related commit:** Not yet committed

## Summary

Translate the two Traditional-Chinese change records I had written earlier today (`2026-05-02-fix-git-url-install.md` and `2026-05-02-commit-dist-for-git-install.md`) into English so that every file under `openlog/` complies with the project rule "all files except CLAUDE.md must be in English". Narrative text, headings, list items, follow-up checklists, and verification notes are all translated; technical content (paths, code, log excerpts, file names, package names) is preserved verbatim.

## Motivation / context

`CLAUDE.md` (project layer) is explicit:

> 專案內所有檔案：一律使用英文 [...] 唯一例外：本檔（CLAUDE.md）以繁體中文撰寫。

Earlier today I wrote two `/oplg:record` outputs in Traditional Chinese, which violated that rule. The earliest record under `openlog/` (`2026-05-02-translate-sources-and-history-to-english.md`) is already English and serves as a style reference, so this change just brings the two newer records back in line.

## Key changes

- `openlog/changes/2026-05-02-fix-git-url-install.md`: full translation — title, dated metadata labels, summary, motivation, key changes, impact, verification, and follow-ups. Code/log blocks and identifier paths kept as-is.
- `openlog/changes/2026-05-02-commit-dist-for-git-install.md`: full translation, same scope.

## Untouched files

- `openlog/project.md`: already in English.
- `openlog/changes/2026-05-02-translate-sources-and-history-to-english.md`: narrative is already English. The three remaining CJK lines inside that file are intentional historical citations of the original Traditional-Chinese commit subjects that were rewritten by `git filter-branch` (each shown next to its English replacement as a `<old>` → `<new>` mapping). Translating those would erase the before/after evidence the record is meant to preserve, so they stay as quoted source material.

## Impact

- **Documentation only**: zero code, configuration, or build output is touched.
- **No version bump**: this is a doc-policy fix, not a release-worthy change.
- **No effect on consumers**: nothing shipped from the package changes.

## Verification

- `grep -rlP '[\x{4e00}-\x{9fff}]' openlog/`: matches only `2026-05-02-translate-sources-and-history-to-english.md`, and the only matching lines are the intentional historical quotes documented above.
- `git diff --stat` shows two markdown files changed, no source or build artifacts touched.
- Skipped `npm run build` because no code changed.

## Follow-ups

- [ ] Whenever a future `/oplg:record` is invoked on this project, write the record body in English from the start (the skill template defaults to Traditional Chinese, but the project CLAUDE.md overrides it).
