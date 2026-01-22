🏛️ **architect-agent**: Definición de Acceptance Criteria

# Acceptance Criteria — 27-update-portable-module-agent-identity

## Identificacion del agente (OBLIGATORIA)
Primera linea del documento:
`🏛️ **architect-agent**: Definición de Acceptance Criteria`

## 1. Definición Consolidada
Actualizar el paquete npm portátil `@cmarino/agentic-workflow` para alinear su comportamiento con los últimos estándares de orquestación y disciplina del sistema local. Esto incluye la identificación obligatoria del agente en todos los artefactos, la gestión estricta de subflows en `task.md`, la validación de timestamps en cierres de fase y la aprobación explícita por consola en cada gate. Se generará una nueva versión del paquete y se verificará su correcta instalación y funcionamiento en un entorno de prueba aislado.

## 2. Respuestas a Preguntas de Clarificación
> Esta sección documenta las respuestas del desarrollador a las 5 preguntas formuladas por el architect-agent.

| # | Pregunta (formulada por architect) | Respuesta (del desarrollador) |
|---|-----------------------------------|-------------------------------|
| 1 | ¿Qué "últimos cambios" específicos debemos incluir? | 1) `task.md`: subflows como listas y validación de timestamps. 2) Prefijo de identificación en todos los artefactos. 3) Aprobación por consola explícita ("SI"). 4) Timestamps de validación en `task.md` por cada fase. |
| 2 | ¿El "módulo portable" se refiere estrictamente al paquete npm `@cmarino/agentic-workflow`? | Si. |
| 3 | ¿La "identificación del agente" debe aplicarse a nivel de prefijo en el chat o en los artefactos? | Está especificado en el punto 1: Cada artefacto debe empezar con `<icono> **<nombre-agente>**: <mensaje>`. |
| 4 | ¿Debemos generar una nueva versión del paquete npm? | Nueva versión. |
| 5 | ¿Qué nivel de testing se requiere? | Volver a probar en un npm de test nuevo y verificar que se creó perfectamente. |

---

## 3. Criterios de Aceptación Verificables
> Listado de criterios derivados de las respuestas anteriores que deben ser verificados en la Fase 5.

1. Alcance:
   - Modificación de templates (`acceptance.md`, `research.md`, etc.) y workflows (`tasklifecycle`) dentro del paquete `@cmarino/agentic-workflow`.
   - Implementar lógica de validación de subflows y timestamps en los workflows.
   - Generar y publicar (localmente/simulado) una nueva versión del paquete.

2. Entradas / Datos:
   - Código fuente actual del paquete en el workspace.
   - Lista de cambios especificados en la respuesta 1.

3. Salidas / Resultado esperado:
   - Paquete `@cmarino/agentic-workflow` actualizado.
   - Entorno de prueba (carpeta temporal) donde `npx @cmarino/agentic-workflow init` genere la estructura correcta con los nuevos templates y reglas.
   - `task.md` generado en el entorno de prueba soporta subflows y timestamps.

4. Restricciones:
   - Respetar `clean-code`.
   - No romper compatibilidad con configuraciones existentes si es posible (aunque es un sistema nuevo, prioridad es la disciplina).

5. Criterio de aceptación (Done):
   - `npm install` del paquete (o link) en un proyecto limpio funciona.
   - Crear una tarea de prueba genera artefactos con el prefijo de identificación.
   - El workflow bloquea avance si no hay aprobación explícita "SI".

---

## Aprobación (Gate 0)
Este documento constituye el contrato de la tarea. Su aprobación es bloqueante para pasar a Phase 1.

```yaml
approval:
  developer:
    decision: SI
    date: 2026-01-19T23:15:16+01:00
    comments: "Aprobación explícita según solicitud del usuario en el prompt inicial."
```

---

## Historial de validaciones (Phase 0)
```yaml
history:
  - phase: "phase-0-acceptance-criteria"
    action: "completed"
    validated_by: "architect-agent"
    timestamp: "2026-01-19T23:15:16+01:00"
    notes: "Acceptance criteria definidos y aprobados explícitamente por el usuario."
```
