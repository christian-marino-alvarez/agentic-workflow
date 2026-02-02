# Acceptance Criteria — task-20260130-chatkit-mainview-Integrar ChatKit en mainView

🏛️ **architect-agent**: Criterios de aceptación para integrar ChatKit (advanced) con agente dinámico en `mainView`.

## 1. Definición Consolidada
Integrar ChatKit en `mainView` usando la integración avanzada (backend local en extension host), crear un agente dinámico “Neo” con modelo `gpt-5` por sesión, y exponer un botón “Test” que envíe “Hello I am the first agent called Neo”. La API key se guarda en SecretStorage y el webview consume el servidor ChatKit vía `apiURL`.

## 2. Respuestas a Preguntas de Clarificación
> Esta sección documenta las respuestas del desarrollador a las 5 preguntas formuladas por el architect-agent.

| # | Pregunta (formulada por architect) | Respuesta (del desarrollador) |
|---|-----------------------------------|-------------------------------|
| 1 | ¿Modelo exacto a usar? | `gpt-5`. |
| 2 | ¿Dónde corre el servidor ChatKit? | Local en la extensión (extension host). |
| 3 | ¿Creación y cacheo del `agent_id`? | Crear en cada sesión (no persistir). |
| 4 | ¿Roles iniciales? | Solo Neo; se le inyecta rol y constitutions desde `.agent`. |
| 5 | ¿UI mínima? | ChatKit embebido + botón “Test” que dispara el mensaje “Hello I am the first agent called Neo” (auto‑send). |

---

## 3. Criterios de Aceptación Verificables
> Listado de criterios derivados de las respuestas anteriores que deben ser verificados en la Fase 5.

1. Alcance:
   - ChatKit se renderiza en `mainView` y usa `apiURL` hacia el servidor local.

2. Entradas / Datos:
   - API key almacenada en SecretStorage.
   - Modelo `gpt-5` usado en la creación del agente Neo.

3. Salidas / Resultado esperado:
   - Botón “Test” envía “Hello I am the first agent called Neo”.
   - Se muestra la respuesta del agente en el chat.

4. Restricciones:
   - No exponer API key en el webview.
   - Mantener un único `mainView` en Activity Bar.

5. Criterio de aceptación (Done):
   - El flujo completo funciona en F5: se carga ChatKit, crea agente por sesión, y el botón “Test” produce respuesta real.

---

## Aprobación (Gate 0)
Este documento constituye el contrato de la tarea. Su aprobación es bloqueante para pasar a Phase 1.

```yaml
approval:
  developer:
    decision: SI
    date: 2026-01-30T00:00:00Z
    comments: null
```

---

## Historial de validaciones (Phase 0)
```yaml
history:
  - phase: "phase-0-acceptance-criteria"
    action: "completed"
    validated_by: "architect-agent"
    timestamp: "2026-01-30T00:00:00Z"
    notes: "Acceptance criteria definidos"
```
