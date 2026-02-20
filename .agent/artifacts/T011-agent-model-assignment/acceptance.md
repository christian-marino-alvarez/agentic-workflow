🏛️ **architect-agent**: Criterios de aceptación definidos para T011.

# Acceptance Criteria — T011: Agent Model Assignment

## 1. Definición Consolidada

Asignar un modelo LLM específico (provider + modelId) a cada agente definido en `.agent/rules/roles/*.md`. Las capabilities del modelo se auto-detectan y se pueden activar/desactivar manualmente, persistiendo en el YAML del markdown del rol. En Chat, los agentes sin modelo verificado quedan desactivados.

## 2. Respuestas a las 5 Preguntas

| # | Pregunta | Respuesta |
|---|----------|-----------|
| 1 | Persistencia de modelo | Ambas: en YAML frontmatter del markdown Y en VS Code settings |
| 2 | Capabilities | Auto-inferidas del modelo seleccionado, toggleables manualmente |
| 3 | Dropdown de modelos | Dinámico desde API del provider (si lo soporta) |
| 4 | Selector de agente en Chat | Dropdown actual + capability labels al lado (responsive: debajo si no cabe) |
| 5 | Agente sin modelo | Aparece desactivado, no se pueden enviar mensajes |

## 3. Criterios de Aceptación Verificables

1. **Scope**: Settings View/Background, Chat View/Background, Role Markdowns, LLM Backend
2. **Inputs**: Role markdowns existentes, providers registrados con API keys, modelos descubiertos
3. **Outputs**:
   - Settings: 2 dropdowns por agente (provider, modelo) con capabilities toggleables
   - Chat: Agente seleccionado usa su modelo asignado; desactivado si no tiene modelo verificado
   - Markdowns: YAML actualizado con `model` y `capabilities`
4. **Constraints**: No breaking changes en flujo existente. Responsive UI.
5. **Done**: Un agente con modelo asignado en Settings puede interactuar en Chat. Sin modelo = desactivado.

---

```yaml
approval:
  developer:
    decision: null
    date: null
    comments: null
```
