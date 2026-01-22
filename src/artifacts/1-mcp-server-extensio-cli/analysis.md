---
artifact: analysis
phase: phase-2-analysis
owner: architect-agent
status: approved
related_task: 1-mcp-server-extensio-cli
---

# Analysis — 1-mcp-server-extensio-cli

## 1. Resumen ejecutivo

**Problema**  
Actualmente, el CLI de Extensio (`@extensio/cli`) solo es accesible manualmente por desarrolladores vía terminal. Los agentes AI (como Google Antigravity) no pueden automatizar la creación de drivers, módulos, proyectos o builds del framework Extensio, limitando la experiencia de desarrollo asistido por IA.

**Objetivo**  
Crear un servidor MCP que exponga todas las capacidades del CLI de Extensio para que Google Antigravity y otros clientes AI puedan invocar comandos de forma programática, con validación de inputs, verificación de resultados y documentación completa para agentes.

**Criterio de éxito**  
Este análisis se considera válido si:
- Cubre todos los 11 acceptance criteria definidos en `task.md`
- Respeta la arquitectura de Extensio y sus constitución (drivers.md, clean-code.md, extensio-architecture.md)
- Define claramente qué componentes crear (servidor MCP, docs, demo, tests)
- Identifica agentes participantes y sus responsabilidades
- Integra los hallazgos del research aprobado en Fase 1

---

## 2. Estado del proyecto (As-Is)

**Estructura relevante**

```
extensio/
├── packages/
│   ├── cli/                      # @extensio/cli - comando "ext"
│   │   ├── src/
│   │   │   ├── index.mts         # Entry point con Commander.js
│   │   │   ├── commands/         # build.mts, demo.mts, test.mts
│   │   │   ├── generators/       # Yeoman generators (module, driver, project)
│   │   │   └── constants.mts     # EntityTypes, Browsers, TestTypes
│   │   ├── package.json          # bin: { "ext": "./dist/index.mjs" }
│   │   └── dist/                 # Compilado
│   ├── core/                     # @extensio/core (Engine, Context, Surfaces)
│   ├── drivers/                  # Drivers existentes
│   └── external-tools/           # Herramientas externas
└── .agent/                       # Sistema de workflows y artifacts
```

**CLI existente (`@extensio/cli`)**  
- **Comandos disponibles:**
  - `ext create` → Scaffold module, driver o project (Yeoman generators)
  - `ext build` → Compilar src/ → dist/ multi-browser (Chrome, Firefox, Safari)
  - `ext test` → Tests unit/integration (Vitest), E2E (Playwright)
  - `ext demo` → Crear scaffolding de demo para module/driver

- **Modo de operación:**
  - CLI interactivo (inquirer prompts) o non-interactive (flags)
  - Ejecuta en Node.js, usa Commander.js para parsing
  - Genera código vía Yeoman Environment
  - Build via esbuild (`buildModule` function)

**Limitaciones detectadas**
1. **No existe integración MCP:** El CLI no expone ninguna interfaz programática para agentes AI
2. **No existe carpeta `tools/`:** No hay ubicación canónica para herramientas del monorepo
3. **Documentación para agentes inexistente:** No hay guías de uso para AI
4. **Sin validación JSON Schema:** El CLI valida inputs con inquirer, no con esquemas reutilizables

**Artifacts / tareas previas**  
Ninguna tarea previa afecta a esta implementación. Es la primera vez que se crea un servidor MCP para Extensio.

---

## 3. Cobertura de Acceptance Criteria

### AC-1: Servidor MCP expone todos los comandos de `@extensio/cli`

**Interpretación:**  
El servidor MCP debe implementar **tools** (en terminología MCP) que mapeen 1:1 con los comandos del CLI:
- `extensio_create` → `ext create`
- `extensio_build` → `ext build`
- `extensio_test` → `ext test`
- `extensio_demo` → `ext demo`

**Verificación:**
- Test unitario: Verificar que el servidor registra 4 tools con nombres correctos
- Test E2E: Simular llamada MCP a cada tool y verificar que ejecuta el comando CLI correspondiente

**Riesgos / ambigüedades:**
- **Riesgo:** Pasar flags del CLI incorrectamente → Mitigación: JSON Schema para validar inputs antes de invocar CLI
- **Ambigüedad:** ¿Cómo manejar modo interactivo del CLI? → Solución: Servidor MCP siempre usa modo `--non-interactive`

---

### AC-2: Comandos `build`, `create`, `test` completamente implementados

**Interpretación:**  
Los 3 comandos prioritarios deben:
- Soportar TODOS los flags/opciones del CLI original
- Validar inputs con JSON Schema
- Retornar outputs estructurados (JSON)
- Gestionar child processes correctamente

