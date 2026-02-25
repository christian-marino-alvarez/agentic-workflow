# Plan de Subtarea 3: Formalizar el Proceso de Delegación

- **Propietario**: `architect-agent`
- **ID**: `subtask-3`

## Alcance
Actualizar la documentación interna y las reglas del `architect-agent` para formalizar su nuevo rol como orquestador que utiliza la herramienta `delegateTask` para asignar trabajo a los agentes especialistas.

## Archivos Afectados
- `.agent/roles/role.architect-agent.md` (o un documento de proceso si aplica).

## Criterios de Aceptación
1. El `architect-agent` debe tener documentada la responsabilidad de analizar las tareas y delegar las subtareas de implementación.
2. Se debe establecer explícitamente que el `architect-agent` NO implementa código funcional directamente, sino que supervisa y valida el trabajo de los especialistas.
3. El plan de implementación de cualquier tarea futura que implique código debe mostrar explícitamente qué agente especialista es el `owner` de cada subtarea.
