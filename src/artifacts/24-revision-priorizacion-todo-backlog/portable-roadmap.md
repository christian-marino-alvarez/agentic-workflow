# Roadmap: Portable Agentic System (@cmarino/agentic-workflow)

Este documento detalla las fases para desacoplar el sistema de orquestación de Extensio y convertirlo en un paquete independiente.

## Fase 1: Abstracción de Reglas (Core Agentic)
- [ ] Mover reglas de comportamiento generales de `extensio_architecture` a una nueva `agentic_constitution.md`.
- [ ] Normalizar nombres de archivos (eliminar prefijos "extensio-" de archivos de configuración base).
- [ ] Crear el descriptor `AGENTS.md` dinámico.

## Fase 2: Desarrollo del CLI
- [ ] Implementar `@cmarino/agentic-workflow init` usando `@clack/prompts`.
- [ ] Motor de plantillas (Handlebars) para inyectar configuración en los `.md` portados.
- [ ] Validación de entorno (detección de MCPs necesarios).

## Fase 3: Empaquetado y Distribución
- [ ] Configuración de `package.json` con `bin` para el CLI.
- [ ] README y documentación de "Cómo añadir tus propios roles".
- [ ] Ejemplo de integración en un proyecto No-Extensio (ej: una App de React básica).

## Fase 4: Automatización Avanzada (Post-Portabilidad)
- [ ] TODO 005: Automatización de Gates (Pre-checks).
- [ ] TODO 006: Metadatos de Trazabilidad (Hashes de razonamiento).

---
*Referencia: Análisis Tarea #24*
