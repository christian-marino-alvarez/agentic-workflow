---
artifact: research
phase: phase-1-research
owner: researcher-agent
status: draft
related_task: 2-scaffold-vscode-chat-ai-panel
---

🔍 **researcher-agent**: Informe de investigacion tecnica para migrar la extension al root.

# Research Report — 2-scaffold-vscode-chat-ai-panel

## Identificacion del agente (OBLIGATORIA)
Primera linea del documento:
`<icono> **<nombre-agente>**: <mensaje>`

> [!CAUTION]
> **REGLA PERMANENT**: Este documento es SOLO documentación.
> El researcher-agent documenta hallazgos SIN analizar, SIN recomendar, SIN proponer soluciones.
> El análisis corresponde a Phase 2.

## 1. Resumen ejecutivo
- Problema investigado: Migracion de una extension VS Code desde subcarpeta a root del repo manteniendo manifest y build.
- Objetivo de la investigacion: Identificar requisitos de estructura, archivos clave y rutas de build/launch al mover la extension.
- Principales hallazgos: `package.json` en root define contribuciones; `main` apunta a `out/extension.js`; `tsconfig` y `outFiles` deben alinearse con nueva ubicacion.

---

## 2. Necesidades detectadas
- Requisitos tecnicos identificados por el architect-agent:
  - Unificar `package.json` en root con contribuciones de extension.
  - Reubicar `src/` y `out/` al root.
  - Actualizar scripts y paths de build/launch.
- Suposiciones y limites:
  - Se mantiene TypeScript con `tsc`.
  - El build genera `out/` en root.

---

## 3. Hallazgos técnicos
- Extension manifest (`package.json`)
  - Descripcion: Define contribuciones, activationEvents, `main` y scripts de build.
  - Estado actual: Estable.
  - Documentación oficial: https://code.visualstudio.com/api/references/extension-manifest
  - Limitaciones conocidas: Rutas deben ser relativas al root de la extension.

- Carpeta `out/`
  - Descripcion: Salida compilada de TypeScript.
  - Estado actual: Estable.
  - Documentación oficial: https://code.visualstudio.com/api/get-started/your-first-extension
  - Limitaciones conocidas: `main` debe apuntar al archivo compilado correcto.

- `tsconfig.json`
  - Descripcion: Configura salida de TypeScript (`outDir`).
  - Estado actual: Estable.
  - Documentación oficial: https://www.typescriptlang.org/tsconfig
  - Limitaciones conocidas: `outDir` y `rootDir` deben coincidir con la nueva ubicacion.

- Launch config (Extension Host)
  - Descripcion: `launch.json` usa `--extensionDevelopmentPath`.
  - Estado actual: Estable.
  - Documentación oficial: https://code.visualstudio.com/api/working-with-extensions/testing-extension
  - Limitaciones conocidas: El path debe apuntar al root correcto de la extension.

---

## 4. APIs relevantes
- Extension manifest (`package.json`)
  - Estado de soporte: VS Code estable.
  - Restricciones conocidas: `contributes` y `activationEvents` deben existir en el root de la extension.

- `--extensionDevelopmentPath`
  - Estado de soporte: VS Code estable.
  - Restricciones conocidas: debe apuntar a la carpeta que contiene el `package.json` de la extension.

---

## 5. Compatibilidad multi-browser
- No aplica (extension VS Code en Electron).

---

## 6. Oportunidades AI-first detectadas
- N/A (esta fase cubre migracion de estructura).

---

## 7. Riesgos identificados
- Riesgo: Paths rotos al mover `src/` y `out/`.
  - Severidad: media
  - Fuente: https://code.visualstudio.com/api/references/extension-manifest
- Riesgo: Launch config apunta a path incorrecto.
  - Severidad: media
  - Fuente: https://code.visualstudio.com/api/working-with-extensions/testing-extension

---

## 8. Fuentes
- https://code.visualstudio.com/api/references/extension-manifest
- https://code.visualstudio.com/api/get-started/your-first-extension
- https://code.visualstudio.com/api/working-with-extensions/testing-extension
- https://www.typescriptlang.org/tsconfig

---

## 9. Aprobacion del desarrollador (OBLIGATORIA)
```yaml
approval:
  developer:
    decision: SI
    date: 2026-01-25T11:12:44Z
    comments: null
```
