---
artifact: brief
phase: short-phase-1-brief
owner: architect-agent
status: approved
related_task: task-20260130-rol-vscode-Crear rol especifico para extensiones VS Code
---

# Brief — task-20260130-rol-vscode-Crear rol especifico para extensiones VS Code

## Identificacion del agente (OBLIGATORIA)
Primera linea del documento:
`<icono> **<nombre-agente>**: <mensaje>`

🏛️ **architect-agent**: Brief listo para rol VS Code.

## 1. Identificacion de la tarea

**Titulo**: Crear rol especifico para extensiones VS Code
**Objetivo**: Definir un rol operativo claro y una constitution obligatoria para VS Code, basada en documentacion oficial.
**Estrategia**: Short

---

## 2. Las 5 Preguntas Obligatorias

| # | Pregunta (formulada por architect) | Respuesta (del desarrollador) |
|---|-----------------------------------|-------------------------------|
| 1 | Nombre exacto del rol e icono/prefijo obligatorio. | "vscode-specialist" y buscar un icono de VS Code. |
| 2 | Alcance operativo del rol. | Todo lo relacionado con extension de VS Code. |
| 3 | Limites de autoridad (archivos que puede tocar). | Solo podra tocar los ficheros que conforman la extension de VS Code. |
| 4 | Entregables/artefactos esperados. | Archivos en `src/extension` y distribucion en `dist/extension`, y cambios en `package.json` relacionados con la extension. |
| 5 | Constitution de VS Code (obligatoria u opcional) y temas clave. | Obligatoria; basada en links oficiales de extension guides y API de VS Code. |

---

## 3. Acceptance Criteria

Derivados de las respuestas anteriores:

1. **Alcance**: Rol cubre todo lo relacionado con extension de VS Code.
2. **Entradas/Datos**: Documentacion oficial de VS Code (extension guides y API).
3. **Salidas esperadas**: Rol nuevo, constitution VS Code obligatoria, limites de archivos permitidos, y cambios documentados.
4. **Restricciones**: Solo modificar archivos de la extension (`src/extension/**`, `dist/extension/**`, y campos de `package.json` relacionados con la extension).
5. **Criterio de Done**: Rol y constitution creados e indexados en reglas; limites y entregables definidos.

---

## 4. Analisis simplificado

### Estado actual (As-Is)
- Estructura afectada: reglas y roles en `.agent/rules/roles`, constitucion en `.agent/rules/constitution`, indices correspondientes.
- Limitaciones conocidas: el uso de icono VS Code debe seguir guias oficiales de marca.

### Evaluacion de complejidad

| Indicador | Estado | Comentario |
|-----------|--------|------------|
| Afecta mas de 3 paquetes | ☐ Si ☒ No | Cambios concentrados en reglas y indices. |
| Requiere investigacion APIs | ☒ Si ☐ No | Debe basarse en la documentacion oficial de VS Code. |
| Cambios breaking | ☒ Si ☐ No | Agrega nuevo rol/constitution; afecta proceso y autoridad. |
| Tests E2E complejos | ☐ Si ☒ No | No aplica. |

**Resultado de complejidad**: ☒ ALTA (recomendar abortar a Long)

---

## 5. Plan de implementacion

### Pasos ordenados

1. **Paso 1**
   - Descripcion: Analizar documentacion oficial (extension guides y API) y extraer reglas clave para VS Code.
   - Entregables: resumen de reglas y fuentes citadas.

2. **Paso 2**
   - Descripcion: Definir nuevo rol `vscode-specialist` con prefijo y limites de autoridad.
   - Entregables: archivo de rol y actualizacion del indice de roles.

3. **Paso 3**
   - Descripcion: Crear constitution VS Code obligatoria y actualizar el indice de constitucion.
   - Entregables: regla de constitution y referencias en indices.

4. **Paso 4**
   - Descripcion: Actualizar reglas de autoridad si aplica (solo architect-agent).
   - Entregables: reglas consistentes y sin conflictos.

### Verificacion prevista
- Tipo de tests: verificacion manual de reglas e indices.
- Criterios de exito: rol y constitution presentes, indexados y coherentes con fuentes oficiales.

---

## 6. Aprobacion del desarrollador (OBLIGATORIA)

```yaml
approval:
  developer:
    decision: SI
    date: 2026-01-30T14:42:29Z
    comments: null
```

> Sin aprobacion, esta fase NO puede avanzar a Implementation.
