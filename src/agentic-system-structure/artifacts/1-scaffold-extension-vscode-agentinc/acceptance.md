🏛️ **architect-agent**: Acceptance criteria definidos para scaffold vscode-agentinc.

# Acceptance Criteria — 1-scaffold-extension-vscode-agentinc

## Identificacion del agente (OBLIGATORIA)
Primera linea del documento:
`<icono> **<nombre-agente>**: <mensaje>`

## 1. Definicion Consolidada
Crear el scaffold oficial de una extension de VS Code llamada "vscode-agentinc" usando el generador `yo code` (TypeScript + npm), ubicandolo en `src/extension` como base para el desarrollo de la API de chat AI. Debe incluir un comando minimo activable y la estructura estandar de extension. Se debe validar en el Marketplace si existe el nombre "vscode-agentinc" tanto como display name como identificador de extension (cualquier publisher).

## 2. Respuestas a Preguntas de Clarificacion
> Esta seccion documenta las respuestas del desarrollador a las 5 preguntas formuladas por el architect-agent.

| # | Pregunta (formulada por architect) | Respuesta (del desarrollador) |
|---|-----------------------------------|-------------------------------|
| 1 | ¿En que carpeta exacta del repo debe vivir el scaffolding de la extension (ruta relativa)? | Empezar en `src/extension` (luego `src` sera root del code). |
| 2 | ¿Quieres generar el scaffold con `yo code` (TypeScript) o prefieres una plantilla manual (JS/TS)? | Usar `yo code` como generador oficial. |
| 3 | ¿Que funcionalidad minima debe incluir la extension (p. ej., comando “Hello World”, activacion por comando, panel, etc.)? | Lo minimo para comenzar a desarrollar bajo la API de chat AI. |
| 4 | ¿Que configuracion de build/publicacion esperas (uso de `vsce`, scripts npm, nombre de publisher)? | No conoce la diferencia entre `vsce` y npm; proyecto TypeScript con npm. |
| 5 | Sobre la validacion del nombre “vscode-agentinc”: ¿debo comprobar solo el “display name” en Marketplace o tambien el identificador completo `publisher.vscode-agentinc`? | Ambos. |

---

## 3. Criterios de Aceptacion Verificables
> Listado de criterios derivados de las respuestas anteriores que deben ser verificados en la Fase 5.

1. Alcance:
   - Existe un scaffold oficial de extension de VS Code en `src/extension` generado con `yo code` (TypeScript + npm) y nombrado "vscode-agentinc".

2. Entradas / Datos:
   - Se usan como entradas el nombre de la extension, el path `src/extension` y la configuracion TypeScript + npm del generador.

3. Salidas / Resultado esperado:
   - El scaffold incluye `package.json`, `tsconfig.json`, `src/extension.ts` (o equivalente), comandos registrados y scripts npm para compilar.
   - Se deja evidencia documentada de la verificacion en el Marketplace del nombre "vscode-agentinc" como display name y como identificador de extension (cualquier publisher).

4. Restricciones:
   - El scaffold se genera con el generador oficial `yo code` y se mantiene dentro de `src/extension`.
   - No se alteran otros paquetes del repo fuera del scaffold necesario.

5. Criterio de aceptacion (Done):
   - `npm run compile` funciona dentro de `src/extension`.
   - La extension se puede cargar en modo development y el comando minimo aparece en la paleta.
   - La validacion del Marketplace queda registrada en un documento del proyecto (p. ej., README del scaffold o nota dedicada).

---

## Aprobacion (Gate 0)
Este documento constituye el contrato de la tarea. Su aprobacion es bloqueante para pasar a Phase 1.

```yaml
approval:
  developer:
    decision: SI # SI | NO
    date: 2026-01-24T15:59:05Z
    comments: null
```

---

## Historial de validaciones (Phase 0)
```yaml
history:
  - phase: "phase-0-acceptance-criteria"
    action: "completed"
    validated_by: "architect-agent"
    timestamp: "2026-01-24T15:56:00Z"
    notes: "Acceptance criteria definidos"
```
