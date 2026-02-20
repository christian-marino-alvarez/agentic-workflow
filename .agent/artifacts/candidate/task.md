---
title: Agent Tools & Action Sandbox
goal: >
  Dotar a los agentes del Chat de tools reales (readFile, writeFile, runCommand, listDir)
  para que puedan ejecutar acciones sobre el sistema de archivos y terminal.
  Integrar con el sistema de permisos sandbox/full del Chat UI.
owner: architect-agent
strategy: long
---

# Task Candidate: T032 — Agent Tools & Action Sandbox

## Description
Los agentes actualmente solo hacen text-in → text-out. No pueden leer/escribir archivos
ni ejecutar comandos. Esta tarea implementa las tools del OpenAI Agents SDK en el sidecar
y las conecta con el sistema de permisos (sandbox/full access) del Chat UI.

## Objective
Permitir que los agentes del Chat puedan:
1. Leer archivos del proyecto
2. Crear/escribir archivos
3. Ejecutar comandos en terminal
4. Listar directorios
5. Todo controlado por el toggle sandbox/full del Chat UI
