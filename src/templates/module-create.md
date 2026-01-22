---
artifact: module_create
owner: module-agent
status: draft | approved
related_task: <taskId>-<taskTitle>
---

# Module Creation Report — <taskId>-<taskTitle>

## Identificacion del agente (OBLIGATORIA)
Primera linea del documento:
`<icono> **<nombre-agente>**: <mensaje>`

## 1. Resumen ejecutivo
- Modulo creado
- Motivo de creacion (referencia al plan)
- Estado actual

---

## 2. Alcance y requisitos
- Funcionalidades del modulo
- Scopes requeridos (Engine obligatorio)
- Dependencias y drivers usados

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
- Arbol de archivos y carpetas creadas
- Verificacion contra `constitution.modules`

---

## 4. Scopes implementados
- Engine (obligatorio)
- Context (si aplica)
- Surfaces (si aplica)

---

## 5. Ciclo de vida
- Metodos implementados: run, _setup, _listen, setup, listen, loadProps, start
- Verificacion de orden y responsabilidades

---

## 6. Reactividad
- Propiedades declaradas con `@property`
- Listeners definidos con `@onChanged`
- Uso de `waitingLoadProps` (si aplica)

---

## 7. Types y Constants
- Types definidos en `types.d.mts`
- Constants definidos en `constants.mts`
- Aislamiento de imports

### Checklist de globals/constants (OBLIGATORIO)
- [ ] Tipos publicos registrados en `global.d.mts` bajo `Extensio.<NombreModulo>`
- [ ] Constantes exportadas en `constants.mts` del root del proyecto
- [ ] Namespace correcto: `Extensio.<NombreModulo>`


---

## 8. Integracion
- Namespace global en `globals.d.mts` (si aplica)
- Exports en `constants.mts` root (si aplica)
- Documentacion actualizada

---

## 9. Auditoria
- Checklist de `constitution.modules`
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
