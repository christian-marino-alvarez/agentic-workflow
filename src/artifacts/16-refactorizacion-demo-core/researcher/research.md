---
artifact: research
phase: phase-1-research
owner: researcher-agent
status: draft
related_task: 16-refactorizacion-demo-core
---

# Research — 16-refactorizacion-demo-core

## 1. Objetivo de la Investigación

Investigar las capacidades actuales del core de Extensio para:
- Inyección de Shards en páginas orgánicas (cross-context)
- Surface Pages como punto de entrada
- Automatización E2E con Playwright
- Scripts npm para carga manual/automática

---

## 2. Estado Actual de la Demo (As-Is)

### Estructura
```
packages/core/demo/
├── src/
│   ├── engine/index.mts        # DemoEngine básico
│   ├── manifest.json           # MV3, popup como Surface Page
│   └── surface/
│       ├── pages/main/         # MainPage (popup)
│       └── shards/             # ContentShard, HeaderShard
├── package.json                # Usa React (a eliminar)
└── tsconfig.json
```

### Problemas Detectados
1. **Usa React**: La demo tiene dependencias de React que deben eliminarse (vanilla WebComponents requeridos).
2. **Solo popup**: La Surface Page actual es un action popup, no una página standalone.
3. **Sin inyección en orgánicas**: No hay demostración de `Engine.loadShard()` para páginas externas.
4. **Sin tests E2E**: No existe directorio `test/e2e` para la demo.

---

## 3. Capacidades del Core Relevantes

### 3.1 Engine.loadShard() — Inyección Cross-Context
```typescript
public async loadShard(
    shardPath: string,
    options: ShardOptions = {}
): Promise<void> {
    const jsUrl = Runtime.getURL(shardPath);
    const { tabId, run_at = 'document_idle' } = options;
    
    const target = { tabId: tabId || (await this.getCurrentTabId()) };
    await Scripting.executeScript({
        target,
        files: [jsUrl],
        injectImmediately: run_at === 'document_start',
    });
}
```

**Puntos clave**:
- `run_at: 'document_start'` permite inyección lo más rápida posible.
- Usa `Scripting.executeScript` para inyección cross-context.
- El Shard debe ser un archivo `.mjs` compilado que se auto-registra.

### 3.2 Page.loadShard() — Montaje en Mismo Contexto
```typescript
public async loadShard<T extends Shard>(
    ShardOrTag: (new (id: string, context: PageShardContext) => T) | string,
    options: PageShardOptions = {}
): Promise<T>
```

**Puntos clave**:
- Instancia y monta Shards directamente en el DOM de la Page.
- Auto-registra el WebComponent si se pasa la clase.
- Usa Shadow DOM para aislamiento.

### 3.3 Engine.navigate() — Navegación a Surface Pages
```typescript
public async navigate(url: string | { default: string }, options?: NavigationOptions)
```

**Uso**: `this.navigate('surface/pages/main/index.html', { newTab: true })`

---

## 4. Configuración Playwright Existente

```typescript
// packages/core/playwright.config.ts
export default defineConfig({
    testDir: './test/e2e',
    timeout: 30000,
    projects: [
        {
            name: 'chromium',
            use: {
                launchOptions: {
                    args: [
                        `--disable-extensions-except=${extensionPath}`,
                        `--load-extension=${extensionPath}`,
                    ],
                },
            },
        },
        { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    ],
});
```

**Hallazgos**:
- Ya existe configuración para cargar extensión en Chrome.
- Firefox no tiene carga de extensión configurada (limitación de Playwright).
- `testDir` apunta a `./test/e2e` que no existe actualmente.

---

## 5. Requisitos de Implementación Derivados

### 5.1 Nueva Demo — Componentes

| Componente | Tipo | Función |
|------------|------|---------|
| `DemoEngine` | Engine | Escucha navegación, inyecta floating button |
| `MainPage` | Surface Page (standalone) | Página inicial con botón YouTube |
| `OpenYoutubeButton` | Shard | Botón que abre YouTube |
| `FloatingButton` | Shard | Botón inyectado en páginas orgánicas |

### 5.2 Scripts npm

```json
{
  "scripts": {
    "demo:build": "extensio build --browsers=chrome,firefox,safari",
    "demo:manual": "extensio build --loadBrowser=${npm_config_browser:-chrome}",
    "demo:auto": "playwright test ${npm_config_browser:+--project=$npm_config_browser}"
  }
}
```

### 5.3 Medición de Rendimiento

Para validar inyección < 100ms:
```typescript
// En el Shard
const loadStart = performance.now();
// ... Shard se monta ...
const loadEnd = performance.now();
console.log(`Shard injected in ${loadEnd - loadStart}ms`);
// Exponer como data-attribute para Playwright
container.setAttribute('data-inject-time', String(loadEnd - loadStart));
```

---

## 6. Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Firefox no soporta carga de extensión en Playwright | Alta | Medio | Documentar limitación, probar manualmente |
| Inyección lenta en `document_start` | Media | Alto | Usar `injectImmediately: true` y medir |
| Content Security Policy bloquea Shard | Media | Alto | Usar `world: 'MAIN'` en Scripting si es necesario |

---

## 7. Recomendaciones del Researcher

1. **Eliminar React**: Crear demo 100% vanilla WebComponents.
2. **Surface Page standalone**: Usar página dedicada en lugar de popup.
3. **Inyección con `document_start`**: Maximizar velocidad de aparición del floating button.
4. **Shadow DOM obligatorio**: Asegurar aislamiento total del Shard inyectado.
5. **Métricas de rendimiento**: Exponer tiempo de inyección para validación E2E.

---

## 8. Aprobación del Desarrollador

```yaml
approval:
  developer:
    decision: SI
    date: 2026-01-17T08:45:00Z
    comments: "Aprobado para avanzar a Análisis"
```

> Esta investigación requiere aprobación antes de avanzar a Fase 2 (Análisis).
