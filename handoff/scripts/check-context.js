#!/usr/bin/env node

/**
 * check-context.js - Stop hook script for handoff plugin
 *
 * Estimates context token usage by parsing the transcript JSONL,
 * counting content characters, and comparing against model-aware thresholds.
 * Outputs tiered warnings when context usage is high.
 */

const fs = require("fs");
const path = require("path");

const DEFAULT_CONFIG = {
  currentModel: "default",
  models: {
    default: {
      contextWindow: 200000,
      warningThreshold: 0.75,
      criticalThreshold: 0.9,
    },
  },
  charsPerToken: 4,
};

/**
 * Read stdin with a timeout to avoid hanging on Windows/Git Bash.
 */
function readStdin(timeoutMs = 5000) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    const timer = setTimeout(() => {
      process.stdin.destroy();
      resolve(chunks.join(""));
    }, timeoutMs);

    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => chunks.push(chunk));
    process.stdin.on("end", () => {
      clearTimeout(timer);
      resolve(chunks.join(""));
    });
    process.stdin.on("error", (err) => {
      clearTimeout(timer);
      reject(err);
    });
  });
}

/**
 * Load configuration from .claude/context-handoff.json in the project directory.
 * Falls back to defaults if the file doesn't exist or is invalid.
 */
function loadConfig(cwd) {
  const configPath = path.join(cwd, ".claude", "context-handoff.json");
  try {
    if (fs.existsSync(configPath)) {
      const userConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));
      return {
        currentModel: userConfig.currentModel || DEFAULT_CONFIG.currentModel,
        models: { ...DEFAULT_CONFIG.models, ...userConfig.models },
        charsPerToken: userConfig.charsPerToken || DEFAULT_CONFIG.charsPerToken,
      };
    }
  } catch {
    // Invalid config, use defaults
  }
  return DEFAULT_CONFIG;
}

/**
 * Parse the transcript JSONL file and sum up content character counts.
 * Only reads content strings to estimate token usage.
 */
function estimateTokensFromTranscript(transcriptPath, charsPerToken) {
  try {
    if (!fs.existsSync(transcriptPath)) {
      return 0;
    }

    const content = fs.readFileSync(transcriptPath, "utf8");
    const lines = content.split("\n").filter((line) => line.trim());

    let totalChars = 0;

    for (const line of lines) {
      try {
        const entry = JSON.parse(line);

        // Count characters in message content
        if (entry.content) {
          if (typeof entry.content === "string") {
            totalChars += entry.content.length;
          } else if (Array.isArray(entry.content)) {
            for (const block of entry.content) {
              if (typeof block === "string") {
                totalChars += block.length;
              } else if (block && typeof block.text === "string") {
                totalChars += block.text.length;
              } else if (block && typeof block.input === "string") {
                totalChars += block.input.length;
              } else if (block && typeof block.content === "string") {
                totalChars += block.content.length;
              }
            }
          }
        }

        // Count tool inputs and results
        if (entry.tool_input && typeof entry.tool_input === "string") {
          totalChars += entry.tool_input.length;
        }
        if (entry.tool_result && typeof entry.tool_result === "string") {
          totalChars += entry.tool_result.length;
        }
      } catch {
        // Skip malformed lines
      }
    }

    return Math.round(totalChars / charsPerToken);
  } catch {
    return 0;
  }
}

/**
 * Format a token count for human-readable display.
 */
function formatTokens(tokens) {
  if (tokens >= 1000000) {
    return `${(tokens / 1000000).toFixed(1)}M`;
  }
  if (tokens >= 1000) {
    return `${(tokens / 1000).toFixed(0)}K`;
  }
  return `${tokens}`;
}

async function main() {
  try {
    const input = await readStdin();
    if (!input.trim()) {
      process.exit(0);
    }

    const hookInput = JSON.parse(input);
    const transcriptPath = hookInput.transcript_path;
    const cwd = hookInput.cwd || process.cwd();

    if (!transcriptPath) {
      process.exit(0);
    }

    const config = loadConfig(cwd);
    const modelKey = config.currentModel || "default";
    const modelConfig = config.models[modelKey] || config.models.default;

    if (!modelConfig) {
      process.exit(0);
    }

    const estimatedTokens = estimateTokensFromTranscript(
      transcriptPath,
      config.charsPerToken
    );

    if (estimatedTokens === 0) {
      process.exit(0);
    }

    const usage = estimatedTokens / modelConfig.contextWindow;
    const usagePercent = Math.round(usage * 100);

    if (usage >= modelConfig.criticalThreshold) {
      // Critical threshold - recommend subagent handoff
      const output = [
        "",
        `[handoff] Context usage is critically high (~${usagePercent}% of ${formatTokens(modelConfig.contextWindow)} token window).`,
        "",
        "Strongly recommend creating a handoff document and starting a fresh session:",
        "",
        "  1. Run: /handoff:handoff-subagent",
        "  2. Start a new session",
        "  3. Run: /handoff:handoff-resume",
        "",
      ].join("\n");

      process.stdout.write(output);
    } else if (usage >= modelConfig.warningThreshold) {
      // Warning threshold - recommend in-process handoff
      const output = [
        "",
        `[handoff] Context is getting large (~${usagePercent}% of ${formatTokens(modelConfig.contextWindow)} token window).`,
        "",
        "Consider creating a handoff document soon:",
        "",
        "  Run: /handoff:handoff-in-process",
        "",
      ].join("\n");

      process.stdout.write(output);
    }

    // Always approve the stop (don't block it)
    process.exit(0);
  } catch {
    // Fail silently - don't block the stop event
    process.exit(0);
  }
}

main();
