---
id: constitution.vscode_extensions
owner: architect-agent
version: 1.0.0
severity: PERMANENT
scope: project
---

# CONSTITUTION: VS Code Extensions

## Objetivo
Definir reglas obligatorias para el desarrollo de extensiones de Visual Studio Code en este repositorio.

## Sources of Truth (OBLIGATORIAS)
1. Extension Guides (overview): https://code.visualstudio.com/api/extension-guides/overview
2. Extension Capabilities (overview): https://code.visualstudio.com/api/extension-capabilities/overview
3. Extension Anatomy: https://code.visualstudio.com/api/get-started/extension-anatomy
4. VS Code Extension API oficial: https://code.visualstudio.com/api
5. VS Code Brand Guidelines (iconos y nombres): https://code.visualstudio.com/brand

## Reglas (PERMANENT)
1. **Documentacion oficial primero**: Toda decision tecnica debe estar alineada con la documentacion oficial de VS Code.
2. **Manifest y Contribution Points**: Las funcionalidades declarativas deben definirse en `package.json` mediante Contribution Points.
3. **API oficial**: La logica de extension debe usar la Extension API oficial (modulo `vscode`) y sus patrones aprobados.
4. **No acceso al DOM de VS Code**: Evitar cualquier intento de manipular el DOM o aplicar CSS a la UI de VS Code.
5. **Activation Events explicitos**: Definir `activationEvents` segun el comportamiento requerido y documentar su justificacion.
6. **Respeto a UX Guidelines**: Los aportes a UI deben seguir las guias de UX oficiales (menus, comandos, vistas, etc.).
7. **Uso de marca**: No usar el icono de VS Code para identificar o promover la extension propia. Para identidad de rol o proyectos internos, usar iconografia neutral.
8. **Estructura canonica**: Mantener `src/extension` como fuente y `dist/extension` como salida de build para la extension.

## Alcance
Aplica a cualquier cambio en `src/extension/**`, `dist/extension/**` y a campos de `package.json` relacionados con la extension.
