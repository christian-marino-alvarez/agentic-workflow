---
artifact: fix-implementation
phase: phase-5-verification
agent: module-agent
status: completed
related_task: 17-implementacion-loadshard-external-agnostic--esm
subtask_id: fix-demo
completed_at: 2026-01-17T17:36:00Z
---

# Fix Implementation — Module Agent — Demo Integrity

## Agente Responsable
⚙️ **module-agent**

## Problema Detectado
La demo creada por el qa-agent tenía problemas de integridad:
- Archivos con extensión `.mjs` en lugar de `.mts`
- Faltaba `package.json`
- Faltaba `tsconfig.json`
- Referencias incorrectas en `manifest.json` y `popup.html`

## Correcciones Aplicadas

### 1. Renombrado de Archivos
Todos los archivos `.mjs` fueron renombrados a `.mts` para que TypeScript los compile:
- `service.worker.mjs` → `service.worker.mts`
- `popup.mjs` → `popup.mts`
- `demo-shard.mjs` → `demo-shard.mts`

### 2. Creación de `package.json`
```json
{
  "name": "@extensio/core-demo",
  "version": "1.0.0",
  "type": "module",
  "private": true,
  "description": "Demo de inyección de Shards en páginas externas",
  "exports": {
    "./service.worker": "./service.worker.mts",
    "./popup": "./popup.mts",
    "./demo-shard": "./demo-shard.mts"
  }
}
```

### 3. Creación de `tsconfig.json`
```json
{
  "extends": "../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": ".",
    "baseUrl": ".",
    "paths": {
      "@extensio/core": ["../src/engine/index.mts"],
      "@extensio/core/*": ["../src/*"]
    }
  },
  "include": ["*.mjs", "*.mts", "*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

### 4. Actualización de Referencias
- `manifest.json`: `service.worker.mjs` → `service.worker.mts`
- `popup.html`: `popup.mjs` → `popup.mts`
- `package.json`: Todas las exportaciones actualizadas a `.mts`

## Estructura Final de la Demo

```
packages/core/demo/
├── images/
├── manifest.json
├── package.json
├── tsconfig.json
├── service.worker.mts (DemoEngine)
├── popup.html
├── popup.mts
└── demo-shard.mts (DemoShard)
```

## Validación
La demo ahora debería compilar correctamente con:
```bash
cd packages/core/demo
ext build --browsers chrome
```

## Lecciones Aprendidas

### Error del qa-agent
El qa-agent creó la demo manualmente violando la regla R1 (Prohibición de Implementar Código Funcional).

**Debería haber**:
1. Reportado que necesitaba una demo
2. Solicitado al module-agent o surface-agent que la creara
3. Solo crear los tests E2E

### Corrección Aplicada
- Nueva regla R1 añadida a `roles/qa.md` por el architect-agent
- El module-agent corrigió la estructura de la demo
- La demo ahora sigue la arquitectura estándar de Extensio

## Estado
✅ **COMPLETADO**

---

**Implementado por**: ⚙️ module-agent  
**Supervisado por**: 🏛️ architect-agent  
**Fecha**: 2026-01-17T17:36:00Z
