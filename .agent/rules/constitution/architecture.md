---
kind: rule
name: architecture
source: architect-agent
---

# Architecture Constitution

type: rules
version: 1
status: injected
scope: global

---

## 1. Core Principles

### 1.1 Decoupling & Inversion of Control
- The business logic (Core/Modules) MUST remain agnostic of the infrastructure and external libraries.
- High-level modules MUST NOT depend on low-level implementation details.

### 1.2 Unified State Management
- State MUST be centralized and reactive where possible.
- Cross-module communication MUST happen through defined interfaces or reactive events.

### 1.3 Types and Constants Supremacy (Mandatory)
To ensure extreme decoupling and type safety, we follow the "Source of Truth" pattern for definitions.

- **Types Centralization**: ALL types, interfaces, and union types MUST be defined in a `types.d.ts` file within the module. They MUST NEVER be defined inside logic files (classes, functions).
- **Mandatory Centralized Consumption**: External files and internal logic files MUST ONLY consume types from the centralized `types.d.ts` (or the module's main index if it re-exports them). Direct usage of types from implementation files (e.g., importing a type defined inside a `.ts` logic file) is STICTLY PROHIBITED.
- **Constant-First Enums**: Literal enums used for logic control (tabs, modes, status) MUST be defined via a Constant Object first in `constants.ts`.
- **Derivation**: Types MUST be derived from constants using `typeof` whenever possible to ensure runtime and compile-time consistency.

**Standard Module Layout**:
```
constants.ts -> Logic-governing constants (e.g., Tab, Mode).
types.d.ts   -> ALL types and interfaces (derived from constants).
*.ts         -> PURE logic files that import from the above.
```

**Example**:
```typescript
// src/.../constants.ts
export const Tab = { List: 'list', New: 'new', Edit: 'edit' } as const;

// src/.../types.d.ts
import { Tab } from './constants.js';
export type Tab = typeof Tab[keyof typeof Tab];
```

---

## 2. Integration Patterns (Mandatory)

### 2.1 Facades & Providers
All external libraries, SDKs, or environment-specific APIs (e.g., VS Code API, `globalState`, `SecretStorage`) MUST be wrapped in a **Facade** or **Provider**.

**Rules**:
- **Strict Wrapping**: No direct imports of external library signatures in business logic files.
- **Contract Driven**: Interaction MUST happen through local interfaces defined by the project.
- **Centralized Evolution**: Updates or swaps of external dependencies MUST be performed exclusively within the Facade/Provider.

### 2.2 Domain Separation
- **Providers**: Used for interchangeable implementations of a domain concept (e.g., LLM providers).
- **Services/Helpers**: Used for infrastructure-specific tasks (e.g., `SettingsStorage`, `SecretHelper`).

---

## 3. Directory Structure & Roles

### 3.1 `src/extension/`
Root for all Extension Host logic.

- **`index.ts`**: Orchestrator and registration of VS Code commands and views.
- **`providers/`**: Infrastructure abstractions (Facades) for interchangeable services.
  - `base.ts`: Base contracts and shared schemas.
  - `[provider-name]/`: Specific implementations (OpenAI, Gemini, custom).
    - `schema.ts`: Zod validation schemas.
    - `tool.ts`: Provider-specific delegation tools.
- **`modules/`**: Domain-specific logic (Features).
  - `[module-name]/`:
    - `background/`: **Host Layer** (Bridge/Controller).
      - `index.ts`: The Controller (Integration with VS Code).
      - `router.ts`: View state management.
      - `settings-storage.ts`: Persistence facade (Memento/Secrets).
      - `state/`: Reactive broadcasters.
    - `runtime/`: **Domain Layer** (Pure Logic & Rules).
      - Agnostic logic portable to any environment.
    - `templates/`: **UI Layer** (Lit Rendering).
      - `index.ts`: Unified entry point (Host View).
      - `[sub-view]/`: HTML/CSS fragments.

### 3.2 `src/infrastructure/`
Low-level shared utilities and infrastructure logic used across the system.
- **`migration/`**: Logic for data/state transformations and backups.
  - `transformer.ts`: Structural cleaners.
  - `detector.ts`: Version detection logic.
- **`logger/`**: Centralized logging system.
- **`context/`**: Execution context and runtime session management.
- **`mapping/`**: Resource resolvers and alias resolution.

### 3.3 `src/agentic-system-structure/`
Domain of the agentic engine itself.
- **`templates/`**: Contractual templates for artifacts (Task, Analysis, Plan, etc.).
- **`skills/`**: Extended agent capabilities with mandatory SKILL.md documentation.
- **`rules/`**: Global system rules and index definitions.

### 3.4 `test/`
Unit and integration tests.
- **Rules**: Tests MUST mirror the `src` structure. For every file `src/A/B.ts`, there should be a `test/A/B.test.ts`.

---

## 4. Vertical Slice Architecture (Three-Layer Module Pattern)
To ensure extreme decoupling and portability, every functional module MUST follow the Three-Layer structure.

### 4.1 The Three Layers

| Layer | Environment | Responsibility | Rule |
| :--- | :--- | :--- | :--- |
| **Template** | Webview (JS) | UI Presentation / Interaction | No Node.js / No VS Code API. |
| **Background** | Host (Node.js) | VS Code API / Registration / Persistence | Bridge between UI and Domain. **CONTAINER FOR VSCODE**. |
| **Runtime** | Node.js / Pure TS | Pure Business Logic / Domain | Agnostic to VS Code and UI. Portable. |

### 4.2 Definitive Module Structure
```
[module-name]/
├── index.ts         <-- Entry Point (CLEAN). Re-exports only. No 'vscode' imports.
├── types.d.ts       <-- Mandatory Centralized Types.
├── constants.ts     <-- Mandatory Centralized Constants.
├── background/      <-- Host Layer (Node.js + VS Code)
│   ├── index.ts     <-- Unified Indexer. Re-exports background and backend.
│   ├── background.ts <-- VS Code specific logic (Controller). Imports 'vscode'.
│   ├── backend.ts    <-- Modular Backend logic (Fastify plugin). NO 'vscode' imports.
│   ├── router.ts    <-- Internal View State
│   ├── commands/    <-- VS Code Command registrations
│   ├── state/       <-- Reactive Broadcasters (Host-side)
│   └── ...          <-- Env-specific facades (SecretHelper, SettingsStorage)
├── runtime/         <-- Domain Layer (Pure TS)
│   └── index.ts     <-- Pure Domain Engines (No VS Code, No UI)
└── templates/       <-- UI Layer (Lit + CSS)
    ├── index.ts     <-- Lit Host Component (State & Event Handling)
    ├── common/      <-- Shared fragments and tokens
    │   ├── html/    <-- Shared HTML templates
    │   └── css/     <-- Shared CSS (Tokens, Global styles)
    └── [view]/      <-- Specialized view fragments (e.g., list, edit)
        ├── html/    <-- View-specific HTML templates
        └── css/     <-- View-specific CSS styles
```

### 4.3 Mandatory Layer Rules
1.  **Isolation of Host Dependencies**: All imports from `vscode` MUST be confined to the `background/` scope. The top-level `index.ts` and the `runtime/` layer MUST NOT import `vscode`.
2.  **Clean Entry Point**: The module's `index.ts` MUST be a clean re-exporter. It should import the `Setup`/`Module` object and `registration` function from `background/index.ts` and re-export them along with public types and constants.
3.  **Registration Logic**: The `ModuleRegistration` object and the factory function (`create[Name]Domain`) MUST reside in `background/index.ts` (or a dedicated file within `background/`) because they require `ExtensionContext`.
4.  **Types supremacy**: No local type definitions in logic files. All types must reside in `types.d.ts` and be consumed from there.
6.  **No Inline Styles (Mandatory)**: Using the `style` attribute in HTML or Lit templates is STRICTLY PROHIBITED. All styles MUST reside in separate CSS objects/files within the `templates/` structure.
7.  **Theme Alignment**: All UI components MUST exclusively use VS Code CSS variables (`--vscode-*`) to ensure native feel across all themes.
8.  **Folder Entrypoint (Mandatory)**: EVERY folder within a module MUST have an `index.ts` file that acts as the entrypoint for that specific sub-domain. External files should only import from these entrypoints, never from files deep within the folder.
9.  **OOCSS Orientation (Mandatory)**: Styles MUST follow Object-Oriented CSS principles as defined in the [OOCSS Constitution](file:///.agent/rules/constitution/oocss.md).
    - **Separate Structure from Skin**: Define base objects for layout and apply skins via modifiers.
    - **Separate Container from Content**: Components must be reusable regardless of their location.
    - **Reusability**: Shared UI objects MUST reside in `common/css/`.

### 4.4 Pattern Roles & Flow
- **Background (Host)**: Acts as the orchestrator. Handles state persistence, secrets, and VS Code commands.
- **UI Domain (Templates)**: Acts as the frontend. Minimal logic, strictly reactive to state updates from Background.
- **Runtime (Dominio)**: Acts as the "local backend". Contains the pure rules of the feature.

### 4.5 E2E Testing Standard (Webviews)
Given the modular nature of the system, testing must cover all layers:
1.  **Domain (Runtime)**: Unit tests via `vitest` (High speed, zero dependencies).
2.  **Host (Background)**: Integration tests via `vitest` with VS Code mocks.
3.  **UI (Templates)**: E2E tests via **Playwright** using `@vscode/test-cli`.
    - Purpose: Verify that the webview renders correctly, custom elements are initialized, and message passing (`postMessage`) flows end-to-end.
    - Standard: Every complex view (like `Setup`) MUST have a corresponding E2E spec.

### 4.6 Data Flow
1. **Action**: UI -> Background (postMessage)
2. **Execution**: Background calls Runtime (pure TS engine call)
3. **Sync**: Background -> UI (postMessage State Update)

## 5. Decision Log
