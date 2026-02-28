# Extensio — Agentic Workflow System

## Overview

This directory contains the complete agentic workflow system: rules, roles, constitutions, templates, workflows, skills, and task artifacts. It is consumed by LLM agents at runtime — there is no build step or alias resolver. All references use direct filesystem paths.

---

## Directory Structure

```
.agent/
├── README.md                           # This file
├── init.md                             # Agent system configuration
│
├── rules/
│   ├── constitution/                   # System-wide rules (PERMANENT)
│   │   ├── agents-behavior.md          # Inter-agent discipline, gates, domain isolation
│   │   ├── architecture.md             # Modular architecture (modules, data flow, naming)
│   │   ├── clean-code.md               # SRP, naming, complexity limits
│   │   ├── vscode-extensions.md        # VSCode extension development rules
│   │   └── layers/                     # Layer-specific constitutions
│   │       ├── backend.md              # Business logic, transport agnostic, no vscode/dom
│   │       ├── background.md           # Orchestration, messaging bridge, typed payloads
│   │       └── view.md                 # Lit-only UI, no business logic, event bus comms
│   └── roles/                          # Agent role definitions
│       ├── architect.md                # System design, process governance
│       ├── backend.md                  # Backend layer implementation
│       ├── background.md              # Background layer implementation
│       ├── view.md                     # View layer implementation
│       ├── qa.md                       # Testing, quality assurance
│       ├── researcher.md              # Technical research
│       ├── neo.md                      # Runtime and CLI
│       ├── engine.md                   # Execution engine
│       ├── devops.md                   # Infrastructure
│       └── vscode-specialist.md       # VSCode API expertise
│
├── skills/
│   └── scaffolding/SKILL.md            # Yeoman module generator
│
├── templates/
│   ├── lifecycle/                      # Templates for lifecycle artifacts
│   │   ├── init.md                     # Candidate initialization
│   │   ├── analysis.md                 # Phase 2: Technical analysis
│   │   ├── planning.md                 # Phase 3: Implementation plan
│   │   ├── subtask-plan.md             # Individual subtask plan
│   │   ├── agent-task.md               # Agent task with reasoning + report
│   │   └── verification.md            # Phase 5: Verification checklist
│   └── utils/                          # Auxiliary templates
│       ├── a2ui-catalog.md             # UI component reference
│       ├── changelog.md                # Task changelog
│       ├── research.md                 # Research report
│       └── todo-item.md               # Backlog item
│
├── workflows/
│   ├── core/                           # System workflows (always available)
│   │   ├── init.md                     # Session initialization (language, task, ACs)
│   │   ├── scaffold-module.md          # Generate module via Yeoman
│   │   └── subtask-execution.md       # Generic subtask lifecycle
│   ├── tasklifecycle/                  # Lifecycle phases (sequential)
│   │   ├── 01-init.md                  # Phase 1: Task setup
│   │   ├── 02-analysis.md              # Phase 2: Technical analysis
│   │   ├── 03-planning.md              # Phase 3: Planning + subtask decomposition
│   │   ├── 04-implementation.md        # Phase 4: Subtask execution (router)
│   │   └── 05-review.md               # Phase 5: Verification + results
│   └── optional/                       # Invoked at architect's discretion
│       ├── research.md                 # Deep technical research
│       ├── qa.md                       # Quality assurance
│       └── performance.md             # Performance audit
│
└── artifacts/                          # Task artifacts (generated at runtime)
    ├── candidate/                      # Pre-task staging area
    └── <timestamp>-<title>/            # Task folder (see Artifact Convention below)
```

---

## Artifact Convention

### Naming

All task artifacts follow a strict convention for organizing generated files.

#### Candidate (pre-task)

```
.agent/artifacts/candidate/<TIMESTAMP>-candidate.md
```

- **`<TIMESTAMP>`**: Format `YYYYMMDD` (e.g., `20260226`).
- The timestamp from the candidate is reused to name the task folder.
- Only one candidate exists at a time. Previous candidates are overwritten or archived.

#### Task Folder

```
.agent/artifacts/<TIMESTAMP>-<title-short>/
```

- **`<TIMESTAMP>`**: Same timestamp as the candidate that originated the task.
- **`<title-short>`**: Kebab-case short title (e.g., `fix-login`, `refactor-chat-module`).
- Created when the candidate is approved in Phase 1.

#### Central Task File

```
<TIMESTAMP>-<title-short>/task.md
```

`task.md` is the **single source of truth** for task state. It contains:

