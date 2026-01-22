---
artifact: research
phase: phase-1-research
owner: researcher-agent
status: in_progress
related_task: 30-AHRP: Agentic Handover & Reasoning Protocol
---

# Research Report — AHRP & Agentic System Constitution

## Identificación del agente
🔬 **researcher-agent**: Investigando los cimientos del protocolo AHRP y el sistema de penalización.

## 1. Objetivos de Investigación
- Analizar las mejores prácticas para "Handover protocols" en sistemas multi-agente.
- Diseñar la estructura de la `constitution.agent_system.md`.
- Investigar mecanismos técnicos para la automatización de la penalización "0" en métricas ante fallos de gate.
- Proponer un formato visual "rígido" para el bloqueo de tareas.

## 2. Web & Internal Research
- **Handover Protocols**: La literatura sobre sistemas multi-agente sugiere que el "Handover" debe incluir un "Contract of Intent" (Reasoning) antes del "Contract of Execution".
- **Visual Compliance**: Los agentes de IA son altamente sensibles a bloques de comentarios masivos (hashtags/caracteres especiales) que rompen el flujo visual del markdown, sirviendo como guardrails efectivos.
- **Persistence**: La persistencia de métricas en archivos locales `.agent/metrics/*.json` es la forma más robusta de evitar que el LLM "olvide" su historial de indisciplina.

## 3. Alternativas Técnicas
- **Opción A (Soft Enforcement)**: Solo avisos en el texto de la tarea. (Descartada por falta de rigor).
- **Opción B (Hard Enforcement via CLI)**: Modificar el CLI para que detecte el estado del gate antes de ejecutar. (Ideal a largo plazo).
- **Opción C (Document-Driven Enforcement)**: El AHRP mediante bloques visuales obligatorios en `agent-task.md`. (Recomendada para implementación inmediata).

## 4. Recomendación Inicial
1. Crear `constitution.agent_system.md` como fuente de verdad.
2. Adoptar el **Triple Gate (A/B/C)** como estándar innegociable.
3. Implementar el bloque visual de "STOP" en los templates de tarea.
4. Establecer la penalización automática de 0 firmada por el `qa-agent`.
