---
description: Run the Moirai verification workflow — evaluate completed work against the PRD and run automated checks
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash
  - Agent
  - AskUserQuestion
  - mcp__linear-server__*
argument-hint: "[issue-number]"
---

Invoke the **atropos** skill to run the Moirai verification phase.

The user provides a Linear issue number (the PRD issue). If not provided, attempt to infer it from the current feature branch name.

This command:
1. Verifies Linear MCP authentication
2. Fetches the PRD issue and all sub-issues from Linear
3. Auto-detects verification commands (test, lint, typecheck, build) — confirms with user on first run
4. Runs all configured automated checks
5. Spawns a completion verifier agent to evaluate work against every PRD goal, user story, and acceptance criterion
6. If gaps found: creates bug sub-issues in Linear and suggests re-running `/moirai:implement`
7. If all clear: moves PRD issue to Done and presents a success summary

Follow the atropos skill's process exactly. Do not skip verification steps.
