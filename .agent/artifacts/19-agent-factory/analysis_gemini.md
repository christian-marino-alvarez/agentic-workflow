🏛️ **architect-agent** (Gemini): Deep Analysis for T019 — Agent Factory & Role-Model Binding

---
artifact: analysis
phase: phase-2-analysis
owner: architect-agent
status: draft
related_task: 19-agent-factory
---

# Analysis — 19-agent-factory (Gemini Opinion)

## 1. Executive Summary

**Problem**
- La configuración actual de LLM en Settings es estática y no funcional. Falta una capa de abstracción de cliente LLM unificada que soporte streaming, llamadas a funciones y uso de herramientas, ejecutándose en el sidecar backend para aislamiento y rendimiento. Además, no existe mecanismo para vincular los roles definidos en `.agent/rules/roles/` con modelos específicos.

**Objective**
- Implementar el módulo `llm` utilizando el patrón **VirtualBackend** para exponer servicios de chat/streaming en el sidecar.
- Crear una **Factory** extensible para instanciar clientes LLM (OpenAI, Gemini, Claude).
- Implementar **Role-Model Binding** con descubrimiento dinámico de roles desde el sistema de archivos.

**Success Criterion**
- Módulo `llm` funcional como VirtualBackend (`/llm/*`).
- Streaming SSE operativo.
- Binding de roles configurable en UI (Settings) con detección dinámica de roles nuevos/borrados.
- Build y tests (unitarios + E2E) pasando sin regresiones.

---

## 2. Project State (As-Is)

### Relevant Structure
- **Core Backend**: `AbstractBackend` (servidor físico) y `VirtualBackend` (servidor lógico).
- **App Module**: `AppServer` (único servidor físico actual).
- **Settings Module**: Refactorizado a `SettingsBackground` (sin backend físico propio, lógica en Extension Host). Maneja `LLMModelConfig`.
- **Roles**: Definidos en `.agent/rules/roles/*.md`.

### Existing Components
- `AppServer`: Punto de montaje para VirtualBackends.
- `SettingsBackground`: Gestión de configuración de modelos y secretos.
- `Auth`: Gestión de tokens OAuth en Extension Host.

### Detected Limitations
- **Falta de Servicio LLM**: No hay endpoint real para invocar modelos.
- **Roles Desconectados**: Los roles son archivos markdown sin representación en el código o configuración.
- **Token Passing**: Los tokens OAuth viven en el Extension Host y deben pasarse al sidecar en cada petición.

---

## 3. Acceptance Criteria Coverage

### AC-1: Extensibilidad de Providers
- **Interpretation**: La arquitectura de Factory debe permitir añadir nuevos providers con mínimo impacto.
- **Verification**: Test unitario registrando un provider mock.
- **Risks**: Divergencia en capacidades (ej. algunos no soportan streaming o tools).

### AC-2: Ubicación en Sidecar (VirtualBackend)
- **Interpretation**: El módulo `llm` debe extender `AbstractVirtualBackend` y registrarse en `AppServer`.
- **Verification**: Comprobar rutas `/llm/chat` en el AppServer en ejecución.

### AC-3: Streaming SSE
- **Interpretation**: Uso de Server-Sent Events para streaming de respuestas.
- **Verification**: Consumo de endpoint `/llm/chat/stream` con cliente compatible SSE.

### AC-4: Role → Model Binding (Dinámico)
- **Interpretation**: **NUEVO REQUISITO**. La UI de Settings debe listar roles presentes en `.agent/rules/roles/`. Debe permitir "Refrescar" esta lista.
- **Verification**: Añadir un archivo `test-role.md`, refrescar UI, ver el rol nueva.

### AC-5: Function Calling / Tool Use
- **Interpretation**: Abstracción común para definición de tools y normalización de llamadas/resultados.
- **Verification**: Test de integración invocando un tool simple.

### AC-6: Compile + E2E sin regresión
- **Interpretation**: Mantenimiento de la calidad actual.

---

## 4. Technical Research

### Alternative A: VirtualBackend + Dynamic Role Discovery (RECOMMENDED)
- **Description**:
  1.  **Backend**: `llm/backend/` implementa `VirtualBackend`. Expone API REST.
  2.  **Background**: `llm/background/` maneja comunicación con UI y *lee* `.agent/rules/roles/` para descubrir roles.
  3.  **Settings UI**: Añade sección "Role Binding" que solicita lista de roles al `llm` background (o `settings` background si decidimos centralizarlo allí, pero por SRP `llm` parece más apropiado para "roles de agentes", aunque `settings` ya tiene la UI... Decisión: **Settings Background** leerá los roles ya que gestiona la config global).
- **Advantages**: Arquitectura limpia, separación de responsabilidades (Backend = ejecución, Background = gestión/descubrimiento).
- **Disadvantages**: Requiere comunicación entre módulos (Settings UI -> Settings Background -> Filesystem).

### Alternative B: Hardcoded Roles
- **Description**: Lista de roles fija en código.
- **Advantages**: Rápido.
- **Disadvantages**: Viola la flexibilidad del sistema de agentes. Descartado.

**Recommended decision**: **Alternative A**. Es robusta y alineada con la naturaleza dinámica de los agentes.

---

## 5. Participating Agents

### 🏛️ architect-agent
- **Responsibilities**: Definición de contratos y supervisión.

### 🤖 backend-agent
- **Responsibilities**: Implementación del VirtualBackend `llm` y Factory.

### 🔧 background-agent
- **Responsibilities**: Implementación de `llm/background` y ampliación de `settings/background` para lectura de archivos de roles.

### 🎨 view-agent (delegated to backend/background usually, but distinct logic here)
- **Responsibilities**: Actualizar `SettingsView` para añadir la sección de Role Binding y botón de refresh.

### 🛡️ qa-agent
- **Responsibilities**: Testeo de integración y E2E.

**Handoffs**: Architect -> Backend/Background -> QA.

**Required Components**:
- **Create**: Módulo `src/extension/modules/llm/`.
- **Modify**: `src/extension/modules/settings/` (Background para leer roles, View para UI).
- **Modify**: `src/extension/modules/app/backend/index.ts` (registro).

**Demo**: No requerida (backend focus), pero la UI de Settings mostrará el binding.

---

## 6. Task Impact

### Architecture
- Consolidación del patrón **VirtualBackend**.
- Introducción de **Dynamic Configuration** basada en archivos del sistema (.agent/rules/roles).

### APIs / Contracts
- `llm` expone API estandarizada para clientes.
- `settings` extiende su contrato de mensajes para incluir `GET_ROLES`, `REFRESH_ROLES`.

### Compatibility
- Backward compatible.

### Testing / Verification
- Tests de lectura de archivos.
- Verificación de binding correcto en runtime.

---

## 7. Risks and Mitigations

| Risk | Impact | Mitigation |
|:--|:--|:--|
| Latencia en lectura de roles | Bajo | Lectura asíncrona y cache en memoria (Background). |
| Inconsistencia Rol-Modelo | Medio | Validación al cargar configuración (si rol desaparece, avisar en UI). |
| Seguridad OAuth | Alto | Token refresh **siempre** en Extension Host antes de llamada al sidecar. |

---

## 8. Open Questions
- Ninguna.

---

## 9. TODO Backlog (Mandatory Consultation)

**Reference**: `.agent/todo/`
**Current state**: No existe.
**Impact on analysis**: N/A.

---

## 10. Approval
This analysis **requires explicit developer approval**.

```yaml
approval:
  developer:
    decision: null
    date: null
    comments: null
```
