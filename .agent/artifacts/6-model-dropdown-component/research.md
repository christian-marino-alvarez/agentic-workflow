---
artifact: research
phase: phase-1-research
owner: researcher-agent
status: approved
related_task: 6-model-dropdown-component
---

# Research Report — 6-model-dropdown-component

## Identificación del agente (OBLIGATORIA)
🔍 **researcher-agent**: Investigación técnica sobre la integración de componentes UI de VS Code, orquestación de modelos dinámicos y gestión de consentimiento del usuario.

## 1. Resumen ejecutivo
- **Problema investigado**: Necesidad de una interfaz de selección de modelos coherente con VS Code que soporte una lógica de orquestación donde el sistema propone modelos optimizados por tarea.
- **Objetivo de la investigación técnica**: Identificar la mejor forma de integrar `@vscode/webview-ui-toolkit`, definir el flujo de interrupción para propuestas de modelos y asegurar el bloqueo de acceso por falta de configuración.
- **Principales evidencias detectadas**: El SDK `@openai/agents` permite interrupciones que pueden ser aprovechadas para el consentimiento de modelos. El toolkit oficial de VS Code ofrece componentes nativos compatibles con Lit.

---

## 2. Necesidades detectadas
- **Requisitos del Architect**: 
  - Uso de componentes oficiales de VS Code.
  - Sincronización local de modelos en el chat.
  - Orquestación con modelo "flash" para tareas generales.
  - Consentimiento del usuario para modelos específicos propuestos por el sistema.
- **Límites**: No se implementará lógica de negocio compleja para la selección de modelos, solo la capacidad técnica de proponer y aceptar/rechazar.

---

## 3. Profundización Técnica y Hallazgos

### 3.1 @vscode/webview-ui-toolkit y Lit
- **Descripción Atómica**: Conjunto de Web Components que implementan el Design System de VS Code. Utilizan Custom Elements estandarizados.
- **Estado Técnico**: Estable, versión 1.x. Compatible con Lit 3.x mediante el registro de componentes en el `design-system`.
- **Referencia**: [Official Documentation](https://github.com/microsoft/vscode-webview-ui-toolkit)
- **Seguridad**: Los componentes están diseñados para ejecutarse en el sandbox de Webviews de VS Code, respetando las políticas de CSP.

### 3.2 Orquestación de Modelos Dinámicos (Pattern)
- **Hallazgo**: El SDK `@openai/agents` no tiene un "Model Hook" nativo para cambiar el modelo en mitad de un `run`. Sin embargo, el estado de ejecución (`RunState`) permite identificar el agente actual.
- **Flujo interceptado**: 
  1. El backend detecta el `startAgentId` o el `currentAgent` tras un handoff.
  2. Un servicio de asesoría (`ModelAdvisor`) devuelve una recomendación (ej: "Sugerimos gpt-4o-mini para esta tarea de triaje").
  3. Si la recomendación difiere de la selección del usuario, el backend emite un evento `chat:model-proposal` y entra en un estado de espera (Interruption).
  4. El usuario responde vía UI.
- **Límites de Performance**: La interrupción añade un Round-Trip adicional de latencia antes de comenzar la inferencia real.

### 3.3 Toast Notifications con Retry
- **Descripción**: Implementación de una capa de UI (Overlay) en el webview para feedback no obstructivo.
- **Funcionalidad**: Requiere un sistema de colas en el estado de Lit para mostrar múltiples mensajes. El botón de "Retry" debe reenviar el último mensaje (`ChatMessage`) almacenado en el estado del controlador de Lit.

---

## 4. APIs y Contratos Relevantes

### 4.1 Mensajería Chat (Actualizado)
```typescript
// Mensaje de Sincronización de Estado (Extension -> Webview)
export type StateUpdateMessage = {
  type: 'chat:state-update';
  models: ModelConfig[];      // Nuevo: Lista completa para el dropdown
  activeModelId?: string;
  environment: 'dev' | 'pro';
};

// Mensaje de Propuesta de Modelo (Extension -> Webview)
export type ModelProposalMessage = {
  type: 'chat:model-proposal';
  suggestedModelId: string;
  reason: string;
  taskId: string;
};
```

### 4.2 API de Backend (ModelAdvisor)
```typescript
interface ModelAdvisor {
  getBestModel(agentId: string, taskComplexity: 'low' | 'high'): string;
  isModelOptimal(currentModel: string, suggestedModel: string): boolean;
}
```

---

## 5. Matriz de Compatibilidad y Entorno
| Componente | Soporte | Notas |
|------------|---------|-------|
| Webview Toolkit | Browser (VS Code) | Requiere `esbuild` para bundle de dependencias. |
| ModelAdvisor | Node.js (Fastify) | Ejecución en el Sidecar Backend. |
| Persistence | SQLite / FS | Debe ser accesible por el Sidecar de Fastify. |

---

## 6. Riesgos Críticos Documentados
- **Riesgo**: Fatiga de decisión del usuario. Si el sistema propone cambios de modelo para cada mensaje pequeño, la UX se degrada.
- **Severidad**: Media.
- **Evidencia**: Basado en patrones observados en sistemas multi-agente donde los handoffs son frecuentes.
- **Riesgo**: Inconsistencia de estado. El usuario cambia el modelo en el dropdown mientras una propuesta del sistema está pendiente.
- **Severidad**: Alta.

---

## 7. Fuentes oficiales y bibliografía
1. [Webview UI Toolkit Dropdown Docs](https://github.com/microsoft/vscode-webview-ui-toolkit/tree/main/src/dropdown)
2. [Lit Context & State Management](https://lit.dev/docs/data/reactivity/)
3. [SDK OpenAI Agents Interruption API](https://github.com/openai/openai-agents-python/blob/main/docs/human-in-the-loop.md) (Conceptualmente similar en TS).

---

## 8. Aprobación del desarrollador (OBLIGATORIA)
```yaml
approval:
  developer:
    decision: SI
    date: 2026-02-10T09:27:22+01:00
    comments: Aprobado investigación técnica para dropdown y orquestación dinámica.
```
