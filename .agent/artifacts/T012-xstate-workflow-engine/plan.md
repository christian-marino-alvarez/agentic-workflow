---
id: T012-plan
phase: phase-3-planning
status: pending-approval
created: 2026-02-23
---

# Phase 3: Implementation Plan — T012

## Estrategia de implementación

**Enfoque**: Bottom-up — construir las capas base primero (types, parser) y subir hasta la UI.
**Branch**: `feature/T012-xstate-workflow-engine` desde `develop`

---

## Tasks de implementación

### Task 1: Types & Constants Foundation
**Agente**: engine-agent  
**Archivos**: `runtime/types.d.ts`, `runtime/constants.ts`  
**Duración**: 1h  

**Cambios**:
1. Añadir `ParsedSections` interface a `types.d.ts`:
   ```typescript
   interface ParsedSections {
     inputs: string[];
     outputs: string[];
     templates: string[];
     objective: string;
   }
   ```
2. Extender `WorkflowDef` con `ParsedSections`
3. Extender `WorkflowEngineState` con `currentPhaseId`, `parsedSections`
4. Añadir `WorkflowContext.phases` array y `currentPhaseIndex`
5. Añadir nuevos `ENGINE_EVENTS`: `PHASE_ADVANCE`, `PHASE_GATE_APPROVE`, `PHASE_GATE_REJECT`
6. Añadir nuevos `WORKFLOW_STATES`: `phase_executing`, `phase_gate`, `phase_done`

**Gate**: Compila sin errores, tipos exportados.

---

### Task 2: WorkflowParser — Universal Sections
**Agente**: engine-agent  
**Archivos**: `runtime/backend/workflow-parser.ts`  
**Duración**: 2h  
**Depende de**: Task 1

**Cambios**:
1. Añadir método `extractListItems(body, sectionName)` que:
   - Extrae la sección `## SectionName`
   - Parsea líneas que empiezan con `-` como items
   - Retorna `string[]`
2. Añadir extracción en `parseContent()`:
   ```typescript
   const inputs = this.extractListItems(body, 'Input');
   const outputs = this.extractListItems(body, 'Output');
   const templates = this.extractListItems(body, 'Template');
   const objective = this.extractSection(body, 'Objective') || 
                     this.extractSection(body, 'Objetivo') || '';
   ```
3. Incluir secciones en el `WorkflowDef` retornado
4. Añadir método `parsePhaseDirectory(lifecyclePath)`:
   - Lee todos los `phase-*.md` de un directorio
   - Los parsea y retorna ordenados por phase number
   - Retorna `ParsedWorkflow[]`

**Gate**: Todos los `.md` de phase-0 a phase-8 se parsean con secciones completas.

---

### Task 3: WorkflowEngine — Hierarchical XState Machine
**Agente**: engine-agent  
**Archivos**: `runtime/backend/workflow-engine.ts`  
**Duración**: 8h  
**Depende de**: Task 1, Task 2

**Cambios**:
1. Nuevo método `buildLifecycleMachine(phases: WorkflowDef[])`:
   - Genera estados jerárquicos para cada fase
   - Cada fase tiene sub-estados: `executing → gate → done | failed`
   - `onDone` transiciona a la siguiente fase
   - Guards: `hasGate` por fase, `gateApproved` por fase
2. Refactorizar `start()`:
   - Si `workflowId` es un lifecycle (`tasklifecycle-long|short`):
     - Leer todas las fases del directorio correspondiente
     - Construir máquina jerárquica con `buildLifecycleMachine`
   - Si es un workflow simple (init, coding):
     - Usar máquina plana actual (sin cambios)
3. Nuevo método `getCurrentPhase()`:
   - Retorna el `WorkflowDef` de la fase activa
   - Incluye `parsedSections`
4. Extender `getState()`:
   - Incluir `currentPhaseId`, `parsedSections` del phase activo
   - Incluir `phases` array con status por fase
5. Nuevo evento `PHASE_ADVANCE`:
   - Transiciona a la siguiente fase
   - Solo posible si el gate de la fase actual pasó

**Gate**: 
- Lifecycle Long genera máquina con 9 fases
- No se puede avanzar sin gate approve
- `getState()` retorna secciones del phase activo

---

### Task 4: Persistence — Hierarchical Snapshot
**Agente**: engine-agent  
**Archivos**: `runtime/backend/persistence.ts`  
**Duración**: 2h  
**Depende de**: Task 3

