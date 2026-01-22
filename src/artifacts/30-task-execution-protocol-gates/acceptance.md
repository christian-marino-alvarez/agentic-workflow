---
artifact: acceptance
phase: phase-0-acceptance-criteria
owner: architect-agent
status: pending
related_task: 30-AHRP: Agentic Handover & Reasoning Protocol
---

# Acceptance Criteria — 30-AHRP: Agentic Handover & Reasoning Protocol

## Identificación del agente
🏛️ **architect-agent**: Definiendo los criterios de éxito para el protocolo de seguridad AHRP.

## User Requirements
- Protocolo rígido y visual para el traspaso de tareas.
- Validación de identidad asignada antes de empezar.
- Aprobación obligatoria del "Reasoning" antes del primer cambio de código.
- Nueva Constitución del Sistema Agéntico (`constitution.agent_system`).

## Acceptance Criteria
- [ ] **AC-1: Constitution.agent_system**: Creado nuevo documento core que defina normas, comandos, jerarquía y flujos del framework.
- [ ] **AC-2: Protocolo AHRP**: Definido el flujo de Triple Gate (Activación -> Reasoning -> Resultados).
- [ ] **AC-3: Template Agent-Task**: Refactorizado para incluir visualmente los bloques de Activación y Aprobación de Reasoning.
- [ ] **AC-4: Identity Lock**: Impedir por regla que un agente ejecute herramientas si el "Gate A: Activación" no está firmado con "SI" por el desarrollador.
- [ ] **AC-5: Workflow Enforcement**: Actualizados los workflows `long` y `short` para integrar el AHRP en sus pasos de implementación.
- [ ] **AC-6: Zero-Tolerance Penalty**: Implementada la regla de puntuación 0 automática por saltarse cualquier Gate del protocolo AHRP.
- [ ] **AC-7: Metrics Awareness**: El sistema de métricas debe ser inyectado y notificado en cada nueva tarea creada.

## 5 Preguntas de Validación Técnica
1. **Naming**: ¿Se usará el nombre AHRP (Agentic Handover & Reasoning Protocol) en toda la documentación core?
2. **Visual Block**: ¿Qué elemento gráfico usaremos para denotar que una tarea está "BLOQUEADA: Esperando Activación"?
3. **Escalabilidad**: ¿Cómo afecta este triple gate al ciclo de vida "Short"? (Se debe simplificar pero mantener la esencia).
4. **Indisciplina**: ¿Cómo automatizaremos la detección de una "ejecución no autorizada" para aplicar el 0 inmediato en métricas?
5. **Architect Responsibility**: El arquitecto NO puede activar tareas. ¿Cómo se registrará esta restricción en el nuevo CLI?

---

## Gate de Aprobación

```yaml
approval:
  developer:
    decision: null # SI | NO
    date: null
    comments: null
```
