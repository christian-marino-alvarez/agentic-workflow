---
id: workflow.optional.qa
name: Quality Assurance
description: "Testing strategies, regression prevention, and validation gates."
owner: qa-agent
trigger: ["qa"]
type: dynamic
objective: "Validate implementation quality through tests, coverage analysis, and regression checks."
context:
  - .agent/artifacts/<TASK>/task.md
input:
  - .agent/artifacts/<TASK>/task.md
output:
  - .agent/artifacts/<TASK>/qa/qa-report-v1.md
---

# WORKFLOW: optional.qa

## Input
- Acceptance criteria and implemented code changes.

## Output
- Artifact: `.agent/artifacts/<TASK>/qa/qa-report-v1.md`

## Objective
Validate implementation quality through unit tests, integration tests, coverage analysis, and regression prevention.

## Instructions
1. **Run existing tests**: Execute `npm test` and record results.
2. **Write new tests**: If acceptance criteria require tests, create them.
3. **Check coverage**: Verify test coverage meets project standards.
4. **Regression check**: Verify no existing functionality was broken.
5. **Create QA report**: Document results in `qa-report.md`.

## Gate
1. All tests pass.
2. No regressions detected.
3. `qa-report.md` artifact created.

## Pass
- Return to parent phase with results.

## Fail
- Tests failing or regressions detected.