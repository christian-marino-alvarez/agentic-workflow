---
artifact: module_refactor
owner: module-agent
status: draft | approved
related_task: <taskId>-<taskTitle>
---

# Module Refactor Report — <taskId>-<taskTitle>

## Identificacion del agente (OBLIGATORIA)
Primera linea del documento:
`<icono> **<nombre-agente>**: <mensaje>`

## 1. Resumen ejecutivo
- Modulo refactorizado
- Motivo del refactor
- Estado actual

---

## 2. Alcance del refactor
- Cambios principales
- Areas afectadas

---

## 2.5 Reasoning (OBLIGATORIO)

> [!IMPORTANT]
> El agente **DEBE** completar esta sección ANTES de ejecutar.

### Análisis del objetivo
- ¿Qué se pide exactamente?
- ¿Hay ambigüedades o dependencias?

### Opciones consideradas
- **Opción A**: (descripción)
- **Opción B**: (descripción)

### Decisión tomada
- Opción elegida y justificación

---

## 3. Cambios por area
- Scopes
- Reactividad
- Estructura

---

## 4. Ciclo de vida
- Metodos afectados
- Verificacion de orden y responsabilidades

---

## 5. Compatibilidad
- Riesgos
- Mitigaciones

---

## 6. Evidencias
- Archivos modificados
- Tests ejecutados (si aplica)

---

## 7. Auditoria
- Checklist de `constitution.modules`
- Estado: ☐ APROBADO ☐ RECHAZADO

---

## 8. Aprobacion del desarrollador (OBLIGATORIA)
```yaml
approval:
  developer:
    decision: SI | NO
    date: <ISO-8601>
    comments: <opcional>
```

### Checklist gate (OBLIGATORIO)
- [ ] Aprobacion por consola registrada en este informe
- [ ] Fecha y comentario completados (si aplica)
