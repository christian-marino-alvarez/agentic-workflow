---
artifact: acceptance
phase: short-phase-1-brief
owner: architect-agent
status: pending
related_task: 2-diseniar-schema-configuracion-modelos
---

# Acceptance Criteria — 2-diseniar-schema-configuracion-modelos

🏛️ **architect-agent**: Definición de criterios de aceptación para el diseño del schema de configuración.

## 1. Definición Consolidada
Diseñar un schema de validación compatible con Zod para la configuración de modelos LLM. El sistema debe permitir la gestión de múltiples proveedores (OpenAI y Google Gemini inicialmente), extrayendo secretos de SecretStorage y permitiendo la personalización de endpoints y parámetros de inferencia.

## 2. Respuestas a Preguntas de Clarificación
> Esta sección documenta las respuestas del desarrollador a las 5 preguntas formuladas por el architect-agent.

| # | Pregunta (formulada por architect) | Respuesta (del desarrollador) |
|---|-----------------------------------|-------------------------------|
| 1 | Proveedores adicionales: ¿Google Gemini? | Sí, soportar OpenAI y Google Gemini desde el inicio. |
| 2 | Localización de API Keys: ¿SecretStorage? | Confirmado que SecretStorage ya se está utilizando. |
| 3 | Parámetros: ¿Temperature/maxTokens? | Sí, configurables ya que se recibirán de la UI. |
| 4 | Custom Endpoints: ¿Sección en setup? | Sí, crear apartado de configuración para estos en la vista setup. |
| 5 | Metadatos: ¿Iconos/Descripciones? | Sí, añadirlos al schema. |

---

## 3. Criterios de Aceptación Verificables

1. Alcance:
   - Definición de tipos TypeScript y esquemas Zod en `src/extension/modules/setup/types.d.ts` o similar.
   - Soporte explícito para tipos de proveedor: `openai`, `gemini`, `custom`.

2. Entradas / Datos:
   - Estructura de modelo: `id`, `name`, `provider`, `keyIdentifier` (para SecretStorage), `endpoint`, `parameters` (`temperature`, `maxTokens`).

3. Salidas / Resultado esperado:
   - Schema Zod que valide un array de configuraciones de modelos.
   - Un mecanismo (tool/helper) que permita a un Agente OpenAI llamar a un modelo Gemini como una "herramienta" o proveedor delegado.

4. Restricciones:
   - Las API Keys **NUNCA** deben guardarse en el schema de configuración persistente, solo su identificador.
   - El schema debe ser extensible para futuros proveedores sin romper compatibilidad.

5. Criterio de aceptación (Done):
   - Archivo de schema creado y exportado.
   - Código de validación testado (vía script de test pequeño o validación en controller).
   - Documentación técnica del schema en el código.

---

## Aprobación (Gate 0)
Este documento constituye el contrato de la tarea. Su aprobación es bloqueante para pasar a Phase 1.

```yaml
approval:
  developer:
    decision: SI
    date: 2026-02-06T13:30:00Z
    comments: "Aprobado según las respuestas dadas en el chat."
```

---

## Historial de validaciones (Phase 0)
```yaml
history:
  - phase: "phase-0-acceptance-criteria"
    action: "completed"
    validated_by: "architect-agent"
    timestamp: "2026-02-06T13:30:00Z"
    notes: "Acceptance criteria definidos"
```
