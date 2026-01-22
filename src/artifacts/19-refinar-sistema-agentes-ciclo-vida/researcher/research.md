---
artifact: research
phase: phase-1-research
owner: researcher-agent
status: draft
related_task: 19-refinar-sistema-agentes-ciclo-vida
---

# Research Report — 19-refinar-sistema-agentes-ciclo-vida

## 1. Resumen ejecutivo

🔬 **researcher-agent**: Este informe documenta la investigación técnica sobre:
- Best practices de prompting para LLMs en sistemas de agentes
- Patrones de orquestación y delegación de tareas entre agentes AI
- Estado actual de los workflows del ciclo de vida de Extensio
- Arquitectura Extensio y su impacto en el sistema de agentes

**Problema investigado**: Los workflows actuales mezclan responsabilidades entre fases (Research vs Análisis), la delegación de tareas no es suficientemente granular, y no existe un backlog de mejora continua integrado.

**Objetivo**: Documentar hallazgos técnicos que permitan al architect-agent analizar y proponer mejoras al sistema de agentes.

---

## 2. Necesidades detectadas

### 2.1 Desde los Acceptance Criteria
1. Separación estricta Research (documentación pura) vs Análisis (propuestas de solución)
2. Delegación granular: 1 subtarea = 1 objetivo = 1 agente
3. Gates obligatorios por cada subtarea durante implementación
4. QA como autoridad auditora que delega correcciones sin modificar código
5. Backlog TODO integrado en `.agent/todo/` consultable en cada análisis

### 2.2 Desde la Arquitectura Extensio
Referencia: `constitution.extensio_architecture`

| Principio | Impacto en Sistema de Agentes |
|-----------|-------------------------------|
| SRP (Single Responsibility) | Cada agente debe tener una única responsabilidad |
| Prohibición dependencias cruzadas | Los agentes no deben ejecutar tareas de otros dominios |
| Reactividad basada en Storage | El estado debe ser persistente y trazable (task.md) |
| CLI como único punto de entrada | `mcp_extensio-cli` para build/test |

---

## 3. Hallazgos: LLM Prompting Best Practices

