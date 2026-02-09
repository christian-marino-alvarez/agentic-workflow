🔬 **researcher-agent**: Generando informe de investigación oficial para la migración.

# Research Report — 3-migracion-sistema-agentes

## 1. Resumen ejecutivo
- **Problema investigado**: Portabilidad de los componentes core del sistema de agentes (`cli`, `runtime`, `structure`, `mcp`) desde el monorepositorio actual `agentic-workflow` a una estructura NPM aislada.
- **Objetivo de la investigación**: Identificar dependencias de archivos, acoplamientos con la extensión de VS Code y requisitos para mantener la funcionalidad de los scripts del README en el destino.
- **Principales hallazgos**: El sistema está diseñado de forma modular, pero existen dependencias críticas hacia `src/infrastructure` (logger, migration) que deben ser migradas para que el `runtime` y el `cli` funcionen correctamente.

---

## 2. Necesidades detectadas
- **Requisitos técnicos**: El script de migración debe extraer:
  - `src/cli`: Punto de entrada de comandos.
  - `src/runtime`: Lógica de orquestación y trazabilidad.
  - `src/mcp`: Servidor y herramientas de protocolo.
  - `src/agentic-system-structure`: El "esqueleto" de workflows y reglas.
  - `src/infrastructure`: Específicamente el Logger y utilidades de migración (detectadas importaciones en `cli/commands/mcp.ts`).
- **Límites**: Exclusión total de `src/extension`.

---

## 3. Hallazgos técnicos
- **Estructura de Carpetas**:
  - El sistema depende de un `workspaceRoot` detectado por la carpeta `.agent`.
  - El `cli` utiliza `commander` para la orquestación.
  - El `runtime` gestiona el estado a través de `RuntimeWriteGuard`.
- **Acoplamiento VS Code**:
  - El `package.json` actual mezcla dependencias de VS Code con dependencias core. La solución migrada requiere un filtrado selectivo de `dependencies`.
  - No hay dependencias directas del `runtime` hacia el motor de VS Code, lo que facilita la portabilidad.

---

## 4. APIs relevantes
- **Model Context Protocol (MCP) SDK**: `@modelcontextprotocol/sdk`.
- **Commander.js**: Para el CLI.
- **Node.js File System (fs/promises)**: Para gestión de estados.

---

## 5. Compatibilidad
- **Entorno**: Compatible con Node.js (ESM).
- **Scripts del README**: Requieren la presencia de la carpeta `.agent` con sus subdirectorios (`workflows`, `rules`, `templates`).

---

## 6. Oportunidades AI-first detectadas
- **Limpieza programática**: El script puede reescribir dinámicamente el `package.json` para que el nuevo paquete sea 100% independiente de VS Code.

---

## 7. Riesgos identificados
- **Dependencias Ocultas**: Posibles importaciones circulares en el paquete `infrastructure` que apunten a la extensión. (Severidad: Media).
- **Puntos de entrada**: Asegurar que el `bin` del `package.json` apunte correctamente al CLI migrado. (Severidad: Baja).

---

## 8. Fuentes
- Estructura de código fuente en `src/`.
- Archivo `package.json` del proyecto raíz.

---

## 9. Aprobacion del desarrollador (OBLIGATORIA)
```yaml
approval:
  developer:
    decision: SI
    date: 2026-02-09T19:54:28Z
    comments: Aprobado por el usuario.
```
