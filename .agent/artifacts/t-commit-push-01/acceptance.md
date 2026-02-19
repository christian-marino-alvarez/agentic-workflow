# Criterios de Aceptación (t-commit-push-01)

## 1. Alcance
- [ ] Incluir cambios en `ROADMAP-BACKLOG.md`.
- [ ] Incluir cambios en `src/extension/modules/chat/view/templates/html.ts` (Eliminación de "Workflow:").
- [ ] Incluir cambios en artefactos de la carpeta `.agent/` (si los hubiera).

## 2. Exclusiones
- [ ] Respetar `.gitignore`.
- [ ] No subir archivos de debug o temporales.

## 3. Estrategia de Versionado
- **Rama**: Actual.
- **Mensaje**: `feat: update roadmap backlog and remove workflow prefix from chat ui`.

## 4. Verificación
- [ ] `npm run compile` debe pasar sin errores.

## 5. Definición de Hecho (DoD)
- Cambios commiteados localmente.
- Cambios subidos al remoto (push).
- Sin errores de compilación.
