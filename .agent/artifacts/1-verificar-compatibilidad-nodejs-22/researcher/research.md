---
artifact: research
phase: phase-1-research
owner: researcher-agent
status: approved
related_task: 1-verificar-compatibilidad-nodejs-22
---

# Research Report — 1-verificar-compatibilidad-nodejs-22

## Identificacion del agente (OBLIGATORIA)
`🔬 **researcher-agent**: Reporte de investigación completado`

## 1. Resumen ejecutivo
- **Problema investigado**: Viabilidad de ejecutar el SDK de OpenAI Agents (`@openai/agents`) en el entorno Extension Host de VS Code.
- **Objetivo de la investigacion**: Confirmar si el runtime de Node.js provisto por Electron en VS Code cumple con los requisitos del SDK (Node.js 20+).
- **Principales hallazgos**: 
  - VS Code v1.96+ utiliza **Node.js v20.18.x** (vía Electron 32+).
  - El SDK `@openai/agents` requiere **Node.js 20+** y `zod` v4.
  - **Conclusión**: El entorno es **compatible** sin necesidad de arquitectura Python, asumiendo que el usuario final utiliza una versión reciente de VS Code (Mayo 2024 en adelante).

---

## 2. Necesidades detectadas
- **Requisitos tecnicos**:
  - Runtime Node.js >= 20.0.0.
  - Soporte de `zod` v4 (peer dependency).
  - API Key de OpenAI.
- **Suposiciones y limites**:
  - Se asume que no hay bloqueos de red corporativos para conectar con OpenAI API.
  - El Extension Host comparte el event loop; tareas intensivas de CPU en el agente podrían congelar otras extensiones.

---

## 3. Hallazgos técnicos
- **Versión de Node.js en VS Code**:
  - Ejecución local (`Versions: Node.js`): Confirmado **v20.18.x** en VS Code moderno (Electron 32).
  - Histórico: VS Code versión Mayo 2024 (1.90) ya introdujo Node.js 20.
  - *Implicación*: Usuarios con versiones muy antiguas (< 1.90) no podrán usar la extensión. Se debe forzar `engines.vscode` en `package.json`.

- **Compatibilidad de @openai/agents**:
  - Requisito oficial: Node.js 20+.
  - Requisito TypeScript: `zod` v4.
  - *Streaming*: Soportado nativamente por Node 20 (`ReadableStream` web standard y `stream` module).

---

## 4. APIs relevantes
- **VS Code Extension API**:
  - `vscode.chat`: Disponible para UI nativa, pero nuestro roadmap usa webview custom con ChatKit.
  - `vscode.authentication`: Recomendado para gestionar la API Key de forma segura (evita guardar en texto plano).

---

## 5. Compatibilidad multi-browser
- **VS Code Desktop (Win/Mac/Linux)**:
  - **Compatible**. Todos usan el mismo runtime Electron/Node.
- **VS Code Web (vscode.dev)**:
  - **NO Compatible**. El runtime web no tiene Node.js, solo Web Workers.
  - *Mitigación*: La extensión debe marcarse como `extensionKind: ["ui", "workspace"]` para forzar ejecución en backend remoto si se usa desde web, o deshabilitarse en web puro.

---

## 6. Oportunidades AI-first detectadas
- **Language Model API (`vscode.lm`)**: 
  - VS Code ahora expone modelos locales/remotos vía `vscode.lm.chat`.
  - *Oportunidad*: Podríamos usar `vscode.lm` como "transporte" alternativo para ahorrar costes de API Key al usuario si tiene Copilot active, aunque `@openai/agents` está diseñado para la API directa de OpenAI.

---

## 7. Riesgos identificados
- **Riesgo 1**: Conflicto de versión de `zod`.
  - Si otra librería usa `zod` v3, podría haber problemas de resolución de tipos.
  - Severidad: Baja (resoluble con `npm overrides`).
- **Riesgo 2**: Performance en el Extension Host.
  - Ejecutar agentes complejos en el mismo proceso que otras extensiones (git, linters) puede causar latencia.
  - Severidad: Media.

---

## 8. Fuentes
- [Node.js version in VS Code updates](https://code.visualstudio.com/updates)
- [OpenAI Agents SDK Node.js Requirements](https://github.com/openai/openai-agents-node)
- [Electron Version History](https://www.electronjs.org/docs/latest/tutorial/electron-versioning)

---

## 9. Aprobacion del desarrollador (OBLIGATORIA)
```yaml
approval:
  developer:
    decision: SI
    date: "2026-02-06T09:32:39+01:00"
    comments: "Approved via chat"
```
