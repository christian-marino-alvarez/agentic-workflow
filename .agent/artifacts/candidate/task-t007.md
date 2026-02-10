---
id: 7
title: model-dropdown-component
owner: ui-agent
strategy: long
phase:
  current: "phase-0-acceptance-criteria"
---

# Task (Candidate) — T007: Model Dropdown Component

## Identificación
- **id**: 7
- **title**: model-dropdown-component
- **scope**: current
- **owner**: ui-agent

## Descripción de la tarea
Implementar un componente selector de modelos en la interfaz de chat (ChatView) utilizando Lit. El componente debe estar sincronizado con la configuración de modelos persistida en la extensión y permitir cambiar el modelo activo.

## Objetivo
Mejorar la experiencia de usuario permitiendo el cambio dinámico de modelos LLM directamente desde la vista de chat, asegurando coherencia visual y funcional con el sistema de configuración existente.

## Requisitos
- Crear componente Lit para el dropdown.
- Estilos premium (glassmorphism).
- Sincronización bidireccional de estado entre Webview y Extension Host.
- Integración en la cabecera de la vista de chat.
