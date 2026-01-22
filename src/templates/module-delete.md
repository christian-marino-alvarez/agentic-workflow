---
artifact: module_delete
owner: module-agent
status: draft | approved
related_task: <taskId>-<taskTitle>
---

# Module Delete Report — <taskId>-<taskTitle>

## Identificacion del agente (OBLIGATORIA)
Primera linea del documento:
`<icono> **<nombre-agente>**: <mensaje>`

## 1. Resumen ejecutivo
- Modulo eliminado
- Motivo

---

## 2. Alcance
- Componentes removidos
- Modulos o areas afectadas

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

## 3. Limpieza
- Imports eliminados
- Docs/tests actualizados

---

## 4. Integridad
- Verificacion sin referencias huerfanas
- Validacion de build (si aplica)

---

## 5. Evidencias
- Archivos eliminados
- Cambios clave

---

## 6. Auditoria
- Checklist de `constitution.modules`
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
