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
- Load the minimum bootstrap indices.
- Load the constitution rules into context.
- Detect the conversation language and confirm explicitly.
- **Select the lifecycle strategy (Long/Short)**.
- Create the **task candidate** artifact `init.md`.

## Mandatory Steps
1. **Reasoning (MANDATORY)**
   - Explain to the developer what will be done in this phase and why.
2. Use the `bootstrap_context` tool to load indices, constitutions, and core roles in a single step.
3. If `bootstrap_context` is unavailable, use the `run_command` tool to read `.agent/index.md` and the referenced core paths, then assemble the bundle manually.
4. If `run_command` is unavailable, load the bootstrap indices and base constitutions manually.
5. Save the bundle output to `.agent/artifacts/candidate/bootstrap.md`.
6. Detect preferred language and ask for explicit confirmation (**YES**).
7. Select lifecycle strategy (**Long** or **Short**).
8. Create the `init.md` artifact using `templates.init`.
9. Evaluate Gate.
   - The developer **MUST** explicitly confirm with a **YES**.

## Output (REQUIRED)
- Created artifact: `artifacts.candidate.init` (from `templates.init`).
- Created artifact: `artifacts.candidate.bootstrap` (bundle from `bootstrap_context`).

## Reasoning (MANDATORY)
- Before executing, the architect-agent must explain to the developer what will be done and why.
- No document is required for this step.

## Pass
- `init.md` is created from `templates.init`.
- Language is confirmed and strategy is set.
- `bootstrap.md` exists and contains the bundle.

## Gate (REQUIRED)
Requirements (all mandatory):
1. `artifacts.candidate.init` exists.
2. `artifacts.candidate.bootstrap` exists.
3. In `init.md` YAML: `language.confirmed == true` and `strategy` is defined.
4. The developer has explicitly approved with **YES**.

If Gate FAIL:
- Block until resolved.
