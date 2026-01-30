🏛️ **architect-agent**: Plan de implementacion para scaffold VS Code.

---
artifact: plan
phase: phase-3-planning
owner: architect-agent
status: draft
related_task: 1-scaffold-extension-vscode-agentinc
---

# Implementation Plan — 1-scaffold-extension-vscode-agentinc

## Identificacion del agente (OBLIGATORIA)
Primera linea del documento:
`<icono> **<nombre-agente>**: <mensaje>`

## 1. Resumen del plan
- **Contexto**: crear el scaffold oficial de la extension VS Code "vscode-agentinc" en `src/extension`, validar el nombre en Marketplace y dejar base funcional.
- **Resultado esperado**: extension generada con `yo code` (TypeScript + npm) con comando minimo y scripts npm, mas evidencia documentada de la busqueda en Marketplace.
- **Alcance**: incluye scaffolding, configuracion y verificacion basica; excluye desarrollo funcional de la API de chat AI y publicacion real.

---

## 2. Inputs contractuales
- **Task**: `.agent/artifacts/1-scaffold-extension-vscode-agentinc/task.md`
- **Analysis**: `.agent/artifacts/1-scaffold-extension-vscode-agentinc/analysis.md`
- **Acceptance Criteria**: AC-1 a AC-5 definidos en `.agent/artifacts/1-scaffold-extension-vscode-agentinc/acceptance.md`.

**Dispatch de dominios (OBLIGATORIO si aplica)**
```yaml
plan:
  workflows:
    - domain: vscode-extension
      action: create
      workflow: phase-4-implementation

  dispatch:
    - domain: verification
      action: verify
      workflow: phase-5-verification
```

---

## 3. Desglose de implementacion (pasos)
Descomposicion ordenada y ejecutable.

### Paso 1
- **Descripcion**: crear el directorio `src/extension` y ejecutar `yo code` con TypeScript + npm para generar el scaffold de la extension.
- **Dependencias**: Node.js + npm + `yo` + `generator-code` instalados.
- **Entregables**: estructura base de extension dentro de `src/extension`.
- **Agente responsable**: implementation (desarrollador).

### Paso 2
- **Descripcion**: revisar y ajustar el nombre `vscode-agentinc` en `package.json` (name/displayName) y configurar comando minimo.
- **Dependencias**: Paso 1 completado.
- **Entregables**: manifesto con nombre correcto y comando registrado.
- **Agente responsable**: implementation (desarrollador).

### Paso 3
- **Descripcion**: documentar la verificacion de nombre en Marketplace (display name + extension name) en un archivo dentro de `src/extension` (README o nota dedicada).
- **Dependencias**: Paso 2 completado.
- **Entregables**: evidencia documentada con fecha y resultado.
- **Agente responsable**: implementation (desarrollador).

### Paso 4
- **Descripcion**: validar build con `npm run compile` en `src/extension` y cargar la extension en modo development para verificar el comando.
- **Dependencias**: Paso 2 completado.
- **Entregables**: registro de verificacion manual y compilacion exitosa.
- **Agente responsable**: qa-agent (verificacion) con apoyo del desarrollador.

---

## 4. Asignacion de responsabilidades (Agentes)
Mapa claro de agentes ↔ subareas.

- **Architect-Agent**
  - Responsabilidades: control de fases, revision de artefactos y validacion de criterios.
- **Implementation-Agent**
  - Responsabilidades: ejecutar `yo code`, ajustar manifesto, documentar la verificacion de Marketplace.
- **QA / Verification-Agent**
  - Responsabilidades: comprobar `npm run compile` y carga en modo extension dev.

**Handoffs**
- Implementation entrega scaffold y documentacion; QA verifica build y comando; architect valida cumplimiento AC.

**Componentes (si aplica)**
- Nuevo componente: `src/extension`.
- Como se implementa: ejecutar `yo code`, ajustar manifesto y agregar documentacion de verificacion.
- Herramienta: `yo code` (generador oficial). Motivo: requerido por acceptance criteria.

**Demo (si aplica)**
- No aplica demo adicional; la verificacion de comando en la paleta cubre la validacion minima.

---

## 5. Estrategia de testing y validacion
Como se comprobara que la implementacion cumple los AC.

- **Unit tests**
  - No aplican en el scaffold inicial.
- **Integration tests**
  - No aplican en el scaffold inicial.
- **E2E / Manual**
  - `npm run compile` en `src/extension`.
  - Ejecutar extension en modo development y verificar comando en paleta.

**Trazabilidad**
- AC-1/AC-2: scaffold generado en `src/extension` con TypeScript + npm.
- AC-3: presencia de manifesto, entrypoint y documentacion de Marketplace.
- AC-4: cambios limitados al scaffold.
- AC-5: compile OK y comando visible en paleta.

---

## 6. Plan de demo (si aplica)
- No aplica demo adicional.

---

## 7. Estimaciones y pesos de implementacion
- **Paso 1**: medio.
- **Paso 2**: bajo.
- **Paso 3**: bajo.
- **Paso 4**: medio.
- **Timeline aproximado**: 0.5 - 1 dia.
- **Suposiciones**: herramientas `yo` y `generator-code` disponibles; VS Code instalado para modo dev.

---

## 8. Puntos criticos y resolucion
- **Punto critico 1**
  - Riesgo: nombre ocupado en Marketplace.
  - Impacto: necesidad de renombrar antes de publicar.
  - Estrategia de resolucion: documentar verificacion y definir alternativa si se detecta conflicto real.
- **Punto critico 2**
  - Riesgo: diferencias entre extension desktop y web.
  - Impacto: APIs no disponibles en web.
  - Estrategia de resolucion: limitar alcance a desktop en esta fase.

---

## 9. Dependencias y compatibilidad
- **Dependencias internas**
  - Ninguna previa.
- **Dependencias externas**
  - Node.js, npm, `yo`, `generator-code`, VS Code.
- **Compatibilidad entre navegadores** (si aplica)
  - No aplica para extension desktop.
- **Restricciones arquitectonicas** relevantes
  - Respetar reglas de agentes (architect no implementa codigo).

---

## 10. Criterios de finalizacion
Condiciones objetivas para considerar la implementacion “Done”.

- Scaffold generado con `yo code` en `src/extension`.
- `package.json` con `name`/`displayName` de "vscode-agentinc".
- Archivo de evidencia de busqueda Marketplace con resultado.
- `npm run compile` exitoso en `src/extension`.
- Comando minimo visible en la paleta de comandos en modo dev.

---

## 11. Aprobacion del desarrollador (OBLIGATORIA)
Este plan **requiere aprobacion explicita y binaria**.

```yaml
approval:
  developer:
    decision: SI # SI | NO
    date: 2026-01-24T21:08:08Z
    comments: null
```
