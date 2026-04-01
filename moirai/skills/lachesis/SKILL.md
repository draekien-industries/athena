---
name: lachesis
description: This skill should be used when the user invokes "/moirai:implement", asks to "implement the plan", "start implementation", "execute the issues", or wants to begin the Moirai implementation phase. Lachesis is the implementation phase of the Moirai plan-implement-verify lifecycle, named after the Fate who measures the thread of life.
---

# Lachesis — Implement Phase

Execute Linear sub-issues in dependency-ordered waves using parallel subagents in isolated git worktrees, with verification after each wave.

## Prerequisites

Before starting, verify Linear MCP is available and authenticated:

1. Call `the Linear MCP tool that retrieves the authenticated user` — if this fails, instruct the user to set up the Linear MCP server and exit gracefully
2. Load `.moirai/config.json` from the project root — if missing, instruct the user to run `/moirai:plan` first

## Implementation Process

### Step 1: Fetch Issues

The user provides a Linear issue number (the PRD issue).

1. Call `the Linear MCP tool that retrieves issue details` to fetch the PRD issue
2. Call `the Linear MCP tool that lists issues` with `parentId` set to the PRD issue to fetch all sub-issues
3. For each sub-issue, call `the Linear MCP tool that retrieves issue details` with `includeRelations: true` to get blocking relationships

> **Note:** Sub-issue structural validity (vertical slices, coverage, dependencies) is verified during the plan phase by clotho. Lachesis assumes well-formed issues and does not re-run structural verification. The user must provide a Linear issue number — unlike the verify phase, lachesis does not attempt to infer the issue from the current branch.

### Step 2: Prepare Working Environment

1. Verify the working tree is clean (`git status --porcelain`). If dirty, warn the user and exit.
2. Derive the slug from the PRD title (3-word kebab-case)
3. Check if a feature branch `feat/<slug>` already exists:
   - If yes, check it out
   - If no, create it off the current branch

### Step 3: Handle Stale Statuses

Check for sub-issues left in intermediate states from a previous session:

- **In Progress items:** Dispatch built-in Explore subagents (`Agent` with `subagent_type: "Explore"`) to assess what work was completed vs pending. Add findings as a comment on the Linear sub-issue. Then reset status to the configured `todo` status.
- **In Review items:** Reset to the configured `todo` status (verification will run fresh).

### Step 4: Build Wave Plan

Construct waves from the dependency graph:

1. **Wave 1:** All sub-issues with no blockers and status matching the configured `todo` status
2. **Wave 2:** All sub-issues whose blockers are all in `done` status
3. Continue building waves until all remaining sub-issues are planned
4. Skip sub-issues already in `done` status

If no sub-issues are eligible for any wave (circular dependency or all done), report this to the user.

### Step 5: Execute Waves

For each wave, execute the following cycle:

#### 5a: Dispatch Implementers

Dispatch up to `implementation.maxParallel` (from config, default 3) `implementer` agents in parallel. Each implementer:

- Runs in an **isolated git worktree** (`isolation: "worktree"`) on branch `feat/<slug>/<issue-id>`
- Receives the sub-issue content, the PRD for broader context, and the feature branch name
- Moves the sub-issue to `inProgress` status via `the Linear MCP tool that creates or updates an issue`
- Implements the work (code, tests, etc.)
- Moves the sub-issue to `inReview` status via `the Linear MCP tool that creates or updates an issue`

#### 5b: Verify Implementations

After all implementers in the wave complete, dispatch one `implementation-verifier` agent per sub-issue:

- Verifier checks the implementation on the sub-issue branch against the acceptance criteria
- **Pass:** Merge the sub-issue branch into the feature branch. Move sub-issue to `done` status. Auto-resolve merge conflicts where possible; escalate to the user only if unresolvable.
- **Fail:** Add a comment to the Linear sub-issue with detailed findings via `the Linear MCP tool that creates or updates a comment`. Move sub-issue back to `todo` status. The sub-issue will be redispatched in the next cycle.

#### 5c: Repeat

After verification, if any sub-issues in the wave were moved back to `todo`, re-execute them before proceeding to the next wave. Continue until all sub-issues in the current wave are `done`, then move to the next wave.

### Step 6: Completion

When all sub-issues across all waves are in `done` status, report completion to the user. Suggest running `/moirai:verify <issue-number>` to validate the full implementation against the PRD.

## Additional Resources

### Reference Files

- **`references/issue-template.md`** — Sub-issue body template (shared with clotho)
