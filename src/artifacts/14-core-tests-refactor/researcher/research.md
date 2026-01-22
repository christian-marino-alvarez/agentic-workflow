---
artifact: research
phase: phase-1-research
owner: researcher-agent
status: draft
related_task: 14-core-tests-refactor
---

# Research Report — 14-core-tests-refactor

## 1. Resumen ejecutivo

### Problema investigado
El core de Extensio carece de tests funcionales. Los tests existentes son **placeholders vacíos** (`expect(true).toBe(true)`) que no validan ninguna funcionalidad real.

### Objetivo de la investigación
Identificar las mejores prácticas, herramientas y estrategias para crear una suite de tests completa que cubra todos los componentes del core de Extensio.

### Principales hallazgos
1. **vitest-chrome**: Librería especializada para mockear chrome.* API con soporte para eventos y callbacks
2. **MSW (Mock Service Worker)**: Recomendado para interceptar requests HTTP
3. **Stage 3 Decorators**: Requieren configuración específica en TypeScript (ES2022+, `useDefineForClassFields: true`)
4. **Mocks existentes**: Parciales pero funcionales (`chrome-storage.mock.mts`, `chrome-runtime.mock.mts`)
5. **15 drivers a mockear**: storage, runtime, tabs, windows, scripting, offscreen, etc.

---

## 2. Necesidades detectadas

### Requisitos técnicos identificados

| Requisito | Descripción | Criticidad |
|-----------|-------------|------------|
| Mocking de Chrome API | `chrome.storage`, `chrome.runtime`, `chrome.tabs`, etc. | 🔴 Crítico |
| Mocking de Drivers | 15 drivers de Extensio que abstraen Chrome APIs | 🔴 Crítico |
| Testing de Decorators | `@property`, `@onChanged` (Stage 3 decorators) | 🔴 Crítico |
| Comunicación async | Engine ↔ Context messaging via Runtime | 🟡 Alto |
| Storage reactivo | Propagación de cambios y listeners | 🟡 Alto |
| Lifecycle de Surfaces | `onMount`, `onUnmount`, event listeners | 🟡 Alto |

### Suposiciones y límites
- Los tests NO modifican la lógica del core
- Se mantienen los thresholds de cobertura existentes (80%)
- Se usa Vitest para unit/integration y Playwright para E2E
- Los drivers exponen interfaces estáticas (`Storage.local.get()`, `Runtime.sendMessage()`)

---

## 3. Alternativas técnicas

### 3.1 Estrategia de Mocking para Chrome API

#### Opción A: vitest-chrome (Recomendada)
- **Descripción**: Librería dedicada que proporciona mocks completos de `chrome.*`
- **Pros**: 
  - Soporte para eventos (`callListeners`, `clearListeners`)
  - Manejo de callbacks y `chrome.runtime.lastError`
  - Específica para Vitest
- **Contras**: Dependencia adicional
- **Riesgo**: Bajo
- **Impacto**: Simplifica significativamente el testing

#### Opción B: Mocks manuales (Actual)
- **Descripción**: Mocks escritos manualmente en `test/mocks/`
- **Pros**: Control total, sin dependencias
- **Contras**: Mayor mantenimiento, cobertura incompleta
- **Riesgo**: Medio
- **Impacto**: Requiere crear mocks para 15 drivers

**Recomendación**: **Opción B mejorada** — Mantener mocks manuales pero estructurarlos por driver para mayor coherencia. No añadir dependencias innecesarias.

---

### 3.2 Estrategia de Mocking para Drivers de Extensio

Los drivers de Extensio exponen clases estáticas que encapsulan Chrome APIs:

```typescript
// Ejemplo: Storage driver
Storage.local.get(['key']);
Storage.session.set({ key: 'value' });

// Ejemplo: Runtime driver
Runtime.sendMessage({ channel: '...', data: {...} });
Runtime.onMessage.addListener(callback);
```

#### Estrategia propuesta

1. **Mock de módulos completos** via `vi.mock()`:
   ```typescript
   vi.mock('@extensio/driver-storage', () => ({
     Storage: {
       local: { get: vi.fn(), set: vi.fn(), ... },
       session: { get: vi.fn(), set: vi.fn(), ... },
     }
   }));
   ```

2. **Estructura de mocks por driver**:
   ```
   test/mocks/
   ├── drivers/
   │   ├── storage.mock.mts
   │   ├── runtime.mock.mts
   │   ├── tabs.mock.mts
   │   ├── windows.mock.mts
   │   ├── scripting.mock.mts
   │   └── ... (15 total)
   └── index.mts
   ```

---

### 3.3 Estrategia para Testing de Decorators

Los decorators del core usan **Stage 3 ECMAScript Decorators**:

