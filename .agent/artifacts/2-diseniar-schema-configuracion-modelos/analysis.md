---
artifact: analysis
phase: phase-2-analysis
owner: architect-agent
status: approved
related_task: 2-diseniar-schema-configuracion-modelos
---

# Analysis — 2-diseniar-schema-configuracion-modelos

🏛️ **architect-agent**: Análisis técnico para la implementación del schema de modelos y multi-provider support.

## 1. Resumen ejecutivo
**Problema**
El sistema actual es monolítico respecto a OpenAI. Necesitamos una estructura de datos flexible que permita configurar múltiples proveedores de LLM, gestionar sus secretos de forma segura y habilitar la interoperabilidad (ej: Agente OpenAI delegando tareas a Gemini).

**Objetivo**
Diseñar un schema Zod polimórfico, persistencia en VS Code Settings (con secretos en SecretStorage) y un patrón de "Delegation Tool" para inter-provider communication.

**Criterio de éxito**
- Schema Zod capaz de validar configuraciones de OpenAI, Gemini y Custom.
- Plan claro de integración con el módulo `Setup` actual.
- Diseño de la herramienta de delegación que permita a Neo (OpenAI) llamar a Gemini.

---

## 2. Estado del proyecto (As-Is)
- **Estructura relevante**
  - `src/extension/modules/setup/`: Contiene el controlador y constantes de configuración.
  - `src/extension/modules/agent-poc/`: Implementación actual basada estrictamente en el SDK de OpenAI.
- **Componentes existentes**
  - `SetupController`: Gestiona la visibilidad de vistas de setup pero no tiene lógica de persistencia de modelos compleja aún.
  - `AgentPoc`: Hardcoded con OpenAI.
- **Nucleo / capas base**
  - `SecretStorage`: Ya se usa para la OpenAI Key en `openai-key-command.ts`.
- **Limitaciones detectadas**
  - Falta un registro centralizado de modelos disponibles.
  - El sistema de agentes no conoce el concepto de "proveedor de modelo" fuera de OpenAI nativo.

---

## 3. Cobertura de Acceptance Criteria

### AC-1: Soporte OpenAI y Google Gemini
- **Interpretación**: El schema debe diferenciar los requisitos de configuración de cada uno (ej: Gemini usa `apiKey` pero con estructura de endpoint distinta).
- **Verificación**: Definición de `z.discriminatedUnion('provider', [...])`.
- **Riesgos**: Diferencias en los nombres de los modelos (ej: `gpt-4o` vs `gemini-1.5-pro`).

### AC-2: Integración con SecretStorage
- **Interpretación**: El schema persistente en JSON solo guarda el ID del secreto, no el valor.
- **Verificación**: Campo `secretKey: string` que mapea a una clave en `context.secrets`.
- **Riesgos**: Desincronización si se borra el secreto manualmente.

### AC-3: Parámetros Configurables
- **Interpretación**: `temperature`, `max_tokens`, etc., deben ser parte del objeto de configuración.
- **Verificación**: Objeto `parameters` en el schema Zod con valores por defecto.

### AC-4: Apartado Custom Endpoints
- **Interpretación**: La UI de setup debe permitir introducir URLs base personalizadas para proveedores `custom` u ON-PREM.
- **Verificación**: Campo `baseUrl` obligatorio si el provider es `custom`.

---

## 4. Research técnico
Basado en `researcher/research.md`:

- **Alternativa A: Zod Discriminated Unions (Recomendada)**
  - **Descripción**: Usar un campo `provider` como discriminante para validar campos específicos (ej: OpenAI no necesita `baseUrl` pero Custom sí).
  - **Ventajas**: Type-safety perfecto, validación estricta, fácil expansión.
- **Alternativa B: Schema Genérico con campos opcionales**
  - **Inconvenientes**: Validación débil, riesgo de campos faltantes para proveedores específicos.

**Decisión recomendada**: **Alternativa A**. Es el patrón más robusto para configuraciones polimórficas en TypeScript.

---

## 5. Agentes participantes

- **architect-agent**
  - Responsabilidades: Definir el archivo de tipos y esquemas final. Validar la integración con el flujo de agentes.
- **implementation-agent (Neo)**
  - Responsabilidades: Implementar los cambios en el `SetupController` y añadir los esquemas Zod. Crear el manual de uso del nuevo schema.

**Handoffs**
- El Architect entrega el `analysis.md` y `plan.md`. El Implementation Agent ejecuta y el QA verifica.

**Componentes necesarios**
- **NUEVO**: `src/extension/providers/`: Directorio raíz para proveedores.
- **NUEVO**: `src/extension/providers/{provider}/schema.ts`: Esquemas específicos por proveedor.
- **MODIFICAR**: `src/extension/modules/setup/types.d.ts` (Nuevos tipos).
- **NUEVO**: `src/extension/providers/gemini/tool.ts` (Herramienta de delegación específica).

**Demo**
- Se requiere una demo donde el Agente de OpenAI llama a una tool que internamente consulta a Gemini para una tarea específica (ej: "Optimiza este código usando Gemini").

---

## 6. Impacto de la tarea
- **Arquitectura**: Introduce el patrón de adaptador para modelos LLM.
- **APIs / contratos**: Cambia la forma en que el `Agent` instancian sus modelos.
- **Compatibilidad**: Debe ser compatible con la configuración actual de API Key de OpenAI para no romper el POC.

---

## 7. Riesgos y mitigaciones
- **Riesgo 1: Complejidad de la UI**
  - Mitigación: Diseñar componentes Lit atómicos para cada tipo de proveedor en la fase de implementación.
- **Riesgo 2: Quotas/Costes**
  - Mitigación: Implementar validación de parámetros (max tokens) en el schema.

---

## 9. TODO Backlog (Consulta obligatoria)
**Referencia**: `.agent/todo/`
**Estado actual**: 0 items relevantes identificados.

---

## 10. Aprobación
Este análisis **requiere aprobación explícita del desarrollador**.

```yaml
approval:
  developer:
    decision: SI
    date: 2026-02-06T13:45:00Z
    comments: "Aprobado para proceder al planning."
```
