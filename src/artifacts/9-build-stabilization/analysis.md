---
artifact: analysis
phase: phase-2-analysis
owner: architect-agent
status: draft
related_task: "9-build-stabilization"
---

# Analysis Report — Build Stabilization

## 1. Resumen de Findings (Fase 1)
- **Estado Actual**:
  - `packages/cli` tiene los plugins necesarios (`manifest`, `surface-pages`) pero requieren estabilización.
  - El manifiesto se genera por fusión de módulos, lo cual es arquitecturalmente correcto.
  - Los entry points estáticos (Shards) y dinámicos (Pages) están soportados conceptualmente pero requieren validación en runtime.
- **Conclusión**: No se requiere reescribir la lógica de build, sino **refinar y cubrir casos borde** (rutas relativas, assets, detección de scripts).

## 2. Análisis del estado del proyecto (As-Is)
- **Core**: `@extensio/core` exporta las bases.
- **CLI**: `mcp_extensio-cli` es el orquestador de build.
- **Caso de Prueba**: `packages/core/demo` contiene:
  - `engine/index.mts` (Entry point principal)
  - `surface/pages` (HTML con scripts)
  - `surface/shards` (Entry points secundarios)
  - `manifest.json` parcial.

## 3. Cobertura de Acceptance Criteria

| Criteria | Analisis | Verificación Propuesta | Riesgos |
|----------|----------|------------------------|---------|
| **1. Alcance: Reparación CLI** | Se tocarán ficheros en `packages/cli/src/commands/build.mts` y `plugins/`. | `npm run build` en demo sin errores. | Regresión en otros drivers. |
| **2. Entradas: CLI Source & Demo** | Se usará `packages/core/demo` como "gold master". | Test de integración en CI. | Dependencias circulares. |
| **3. Salidas: Build Exitosa** | El output `dist` debe tener estructura espejo y `manifest.json` válido. | Inspección de `dist/` post-build. | Rutas relativas rotas en assets. |
| **4. Restricciones: Estructura** | `dist` debe mantener `src` y `node-modules`. | `tree dist` debe coincidir con patrón esperado. | Vite a veces aplana directorios. |
| **5. Done: Carga sin errores** | La extensión cargada en chrome no debe tirar 404s. | Carga manual o E2E smoke test. | Runtime errors no detectables en build. |

## 4. Agentes y Responsabilidades
- **architect-agent**: Validación de estructura de salida y coherencia de manifiesto.
- **driver-agent (actuando como builder)**: Implementación de fixes en `packages/cli`.
- **qa-agent**: Verificación de build con `packages/core/demo`.

## 5. Impacto en Componentes
- **Crear**: Nada nuevo.
- **Modificar**:
  - `packages/cli/src/commands/build.mts` (ajuste de lógica).
  - `packages/cli/src/commands/plugins/manifest/index.mts` (paths).
  - `packages/cli/src/commands/plugins/surface-pages/index.mts` (script detection).
- **Eliminar**: Nada.

## 6. Demo
- **Requerido**: SI.
- **Justificación**: Es el único modo de validar que la build genera un artefacto cargable por el navegador.
- **Impacto**: Se usará la demo existente `packages/core/demo`.

## 7. Aprobacion del desarrollador (OBLIGATORIA)
```yaml
approval:
  developer:
    decision: SI
    date: 2026-01-11T22:43:18+01:00
    comments: "Aprobado analisis de estabilizacion"
```
