---
artifact: research
phase: phase-1-research
owner: researcher-agent
status: draft
related_task: 17-implementacion-loadshard-external-agnostic--esm
---

# Research Report — 17-Implementación de loadShard External

## 1. Resumen ejecutivo
- **Problema investigado**: Incompatibilidad de ESM en Firefox Content Scripts, aislamiento UI mediante Shadow Root, bypass de CSP en dominios externos y duplicidad de listeners en el Engine.
- **Objetivo de la investigacion**: Definir la estrategia técnica para inyectar Shards agnósticos y aislados en cualquier página web, asegurando compatibilidad cross-browser, resolución de dependencias mediante ESM/Import Maps y simplificar la arquitectura del Engine.
- **Principales hallazgos**: 
    1. **Contenedor iFrame Estándar**: Se decide usar SIEMPRE iframes para la inyección de Shards en páginas externas. Esto simplifica el aislamiento y el bypass de CSP.
    2. **Eliminación de Import Maps Externos**: Al usar iframes que cargan páginas internas de la extensión, no es necesario inyectar Import Maps en la página huésped, eliminando riesgos de colisión.
    3. Firefox requiere bundling si el Shard se inyectara en el isolated world, pero al ser un iframe interno, podemos usar ESM puro en todos los navegadores (siempre que el iframe cargue un recurso de la extensión).
    4. El `Engine` tiene dos listeners `Runtime.onMessage` (en constructor y `_listen`), lo que viola el principio de un solo punto de entrada para eventos y puede causar condiciones de carrera.

---

## 2. Necesidades detectadas
- **Soporte Multi-browser**: Estrategia diferenciada para Chrome (ESM puro) y Firefox (Bundle).
- **Aislamiento Estricto**: Uso de Shadow Root `closed` y prefijos `extensio-` para Custom Elements.
- **Gestión de dependencias**: Inyección de Import Maps para resolver imports de `@extensio/core`.
- **Bypass de CSP**: Superar restricciones de `script-src` en dominios de terceros.

---

## 3. Alternativas tecnicas
### Alternativa A: ESM Nativo + Import Maps (Chrome)
- **Descripción**: Inyectar un `<script type="importmap">` seguido del script del Shard como módulo.
- **Pros**: Cero bundling, cacheo nativo del navegador, alineado con la filosofía Extensio.
- **Contras**: No soportado en Firefox Content Scripts.
- **Riesgos**: Colisión si la página web ya tiene un Import Map (los Import Maps son únicos por documento). *Mitigación: Fusionar o inyectar recursivamente si es posible.*

### Alternativa B: Bundling Dinámico (Firefox Fallback)
- **Descripción**: El motor de build genera un único `.js` (IIFE o CJS) que contiene todas las dependencias del Shard.
- **Pros**: Compatibilidad total con Firefox y navegadores antiguos.
- **Contras**: Pierde la ventaja de ESM y carga modular.
- **Impacto en arquitectura**: Requiere que `extensio-cli` genere dos versiones de salida para Shards.

---

### Alternativa C: Contenedor iFrame (Aislamiento Total)
- **Descripción**: Envolver el Shard en un iframe dinámico inyectado por el Content Script. El iframe carga un HTML de la extensión que a su vez importa el Shard ESM.
- **Pros**: Aislamiento perfecto (Strong Isolation), evita colisiones de CSS/JS de la página host, bypass nativo de CSP (el iframe tiene su propio origen `chrome-extension://`), compatibilidad idéntica en todos los navegadores.
- **Contras**: Complejidad en la comunicación (`postMessage`), dificultad para el auto-dimensionado (resize dinámico), mayor overhead de memoria.
- **Riesgos**: Algunas páginas bloquean la inyección de iframes si tienen directivas `frame-src` muy estrictas. *Mitigación: Usar declarativeNetRequest para permitirlo.*

## 4. APIs Web / WebExtensions relevantes
- **API Scripting**: `chrome.scripting.executeScript` para inyectar el cargador inicial.
- **declarativeNetRequest**: Para interceptar headers `Content-Security-Policy` y añadir el origen de la extensión a `script-src` y `frame-src`.
- **Web Components (Shadow DOM v1)**: `element.attachShadow({ mode: 'closed' })`.
- **postMessage API**: Para comunicación segura entre el host y el iframe del Shard.

---

## 5. Compatibilidad multi-browser
| Característica | Chrome (MV3) | Firefox (MV3) | Safari (MV3) |
|----------------|--------------|---------------|--------------|
| ESM in Content Scripts | ✅ Nativo (`type: module`) | ❌ No nativo (Bug 1451545) | ✅ Nativo |
| Dynamic `import()` | ✅ | ✅ (Solo `moz-extension://`) | ✅ |
| declarativeNetRequest | ✅ | ✅ | ✅ |
| Shadow Root (closed) | ✅ | ✅ | ✅ |

### Justificación del Fallback (Bundling) en Firefox:
1. **Limitación de Static Imports**: Firefox lanza un `SyntaxError` si un script declarado en `manifest.json` contiene `import` o `export` estáticos al no ser tratado como módulo por defecto.
2. **Inyección en el Main World**: Aunque podemos inyectar un `<script type="module">` en la página externa, este script pierde acceso a las APIs de extensión (`browser.*`) y a nuestro sistema de comunicación reactivo (que requiere el Isolated World).
3. **Manejo de "Bare Specifiers"**: Firefox no resuelve imports automáticos como `@extensio/core`. Sin Import Maps (que son difíciles de inyectar sin violar CSP estrictas), la única vía robusta es un bundle que resuelva estas rutas en tiempo de build.
4. **Higiene de Web Accessible Resources**: Para que Firefox cargue módulos dinámicos, estos deben estar expuestos en el manifest. Un bundle único reduce la superficie de exposición a un solo archivo.

## 6. Recomendaciones AI-first
- **Generación de Glue Code**: Los agentes pueden generar automáticamente el código de inyección del Import Map basado en las dependencias detectadas en el Shard.
- **CSP Profiling**: Implementar un sistema de detección de CSP previo para aplicar el bypass solo si es necesario, minimizando el impacto en privacidad.

---

## 7. Riesgos y trade-offs
- **Riesgo**: Los nombres de los Custom Elements (`extensio-shard-name`) pueden colisionar si se inyectan múltiples extensiones basadas en Extensio.
- **Severidad**: Media.
- **Mitigación**: Añadir un hash o el ID del módulo al prefijo (ej. `extensio-${moduleId}-shardname`).
- **Riesgo**: Modificación de CSP Headers.
- **Severidad**: Alta (Riesgo de seguridad para el usuario).
- **Mitigación**: Solo añadir el origen específico de la extensión (`moz-extension://*` o `chrome-extension://*`) nunca usar `'unsafe-inline'` o `'unsafe-eval'` de forma global.

---

## 8. Fuentes
- [MDN: Using Shadow DOM (Closed mode)](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_shadow_DOM)
- [Chrome Developers: declarativeNetRequest API](https://developer.chrome.com/docs/extensions/reference/declarativeNetRequest/)
- [WICG: Import Maps Specification](https://github.com/WICG/import-maps)

---

## 9. Aprobacion del desarrollador (OBLIGATORIA)
```yaml
approval:
  developer:
    decision: PENDING
    date: null
    comments: null
```
