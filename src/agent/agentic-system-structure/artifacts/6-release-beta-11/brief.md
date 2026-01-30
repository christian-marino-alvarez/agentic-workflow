---
artifact: brief
phase: short-phase-1-brief
owner: architect-agent
status: approved
related_task: 6-release-beta-11
---

# Brief — 6-release-beta-11

🏛️ **architect-agent**: Plan de Release Beta.

## 1. Identificación de la tarea
**Título**: Release Beta 1.18.0-beta.11
**Objetivo**: Generar una nueva versión beta incrementando la versión patch/prerelease según conventional commits.
**Estrategia**: Short

---

## 2. Las 5 Preguntas Obligatorias

| # | Pregunta | Respuesta |
|---|----------|-----------|
| 1 | ¿Qué tipo de versión es? | Beta (prerelease). Basada en Conventional Commits (Refactor -> Patch level). |
| 2 | ¿Se requiere changelog? | Sí, obligatorio. |
| 3 | ¿Se debe crear tag git? | Sí. |
| 4 | ¿Cuál es la versión actual? | `1.18.0-beta.10`. |
| 5 | ¿Cuál es la versión objetivo? | `1.18.0-beta.11` (Incremento de prerelease). |

---

## 3. Acceptance Criteria

1. **Alcance**: Actualizar `package.json`, crear `CHANGELOG.md` (o actualizar), commitear y taggear.
2. **Entradas/Datos**: Repositorio en rama `develop` limpio.
3. **Salidas esperadas**: Commit `chore(release): ...` y Tag `v1.18.0-beta.11`.
4. **Restricciones**: Usar Conventional Commits.
5. **Criterio de Done**: `package.json` actualizado y tag existente.

---

## 4. Análisis simplificado

### Estado actual (As-Is)
- Versión `1.18.0-beta.10`.
- Cambios acumulados: Reestructuración de src (Refactor).

### Evaluación de complejidad
| Indicador | Estado | Comentario |
|-----------|--------|------------|
| Afecta más de 3 paquetes | ☐ Sí ☑ No | Solo root. |
| Requiere investigación APIs | ☐ Sí ☑ No | Proceso estándar npm. |
| Cambios breaking | ☐ Sí ☑ No | Refactor interno. |
| Tests E2E complejos | ☐ Sí ☑ No | |

**Resultado de complejidad**: ☑ BAJA (continuar Short)

---

## 5. Plan de implementación

### Pasos ordenados

1. **Generar Changelog y Bump Version**
   - Agente: dev-agent
   - Descripción: Usar `npm version prerelease --preid=beta --no-git-tag-version` para actualizar `package.json`.
   - Generar/Actualizar `CHANGELOG.md` con los commits desde el último tag.

2. **Commit y Tag**
   - Agente: dev-agent
   - Descripción:
     - `git commit -am "chore(release): 1.18.0-beta.11"`
     - `git tag v1.18.0-beta.11`
     - `git push && git push --tags`

### Verificación prevista
- Tipo de tests: Verificación de versión en `package.json` y existencia de tag.
- Criterios de éxito: Tag en remoto.

---

## 6. Aprobación del desarrollador (OBLIGATORIA)
```yaml
approval:
  developer:
    decision: SI
    date: 2026-01-27T23:58:25+01:00
    comments: Proceder con la release manual.
```
