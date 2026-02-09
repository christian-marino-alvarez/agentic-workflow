🏛️ **architect-agent**: Iniciando análisis profundo para la migración selectiva.

---
artifact: analysis
phase: phase-2-analysis
owner: architect-agent
status: draft
related_task: 3-migracion-sistema-agentes
---

# Analysis — 3-migracion-sistema-agentes

## 1. Resumen ejecutivo
**Problema**
El sistema de agentes actual está acoplado dentro de un monorepositorio que incluye la extensión de VS Code. Necesitamos independizar el motor de agentes para que sea portable y funcional como una solución NPM pura.

**Objetivo**
Migración exitosa de componentes core del sistema de agentes mediante un script de exportación automatizado y creación de documentación visual técnica (diagramas).

**Criterio de éxito**
- Un script funcional que "extraiga" el core del sistema.
- Un nuevo repositorio/directorio funcional con `cli`, `runtime`, `mcp` e `infrastructure`.
- Eliminación de dependencias de VS Code.
- Diagramas técnicos representativos.

---

## 2. Estado del proyecto (As-Is)
Describe el estado real del proyecto **antes de implementar nada**.

- **Estructura relevante**
  - `src/cli`: Centraliza los comandos del sistema.
  - `src/runtime`: Orquestador de tareas y fases.
  - `src/mcp`: Implementación del servidor MCP.
  - `src/agentic-system-structure`: Definición de workflows y reglas base.
  - `src/infrastructure`: Contiene el Logger y utilidades transversales (crítico para la migración).
  - `src/extension`: Código específico de VS Code (a excluir).

- **Componentes existentes**
  - El `cli` depende de `commander` y del `mcp-server`.
  - El `runtime` depende de la persistencia en disco y del `infrastructure/logger`.
  - El servidor MCP actúa como puente entre el runtime y los clientes AI.

- **Nucleo / capas base**
  - El sistema depende de una estructura de archivos fija bajo `.agent/` para cargar workflows y reglas.

- **Limitaciones detectadas**
  - `package.json` raíz está muy cargado con dependencias de testing de UI (Playwright) y VS Code que no son necesarias para el core.
  - Algunas rutas en el CLI podrían estar asumiendo la estructura del monorepositorio.

---

## 3. Cobertura de Acceptance Criteria

### AC-1: Migración de componentes core
- **Interpretación**: Extraer `src/agentic-system-structure`, `src/cli`, `src/runtime`, `src/mcp` y `src/infrastructure`.
- **Verificación**: Comprobar que el directorio de salida contiene estas carpetas y sus archivos fuente.
- **Riesgos**: Olvidar archivos de configuración (tsconfig, eslint) necesarios para compilar por separado.

### AC-2: Exclusión de VS Code
- **Interpretación**: Eliminar `src/extension` y referencias en el `package.json` resultante.
- **Verificación**: Búsqueda recursiva de "vscode" en el código migrado.
- **Riesgos**: Dependencias de tipos (`@types/vscode`) en archivos compartidos.

### AC-3: Script de exportación
- **Interpretación**: Crear un script (ej: `scripts/export-core.mjs`) que automatice la copia y limpieza.
- **Verificación**: Ejecutarlo y validar que el output cumple con el AC-1 y AC-2.
- **Riesgos**: Manejo de rutas relativas durante la copia.

### AC-4: Solución NPM funcional
- **Interpretación**: El output debe tener un `package.json` válido y permitir ejecutar los comandos del README.
- **Verificación**: `npm install && npm run build` en el directorio migrado.

### AC-5: Diagramas técnicos
- **Interpretación**: Crear diagramas Mermaid para el core y los workflows.
- **Verificación**: Inclusión de diagramas legibles en el nuevo README o documentación.

---

## 4. Research técnico
Basado en los hallazgos de la Fase 1:

- **Alternativa A: Script de copia simple (sh/bash)**
  - Ventajas: Rápido de implementar.
  - Inconvenientes: Difícil de manipular el contenido de los archivos (ej: limpiar `package.json`).

- **Alternativa B: Script Node.js (Esm) con manipulación de JSON**
  - Ventajas: Permite leer `package.json`, filtrar dependencias, y escribir uno nuevo.
  - Inconvenientes: Requiere un poco más de lógica de programación.

**Decisión recomendada**
Alternativa B. Utilizaremos un script en `mjs` para gestionar la migración de forma inteligente, filtrando dependencias y ajustando los `scripts` del `package.json`.

---

## 5. Agentes participantes
- **architect-agent**
  - Responsabilidades: Diseño de la arquitectura de destino, creación de diagramas y validación final.
- **neo-agent** (o desarrollador)
  - Responsabilidades: Implementación del script de migración y ejecución de la misma.

**Handoffs**
- El Architect entrega este análisis al Neo-agent.
- El Neo-agent entrega el código migrado al Architect para verificación.

**Componentes necesarios**
- Crear: `scripts/export-agentic-core.mjs`
- Modificar: `package.json` (solo para añadir la referencia al script si se desea).

---

## 6. Impacto de la tarea
- **Arquitectura**: Ninguno en el repo original (es una exportación). Un gran impacto positivo en la portabilidad del sistema.
- **APIs / contratos**: El core pasará a ser una librería/aplicación independiente.
- **Compatibilidad**: Debe ser compatible con Node.js 20+.
- **Testing**: Se requiere verificar que los tests unitarios de `runtime` y `mcp` sigan pasando en el nuevo entorno.

---

## 7. Riesgos y mitigaciones
- **Riesgo 1: Referencias rotas**
  - Impacto: El sistema no arranca tras la migración.
  - Mitigación: El script debe verificar la presencia de todos los archivos importados.
- **Riesgo 2: Dependencia de infra**
  - Impacto: El core falla sin el logger.
  - Mitigación: Incluir `src/infrastructure` en el alcance de la migración.

---

## 9. TODO Backlog (Consulta obligatoria)
- **Referencia**: `.agent/todo/`
- **Estado actual**: 0 items relevantes.

---

## 10. Aprobación
Este análisis **requiere aprobación explícita del desarrollador**.

```yaml
approval:
  developer:
    decision: SI
    date: 2026-02-09T19:56:31Z
    comments: Aprobado por el usuario.
```
