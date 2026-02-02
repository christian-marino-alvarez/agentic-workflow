---
id: constitution.runtime_integration
owner: architect-agent
version: 1.0.0
severity: PERMANENT
scope: global
---

# RUNTIME INTEGRATION CONSTITUTION

Este documento define las reglas obligatorias para la integración del runtime MCP en la ejecución de workflows.

---

## 1. REGLA DE INTEGRACIÓN RUNTIME (PERMANENT - CRITICAL)

Cuando cualquier agente ejecute un workflow del sistema (`init`, `tasklifecycle-short`, `tasklifecycle-long`), **DEBE** utilizar las herramientas del runtime MCP para garantizar trazabilidad y persistencia de estado.

### 1.1 Herramientas Obligatorias

| Evento | Herramienta MCP | Cuándo usar |
|--------|-----------------|-------------|
| Inicio de tarea | `runtime.run` | Al crear una nueva tarea |
| Avance de fase | `runtime.advance_phase` | Al completar cada fase del ciclo |
| Obtener estado | `runtime.get_state` | Para consultar el estado actual |
| Validar gate | `runtime.validate_gate` | Antes de solicitar aprobación |
| Evento importante | `runtime.emit_event` | Para eventos de chat, errores, etc. |

### 1.2 Flujo Obligatorio

```
1. Al iniciar workflow:
   → Llamar `runtime.run` con taskPath y agent

2. Al completar cada fase:
   → Llamar `runtime.validate_gate` para verificar precondiciones
   → Solicitar aprobación al desarrollador (notify_user)
   → Llamar `runtime.advance_phase` tras aprobación

3. Durante la ejecución:
   → Usar `runtime.emit_event` para eventos significativos
   → Usar `runtime.get_state` para consultar estado si es necesario
```

---

## 2. REQUISITOS PREVIOS (PERMANENT)

Para que esta constitución sea aplicable:

1. El servidor MCP debe estar registrado en el cliente (Antigravity/Codex).
   - Si no está registrado, ejecutar: `agentic-workflow register-mcp`

2. El servidor MCP debe estar corriendo en background o ser invocable.

### 2.1 Verificación de Registro

Al iniciar cualquier workflow, el agente **DEBE** verificar que las herramientas del runtime están disponibles. Si no lo están:
- Informar al desarrollador.
- Sugerir ejecutar `agentic-workflow register-mcp`.
- Continuar con ejecución fallback (sin runtime) si el desarrollador lo autoriza.

---

## 3. LOGS Y TRAZABILIDAD (PERMANENT)

Todas las llamadas al runtime generan logs en stderr. Estos logs son la **fuente de verdad** para auditar la ejecución de workflows.

### 3.1 Formato de Logs
```
[LEVEL] [SOURCE] Message {context}
```

### 3.2 Herramienta de Debug
- `debug_read_logs`: Permite leer los logs almacenados en el buffer del runtime.

---

## 4. EXCEPCIONES (PERMANENT)

Esta constitución **NO aplica** cuando:
- El desarrollador solicita explícitamente ejecución sin runtime.
- Las herramientas MCP no están disponibles y el desarrollador autoriza fallback.
- Se trata de operaciones de solo lectura (consultas, investigación).

---

## Authority

Esta constitución es **binding** cuando referenciada como `INJECTED` o `PERMANENT`.
Creada por: architect-agent
Fecha: 2026-02-02
