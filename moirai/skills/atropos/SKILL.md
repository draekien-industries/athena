---
name: atropos
description: This skill should be used when the user invokes "/moirai:verify", asks to "verify the implementation", "check the work against the PRD", "run final verification", or wants to validate completed work in the Moirai workflow. Atropos is the verification phase of the Moirai plan-implement-verify lifecycle, named after the Fate who cuts the thread — the final, unalterable check.
---

# Atropos — Verify Phase

Evaluate all completed work against the original PRD, run automated checks, and create bug issues for any gaps found.

## Prerequisites

Before starting, verify Linear MCP is available and authenticated:

1. Call `mcp__linear-server__get_authenticated_user` — if this fails, instruct the user to set up the Linear MCP server and exit gracefully
2. Load `.moirai/config.json` from the project root — if missing, instruct the user to run `/moirai:plan` first

## Verification Process

### Step 1: Fetch Issues

The user provides a Linear issue number (the PRD issue). If not provided, attempt to infer it from the current feature branch name.

1. Call `mcp__linear-server__get_issue` to fetch the PRD issue
2. Call `mcp__linear-server__list_issues` with `parentId` to fetch all sub-issues

### Step 2: Auto-Detect Verification Commands

If `verification.commands` is not already configured in `.moirai/config.json`:

1. Run the `detect-checks.js` script at `${CLAUDE_PLUGIN_ROOT}/scripts/detect-checks.js` to scan the project for available check commands
2. Present detected commands to the user for confirmation
3. Save confirmed commands to `.moirai/config.json`
4. If nothing is detected and nothing is configured, ask the user what commands to run

### Step 3: Run Automated Checks

Execute each command in `verification.commands` sequentially. Collect all output and note any failures.

If any command fails, report the failures but continue with the remaining steps — automated check failures are findings, not blockers for the rest of the verification process.

### Step 4: Evaluate Against PRD

Spawn a `completion-verifier` agent with:
- The PRD issue content
- All sub-issue content and their statuses
- The feature branch name for code inspection
- Results from the automated checks in Step 3

The verifier evaluates:
- Every PRD goal and success criterion is met in the code
- Every user story has been addressed
- Acceptance criteria from each sub-issue are satisfied
- Automated check results are clean

Each finding is graded as BLOCKER or WARNING.

### Step 5: Handle Results

#### Gaps Found

If the verifier reports BLOCKERs or WARNINGs exceeding the `maxWarnings` threshold:

1. For each gap, create a bug sub-issue under the PRD issue via `mcp__linear-server__save_issue` with:
   - `title`: descriptive bug title
   - `team`: configured team
   - `description`: detailed findings, expected vs actual behavior, and relevant acceptance criteria
   - `parentId`: the PRD issue identifier
2. Present a summary to the user listing all created bug issues
3. Suggest running `/moirai:implement <issue-number>` to address the bugs

#### All Clear

If no BLOCKERs and WARNINGs are within threshold:

1. Move the PRD issue to `done` status via `mcp__linear-server__save_issue`
2. Present a success summary confirming all goals, user stories, and acceptance criteria are met
