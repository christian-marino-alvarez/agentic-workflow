---
artifact: plan
phase: phase-3-planning
owner: architect-agent
status: draft
related_task: 12-adaptacion-core-cli-surfaces
---

# Implementation Plan — 12-adaptacion-core-cli-surfaces

## 1. Resumen del plan

- **Contexto**: Adaptar Core y CLI para cumplir con las constituciones de Pages y Shards. Incluye cambio arquitectónico aprobado: Page como controller sin render, con capacidad de cargar Shards.

- **Resultado esperado**:
  - `Surface` con lifecycle hooks (`onMount`, `onUnmount`)
  - `Shard` heredando de `Surface` (no de `Core`)
  - `Page` como controller con `loadShard()`, sin render
  - Generadores CLI independientes para `page` y `shard`
  - Demo funcional con E2E en 3 navegadores

- **Alcance**:
  - ✅ Incluye: Core (Surface, Page, Shard), CLI (generadores), Demo, Tests
  - ❌ Excluye: Otros componentes visuales, drivers, módulos existentes

---

## 2. Inputs contractuales

- **Task**: `.agent/artifacts/12-adaptacion-core-cli-surfaces/task.md`
- **Analysis**: `.agent/artifacts/12-adaptacion-core-cli-surfaces/analysis.md`
- **Architecture Change**: `.agent/artifacts/12-adaptacion-core-cli-surfaces/analysis-architecture-change.md`
- **Acceptance Criteria**: AC 1-7 definidos en task.md

**Dispatch de dominios**

```yaml
plan:
  workflows:
    core:
      action: refactor
      workflow: null  # No existe workflow específico, implementación directa
    cli:
      action: create
      workflow: null  # Implementación directa siguiendo patrón de driver generator

  dispatch:
    - domain: core
      action: refactor
      agent: surface-agent
    - domain: cli
      action: create
      agent: architect-agent
    - domain: qa
      action: verify
      agent: qa-agent
```

---

## 3. Desglose de implementación (pasos)

### Paso 1: Refactorizar Surface
- **Descripción**: Corregir ciclo de vida de `Surface`. `onMount()` debe ejecutarse DESPUÉS de `render()`, no llamar a `run()`.
- **Dependencias**: Ninguna
- **Entregables**: `packages/core/src/surface/surface.mts` actualizado
- **Agente responsable**: surface-agent

**Cambios específicos**:
```typescript
// Antes
onMount(): void {
    this.run();  // ❌ Incorrecto
}

// Después
onMount(): void {
    // Hook para subclases, no inicia ciclo
}
```

### Paso 2: Migrar Shard para heredar de Surface
- **Descripción**: Cambiar `extends Core` → `extends Surface`. Mover lógica duplicada a Surface si aplica.
- **Dependencias**: Paso 1 completado
- **Entregables**: `packages/core/src/surface/shards/index.mts` actualizado
- **Agente responsable**: surface-agent

**Cambios específicos**:
```typescript
// Antes
export abstract class Shard extends Core implements ShardLifecycle { ... }

// Después
export abstract class Shard extends Surface implements ShardLifecycle { ... }
```

### Paso 3: Implementar Page como controller
- **Descripción**: Añadir `loadShard()`, `unloadShard()`, `getShards()` a Page. Gestionar cleanup en `onUnmount()`.
- **Dependencias**: Paso 1 completado
- **Entregables**: `packages/core/src/surface/pages/index.mts` actualizado
- **Agente responsable**: surface-agent

**Cambios específicos** (según analysis-architecture-change.md):
```typescript
export class Page extends Surface {
  private _shards: Map<string, Shard> = new Map();
  
  public async loadShard<T extends Shard>(
    ShardClass: new (context: ShardContext) => T,
    options?: PageShardOptions
  ): Promise<T> { ... }
  
  public unloadShard(shardId: string): void { ... }
  public getShards(): Shard[] { ... }
  
  protected override onUnmount(): void {
    // Cleanup all shards
  }
}
```

### Paso 4: Actualizar exports en package.json
- **Descripción**: Añadir export para Surface base si falta, verificar consistencia.
- **Dependencias**: Pasos 1-3 completados
- **Entregables**: `packages/core/package.json` actualizado
- **Agente responsable**: surface-agent

### Paso 5: Crear generador CLI para Page
- **Descripción**: Crear generador independiente que añada Page a módulo existente.
- **Dependencias**: Paso 3 completado (para template correcto)
- **Entregables**: `packages/cli/src/generators/page/` creado
- **Agente responsable**: architect-agent
- **Tool**: Implementación manual siguiendo patrón de `generators/driver/`

