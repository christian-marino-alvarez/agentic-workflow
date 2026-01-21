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
2. Use the `bootstrap_context` tool to load the prebuilt core bootstrap bundle plus local indices in a single step.
3. Save the bundle output to `.agent/artifacts/candidate/bootstrap.md`.
4. Detect preferred language and ask for explicit confirmation (**YES**).
5. Select lifecycle strategy (**Long** or **Short**).
6. Create the `init.md` artifact using `templates.init`.
7. Evaluate Gate.
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
