---
id: constitution.backend
owner: architect-agent
version: 2.0.1
severity: PERMANENT
scope: backend
trigger: model_decision
description: "Governs server-side module logic. STRICT: Extend AbstractServer, NO vscode/dom imports, transport agnostic, and structured error handling."
---

# BACKEND LAYER CONSTITUTION

## 1. Principles
- **Inheritance**: Implementations **MUST** extend `AbstractServer` from `core/backend`.
- **Isolation**: **FORBIDDEN** to import `vscode` or `dom`. Logic must be decoupled from the IDE.
- **Transport Agnostic**: Do not couple logic to HTTP/WebSocket. Use abstract adapters.

## 2. Standards
- **Error Handling**: Return `{ error: string, code: number }`. Do NOT throw raw exceptions.
- **Response Format**: Strictly typed JSON. Use `zod` schemas.
- **Sidecar**: Isolate heavy processing for potential serialization.

## 3. Communication
- **Inbound**: via `MessageHandler`.
- **Outbound**: via abstract `transport`.
- **No View Access**: NEVER communicate directly with View.