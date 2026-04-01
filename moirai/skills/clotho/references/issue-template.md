# Sub-Issue Template

Use this template when writing sub-issue files to `.moirai/plans/<slug>/issues/<issue-slug>.md`.

```markdown
# <Sub-Issue Title>

## Type

[HITL or AFK]

## Parent PRD

<linear-issue-id>

## What to Build

[End-to-end behavior description for this vertical slice. Describe the complete path through all layers — schema, API, UI, tests — not layer-by-layer implementation. Reference specific sections of the parent PRD rather than duplicating content.]

## Acceptance Criteria

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Blocked By

- <issue-id> — <brief reason>

Or "None — can start immediately" if no blockers.

## User Stories Addressed

Reference by number from the parent PRD:

- User story 1
- User story 3
```

## Guidelines

- **Each sub-issue must be a vertical slice** — a thin but complete path through every layer (schema, API, UI, tests)
- **A completed slice must be demoable or verifiable on its own**
- **Prefer many thin slices over few thick ones**
- **Prefer AFK over HITL** — only mark as HITL when a human decision is genuinely required (architectural choice, design review, etc.)
- **Acceptance criteria must be testable** — avoid subjective language
- **Blocked By references real issue identifiers** — when writing to disk before Linear creation, use the file slug as a placeholder; update with real identifiers after creation
