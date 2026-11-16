---
name: plan-linear-issue
description: Plan everything needed to close a Linear issue, as stacked PRs split into one commit per step, with integration tests, unit tests and documentation updates. Use when given a Linear issue ID and asked to plan, scope or break it down.
---

# Plan a Linear issue

Linear is reached through the `linear` MCP server. Before the first call, use `tool_search` for "linear" to learn the actual tool names and parameters. Do not guess them. If the server is not connected, tell the user to run `pi mcp login linear` and stop.

## Conventions

- The plan lives in the conversation only. Write no code and change nothing in Linear unless the user asks.
- A **step** is one commit (one jj change): a single focused change with a Conventional Commits title.
- A **PR** is a stack of steps that can be reviewed and merged alone. PRs stack when a later one builds on an earlier one.
- Every PR leaves the codebase working once merged. A step may break a test only if a later step in the same PR fixes it. Never leave a breakage in one PR for a stacked PR to resolve.
- Isolate concerns: refactors, new interfaces and behavior changes go in separate steps, and in separate PRs when they can be reviewed alone.

## Steps

1. **Issue**: fetch the issue with its description, comments, attachments, parent, sub-issues and relations. If an issue blocking it is still open, say so and ask whether to continue.
2. **Context**: read the relevant code, existing tests, `AGENTS.md` and any docs the change affects. Follow the repo's conventions and architecture.
3. **Clarify**: list open questions and ambiguous acceptance criteria. Ask before planning; do not invent requirements.
4. **Draft** the plan:
   - **PRs**, in merge order. For each: title, goal, and which PR it stacks on.
   - **Steps** within each PR, in order. For each: commit title, files touched, what changes, and tests added or updated.
   - **Integration tests**: always at least one, verifying the issue's acceptance criteria end to end. It must fail without the fix.
   - **Unit tests**: where new or changed logic is worth checking in isolation.
   - **Documentation**: every doc the change makes stale, of any kind: READMEs, `AGENTS.md`, ADRs, changelogs, API docs, guides, comments, knowledge bases. Update each in the PR whose change it describes.
5. **Confirm**: present the plan and wait for approval or changes:

   ```markdown
   ## PR 1: <title> (base: trunk)
   <goal>

   1. `<type>(<scope>): <summary>`
      - Files: ...
      - Change: ...
      - Tests: ...

   ## PR 2: <title> (base: PR 1)
   ...
   ```

   After the PRs, list:
   - How each acceptance criterion is verified.
   - Risks and assumptions.
   - Out-of-scope follow-ups, ready for `plan-to-linear-issues`.
