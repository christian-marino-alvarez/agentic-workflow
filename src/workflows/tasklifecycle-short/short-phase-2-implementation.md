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

### 5. Solicitar aprobacion del desarrollador (OBLIGATORIA, por consola)
- El desarrollador **DEBE** aprobar la implementacion:
  - **SI** → aprobado
  - **NO** → rechazado
- Registrar la decision en `architect/implementation.md`:
  ```yaml
  approval:
    developer:
      decision: SI | NO
      date: <ISO-8601>
      comments: <opcional>
  ```
- Si `decision != SI` → **FAIL**.

### 6. PASS (solo si APROBADO)
- Actualizar task.md:
  - Marcar fase como completada.
  - Establecer `task.lifecycle.phases.short-phase-2-implementation.validated_at = <ISO-8601>`.
  - Actualizar `task.phase.updated_at = <ISO-8601>`.
  - Avanzar a `short-phase-3-closure`.

---

## Gate (REQUIRED)
Requisitos (todos obligatorios):
1. Implementación coherente con brief.
2. El `architect/implementation.md` inicia con el prefijo del `architect-agent`.
3. Existe informe de implementación con estado APROBADO.
4. Existe aprobacion explicita del desarrollador registrada en `architect/implementation.md`:
   - `approval.developer.decision == SI`
5. task.md refleja fase completada.
6. task.md refleja timestamp y estado:
   - `task.lifecycle.phases.short-phase-2-implementation.completed == true`
   - `task.lifecycle.phases.short-phase-2-implementation.validated_at` no nulo
   - `task.phase.updated_at` no nulo

Si Gate FAIL:
- Iterar para corregir problemas.
- No avanzar hasta resolver.
