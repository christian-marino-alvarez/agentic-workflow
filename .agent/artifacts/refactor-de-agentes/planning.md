# Plan de Implementación: Refactor de Agentes

## Resumen
Este plan detalla las subtareas necesarias para introducir agentes especialistas (`backend`, `background`, `view`) y establecer las reglas de orquestación.

## Subtareas Asignadas

### Subtarea 1: Definir Reglas Constitucionales de Dominio
- **Descripción**: Modificar la constitución `agents-behavior.md` para añadir las reglas que restringen a cada nuevo agente a su capa de la arquitectura.
- **Propietario**: `architect-agent`
- **Artefacto**: `subtask-1-plan.md`

### Subtarea 2: Crear Definiciones de Rol para Agentes Especialistas
- **Descripción**: Crear los archivos de rol (`role.<agent-name>.md`) para cada uno de los nuevos agentes, definiendo su persona, capacidades y reglas.
- **Propietario**: `architect-agent`
- **Artefacto**: `subtask-2-plan.md`

### Subtarea 3: Formalizar el Proceso de Delegación
- **Descripción**: Documentar y establecer el flujo donde el `architect-agent` recibe una tarea de implementación y la delega al agente especialista correspondiente.
- **Propietario**: `architect-agent`
- **Artefacto**: `subtask-3-plan.md`