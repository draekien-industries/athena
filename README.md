# athena

A Claude Code plugin marketplace by [Draekien Industries](https://github.com/draekien-industries). Athena provides a collection of plugins that extend Claude Code with specialized knowledge and workflows for AI-assisted development.

## Plugins

### [handoff](./handoff)

Monitors context usage and creates handoff documents for seamless session continuity. Includes a Stop hook that warns when context is getting large, commands for creating handoff documents (both in-process and via subagent), and a resume command for picking up where you left off in a new session.

### [moirai](./moirai)

Plan, implement, and verify development workflows backed by Linear issue tracking. Named after the three Greek Fates, each command maps to a phase of the development lifecycle: Clotho (`/moirai:plan`) spins the thread of what will be built, Lachesis (`/moirai:implement`) measures out the work across parallel subagents in isolated worktrees, and Atropos (`/moirai:verify`) performs the final check against the original PRD. Includes a [Linear MCP server](https://linear.app/docs/mcp#claude-code) but requires you to authenticate using `/mcp` after you add the plugin.

## Installation

### Add the marketplace

```bash
claude plugin marketplace add draekien-industries/athena
```

This registers athena as a plugin source. By default it's added to your user scope. To add it for a specific project or local scope:

```bash
claude plugin marketplace add draekien-industries/athena --scope project
claude plugin marketplace add draekien-industries/athena --scope local
```

### Install a plugin

```bash
claude plugin install handoff
```

If you have multiple marketplaces, specify which one:

```bash
claude plugin install handoff@athena
```

To install for a specific scope (defaults to `user`):

```bash
claude plugin install handoff --scope project
```

### Direct plugin usage

To try a plugin without installing, use `--plugin-dir` for a single session:

```bash
claude --plugin-dir /path/to/athena/handoff
```

### Managing plugins

```bash
# List installed plugins
claude plugin list

# Disable a plugin
claude plugin disable handoff

# Re-enable a plugin
claude plugin enable handoff

# Update a plugin
claude plugin update handoff

# Uninstall a plugin
claude plugin uninstall handoff
```

## Contributing

Each plugin lives in its own directory at the repository root. A plugin directory contains:

```
plugin-name/
├── .claude-plugin/
│   └── plugin.json          # Plugin manifest (name, version, description)
├── commands/                 # User-invocable slash commands
├── skills/                   # Internal knowledge and SOPs
├── agents/                   # Autonomous subagents
├── hooks/                    # Event-driven automation
│   └── hooks.json
├── scripts/                  # Hook scripts and utilities
└── README.md                 # Plugin documentation
```

New plugins should be registered in `.claude-plugin/marketplace.json` at the repository root.

## License

MIT
