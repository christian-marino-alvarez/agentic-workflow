# Brief: Beta Release of Agentic System Structure

> **Task**: Beta Release of Agentic System Structure
> **Strategy**: Short

## 1. Analysis (Current State)
- **Repo**: `agentic-workflow`
- **Current Version**: `1.22.0-beta.7`
- **Structure**: `src/agentic-system-structure` contains the source of truth for the agentic system.
- **Publishing**: Automated via `publish.yml` on `ci/publish` branch merge.
- **Exclusion**: `package.json` correctly excludes `dist/extension` but includes `dist/agent` (copied from `src/agentic-system-structure`).

## 2. Implementation Plan
### Step 1: Verification (Pre-Flight)
- Build the project locally (`npm run build`).
- Validate that `dist/extension` is excluded effectively or ignored by the `files` directive.
- Run a local `init` test in a clean directory to ensure the CLI works without the VSCode environment.

### Step 2: Documentation
- Update `README.md` to reflect the latest state of the structure (e.g., number of available workflows, rules, etc.).

### Step 3: Versioning & Release
- Bump version to `1.22.0-beta.8` (or next available).
- Create branch `ci/publish/v1.22.0-beta.8`.
- Commit changes (README + package.json).

### Step 4: Publish
- Push branch to origin.
- (User action required to merge PR if branch protection exists, or push directly if allowed).

## 3. Complexity Evaluation
- **Level**: LOW
- **Risk**: Low (Beta release, limited scope).
- **Breaking Changes**: None expected in the CLI logic itself.

## 4. Agent Evaluation
- **Architect**: Plan defined.
- **Verification**: Essential to prove CLI independence from VSCode.
- **DevOps**: Standard release process.
