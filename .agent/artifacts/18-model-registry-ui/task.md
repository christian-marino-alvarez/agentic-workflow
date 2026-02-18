---
id: 18
title: model-registry-ui
owner: architect-agent
strategy: long
---

# Task 18: Model Registry UI

## Identification
- id: 18
- title: model-registry-ui
- scope: current
- owner: architect-agent

## Origin
- created_from:
  - workflow: tasklifecycle
  - source: roadmap
  - task_17: oauth-infrastructure

## Task Description
Refactor the existing Settings module to implement a secure **Model Registry**. This involves upgrading the storage mechanism from `settings.json` to `vscode.SecretStorage` for sensitive data, implementing a hybrid authentication UI (OAuth vs API Key), and adding connection validation capabilities.

## Objective
Enable users to securely manage LLM credentials (API Keys and OAuth Tokens) for Codex, Gemini, and Claude, with immediate feedback on connection validity.

## Lifecycle State (SINGLE SOURCE OF TRUTH)

```yaml
task:
  id: "18"
  title: "model-registry-ui"
  strategy: "long"
  artifacts:
    supplemental: []
  phase:
    current: "phase-5-verification"
    validated_by: "architect-agent"
    updated_at: "2026-02-18T08:00:00+01:00"
  lifecycle:
    phases:
      phase-0-acceptance-criteria:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-02-18T07:22:00+01:00"
      phase-1-research:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-02-18T07:35:00+01:00"
      phase-2-analysis:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-02-18T07:45:00+01:00"
      phase-3-planning:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-02-18T07:55:00+01:00"
      phase-4-implementation:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-02-18T08:00:00+01:00"
      phase-5-verification:
        completed: true
        validated_by: "architect-agent"
        validated_at: "2026-02-18T08:45:00+01:00"
      phase-6-results-acceptance:
        completed: false
        validated_by: null
        validated_at: null
      phase-7-evaluation:
        completed: false
        validated_by: null
        validated_at: null
      phase-8-commit-push:
        completed: false
        validated_by: null
        validated_at: null
```

---

## 2. Definition and Scope (Contract)
- **Acceptance Criteria**: [acceptance.md](file:///Users/milos/Documents/workspace/agentic-workflow/.agent/artifacts/18-model-registry-ui/acceptance.md)
- **Alias**: `task.acceptance`

---

## 3. Implementation Checklist
- [x] Backend Core Logic <!-- id: 1 -->
- [x] Background Orchestration <!-- id: 2 -->
- [x] View Implementation (Lit) <!-- id: 3 -->
- [x] Verification <!-- id: 4 -->
