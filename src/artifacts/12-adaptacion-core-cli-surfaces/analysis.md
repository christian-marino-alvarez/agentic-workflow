---
artifact: analysis
phase: phase-2-analysis
owner: architect-agent
status: draft
related_task: 12-adaptacion-core-cli-surfaces
---

# Analysis — 12-adaptacion-core-cli-surfaces

## 1. Resumen ejecutivo

### Problema
La implementación actual de `@extensio/core` y `extensio-cli` no está completamente alineada con las constituciones de Pages (v2.1.0) y Shards (v2.0.0). El gap más crítico es que `Shard` hereda de `Core` en lugar de `Surface`, violando la jerarquía arquitectónica definida.

### Objetivo
Adaptar Core y CLI para cumplir con las constituciones de Surfaces, garantizando:
- Jerarquía correcta: `Core` → `Surface` → `Page` / `Shard`
- Lifecycle hooks uniformes en `Surface`
- CLI capaz de generar Pages y Shards correctamente
- Demo funcional validada con E2E en 3 navegadores

### Criterio de éxito
Todos los acceptance criteria del task.md deben cumplirse:
- [x] Informe de gaps documentado (completado en Phase 1)
- [ ] Clase `Surface` con hooks uniformes
- [ ] Clase `Page` conforme a constitución
- [ ] Clase `Shard` heredando de `Surface`
- [x] CLI puede generar Pages/Shards al crear módulo (`--withPage --withShard`)
- [ ] CLI con comandos independientes `create page` / `create shard` (para añadir a módulo existente)
- [ ] Demo reconstruida con CLI
- [ ] Tests pasando en Chrome, Firefox, Safari

---

## 2. Estado del proyecto (As-Is)

### Estructura relevante

```
packages/core/
├── src/
│   ├── engine/
│   │   └── core.mts           # Clase base Core (390 líneas)
│   └── surface/
│       ├── surface.mts        # Surface actual (57 líneas)
│       ├── pages/
│       │   └── index.mts      # Page actual (9 líneas)
│       └── shards/
│           ├── index.mts      # Shard actual (249 líneas)
│           ├── lit.mts        # Adaptador Lit
│           ├── react.mts      # Adaptador React
│           └── angular.mts    # Adaptador Angular
├── demo/
│   └── src/
│       └── manifest.json      # ⚠️ INCOMPLETA
└── test/
    └── ...                    # Tests existentes

packages/cli/
├── src/
│   ├── generators/
│   │   ├── driver/            # ✅ Funcional
│   │   ├── module/            # ✅ Funcional (con withPage, withShard)
│   │   └── project/           # ✅ Funcional
│   └── commands/
│       ├── plugins/
│       │   └── surface-pages/ # ✅ Plugin funcional
│       └── process-shards.mts # ✅ Funcional
```

### Estado actual de clases

| Clase | Hereda de | Líneas | Conformidad |
|-------|-----------|--------|-------------|
| `Core` | — | 390 | ✅ Base correcta |
| `Surface` | `Core` | 57 | ⚠️ Ciclo de vida incompleto |
| `Page` | `Surface` | 9 | ⚠️ Implementación mínima |
| `Shard` | `Core` | 249 | ❌ **DEBE heredar de Surface** |

### Estado actual del CLI (VALIDADO)

El generador de módulos **SÍ tiene soporte** para Pages y Shards:

| Opción | Descripción | Estado |
|--------|-------------|--------|
| `--withPage` | Genera estructura de pages | ✅ Funcional |
| `--withShard` | Genera estructura de shards | ✅ Funcional |
| `--withSurface` | Legacy (activa ambos) | ✅ Funcional |

**Templates existentes:**

Pages (`templates/surface/pages/`):
- `index.mts.ejs` - Usa Lit + decorador `@customElement`
- `home.mts.ejs` - Página de ejemplo
- `about.mts.ejs` - Página de ejemplo
- `styles.css.ejs` - Estilos

Shards (`templates/surface/shards/`):
- `index.mts.ejs` - Registra shards con `Shard.register()`
- `example.mts.ejs` - Shard de ejemplo con `_mount`, `render`, `update`, `_unmount`, `getTagName`
- `styles.css.ejs` - Estilos

