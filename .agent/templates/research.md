---
artifact: research
phase: phase-1-research
owner: researcher-agent
status: draft | approved
related_task: <taskId>-<taskTitle>
---

# Research Report — {{task.id}}-{{task.title}}

## Identificación del agente (OBLIGATORIA)
Primera linea del documento:
`<icono> **<nombre-agente>**: <mensaje>`

> [!DANGER]
> **CRITERIO DE RIGOR TÉCNICO**: Este documento DEBE ser una investigación profunda y técnica. 
> Se prohíben las descripciones superficiales. Cada punto debe estar respaldado por datos, especificaciones de APIs o comportamientos observados del runtime.

> [!CAUTION]
> **REGLA PERMANENT**: Este documento es SOLO documentación de HALLAZGOS.
> El researcher-agent documenta hechos y evidencias SIN analizar, SIN recomendar y SIN proponer soluciones.
> El análisis de impacto y los trade-offs corresponden a Phase 2 (Analysis).

## 1. Resumen ejecutivo
- Problema investigado
- Objetivo de la investigación técnica
- Principales evidencias detectadas

---

## 2. Necesidades detectadas
- Requisitos técnicos identificados por el architect-agent
- Suposiciones del entorno de ejecución (Runtime Context)
- Límites del alcance de la investigación

---

## 3. Profundización Técnica y Hallazgos
Para cada hallazgo, desglose técnico obligatorio:
- **Descripción Atómica**: Qué es y cómo funciona a nivel de bits/protocolo.
- **Estado Técnico**: Versión, estabilidad, soporte en Node.js/Browser.
- **Documentación de Referencia**: Enlaces a RFCs, Repos, MDN o Docs oficiales.
- **Límites de Performance**: Latencia esperada, consumo de memoria, límites de concurrencia.
- **Seguridad**: Superficie de ataque, vectores de inyección, gestión de secretos involucrada.

> **NO incluir**: pros/contras, recomendaciones de "qué usar".

---

## 4. APIs y Contratos Relevantes
- Especificación de métodos y parámetros.
- Tipos de retorno (Typescript definition si aplica).
- Comportamientos ante errores (Status codes, excepciones).

---

## 5. Matriz de Compatibilidad y Entorno
- Tabla detallada de soporte (Extension Host vs Browser vs Backend).
- Restricciones de Red / Firewall / Sandboxing observadas.

---

## 6. Evidencia AI-first / Automatización
- Capacidades de la API que facilitan la orquestación agentica.
- Patrones de diseño detectados que podrían ser automatizados.

---

## 7. Riesgos Críticos Documentados
- **Riesgo**: descripción técnica del fallo potencial.
- **Severidad**: (Crítica / Alta / Media / Baja).
- **Evidencia**: Por qué es un riesgo basado en los hallazgos.

> **NO incluir**: mitigaciones o planes de acción.

---

## 8. Fuentes oficiales y bibliografía
- Lista numerada de fuentes consultadas con link directo.

---

## 9. Aprobación del desarrollador (OBLIGATORIA)
```yaml
approval:
  developer:
    decision: SI | NO
    date: <ISO-8601>
    comments: <opcional>
```
