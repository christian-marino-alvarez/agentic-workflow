# Subtask 5 Plan: Update `agents-behavior.md` Constitution

- **Owner:** `architect-agent`
- **Scope:** Modify the main agent behavior constitution to incorporate the new roles and their domain restrictions.
- **Files to Modify:**
    - `.agent/rules/constitution/agents-behavior.md`
- **Acceptance Criteria:**
    - The file must be updated with a new section under "STRICT DOMAIN ISOLATION".
    - This new section must clearly list the `view-agent`, `backend-agent`, `background-agent`, and `messaging-agent` and their corresponding allowed file paths.
    - This makes the domain restrictions a globally enforceable rule.
