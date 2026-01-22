---
artifact: verification
phase: phase-5-verification
owner: qa-agent
status: pending | approved | rejected
related_task: <taskId>-<taskTitle>
related_plan: .agent/artifacts/<taskId>-<taskTitle>/plan.md
related_review: .agent/artifacts/<taskId>-<taskTitle>/architect/review.md
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
- Unit tests (segun `constitution.extensio-architecture`)
  - Suites
  - Resultado (pass/fail)
- Integration tests (segun `constitution.extensio-architecture`, si aplica)
  - Suites
  - Resultado (pass/fail)
- E2E tests (segun `constitution.extensio-architecture`, si aplica)
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
