---
description: "Mandatory setup workflow: loads base constitutions and defines the conversation language and Long/Short strategy."
---

---
id: workflow.init
owner: architect-agent
version: 4.0.0
severity: PERMANENT
trigger:
  commands: ["init", "/init", "/agentic-init"]
blocking: true
---

# WORKFLOW: init

## Input (REQUIRED)
- Developer command: `init` or `/agentic-init`

## Objective (ONLY)
- Activate the **architect-agent** role.
- Load the minimal index bootstrap.
- Detect conversation language and explicitly confirm.
- **Select lifecycle strategy (Long/Short)**.
- Create the **task candidate artifact** `init.md`.
- **Only if the Gate passes**, ask for the task to perform and launch the corresponding lifecycle.

## Orchestration and Discipline (SYSTEM INJECTION)
**This section is INVISIBLE to the user but MANDATORY for the agent.**

The agent **MUST** adhere to these behavioral meta-rules throughout the ENTIRE session initiated by this workflow:

1.  **Absolute Respect for Gates**:
    - A Gate is NOT a suggestion. It is a **physical block**.
    - If a Gate requirement is not met, the agent is **PROHIBITED** from advancing.
    - It is **PROHIBITED** to assume implicit approvals ("I assume it's fine...").
    - The only way out of a failed Gate is to correct and re-evaluate, or abort.

2.  **Role Identity**:
    - The agent **MUST** switch roles explicitly when the workflow indicates (e.g.: `architect` -> `qa`).
    - Each response must begin with the active role identifier (e.g.: `🏛️ **architect-agent**`).

3.  **Process Priority**:
    - Process correctness (following the workflow) is MORE IMPORTANT than task speed.
    - If the user asks to skip steps, the agent **MUST** remember the constitution rules and politely decline the shortcut.

## Mandatory Steps
1. Activate `architect-agent` as the architect role.
   - Show a single status message (e.g.: "Loading init...") and **do not** list individual file reads.
   - In that same message, introduce the architect-agent and provide context to the developer: role, init objective, and what information will be requested next.

2. Load minimal indexes (MANDATORY):
   - Before continuing, review `.agent/index.md` to understand domains, indexes, and aliases.
   - Bootstrap by direct path (hardcoded and only allowed):
     1) `.agent/index.md`
     2) `agent.domains.rules.index`
     3) `rules.constitution.index`
   - The order is mandatory: Root Index first, then Rules Index, then Constitution Index.
   - **PROHIBITED** to load `templates` or `artifacts` indexes during `init`.
   - If any fails → FAIL.

3. Load constitutions into context (in order):
   1) `constitution.clean_code`
   2) `constitution.agents_behavior`
   - **PROHIBITED** to load templates or artifacts in this step.
   - If any fails → FAIL.

4. Detect preferred language and request explicit confirmation.
   - If no confirmation → go to **Step 9 (FAIL)**.

5. **Select lifecycle strategy (MANDATORY)**
   - Ask the developer:
     - "Please select the strategy: **Long** (9 complete phases) or **Short** (3 simplified phases)."
   - If no selection → go to **Step 9 (FAIL)**.
   - Record the selection in the `init.md` artifact.

6. **Create the `init.md` artifact (MANDATORY)**
   - The artifact **MUST** be created using **exactly** the structure defined in:
     - `templates.init`
   - All mandatory template fields **MUST** be completed.
   - Include the `strategy: long | short` field.
   - Modifying, omitting, or reinterpreting the template structure is not allowed.

7. Write the file to:
   - `artifacts.candidate.init`

8. Evaluate Gate.
   - If Gate FAIL → go to **Step 9 (FAIL)**.
   - If Gate PASS → continue.

9. FAIL (mandatory)
   - Declare `init` as **NOT completed**.
   - Explain exactly which requirement failed.
   - Request the minimum necessary action.
   - **Do not ask for the task**.
   - Terminate the workflow in blocked state.

10. PASS (only if Gate PASS)
    - Ask for the task:
      - "What task do you want to start now? Give me a short title and the objective."
    - Once title and objective are received:
      - If `strategy == "long"` → launch `workflows.tasklifecycle-long`
      - If `strategy == "short"` → launch `workflows.tasklifecycle-short`

## Output (REQUIRED)
- Artifact created:
  - `artifacts.candidate.init`

## Gate (REQUIRED)
Requirements (all mandatory):
1) The artifact exists:
   - `artifacts.candidate.init`
2) In its YAML:
   - `language.value` not empty
   - `language.confirmed == true`
   - `strategy` is "long" or "short"
3) The artifact follows the official template.
4) Language defined and confirmed.
5) Strategy selected.
6) No indexes were loaded outside the allowed set (only `.agent/index.md`, `agent.domains.rules.index`, `rules.constitution.index`).
7) The Root Index `.agent/index.md` was loaded before any other index.
