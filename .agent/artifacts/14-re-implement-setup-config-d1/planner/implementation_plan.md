---
artifact: implementation_plan
phase: phase-3-planning
owner: architect-agent
status: approved
related_task: 14-re-implement-setup-config-d1
---

# Implementation Plan — 14-Re-implement Setup/Config (D1)

# Goal Description
Transition the application to a **Modular Architecture**. Implement the **Settings Module** as a standalone domain containing its own Business Logic (`Settings` for LLMs) and UI (Lit+Material). Refactor the **Core** to provide agnostic services (`Config`, `Secrets`) and the **App Shell** to manage module navigation through a Tab system.

## User Review Required
> [!IMPORTANT]
> **Naming Convention**: Main classes (Backend, View) must be named `Settings`, not `SettingsService` or `SettingsView`.

## Proposed Changes

### 1. Scaffolding Infrastructure
#### [UPDATE] [skill/scaffolding]
- Update `generators/module/templates/backend/service.ts` -> `index.ts` (Class: ModuleName).
- Update `generators/module/templates/view/view.ts` -> `index.ts` (Class: ModuleName).
- Update `generators/module/templates/view/templates/` structure.

### 2. Core Layer (`src/extension/modules/core`)
- Services implemented.

### 3. Settings Module (`src/extension/modules/settings`)
#### [REFACTOR] [backend/service.ts]
- Rename file to `index.ts` (or keep `service.ts` but export `Settings`).
- Rename class `SettingsService` to `Settings`.
#### [REFACTOR] [view/settings-view.ts]
- Rename file to `index.ts` (or keep `settings-view.ts` but export `Settings`).
- Rename class `SettingsView` to `Settings`.

### 4. App Shell (`src/extension/modules/app`)
#### [MODIFY] [backend/index.ts]
- Fix `AppBackground` context injection (In Progress).
- Update import to `import { Settings } from '../../settings/backend/service.js'`.

## Verification Plan
### Automated Tests
- **Unit**: Verify `generate-module` generator creates correct class names.
