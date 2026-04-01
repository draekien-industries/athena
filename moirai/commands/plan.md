---
description: Start the Moirai planning workflow — interview, draft PRD, verify, and create Linear issues
allowed-tools:
  - EnterPlanMode
  - ExitPlanMode
  - Read
  - Grep
  - Glob
  - Bash(git status:*)
  - Bash(git log:*)
  - Bash(git diff:*)
  - Bash(git branch:*)
  - Write
  - Edit
  - Agent
  - AskUserQuestion
  - mcp__linear-server__get_authenticated_user
  - mcp__linear-server__list_teams
  - mcp__linear-server__list_issue_statuses
  - mcp__linear-server__save_issue
  - mcp__linear-server__get_issue
argument-hint: "[--team TeamName]"
---

Invoke the **clotho** skill to run the Moirai planning phase.

This command guides the user through:
1. Verifying Linear MCP authentication (first-run config if needed)
2. Entering plan mode to interview the user about the problem
3. Drafting a PRD and writing it to `.moirai/plans/<slug>/prd.md`
4. Spawning a PRD verifier agent to check requirements alignment
5. Slicing the PRD into vertical sub-issues written to `.moirai/plans/<slug>/issues/`
6. Spawning a sub-issue verifier agent to check coverage and dependencies
7. Creating the PRD and sub-issues in Linear (only after all verification passes)

If the user provides `--team TeamName`, use that team for this invocation instead of the configured default.

Follow the clotho skill's process exactly. Do not skip verification steps.
