---
name: clotho
description: This skill should be used when the user invokes "/moirai:plan", asks to "create a PRD", "plan a feature", "write requirements", or wants to start the Moirai planning workflow. Clotho is the planning phase of the Moirai plan-implement-verify lifecycle, named after the Fate who spins the thread of destiny.
---

# Clotho — Plan Phase

Guide the user through creating a verified Product Requirements Document (PRD) and slicing it into Linear sub-issues ready for implementation.

## Prerequisites

Before starting, verify Linear MCP is available and authenticated:

1. Call `mcp__linear-server__get_authenticated_user` — if this fails, instruct the user to set up the Linear MCP server and exit gracefully
2. Load `.moirai/config.json` from the project root — if missing, run the first-run config flow (see below)

### First-Run Config Flow

1. Call `mcp__linear-server__list_teams` and present options to the user
2. After team selection, call `mcp__linear-server__list_issue_statuses` for that team
3. Ask the user to map their team's statuses to: todo, inProgress, inReview, done
4. Save the config to `.moirai/config.json` with a `$schema` reference pointing to the plugin's `schemas/config.schema.json`

### Team Override

If the user provides a `--team` argument, use that team for this invocation instead of the configured default. Do not persist the override.

## Planning Process

### Step 1: Enter Plan Mode

Call `EnterPlanMode` to activate Claude's built-in planning mode. All subsequent work in this phase operates within plan mode.

### Step 2: Interview the User

Conduct a thorough interview to understand the problem:

1. Request a detailed problem description and any solution ideas
2. Explore the codebase to validate claims and assess the current state
3. Walk through all design aspects one decision branch at a time, resolving dependencies sequentially
4. Do not ask more than 2-3 questions per message to avoid overwhelming the user

### Step 3: Draft the PRD

Write the PRD to `.moirai/plans/<slug>/prd.md` using the template in `references/prd-template.md`.

**Slug generation:** Derive a 3-word kebab-case slug from the PRD title (e.g. "Add User Authentication" becomes `add-user-authentication`). If the directory already exists, append a numeric suffix (e.g. `add-user-authentication-2`).

### Step 4: Verify the PRD

Spawn a `prd-verifier` agent with:
- The path to the PRD file
- The user's original stated requirements from the interview

The verifier grades each finding as BLOCKER or WARNING. Evaluate the results:
- If any BLOCKERs exist, or WARNING count exceeds `verification.maxWarnings` from config → re-enter the interview loop at Step 2 to resolve gaps
- Otherwise → proceed

**Retry limit:** Re-run the verifier a maximum of 2 times per cycle. If BLOCKERs persist after 2 attempts, present the unresolved findings to the user and ask how to proceed rather than looping indefinitely.

### Step 5: Slice into Sub-Issues

Break the PRD into **vertical slices** (tracer bullets). Each slice cuts through ALL integration layers end-to-end, not a horizontal slice of one layer.

For each slice, determine:
- **Title** — short descriptive name
- **Type** — HITL (requires human interaction) or AFK (can be completed autonomously). Prefer AFK.
- **Blocked by** — which other slices must complete first
- **User stories addressed** — references to numbered user stories in the PRD
- **Acceptance criteria** — testable conditions for completion

Present the breakdown to the user for approval. Iterate until approved.

Write each sub-issue to `.moirai/plans/<slug>/issues/<issue-slug>.md` using the template in `references/issue-template.md`.

### Step 6: Verify Sub-Issues

Spawn a `sub-issue-verifier` agent with:
- The path to the PRD file
- The path to the issues directory

The verifier checks coverage, dependencies, and vertical-ness. Evaluate results using the same BLOCKER/WARNING threshold and retry limit as Step 4. If failing after retries, present findings to the user.

### Step 7: Create PRD Issue in Linear

All verification is now complete. Create the PRD issue in Linear.

Call `mcp__linear-server__save_issue` with:
- `title`: PRD title
- `teamId`: configured team ID
- `description`: full PRD content as markdown

Record the returned issue identifier for use as `parentId` in sub-issues.

### Step 8: Create Sub-Issues in Linear

Create sub-issues in dependency order (blockers first) so real issue numbers can be referenced:

For each sub-issue, call `mcp__linear-server__save_issue` with:
- `title`: sub-issue title
- `teamId`: configured team ID
- `description`: sub-issue content as markdown
- `parentId`: the PRD issue identifier from Step 7

After creation, update any `Blocked By` references in the local issue files with the real Linear issue identifiers.

## Error Handling

- **Linear API failure during issue creation:** If a `mcp__linear-server__save_issue` call fails, retry once. If it fails again, report the error to the user with the sub-issue title and content so nothing is lost. Do not continue creating subsequent sub-issues that depend on the failed one.
- **Malformed config:** If `.moirai/config.json` exists but fails to parse or is missing required fields, report the specific validation error and offer to re-run the first-run config flow.
- **Plan mode failure:** If `EnterPlanMode` fails, inform the user and continue without plan mode rather than aborting the entire workflow.

## Edge Cases

- **Existing plan directory:** If `.moirai/plans/<slug>/` already exists, check whether it contains a completed PRD. If so, append a numeric suffix to the slug. Do not overwrite existing plans.
- **User cancellation mid-interview:** If the user wants to stop during the interview, save any drafted content to the plan directory so it can be resumed later. Do not create any Linear issues for incomplete plans.
- **No user stories identified:** If the interview does not surface clear user stories, flag this explicitly to the user before drafting the PRD. A PRD without user stories cannot pass verification.
- **Empty team list:** If `mcp__linear-server__list_teams` returns no teams, instruct the user to check their Linear workspace permissions and exit.

## Additional Resources

### Reference Files

- **`references/prd-template.md`** — PRD markdown template with all required sections
- **`references/issue-template.md`** — Sub-issue markdown template for vertical slices
