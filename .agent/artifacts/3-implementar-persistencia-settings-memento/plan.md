# Implementation Plan — 3-implementar-persistencia-settings-memento

🏛️ **architect-agent**: Plan de implementación para la persistencia de settings.

## Proposed Changes

### Setup Module
#### [NEW] [settings-storage.ts](file:///Users/milos/Documents/workspace/agentic-workflow/src/extension/modules/setup/settings-storage.ts)
Clase principal para la gestión de globalState.

#### [MODIFY] [index.ts](file:///Users/milos/Documents/workspace/agentic-workflow/src/extension/modules/setup/index.ts)
Exportar la nueva clase y posiblemente inicializarla en el `SetupModule`.

## Pasos de Implementación

- **Paso 0**: Crear y formalizar `constitution/architecture.md` con la decisión de Facade/Provider. (**Completado**).
- **Paso 1**: Implementar `SettingsStorage` como una **Facade** estricta siguiendo la nueva constitución.
- **Paso 2**: Asegurar desacoplamiento total en el resto del sistema.
- **Paso 3**: Validación y Pruebas con Vitest.

## Verification Plan

### Automated Tests
- `npm run test` (Vitest)
- Nueva suite: `test/settings-storage.test.ts`
  - Caso 1: Guardar y recuperar modelos válidos.
  - Caso 2: Manejar datos corruptos en Memento (debe filtrar o fallar graciosamente).
  - Caso 3: Persistencia de artifacts path.
