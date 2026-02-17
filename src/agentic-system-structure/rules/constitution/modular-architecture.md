---
trigger: model_decision
description: "Enforces Domain-Driven Design via Modular Architecture. Modules must be self-contained with their own Data, Logic, and View."
---

# MODULAR ARCHITECTURE CONSTITUTION

## 1. Principles
- **Domain Autonomy**: Each Domain (Settings, Chat, History, etc.) must be encapsulated as a **Module**.
- **Decentralization**: Data and Business Logic belong to the Module, NOT the App Shell.
- **Composition**: The App Shell is a container that composes Modules, managing only top-level navigation (Tabs) and Authentication.

## 2. Module Contract
Every Module **MUST** adhere to the following structure:
- **`src/extension/modules/<domain>/`**: Root directory.
- **`view/`**: Contains the Lit Components for the module's UI.
- **`backend/`** (or `core` integration): Contains the Service/Logic and Data persistence.
- **`index.ts`**: Exports the `IModule` definition (id, label, icon, viewComponent).

## 3. The App Shell
- **Responsibility**: Host the Application Frame and Tab Bar.
- **State**: Manages `activeModuleId` and the Registry of available modules.
- **Prohibitions**: The App Shell **MUST NOT** contain domain-specific logic (e.g., "Chat Logic" or "Settings Logic" inside `app/`).

## 2. Structure (MANDATORY)
Each module **MUST** contain at minimum:
- **Background** (`background/index.ts`): **REQUIRED** - View Controller (manages View lifecycle and message routing).

Optional layers:
- **Backend** (`backend/index.ts`): Business Logic and Data Persistence (optional if module has no business logic).
- **View** (`view/index.ts`): UI Component (Lit-based, renders templates).
- **Constants** (`constants.ts`): **REQUIRED** (if module has constants) - All static values, command IDs, and configuration keys must be defined here.

### Critical Rules:
1. **Background is MANDATORY**: Every module must have a Background, even if it only has UI.
2. **View requires Background**: If a module has a View, it **MUST** have a Background to load and control it.
3. **Backend is OPTIONAL**: Only required if the module has business logic or data persistence.

## 3. Data Flow
- **View → Background**: User interactions via messages.
- **Background → Backend**: Business logic invocation (if Backend exists).
- **Backend → Background**: Data responses.
- **Background → View**: State updates.

## 4. Naming Convention (Strict)
- **Module Name**: PascalCase for classes, kebab-case for folders.
- **Layer Classes**: The main class of each layer (Backend, Background, View) must be named exactly as the Module.
  - *Example*: Module `Settings`
    - Backend: `class Settings` (in `backend/index.ts`)
    - Background: `class Settings` (in `background/index.ts`)
    - View: `class Settings` (in `view/index.ts`)
- **Suffixes**: Do NOT use suffixes like `Service`, `Controller`, `Manager`, `View`, `Background` for the main class.
- **Imports**: Consumers must use aliasing if importing multiple layers: `import { Settings as SettingsService } from ...`.

### 5. Constants (Strict)
- **NAME Constant**: Every module MUST export a `NAME` constant from its `constants.ts`.
  - `export const NAME = 'ModuleName';`
  - This constant MUST be used in `index.ts`, `View`, `Background`, and `Backend` classes to refer to the module's identity.

## 7. Communication
- **Inter-Module**: strictly via the Global Event Bus. Direct import of other modules' internal logic is **FORBIDDEN**.
- **Module-to-Shell**: Modules communicate readiness or status to Shell via Bus.

## 8. UI Pattern
- **Tabs**: The primary navigation pattern is a Tab Bar managed by the Shell.
- **Views**: Each Module provides a main Web Component (e.g., `<settings-view>`) that the Shell renders when active.