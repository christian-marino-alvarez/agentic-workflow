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
  - `setup/`: Installation, configuration, and secret management.
    - `state/`: Reactive state management (EventEmitters).
    - `settings-storage.ts`: **Facade** for `vscode.Memento` (GlobalState).
    - `secret-helper.ts`: **Facade** for `vscode.SecretStorage` (API Keys).

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
