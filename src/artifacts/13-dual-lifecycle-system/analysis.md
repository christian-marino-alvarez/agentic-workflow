---
artifact: analysis
phase: phase-2-analysis
owner: architect-agent
status: approved
related_task: 13-dual-lifecycle-system
---

# Analysis — 13-dual-lifecycle-system

## 1. Resumen ejecutivo

**Problema**
El ciclo de vida actual (`tasklifecycle`) impone 9 fases obligatorias para cualquier tarea, generando overhead innecesario para tareas simples. El desarrollador necesita flexibilidad operativa.

**Objetivo**
Implementar un sistema dual (Long/Short) que permita elegir la estrategia adecuada según la complejidad, sin perder la integridad de los gates arquitectónicos.

**Criterio de éxito**
- El desarrollador puede elegir "Short" durante `init`.
- El flujo Short completa 3 fases con validación exitosa del arquitecto.
- El campo `task.strategy` persiste en `task.md` entre sesiones.
- Los aliases resuelven correctamente en ambos ciclos.

---

## 2. Estado del proyecto (As-Is)

### Estructura relevante
```
.agent/
├── workflows/
│   ├── init.md
│   ├── index.md
│   └── tasklifecycle/           # Ciclo actual (9 fases)
│       ├── index.md
│       └── phase-[0-8]-*.md
├── templates/
│   ├── index.md
│   └── task.md                   # Sin campo strategy
└── artifacts/
    └── index.md
```

### Limitaciones detectadas
1. **Naming asimétrico**: Si creamos `tasklifecycle-short`, la carpeta original debería llamarse `tasklifecycle-long` para simetría.
2. **Sin selector de estrategia**: El workflow `init.md` no tiene paso de selección Long/Short.
3. **Template incompleto**: `task.md` no tiene campo `strategy`.
4. **Aliases únicos**: Solo existe namespace para un ciclo.

---

## 3. Cobertura de Acceptance Criteria

### AC-1: Modificación de `workflow.init` para incluir el selector
- **Interpretación**: Añadir un paso tras la confirmación de idioma para preguntar Long/Short.
- **Verificación**: El agente debe poder ejecutar `init` y recibir la pregunta de estrategia.
- **Riesgos**: Ninguno identificado.

### AC-2: Creación de workflows y fases Short
- **Interpretación**: Nueva carpeta `tasklifecycle-short/` con 3 fases y su `index.md`.
- **Verificación**: Los ficheros existen y los aliases resuelven correctamente.
- **Riesgos**: Inconsistencia en estructura de gates.

### AC-3: Actualización de `templates.task` con campo `strategy`
- **Interpretación**: Añadir `task.strategy: long | short` en el bloque YAML.
- **Verificación**: El template incluye el campo y ambos valores son válidos.
- **Riesgos**: Breaking change mínimo (los task.md existentes no tienen el campo).

### AC-4: Gates arquitectónicos intactos
- **Interpretación**: Cada fase Short tiene su propio gate con requisitos explícitos.
- **Verificación**: Revisar que cada workflow Short tiene sección `## Gate (REQUIRED)`.
- **Riesgos**: Omitir gates por simplificación excesiva.

### AC-5: Análisis profundo en Short para detectar complejidad
- **Interpretación**: La fase Brief incluye las 5 preguntas y evaluación de complejidad.
- **Verificación**: El workflow Short-P1 incluye paso de detección y opción de abortar.
- **Riesgos**: El desarrollador ignora la recomendación de abortar.

---

## 4. Diseño técnico (basado en Research aprobado)

### Rename de carpeta
| Actual | Nuevo |
|--------|-------|
| `tasklifecycle/` | `tasklifecycle-long/` |

### Nuevos ficheros a crear
1. `.agent/workflows/tasklifecycle-short/index.md`
2. `.agent/workflows/tasklifecycle-short/short-phase-1-brief.md`
3. `.agent/workflows/tasklifecycle-short/short-phase-2-implementation.md`
4. `.agent/workflows/tasklifecycle-short/short-phase-3-closure.md`
5. `.agent/templates/brief.md`
6. `.agent/templates/closure.md`

### Ficheros a modificar
1. `.agent/workflows/tasklifecycle-long/index.md` - Actualizar ID y aliases
2. `.agent/workflows/init.md` - Añadir selector Long/Short
3. `.agent/templates/task.md` - Añadir campo `strategy`
4. `.agent/workflows/index.md` - Registrar ambos ciclos
5. `.agent/templates/index.md` - Registrar nuevos templates

---

## 5. Agentes participantes

### architect-agent (Owner)
- Responsable de crear los workflows Short.
- Valida integridad de gates.
- Ejecuta verificación de aliases.

**No se requieren agentes adicionales** para esta tarea. Es puramente estructural.

### Componentes necesarios
- **Crear**: 6 ficheros nuevos (workflows + templates).
- **Modificar**: 5 ficheros existentes.
- **Eliminar**: Ninguno (rename, no delete).

### Demo
**No aplica**. Esta tarea modifica el sistema agéntico interno, no requiere demo funcional.

---

## 6. Impacto de la tarea

### Arquitectura
- Introduce dualidad de ciclos (Long/Short).
- Mantiene compatibilidad total con tareas existentes.

### APIs / contratos
- Nuevo campo `task.strategy` en el contrato de `task.md`.
- Nuevos namespaces de aliases: `taskcycle-short.phases.*`.

### Compatibilidad
- **Breaking change controlado**: El rename de carpeta requiere actualizar referencias.
- Las tareas existentes (sin `strategy`) se asumen como Long por defecto.

### Testing / verificación
- **No requiere tests de código** (es configuración de workflows).
- **Verificación manual**: Ejecutar `init`, elegir Short, completar las 3 fases.
- **Verificación de aliases**: Cadena de resolución debe funcionar.

---

## 7. Riesgos y mitigaciones

| Riesgo | Severidad | Mitigación |
|--------|-----------|------------|
| Alias rotos tras rename | ALTA | Verificación obligatoria de cadena de resolución |
| Subestimar complejidad en Short | ALTA | Brief incluye detección + opción de abortar |
| Tareas existentes sin `strategy` | MEDIA | Asumir Long por defecto si campo ausente |
| Inconsistencia de gates | ALTA | Copiar estructura de gates desde ciclo Long |

---

## 8. Preguntas abiertas
Ninguna. Todas las dudas fueron resueltas en Phase 0 y Research.

---

## 9. Aprobación
Este análisis **requiere aprobación explícita del desarrollador**.

```yaml
approval:
  developer:
    decision: SI
    date: 2026-01-16T00:06:01+01:00
    comments: Análisis aprobado
```

> Sin aprobación, esta fase NO puede darse por completada ni avanzar a Phase 3 (Planning).
