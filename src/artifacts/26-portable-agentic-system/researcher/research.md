---
artifact: research
phase: phase-1-research
owner: researcher-agent
status: draft
related_task: 26-portable-agentic-system
---

# Research Report — 26-Portable Agentic System

> [!CAUTION]
> **REGLA PERMANENT**: Este documento es SOLO documentación.
> El researcher-agent documenta hallazgos SIN analizar, SIN recomendar, SIN proponer soluciones.
> El análisis corresponde a Phase 2.

## 1. Resumen ejecutivo
- **Problema investigado**: El sistema agéntico actual está fuertemente acoplado al repositorio `extensio`, dificultando su reutilización en otros proyectos.
- **Objetivo de la investigacion**: Identificar mecanismos para desacoplar el sistema, empaquetarlo como `@cmarino/agentic-workflow` y permitir su distribución vía npm, manteniendo la capacidad de personalización local.
- **Principales hallazgos**: Existen herramientas maduras para CLI (`@clack/prompts`, `commander`) y patrones de "scaffolding" (`npm init`) que permiten esta arquitectura híbrida (núcleo inmutable + configuración local).

---

## 2. Necesidades detectadas
- **Desacoplamiento total**: El core de orquestación no debe importar nada de `extensio`.
- **Arquitectura híbrida**: Clases base y workflows genéricos en el paquete npm; implementaciones concretas y reglas específicas en el proyecto usuario.
- **CLI interactivo**: Necesidad de un comando `init` amigable que genere la estructura `.agent`.
- **Soporte de Schemas**: Necesidad de validar que la constitución local cumpla con los contratos del sistema portable.

---

## 3. Hallazgos técnicos

### 3.1 npm Init & Create Packages
- **Descripción**: El prefijo `create-` o el uso de `npm init <initializer>` permite ejecutar un binario remoto sin instalación global explícita.
- **Estado**: Estándar de facto en ecosistema JS (ej: `create-vite`, `create-next-app`).
- **Docs**: [npm-init](https://docs.npmjs.com/cli/v10/commands/npm-init)

### 3.2 CLI Builders
- **Commander.js**:
  - Estado: Estable, muy popular.
  - Uso: Gestión de comandos, flags y ayuda `--help`.
- **@clack/prompts**:
  - Estado: Moderno, UI minimalista.
  - Uso: Interacción con usuario (selects, inputs, spinners) durante el setup.
  - Limitaciones: Menos "batalla" que Inquirer, pero mejor UX visual.

### 3.3 Estrategias de Linking Local
- **Symlinks**: `npm link` para desarrollo local del paquete.
- **Import Maps / Alias**: Configuración en `tsconfig` del proyecto consumidor para mapear `@agentic/core` a la librería.

---

## 4. APIs Web / WebExtensions relevantes
*No aplica directamente al empaquetado npm, pero sí al contexto de ejecución.*

- **Node.js File System (fs)**: Crítico para el scaffolding (copiar templates, crear directorios).
- **Dynamic Imports**: Necesario para cargar configuraciones locales (`agent.config.js` o similar) desde el CLI global.

---

## 5. Compatibilidad multi-browser
*No aplica: El sistema agéntico corre en entorno Node.js/Terminal, no en navegador.*

---

## 6. Oportunidades AI-first detectadas
- **Auto-configuración**: El CLI podría leer el `package.json` del proyecto destino y sugerir roles o reglas adaptadas (ej: si ve `react` sugiere reglas de frontend).
- **Context Loading Dinámico**: El sistema portable podría inyectar automáticamente el contexto del proyecto (file tree, deps) al LLM sin configuración manual.

---

## 7. Riesgos identificados
- **Riesgo**: Divergencia de versiones.
  - **Severidad**: Alta.
  - **Detalle**: Que el `.agent/` local apunte a workflows que ya no existen en la versión actualizada de `@cmarino/agentic-workflow`.
- **Riesgo**: Sobreescritura destructiva.
  - **Severidad**: Media.
  - **Detalle**: Que `npm init` borre personalizaciones en `.agent` existente.

---

## 8. Fuentes
- [npm-init docs](https://docs.npmjs.com/cli/v10/commands/npm-init)
- [Commander.js](https://www.npmjs.com/package/commander)
- [@clack/prompts](https://www.npmjs.com/package/@clack/prompts)

---

## 9. Aprobacion del desarrollador (OBLIGATORIA)
```yaml
approval:
  developer:
    decision: SI
    date: 2026-01-19T21:21:58+01:00
    comments: Aprobado por consola.
```
