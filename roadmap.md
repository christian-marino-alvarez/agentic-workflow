# Roadmap del Proyecto: Estado Actual

## 1. Resumen Ejecutivo

Este documento describe el estado actual del proyecto `agentic-workflow` basado en el análisis de su estructura y configuración. El objetivo es proporcionar una visión clara para el equipo de desarrollo.

## 2. Componentes Principales

El proyecto está organizado en varios componentes clave:

- **Extensión VS Code (`src/extension`)**: Es el núcleo de la interfaz de usuario. Utiliza una arquitectura modular y se comunica con un backend.
- **CLI (`src/cli`)**: Proporciona una interfaz de línea de comandos para interactuar con el sistema de agentes.
- **Sistema Agéntico (`src/agentic-system-structure`)**: Contiene las "constituciones" (reglas) y los flujos de trabajo que gobiernan el comportamiento de los agentes. Es el cerebro declarativo del sistema.
- **Runtime (`src/runtime`)**: El motor que ejecuta los flujos de trabajo y coordina a los agentes.

## 3. Estado de las Tareas y Próximos Pasos

| Componente | Estado Actual | Próximos Pasos Sugeridos | Prioridad |
| --- | --- | --- | --- |
| **Extensión VS Code** | Funcional, con una arquitectura modular definida. | - Refinar la gestión de estado de las vistas. <br> - Añadir más componentes de UI reutilizables. | Media |
| **CLI** | Básico, permite la ejecución de comandos. | - Expandir los comandos disponibles. <br> - Mejorar el feedback al usuario. | Baja |
| **Sistema Agéntico** | Robusto, con reglas y flujos definidos. | - Crear más flujos de trabajo para tareas comunes. <br> - Desarrollar un sistema para auditar la adherencia a la constitución. | Alta |
| **Runtime** | Funcional. | - Optimizar el motor de ejecución de flujos. <br> - Mejorar el manejo de errores y la resiliencia. | Alta |