# Análisis Técnico — 4-ui-configuracion-setup-module

🏛️ **architect-agent**: Análisis de la implementación de la UI de configuración.

## 1. Arquitectura de Mensajería (Bridge)
Para cumplir con la **Constitución de Arquitectura**, la comunicación será puramente contractual vía `postMessage`.

### Frontend -> Backend
- `get-config`: Solicita el estado actual al abrir el webview.
- `save-config`: Envía la lista completa de modelos y el activeId.
- `test-connection`: Solicita validar una API key específica.
- `browse-path`: Solicita abrir el selector de directorios de VS Code.
- `set-active-model`: Cambia rápidamente el modelo seleccionado.

### Backend -> Frontend
- `config-loaded`: Envía los datos obtenidos de `SettingsStorage`.
- `connection-result`: Informa si el test de conexión fue exitoso.
- `path-selected`: Envía la ruta elegida por el usuario.

## 2. Componentes Lit (D2: UI/ChatKit)
Diseñaremos una jerarquía de componentes clara:
- `<agw-setup-view>`: Contenedor principal conectado al bridge.
- `<agw-model-list>`: Renderiza los modelos configurados con botones de acción.
- `<agw-model-editor-modal>`: Formulario emergente para añadir/editar.
- `<agw-path-picker>`: Input + Botón Browse.

## 3. Integración con VS Code APIs
- **Selector de Carpetas**: Usaremos `window.showOpenDialog({ canSelectFolders: true })` en el Controller.
- **Validación**: Para el "Test Connection", invocaremos temporalmente a los providers (OpenAI/Gemini) para hacer un `listModels` o similar antes de persistir.

## 4. Riesgos y Mitigaciones
- **Desincronización**: Mitigado usando un flujo unidireccional de datos (el State reside en el Backend, el UI es un reflejo).
- **Seguridad**: Las API Keys NUNCA se enviarán de vuelta al UI una vez guardadas (solo se enviará un placeholder `********` y el `secretKeyId`).

## 5. Estimación
- Análisis y Diseño: 1 hora.
- Implementación Frontend (Lit): 2-3 horas.
- Implementación Backend (Controller): 1 hora.
- Pruebas E2E: 1 hora.
