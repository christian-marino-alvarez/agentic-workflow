---
id: 8
title: chatkit-integration
owner: ui-agent
strategy: long
phase:
  current: "phase-0-acceptance-criteria"
---

# Task (Candidate) — T006: ChatKit Web Component Integration

## Identificación
- **id**: 8
- **title**: chatkit-integration
- **scope**: current
- **owner**: ui-agent

## Descripción de la tarea
Integrar los componentes web de OpenAI ChatKit (o equivalente compatible) en la vista de chat (`ChatView`). Se debe reemplazar la interfaz primitiva actual (textarea y logs) por una experiencia de chat moderna y fluida que soporte hilos, mensajes de sistema/usuario y streaming nativo.

## Objetivo
Elevar la calidad técnica de la interfaz de chat a estándares de producción, aprovechando los contratos de mensajería ya definidos y el backend de ChatKit ya funcional.

## Requisitos
- Integrar componente `<openai-chatkit>` (o similar) en la plantilla Lit.
- Configurar la conexión con el endpoint `/api/chat/chatkit`.
- Asegurar que el streaming (SSE) funcione correctamente en la UI.
- Soportar el renderizado de markdown y código en los mensajes.
- Mantener compatibilidad con el selector de modelos (T007) y las propuestas HIL.
