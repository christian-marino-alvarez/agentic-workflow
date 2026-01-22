---
artifact: analysis
phase: phase-2-analysis
owner: architect-agent
status: draft
related_task: 16-refactorizacion-demo-core
---

# Analysis — 16-refactorizacion-demo-core

## 1. Resumen Ejecutivo

Esta tarea requiere eliminar la demo actual del core (basada en React) y crear una nueva demo completa que:
- Demuestre el uso de Surface Pages, Shards y Engine
- Soporte carga automática (Playwright E2E) y manual (desarrollador)
- Incluya inyección de floating button en páginas orgánicas
- Mida rendimiento de inyección (< 100ms)

---

## 2. Cobertura de Acceptance Criteria

| AC | Descripción | Análisis |
|----|-------------|----------|
| 1 | Eliminación demo actual + nueva desde cero | Requiere eliminar `packages/core/demo` y recrear estructura vanilla |
| 2 | Scripts npm `demo:manual` y `demo:auto` | Usar extensio-cli para build y Playwright para E2E |
| 3 | Surface Page + botón YouTube + floating button | 2 shards: OpenYoutubeButton (Page), FloatingButton (inyectado) |
| 4 | Shadow DOM + inyección rápida | Usar `run_at: 'document_start'` en Engine.loadShard() |
| 5 | Tests E2E con métricas de rendimiento | Exponer `data-inject-time` en Shard para Playwright |

---

## 3. Evaluación de Agentes Asignados

### Historial de Métricas (de `.agent/metrics/agents.json`)

| Agente | Media | Tareas | Tendencia | Observación |
|--------|-------|--------|-----------|-------------|
| architect-agent | 10.0 | 1 | stable | Excelente rendimiento previo |
| surface-agent | 0 | 0 | N/A | Sin histórico, primera intervención |
| qa-agent | 0 | 0 | N/A | Sin histórico, primera intervención |

> **Propuesta de mejora**: No aplica, los agentes tienen tendencia estable o sin histórico.

---

## 4. Agentes y Responsabilidades

### 4.1 architect-agent (Owner)
- Diseño de arquitectura general
- Validación de gates en cada fase
- Coordinación de agentes
- Review final de implementación

### 4.2 surface-agent
- Implementación de Surface Page (MainPage)
- Implementación de Shards (OpenYoutubeButton, FloatingButton)
- Estructura HTML/CSS standalone

### 4.3 qa-agent
- Diseño de tests E2E (Playwright)
- Implementación de medición de rendimiento
- Validación de criterios funcionales

---

## 5. Análisis Técnico

### 5.1 Arquitectura Propuesta

```
packages/core/demo/
├── src/
│   ├── engine/
│   │   └── index.mts           # DemoEngine con inyección de FloatingButton
│   ├── manifest.json           # MV3, permissions: scripting, tabs, storage
│   └── surface/
│       ├── pages/
│       │   └── main/
│       │       ├── index.html  # Surface Page HTML (standalone)
│       │       └── index.mts   # MainPage class
│       └── shards/
│           ├── open-youtube-button.mts
│           └── floating-button.mts
├── test/
│   └── e2e/
│       └── demo.spec.ts        # Tests Playwright
├── package.json                # Sin React, scripts demo:manual/auto
└── README.md                   # Documentación de uso
```

### 5.2 Flujo de Ejecución

1. **Instalación**: Usuario carga extensión
2. **Surface Page**: Se abre `surface/pages/main/index.html` automáticamente
3. **Shard YouTube**: Usuario hace clic → abre YouTube en nueva tab
4. **Navegación orgánica**: Al navegar a cualquier URL no-extensión → Engine inyecta FloatingButton

### 5.3 Permisos Manifest (MV3)

```json
{
  "permissions": ["storage", "scripting", "tabs"],
  "host_permissions": ["<all_urls>"],
  "background": {
    "service_worker": "engine/index.mjs",
    "type": "module"
  }
}
```

---

## 6. Impacto y Cambios

### Componentes a Eliminar
- `packages/core/demo/` (completo)

### Componentes a Crear
| Componente | Tipo | Complejidad |
|------------|------|-------------|
| DemoEngine | Engine | Media |
| MainPage | Surface Page | Baja |
| OpenYoutubeButton | Shard | Baja |
| FloatingButton | Shard | Media |
| demo.spec.ts | E2E Test | Alta |
| README.md | Doc | Baja |

---

## 7. Dependencias Externas

- **Playwright**: Ya instalado en el proyecto
- **extensio-cli**: Usado para build
- **driver-scripting**: Para inyección cross-context
- **driver-tabs**: Para navegación

---

## 8. Riesgos Identificados

| Riesgo | Mitigación |
|--------|------------|
| Firefox no soporta carga de extensión en Playwright | Documentar limitación, tests manuales |
| CSP puede bloquear Shard inyectado | Usar `world: 'ISOLATED'` por defecto |
| Inyección lenta | Usar `document_start` + medir tiempo |

---

## 9. Aprobación del Desarrollador

```yaml
approval:
  developer:
    decision: SI
    date: 2026-01-17T08:48:00Z
    comments: "Aprobado para avanzar a Planning"
```

> Esta análisis requiere aprobación antes de avanzar a Fase 3 (Planning).
