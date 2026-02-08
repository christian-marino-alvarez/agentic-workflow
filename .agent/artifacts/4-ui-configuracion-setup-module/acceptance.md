# Acceptance Criteria — 4-ui-configuracion-setup-module

🏛️ **architect-agent**: Criterios de aceptación para la UI de configuración.

## 1. Requisitos Funcionales
- [ ] **Gestión de Modelos**: 
  - Listar modelos configurados actualmente.
  - Formulario para añadir un nuevo modelo (OpenAI, Gemini o Custom).
  - Botón para editar un modelo existente.
  - Botón para eliminar un modelo.
  - **Selector de modelo activo**: Permitir marcar un modelo como "Activo" directamente desde la lista (Respuesta 5).
- [ ] **Configuración de Artifacts**:
  - Input para definir la ruta base de los artifacts.
  - **Selector de Directorio**: Incluir un botón de "Browse..." que abra el selector oficial de VS Code (Respuesta 3).
- [ ] **Persistencia**:
  - Botón explícito de **"Guardar cambios"** para aplicar la configuración (Respuesta 1).
  - La UI debe reflejar el estado actual del `globalState` al abrirse.
- [ ] **Validación**:
  - Permitir validar la API Key (conectividad) con un botón dedicado (Respuesta 2).

## 2. Requisitos Técnicos
- [ ] **Tecnología**: Implementado con **Lit** (componentes web).
- [ ] **Validación**: Uso de los esquemas Zod definidos en `T002` para validar la entrada de datos en el frontend antes de enviarlos al backend.
- [ ] **Comunicación**: Uso estricto del sistema de mensajes `postMessage` entre el Webview y el `Controller`.
- [ ] **Estética**: Diseño moderno acorde a VS Code, usando variables de tema de VS Code.

## 3. Decisiones tomadas (Confirmadas)
1. **Flujo de guardado**: Botón explícito de "Guardar".
2. **Conectividad**: Se requiere botón de "Test Connection".
3. **Paths**: Integración con el selector oficial de VS Code via `window.showOpenDialog`.
4. **Proveedores**: Inicialmente limitado a OpenAI y Gemini.
5. **Estado**: Selección de modelo activo integrada en la lista.

## Aprobación
- [x] Aprobado por el Desarrollador (SI) - 2026-02-06