### 3.1 Claridad y Especificidad (OpenAI Guidelines)
**Fuente**: [OpenAI Prompt Engineering](https://platform.openai.com/docs/guides/prompt-engineering)

- Proporcionar instrucciones detalladas y sin ambigüedades
- Definir contexto, resultado esperado, longitud, formato y estilo
- Evitar lenguaje vago que genere outputs inesperados

> **Aplicación**: Los workflows deben tener secciones con formato explícito (Input/Output/Gate) y no permitir interpretación libre.

### 3.2 Uso de Delimitadores
**Fuente**: [OpenAI Best Practices](https://platform.openai.com/docs/guides/prompt-engineering/strategy-write-clear-instructions)

- Usar `###`, `"""`, o XML tags para separar instrucciones del contexto
- Ayuda al modelo a distinguir directivas del contenido a procesar

> **Aplicación**: Los templates de artefactos deben usar secciones claramente delimitadas con headers y bloques YAML.

### 3.3 Descomposición de Tareas Complejas
**Fuentes**: OpenAI, Palantir, DigitalOcean

- Descomponer tareas complejas en pasos más pequeños y manejables
- Mejora la precisión del modelo al ejecutar cada paso
- Evita abrumar al modelo con demasiada información

> **Aplicación**: El Plan debe definir subtareas atómicas con un único objetivo cada una.

### 3.4 Few-Shot Prompting (Ejemplos)
**Fuentes**: AWS, ElevenLabs, Microsoft

- Incluir ejemplos de alta calidad dentro del prompt
- Demostrar el comportamiento, formato e intención deseados
- Mejora el rendimiento respecto a zero-shot

> **Aplicación**: Los templates deben incluir ejemplos concretos de cómo completar cada sección.

### 3.5 Chain of Thought (CoT)
**Fuentes**: PromptHub, DataCamp, LearnPrompting

| Técnica | Descripción | Uso |
|---------|-------------|-----|
| Zero-Shot CoT | Añadir "Let's think step by step" | Tareas simples |
| Few-Shot CoT | Ejemplos con pasos de razonamiento | Tareas complejas |
| Auto-CoT | Generación automática de cadenas de razonamiento | Escalabilidad |
| Tree of Thoughts | Explorar múltiples caminos de razonamiento | Problemas muy complejos |

> **Aplicación**: Los agentes deben documentar su razonamiento antes de tomar decisiones (sección "Reasoning" en agent-tasks).

### 3.6 Outputs Estructurados
**Fuentes**: AWS, Instill AI, Medium

- Especificar explícitamente el formato requerido (JSON, YAML)
- Usar prefilling del output para guiar al modelo
- Implementar validadores post-procesamiento (Pydantic, schemas)
- Separar pasos de razonamiento de los de estructuración

> **Aplicación**: Todos los artefactos deben tener schema YAML obligatorio con campos requeridos.

### 3.7 Asignación de Roles/Personas
**Fuentes**: OpenAI, PromptHub, Medium

- Instruir al modelo para adoptar una persona o expertise específica
- Guía el tono y estilo de respuesta
- Los Custom GPTs usan "absolute commands" prioritarios

> **Aplicación**: Cada agente tiene un rol definido en `constitution.agents_behavior` con prefijo obligatorio.

---

## 4. Hallazgos: Patrones de Orquestación de Agentes

### 4.1 Conductor/Supervisor Pattern (Orquestación Centralizada)
**Fuentes**: IBM, Kore.ai, Medium

- Un orquestador central (architect-agent) actúa como "cerebro"
- Recibe request → descompone en subtareas → delega a agentes especializados
- Monitorea progreso → valida outputs → sintetiza respuesta final
- Ideal para workflows complejos donde la trazabilidad es crítica

> **Estado actual Extensio**: El architect-agent ya actúa como orquestador, pero la granularidad de delegación es insuficiente.

### 4.2 Assembly Line Pattern (Procesamiento Secuencial)
**Fuentes**: AI-SDK, Medium

- Ejecución de tareas en orden predefinido y lineal
- Output de un paso = Input del siguiente
- Efectivo para secuencias bien definidas

> **Estado actual Extensio**: El ciclo de vida (Phase 0→8) es secuencial, pero las subtareas dentro de cada fase no están formalizadas.

### 4.3 Task Force Pattern (Ejecución Paralela)
**Fuentes**: AI-SDK, Medium

- Múltiples tareas independientes ejecutadas simultáneamente
- Útil cuando la velocidad es esencial y no hay dependencias

> **Aplicación potencial**: En Phase 4, subtareas sin dependencias podrían paralelizarse.

### 4.4 Routing/Dynamic Dispatch Pattern
**Fuentes**: AI-SDK, Amazon

- Un agente inteligente decide qué camino tomar basándose en contexto
- Actúa como router entre diferentes ramas del workflow

> **Aplicación potencial**: El architect-agent ya hace dispatch a diferentes agentes según el dominio (driver-agent, module-agent, etc.).

### 4.5 Mecanismos de Delegación de Tareas
**Fuentes**: Kanerika, SAP, LLumo.ai

| Mecanismo | Descripción |
|-----------|-------------|
| Contract Net | "Manager" anuncia tarea, "contractors" pujan |
| Role Assignment | Asignación directa basada en expertise |
| Negotiation | Agentes negocian usando game theory |
| Consensus | Algoritmos como Paxos/Raft para estado compartido |

> **Estado actual Extensio**: Se usa Role Assignment directo.

---

## 5. Hallazgos: Estado Actual de Workflows Extensio

### 5.1 Phase 1: Research (Actual)

```
Owner: researcher-agent
Problema detectado: El workflow NO especifica explícitamente que el research
debe ser solo documentación sin análisis.
```

**Secciones actuales del template**:
- Resumen ejecutivo
- Necesidades detectadas
- Alternativas técnicas (INCLUYE pros/cons → esto es análisis)
- APIs Web/WebExtensions
- Compatibilidad multi-browser
- Recomendaciones AI-first (esto es análisis)
- Riesgos y trade-offs (esto es análisis)
- Fuentes

**Problema**: Las secciones 3, 6 y 7 mezclan investigación con análisis.

### 5.2 Phase 2: Analysis (Actual)

```
Owner: architect-agent
Problema detectado: No referencia explícitamente el TODO backlog.
```

**Secciones que funcionan bien**:
- Cobertura de acceptance criteria
- Definición de agentes y subareas
- Integración de research aprobado

**Faltan**:
- Consulta obligatoria a `.agent/todo/`
- Propuesta de múltiples alternativas con trade-offs claros

### 5.3 Phase 3: Planning (Actual)

```
Owner: architect-agent
Problema detectado: Las subtareas no tienen estructura Input/Output/Gate individual.
```

**Secciones que funcionan bien**:
- Definición de pasos de implementación
- Asignación de responsabilidades por agente
- Estrategia de testing

**Faltan**:
- Template individual por subtarea
- Definición explícita de workflows/tools por subtarea

### 5.4 Phase 4: Implementation (Actual)

```
Owner: architect-agent (delega)
Estado: Buena estructura con agent-tasks/ y Gate por tarea.
```

**Funciona bien**:
- Delegación a ficheros individuales por tarea
- Gate obligatorio por tarea
- Informe de revisión arquitectónica

**Posible mejora**:
- Gestión de TODOs detectados durante implementación

### 5.5 Phase 5: Verification (Actual)

```
Owner: qa-agent
Estado: Buena separación de responsabilidades.
```

**Funciona bien**:
- QA no corrige código, delega
- Crea tareas de corrección en agent-tasks/
- El flujo vuelve a Phase 4 para correcciones

---

## 6. Compatibilidad con Arquitectura Extensio

| Componente | Impacto |
|------------|---------|
| Workflows (.agent/workflows/) | Modificación de 5 ficheros phase-*.md |
| Templates (.agent/templates/) | Modificación de research.md, analysis.md; creación de todo.md |
| Rules (.agent/rules/) | No requiere modificación |
| Constitution | Ya define SRP, CLI, Clean Code |

---

## 7. Fuentes

### Oficiales
- [OpenAI Prompt Engineering Guide](https://platform.openai.com/docs/guides/prompt-engineering)
- [OpenAI Best Practices](https://platform.openai.com/docs/guides/prompt-engineering/strategy-write-clear-instructions)
- [Microsoft Azure Prompt Engineering](https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/prompt-engineering)

### Prestigio Técnico
- [AWS - Structured Outputs](https://aws.amazon.com/blogs/machine-learning/structured-outputs-llms/)
- [IBM - AI Agent Orchestration](https://www.ibm.com/think/topics/ai-agents)
- [LearnPrompting - Chain of Thought](https://learnprompting.org/docs/intermediate/chain_of_thought)
- [PromptHub - CoT Techniques](https://prompthub.us/blog/chain-of-thought-prompting)
- [Kanerika - Multi-Agent Coordination](https://www.kanerika.com/articles/multi-agent-systems)
- [AI-SDK - Workflow Patterns](https://ai-sdk.dev/docs/patterns)

### Documentación Interna Extensio
- `.agent/rules/constitution/extensio-architecture.md`
- `.agent/rules/constitution/clean-code.md`
- `.agent/rules/constitution/agents-behavior.md`
- `.agent/workflows/tasklifecycle-long/phase-1-research.md`
- `.agent/workflows/tasklifecycle-long/phase-2-analysis.md`
- `.agent/workflows/tasklifecycle-long/phase-3-planning.md`
- `.agent/workflows/tasklifecycle-long/phase-4-implementation.md`
- `.agent/workflows/tasklifecycle-long/phase-5-verification.md`

---

## 8. Aprobación del desarrollador (OBLIGATORIA)

```yaml
approval:
  developer:
    decision: SI
    date: 2026-01-18T18:23:49+01:00
    comments: ok
```
