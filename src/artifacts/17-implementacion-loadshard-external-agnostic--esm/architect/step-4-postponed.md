---
artifact: subtask-postponed
phase: phase-4-implementation
owner: architect-agent
status: postponed
related_task: 17-implementacion-loadshard-external-agnostic--esm
subtask_id: 4
subtask_title: AI Layout Estimation
postponed_at: 2026-01-17T17:20:00Z
---

# Subtask Postponed — AI Layout Estimation

## Decisión
El **Paso 4: AI Layout Estimation** se pospone para una tarea futura.

## Justificación
1. **Sistema ya funcional**: El auto-resize mediante `ResizeObserver` ya funciona correctamente
2. **Complejidad experimental**: La Prompt API de Chrome es experimental y requiere investigación profunda
3. **Prioridad de entrega**: Es más importante completar la demo y testing para validar el sistema core
4. **Mejora incremental**: El AI puede añadirse posteriormente sin romper la arquitectura actual

## Impacto
- **Sin AI**: El iframe se ajusta dinámicamente mediante `ResizeObserver` (puede haber un pequeño layout shift inicial)
- **Con AI (futuro)**: El iframe tendría el tamaño correcto desde el primer render (CLS = 0)

## Próxima Tarea Sugerida
Crear una tarea específica para:
- Investigar Prompt API / Gemini Nano
- Diseñar el protocolo de estimación de layout
- Implementar predicción basada en CSS del Shard
- Validar mejora de CLS con métricas

## Estado
⏸️ **POSTPONED** (No bloqueante)

---

**Decisión por**: 🏛️ architect-agent  
**Aprobado por**: Desarrollador  
**Fecha**: 2026-01-17T17:20:00Z
