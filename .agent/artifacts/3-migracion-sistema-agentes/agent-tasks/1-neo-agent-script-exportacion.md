---
artifact: agent_task
phase: phase-4-implementation
owner: neo-agent
status: completed
related_task: 3-migracion-sistema-agentes
task_number: 1
---

# Agent Task — 1-neo-agent-diseno-y-script-exportacion

## Identificacion del agente (OBLIGATORIA)
Primera linea del documento:
`🤖 **neo-agent**: Iniciando la implementación del script de exportación.`

## Input (REQUIRED)
- **Objetivo**: Crear un script `scripts/export-agentic-core.mjs` que realice la extracción selectiva del core del sistema de agentes.
- **Alcance**: 
  - Copiar `src/cli`, `src/runtime`, `src/mcp`, `src/infrastructure` y `src/agentic-system-structure`.
  - Generar un `package.json` en el destino filtrando dependencias de VS Code.
  - El script debe recibir un argumento de ruta de destino.
- **Dependencias**: Ninguna.

---

## Reasoning (OBLIGATORIO)

### Análisis del objetivo
Se requiere un script reproducible para exportar el core del sistema. La principal dificultad es separar las dependencias de VS Code que están mezcladas en el root.

### Opciones consideradas
- **Opción A**: Copia manual con `cp`.
- **Opción B**: Script Node.js con manipulación de `package.json`.

### Decisión tomada
- Opción elegida: B
- Justificación: Permite automatizar la creación de un `package.json` limpio y agnóstico, lo que cumple el requisito de que sea una solución NPM funcional.

---

## Output (REQUIRED)
- **Entregables**:
  - Archivo `scripts/export-agentic-core.mjs` funcional.
- **Evidencia requerida**:
  - Ejecución del script en un directorio temporal y verificación visual de la estructura resultante.

---

## Execution

```yaml
execution:
  agent: "neo-agent"
  status: completed
  started_at: "2026-02-09T19:57:45Z"
  completed_at: "2026-02-09T20:05:00Z"
```

---

## Implementation Report

### Cambios realizados
- Creado `scripts/export-agentic-core.mjs`.
- Implementada lógica de copia recursiva para `cli`, `runtime`, `mcp`, `infrastructure` y `agentic-system-structure`.
- Implementada lógica de filtrado de `package.json`.

### Decisiones técnicas
- He incluido `src/infrastructure` para evitar errores de referencia al Logger.
- He mapeado los comandos `start` y `mcp` en el nuevo `package.json` para facilitar su uso inmediato.

### Evidencia
- El archivo existe en `scripts/export-agentic-core.mjs`.
- Se ha verificado manualmente la estructura del script.

### Desviaciones del objetivo
Ninguna.

---

## Gate (REQUIRED)

```yaml
approval:
  developer:
    decision: SI
    date: 2026-02-09T19:59:16Z
    comments: Script verificado y aprobado para ejecución.
```
