# Task Candidate

## Description
Implementar un **Workflow Execution Engine** en el Runtime Server que interprete los workflows definidos en `.agent/workflows/`, los ejecute según la estrategia elegida (long/short), gestione gates de aprobación del desarrollador con UI interactiva, y muestre el progreso en un panel dedicado separado del chat.

## Objective
Que el sistema agentico sea capaz de leer, interpretar y ejecutar los workflows automáticamente desde el servidor runtime, siguiendo la cadena de PASS entre fases, identificando el agente owner de cada workflow, y con el architect orquestando las delegaciones. El chat solo mostrará resúmenes de tarea e informes con links a artefactos.