### Paso 6: Crear generador CLI para Shard
- **Descripción**: Crear generador independiente que añada Shard a módulo existente.
- **Dependencias**: Paso 2 completado
- **Entregables**: `packages/cli/src/generators/shard/` creado
- **Agente responsable**: architect-agent
- **Tool**: Implementación manual siguiendo patrón de `generators/driver/`

### Paso 7: Reconstruir Demo
- **Descripción**: Eliminar demo actual, crear nueva con CLI que demuestre Page cargando Shards.
- **Dependencias**: Pasos 1-6 completados
- **Entregables**: `packages/core/demo/` reconstruida
- **Agente responsable**: surface-agent
- **Tool**: `mcp_extensio-cli extensio_create` con `type: module`, `--withPage`, `--withShard`

### Paso 8: Tests unitarios
- **Descripción**: Tests para Surface, Page, Shard (herencia, lifecycle, loadShard)
- **Dependencias**: Pasos 1-4 completados
- **Entregables**: Tests en `packages/core/test/`
- **Agente responsable**: qa-agent
- **Tool**: `mcp_extensio-cli extensio_test` con `type: unit`

### Paso 9: Tests E2E
- **Descripción**: Validar demo en Chrome, Firefox, Safari
- **Dependencias**: Pasos 7-8 completados
- **Entregables**: Tests E2E pasando en 3 navegadores
- **Agente responsable**: qa-agent
- **Tool**: `mcp_extensio-cli extensio_test` con `type: e2e`, `browsers: chromium,firefox,safari`

---

## 4. Asignación de responsabilidades (Agentes)

### architect-agent
- Supervisión de gates y conformidad arquitectónica
- Implementación de generadores CLI (Pasos 5-6)
- Revisión final antes de cada gate

### surface-agent (delegado)
- Refactorización de Core (Pasos 1-4)
- Reconstrucción de Demo (Paso 7)
- Verificación de conformidad con constituciones

### qa-agent
- Diseño y ejecución de tests unitarios (Paso 8)
- Diseño y ejecución de tests E2E (Paso 9)
- Reporte de cobertura

### Handoffs
1. **architect → surface-agent**: Plan aprobado, iniciar Paso 1
2. **surface-agent → qa-agent**: Pasos 1-4 completados, iniciar tests unitarios
3. **surface-agent → architect**: Paso 7 completado (demo), revisar
4. **qa-agent → architect**: Tests pasando, gate de verificación

### Componentes

| Componente | Quién | Cómo | Tool |
|------------|-------|------|------|
| Surface refactor | surface-agent | Edición directa | Editor |
| Shard migration | surface-agent | Cambiar herencia | Editor |
| Page controller | surface-agent | Implementar loadShard | Editor |
| Generador page | architect-agent | Crear directorio + index.mts | Editor (patrón driver) |
| Generador shard | architect-agent | Crear directorio + index.mts | Editor (patrón driver) |
| Demo | surface-agent | Recrear | `mcp_extensio-cli extensio_create` |

### Demo

- **Estructura esperada** (alineada con `constitution.extensio_architecture`):
  ```
  packages/core/demo/
  ├── src/
  │   ├── engine/
  │   │   └── index.mts
  │   ├── surface/
  │   │   ├── pages/
  │   │   │   ├── index.mts
  │   │   │   └── main/
  │   │   │       ├── index.html
  │   │   │       └── index.mts
  │   │   └── shards/
  │   │       ├── index.mts
  │   │       └── example/
  │   │           └── index.mts
  │   └── manifest.json
  ├── test/
  │   └── e2e/
  ├── package.json
  └── tsconfig.json
  ```
- **Tool obligatorio**: `mcp_extensio-cli extensio_create`

---

## 5. Estrategia de testing y validación

### Unit tests (Vitest)
- **Alcance**:
  - Surface: lifecycle hooks order
  - Shard: hereda de Surface, métodos abstractos
  - Page: loadShard, unloadShard, getShards, cleanup en onUnmount
- **Herramienta**: Vitest (según `constitution.extensio_architecture`)
- **Comando**: `npm run test` o `mcp_extensio-cli extensio_test --type unit`

### E2E tests (Playwright)
- **Flujos cubiertos**:
  - Extension carga en Chrome/Firefox/Safari
  - Service Worker activo
  - Page navega correctamente
  - Shard se monta en Page
  - Comunicación Engine ↔ Page ↔ Shard
- **Herramienta**: Playwright (según `constitution.extensio_architecture`)
- **Comando**: `mcp_extensio-cli extensio_test --type e2e --browsers chromium,firefox,safari`

### Trazabilidad

