# Acceptance Criteria — 3-implementar-persistencia-settings-memento

🏛️ **architect-agent**: Criterios de aceptación para la implementación de la persistencia de configuración.

## AC-1: Abstracción de Memento API
- **Requisito**: La lógica de `ExtensionContext.globalState` debe estar encapsulada. El resto de la extensión no debe tocar la API de VS Code directamente para settings.
- **Verificación**: Existencia de la clase `SettingsStorage`.

## AC-2: Validación con Zod
- **Requisito**: Toda lectura de configuración de modelos debe ser validada contra el `ModelConfigSchema` definido en la tarea anterior.
- **Verificación**: Los métodos `getModels()` deben retornar tipos validados o lanzar error/retornar default si el JSON es inválido.

## AC-3: Gestión de Modelos (CRUD)
- **Requisito**: Implementar métodos para obtener la lista completa de modelos y para actualizarla.
- **Verificación**: Métodos `getModels(): ModelConfig[]` y `setModels(models: ModelConfig[]): Promise<void>`.

## AC-4: Persistencia de Artifacts Path
- **Requisito**: Almacenar la ruta base para los artifacts generados por los agentes.
- **Verificación**: Métodos `getArtifactsPath()` y `setArtifactsPath()`.

## AC-5: Integración con SecretStorage (Referencial)
- **Requisito**: La configuración NO debe guardar la API Key, solo el `secretKeyId`.
- **Verificación**: El esquema validado confirma que el campo es un ID de referencia.

---

## Preguntas de Validación (Architect)
1. **¿Qué namespaces usaremos en Memento?** (Ej: `agentic-workflow.models`).
2. **¿Cómo manejaremos la migración si el esquema cambia?** (Versionado de settings).
3. **¿Será un Singleton o se inyectará el contexto?** (Se recomienda inyección de contexto para testabilidad).
