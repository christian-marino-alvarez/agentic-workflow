---
artifact: research
phase: phase-1-research
owner: researcher-agent
status: draft | approved
related_task: <taskId>-<taskTitle>
---

# Research Report — <taskId>-<taskTitle>

## Identificacion del agente (OBLIGATORIA)
Primera linea del documento:
`<icono> **<nombre-agente>**: <mensaje>`

> [!CAUTION]
> **REGLA PERMANENT**: Este documento es SOLO documentación.
> El researcher-agent documenta hallazgos SIN analizar, SIN recomendar, SIN proponer soluciones.
> El análisis corresponde a Phase 2.

## 1. Resumen ejecutivo
- Problema investigado
- Objetivo de la investigacion
- Principales hallazgos

---

## 2. Necesidades detectadas
- Requisitos tecnicos identificados por el architect-agent
- Suposiciones y limites

---

## 3. Hallazgos técnicos
Para cada hallazgo:
- Descripción del concepto/tecnología
- Estado actual (estable, experimental, deprecated)
- Documentación oficial
- Limitaciones conocidas

> **NO incluir**: pros/contras, recomendaciones, decisiones.

---

## 4. APIs Web / WebExtensions relevantes
- API / especificacion
- Estado de soporte (Chrome/Firefox/Safari)
- Restricciones conocidas

---

## 5. Compatibilidad multi-browser
- Tabla de compatibilidad
- Diferencias clave
- Estrategias de mitigacion

---

## 6. Oportunidades AI-first detectadas
- Patrones o APIs que podrían habilitar automatización
- Referencias a documentación relevante

> **NO incluir**: impacto esperado, recomendaciones de uso.

---

## 7. Riesgos identificados
- Riesgo detectado
- Severidad (alta/media/baja)
- Fuente de la información

> **NO incluir**: mitigaciones (corresponden al análisis).

---

## 8. Fuentes
- Enlaces a docs oficiales
- RFCs / propuestas
- Otros recursos

---

## 9. Aprobacion del desarrollador (OBLIGATORIA)
```yaml
approval:
  developer:
    decision: SI | NO
    date: <ISO-8601>
    comments: <opcional>
```
