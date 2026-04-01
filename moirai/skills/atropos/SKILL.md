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

The user provides a Linear issue number (the PRD issue). If not provided, attempt to infer it from the current feature branch name by searching Linear for a matching issue title.

1. Call `mcp__linear-server__get_issue` to fetch the PRD issue
2. Call `mcp__linear-server__list_issues` with `parentId` to fetch all sub-issues

If no sub-issues are found, report this to the user and exit — there is nothing to verify.

### Step 2: Auto-Detect Verification Commands

If `verification.commands` is not already configured in `.moirai/config.json`:

1. Run the `detect-checks.js` script at `${CLAUDE_PLUGIN_ROOT}/scripts/detect-checks.js` to scan the project for available check commands
2. If the script fails or returns an empty array, ask the user what commands to run. Do not proceed with an empty command list.
3. Present detected commands to the user for confirmation — allow additions and removals
4. Save confirmed commands to `.moirai/config.json` using `Write` or `Edit`

If `verification.commands` is already configured, use the existing commands without re-detecting.

### Step 3: Run Automated Checks

Execute each command in `verification.commands` sequentially. For each command:

1. Run the command via Bash
2. Capture stdout, stderr, and exit code
3. If a command fails, retry it once — transient failures (network timeouts, flaky tests) are common. If it fails again, record it as a genuine failure.

Collect all results. Report failures but continue with the remaining steps — automated check failures are findings, not blockers for the rest of the verification process.

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
   - `teamId`: configured team ID
   - `description`: detailed findings, expected vs actual behavior, and relevant acceptance criteria
   - `parentId`: the PRD issue identifier
   - `relatedTo`: if the completion-verifier attributed the finding to a specific sub-issue, include `[<causal-sub-issue-id>]` to link the bug to the most likely cause. Omit this field for findings marked as "Unattributed".
2. Present a summary to the user listing all created bug issues
3. Suggest running `/moirai:implement <issue-number>` to address the bugs

#### All Clear

If no BLOCKERs and WARNINGs are within threshold:

1. Move the PRD issue to `done` status via `mcp__linear-server__save_issue`
2. Present a success summary confirming all goals, user stories, and acceptance criteria are met

## Error Handling

- **detect-checks.js failure:** If the script crashes or returns invalid JSON, warn the user and fall back to asking them directly for verification commands. Do not skip automated checks entirely.
- **Command execution timeout:** If a verification command runs longer than 5 minutes, kill it and record a timeout failure. Continue with remaining commands.
- **Linear API failure during bug creation:** If `mcp__linear-server__save_issue` fails when creating a bug issue, retry once. If it fails again, present the bug details directly to the user so the information is not lost. Continue creating remaining bug issues.
- **Completion-verifier agent failure:** If the agent returns no result or errors out, report this to the user and present the automated check results as the only available verification data. Do not mark the PRD as done without a successful verifier evaluation.

## Edge Cases

- **All sub-issues already done but PRD not done:** This is the normal case — proceed with verification.
- **Some sub-issues not done:** Warn the user that verification is running against incomplete work. List which sub-issues are still pending. Proceed with verification but note incomplete coverage in the results.
- **No verification commands configured or detected:** Ask the user what commands to run. If the user confirms there are no automated checks, proceed with only the PRD evaluation (Step 4). Note the absence of automated checks in the final report.
- **Issue inference failure:** If no issue number is provided and the current branch does not match a `feat/<slug>` pattern, ask the user for the issue number rather than guessing.
- **maxWarnings set to -1 (advisory mode):** In advisory mode, WARNINGs are reported but never block. Only BLOCKERs trigger bug issue creation. Still present all findings to the user.
