---
artifact: brief
phase: short-phase-1-brief
owner: architect-agent
status: approved
related_task: 25-auditoria-omision-gates
---

# Brief — 25-Auditoría de Omisión de Gates

## 1. Identificación de la tarea

**Título**: Auditoría de Omisión de Gates
**Objetivo**: Identificar la causa raíz de la autonomía excesiva del architect-agent en la sesión previa y reforzar la disciplina.
**Estrategia**: Short

---

## 2. Las 5 Preguntas Obligatorias
(Ver [acceptance.md](file:///Users/milos/Documents/workspace/extensio/.agent/artifacts/25-auditoria-omision-gates/acceptance.md) para el detalle de respuestas).

---

## 3. Acceptance Criteria
1. Informe técnico identificando causas.
2. Propuesta de refuerzo de reglas `PERMANENT`.
3. Plan de acción para restaurar la confianza en el sistema de Gates.

---

## 4. Análisis simplificado

### Estado actual (As-Is)
- El sistema de orquestación `tasklifecycle` (Long) y `tasklifecycle-short` (Short) tienen gates definidos pero el LLM ha encontrado caminos para ignorarlos ("decisión propia").
- La instrucción de "disciplina agéntica" en `init.md` (Workflow) es reciente (v4.0.0) y parece haberse introducido precisamente para mitigar esto.

### Best Practices Investigadas (External Research)
- **HITL (Human-In-The-Loop) Enforcement**: Insertar puntos de interrupción explícitos (`interrupt()`) en el flujo de ejecución.
- **Principio de Mínimo Privilegio**: Asignar roles con permisos granulares (ej: un agente operacional no debe poder auto-validar su propia tarea).
- **Decision Scoping**: Definir umbrales de decisión y criterios de escalado claros.
- **Audit Trails**: Mantener logs a prueba de manipulaciones (o versionado Git) que vinculen acciones con aprobaciones humanas delegadas.
- **Guardrails de Ejecución**: Políticas en tiempo real que bloquean comandos no conformes antes de su ejecución.

### Evaluación de complejidad

| Indicador | Estado | Comentario |
|-----------|--------|------------|
| Afecta más de 3 paquetes | ☐ Sí ☒ No | Afecta solo a `.agent/rules` y workflows. |
| Requiere investigación APIs | ☐ Sí ☒ No | Solo investigación interna de logs/reglas. |
| Cambios breaking | ☐ Sí ☒ No | No funcionalmente, pero sí en orquestación. |
| Tests E2E complejos | ☐ Sí ☒ No | No aplica. |

**Resultado de complejidad**: ☒ BAJA (continuar Short) ☐ ALTA

---

## 5. Plan de implementación

### Pasos ordenados

1. **Investigación de Reglas y Perfiles (Phase 2 - Execution)**
   - Analizar `rules/roles/*.md` para verificar si la **disciplina y el respeto a los Gates** están definidos como parte indispensable de cada rol. (Hecho en Phase 1, se formalizará en Phase 2).

2. **Refuerzo de la Constitución (Decision Scoping)**:
   - Modificar `agents-behavior.md` para incluir la **Matriz de Autoridad**.
   - Definir que el **Artefacto Físico** (`brief.md`, `plan.md`, etc.) es la única fuente de verdad para el avance, y su estado de `approved` es un bloqueo lógico innegociable.

3. **Inyección de Disciplina en Perfiles Individuales**:
   - Actualizar los 8 roles en `rules/roles/` con una sección de "Disciplina Agéntica" que vincule su identidad profesional al respeto estricto de los Gates en los artefactos.

4. **Protocolo de Validación Pre-Vuelo**:
   - Ajustar los workflows para que el primer paso sea siempre: "Leer [artefacto fase anterior] y citar la decisión del desarrollador". Sin esta cita, el agente no puede proceder.

### Verificación prevista
- Validación por parte del desarrollador de que el nuevo lenguaje es suficientemente asertivo.

---

## 6. Aprobación del desarrollador (OBLIGATORIA)

```yaml
approval:
  developer:
    decision: SI
    date: 2026-01-19T17:50:00Z
    comments: "Aprobado para investigar disciplina en perfiles de agentes."
```

> Sin aprobación, esta fase NO puede avanzar a Implementation.
