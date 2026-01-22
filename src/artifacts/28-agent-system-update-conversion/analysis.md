🏛️ **architect-agent**: He completado el análisis profundo para el sistema de actualización y conversión.

---
artifact: analysis
phase: phase-2-analysis
owner: architect-agent
status: draft
related_task: 28-Agent System Update & Conversion System
---

# Analysis — 28-Agent System Update & Conversion System

## Identificacion del agente (OBLIGATORIA)
🏛️ **architect-agent**: Análisis de arquitectura y estrategia de migración para la actualización del sistema agéntico.

## 1. Resumen ejecutivo
**Problema**
- El ecosistema Extensio está evolucionando hacia un framework portable agnóstico (`@cmarino/agentic-workflow`). Las instalaciones actuales en directorios `.agent/` legacy no son compatibles con los nuevos estándares de identidad (prefijos), disciplina (gates) y estructura (índices globales).

**Objetivo**
- Implementar un mecanismo de actualización y migración ("Wizard") dentro del paquete `@cmarino/agentic-workflow` que automatice la transición de sistemas legacy al nuevo estándar.

**Criterio de éxito**
- Un sistema legacy convertido debe ser capaz de ejecutar el workflow `init` y completar una tarea compleja siguiendo el ciclo de vida sin errores de referencia o identidad.

---

## 2. Estado del proyecto (As-Is)
**Estructura relevante**
- `.agent/`: Carpeta raíz que contiene el sistema de orquestación.
- `agentic-workflow/src/cli/commands/init.ts`: Punto de entrada actual para la creación del sistema en proyectos nuevos.

**Drivers existentes**
- No aplica directamente, pero el sistema de migración debe evitar interferir con los drivers del proyecto padre (Extensio u otros).

**Core / Engine / Surfaces**
- El core del sistema agéntico está en `agentic-workflow/src/core/`. El Wizard impactará principalmente en la lógica del CLI.

**Artifacts / tareas previas**
- Tarea #21, #26, #27: Sentaron las bases del sistema portable y la nueva identidad de agentes.

**Limitaciones detectadas**
- **Sintaxis Legacy**: Versiones antiguas no tienen `id` en el frontmatter de los índices.
- **Falta de Trazabilidad**: Sistemas antiguos no registran versiones en `.agent/index.md`.

---

## 3. Cobertura de Acceptance Criteria

### AC-1: Detección Universal
- **Interpretación**: El Wizard debe identificar si `.agent/` existe y qué "sabor" (Extensio v1, v2 o Custom) tiene.
- **Verificación**: Comprobar la existencia de archivos clave como `.agent/rules/index.md` frente al nuevo `.agent/index.md`.
- **Riesgos**: Directorios `.agent/` vacíos o corruptos.

### AC-2: Adaptación de Contenido
- **Interpretación**: No solo mover archivos, sino editar el frontmatter de Rules y Workflows para inyectar `version`, `id` y `severity`.
- **Verificación**: Auditoría post-migración de claves YAML obligatorias.
- **Riesgos**: Pérdida de comentarios manuales del usuario en archivos YAML.

### AC-3: UX Visual (Wizard)
- **Interpretación**: Utilizar `@clack/prompts` para mostrar un resumen de lo detectado y lo que se va a cambiar.
- **Verificación**: Ejecución manual del CLI observando la claridad de los mensajes.

### AC-4: Consentimiento Informado
- **Interpretación**: El usuario debe ver una lista de "Breaking Changes" antes de pulsar SI.
- **Verificación**: Existe un paso de `confirm` bloqueante en el código del CLI.

### AC-5: Validación Funcional
- **Interpretación**: El sistema migrado debe ser 100% operativo.
- **Verificación**: Ejecución de un ciclo de vida completo (Fases 0 a 8) en un entorno de pruebas convertido.

---

## 4. Research técnico
Basado en el informe del `researcher-agent` (aprobado).

- **Alternativa A: Sobrescritura Directa**
  - **Descripción**: Borrar `.agent/` y recrearlo (scaffold).
  - **Ventajas**: Simplicidad máxima.
  - **Inconvenientes**: Pérdida total de personalizaciones y artefactos de tareas en curso. **(RECHAZADA)**

- **Alternativa B: Backup & Merge Inteligente ( Wizard)**
  - **Descripción**: Mover `.agent/` a `.agent.backup_<timestamp>/`, crear el nuevo sistema e intentar migrar archivos de `/artifacts/` y reglas custom.
  - **Ventajas**: Seguridad total contra pérdida de datos.
  - **Inconvenientes**: Mayor complejidad de implementación. **(RECOMENDADA)**

---

## 5. Agentes participantes
- **architect-agent**
  - Responsabilidades: Diseño de la lógica de conversión y esquemas de validación.
- **tooling-agent** (Implementador)
  - Responsabilidades: Modificación del CLI en `agentic-workflow/src/cli/` e integración de `gray-matter`.
- **qa-agent**
  - Responsabilidades: Creación de un escenario de prueba con un sistema legacy y verificación de la migración.

**Handoffs**
- El Architect entrega este análisis. Tooling implementa. QA valida.

**Componentes necesarios**
- **NUEVO**: `agentic-workflow/src/cli/commands/update.ts` (Comando `update`).
- **NUEVO**: Módulo de migración en `src/core/migration/`.

---

## 6. Impacto de la tarea
- **Arquitectura**: Se introduce un sistema de versionado en los índices para facilitar futuras actualizaciones.
- **APIs / contratos**: El comando `init` podría redirigir a `update` si detecta una instalación previa.
- **Compatibilidad**: Alta. El objetivo es precisamente recuperarla.
- **Testing**: Pruebas de integración para asegurar que el sistema de archivos resultante es válido.

---

## 7. Riesgos y mitigaciones
- **Riesgo 1: Corrupción durante la escritura**
  - **Impacto**: Crítico (Carga de sistema rota).
  - **Mitigación**: Operar sobre un directorio temporal y renombrar solo si el proceso finaliza con éxito.
- **Riesgo 2: Falsos positivos en detección**
  - **Impacto**: Bajo (Sobrescritura innecesaria).
  - **Mitigación**: Usar múltiples anclas de detección (index.md, roles/architect.md).

---

## 8. Preguntas abiertas
- ¿Debemos migrar también la carpeta `.git/` si el sistema antiguo estaba trackeado? **Respuesta: No, el sistema opera sobre el espacio de trabajo actual, independientemente de Git.**

---

## 9. TODO Backlog (Consulta obligatoria)
**Referencia**: `.agent/todo/`
**Estado actual**: 4 items pendientes.

**Items relevantes para esta tarea**:
- **#004 - Portable Agentic System**: Esta tarea es la implementación del mecanismo de actualización para dicho sistema.

**Impacto en el análisis**:
- Se debe asegurar que la migración mantenga el desacoplamiento total de Extensio iniciado en la tarea #21.

---

## 10. Aprobación
Este análisis **requiere aprobación explícita del desarrollador**.

```yaml
approval:
  developer:
    decision: SI
    date: "2026-01-20T00:16:00+01:00"
    comments: "Aprobado vía consola."
```

---
🏛️ **architect-agent**: Análisis finalizado. He seleccionado la estrategia de **Backup & Merge Inteligente** para garantizar la seguridad de tus datos durante la conversión. ¿Deseas proceder con el plan de implementación detallado?
