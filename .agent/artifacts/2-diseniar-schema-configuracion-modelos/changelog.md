# Changelog — 2-diseniar-schema-configuracion-modelos

## [1.38.0-beta.11] - 2026-02-06

### Added
- **Modular Providers Infrastructure**: Created `src/extension/providers/` directory for LLM provider-specific logic.
- **Provider Schemas**: Added Zod schemas for `openai`, `gemini`, and `custom` providers with strict validation and default parameters.
- **Secret Management**: Added `SecretHelper` in `src/extension/modules/setup/` to securely manage API Keys using VS Code's `SecretStorage`.
- **Inter-Provider Delegation**: Added `delegateToGeminiTool` in `src/extension/providers/gemini/` to allow seamless task offloading between models.
- **Testing**: Added `test/providers-schemas.test.ts` with 100% coverage for the new configuration schemas.

### Changed
- Refactored `src/extension/modules/setup/types.d.ts` to consume modular provider types.
