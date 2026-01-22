# Analysis: Revisión del Sistema Agéntico

## 1. Resumen Ejecutivo
El análisis confirma una desconexión entre la potencia del framework (Core) y la capacidad de los agentes para implementarlo de forma consistente. La principal causa es la falta de detalle en las constituciones de Shards y Pages, y workflows que no cubren los pasos técnicos críticos para el build del CLI.

## 2. Análisis de Problemas Técnicos

### 2.1 Shards (Debilidad Crítica)
- **Falta de Contrato Visual**: Los agentes no distinguen entre el componente UI (Lit/React) y el "Manager" del Shard.
- **Detección de Build**: El sistema de exportación de Shards como archivos independientes (`.mjs`) no está documentado en las reglas, lo que causa errores de "Missing Shard" en tiempo de ejecución.
- **Registro Explícito**: La necesidad de `Shard.register` no está reforzada, causando WebComponents no definidos.

### 2.2 Pages (Ambigüedad)
- **Inexistencia de Reglas**: No hay reglas sobre cómo inyectar estilos o manejar la navegación programática de forma segura.
- **Indexación**: El archivo `src/surface/pages/index.mts` es vital para el despliegue pero los agentes lo tratan como opcional.

### 2.3 Workflows (Fragmentación)
- Los flujos actuales no tienen "Gating" de arquitectura. Un agente puede terminar una implementación sin haber registrado el Shard en el Engine, lo cual es un fallo silencioso hasta el build.

## 3. Matriz de Cambios Propuestos

| Componente | Tipo de Cambio | Impacto |
|------------|----------------|---------|
| `constitution.shards` | Refactor Profundo | Definición de patrón Adapter, reglas de CSS y comunicación Engine-to-Shard. |
| `constitution.pages` | Refactor Profundo | Definición de ciclo de vida Page, indexación obligatoria y navegación. |
| `constitution.modules` | Refactor | Clarificar comunicación entre scopes (Engine/Context/Surface). |
| Workflow `pages.create` | Nuevo | Flujo completo desde scaffolding hasta validación de build. |
| Workflow `shards.create` | Nuevo | Flujo completo incluyendo selección de adapter (Lit/React/Vanilla). |

## 4. Impacto en Infraestructura (CLI/MCP)
- **Yeoman Generators**: Los templates deben alinearse con las nuevas constituciones (especialmente el wrapper del Shard).
- **MCP Tools**: `extensio_create` debe ser la única fuente de verdad para el scaffolding inicial para evitar desviaciones manuales.

## 5. Evaluación de Riesgos
- **Complejidad**: Incrementar las reglas puede hacer que los agentes cometan más errores de contexto si no se estructuran bien. Mitigación: Uso de reglas `MEMORY` y `PERMANENT` claras.
- **Ruptura de Patrones**: Debemos asegurar que los módulos existentes sigan funcionando (retrocompatibilidad).

## 6. Recomendaciones del Arquitecto
1.  **Priorizar la unificación del patrón Shard**: Eliminar la ambigüedad de si un Shard es un WebComponent o un objeto JS. Debe ser SIEMPRE un WebComponent registrado.
2.  **Workflow-driven development**: Obligar a los agentes a ejecutar el workflow específico (`/shards.create`) antes de la implementación general para asegurar el registro correcto.

---
**¿Deseas proceder con el Plan de Implementación basado en este análisis?**
