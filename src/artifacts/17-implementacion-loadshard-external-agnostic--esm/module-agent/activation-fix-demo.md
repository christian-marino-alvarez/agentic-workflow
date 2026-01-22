---
artifact: agent-activation
phase: phase-5-verification
subtask_id: fix-demo
activated_agent: module-agent
activated_by: architect-agent
activation_date: 2026-01-17T17:31:00Z
---

# Agent Activation — Fix Demo Integrity

## Agente Activado
⚙️ **module-agent**

## Contexto
La demo creada en `packages/core/demo/` tiene problemas de integridad y no compila. El qa-agent la creó manualmente sin seguir la estructura estándar de Extensio.

## Problema Detectado
```
✖ Error compiling the current module:
ENOENT: no such file or directory, open '.../demo/tsconfig.json'
```

Archivos creados manualmente (posiblemente incorrectos):
- `manifest.json`
- `service.worker.mjs`
- `popup.html`
- `popup.mjs`
- `demo-shard.mjs`
- `package.json` (añadido después)
- `tsconfig.json` (añadido después)

## Responsabilidades Asignadas

### 1. Revisar Estructura Actual
- Analizar los archivos existentes en `demo/`
- Identificar qué falta o está mal configurado
- Comparar con la estructura estándar de demos de Extensio

### 2. Corregir la Demo
Opciones:
- **Opción A**: Corregir los archivos existentes para que cumplan con la arquitectura
- **Opción B**: Eliminar la demo actual y recrearla correctamente (si es más simple)

### 3. Validar Compilación
- Ejecutar `ext build --targetPath ./demo --browsers chrome`
- Confirmar que compila sin errores
- Verificar que genera `dist/chrome/` correctamente

## Constituciones Aplicables
- `constitution.modules` (la demo debe seguir la estructura de módulos)
- `constitution.extensio_architecture` (estructura estándar)

## Criterios de Validación
- [ ] La demo compila sin errores
- [ ] Genera `dist/chrome/manifest.json`
- [ ] El service worker se compila correctamente
- [ ] Los archivos están en las rutas esperadas

## Entregable Esperado
- `module-agent/fix-demo-implementation.md`
- Demo funcional en `packages/core/demo/`

## Restricciones
- **SÍ** seguir la arquitectura de Extensio
- **SÍ** asegurar que `ext build` funciona
- **NO** modificar el código de implementación del core

---

**Activado por**: 🏛️ architect-agent  
**Fecha**: 2026-01-17T17:31:00Z  
**Estado**: ACTIVO
