---
artifact: plan
phase: phase-3-planning
owner: architect-agent
status: approved
related_task: 13-dual-lifecycle-system
---

# Implementation Plan — 13-dual-lifecycle-system

## 1. Resumen del plan

**Contexto**: El sistema agéntico actual solo soporta un ciclo de vida de 9 fases (Long). El desarrollador necesita un ciclo simplificado (Short) de 3 fases para tareas de baja complejidad.

**Resultado esperado**:
- Selector funcional Long/Short en el proceso `init`.
- Carpeta `tasklifecycle-long/` (renombrada desde `tasklifecycle/`).
- Nueva carpeta `tasklifecycle-short/` con 3 fases.
- Campo `task.strategy` en el template de tareas.
- Aliases verificados y funcionales para ambos ciclos.

**Alcance**:
- ✅ Incluye: rename, workflows Short, templates, modificación de init, verificación de aliases.
- ❌ Excluye: modificaciones al comportamiento del ciclo Long, tests automatizados (no hay código funcional).

---

## 2. Inputs contractuales

- **Task**: `.agent/artifacts/13-dual-lifecycle-system/task.md`
- **Analysis**: `.agent/artifacts/13-dual-lifecycle-system/analysis.md`
- **Research**: `.agent/artifacts/13-dual-lifecycle-system/researcher/research.md`

**Dispatch de dominios**
```yaml
plan:
  workflows:
    drivers:
      action: none
  dispatch: []
```
> No se requiere dispatch a otros dominios. Esta tarea es puramente estructural.

---

## 3. Desglose de implementación (pasos)

### Paso 1: Rename de carpeta tasklifecycle
- **Descripción**: Renombrar `.agent/workflows/tasklifecycle/` → `.agent/workflows/tasklifecycle-long/`
- **Dependencias**: Ninguna.
- **Entregables**: Carpeta renombrada.
- **Agente**: architect-agent
- **Herramienta**: Terminal (`mv` command)

### Paso 2: Actualizar index.md de tasklifecycle-long
- **Descripción**: Cambiar el ID del workflow y las rutas de aliases para reflejar la nueva ubicación.
- **Dependencias**: Paso 1.
- **Entregables**: `.agent/workflows/tasklifecycle-long/index.md` actualizado.
- **Agente**: architect-agent

### Paso 3: Actualizar workflows/index.md
- **Descripción**: Cambiar alias `tasklifecycle` → `tasklifecycle-long` y añadir alias `tasklifecycle-short`.
- **Dependencias**: Paso 1.
- **Entregables**: `.agent/workflows/index.md` actualizado.
- **Agente**: architect-agent

### Paso 4: Crear carpeta tasklifecycle-short
- **Descripción**: Crear directorio y fichero `index.md` con aliases de las 3 fases.
- **Dependencias**: Paso 3.
- **Entregables**: `.agent/workflows/tasklifecycle-short/index.md`
- **Agente**: architect-agent

### Paso 5: Crear workflow short-phase-1-brief.md
- **Descripción**: Workflow que fusiona Acceptance + Analysis + Planning. Incluye 5 preguntas obligatorias y detección de complejidad.
- **Dependencias**: Paso 4.
- **Entregables**: `.agent/workflows/tasklifecycle-short/short-phase-1-brief.md`
- **Agente**: architect-agent

### Paso 6: Crear workflow short-phase-2-implementation.md
- **Descripción**: Workflow equivalente a P4 del ciclo Long. Incluye gate de revisión arquitectónica.
- **Dependencias**: Paso 4.
- **Entregables**: `.agent/workflows/tasklifecycle-short/short-phase-2-implementation.md`
- **Agente**: architect-agent

### Paso 7: Crear workflow short-phase-3-closure.md
- **Descripción**: Workflow que fusiona Verification + Results + Commit. Incluye gate final y aprobación del desarrollador.
- **Dependencias**: Paso 4.
- **Entregables**: `.agent/workflows/tasklifecycle-short/short-phase-3-closure.md`
- **Agente**: architect-agent

### Paso 8: Crear template brief.md
- **Descripción**: Template para el artefacto de la fase Brief (fusión de analysis + planning simplificados).
- **Dependencias**: Paso 5.
- **Entregables**: `.agent/templates/brief.md`
- **Agente**: architect-agent

### Paso 9: Crear template closure.md
- **Descripción**: Template para el artefacto de la fase Closure (fusión de verification + results).
- **Dependencias**: Paso 7.
- **Entregables**: `.agent/templates/closure.md`
- **Agente**: architect-agent

### Paso 10: Actualizar templates/index.md
- **Descripción**: Registrar aliases para `brief` y `closure`.
- **Dependencias**: Pasos 8 y 9.
- **Entregables**: `.agent/templates/index.md` actualizado.
- **Agente**: architect-agent

