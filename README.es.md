# @christianmaf80/agentic-workflow

[English](./README.md) | [Español]

> Sistema portátil de orquestación de flujos agénticos con estricta disciplina de identidad y puertas de control.

## 🚀 Descripción General

**Agentic Workflow** es un framework de orquestación ligero e agnóstico al lenguaje, diseñado para imponer disciplina y seguridad en el desarrollo asistido por agentes de IA. Proporciona un ciclo de vida estructurado para las tareas, puertas de control obligatorias con intervención humana (human-in-the-loop) y un robusto modelo de arquitectura por referencia.

## ✨ Características Principales

- **Protocolo AHRP (Agentic Handover & Reasoning Protocol)**: Impone un flujo estricto de Triple-Puerta para cada tarea (Activación, Aprobación de Razonamiento y Aceptación de Resultados).
- **Gobernanza de Runtime y MCP**: Integración profunda con un servidor MCP para seguimiento de ciclos de vida, validación de puertas y logs a prueba de manipulaciones.
- **Skills Agénticos**: Capacidades modulares para los agentes, incluyendo habilidades de gobernanza localizadas (ej: `skill.runtime-governance`).
- **Arquitectura local**: Copia las reglas y workflows del core dentro de `.agent/` para evitar dependencias de acceso continuado a `node_modules`.
- **Independiente y Portátil**: Funciona en cualquier proyecto, siempre que el agente del IDE pueda leer archivos Markdown.

## 📦 Instalación

```bash
npm install @christianmaf80/agentic-workflow
```

## 🤖 Inicia con Ayuda de IA

Si estás con un asistente de IA (como Cursor, Windsurf o Copilot), puedes arrancar todo el sistema directamente desde el chat:

> **Tú:** "Por favor, ejecuta el comando `init` para agentic-workflow"

El agente usará sus herramientas de terminal para configurar el entorno, crear la estructura `.agent` y preparar el proyecto para ciclos gobernados sin que tengas que escribir ni un solo comando.

## 🛠️ Comandos del CLI

### `init`
Inicializa el sistema agéntico en el directorio actual.
- Detecta sistemas heredados y ofrece migración con copias de seguridad automáticas.
- Crea/refresca la estructura `.agent/` con los ficheros core.
- Genera `AGENTS.md`, el punto de entrada para los asistentes del IDE.
```bash
npx agentic-workflow init
```

#### Selección del workspace (recomendado)
Si ejecutas desde `npx`, el comando puede arrancar en un directorio temporal. Para evitarlo, pasa el workspace explícitamente:
```bash
npx agentic-workflow init --workspace /ruta/a/tu/proyecto
```
También puedes fijarlo por entorno:
```bash
AGENTIC_WORKSPACE=/ruta/a/tu/proyecto npx agentic-workflow init
```

### `create <role|workflow|skill> <name>`
Genera el andamiaje (scaffolding) para un nuevo componente específico del proyecto.
- **role**: Crea un nuevo rol de agente con reglas de identificación obligatorias.
- **workflow**: Crea una plantilla de ciclo de trabajo personalizado.
- **skill**: Crea una nueva habilidad modular con su propia plantilla `SKILL.md`.
```bash
npx agentic-workflow create role neo
```

### `restore`
Recuepra la configuración de `.agent/` desde una copia de seguridad previa.
```bash
npx agentic-workflow restore
```

### `clean`
Elimina archivos de configuración temporales o heredados (ej: configuraciones MCP obsoletas).
```bash
npx agentic-workflow clean
```

### `mcp`
Inicia el servidor local del Runtime MCP (modo stdio).
```bash
npx agentic-workflow mcp
```

### `register-mcp`
Registra automáticamente el servidor local en la configuración de Antigravity/Gemini.
```bash
npx agentic-workflow register-mcp
```

## 📦 Instalación y Registro MCP

### Instalar y Ejecutar
Instalación global:
```bash
npm install -g @christianmaf80/agentic-workflow
agentic-workflow mcp
```

Con `npx` (sin instalación global):
```bash
npx agentic-workflow mcp
```

### Registrar o Actualizar Cliente MCP
Registrar (Antigravity/Gemini o Codex CLI si está presente):
```bash
npx agentic-workflow register-mcp
```

