---
description: Workflow para crear Pages siguiendo la constitución de Extensio.
---

---
id: workflow.pages.create
owner: module-agent
version: 2.0.0
severity: PERMANENT
trigger:
  commands: ["page-create", "pages:create"]
blocking: true
---

# WORKFLOW: pages.create

## Input (REQUIRED)
- El módulo donde se creará la Page ya existe y cumple `constitution.modules`.
- El plan o la tarea requiere crear una nueva Page.

## Output (REQUIRED)
- Page creada con estructura completa
- Índice de Pages actualizado
- Page accesible mediante `Engine.navigate()`

## Objetivo (ONLY)
Asegurar que la creación de una Page cumple:
- `constitution.pages` (estructura, ciclo de vida, responsabilidades)
- Integración correcta con el módulo y el Engine

---

## Pasos obligatorios

0. Activar `module-agent` y usar prefijo obligatorio en cada mensaje.

### 1. Verificar inputs
- Existe el módulo destino.
- El módulo tiene estructura válida.
- Si falla → **FAIL**.

### 2. Crear estructura de carpetas
```
src/surface/pages/<page-name>/
├── index.html    # Documento HTML
├── index.mts     # Script principal
└── styles.css    # Estilos (opcional)
```

### 3. Crear documento HTML (`index.html`)
El HTML **DEBE**:
- Ser un documento HTML5 válido
- Incluir `<script type="module" src="./index.mts">`
- No contener lógica inline

Ejemplo mínimo:
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Page Name</title>
  <link rel="stylesheet" href="./styles.css">
</head>
<body>
  <div id="app"></div>
  <script type="module" src="./index.mts"></script>
</body>
</html>
```

### 4. Crear script principal (`index.mts`)
El script **DEBE**:
- Extender la clase `Page`
- Implementar el ciclo de vida: `run()` → `listen()` → `start()`
- Respetar las responsabilidades (§11-12):
  - Solo lógica de presentación
  - Solo lógica de interacción
  - Solo orquestación de Shards

Ejemplo mínimo:
```ts
import { Page } from '@extensio/core/surface/pages';

class MyPage extends Page {
  constructor() {
    super('my-page');
  }

  override listen() {
    super.listen();
    // Registrar listeners de eventos/drivers
  }

  override start() {
    // Lógica de presentación
    this.render();
  }

  private render() {
    const app = document.getElementById('app');
    if (app) {
      app.innerHTML = '<h1>My Page</h1>';
    }
  }
}

const page = new MyPage();
page.run();
```

### 5. Registrar en índice de Pages
Actualizar `src/surface/pages/index.mts`:
```ts
import myPage from "./my-page/index.html";

export const Pages = {
  // ... otras pages
  myPage,
};
```

### 6. Importar índice en Engine
Verificar que el Engine importa el índice de Pages para que el CLI las detecte:
```ts
// En el Engine
import { Pages } from './surface/pages/index.mts';
```

### 7. Verificar responsabilidades (§11-12)
La Page **DEBE** contener solo:
- ✅ Lógica de presentación
- ✅ Lógica de interacción
- ✅ Orquestación de Shards

La Page **NO DEBE** contener:
- ❌ Estado de negocio persistente
- ❌ Lógica que afecte otras partes de la extensión
- ❌ Duplicación de lógica del Engine

### 8. Validar accesibilidad
- Verificar que la Page es accesible mediante `navigate()`:
```ts
await this.navigate(Pages.myPage);
```
- Ejecutar build para verificar que el CLI procesa la Page correctamente.

### 9. Solicitar aprobación del desarrollador (OBLIGATORIA, por consola)
- El desarrollador **DEBE** aprobar la Page creada:
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
- La Page cumple `constitution.pages`.
- La Page está registrada e integrada.
 - Actualizar `.agent/artifacts/<taskId>-<taskTitle>/task.md`:
   - Agregar una entrada en `task.lifecycle.subflows.pages.create[]`:
     - `name: <page-name>`
     - `completed: true`
     - `validated_by: "architect-agent"`
     - `validated_at: <ISO-8601>`
   - `task.phase.updated_at = <ISO-8601>`

---

## FAIL (OBLIGATORIO)

11. Declarar creación como **NO completada**
    - Indicar qué falló:
      - Estructura incorrecta (§3)
      - Ciclo de vida incompleto (§4)
      - Responsabilidades incorrectas (§11-12)
      - No registrada en índice
      - No accesible via `navigate()`
    - Corregir antes de continuar.

---

## Gate (REQUIRED)

Requisitos (todos obligatorios):
1. Estructura: `<page-name>/index.html` + `<page-name>/index.mts`
2. HTML válido con `<script type="module">`
3. Script extiende `Page` y usa `run()` → `listen()` → `start()`
4. Responsabilidades conforme a §11-12
5. Registrada en `src/surface/pages/index.mts`
6. Índice importado en Engine
7. Accesible mediante `navigate()`
8. Existe aprobación explícita del desarrollador (por consola) registrada en `module/create.md`:
   - `approval.developer.decision == SI`
9. `task.md` refleja subflow y timestamp:
   - Existe una entrada en `task.lifecycle.subflows.pages.create[]` con:
     - `name: <page-name>`
     - `completed == true`
     - `validated_at` no nulo
   - `task.phase.updated_at` no nulo

 Si Gate FAIL:
- Ejecutar **Paso 11 (FAIL)**.

---

## Nota: Hooks Automáticos

Las Pages heredan de Surface, por lo que tienen acceso a los hooks automáticos:

- **onMount()**: Se ejecuta automáticamente DESPUÉS de `render()`. Sobrescribir para lógica post-render.
- **onUnmount()**: Se ejecuta automáticamente ANTES de destruir (cuando el tab se cierra). Sobrescribir para cleanup.

```ts
class MyPage extends Page {
  protected override onMount(): void {
    console.log('Page visible y montada');
    // Inicializar animaciones, enfocar elementos, etc.
  }

  protected override onUnmount(): void {
    // Cancelar timers, remover listeners globales, etc.
  }
}
```

Estos hooks son opcionales pero recomendados para gestionar el ciclo de vida del componente.
