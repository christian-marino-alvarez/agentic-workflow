---
artifact: changelog
phase: phase-8-commit-push
owner: architect-agent
status: draft
related_task: 6-model-dropdown-component
target_branch: develop
---

# Changelog — 6-model-dropdown-component

🏛️ **architect-agent**: Registro consolidado de cambios para la implementación y estabilización del selector de modelos.

## 1. Resumen general
Implementación de un componente selector de modelos nativo en la vista de chat, incluyendo la lógica de sincronización de estado, validación de contratos de mensajería y visibilidad dinámica basada en la configuración de seguridad.

- **Objetivo de la tarea**: Proveer una interfaz coherente para seleccionar modelos y gestionar propuestas dinámicas (HIL).
- **Impacto principal**: Mejora la experiencia de usuario con feedback instantáneo sobre modelos disponibles y sincronización automática.
- **Áreas afectadas**: 
  - `src/extension/modules/chat`: UI, contratos y controlador.
  - `src/extension/modules/security`: Lógica de activación y visibilidad (`hasKey`).
  - `src/shared/messaging`: Contratos base.

---

## 2. Commits incluidos

### Commit (Proposed)
- **Mensaje (Conventional Commit)**: `feat(chat): implement model dropdown and dynamic visibility synchronization`
- **Detalles**:
  - Implementación de `ChatView` con componentes Web de VS Code.
  - Fix: Sincronización de tipos en `StateUpdateSchema` para evitar bloqueo en "Loading".
  - Fix: Sincronización en tiempo real de modelos borrados/añadidos mediante Event Bus.
  - Fix: Lógica de auto-activación y visibilidad de sidebar (`hasKey`) en SecurityController.
  - Mejora: Null-safety en plantillas HTML para evitar crashes de renderizado.
