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
- Load the prebuilt bootstrap bundle from the core alias (constitutions + indexes + architect role).
- Capture developer language, name, strategy, and first task description (one question at a time).
- Create the **task candidate** artifact `init.md`.

## Mandatory Steps
1. Read `.agent/index.md` and resolve the alias `agent.core.bootstrap`.
2. Load the prebuilt bootstrap bundle file from that alias into context.
3. Save the bundle content to `.agent/artifacts/candidate/bootstrap.md`.
4. Ask the developer to confirm language (**YES**). Do not continue until answered.
5. Ask the developer for their preferred name (used in all future responses). Do not continue until answered.
6. Ask the developer to choose lifecycle strategy: **short (fast)** or **long**. Do not continue until answered.
7. Ask for the first task description (1-3 sentences). Do not continue until answered.
8. Create the `init.md` artifact using `templates.init`.
9. Evaluate Gate.
   - The developer **MUST** explicitly confirm with a **YES**.

## Output (REQUIRED)
- Created artifact: `artifacts.candidate.init` (from `templates.init`).
- Created artifact: `artifacts.candidate.bootstrap` (bundle from `agent.core.bootstrap`).

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
