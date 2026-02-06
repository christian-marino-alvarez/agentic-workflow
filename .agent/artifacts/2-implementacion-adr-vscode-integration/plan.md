---
artifact: plan
phase: phase-3-planning
owner: architect-agent
status: approved
related_task: 2-implementacion-adr-vscode-integration
---

# Implementation Plan — 2-implementacion-adr-vscode-integration

🏛️ **architect-agent**: Plan detallado para crear roadmap estructurado de implementación del ADR-001

## 1. Resumen del plan

**Contexto**: El ADR-001 define arquitectura completa para integrar OpenAI ChatKit UI, OpenAI Agent SDK y Runtime MCP en VS Code Extension con stack TypeScript. Este plan define cómo transformar ese ADR en un roadmap ejecutable.

**Resultado esperado**: 
- Documento `roadmap.md` con todas las tareas necesarias para implementar ADR-001
- Tareas organizadas por dominios (Setup, UI, Backend, MCP, Security, Release)
- Cada tarea con: ID, título, objetivo, dependencias, agente responsable, componentes afectados
- Diagrama Mermaid de dependencias entre tareas

**Alcance**:
- ✅ **INCLUYE**: Creación del roadmap completo, organización de tareas, definición de dependencias
- ❌ **EXCLUYE**: Implementación de código (eso será en tareas posteriores según el roadmap)

---

## 2. Inputs contractuales

- **Task**: `.agent/artifacts/2-implementacion-adr-vscode-integration/task.md`
- **Analysis**: `.agent/artifacts/2-implementacion-adr-vscode-integration/analysis.md`
- **Acceptance Criteria**: AC-1 (Roadmap), AC-2 (Inputs), AC-3 (Outputs), AC-4 (Restricciones), AC-5 (Aprobación)

**Dispatch de dominios**:
```yaml
plan:
  workflows:
    - domain: roadmap-creation
      action: create
      workflow: none  # No existe workflow específico, se ejecuta manualmente

  dispatch: []  # Sin dispatch secundario
```

---

## 3. Desglose de implementación (pasos)

### Paso 1: Analizar y agrupar componentes del ADR-001

**Descripción**: Revisar ADR-001 section por section y extraer todos los componentes técnicos mencionados. Agruparlos en 6 dominios:
1. Setup/Config
2. UI/ChatKit  
3. Backend/Extension Host
4. Agent SDK/ChatKit Python Backend
5. MCP/Governance
6. Security
7. Release/CI-CD

**Dependencias**: Ninguna  
**Entregables**: Lista de componentes por dominio  
**Agente responsable**: `architect-agent`

---

### Paso 2: Definir tareas atómicas por dominio

**Descripción**: Para cada componente identificado, crear 1+ tareas específicas. Cada tarea debe ser:
- **Atómica**: Ejecutable en 1 sesión de trabajo
- **Verificable**: Con criterios de completitud claros
- **Asignada**: A un agente específico

**Dependencias**: Paso 1  
**Entregables**: Lista completa de tareas (estimado: 20-30 tareas)  
**Agente responsable**: `architect-agent`

---

### Paso 3: Establecer dependencias entre tareas

**Descripción**: Analizar cada tarea y determinar:
- Qué tareas son prerequisito (deben completarse antes)
- Qué tareas pueden ejecutarse en paralelo
- Orden óptimo de ejecución

**Técnica**: Topological sort de DAG (Directed Acyclic Graph)

**Dependencias**: Paso 2  
**Entregables**: Grafo de dependencias  
**Agente responsable**: `architect-agent`

---

### Paso 4: Priorizar tareas

**Descripción**: Asignar prioridades considerando:
- Dependencias técnicas (prerequisitos obligatorios)
- Riesgo (tareas con mayor incertidumbre primero)
- Valor (features críticas vs nice-to-have)

**Dependencias**: Paso 3  
**Entregables**: Tareas ordenadas por prioridad  
**Agente responsable**: `architect-agent`

---

### Paso 5: Crear `roadmap.md`

