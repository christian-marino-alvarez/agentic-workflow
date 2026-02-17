---
kind: artifact
name: acceptance
source: agentic-system-structure
---

# Acceptance Criteria — 4-copiar-estructura-agentic-cliente

🏛️ **architect-agent**: Consolidando criterios de aceptacion para copia completa de `.agent` en cliente.

## Identificacion del agente (OBLIGATORIA)
Primera linea del documento:
`<icono> **<nombre-agente>**: <mensaje>`

## 1. Definicion Consolidada
La instalacion via npm y el comando `init` deben copiar la estructura completa de `.agent` al cliente sin depender de `node_modules`, de modo que el prompt de sistema se muestre correctamente. Tras validar en cliente limpio, se publica una beta siguiendo conventional commits.

## 2. Respuestas a Preguntas de Clarificacion
> Esta seccion documenta las respuestas del desarrollador a las 5 preguntas formuladas por el architect-agent.

| # | Pregunta (formulada por architect) | Respuesta (del desarrollador) |
|---|-----------------------------------|-------------------------------|
| 1 | En que comando/flujo exacto ocurre la instalacion donde se debe copiar `.agent/` (CLI, script, npm postinstall, otro)? | Al instalar el paquete via npm y ejecutar el comando `init`. |
| 2 | Que estructura exacta debe copiarse a `.agent/` (todo el directorio `.agent` del repo o una subcarpeta especifica)? | Toda la estructura de `.agent`. |
| 3 | Donde esta hoy el bug o la falta de copia? Indica archivo(s) y comportamiento observado. | Se realizo el cambio para copiar toda la estructura de core a `.agent` y evitar depender de `node_modules`, pero actualmente no aparece el prompt de sistema. |
| 4 | Como validamos que la copia es correcta en un cliente limpio? (pasos de verificacion concretos) | Validacion guiada por el agente durante la prueba en cliente limpio (pasos a definir en la fase de implementacion). |
| 5 | La nueva beta requiere ademas versionado/changelog/tag especifico? Si si, que convencion seguimos? | Si, beta con conventional commits. |

---

## 3. Criterios de Aceptacion Verificables
> Listado de criterios derivados de las respuestas anteriores que deben ser verificados en la Fase 5.

1. Alcance:
   - La instalacion via npm y el comando `init` copian toda la estructura de `.agent` al cliente.

2. Entradas / Datos:
   - Instalacion limpia del paquete via npm y ejecucion de `init`.

3. Salidas / Resultado esperado:
   - Existe `.agent/` completo en el cliente y se muestra el prompt de sistema.

4. Restricciones:
   - No depender de `node_modules` para cargar el prompt de sistema.
   - Publicar beta con conventional commits.

5. Criterio de aceptacion (Done):
   - Verificacion exitosa en entorno limpio y beta publicada.

---

## Aprobacion (Gate 0)
Este documento constituye el contrato de la tarea. Su aprobacion es bloqueante para pasar a Phase 1.

```yaml
approval:
  developer:
    decision: null # SI | NO
    date: null
    comments: null
```

---

## Historial de validaciones (Phase 0)
```yaml
history:
  - phase: "phase-0-acceptance-criteria"
    action: "completed"
    validated_by: "architect-agent"
    timestamp: "2026-01-25T15:57:25Z"
    notes: "Acceptance criteria definidos"
```
