# AGENTS

Este fichero es el punto de entrada para asistentes del IDE.
Solo define el arranque del sistema mediante el workflow `init`.

## Arranque (OBLIGATORIO)
1. Leer `.agent/index.md` (root index local).
2. Cargar el indice de workflows en `agent.domains.workflows.index`.
3. Cargar `workflows.init`.
4. Ejecutar el workflow `init` y seguir sus Gates.
