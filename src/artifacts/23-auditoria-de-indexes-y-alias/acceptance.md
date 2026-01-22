# Acceptance Criteria — 23-auditoria-de-indexes-y-alias

## 1. Definición Consolidada
Realizar una auditoría técnica completa de la infraestructura de direccionamiento por alias del sistema agéntico. El objetivo es confirmar que todos los recursos (reglas, flujos, plantillas y ficheros de agentes) están correctamente indexados y son accesibles sin ambigüedades.

## 2. Respuestas a Preguntas de Clarificación
> Esta sección documenta las respuestas del desarrollador a las 5 preguntas formuladas por el architect-agent.

| # | Pregunta (formulada por architect) | Respuesta (del desarrollador) |
|---|-----------------------------------|-------------------------------|
| 1 | ¿Qué dominios específicos deben ser auditados prioritariamente? | Todos (rules, workflows, templates, artifacts). |
| 2 | ¿Deseas un reporte puramente documental o que incluya correcciones? | Solo puramente documental (informe). |
| 3 | ¿Debemos auditar también la consistencia de los alias en `AGENTS.md`? | Sí. |
| 4 | ¿Existe algún alias o índice que sospeches que está dando problemas? | No, pero se hace por procedimiento y seguridad. |
| 5 | ¿Cómo prefieres recibir el resultado de la auditoría? | Un informe. |

---

## 3. Criterios de Aceptación Verificables
> Listado de criterios derivados de las respuestas anteriores que deben ser verificados en la Fase 5.

1. Alcance:
   - Auditoría de los dominios: rules, workflows, templates, artifacts.
   - Auditoría de alias en `AGENTS.md`.

2. Entradas / Datos:
   - Archivos `index.md` de cada dominio.
   - Estructura de carpetas bajo `.agent/`.

3. Salidas / Resultado esperado:
   - Un informe de auditoría detallado detectando discrepancias (si las hay).

4. Restricciones:
   - El agente NO debe realizar correcciones automáticas, solo informar.

5. Criterio de aceptación (Done):
   - El informe cubre todos los dominios solicitados y confirma la validez de los alias o documenta los errores encontrados.

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
history:
  - phase: "phase-0-acceptance-criteria"
    action: "completed"
    validated_by: "architect-agent"
    timestamp: "2026-01-19T09:45:00Z"
    notes: "Acceptance criteria definidos mediante flujo independiente."
```
