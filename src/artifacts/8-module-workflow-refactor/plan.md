---
artifact: plan
phase: phase-3-planning
owner: architect-agent
status: draft
related_task: 8-module-workflow-refactor
---

# Implementation Plan — 8-module-workflow-refactor

## 1. Resumen del plan
- **Contexto**: El workflow actual de creación de módulos está desalineado con la arquitectura de drivers y carece de funcionalidades críticas (naming auto, demo, registro shards).
- **Resultado esperado**: Un sistema de creación de módulos (Generator + MCP + Workflow) robusto, consistente, con demo funcional por defecto y soporte granular de surfaces.
- **Alcance**:
  - Modificación de `ModuleGenerator` y templates.
  - Modificación de `extensio-create` MCP tool.
  - Actualización de `constitution.modules` y `modules/create.md`.
  - Validación mediante creación de módulo test.

---

## 2. Inputs contractuales
- **Task**: `.agent/artifacts/8-module-workflow-refactor/task.md`
- **Analysis**: `.agent/artifacts/8-module-workflow-refactor/analysis.md`
- **Acceptance Criteria**: AC-1 a AC-7 definidos en task.md.

**Dispatch de dominios (OBLIGATORIO)**
```yaml
plan:
  workflows:
    modules:
      action: refactor
      workflow: workflow.modules.create # Se refactoriza el workflow de create
  
  dispatch:
    - domain: modules
      action: refactor
      workflow: workflow.modules.create
```

---

## 3. Desglose de implementación (pasos)

### Paso 1: Actualización de Constitution
- **Descripción**: Incorporar reglas de naming (CamelCase) y registro estático de Shards (`Shard.register()`) en `constitution.modules`.
- **Dependencias**: Ninguna.
- **Entregables**: `.agent/rules/constitution/modules.md` actualizado.
- **Agente responsable**: module-agent.

### Paso 2: Refactorización de Templates
- **Descripción**:
  - Crear template `surface/shards/example.mts.ejs` (Shard de ejemplo).
  - Actualizar `surface/shards/index.mts.ejs` para:
    - Importar y registrar `ExampleShard` localmente usando `Shard.register()`.
    - Incluir comentarios explicativos para registro de Shards externos (NPM).
  - Asegurar que demo template (copia de estructura) funcione correctamente con este ejemplo.
- **Dependencias**: Paso 1.
- **Entregables**: Archivos `.ejs` en `packages/cli/src/generators/module/templates/` actualizados.
- **Agente responsable**: module-agent.

### Paso 3: Lógica del Generator
- **Descripción**:
  - Cambiar default `includeDemo` a `true` en `ModuleGenerator`.
  - Verificar lógica de naming (ya existente, asegurar consistencia).
  - Verificar lógica de `_extendGlobalTypes` y `_extendRootConstants`.
- **Dependencias**: Paso 2.
- **Entregables**: `packages/cli/src/generators/module/index.mts` actualizado.
- **Agente responsable**: module-agent.

### Paso 4: Actualización MCP Tool
- **Descripción**:
  - Añadir flags `withShards` y `withPages` al esquema Zod.
  - Marcar `withSurface` como deprecated (mapping a ambos para compatibilidad).
  - Mapear nuevos flags a argumentos del CLI yeoman.
- **Dependencias**: Paso 3.
- **Entregables**: `tools/mcp-server/src/tools/extensio-create.ts` actualizado.
- **Agente responsable**: module-agent.

### Paso 5: Actualización de Workflow Doc
- **Descripción**: Reflejar los nuevos inputs y pasos en el workflow de documentación.
- **Dependencias**: Paso 4.
- **Entregables**: `.agent/workflows/modules/create.md` actualizado.
- **Agente responsable**: module-agent.

### Paso 6: Validación
- **Descripción**:
  - Build del CLI y MCP.
  - Ejecutar `ext create module` con diferentes flags.
  - Verificar estructura generada, types globales, constants y demo.
- **Dependencias**: Paso 5.
- **Entregables**: Reporte de walkthrough.
- **Agente responsable**: module-agent.

---

## 4. Asignación de responsabilidades (Agentes)

- **Architect-Agent**
  - Validación del plan y del resultado final.
  - Auditoría de coherencia con Constitution. y Analysis.

- **Module-Agent**
  - Ejecución integral de los Pasos 1 a 6.
  - Responsable de código, templates y documentación.

**Componentes**
- **Generator**: Se modifica `ModuleGenerator`. Herramienta: typescript compiler (build CLI).
- **MCP Tool**: Se modifica `extensio-create`. Herramienta: typescript compiler (build MCP).

**Demo**
- Se generará un módulo "dummy" (`refactor-test`) usando el nuevo MCP para validar.
- Estructura alineada con arquitectura por definición del generator.

---

## 5. Estrategia de testing y validación

- **Unit tests**:
  - Tests existentes del generator deben pasar.

- **Integration / Manual**:
  - **Prueba 1**: Crear módulo full (`--withShards --withPages`). Verificar `demo/` y registro de shards.
  - **Prueba 2**: Crear módulo solo engine. Verificar ausencia de surfaces.
  - **Prueba 3**: Validar `global.d.mts` y `constants.mts` actualizados correctamente.
  - **Prueba 4**: Levantar demo generada y comprobar que funciona sin errores.

**Trazabilidad**
- AC-1 -> Paso 1
- AC-2 -> Paso 5
- AC-3 -> Paso 3
- AC-4 -> Paso 4
- AC-5 -> Paso 2
- AC-6 -> Paso 3
- AC-7 -> Paso 3

---

## 6. Plan de demo
- **Objetivo**: Demostrar que el nuevo generator crea módulos funcionales "out of the box".
- **Escenario**: Generar módulo `demo-module`, buildearlo y cargarlo.
- **Criterios**:
  - No errores de compilación.
  - Shards registrados correctamente.
  - Demo navegable.

---

## 7. Estimaciones y pesos de implementación
- **Paso 1 (Constitution)**: Bajo (Doc).
- **Paso 2 (Templates)**: Medio (Código EJS cuidado).
- **Paso 3 (Generator)**: Bajo (Lógica simple).
- **Paso 4 (MCP)**: Medio (Zod + Argument mapping).
- **Paso 5 (Workflow)**: Bajo (Doc).
- **Paso 6 (Validación)**: Medio (Build + Test manual).

**Timeline**: ~2-3 horas estimadas de agente.

---

## 8. Puntos críticos y resolución
- **Punto crítico 1**: Conflicto de flags en mapping de MCP.
  - **Resolución**: Lógica clara: si viene legacy `withSurface`, activa ambos. Si vienen específicos, usan específicos.

- **Punto crítico 2**: Error de sintaxis en template EJS al inyectar `Shard.register`.
  - **Resolución**: Validación cuidadosa de la sintaxis generada.

---

## 9. Dependencias y compatibilidad
- **Compatible** con todos los navegadores (agnóstico).
- **Compatible** hacia atrás (flag legacy).

---

## 10. Criterios de finalización
1. `extensio create module` soporta `--withShards` y `--withPages`.
2. Módulos generados compilan y ejecutan demo.
3. Shards se registran estáticamente.
4. Constitution y Workflow docs están actualizados.
5. `walkthrough.md` documenta la verificación exitosa.

---

## 11. Aprobación del desarrollador (OBLIGATORIA)

```yaml
approval:
  developer:
    decision: SI
    date: 2026-01-07T21:56:02+01:00
    comments: Aprobado con requerimiento de example shard y comentarios NPM
```
