---
artifact: analysis
phase: phase-2-analysis
owner: architect-agent
status: draft
related_task: 1-communication-bridge-ui-extension-host
---

# Analysis — 1-Communication Bridge (UI ↔ Extension Host)

## Identificacion del agente (OBLIGATORIA)
🏛️ **architect-agent**: Iniciando el análisis arquitectónico del puente de comunicación bidireccional.

## 1. Resumen ejecutivo
**Problema**
- La comunicación actual entre la Webview y el Extension Host es ad-hoc, sin validación de tipos en tiempo de ejecución y carece de una estructura formal para el manejo de errores, reintentos y streaming de datos.

**Objetivo**
- Implementar un sistema de mensajería `postMessage` robusto, tipado con Zod, con soporte para streaming y mecanismos de resiliencia (reintentos) para facilitar la integración de ChatKit y la gobernanza agéntica.

**Criterio de éxito**
- Existencia de un contrato de mensajes compartido en `src/shared`.
- Validación bidireccional de todos los mensajes mediante esquemas Zod.
- Soporte verificado para streaming de tokens.
- Sistema de logs y reintentos funcional ante fallos de entrega.

---

## 2. Estado del proyecto (As-Is)
Describe el estado real del proyecto **antes de implementar nada**.

- **Estructura relevante**
  - `src/extension/core/controller/base.ts`: Contiene `AgwViewProviderBase`, la clase base para Webviews.
  - `src/extension/modules/chat/background/background.ts`: `ChatController` que hereda de la base y usa decoradores para manejar mensajes.
- **Componentes existentes**
  - `postMessage` se usa de forma manual y los decoradores `@onMessage` filtran por `type`, pero sin validación profunda del `payload`.
- **Nucleo / capas base**
  - `AgwViewProviderBase` gestiona la recepción de mensajes pero de forma genérica (`any`).
- **Artifacts / tareas previas**
  - T010: ChatKit Session Endpoint (Completada): Proporciona los cimientos para que ChatKit se autentique.
- **Limitaciones detectadas**
  - Falta de un namespace compartido de tipos de mensajes.
  - No hay manejo de IDs de correlación para respuestas.

---

## 3. Cobertura de Acceptance Criteria

### AC-1: Bridge en ambos lados con tipado fuerte
- **Interpretación**: Crear constantes y esquemas compartidos en `src/shared`.
- **Verificación**: Un import común en `src/extension` y la carpeta de vistas.
- **Riesgos**: Mantenimiento de la sincronización de tipos si no se usa un directorio `shared` real.

### AC-2: Esquemas Zod para Chat, Modelos y Gobernanza
- **Interpretación**: Definir esquemas específicos para `chat:message`, `model:change`, `gov:accept`.
- **Verificación**: Tests unitarios que validen payloads correctos e incorrectos.
- **Riesgos**: Complejidad excesiva de los esquemas iniciales.

### AC-3: Logs y Reintentos
- **Interpretación**: Implementar un sistema de confirmación (ACK). Si no se recibe ACK en X ms, reintentar o loguear.
- **Verificación**: Simular fallo de mensaje y verificar el log de error en el output channel de VS Code.
- **Riesgos**: Bucle infinito de reintentos si el receptor está permanentemente bloqueado.

---

## 4. Research técnico
Análisis de alternativas y enfoques posibles (Basado en Phase 1).

- **Alternativa A: postMessage nativo con interfaces TS simples**
  - Ventajas: Simple, cero dependencias extra.
  - Inconvenientes: No hay validación en ejecución; riesgo de crashes si el mensaje cambia.
- **Alternativa B: Bridge basado en Zod (Recomendado)**
  - Ventajas: Validación en ejecución, tipado inferido automático, errores descriptivos.
  - Inconvenientes: Ligera sobrecarga de procesamiento, dependencia de `zod`.

**Decisión recomendada**
- **Enfoque B**: Dada la naturaleza crítica de la gobernanza y los secretos, la seguridad de tipos en ejecución es innegociable.

---

## 5. Agentes participantes

- **architect-agent**
  - Responsabilidades: Definir los esquemas en `src/shared` y supervisar la integración en el core.
- **backend-agent**
  - Responsabilidades: Refactorizar `AgwViewProviderBase` y los controladores existentes.
- **ui-agent**
  - Responsabilidades: Implementar la capa de recepción/envío en el frontend (Webview).

**Handoffs**
- El `architect-agent` entrega los esquemas Zod en `src/shared`. Los agentes operativos los consumen.

**Componentes necesarios**
- **Crear**: `src/shared/messaging/schemas.ts`, `src/shared/messaging/types.ts`.
- **Modificar**: `src/extension/core/controller/base.ts`, `src/extension/modules/chat/background/background.ts`.

**Demo (si aplica)**
- Se requiere una demo técnica simple: un test de integración que envíe un mensaje tipado y confirme su recepción y validación.

---

## 6. Impacto de la tarea

- **Arquitectura**
  - Introduce una capa de comunicación formal. Mejora el desacoplamiento.
- **APIs / contratos**
  - Cambia la firma de `postMessage` en la base para ser más estricta.
- **Compatibilidad**
  - Requiere actualizar el `ChatController` actual para que sea compatible con el nuevo sistema.
- **Testing / verificación**
  - Se requerirá testing unitario de los esquemas y E2E simple para el flujo de mensajes.

---

## 7. Riesgos y mitigaciones
- **Riesgo 1: Serialización de Errores**
  - Impacto: Pérdida de detalle en logs si el error no es serializable.
  - Mitigación: Usar un normalizador de errores antes de enviarlos por el puente.
- **Riesgo 2: Bloqueo de UI por validación síncrona**
  - Impacto: Lag en la interfaz.
  - Mitigación: Asegurar que la validación de Zod sea eficiente y no bloqueante.

---

## 8. Preguntas abiertas
- ¿Debe el Bridge manejar el encriptado de mensajes sensibles o delegamos eso a la capa de aplicación? (Decisión: Delegar por ahora para no añadir complejidad innecesaria).

---

## 9. TODO Backlog (Consulta obligatoria)

**Referencia**: `.agent/todo/`
**Estado actual**: vacío
**Items relevantes para esta tarea**: Ninguno.

---

## 10. Aprobación
Este análisis **requiere aprobación explícita del desarrollador**.

```yaml
approval:
  developer:
    decision: SI
    date: "2026-02-09T15:17:55Z"
    comments: "Aprobado vía chat."
```
