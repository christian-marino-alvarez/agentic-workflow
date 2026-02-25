# Plan de Subtarea 1: Definir Reglas Constitucionales de Dominio

- **Propietario**: `architect-agent`
- **ID**: `subtask-1`

## Alcance
Modificar el archivo `.agent/rules/constitution/agents-behavior.md` para incluir una nueva sección de "Aislamiento de Dominio Estricto" que defina explícitamente las rutas de archivos permitidas para los nuevos agentes.

## Archivos Afectados
- `.agent/rules/constitution/agents-behavior.md`

## Criterios de Aceptación
1. La constitución debe contener una regla para el `view-agent` que le restrinja a operar únicamente dentro de directorios `**/view/`.
2. La constitución debe contener una regla para el `backend-agent` que le restrinja a operar únicamente dentro de directorios `**/backend/`.
3. La constitución debe contener una regla para el `background-agent` que le restrinja a operar únicamente dentro de directorios `**/background/`.
4. El `architect-agent` debe seguir siendo el único con permisos para modificar archivos de reglas y flujos de trabajo.
