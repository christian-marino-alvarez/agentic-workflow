---
artifact: agent_task
phase: phase-4-implementation
owner: architect-agent
status: pending
related_task: 26-portable-agentic-system
task_number: 3
---

# Agent Task — 3-architect-cli-implementation

## Input (REQUIRED)
- **Objetivo**: Implementar el CLI `init` que despliega el sistema en el proyecto del usuario.
- **Alcance**: 
  - Crear `src/cli/index.ts` usando `commander` y `@clack/prompts`.
  - Comando `init`:
    - Preguntar idioma y estrategia (opcional, o dejar que el workflow init lo haga).
    - Copiar el contenido de `src/rules`, `src/workflows`, `src/templates` a `.agent/` en el `process.cwd()`.
    - Generar `.agent/index.md` dinámico apuntando a los ficheros copiados.
    - Generar `AGENTS.md` (instrucciones para IDE).
  - Compilación: Asegurar que `npm run build` genera `dist/` correcto.
- **Dependencias**: Tarea 2 completada.

---

## Reasoning (OBLIGATORIO)

> [!IMPORTANT]
> El agente **DEBE** completar esta sección ANTES de ejecutar.
> Documentar el razonamiento mejora la calidad y permite detectar errores temprano.

### Análisis del objetivo
- ¿Qué se pide exactamente?
- ¿Hay ambigüedades o dependencias?

### Opciones consideradas
- **Opción A**: (descripción)
- **Opción B**: (descripción)
- *(añadir más si aplica)*

### Decisión tomada
- Opción elegida: (A/B/...)
- Justificación: (por qué esta opción)

---

## Output (REQUIRED)
- **Entregables**:
  - `agentic-workflow/src/cli/index.ts`
  - `agentic-workflow/src/cli/commands/init.ts`
  - `agentic-workflow/bin/cli.js` (entrypoint ejecutable)
- **Evidencia requerida**:
  - Código fuente del CLI.
  - Prueba de compilación exitosa (`dist/` generado).

---

## Execution

```yaml
execution:
  agent: "architect-agent"
  status: pending
  started_at: null
  completed_at: null
```

---

## Implementation Report

> Esta sección la completa el agente asignado durante la ejecución.

### Cambios realizados
- (Archivos modificados, funciones añadidas, etc.)

### Decisiones técnicas
- (Decisiones clave y justificación)

### Evidencia
- (Logs, capturas, tests ejecutados)

### Desviaciones del objetivo
- (Si las hay, justificación)

---

## Gate (REQUIRED)

El desarrollador **DEBE** aprobar esta tarea antes de que el arquitecto asigne la siguiente.

```yaml
approval:
  developer:
    decision: SI
    date: 2026-01-19T22:36:51+01:00
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
