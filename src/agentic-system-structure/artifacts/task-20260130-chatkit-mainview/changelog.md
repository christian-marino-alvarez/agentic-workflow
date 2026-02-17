---
artifact: changelog
phase: phase-8-commit-push
owner: architect-agent
status: draft
related_task: task-20260130-chatkit-mainview-Integrar ChatKit en mainView
target_branch: fix/mainview-provider
---

# Changelog — task-20260130-chatkit-mainview-Integrar ChatKit en mainView

## 1. Resumen general
Descripción breve y clara de los cambios introducidos por esta tarea.

- **Objetivo de la tarea**: Integrar ChatKit + base Lit + logging para webviews.
- **Impacto principal**: Setup migrado a Lit con ciclo de vida común y logging AGW; CSP reforzada; tests y artifacts actualizados.
- **Áreas afectadas** (componentes, workflows, etc.): `src/extension/**`, tests, rules/constitution, artifacts.

---

## 2. Commits incluidos
Listado completo y ordenado de los commits realizados.

### Commit 1
- **Hash**: `546444b`
- **Mensaje (Conventional Commit)**: `feat(vscode-extension): add Lit core base, CSP fixes, logging, and setup view`

### Commit 2
- **Hash**: `1571d65`
- **Mensaje (Conventional Commit)**: `chore(agents): update artifacts, metrics, and compile gate`
