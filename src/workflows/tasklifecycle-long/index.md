---
id: workflow.tasklifecycle-long
owner: architect-agent
version: 6.0.0
severity: PERMANENT
description: Orchestrates the complete (Long) lifecycle of a task starting from a valid init.
trigger:
  commands: ["tasklifecycle-long", "/tasklifecycle-long"]
blocking: true
---

# WORKFLOW: tasklifecycle-long (Index)

## Required Indexes (MANDATORY)
This workflow does **NOT** define aliases outside its domain (`taskcycle-long`).
To use artifacts and templates, global indexes **MUST** be loaded:

- Artifacts index: `.agent/artifacts/index.md`
- Templates index: `.agent/templates/index.md`

## Domain Aliases: `taskcycle-long` (MANDATORY)
This workflow defines aliases **only** for the `taskcycle-long` (task lifecycle long) domain.
There is **one unique namespace** `aliases.taskcycle-long.phases.*` containing:
- `id`: Phase ID
- `workflow`: Path to the phase workflow file

## Aliases (YAML)
```yaml
aliases:
  taskcycle-long:
    phases:
      phase_0:
        id: phase-0-acceptance-criteria
        workflow: .agent/workflows/tasklifecycle-long/phase-0-acceptance-criteria.md
      phase_1:
        id: phase-1-research
        workflow: .agent/workflows/tasklifecycle-long/phase-1-research.md
      phase_2:
        id: phase-2-analysis
        workflow: .agent/workflows/tasklifecycle-long/phase-2-analysis.md
      phase_3:
        id: phase-3-planning
        workflow: .agent/workflows/tasklifecycle-long/phase-3-planning.md
      phase_4:
        id: phase-4-implementation
        workflow: .agent/workflows/tasklifecycle-long/phase-4-implementation.md
      phase_5:
        id: phase-5-verification
        workflow: .agent/workflows/tasklifecycle-long/phase-5-verification.md
      phase_6:
        id: phase-6-results-acceptance
        workflow: .agent/workflows/tasklifecycle-long/phase-6-results-acceptance.md
      phase_7:
        id: phase-7-evaluation
        workflow: .agent/workflows/tasklifecycle-long/phase-7-evaluation.md
      phase_8:
        id: phase-8-commit-push
        workflow: .agent/workflows/tasklifecycle-long/phase-8-commit-push.md
```

## Input (REQUIRED)
- `init` artifact (bootstrap contract) exists as defined in the **Artifacts index**:
  - `artifacts.candidate.init`
- The `init` artifact **MUST** contain in its YAML block:
  - `language.value`: Not empty
  - `language.confirmed == true`
- The developer **MUST have responded** to the question in **Section 8 of the `init` workflow**:
  - Task definition
  - Task objective

## Output (REQUIRED)
- Create task candidate (defined in the **Artifacts index**):
  - `artifacts.candidate.task`
- The `task candidate` file **MUST** exactly follow the template (defined in the **Templates index**):
  - `templates.task`

## Objective (ONLY)
- Verify minimum requirements to **start Phase 0** (mandatory inputs).
- Create the **task candidate** using the contractual template.
- Verify that phase workflows for the `taskcycle-long` domain exist and can be loaded.
- If any requirement is missing, **block** and request the minimum action needed to start **Phase 0**.

> This workflow does **NOT** track phase completion.
> Phase validation and advancement is the responsibility of the `architect-agent` within each phase (via its own gate).

## Dispatch / Routing (MANDATORY)
- Phase routing **MUST** be based on `task.phase.current`.
- The active phase **MUST** be mapped to `aliases.taskcycle-long.phases.*.workflow`.
- If no mapping exists → **FAIL** (invalid phase or corrupt index).
- Only the `architect-agent` can change `task.phase.current`.

## Mandatory Steps
1. Load global indexes:
   - Load `.agent/artifacts/index.md` and `.agent/templates/index.md`.
   - If they cannot be loaded → go to **Step 7 (FAIL)**.

2. Verify input:
   - Check if `artifacts.candidate.init` exists.
   - Read its YAML block and validate:
     - `language.value`: Not empty
     - `language.confirmed == true`
   - If validation fails → go to **Step 7 (FAIL)**.

3. Load task contractual template:
   - `templates.task`
   - If it doesn't exist or cannot be loaded → go to **Step 7 (FAIL)**.

4. Create candidate directory (if missing):
   - `artifacts.candidate.dir`

5. Create task candidate artifact:
   - Write `artifacts.candidate.task`
   - Content **MUST** comply with the template (do not omit mandatory keys).
   - **MUST include** information provided by the developer:
     - Task description
     - Task objective
   - Initialize `task.phase.current` to `aliases.taskcycle-long.phases.phase_0.id`.
   - If creation/writing fails → go to **Step 7 (FAIL)**.

6. Verify phase availability (existence/load check only)
   - Phase workflows **MUST** exist as files (they are not executed here):
     - `aliases.taskcycle-long.phases.phase_0.workflow`
     - `aliases.taskcycle-long.phases.phase_1.workflow`
     - `aliases.taskcycle-long.phases.phase_2.workflow`
     - `aliases.taskcycle-long.phases.phase_3.workflow`
     - `aliases.taskcycle-long.phases.phase_4.workflow`
     - `aliases.taskcycle-long.phases.phase_5.workflow`
     - `aliases.taskcycle-long.phases.phase_6.workflow`
     - `aliases.taskcycle-long.phases.phase_7.workflow`
     - `aliases.taskcycle-long.phases.phase_8.workflow`
   - If any are missing → go to **Step 7 (FAIL)**.

7. FAIL (mandatory)
   - Declare `tasklifecycle` as **NOT ready to start Phase 0**.
   - Specify the applicable case(s):
     - Global indexes not loadable (`.agent/artifacts/index.md` / `.agent/templates/index.md`)
     - `init` does not exist (`artifacts.candidate.init`)
     - Language undefined or unconfirmed in `init`
     - Template inaccessible (`templates.task`)
     - Could not create `task candidate` (`artifacts.candidate.task`)
     - One or more phase workflows are missing (`aliases.taskcycle-long.phases.*.workflow`)
   - Request minimum corrective action:
     - Run `init` logic
     - Confirm language
     - Fix global indexes
     - Fix permissions/path for candidate creation
     - Create/restore missing phase workflow
   - End blocked: until errors are fixed, **Phase 0 cannot begin**.

## Official Phase Execution Order
Lifecycle phases **MUST be executed strictly in the established numerical order**.
Skipping, reordering, or parallelizing phases is not permitted.

Mandatory Order:
0. `aliases.taskcycle-long.phases.phase_0.id`
1. `aliases.taskcycle-long.phases.phase_1.id`
2. `aliases.taskcycle-long.phases.phase_2.id`
3. `aliases.taskcycle-long.phases.phase_3.id`
4. `aliases.taskcycle-long.phases.phase_4.id`
5. `aliases.taskcycle-long.phases.phase_5.id`
6. `aliases.taskcycle-long.phases.phase_6.id`
7. `aliases.taskcycle-long.phases.phase_7.id`
8. `aliases.taskcycle-long.phases.phase_8.id`

## Pass
- `artifacts.candidate.task` is created from `templates.task`.
- All required phase workflows exist.

## Gate (REQUIRED)
Requirements (all mandatory):
1. `artifacts.candidate.task` exists.
2. `artifacts.candidate.task` complies with the `templates.task` template.
3. All phase workflows listed in Step 6 are available (exist).

If Gate FAIL:
- Execute **Step 7 (FAIL)**.
