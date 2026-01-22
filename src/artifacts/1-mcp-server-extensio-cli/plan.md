---
artifact: plan
phase: phase-3-planning
owner: architect-agent
status: approved
related_task: 1-mcp-server-extensio-cli
---

# Implementation Plan — 1-mcp-server-extensio-cli

## 1. Resumen del plan

**Contexto:**  
Crear un servidor MCP (Model Context Protocol) que exponga las capacidades del CLI de Extensio (`@extensio/cli`) para que Google Antigravity y otros clientes AI puedan automatizar la creación de drivers, módulos y proyectos mediante agentes.

**Resultado esperado:**  
Al finalizar este plan, existirá:
- Paquete `@extensio/mcp-server` ubicado en `tools/mcp-server/`
- Servidor MCP funcional con 4 tools (`extensio_create`, `extensio_build`, `extensio_test`, `extensio_demo`)
- Resources MCP (`extensio://drivers`, `extensio://modules`)
- README.md con guía de integración para Google Antigravity
- Tests automatizados (unitarios + integración, coverage >80%)
- Demo funcional con agente real + evidencia visual

**Alcance:**  
- **Incluye:**
  - Implementación completa del servidor MCP con stdio transport
  - Validación de inputs con JSON Schema
  - Manejo estructurado de errores
  - Documentación para agentes AI
  - Tests automatizados
  - Demo con Google Antigravity

- **Excluye:**
  - HTTP SSE transport (fuera de scope para MVP)
  - Modificaciones al CLI existente (`@extensio/cli`)
  - Creación de nuevos drivers o módulos (solo herramienta)
  - Publicación a npm (preparación sí, publicación manual post-task)

---

## 2. Inputs contractuales

**Task:** `.agent/artifacts/1-mcp-server-extensio-cli/task.md`  
**Analysis:** `.agent/artifacts/1-mcp-server-extensio-cli/analysis.md`  
**Research:** `.agent/artifacts/1-mcp-server-extensio-cli/researcher/research.md`

**Acceptance Criteria relevantes:**
- AC-1 a AC-11 (todos cubiertos en analysis.md)

**Dispatch de dominios:**

```yaml
plan:
  workflows:
    drivers:
      action: none
      workflow: null
    
  dispatch:
    - domain: tools
      action: create
      workflow: null  # No existe workflow específico para tools/, es implementación directa
      justification: "Creación de nueva herramienta MCP server en tools/mcp-server/"
    
    - domain: qa
      action: verify
      workflow: null  # QA agent ejecuta verificación según constitution.qa.md
      justification: "Verificación de tests y cobertura en Fase 5"
```

---

## 3. Desglose de implementación (pasos)

### Paso 1: Setup del proyecto MCP server
**Descripción:**  
Crear estructura de carpetas `tools/mcp-server/` con package.json, tsconfig.json y estructura de src/.

**Dependencias:** Ninguna

**Entregables:**
- `tools/mcp-server/package.json` (configurado con name, bin, dependencies)
- `tools/mcp-server/tsconfig.json`
- `tools/mcp-server/src/index.ts` (entry point vacío)
- Workspace del monorepo actualizado (`package.json` raíz)

**Agente responsable:** Implementer Agent

---

### Paso 2: Implementar servidor MCP base
**Descripción:**  
Configurar servidor MCP con TypeScript SDK (`@modelcontextprotocol/sdk`), handshake, metadatos y transporte stdio.

**Dependencias:** Paso 1

**Entregables:**
- `tools/mcp-server/src/index.ts` (servidor MCP funcional básico)
- `tools/mcp-server/src/server.ts` (lógica del servidor)

**Agente responsable:** Implementer Agent

---

### Paso 3: Implementar MCP Tools (CLI commands)
**Descripción:**  
Crear 4 tools MCP que mapeen a comandos del CLI:
- `extensio_create`
- `extensio_build`
- `extensio_test`
- `extensio_demo`

Cada tool debe:
- Definir `inputSchema` (JSON Schema)
- Validar inputs
- Ejecutar comando CLI mediante child_process
- Capturar stdout/stderr
- Retornar resultado estructurado

**Dependencias:** Paso 2

**Entregables:**
- `tools/mcp-server/src/tools/extensio-create.ts`
- `tools/mcp-server/src/tools/extensio-build.ts`
- `tools/mcp-server/src/tools/extensio-test.ts`
- `tools/mcp-server/src/tools/extensio-demo.ts`
- `tools/mcp-server/src/schemas/` (JSON Schemas para cada tool)

**Agente responsable:** Implementer Agent

---