```typescript
// @property decorator
@property({ storage: AreaName.Local })
accessor myProp: string = 'default';

// @onChanged decorator
@onChanged({ property: 'myProp', storage: AreaName.Local })
onMyPropChanged(change: Change) { ... }
```

#### Requisitos de configuración

```json
// tsconfig.json (ya configurado correctamente)
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "experimentalDecorators": false  // Stage 3, no experimental
  }
}
```

#### Patrón de testing para decorators

```typescript
describe('@property', () => {
  class TestEngine extends Engine {
    @property({ storage: AreaName.Local })
    accessor testProp: string = 'initial';
  }

  it('should register property in propReader', () => {
    const engine = new TestEngine('test', Scope.Engine);
    expect(engine.propReader.has('testProp')).toBe(true);
  });

  it('should persist to storage on set', async () => {
    const engine = new TestEngine('test', Scope.Engine);
    engine.testProp = 'newValue';
    expect(Storage.local.set).toHaveBeenCalled();
  });
});
```

---

## 4. APIs Web / WebExtensions relevantes

| API | Uso en Core | Estado de soporte |
|-----|-------------|-------------------|
| `chrome.storage` | Persistencia de @property | ✅ Chrome/Firefox/Safari |
| `chrome.runtime` | Messaging Engine↔Context | ✅ Chrome/Firefox/Safari |
| `chrome.tabs` | Navigation, loadShard | ✅ Chrome/Firefox/Safari |
| `chrome.windows` | Navigation popup | ✅ Chrome/Firefox/Safari |
| `chrome.scripting` | Shard injection | ✅ Chrome/Firefox/Safari |
| `chrome.offscreen` | Context offscreen | ⚠️ Solo Chrome (Manifest V3) |

### Restricciones conocidas
- `chrome.offscreen` no existe en Firefox → Se necesita fallback
- `chrome.sidePanel` solo Chrome 114+ → No usado en core actual

---

## 5. Compatibilidad multi-browser

### Tabla de compatibilidad de funcionalidades testeadas

| Funcionalidad | Chrome | Firefox | Safari | Notas |
|---------------|--------|---------|--------|-------|
| Storage API | ✅ | ✅ | ✅ | Sync/Local/Session |
| Runtime messaging | ✅ | ✅ | ✅ | |
| Scripting API | ✅ | ✅ | ⚠️ | Safari limitado |
| Offscreen documents | ✅ | ❌ | ❌ | Solo Chrome MV3 |
| Tabs/Windows API | ✅ | ✅ | ✅ | |

### Estrategia de mitigación
- Tests unit no dependen del navegador (happy-dom)
- Tests E2E solo para Chrome (Playwright)
- Mocks uniformes independientes del navegador

---

## 6. Recomendaciones AI-first

### 6.1 Generación automatizada de mocks
Los mocks de drivers pueden generarse automáticamente analizando las interfaces exportadas:

```bash
# Potencial script futuro
extensio generate-mocks --driver storage --output test/mocks/drivers/
```

### 6.2 Cobertura asistida por agentes
- El QA-agent puede ejecutar tests y reportar gaps de cobertura
- Los tests pueden incluir metadata para trazabilidad de acceptance criteria

### 6.3 Test discovery automático
Vitest ya soporta `--watch` y `--coverage`. Integración con CI existente.

---

## 7. Riesgos y trade-offs

| Riesgo | Severidad | Mitigación |
|--------|-----------|------------|
| Decorators Stage 3 no transpilan correctamente | 🟡 Media | Verificar config esbuild/vite |
| Mocks desincronizados con drivers reales | 🟡 Media | Crear tipos compartidos para mocks |
| Tests frágiles por cambios en Core | 🔴 Alta | Tests unitarios pequeños y focalizados |
| Offscreen no testeable en happy-dom | 🟢 Baja | Mock completo, E2E para validación real |
| Cobertura 80% difícil de alcanzar | 🟡 Media | Priorizar componentes críticos primero |

---

## 8. Fuentes

### Documentación oficial
- [Vitest Mocking Guide](https://vitest.dev/guide/mocking.html)
- [Chrome Extensions Testing](https://developer.chrome.com/docs/extensions/how-to/test)
- [TypeScript Decorators Stage 3](https://devblogs.microsoft.com/typescript/announcing-typescript-5-0/#decorators)

### Librerías recomendadas
- [vitest-chrome](https://github.com/nickovchinnikov/vitest-chrome) — Mocks de Chrome API
- [MSW](https://mswjs.io/) — Mock Service Worker para HTTP

### Recursos adicionales
- [Vitest Browser Mode](https://vitest.dev/guide/browser/index.html)
- [Playwright E2E for Extensions](https://playwright.dev/docs/chrome-extensions)

---

## 9. Aprobación del desarrollador (OBLIGATORIA)

```yaml
approval:
  developer:
    decision: SI
    date: 2026-01-16T19:50:39+01:00
    comments: Aprobado sin cambios
```