```yaml
task:
  id: "<TIMESTAMP>-<title-short>"
  title: "<full task title>"
  description: "<task description>"
  created_at: "<ISO-8601>"
  acceptance_criteria:
    - id: AC-1
      description: "<criterion>"
      status: pending | met | not_met
    - id: AC-2
      description: "<criterion>"
      status: pending | met | not_met
  lifecycle:
    current_phase: "phase-1-init | phase-2-analysis | phase-3-planning | phase-4-implementation | phase-5-review | completed"
    phases:
      phase-1-init:
        status: completed | in_progress | pending
        completed_at: "<ISO-8601>"
      phase-2-analysis:
        status: completed | in_progress | pending
        completed_at: null
      phase-3-planning:
        status: completed | in_progress | pending
        completed_at: null
      phase-4-implementation:
        status: completed | in_progress | pending
        completed_at: null
      phase-5-review:
        status: completed | in_progress | pending
        completed_at: null
  subtasks:
    - id: ST-1
      name: "<name>"
      type: backend | background | view | integration | generic
      agent: "<agent>"
      status: pending | in_progress | completed | failed
```

#### Agent Domain Folders

Each agent's artifacts are stored in their own domain folder:

```
<TIMESTAMP>-<title-short>/
├── task.md
├── architect/
│   ├── analysis-v1.md
│   ├── planning-v1.md
│   ├── ST-1-<name>.md          # subtask plan
│   ├── ST-2-<name>.md
│   ├── verification-v1.md
│   └── results-v1.md
├── backend/
│   └── ST-1-<name>-v1.md       # agent task (implementation report)
├── view/
│   └── ST-2-<name>-v1.md
├── researcher/
│   └── research-v1.md
└── qa/
    └── qa-report-v1.md
```

**Domain folders match the agent role name** (without the `-agent` suffix):
- `architect-agent` → `architect/`
- `backend-agent` → `backend/`
- `background-agent` → `background/`
- `view-agent` → `view/`
- `qa-agent` → `qa/`
- `researcher-agent` → `researcher/`

### Versioning

When an artifact is revised (e.g., after a gate rejection), a new version is created:

```
analysis-v1.md      # original
analysis-v2.md      # after revision
analysis-v3.md      # after second revision
```

**Rules:**
- The **active version** is always the highest version number.
- Previous versions are **immutable** — they serve as history.
- Version `v1` is always the first version (no `v0`).
- The version suffix is always `-vN` before the `.md` extension.

---

## Lifecycle Flow

```
Phase 1: Init
  └─ candidate/<TS>-candidate.md → approved → create <TS>-<title>/task.md

Phase 2: Analysis
  └─ architect/analysis-v1.md (+ subtask identification)

Phase 3: Planning
  └─ architect/planning-v1.md (global plan)
  └─ architect/ST-N-<name>.md (one per subtask)

Phase 4: Implementation (for each subtask)
  └─ <agent>/ST-N-<name>-v1.md (agent task with implementation report)
  └─ Per-subtask developer gate

Phase 5: Review
  └─ architect/verification-v1.md
  └─ architect/results-v1.md
  └─ Final developer gate → task completed
```

### Gate Principle

> **ONE gate = ONE developer interaction** via `<a2ui type="gate">`.
> No additional textual SI/NO prompts. The gate UI element is the sole approval mechanism.
> Templates only RECORD the decision — they do not initiate a separate approval.

---

## Workflow Dispatch

All subtasks are dispatched to a single workflow: `workflows/core/subtask-execution.md`.

The subtask type determines the domain, not the workflow:

| Type | Agent | Constitution | Domain Folder |
|------|-------|-------------|---------------|
| `backend` | backend-agent | `constitution/layers/backend.md` | `backend/` |
| `background` | background-agent | `constitution/layers/background.md` | `background/` |
| `view` | view-agent | `constitution/layers/view.md` | `view/` |
| `integration` | architect-agent | all layer constitutions | `architect/` |
| `generic` | assigned agent | as specified in plan | `<agent>/` |

---

## Design Decisions

### No Index File
The `.agent/` system does not use a centralized index. The directory structure is self-documenting, and all workflows reference files by direct filesystem paths. There is no alias resolution mechanism.

### No Coding-Specific Workflows
Layer-specific coding workflows (coding-backend, coding-view, etc.) were consolidated into the generic `subtask-execution.md`. The subtask plan carries all domain-specific constraints and constitutions. Agent roles enforce domain boundaries.

### Artifacts Are Immutable History
Once a versioned artifact is created, it is never modified. New versions are created instead. The only mutable artifact is `task.md`, which tracks lifecycle state.

---

## Future Considerations

### Development Cycle Agent
As the workflow system grows in complexity, consider creating a dedicated **devcycle-agent** responsible for:
- Maintaining workflow definitions and templates
- Validating artifact structure and versioning
- Enforcing the artifact convention defined in this README
- Auditing cross-references between workflows, templates, and generated artifacts
- Managing lifecycle state transitions in `task.md`

This agent would own the `.agent/workflows/`, `.agent/templates/`, and `.agent/artifacts/` directories, complementing the `architect-agent`'s ownership of `.agent/rules/`.

### Artifact Archival
Define a policy for archiving or cleaning completed task folders. Options:
- Move completed tasks to `.agent/artifacts/archive/`
- Compress old task folders
- Define a retention period

### Template Validation
Consider a CI/build step that validates:
- All templates have valid YAML frontmatter
- All workflow context paths point to existing files
- All agent domain folders use correct naming convention
