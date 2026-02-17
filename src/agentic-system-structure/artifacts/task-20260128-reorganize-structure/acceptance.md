# Acceptance Criteria — task-20260128-reorganize-structure

## Identificacion del agente (OBLIGATORIA)
🏛️ **architect-agent**: Definición de criterios de aceptación para la reorganización.

## 1. Definición Consolidada
La tarea consiste en centralizar la documentación y configuración agéntica en `src/agentic-system-structure` y limpiar la raíz del repositorio moviendo los backups a `.backups`. Esto implica una actualización crítica de todos los paths internos que el sistema usa para autogestionarse.

## 2. Respuestas a Preguntas de Clarificación
> Esta sección documenta las respuestas del desarrollador a las 5 preguntas formuladas por el architect-agent.

| # | Pregunta | Respuesta |
|---|-----------------------------------|-------------------------------|
| 1 | ¿Ubicación de `agentic-system-structure`? | En `src` (código). |
| 2 | ¿Incluir `src/index.md`? | Sí. |
| 3 | ¿Ubicación de `.backups`? | En la raíz. |
| 4 | ¿Actualizar referencias y scripts? | Sí: alias, paths, scripts de build e init. |
| 5 | ¿Respetar `cli`, `core`, `test`? | Sí, permanecen intactos. |

---

## 3. Criterios de Aceptación Verificables
> Listado de criterios derivados de las respuestas anteriores que deben ser verificados en la Fase 5.

1. Alcance:
   - Carpetas de configuración movidas de `src/` a `.agent/`.
   - Backups movidos a `/.backups/`.

2. Entradas / Datos:
   - Estructura actual de archivos y backups identificada en el paso de descubrimiento.

3. Salidas / Resultado esperado:
   - Nueva carpeta `src/agentic-system-structure` con el contenido correcto.
   - Nueva carpeta `/.backups` con los backups.
   - Ficheros de sistema actualizados con las nuevas rutas.

4. Restricciones:
   - No se debe perder ningún historial de reglas o backups en el proceso.
   - El sistema debe ser capaz de inicializarse (`init`) tras el cambio.

5. Criterio de aceptación (Done):
   - El comando `init` funciona correctamente apuntando a la nueva estructura.
   - La build se completa sin errores de "file not found" relacionados.

---

## Aprobación (Gate 0)
Este documento constituye el contrato de la tarea. Su aprobación es bloqueante para pasar a Phase 1 (en ciclo Short, esto habilita la implementación).

```yaml
approval:
  developer:
    decision: SI
    date: 2026-01-28T08:21:00+01:00
    comments: Aprobado por el usuario.
```

---

## Historial de validaciones (Phase 0)
```yaml
history:
  - phase: "short-phase-1-brief"
    action: "completed"
    validated_by: "architect-agent"
    timestamp: "2026-01-28T08:21:00+01:00"
    notes: "Brief y Acceptance criteria definidos tras interacción con usuario."
```
