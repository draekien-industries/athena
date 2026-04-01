# Moirai

Plan, implement, and verify development workflows backed by Linear issue tracking.

Named after the three Greek Fates, each command maps to a phase of the development lifecycle:

- **Clotho** (the spinner) - `/moirai:plan` - Spins the thread of what will be built
- **Lachesis** (the allotter) - `/moirai:implement` - Measures out the work
- **Atropos** (the inevitable) - `/moirai:verify` - The final, unalterable check

## Prerequisites

- [Linear MCP server](https://linear.app/docs/mcp#claude-code) configured and authenticated
- Claude Code CLI

## Installation

```bash
claude plugin install moirai@athena
```

## Commands

### `/moirai:plan`

Guides you through creating a Product Requirements Document (PRD) via an interactive interview, verifies it against your stated requirements, then slices it into vertical sub-issues in Linear.

**Arguments:** `[--team TeamName]` to override the configured Linear team.

### `/moirai:implement [issue-number]`

Takes a Linear PRD issue number, fetches all sub-issues, and executes them in dependency-ordered waves using parallel subagents in isolated git worktrees. Each sub-issue is verified against its acceptance criteria before merging.

### `/moirai:verify [issue-number]`

Evaluates all completed work against the original PRD, runs automated checks (test, lint, typecheck, build), and creates bug issues for any gaps found.

## Configuration

On first run, Moirai creates `.moirai/config.json` in your project root. This file includes a `$schema` reference for IDE autocompletion.

```json
{
  "$schema": "<path-to-plugin>/schemas/config.schema.json",
  "linear": {
    "teamId": "uuid",
    "teamName": "Engineering",
    "statuses": {
      "todo": "Todo",
      "inProgress": "In Progress",
      "inReview": "In Review",
      "done": "Done"
    }
  },
  "verification": {
    "maxWarnings": 3,
    "commands": ["npm run test", "npm run lint"]
  },
  "implementation": {
    "maxParallel": 3
  }
}
```

### Options

- `linear.teamId` / `linear.teamName` - Target Linear team
- `linear.statuses` - Mapping of workflow phases to your team's Linear status names
- `verification.maxWarnings` - Number of warnings allowed before blocking progress (default: 3, use -1 for advisory-only)
- `verification.commands` - Commands to run during the verify phase
- `implementation.maxParallel` - Maximum concurrent implementer agents (default: 3, set to 1 for sequential)

## Workflow

```
/moirai:plan
  Interview -> Draft PRD -> Verify PRD -> Create Linear issue
  -> Slice into sub-issues -> Verify sub-issues -> Create in Linear

/moirai:implement ENG-123
  Fetch sub-issues -> Build wave plan -> Execute waves
  -> Verify each sub-issue -> Merge into feature branch

/moirai:verify ENG-123
  Fetch PRD -> Run automated checks -> Evaluate against PRD
  -> Create bug issues if gaps found -> Mark Done if clean
```

## Linear Status Lifecycle

Per sub-issue: `Todo` -> `In Progress` -> `In Review` -> `Done` (or back to `Todo` if gaps found)

Per PRD issue: Created during plan -> `Done` only when `/moirai:verify` passes clean.

## Branch Strategy

```
main
└── feat/<slug>                    # feature branch
    ├── feat/<slug>/<issue-id>     # sub-issue worktree
    └── feat/<slug>/<issue-id>     # sub-issue worktree
```
