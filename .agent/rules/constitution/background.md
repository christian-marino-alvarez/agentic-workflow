---
id: constitution.background
owner: architect-agent
version: 2.0.1
severity: PERMANENT
scope: background
trigger: model_decision
description: "Governs extension orchestration. STRICT: Register in App, use Messaging bridge for View, typed payloads, and exclusive vscode API access."
---

# BACKGROUND LAYER CONSTITUTION

## 1. Principles
- **Orchestration**: Manages flow between VS Code, Backend, and View.
- **Single Source of Truth**: Manages global state.
- **Gateway**: **ONLY** layer authorized to import `vscode`.

## 2. Standards
- **Registration**: All modules **MUST** register via `App.register(id, provider)`.
- **Messaging**: 
  - Override `async listen(message)` in subclasses.
  - Return data from `listen` to automatically reply to requests.
  - Use `await this.sendMessage()` for correlated requests to sidecars/views.
- **Type Safety**: Use shared `Message` interface from `core/types`.

## 3. Architecture
- **Dependency Injection**: Inject services into providers.
- **Lifecycle**: Respect VS Code activation/deactivation.
- **Sidecars**: Use `runBackend(scriptPath)` to spawn node processes.
- **Health Check**: Use `await this.ping()` to check sidecar connectivity.