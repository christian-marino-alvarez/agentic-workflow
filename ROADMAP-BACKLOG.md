# Roadmap Backlog - ADR-001: VS Code ChatKit + Agent SDK + MCP Integration

**Última actualización**: 2026-02-17 (Post-Audit T15)
**Roadmap completo**: `.backups/.agent.backup_2026-02-06T08-11-37-009Z/artifacts/2-implementacion-adr-vscode-integration/roadmap.md`

---

## Estado Global

| Dominio | Completitud | Tareas Completadas | Tareas Totales |
|---------|-------------|---------------------|----------------|
| D1: Setup/Config | 0% | 0/4 | 4 |
| D2: UI/ChatKit | 0% | 0/6 | 6 |
| D3: Backend/Extension Host | 50% | 2/4 | 4 |
| D4: Agents SDK/Backend | 0% | 0/5 | 5 |
| D5: MCP/Governance | 0% | 0/4 | 4 |
| D6: Security | 0% | 0/3 | 3 |
| D7: Release/CI-CD | 100% | 2/2 | 2 |
| D8: E2E Testing | 100% | 4/4 | 4 |

**Total**: 8/32 tareas completadas (25%)

---

## 🎯 Prioridad Alta - Tareas Inmediatas

### Fase 2: Consolidación & Backend (Current)

- [x] **T11**: Refinamiento de Constitución de Capas (Backend/Background/View)
  - Auditoría de Roadmap y definición de reglas modulares.
  - **Agente**: architect-agent

- [x] **T15**: Auditoría y Actualización de Backlog (Fase 1/2)
  - Actualización de estado D1, D3, D7, D8.
  - **Agente**: architect-agent

- [ ] **T010**: ChatKit Session Endpoint (Prioridad 1)
  - Re-implementar endpoint de sesiones bajo `constitution.backend`.
  - **Domain**: D3 (Backend).

- [ ] **T00X**: Re-implementación de Setup/Config (Prioridad 2)
  - Implementar `SettingsStorage` real en `core/background`.
  - Re-crear UI de Configuración bajo nuevas reglas Lit.
  - **Domain**: D1 (Setup).

---

## ⚠️ Estado de Auditoría (2026-02-17)

> **NOTA**: Tras la auditoría T15, se ha verificado el estado físico de los módulos. D7 y D8 se marcan como completados. D1 y D3 requieren trabajo de implementación.

### Dominio D1: Setup/Config (Estado: RESTART)
- [ ] **T002**: Schema de Configuración de Modelos LLM (Pendiente)
- [ ] **T003**: Settings Persistence (Pendiente)
- [ ] **T004**: UI de Configuración (Pendiente)

### Dominio D3: Backend/Extension Host (Estado: PARTIAL)
- [ ] **T010**: ChatKit Session Endpoint (Pendiente)
- [x] **T011**: Communication Bridge (Básico implementado en `core/messaging`)
- [ ] **T012**: Backend HTTP Client (Pendiente/Mock)

---

## 📋 Backlog - Fase 3: Frontend

### Dominio D2: UI/ChatKit (Estado: RESTART/VERIFY)

- [ ] **T005**: Setup de Lit en Webview
  - Lit framework configuration y decorators
  - Build process con esbuild y bundling
  - Base class `AgwViewBase` implementada

- [ ] **T006**: ChatKit Web Component Integration
  - `<openai-chatkit>` integrado via CDN + types NPM
  - Inicialización imperativa via `setOptions()`

- [ ] **T007**: Model Dropdown Component
  - Lit component con dropdown
  - Sincronización en tiempo real (Event Bus)

- [ ] **T008**: Theming de ChatKit (VS Code Dark/Light)
  - Dark/light automático via `colorScheme` en `setOptions()`

- [ ] **T009**: CSP (Content Security Policy) Configuration
  - `frame-src`, `child-src` para iframe de ChatKit

- [ ] **T032**: Unified Tabbed Shell (Fase 0)
  - Unificar las 4 vistas en un único `<agw-unified-shell>`

---

## 📋 Backlog - Fase 4: Advanced Features

### Dominio D4: Agents SDK/Backend

- [ ] **T015**: Node.js Backend Server - Scaffolding
  - Setup inicial de backend TypeScript (Core/Module structure)

- [ ] **T016**: Agent Workflows Implementation (TypeScript)
  - Lógica base de workflows en core.

### Dominio D6: Security

- [ ] **T023**: Secrets Management
  - Implementado en `src/extension/modules/core/background` (Basic)

---

### Dominio D7: Release/CI-CD (Estado: DONE)
- [x] **T028**: Release Please Workflow (`.github/workflows/release-please.yml`)
- [x] **T029**: Publish Workflow (`.github/workflows/publish.yml`)

### Dominio D8: E2E Testing (Estado: DONE)
- [x] **T030**: E2E Scaffolding (`test/e2e`)
- [x] **T031**: Extension Activation Test
- [x] **T033**: View Provider Test
- [x] **T034**: Command Registration Test

---

## 🚀 Próximos Pasos Recomendados

1. **Prioridad 1**: Implementar `ChatKit Session Endpoint` (T010) para desbloquear el flujo de chat.
2. **Prioridad 2**: Implementar `SettingsStorage` (D1) para persistencia de configuración.
3. **Prioridad 3**: Formalizar `Backend HTTP Client` (T012).

---

**Última revisión**: 2026-02-17 por architect-agent (T15 Audit)
