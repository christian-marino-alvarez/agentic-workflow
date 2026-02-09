🏛️ **architect-agent**: Documento de Criterios de Aceptación generado para el contrato de migración.

# Acceptance Criteria — 3-migracion-sistema-agentes

## 1. Definición Consolidada
Se desarrollará un script temporal de exportación para portar los componentes core del sistema de agentes (`cli`, `runtime`, `structure` y `mcp`) a una solución NPM independiente, eliminando la dependencia de la extensión de VS Code. La tarea culminará con la entrega de diagramas técnicos del sistema y sus workflows.

## 2. Respuestas a Preguntas de Clarificación

| # | Pregunta (formulada por architect) | Respuesta (del desarrollador) |
|---|-----------------------------------|-------------------------------|
| 1 | ¿El script de migración será una herramienta temporal? | Sí, será un script temporal. |
| 2 | ¿En qué formato debe entregar el script la solución? | Una solución npm que permita funcionar los scripts definidos en el README. |
| 3 | ¿Qué componentes exactos debemos mover? | `agentic-system-structure`, `cli`, `runtime` y el `mcp` (todo el src code). |
| 4 | ¿Los diagramas deben explicar también el script? | No, serán solo del código (core y workflows). |
| 5 | ¿Eliminar referencias a vscode-extension si no es complejo? | Sí, si no es complejo. |

---

## 3. Criterios de Aceptación Verificables

1. Alcance:
   - Migración de `src/agentic-system-structure`, `src/cli`, `src/runtime` y el servidor MCP.
   - Exclusión total de la carpeta de la extensión de VS Code.

2. Entradas / Datos:
   - Código fuente actual en el monorepositorio `agentic-workflow`.

3. Salidas / Resultado esperado:
   - Script de exportación funcional.
   - Directorio de destino con estructura NPM válida y scripts de README operativos.
   - Diagramas de arquitectura y workflows del sistema de agentes.

4. Restricciones:
   - La solución resultante debe ser agnóstica a VS Code.
   - Los scripts del README original deben ser funcionales en el nuevo entorno.

5. Criterio de aceptación (Done):
   - El script ejecuta la migración sin errores y el nuevo paquete NPM es capaz de arrancar el sistema de agentes. Los diagramas representan fielmente la arquitectura actual.

---

## Aprobación (Gate 0)
Este documento constituye el contrato de la tarea. Su aprobación es bloqueante para pasar a Phase 1.

```yaml
approval:
  developer:
    decision: SI
    date: 2026-02-09T19:51:23Z
    comments: Aprobado por el usuario.
```

---

## Historial de validaciones (Phase 0)
```yaml
history:
  - phase: "phase-0-acceptance-criteria"
    action: "completed"
    validated_by: "architect-agent"
    timestamp: "2026-02-09T19:55:00Z"
    notes: "Acceptance criteria definidos y consolidados tras diálogo con el desarrollador."
```
