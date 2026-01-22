🏛️ **architect-agent**: Implementation Plan

# Implementation Plan — 27-update-portable-module-agent-identity

## 1. Resumen del plan
- **Contexto**: Alinear el paquete portable `@cmarino/agentic-workflow` con los estándares de disciplina de Extensio.
- **Resultado esperado**: Paquete v1.1.0 publicado (localmente) con templates y workflows actualizados que fuerzan identificación y validación estricta de gates.
- **Alcance**: Modificación de `src/templates`, `src/workflows`, `src/rules/roles` y `package.json` dentro de `agentic-workflow/`.

---

## 2. Inputs contractuales
- **Task**: `.agent/artifacts/27-update-portable-module-agent-identity/task.md`
- **Analysis**: `.agent/artifacts/27-update-portable-module-agent-identity/analysis.md`
- **Acceptance Criteria**: AC-1 a AC-4 definidos en Fase 0.

**Dispatch de dominios (OBLIGATORIO si aplica)**
```yaml
plan:
  workflows:
    drivers:
      action: none
      workflow: none

  dispatch:
    - domain: core
      action: refactor
      workflow: workflow.tasklifecycle.phase-4-implementation
    - domain: qa
      action: verify
      workflow: workflow.tasklifecycle.phase-5-verification
```

---

## 3. Desglose de implementación (pasos)

### Paso 1: Actualizar Templates
- **Descripción**: Inyectar el encabezado de "Identificación del agente" en todos los archivos `.md` de `src/templates/`.
- **Dependencias**: Ninguna.
- **Entregables**: 19 templates actualizados.
- **Agente responsable**: module-agent.

### Paso 2: Actualizar Workflows (Long Lifecycle)
- **Descripción**: Reforzar Gates y validación de `task.md` en los 10 workflows de `src/workflows/tasklifecycle-long/`. Añadir pasos de activación de rol.
- **Dependencias**: Paso 1.
- **Entregables**: 10 workflows actualizados.
- **Agente responsable**: module-agent.

### Paso 3: Actualizar Workflows (Short Lifecycle y Otros)
- **Descripción**: Lo mismo para `tasklifecycle-short` e `init.md`.
- **Dependencias**: Paso 2.
- **Entregables**: 4 workflows de ciclo corto + `init.md` actualizados.
- **Agente responsable**: module-agent.

### Paso 4: Actualizar Roles y package.json
- **Descripción**: Revisar reglas de roles para consistencia y realizar el bump de versión a `1.1.0`.
- **Dependencias**: Paso 3.
- **Entregables**: `src/rules/roles/*.md` actualizados y `package.json` v1.1.0.
- **Agente responsable**: module-agent.

---

## 4. Asignación de responsabilidades (Agentes)

- **Architect-Agent**
  - Supervisión global y validación de Gates.
- **Module-Agent**
  - Ejecución de los pasos 1 al 4 (edición de fuentes).
- **QA / Verification-Agent**
  - Ejecución del Paso 5 (Verificar que un `init` en carpeta nueva usa los nuevos templates).

---

## 5. Estrategia de testing y validación
- **Manual / Simulado**: 
  - Ejecutar `builder` del paquete para generar `dist`.
  - Crear proyecto temporal.
  - Ejecutar `agentic-workflow init` desde el build local.
  - Verificar que los artefactos generados tengan la estructura correcta.

---

## 6. Plan de demo (si aplica)
- No aplica (tarea técnica de infraestructura).

---

## 7. Estimaciones y pesos de implementación
- **Dificultad**: Media (alto volumen de ficheros, pero cambios repetitivos).
- **Esfuerzo**: Alto (precisión en 30+ ficheros).

---

## 8. Puntos críticos y resolución
- **Punto crítico 1**: No romper los marcadores `{{handlebars}}` en los templates al inyectar el prefijo.
- **Estrategia**: Supervisión de sintaxis en el review del arquitecto.

---

## 9. Dependencias y compatibilidad
- **Dependencias**: Node.js instalado.
- **Compatibilidad**: Total con el CLI actual.

---

## 10. Criterios de finalización
- [ ] 19 templates actualizados con identificación.
- [ ] Workflows de ciclo largo y corto actualizados con gates estrictos.
- [ ] Versión 1.1.0 en package.json.
- [ ] Verificación exitosa del proceso de init con el nuevo paquete.

---

## 11. Aprobación del desarrollador (OBLIGATORIA)
```yaml
approval:
  developer:
    decision: SI
    date: 2026-01-19T23:23:05+01:00
    comments: null
```