**Cambios**:
1. Usar `actor.getPersistedSnapshot()` de XState v5
2. Guardar snapshot completo en globalState
3. Restaurar con `createActor(machine, { snapshot })`
4. Mantener backward compatibility con estados simples existentes

**Gate**: Reiniciar extensión restaura la fase actual del lifecycle.

---

### Task 5: Chat Background — Structured LLM Injection
**Agente**: background-agent  
**Archivos**: `chat/background/index.ts`, `chat/prompts/index.ts`  
**Duración**: 3h  
**Depende de**: Task 3

**Cambios**:
1. Reemplazar inyección de `rawContent` (línea ~251) por secciones parseadas:
   ```typescript
   const phase = workflowState.currentPhase;
   const sections = phase.parsedSections;
   const workflowContext = buildPhaseContext(phase, sections);
   ```
2. Crear función `buildPhaseContext(phase, sections)`:
   - Construye prompt estructurado con: header, owner, objective, inputs, outputs, steps (con status), gate requirements, pass target
3. Eliminar `lifecycleStartPrompt()` de `prompts/index.ts`
4. Eliminar el bloque que construye `data.text = lifecycleStartPrompt(...)` en `handleSendMessage`
5. Las behavioral rules (Rule 0-4) se mantienen pero se simplifican

**Gate**: El LLM recibe secciones tipadas, no rawContent. No hay prompts hardcodeados.

---

### Task 6: Details Panel — Parsed Sections UI
**Agente**: view-agent  
**Archivos**: `chat/view/templates/details/html.ts`, `chat/view/templates/details/css.ts`  
**Duración**: 4h  
**Depende de**: Task 3

**Cambios**:
1. Refactorizar `renderDetailsPanel()` para mostrar:
   - **Header**: Phase name + owner
   - **Inputs**: Lista de inputs requeridos
   - **Outputs**: Lista de outputs esperados
   - **Gate**: Requirements con checkboxes (estado)
   - **Pass**: Next phase target
2. Estilos CSS para layout de 2 columnas (inputs | outputs)
3. Gate requirements con visual de progreso (0/N passed)
4. Animación suave al cambiar de fase

**Gate**: Panel muestra secciones de la fase activa correctamente.

---

### Task 7: Cleanup & Integration
**Agente**: engine-agent  
**Archivos**: Varios  
**Duración**: 1h  
**Depende de**: Tasks 1-6

**Cambios**:
1. Eliminar `rawContent` de `WorkflowDef` (ya no se usa)
2. Actualizar `handleLifecyclePhasesRequest` en chat background para usar engine phases
3. Verificar que la timeline view usa las phases del engine state
4. Eliminar código muerto

**Gate**: `npm run compile` sin errores. No queda rawContent ni hardcoded prompts.

---

## Testing

### Unit Tests
| Test | Cobertura |
|---|---|
| `WorkflowParser.extractListItems()` | Secciones Input, Output, Template |
| `WorkflowParser.parsePhaseDirectory()` | Todas las fases de Long y Short |
| `buildLifecycleMachine()` | Genera estados correctos |
| Gate guard | No permite avanzar sin approve |
| Persistence snapshot/restore | Estado se mantiene |

### Integration Tests
| Test | Cobertura |
|---|---|
| Lifecycle Long completo | 9 fases con transiciones |
| Gate reject → no avanza | Enforcement verificado |
| Session restore | Phase activa se restaura |
| LLM injection | Secciones tipadas en prompt |

---

## Puntos críticos

| Punto | Riesgo | Mitigación |
|---|---|---|
| Máquina jerárquica XState | Complejidad alta | Test unitario por fase |
| Backward compatibility | Workflows simples se rompen | Feature flag + doble path |
| rawContent elimination | LLM pierde contexto | Verificar que secciones tipadas cubren todo |
| Persistence migration | Estado viejo incompatible | Versionar schema, migrar automáticamente |

---

## Diagrama de dependencias

```
Task 1 (Types)
    ↓
Task 2 (Parser) ──→ Task 3 (Engine) ──→ Task 4 (Persistence)
                          ↓                     
                    Task 5 (LLM) ──→ Task 7 (Cleanup)
                          ↓
                    Task 6 (View)
```

---

## Gate — Phase 3
- [x] Plan de implementación con 7 tasks granulares
- [x] Responsabilidad por agente definida
- [x] Dependencias entre tasks documentadas
- [x] Testing strategy (unit + integration)
- [x] Puntos críticos identificados
- [x] Estimación: 21h total
- [ ] **Aprobación explícita del desarrollador: SI / NO**
