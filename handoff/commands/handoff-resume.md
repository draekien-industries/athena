---
description: Resume work from a handoff document. Loads the most recent (or specified) handoff and offers options for how to continue.
allowed-tools: Read, Glob, Grep, Bash(git status:*), Bash(git log:*), Bash(git diff:*), Bash(git branch:*)
argument-hint: "[optional handoff filename or path]"
---

Resume work from a session handoff document.

## Instructions

### Step 1: Find the Handoff Document

If the user provided an argument, treat it as a path or filename:
- If it is an absolute path, read it directly
- If it is a filename, look for it in `.claude/handoffs/`
- Argument value: $ARGUMENTS

If no argument was provided:
1. List all files matching `.claude/handoffs/handoff-*.md`
2. Sort by filename (which includes the timestamp) to find the most recent
3. If no handoff files exist, inform the user and suggest running `/handoff:handoff-in-process` to create one

### Step 2: Read and Present the Handoff

1. Read the handoff document
2. Present a concise summary to the user covering:
   - What the previous session's objective was
   - What work was completed
   - What the next steps are
   - Any important context or gotchas

### Step 3: Ask the User How to Proceed

Present two options:

**Option A: Resume all work**
- Run all commands in the "Resume Commands" section to re-establish context
- Proceed with the "Next Steps" in order

**Option B: Review and select**
- Present the "Next Steps" as a numbered list
- Let the user choose which steps to pursue, skip, or modify
- Run only the relevant "Resume Commands" for the selected work

Wait for the user's choice before taking any action.

### Step 4: Execute Based on User Choice

For **Option A**: Run the resume commands, then begin working through the next steps sequentially.

For **Option B**: After the user selects their steps, run any relevant resume commands and begin the selected work.
