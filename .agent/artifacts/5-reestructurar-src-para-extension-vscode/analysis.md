---
artifact: analysis
phase: phase-2-analysis
owner: architect-agent
status: approved
related_task: 5-reestructurar-src-para-extension-vscode
---

# Analysis — 5-reestructurar-src-para-extension-vscode

🏛️ **architect-agent**: Análisis de la reestructuración y scaffolding para extensión VSCode.

## 1. Resumen ejecutivo
**Problema**
El proyecto actual tiene una estructura de paquete npm estándar en `src/`. Se requiere transformar el repositorio en una extensión de VSCode sin perder la funcionalidad del sistema agéntico existente.

**Objetivo**
Mover todo el código actual de `src/` a `.agent/` y establecer la raíz de `src/` como el hogar de la nueva extensión de VSCode, generando su scaffolding mediante Yeoman (`yo code`) pero adaptado manualmente para respetar la estructura híbrida.

**Criterio de éxito**
- Estructura de carpetas: `.agent/` contiene el legacy, `src/extension.ts` es el entry point.
- Scripts de build/init antiguos siguen funcionando (adaptados).
- La extensión "Hello World" funciona en modo debug.
- `package.json` unifica las dependencias del sistema agéntico y de la extensión.

---

## 2. Estado del proyecto (As-Is)
- **Estructura relevante**
  - `src/` contiene: `cli`, `core`, `rules`, `templates`, `workflows`, `artifacts`, `index.md`.
  - `scripts/` contiene scripts de build (`clean-dist.mjs`, `build-bootstrap-test.mjs`) con rutas hardcodeadas a `src/`.
- **Componentes existentes**
  - CLI y core del sistema agéntico.
- **Nucleo / capas base**
  - Node.js / TypeScript.
- **Limitaciones detectadas**
  - `package.json` actual no tiene campos de extensión (`engines`, `activationEvents`).
  - Scripts como `copy-assets` asumen estructura plana en `src/`.

---

## 3. Cobertura de Acceptance Criteria

### AC-1: Estructura de Carpetas
- **Interpretación**: Mover `src/*` (salvo node_modules si hubiera) a `.agent/`.
- **Verificación**: `ls -R src` muestra la nueva subcarpeta y `extension.ts` en raíz.
- **Riesgos**: Imports relativos dentro del sistema agéntico deberían mantenerse igual (relativos entre sí), pero imports absolutos o desde scripts externos fallarán.

### AC-2: Scripts de Init
- **Interpretación**: Los scripts `build`, `copy-assets`, etc. deben apuntar a la nueva ruta.
- **Verificación**: Ejecutar `npm run build` y verificar `dist/`.
- **Riesgos**: Olvidar actualizar algún path en `scripts/*.mjs`.

### AC-3: Scaffolding Yeoman
- **Interpretación**: Usar `yo code` (generator-code) para obtener la base. Como ya existe proyecto, se generará en carpeta temporal y se fusionará lo necesario (`package.json`, `launch.json`, `extension.ts`, `test/`).
- **Verificación**: El código generado cumple el estándar de Microsoft.
- **Riesgos**: Sobreescribir configuración existente de `package.json` o `tsconfig.json`. Se debe hacer merge cuidadoso.

### AC-4: Hello World funcionando
- **Interpretación**: Comando ejecutable desde palette.
- **Verificación**: F5 -> Extension Host -> "Hello World".

---

## 4. Research técnico
- **Alternativa A: Generar extensión en nueva carpeta raíz**
  - *Descripción*: Mover todo el proyecto actual a una subcarpeta `legacy-agent` e iniciar extensión limpia en raíz.
  - *Inconvenientes*: Rompe historial git y estructura de workspace del usuario radicalmente.
- **Alternativa B (Elegida): Estructura híbrida en `src`**
  - *Descripción*: Mover contenido de `src` a `src/subfolder`. Inyectar ficheros de extensión en `src`. Ajustar scripts.
  - *Justificación*: Mantiene el repositorio como un monorepo lógico donde conviven la extensión (UI/Logic VSCode) y el sistema agéntico (Core Logic).

**Decisión recomendada**: Alternativa B, usando `yo code` en carpeta temporal para extraer assets y fusionarlos manualmente.

---

## 5. Agentes participantes
- **dev-agent**
  - **Responsabilidades**:
    1. Crear carpeta `src/agentic-system-structure` y mover contenido.
    2. Ejecutar scaffolding de Yeoman (en temp) y migrar ficheros.
    3. Realizar merge de `package.json` y `tsconfig.json`.
    4. Refactorizar scripts en `scripts/` y `package.json` para nuevas rutas.
  - **Subáreas**: Refactoring, Scaffolding.

**Handoffs**: Architect revisa Plan -> Dev ejecuta -> Architect/Dev verifica.

**Componentes necesarios**:
- Nuevos: `src/extension.ts`, `.vscode/*.json`, `src/test/*`.
- Modificados: `package.json`, `scripts/*.mjs`.

---

## 6. Impacto de la tarea
- **Arquitectura**: Cambio de estructura de directorios fuente. `src` deja de ser homogéneo.
- **Scripts**: Requieren actualización de paths.
- **Testing**: Se añade infraestructura de test de VSCode (`@vscode/test-electron`) que coexistirá con la actual (si la hay) o la complementará.

---

## 7. Riesgos y mitigaciones
- **Riesgo 1**: `tsconfig.json` conflictivo (VSCode suele poner `outDir: out`, el proyecto usa `dist`).
  - *Mitigación*: Unificar a `dist` o configurar `tsconfig` separados si fuera necesario (p.ej. `tsconfig.extension.json`). Recomendación inicial: Unificar en un solo `tsconfig` si es posible, o usar "references".
- **Riesgo 2**: Yeoman sobreescribe ficheros vitales.
  - *Mitigación*: Generar en `/tmp` y copiar selectivamente.

---

## 8. TODO Backlog (Consulta obligatoria)
**Referencia**: `.agent/todo/`
**Estado actual**: N/A (Se asume vacío o irrelevante para esta tarea estructural).
**Items relevantes**: Ninguno.

---

## 10. Aprobación
Este análisis **requiere aprobación explícita del desarrollador**.

```yaml
approval:
  developer:
    decision: SI
    date: 2026-01-27T23:18:00+01:00
    comments: Aprobado por el usuario.
```