### Paso 11: Actualizar template task.md
- **Descripción**: Añadir campo `task.strategy: long | short` en el bloque YAML del template.
- **Dependencias**: Ninguna (puede ser paralelo).
- **Entregables**: `.agent/templates/task.md` actualizado.
- **Agente**: architect-agent

### Paso 12: Modificar init.md
- **Descripción**: Añadir paso de selección de estrategia (Long/Short) tras la confirmación de idioma.
- **Dependencias**: Pasos 3 y 11.
- **Entregables**: `.agent/workflows/init.md` actualizado.
- **Agente**: architect-agent

### Paso 13: Verificación de aliases
- **Descripción**: Verificar que la cadena de resolución de aliases funciona para ambos ciclos.
- **Dependencias**: Todos los pasos anteriores.
- **Entregables**: Checklist de verificación completado.
- **Agente**: architect-agent

---

## 4. Asignación de responsabilidades

### architect-agent (Único responsable)
- Ejecutar todos los pasos.
- Validar integridad de gates en workflows Short.
- Ejecutar verificación de aliases.

**No se requieren otros agentes** para esta tarea.

---

## 5. Estrategia de testing y validación

### Tests automatizados
**No aplica**. Esta tarea modifica ficheros de configuración del sistema agéntico, no código funcional. No existe suite de tests para workflows.

### Verificación manual (OBLIGATORIA)
1. **Verificar rename**: Confirmar que la carpeta `tasklifecycle-long/` existe y la antigua no.
2. **Verificar aliases Long**: 
   - Resolver `.agent/index.md` → `workflows.index` → `tasklifecycle-long.index` → `phase_0.workflow`
   - El fichero debe existir y ser legible.
3. **Verificar aliases Short**:
   - Resolver `.agent/index.md` → `workflows.index` → `tasklifecycle-short.index` → `short_phase_1.workflow`
   - El fichero debe existir y ser legible.
4. **Verificar templates**: Confirmar que `templates.brief` y `templates.closure` resuelven correctamente.
5. **Verificar init.md**: Confirmar que el paso de selección de estrategia está presente.
6. **Verificar task.md template**: Confirmar que el campo `task.strategy` está presente en el YAML.

### Trazabilidad
| Acceptance Criteria | Verificación |
|---------------------|--------------|
| AC-1: Selector en init | Verificación manual #5 |
| AC-2: Workflows Short | Verificación manual #3 |
| AC-3: Campo strategy | Verificación manual #6 |
| AC-4: Gates intactos | Revisión de secciones Gate en workflows |
| AC-5: Detección complejidad | Revisión de short-phase-1-brief.md |

---

## 6. Plan de demo
**No aplica**. Esta tarea modifica el sistema agéntico interno.

---

## 7. Estimaciones

| Paso | Esfuerzo |
|------|----------|
| P1-P3: Rename y actualización de índices | Bajo |
| P4-P7: Creación de workflows Short | Medio |
| P8-P10: Templates y registros | Bajo |
| P11-P12: Modificación de task y init | Bajo |
| P13: Verificación | Bajo |

**Total estimado**: ~30-40 tool calls de implementación.

---

## 8. Puntos críticos y resolución

| Punto crítico | Riesgo | Resolución |
|---------------|--------|------------|
| Alias rotos tras rename | Referencias hardcodeadas a la ruta antigua | Buscar y reemplazar todas las ocurrencias |
| Gates inconsistentes en Short | Fases sin validación adecuada | Copiar estructura de gates desde ciclo Long |
| Detección de complejidad insuficiente | Tareas complejas ejecutadas en Short | Incluir criterios explícitos en Brief |

---

## 9. Dependencias y compatibilidad

**Dependencias internas**:
- Sistema de índices (`.agent/index.md` y subdominios).
- Arquitectura de workflows existente.

**Dependencias externas**: Ninguna.

**Compatibilidad entre navegadores**: No aplica (no es código de extensión).

---

## 10. Criterios de finalización (Done)

- [ ] Carpeta `tasklifecycle-long/` existe con aliases actualizados.
- [ ] Carpeta `tasklifecycle-short/` existe con 3 workflows + index.
- [ ] Templates `brief.md` y `closure.md` creados y registrados.
- [ ] Campo `task.strategy` añadido al template `task.md`.
- [ ] Selector Long/Short funcional en `init.md`.
- [ ] Verificación de cadena de aliases completada sin errores.

---

## 11. Aprobación del desarrollador (OBLIGATORIA)

```yaml
approval:
  developer:
    decision: SI
    date: 2026-01-16T07:48:25+01:00
    comments: Plan aprobado
```

> Sin aprobación, esta fase NO puede darse por completada ni avanzar a Phase 4 (Implementation).
