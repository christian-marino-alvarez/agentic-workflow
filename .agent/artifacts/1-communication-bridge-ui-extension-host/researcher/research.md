---
artifact: research
phase: phase-1-research
owner: researcher-agent
status: draft
related_task: 1-communication-bridge-ui-extension-host
---

# Research Report — 1-Communication Bridge (UI ↔ Extension Host)

## Identificacion del agente (OBLIGATORIA)
🔬 **researcher-agent**: Iniciando investigación técnica sobre el puente de comunicación en VS Code.

> [!CAUTION]
> **REGLA PERMANENT**: Este documento es SOLO documentación.
> El researcher-agent documenta hallazgos SIN analizar, SIN recomendar, SIN proponer soluciones.

## 1. Resumen ejecutivo
- **Problema investigado**: Comunicación bidireccional entre VS Code Webview y Extension Host con soporte para streaming y tipado fuerte.
- **Objetivo de la investigacion**: Identificar las APIs nativas, especificaciones de streaming y patrones de validación compatibles con el entorno de extensiones de VS Code.
- **Principales hallazgos**: La API de Webview se basa en `postMessage`. El streaming requiere el uso de buffers o eventos secuenciales. Zod es el estándar de facto para validación de esquemas en TypeScript.

## 2. Necesidades detectadas
- Requisitos identificados: Canal para conversación, cambios de modelo, aceptaciones, validación Zod, reintentos y streaming.
- **Suposiciones**: Se asume el uso de TypeScript en ambos extremos y el cumplimiento de las políticas de seguridad de VS Code.

## 3. Hallazgos técnicos

### VS Code Webview API (`postMessage`)
- **Descripción**: Mecanismo asíncrono para enviar objetos JSON entre la Webview y el Extension Host.
- **Estado actual**: Estable.
- **Documentación oficial**: [VS Code Webview API](https://code.visualstudio.com/api/extension-guides/webview#passing-messages-back-and-forth)
- **Limitaciones**: Solo soporta datos serializables. No soporta funciones ni referencias circulares.

### Tipado y Validación (Zod)
- **Descripción**: Biblioteca de declaración y validación de esquemas con inferencia de tipos estática.
- **Estado actual**: Estable (v3.x).
- **Documentación oficial**: [Zod Documentation](https://zod.dev/)
- **Limitaciones**: Requiere que los esquemas se definan en archivos compartidos entre el frontend (Webview) y el backend (Extension Host).

## 4. APIs relevantes
- **`webview.postMessage(message)`**: Envía mensajes a la Webview.
- **`webview.onDidReceiveMessage`**: Escucha mensajes en el Extension Host.
- **`window.addEventListener('message', event => ...)`**: Escucha mensajes en la Webview.
- **`acquireVsCodeApi().postMessage(message)`**: Envía mensajes desde la Webview.

## 5. Compatibilidad multi-browser
*Nota: VS Code utiliza Electron (Chromium).*
- **Motor**: Chromium (versión interna de VS Code).
- **Soporte**: Completo para `postMessage` y `Zod`.
- **Diferencias**: No aplica (entorno controlado).

## 6. Oportunidades AI-first detectadas
- **Streaming de Tokens**: Uso de eventos parciales para feedback inmediato en la UI durante la generación de texto por LLMs.
- **Message Contracts**: Definición de una gramática de mensajes compartida para facilitar la interoperabilidad entre agentes.

## 7. Riesgos identificados
- **Serialización**: Riesgo de pérdida de datos si se intentan enviar objetos no serializables (Ej: instancias de clases complejas). Severidad: Media.
- **Race Conditions**: Al ser asíncrono, existe riesgo si no se manejan correctamente los IDs de correlación en las respuestas. Severidad: Alta.
- **Consumo de Memoria**: En streaming masivo, si no hay backpressure, la Webview podría ralentizarse. Severidad: Baja.

## 8. Fuentes
- [VS Code Webview Documentation](https://code.visualstudio.com/api/extension-guides/webview)
- [Zod GitHub Repository](https://github.com/colinhacks/zod)
- [Electron postMessage Guide](https://www.electronjs.org/docs/latest/api/webview-tag/#webviewpostmessagemessage-targetorigin)

## 9. Aprobacion del desarrollador (OBLIGATORIA)
```yaml
approval:
  developer:
    decision: SI
    date: "2026-02-09T14:40:53Z"
    comments: "Aprobado vía chat."
```
