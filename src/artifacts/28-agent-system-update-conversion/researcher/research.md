🔬 **researcher-agent**: He completado la fase de investigación técnica para el sistema de actualización y conversión.

---
artifact: research
phase: phase-1-research
owner: researcher-agent
status: approved
related_task: 28-Agent System Update & Conversion System
---

# Research Report — 28-Agent System Update & Conversion System

## 1. Resumen ejecutivo
Se ha investigado la viabilidad técnica para implementar un sistema de migración ("Wizard") dentro del paquete `@cmarino/agentic-workflow`. Los hallazgos confirman que el uso de `@clack/prompts` (ya presente en el proyecto) permite una UX visual y usable. La detección de sistemas legacy se basará en la firma del frontmatter de `.agent/index.md`. La estrategia de migración más segura identificada es la de "Backup & Scaffold" con inyección selectiva de contenido legacy.

## 2. Necesidades detectadas
- **Detección de Versión**: Necesidad de una "firma" única en el sistema actual para diferenciarlo de versiones previas de Extensio o custom.
- **Interactividad**: Capacidad de informar al usuario de los cambios exactos antes de proceder.
- **Atomicidad**: La migración no debe dejar el sistema en un estado inconsistente.
- **Preservación**: Los artefactos de tareas en curso (`.agent/artifacts/`) deben preservarse.

## 3. Hallazgos técnicos

### Firma de Sistema (Detección)
- **Versión Actual**: Frontmatter con `id: agent.index` en `.agent/index.md`.
- **Legacy Extensio**: Frontmatter con `id: rules.index` en `.agent/rules/index.md` o ausencia de `id` global.
- **Custom/Old**: Carpetas como `.agent/tasks` (reemplazadas por `artifacts`).

### Manipulación de Markdown y YAML
- **Librería gray-matter**: Es el estándar de facto para parsear y stringificar frontmatter sin perder la estructura del contenido. [npm: gray-matter](https://www.npmjs.com/package/gray-matter)
- **Librería js-yaml**: Necesaria para validación profunda de reglas YAML si se requiere migrar lógica compleja.

### UX de Wizard (CLI)
- **@clack/prompts**: Ya utilizado en `initCommand`. Soporta `intro`, `outro`, `spinner`, `confirm` y `note`. Es ideal para el "Wizard" visual solicitado. [GitHub: clack](https://github.com/natemoo-re/clack)

## 4. APIs Web / WebExtensions relevantes
- *No aplica directamente (herramienta CLI)*. Sin embargo, se requiere `node:fs/promises` y `node:path` para manipulación de archivos local.

## 5. Compatibilidad multi-browser
- *No aplica directamente (herramienta CLI)*. Compatible con entornos Node.js >= 18.

## 6. Oportunidades AI-first detectadas
- **Meta-Programación de Roles**: El sistema de actualización podría analizar el archivo `AGENTS.md` para sugerir actualizaciones en los perfiles de agentes del IDE.

## 7. Riesgos identificados
- **Pérdida de Personalizaciones**: Alta severidad. Si el usuario modificó workflows o reglas manualmente, la actualización podría sobrescribirlas.
- **Conflictos de Ruta**: Media severidad. Cambios en la jerarquía de directorios pueden romper referencias en tareas activas.

## 8. Fuentes
- [Node.js fs.cp Documentation](https://nodejs.org/api/fs.html#fscp-src-dest-options)
- [Clack Documentation](https://github.com/natemoo-re/clack)
- [Gray-matter Repository](https://github.com/jonschlinkert/gray-matter)

---

## 9. Aprobacion del desarrollador (OBLIGATORIA)
```yaml
approval:
  developer:
    decision: SI
    date: "2026-01-20T00:15:00+01:00"
    comments: "Aprobado vía consola."
```

---
🔬 **researcher-agent**: Informe de investigación finalizado. He documentado los componentes clave y la estrategia técnica recomendada (Backup & Scaffold). @architect-agent, puedes proceder con el análisis de la Fase 2.