**Verificación:**
- Test de integración: Para cada comando, verificar todas las combinaciones de flags relevantes
- Demo: Mostrar agente creando un driver completo (`create`), compilándolo (`build`) y ejecutando tests (`test`)

**Riesgos / ambigüedades:**
- **Riesgo:** Build largo bloquea respuesta MCP → Mitigación: Implementar progress notifications (MCP streaming)
- **Riesgo:** Tests E2E requieren browsers instalados → Mitigación: Documentar pre-requisitos y usar headless mode

---

### AC-3: Documentación completa de integración con Google Antigravity

**Interpretación:**  
Debe existir un `README.md` en `tools/mcp-server/` que contenga:
1. Instalación del servidor MCP
2. Configuración en `mcp_config.json` de Antigravity
3. Ejemplos de uso desde agentes AI
4. Troubleshooting

**Verificación:**
- Revisión manual del README por el desarrollador
- Demo: Seguir el README para configurar Antigravity y verificar que funciona

**Riesgos / ambigüedades:**
- **Riesgo:** Google Antigravity cambia interfaz de configuración → Mitigación: Versionar docs con fecha de última actualización

---

### AC-4: Configuración MCP para auto-descubrimiento por agentes

**Interpretación:**  
El servidor MCP debe exponer metadatos estándar:
- `server.name`: "extensio-cli"
- `server.version`: Sincronizado con `@extensio/cli`
- Tools con `inputSchema` (JSON Schema) completos

**Verificación:**
- Test unitario: Verificar que el handshake MCP retorna metadatos correctos
- Verificación manual: Comprobar que Antigravity lista el servidor en "Manage MCP Servers"

**Riesgos / ambigüedades:**
- Ninguno. MCP es estándar bien definido.

---

### AC-5: Ubicación en `tools/mcp-server` dentro del monorepo

**Interpretación:**  
Crear nueva carpeta `tools/mcp-server/` en raíz del monorepo conteniendo:
```
tools/
└── mcp-server/
    ├── src/
    │   ├── index.ts              # Entry point del servidor MCP
    │   ├── tools/                # Implementaciones de tools MCP
    │   ├── resources/            # Resources MCP (listar drivers/modules)
    │   └── schemas/              # JSON Schemas para validación
    ├── package.json              # bin: extensio-mcp-server
    ├── tsconfig.json
    ├── README.md
    └── tests/                    # Tests unitarios e integración
```

**Verificación:**
- Verificación manual: Confirmar que la carpeta existe con estructura correcta

**Riesgos / ambigüedades:**
- **Riesgo:** Workspaces de npm no configuradas para `tools/**/*` → Mitigación: Actualizar `package.json` raíz con workspace `tools/**/*`

---

### AC-6: Estructura compatible con publicación como `@extensio/mcp-server`

**Interpretación:**  
El `package.json` debe tener:
- `"name": "@extensio/mcp-server"`
- `"bin": { "extensio-mcp-server": "./dist/index.js" }`
- `"files": ["dist", "README.md", "LICENSE"]`
- `"repository"`, `"author"`, `"license"` correctos

**Verificación:**
- Verificación manual: Ejecutar `npm pack` y verificar contenido del tarball

**Riesgos / ambigüedades:**
- Ninguno. Configuración estándar de npm.

---

### AC-7: Validación de inputs antes de ejecución

**Interpretación:**  
Cada tool MCP debe definir `inputSchema` (JSON Schema) y validar antes de invocar el CLI:
- Ejemplo: `extensio_create` valida `{ type: "driver"|"module"|"project", name: string, ... }`
- Si validación falla → retornar error MCP estructurado, NO ejecutar comando CLI

**Verificación:**
- Test unitario: Pasar inputs inválidos y verificar que retorna error sin ejecutar CLI
- Test de integración: Verificar que inputs válidos pasan validación y ejecutan CLI

**Riesgos / ambigüedades:**
- **Riesgo:** JSON Schema out-of-sync con CLI → Mitigación: Generar schemas automáticamente desde código del CLI (futuro) o mantener manualmente con comentarios de sincronización

---

### AC-8: Manejo estructurado de errores del CLI

**Interpretación:**  
Capturar stderr, exit codes y excepciones del CLI y retornarlas como error MCP estructurado:
```json
{
  "error": {
    "code": "CLI_EXECUTION_FAILED",
    "message": "Build failed for Chrome browser",
    "details": {
      "exitCode": 1,
      "stderr": "...",
      "command": "ext build --browsers chrome"
    }
  }
}
```

