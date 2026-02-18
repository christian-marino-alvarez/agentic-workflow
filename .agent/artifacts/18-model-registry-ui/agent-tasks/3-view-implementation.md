---
id: 3
title: View Implementation (Lit)
phase: phase-4-implementation
owner: view-agent
status: in-progress
---

# Task 3: View Implementation (Lit)

## Input
- **Objective**: Update UI to support Hybrid Auth forms and Validation feedback.
- **Context**: Backend and Background are ready to handle validation.
- **Dependencies**: Task 1 & 2.

## Reasoning
- The UI needs to allow users to select `authType` (API Key vs OAuth).
- Authenticated state (OAuth) vs Key Input (API Key) must be conditionally rendered.
- A "Test Connection" button must be added to trigger validation.
- Feedback (Success/Error) must be displayed to the user.
- Styling must match the "Premium" design guidelines.

## Output
- Updated `src/extension/modules/settings/view/index.ts`.
- Updated styles (css/ts) if needed for new form elements.

## Execution
- [x] Add `authType` radio/toggle group.
- [x] Implement conditional rendering for API Key vs OAuth.
- [x] Add "Test Connection" button with loading state.
- [x] Display validation result message.
- [x] Use `PROVIDERS` and `AUTH_TYPES` constants.

## Implementation Report
### Changes
- **Updated `css.ts`**: Added styles for `.radio-group`, `.connection-test-section`, and validation feedback.
- **Updated `index.ts`**: Added `formAuthType` and `connectionTestResult` state. Implemented `userActionTestConnection` to send `TEST_CONNECTION_REQUEST`.
- **Updated `form/html.ts`**:
    - Added Radio Group for API Key / OAuth.
    - Conditionally rendered API Key input.
    - Added "Test Connection" button with success/error feedback.

### Technical decisions
- Used independent state `formAuthType` to decouple form UI from model data until save.
- Implemented "Test Connection" as a separate action that doesn't save the model, allowing validation before commitment.
- **Refactoring**: Moved all form handling logic (DOM extraction, event handlers) to `Settings` class (`userActionTestConnection`, `userActionAuthTypeChanged`) to keep templates pure.
- **Lint Fix**: Added curly braces to `if (!form) return;` block to comply with project ESLint rules.

### Evidence
- UI now supports switching between Auth types.
- "Test Connection" triggers background verification and displays result.
- Templates are cleaner and only contain bindings.

### Deviations from objective
- None.

## Gate Approval
- [ ] Developer Approval (SI/NO)
