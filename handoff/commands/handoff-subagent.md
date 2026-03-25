---
description: Create a handoff document using an isolated subagent to avoid consuming remaining context. Recommended when context usage is critical (~90%+).
allowed-tools: Agent
argument-hint: "[optional description of current work focus]"
---

Launch the handoff-creator agent to create a session handoff document in an isolated subprocess.

## Instructions

1. Launch the `handoff-creator` agent using the Agent tool with the following prompt:

   "Create a comprehensive session handoff document. Additional context from the user: $ARGUMENTS"

2. The agent will:
   - Read the SOP and template from the plugin's skills directory
   - Capture git state and analyze recent file changes
   - Look for active plans and task lists
   - Write the handoff document to `.claude/handoffs/`

3. Once the agent completes, report the handoff file path to the user and suggest:
   - Start a new Claude Code session
   - Run `/handoff:handoff-resume` in the new session to continue work

This approach uses minimal main context since the heavy lifting happens in the subagent's isolated process.