### Paso 4: Implementar MCP Resources
**Descripción:**  
Crear resources para permitir a agentes explorar el estado del monorepo:
- `extensio://drivers` → Lista drivers en `packages/drivers/`
- `extensio://modules` → Lista modules en `packages/modules/`

**Dependencias:** Paso 2

**Entregables:**
- `tools/mcp-server/src/resources/list-drivers.ts`
- `tools/mcp-server/src/resources/list-modules.ts`

**Agente responsable:** Implementer Agent

---

### Paso 5: Manejo de errores y validación
**Descripción:**  
Implementar capa de manejo de errores estructurado con validación de paths, timeouts, y captura de errores del CLI.

**Dependencias:** Paso 3

**Entregables:**
- `tools/mcp-server/src/utils/error-handler.ts`
- `tools/mcp-server/src/utils/path-validator.ts`
- `tools/mcp-server/src/utils/cli-executor.ts` (wrapper para child_process con timeout)

**Agente responsable:** Implementer Agent

---

### Paso 6: Crear documentación (README.md)
**Descripción:**  
Documentar instalación, configuración en Google Antigravity (`mcp_config.json`), ejemplos de uso y troubleshooting.

**Dependencias:** Paso 5 (implementación completa)

**Entregables:**
- `tools/mcp-server/README.md`

**Agente responsable:** Implementer Agent

---

### Paso 7: Implementar tests unitarios e integración
**Descripción:**  
QA Agent diseña e implementa tests con Vitest:
- Unitarios: Mockear CLI, validar schemas, error handling
- Integración: Ejecutar CLI real, verificar outputs

**Dependencias:** Paso 6

**Entregables:**
- `tools/mcp-server/tests/unit/` (tests unitarios)
- `tools/mcp-server/tests/integration/` (tests integración)
- Coverage report >80%

**Agente responsable:** QA Agent

---

### Paso 8: Crear demo con agente real
**Descripción:**  
Configurar Google Antigravity con el servidor MCP y ejecutar workflow completo:
1. Crear driver con `extensio_create`
2. Compilar con `extensio_build`
3. Ejecutar tests con `extensio_test`

Documentar con screenshots/video.

**Dependencias:** Paso 6

**Entregables:**
- `.agent/artifacts/1-mcp-server-extensio-cli/demo/walkthrough.md`
- Screenshots/video del demo

**Agente responsable:** Implementer Agent (con soporte de QA para validación)

---

**Orden de ejecución:**  
Paso 1 → Paso 2 → (Paso 3, Paso 4) en paralelo → Paso 5 → Paso 6 → (Paso 7, Paso 8) en paralelo

---

## 4. Asignación de responsabilidades (Agentes)

### Architect-Agent
**Responsabilidades:**
- Validar coherencia arquitectónica de la implementación
- Revisar que el servidor MCP no viola constitución de Extensio
- Aprobar ubicación `tools/mcp-server/` como apropiada
- Generar `architect/review.md` en Fase 4

**Entregables:** `architect/review.md`

---

### Implementer-Agent
**Responsabilidades:**
- Crear estructura completa de `tools/mcp-server/`
- Implementar servidor MCP con TypeScript SDK
- Implementar 4 tools + 2 resources
- Crear JSON Schemas para validación
- Generar README.md
- Crear demo funcional con Google Antigravity

**Entregables:**
- `tools/mcp-server/src/**` (código fuente)
- `tools/mcp-server/README.md`
- `.agent/artifacts/1-mcp-server-extensio-cli/demo/`

---

### QA-Agent
**Responsabilidades:**
- Diseñar estrategia de testing (unitarios + integración)
- Implementar tests con Vitest
- Ejecutar tests y reportar coverage
- Validar demo funcional

**Entregables:**
- `tools/mcp-server/tests/**`
- Coverage report
- Test execution report en `verification.md`

---

**Handoffs:**
1. **Implementer → Architect:** Tras completar Paso 6, architect revisa implementación
2. **Architect → QA:** Tras aprobación arquitectónica, QA ejecuta tests (Paso 7)
3. **QA → Implementer:** QA reporta bugs (si existen), implementer corrige
4. **Implementer → Developer:** Tras demo (Paso 8), presenta walkthrough al desarrollador

---

**Componentes (herramientas)**

| Componente | Acción | Responsable | Herramienta | Justificación |
|------------|--------|-------------|-------------|---------------|
| `tools/mcp-server/` | CREATE | Implementer | Manual (TypeScript) | No existe tool para scaffolding de MCP servers |
| Tests | CREATE | QA | Vitest | constitution.extensio_architecture.PERMANENT §8 |
| Demo | CREATE | Implementer | Manual + `tools.extensio_cli` | Demo usa CLI para mostrar funcionalidad |

