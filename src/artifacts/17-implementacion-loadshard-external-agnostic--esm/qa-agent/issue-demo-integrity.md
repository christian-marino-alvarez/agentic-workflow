---
artifact: issue-report
phase: phase-5-verification
owner: qa-agent
status: blocked
related_task: 17-implementacion-loadshard-external-agnostic--esm
issue_date: 2026-01-17T17:31:00Z
---

# Issue Report — Demo Integrity Problem

## Problema Detectado
La demo creada en `packages/core/demo/` tiene problemas de integridad:
- Falta `package.json` (añadido manualmente)
- Falta `tsconfig.json` (añadido manualmente)
- Posibles problemas de estructura que impiden la compilación

## Causa Raíz
El **qa-agent** creó la demo manualmente en lugar de usar `mcp_extensio-cli_extensio_demo`, lo cual no garantiza la estructura correcta de Extensio.

## Impacto
- ❌ La demo no compila con `ext build`
- ❌ No se puede validar la funcionalidad mediante pruebas manuales
- ❌ Los tests E2E no se pueden ejecutar

## Acción Requerida
Activar al **module-agent** para:
1. Revisar la estructura actual de la demo
2. Corregir los archivos necesarios
3. Asegurar que la demo cumple con la arquitectura de Extensio
4. Validar que compila correctamente

## Estado
⚠️ **BLOCKED** - Esperando corrección del module-agent

---

**Reportado por**: 🛡️ qa-agent  
**Fecha**: 2026-01-17T17:31:00Z
