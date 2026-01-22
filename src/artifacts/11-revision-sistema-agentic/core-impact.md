# Impacto en Core: Refactorización de Surface/Shard

## Contexto
Durante la revisión de las constituciones de Modules, Pages y Shards, se identificaron cambios arquitectónicos necesarios en el código del Core para alinear la implementación con la arquitectura definida.

## Cambios Requeridos

### 1. Shard debe heredar de Surface (no de Core)

**Archivo**: `packages/core/src/surface/shards/index.mts`

**Estado actual**:
```ts
export abstract class Shard extends Core implements ShardLifecycle
```

**Estado deseado**:
```ts
export abstract class Shard extends Surface implements ShardLifecycle
```

**Impacto**:
- Shard heredará `onMount()` y `onUnmount()` de Surface
- Shard tendrá acceso a `onStorageChanged()` y `checkListeners()`
- La jerarquía será: `Core → Surface → Shard`

**Riesgo**: Medio. Verificar que no hay conflictos de métodos.

---

### 2. onMount() debe ser automático post-render

**Archivo**: `packages/core/src/surface/surface.mts`

**Estado actual**:
```ts
onMount(): void {
    this.run();
}
```

**Estado deseado**:
```ts
// onMount es un hook que se ejecuta DESPUÉS de render()
protected onMount(): void {
    // Hook vacío - subclases lo sobrescriben
}

public async run() {
    await this._setup();
    await this.start();
    await this.render();
    this.onMount();  // <-- Llamar automáticamente después de render
}
```

**Impacto**:
- `onMount()` ya no es el punto de entrada
- `run()` es el punto de entrada
- `onMount()` es un hook que el desarrollador sobrescribe

**Riesgo**: Alto. Cambio de comportamiento. Revisar uso en código existente.

---

### 3. Añadir render() abstracto a Surface

**Archivo**: `packages/core/src/surface/surface.mts`

**Estado actual**: No existe `render()` en Surface.

**Estado deseado**:
```ts
export abstract class Surface extends Core {
    // ...
    
    /**
     * Renderiza el contenido de la Surface.
     * Subclases deben implementar.
     */
    public abstract render(): Promise<void>;
}
```

**Impacto**:
- Page y Shard deben implementar `render()`
- Unifica el contrato de renderizado

**Riesgo**: Medio. Page actual no tiene `render()`.

---

### 4. Evaluar integración de ShardLifecycle en Surface

**Archivos**: 
- `packages/core/src/surface/shards/types.d.mts`
- `packages/core/src/surface/surface.mts`

**Evaluación**:
La interface `ShardLifecycle` define:
```ts
interface ShardLifecycle {
    mount(container: HTMLElement): Promise<void>;
    update(props: Record<string, any>): void;
    unmount(): void;
    getTagName(): string;
    render?(): Promise<void>;
}
```

**Propuesta**:
- `render()` → Mover a Surface (abstracto)
- `mount(container)` → Solo en Shard (Page no usa container explícito)
- `update(props)` → Solo en Shard
- `getTagName()` → Solo en Shard
- `unmount()` → Mover a Surface (con implementación base)

**Resultado**:
- Surface: `render()`, `unmount()`, `onMount()`, `onUnmount()`
- Shard: `mount(container)`, `update(props)`, `getTagName()`, `_mount()`, `_unmount()`

---

## Orden de Implementación Recomendado

1. **Añadir `render()` abstracto a Surface**
2. **Implementar `render()` en Page** (vacío o con lógica base)
3. **Mover `onMount()` a ser hook post-render** en Surface
4. **Cambiar Shard para extender Surface**
5. **Ajustar `mount()` de Shard** para llamar hooks en orden correcto
6. **Tests**: Ejecutar tests unitarios y E2E

---

## Tests Afectados

- `packages/core/test/unit/decorators.test.mts`
- `packages/core/demo/` (demo de Core)
- Cualquier módulo que use Shards

---

## Criterio de Éxito

1. Jerarquía: `Core → Surface → Page` y `Core → Surface → Shard`
2. `onMount()` se ejecuta automáticamente después de `render()`
3. `onUnmount()` se ejecuta automáticamente antes de destruir
4. Todos los tests pasan
5. Demo funciona correctamente

---

## Prioridad

**Alta** - Estos cambios son necesarios para que la implementación coincida con las constituciones aprobadas.

---

## Notas

Este documento fue generado como parte de la tarea `11-revision-sistema-agentic`.
Los cambios de código deben realizarse en una tarea separada después de aprobar las constituciones.
