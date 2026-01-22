---
artifact: analysis
phase: phase-2-analysis
owner: architect-agent
status: draft
related_task: 22-standardize-phase-0-artifact
---

# Analysis — 22-standardize-phase-0-artifact

## 1. Resumen ejecutivo
**Problema**
- El flujo actual de la Fase 0 (Acceptance Criteria) mezcla la gestión del estado de la tarea con la definición del contrato en un único archivo (`task.md`). Esto rompe la modularidad del sistema y dificulta la validación automática de Gates.

**Objetivo**
- Estandarizar el flujo para que cada fase produzca su propio artefacto, extrayendo los Criterios de Aceptación a un archivo dedicado `acceptance.md`.

**Criterio de éxito**
- Al finalizar la Fase 0, se debe haber generado un archivo `acceptance.md` que cumpla con el nuevo template.
- El archivo `task.md` debe estar libre de secciones de preguntas y criterios, delegando esa información al nuevo artefacto mediante alias.

---

## 2. Estado del proyecto (As-Is)
**Estructura relevante**
- `.agent/templates/task.md`: Contiene las secciones `## 5 Preguntas Obligatorias` y `## Acceptance Criteria`.
- `.agent/workflows/tasklifecycle-long/phase-0-acceptance-criteria.md`: Workflow que orquesta la creación del `task.md` definitivo.
- `.agent/workflows/tasklifecycle-short/short-phase-1-brief.md`: Workflow que orquesta el ciclo simplificado.

**Drivers existentes**
- No aplica (lógica de orquestación pura).

**Limitaciones detectadas**
- El parser de Gates actual debe buscar dentro de `task.md`, lo cual es inconsistente con el resto de fases (Research, Analysis, Planning) que generan archivos propios.

---

## 3. Cobertura de Acceptance Criteria
### AC-1: Alcance
- **Interpretación**: Modificar los workflows y templates para separar la Fase 0.
- **Verificación**: Comprobar que tras ejecutar Phase 0, existen `task.md` y `acceptance.md`.

### AC-2: Entradas / Datos
- **Interpretación**: Usar la estructura actual como base.

### AC-3: Salidas / Resultado esperado
- **Interpretación**: `task.md` limpio y `acceptance.md` generado.

### AC-4: Restricciones
- **Interpretación**: Mantener alias y retrocompatibilidad selectiva.
- **Verificación**: Asegurar que las referencias `task.acceptance` sigan funcionando.

---

## 4. Research técnico
**Decisión recomendada**
- **Enfoque de "Referencia por Alias"**: El archivo `task.md` contendrá una referencia al archivo `acceptance.md` en su sección de metadatos. El índice de artefactos (`.agent/artifacts/index.md`) se actualizará dinámicamente o los workflows usarán alias para acceder al contenido.
- **Mantenimiento de `templates/task.md`**: Se debe crear un `templates/task.md` simplificado para las nuevas tareas.

---

## 5. Agentes participantes
- **architect-agent**: Responsable de modificar los workflows y templates estructurales.
- **qa-agent**: Responsable de validar que el nuevo flujo genere los archivos correctos y que los Gates bloqueen si falta el artefacto.

**Componentes necesarios**
- `templates/acceptance.md` [NEW]
- `templates/task.md` [MODIFY]
- `templates/index.md` [MODIFY]
- `workflows/tasklifecycle-long/phase-0-acceptance-criteria.md` [MODIFY]
- `workflows/tasklifecycle-short/short-phase-1-brief.md` [MODIFY]

---

## 6. Impacto de la tarea
**Arquitectura**
- Se refuerza el principio de "1 fase = 1 artefacto".

**APIs / contratos**
- El contrato de aceptación se vuelve modular y más fácil de auditar por agentes de QA.

**Compatibilidad**
- Las tareas 1-21 se mantienen como están. El cambio aplica a partir de la tarea 22 (esta misma tarea se usará como prueba de concepto para la siguiente).

---

## 7. Riesgos y mitigaciones
- **Riesgo 1: Rotura de scripts de parsing**: Si algún script asume que los AC están en `task.md`.
  - **Mitigación**: Revisar todos los workflows en busca de lecturas directas a esas secciones de `task.md`.

---

## 8. Preguntas abiertas
- ¿Deberíamos mover también el historial de validaciones a un archivo `history.md` en el futuro? (Fuera de este alcance, se añadirá al TODO).

---

## 9. TODO Backlog (Consulta obligatoria)
**Estado actual**: 4 items pendientes.

**Items relevantes para esta tarea**:
- Ninguno directamente, pero esta tarea ayuda a la modularización necesaria para el item `004-portable-agentic-system`.

---

## 10. Aprobación
```yaml
approval:
  developer:
    decision: null
    date: null
    comments: null
```
