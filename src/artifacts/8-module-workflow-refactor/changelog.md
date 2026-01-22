---
artifact: changelog
phase: phase-8-commit-push
owner: architect-agent
status: pending
related_task: 8-module-workflow-refactor
---

# Changelog — 8-module-workflow-refactor

## Added
- New `Shard.register(tagName, Class)` pattern in `generator/module/templates`.
- `--withShards` and `--withPages` flags to `extensio_create` MCP tool and CLI.
- Automatic functional demo generation for modules (`includeDemo: true` by default).
- Example shard (`example.mts`) and registry (`index.mts`) in new module scaffolding.
- New rules in `constitution.modules` for naming conventions and `Shard.register` usage.

## Changed
- Refactored `module-create` workflow to support new flags.
- Updated `generators/module/index.mts` logic to handle legacy `withSurface` flag mapping.
- Updated `tools/mcp-server` definition to include new boolean flags.

## Fixed
- Fixed CLI boolean flags definition in `packages/cli/src/index.mts` (removed mandatory `<boolean>` argument).
