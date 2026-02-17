---
artifact: brief
phase: short-phase-1-brief
owner: architect-agent
status: draft
related_task: 4-copiar-estructura-agentic-cliente
---

# Brief — 4-copiar-estructura-agentic-cliente

🏛️ **architect-agent**: Elaborando brief con criterios y plan para copia completa de `.agent`.

## Identificacion del agente (OBLIGATORIA)
Primera linea del documento:
`<icono> **<nombre-agente>**: <mensaje>`

## 1. Identificacion de la tarea

**Titulo**: copiar-estructura-agentic-cliente
**Objetivo**: Asegurar que el instalador copia correctamente la estructura `.agent/` en el entorno del cliente y publicar una nueva version beta con ese cambio.
**Estrategia**: Short

---

## 2. Las 5 Preguntas Obligatorias

| # | Pregunta (formulada por architect) | Respuesta (del desarrollador) |
|---|-----------------------------------|-------------------------------|
| 1 | En que comando/flujo exacto ocurre la instalacion donde se debe copiar `.agent/` (CLI, script, npm postinstall, otro)? | Al instalar el paquete via npm y ejecutar el comando `init`. |
| 2 | Que estructura exacta debe copiarse a `.agent/` (todo el directorio `.agent` del repo o una subcarpeta especifica)? | Toda la estructura de `.agent`. |
| 3 | Donde esta hoy el bug o la falta de copia? Indica archivo(s) y comportamiento observado. | Se realizo el cambio para copiar toda la estructura de core a `.agent` y evitar depender de `node_modules`, pero actualmente no aparece el prompt de sistema. |
| 4 | Como validamos que la copia es correcta en un cliente limpio? (pasos de verificacion concretos) | Validacion guiada por el agente durante la prueba en cliente limpio (pasos a definir en la fase de implementacion). |
| 5 | La nueva beta requiere ademas versionado/changelog/tag especifico? Si si, que convencion seguimos? | Si, beta con conventional commits. |

---

## 3. Acceptance Criteria

Derivados de las respuestas anteriores:

1. **Alcance**: Copiar toda la estructura `.agent` en la instalacion npm + `init`.
2. **Entradas/Datos**: Instalacion limpia del paquete via npm y ejecucion de `init`.
3. **Salidas esperadas**: `.agent/` completo en cliente y prompt de sistema visible.
4. **Restricciones**: No depender de `node_modules` para el prompt y publicar beta con conventional commits.
5. **Criterio de Done**: Verificacion exitosa en entorno limpio y beta publicada.

---

## 4. Analisis simplificado

### Estado actual (As-Is)
- Estructura afectada: flujo de instalacion npm + `init` y copia de `.agent`.
- Limitaciones conocidas: el prompt de sistema no aparece en cliente pese al cambio de copia completa.

### Evaluacion de complejidad

| Indicador | Estado | Comentario |
|-----------|--------|------------|
| Afecta mas de 3 paquetes | ☐ Si ☑ No | Se espera tocar el flujo de instalacion/copia. |
| Requiere investigacion APIs | ☐ Si ☑ No | No se anticipan APIs externas. |
| Cambios breaking | ☐ Si ☑ No | No deberia alterar comportamiento publico. |
| Tests E2E complejos | ☐ Si ☑ No | Verificacion tipo smoke en entorno limpio. |

**Resultado de complejidad**: ☑ BAJA (continuar Short) ☐ ALTA (recomendar abortar a Long)

### Evaluacion de Agentes
- Arquitectura y requisitos: claros; falta detallar pasos exactos de verificacion en cliente limpio.

---

## 5. Plan de implementacion

### Pasos ordenados

1. **Paso 1**
   - Descripcion: localizar flujo de instalacion/`init` y confirmar la logica de copia completa de `.agent`.
   - Entregables: puntos de codigo identificados y comportamiento esperado.

2. **Paso 2**
   - Descripcion: ejecutar instalacion en entorno limpio con asistencia del agente y verificar que `.agent` se copia y aparece el prompt de sistema.
   - Entregables: pasos exactos de verificacion y resultados.

3. **Paso 3**
   - Descripcion: ajustar la copia si falta algo y preparar beta (changelog/versionado) siguiendo conventional commits.
   - Entregables: cambios listos y version beta preparada.

### Verificacion prevista
- Tipo de tests: smoke manual en entorno limpio.
- Criterios de exito: `.agent` completo y prompt de sistema visible tras `init`.

---

## 6. Aprobacion del desarrollador (OBLIGATORIA)

```yaml
approval:
  developer:
    decision: SI
    date: 2026-01-25T16:00:09Z
    comments: null
```

> Sin aprobacion, esta fase NO puede avanzar a Implementation.