**Nota:** No existe workflow específico para creación de herramientas en `tools/`. Es implementación directa siguiendo estructura de npm package estándar.

---

**Demo**

**Estructura esperada:**
```
.agent/artifacts/1-mcp-server-extensio-cli/demo/
├── walkthrough.md           # Documentación paso a paso
├── screenshots/             # Evidencia visual
│   ├── antigravity-config.png
│   ├── agent-create.png
│   ├── agent-build.png
│   └── agent-test.png
└── demo-driver/             # Driver creado por el agente (opcional)
```

**Tool obligatorio:**  
El demo ejecutará `tools.extensio_cli` mediante el servidor MCP para demostrar funcionalidad real.

**Alineación con `constitution.extensio_architecture`:**  
El demo NO es parte del framework Extensio. Es evidencia de uso del servidor MCP. No viola ningún principio arquitectónico.

---

## 5. Estrategia de testing y validación

### Unit tests (Vitest)
**Alcance:**
- Validación de JSON Schemas (inputs tools)
- Parsing de stdout/stderr del CLI
- Error handling (exit codes, timeouts)
- Path validation (prohibir `..`, paths fuera de monorepo)

**Herramienta:** Vitest (per `constitution.extensio_architecture` §8)

**Cobertura esperada:** >80%

---

### Integration tests (Vitest + CLI real)
**Flujos cubiertos:**
- Ejecutar `extensio_create` con flags válidos → Verificar carpeta creada
- Ejecutar `extensio_build` con browser inválido → Verificar error estructurado
- Ejecutar `extensio_test` en módulo sin tests → Verificar resultado

**Herramienta:** Vitest con ejecución real del CLI

**Cobertura esperada:** Comandos prioritarios (`create`, `build`, `test`) al 100%

---

### E2E / Manual
**Escenarios clave:**
- Configurar Antigravity con `mcp_config.json`
- Agente crea driver completo
- Agente compila driver para Chrome
- Agente ejecuta tests del driver

**Herramienta:** Manual (Google Antigravity)

**Evidencia:** Screenshots/video en walkthrough.md

---

**Trazabilidad tests ↔ acceptance criteria:**

| AC | Test Type | Descripción |
|----|-----------|-------------|
| AC-1 | Unit | Servidor registra 4 tools |
| AC-2 | Integration | Comandos `build`, `create`, `test` con todas las opciones |
| AC-4 | Unit | Handshake MCP retorna metadatos correctos |
| AC-7 | Unit | Validación de inputs con JSON Schema |
| AC-8 | Integration | Captura de errores del CLI |
| AC-9 | Manual | Demo con agente real |
| AC-10 | Unit + Integration | Coverage >80% |

---

## 6. Plan de demo (si aplica)

**Objetivo de la demo:**  
Demostrar que un agente AI (Google Antigravity) puede usar el servidor MCP para crear, compilar y testear un driver de Extensio sin intervención manual.

**Escenario:**
1. Configurar servidor MCP en Antigravity (`mcp_config.json`)
2. Agente solicita: "Create a new driver called 'demo-mcp' with multi-browser support"
3. Servidor MCP ejecuta `extensio_create --type driver --name demo-mcp`
4. Agente solicita: "Build the demo-mcp driver for Chrome"
5. Servidor MCP ejecuta `extensio_build --browsers chrome` en `packages/drivers/demo-mcp/`
6. Agente solicita: "Run tests for demo-mcp"
7. Servidor MCP ejecuta `extensio_test` en `packages/drivers/demo-mcp/`

**Datos de ejemplo:**
- Driver name: `demo-mcp`
- Target browser: Chrome
- Test type: Unit

**Criterios de éxito de la demo:**
- ✅ Agente completa workflow sin errores
- ✅ Driver `demo-mcp` existe en `packages/drivers/`
- ✅ Driver compila correctamente para Chrome
- ✅ Tests se ejecutan (aunque fallen por ser demo vacío)
- ✅ Screenshots documentan cada paso

---

## 7. Estimaciones y pesos de implementación

| Paso | Descripción | Esfuerzo | Justificación |
|------|-------------|----------|---------------|
| 1 | Setup proyecto | Bajo | Scaffolding estándar de npm package |
| 2 | Servidor MCP base | Medio | Usar SDK oficial, configuración straightforward |
| 3 | Implementar 4 tools | Alto | Núcleo del servidor, requiere validación + child_process |
| 4 | Implementar resources | Bajo | Leer filesystem, retornar JSON |
| 5 | Error handling | Medio | Casos edge (timeouts, paths, stderr) |
| 6 | Documentación | Medio | README completo con ejemplos |
| 7 | Tests | Alto | Unitarios + integración, coverage >80% |
| 8 | Demo | Medio | Configurar Antigravity + documentar |

