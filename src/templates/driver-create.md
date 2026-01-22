---
artifact: driver_create
owner: driver-agent
status: draft | approved
related_task: <taskId>-<taskTitle>
---

# Driver Creation Report — <taskId>-<taskTitle>

## Identificacion del agente (OBLIGATORIA)
Primera linea del documento:
`<icono> **<nombre-agente>**: <mensaje>`

## 1. Resumen ejecutivo
- Driver creado
- Motivo de creacion (referencia al plan)
- Estado actual

---

## 2. Alcance y requisitos
- Requisitos funcionales del driver
- APIs objetivo (Web APIs / WebExtensions)
- Navegadores target

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

## 3. Estructura creada
- `src/index.mts`
- `src/__BROWSER__/index.mts`
- `src/types.d.mts`
- `src/constants.mts`
- `src/common/index.mts` (si aplica)
- `demo/` (si aplica)

---

## 4. Types (aislamiento y namespace)
- Tipos locales definidos
- Sin imports de otros drivers
- Namespace Extensio (si aplica)

---

## 5. Constants
- Enumeraciones creadas en `constants.mts`
- Tipos derivados de constants
- Sin consumo de constants de otros drivers

---

## 6. Wrapper y browser implementations
- Wrapper estable y documentado
- Implementaciones por navegador
- Diferencias manejadas en `__BROWSER__`

---

## 7. Compatibilidad y riesgos
- Tabla de compatibilidad
- Riesgos detectados
- Mitigaciones

---

## 8. Integracion en el ecosistema
- Exports/aliases actualizados
- Referencias en globals/constants del proyecto (si aplica)
- Documentacion actualizada

---

## 9. Auditoria previa al architect-agent
- Checklist de constitucion de drivers
- Hallazgos
- Estado: ☐ APROBADO ☐ RECHAZADO

---

## 10. Evidencias
- Archivos creados
- Cambios clave
- Referencias

---

## 11. Aprobacion del desarrollador (OBLIGATORIA)
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
