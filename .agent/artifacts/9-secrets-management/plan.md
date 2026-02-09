---
artifact: plan
phase: phase-3-planning
owner: architect-agent
status: approved
related_task: 9-secrets-management
---

# Implementation Plan — 9-Secrets Management

## Identificacion del agente (OBLIGATORIA)
<icono> **architect-agent**: Plan de implementación para soporte multi-entorno y refactorización de chat.

## 1. Resumen del plan
- **Contexto**: Se requiere extender el módulo de Seguridad para soportar múltiples entornos (DEV/PRO) y refactorizar el módulo de Chat para que cumpla con la arquitectura y consuma los secretos de forma segura.
- **Resultado esperado**:
  1. Configuración global de entorno (PRO/DEV).
  2. Gestión de API Keys por entorno en UI y Persistencia.
  3. Módulo Chat reestructurado (Vertical Slice) consumiendo EventBus.
- **Alcance**: Modificación de `security`, `providers` y refactor total de `chat`.

---

## 2. Inputs contractuales
- **Task**: `.agent/artifacts/9-secrets-management/task.md`
- **Analysis**: `.agent/artifacts/9-secrets-management/analysis.md`
- **Acceptance Criteria**:
  - AC1: Gestión de Secretos Multi-Entorno.
  - AC2: Comunicación Inter-Modular (EventBus).
  - AC3: Refactor Arquitectura Chat.
  - AC5: E2E Flow.

**Dispatch de dominios**
```yaml
plan:
  dispatch:
    - domain: security
      action: refactor
      workflow: phase-4-implementation
    - domain: chat
      action: refactor
      workflow: phase-4-implementation
```

---

## 3. Desglose de implementación (pasos)

### Paso 1: Extension de Seguridad & Entornos
- **Descripción**: Implementar soporte para entornos en `ExtensionConfig` y `security` module.
- **Detalles**:
  - Actualizar `ExtensionConfigSchema` con `environment: 'dev' | 'pro'`.
  - Actualizar `ModelConfig` con `environment`.
  - Actualizar `SettingsStorage` y `SecurityController` para manejar el nuevo estado.
  - Actualizar UI de Security para selector de entorno.
- **Entregables**: Código actualizado en `src/extension/providers`, `security/background` y UI.
- **Agente**: `security-agent`

### Paso 2: Refactorización Módulo Chat (Scaffolding)
- **Descripción**: Reestructurar `src/extension/modules/chat` para cumplir Vertical Slice.
- **Detalles**:
  - Crear estructura: `runtime`, `background`, `backend`, `templates`.
  - Mover `ChatBackendManager` a `background`.
  - Mover lógica de `protocol` a `shared` o `backend` según corresponda.
  - Asegurar `backend/index.ts` limpio encapsulando rutas.
- **Entregables**: Estructura de carpetas correcta y compilable.
- **Agente**: `backend-agent`

### Paso 3: Integración de Secretos en Chat
- **Descripción**: Conectar el nuevo backend de Chat con el Event Bus de Seguridad.
- **Detalles**:
  - Implementar listener/emitter en `ChatBackend` para pedir secretos.
  - Usar la configuración de entorno para solicitar la clave correcta (`modelId` + `env`).
- **Entregables**: Flujo `EventBus` funcionando en `src/backend`.
- **Agente**: `backend-agent`

### Paso 4: Verificación
- **Descripción**: Tests de integración y manuales.
- **Agente**: `qa-agent`

---

## 4. Asignación de responsabilidades

- **architect-agent**
  - Supervisión de los cambios estructurales en Chat.
- **security-agent** (Implementation)
  - Responsable del Paso 1 (Security & Env).
- **backend-agent** (Implementation)
  - Responsable del Paso 2 y 3 (Chat Refactor & Integration).
- **qa-agent**
  - Validación final.

---

## 5. Estrategia de testing y validación

- **Unit tests**:
  - `SettingsStorage`: Validar persistencia de `environment`.
  - `SecretHelper`: Validar generación de claves compuestas (`id.env`).
- **Integration tests**:
  - `EventBus`: Verificar comunicación entre mocks de Security y Chat.
- **E2E / Manual**:
  - Definir entorno PRO.
  - Setear Key PRO.
  - Cambiar a DEV.
  - Verificar que Chat falla (o pide key DEV).
  - Volver a PRO y verificar éxito.

---

## 7. Estimaciones y pesos
- **Paso 1 (Security)**: Medio (3). Cambios en base de datos local y UI.
- **Paso 2 (Chat Refactor)**: Alto (5). Movimiento de ficheros y ajuste de imports.
- **Paso 3 (Integration)**: Bajo (2). Lógica de eventos puntual.

---

## 8. Puntos críticos y resolución
- **Punto crítico 1**: Pérdida de keys existentes durante la migración de esquema.
  - **Resolución**: Implementar migración que asigne 'pro' por defecto a las keys existentes.
- **Punto crítico 2**: `ChatBackend` rompiéndose por los cambios de rutas.
  - **Resolución**: Tests de compilación `npm run build:backend` en cada paso.

---

## 10. Criterios de finalización
- [ ] Selector de entornos en UI Security.
- [ ] UI permite guardar keys duplicadas (mismo modelo, distinto entorno).
- [ ] Estructura de `src/extension/modules/chat` idéntica a `security`.
- [ ] Chat funciona end-to-end con backend sidecar.

---

## 11. Aprobación del desarrollador (OBLIGATORIA)
```yaml
approval:
  developer:
    decision: SI
    date: 2026-02-08T21:00:00Z
    comments: "Plan aprobado. Ejecutar con cuidado el refactor de Chat."
```
