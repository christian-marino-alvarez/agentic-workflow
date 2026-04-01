---
artifact: brief
phase: short-phase-1-brief
owner: architect-agent
status: draft
related_task: task-20260128-reorganize-structure
---

# Brief — task-20260128-reorganize-structure

## Identificacion del agente (OBLIGATORIA)
🏛️ **architect-agent**: Planificación de la reorganización de estructura del sistema y copias de seguridad.

## 1. Identificación de la tarea

**Título**: Reorganización de estructura
**Objetivo**: Mover el sistema de markdowns a `src/agentic-system-structure` y backups a `/.backups`.
**Estrategia**: Short

---

## 2. Las 5 Preguntas Obligatorias

| # | Pregunta (formulada por architect) | Respuesta (del desarrollador) |
|---|-----------------------------------|-------------------------------|
| 1 | ¿Deseas que la nueva carpeta `agentic-system-structure` se cree directamente en la raíz o en `src`? | En `src` ya que es código. |
| 2 | ¿El archivo `index.md` de la raíz de `src` también debe ir a `agentic-system-structure`? | Sí, es parte de la estructura de markdowns. |
| 3 | ¿Las carpetas `.agent.backup_*` se mueven a `.backups` en la raíz? | Sí en la raíz. |
| 4 | ¿Debo actualizar referencias, alias, paths y scripts (build/init)? | Se deben revisar las referencias, los alias y los paths. Además de los scripts que operan con esos ficheros en la build y el comando init. |
| 5 | ¿Las carpetas `cli`, `core`, `test` y `extension.ts` permanecen intactas en `src/`? | Sí. |

---

## 3. Acceptance Criteria

Derivados de las respuestas anteriores:

1. **Alcance**: Reubicación de carpetas `rules`, `workflows`, `templates`, `artifacts` e `index.md` de `src/` a `.agent/`. Consolidación de `.agent.backup_*` en `/.backups/`.
2. **Entradas/Datos**: Ficheros actuales en `src/` y carpetas de backup en raíz.
3. **Salidas esperadas**: Nueva estructura de directorios funcional y coherente, con scripts y referencias actualizadas.
4. **Restricciones**: No modificar el código lógico en `src/cli`, `src/core`, `src/test` ni `src/extension.ts`.
5. **Criterio de Done**: Estructura movida, `.backups` consolidado, `init` funcional y build exitosa sin errores de paths.

---

## 4. Análisis simplificado

### Estado actual (As-Is)
- Markdowns dispersos en `src/` (posible duplicidad o inconsistencia con `.agent/`).
- Backups contaminando la raíz del proyecto.
- Dependencias de rutas en `init.md` y posiblemente scripts de build.

### Evaluación de complejidad

| Indicador | Estado | Comentario |
|-----------|--------|------------|
| Afecta más de 3 paquetes | ☑ Sí ☐ No | Afecta a la estructura base y herramientas (scripts/init). |
| Requiere investigación APIs | ☐ Sí ☐ No | |
| Cambios breaking | ☑ Sí ☐ No | Cambia el path de las reglas y workflows internos. |
| Tests E2E complejos | ☐ Sí ☐ No | |

**Resultado de complejidad**: ☐ BAJA (continuar Short) ☑ ALTA (Se recomienda precaución, pero se mantiene Short por deseo del usuario si así lo decide)

---

## 5. Plan de implementación

### Pasos ordenados

1. **Paso 1: Preparación de Estructura**
   - Crear `src/agentic-system-structure`.
   - Crear `/.backups`.
2. **Paso 2: Migración de Archivos**
   - Mover `src/rules`, `src/workflows`, `src/templates`, `src/artifacts` e `src/index.md` a `.agent/`.
   - Mover `.agent.backup_*` a `/.backups/`.
3. **Paso 3: Actualización de Referencias**
   - Revisar y corregir todos los `index.md` (root y locales).
   - Actualizar alias en workflows.
   - Modificar scripts de build y lógica de `init` si apuntan a rutas antiguas.
4. **Paso 4: Verificación**
   - Ejecutar `init` para verificar carga de constituciones.
   - Ejecutar build (si aplica).

### Verificación prevista
- Tipo de tests: Verificación manual de rutas y ejecución del comando `init`.
- Criterios de éxito: El sistema carga las reglas desde la nueva ubicación `.agent/`.

---

## 6. Aprobación del desarrollador (OBLIGATORIA)

```yaml
approval:
  developer:
    decision: SI
    date: 2026-01-28T08:21:00+01:00
    comments: Aprobado por el usuario.
```

> Sin aprobación, esta fase NO puede avanzar a Implementation.
