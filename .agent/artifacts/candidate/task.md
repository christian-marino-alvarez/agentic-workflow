# Task Candidate

## Descripción de la tarea
Convertir el proyecto actual en un npm workspace donde cada módulo (ubicado en `src/extension/modules/*`) se convierta en un package independiente de npm con su propio `package.json`.

## Objetivo
Reestructurar el proyecto para que:
1. Todos los módulos existentes sean packages npm independientes
2. El proyecto se configure como npm workspaces
3. Las dependencias entre módulos se gestionen a través de referencias de workspace
4. Se mantenga la estructura modular actual pero con mejor aislamiento y gestión de dependencias

## Origen
- workflow: tasklifecycle-long
- created_at: 2026-02-16T07:25:22+01:00
- scope: candidate
