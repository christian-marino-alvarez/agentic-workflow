---
id: workflow.tasklifecycle-short.short-phase-2-implementation
description: Fase 2 del ciclo Short. Ejecuta la implementación según el brief aprobado.
owner: architect-agent
version: 1.0.0
severity: PERMANENT
trigger:
  commands: ["short-phase-2", "implementation"]
blocking: true
---

# WORKFLOW: tasklifecycle-short.short-phase-2-implementation

## Input (REQUIRED)
- Existe brief aprobado: `.agent/artifacts/<taskId>-<taskTitle>/brief.md`
- task.md refleja `task.phase.current == "short-phase-2-implementation"`

> [!IMPORTANT]
> **Constitución activa (OBLIGATORIO)**:
> - Cargar `constitution.clean_code` antes de iniciar
> - Cargar `constitution.agents_behavior` (sección 7: Gates, sección 8: Constitución)
> - Cargar `constitution.runtime_integration` para trazabilidad MCP
> - Cargar constituciones específicas del dominio según la tarea

## Output (REQUIRED)
- Código implementado según el plan del brief.
- Informe de implementación: `.agent/artifacts/<taskId>-<taskTitle>/architect/implementation.md`
- Task actualizado.

## Objetivo (ONLY)
- Ejecutar todas las subtareas de implementación definidas en el brief.
- Permitir al architect-agent verificar coherencia con el plan.
- Generar informe de revisión arquitectónica.

> Esta fase **SÍ implementa código**.  
> Esta fase **NO redefine alcance**.

---

## Pasos obligatorios

0. Activar `architect-agent` y usar prefijo obligatorio en cada mensaje.

### 1. Protocolo de Validación Pre-Vuelo (OBLIGATORIO)
- El agente **DEBE** leer físicamente el artefacto de la fase anterior: `.agent/artifacts/<taskId>-<taskTitle>/brief.md`.
- **Citar explícitamente** la decisión del desarrollador (ej: "Aprobado: SI") y el timestamp si existe.
- Si el archivo no existe o no tiene una marca de aprobación afirmativa, el proceso **DEBE** detenerse inmediatamente (FAIL).
- Verificar que la fase en `task.md` sea la correcta.

### 2. Ejecutar implementación
- Seguir los pasos definidos en `brief.md`.
- Documentar cambios realizados.
- Documentar decisiones técnicas.

### 3. Revisión arquitectónica (OBLIGATORIA)
El architect-agent **DEBE** verificar:
- Coherencia con el plan del brief.
- Respeto a reglas de arquitectura y clean code.
- Cumplimiento de acceptance criteria.

### 4. Crear informe de implementación
- Crear `.agent/artifacts/<taskId>-<taskTitle>/architect/implementation.md`
- Incluir:
  - Cambios realizados.
  - Ficheros modificados/creados.
  - Decisiones técnicas.
  - Estado: APROBADO | RECHAZADO.

### 5. Solicitar aprobación del desarrollador (OBLIGATORIA, por consola)
5.1 **Auditoría Pre-Gate (OBLIGATORIO)**:
- Antes de solicitar la aprobación, el `architect-agent` **DEBE** usar `runtime.validate_gate` para la fase actual.
- El agente **DEBE** usar `debug_read_logs` para confirmar la ejecución de la implementación y la creación del informe.
- Estrictamente **PROHIBIDO** consolidar este paso con la solicitud de aprobación en una misma respuesta.

### 6. PASS (solo si APROBADO)
- Llamar `runtime_advance_phase` **después** de la aprobación explícita del desarrollador.
- Actualizar task.md con el `currentPhase` devuelto por el runtime (NO incrementar manualmente).
- Completar metadatos de fase en task.md:
  - Marcar fase como completada.
  - Establecer `task.lifecycle.phases.short-phase-2-implementation.validated_at = <ISO-8601>`.
  - Establecer `task.lifecycle.phases.short-phase-2-implementation.runtime_validated = true`.
  - Establecer `task.lifecycle.phases.short-phase-2-implementation.validation_id = <ID de runtime>`.
  - Actualizar `task.phase.updated_at = <ISO-8601>`.

---

## Gate (REQUIRED)
Requisitos (todos obligatorios):
1. Implementación coherente con brief.
2. El `architect/implementation.md` inicia con el prefijo del `architect-agent`.
3. Existe informe de implementación con estado APROBADO.
4. **Auditoría de Runtime**: El agente ha ejecutado `runtime.validate_gate` y el resultado es PASS.
5. **Trazabilidad de Logs**: Los logs (`debug_read_logs`) confirman la implementación y revisión arquitectónica.
6. Existe aprobación explícita del desarrollador registrada en `architect/implementation.md`:
   - `approval.developer.decision == SI`
7. task.md refleja fase completada y datos de validación de runtime.
8. task.md refleja timestamp y estado:
   - `task.lifecycle.phases.short-phase-2-implementation.completed == true`
   - `task.lifecycle.phases.short-phase-2-implementation.validated_at` no nulo
   - `task.phase.updated_at` no nulo

Si Gate FAIL:
- Iterar para corregir problemas.
- No avanzar hasta resolver.
