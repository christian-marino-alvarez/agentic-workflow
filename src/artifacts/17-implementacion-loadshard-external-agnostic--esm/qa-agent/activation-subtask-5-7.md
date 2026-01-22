---
artifact: agent-activation
phase: phase-4-implementation
subtask_id: 5-7
activated_agent: qa-agent
activated_by: architect-agent
activation_date: 2026-01-17T17:21:00Z
---

# Agent Activation — Subtasks 5-7: Demo & Testing Infrastructure

## Agente Activado
🧪 **qa-agent**

## Contexto
Según el plan aprobado, se requiere crear la infraestructura de demo y testing para validar la inyección de Shards en páginas externas mediante iframes.

## Responsabilidades Asignadas

### Paso 5: Creación de la Demo
- Crear `packages/core/demo/` con estructura de extensión funcional
- Implementar `DemoEngine` que orqueste la carga de Shards
- Crear `DemoShard` que cambie de tamaño dinámicamente para probar auto-resize
- Eliminar cualquier demo previa si existe

### Paso 6: Configuración de Scripts
- Añadir a `packages/core/package.json`:
  - `demo:manual`: Para pruebas manuales con watch mode
  - `demo:automation`: Para tests E2E automatizados

### Paso 7: Tests E2E con Playwright
- Crear suite de tests en `packages/core/test/e2e/`
- Validar inyección de Shards en páginas externas
- Verificar auto-resize del iframe
- Confirmar aislamiento CSS/JS
- Validar ESM funcional en Chrome y Firefox

## Constituciones Aplicables
- `constitution.extensio_architecture` (estructura de demo, testing)
- `roles/qa.md` (estrategia de testing, responsabilidad exclusiva)
- Plan aprobado (secciones 5, 6, 7)

## Herramientas Obligatorias
- **Demo**: `mcp_extensio-cli tools` (extensio_demo)
- **Build**: `mcp_extensio-cli tools` (extensio_build)
- **Tests**: Playwright (según constitution)

## Criterios de Validación

### Demo (Paso 5)
- [ ] Estructura de demo creada con `extensio_demo`
- [ ] `DemoEngine` funcional
- [ ] `DemoShard` con contenido dinámico
- [ ] Manifest.json configurado correctamente

### Scripts (Paso 6)
- [ ] `npm run demo:manual` compila y lanza Chrome
- [ ] `npm run demo:automation` ejecuta tests E2E

### Tests E2E (Paso 7)
- [ ] Test: Inyección de Shard en página externa
- [ ] Test: Auto-resize del iframe
- [ ] Test: Aislamiento CSS (estilos de host no afectan Shard)
- [ ] Test: ESM funcional (Shard carga correctamente)
- [ ] Todos los tests pasan en Chromium

## Acceptance Criteria Cubiertos
- AC1: Iframe ESM multi-browser
- AC2: Aislamiento total vía Iframe
- AC3: Prefijo `extensio-`
- AC4: Refactorización Engine (ya validado)
- AC5: Auto-resize (sin AI, mediante ResizeObserver)

## Entregables Esperados
- `qa-agent/subtask-5-7-implementation.md`
- `packages/core/demo/` (estructura completa)
- `packages/core/package.json` (scripts añadidos)
- `packages/core/test/e2e/shard-injection.spec.ts` (o similar)

## Restricciones
- **NO** ejecutar tests que no sean E2E (los unitarios ya pasaron)
- **SÍ** usar `mcp_extensio-cli tools` para crear la demo
- **SÍ** validar que la demo sigue la arquitectura Extensio

## Escenario de Demo Sugerido
1. Extensión cargada en Chrome
2. Navegación a `https://wikipedia.org`
3. Click en botón de la extensión (popup o content script)
4. Se inyecta un Shard flotante en la página
5. El Shard muestra contenido dinámico (ej. contador, formulario)
6. El iframe se ajusta automáticamente al contenido

---

**Activado por**: 🏛️ architect-agent  
**Fecha**: 2026-01-17T17:21:00Z  
**Estado**: ACTIVO
