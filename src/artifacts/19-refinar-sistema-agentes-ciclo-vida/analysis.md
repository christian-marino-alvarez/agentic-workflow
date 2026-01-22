---
artifact: analysis
phase: phase-2-analysis
owner: architect-agent
status: draft
related_task: 19-refinar-sistema-agentes-ciclo-vida
---

# Analysis — 19-refinar-sistema-agentes-ciclo-vida

## 1. Resumen ejecutivo

🏛️ **architect-agent**: Análisis basado en el [research aprobado](file:///Users/milos/Documents/workspace/extensio/.agent/artifacts/19-refinar-sistema-agentes-ciclo-vida/researcher/research.md).

**Problema**
Los workflows actuales del ciclo de vida de tareas presentan:
1. Mezcla de responsabilidades Research ↔ Análisis
2. Delegación de subtareas sin estructura Input/Output/Gate individual
3. Ausencia de backlog TODO integrado en el análisis
4. Falta de trazabilidad del razonamiento de agentes

**Objetivo**
Optimizar el sistema de agentes para tener un flow de desarrollo ayudado por AI y auditado en todo momento por el desarrollador.

**Criterio de éxito**
- [x] AC1: Research documenta sin analizar → Requiere modificar `templates/research.md`
- [x] AC2: Análisis propone alternativas from research → Requiere workflow update
- [x] AC3: Plan asigna subtareas granulares → Ya implementado en phase-4
- [x] AC4: Implementación con Gate por subtarea → Ya implementado
- [x] AC5: QA delega correcciones → Ya implementado en phase-5
- [ ] AC6: TODO backlog funcional → Requiere crear estructura

---

## 2. Estado del proyecto (As-Is)

### Estructura relevante
```
.agent/
├── workflows/tasklifecycle-long/
│   ├── phase-1-research.md    ← MODIFICAR
│   ├── phase-2-analysis.md    ← MODIFICAR
│   ├── phase-3-planning.md    ← OK
│   ├── phase-4-implementation.md ← OK
│   └── phase-5-verification.md   ← OK
├── templates/
│   ├── research.md            ← MODIFICAR (eliminar secciones de análisis)
│   └── analysis.md            ← MODIFICAR (añadir consulta TODO)
├── todo/                      ← VACÍO (crear estructura)
└── rules/constitution/
    └── agents-behavior.md     ← OK
```

### Limitaciones detectadas
1. El template `research.md` incluye secciones que son análisis (Sección 3, 6, 7)
2. El workflow `phase-2-analysis.md` no menciona consulta obligatoria a TODO
3. No existe template para crear items de TODO

---

## 3. Cobertura de Acceptance Criteria

### AC-1: Research documenta sin analizar
- **Interpretación**: La fase de Research debe limitarse a recopilar información de fuentes oficiales y documentación interna, sin proponer soluciones ni evaluar trade-offs.
- **Verificación**: El template `research.md` no debe contener secciones tituladas "Pros/Contras", "Recomendaciones", "Decisión recomendada".
- **Propuesta**: Renombrar secciones problemáticas a "Hallazgos" y mover análisis al template de analysis.

### AC-2: Análisis propone alternativas basadas en Research
- **Interpretación**: El análisis debe partir exclusivamente de los hallazgos documentados en research.md.
- **Verificación**: El workflow debe exigir que research.md esté aprobado antes de iniciar análisis.
- **Propuesta**: Añadir paso obligatorio: "Consultar .agent/todo/ para incorporar mejoras pendientes".

### AC-3: Plan asigna subtareas granulares
- **Interpretación**: 1 subtarea = 1 objetivo = 1 agente.
- **Verificación**: Ya implementado en phase-4-implementation.md con `agent-tasks/`.
- **Estado**: ✅ CUMPLE

### AC-4: Implementación con Gate por subtarea
- **Interpretación**: Cada subtarea requiere aprobación explícita antes de continuar.
- **Verificación**: Ya implementado en phase-4-implementation.md (paso 3.3).
- **Estado**: ✅ CUMPLE

### AC-5: QA delega correcciones
- **Interpretación**: QA no modifica código, crea nuevas tareas de corrección.
- **Verificación**: Ya implementado en phase-5-verification.md (paso 12).
- **Estado**: ✅ CUMPLE

### AC-6: TODO backlog funcional
- **Interpretación**: Existe `.agent/todo/` con items de mejora consultados en cada análisis.
- **Verificación**: El directorio existe pero está vacío.
- **Propuesta**: Crear template `todo-item.md` y añadir consulta obligatoria en phase-2.

---

## 4. Alternativas de Solución

### Alternativa A: Refactor Mínimo (Conservador)
| Aspecto | Detalle |
|---------|---------|
| **Descripción** | Modificar solo los templates sin tocar workflows |
| **Cambios** | `templates/research.md`, `templates/analysis.md` |
| **Ventajas** | Menor riesgo, cambios localizados |
| **Inconvenientes** | No garantiza cumplimiento a nivel de workflow |

### Alternativa B: Refactor Completo (Recomendada)
| Aspecto | Detalle |
|---------|---------|
| **Descripción** | Modificar workflows + templates + crear estructura TODO |
| **Cambios** | 2 workflows, 2 templates, 1 template nuevo, estructura TODO |
| **Ventajas** | Cumplimiento completo de acceptance criteria |
| **Inconvenientes** | Mayor esfuerzo, requiere testing manual de workflows |

### Alternativa C: Reestructuración Profunda
| Aspecto | Detalle |
|---------|---------|
| **Descripción** | Reescribir todo el ciclo de vida con nuevos patrones de orquestación |
| **Cambios** | Todos los workflows, todos los templates, nuevas rules |
| **Ventajas** | Máxima alineación con best practices de agent orchestration |
| **Inconvenientes** | Excede el scope de la tarea, alto riesgo |

**Decisión propuesta**: **Alternativa B** — Refactor completo pero acotado a los acceptance criteria.

---

## 5. Agentes participantes

| Agente | Responsabilidades | Subáreas |
|--------|-------------------|----------|
| **architect-agent** | Orquestar, supervisar, validar | Workflows, templates, estructura TODO |
| **tooling-agent** | N/A para esta tarea | - |
| **qa-agent** | Validar que los cambios cumplen AC | Testing manual de workflows |

**Handoffs**
1. architect-agent diseña → architect-agent implementa (no hay código funcional)
2. architect-agent completa → qa-agent valida

**Componentes necesarios**
- **Modificar**: `templates/research.md`, `templates/analysis.md`, `phase-1-research.md`, `phase-2-analysis.md`
- **Crear**: `templates/todo-item.md`, `.agent/todo/README.md`
- **Eliminar**: Ninguno

**Demo**: No aplica — no hay UI ni código funcional.

---

## 6. Impacto de la tarea

| Área | Impacto |
|------|---------|
| **Arquitectura** | Sin cambios en código, solo en sistema agéntico |
| **APIs / contratos** | Sin breaking changes |
| **Compatibilidad** | Los workflows modificados son retrocompatibles |
| **Testing** | Validación manual por qa-agent |

---

## 7. Riesgos y mitigaciones

| Riesgo | Severidad | Mitigación |
|--------|-----------|------------|
| Workflows modificados rompen ciclo existente | Alta | Revisar cada cambio con qa-agent antes de commit |
| Templates nuevos no se usan correctamente | Media | Incluir ejemplos en cada template |
| TODO backlog se ignora en análisis futuros | Baja | Añadir paso obligatorio con verificación en Gate |

---

## 8. Preguntas abiertas

✅ Ninguna — todas las ambigüedades fueron resueltas en Phase 0.

---

## 9. TODO Backlog (Consulta obligatoria)

> Referencia: `.agent/todo/`

**Estado actual**: Directorio vacío.
**Impacto en esta tarea**: Ningún item pendiente a considerar.

---

## 10. Aprobación

```yaml
approval:
  developer:
    decision: SI
    date: 2026-01-18T18:27:46+01:00
    comments: ok - Alternativa B aprobada
```
