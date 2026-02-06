# Analysis — 3-implementar-persistencia-settings-memento

🏛️ **architect-agent**: Análisis técnico para la centralización de la persistencia de configuración.

## 1. Resumen ejecutivo
**Problema**
Actualmente, la persistencia de configuración en la extensión está dispersa o es inexistente para nuevos conceptos como los "proveedores de modelos" y el "artifacts path". El sistema de modelos polimórficos diseñado en T002 requiere un punto de verdad único y validado para su almacenamiento.

**Objetivo**
Implementar `SettingsStorage` como una capa de abstracción sobre `vscode.Memento` (globalState) que garantice que los datos guardados cumplen con los esquemas Zod y son fácilmente accesibles por otros módulos (Setup, Agents, MCP).

**Criterio de éxito**
- Persistencia robusta de la lista de modelos.
- Validación automática al leer de disco.
- Interfaz limpia para CRUD de configuración.

---

## 2. Estado actual
- **Componentes**: `ApiKeyBroadcaster` maneja estado en memoria pero no persistencia reactiva de objetos complejos.
- **Persistencia actual**: Las API Keys se guardan en `extensions.secrets`, lo cual es correcto. La configuración de modelos (metadata) no tiene un lugar definido aún.
- **Limitaciones**: No hay validación de tipos al recuperar configuraciones de disco en otras partes de la extensión.

---

## 3. Propuesta Técnica

### Estructura de Datos en GlobalState
Usaremos las siguientes claves:
- `agentic-workflow.models`: `ModelConfig[]` (Serializado como JSON).
- `agentic-workflow.artifacts-path`: `string`.

### Clase `SettingsStorage`
```typescript
export class SettingsStorage {
  constructor(private readonly globalState: vscode.Memento) {}

  public getModels(): ModelConfig[] { ... }
  public setModels(models: ModelConfig[]): Promise<void> { ... }
  public getArtifactsPath(): string | undefined { ... }
  public setArtifactsPath(path: string): Promise<void> { ... }
}
```

### Estrategia de Validación
Al llamar a `getModels()`, se recuperará el JSON de `globalState`. Cada elemento será pasado por `ModelConfigSchema.safeParse()`. Los elementos inválidos serán filtrados o el sistema reportará un error de integridad.

---

## 4. Riesgos y mitigaciones
- **Riesgo**: Corrupción de JSON manualmente editado en el almacenamiento global de VS Code.
  - **Mitigación**: Validación Zod estricta en cada lectura. Retornar defaults seguros si falla.
- **Riesgo**: Desincronización entre `secretKeyId` y `SecretStorage`.
  - **Mitigación**: `SettingsStorage` solo guarda el ID. El `SecretHelper` se encarga de la vinculación real.

---

## 5. TODO Backlog
- [ ] Definir valores por defecto para `artifacts-path` (ej: subcarpeta en el workspace activo).
- [ ] Implementar sistema de migración si el schema de models cambia en el futuro.
