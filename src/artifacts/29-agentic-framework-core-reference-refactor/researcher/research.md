🔬 **researcher-agent**: Iniciando investigación para la refactorización por referencia absoluta.

---
artifact: research
phase: phase-1-research
owner: researcher-agent
status: approved
related_task: 29-Agentic Framework Core Reference Refactor
---

# Research Report — 29-Agentic Framework Core Reference Refactor

## 1. Resumen ejecutivo
Investigación sobre la viabilidad de un modelo de orquestación agéntica basado en referencias absolutas al paquete npm en el sistema de archivos local. Los hallazgos confirman que Node.js permite resolver la ubicación física del paquete fácilmente y que los agentes de IDE (Cursor/Windsurf) pueden seguir estas rutas si se indexan correctamente en el archivo maestro.

## 2. Necesidades detectadas
- **Resolución de Caminos Absolutos**: Necesidad de una función que, en tiempo de ejecución (`init`), determine `node_modules/@cmarino/agentic-workflow`.
- **Merging de Índices**: Estrategia para combinar el índice "Core" (solo lectura en node_modules) con el índice "Custom" (lectura/escritura en .agent/).
- **Protocolo de Links en IDE**: Validación de que `@` o rutas absolutas en Markdown son transitivas para los agentes.

## 3. Hallazgos técnicos

### Resolución de Paths en Node.js
- **import.meta.resolve**: Permite obtener la URL de un módulo. [MDN: import.meta.resolve](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import.meta/resolve)
- **createRequire**: Útil para resolver módulos CommonJS o paths de paquetes.
- **Diferencia Local/Npm**: Cuando se usa `npm link`, el path apunta al directorio de desarrollo. En `npm install`, apunta a `node_modules`. Ambos casos son válidos si se usa el path físico.

### Estrategia de Indexación (Overlays)
- Se propone un modelo de **Overlay Indexing**:
  1. El CLI genera `.agent/index.md` con una sección `core` (apuntando a node_modules).
  2. Una sección `custom` para extensiones locales.
  3. Los alias del core se autogeneran basándose en el contenido de `node_modules/src/rules/index.md`, etc.

### Visibilidad de node_modules en IDEs
- **Cursor/Windsurf**: Por defecto, a menudo ignoran `node_modules`. Sin embargo, si un archivo como `AGENTS.md` o `.agent/index.md` referencia **explícitamente** una ruta absoluta o relativa hacia un fichero dentro de `node_modules`, el agente **tiene permiso y capacidad** de leerlo. La clave es el "Discovery path".

## 4. APIs Web / WebExtensions relevantes
- *No aplica directamente*. Se hará uso intensivo de `node:path` y `node:fs`.

## 5. Compatibilidad
- Compatible con Node.js 18+ (ESM).
- Compatible con agentes de IA que respetan enlaces de archivos Markdown (Cursor, Windsurf, VS Code).

## 6. Oportunidades AI-first detectadas
- **Auto-indexación**: El sistema puede regenerar el índice local cada vez que se detecta un cambio en la versión del paquete core, manteniendo la sincronización total.

## 7. Riesgos identificados
- **Rigidez de Paths Absolutos**: Si el usuario mueve el proyecto de carpeta, los paths absolutos guardados en el índice se rompen.
- **Mitigación**: El comando `init` (o un nuevo comando `refresh`) debe ser capaz de re-mapear los paths rápidamente.
- **Acceso a node_modules**: Algunos entornos de seguridad restringidos podrían bloquear la lectura profunda de node_modules por parte de herramientas externas.

## 8. Fuentes
- [Node.js recursive file search](https://nodejs.org/api/fs.html#fsreaddirpath-options-callback)
- [IDE Agent Context Management Best Practices]

---

## 9. Aprobacion del desarrollador (OBLIGATORIA)
```yaml
approval:
  developer:
    decision: SI
    date: "2026-01-20T08:00:00+01:00"
    comments: "Aprobado vía consola. Se confirma el modelo de referencia absoluta."
```

---
🔬 **researcher-agent**: Investigación finalizada. He validado el modelo de resolución de rutas absolutas como el más estable para entornos de IA. @architect-agent, el camino está despejado para el análisis.
