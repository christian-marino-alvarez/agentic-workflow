---
artifact: analysis
phase: phase-2-analysis
owner: architect-agent
status: draft
related_task: 6-poc-agents-sdk-integration
---

# Analysis — 6-poc-agents-sdk-integration

🏛️ **architect-agent**: Análisis de arquitectura para integración de POC Agents SDK

## 1. Resumen ejecutivo
**Problema**
- Actualmente tenemos validada la compatibilidad de Node.js (T001) pero no existe una implementación integrada que permita ejecutar agentes desde la extensión de VS Code de forma nativa.

**Objetivo**
- Implementar un módulo interno (`poc-agents`) que instancie el SDK `@openai/agents`, registre el comando `agentic-workflow.runPoc` y demuestre la ejecución end-to-end (Input -> Agent -> Tool -> Output) dentro del Extension Host.

**Criterio de éxito**
- Comando ejecutable desde Command Palette.
- Logs visibles en OutputChannel.
- Agente responde y usa tools.
- Código limpio y aislado en su propio módulo.

---

## 2. Estado del proyecto (As-Is)
- **Estructura relevante**:
  - `src/extension/modules/`: Directorio donde residen los módulos `setup`, `chat`, etc.
  - `package.json`: Registra comandos y activación.
- **Componentes existentes**:
  - `SetupModule`: Recientemente refactorizado y aislado.
  - `Router`: Maneja navegación (no afecta a este POC).
- **Limitaciones detectadas**:
  - El sistema de inyección de dependencias es básico.
  - No hay gestión centralizada de secretos (se usará `process.env` como solución temporal validada en Fase 0).

---

## 3. Cobertura de Acceptance Criteria

### Alcance (Módulo Interno)
- **Interpretación**: Crear `src/extension/modules/poc-agents/`.
- **Verificación**: Existencia del directorio y archivos.
- **Riesgos**: Duplicación de código si no se reutilizan utilidades (no aplica para POC).

### Setup (Comando)
- **Interpretación**: Registrar `agentic-workflow.runPoc` en `package.json`.
- **Verificación**: Comando aparece en Ctrl+Shift+P.
- **Riesgos**: Conflicto de nombres (prefijo `agentic-workflow` mitiga).

### Output (OutputChannel)
- **Interpretación**: Crear canal "Agentic POC".
- **Verificación**: Logs aparecen al ejecutar comando.
- **Riesgos**: Bloqueo de UI si se loguea excesivamente (mitigar con buffers si fuera necesario, pero para POC no es crítico).

### Tooling (Basic Tool)
- **Interpretación**: Implementar `get_weather` o `calculator` como función local.
- **Verificación**: Log muestra "Tool Call" y resultado.
- **Riesgos**: Failures en tool execution (capturar excepciones).

### Secrets (Env Vars)
- **Interpretación**: Leer `process.env.OPENAI_API_KEY`.
- **Verificación**: Agente falla auth si no existe variable.
- **Riesgos**: UX pobre (usuario debe lanzar VS Code desde terminal). Aceptado para POC.

---

## 4. Research técnico
**Alternativa A: Servidor Externo (Descartada)**
- Levantar servidor Express y comunicar por HTTP.
- *Inconvenientes*: Complejidad de despliegue y gestión de procesos para un POC.

**Alternativa B: In-Process Extension Host (Seleccionada)**
- Instanciar SDK directamente en el handler del comando.
- *Ventajas*: Simple, acceso directo a VS Code API (OutputChannel), sin latencia de red localhost.
- *Inconvenientes*: Bloqueo potencial de event loop (mitigable con async/await y promises).

**Decisión recomendada**: **Alternativa B**. Alineada con resultados de T001.

---

## 5. Agentes participantes

- **neo-agent** (Implementador)
  - Responsabilidades: Crear estructura de módulo, implementar lógica del agente, registrar comando.
  - Subáreas: `src/extension/modules/poc-agents/`.

- **architect-agent** (Supervisor)
  - Responsabilidades: Code review, validar arquitectura.

**Handoffs**
- Architect define estructura -> Neo implementa -> QA verifica (Fase 5).

**Componentes necesarios**
- [NEW] `src/extension/modules/poc-agents/`
- [MOD] `src/extension/index.ts` (para registrar módulo)
- [MOD] `package.json` (para registrar comando)

**Demo**
- La tarea ES una demo en sí misma (POC).

---

## 6. Impacto de la tarea
- **Arquitectura**: Introduce un nuevo módulo aislado. No afecta arquitectura core.
- **APIs / contratos**: Nuevo comando expuesto.
- **Compatibilidad**: Requiere `OPENAI_API_KEY` en entorno.
- **Testing / verificación**: Test manual de ejecución. No unit tests para POC code.

---

## 7. Riesgos y mitigaciones
- **Riesgo 1**: Bloqueo de UI durante "Thinking".
  - *Mitigación*: Asegurar que todas las llamadas al SDK son asíncronas (`await`).
- **Riesgo 2**: Conflicto con dependencias de webpack.
  - *Mitigación*: T001 validó compatibilidad, pero si falla build, ajustar `webpack.config.js`.

---

## 8. Preguntas abiertas
Ninguna. Fase 0 cerró el alcance.

---

## 9. TODO Backlog (Consulta obligatoria)
**Referencia**: `.agent/todo/`
**Estado actual**: 0 items relevantes.
**Impacto en el análisis**: Ninguno.

---

## 10. Aprobación
Este análisis **requiere aprobación explícita del desarrollador**.

```yaml
approval:
  developer:
    decision: SI
    date: 2026-02-08T16:07:40+01:00
    comments: Approved by user
```
