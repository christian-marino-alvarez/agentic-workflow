---
artifact: research
phase: phase-1-research
owner: researcher-agent
status: approved
related_task: 2-diseniar-schema-configuracion-modelos
---

# Research Report — 2-diseniar-schema-configuracion-modelos

## Identificacion del agente (OBLIGATORIA)
🔬 **researcher-agent**: Investigación técnica sobre esquemas de configuración y adaptadores de proveedores LLM.

> [!CAUTION]
> **REGLA PERMANENT**: Este documento es SOLO documentación. No contiene análisis ni recomendaciones de implementación.

## 1. Resumen ejecutivo
- **Problema investigado**: Estructura de datos para configuración de múltiples proveedores LLM (OpenAI, Gemini, Custom) y su validación mediante Zod.
- **Objetivo de la investigacion**: Documentar requisitos del SDK de OpenAI y Gemini, persistencia segura en VS Code y patrones de validación dinámica.
- **Principales hallazgos**: 
  - Zod soporta `discriminatedUnion` para esquemas polimórficos de proveedores.
  - `SecretStorage` es el estándar en VS Code para API Keys (confirmado uso en `extension.ts`).
  - Google Gemini ofrece una API compatible con OpenAI para Chat Completions, facilitando la integración delegada.

---

## 2. Necesidades detectadas
- **Requisitos tecnicos**:
  - Validación en tiempo de ejecución de configuraciones persistidas.
  - Soporte para parámetros opcionales (`temperature`, `top_p`, `max_tokens`).
  - Identificadores únicos por configuración para el dropdown de la UI.
- **Suposiciones y limites**:
  - Se asume que la versión de `zod` instalada es compatible con el sistema de tipos de la extensión.
  - La integración Gemini-OpenAI depende de la compatibilidad del endpoint de Google.

---

## 3. Hallazgos técnicos
### Zod Discriminated Unions
- **Concepto**: Permite validar objetos basados en un campo común (ej: `provider`).
- **Estado**: Estable.
- **Documentación oficial**: [Zod - Discriminated Unions](https://zod.dev/?id=discriminated-unions)
- **Limitaciones**: Requiere que el campo discriminante sea una cadena literal o número.

### VS Code SecretStorage
- **Concepto**: API para almacenamiento seguro de credenciales.
- **Estado**: Estable (VS Code 1.53+).
- **Documentación oficial**: [VS Code Extension API - SecretStorage](https://code.visualstudio.com/api/references/vscode-api#SecretStorage)
- **Limitaciones**: Solo soporta strings. No persistente entre instalaciones si el usuario no tiene sincronización de settings activa.

### Google Gemini OpenAI Compatibility
- **Concepto**: Capacidad de Gemini para responder a peticiones con formato OpenAI Chat Completions.
- **Estado**: Beta/Estable (dependiendo de la región y modelo).
- **Documentación oficial**: [Google AI Studio - OpenAI Compatibility](https://ai.google.dev/gemini-api/docs/openai)
- **Limitaciones**: Soporte limitado de herramientas (tool calling) en ciertos endpoints de compatibilidad.

---

## 4. APIs relevantes
- **OpenAI Node SDK**: Estándar para interactuar con GPT y modelos compatibles.
- **Google Generative AI SDK**: Alternativa nativa para Gemini.
- **VS Code Configuration API**: Para persistencia no sensible (ids de modelos, nombres).

---

## 5. Compatibilidad multi-browser
*N/A para este backend de extensión; el soporte depende del entorno Node.js del Extension Host.*

---

## 6. Oportunidades AI-first detectadas
- **Generación dinámica de schemas**: Zod permite generar esquemas basados en metadatos de proveedores.
- **Handoffs Automatizados**: El SDK de OpenAI permite delegar tareas a otros agentes ("hands").

---

## 7. Riesgos identificados
- **Riesgo 1**: Incompatibilidad de tipos entre el SDK de OpenAI y la respuesta de Gemini.
  - Severidad: Media.
- **Riesgo 2**: Fuga de secretos si el schema de configuración persistente accidentalmente incluye API Keys.
  - Severidad: Alta.
- **Riesgo 3**: Versiones incompatibles de `zod` si se importan desde diferentes módulos.
  - Severidad: Baja.

---

## 8. Fuentes
- [Zod Official Documentation](https://zod.dev/)
- [VS Code API Reference](https://code.visualstudio.com/api/references/vscode-api)
- [Google Gemini API Documentation](https://ai.google.dev/docs)

---

## 9. Aprobacion del desarrollador (OBLIGATORIA)
```yaml
approval:
  developer:
    decision: SI
    date: 2026-02-06T13:35:00Z
    comments: "Research report generated according to requirements."
```