**Descripción**: Escribir el documento roadmap final con:
- Tabla de tareas (ID, Título, Dominio, Agente, Dependencias, Componentes)
- Diagrama Mermaid de dependencias
- Agrupación visual por dominios
- Metadatos completos por tarea

**Dependencias**: Paso 4  
**Entregables**: `roadmap.md` completo  
**Agente responsable**: `architect-agent`

---

### Paso 6: Validación contra AC

**Descripción**: Verificar que el roadmap cumple TODOS los AC:
- AC-1: Roadmap completo con tareas atómicas  ✅
- AC-2: Basado en ADR-001 + research ✅
- AC-3: Formato tabla + metadatos ✅
- AC-4: Cubre 5 restricciones obligatorias ✅
- AC-5: Listo para aprobación del desarrollador ✅

**Dependencias**: Paso 5  
**Entregables**: Checklist de validación completado  
**Agente responsable**: `architect-agent`

---

## 4. Asignación de responsabilidades (Agentes)

**Architect-Agent**:
- Responsabilidades: Ejecutar todos los pasos 1-6 (es una tarea de planificación pura)
- Creación del roadmap completo
- Validación contra AC

**Handoffs**:
- `architect-agent` → Desarrollador (para aprobación del roadmap)
- Desarrollador aprueba → `architect-agent` avanza a Phase 4

**Componentes** (que el roadmap creará):
El roadmap definirá tareas para CREAR:
- Módulo chat/chatkit-integration.ts
- Lit components (dropdown modelos)
- ChatKit Python backend (microservicio)
- Runtime MCP middleware layer
- Sistema RBAC
- UI configuración (módulo setup)
- CI/CD pipelines (4 workflows)
- Release scripts

El roadmap definirá tareas para MODIFICAR:
- src/extension/webview/ (integrar ChatKit)
- src/extension/setup/ (config modelos)
- package.json (scripts build/release)

El roadmap definirá tareas para ELIMINAR:
- UI chat custom actual (si existe)

**Demo** (que el roadmap incluirá):
Una tarea específica: "Demo end-to-end" que demuestre:
- Chat funcional con GPT-4
- Tool básico ejecutado
- Runtime MCP validando permisos

---

## 5. Estrategia de testing y validación

**Unit tests**: N/A (esta tarea no genera código)

**Integration tests**: N/A

**E2E / Manual**:
- Revisión manual del desarrollador del `roadmap.md`
- Verificación de completitud contra ADR-001
- Validación de que todas las 5 restricciones (AC-4) están cubiertas

**Trazabilidad**:
| Test | AC Cubierto |
|------|-------------|
| Roadmap existe con tareas atómicas | AC-1 |
| Cada tarea referencia ADR-001 + research | AC-2 |
| Formato tabla + metadatos completos | AC-3 |
| 5 restricciones mapeadas a tareas | AC-4 |
| Aprobación del desarrollador requerida | AC-5 |

---

## 6. Plan de demo (si aplica)

**No aplica** para esta tarea. La "demo" es el roadmap mismo mostrado al desarrollador para aprobación.

---

## 7. Estimaciones y pesos de implementación

| Paso | Esfuerzo | Complejidad |
|------|----------|-------------|
| 1. Analizar y agrupar componentes | Medio | Media |
| 2. Definir tareas atómicas | Alto | Alta |
| 3. Establecer dependencias | Medio | Media |
| 4. Priorizar tareas | Bajo | Baja |
| 5. Crear roadmap.md | Medio | Media |
| 6. Validación contra AC | Bajo | Baja |

**Timeline aproximado**: 1-2 horas de trabajo concentrado del `architect-agent`

**Suposiciones**:
- ADR-001 está completo y no cambiará durante esta fase
- Análisis de Phase 2 es preciso y aprobado
- Desarrollador responderá con SI/NO en plazo razonable

---

## 8. Puntos críticos y resolución

### Punto crítico 1: Granularidad de tareas

**Riesgo**: Tareas demasiado grandes = riesgo alto. Tareas demasiado pequeñas = overhead de gestión.

**Impacto**: Medio - Afecta ejecutabilidad del roadmap.

