---
artifact: driver_delete
owner: driver-agent
status: draft | approved
related_task: <taskId>-<taskTitle>
---

# Driver Deletion Report — <taskId>-<taskTitle>

## Identificacion del agente (OBLIGATORIA)
Primera linea del documento:
`<icono> **<nombre-agente>**: <mensaje>`

## 1. Resumen ejecutivo
- Driver eliminado
- Motivo de eliminacion (referencia al plan)
- Estado actual

---

## 2. Alcance de la eliminacion
- Componentes removidos
- Dependencias afectadas
- Riesgos

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

## 3. Limpieza de referencias
- Imports eliminados
- Docs actualizadas
- Tests actualizados/eliminados

---

## 4. Integracion en globals y constantes
- Cambios en `globals.d.mts`
- Cambios en `constants.mts` (root)
- Verificacion de duplicados

---

## 5. Evidencias
- Archivos eliminados
- Cambios clave

---

## 6. Auditoria previa al architect-agent
- Checklist de integridad
- Hallazgos
- Estado: ☐ APROBADO ☐ RECHAZADO

---

## 7. Aprobacion del desarrollador (OBLIGATORIA)
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
