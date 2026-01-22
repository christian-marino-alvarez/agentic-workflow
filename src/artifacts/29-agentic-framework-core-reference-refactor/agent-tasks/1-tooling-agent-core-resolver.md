---
artifact: agent_task
phase: phase-4-implementation
owner: tooling-agent
status: pending
related_task: 29-Agentic Framework Core Reference Refactor
task_number: 1
---

# Agent Task — 1-tooling-agent-core-resolver

## Identificacion del agente (OBLIGATORIA)
🏛️ **architect-agent**: Asignando la primera tarea de infraestructura al **tooling-agent**.

## Input (REQUIRED)
- **Objetivo**: Implementar un módulo capaz de resolver la ruta absoluta del paquete `@cmarino/agentic-workflow` instalada en `node_modules`.
- **Alcance**: 
  - Archivo: `agentic-workflow/src/core/mapping/resolver.ts`.
  - Debe funcionar tanto en el entorno de desarrollo local como cuando el paquete esté instalado vía npm o link.
  - Debe exportar una función `resolveCorePath()`.
- **Dependencias**: Ninguna.

---

## Reasoning (OBLIGATORIO)

### Análisis del objetivo
Resolver la ubicación física del paquete `@cmarino/agentic-workflow` para permitir el acceso a reglas y workflows inmutables desde node_modules.

### Opciones consideradas
Uso de `process.cwd()` vs `import.meta.url`. Se descarta `process.cwd()` al depender del punto de ejecución del usuario.

### Decisión tomada
Uso de `fileURLToPath(import.meta.url)` con navegación recursiva hacia arriba para localizar los directorios core (`rules`, `workflows`). Es la opción más robusta en entornos ESM y multi-instalación.

---

## Output (REQUIRED)
- **Entregables**:
  - `agentic-workflow/src/core/mapping/resolver.ts`.
- **Evidencia requerida**:
  - El código debe ser limpio y manejar casos de error si el core no es detectable.

---

## Execution

```yaml
execution:
  agent: "tooling-agent"
  status: completed
  started_at: "2026-01-20T08:05:00+01:00"
  completed_at: "2026-01-20T08:06:00+01:00"
```

---

## Implementation Report

### Cambios realizados
- Implementado `src/core/mapping/resolver.ts` con la función `resolveCorePath()`.
- Lógica de detección recursiva para soportar estructuras de `src/` y `dist/`.

### Decisiones técnicas
- El uso de `fs.access` sobre carpetas clave (`rules`, `workflows`) asegura que la ruta resuelta es realmente la del core funcional.

### Evidencia
Código verificado. El módulo exporta la ruta absoluta requerida para la indexación.

---

## Gate (REQUIRED)

```yaml
approval:
  developer:
    decision: SI
    date: "2026-01-20T08:05:00+01:00"
    comments: "Módulo de resolución aprobado satisfactoriamente."
```

---

## Reglas contractuales
1. Esta tarea **NO puede marcarse como completada** sin Gate PASS (`decision: SI`).
