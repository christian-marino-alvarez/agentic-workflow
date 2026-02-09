---
artifact: plan
phase: phase-3-planning
owner: architect-agent
status: draft
related_task: 1-communication-bridge-ui-extension-host
---

# Implementation Plan — 1-Communication Bridge (UI ↔ Extension Host)

## Identificacion del agente (OBLIGATORIA)
🏛️ **architect-agent**: Diseñando la estrategia de ejecución para el puente de comunicación tipado.

## 1. Resumen del plan
- **Contexto**: Implementación de un puente de comunicación bidireccional entre la Webview y el Extension Host de VS Code.
- **Resultado esperado**: Un sistema de mensajería tipado con Zod, manejo de reintentos, logs de error y soporte nativo para streaming.
- **Alcance**: Incluye la definición de esquemas compartidos, la refactorización de la clase base de controladores y la implementación del receptor en el cliente.

---

## 2. Inputs contractuales
- **Task**: `.agent/artifacts/1-communication-bridge-ui-extension-host/task.md`
- **Analysis**: `.agent/artifacts/1-communication-bridge-ui-extension-host/analysis.md`
- **Acceptance Criteria**: AC-1 al AC-5 definidos en `acceptance.md`.

**Dispatch de dominios (OBLIGATORIO si aplica)**
```yaml
plan:
  workflows:
    - domain: communication-bridge
      action: create
      workflow: phase-4-implementation
```

---

## 3. Desglose de implementación (pasos)

### Paso 1: Definición de Contratos Compartidos
- **Descripción**: Crear los esquemas Zod y tipos base en un directorio accesible por ambos dominios.
- **Dependencias**: Ninguna.
- **Entregables**: `src/shared/messaging/schemas.ts` y `src/shared/messaging/types.ts`.
- **Agente responsable**: **architect-agent**

### Paso 2: Refactorización del Core (Backend)
- **Descripción**: Actualizar `AgwViewProviderBase` para integrar la validación de esquemas en `postMessage` y `onDidReceiveMessage`.
- **Dependencias**: Paso 1.
- **Entregables**: `src/extension/core/controller/base.ts` actualizado.
- **Agente responsable**: **backend-agent**

### Paso 3: Implementación del Bridge en el Cliente (Frontend)
- **Descripción**: Crear un "Messaging Service" en la Webview que maneje el tipado, los reintentos y el flujo de streaming.
- **Dependencias**: Paso 1.
- **Entregables**: `src/extension/modules/chat/web/messaging.ts` (posible nueva ubicación).
- **Agente responsable**: **ui-agent**

### Paso 4: Integración y Reintentos
- **Descripción**: Implementar la lógica de ACK y reintento en el bridge del cliente y el controlador.
- **Dependencias**: Paso 2 y 3.
- **Entregables**: Sistema de reintentos funcional.
- **Agente responsable**: **backend-agent**

---

## 4. Asignación de responsabilidades (Agentes)

- **Architect-Agent**
  - Responsabilidades: Diseño de esquemas y supervisión de la integridad del puente.
- **Backend-Agent**
  - Responsabilidades: Implementación en el Extension Host y lógica de reintentos.
- **UI-Agent**
  - Responsabilidades: Implementación en la Webview (Frontend).
- **QA-Agent**
  - Responsabilidades: Validación de los AC mediante tests unitarios y de integración.

**Handoffs**
- El Architect entrega los esquemas Zod (Paso 1).
- El Backend entrega la base refactorizada (Paso 2).
- El UI integra el servicio de mensajería (Paso 3).

**Componentes (si aplica)**
- **Zod**: Herramienta principal para validación. Motivo: Seguridad de tipos en tiempo de ejecución.

---

## 5. Estrategia de testing y validación
- **Unit tests**: Validar que los esquemas Zod rechazan payloads inválidos y aceptan los correctos. (Vitest)
- **Integration tests**: Simular el envío de un mensaje desde una Webview mockeada y verificar que el controlador lo recibe y valida correctamente.

**Trazabilidad**
- AC-1 e AC-2 -> Paso 1 y 2.
- AC-3 -> Paso 4.
- AC-5 -> Paso 3 y diseño de esquemas (Paso 1).

---

## 6. Plan de demo (si aplica)
- **Objetivo**: Demostrar el envío de un mensaje de "Chat" desde la UI, su validación exitosa en el backend, y una respuesta en streaming simulada.
- **Criterios de éxito**: Log de validación exitosa en consola y visualización de tokens progresivos en la UI.

---

## 7. Estimaciones y pesos de implementación
- **Definición de esquemas**: Bajo.
- **Refactorización base**: Medio.
- **Implementación cliente**: Medio.
- **Lógica de reintentos**: Medio.
- **Total**: Esfuerzo Medio-Alto por la criticidad del componente.

---

## 8. Puntos críticos y resolución

- **Riesgo**: Desconexión de la Webview durante el streaming.
- **Estrategia**: El bridge debe detectar el `dispose` del webview y limpiar los recursos del lado del backend inmediatamente.

---

## 9. Dependencias y compatibilidad
- **Internas**: Depende de `AgwViewProviderBase`.
- **Externas**: `zod`.
- **Compatibilidad**: VS Code 1.80+ (entorno Chromium).

---

## 10. Criterios de finalización
- [ ] Esquemas Zod definidos y exportados.
- [ ] `postMessage` en la clase base valida el esquema antes de enviar.
- [ ] El receptor en la Webview valida los mensajes entrantes.
- [ ] Logs de error funcionales.
- [ ] Tests de integración de "Streaming simple" pasando.

---

## 11. Aprobación del desarrollador (OBLIGATORIA)
```yaml
approval:
  developer:
    decision: SI
    date: "2026-02-09T15:18:39Z"
    comments: "Aprobado vía chat."
```
