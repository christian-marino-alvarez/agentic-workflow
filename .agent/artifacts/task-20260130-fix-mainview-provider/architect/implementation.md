🏛️ **architect-agent**: Implementación para registrar correctamente la vista `mainView` como webview.

# Implementación — task-20260130-fix-mainview-provider

## Cambios realizados
- Declarada la vista `mainView` como `type: "webview"` en `package.json` para que VS Code use `WebviewViewProvider`.
- Corregido el reemplazo del nonce para que CSP y script usen el mismo valor.

## Ficheros modificados
- package.json
- src/extension/views/main-view.ts

## Decisiones técnicas
- Mantener un único `viewId` (`mainView`) y un único `activationEvents` (`onView:mainView`).
- Usar la configuración estándar de VS Code para webviews en activity bar.

## Verificación ejecutada
- `npm run compile`
- Validación manual en VS Code (F5): ✅ OK, muestra "Hello world".

## Estado
APROBADO

```yaml
approval:
  developer:
    decision: SI
    date: 2026-01-30T00:00:00Z
    comments: null
```
