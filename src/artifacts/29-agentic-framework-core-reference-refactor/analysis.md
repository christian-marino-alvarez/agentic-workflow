🏛️ **architect-agent**: He finalizado el análisis estructural para el modelo de referencia absoluta.

---
artifact: analysis
phase: phase-2-analysis
owner: architect-agent
status: draft
related_task: 29-Agentic Framework Core Reference Refactor
---

# Analysis — 29-Agentic Framework Core Reference Refactor

## Identificacion del agente (OBLIGATORIA)
🏛️ **architect-agent**: Análisis de arquitectura para la migración al modelo de Core Protegido por Referencia.

## 1. Resumen ejecutivo
**Problema**
- El sistema actual copia físicamente el core agéntico a cada repositorio de usuario. Esto genera redundancia y dificulta las actualizaciones.
**Objetivo**
- Refactorizar `@cmarino/agentic-workflow` para que el CLI `init` genere un ecosistema donde el core reside en `node_modules` y el usuario extiende el sistema manteniendo la **misma estructura espejo** en `.agent/` (ej: `.agent/roles/`, `.agent/workflows/`) para sus archivos propios.

**Criterio de éxito**
- Una instalación limpia debe tener un `index.md` local que apunte a las rutas absolutas del core y que se fusione con la estructura espejo local en `.agent/` para permitir extensiones del usuario.

---

## 2. Estado del proyecto (As-Is)
**Estructura relevante**
- `agentic-workflow/src/cli/commands/init.ts`: Actualmente copia ficheros core a `.agent/`.
- `agentic-workflow/src/core/migration/`: Contiene la lógica recientemente implementada que debe adaptarse al nuevo modelo.

**Drivers existentes**
- No aplica (Core agéntico).

**Artifacts / tareas previas**
- Tarea #28: Implementó el Wizard de migración que ahora vamos a "desviar" hacia una arquitectura de referencia.

**Limitaciones detectadas**
- Los agentes de IDE suelen tener configuraciones que excluyen `node_modules` de la búsqueda global, lo que obliga a usar enlaces explícitos en Markdown.

---

## 3. Cobertura de Acceptance Criteria

### AC-1: Zero Copy Core
- **Interpretación**: El CLI no debe copiar `/rules`, `/workflows` o `/templates` base.
- **Verificación**: Inspección de la carpeta `.agent/` tras `init`. Solo debe contener `index.md`, `artifacts/`, `metrics/` y el nuevo `custom/`.

### AC-2: Reference Mapping
- **Interpretación**: Los alias globales deben resolverse mediante rutas absolutas físicas.
- **Verificación**: Ejecución de un workflow que use un alias de constitución del core.

### AC-3: Reserved Namespace
- **Interpretación**: El CLI debe proteger nombres como "Architect" o "tasklifecycle".
- **Verificación**: Tests unitarios del comando de creación de roles/workflows.

### AC-4: Local Extensibility (Mirror Structure)
- **Interpretación**: El sistema debe fusionar dinámicamente el core (en node_modules) con lo que exista localmente en la carpeta espejo correspondiente (ej: `.agent/roles/mi-rol.md`).
- **Verificación**: Un rol creado localmente en la ruta espejo debe ser indexado sin problemas.

### AC-5: IDE Discovery
- **Interpretación**: `AGENTS.md` debe ser el mapa de navegación.

---

## 4. Research técnico
Basado en el informe del `researcher-agent` (aprobado).

- **Estrategia Recomendada: Absolute Path Mirror Injections**
  - El CLI inyecta los paths absolutos del core en el `index.md`.
  - El sistema de detección de extensiones busca archivos locales que sigan la misma jerarquía de carpetas que el core, permitiendo al desarrollador añadir roles, workflows o reglas simplemente creando archivos en las subcarpetas de `.agent/`.

---

## 5. Agentes participantes
- **architect-agent**
  - Responsabilidades: Definir el "Reserved Namespace" y el nuevo esquema de `index.md`.
- **tooling-agent**
  - Responsabilidades: Refactor del CLI y creación de comandos `create-role`, `create-workflow`.

**Componentes necesarios**
- **Refactor**: `agentic-workflow/src/cli/commands/init.ts`.
- **NUEVO**: `agentic-workflow/src/core/mapping/resolver.ts` (Resolución de rutas absolutas).
- **NUEVO**: Comandos de scaffolding local.

---

## 6. Impacto de la tarea
- **Arquitectura**: Cambio de modelo de "Snapshot" a "Reference".
- **Mantenibilidad**: Máxima. El usuario actualiza el npm y automáticamente tiene las nuevas reglas sin tocar su repositorio local.
- **IDE Performance**: Mejora al reducir el número de ficheros locales indexados.

---

## 7. Riesgos y mitigaciones
- **Riesgo: Mover el directorio de node_modules**
  - **Impacto**: El mapa de paths se rompe.
  - **Mitigación**: Implementar un comando `agentic-workflow refresh` que re-escanee y actualice las rutas absolutas.

---

## 8. TODO Backlog (Consulta obligatoria)
- **#004 - Portable Agentic System**: Esta tarea es la evolución final de este TODO, llevando la portabilidad al siguiente nivel de sofisticación técnica.

---

## 9. Aprobación
Este análisis **requiere aprobación explícita del desarrollador**.

```yaml
approval:
  developer:
    decision: null # SI | NO
    date: null
    comments: null
```

---
🏛️ **architect-agent**: Análisis finalizado. Hemos pasado del modelo de "fotocopia" al modelo de "enlace inteligente". Este es el estándar de oro para sistemas de orquestación modernos. ¿Deseas que proceda con el plan de implementación?
