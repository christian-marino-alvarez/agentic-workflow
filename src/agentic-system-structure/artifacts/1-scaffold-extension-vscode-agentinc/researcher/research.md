🔍 **researcher-agent**: Informe de investigacion preparado para la fase 1.

---
artifact: research
phase: phase-1-research
owner: researcher-agent
status: draft
related_task: 1-scaffold-extension-vscode-agentinc
---

# Research Report — 1-scaffold-extension-vscode-agentinc

## Identificacion del agente (OBLIGATORIA)
Primera linea del documento:
`<icono> **<nombre-agente>**: <mensaje>`

> [!CAUTION]
> **REGLA PERMANENT**: Este documento es SOLO documentacion.
> El researcher-agent documenta hallazgos SIN analizar, SIN recomendar, SIN proponer soluciones.
> El analisis corresponde a Phase 2.

## 1. Resumen ejecutivo
- Problema investigado: scaffolding de una extension de VS Code con nombre "vscode-agentinc" en `src/extension` y validacion de nombre en Marketplace.
- Objetivo de la investigacion: documentar fuentes oficiales sobre el generador `yo code`, estructura y publicacion de extensiones, APIs relevantes (incluyendo chat AI), y verificacion del nombre en Marketplace.
- Principales hallazgos: existen guias oficiales para crear extensiones con `yo code`, referencias del manifesto `package.json`, guia de publicacion con `vsce`, limitaciones de extensiones web, y no se encontro coincidencia exacta del nombre "vscode-agentinc" como display name o extension name en la busqueda del Marketplace mediante ExtensionQuery.

---

## 2. Necesidades detectadas
- Requisitos tecnicos identificados por el architect-agent:
  - Scaffold oficial con `yo code` (TypeScript + npm).
  - Ubicacion inicial en `src/extension`.
  - Extension con comando minimo registrable en VS Code.
  - Validar nombre "vscode-agentinc" en Marketplace (display name y extension name / identificador).
  - Entender packaging/publicacion (`vsce`) y scripts npm asociados.
- Suposiciones y limites:
  - El proyecto utiliza npm y TypeScript.
  - La extension se orienta a VS Code Desktop (Electron) salvo que se adapte a extension web.

---

## 3. Hallazgos tecnicos
- Generador oficial `yo code` (Yeoman Generator for VS Code Extension)
  - Estado actual: estable.
  - Documentacion oficial: https://code.visualstudio.com/api/get-started/your-first-extension
  - Limitaciones conocidas: requiere Node.js y npm; genera plantilla base con configuracion estandar.

- Manifesto de extension (package.json)
  - Estado actual: estable.
  - Documentacion oficial: https://code.visualstudio.com/api/references/extension-manifest
  - Limitaciones conocidas: la definicion de `publisher`, `name`, `displayName`, `activationEvents` y `contributes` debe seguir el esquema de manifesto.

- Publicacion y empaquetado con `vsce`
  - Estado actual: estable.
  - Documentacion oficial: https://code.visualstudio.com/api/working-with-extensions/publishing-extension
  - Limitaciones conocidas: requiere cuenta de publisher en Marketplace de VS Code para publicar.

- Estructura base de extension (entrypoint, activate/deactivate)
  - Estado actual: estable.
  - Documentacion oficial: https://code.visualstudio.com/api/get-started/your-first-extension
  - Limitaciones conocidas: la activacion depende de `activationEvents` definidos en el manifesto.

- API de extensiones VS Code (modulo `vscode`)
  - Estado actual: estable.
  - Documentacion oficial: https://code.visualstudio.com/api/references/vscode-api
  - Limitaciones conocidas: APIs disponibles dependen del entorno (desktop vs web) y del host de extension.

- API de modelos de lenguaje / chat (VS Code)
  - Estado actual: API propuesta / en evolucion.
  - Documentacion oficial: https://code.visualstudio.com/api/extension-guides/language-model
  - Limitaciones conocidas: APIs propuestas pueden requerir habilitacion y pueden cambiar.

