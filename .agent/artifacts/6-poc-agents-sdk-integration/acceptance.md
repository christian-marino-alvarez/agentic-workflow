---
kind: template
name: acceptance
source: agentic-system-structure
---

# Acceptance Criteria — 6-poc-agents-sdk-integration

🏛️ **architect-agent**: Definición de Acceptance Criteria para T014

## 1. Definición Consolidada

Implementar una integración funcional ("Proof of Concept") del SDK `@openai/agents` ejecutándose directamente dentro del **VS Code Extension Host**.

> ⚠️ **Diferencia con Spike T001**:
> - **Spike T001 (Completado)**: Fue un script *aislado* (`spike/poc-node20/agent-demo.ts`) ejecutado manualmente con `run-demo.sh` para verificar compatibilidad de Node.js. *No* se integró en la extensión.
> - **POC T014 (Actual)**: Es la *implementación real* dentro de la estructura de la extensión (`src/extension/modules/...`). Significa tomar ese código de ejemplo y convertirlo en un módulo que se compile, empaquete y ejecute *dentro* del flujo normal de VS Code, interactuando con APIs reales (OutputChannel, Memento, etc.) y no solo `console.log`.

Esta tarea busca instanciar y ejecutar el agente como parte del ciclo de vida de la extensión, validando que el entorno de VS Code (Node.js interno) soporta la ejecución de agentes, el uso de herramientas básicas y el streaming de respuestas, sin necesidad (por ahora) de un servidor backend externo.

## 2. Respuestas a Preguntas de Clarificación
> Derivadas del Roadmap original y resultados del Spike T001.

| # | Pregunta (formulada por architect) | Respuesta (basada en Roadmap) |
|---|-----------------------------------|-------------------------------|
| 1 | **Scope de integración** | **Extension Host Internal**: Implementar como módulo interno de la extensión, disparado por un comando (ej: `agentic.runPoc`). No crear servidor externo aún (difiere de roadmap original T015 por éxito de T001). |
| 2 | **Dependencias (Secrets)** | **Simplificado**: Usar variables de entorno (`process.env`) o configuración simple. La integración con `SecretStorage` es parte de T023. |
| 3 | **Salida (Output)** | **OutputChannel**: Redirigir la salida (logs y respuestas) a un "Output Channel" de VS Code para verificación inmediata. UI integración es Fase 3. |
| 4 | **Tooling** | **Básico**: Implementar una herramienta simple (ej: `get_time` o `calculator`) para validar el ciclo de tool-calling. |
| 5 | **Streaming** | **Consola/Log**: Validar que el SDK emite eventos de streaming (`delta`), aunque se visualicen como texto en el OutputChannel. |

---

## 3. Criterios de Aceptación Verificables
> Listado de criterios derivados de las respuestas anteriores que deben ser verificados en la Fase 5.

1. Alcance:
   - Módulo TypeScript `src/extension/modules/poc-agents/` creado y compilable dentro de la extensión.
   - Dependencia `@openai/agents` instalada y funcionando en runtime.

2. Entradas / Datos:
   - Comando `agentic-workflow.runPoc` registrado en `package.json`.
   - API Key provista vía configuración simple o entorno.

3. Salidas / Resultado esperado:
   - Ejecución del comando abre un OutputChannel "Agentic POC".
   - Se observa el ciclo: User Message -> Agent Thinking -> Tool Call -> Tool Result -> Agent Response.
   - Streaming visible en los logs.

4. Restricciones:
   - No debe romper el módulo de Setup existente.
   - No debe requerir servidor Node.js externo adicional (todo in-process).

5. Criterio de aceptación (Done):
   - [ ] Commando ejecutable en Developer Extension Host.
   - [ ] Agente responde a preguntas simples.
   - [ ] Agente usa al menos 1 herramienta correctamente.
   - [ ] Código commiteado en `src/extension/modules/poc-agents/`.

---

## Aprobación (Gate 0)
Este documento constituye el contrato de la tarea. Su aprobación es bloqueante para pasar a Phase 1.

```yaml
approval:
  developer:
    decision: SI
    date: 2026-02-08T16:04:30+01:00
    comments: Approved by user
```

---

## Historial de validaciones (Phase 0)
```yaml
history:
  - phase: "phase-0-acceptance-criteria"
    action: "pending"
    validated_by: null
    timestamp: null
    notes: null
```
