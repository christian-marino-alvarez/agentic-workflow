---
artifact: research
phase: phase-1-research
owner: researcher-agent
status: draft
related_task: 21-portable-agentic-system
---

# Research Report — 21-portable-agentic-system

> [!CAUTION]
> **REGLA PERMANENT**: Este documento es SOLO documentación.
> El researcher-agent documenta hallazgos SIN analizar, SIN recomendar, SIN proponer soluciones.
> El análisis corresponde a Phase 2.

## 1. Resumen ejecutivo
- **Problema investigado**: Cómo distribuir el sistema de orquestación agéntica de Extensio como un paquete npm independiente y agnóstico.
- **Objetivo de la investigacion**: Identificar la estructura de empaquetado, herramientas de CLI para scaffolding y puntos de acoplamiento con el framework Extensio.
- **Principales hallazgos**: Existen librerías modernas como `@clack/prompts` para interfaces CLI premium. El sistema `.agent` tiene dependencias directas en constituciones de Extensio que deben ser "neutralizadas".

---

## 2. Necesidades detectadas
- **Portabilidad**: El sistema debe funcionar en cualquier proyecto mediante un comando `init`.
- **CLI (`agentic-workflow`)**: Necesidad de una herramienta que gestione la instalación de la estructura `.agent` y el archivo `AGENTS.md`.
- **Desacoplamiento**: Eliminar referencias a "Extensio", "mcp-extensio-cli", y constituciones específicas de extensiones.
- **Asistente de configuración**: Un wizard interactivo para guiar al usuario en la configuración inicial y personalización de roles.

---

## 3. Hallazgos técnicos
- **CLI Frameworks**:
  - `@clack/prompts`: Usado por herramientas como Astro y T3. Ofrece una UX minimalista y estética.
  - `Commander.js`: Estándar para definición de comandos y argumentos.
- **Scaffolding**:
  - `fs-extra`: Para copiado recursivo de directorios de plantillas.
  - `Handlebars`: Para inyectar variables (nombre del proyecto, autor) en los archivos `.md` portados.
- **Configuración Persistente**:
  - `conf`: Librería para persistir configuraciones globales del usuario si fuera necesario.

---

## 4. APIs Web / WebExtensions relevantes
- No aplica (lógica de archivos locales y empaquetado npm).

---

## 5. Compatibilidad multi-browser
- No aplica directamente, pero el sistema debe ser compatible con entornos Node.js >= 18.

---

## 6. Oportunidades AI-first detectadas
- **Detección automática de contexto**: El CLI podría intentar detectar el tipo de proyecto (react, node, etc.) para sugerir roles específicos.
- **Validación de MCP**: Capacidad de verificar si el entorno tiene acceso a los servidores MCP declarados en `rules/roles`.

---

## 7. Hallazgo: Consistencia Fase-Artefacto (1:1)
- **Deficiencia detectada**: La Fase 0 actualmente no produce un artefacto independiente, lo que dificulta la validación automatizada de Gates y sobrecarga el `task.md`.
- **Propuesta**: Crear un template dedicado `templates.acceptance` que genere un archivo `acceptance.md` por cada tarea.

### Draft: templates.acceptance (v1.0.0)
```markdown
# Acceptance Criteria — {{task.id}}-{{task.title}}

## 1. Definición Consolidada
{{consolidated_definition}}

## 2. Respuestas a Preguntas de Clarificación
| # | Pregunta | Respuesta |
|---|----------|-----------|
| 1 | {{q1}} | {{a1}} |
| 2 | {{q2}} | {{a2}} |
| 3 | {{q3}} | {{a3}} |
| 4 | {{q4}} | {{a4}} |
| 5 | {{q5}} | {{a5}} |

## 3. Criterios de Aceptación Verificables
- [ ] **Funcionalidad**: {{criteria.functionality}}
- [ ] **Datos/Entradas**: {{criteria.data}}
- [ ] **Resultado/Salida**: {{criteria.output}}
- [ ] **Restricciones**: {{criteria.constraints}}

## 4. Definición de "Done"
{{definition_of_done}}

---
## Aprobación (Gate 0)
```yaml
approval:
  developer:
    decision: null
    date: null
```

---

## 8. Riesgos identificados
- **Riesgo: Degradación del Proceso**: Al facilitar la personalización, se corre el riesgo de que el usuario elimine Gates críticos, invalidando la robustez del sistema. (Severidad: Alta).
- **Riesgo: Dependencias de MCP**: Si el sistema depende de herramientas de Antigravity/Gemini específicas, su uso en otros IDEs podría verse limitado. (Severidad: Media).
- **Riesgo: "Template Drift"**: Dificultad para actualizar la estructura `.agent` en proyectos que ya han sido inicializados y personalizados. (Severidad: Baja).

---

## 9. Fuentes
- [Clack documentation](https://github.com/natemoo-re/clack)
- [Commander.js docs](https://github.com/tj/commander.js)
- `.agent/workflows/tasklifecycle-long/` (referencia de arquitectura actual)
- Tarea 6: "Exportar ciclo .agent a zip" (antecedente de portabilidad)

---

## 10. Aprobación del desarrollador (OBLIGATORIA)
```yaml
approval:
  developer:
    decision: null
    date: null
    comments: null
```
