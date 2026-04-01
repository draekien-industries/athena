#!/usr/bin/env node

/**
 * detect-checks.js
 *
 * Scans the current project for available verification commands
 * (test, lint, typecheck, build) by examining common configuration files.
 *
 * Outputs a JSON array of detected commands to stdout.
 *
 * Usage: node detect-checks.js [project-root]
 */

const fs = require("fs");
const path = require("path");

const projectRoot = process.argv[2] || process.cwd();
const detected = [];

function readFile(relativePath) {
  try {
    return fs.readFileSync(path.join(projectRoot, relativePath), "utf-8");
  } catch {
    return null;
  }
}

function readJson(relativePath) {
  const content = readFile(relativePath);
  if (!content) return null;
  try {
    return JSON.parse(content);
  } catch {
    return null;
  }
}

function listDir(dirPath) {
  try {
    return fs.readdirSync(dirPath);
  } catch {
    return null;
  }
}

// --- Node.js / package.json ---
const pkg = readJson("package.json");
if (pkg && pkg.scripts) {
  const scriptMap = {
    test: "npm run test",
    lint: "npm run lint",
    typecheck: "npm run typecheck",
    "type-check": "npm run type-check",
    check: "npm run check",
    build: "npm run build",
  };
  for (const [key, cmd] of Object.entries(scriptMap)) {
    if (pkg.scripts[key]) {
      detected.push(cmd);
    }
  }
}

// --- Go ---
if (readFile("go.mod") !== null) {
  detected.push("go test ./...");
  detected.push("go vet ./...");
  if (
    readFile("golangci-lint.yml") !== null ||
    readFile(".golangci.yml") !== null
  ) {
    detected.push("golangci-lint run");
  }
}

// --- Rust ---
if (readFile("Cargo.toml") !== null) {
  detected.push("cargo test");
  detected.push("cargo clippy -- -D warnings");
  detected.push("cargo build");
}

// --- Python ---
const pyproject = readFile("pyproject.toml");
if (pyproject || readFile("setup.py") !== null) {
  if (pyproject) {
    const pythonTools = {
      pytest: "pytest",
      ruff: "ruff check .",
      mypy: "mypy .",
    };
    for (const [tool, cmd] of Object.entries(pythonTools)) {
      if (pyproject.includes(tool)) {
        detected.push(cmd);
      }
    }
  }
}

// --- .NET ---
const rootFiles = listDir(projectRoot);
if (rootFiles && rootFiles.some((f) => f.endsWith(".sln") || f.endsWith(".csproj"))) {
  detected.push("dotnet test");
  detected.push("dotnet build");
}

// --- Makefile ---
const makefile = readFile("Makefile");
if (makefile) {
  const targets = ["test", "lint", "check", "build"];
  for (const target of targets) {
    const regex = new RegExp(`^${target}\\s*:`, "m");
    if (regex.test(makefile)) {
      detected.push(`make ${target}`);
    }
  }
}

// Deduplicate
const unique = [...new Set(detected)];

console.log(JSON.stringify(unique, null, 2));
