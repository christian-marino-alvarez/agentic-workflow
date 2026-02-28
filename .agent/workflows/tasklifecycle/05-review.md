---
id: workflow.tasklifecycle.05-review
name: Review
description: "Phase 5: Verification, quality assurance, and final results presentation."
owner: architect-agent
trigger: ["phase-05", "review"]
type: static
objective: "Verify the implementation against acceptance criteria, run quality checks, and present final results."
context:
  - .agent/artifacts/<TASK>/task.md
  - .agent/artifacts/<TASK>/architect/planning-v1.md
input:
  - .agent/artifacts/<TASK>/task.md
  - Implemented code changes from Phase 4
output:
  - .agent/artifacts/<TASK>/architect/verification-v1.md
  - .agent/artifacts/<TASK>/architect/results-v1.md
---

# WORKFLOW: tasklifecycle.05-review

## Input
- Task definition with acceptance criteria: `.agent/artifacts/<TASK>/task.md`
- Implemented code changes from Phase 4.

## Output
- Artifact: `.agent/artifacts/<TASK>/architect/verification-v1.md`
- Artifact: `.agent/artifacts/<TASK>/architect/results-v1.md`

## Objective
Verify the implementation against acceptance criteria. Optionally invoke QA and performance subtasks. Present final results.

## Instructions
1. **Activate architect-agent** (the UI handles identification — do NOT prefix responses).
2. **Update task.md**: Set `current_phase` to `phase-5-review`.
3. **Verify acceptance criteria**: Check each criterion from `task.md` against the implementation. Document in `<TASK>/architect/verification-v1.md`.
4. **Optional**: Invoke `optional/qa` (output: `<TASK>/qa/qa-report-v1.md`) and/or `optional/performance` (output: `<TASK>/architect/performance-report-v1.md`) subtasks if relevant.
5. **Create results report**: Compile findings into `<TASK>/architect/results-v1.md`.
6. **Update task.md**: Update all acceptance criteria statuses (`met` | `not_met`).
7. **Present Results (Gate)**: You MUST include artifact reference and gate components in `ui_intent`:

"ui_intent": [
  {
    "type": "artifact",
    "id": "verification-doc",
    "label": "verification-v1.md",
    "path": ".agent/artifacts/<TASK>/architect/verification-v1.md",
    "content": "Verification checklist"
  },
  {
    "type": "artifact",
    "id": "results-doc",
    "label": "results-v1.md",
    "path": ".agent/artifacts/<TASK>/architect/results-v1.md",
    "content": "Final results"
  },
  {
    "type": "gate",
    "id": "gate-eval",
    "label": "Final Results — Accept",
    "options": ["SI", "NO"]
  }
]

## Gate
1. All acceptance criteria verified and documented.
2. Artifacts created.
3. Build succeeds.
4. Developer acceptance via gate.

## Pass
- Update `task.md`: set `phase-5-review` status to `completed`, `current_phase` to `completed`.
- Task completed. Lifecycle finished.

## Fail
- Criteria not met. Delegate corrections and re-verify.