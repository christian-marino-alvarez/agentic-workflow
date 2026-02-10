# Acceptance Criteria — 6-model-dropdown-component

## Identificacion del agente (OBLIGATORIA)
🏛️ **architect-agent**: Definición de criterios de aceptación para el selector de modelos con soporte para asignación dinámica por tarea.

## 1. Definición Consolidada
Implementación de un componente UI en Lit (reutilizando `@vscode/webview-ui-toolkit`) para la gestión de modelos en el Chat. El sistema permitirá seleccionar un modelo base para el chat, pero habilitará una lógica de orquestación donde el sistema podrá proponer un modelo específico (más eficiente/ligero) para tareas granulares. El usuario recibirá una notificación de cambio de modelo por tarea y deberá aceptarla; en caso contrario, se mantendrá el modelo seleccionado por el usuario. El acceso está restringido a usuarios con modelos configurados y activos en Security.

## 2. Respuestas a Preguntas de Clarificación
> Esta sección documenta las respuestas del desarrollador a las 5 preguntas formuladas por el architect-agent.

| # | Pregunta (formulada por architect) | Respuesta (del desarrollador) |
|---|-----------------------------------|-------------------------------|
| 1 | Sincronización de Selección: ¿Es local para el chat o global? | Local para el chat. Para el caso general/orquestación se usará un modelo más ligero (flash). Además, el sistema podrá proponer modelos específicos por tarea que el usuario deberá aceptar. |
| 2 | Visualización de Proveedores: ¿Lista plana o agrupada? | Lista plana con nombres que ya incluyen la compañía/proveedor. |
| 3 | Comportamiento ante Error: ¿Cómo reacciona la UI si falla el cambio? | Mostrar un error tipo toast que permita reintentar (retry). |
| 4 | Estado "Sin Modelos": ¿Acceso permitido sin configuración? | No. Nunca se podrá acceder al chat si en Security no se ha registrado y activado previamente un modelo. |
| 5 | Detalles Técnicos: ¿Implementación personalizada o reutilizar VS Code? | Reutilizar componentes de VS Code (congruente con la estética nativa). |

---

## 3. Criterios de Aceptación Verificables
> Listado de criterios derivados de las respuestas anteriores que deben ser verificados en la Fase 5.

1. Alcance:
   - Integración de `<vscode-dropdown>` y `<vscode-option>` en la cabecera del ChatView.
   - Lógica de "Propuesta de Modelo por Tarea": Al delegar una tarea a un agente, el sistema debe ser capaz de sugerir un modelo optimizado.
   - Dialog/Notification de consentimiento: El usuario debe poder Aceptar/Rechazar la propuesta de modelo para una tarea específica.

2. Entradas / Datos:
   - Carga dinámica de la lista de modelos desde `SettingsStorage`.
   - El dropdown muestra el nombre descriptivo (ej: "OpenAI: GPT-4o").
   - El estado del modelo seleccionado se mantiene durante la sesión del Webview.

3. Salidas / Resultado esperado:
   - El mensaje enviado al backend incluye el `modelId` (vía `inference_options` o parámetro directo).
   - Mensaje visual claro cuando se está usando un modelo propuesto vs el seleccionado por el usuario.

4. Restricciones:
   - Bloqueo de entrada al ChatView si `activeModelId` es nulo en el estado global.
   - Los errores de comunicación/persistencia lanzan una notificación de error con botón de reintento.

5. Criterio de aceptación (Done):
   - El usuario puede cambiar el modelo manualmente.
   - El sistema propone un modelo ligero para una tarea simple de prueba, el usuario acepta, y el backend recibe la instrucción con el modelo ligero.
   - Si el usuario rechaza, el backend recibe la instrucción con el modelo manual inicial.

---

## Aprobación (Gate 0)
Este documento constituye el contrato de la tarea. Su aprobación es bloqueante para pasar a Phase 1.

```yaml
approval:
  developer:
    decision: SI
    date: 2026-02-10T09:24:09Z
    comments: Aprobado el contrato con el flujo de modelos dinámicos por tarea.
```

---

## Historial de validaciones (Phase 0)
```yaml
history:
  - phase: "phase-0-acceptance-criteria"
    action: "completed"
    validated_by: "architect-agent"
    timestamp: "2026-02-10T09:25:00Z"
    notes: "Acceptance criteria definidos con lógica de propuesta dinámica de modelos por tarea."
```
