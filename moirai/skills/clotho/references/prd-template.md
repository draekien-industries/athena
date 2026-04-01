# PRD Template

Use this template when drafting the PRD in `.moirai/plans/<slug>/prd.md`.

```markdown
# <PRD Title>

## Problem Statement

[What is broken, missing, or suboptimal. Describe the current state and why it needs to change.]

## Goals / Success Criteria

[How we know the work is done. Each goal should be measurable or objectively verifiable.]

- Goal 1
- Goal 2
- Goal 3

## User Stories

1. As a [role], I want [action] so that [outcome]
2. As a [role], I want [action] so that [outcome]
3. As a [role], I want [action] so that [outcome]

## Testing Decisions

[Expected level of test coverage and testing approach. Which layers need tests? What testing strategy applies?]

## Out of Scope

[What is explicitly excluded from this work. Be specific to prevent scope creep.]

- Exclusion 1
- Exclusion 2

## Further Notes / Open Questions

[Anything unresolved, risks, dependencies on external teams, or decisions deferred to implementation.]
```

## Guidelines

- **User stories must be numbered** so sub-issues can reference them by number
- **User stories must follow the format** "As a [role], I want [action] so that [outcome]"
- **Goals must be measurable** — avoid vague language like "improve" or "better"
- **Out of Scope must be specific** — not just "everything else"
- **Do not include implementation details** — no file paths, architecture decisions, or library choices. Those belong in sub-issues.
