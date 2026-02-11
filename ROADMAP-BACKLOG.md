# Roadmap Backlog - ADR-001: VS Code ChatKit + Agent SDK + MCP Integration

**Última actualización**: 2026-02-11  
**Roadmap completo**: `.backups/.agent.backup_2026-02-06T08-11-37-009Z/artifacts/2-implementacion-adr-vscode-integration/roadmap.md`

---

## Estado Global

| Dominio | Completitud | Tareas Completadas | Tareas Totales |
|---------|-------------|---------------------|----------------|
| D1: Setup/Config | 100% | 4/4 | 4 |
| D2: UI/ChatKit | 66% | 4/6 | 6 |
| D3: Backend/Extension Host | 100% | 4/4 | 4 |
| D4: Agents SDK/Backend | 40% | 2/5 | 5 |
| D5: MCP/Governance | 0% | 0/4 | 4 |
| D6: Security | 33% | 1/3 | 3 |
| D7: Release/CI-CD | 0% | 0/2 | 2 |
| D8: E2E Testing | 10% | 0/4 | 4 |

**Total**: 16/32 tareas completadas (50%)

---

## 🎯 Prioridad Alta - Tareas Inmediatas

### Fase 0: Foundation (Spikes Técnicos)

- [x] **T001**: Spike Técnico - Node.js Compatibility ✅
  - Verificar compatibilidad de Node.js 22+ con VS Code Extension Host
  - Validar que Agents SDK puede ejecutarse
  - **Resultado**: Node 20.x es compatible.
  - **Agente**: setup-config-agent

- [x] **T014**: POC Agents SDK Integration (Node.js)
  - Proof of Concept de `@openai/agents` en Node.js backend
  - Validar streaming y tool execution
  - **Agente**: agent-sdk-specialist
  - **Complejidad**: Alta
  - **Dependencias**: T001
  - **Bloqueador**: Validar viabilidad técnica antes de invertir en backend

---

## ✅ Tareas Completadas

### Dominio D1: Setup/Config

- [x] **T002**: Schema de Configuración de Modelos LLM ✅
  - Schemas Zod implementados (OpenAI, Gemini, Custom)
  - Ubicación: `src/extension/providers/*/schema.ts`

- [x] **T003**: Settings Persistence (VS Code API) ✅
  - Clase `SettingsStorage` implementada
  - Ubicación: `src/extension/modules/setup/background/settings-storage.ts`
  - Tests unitarios creados

- [x] **T004**: UI de Configuración (Setup Module) ⚠️ PARCIAL
  - ✅ Webview funcional con CRUD de modelos
  - ✅ E2E test implementado: `test/e2e/setup-crud.test.ts`
  - ⚠️ Pending: Verificar UI para artifacts path customization

---

## 📋 Backlog - Fase 1: Core Setup

### Dominio D1: Setup/Config

- [x] **T004**: Completar UI de Configuración
  - Verificar/implementar input para artifacts path
  - Validación de path
  - **Dependencias**: T002, T003
  - **Complejidad**: Baja (solo falta validación)

### Dominio D4: Agents SDK/Backend

- [x] **T015**: Node.js Backend Server - Scaffolding ✅
  - Setup inicial de backend TypeScript
  - Express/Fastify server básico
  - **Ubicación**: `src/backend/`, `tsconfig.backend.json`
  - **Dependencias**: T014
  - **Agente**: agent-sdk-specialist
  - **Complejidad**: Media

### Dominio D6: Security

- [x] **T023**: Secrets Management ✅
  - API keys en VS Code SecretStorage
  - `.env` configuration template
  - **Agente**: security-agent
  - **Resultado**: Implementado soporte multi-entorno y persistencia segura.

---

## 📋 Backlog - Fase 2: Backend Integration

### Dominio D3: Backend/Extension Host

- [x] **T010**: ChatKit Session Endpoint
  - Endpoint para client secrets de ChatKit
  - Token management con expiración
  - **Agente**: backend-agent
  - **Complejidad**: Alta
  - **Nota**: Verificar si ya existe en `chatkit-server/server.ts`

- [x] **T011**: Communication Bridge (UI ↔ Extension Host) ✅
  - PostMessage bridge bidireccional
  - Type-safe message contracts
  - **Dependencias**: T010
  - **Agente**: backend-agent
  - **Complejidad**: Media

