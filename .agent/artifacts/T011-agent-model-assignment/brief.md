---
artifact: brief
phase: short-phase-1-brief
owner: architect-agent
status: approved
related_task: T011-agent-model-assignment
---

🏛️ **architect-agent**: Brief completo para T011.

# Brief — T011: Agent Model Assignment + Chat UI

## 1. Identificación

**Título**: Asignación de modelo por agente + reestructuración Chat UI
**Objetivo**: Provider+modelo específico por agente, capabilities toggleables, Chat UI reestructurada
**Estrategia**: Short

---

## 2. Las 5 Preguntas

| # | Pregunta | Respuesta |
|---|----------|-----------|
| 1 | Persistencia de modelo en markdown vs settings | Ambas: YAML frontmatter + VS Code settings |
| 2 | Capabilities disponibles | Auto-inferidas del modelo, toggleables manualmente |
| 3 | Dropdown de modelos dinámico | Sí, dinámico desde API del provider |
| 4 | Selector de agente en Chat UI | Dropdown + capability labels al lado (responsive) |
| 5 | Agente sin modelo asignado | Desactivado, no puede enviar mensajes |

---

## 3. Criterios de Aceptación

1. **Scope**: Settings (View+Background), Chat (View+Background), Role Markdowns, LLM Backend
2. **Inputs**: Roles `.agent/rules/roles/*.md`, providers con API keys, modelos descubiertos
3. **Outputs**: Dropdowns en Settings, capabilities en Chat, markdowns actualizados
4. **Constraints**: No breaking changes, UI responsive
5. **Done**: Agente con modelo → puede chatear. Sin modelo verificado → desactivado

---

## 4. Análisis Simplificado

### Estado Actual (As-Is)
- **Settings**: Ya tiene CRUD de modelos, `handleGetRoles()` descubre roles, `loadBindings()` mapea role→modelId
- **Chat**: Tiene selector de agente (dropdown), `selectedAgent` se envía con el mensaje
- **Role markdowns**: Tienen YAML frontmatter con `capabilities` (skills, tools) pero NO `model`
- **LLM Backend**: `discoverAvailableModels()` ya obtiene modelos de Gemini/OpenAI/Claude APIs

### Complejidad

| Indicador | Estado | Comentario |
|-----------|--------|------------|
| Afecta +3 módulos | ☑ Sí | Settings, Chat, Roles, LLM |
| Requiere investigación API | ☐ No | APIs ya integradas |
| Breaking changes | ☐ No | Extensión del schema YAML existente |
| Tests E2E complejos | ☐ No | Unit tests suficientes |

**Resultado**: **MEDIA** — Continuar con Short. La infraestructura base ya existe (bindings, role discovery, model discovery). Es mayormente extensión y refactor de UI.

---

## 5. Plan de Implementación

### Step 1: Extender YAML de Role Markdowns
- Añadir schema `model: { provider, id }` y `capabilities: { vision, tooling, streaming, code_execution }` al frontmatter
- Modificar `handleGetRoles()` para leer y devolver estos campos
- Crear `handleSaveRoleConfig()` para escribir cambios al YAML
- **Entregables**: `settings/background/index.ts` actualizado

### Step 2: Settings View — Sección Agent-Model Assignment
- Por cada agente: dropdown provider (obtenido de modelos registrados) + dropdown modelo (dinámico)
- Capability toggles (auto-inferidos al seleccionar modelo, manualmente editables)
- Guardar al cambiar → actualiza binding (VS Code settings) + markdown (YAML)
- **Entregables**: `settings/view/templates/html.ts`, `settings/view/index.ts`

### Step 3: Chat View — Reestructuración UI
- Mover workflow/tarea al header top
- Mover selector de agente encima del input (bottom)
- Añadir capability labels al lado del dropdown (responsive: debajo si no cabe)
- Deshabilitar agentes sin modelo verificado
- **Entregables**: `chat/view/templates/html.ts`, `chat/view/templates/css.ts`, `chat/view/index.ts`

### Step 4: Chat Background — Resolución de Modelo por Agente
- Al enviar mensaje, resolver el modelo asignado al agente seleccionado
- Si no hay modelo verificado → bloquear envío
- Pasar `modelId` y `provider` al payload del sidecar
- **Entregables**: `chat/background/index.ts`

### Step 5: Verificación
- Compilación limpia (`npm run compile`)
- Unit tests para `handleGetRoles` extendido y `handleSaveRoleConfig`
- Test manual: Settings → asignar modelo a agente → Chat usa ese modelo

### Verificación Planificada
- **Tipo**: Unit + Manual
- **Criterio de éxito**: Agente con modelo asignado puede chatear; sin modelo = desactivado

---

## 6. Aprobación del Desarrollador (OBLIGATORIA)

```yaml
approval:
  developer:
    decision: SI
    date: 2026-02-20T08:46:17Z
    comments: null
```

> Sin aprobación, esta fase NO puede avanzar a Implementación.
