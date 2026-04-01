---
description: Start the Moirai implementation workflow — execute Linear sub-issues in parallel waves with verification
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash
  - Write
  - Edit
  - Agent
  - AskUserQuestion
  - mcp__linear-server__get_authenticated_user
  - mcp__linear-server__get_issue
  - mcp__linear-server__list_issues
  - mcp__linear-server__save_issue
  - mcp__linear-server__save_comment
  - mcp__linear-server__list_issue_statuses
argument-hint: "<issue-number>"
---

Invoke the **lachesis** skill to run the Moirai implementation phase.

The user must provide a Linear issue number (the PRD issue created by `/moirai:plan`).

This command:
1. Verifies Linear MCP authentication
2. Fetches the PRD issue and all sub-issues from Linear
3. Creates or checks out the feature branch `feat/<slug>`
4. Handles stale statuses from previous sessions (In Progress → explore partial work; In Review → reset)
5. Builds a dependency-ordered wave plan
6. Executes each wave by dispatching parallel implementer agents in isolated git worktrees
7. Verifies each implementation against acceptance criteria
8. Merges passing work into the feature branch, redispatches failures

Follow the lachesis skill's process exactly. Do not skip verification steps.
