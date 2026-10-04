---
name: linear-plan-to-issues
description: Create Linear issues from a plan agreed in the conversation, under the requested project, with estimates and blocked-by relations. Use after planning, when asked to file, create or push the plan to Linear.
---

# Create Linear issues from a plan

Linear is reached through the `linear` MCP server. Before the first call, run `describeNamespace("mcp__linear")` in codemode (or search tools for "linear") to learn the actual tool names and parameters. Do not guess them. If the server is not connected, tell the user to run `pi mcp login linear` and stop.

## Conventions

- One issue per independently deliverable piece of work. Merge steps that cannot be shipped or reviewed alone.
- No sub-issues, no parent issues, no labels, no assignee, no cycle, unless the user asks.
- Every issue has an estimate on the team's scale.
- Ordering is expressed only through "blocked by" relations.
- Status: `Backlog` for planned, shaped work. `Triage` when the user asks, or when the team uses Triage and the work is not yet refined. Any status the user names wins.

## Steps

1. **Project**: find the project the user named. If several projects match, or none does, ask. Take the team from the project. If the project has several teams, ask which one.
2. **Team settings**: read the team's workflow statuses and estimate scale (exponential, Fibonacci, linear or t-shirt) and whether zero estimates are allowed. Use that scale.
3. **Draft** from the plan. For each issue:
   - **Title**: imperative, specific, at most ~70 characters.
   - **Description** (Markdown, brief):
     ```markdown
     <Context: why this is needed, 1-3 sentences.>

     ## Scope
     - <what to do>

     ## Acceptance criteria
     - [ ] <verifiable outcome>
     ```
     Include relevant file paths, decisions and constraints from the conversation. Leave out implementation detail the plan did not settle.
   - **Estimate**: the closest value on the scale. Flag low-confidence ones.
   - **Blocked by**: only real dependencies, not merely the plan order. No cycles.
4. **Duplicates**: search the project for open issues with similar titles. List likely duplicates instead of creating them again.
5. **Confirm**: show a table and wait for approval or changes:

   | # | Title | Estimate | Status | Blocked by |
   |---|-------|----------|--------|------------|

   Below it, the full descriptions. Do not create anything before the user approves.
6. **Create** the issues in dependency order, so blockers exist first. Then add every "blocked by" relation. Retry or report failures one by one; do not recreate issues that already succeeded.
7. **Report**: the table again with issue identifiers and URLs, plus anything that failed.

If the MCP tools cannot set relations or estimates, say so, write the dependencies as `Blocked by: ENG-123` at the end of each description, and list what the user must set by hand.

Never edit, move or close existing issues unless the user asks.