**Generador module/index.mts** (líneas relevantes):
- L322-356: Genera pages si `withPage=true`
- L359-391: Genera shards si `withShard=true`
- L190-195: Añade exports en package.json

### Limitaciones detectadas (ACTUALIZADO)

1. **Shard hereda de Core**: Viola arquitectura. Debe heredar de Surface.
2. **Surface ciclo de vida**: `onMount()` llama a `run()`, pero según constitución debe ejecutarse DESPUÉS de `render()`.
3. **Page mínima**: Solo hereda, no implementa nada específico.
4. **CLI sin comandos independientes**: No existe `extensio create page` ni `extensio create shard` para añadir a módulos existentes. Solo se puede al crear módulo nuevo.
5. **Demo incompleta**: Solo tiene `manifest.json`.
6. **Templates de Page**: Usan Lit/decoradores pero Page en core no implementa render() compatible.

---

## 3. Cobertura de Acceptance Criteria

### AC-1: Surface con hooks uniformes
- **Interpretación**: La clase `Surface` debe definir `onMount()` y `onUnmount()` como hooks que heredan Page y Shard. El ciclo de vida debe seguir la secuencia: `run()` → `_setup()` → `listen()` → `loadProps()` → `start()` → `render()` → `onMount()`.
- **Verificación**: 
  - Unit test que valide la secuencia de hooks
  - Ambas subclases (Page, Shard) deben tener los hooks disponibles
- **Riesgos**: Cambiar el momento de ejecución de `onMount()` podría romper código existente.

### AC-2: Page hereda de Surface
- **Interpretación**: Ya cumple, pero necesita más funcionalidad (método `render()`, gestión de ciclo completo).
- **Verificación**: 
  - Unit test de herencia
  - E2E: navegar a una Page y verificar ciclo
- **Riesgos**: Bajo. Page ya hereda de Surface.

### AC-3: Shard hereda de Surface
- **Interpretación**: **Cambio crítico**. Shard debe refactorizarse para heredar de Surface, moviendo lógica común a Surface.
- **Verificación**: 
  - Unit test de herencia
  - E2E: cargar Shard en página web y verificar ciclo
- **Riesgos**: 
  - **Breaking change**: Adaptar importaciones de Shard
  - Mover lógica de Storage/listener a Surface

### AC-4: CLI genera Pages
- **Interpretación**: Crear generador `page` independiente que produzca estructura conforme a constitución.
- **Verificación**: 
  - Ejecutar `extensio create page` y validar estructura generada
  - Build de la Page sin errores
- **Riesgos**: Templates deben seguir constitución exactamente.

### AC-5: CLI genera Shards
- **Interpretación**: Crear generador `shard` independiente que produzca estructura conforme a constitución.
- **Verificación**: 
  - Ejecutar `extensio create shard` y validar estructura generada
  - Build del Shard sin errores
- **Riesgos**: Registro como WebComponent debe funcionar.

### AC-6: Demo reconstruida
- **Interpretación**: Eliminar demo actual, crear nueva con CLI usando `extensio create module --withPages --withShards`, o crear module manualmente con Page y Shard de ejemplo.
- **Verificación**: 
  - Demo compila sin errores
  - Funciona en Chrome, Firefox, Safari
- **Riesgos**: Dependencia de cambios previos en Core y CLI.

### AC-7: Tests pasan
- **Interpretación**: Unit tests en Vitest, E2E en Playwright para los 3 navegadores.
- **Verificación**: 
  - `npm run test` pasa
  - `npm run test:e2e -- --project=chromium,firefox,webkit` pasa
- **Riesgos**: Safari (webkit) puede tener diferencias de comportamiento.

---

## 4. Research técnico

### Alternativa A: Migración incremental
- **Descripción**: Refactorizar paso a paso, empezando por Surface, luego Page, luego Shard.
- **Ventajas**: Menor riesgo de regresiones, permite testing gradual.
- **Inconvenientes**: Puede dejar inconsistencias temporales.

### Alternativa B: Migración completa (Big Bang)
- **Descripción**: Refactorizar todo el stack (Surface, Page, Shard) de una vez.
- **Ventajas**: Consistencia inmediata, no hay estados intermedios.
- **Inconvenientes**: Mayor riesgo, más difícil de depurar si falla.

