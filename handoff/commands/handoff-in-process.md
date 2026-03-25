---
description: Create a handoff document in the current conversation context, preserving full access to session state for a richer handoff. Recommended when context usage is at warning level (~75%).
allowed-tools: Read, Grep, Glob, Bash(git status:*), Bash(git log:*), Bash(git diff:*), Bash(git branch:*), Bash(mkdir:*), Write
argument-hint: "[optional description of current work focus]"
---

Create a session handoff document by following the create-handoff SOP skill.

## Instructions

1. Read the SOP at `${CLAUDE_PLUGIN_ROOT}/skills/create-handoff/SKILL.md`
2. Read the template at `${CLAUDE_PLUGIN_ROOT}/skills/create-handoff/references/template.md`
3. Follow all SOP steps in order, using the current conversation context to produce a comprehensive handoff
4. If the user provided arguments, use them as additional context about the current work focus: $ARGUMENTS
5. Write the handoff document and report the file path

Since this runs in the main conversation context, leverage the full session history to produce the richest possible handoff document. Include details about discussions, decisions, and context that would not be available from git state alone.
