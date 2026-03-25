---
name: create-handoff
description: This skill contains the standard operating procedure for creating session handoff documents. It should be used internally by the handoff-in-process command and the handoff-creator agent when generating handoff documents that capture work state for session continuity.
user-invocable: false
---

# Create Handoff SOP

Standard operating procedure for creating a session handoff document. Follow these steps in order to produce a comprehensive handoff that enables seamless work resumption in a new session.

## Procedure

### Step 1: Capture Git State

Run the following commands and record the output:

```bash
git branch --show-current
git status --short
git log --oneline -10
git diff --stat
```

If the project is not a git repository, note "Not a git repository" and skip git-related parts of Steps 1 and 2. If the repository has no commits yet, note "No commits yet" and record only the list of untracked files.

### Step 2: Identify Modified Files

Determine which files have been modified during this session:

1. Check `git diff --name-only` for uncommitted changes
2. Check `git diff --cached --name-only` for staged changes
3. Review the conversation history for any files that were read, written, or edited

For each modified file, note what was changed and why. If no files were modified during the session, mark this section as "N/A" in the handoff document.

### Step 3: Review Session Context

Analyze the current conversation to identify:

1. **Objective**: What was the user trying to accomplish? State the high-level goal.
2. **Work completed**: List all tasks, fixes, or features that were completed.
3. **Key decisions**: Record any important decisions made during the session, including the rationale and alternatives that were considered.
4. **Important context**: Note any gotchas, blockers, environment requirements, error messages, or constraints discovered during the session.

### Step 4: Determine Next Steps

Based on the session context, create an ordered list of remaining work:

1. What was the user about to do next?
2. What tasks remain incomplete?
3. Are there any follow-up items that were identified but not started?

### Step 5: Compose Resume Commands

Identify the specific commands and file reads that a new session would need to run to quickly re-establish context:

1. Git commands to understand the current state
2. Key files to read for orientation
3. Any environment setup needed

### Step 6: Write the Handoff Document

Read the template at `${CLAUDE_PLUGIN_ROOT}/skills/create-handoff/references/template.md`.

Fill in all template sections with the information gathered in Steps 1-5. For any section where no relevant information was found, write "N/A" rather than omitting the section. This ensures the resume command can reliably parse all handoff documents with a consistent structure.

Use the local system time for the filename timestamp:

```
{project_root}/.claude/handoffs/handoff-{YYYY-MM-DD}-{HHmmss}.md
```

Create the `.claude/handoffs/` directory if it does not exist.

### Step 7: Update .gitignore

Check if `.claude/handoffs/` is listed in the project's `.gitignore`. If not, add it to prevent handoff documents from being committed (they contain session-specific state).

### Step 8: Report

Output the path of the created handoff document and a brief (2-3 sentence) summary of what was captured.

## Edge Cases

- **Not a git repository**: Skip all git commands. Rely on conversation history and file system state to populate the handoff. Mark git-related sections as "N/A".
- **New repository with no commits**: Record untracked files from `git status`. Mark "Recent Commits" as "N/A".
- **Empty or minimal conversation history**: Fill in what is available. If the objective or next steps cannot be determined, write "Unable to determine from available context" rather than guessing.
- **No modified files**: Mark "Files Modified" and "Uncommitted Changes" as "N/A".
- **No pending work**: Mark "Next Steps" as "N/A - all work completed".

## Additional Resources

### Template

The handoff document template is at `references/template.md`. Read this template before writing the handoff to ensure all sections are covered.
