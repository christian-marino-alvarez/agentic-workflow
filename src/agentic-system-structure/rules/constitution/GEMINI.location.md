---
trigger: always_on
---

# GEMINI LOCATION

Este repositorio NO versiona GEMINI.md.

Google Antigravity carga GEMINI.md desde el path del usuario (fuera del repositorio).
Por tanto, el sistema agéntico asume que GEMINI.md existe y está accesible en la máquina local.

## Regla

- GEMINI.md es PERMANENT y tiene prioridad absoluta.
- Este fichero solo documenta dónde se encuentra GEMINI.md y cómo se integra.
- No se debe copiar ni duplicar GEMINI.md dentro del repositorio.

## Requisitos mínimos

- La máquina del desarrollador DEBE tener GEMINI.md disponible en el path de usuario
  configurado para Google Antigravity.
- Si GEMINI.md no está disponible, cualquier tarea DEBE BLOQUEARSE
  hasta que el entorno sea corregido.

## Referencia interna

Las reglas del repositorio referencian la constitución global mediante:

constitution.GEMINI_location

Este fichero actúa como único punto de anclaje versionado
para la constitución externa GEMINI.md.