| Test | AC |
|------|----|
| Surface lifecycle test | AC-1 |
| Page inherits Surface test | AC-2 |
| Shard inherits Surface test | AC-3 |
| Page.loadShard test | AC-2, AC-6 |
| CLI page generator test | AC-4 |
| CLI shard generator test | AC-5 |
| Demo E2E Chrome | AC-6, AC-7 |
| Demo E2E Firefox | AC-7 |
| Demo E2E Safari | AC-7 |

---

## 6. Plan de demo

- **Objetivo**: Demostrar que Page actúa como controller cargando Shards, sin render propio.
- **Escenarios**:
  1. Extension carga, Engine inicia
  2. Navegar a Page desde popup
  3. Page carga 2 Shards dinámicamente
  4. Shards renderizan contenido
  5. Cerrar Page → Shards se desmontan (onUnmount)
- **Datos de ejemplo**: Shards mostrarán datos mock
- **Criterios de éxito**:
  - Build sin errores para Chrome, Firefox, Safari
  - E2E tests pasan en 3 navegadores
  - No errores en consola

---

## 7. Estimaciones y pesos de implementación

| Paso | Descripción | Esfuerzo | Dependencia |
|------|-------------|----------|-------------|
| 1 | Refactorizar Surface | Bajo | - |
| 2 | Migrar Shard → Surface | Medio | 1 |
| 3 | Page como controller | Medio | 1 |
| 4 | Actualizar exports | Bajo | 1-3 |
| 5 | Generador page CLI | Medio | 3 |
| 6 | Generador shard CLI | Medio | 2 |
| 7 | Reconstruir demo | Medio | 1-6 |
| 8 | Tests unitarios | Medio | 1-4 |
| 9 | Tests E2E | Alto | 7-8 |

**Timeline aproximado**: 1-2 sesiones de trabajo

**Suposiciones**:
- No hay dependencias circulares en código existente
- Playwright ya está configurado
- Vitest ya está configurado

---

## 8. Puntos críticos y resolución

### Punto crítico 1: Breaking change en Shard
- **Riesgo**: Módulos existentes que usan Shard pueden romperse
- **Impacto**: Alto
- **Resolución**: 
  - Mantener API pública idéntica
  - Solo cambiar herencia interna (Core → Surface)
  - Verificar demos de módulos existentes después del cambio

### Punto crítico 2: onMount timing
- **Riesgo**: Cambiar cuándo se ejecuta onMount puede romper código existente
- **Impacto**: Medio
- **Resolución**:
  - Documentar claramente el nuevo comportamiento
  - Añadir logs de deprecación si se detecta uso incorrecto
  - Tests exhaustivos de lifecycle

### Punto crítico 3: Safari compatibility
- **Riesgo**: Webkit puede comportarse diferente
- **Impacto**: Medio
- **Resolución**:
  - Tests E2E específicos para webkit
  - Verificar comportamiento de customElements en Safari

---

## 9. Dependencias y compatibilidad

### Dependencias internas
- `@extensio/core` → base
- `@extensio/driver-storage` → reactividad
- `@extensio/driver-runtime` → comunicación

### Dependencias externas
- Lit (opcional, para Shards)
- Vitest (testing)
- Playwright (E2E)

### Compatibilidad entre navegadores
| Feature | Chrome | Firefox | Safari |
|---------|--------|---------|--------|
| Service Worker | ✅ | ✅ | ✅ |
| customElements | ✅ | ✅ | ✅ |
| Storage API | ✅ | ✅ | ✅ |
| Scripting API | ✅ | ✅ | ✅ |

### Restricciones arquitectónicas
- Surface DEBE ser clase abstracta
- Page NO renderiza (solo carga Shards)
- Shard DEBE heredar de Surface

---

## 10. Criterios de finalización

### Checklist final

- [ ] Surface con hooks `onMount()`, `onUnmount()` ejecutándose en momento correcto
- [ ] Shard hereda de Surface (no Core)
- [ ] Page hereda de Surface con `loadShard()`, `unloadShard()`, `getShards()`
- [ ] Page NO tiene método render (solo Shards renderizan)
- [ ] Exports actualizados en package.json
- [ ] Generador `extensio create page` funcional
- [ ] Generador `extensio create shard` funcional
- [ ] Demo reconstruida con CLI
- [ ] Tests unitarios pasan
- [ ] Tests E2E pasan en Chrome
- [ ] Tests E2E pasan en Firefox
- [ ] Tests E2E pasan en Safari
- [ ] Build sin errores para 3 navegadores

---

## 11. Aprobación del desarrollador (OBLIGATORIA)

Este plan **requiere aprobación explícita y binaria**.

```yaml
approval:
  developer:
    decision: SI
    date: 2026-01-14T08:07:44+01:00
    comments: Aprobado para implementación
```
