# Analysis Report — T11: Refinamiento de Constituciones

## 1. Contexto
La arquitectura actual modular (`src/extension/modules/*`) requiere reglas estrictas.

## 2. Propuesta de Reglas Constitucionales

### 2.1 Backend Layer (`constitution.backend`)
1.  **Inheritance**: Extender `AbstractServer` (de `core/backend`).
2.  **Isolation**: Sin dependencias de `vscode` ni `dom`.
3.  **Transport Agnostic**.

### 2.2 Background Layer (`constitution.background`)
1.  **Module Registration**: `App.register`.
2.  **Messaging Bridge**: `Messaging` (de `core/messaging`) obligatorio.
3.  **Gateway**: Único punto de acceso a `vscode`.

### 2.3 View Layer (`constitution.view`)
1.  **Lit Framework**: LitElements obligatorios.
2.  **Structure**: `index.ts`, `html.ts`, `styles.ts`.
3.  **No Logic in View**.

## 3. Impacto en Roadmap
Reset masivo de tareas D1-D6.
