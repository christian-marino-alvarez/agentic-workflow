# Acceptance Criteria: Beta Release of Agentic System Structure

> **Task**: Beta Release of Agentic System Structure
> **Strategy**: Short

## 1. Scope & Deliverables
- [ ] **README.md Updated**: Must reflect the latest capabilities and structure of `src/agentic-system-structure`.
- [ ] **Clean Distribution**: The published package MUST NOT include the VSCode extension code, only CLI and Agnostic Agent System Structure.
- [ ] **Core Structure**: The published package MUST include various core files (`dist/agent`) derived from `src/agentic-system-structure`.
- [ ] **CLI Functionality**: The `agentic-workflow` CLI must function independently of VSCode.

## 2. Release & Versioning
- [ ] **Version Bump**: Update `package.json` to the next beta version (e.g., `1.22.0-beta.8`).
- [ ] **Branching**: Create a release branch named `ci/publish/v<version>`.
- [ ] **Automation**: rely on existing GitHub Action `publish.yml` for the actual npm publish.

## 3. Verification (Pre-Release)
- **Local Install Test**:
    1. Build the project locally.
    2. Create a clean, temporary directory.
    3. Execute `init` using the local CLI build.
    4. **Pass Condition**: The `.agent` directory is created, populated, and `init.md` can be generated without errors.
    5. **Pass Condition**: No references to VSCode APIs cause runtime errors.
