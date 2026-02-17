---
artifact: research
phase: phase-1-research
owner: researcher-agent
status: draft
related_task: 7-extension-vscode-webview
---

🔬 **researcher-agent**: Reporte de investigación documental actualizado para incluir icono de Activity Bar.

# Research Report — 7-extension-vscode-webview

## Identificacion del agente (OBLIGATORIA)
Primera linea del documento:
`<icono> **<nombre-agente>**: <mensaje>`

> [!CAUTION]
> **REGLA PERMANENT**: Este documento es SOLO documentación.
> El researcher-agent documenta hallazgos SIN analizar, SIN recomendar, SIN proponer soluciones.
> El análisis corresponde a Phase 2.

## 1. Resumen ejecutivo
- Problema investigado: extensión VS Code con webview en Activity Bar (view container + view) y estructura de vistas ESM.
- Objetivo de la investigacion: identificar APIs, contribution points, activación onView y requisitos de iconos para Activity Bar según docs oficiales.
- Principales hallazgos: existen contribution points para `viewsContainers` y `views` con `icon` requerido en Activity Bar, APIs de `WebviewViewProvider`, y activación `onView`. La guía de Activity Bar define estilo recomendado para iconos.

---

## 2. Necesidades detectadas
- Requisitos tecnicos identificados por el architect-agent:
  - Activity Bar con icono y view container único.
  - WebviewViewProvider con script y estado básico.
  - Estructura `src/extension/views` con `index.ts` ESM exportando `MainChatView`.
  - Activación por `onView`.
  - Compatibilidad declarada con última versión estable de VS Code.
  - Icono SVG minimalista para Activity Bar referenciado desde `package.json`.
- Suposiciones y limites:
  - La versión estable actual corresponde a la release 1.108 (Updates) y existen updates 1.108.x.

---

## 3. Hallazgos técnicos
- **View Containers y Views (Contribution Points)**
  - Descripción: se declaran en `package.json` bajo `contributes.viewsContainers` y `contributes.views` para crear un contenedor (Activity Bar) y sus vistas.
  - Estado actual: estable.
  - Documentación oficial: guía de Tree View / Views.
  - Limitaciones conocidas: la definición es declarativa y depende del manifest.
  - Nota: `icon` es requerido en `viewsContainers.activitybar`.

- **Activity Bar iconos (UX guidelines)**
  - Descripción: la Activity Bar requiere iconos que sigan el estilo por defecto y no dupliquen iconos existentes.
  - Estado actual: estable.
  - Documentación oficial: Activity Bar UX guidelines.
  - Limitaciones conocidas: debe usarse un icono propio que siga el estilo recomendado.

- **Webview Views / WebviewViewProvider**
  - Descripción: VS Code permite registrar un `WebviewViewProvider` para mostrar un webview dentro de una vista (por ejemplo, en Activity Bar).
  - Estado actual: estable.
  - Documentación oficial: guía de Webviews y Webview Views.
  - Limitaciones conocidas: los webviews requieren medidas de seguridad (CSP) y están aislados del DOM de VS Code.

- **Activation Events (onView)**
  - Descripción: la activación puede configurarse con `onView:<viewId>` para cargar la extensión cuando la vista se abre.
  - Estado actual: estable.
  - Documentación oficial: sección de activación en Tree View/Views.
  - Limitaciones conocidas: requiere que el `viewId` coincida con el declarado en `contributes.views`.

---

## 4. APIs relevantes
- `WebviewViewProvider`, `WebviewView`: API para views con webview.
- Contribution points: `viewsContainers` (Activity Bar) y `views`, incluyendo `icon`.
- `activationEvents` con `onView:<viewId>`.

---

## 5. Compatibilidad multi-browser
- **Contexto**: VS Code Desktop y VS Code Web tienen diferencias documentadas en capacidades; el entorno web se ejecuta en navegador y tiene limitaciones.

| Entorno | Soporte | Referencia |
|---|---|---|
| VS Code Desktop (app) | Soportado (extensiones completas) | Updates / release estable |
| VS Code Web (browser) | Limitaciones documentadas | VS Code Web docs |

---

## 6. Oportunidades AI-first detectadas
- Webviews permiten UI HTML/JS aislada para interacción personalizada.
- Views en Activity Bar permiten exponer acciones vinculadas a la vista declarada.

---

## 7. Riesgos identificados
- **Riesgo**: Requisitos de seguridad de Webviews (CSP, aislamiento). Severidad: media. Fuente: guía de Webviews.
- **Riesgo**: Icono de Activity Bar no sigue el estilo recomendado o duplica iconos. Severidad: baja. Fuente: Activity Bar UX guidelines.

---

## 8. Fuentes
- Docs oficiales (URLs en bloque):

```
https://code.visualstudio.com/Updates
https://code.visualstudio.com/api/ux-guidelines/activity-bar
https://code.visualstudio.com/api/extension-guides/tree-view
https://code.visualstudio.com/api/extension-guides/webview
```

---

## 9. Aprobacion del desarrollador (OBLIGATORIA)
```yaml
approval:
  developer:
    decision: SI
    date: 2026-01-30T16:26:01Z
    comments: null
```
