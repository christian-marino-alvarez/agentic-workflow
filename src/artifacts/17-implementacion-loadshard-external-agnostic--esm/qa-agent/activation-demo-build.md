---
artifact: agent-activation
phase: phase-5-verification
activated_agent: qa-agent
activated_by: architect-agent
activation_date: 2026-01-17T17:38:00Z
---

# Agent Activation — Validate Demo Build

## Agente Activado
🛡️ **qa-agent**

## Contexto
El module-agent ha corregido la estructura de la demo. Ahora se requiere validar que la build funciona correctamente tanto en modo manual como automático.

## Responsabilidades Asignadas

### 1. Validar Build Manual
Ejecutar:
```bash
cd packages/core
npm run demo:manual
```

**Validaciones**:
- [ ] La build completa sin errores
- [ ] Se genera `demo/dist/chrome/`
- [ ] El manifest.json se copia correctamente
- [ ] Los archivos `.mts` se compilan a `.mjs`
- [ ] Chrome se lanza con la extensión cargada (si `--loadBrowser` está activo)

### 2. Validar Build Automática
Ejecutar:
```bash
cd packages/core
ext build --targetPath ./demo --browsers chrome
```

**Validaciones**:
- [ ] La build completa sin errores
- [ ] Se genera `demo/dist/chrome/manifest.json`
- [ ] `service.worker.mts` → `dist/chrome/service.worker.mjs`
- [ ] `popup.mts` → `dist/chrome/popup.mjs`
- [ ] `demo-shard.mts` → `dist/chrome/demo-shard.mjs`
- [ ] `popup.html` se copia correctamente

### 3. Validar Funcionalidad (Si la build es exitosa)
- [ ] Cargar la extensión manualmente en Chrome desde `demo/dist/chrome/`
- [ ] Verificar que el popup se abre
- [ ] Navegar a una página externa (ej. Wikipedia)
- [ ] Click en "Inyectar Shard"
- [ ] Verificar que el Shard aparece en un iframe
- [ ] Verificar que el Shard crece automáticamente

### 4. Reportar Resultados
Crear informe con:
- Resultado de build manual (✅ o ❌)
- Resultado de build automática (✅ o ❌)
- Logs de errores (si los hay)
- Screenshots o evidencia visual (si aplica)

## Criterios de Validación
- ✅ **PASS**: Ambas builds completan sin errores
- ⚠️ **PARTIAL**: Una build funciona, la otra falla
- ❌ **FAIL**: Ambas builds fallan

## Entregable Esperado
- `qa-agent/demo-build-validation.md`

## Restricciones
- **SÍ** ejecutar las builds
- **SÍ** reportar todos los errores encontrados
- **NO** modificar código de la demo (solo reportar issues)

---

**Activado por**: 🏛️ architect-agent  
**Fecha**: 2026-01-17T17:38:00Z  
**Estado**: ACTIVO
