# Acceptance Criteria

## Task: Refactorizar agentes

### Objective
Tener agentes especializados en las capas de la arquitectura para mejorar la modularidad y el control del dominio.

---

### Verifiable Criteria

1.  **AC-1: Creación de Agentes de Capa**
    - **Criterio:** Deben crearse cuatro nuevos roles de agente especializados: `backend-agent`, `background-agent`, `view-agent` y `messaging-agent`.
    - **Verificación:** La existencia de los archivos de constitución para cada uno de estos agentes en el directorio `.agent/rules/role/`.

2.  **AC-2: Aislamiento de Dominio Estricto**
    - **Criterio:** Cada agente especializado debe tener su capacidad de escritura de archivos estrictamente limitada a su capa arquitectónica correspondiente.
    - **Verificación:** Se puede demostrar que una directiva para que, por ejemplo, el `view-agent` modifique un archivo en `src/extension/modules/<module>/backend/` es rechazada o genera un error de validación por parte del `architect-agent`.

3.  **AC-3: Orquestación por el Arquitecto**
    - **Criterio:** El `architect-agent` debe ser el único responsable de analizar las tareas, dividirlas en subtareas por capa y delegar cada una al agente especializado correspondiente.
    - **Verificación:** El artefacto `planning.md` generado por el `architect-agent` debe mostrar claramente las subtareas y el agente "owner" (propietario) asignado a cada una.

4.  **AC-4: Colaboración Basada en Subtareas**
    - **Criterio:** Para tareas que afecten a múltiples capas, el proceso debe seguir un modelo de "divide y vencerás", donde el `architect-agent` crea subtareas discretas para cada capa.
    - **Verificación:** Una tarea de ejemplo que requiera cambios en la vista y el backend resulta en al menos dos subtareas separadas en el `planning.md`, una asignada al `view-agent` y otra al `backend-agent`.

5.  **AC-5: Mecanismo de Verificación de Dominio**
    - **Criterio:** Debe existir un mecanismo, supervisado por el `architect-agent`, que impida que un agente opere fuera de su dominio definido.
    - **Verificación:** La ejecución de una prueba que intente hacer que un agente de capa viole su dominio de archivos debe ser bloqueada, y el `architect-agent` debe reportar la violación de la constitución.