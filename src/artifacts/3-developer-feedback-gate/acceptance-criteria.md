# Phase 0: Acceptance Criteria - Developer Feedback Gate

## 1. Goal
Ensure no task is technically closed (Phase 8) without the developer's explicit evaluation of the agents' performance.

## 2. Requirements
- **Interaction**: The agent must pause in Phase 7 and use `notify_user` to ask for:
    - Approval (SI/NO)
    - Score (0-5)
    - Comments
- **Storage**: This information must be recorded in `metrics.md` under a new section.
- **Enforcement**: Phase 8 must fail its input check if `metrics.md` does not show explicit approval.

## 3. DoD (Definition of Done)
- [ ] `phase-7-evaluation.md` updated with the interaction step.
- [ ] `phase-8-commit-push.md` updated with the input check.
- [ ] `task-metrics.md` template updated with the new section.
- [ ] Manual verification via "Verification Report".
