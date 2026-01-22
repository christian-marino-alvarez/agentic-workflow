🏛️ **architect-agent**: Documento de Acceptance Criteria generado y listo para revisión.

# Acceptance Criteria — 28-Agent System Update & Conversion System

## 1. Definición Consolidada
Desarrollar un sistema de migración y actualización ("Wizard") para el ecosistema `@cmarino/agentic-workflow`. El sistema debe ser capaz de detectar cualquier estructura previa del directorio `.agent/`, analizar sus reglas y contenidos actuales, y automatizar su conversión a la última estructura y estándares de disciplina del framework portable. El proceso será interactivo, notificando al usuario y requiriendo su aprobación antes de aplicar cambios permanentes, garantizando que tras la migración el comando `init` y el ciclo de vida de tareas funcionen correctamente.

## 2. Respuestas a Preguntas de Clarificación

| # | Pregunta (formulada por architect) | Respuesta (del desarrollador) |
|---|-----------------------------------|-------------------------------|
| 1 | ¿Qué versiones anteriores debemos detectar? | Cualquier estructura existente. Capacidad de migrar mediante un agente wizard. |
| 2 | ¿Alcance de la adaptación (estructura vs contenido)? | Todo: estructura y contenido. Adaptar todas las reglas al nuevo sistema de la última versión. |
| 3 | ¿Trigger de actualización y UX? | El sistema más usable y visual posible (Propuesta por architect). |
| 4 | ¿Estrategia contra conflictos de usuario? | Pedir aceptación explícita al usuario informándole detalladamente del cambio. |
| 5 | ¿Criterios de validación post-conversión? | Estructura correcta, `init` funcional, y capacidad de completar una tarea de prueba completa. |

---

## 3. Criterios de Aceptación Verificables

1. **Alcance**:
   - Detección automática de la carpeta `.agent/` y diagnóstico de su versión/estructura.
   - Migración completa de: Índices, Workflows, Rules (Constituciones y Roles) y Templates.
   - Inyección de las nuevas reglas de identidad y disciplina de agentes.

2. **Entradas / Datos**:
   - Estructura preexistente del directorio `.agent/`.
   - Feedback del usuario mediante aprobación de los cambios propuestos.

3. **Salidas / Resultado esperado**:
   - Directorio `.agent/` actualizado a la última versión del framework portable.
   - Todos los archivos cumplen con los nuevos estándares de frontmatter y contenido.
   - Funcionamiento garantizado de los workflows `init` y `tasklifecycle`.

4. **Restricciones**:
   - **Prohibido** sobrescribir archivos sin aprobación previa del usuario.
   - El sistema debe ser capaz de revertir o manejar fallos durante la migración (Higiene de artefactos).

5. **Criterio de aceptación (Done)**:
   - El comando `init` se ejecuta sin errores en el entorno migrado.
   - Una tarea de prueba ("Task #29 Test") puede completar todas las fases del ciclo de vida largo sin desviaciones.

---

## Aprobación (Gate 0)
Este documento constituye el contrato de la tarea. Su aprobación es bloqueante para pasar a Phase 1.

```yaml
approval:
  developer:
    decision: SI
    date: "2026-01-20T00:10:00+01:00"
    comments: "Aprobado vía consola."
```

---

## Historial de validaciones (Phase 0)
```yaml
history:
  - phase: "phase-0-acceptance-criteria"
    action: "completed"
    validated_by: "architect-agent"
    timestamp: "2026-01-20T00:09:00+01:00"
    notes: "Acceptance criteria definidos tras clarificación con el desarrollador."
```
