---
artifact: driver_refactor
owner: driver-agent
status: draft | approved
related_task: <taskId>-<taskTitle>
---

# Driver Refactor Report — <taskId>-<taskTitle>

## Identificacion del agente (OBLIGATORIA)
Primera linea del documento:
`<icono> **<nombre-agente>**: <mensaje>`

## 1. Resumen ejecutivo
- Driver refactorizado
- Motivo del refactor (referencia al plan)
- Estado actual

---

## 2. Alcance del refactor
- Cambios principales
- Componentes afectados
- Fuera de alcance

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
- Types
- Constants
- Wrapper
- Browser implementations
- Common (si aplica)

---

## 4. Integracion en globals y constantes
- Cambios en `globals.d.mts`
- Cambios en `constants.mts` (root)
- Verificacion de duplicados

---

## 5. Compatibilidad y riesgos
- Compatibilidad multi-browser
- Riesgos detectados
- Mitigaciones

---

## 6. Evidencias
- Archivos modificados
- Tests ejecutados
- Resultados

---

## 7. Auditoria previa al architect-agent
- Checklist de constitucion de drivers
- Hallazgos
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
