---
artifact: brief
phase: short-phase-1-brief
owner: architect-agent
status: draft
related_task: 2026-01-19-orchestration-init
---

# Brief — 2026-01-19-orchestration-init

## 1. Identificación de la tarea

**Título**: Analyze Orchestration Rules Injection in Init
**Objetivo**: Analizar si es conveniente explicar al LLM las normas de orquestación del sistema durante la fase `init` para evitar que se salte gates o tome decisiones propias priorizando la velocidad o la autodeterminación en fases posteriores.
**Estrategia**: Short

---

## 2. Las 5 Preguntas Obligatorias

| # | Pregunta (formulada por architect) | Respuesta (del desarrollador) |
|---|-----------------------------------|-------------------------------|
| 1 | Problema Específico | El LLM se suele saltar los gates de cada fase y no suele cambiar los roles cuando toca hacer las tareas. |
| 2 | Alcance de la Inyección | Valorar qué es mejor, pero debe ser en el init. |
| 3 | Riesgo de Contexto | No, nunca consumirá más si es controlado; sino deberá leer rutas que puede llevar a mayor contexto. |
| 4 | Criterio de Éxito | En el día a día (observación empírica de adherencia). |
| 5 | Alternativas | Init debe dar el contexto suficiente para que el LLM no interprete las normas al libre decisión. constitution.agents_behavior debe ser ya más por tarea. |

---

## 3. Acceptance Criteria

Derivados de las respuestas anteriores:

1. **Alcance**: Modificar el workflow `init` para incluir instrucciones explícitas sobre orquestación, gates y roles.
2. **Entradas/Datos**: `workflow.init.md` actual y reglas de `agents_behavior`.
3. **Salidas esperadas**: Un `workflow.init` reforzado que "impronte" al LLM con la obligación de respetar gates y roles desde el inicio.
4. **Restricciones**: No aumentar excesivamente el contexto, mantener la claridad.
5. **Criterio de Done**: Verificación visual del cambio y posterior verificación empírica en el uso diario.

---

## 4. Análisis simplificado

### Estado actual (As-Is)
- Estructura afectada: `workflow.init` es el punto de entrada. Actualmente carga reglas pero quizás no enfatiza la *meta-regla* de "NO saltar pasos".
- Limitaciones conocidas: Los LLMs tienen a optimizar por velocidad y "completar" tareas, a veces asumiendo aprobaciones implícitas.

### Evaluación de complejidad

| Indicador | Estado | Comentario |
|-----------|--------|------------|
| Afecta más de 3 paquetes | ☐ Sí ☑ No | Solo afecta workflows/reglas internas. |
| Requiere investigación APIs | ☐ Sí ☑ No | |
| Cambios breaking | ☐ Sí ☑ No | Es un cambio de proceso, no de código funcional. |
| Tests E2E complejos | ☐ Sí ☑ No | |

**Resultado de complejidad**: ☑ BAJA (continuar Short) ☐ ALTA (recomendar abortar a Long)

---

## 5. Plan de implementación

### Pasos ordenados

1. **Análisis de `workflow.init` y `constitution.agents_behavior`**
   - Descripción: Revisar cómo se cargan las reglas hoy y dónde insertar la instrucción "Blocker".
   - Entregables: Propuesta de cambio en texto.

2. **Modificación de `workflow.init`**
   - Descripción: Inyectar una sección de "Orquestación y Disciplina" en el prompt del workflow o cargar una regla específica `rules.orchestration_discipline` si se considera mejor.
   - Entregables: `workflow.init.md` actualizado.

### Verificación prevista
- Tipo de tests: Manual (Review del diff y ejecución de prueba del init).
- Criterios de éxito: El LLM reconoce explícitamente estas restricciones al ejecutar init.

---

## 6. Aprobación del desarrollador (OBLIGATORIA)

```yaml
approval:
  developer:
    decision: SI | NO
    date: <ISO-8601>
    comments: <opcional>
```
