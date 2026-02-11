# ADR-001: Unified Tabbed Chat View with A2UI Protocol

**Status**: Accepted  
**Date**: 2026-02-11  
**Author**: 🏛️ architect-agent  

## Contexto
La extensión actualmente utiliza un modelo de múltiples Webviews independientes (Chat, Workflow, History, Security). Esta arquitectura presenta una alta fragmentación de la interfaz de usuario, redundancia en el consumo de recursos (memoria/procesos Chromium) y dificultades para compartir el estado de forma síncrona. Además, el uso de OpenAI ChatKit como Iframe impide la integración de componentes interactivos nativos personalizados.

## Decision
Unificar todas las vistas principales de la barra lateral en una única entrada de Webview utilizando un componente host de alto rendimiento basado en **Lit** (`<agw-unified-shell>`). 

Adoptar el protocolo **A2UI (Agent-to-User Interface)** v0.8 para la comunicación de UIs ricas entre el agente y el usuario, eliminando la dependencia de ChatKit y permitiendo renderizado interactivo inline (botones, formularios, diffs) dentro del chat.

## Consecuencias
- **Positivas**:
  - Reducción estimada del ~40% en el uso de memoria comparado con múltiples webviews.
  - Experiencia de usuario coherente y fluida mediante pestañas integradas.
  - Orquestación agentica "rich-UI" desbloqueada mediante A2UI.
- **Negativas/Riesgos**:
  - Necesidad de gestionar manualmente el foco y la accesibilidad en Shadow DOM.
  - El protocolo A2UI v0.8 está en preview y puede sufrir breaking changes superficiales.

## Roadmap de Ejecución
1. **Fase 0**: Scaffolding del Unified Shell y Tabbed Navigation.
2. **Fase 1**: Implementación de Standalone Chat Shell (Lit) sin dependencias externas.
3. **Fase 2**: Integración de `@a2ui/web-lib` y renderizado de rich payloads del agente.
