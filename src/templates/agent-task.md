---
artifact: agent_task
phase: phase-4-implementation
owner: {{agent}}
assigned_to: {{agent}}
status: blocked | pending_reasoning_approval | in-progress | completed | failed
related_task: {{taskId}}-{{taskTitle}}
task_id: "{{taskId}}-{{N}}"
---

################################################################################
# 🛑 SECURITY BLOCK: TASK NOT ACTIVATED                                        #
################################################################################
# Agent {{agent}} has been assigned to this task.                             #
#                                                                              #
# FORBIDDEN TO USE WRITING OR EXECUTION TOOLS (run, write, create).            #
# Required action: Developer must respond with "YES" to activate.              #
################################################################################

# Agent Task — {{taskId}}-{{N}} ({{taskName}})

## 1. Input (REQUIRED)
- **Objective**: {{objective}}
- **Scope**: {{scope}}
- **Dependencies**: {{dependencies}}

---

## 2. Reasoning (AWAITING ACTIVATION)

> [!IMPORTANT]
> The agent **MUST** complete this section AFTER being activated (Gate A) and BEFORE executing (Gate B).

### Objective Analysis
- (What exactly is being requested?)

### Options Considered
- **Option A**: (description)
- **Option B**: (description)

### Decision Made
- **Chosen Option**: (A/B)
- **Justification**: (why)

---

## 3. Output (REQUIRED)
- **Deliverables**:
  - {{deliverables}}
- **Required Evidence**:
  - {{evidence}}

---

## 4. Implementation Report

> This section is completed by the assigned agent during execution.

### Changes Made
- (Modified files, added functions, etc.)

### Technical Decisions
- (Key decisions and justification)

### Evidence
- (Logs, screenshots, executed tests)

---

## Gate A: Agent Activation (Handover)

The developer **MUST** activate the agent before they can present their reasoning or use tools.

```yaml
activation:
  agent: {{agent}}
  assigned_by: architect-agent
  decision: null # YES | NO
```

## Gate B: Reasoning Approval (Action Plan)

The developer **MUST** approve the reasoning before the agent proceeds with the implementation.

```yaml
reasoning_approval:
  agent: {{agent}}
  decision: null # YES | NO
```

## Gate C: Results Approval (Closure)

```yaml
completion:
  agent: {{agent}}
  decision: null # YES | NO
```

---

## Contractual Rules (AHRP)

1. **Synchronous Gate A**: Forbidden to use tools without `YES` activation.
2. **Synchronous Gate B**: Forbidden to modify code without `YES` Reasoning approval.
3. **Metrics**: Failure of any Gate results in an immediate **Score of 0**.
4. The assigned agent **CANNOT modify** the Input or Output defined by the architect.
