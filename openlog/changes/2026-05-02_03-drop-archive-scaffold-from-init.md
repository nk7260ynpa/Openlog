_Supplementary context from invocation: "tag"._

# feat(init): drop `openlog/changes/archive/` scaffold from `openlog init`

- **Date:** 2026-05-02
- **Author:** nk7260ynpa
- **Related commit:** 7bfec4f

## Summary

`openlog init` no longer creates the `openlog/changes/archive/` subdirectory.
The folder was a leftover from an earlier "in-flight vs. archived" plan that
the current `/oplg:record` workflow does not use — every record file is
written flat under `openlog/changes/`. The directory list, the generated
`project.md` template, the post-init summary output, and the README tree
diagram were all updated to match the new layout.

## Motivation / context

The archive folder was scaffolded but never populated by any shipped
workflow, so freshly-initialized projects ended up with a permanently empty
`changes/archive/` directory and matching boilerplate in their `project.md`.
Removing it keeps the generated layout aligned with what the tooling
actually writes, and avoids implying a promotion step that does not exist.

## Key changes

- `src/core/init.ts`: removed `path.join(openlogPath, 'changes', 'archive')`
  from the `mkdir` list; updated the `project.md` template (Layout bullet
  and Development-workflow step) and the post-init summary printout;
  refreshed the file-header comment.
- `README.md`: removed the `└── archive/` line from the post-init tree
  diagram and updated the `changes/` description.
- `dist/core/init.{js,d.ts,*.map}`: rebuilt via `node build.js` so the
  committed `dist/` tracks the source (per the project's git-URL install
  policy).
- `CLAUDE.md` (gitignored): synced the Layer-3 architecture note to the
  new `openlog/{specs,changes}` layout — local edit only, not committed.
- `openlog/project.md`: updated this repo's own project file to match the
  new generated template.

## Impact

- Behaviour change for `openlog init`: existing projects that already have
  an `openlog/changes/archive/` folder are unaffected — `init` never
  removes user files. New initializations simply skip the directory.
- No public-API change in `src/index.ts`. No CLI flag changes.
- Documentation references to the archive folder are removed from
  user-facing surfaces (`README.md`, generated `project.md`).

## Verification

- `node build.js` — clean build, no TypeScript errors.
- Smoke test: `rm -rf /tmp/oplg-init-test && mkdir -p /tmp/oplg-init-test
  && node bin/openlog.js init /tmp/oplg-init-test --tools claude`. Tree
  inspection showed `openlog/{specs,changes}` only — no `changes/archive/`.
  Summary output and skill/command writes were unchanged otherwise.

## Follow-ups

- [ ] Decide whether `/oplg:archive` (or similar) should be re-introduced
      later if a "completed change" promotion step is wanted; if so, the
      directory creation can come back behind that workflow rather than
      `init`.
