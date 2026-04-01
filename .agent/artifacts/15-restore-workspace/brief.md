---
artifact: brief
phase: short-phase-1-brief
owner: architect-agent
status: draft
related_task: 15-restore-workspace
---

# Brief — 15-restore-workspace

🏛️ **architect-agent**: Brief y evaluación de complejidad completados.

## 1. Task Identification

**Title**: Restore --workspace command
**Objective**: Revisar causa de la desaparición del flag --workspace en la CLI y restaurar su funcionamiento de manera que la CLI siga pudiendo trabajar con él.
**Strategy**: Short

---

## 2. The 5 Mandatory Questions

(Respuestas documentadas en acceptance.md)

---

## 3. Acceptance Criteria

(Detalladas en acceptance.md. Esencia: restaurar el soporte para param --workspace en cli y garantizar su funcionamiento.)

---

## 4. Simplified Analysis

### Current State (As-Is)
- Affected structure: `src/cli/**` (y potencialmente módulos inicializadores o el binario).
- Known limitations: El comando se perdió (posible refactorización donde los flags no se propagaron).

### Complexity Evaluation

| Indicator | Status | Comment |
|-----------|--------|---------|
| Affects more than 3 packages | ☐ Yes ☑ No | Solo afecta la CLI. |
| Requires API research | ☐ Yes ☑ No | Conocimiento interno. |
| Breaking changes | ☐ Yes ☑ No | Compatible con flujo previo. |
| Complex E2E tests | ☐ Yes ☑ No | Simple validación CLI. |

**Complexity result**: ☑ LOW (continue Short) ☐ HIGH (recommend abort to Long)

---

## 5. Implementation Plan

### Ordered Steps

1. **Localizar la pérdida**
   - Investigar en los subcomandos de `src/cli/commands/` o en `bin/cli.js` dónde y cuándo se parseaba `--workspace`.
2. **Reestablecer lógica de parseo**
   - Restaurar la configuración en Mri/Commander/args parser.
3. **Propagación**
   - Asegurarse de que el argumento fluye correctamente al Workspace o al WorkflowEngine en la runtime.

### Planned Verification
- Ejecutar un comando CLI mock con `--workspace <ruta>` y verificar en consola.

---

## 6. Developer Approval (MANDATORY)

```yaml
approval:
  developer:
    decision: null
    date: null
    comments: null
```

> Without approval, this phase CANNOT advance to Implementation.
