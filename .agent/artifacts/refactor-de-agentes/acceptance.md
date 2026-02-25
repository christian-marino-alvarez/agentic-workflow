# Criterios de Aceptación: Refactor de agentes

## 1. Objetivo

Tener agentes especialistas de las capas de la arquitectura.

---

## 2. Criterios de Aceptación Verificables

| ID    | Criterio                                       | Estado      | Verificación                                                                                                                                                             |
| :---- | :--------------------------------------------- | :---------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-1  | **Definición de Agentes Especialistas**        | **Pendiente** | Se crearán y definirán los roles para tres agentes especialistas: `backend-agent`, `background-agent` y `view-agent`.                                                        |
| AC-2  | **Asignación de Tareas**                       | **Pendiente** | Los nuevos agentes deben poder ser asignados como responsables (`owner`) de subtareas en los artefactos de planificación.                                                |
| AC-3  | **Aislamiento de Dominio (Domain Scoping)**    | **Pendiente** | Se establecerán reglas para que cada agente especialista solo pueda modificar archivos correspondientes a su capa arquitectónica (`view`, `backend`, `background`).      |
| AC-4  | **Orquestación Centralizada**                  | **Pendiente** | El `architect-agent` será el único responsable de delegar tareas de implementación a los agentes especialistas.                                                          |
| AC-5  | **Caso de Verificación Funcional**             | **Pendiente** | El sistema deberá poder orquestar la creación de un nuevo módulo completo (ej. `History`) mediante la delegación de tareas a los tres agentes especialistas.            |