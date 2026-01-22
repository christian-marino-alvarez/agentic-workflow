---
artifact: research
phase: phase-1-research
owner: researcher-agent
status: draft
related_task: 7-modules-globals-constants
---

# Research Report — 7-modules-globals-constants

## 1. Resumen ejecutivo

**Problema investigado:**  
Los módulos de Extensio no tienen definidas reglas para extender los archivos globales `global.d.mts` y `constants.mts`, a diferencia de los drivers que sí tienen un contrato claro.

**Objetivo:**  
Aplicar el mismo patrón de integración de tipos y constantes que utilizan los drivers a los módulos, usando el namespace `Extensio.<ModuleName>.<types>`.

**Principales hallazgos:**
1. El patrón de drivers está bien documentado en `constitution.drivers` (secciones 2.3 y 2.4)
2. Los archivos globales ya existen y funcionan: `global.d.mts` y `constants.mts` en root
3. El namespace actual para drivers es `Extension.<DriverName>` (no `Extensio`)
4. Los workflows de módulos existen pero carecen de pasos de verificación de globals/constants
5. El MCP CLI tiene soporte para crear módulos pero requiere verificación

---

## 2. Necesidades detectadas

### Requisitos técnicos identificados:
1. **Actualizar `constitution.modules`** con secciones equivalentes a drivers para globals y constants
2. **Definir namespace para módulos**: `Extensio.<ModuleName>` (diferenciado de `Extension` de drivers)
3. **Actualizar workflows de módulos** (`create.md`, `refactor.md`, `delete.md`) con verificación obligatoria
4. **Actualizar template `module-create.md`** para incluir checklist de globals/constants
5. **Verificar MCP CLI** para que genere estructura correcta

### Suposiciones:
- No existen módulos implementados actualmente (confirmado por el desarrollador)
- Solo tipos "públicos" deben registrarse en globals (decisión del desarrollador)
- El formato del namespace debe ser PascalCase igual que drivers

### Límites:
- Esta tarea NO implementa código de módulos, solo actualiza contratos y workflows
- La verificación se hará mediante un módulo de test (no producción)

---

## 3. Alternativas técnicas

### Alternativa A: Namespace unificado `Extension`
**Descripción:** Usar el mismo namespace `Extension` para drivers y módulos.

| Aspecto | Evaluación |
|---------|------------|
| Pros | Simplicidad, un solo namespace global |
| Contras | Sin distinción clara entre drivers y módulos |
| Riesgo | Colisiones de nombres si un driver y módulo tienen el mismo nombre |
| Impacto | Bajo impacto, reutiliza estructura existente |

### Alternativa B: Namespace separado `Extensio` ✅ RECOMENDADA
**Descripción:** Usar namespace `Extensio.<ModuleName>` separado para módulos.

| Aspecto | Evaluación |
|---------|------------|
| Pros | Distinción clara, sin riesgo de colisiones |
| Contras | Dos namespaces a mantener |
| Riesgo | Bajo |
| Impacto | Requiere documentar convención claramente |

> **Recomendación:** El desarrollador ya especificó `Extensio.<ModuleName>` como namespace objetivo.

### Alternativa C: No extender globals para módulos
**Descripción:** Mantener tipos de módulos solo en sus archivos locales.

| Aspecto | Evaluación |
|---------|------------|
| Pros | Menor complejidad |
| Contras | Módulos no pueden exportar tipos públicamente |
| Riesgo | Limita interoperabilidad entre módulos |
| Impacto | Contradice el objetivo del desarrollador |

---

## 4. APIs Web / WebExtensions relevantes

Esta tarea no involucra APIs del navegador directamente. Es una actualización de contratos y workflows del sistema agéntico.

| Componente | Estado |
|------------|--------|
| TypeScript namespaces | Estable, bien soportado |
| TypeScript `declare global` | Estable, patrón actual en uso |
| ESM exports/imports | Estable, patrón actual en uso |

---

## 5. Compatibilidad multi-browser

No aplica para esta tarea. Los cambios son a nivel de sistema de tipos y contratos de desarrollo, no afectan runtime del navegador.

---

## 6. Recomendaciones AI-first

### Oportunidades para agentes/automatización:

1. **Verificación automática en workflows:**  
   Los workflows de módulos deben incluir pasos que validen automáticamente que `global.d.mts` y `constants.mts` están actualizados correctamente.

2. **Generación via MCP CLI:**  
   El comando `extensio_create module` debe generar la estructura completa incluyendo:
   - `types.d.mts` con tipos públicos marcados
   - `constants.mts` con constantes exportables
   - Snippet para añadir al `global.d.mts` root
   - Snippet para añadir al `constants.mts` root

3. **Checklist automatizada:**  
   El template `module-create.md` debe incluir un checklist verificable por el agente.

