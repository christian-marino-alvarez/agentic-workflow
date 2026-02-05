# Developer Guide & Dogfooding Protocol

**Welcome to the Agentic Workflow development team.**

This project uses a "Dogfooding" approach: we use the agentic workflow system to build the agentic workflow system. This creates a circular dependency that requires a strict setup process to avoid version mismatches.

## 🚨 The Golden Rule

**You MUST link your local source code to become the global executable.**

If you skip this, you will be running an outdated version of the CLI (installed via npm or from a previous build) against your fresh source code. This leads to "missing tool" errors and phantom bugs.

## Fast Track Setup

Run this single command immediately after cloning or pulling changes:

```bash
npm run dev:setup
```

**What this does:**
1.  Usage `npm run build`: Compiles your TypeScript source to `dist/`.
2.  Runs `npm link`: Symlinks the global `agentic-workflow` command to your local `bin/cli.js`.

---

## Daily Workflow

### 1. Making Changes
When you modify TypeScript code (`src/`), you must recompile for the CLI to see it.

```bash
npm run dev:refresh
```
*(This is faster than `dev:setup` because it skips the linking step).*

### 2. Verify Your Version
Always ensure you are running your local version:

```bash
agentic-workflow --version
```
It should match the `version` in `package.json`.

---

## Troubleshooting

### "The prompt says I'm running an old version"
You likely forgot to build or link.
**Fix:** Run `npm run dev:setup`.

### "MCP tools are missing in the agent"
The agent connects to the MCP server spawned by the CLI. If the CLI is outdated, the server is outdated.
**Fix:**
1.  `npm run dev:refresh`
2.  Restart your agent session or kill any running `node` processes.

### "How do I test just the compilation?"
```bash
npm run build
```