- [x] **T012**: Backend HTTP Client (Extension Host ↔ Backend) ✅
  - HTTP/WebSocket client
  - Reconnection logic
  - **Dependencias**: T015
  - **Agente**: backend-agent
  - **Complejidad**: Alta

- [x] **T013**: Model Selection Management ✅
  - Sincronización de modelo activo
  - **Dependencias**: T003, T007
  - **Agente**: backend-agent
  - **Complejidad**: Baja

### Dominio D4: Agents SDK/Backend

- [x] **T016**: Agent Workflows Implementation (TypeScript) ✅
  - Multi-agent workflows con handoffs
  - Tool integration básica y HIL
  - **Dependencias**: T015
  - **Agente**: agent-sdk-specialist
  - **Complejidad**: Alta

- [ ] **T017**: Chat API Endpoints (Compatible con ChatKit)
  - REST/WebSocket endpoints
  - Session management
  - **Dependencias**: T015, T016
  - **Agente**: agent-sdk-specialist
  - **Complejidad**: Alta

### Dominio D5: MCP/Governance

- [ ] **T019**: Runtime MCP Middleware Layer
  - Cliente MCP TypeScript en backend Node.js
  - Middleware para tool authorization
  - **Dependencias**: T015
  - **Agente**: mcp-governance-agent
  - **Complejidad**: Alta

- [ ] **T020**: Tool Authorization Policies
  - Schema de policies
  - Validation logic
  - **Dependencias**: T019
  - **Agente**: mcp-governance-agent
  - **Complejidad**: Media

---

## 📋 Backlog - Fase 3: Frontend

### Dominio D2: UI/ChatKit

- [x] **T005**: Setup de Lit en Webview ✅
  - Lit framework configuration y decorators
  - Build process con esbuild y bundling
  - Base class `AgwViewBase` implementada
  - **Ubicación**: `src/extension/core/web/`, `scripts/build/bundle-webviews.mjs`

- [x] **T006**: ChatKit Web Component Integration ✅
  - `<openai-chatkit>` integrado via CDN + types NPM
  - Inicialización imperativa via `setOptions()`
  - Shell template con CSP configurado
  - esbuild bundling con dependencias inlineadas
  - **Ubicación**: `src/extension/modules/chat/web/`

- [x] **T007**: Model Dropdown Component ✅
  - Lit component con dropdown
  - Sincronización en tiempo real (Event Bus)
  - Visibilidad dinámica (hasKey)
  - **Dependencias**: T002, T005
  - **Agente**: ui-agent
  - **Complejidad**: Media

- [x] **T008**: Theming de ChatKit (VS Code Dark/Light) ✅
  - Dark/light automático via `colorScheme` en `setOptions()`
  - CSS alineado con Security view (VS Code-native tokens)
  - Toolbar con badge env, model selector, status indicator
  - **Ubicación**: `src/extension/modules/chat/web/templates/`

- [x] **T009**: CSP (Content Security Policy) Configuration ✅
  - `frame-src`, `child-src` para iframe de ChatKit
  - `script-src` con nonce + CDN
  - `connect-src` para API endpoints
  - **Ubicación**: `src/extension/modules/chat/web/templates/shell/html/index.ts`
- [ ] **T032**: Unified Tabbed Shell (Fase 0)
  - Unificar las 4 vistas en un único `<agw-unified-shell>`
  - Persistent state management entre pestañas
  - **Dependencias**: T007, T011
  - **Agente**: architect-agent / Neo
  - **ADR**: ADR-001

- [ ] **T033**: Standalone Lit Chat Shell (Fase 1)
  - Reemplazar ChatKit por componentes Lit propios
  - Markdown, Syntax highlighting, Auto-scroll
  - **Dependencias**: T032
  - **Agente**: Neo

- [ ] **T034**: A2UI Protocol Integration (Fase 2)
  - Integrar `@a2ui/web-lib` y renderizado declarativo
  - Custom components (diff, terminal, etc.)
  - **Dependencias**: T033
  - **Agente**: Neo

---

## 📋 Backlog - Fase 4: Advanced Features

### Dominio D4: Agents SDK/Backend

