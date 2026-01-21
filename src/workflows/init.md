---
id: workflow.init
owner: architect-agent
version: 4.1.0
severity: PERMANENT
trigger:
  commands: ["init", "/init", "/bootstrap", "/agentic-init"]
blocking: true
---

# WORKFLOW: init

## 0. Role Activation and Prefix (MANDATORY)
- The agent **MUST** start their intervention by identifying themselves.
- Message: `🏛️ **architect-agent**: Starting work session.`

## Input (REQUIRED)
- None (init).

## Objective (ONLY)
- Activate the **architect-agent** role.
- Load the prebuilt bootstrap bundle directly from the core path (no index traversal).
- Capture developer language, name, strategy, and first task description (one question at a time).
- Create the **task candidate** artifact `init.md`.

## Mandatory Steps
1. Load the prebuilt bootstrap bundle from the core path: `${agent.core.root}/bootstrap.md`.
2. Save the bundle content to `.agent/artifacts/candidate/bootstrap.md`.
3. Ask the developer to confirm language (**YES**). Do not continue until answered.
4. Ask the developer for their preferred name (used in all future responses). Do not continue until answered.
5. Ask the developer to choose lifecycle strategy: **short (fast)** or **long**. Do not continue until answered.
6. Ask for the first task description (1-3 sentences). Do not continue until answered.
7. Create the `init.md` artifact using `templates.init`.
8. Evaluate Gate.
   - The developer **MUST** explicitly confirm with a **YES**.

## Output (REQUIRED)
- Created artifact: `artifacts.candidate.init` (from `templates.init`).
- Created artifact: `artifacts.candidate.bootstrap` (bundle from `${agent.core.root}/bootstrap.md`).

## Pass
- `init.md` is created from `templates.init`.
- Language is confirmed, developer name is captured, strategy is set, and task description exists.
- `bootstrap.md` exists and contains the bundle.

## Gate (REQUIRED)
Requirements (all mandatory):
1. `artifacts.candidate.init` exists.
2. `artifacts.candidate.bootstrap` exists.
3. In `init.md` YAML:
   - `language.confirmed == true`
   - `developer.name` is defined
   - `strategy` is defined
   - `task.description` is defined
4. The developer has explicitly approved with **YES**.

If Gate FAIL:
- Block until resolved.
