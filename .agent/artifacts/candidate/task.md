# Task Candidate: Unified Tabbed Shell Implementation

## Meta
- **ID**: T032
- **Title**: Unified Tabbed Shell Implementation
- **Area**: UI/Core
- **Complexity**: Alta
- **Strategy**: Long (9 phases)

## Description
Migrar la arquitectura de la extensión de una estructura de 4 WebviewViewProviders independientes (Chat, Workflow, History, Security) a una arquitectura unificada de Host único. Se implementará el componente `<agw-unified-shell>` para gestionar la navegación entre pestañas y se centralizará el registro en el Core Controller.

## Objective
Unificar las vistas de la extensión en un solo panel lateral con pestañas, optimizando el rendimiento y permitiendo una gestión de estado centralizada.

## Success Criteria (Initial)
- Los 4 ViewProviders actuales son reemplazados por un único `AgwMainViewProvider`.
- El componente `agw-unified-shell` renderiza correctamente las pestañas.
- El cambio de pestaña alterna entre los componentes Lit de cada módulo (Chat, Workflow, etc.) sin recargar el webview.
- El estado de cada pestaña se preserva al navegar (ej: el input del chat no se borra al ir a History).

## References
- [ADR-001](file:///Users/milos/Documents/workspace/agentic-workflow/docs/adr/001-unified-tabbed-chat-view.md)
- [ROADMAP-BACKLOG.md](file:///Users/milos/Documents/workspace/agentic-workflow/ROADMAP-BACKLOG.md)