**Verificación:**
- Test de integración: Forzar error del CLI (ej. path inválido) y verificar formato de error MCP

**Riesgos / ambigüedades:**
- **Riesgo:** CLI no retorna exit code consistente → Mitigación: Estandarizar exit codes del CLI (fuera de scope, documentar workaround)

---

### AC-9: Demo funcional con agente real

**Interpretación:**  
Crear un video/screencast o walkthrough documentado donde:
1. Se configura el servidor MCP en Google Antigravity
2. Un agente crea un driver nuevo (`extensio_create`)
3. El agente compila el driver (`extensio_build`)
4. El agente ejecuta tests del driver (`extensio_test`)

**Verificación:**
- Revisión manual del demo por el desarrollador
- Evidencia visual embedida en walkthrough.md

**Riesgos / ambigüedades:**
- **Riesgo:** Google Antigravity no disponible → Mitigación: Usar Claude Desktop como alternativa (también soporta MCP)

---

### AC-10: Tests automatizados simulando llamadas MCP

**Interpretación:**  
Implementar tests que:
- **Unitarios:** Mockean CLI y verifican lógica del servidor
- **Integración:** Ejecutan CLI real y verifican output estructurado
- **E2E (opcional):** Levantan servidor MCP real via stdio y simulan cliente MCP

**Verificación:**
- Ejecutar `npm test` en `tools/mcp-server/` y verificar cobertura >80%

**Riesgos / ambigüedades:**
- **Riesgo:** Tests E2E lentos → Mitigación: Marcar E2E como opcionales, ejecutar solo en CI

---

### AC-11: Documentación con evidencia visual del demo

**Interpretación:**  
El `README.md` y/o `/walkthrough.md` debe incluir:
- Screenshots de configuración en Antigravity
- Ejemplo de prompt del agente y respuesta del servidor MCP
- Output de comandos CLI ejecutados

**Verificación:**
- Revisión manual por desarrollador

**Riesgos / ambigüedades:**
- Ninguno.

---

## 4. Research técnico

Basado en el research aprobado en Fase 1, se identificaron 2 alternativas principales:

### Alternativa A: Servidor MCP con stdio transport (RECOMENDADA)

**Descripción:**  
Implementar servidor MCP usando transporte stdio (stdin/stdout) para comunicación local con Google Antigravity. El servidor invoca el CLI de Extensio mediante `child_process.spawn()`.

**Ventajas:**
- Máxima performance (sin overhead de red)
- Seguridad mejorada (comunicación local)
- Simplicidad (no requiere autenticación)
- Soporte nativo en Google Antigravity
- Alineado con patrones LSP y MCP estándar

**Inconvenientes:**
- Limitado a uso local (no remoto)

**Decisión recomendada:** **Implementar Alternativa A (stdio transport)** para MVP.

**Justificación:**  
- Los acceptance criteria no requieren acceso remoto
- El CLI de Extensio está diseñado para uso local en monorepo
- Menor complejidad = más rápido time-to-market

---

### Alternativa B: Servidor MCP con HTTP SSE transport

**Descripción:**  
Servidor accesible vía HTTP con Server-Sent Events.

**Decisión:** **Descartada para MVP**. Puede considerarse en futuras iteraciones si surge necesidad de acceso remoto.

---

## 5. Agentes participantes

### Architect Agent
**Responsabilidades:**
- Validar coherencia arquitectónica global
- Revisar implementación del servidor MCP contra constitución de Extensio
- Aprobar que el servidor NO viola principios de drivers.md, clean-code.md, extensio-architecture.md
- Validar que la ubicación `tools/mcp-server` es apropiada

**Subáreas asignadas:**
- Revisión arquitectónica en Fase 4 (`architect/review.md`)

---

### QA Agent (activado en Fase 4 y Fase 5)
**Responsabilidades:**
- Diseñar tests unitarios e integración para el servidor MCP
- Implementar tests simulando llamadas MCP
- Verificar coverage >80%
- Ejecutar tests y reportar métricas

**Subáreas asignadas:**
- `tools/mcp-server/tests/` (tests unitarios e integración)
- Verificación en Fase 5

---

### Implementer Agent (rol genérico para Fase 4)
**Responsabilidades:**
- Crear estructura de carpetas `tools/mcp-server/`
- Implementar servidor MCP con TypeScript SDK (`@modelcontextprotocol/sdk`)
- Implementar 4 tools: `extensio_create`, `extensio_build`, `extensio_test`, `extensio_demo`
- Implementar resources: `extensio://drivers`, `extensio://modules`
- Crear JSON Schemas para validación de inputs
- Generar README.md con documentación de integración
- Actualizar workspace config del monorepo

