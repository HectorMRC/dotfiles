---
name: code-review
description: Review the changes of a local or remote branch against trunk, looking for bugs, anti-patterns, documentation inconsistencies and possible simplifications. Use when asked to review code, a branch or the current work.
---

# Review code

Read only.
Never edit files, commit, push, or comment on a PR.

## 1. Find the changes

Pick the target:

- **Local**: the current work, `trunk()..@`.
    Ignore an empty working-copy change on top.
- **Remote**: a branch or PR, `trunk()..<bookmark>@origin`.
    If the bookmark is missing or stale, ask the user to run `jj git fetch` and stop until it is done.
    For a PR, find its branch with `gh-pr-comments`.

With jj, use the `jj-*` tools:

- `jj-log` with the range, for the commits and their intent.
- `jj-diff` with the range as `revision` and `stat: true`, for the changed files.
- `jj-diff` with the range as `revision`, for the full diff.

Without `.jj`, ask the user for the output of `git log <base>..<branch>` and `git diff <base>...<branch>`.

## 2. Understand the intent

Before judging the code, state in 1-2 sentences what the changes do and why.
Use commit messages, the PR description, linked issues and the diff.
If the intent is unclear, say so and ask before going on.

## 3. Read with context

- Read every changed file, except generated files, lockfiles, snapshots and vendored code.
    Skim those last and only mention them.
- Read other files only when needed to understand a change: callers and callees of changed functions, implemented traits or interfaces, changed types' users, related tests and docs.
    Use `rg` to find them.
    Do not explore beyond that.
- Read the project's conventions when they exist: `AGENTS.md`, `CONTRIBUTING.md`, architecture decision records.
    For backend code, also apply the `backend-architecture` skill.
- **Remote**: `read` shows the local working copy, which may not match the branch.
    Rely on the diff.
    If full files are needed, ask the user before switching the working copy with `jj-new`.
- **Remote PR**: read its existing review with `gh-pr-comments` and do not repeat points already raised.

For large changes (over ~1500 changed lines), review core logic, public APIs, schemas and tests first.

## 4. Look for

- **Bugs**: wrong logic, unhandled errors and edge cases, race conditions, resource leaks, security issues, broken backward compatibility.
- **Anti-patterns**: violations of the project's conventions or architecture, leaky abstractions, duplication, misplaced responsibilities.
- **Documentation**: docs, comments, READMEs or examples that contradict the code or became stale, missing docs for new public APIs.
- **Tests**: missing or weak tests for the new behavior.
- **Enhancements**: not errors, but code that could be simpler, clearer or more idiomatic.

The main findings cover only what the changes introduce or make worse.
Problems that already existed are welcome, but only in the separate "Pre-existing issues" section at the end.

## Output

Start with the 1-2 sentence summary of the changes.
Then list findings grouped by category, most severe first, omitting empty categories:

```markdown
### Bugs

1. `path/to/file.rs:42`: <what is wrong and its impact>.
    <Suggested fix.>
```

- Cite `path:line` for every finding.
- Mark each finding as a fact or a suspicion.
- Be concrete: name functions and types, quote short snippets only when they clarify.
- No praise, no restating the diff, no style nits a formatter or linter would catch.

After the findings, list problems the changes did not introduce under a separate `### Pre-existing issues` heading, in the same format.
They do not affect the verdict.

End with a one-line verdict on the changes: ready to merge, ready after minor fixes, or needs changes.
