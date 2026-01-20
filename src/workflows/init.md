---
id: workflow.init
owner: architect-agent
version: 4.1.0
severity: PERMANENT
trigger:
  commands: ["init", "/init"]
blocking: true
---

# WORKFLOW: init

## 0. Activación de Rol y Prefijo (OBLIGATORIO)
- El agente **DEBE** comenzar su intervención identificándose.
- Mensaje: `🏛️ **architect-agent**: Iniciando sesión de trabajo.`

## Objetivo (ONLY)
- Activar el rol **architect-agent**.
- Cargar el bootstrap mínimo de índices.
- Cargar en contexto las rules de constitución.
- Detectar idioma de conversación y confirmar explícitamente.
- **Seleccionar estrategia de ciclo de vida (Long/Short)**.
- Crear el **artefacto task candidate** `init.md`.

## Pasos obligatorios
1. Cargar índices mínimos (bootstrap).
2. Cargar en contexto las constitutions (`GEMINI_location`, `project_architecture`, `clean_code`).
3. Detectar idioma preferido y pedir confirmación explícita (**SI**).
4. Seleccionar estrategia de ciclo de vida (**Long** o **Short**).
5. Crear el artefacto `init.md` usando `templates.init`.
6. Evaluar Gate.
   - El desarrollador **DEBE** confirmar explícitamente con un **SI**.

## Output (REQUIRED)
- Artefacto creado: `artifacts.candidate.init`.

## Gate (REQUIRED)
Requisitos (todos obligatorios):
1. Existe `artifacts.candidate.init`.
2. En su YAML: `language.confirmed == true` y `strategy` definido.
3. El desarrollador ha aprobado explícitamente con **SI**.

Si Gate FAIL:
- Bloquear hasta resolver.
