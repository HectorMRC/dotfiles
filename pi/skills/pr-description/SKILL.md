---
name: pr-description
description: Write a Conventional Commits PR title and a brief, descriptive body for the current work, and open or update the PR with the gh CLI. Use when asked to write a PR description, or to open or update a PR.
---

# Write a PR description

## Gather the work

Use jj when `.jj` exists, even if `.git` also exists. Otherwise use git.

- jj:
  ```sh
  jj log -r 'trunk()..@' --no-graph
  jj diff -r 'trunk()..@' --stat
  jj diff -r 'trunk()..@'
  jj log -r 'closest_bookmark(@)' --no-graph -T 'self.local_bookmarks()'
  ```
  Ignore an empty working-copy change on top.
- git: find the base with `gh repo view --json defaultBranchRef -q .defaultBranchRef.name`, then:
  ```sh
  git log <base>..HEAD
  git diff <base>...HEAD --stat
  git diff <base>...HEAD
  ```

Check for an existing PR: `gh pr view <branch> --json number,title,body,url`. When one exists, update it rather than writing from scratch, and keep content the author added by hand unless it is now wrong.

Find a Linear issue ID (e.g. `ENG-123`) in the bookmark or branch name and commit messages.

## Title

Conventional Commits: `type(scope)!: summary`.

- `type`: `feat`, `fix`, `refactor`, `perf`, `docs`, `test`, `build`, `ci`, `chore` or `revert`. Pick the one describing the main user-facing effect.
- `scope`: only when one area clearly dominates. Reuse scopes from the repo history (`git log` / `jj log` titles).
- `!`: only for breaking changes.
- Summary: lowercase, imperative, no trailing period. The whole title fits in 72 characters.

## Body

Brief, descriptive, straight to the point. Write for a reviewer who has not seen the work.

```markdown
<1-2 sentences: what changes and why.>

- <only changes a reviewer would otherwise miss, at most 4 bullets>

Closes ENG-123
```

- Omit the bullets when the summary says it all.
- Mention breaking changes, migrations or required follow-up explicitly.
- Add a testing note only when the testing is not obvious.
- If the repo has a PR template (`.github/pull_request_template.md` or `.github/PULL_REQUEST_TEMPLATE/`), fill it with the same brevity.
- No filler, no headings for short bodies, no restating the diff, no list of touched files.

## Publish

1. Show the title and body and wait for confirmation.
2. Then pass the body on stdin:
   - New PR: `gh pr create --title '<title>' --body-file - --base <base> --head <branch>`. Add `--draft` when asked.
   - Existing PR: `gh pr edit <pr> --title '<title>' --body-file -`.
3. Never push. If the branch is not on the remote, tell the user to push first (`jj git push` with jj).
4. Report the PR URL.