Si necesitas actualizar el registro en Codex, elimina el bloque
`[mcp_servers.agentic-workflow]` de `~/.codex/config.toml` y vuelve
a ejecutar `register-mcp`. En Antigravity se actualiza en el lugar.

### Parar y Logs
Detén el servidor MCP con `Ctrl+C`. Los logs del runtime se escriben en `agentic-runtime.log`.

## ⚙️ Configuración Avanzada

### Integración de Runtime MCP
El sistema utiliza un servidor MCP para rastrear el estado del flujo. Para conectarlo con tu asistente de IDE:
1. Ejecuta `npx agentic-workflow register-mcp`.
2. Asegúrate de que `mcp_config.json` apunte al binario local del CLI.
3. Los logs de ejecución se guardan en `agentic-runtime.log` para auditoría y depuración.

## 🧠 Conceptos Core

### Ciclos de Vida
El framework soporta dos flujos principales según la complejidad de la tarea:

#### 1. Ciclo de Vida Largo (9 Fases)
Diseñado para funcionalidades complejas, cambios arquitectónicos o tareas con alto riesgo. Garantiza el máximo razonamiento antes de escribir una sola línea de código.
- **Fase 0: Criterios de Aceptación**: Elimina la ambigüedad definiendo exactamente qué significa el éxito.
- **Fase 1: Investigación**: Recopilación de contexto. Necesaria para entender el código existente o APIs externas.
- **Fase 2: Análisis**: Evaluación de impacto. Identifica riesgos y restricciones arquitectónicas.
- **Fase 3: Planificación**: Plan de implementación detallado. Crucial para la alineación con el desarrollador.
- **Fase 4: Implementación**: El proceso de codificación propiamente dicho.
- **Fase 5: Verificación**: Pruebas rigurosas y validación de los cambios realizados.
- **Fase 6: Aceptación de Resultados**: Firma final del desarrollador sobre el valor entregado.
- **Fase 7: Evaluación**: Retrospectiva sobre el desempeño del agente y eficiencia del proceso.
- **Fase 8: Commit & Push**: Persistencia segura de los cambios en el repositorio.

#### 2. Ciclo de Vida Corto (3 Fases)
Optimizado para correcciones rápidas, actualizaciones simples de documentación o cambios de bajo riesgo.
- **Fase 1: Brief**: Fusiona Aceptación, Análisis y Planificación en un solo paso para mayor agilidad.
- **Fase 2: Implementación**: Codificación y verificación combinadas.
- **Fase 3: Cierre**: Aceptación de resultados y limpieza final.

### Protocolo AHRP
Cada tarea de un agente sigue el **Protocolo de Traspaso y Razonamiento Agéntico**:
1. **Puerta A (Activación)**: El agente es asignado pero está bloqueado. El desarrollador debe decir `SI`.
2. **Puerta B (Razonamiento)**: El agente propone un plan. El desarrollador debe aprobar con `SI`.
3. **Puerta C (Resultados)**: El agente completa el trabajo. El desarrollador valida con `SI`.

### Arquitectura por Instalación
Para garantizar la estabilidad, la lógica central del framework (reglas y workflows) se instala dentro de la carpeta `.agent` del proyecto. Esto ofrece una copia local limpia que se puede extender sin tocar el paquete publicado.

### Sistema de Indexación por Dominios
El sistema utiliza una **Arquitectura de Indexación en Cascada** para una trazabilidad absoluta:
1. **Root Index** (`.agent/index.md`): Declara los puntos de entrada para todos los dominios del sistema (reglas, workflows, templates, skills, artefactos).
2. **Índices de Dominio**: Cada carpeta contiene su propio `index.md` donde se asignan **alias** a los archivos.
3. **Modelo de Referencia**: Los agentes nunca utilizan rutas absolutas. Resuelven las referencias a través del sistema de alias (ej: `skill.runtime-governance` → `.agent/skills/runtime-governance/SKILL.md`), lo que garantiza que la lógica se pueda mover o actualizar sin romper los flujos de trabajo.

### Responsabilidad en Runtime
Todas las transiciones de ciclo de vida se registran a través de un Runtime MCP dedicado. Las acciones realizadas sin una "Huella de Gobernanza" correspondiente (logs de MCP) se consideran inválidas y están sujetas a reversión.

## 📄 Licencia

Licencia ISC. Consulta [LICENSE](./LICENSE) para más detalles.
