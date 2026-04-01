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

function fileExists(relativePath) {
  return fs.existsSync(path.join(projectRoot, relativePath));
}

function readJson(relativePath) {
  try {
    const content = fs.readFileSync(
      path.join(projectRoot, relativePath),
      "utf-8"
    );
    return JSON.parse(content);
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
if (fileExists("go.mod")) {
  detected.push("go test ./...");
  detected.push("go vet ./...");
  if (fileExists("golangci-lint.yml") || fileExists(".golangci.yml")) {
    detected.push("golangci-lint run");
  }
}

// --- Rust ---
if (fileExists("Cargo.toml")) {
  detected.push("cargo test");
  detected.push("cargo clippy -- -D warnings");
  detected.push("cargo build");
}

// --- Python ---
const pyprojectPath = path.join(projectRoot, "pyproject.toml");
if (fs.existsSync(pyprojectPath) || fileExists("setup.py")) {
  if (fs.existsSync(pyprojectPath)) {
    const content = fs.readFileSync(pyprojectPath, "utf-8");
    if (content.includes("pytest")) {
      detected.push("pytest");
    }
    if (content.includes("ruff")) {
      detected.push("ruff check .");
    }
    if (content.includes("mypy")) {
      detected.push("mypy .");
    }
  }
}

// --- .NET ---
const rootFiles = fs.readdirSync(projectRoot);
if (rootFiles.some((f) => f.endsWith(".sln") || f.endsWith(".csproj"))) {
  detected.push("dotnet test");
  detected.push("dotnet build");
}

// --- Makefile ---
if (fileExists("Makefile")) {
  const makefile = fs.readFileSync(
    path.join(projectRoot, "Makefile"),
    "utf-8"
  );
  const targets = ["test", "lint", "check", "build"];
  for (const target of targets) {
    const regex = new RegExp(`^${target}\\s*:`, "m");
    if (regex.test(makefile) && !detected.some((d) => d.includes(target))) {
      detected.push(`make ${target}`);
    }
  }
}

// Deduplicate
const unique = [...new Set(detected)];

console.log(JSON.stringify(unique, null, 2));
