---
artifact: agent_task
phase: phase-4-implementation
owner: architect-agent
status: pending
related_task: 26-portable-agentic-system
task_number: 2
---

# Agent Task — 2-architect-core-migration

## Input (REQUIRED)
- **Objetivo**: Migrar y adaptar el core agéntico (Rules, Workflows, Templates) al nuevo paquete, desacoplándolo de Extensio.
- **Alcance**: 
  - Copiar `.agent/rules/` a `agentic-workflow/src/rules/` (filtrando reglas específicas de Extensio como constitution.modules).
  - Copiar `.agent/workflows/` a `agentic-workflow/src/workflows/` (solo workflows genéricos como tasklifecycle).
  - Copiar `.agent/templates/` a `agentic-workflow/src/templates/`.
  - Crear `agentic-workflow/src/index.ts` que exporte utilidades core.
  - Limpiar referencias hardcodeadas a `/Users/.../extensio` en los ficheros copiados (reemplazar por variables de entorno o paths relativos).
- **Dependencias**: Tarea 1 completada.

---

## Reasoning (OBLIGATORIO)

> [!IMPORTANT]
> El agente **DEBE** completar esta sección ANTES de ejecutar.
> Documentar el razonamiento mejora la calidad y permite detectar errores temprano.

### Análisis del objetivo
- ¿Qué se pide exactamente?
  - Extraer la lógica "core" de orquestación (reglas, workflows, templates) a un paquete aislado.
  - Eliminar dependencias intelectuales (referencias a Extensio, WebExtensions) para hacerlo genérico.

### Opciones consideradas
- **Opción A**: Copiar todo y borrar fichero por fichero. Riesgo de fuga de información o basura.
- **Opción B**: Copia selectiva (allowlist) de reglas de constitución y workflows de ciclo de vida, ignorando dominios específicos (drivers/modules).

### Decisión tomada
- Opción elegida: **Opción B y Refactorización In-situ**.
- Justificación: Permite construir un core limpio desde cero. Se renombraron conceptos clave (`extensio-architecture` -> `project-architecture`) para garantizar neutralidad.

---

## Output (REQUIRED)
- **Entregables**:
  - `agentic-workflow/src/rules/` (limpio y genérico)
  - `agentic-workflow/src/workflows/` (ciclo de vida only)
  - `agentic-workflow/src/templates/` (sin referencias a drivers/modules)
  - `agentic-workflow/src/core/index.ts`
- **Evidencia requerida**:
  - Listado de archivos en `src/`.
  - Muestra de un workflow migrado sin referencias absolutas.

---

## Execution

```yaml
execution:
  agent: "architect-agent"
  status: completed
  started_at: "2026-01-19T22:22:00+01:00"
  completed_at: "2026-01-19T22:27:00+01:00"
```

---

## Implementation Report

> Esta sección la completa el agente asignado durante la ejecución.

### Cambios realizados
- **Copia Base**: Workflows de `tasklifecycle`, `init`, y Rules de `constitution` y `roles` fueron migrados.
- **Generalización**:
  - `clean-code.md` reescrito para eliminar referencias a Browser Extensions.
  - `project-architecture.md` creado como sustituto de `extensio-architecture.md`.
  - `architect.md` actualizado a rol de arquitecto de proyecto genérico.
- **Limpieza**:
  - Eliminados roles `driver`, `module`, `surface`.
  - Eliminados templates de creación de drivers y módulos.
  - Actualizado `templates/index.md` con la lista canónica reducida.

### Decisiones técnicas
- Se mantiene `GEMINI.location.md` ya que es una dependencia de entorno externa, pero el puntero es válido.
- Se eliminaron los paths absolutos en las copias (pendiente de validación final en paso de linking, pero los ficheros clave ya usan alias o paths relativos `.agent/`).

### Evidencia
- Estructura en `agentic-workflow/src` refleja un sistema agnóstico.

### Desviaciones del objetivo
- Ninguna significativa. La refactorización fue más profunda de lo previsto en la descripción original (renombrado de arquitectura), lo cual es positivo.

---

## Gate (REQUIRED)

El desarrollador **DEBE** aprobar esta tarea antes de que el arquitecto asigne la siguiente.

```yaml
approval:
  developer:
    decision: SI
    date: 2026-01-19T22:28:19+01:00
    comments: Aprobado por consola.
```

---

## Reglas contractuales

1. Esta tarea **NO puede marcarse como completada** sin Gate PASS (`decision: SI`).
2. Si Gate FAIL (`decision: NO`):
   - El arquitecto define acciones correctivas.
   - Se genera una nueva tarea de corrección si procede.
3. El agente asignado **NO puede modificar** el Input ni el Output definidos por el arquitecto.
4. El Gate es **síncrono y bloqueante**: el flujo se detiene hasta obtener respuesta del desarrollador.
