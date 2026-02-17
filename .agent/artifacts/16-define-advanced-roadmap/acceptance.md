---
artifact: acceptance
phase: phase-0-acceptance-criteria
owner: architect-agent
status: draft
related_task: 16-define-advanced-roadmap
---

# Acceptance Criteria — 16-define-advanced-roadmap

## Agent Identification
`🏛️ **architect-agent**: Criteria for Advanced Roadmap Definition.`

## 1. Consolidated Definition
The task is to **design and document the new technical roadmap** that supersedes the current backlog. This new roadmap will focus on enabling advanced agentic capabilities: OAuth, Agent-Model binding, and Enhanced UI (Chat/Timeline/Workflows).

## 2. Clarification Answers
1.  **Scope**: Delete old backlog, create new one.
2.  **Persistence**: Reuse `SettingsStorage` (JSON).
3.  **UI**: Lit + VSCode Webview Toolkit.
4.  **Priority**: OAuth & Agent Mapping first.
5.  **Workflows**: Analyze best libraries (e.g., React Flow vs D3) during the task.

## 3. Verifiable Acceptance Criteria

### AC-1: New Roadmap Artifact
- **Given**: The user wants a clean slate.
- **When**: The task is completed.
- **Then**: `ROADMAP-BACKLOG.md` is overwritten with the new "Advanced Agentic" backlog structure. The old content is either archived or removed.

### AC-2: Domain D1 (Settings) Definition
- **Given**: Requirement for OAuth and Model Registry.
- **When**: Inspecting D1 section in new roadmap.
- **Then**: It must include tasks for:
  - OAuth Token Management.
  - Model Registry UI (CRUD).

### AC-3: Domain D3 (Backend) Definition
- **Given**: Requirement for Agent-Model binding.
- **When**: Inspecting D3 section in new roadmap.
- **Then**: It must include tasks for:
  - Backend support for `Role -> Model` mapping.
  - Dynamic instantiation of agents with specific models.

### AC-4: Domain D2 (UI) Definition
- **Given**: Requirement for Filters, Timeline, and Workflows.
- **When**: Inspecting D2 section in new roadmap.
- **Then**: It must include tasks for:
  - Chat Filters (Agent/Thread).
  - Agent Task Timeline View.
  - Workflow Visualizer (Node Graph).

### AC-5: Prioritization
- **Given**: User stated OAuth/Mapping are critical.
- **When**: Inspecting "High Priority" section.
- **Then**: These tasks must be listed as the immediate next steps.

## 4. Developer Approval
```yaml
approval:
  developer:
    decision: SI
    date: 2026-02-17T18:22:00+01:00
    comments: "Approved by user"
```