### Decisión recomendada
**Alternativa A: Migración incremental** 

Orden propuesto:
1. Refactorizar `Surface` (ciclo de vida correcto)
2. Refactorizar `Shard` para heredar de `Surface`
3. Verificar `Page` (ya hereda correctamente)
4. Actualizar templates CLI si es necesario
5. Reconstruir demo con `extensio create module --withPage --withShard`
6. Tests E2E

---

## 5. Agentes participantes

### architect-agent
- **Responsabilidades**: 
  - Validar conformidad arquitectónica
  - Aprobar cambios en Core
  - Supervisar gates de cada fase
- **Subáreas**: Core, CLI, constituciones

### surface-agent (delegado)
- **Responsabilidades**:
  - Implementar cambios en Surface, Page, Shard
  - Verificar lifecycle hooks
- **Subáreas**: `packages/core/src/surface/`

### qa-agent
- **Responsabilidades**:
  - Diseñar tests unitarios
  - Diseñar tests E2E
  - Validar cobertura en 3 navegadores
- **Subáreas**: `packages/core/test/`, Playwright

### Handoffs
1. architect-agent → surface-agent: Plan de implementación aprobado
2. surface-agent → qa-agent: Código implementado para testing
3. qa-agent → architect-agent: Resultados de verificación

### Componentes a modificar

| Tipo | Acción | Componente |
|------|--------|------------|
| Core | MODIFICAR | `src/surface/surface.mts` |
| Core | MODIFICAR | `src/surface/shards/index.mts` |
| Core | VERIFICAR | `src/surface/pages/index.mts` |
| Core | MODIFICAR | `package.json` (exports) |
| CLI | CREAR | `src/generators/page/` (comando independiente) |
| CLI | CREAR | `src/generators/shard/` (comando independiente) |
| CLI | VERIFICAR | Templates existentes en `generators/module/` |
| Demo | RECREAR | `packages/core/demo/` |

### Demo (obligatoria)
- **Necesidad**: Validar que Pages y Shards funcionan correctamente según constitución.
- **Justificación**: Los acceptance criteria exigen demo con E2E en 3 navegadores.
- **Impacto**: Eliminar demo actual, crear nueva con:
  - Engine básico
  - Al menos 1 Page
  - Al menos 1 Shard
  - Manifest configurado para popup y content scripts

---

## 6. Impacto de la tarea

### Arquitectura
- **Alto impacto**: Cambio de herencia de Shard (Core → Surface)
- **Medio impacto**: Refactorización de ciclo de vida de Surface

### APIs / contratos
- `Shard` cambiará de base class (potencial breaking change)
- Nuevos exports en `package.json` de Core

### Compatibilidad
| Riesgo | Mitigación |
|--------|------------|
| Módulos existentes con Shard | Verificar demos de módulos existentes |
| Imports de `@extensio/core/shard` | Mantener compatibilidad de exports |

### Testing / verificación
- **Unit tests**: Vitest para Core (lifecycle, herencia)
- **Integration tests**: Carga de Shards desde Engine
- **E2E tests**: Playwright en Chrome, Firefox, Safari

---

## 7. Riesgos y mitigaciones

| # | Riesgo | Severidad | Mitigación |
|---|--------|-----------|------------|
| 1 | Breaking change en Shard | 🔴 Alta | Mantener API pública, solo cambiar herencia interna |
| 2 | Ciclo de vida de Surface rompe código existente | 🟡 Media | Tests exhaustivos antes y después |
| 3 | Safari comportamiento diferente | 🟡 Media | Tests E2E específicos para webkit |
| 4 | CLI templates desactualizados | 🟢 Baja | Crear templates nuevos siguiendo constitución |

---

## 8. Preguntas abiertas

No hay preguntas abiertas. Los acceptance criteria están claramente definidos desde Phase 0.

---

## 9. Aprobación del desarrollador (OBLIGATORIA)

```yaml
approval:
  developer:
    decision: SI
    date: 2026-01-14T08:03:49+01:00
    comments: Aprobado con cambio arquitectónico (Page como controller sin render)
```

> Sin aprobación, esta fase **NO puede darse por completada** ni avanzar a Phase 3.