**Estrategia de resolución**:
- Regla de oro: **1 tarea = 1 componente técnico o 1 integración específica**
- Ejemplos:
  - ✅ Bueno: "Implementar cliente ChatKit session endpoint en Extension Host"  
  - ❌ Malo (muy amplio): "Implementar backend completo"
  - ❌ Malo (muy granular): "Importar librería ChatKit"

---

### Punto crítico 2: Dependencias circulares

**Riesgo**: Tareas que se dependen mutuamente imposibilitan ejecución secuencial.

**Impacto**: Alto - Bloquearía roadmap completo.

**Estrategia de resolución**:
- Detectar ciclos usando topological sort
- Romper ciclos creando tareas intermedias (interfaces, mocks)
- Ejemplo: Si "UI necesita Backend" y "Backend necesita UI schema":
  - Tarea 1: Definir schema de comunicación UI-Backend
  - Tarea 2: Implementar Backend usando schema
  - Tarea 3: Implementar UI usando schema

---

### Punto crítico 3: Cobertura de las 5 restricciones (AC-4)

**Riesgo**: Olvidar mapear alguna de las 5 restricciones obligatorias a tareas específicas.

**Impacto**: Crítico - Incumpliría AC-4 y roadmap sería rechazado.

**Estrategia de resolución**:
- Checklist explícito durante Paso 2:
  1. ✅ ChatKit en módulo chat → Tareas specific

as
  2. ✅ Dropdown modelos + config → Tareas específicas
  3. ✅ Control total Runtime MCP → Tareas específicas
  4. ✅ Sistema RBAC escalable → Tareas específicas
  5. ✅ Path artifacts customizable → Tareas específicas
- Validación final en Paso 6 contra este checklist

---

## 9. Dependencias y compatibilidad

**Dependencias internas**:
- `task.md` (acceptance criteria)
- `analysis.md` (agentes, arquitectura, riesgos)
- ADR-001 (arquitectura completa)
- Research aprobado (stack TypeScript)

**Dependencias externas**: Ninguna

**Compatibilidad entre navegadores**: N/A (no genera código web en esta tarea)

**Restricciones arquitectónicas**:
- Roadmap debe respetar arquitectura TypeScript definida (Lit + ChatKit + Agents SDK)
- Roadmap debe incluir 7 agentes especializados definidos en análisis
- Roadmap debe cubrir deployment (CI/CD + NPM + VS Code Marketplace)

---

## 10. Criterios de finalización

Checklist final alineado con acceptance criteria:

- [ ] Existe `roadmap.md` en `.agent/artifacts/2-implementacion-adr-vscode-integration/`
- [ ] Roadmap contiene tabla de tareas con:
  - [ ] ID único por tarea
  - [ ] Título descriptivo
  - [ ] Objetivo claro
  - [ ] Dependencias explícitas
  - [ ] Agente responsable
  - [ ] Componentes afectados
  - [ ] Dominio asignado
- [ ] Roadmap incluye diagrama Mermaid de dependencias
- [ ] Roadmap está agrupado por los 7 dominios:
  - [ ] Setup/Config
  - [ ] UI/ChatKit
  - [ ] Backend/Extension Host
  - [ ] Agent SDK/Python Backend
  - [ ] MCP/Governance
  - [ ] Security
  - [ ] Release/CI-CD
- [ ] Las 5 restricciones de AC-4 están mapeadas a tareas específicas:
  - [ ] ChatKit en módulo chat
  - [ ] Dropdown + config modelos
  - [ ] Control total Runtime MCP
  - [ ] Sistema RBAC escalable
  - [ ] Path artifacts customizable
- [ ] Roadmap aprobado por desarrollador (decision: SI)
- [ ] `task.md` actualizado con Phase 3 completada

---

## 11. Aprobación del desarrollador (OBLIGATORIA)

Este plan **requiere aprobación explícita y binaria**.

```yaml
approval:
  developer:
    decision: SI
    date: 2026-02-06T08:33:21+01:00
    comments: Plan aprobado para crear roadmap
```

> Sin aprobación (SI), esta fase NO puede completarse ni avanzar a Phase 4.
