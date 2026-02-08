---
artifact: plan
phase: phase-3-planning
owner: architect-agent
status: approved
related_task: 2-diseniar-schema-configuracion-modelos
---

# Implementation Plan — 2-diseniar-schema-configuracion-modelos

## Identificacion del agente (OBLIGATORIA)
🏛️ **architect-agent**: Plan de implementación detallado para el schema multi-proveedor y herramienta de delegación.

## 1. Resumen del plan
- **Contexto**: El proyecto necesita un sistema de configuración flexible que soporte OpenAI y Gemini, separando la configuración pública de los secretos (API Keys).
- **Resultado esperado**: 
  - Archivo `schemas.ts` con validación Zod para modelos.
  - Tipos actualizados en `types.d.ts`.
  - Herramienta `delegate-gemini.ts` en el POC que permita llamadas inter-provider.
- **Alcance**: Diseño y validación del schema en el backend de la extensión. No incluye la UI final de configuración (solo el modelo de datos).

## 2. Inputs contractuales
- **Task**: `.agent/artifacts/2-diseniar-schema-configuracion-modelos/task.md`
- **Analysis**: `.agent/artifacts/2-diseniar-schema-configuracion-modelos/analysis.md`
- **Acceptance Criteria**: AC-1 (OpenAI/Gemini), AC-2 (SecretStorage), AC-3 (Parameters), AC-4 (Custom Endpoints), AC-5 (Metadata).

---

## 3. Desglose de implementación (pasos)

### Paso 1: Definición de Tipos y Esquemas (Modular)
- **Descripción**: Crear la estructura de directorios en `src/extension/providers` y definir los esquemas por proveedor.
- **Dependencias**: Ninguna.
- **Entregables**: 
  - `src/extension/providers/openai/schema.ts`
  - `src/extension/providers/gemini/schema.ts`
  - `src/extension/providers/index.ts`
  - `src/extension/modules/setup/types.d.ts` (actualizado)
- **Agente responsable**: implementation-agent.

### Paso 2: Helper de Gestión de Secretos
- **Descripción**: Implementar un helper que valide que un ID de modelo tiene su correspondiente clave en SecretStorage.
- **Dependencias**: Paso 1.
- **Entregables**: `src/extension/modules/setup/secret-helper.ts`.
- **Agente responsable**: implementation-agent.

### Paso 3: Herramienta de Delegación (Gemini Provider)
- **Descripción**: Crear una tool para el OpenAI Agent que permita realizar una consulta a Gemini usando el nuevo schema. Esta herramienta reside en el dominio del proveedor Gemini.
- **Dependencias**: Paso 2.
- **Entregables**: `src/extension/providers/gemini/tool.ts`.
- **Agente responsable**: implementation-agent.

---

## 4. Asignación de responsabilidades (Agentes)

- **Architect-Agent**
  - Supervisión de la coherencia del schema.
  - Validación del Gate de Phase 4.
- **Implementation-Agent (Neo)**
  - Escritura de código (types, schemas, helpers).
  - Implementación de la tool de delegación en el POC.

---

## 5. Estrategia de testing y validación

- **Unit tests**
  - Validar el schema Zod con payloads válidos e inválidos (OpenAI sin key, Gemini con keyIdentifier, Custom sin baseUrl).
- **Manual / Integration**
  - Ejecutar el POC y verificar que el Agente OpenAI puede activar la herramienta "delegate-gemini" y recibir una respuesta válida de Gemini (usando una API Key real en el entorno del dev).

---

## 6. Plan de demo
- **Objetivo**: Demostrar la interoperabilidad multi-proveedor.
- **Escenario**: Preguntar al Agente OpenAI (Neo): "Pide a Gemini que resuma el archivo actual".
- **Éxito**: El log muestra el handoff a Gemini y el resumen retornado.

---

## 7. Estimaciones y pesos de implementación
- **Bloque Schema/Types**: Bajo (2 sesiones).
- **Bloque Secret Integration**: Medio (1 sesión).
- **Bloque Delegation Tool**: Medio (2 sesiones).

---

## 8. Puntos críticos y resolución

- **Manejo de Secretos**
  - Riesgo: Que el esquema Zod intente validar el secreto directamente.
  - Resolución: El schema solo valida el `secretKeyId` (string). La recuperación del valor es responsabilidad del helper.

---

## 11. Aprobación del desarrollador (OBLIGATORIA)
Este plan requiere aprobación explícita y binaria.

```yaml
approval:
  developer:
    decision: SI
    date: 2026-02-06T13:50:00Z
    comments: "Plan aprobado."
```
