---
artifact: research
phase: phase-1-research
owner: researcher-agent
status: draft
related_task: task-build-stabilization-2026-01-11
---

# Research Report — Build Stabilization

## 1. Resumen ejecutivo
- **Problema**: La build actual presenta errores y no garantiza la generación correcta de todos los artefactos (engine, context, surfaces) con sus respectivos entry points y manifiestos.
- **Objetivo**: Estabilizar el comando `build` del CLI para soportar robustamente la arquitectura Extensio (Shards, Pages, Runtime detection).
- **Hallazgos**:
  - `packages/cli` ya contiene plugins para Manifiesto (`manifest/index.mts`) y Pages (`surface-pages/index.mts`).
  - La lógica de "detección de imports" para manifiesto se basa en identificar módulos/drivers importados y fusionar sus `manifest.json` parciales.
  - Los Shards se gestionan correctamente como entry points si están definidos en `exports` del `package.json` del proyecto.
  - Los Pages se procesan buscando etiquetas `<script>` y compilándolas como entry points independientes.

---

## 2. Necesidades detectadas
- **Build System**:
  - Debe respetar estructura de directorios (`dist` espejo de `src`).
  - Debe virtualizar `node_modules` importados en `dist/node-modules` (ya implementado en `build.mts`).
- **Manifest**:
  - Detección automática de permisos basada en uso. Actualmente implementada como **fusión de manifiestos de módulos importados**.
  - Corrección de paths de assets (iconos) al fusionar.
- **Surfaces (Pages)**:
  - Detección *runtime* (build-time parsing) de scripts en HTML.
  - Inyección de `runtimeUrl` correcto para cargar recursos dinámicamente.
- **Entry Points**:
  - Estáticos: Definidos en `package.json:exports` (incluye Engine y Shards).
  - Dinámicos: Scripts dentro de ficheros HTML de Pages.

---

## 3. Alternativas tecnicas

### Manifest Generation
- **A) Code Scan (AST)**: Analizar AST para encontrar usos de `chrome.storage`, etc.
- **B) Module Inheritance (Actual & Correcta)**: El plugin actual **YA implementa esto**. Al importar un driver (ej. `@extensio/driver-storage`), el sistema lee su `manifest.json` y **extiende** automáticamente los permisos en el manifiesto final.
  - *Pros*: Alineado con arquitectura modular. Código limpio.
  - *Estado*: Funcional. Solo se validará que no haya bugs en casos borde (ej. rutas de iconos).
  - **Decisión**: **MANTENER** la implementación actual. Solo se requiere estabilización/testing.

### HTML Pages Processing
- **A) Vite HTML Plugin estándar**: Usar plugins de comunidad.
  - *Contras*: Puede no respetar la estructura de salida específica requerida o la inyección de `runtimeUrl` custom.
- **B) Custom Plugin (Actual)**: `surface-pages/index.mts`.
  - *Pros*: Control total sobre la compilación del script y la ruta de salida. Permite inyectar lógica de `runtimeUrl`.
  - *Contras*: Mantenimiento propio regex-based.
  - **Decisión**: Validar y estabilizar **B**.

---

## 4. APIs Web / WebExtensions relevantes
- **`chrome.runtime.getURL()`**: Crítico para que los scripts cargados dinámicamente o workers sepan su ruta base.
- **Offscreen API**: Usada para Contexts que requieren DOM (audio, clipboard). El plugin `offscreen` ya detecta `createContext` e inyecta `offscreen.html`.

---

## 5. Compatibilidad multi-browser
- **Safari**:
  - No soporta `service_worker` en `background`. Requiere `scripts` (array).
  - El plugin `manifest` ya contiene lógica `adaptManifest` para transformar `service_worker` a `scripts` en Safari/Firefox.
- **Firefox**:
  - Idem Safari para background scripts en MV3 (aunque soporte varía, mejor usar scripts para compatibilidad).

---

## 6. Recomendaciones AI-first
- **Agentes de Validación**: Crear un script de validación post-build que use un LLM (o reglas estáticas) para inspeccionar `dist/` y confirmar que no faltan ficheros referenciados.
- **Generación de Justificaciones**: El plugin `offscreen` ya extrae "justificaciones" del código para auditoría. Esto es un patrón excelente para transparencia automática.

---

## 7. Riesgos y trade-offs
- **Riesgo**: Rutas relativas en assets copiados.
  - *Severidad*: Alta (iconos rotos).
  - *Mitigación*: El plugin `manifest` normaliza rutas. Verificar casos borde.
- **Riesgo**: Shards no exportados.
  - *Severidad*: Media (no se compilan).
  - *Mitigación*: Documentar/Enforzar que todo Shard se exporte en `package.json`.

---

## 8. Fuentes
- Extensio Architecture (`extensio-architecture.md`)
- Código fuente `packages/cli`
- Código fuente `packages/core/demo`

---

## 9. Aprobacion del desarrollador (OBLIGATORIA)
```yaml
approval:
  developer:
    decision: SI
    date: 2026-01-11T22:41:36+01:00
    comments: "Aprobado tras aclarar funcionamiento de plugin manifest"
```
