# @christianmaf80/agentic-workflow

[English](./README.md) | [Español]

> Sistema portátil de orquestación de flujos agénticos con estricta disciplina de identidad y puertas de control.

## 🚀 Descripción General

**Agentic Workflow** es un framework de orquestación ligero e agnóstico al lenguaje, diseñado para imponer disciplina y seguridad en el desarrollo asistido por agentes de IA. Proporciona un ciclo de vida estructurado para las tareas, puertas de control obligatorias con intervención humana (human-in-the-loop) y un robusto modelo de arquitectura por referencia.

## ✨ Características Principales

- **Protocolo AHRP (Agentic Handover & Reasoning Protocol)**: Impone un flujo estricto de Triple-Puerta para cada tarea (Activación, Aprobación de Razonamiento y Aceptación de Resultados).
- **Arquitectura por Referencia**: Mantiene tu proyecto limpio referenciando las reglas y workflows del núcleo desde `node_modules`.
- **Gobernanza de Tolerancia Cero**: Penalizaciones automáticas de rendimiento por violaciones del protocolo.
- **Independiente y Portátil**: Funciona en cualquier proyecto, siempre que el agente del IDE pueda leer archivos Markdown.

## 📦 Instalación

```bash
npm install @christianmaf80/agentic-workflow
```

## 🛠️ Comandos del CLI

### `init`
Inicializa el sistema agéntico en el directorio actual.
- Detecta sistemas heredados y ofrece migración con copias de seguridad automáticas.
- Crea/refresca la estructura `.agent/` con los ficheros core.
- Genera `AGENTS.md`, el punto de entrada para los asistentes del IDE.
```bash
npx agentic-workflow init
```

### `create <role|workflow> <name>`
Genera el andamiaje (scaffolding) para un nuevo componente personalizado.
- **role**: Crea un nuevo rol de agente con reglas de identificación obligatorias.
- **workflow**: Crea una plantilla de ciclo de trabajo personalizado.
```bash
npx agentic-workflow create role neo
```

### `restore`
Recupera la configuración de `.agent/` desde una copia de seguridad previa.
- Los backups se almacenan como `.agent.backup_<timestamp>` en la raíz del proyecto.
- Permite seleccionar versiones antes de un cambio destructivo.
```bash
npx agentic-workflow restore
```

## 🧠 Conceptos Core

### Ciclos de Vida
El framework soporta dos flujos principales según la complejidad de la tarea:
1. **Ciclo de Vida Largo (9 Fases)**: Para funcionalidades complejas que requieren Investigación, Análisis, Planificación y Revisión Arquitectónica formal.
2. **Ciclo de Vida Corto (3 Fases)**: Para correcciones rápidas o actualizaciones simples, fusionando Aceptación, Implementación y Cierre.

### Protocolo AHRP
Cada tarea de un agente sigue el **Protocolo de Traspaso y Razonamiento Agéntico**:
1. **Puerta A (Activación)**: El agente es asignado pero está bloqueado. El desarrollador debe decir `SI`.
2. **Puerta B (Razonamiento)**: El agente propone un plan. El desarrollador debe aprobar con `SI`.
3. **Puerta C (Resultados)**: El agente completa el trabajo. El desarrollador valida con `SI`.

### Arquitectura por Instalación
Para garantizar la estabilidad, la lógica central del framework (reglas y workflows) se instala dentro de la carpeta `.agent` del proyecto. Esto ofrece una copia local limpia que se puede extender sin tocar el paquete publicado.

## ⚖️ Gobernanza

Este framework se basa en el principio de **Máxima Disciplina**. Los agentes deben:
1. Identificarse con un prefijo obligatorio.
2. Enviar un plan de razonamiento antes de cualquier modificación.
3. Obtener la aprobación explícita del desarrollador (`SI`) para cada transición.

## 📄 Licencia

Licencia ISC. Consulta [LICENSE](./LICENSE) para más detalles.