**Subáreas asignadas:**
- `tools/mcp-server/src/` (implementación)
- `tools/mcp-server/README.md` (documentación)

---

**Handoffs:**
1. **Implementer → QA:** Tras completar implementación, QA diseña y ejecuta tests
2. **QA → Architect:** Tras tests, architect revisa coherencia arquitectónica
3. **Architect → Developer:** Architect presenta revisión al desarrollador para aprobación final

---

**Componentes necesarios**

| Acción | Tipo | Nombre | Justificación |
|--------|------|--------|---------------|
| **CREAR** | Tool (MCP Server) | `tools/mcp-server` | No existe servidor MCP actual |
| **CREAR** | Docs | `tools/mcp-server/README.md` | Documentación de integración |
| **CREAR** | Tests | `tools/mcp-server/tests/` | Verificación automatizada |
| **CREAR** | Demo | `.agent/artifacts/1-mcp-server-extensio-cli/demo/` | Evidencia de uso real |
| **MODIFICAR** | Config | `package.json` (raíz) | Añadir workspace `tools/**/*` |

**Ningún driver ni módulo requiere modificación.** El servidor MCP es una herramienta independiente que consume el CLI existente.

---

**Demo (si aplica)**

**Necesidad:** SÍ  
**Justificación:**  
AC-9 y AC-11 requieren explícitamente demo funcional con agente real y evidencia visual.

**Alineación con `constitution.extensio_architecture`:**  
El demo NO es un driver ni módulo del framework Extensio. Es una **herramienta de desarrollo** (`tools/`) que demuestra el uso del servidor MCP. No viola ningún principio arquitectónico de Extensio.

**Forma del demo:**
- Walkthrough documentado con screenshots
- Video/screencast (opcional, recomendado)
- Embeding en `walkthrough.md` final

---

## 6. Impacto de la tarea

### Arquitectura
**Cambios estructurales previstos:**
- Nueva carpeta `tools/` en raíz del monorepo
- Nuevo paquete `@extensio/mcp-server` publicable en npm
- Workspace de npm actualizado para incluir `tools/**/*`

**Impacto:** Bajo. No afecta a core, drivers ni modules.

---

### APIs / contratos
**Cambios en interfaces públicas:**  
Ninguno. El servidor MCP consume el CLI existente (`@extensio/cli`) sin modificarlo.

**Nueva interfaz pública:**  
Servidor MCP expone tools/resources vía protocolo MCP (JSON-RPC 2.0). Esta interfaz es **externa** al framework Extensio (para agentes AI), no afecta a contratos internos.

---

### Compatibilidad
**Riesgos de breaking changes:**  
Ninguno. Es una adición completamente nueva. No modifica código existente.

---

### Testing / verificación
**Tipos de pruebas necesarias:**
1. **Unitarios (Vitest):**
   - Validación de JSON Schemas
   - Parsing de outputs del CLI
   - Manejo de errores

2. **Integración (Vitest + CLI real):**
   - Ejecutar comandos del CLI y verificar outputs
   - Simulación de errores del CLI

3. **E2E (opcional, Playwright o MCP Inspector):**
   - Levantar servidor MCP real
   - Simular cliente MCP y verificar herramientas

4. **Manual (Demo con Google Antigravity):**
   - Configurar Antigravity
   - Ejecutar workflow completo (create → build → test)

---

## 7. Riesgos y mitigaciones

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| Child process failures (CLI cuelga o crashea) | Alto | Timeouts + kill signal, capturar stderr |
| Buffering stdio del servidor MCP | Medio | Usar streams line-buffered, chunked parsing |
| Paths inseguros (user input con `../`) | Alto | Validar paths relativos al monorepo, prohibir `..` |
| JSON Schema out-of-sync con CLI | Medio | Comentarios de sincronización, revisar en cada release |
| Google Antigravity breaking changes | Bajo | Versionar docs, monitorear changelog de MCP |
| Compatibilidad MCP protocol versions | Bajo | Especificar `protocolVersion: "2024-11-05"` en handshake |

---

## 8. Preguntas abiertas

Ninguna. Todos los acceptance criteria fueron clarificados en Fase 0.

---

## 9. Aprobación

Este análisis **requiere aprobación explícita del desarrollador**.

```yaml
approval:
  developer:
    decision: SI
    date: 2026-01-06T21:09:21+01:00
    comments: "Análisis aprobado. Proceder con planning detallado en Fase 3."
```

> Sin aprobación, esta fase **NO puede darse por completada** ni avanzar a Fase 3.
