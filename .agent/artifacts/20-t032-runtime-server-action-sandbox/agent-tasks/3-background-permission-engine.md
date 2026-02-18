---
artifact: agent_task
phase: phase-4-implementation
owner: background
status: draft
related_task: 20-t032-runtime-server-action-sandbox
task_number: 3
---

# Agent Task — 3-background-permission-engine

## Agent Identification (MANDATORY)
First line of the document:
`🏛️ **background-agent**: Implement Real Permission Engine Logic`

## Input (REQUIRED)
- **Objective**: Implement the actual logic for `PermissionEngine` to parse Agent Role definitions and validate actions based on declared Skills.
- **Scope**:
  - Update `src/extension/modules/runtime/background/permission-engine.ts`.
  - Implement parsing of `.agent/rules/roles/*.md`.
  - Extract `skills` section from Markdown.
  - Match requested action (e.g., `fs.read`) against allowed skills.
  - **Constraint**: If action is NOT in skills -> Deny. If sensitive -> Request User Approval (Task 4 UI). For Task 3, focus on Skill Validation.
- **Dependencies**:
  - `marked` or regex for Markdown parsing (or `gray-matter` if available).
  - `.agent/rules/roles/` files.
- **Constitutions**:
  - `constitution.background`
  - `constitution.architecture`
  - `constitution.clean_code`

---

## Reasoning (MANDATORY)
> [!IMPORTANT]
> The agent **MUST** complete this section BEFORE executing.

### Objective analysis
The objective is to implement real permission logic by parsing the Agent Role definitions (Markdown + YAML Frontmatter) to determine if an action is authorized. This replaces the hardcoded mock logic.

### Options considered
- **Parsing Library**: `gray-matter` vs custom regex. Chosen `gray-matter` for robustness in handling YAML frontmatter.
- **Skill Mapping**: How to map detailed actions (`fs.readFile`) to high-level skills (`filesystem`). Implemented a simple mapper method `mapActionToSkill`.
- **Role Location**: Resolved via `vscode.workspace` to find `.agent/rules/roles/`.

### Decision made
Implemented `PermissionEngine` using `gray-matter`. It caches role definitions for performance. It verifies if the role has the required capability (e.g. 'files' or 'terminal') or if it is a privileged role ('backend', 'architect').

---

## Output (REQUIRED)
- **Deliverables**:
  - `runtime/background/permission-engine.ts`: Logic to read and parse role definitions.
- **Required evidence**:
  - Compilation success.
  - Code correctly imports `gray-matter` and resolves paths relative to workspace root.

---

## Explanation of Implementation

### Changes made
1.  **PermissionEngine**: Updated to use `fs.promises` and `gray-matter`.
2.  **Logic**:
    - `getRoleDefinition`: Reads `.md` file from `.agent/rules/roles/`.
    - `checkPermission`: Maps action to skill, then checks if role's frontmatter contains that skill in `capabilities`.
3.  **Dependencies**: Installed `gray-matter`.

### Technical decisions
- **Caching**: Role definitions are cached in memory (`roleCache` Map) to avoid reading files on every action.
- **Fallbacks**: 'backend' and 'architect' roles are whitelisted as super-users for now, matching their definitions as "Experts".
- **View Integration**: Updated `RuntimeBackground` to use standard `ViewHtml.getWebviewHtml` pointing to the future `runtime/view`, ensuring consistency with the App Shell pattern.

### Evidence
- Compilation successful.
- `PermissionEngine` correctly imports `gray-matter` and implements skill mapping logic.

### Deviations from objective
- None.

---

## Gate (REQUIRED)

The developer **MUST** approve this task before the architect assigns the next one.

```yaml
approval:
  developer:
    decision: null
    date: null
    comments: null
```