- [ ] **T018**: Response Streaming (SSE + WebSocket)
  - Streaming token-by-token
  - Backpressure management
  - **Dependencias**: T016, T017
  - **Agente**: agent-sdk-specialist
  - **Complejidad**: Alta

### Dominio D5: MCP/Governance

- [ ] **T021**: Sistema RBAC (Role-Based Access Control)
  - Roles con permisos diferenciados
  - Permission checks
  - **Dependencias**: T019, T020
  - **Agente**: mcp-governance-agent
  - **Complejidad**: Alta

- [ ] **T022**: Audit Logs
  - Logs estructurados (JSON)
  - Query API para audit logs
  - **Dependencias**: T019, T021
  - **Agente**: mcp-governance-agent
  - **Complejidad**: Media

---

## 📋 Backlog - Fase 5: Hardening

### Dominio D6: Security

- [ ] **T024**: Input/Output Sanitization
  - Guardrails para validación
  - Prevención de injection attacks
  - **Dependencias**: T016
  - **Agente**: security-agent
  - **Complejidad**: Media

- [ ] **T025**: Authentication Flow (OAuth 2.0)
  - Short-lived tokens
  - Refresh automático
  - **Dependencias**: T010, T017
  - **Agente**: security-agent
  - **Complejidad**: Alta

---

## 📋 Backlog - Fase 6: Release

### Dominio D7: Release/CI-CD

- [ ] **T026**: CI/CD Pipelines Setup
  - GitHub Actions workflows
  - Automated tests, build, publishing
  - **Agente**: release-agent
  - **Complejidad**: Media

- [ ] **T027**: Release Documentation
  - Release process docs
  - Deployment guide
  - **Dependencias**: T026
  - **Agente**: release-agent
  - **Complejidad**: Baja

---

## 📋 Backlog - Fase 7: E2E Testing

### Dominio D8: E2E Testing

- [ ] **T028**: E2E Tests - Core Chat Flow
  - Flujo completo de chat
  - Framework: Playwright
  - **Dependencias**: T006, T017, T018
  - **Agente**: qa-agent
  - **Complejidad**: Alta

- [ ] **T029**: E2E Tests - MCP Authorization Flow
  - Validar control MCP sobre tools
  - Audit log verification
  - **Dependencias**: T019, T020, T016
  - **Agente**: qa-agent
  - **Complejidad**: Alta

- [ ] **T030**: E2E Tests - Multi-Agent Workflows
  - Handoffs entre agentes
  - Estado preservado
  - **Dependencias**: T016
  - **Agente**: qa-agent
  - **Complejidad**: Alta

- [ ] **T031**: E2E Tests - RBAC & Permissions
  - Validar RBAC end-to-end
  - Permission denied scenarios
  - **Dependencias**: T021, T025
  - **Agente**: qa-agent
  - **Complejidad**: Media

---

## 🔍 Tareas que Requieren Verificación

No hay tareas pendientes de verificación. T005, T006, T010 han sido verificadas y completadas.

---

## 📊 Métricas de Progreso

- **Completadas**: 16 tareas
- **En progreso**: 0 tareas
- **Pendientes**: 15 tareas
- **Requieren verificación**: 0 tareas

**Progreso total**: 52% (16/31)

---

## 🚀 Próximos Pasos Recomendados

### Opción A: Completar Foundation (Spikes)
1. Ejecutar T001 (Node.js Compatibility)
2. Ejecutar T014 (POC Agents SDK)
3. Documentar decisiones en ADRs

### Opción B: Completar Setup UI y verificar estado
1. Completar T004 (artifacts path UI)
2. Verificar T005 (Lit setup)
3. Verificar T006 (ChatKit integration)

### Opción C: Continuar con Backend
1. T015 (Backend Scaffolding)
2. T023 (Secrets Management)

---

## 📝 Notas

- Este backlog está sincronizado con el roadmap oficial en `.backups/.agent.backup_2026-02-06T08-11-37-009Z/artifacts/2-implementacion-adr-vscode-integration/roadmap.md`
- Cada tarea tiene criterios de aceptación detallados en el roadmap completo
- Las dependencias están mapeadas en el diagrama Mermaid del roadmap
- Unit tests e integration tests se implementan junto con cada tarea (no como tareas separadas)
- Solo E2E tests cross-domain están en D8

---

**Última revisión**: 2026-02-11 por architect-agent
