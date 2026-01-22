---
artifact: plan
phase: phase-3-planning
owner: architect-agent
status: draft
related_task: 26-portable-agentic-system
---

# Implementation Plan — 26-Portable Agentic System

## 1. Resumen del plan
- **Contexto**: El sistema actual de orquestación agéntica está acoplado al repo `extensio`. Se requiere su extracción a un paquete portable.
- **Resultado esperado**: Paquete npm `@cmarino/agentic-workflow` funcional con CLI `init` que permite desplegar el sistema en cualquier proyecto.
- **Alcance**: 
  - Creación del paquete y CLI.
  - Migración de workflows y templates core.
  - Adaptación de referencias para soportar linking dinámico.
  - **Excluye**: Refactorización de drivers existentes de Extensio (se quedan en el repo host como "custom").

---

## 2. Inputs contractuales
- **Task**: `.agent/artifacts/26-portable-agentic-system/task.md`
- **Analysis**: `.agent/artifacts/26-portable-agentic-system/analysis.md`
- **Acceptance Criteria**: Ver `analysis.md` (Package Creation, Core Decoupling, CLI Implementation).

**Dispatch de dominios**
```yaml
plan:
  dispatch:
    - domain: core
      action: create
      workflow: workflow.core.create_package
```

---

## 3. Desglose de implementación (pasos)

### Paso 1: Scaffolding del Paquete
- **Descripción**: Crear la estructura del paquete `@cmarino/agentic-workflow` fuera del árbol de Extensio (o en una carpeta aislada temporalmente).
- **Dependencias**: Ninguna.
- **Entregables**: `package.json` con configuración de binarios y dependencias (`commander`, `@clack/prompts`).
- **Agente responsable**: `architect-agent` (setup inicial).

### Paso 2: Migración del Core (Reglas, Workflows, Templates)
- **Descripción**: Copiar y limpiar los ficheros genéricos de `.agent/` a la estructura del paquete (`src/core/`).
- **Dependencias**: Paso 1.
- **Entregables**: Carpeta `src/rules`, `src/workflows`, `src/templates` limpias de referencias a Extensio.
- **Agente responsable**: `architect-agent` (por ser crítico para la arquitectura).

### Paso 3: Implementación del CLI `init`
- **Descripción**: Desarrollar el script binario que interactúa con el usuario y genera el scaffolding local.
- **Dependencias**: Paso 2.
- **Entregables**: Comando funcional `init` que crea `.agent/` y copia/linka los assets necesarios.
- **Agente responsable**: `architect-agent` (actuando como developer de tooling).

### Paso 4: Adaptaciones para Linking Local
- **Descripción**: Asegurar que los workflows migrados sepan resolver referencias "híbridas" (si un fichero no está en el paquete, buscarlo en local).
- **Dependencias**: Paso 2.
- **Entregables**: Sistema de resolución de rutas (`AgentPathResolver`).
- **Agente responsable**: `architect-agent`.

---

## 4. Asignación de responsabilidades (Agentes)

**Architect-Agent**
- **Responsabilidades**: Ejecución integral de la tarea. Al ser una refactorización estructural profunda y creación de un nuevo sistema core, el Architect debe mantener el control directo o delegar tareas muy específicas de "copy/paste" si fuera necesario.
- **Subáreas**: Package config, CLI logic, Workflow migration.

**Handoffs**
- N/A (Ejecución centralizada por la naturaleza crítica de la tarea).

**Componentes**
- **Nuevo Paquete**: `@cmarino/agentic-workflow`.
  - Implementación: Creación manual de estructura y ficheros TS.
  - Tool: `write_to_file` y `run_command` (npm/tsc).

---

## 5. Estrategia de testing y validación

**Manual Tests (Sandbox)**
- Crear una carpeta temporal vacía `/tmp/test-agentic`.
- Ejecutar el binario compilado: `node /path/to/dist/cli.js init`.
- Verificar estructura generada `.agent/`.
- Verificar que el sistema responde (ej: `ls .agent/`).

**Verificación de ACs**
- **AC1 (Package)**: Comprobar `package.json` y `bin`.
- **AC2 (Decoupling)**: `grep -r "extensio" src/` debe devolver 0 resultados en el nuevo paquete.
- **AC3 (CLI)**: Ejecución satisfactoria del comando `init` sin errores, generando `AGENTS.md` y `.agent/index.md`.

---

## 6. Plan de demo
- **Objetivo**: Demostrar la portabilidad instalando el sistema en una carpeta vacía.
- **Escenario**:
  1. Carpeta limpia.
  2. Ejecutar `npm init @cmarino/agentic-workflow`.
  3. Responder al wizard.
  4. Mostrar árbol de directorios resultante.
- **Criterio de éxito**: El usuario ve la estructura `.agent` creada correctamente fuera de Extensio.

---

## 7. Estimaciones y pesos
- **Paso 1 (Scaffold)**: Bajo (0.5h).
- **Paso 2 (Migración Core)**: Alto (3h) - Cuidado extremo con referencias.
- **Paso 3 (CLI Logic)**: Medio (2h).
- **Paso 4 (Linking)**: Medio (1.5h).
- **Total estimado**: ~7 horas.

---

## 8. Puntos críticos y resolución
- **PC1: Referencias cruzadas en Workflows**: Los workflows actuales asumen rutas absolutas o relativas fijas.
  - **Resolución**: Implementar una utilidad `AgentPath.resolve(alias)` que chequee primero local, luego paquete.
- **PC2: Tipado en TS**: El entorno de ejecución de los agentes puede no tener TS.
  - **Resolución**: El paquete distribuirá JS compilado (`dist/`) pero los templates locales serán Markdown, evitando complejidad de compilación en tiempo de ejecución para el usuario final.

---

## 9. Dependencias y compatibilidad
- **Node.js**: >= 18.
- **NPM/PNPM/Yarn**: Cualquiera.
- **OS**: Agnóstico (sistema de archivos estándar).

---

## 10. Criterios de finalización
- [ ] Paquete `@cmarino/agentic-workflow` existe.
- [ ] `npm init` (simulado localmente) funciona.
- [ ] Estructura generada es válida según la Constitución.

---

## 11. Aprobación del desarrollador (OBLIGATORIA)
```yaml
approval:
  developer:
    decision: SI
    date: 2026-01-19T21:30:01+01:00
    comments: Aprobado por consola.
```