### Impacto esperado:
- Reducción de errores en integración de módulos
- Consistencia con el contrato de drivers
- Trazabilidad completa de tipos públicos

---

## 7. Riesgos y trade-offs

| Riesgo | Severidad | Mitigación |
|--------|-----------|------------|
| Inconsistencia de namespace entre documentos | Media | Actualizar todos los documentos afectados en la misma tarea |
| MCP CLI no soporta generación de globals | Baja | Verificar y actualizar si es necesario |
| Módulo de test incompleto | Media | Crear módulo minimal pero funcional |
| Conflicto con arquitectura existente | Baja | Los módulos no existen aún, no hay legacy |

---

## 8. Fuentes

- [constitution.drivers](/Users/milos/Documents/workspace/extensio/.agent/rules/constitution/drivers.md) — Secciones 2.3 y 2.4
- [constitution.modules](/Users/milos/Documents/workspace/extensio/.agent/rules/constitution/modules.md) — Sección 3
- [global.d.mts](/Users/milos/Documents/workspace/extensio/global.d.mts) — Estructura actual de drivers
- [constants.mts](/Users/milos/Documents/workspace/extensio/constants.mts) — Estructura actual de drivers
- [workflow modules/create.md](/Users/milos/Documents/workspace/extensio/.agent/workflows/modules/create.md)
- [template module-create.md](/Users/milos/Documents/workspace/extensio/.agent/templates/module-create.md)

---

## 9. Demos de módulos — Análisis de estructura

### 9.1 Alias `__PARENT_SRC__` (no `__PARENT_PATH__`)

El alias correcto para referenciar el código fuente del módulo padre desde una demo es:

```json
"paths": {
  "__PARENT_SRC__/*": ["../src/*"]
}
```

**Ubicación:** Se configura en el `tsconfig.json` de la demo.

**Uso en código:**
```typescript
export * from '__PARENT_SRC__/engine/index.mts';
export * from '__PARENT_SRC__/surface/pages/index.mts';
export * from '__PARENT_SRC__/surface/shards/index.mts';
```

### 9.2 Estructura de demos de módulos

El CLI (`demo.mts` y `generators/module/index.mts`) genera demos con esta estructura:

```
module-name/
├── src/                    # Código fuente del módulo
│   ├── engine/
│   ├── surface/
│   │   ├── pages/
│   │   └── shards/
│   ├── types.d.mts
│   └── constants.mts
└── demo/                   # Demo del módulo
    ├── src/
    │   ├── engine/         # Re-exporta desde __PARENT_SRC__
    │   ├── surface/
    │   │   ├── pages/      # Re-exporta desde __PARENT_SRC__
    │   │   └── shards/     # Re-exporta desde __PARENT_SRC__
    │   ├── types.d.mts     # Tipos propios de la demo
    │   └── manifest.json
    ├── images/
    ├── test/e2e/
    ├── tsconfig.json       # Incluye paths con __PARENT_SRC__
    └── package.json
```

### 9.3 Hallazgos clave del generador

Analizando `generators/module/index.mts`:

1. **Extensión automática de globals:** El método `_extendGlobalTypes()` ya extiende `global.d.mts` automáticamente al crear un módulo.
2. **Extensión automática de constants:** El método `_extendRootConstants()` ya extiende `constants.mts` root automáticamente.
3. **Namespace usado:** Actualmente usa namespace `Extension` (no `Extensio`), ejemplo:
   ```typescript
   namespace Extension {
     namespace ModuleName {
       export type SomeType = SomeType;
     }
   }
   ```

### 9.4 Decisión del desarrollador

> [!IMPORTANT]
> **Decisión:** Unificar namespace a `Extensio` para **drivers y módulos**.
> 
> Esto implica que `Extension` actual debe migrarse a `Extensio` en:
> - `global.d.mts` (root)
> - Generador de drivers (`generators/driver/index.mts`)
> - Generador de módulos (`generators/module/index.mts`)
> - Documentación y constitutions

**Impacto adicional:**
- Cambio breaking en tipos globales existentes
- Requiere actualizar imports en código que use `Extension.*`

### 9.5 Recomendación

Dado que:
- El CLI ya implementa extensión de globals/constants para módulos
- La estructura de demos está correctamente definida
- El alias `__PARENT_SRC__` funciona correctamente

**Acción sugerida:**
1. Si se desea namespace `Extensio`, actualizar `_extendGlobalTypes()` en el generador
2. Documentar el patrón en `constitution.modules`
3. Añadir verificación en workflows de módulos

---

## 10. Aprobación del desarrollador (OBLIGATORIA)
```yaml
approval:
  developer:
    decision: SI
    date: 2026-01-07T20:55:08+01:00
    comments: "Unificar namespace a Extensio para drivers y módulos"
```
