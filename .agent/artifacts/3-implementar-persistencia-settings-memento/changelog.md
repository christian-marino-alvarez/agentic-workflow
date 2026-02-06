# Changelog — T003 Settings Persistence

## [1.38.0-beta.11] - 2026-02-06

### Added
- `SettingsStorage` class: A new Facade that wraps `vscode.Memento` for secure and validated state persistence.
- `test/settings-storage.test.ts`: Unit test suite for the persistence layer.

### Changed
- `SetupModule`: Updated to inject `SettingsStorage` into its domain.
- `types.d.ts`: Expanded `SetupDomain` to include the new storage service.
- **Architectural Shift**: Formalized the **Architecture Constitution** (`architecture.md`) mandating the use of Facades/Providers for all external dependencies.

### Technical Details
- Implemented Zod-safe parsing for all disk reads to prevent state corruption.
- Decoupled business logic from `vscode.Memento` API signatures.
