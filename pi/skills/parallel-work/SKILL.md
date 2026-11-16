---
name: parallel-work
description: Work on one issue or feature in its own jj workspace, so several agents can work on the same repository at once without clashing. Use when asked to work in parallel, in a separate workspace, or when other work is already in flight in the repository.
---

# Work in a parallel jj workspace

One issue or feature per workspace.
Workspaces live at `../<repo>.workspaces/<name>`, next to the main repository; `default` is the main one.
They share the repository's history, so commits and bookmarks made in one are visible from all.

## Start

1. `jj-workspace-list` to see what exists. Never reuse a workspace another agent is using.
2. `jj-workspace-add` with the Linear issue ID or a short slug as `name`, based on `trunk()` unless the work stacks on another revision.
3. `jj-workspace-switch` to it, with a `kickoff` restating the task. The session moves after your response, with the conversation, and continues there.

## Work

- Only touch files inside the current workspace.
- Commit as usual; `@` here is this workspace's own working-copy commit.
- Set a bookmark for the work so it survives cleanup, and push or open the PR as usual (see `pr-description`).
- If the repository uses direnv, the new directory may need `direnv allow`; ask the user.

## Clean up

Once the work is merged or bookmarked:

1. `jj-workspace-switch` to `default`.
2. `jj-workspace-forget` the workspace. It refuses while there are changes no bookmark points to; only pass `force` if the user agrees to drop them.
