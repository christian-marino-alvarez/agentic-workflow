# Changelog — @cmarino/agentic-workflow

## [1.1.0] - 2026-01-19

### Added
- **Agent Identity**: Mandatory identification prefix for all agents in all artifacts (`🏛️`, `⚙️`, `🧪`, `🔬`).
- **Strict Gate Control**: Manual approval requirement ("SI") in all task lifecycle workflows.
- **Timestamps**: `updated_at` and `validated_at` fields in `task.md` for better traceability.
- **Version Manifest**: Updated `package.json` with new description and standard.

### Changed
- Updated all 19 artifact templates to include identification sections.
- Updated Long, Short, and Init workflows with Step 0 (Identity) and reinforced Gates.
- Generalization of role definitions for portable use.

### Verified
- Bootstrap test successful: scaffolding now generates assets compliant with the new discipline.
