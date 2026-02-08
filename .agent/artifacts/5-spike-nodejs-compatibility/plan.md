---
artifact: plan
phase: phase-3-planning
owner: architect-agent
status: draft
related_task: 5-spike-nodejs-compatibility
---

# Implementation Plan — 5-spike-nodejs-compatibility

🏛️ **architect-agent**: Plan de implementación para spike técnico de compatibilidad Node.js

## Identificacion del agente (OBLIGATORIA)
🏛️ **architect-agent**: Plan de implementación basado en POC verificado - Backend TypeScript viable

## 1. Resumen del plan

**Contexto**: El roadmap ADR-001 requiere implementar multi-agent workflows. Era necesario verificar si `@openai/agents` puede ejecutarse en VS Code Extension Host (Node.js 20.x). El POC confirmó compatibilidad.

**Resultado esperado**: Al finalizar este spike, el proyecto tendrá:
1. **ADR documentado** - Decisión arquitectónica formal con justificación
2. **POC funcional expandido** - Agent demo con tool calling en Extension Host
3. **Documentación de uso** - Guía para desarrolladores sobre @openai/agents

**Alcance**:
- ✅ **Incluye**: ADR, POC demo, docs de setup
- ❌ **Excluye**: Implementación completa de multi-agent system (eso es T014-T018)
- ❌ **Excluye**: Integración con UI (reservado para fases posteriores)

---

## 2. Inputs contractuales

