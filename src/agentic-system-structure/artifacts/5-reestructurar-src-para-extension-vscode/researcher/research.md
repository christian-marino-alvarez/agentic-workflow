---
artifact: research
phase: phase-1-research
owner: researcher-agent
status: approved
related_task: 5-reestructurar-src-para-extension-vscode
---

# Research Report — 5-reestructurar-src-para-extension-vscode

🔬 **researcher-agent**: Informe técnico sobre la estructura y requisitos para la migración a extensión de VSCode.

> [!CAUTION]
> **REGLA PERMANENT**: Este documento es SOLO documentación.
> El researcher-agent documenta hallazgos SIN analizar, SIN recomendar, SIN proponer soluciones.
> El análisis corresponde a Phase 2.

## 1. Resumen ejecutivo
- **Problema investigado**: Requisitos técnicos para trasformar un proyecto existente en una extensión de VSCode, moviendo el código actual a una subcarpeta y estableciendo un nuevo entry point.
- **Objetivo de la investigacion**: Documentar la estructura de carpetas estándar de VSCode, configuración de `package.json`, y mecanismos de testing para asegurar una migración sin roturas.
- **Principales hallazgos**: La estructura propuesta es viable. VSCode requiere campos específicos en `package.json`. El testing se realiza habitualmente con `@vscode/test-electron` o `@vscode/test-cli`.

---

## 2. Necesidades detectadas
- **Requisitos tecnicos identificados**:
  - Mover `src/*` actual a `.agent/`.
  - Crear `src/extension.ts`.
  - Configurar `package.json` para extensión.
  - Asegurar compatibilidad de scripts de init.
- **Suposiciones y limites**:
  - Se asume que el código legado no depende de rutas absolutas hardcodeadas que apunten a la raíz de `src`.
  - Se asume uso de TypeScript.

---

## 3. Hallazgos técnicos

### 3.1 Estructura Estándar de Extensiones VSCode
- **Concepto**: Las extensiones de VSCode suelen tener un `src` plano o estructurado, pero el `main` en `package.json` debe apuntar al archivo compilado (habitualmente en `out/` o `dist/`).
- **Estado**: Estándar establecido.
- **Documentación oficial**: https://code.visualstudio.com/api/get-started/your-first-extension
- **Limitaciones**: `package.json` debe estar en la raíz del workspace para que VSCode detecte la extensión en modo desarrollo.

### 3.2 Campos Obligatorios en `package.json`
- **Concepto**:
  - `engines.vscode`: Define la versión mínima compatible.
  - `activationEvents`: Eventos que despiertan la extensión (ej: `onCommand`).
  - `contributes`: Define comandos, menús, configuraciones.
  - `main`: Punto de entrada del JS compilado (ej: `./out/extension.js`).
- **Estado**: Obligatorio.

### 3.3 Testing de Extensiones
- **Concepto**: Se utiliza `@vscode/test-electron` para tests de integración que requieren una instancia real de VSCode. Para unit tests puros, se pueden usar frameworks estándar (Mocha, Jest) si no dependen de la API `vscode`.
- **Documentación oficial**: https://code.visualstudio.com/api/working-with-extensions/testing-extension

---

## 4. APIs relevantes
- **vscode.window.showInformationMessage**: API básica para notificaciones (Hello World).
- **vscode.commands.registerCommand**: API para registrar comandos en la Command Palette.
- **Estado de soporte**: VSCode API es estable. Funciona en Windows, macOS, Linux y Web (con limitaciones).

---

## 5. Compatibilidad multi-browser
*No aplica directamente ya que es una extensión de escritorio, pero relevante para VSCode Web.*

- **VSCode Desktop**: Soporte total (Node.js environment).
- **VSCode Web**: Requiere compilar como Web Extension (browser environment, sin acceso a FS directo).
- **Estrategia**: La migración actual se enfoca en Desktop (Node.js), manteniendo compatibilidad futura si se evita dependencia excesiva de módulos nativos de Node en la lógica de negocio.

---

## 6. Oportunidades AI-first detectadas
- **Language Models API**: VSCode ahora expone APIs para invocar modelos de lenguaje (Copilot) desde extensiones.
- **Referencias**: https://code.visualstudio.com/api/extension-guides/language-model

---

## 7. Riesgos identificados
- **Riesgo**: Rutas relativas rotas en imports del código legado al moverlo a `agentic-system-structure`.
  - **Severidad**: Media.
  - **Fuente**: Experiencia en refactorización TypeScript.
- **Riesgo**: Conflictos en `tsconfig.json` entre la configuración necesaria para la extensión (ej: `module: commonjs` vs `esnext`) y el código existente.
  - **Severidad**: Alta.
  - **Fuente**: TypeScript Config docs.

---

## 8. Fuentes
- [VSCode Extension API](https://code.visualstudio.com/api)
- [Extension Manifest (package.json)](https://code.visualstudio.com/api/references/extension-manifest)
- [Testing Extensions](https://code.visualstudio.com/api/working-with-extensions/testing-extension)

---

## 9. Aprobacion del desarrollador (OBLIGATORIA)
```yaml
approval:
  developer:
    decision: SI
    date: 2026-01-27T23:14:15+01:00
    comments: Aprobado.
```
