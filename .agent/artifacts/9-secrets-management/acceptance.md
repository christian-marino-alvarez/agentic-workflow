---
kind: template
name: acceptance
source: agentic-system-structure
---

# Acceptance Criteria — 9-secrets-management

## Identificacion del agente (OBLIGATORIA)
<icono> **architect-agent**: Definiendo alcance para gestión de secretos.

## 1. Definición Consolidada
Implementar un sistema de gestión de secretos en el módulo de Seguridad que soporte entornos (PRO/DEV) y múltiples claves por modelo.
El backend de Seguridad expondrá estas claves al backend de Chat mediante un **Event Bus interno seguro** (dentro del mismo proceso Node.js Sidecar).
**Requisito Crítico**: Validar que el Módulo de Chat cumpla estrictamente con la arquitectura "Vertical Slice" definida en la constitución. Si no cumple, se debe **eliminar y regenerar** su estructura backend para garantizar la integración correcta.

## 2. Respuestas a Preguntas de Clarificación
| # | Pregunta | Respuesta del desarrollador |
|---|----------|-----------------------------|
| 1 | **Objetivo** | Registro de keys multi-entorno (PRO/DEV) y multi-key por modelo. |
| 2 | **Alcance Componentes** | Modulo Chat pide keys a Modulo Security. Comunicación backend-to-backend encriptada/segura. |
| 3 | **Almacenamiento** | Sí, `vscode.SecretStorage`. |
| 4 | **Comunicación** | **EventEmitter** (Event Bus) intra-proceso en el servidor Fastify compartido. |
| 5 | **Entregable** | Registro en UI Security -> Uso en Chat. **Refactor/Regeneración obligatoria del módulo Chat si no cumple arquitectura.** |

---

## 3. Criterios de Aceptación Verificables

1. **Gestión de Secretos (Security Module)**:
   - UI para registrar keys asociadas a: `Provider`, `Model`, `Environment (DEV/PRO)`.
   - Soporte para alias/nombres (multi-keys para mismo modelo).
   - Persistencia segura en Keychain OS (via VSCode SecretStorage).

2. **Comunicación Inter-Modular (Backend Sidecar)**:
   - Implementar un `shared/event-bus` en el backend Node.js.
   - Flow: `ChatBackend` emite evento solicitud -> `SecurityBackend` responde con Key desencriptada en memoria.

3. **Arquitectura Módulo Chat**:
   - **Validación Estructural**: Verificar `src/extension/modules/chat` y `src/extension/modules/chat/backend`.
   - **Acción Correctiva**: Si no sigue el patrón "Vertical Slice" (Runtime/Background/Templates), eliminar y regenerar estructura base.

4. **Entornos**:
   - Selector global de entorno (DEV/PRO) que determine qué set de keys se sirve.

5. **Criterio de Aceptación (Done)**:
   - Registro una Key "Test-Pro" en ambiente PRO.
   - Cambio ambiente a PRO.
   - Modulo Chat logra recuperar esa key via EventBus y usarla.

---

## Aprobación (Gate 0)
Este documento constituye el contrato de la tarea. Su aprobación es bloqueante para pasar a Phase 1.

```yaml
approval:
  developer:
    decision: null # SI | NO
    date: null
    comments: null
```

---

## Historial de validaciones (Phase 0)
```yaml
history: []
```
