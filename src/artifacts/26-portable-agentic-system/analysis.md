---
artifact: analysis
phase: phase-2-analysis
owner: architect-agent
status: draft
related_task: 26-portable-agentic-system
---

# Analysis — 26-Portable Agentic System

## 1. Resumen ejecutivo
**Problema**
El sistema agéntico actual reside dentro del repositorio `extensio`, acoplado a su estructura y reglas específicas. Esto impide reutilizar la potente orquestación en otros proyectos sin copiar y pegar código, lo que es ineficiente y propenso a errores.

**Objetivo**
Desacoplar el núcleo del sistema, empaquetarlo como `@cmarino/agentic-workflow` y permitir su distribución vía npm, habilitando cualquier proyecto como "Agentic Workspace" mediante un comando de inicialización estándar.

**Criterio de éxito**
- Paquete npm creado y funcional.
- Comando `npm init` o CLI global que andamie la estructura `.agent`.
- Separación clara entre workflows inmutables (core) y personalización local (proyecto).
- Independencia total del framework Extensio.

---

## 2. Estado del proyecto (As-Is)
- **Estructura relevante**: Todo el sistema reside en `.agent/`, mezclando lógica core (workflows, templates) con lógica de negocio (reglas de Extensio).
- **Core / Engine**: No existe separación física. Los workflows importan reglas específicas de Extensio.
- **Artifacts**: Los templates actuales tienen referencias directas a `extensio-architecture`.
- **Limitaciones**: La portabilidad es nula. Cualquier intento de extracción manual requiere refactorización masiva de rutas y referencias.

---

## 3. Cobertura de Acceptance Criteria

### Package Creation (@cmarino/agentic-workflow)
- **Interpretación**: Crear un monorepo o paquete aislado para el sistema.
- **Verificación**: Existencia de `package.json` publicado (o linkeado) con `bin` entry.
- **Riesgos**: Naming conflicts en npm.

### Core Decoupling
- **Interpretación**: Identificar qué reglas son "Core" (constitucional, roles base) y cuáles son "Proyecto" (drivers, modules).
- **Verificación**: El paquete no debe contener ninguna cadena "extensio".
- **Riesgos**: Perder reglas de limpieza de código o arquitectura si no se generalizan correctamente.

### CLI Implementation
- **Interpretación**: Usar `commander` o `@clack/prompts` para generar `.agent/` interactivamente.
- **Verificación**: Ejecutar `npx @cmarino/agentic-workflow init` en carpeta vacía.
- **Riesgos**: Complejidad en la gestión de templates (copia de archivos vs symlinks).

---

## 4. Research técnico
Basado en `research.md`.

- **Enfoque recomendado**: **Hybrid Package**.
  - **Paquete npm**: Contiene el motor de workflows, templates base y CLI.
  - **Proyecto local**: Contiene `.agent/rules/` específicas y un `agent.config.js` opcional.
  - **Ventaja**: Mantiene el core actualizable centralmente mientras permite flexibilidad total.

---

## 5. Agentes participantes
- **architect-agent**
  - Responsable del diseño de la estructura del paquete y refactorización de reglas.
  - Subáreas: `rules`, `workflows`.
- **tooling-agent** (Nuevo rol recomendado o asumido por architect)
  - Responsable de la implementación del CLI y scripts de build.
  - Subáreas: `cli`, `package.json`.

**Componentes necesarios**
- **NUEVO**: Paquete `@cmarino/agentic-workflow` (fuera de `extensio` o en `packages/` si fuera monorepo, pero aquí se extraerá).
- **MODIFICAR**: Todos los workflows existentes para eliminar dependencias de Extensio.

---

## 6. Impacto de la tarea
- **Arquitectura**: Cambio radical. De sistema embebido a dependencia externa.
- **Compatibilidad**: Breaking changes masivos para el repo host actual (`extensio`). Requerirá migración (dogfooding) una vez el paquete esté listo.
- **Testing**: Necesidad de tests de integración para el CLI (ejecutar en sandbox).

---

## 7. Riesgos y mitigaciones
- **Riesgo**: Referencias circulares o rotas durante la extracción.
  - **Mitigación**: Crear un repo/paquete limpio y migrar fichero a fichero validando referencias.
- **Riesgo**: El sistema actual de Extensio se rompa durante la migración.
  - **Mitigación**: Desarrollar el paquete en paralelo (carpeta separada o repo temporal) y no sustituir el `.agent` actual hasta validar la versión portable.

---

## 8. Preguntas abiertas
Ninguna. Research cubrió las dudas técnicas.

---

## 9. TODO Backlog (Consulta obligatoria)
**Referencia**: `.agent/todo/`
**Estado actual**: 5 items pendientes.
**Items relevantes**:
- `004-portable-agentic-system.md`: Es exactamente esta tarea.
- `003-explorar-paralelizacion-phase4.md`: Podría ser interesante incorporar capacidad de paralelización en el nuevo core desde el inicio.

**Impacto**: Se cierra el TODO 004 con esta tarea.

---

## 10. Aprobación
Este análisis **requiere aprobación explícita del desarrollador**.

```yaml
approval:
  developer:
    decision: SI
    date: 2026-01-19T21:25:29+01:00
    comments: Aprobado por consola.
```
