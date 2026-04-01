---
name: session-start
description: Load Moirai config context at session start when a .moirai/config.json exists in the project
event: SessionStart
---

Check if `.moirai/config.json` exists in the project root.

**If the file exists:**

1. Read `.moirai/config.json` and note the configured Linear team and status mappings
2. Inform the user that this project has Moirai configured with the following commands:
   - `/moirai:plan` — start a new planning workflow
   - `/moirai:implement <issue-number>` — implement a planned PRD
   - `/moirai:verify [issue-number]` — verify completed work against the PRD

**If the file does not exist:**

Do nothing. The project is not using Moirai.
