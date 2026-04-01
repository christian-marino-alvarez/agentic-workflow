# Acceptance Criteria — 15-restore-workspace

🏛️ **architect-agent**: Acceptance Criteria for restoring the workspace CLI command.

## 1. Consolidated Definition
Revisar por qué se ha perdido o eliminado el flag `--workspace` del sistema CLI y volver a implementarlo/restaurarlo para que funcione nuevamente tal como lo requería el desarrollador.

## 2. Answers to Clarification Questions
> This section documents the developer's answers to the 5 questions formulated by the architect-agent.

| # | Question (formulated by architect) | Answer (from developer) |
|---|-----------------------------------|------------------------|
| 1 | Mencionas el flag `--workscope`. ¿Es `--workspace` o `--workscope`? | es --workspace |
| 2 | ¿En qué contexto se ejecutaba este comando usualmente? | desde cli |
| 3 | ¿Esperas que vuelva a programar y restaurar el comando funcionalmente? | Restaurar |
| 4 | ¿Hay alguna regla técnica o restricción? | siempre lo necesito |
| 5 | ¿Cuál es el criterio de éxito para esta tarea? | que funcione |

---

## 3. Verifiable Acceptance Criteria

1. Scope:
   - Identificar punto de pérdida del comando `--workspace`.
   - Reintroducir y conectar el flag en el CLI.

2. Inputs / Data:
   - CLI runtime argumentos extraídos en `process.argv` o `Commander`/vuestro engine.

3. Outputs / Expected Result:
   - El flag `--workspace` será procesado por la CLI sin causar excepciones, y se pasará como argumento de entorno al framework.

4. Constraints:
   - Ninguna, su implementación es requerida y debe funcionar siempre.

5. Acceptance Criterion (Done):
   - Al invocar scripts del CLI bajo `node` usando `--workspace`, la bandera debe ser parseada y procesada correctamente y el flujo no debe interrumpirse.

---

## Approval (Gate 0)
This document constitutes the task contract. Its approval is blocking to proceed to Phase 1.

```yaml
approval:
  developer:
    decision: null
    date: null
    comments: null
```
