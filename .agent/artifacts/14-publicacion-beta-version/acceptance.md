# Acceptance Criteria — 14-publicacion-beta-version

🏛️ **architect-agent**: He consolidado los criterios de aceptación basados en tus respuestas. Esta es la base contractual para la tarea de publicación.

## 1. Definición Consolidada
El objetivo es publicar una nueva versión beta del paquete `agentic-workflow` utilizando los flujos de CI existentes. El incremento de versión se determinará automáticamente mediante conventional commits. Antes de la publicación, se deben integrar los cambios más recientes de la rama `develop` para evitar conflictos. La publicación final será ejecutada por una GitHub Action tras el merge/push correspondiente.

## 2. Respuestas a Preguntas de Clarificación

| # | Pregunta (formulada por architect) | Respuesta (del desarrollador) |
|---|-----------------------------------|-------------------------------|
| 1 | ¿Qué versión beta estamos intentando publicar exactamente? | La siguiente que toque según conventional commits. |
| 2 | ¿Los conflictos en `CHANGELOG.md` y `package.json` están resueltos? | Actualizar antes de crear PR con `develop`. |
| 3 | ¿Algún requerimiento especial para `ci/publish`? | Estándar. |
| 4 | ¿El merge a `develop` requiere actualizaciones manuales? | No. |
| 5 | ¿Credencial de NPM disponible o delegada en GitHub Action? | Ya disponemos de GitHub Action de publicación. |

---

## 3. Criterios de Aceptación Verificables

1. Alcance:
   - Sincronización de la rama de trabajo con `develop`.
   - Generación de nueva versión beta automática.
   - Publicación exitosa vía GitHub Action.

2. Entradas / Datos:
   - Commits en formato conventional commits.
   - Rama `develop` actualizada.

3. Salidas / Resultado esperado:
   - Nueva versión disponible en NPM con el tag `beta`.
   - `CHANGELOG.md` y `package.json` actualizados en la rama principal.

4. Restricciones:
   - No realizar actualizaciones manuales de versión.
   - Respetar el flujo de CI estándar.

5. Criterio de aceptación (Done):
   - La nueva versión beta es visible en el registro de NPM y el CI ha finalizado correctamente.

---

## Aprobación (Gate 0)
Este documento constituye el contrato de la tarea. Su aprobación es bloqueante para pasar a Phase 1.

```yaml
approval:
  developer:
    decision: SI
    date: 2026-02-03T09:31:00Z
    comments: Aprobado por el desarrollador.
```

---

## Historial de validaciones (Phase 0)
```yaml
history:
  - phase: "phase-0-acceptance-criteria"
    action: "completed"
    validated_by: "architect-agent"
    timestamp: "2026-02-03T09:31:00Z"
    notes: "Acceptance criteria definidos y consolidados tras feedback."
```
