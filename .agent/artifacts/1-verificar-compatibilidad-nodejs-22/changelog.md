# Changelog — verificar-compatibilidad-nodejs-22

## Commits
- `feat(agent-poc): add openai agents sdk poc and stabilize extension host`
- `chore(cleanup): remove obsolete task artifacts from previous sessions`

## Cambios funcionales
### Extension Host & SDK
- Integración del `@openai/agents` SDK.
- Validación exitosa en Node.js 22 (Extension Host).
- Soporte para streaming y Tool calling (`get_current_time`).

### Base Flow & UI
- Corrección del registro de vistas en `package.json`.
- Refactorización de `AgwViewBase` para mejorar fiabilidad de carga.
- Eliminación completa de la integración de Gemini (Focus on OpenAI).

### Gobernanza (Workflow)
- Creación de artefactos formales del ciclo de vida (Research, Analysis, Plan, Verification).
- Adición de flujos y templates faltantes para el ciclo corto (`short-phase-*`).
