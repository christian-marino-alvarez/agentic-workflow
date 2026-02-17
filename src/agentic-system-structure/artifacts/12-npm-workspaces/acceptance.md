🏛️ **architect-agent**: Acceptance criteria para la tarea T012 — npm-workspaces.

# Acceptance Criteria — 12-npm-workspaces

## 1. Definición Consolidada
Migrar el proyecto actual a npm workspaces convirtiendo los módulos `app`, `core` y `cli` en packages npm privados e independientes. Cada package tendrá su propio `package.json` con sus dependencias específicas. El proyecto root coordinará los workspaces y ofrecerá un build unificado. La estructura de extensión VSCode debe mantenerse funcional.

## 2. Respuestas a Preguntas de Clarificación

| # | Pregunta (formulada por architect) | Respuesta (del desarrollador) |
|---|-----------------------------------|-------------------------------|
| 1 | ¿Qué elementos deben convertirse en packages npm independientes? | `src/extension/modules/*` (app, core) + `src/cli` |
| 2 | ¿Qué convención de nombres usar para los packages? | `@agentic-workflow/app`, `@agentic-workflow/core`, `@agentic-workflow/cli` |
| 3 | ¿Packages públicos o privados? | Private (solo para uso interno del workspace) |
| 4 | ¿Cómo gestionar dependencias compartidas? | Cada package define sus propias dependencias |
| 5 | ¿Cómo deben funcionar los scripts de build? | Build unificado desde root |

---

## 3. Criterios de Aceptación Verificables

1. **Alcance**:
   - `src/extension/modules/app` → package `@agentic-workflow/app`
   - `src/extension/modules/core` → package `@agentic-workflow/core`
   - `src/cli` → package `@agentic-workflow/cli`
   - Root `package.json` configura `workspaces`

2. **Entradas / Datos**:
   - Código fuente actual en `src/extension/modules/app`, `src/extension/modules/core`, `src/cli`
   - `package.json` root actual con todas las dependencias centralizadas
   - `tsconfig.json` actual

3. **Salidas / Resultado esperado**:
   - Cada package tiene su propio `package.json` con `"private": true`
   - Root `package.json` incluye campo `"workspaces"` apuntando a los packages
   - Dependencias distribuidas correctamente en cada package
   - Build unificado funcional desde root (`npm run compile` / `npm run build`)
   - La extensión VSCode sigue compilando y ejecutándose correctamente

4. **Restricciones**:
   - Packages privados (no publicables)
   - Cada package gestiona sus propias dependencias (sin hoisting forzado)
   - La estructura de carpetas existente se mantiene (no mover archivos de sitio)
   - Compatibilidad con el build de extensión VSCode

5. **Criterio de aceptación (Done)**:
   > **Gate principal**: La tarea se da por terminada si los tests e2e siguen funcionando exactamente igual que antes de la migración.
   - [ ] **Tests e2e pasan idénticamente** (`npm run test:e2e`) — criterio bloqueante
   - [ ] `npm install` desde root instala todas las dependencias de todos los workspaces
   - [ ] `npm run compile` desde root compila exitosamente todos los workspaces
   - [ ] Cada package tiene `package.json` válido con `"private": true`
   - [ ] Root `package.json` contiene campo `"workspaces"` correctamente configurado
   - [ ] Las dependencias inter-package se resuelven vía workspace (ej: `"@agentic-workflow/core": "workspace:*"`)
   - [ ] La extensión VSCode se ejecuta correctamente tras la migración

---

## Aprobación (Gate 0)

```yaml
approval:
  developer:
    decision: SI
    date: "2026-02-16T07:32:24+01:00"
    comments: "Tests e2e como gate principal bloqueante"
```

---

## Historial de validaciones (Phase 0)
```yaml
history:
  - phase: "phase-0-acceptance-criteria"
    action: "created"
    validated_by: "architect-agent"
    timestamp: "2026-02-16T07:29:25+01:00"
    notes: "Acceptance criteria definidos con 5 preguntas respondidas"
```
