---
artifact: verification
phase: phase-5-verification
owner: qa-agent
status: pending | approved | rejected
related_task: <taskId>-<taskTitle>
related_plan: src/agentic-system-structure/artifacts/<taskId>-<taskTitle>/plan.md
related_review: src/agentic-system-structure/artifacts/<taskId>-<taskTitle>/architect/review.md
---

# Verification Report — <taskId>-<taskTitle>

## Identificacion del agente (OBLIGATORIA)
Primera linea del documento:
`<icono> **<nombre-agente>**: <mensaje>`

## 1. Alcance de verificacion
- Que se verifico
- Que quedo fuera

---

## 2. Tests ejecutados
- Unit tests (segun criterios del proyecto)
  - Suites
  - Resultado (pass/fail)
- Integration tests (segun criterios del proyecto, si aplica)
  - Suites
  - Resultado (pass/fail)
- E2E tests (segun criterios del proyecto, si aplica)
  - Suites
  - Resultado (pass/fail)

---

## 3. Coverage y thresholds
- Coverage total (%)
- Coverage por area (si aplica)
- Thresholds definidos en el plan (cumple / no cumple)

---

## 4. Performance (si aplica)
- Metricas recopiladas
- Thresholds (cumple / no cumple)

---

## 5. Evidencias
- Logs
- Reportes de tests
- Capturas (si aplica)

---

## 6. Incidencias
- Bugs encontrados
- Severidad
- Estado

---

## 7. Checklist
- [ ] Verificacion completada
- [ ] Thresholds de testing cumplidos
- [ ] Listo para fase 5

---

## 8. Aprobacion del desarrollador (OBLIGATORIA)
```yaml
approval:
  developer:
    decision: SI | NO
    date: <ISO-8601>
    comments: <opcional>
```
