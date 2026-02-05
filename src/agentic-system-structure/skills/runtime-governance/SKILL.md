# SKILL: runtime-governance

> [!IMPORTANT]
> **Exclusividad**: Este skill es de uso exclusivo para el **architect-agent**.
> **Severidad**: PERMANENT

## Objetivo
Proveer al arquitecto de un conjunto de herramientas y procedimientos para garantizar que el LLM (y otros agentes) utilicen estrictamente el Runtime MCP para la gobernanza del workflow, detectando evasiones de forma reactiva.

## 1. Procedimiento de Trazabilidad (Step 0)

Cuando un workflow solicite "Verificar Trazabilidad", el arquitecto debe:
1. Llamar a `runtime_chat` o `runtime_emit_event` con un mensaje de activación (ej: "Verifying traceability for session [ID]").
2. Esperar la confirmación del runtime (`{status: "ok"}`).
3. Solo tras recibir confirmación, registrar `traceability.verified: true` en el artefacto correspondiente.
4. **Ruta obligatoria para init**:
   - `runtime_run` **DEBE** llamarse con `taskPath: ".agent/artifacts/candidate"` (sin `/` final).
   - **PROHIBIDO** usar:
     - `.agent/artifacts/candidate/`
     - `.agent/artifacts/candidate/init.md`
5. **Completar init vía Runtime (OBLIGATORIO)**:
   - Tras `runtime_run`, llamar a `runtime_update_init` con los datos recolectados.
   - El init candidate **NO** puede quedar con placeholders `{{...}}`.

## 2. Huella Digital de Gobernanza (Obligatoria)

Antes de cada transición de fase (Gate), el arquitecto debe asegurar que los logs de stderr contienen la siguiente secuencia para el `runId` actual:

1. `runtime_run`: Debe existir para la tarea activa.
2. `runtime_update_init`: Debe existir para init antes de validar gate.
2. `runtime_validate_gate`: Llamado antes del `notify_user` de fin de fase.
3. `runtime_advance_phase`: Llamado inmediatamente después de recibir el "SI" del usuario.

## 2. Detección Reactiva de Bypasses

El arquitecto debe comparar el estado del sistema de archivos con los logs obtenidos mediante `debug_read_logs`:

- **Anomalía A**: Existe un artefacto de fase (ej: `planning.md`) cuyas marcas de tiempo son posteriores a un mensaje de chat de aprobación, pero **NO** hay registro de `runtime_advance_phase`.
- **Anomalía B**: El archivo `task.md` marca un paso como completado (`[x]`) sin que el log de runtime muestre la actividad correspondiente en esa ventana temporal.
- **Anomalía C (Init)**: El init candidate contiene placeholders `{{...}}` o no hay log de `runtime_update_init`.

**Acción ante Bypass**:
- Invalidar la fase actual.
- Realizar rollback de los archivos modificados sin gobernanza.
- Notificar al usuario la violación de gobernanza y solicitar re-ejecución del gate.

## 3. Procedimiento de Validación de Gate

1. Cargar el artefacto de la fase (ej: `analysis.md`).
2. Llamar a `runtime_validate_gate` con `expectedPhase`.
3. Si el runtime falla (error visualizado en stdout), **CORREGIR** el artefacto antes de pedir aprobación al usuario.
4. Una vez aprobado por el usuario, llamar a `runtime_advance_phase`.

## 4. Auditoría de Logs (Checklist)

Para verificar que el sistema está funcionando, busca estos patrones en los logs:
- `[INFO] [MCP] Server started` -> Servidor activo.
- `[INFO] [Runtime] Chat message received` -> Comunicación activa.
- `[INFO] [MCP] Tool called: runtime_...` -> Uso de herramientas.

---
*Garantizando la integridad del proceso agentic-workflow.*
