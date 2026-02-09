---
artifact: analysis
phase: phase-2-analysis
owner: architect-agent
status: approved
related_task: 9-secrets-management
---

# Analysis — 9-Secrets Management

## Identificacion del agente (OBLIGATORIA)
<icono> **architect-agent**: Análisis de arquitectura para gestión de secretos multi-entorno y refactorización del módulo Chat.

## 1. Resumen ejecutivo
**Problema**
El sistema actual carece de una gestión estructurada de secretos para múltiples entornos (DEV/PRO) y el módulo de Chat viola el patrón arquitectónico "Vertical Slice", comprometiendo la integración segura de secretos.

**Objetivo**
1. Implementar soporte para entornos (DEV/PRO) y multi-keys en el módulo de Seguridad.
2. Refactorizar el módulo de Chat para cumplir estrictamente con la arquitectura (Runtime/Background/Backend).
3. Habilitar el flujo seguro de secretos mediante Event Bus en el backend.

**Criterio de éxito**
- Registro y persistencia de claves diferenciadas por entorno y modelo.
- Módulo Chat reestructurado y funcional consumiendo secretos via Event Bus.
- Flujo E2E verificado: UI Seguridad -> Backend Seguridad -> Event Bus -> Backend Chat -> OpenAI/Provider.

---

## 2. Estado del proyecto (As-Is)
- **Security Module**:
  - `src/extension/modules/security`: Estructura correcta.
  - Infraestructura base (`BridgeServer`, `SecretHelper`) lista.
  - Limitación: No distingue entornos, modelo de datos plano (`secretKeyId` directo en `ModelConfig`).

- **Chat Module**:
  - `src/extension/modules/chat`: Estructura híbrida/incorrecta.
  - `background` contiene lógica de gestión de procesos (`BackendManager`).
  - `backend` contiene lógica de negocio (`chatkit-routes`).
  - No sigue la separación clara Extension vs Node Process definida en la constitución.

- **Configuración**:
  - `src/extension/providers/base.ts`: `ModelConfig` no tiene campo `environment`.

---

## 3. Cobertura de Acceptance Criteria
### 1. Gestión de Secretos (Security Module)
- **Análisis**: Se requiere extender `ModelConfig` con `environment: 'dev' | 'pro'`.
- **UI**: El `AuthenticationProvider` o la vista de Seguridad debe permitir seleccionar el entorno activo globalmente o por modelo.
- **Persistencia**: Las claves se guardarán usando un ID compuesto: `${modelId}.${environment}`.

### 2. Comunicación Inter-Modular
- **Análisis**: El `EventBus` ya existe. `SecurityBackend` debe escuchar `SECRET_REQUEST`.
- **Cambio**: `ChatBackend` debe emitir `SECRET_REQUEST` con el ID del modelo y el entorno deseado.

### 3. Arquitectura Módulo Chat
- **Análisis**: 
  - Mover `ChatBackendManager` de `background/chatkit` a `background/manager.ts`.
  - Mover `chatkit-routes.ts` a una estructura `backend/routes` o similar, eliminando la dependencia de `protocol.ts` si este mezcla tipos de UI.
  - Asegurar que `backend/index.ts` sea el punto de entrada limpio del plugin Fastify.

### 4. Entornos
- **Análisis**: Nuevo setting `agentic-workflow.environment` ('dev' | 'pro').
- **Impacto**: `SettingsStorage` debe exponer `getEnvironment()`.

---

## 4. Research técnico
### Alternativa A: Refactor Completo (Recomendada)
- **Descripción**: Reestructurar totalmente `src/extension/modules/chat` para igualar a `security`. Añadir propiedad `environment` a los modelos.
- **Ventajas**: Cumplimiento constitucional, mantenibilidad a largo plazo, consistencia.
- **Inconvenientes**: Mayor esfuerzo inicial.

### Alternativa B: Parchear Chat
- **Descripción**: Mantener estructura actual de Chat y solo inyectar secretos.
- **Ventajas**: Más rápido.
- **Inconvenientes**: Deuda técnica inaceptable, riesgo de seguridad por mala encapsulación.

**Decisión**: **Alternativa A**. La seguridad y la arquitectura no son negociables.

---

## 5. Agentes participantes
- **architect-agent**
  - Supervisión de arquitectura y validación de refactor.
- **security-agent**
  - Implementación de soporte multi-entorno en Security Module.
  - Actualización de `ModelConfig` y `SettingsStorage`.
- **chat-agent (o backend-agent)**
  - Refactorización del módulo Chat.
  - Implementación de consumo de Event Bus.

---

## 6. Impacto de la tarea
- **Arquitectura**: 
  - Normalización del módulo Chat.
  - Inyección de dependencia de entorno en todo el sistema.
- **Datos**: Migración de configuración existente (default a 'pro' o 'dev').
- **Breaking Changes**: La estructura de `config.models` cambiará. Se necesita migración automática en `SettingsStorage`.

---

## 7. Riesgos y mitigaciones
- **Riesgo**: Pérdida de configuración de modelos existente.
  - **Mitigación**: Implementar lógica de migración en `SettingsStorage.ensureMigration()`.
- **Riesgo**: Incompatibilidad del Event Bus si los módulos cargan en orden incorrecto.
  - **Mitigación**: El `EventBus` es agnóstico del orden, pero los listeners deben estar activos antes de los eventos. `app.ts` carga módulos secuencialmente; Security debe cargar antes o ser independiente. (El bus maneja esto desacoplando).

---

## 8. Preguntas abiertas
Ninguna. Fase 0 y Fase 1 han clarificado el alcance.

---

## 9. Aprobación
Este análisis **requiere aprobación explícita del desarrollador**.

```yaml
approval:
  developer:
    decision: SI
    date: 2026-02-08T20:50:00Z
    comments: "Plan de refactorización y soporte de entornos aprobado."
```
