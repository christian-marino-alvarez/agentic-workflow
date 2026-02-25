# Plan de Subtarea 2: Crear Definiciones de Rol para Agentes Especialistas

- **Propietario**: `architect-agent`
- **ID**: `subtask-2`

## Alcance
Crear tres nuevos archivos de definición de rol en el directorio `.agent/roles/` para `backend-agent`, `background-agent` y `view-agent`.

## Archivos a Crear
- `.agent/roles/role.backend-agent.md`
- `.agent/roles/role.background-agent.md`
- `.agent/roles/role.view-agent.md`

## Criterios de Aceptación
1. Cada archivo de rol debe definir una persona, capacidades y herramientas adecuadas para su capa.
2. El `view-agent` debe estar especializado en `Lit` y `HTML/CSS`.
3. El `backend-agent` debe estar enfocado en la lógica de negocio, el estado y la persistencia, con prohibición de importar APIs de `vscode` o del `DOM`.
4. El `background-agent` debe especializarse en la orquestación de mensajes entre la vista y el backend.
5. Los archivos deben ser creados y listos para ser utilizados por el sistema.