- **Task**: [task.md](file:///Users/milos/Documents/workspace/agentic-workflow/.agent/artifacts/5-spike-nodejs-compatibility/task.md)
- **Analysis**: [analysis.md](file:///Users/milos/Documents/workspace/agentic-workflow/.agent/artifacts/5-spike-nodejs-compatibility/analysis.md)
- **Acceptance Criteria**: AC-1 (ADR), AC-2 (POC), AC-4 (docs)

**Dispatch de dominios**: No aplica (spike técnico sin componentes permanentes)

```yaml
plan:
  workflows: []
  dispatch: []
```

---

## 3. Desglose de implementación (pasos)

### Paso 1: Crear ADR (Architecture Decision Record)

**Descripción**: Documentar la decisión arquitectónica con formato ADR estándar (Context, Decision, Consequences).

**Dependencias**: Ninguna (puede ejecutarse inmediatamente)

**Entregables**:
- `spike/nodejs-compatibility/adr.md` con secciones:
  - Context (problema y objetivo)
  - Decision (Backend TypeScript con @openai/agents)
  - Consequences (ventajas, trade-offs, impacto en roadmap)
  - POC evidence (referencia al test exitoso)

**Agente responsable**: architect-agent

---

### Paso 2: Expandir POC con Agent funcional

**Descripción**: Crear un agent demo que demuestre capacidades básicas de @openai/agents en Extension Host.

**Dependencias**: Paso 1 (ADR) debe estar completado  

**Entregables**:
- `spike/nodejs-compatibility/poc-node20/agent-demo.ts`:
  - Agent con instructions personalizadas
  - Tool calling básico (ej: calculator tool)
  - Handoff entre 2 agents (opcional)
  - Streaming de responses
- Test script para ejecutar el demo

**Agente responsable**: neo-agent

---

### Paso 3: Documentar setup y best practices

**Descripción**: Crear guía de uso de @openai/agents específica para Extension Host environment.

**Dependencias**: Paso 2 (POC expandido) debe estar funcionando

**Entregables**:
- `docs/openai-agents-setup.md`:
  - Requisitos mínimos (Node.js version)
  - Instalación de dependencias
  - Ejemplo de agent básico
  - Best practices para Extension Host (performance, error handling)
  - Troubleshooting común

**Agente responsable**: neo-agent

---

### Paso 4: Actualizar package.json (si necesario)

**Descripción**: Verificar que `engines.vscode` está actualizado y documentar requisitos.

**Dependencias**: Paso 3 (docs) debe estar completo

**Entregables**:
- Verificación de `package.json`:
  - `engines.vscode` especifica versión mínima
  - @openai/agents version locked correctamente

**Agente responsable**: architect-agent

---

### Paso 5: Review y consolidación final

**Descripción**: Architect revisa todos los entregables y valida coherencia.

**Dependencias**: Pasos 1-4 completados

**Entregables**:
- Checklist de verificación completado
- Confirmación de que todos los AC están cubiertos

**Agente responsable**: architect-agent

---

## 4. Asignación de responsabilidades (Agentes)

### 🏛️ Architect-Agent
**Responsabilidades**:
- Crear ADR con decisión arquitectónica (Paso 1)
- Verificar package.json requirements (Paso 4)
- Review final y validación (Paso 5)

**Entregables**:
- `spike/nodejs-compatibility/adr.md`
- Validación de package.json
- Sign-off final del spike

---

### 🤖 Neo-Agent (implementador genérico)
**Responsabilidades**:
- Expandir POC con agent funcional (Paso 2)
- Crear documentación de setup (Paso 3)

**Entregables**:
- `spike/nodejs-compatibility/poc-node20/agent-demo.ts`
- `spike/nodejs-compatibility/poc-node20/run-demo.sh`
- `docs/openai-agents-setup.md`

---

**Handoffs**:
1. architect → neo (después de ADR): "ADR completado, procede con POC expansion"
2. neo → architect (después de docs): "POC y docs completos, listos para review"
3. architect → developer: "Spike completado, solicito aprobación final"

---

**Componentes**: No aplica (spike no crea componentes permanentes)

**Demo**: 
✅ **Requerido**: Agent demo ejecutable

**Estructura esperada**:
```
spike/nodejs-compatibility/poc-node20/
├── package.json
├── test-import.js (ya existe, verificado)
├── agent-demo.ts (NUEVO - Neo-agent)
├── run-demo.sh (NUEVO - Neo-agent)
└── README.md (NUEVO - Neo-agent)
```

**Tool obligatorio**: Ninguno (código manual TypeScript)

---

## 5. Estrategia de testing y validación

### Unit tests
**Alcance**: No aplica para este spike (es validación técnica, no código productivo)

**Herramientas**: N/A

---

### Integration tests
**Alcance**: Verificar que el POC demo funciona en Extension Host environment

**Flujos cubiertos**:
1. Import de @openai/agents exitoso (ya verificado en test-import.js)
2. Agent creation y configuration
3. Tool calling execution
4. Response streaming (si implementado)

**Comando de ejecución**:
```bash
cd spike/nodejs-compatibility/poc-node20
./run-demo.sh
```

**Criterio de éxito**: Demo ejecuta sin errores y muestra agent responses

---

### Manual (E2E)
**Escenario clave**: Developer ejecuta el demo y verifica output

**Pasos**:
1. Navegar a `spike/nodejs-compatibility/poc-node20/`
2. Ejecutar `npm install` (si no está instalado)
3. Ejecutar `./run-demo.sh`
4. Verificar output en consola muestra agent interactions
5. Confirmar que no hay errores de Node.js version incompatibility

**Criterio de éxito**: Output visible con agent responses coherentes

---

**Trazabilidad (Tests ↔ AC)**:
- AC-1 (ADR): Verificado manualmente por architect (review)
- AC-2 (POC): test-import.js + agent-demo.ts execution
- AC-3 (Aprobación): Gate 3 (developer approval)
- AC-4 (Docs): Manual review por developer
- AC-5 (Impacto roadmap): Documentado en ADR sección "Consequences"

---

## 6. Plan de demo (si aplica)

**Objetivo de la demo**: Demostrar que @openai/agents funciona correctamente en Extension Host con agent funcional básico.

**Escenario**:
1. Agent "Calculator Assistant" recibe query: "What is 25 * 4?"
2. Agent usa calculator tool para ejecutar operación
3. Agent retorna respuesta: "The result is 100"

**Datos de ejemplo**:
- Input: "What is 25 * 4?"
- Tool: calculator (suma, resta, multiplicación, división)
- Expected output: "The result is 100"

**Criterios de éxito de la demo**:
- ✅ Agent se crea sin errores
- ✅ Tool calling ejecuta correctamente
- ✅ Response es coherente y correcta
- ✅ No hay warnings de Node.js version incompatibility

---

## 7. Estimaciones y pesos de implementación

### Estimación por paso:

| Paso | Descripción | Agente | Esfuerzo | Tiempo estimado |
|------|-------------|--------|----------|-----------------|
| 1 | Crear ADR | architect | Bajo | 15-20 min |
| 2 | Expandir POC agent demo | neo | Medio | 30-40 min |
| 3 | Documentar setup | neo | Bajo | 20-25 min |
| 4 | Verificar package.json | architect | Bajo | 5-10 min |
| 5 | Review final | architect | Bajo | 10-15 min |

**Timeline aproximado**: 1.5 - 2 horas (incluyendo reviews)

**Suposiciones**:
- El template de ADR es estándar y directo
- POC demo usa ejemplo simple (calculator tool)
- No se requieren dependencias adicionales más allá de @openai/agents

---

## 8. Puntos críticos y resolución

### Punto crítico 1: Configuración de API keys para demo

**Riesgo**: El POC demo necesita API key de OpenAI para funcionar.

**Impacto**: Medio - Demo no ejecutable sin API key

**Estrategia de resolución**:
- Documentar en README que se requiere `OPENAI_API_KEY` en environment
- Instrucciones claras en `run-demo.sh` para setup
- Alternativamente: Mock mode para demo sin API key (opcional)

---

### Punto crítico 2: Streaming puede no funcionar en todos los entornos

**Riesgo**: Extension Host environment puede tener limitaciones con streaming.

**Impacto**: Bajo - No afecta viabilidad, solo funcionalidad avanzada

**Estrategia de resolución**:
- Implementar streaming como feature opcional en demo
- Si falla streaming, demo funciona igual con responses no-stream
- Documentar limitaciones si se detectan

---

### Punto crítico 3: Performance del demo en Extension Host

**Riesgo**: Demo puede ser lento si agent hace operaciones pesadas.

**Impacto**: Bajo - Es solo demostración, no código productivo

**Estrategia de resolución**:
- Usar ejemplo simple (calculator) que es instantáneo
- Documentar en `docs/openai-agents-setup.md` consideraciones de performance

---

## 9. Dependencias y compatibilidad

### Dependencias internas:
- `@openai/agents: ^0.4.5` (ya instalado)
- `openai: ^6.17.0` (ya instalado)
- VS Code Extension API (ya disponible)

### Dependencias externas:
- Node.js 20+ (disponible en Extension Host)
- OpenAI API key (requerido para demo funcional)

### Compatibilidad entre navegadores:
**No aplica** - Este spike es backend Node.js, no browser

### Restricciones arquitectónicas:
- Código debe ejecutarse en Extension Host environment (Node.js runtime)
- No modificar componentes production existentes
- POC debe estar aislado en directorio `spike/`

---

## 10. Criterios de finalización

**Condiciones objetivas para considerar el spike "Done"**:

- [ ] **AC-1**: ADR documentado en `spike/nodejs-compatibility/adr.md`
  - Incluye Context, Decision, Consequences
  - Referencia POC evidence

- [ ] **AC-2**: POC funcional en `spike/nodejs-compatibility/poc-node20/agent-demo.ts`
  - Agent demo ejecuta sin errores
  - Tool calling funcional
  - Output visible y coherente

- [ ] **AC-3**: Decisión validada por architect y aprobada por developer
  - Architect validation: Sign-off en plan.md
  - Developer approval: `approval.developer.decision == SI`

- [ ] **AC-4**: Documentación creada en `docs/openai-agents-setup.md`
  - Setup instructions claras
  - Best practices documentadas
  - Troubleshooting incluido

- [ ] **AC-5**: Impacto en roadmap documentado en ADR
  - Tareas T014-T018 confirmadas (sin cambios)
  - Roadmap BACKLOG.md actualizado (si necesario)

- [ ] **Verificaciones obligatorias**:
  - test-import.js ejecuta exitosamente
  - agent-demo.ts ejecuta sin errores
  - No hay regresiones en package.json

---

## 11. Aprobación del desarrollador (OBLIGATORIA)

Este plan **requiere aprobación explícita y binaria**.

```yaml
approval:
  architect:
    validated: true
    validated_by: "architect-agent"
    validated_at: "2026-02-08T15:16:07Z"
    notes: "Plan alineado con analysis.md. Spike técnico claro y acotado. Estimación razonable."
  developer:
    decision: SI
    date: 2026-02-08T15:18:27+01:00
    comments: Plan de implementación aprobado
```

> Sin aprobación `SI`, esta fase **NO puede avanzar** a Phase 4 (Implementation).
