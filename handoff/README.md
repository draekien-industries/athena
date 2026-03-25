# handoff

Monitors context usage and creates handoff documents for seamless session continuity in Claude Code.

## Overview

Long Claude Code sessions eventually approach context limits, triggering compaction that can lose important details. This plugin:

1. **Monitors context usage** via a Stop hook that estimates token consumption
2. **Warns you** with tiered messages when context is getting large
3. **Creates handoff documents** that capture your full work state
4. **Resumes work** in new sessions from handoff documents

## Installation

```bash
# Test locally
cc --plugin-dir /path/to/handoff

# Or add to your enabled plugins in settings
```

## Commands

### `/handoff:handoff-in-process`

Creates a handoff document directly in the current conversation. Has full access to session context, producing the richest handoff. Best used when context is at **warning** level (~75%).

```
/handoff:handoff-in-process [optional description of current work]
```

### `/handoff:handoff-subagent`

Creates a handoff document using an isolated subagent. Avoids consuming remaining context. Best used when context is at **critical** level (~90%+).

```
/handoff:handoff-subagent [optional description of current work]
```

### `/handoff:handoff-resume`

Resumes work from a handoff document in a new session. Loads the most recent handoff (or a specified one) and offers options to continue.

```
/handoff:handoff-resume [optional handoff filename]
```

## Automatic Context Monitoring

The plugin includes a Stop hook that runs every time Claude finishes a response. It:

1. Reads the conversation transcript
2. Estimates token usage from content character counts
3. Compares against configurable thresholds
4. Outputs a warning message if thresholds are exceeded

No action is taken automatically - the hook only displays recommendations.

## Configuration

Create `.claude/context-handoff.json` in your project directory to customize thresholds. If this file doesn't exist, sensible defaults are used.

```json
{
  "currentModel": "default",
  "models": {
    "default": {
      "contextWindow": 200000,
      "warningThreshold": 0.75,
      "criticalThreshold": 0.90
    },
    "claude-opus-4-6[1m]": {
      "contextWindow": 1000000,
      "warningThreshold": 0.75,
      "criticalThreshold": 0.90
    }
  },
  "charsPerToken": 4
}
```

### Configuration Fields

- **currentModel**: Which model config to use for threshold calculations. Must match a key in `models`. Defaults to `"default"`.
- **models**: Model-specific settings. Add entries for models you use.
  - **contextWindow**: The model's context window size in tokens.
  - **warningThreshold**: Usage fraction (0-1) that triggers a warning. Default `0.75`.
  - **criticalThreshold**: Usage fraction (0-1) that triggers a critical warning. Default `0.90`.
- **charsPerToken**: Characters-per-token ratio for estimation. Default `4`.

### Common Model IDs

| Model | Context Window | ID |
|-------|---------------|----|
| Claude Opus 4.6 | 200K | `claude-opus-4-6` |
| Claude Opus 4.6 (1M) | 1M | `claude-opus-4-6[1m]` |
| Claude Sonnet 4.6 | 200K | `claude-sonnet-4-6` |
| Claude Haiku 4.5 | 200K | `claude-haiku-4-5` |

## Handoff Files

Handoff documents are stored in `.claude/handoffs/` within your project directory. This directory is automatically added to `.gitignore` since handoffs contain session-specific state.

Files are named with timestamps: `handoff-2026-03-25-143022.md`

## License

MIT - See [LICENSE](../LICENSE)
