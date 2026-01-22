---
artifact: plan
phase: phase-3-planning
owner: architect-agent
status: draft
related_task: "9-build-stabilization"
---

# Implementation Plan — Build Stabilization

## 1. Objetivo
Ejecutar la estabilización del sistema de build definido en el Análisis, asegurando que `mcp_extensio-cli build` genere artefactos correctos para `engine`, `context`, `surfaces` (pages/shards) y `manifest`.

## 2. Pasos de Implementación

### Paso 1: Validación y Ajuste de Manifest Plugin
- **Responsable**: driver-agent
- **Acción**: 
  - Revisar `packages/cli/src/commands/plugins/manifest/index.mts`.
  - Asegurar que la fusión de permisos e iconos normaliza correctamente las rutas (evitar `src/` en dist).
  - Verificar que `background.service_worker` se transforme a `scripts` para Safari/Firefox si aplica.

### Paso 2: Estabilización de Surface Pages Plugin
- **Responsable**: driver-agent
- **Acción**:
  - Revisar `packages/cli/src/commands/plugins/surface-pages/index.mts`.
  - Confirmar que la detección de `<script>` en HTML funciona con rutas relativas complejas.
  - Asegurar que la inyección de `runtimeUrl` es robusta.

### Paso 3: Verificación de Shards y Entry Points
- **Responsable**: driver-agent
- **Acción**:
  - Verificar en `packages/cli/src/commands/build.mts` que los exports definidos en `package.json` se respetan como entry points.
  - Asegurar que `node_modules` importados vayan a `dist/node-modules`.

### Paso 4: Ejecución de Build sobre Demo
- **Responsable**: driver-agent
- **Acción**:
  - Ejecutar build sobre `packages/core/demo`.
  - Inspeccionar árbol de directorios `dist`.

## 3. Asignación de Responsabilidades

| Subárea | Agente | Entregables | Tool Preferido |
|---------|--------|-------------|----------------|
| CLI Plugins | driver-agent | Código corregido en plugins | `view_file`, `replace_file_content` |
| Build Process | driver-agent | Logs de build exitosa | `run_command` (npm run build) |
| Verificación | qa-agent | Reporte de tests E2E | `run_command` (playwright) |

## 4. Estrategia de Testing y Validación

### Automated Tests
- **Unitarios**: No se crearán nuevos unitarios para CLI en esta fase, se confía en la integración.
- **Integración (Build)**:
  - Comando: `cd packages/core/demo && npm run build`
  - Validación: Exit code 0.
- **E2E (Runtime)**:
  - Comando: `mcp_extensio-cli test --type e2e --browsers chromium` (sobre demo).
  - Validar que la extensión carga y no hay errores de consola.

### Manual Verification
- Cargar la extensión generada en `dist/chrome` en un navegador Chrome real.
- Verificar que el icono aparece.
- Verificar que el popup (Surface Page) abre.

## 5. Estimación y Puntos Críticos
- **Esfuerzo**: Bajo (Estabilización, no creación).
- **Puntos Críticos**:
  - Rutas de iconos en `manifest` fusionado.
  - Inyección de `runtimeUrl` en scripts de Pages.
- **Resolución**:
  - Revisión manual de `dist/manifest.json`.
  - Inspección de código generado en `dist/surface/pages/*.mjs`.

## 6. Aprobacion del desarrollador (OBLIGATORIA)
```yaml
approval:
  developer:
    decision: SI
    date: 2026-01-11T22:46:00+01:00
    comments: "Plan aprobado"
```
