# Acceptance Criteria — 5-reestructurar-src-para-extension-vscode

🏛️ **architect-agent**: Definición de criterios de aceptación para la reestructuración de src y scaffolding de extensión VSCode.

## 1. Definición Consolidada
La tarea consiste en transformar la estructura del proyecto actual para convertirlo en una extensión de VSCode. Todo el código fuente actual (`src/`) se moverá a una subcarpeta `.agent/`. La raíz de `src/` pasará a alojar el código fuente de la nueva extensión (`extension.ts` y archivos relacionados). Se debe garantizar el funcionamiento continuo de los scripts de inicialización existentes adaptándolos a la nueva ruta, y se debe proveer el scaffolding básico de la extensión (Hello World) junto con la configuración necesaria en `package.json` para que sea ejecutable y testeable.

## 2. Respuestas a Preguntas de Clarificación
> Esta sección documenta las respuestas del desarrollador a las 5 preguntas formuladas por el architect-agent.

| # | Pregunta (formulada por architect) | Respuesta (del desarrollador) |
|---|-----------------------------------|-------------------------------|
| 1 | ¿Cuál debe ser la estructura final exacta de `src/`? | Todo lo actual va a `src/agentic-system-structure`. La raíz `src/` contendrá los ficheros de la extensión. El proyecto se convierte en un proyecto de extensión VSCode. |
| 2 | ¿Scripts afectados? | Los scripts de init deben adaptarse. |
| 3 | ¿Compatibilidad del código movido? | Sí, deben seguir funcionando los mismos scripts para instalar y inicializar apuntando a la nueva ubicación. |
| 4 | ¿Testing? | Sí, se deben mantener los tests actuales funcionando y añadir los tests propios de la extensión generada. |
| 5 | ¿Alcance de la extensión? | Scaffolding básico con un comando "Hello World" funcional. |

---

## 3. Criterios de Aceptación Verificables
> Listado de criterios derivados de las respuestas anteriores que deben ser verificados en la Fase 5.

1. Alcance:
   - Migración completa de archivos actuales de `src/` a `.agent/`.
   - Creación de estructura básica de extensión VSCode en `src/` (`extension.ts`, etc.).
   - Configuración de `package.json` con `engines`, `activationEvents` y `contributes` básicos.
   - Setup de `.vscode/launch.json` y `tasks.json` para debugging de la extensión.

2. Entradas / Datos:
   - Código actual en `src/`.
   - Scripts de init existentes.

3. Salidas / Resultado esperado:
   - Estructura de carpetas reorganizada.
   - Extensión compilable y ejecutable en modo debug (F5).
   - Comando "Hello World" ejecutable desde la Palette de VSCode.
   - Scripts antiguos (`npm run init` u equivalentes) funcionando correctamente contra la nueva ruta.

4. Restricciones:
   - No romper la funcionalidad existente del sistema agéntico (ahora en `agentic-system-structure`).
   - El código en `agentic-system-structure` debe ser importable/utilizable si fuera necesario.

5. Criterio de aceptación (Done):
   - `npm run test` pasa (ejecuta tests antiguos y nuevos).
   - Las tareas de inicialización antiguas siguen operativas.
   - Se puede lanzar la extensión en una ventana de "Extension Development Host" y ejecutar el comando de prueba.

---

## Aprobación (Gate 0)
Este documento constituye el contrato de la tarea. Su aprobación es bloqueante para pasar a Phase 1.

```yaml
approval:
  developer:
    decision: SI
    date: 2026-01-27T23:11:45+01:00
    comments: Aprobado por el usuario.
```

---

## Historial de validaciones (Phase 0)
```yaml
history:
  - phase: "phase-0-acceptance-criteria"
    action: "completed"
    validated_by: "architect-agent"
    timestamp: "2026-01-27T23:11:30+01:00"
    notes: "Acceptance criteria definidos"
```
