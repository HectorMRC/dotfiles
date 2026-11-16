---
name: pr-description
description: Write a Conventional Commits PR title and a brief What and Why body for the current work, and open or update the PR with the gh CLI. Use when asked to write a PR description, or to open or update a PR.
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
  In a workspace from the `parallel-work` skill, run these from that workspace so `@` is its working copy.
- git: find the base with `gh repo view --json defaultBranchRef -q .defaultBranchRef.name`, then:
  ```sh
  git log <base>..HEAD
  git diff <base>...HEAD --stat
  git diff <base>...HEAD
  ```

Check for an existing PR: `gh pr view <branch> --json number,title,body,url`. When one exists, update it rather than writing from scratch, and keep content the author added by hand unless it is now wrong.

Find a Linear issue ID (e.g. `ENG-123`) in the bookmark or branch name and commit messages.

## Title

Follow the commit title rules from the Version control context.
Pick the type and scope that dominate across all the commits.

## Body

Very brief, high level, straight to the point.
Write for a reviewer who has not seen the work.

```markdown
# What

< 1 or 2 sentences about what the PR does >

# Why

< 1 to 3 sentences about why it is needed >

Closes: DEV-0123
```

- Always include both sections, in this order.
- Stay high level: no implementation details, no restating the diff, no list of touched files.
- Mention breaking changes, migrations or required follow-up in What.
- End with `Closes: <ISSUE_ID>` as the very last line when the issue is known. Omit it otherwise.
- If the repo has a PR template (`.github/pull_request_template.md` or `.github/PULL_REQUEST_TEMPLATE/`), fill it with the same brevity.

## Publish

1. Show the title and body and wait for confirmation.
2. Then pass the body on stdin:
   - New PR: `gh pr create --title '<title>' --body-file - --base <base> --head <branch>`. Add `--draft` when asked.
   - Existing PR: `gh pr edit <pr> --title '<title>' --body-file -`.
3. Never push. If the branch is not on the remote, tell the user to push first (`jj git push` with jj).
4. Report the PR URL.
