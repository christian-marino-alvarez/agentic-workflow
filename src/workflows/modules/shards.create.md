---
description: Workflow para crear Shards siguiendo la constitución de Extensio.
---

---
id: workflow.shards.create
owner: module-agent
version: 2.0.0
severity: PERMANENT
trigger:
  commands: ["shard-create", "shards:create"]
blocking: true
---

# WORKFLOW: shards.create

## Input (REQUIRED)
- El módulo donde se creará el Shard ya existe y cumple `constitution.modules`.
- El plan o la tarea requiere crear un nuevo Shard.

## Output (REQUIRED)
- Shard creado con estructura completa
- Índice de Shards actualizado con registro
- Shard compilable por el CLI

## Objetivo (ONLY)
Asegurar que la creación de un Shard cumple:
- `constitution.shards` (estructura, ciclo de vida, responsabilidades)
- Integración correcta con el módulo

---

## Pasos obligatorios

0. Activar `module-agent` y usar prefijo obligatorio en cada mensaje.

### 1. Verificar inputs
- Existe el módulo destino.
- El módulo tiene estructura válida.
- Si falla → **FAIL**.

### 2. Crear estructura de carpetas
```
src/surface/shards/<shard-name>/
├── index.mts     # Implementación del Shard
└── styles.css    # Estilos (opcional)
```

### 3. Crear implementación del Shard

El Shard **DEBE**:
- Extender la clase `Shard` (que hereda de `Surface`)
- Implementar todos los métodos abstractos
- No contener lógica de negocio

Ejemplo mínimo:
```ts
import { Shard } from '@extensio/core/shard';
import type { ShardContext } from '@extensio/core/shard';

export class MyWidgetShard extends Shard {
  constructor(context: ShardContext) {
    super('my-widget', context);
  }

  getTagName(): string {
    return 'my-module-widget';
  }

  protected async _mount(container: HTMLElement): Promise<void> {
    container.innerHTML = '<div class="my-widget">Content</div>';
  }

  update(props: Record<string, any>): void {
    // Actualizar UI con nuevas props
  }

  protected _unmount(): void {
    // Cleanup
  }
}
```

### 4. Registrar en índice de Shards

Actualizar `src/surface/shards/index.mts`:
```ts
import { Shard } from '@extensio/core/shard';
import { MyWidgetShard } from './my-widget/index.mts';

// Registrar como WebComponent (OBLIGATORIO)
Shard.register('my-module-widget', MyWidgetShard);

// Exportar para uso programático
export { MyWidgetShard };
```

### 5. Verificar naming del tag
- El tag **DEBE** ser kebab-case
- El tag **DEBE** incluir prefijo del módulo
- El tag **DEBE** ser único en el proyecto
- Ejemplo: `my-module-widget`, no `widget`

### 6. Verificar responsabilidades (§8-9)
El Shard **DEBE** contener solo:
- ✅ Reactividad (recibir y reaccionar a props)
- ✅ Acciones (responder a eventos de usuario)
- ✅ Renderizado (mostrar estado visual)

El Shard **NO DEBE** contener:
- ❌ Lógica de negocio
- ❌ Estado persistente
- ❌ Decisiones de dominio
- ❌ Acceso directo a drivers

### 7. Importar índice para detección por CLI

Si se usará con `loadShard()` desde Engine:
```ts
// En el Engine
import { MyWidgetShard } from './surface/shards/index.mts';

// El CLI detectará el import y compilará el Shard independientemente
```

### 8. Validar compilación
- Ejecutar build para verificar que el CLI procesa el Shard.
- Verificar que se genera el archivo `.mjs` en `dist/surface/shards/`.

### 9. Solicitar aprobación del desarrollador (OBLIGATORIA, por consola)
- El desarrollador **DEBE** aprobar el Shard creado:
  - **SI** → aprobado
  - **NO** → rechazado
- Registrar la decision en el informe de creacion:
  - `.agent/artifacts/<taskId>-<taskTitle>/module/create.md`
  ```yaml
  approval:
    developer:
      decision: SI | NO
      date: <ISO-8601>
      comments: <opcional>
  ```
- Si `decision != SI` → ir a **Paso 11 (FAIL)**.

### 10. PASS
- El Shard cumple `constitution.shards`.
- El Shard está registrado e integrado.
 - Actualizar `.agent/artifacts/<taskId>-<taskTitle>/task.md`:
   - Agregar una entrada en `task.lifecycle.subflows.shards.create[]`:
     - `name: <shard-name>`
     - `completed: true`
     - `validated_by: "architect-agent"`
     - `validated_at: <ISO-8601>`
   - `task.phase.updated_at = <ISO-8601>`

---

## FAIL (OBLIGATORIO)

11. Declarar creación como **NO completada**
    - Indicar qué falló:
      - Estructura incorrecta (§3)
      - Métodos abstractos no implementados (§4)
      - Contiene lógica de negocio (violación §8-9)
      - No registrado en índice
      - Tag no cumple naming
      - No compila
    - Corregir antes de continuar.

---

## Gate (REQUIRED)

Requisitos (todos obligatorios):
1. Estructura: `<shard-name>/index.mts`
2. Extiende `Shard` (que hereda de `Surface` → `Core`)
3. Implementa: `getTagName()`, `_mount()`, `_unmount()`, `update()`
4. Registrado en `src/surface/shards/index.mts` con `Shard.register()`
5. Tag es kebab-case con prefijo de módulo
6. Sin lógica de negocio (conforme a §8-9)
7. Compila correctamente
8. Existe aprobación explícita del desarrollador (por consola) registrada en `module/create.md`:
   - `approval.developer.decision == SI`
9. `task.md` refleja subflow y timestamp:
   - Existe una entrada en `task.lifecycle.subflows.shards.create[]` con:
     - `name: <shard-name>`
     - `completed == true`
     - `validated_at` no nulo
   - `task.phase.updated_at` no nulo

Si Gate FAIL:
- Ejecutar **Paso 11 (FAIL)**.

---

## Nota: Hooks Automáticos

Los Shards heredan de Surface, por lo que tienen acceso a los hooks automáticos:

- **onMount()**: Se ejecuta automáticamente DESPUÉS de `render()`. Sobrescribir para lógica post-render.
- **onUnmount()**: Se ejecuta automáticamente ANTES de destruir. Sobrescribir para cleanup.

```ts
class MyShard extends Shard {
  protected override onMount(): void {
    console.log('Shard visible y montado');
  }

  protected override onUnmount(): void {
    // Cleanup
  }
}
```

Estos hooks son opcionales pero recomendados para gestionar el ciclo de vida del componente.
