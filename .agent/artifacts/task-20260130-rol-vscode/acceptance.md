# Acceptance Criteria — task-20260130-rol-vscode-Crear rol especifico para extensiones VS Code

## Identificacion del agente (OBLIGATORIA)
Primera linea del documento:
`<icono> **<nombre-agente>**: <mensaje>`

🏛️ **architect-agent**: Acceptance criteria definidos para rol VS Code.

## 1. Definicion Consolidada
Definir un rol operativo especifico para extensiones de VS Code (vscode-specialist), con alcance total sobre la extension, limites estrictos de archivos permitidos, y una constitution obligatoria basada en la documentacion oficial de VS Code (extension guides y API).

## 2. Respuestas a Preguntas de Clarificacion
> Esta seccion documenta las respuestas del desarrollador a las 5 preguntas formuladas por el architect-agent.

| # | Pregunta (formulada por architect) | Respuesta (del desarrollador) |
|---|-----------------------------------|-------------------------------|
| 1 | Nombre exacto del rol e icono/prefijo obligatorio. | "vscode-specialist" y buscar un icono de VS Code. |
| 2 | Alcance operativo del rol. | Todo lo relacionado con extension de VS Code. |
| 3 | Limites de autoridad (archivos que puede tocar). | Solo podra tocar los ficheros que conforman la extension de VS Code. |
| 4 | Entregables/artefactos esperados. | Archivos en `src/extension` y distribucion en `dist/extension`, y cambios en `package.json` relacionados con la extension. |
| 5 | Constitution de VS Code (obligatoria u opcional) y temas clave. | Obligatoria; basada en links oficiales de extension guides y API de VS Code. |

---

## 3. Criterios de Aceptacion Verificables
> Listado de criterios derivados de las respuestas anteriores que deben ser verificados en la Fase 5.

1. Alcance:
   - El rol cubre todo el ciclo de la extension de VS Code (implementacion, configuracion y distribucion ligada a la extension).

2. Entradas / Datos:
   - Documentacion oficial de VS Code (extension guides y API) como fuente normativa.

3. Salidas / Resultado esperado:
   - Nuevo rol definido con prefijo obligatorio y limites de autoridad.
   - Constitution VS Code obligatoria creada y referenciada.
   - Restricciones de archivos permitidos declaradas para el rol.

4. Restricciones:
   - El rol solo puede modificar archivos propios de la extension (p. ej. `src/extension/**`, `dist/extension/**`, y campos de `package.json` relacionados con la extension).

5. Criterio de aceptacion (Done):
   - El rol y la constitution se incorporan a los indices de reglas, y las reglas explicitan limites, entregables y fuentes oficiales.

---

## Aprobacion (Gate 0)
Este documento constituye el contrato de la tarea. Su aprobacion es bloqueante para pasar a Phase 1.

```yaml
approval:
  developer:
    decision: SI # SI | NO
    date: 2026-01-30T14:42:29Z
    comments: null
```

---

## Historial de validaciones (Phase 0)
```yaml
history:
  - phase: "phase-0-acceptance-criteria"
    action: "completed"
    validated_by: "architect-agent"
    timestamp: "2026-01-30T14:26:26Z"
    notes: "Acceptance criteria definidos"
```
