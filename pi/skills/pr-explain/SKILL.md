---
name: pr-explain
description: Explain what a GitHub pull request does and why, using the gh CLI. Use when given a PR URL or number, or asked to understand, summarize or review a PR.
---

# Explain a GitHub PR

Read only. Never comment, review, approve, merge or check out the PR.

## Gather

1. Identify the PR: a URL, a number (in the current repo), or none (the PR for the current branch). Pass URLs to `gh` as is.
2. Metadata:
   ```sh
   gh pr view <pr> --json number,title,body,author,state,isDraft,baseRefName,headRefName,url,additions,deletions,changedFiles,commits,closingIssuesReferences,reviews,comments
   gh pr checks <pr>
   ```
3. Changed files: `gh pr diff <pr> --name-only`.
4. Read the diff with `gh pr diff <pr>`. For large PRs (over ~1500 changed lines), read it in parts and prioritize core logic, public APIs, schemas and tests. Skim lockfiles, generated code, snapshots and vendored files last; mention them, do not explain them.
5. When the PR belongs to the local repository, read the surrounding code of key changes to explain how they fit. Do not assume the local checkout matches the PR head.
6. Linked issues or referenced PRs: open them with `gh issue view` / `gh pr view` only when needed to explain the motivation.

## Output

Be precise and concrete. Name functions, types and files. Do not restate the diff line by line.

- **TL;DR**: 1-2 sentences on what the PR does.
- **Why**: the motivation, from the description, commits or linked issues. Say so if it is unclear.
- **What changed**: grouped by area or concern, not by file.
- **How it works**: the main flow of the new behavior, citing `path:line` and quoting short snippets only where they clarify.
- **Risks and review focus**: breaking changes, migrations, concurrency, security, error handling, performance, missing or weak tests. Mark each as a fact or a suspicion.
- **Status**: draft or ready, CI result, review state and open discussions.

Scale the length to the PR: a few lines for a trivial change, more for a large one.
