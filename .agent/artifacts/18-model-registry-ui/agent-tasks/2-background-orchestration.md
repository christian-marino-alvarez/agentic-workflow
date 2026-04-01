---
id: 2
title: Background Orchestration
phase: phase-4-implementation
owner: background-agent
status: in-progress
---

# Task 2: Background Orchestration

## Input
- **Objective**: Enable message routing for validation requests (`TEST_CONNECTION_REQUEST`).
- **Context**: `Settings.verifyConnection` is implemented in Backend. View needs to invoke it.
- **Dependencies**: Task 1 (Backend Core Logic).

## Reasoning
- The View will emit `TEST_CONNECTION_REQUEST` with `LLMModelConfig` data.
- `SettingsBackground` must listen for this message.
- It should delegate the actual verification to `Settings.verifyConnection`.
- It must return the `{ success, message }` result to the View.

## Output
- Updated `src/extension/modules/settings/background/index.ts`.
- Updated `constants.ts` (Done).

## Execution
- [x] Add `TEST_CONNECTION_REQUEST` to `constants.ts`.
- [x] Implement handler in `SettingsBackground.ts`.

## Implementation Report
### Changes
- Updated `src/extension/modules/settings/constants.ts`: Added `TEST_CONNECTION_REQUEST`.
- Updated `src/extension/modules/settings/background/index.ts`: Added handler for `TEST_CONNECTION_REQUEST` calling `settings.verifyConnection`.

### Technical decisions
- Used `Settings` instance directly in `SettingsBackground` as they run in the same Extension Host process.
- Delegated logic entirely to Backend layer `Settings.verifyConnection`.

### Evidence
- `SettingsBackground.ts` now listens for the verification message.
- Type safety maintained via shared interfaces.

### Deviations from objective
- None.

## Gate Approval
- [ ] Developer Approval (SI/NO)