- Marketplace ExtensionQuery (busqueda por termino)
  - Estado actual: estable.
  - Documentacion oficial: https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery
  - Limitaciones conocidas: la busqueda por termino devuelve multiples resultados; se requieren comparaciones exactas de `extensionName`/`displayName` para confirmar coincidencias.
  - Resultado observado: sin coincidencias exactas para `extensionName == vscode-agentinc` ni `displayName == vscode-agentinc` (0 matches en consulta con termino `vscode-agentinc`).

---

## 4. APIs relevantes
- VS Code Extension API (`vscode`)
  - Estado de soporte: VS Code Desktop (Electron/Chromium) soportado; VS Code Web con restricciones.
  - Restricciones conocidas: APIs de Node.js no disponibles en extensiones web.

- Extension Web (Web Extension API surface)
  - Estado de soporte: depende de VS Code Web y navegadores modernos.
  - Restricciones conocidas: solo un subconjunto del API de VS Code esta disponible.

- Language Model API (propuesta)
  - Estado de soporte: propuesta / en evolucion.
  - Restricciones conocidas: puede requerir habilitacion y cambios de version.

---

## 5. Compatibilidad multi-browser
- Tabla de compatibilidad (contexto VS Code):
  - VS Code Desktop (Electron/Chromium): soporte completo para APIs de extension de escritorio.
  - VS Code Web (navegador): soporte limitado a APIs de extensiones web.
  - Chrome/Firefox/Safari: aplican solo a VS Code Web; las extensiones de escritorio no corren en navegadores.

- Diferencias clave:
  - Extension de escritorio vs extension web: disponibilidad de APIs de Node.js y de VS Code segun host.

- Estrategias de mitigacion:
  - La documentacion de extensiones web describe el subconjunto de APIs disponibles y restricciones del host web.

---

## 6. Oportunidades AI-first detectadas
- VS Code Language Model API (propuesta) para integraciones de chat/modelos.
  - Referencia: https://code.visualstudio.com/api/extension-guides/language-model

- VS Code Extension API (comandos, contribuciones) para disparar acciones desde la paleta.
  - Referencia: https://code.visualstudio.com/api/references/vscode-api

---

## 7. Riesgos identificados
- Riesgo detectado: el nombre de extension puede estar ocupado en Marketplace.
  - Severidad: media.
  - Fuente: consulta en Marketplace (ExtensionQuery API) sin coincidencias exactas para "vscode-agentinc" en display name o extension name.

- Riesgo detectado: publicacion requiere cuenta de publisher y empaquetado con `vsce`.
  - Severidad: media.
  - Fuente: guia de publicacion de extensiones.

- Riesgo detectado: APIs de chat/Language Model son propuestas y pueden cambiar.
  - Severidad: media.
  - Fuente: documentacion de Language Model API.

- Riesgo detectado: limitaciones de extensiones web si se busca compatibilidad con VS Code Web.
  - Severidad: baja.
  - Fuente: guia de extensiones web.

---

## 8. Fuentes
- VS Code: Your First Extension (yo code): https://code.visualstudio.com/api/get-started/your-first-extension
- VS Code Extension Manifest: https://code.visualstudio.com/api/references/extension-manifest
- VS Code Publishing Extensions: https://code.visualstudio.com/api/working-with-extensions/publishing-extension
- VS Code Extension API: https://code.visualstudio.com/api/references/vscode-api
- VS Code Web Extensions: https://code.visualstudio.com/api/extension-guides/web-extensions
- VS Code Language Model API: https://code.visualstudio.com/api/extension-guides/language-model
- Marketplace ExtensionQuery API: https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery
- Marketplace Search (web): https://marketplace.visualstudio.com/search?term=vscode-agentinc&target=VSCode&category=All%20categories&sortBy=Relevance

---

## 9. Aprobacion del desarrollador (OBLIGATORIA)
```yaml
approval:
  developer:
    decision: SI # SI | NO
    date: 2026-01-24T16:04:11Z
    comments: null
```