**Estimación total:** ~80-100 tool calls (dependiendo de bugs encontrados)

**Timeline aproximado:**  
Asumiendo ejecución secuencial: 1-2 horas de trabajo de agente

**Suposiciones:**
- No hay breaking changes en MCP SDK durante implementación
- Google Antigravity disponible para testing
- CLI de Extensio funciona correctamente

---

## 8. Puntos críticos y resolución

### Punto crítico 1: Child process management (CLI hangs)
**Riesgo:**  
El CLI puede colgarse en prompts interactivos o builds largos, bloqueando el servidor MCP.

**Impacto:** Alto - bloquea agente, mala UX

**Estrategia de resolución:**
1. Siempre usar flag `--non-interactive` en comandos del CLI
2. Implementar timeout de 5 minutos para todos los comandos
3. Enviar SIGTERM → esperar 5s → SIGKILL si no responde
4. Implementar MCP progress notifications para builds largos (AC-2)

---

### Punto crítico 2: Path security (path traversal attacks)
**Riesgo:**  
Agente malicioso o bug podría intentar acceder a paths fuera del monorepo (`../../../etc/passwd`).

**Impacto:** Alto - vulnerabilidad de seguridad

**Estrategia de resolución:**
1. Validar todos los paths con `path.resolve()` y verificar que inician con monorepo root
2. Prohibir `..` en inputs de usuario
3. JSON Schema con pattern regex para nombres válidos (`^[a-z0-9-]+$`)
4. Test de seguridad explícito con path traversal attempt

---

### Punto crítico 3: JSON Schema out-of-sync con CLI
**Riesgo:**  
Si el CLI añade flags nuevos, los schemas quedan obsoletos.

**Impacto:** Medio - agentes no pueden usar nuevas features

**Estrategia de resolución:**
1. Comentarios en código señalando sincronización manual
2. Test de integración que ejecuta `--help` del CLI y extrae flags
3. Documentar en README necesidad de sync manual en cada release de CLI
4. Futuro: Generar schemas automáticamente desde CLI source code (fuera de scope MVP)

---

### Punto crítico 4: Buffering de stdio (servidor MCP)
**Riesgo:**  
Outputs largos del CLI pueden causar buffering issues en stdio transport.

**Impacto:** Medio - pérdida de datos, respuestas incompletas

**Estrategia de resolución:**
1. Usar `child_process.spawn()` con streams (no `exec`)
2. Acumular stdout/stderr en chunks
3. Line-buffered parsing para progress updates
4. Test con build largo (compilar para 3 browsers) verificando output completo

---

## 9. Dependencias y compatibilidad

**Dependencias internas:**
- `@extensio/cli` (consume vía child_process, NO como dependency npm)

**Dependencias externas:**
- `@modelcontextprotocol/sdk` (TypeScript SDK oficial de MCP)
- `zod` (validación JSON Schema)
- `commander` (ya usado por CLI, compatible)

**Compatibilidad entre navegadores:**  
N/A - El servidor MCP es Node.js server-side, agnóstico de navegador.

**Restricciones arquitectónicas relevantes:**
- `constitution.extensio_architecture.PERMANENT §8`: Tests con Vitest/Playwright
- `constitution.clean_code`: Funciones pequeñas (<6 líneas recomendado)
- No viola ningún principio de drivers.md (no es un driver)

---

## 10. Criterios de finalización

Checklist para considerar implementación "Done":

- [ ] Existe `tools/mcp-server/` con estructura completa
- [ ] `package.json` raíz incluye workspace `tools/**/*`
- [ ] Servidor MCP funcional con 4 tools + 2 resources
- [ ] README.md completo con guía de integración Antigravity
- [ ] Tests unitarios + integración con coverage >80%
- [ ] Demo funcional ejecutado con Google Antigravity
- [ ] Screenshots/video del demo en walkthrough.md
- [ ] Architect review aprueba coherencia arquitectónica
- [ ] QA agent confirma tests passing
- [ ] Todos los 11 acceptance criteria cubiertos

**Verificaciones obligatorias:**
1. Ejecutar `npm test` en `tools/mcp-server/` → Todos pasan
2. Ejecutar demo completo según walkthrough → Funciona sin errores
3. Configurar Antigravity con `mcp_config.json` → Servidor se descubre correctamente
4. Architect review → Aprobado (SI)

---

## 11. Aprobación del desarrollador (OBLIGATORIA)

Este plan **requiere aprobación explícita y binaria**.

```yaml
approval:
  developer:
    decision: SI
    date: 2026-01-06T21:14:54+01:00
    comments: "Plan aprobado. Proceder con implementación en Fase 4."
```
