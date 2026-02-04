# Changelog

## 1.28.0-beta.5
- fix(init): remove legacy init flow
- chore(pkg): include dist/mcp in npm package

## [1.27.0-beta.4](https://github.com/christian-marino-alvarez/agentic-workflow/compare/agentic-workflow-v1.26.1-beta.4...agentic-workflow-v1.27.0-beta.4) (2026-02-03)


### Features

* **mcp:** add resources list endpoints ([f35d8a6](https://github.com/christian-marino-alvarez/agentic-workflow/commit/f35d8a6dfbe081be7377228a1e261637f4315aff))
* **mcp:** add resources list endpoints ([d75307f](https://github.com/christian-marino-alvarez/agentic-workflow/commit/d75307f1b70e14a9cde84e886a914826a0933410))

## [1.26.1-beta.4](https://github.com/christian-marino-alvarez/agentic-workflow/compare/agentic-workflow-v1.26.0-beta.4...agentic-workflow-v1.26.1-beta.4) (2026-02-03)


### Bug Fixes

* **mcp:** resolve init paths and list templates ([722266c](https://github.com/christian-marino-alvarez/agentic-workflow/commit/722266c3257cf64844ffa78b916c2eb773c92acb))

## [1.26.0-beta.4](https://github.com/christian-marino-alvarez/agentic-workflow/compare/agentic-workflow-v1.25.4-beta.4...agentic-workflow-v1.26.0-beta.4) (2026-02-03)


### Features

* add clean command for legacy MCP config ([e2220d3](https://github.com/christian-marino-alvarez/agentic-workflow/commit/e2220d35ef3ba86c726406f59c9226fc2cc4c903))
* add non-interactive init mode ([5b82d4b](https://github.com/christian-marino-alvarez/agentic-workflow/commit/5b82d4bec8102554dc0b20ca1dfe7c822325c869))
* add optional bootstrap bundle build ([bc14cdc](https://github.com/christian-marino-alvarez/agentic-workflow/commit/bc14cdc0726f89cdf97fc8e28e182421a4f4b9ef))
* add run_command tool to MCP server ([54d5ab0](https://github.com/christian-marino-alvarez/agentic-workflow/commit/54d5ab01c2a7252020556572692b50cfedac2b87))
* add test bootstrap bundle ([24611da](https://github.com/christian-marino-alvarez/agentic-workflow/commit/24611dacc069d2f06ba30dc348da67d0304619e3))
* align constitution aliases ([dbf339c](https://github.com/christian-marino-alvarez/agentic-workflow/commit/dbf339c54ed62477f38199c58a8a1f534fc0826c))
* align init aliases ([05f7dac](https://github.com/christian-marino-alvarez/agentic-workflow/commit/05f7dacc0355781f3d9a8d0d91725373459230f3))
* clean dist before build ([2a46570](https://github.com/christian-marino-alvarez/agentic-workflow/commit/2a46570be3859cbc48c66eb8ab6c57748a903681))
* **cli:** add register-mcp command for Antigravity and Codex integration ([a249a41](https://github.com/christian-marino-alvarez/agentic-workflow/commit/a249a412233fc14026b99c04b01eb771d796ddef))
* **constitution:** add runtime_integration constitution for MCP workflow integration ([fb7adf8](https://github.com/christian-marino-alvarez/agentic-workflow/commit/fb7adf875951dce53747f60ece03982397cef6b5))
* **extension:** add activity bar webview shell ([f444d5c](https://github.com/christian-marino-alvarez/agentic-workflow/commit/f444d5c5c1c3256dcfc629394b44d359f2cc965b))
* **extension:** scaffold vscode-agentinc ([f6b54d6](https://github.com/christian-marino-alvarez/agentic-workflow/commit/f6b54d6db3a92ac80b5f1d913de482bfaf24f20d))
* **governance:** release v1.22.0-beta.8 ([3834bb4](https://github.com/christian-marino-alvarez/agentic-workflow/commit/3834bb4593dcdb32f65ccb3b98c9f6da692296a0))
* **governance:** release v1.22.0-beta.8 - introduce modular skills system and runtime hardening ([f4458fa](https://github.com/christian-marino-alvarez/agentic-workflow/commit/f4458fa25357eb3202e3d464f601946e3818018e))
* **identity:** add premium SVG icons and update identity rules ([2e4460b](https://github.com/christian-marino-alvarez/agentic-workflow/commit/2e4460b00d048f26a7c0ed1cf6ca1130952277bd))
* implement global runtime logging and verification ([340fa95](https://github.com/christian-marino-alvarez/agentic-workflow/commit/340fa954b3f2b0e6fe7aa417a4f32c92b8d9650f))
* init uses bootstrap alias without bootstrap tool ([30b2bda](https://github.com/christian-marino-alvarez/agentic-workflow/commit/30b2bdacfeb41794c04eec4ea91ad3be0c20f5db))
* initial commit (agentic-workflow core) ([3eed177](https://github.com/christian-marino-alvarez/agentic-workflow/commit/3eed1775b76a260174ab6355379b371c8db62ac9))
* **mcp:** add runtime.next_step and runtime.get_state endpoints ([958e246](https://github.com/christian-marino-alvarez/agentic-workflow/commit/958e246b902ce1974a5abb29cceb80f394f48d67))
* prebuild core bootstrap bundle ([7ec0fb8](https://github.com/christian-marino-alvarez/agentic-workflow/commit/7ec0fb8ae70a8cc882bb935dec55af1164acdf60))
* remove MCP and simplify bootstrap ([b3d31ad](https://github.com/christian-marino-alvarez/agentic-workflow/commit/b3d31ad2353bbdb362c6a2599a2d1395d1ec612f))
* require explicit gate confirmation ([ef1e62b](https://github.com/christian-marino-alvarez/agentic-workflow/commit/ef1e62b4243ea342741d32ddf9ce0319b8aac0df))
* reset core content to extensio backup baseline ([c5e6b03](https://github.com/christian-marino-alvarez/agentic-workflow/commit/c5e6b03780ea0e601701c284d6a98ec5ad3e4c77))
* Runtime Global Logging Implementation ([38110f4](https://github.com/christian-marino-alvarez/agentic-workflow/commit/38110f4a0fd4f0b15e67b69b86c639b3870841ff))
* **runtime:** add MCP-governed engine ([f712346](https://github.com/christian-marino-alvarez/agentic-workflow/commit/f7123464487f849072fac3d2cf00d0aa5df52d08))
* **runtime:** add structured logging via log event ([e363847](https://github.com/christian-marino-alvarez/agentic-workflow/commit/e363847dbe226d18b4976116fa1f1e5c871ef5fd))
* **runtime:** expose next_step and implement granular execution service ([84c9af7](https://github.com/christian-marino-alvarez/agentic-workflow/commit/84c9af77bfa04d994942ab78281ed728d30cf55f))
* simplify init and add clarification questions ([cb24916](https://github.com/christian-marino-alvarez/agentic-workflow/commit/cb2491644380b8bb1ce56082619b43303268bf96))
* **vscode-extension:** add Lit core base, CSP fixes, logging, and setup view ([546444b](https://github.com/christian-marino-alvarez/agentic-workflow/commit/546444bab7a9b9f2d0ee44585cd026da5ca30ab5))
* **workflow:** align init.md with runtime_integration constitution ([e5d38c6](https://github.com/christian-marino-alvarez/agentic-workflow/commit/e5d38c6987f692d580761456311e117d1beb802a))
* **workflow:** align init.md with runtime_integration constitution ([f670f52](https://github.com/christian-marino-alvarez/agentic-workflow/commit/f670f5226e2d1a11eaf0b9c1d844c12fb0d25275))


### Bug Fixes

* **build:** exclude vscode extension from build ([6104370](https://github.com/christian-marino-alvarez/agentic-workflow/commit/610437024b286428a7cd56964291a2ee5928906f))
* **cli:** handle null backup on reinit ([61fb7a5](https://github.com/christian-marino-alvarez/agentic-workflow/commit/61fb7a55496f435f75c0f93ef36278650cdfd3f1))
* **cli:** handle null backup on reinit ([19fd617](https://github.com/christian-marino-alvarez/agentic-workflow/commit/19fd617b30406c4447a6bbf03bbd3d5f2ecc863d))
* **cli:** read version dynamically from package.json ([365b5ad](https://github.com/christian-marino-alvarez/agentic-workflow/commit/365b5ad16237247ce85aa7929fa1646fa6c1ce37))
* **cli:** read version dynamically from package.json ([ac4c9d5](https://github.com/christian-marino-alvarez/agentic-workflow/commit/ac4c9d52064c6f120f87509033bd33b51cffa6ef))
* **extension:** add lit and openai dependencies ([2eca134](https://github.com/christian-marino-alvarez/agentic-workflow/commit/2eca1349c206169adcc1865f3ee35436dbfe86a1))
* **extension:** render mainView webview ([84d8a0c](https://github.com/christian-marino-alvarez/agentic-workflow/commit/84d8a0c2b148b43b63c11817d30221d58a46add1))
* **extension:** render mainView webview ([eba8643](https://github.com/christian-marino-alvarez/agentic-workflow/commit/eba864391126f2f518d6083c2b8931573b5c9b53))
* **identity:** revert to standard markdown-compatible icons ([a6df583](https://github.com/christian-marino-alvarez/agentic-workflow/commit/a6df583cbe9acd6eef322019d8f66a51b186abe5))
* **init:** copy core into local .agent ([07a265d](https://github.com/christian-marino-alvarez/agentic-workflow/commit/07a265d7973525e708c0e55b3eb244f8090dd873))
* **release:** prepare 1.25.3-beta.5 ([ac187f0](https://github.com/christian-marino-alvarez/agentic-workflow/commit/ac187f0ee65ad655d4fb7ef3620b205271a2f282))
* **release:** prepare 1.25.3-beta.5 ([a9b820e](https://github.com/christian-marino-alvarez/agentic-workflow/commit/a9b820e10cbcb8f91db4adccd62c7b62a43d2b99))
* **release:** prepare 1.25.3-beta.6 ([69804c2](https://github.com/christian-marino-alvarez/agentic-workflow/commit/69804c2f3dbd9cfae8675acc81e2fd85551eddd3))
* **release:** prepare 1.25.3-beta.6 ([5f3408c](https://github.com/christian-marino-alvarez/agentic-workflow/commit/5f3408c56b073f146cb2e18d09f0206728d69e33))
* remove self-dependency and fix vulnerabilities with overrides ([c21cde3](https://github.com/christian-marino-alvarez/agentic-workflow/commit/c21cde3905623f9731caf12c3d2453a44e3aabd4))
* resolve conflicts for release branch 1.18.4-beta.2 ([3ac83de](https://github.com/christian-marino-alvarez/agentic-workflow/commit/3ac83de2cc4a3a62073d0829f56cc992770622ad))
* resolve conflicts for release-please PR 43 ([af4c7f9](https://github.com/christian-marino-alvarez/agentic-workflow/commit/af4c7f9fb6a1e1277e2adfa60b422886dac04594))
* resolve merge conflicts in CHANGELOG and package files ([089de5c](https://github.com/christian-marino-alvarez/agentic-workflow/commit/089de5ce34fdf29f8e7048dc1714b91b09c5fb76))
* restore standard .agent paths for customer installation ([555dce5](https://github.com/christian-marino-alvarez/agentic-workflow/commit/555dce5a8c4c35421f8dd381c4c44da52b58f98c))
* **runtime:** add global workflow fallback for phase resolution ([4be6ff3](https://github.com/christian-marino-alvarez/agentic-workflow/commit/4be6ff39dc13af0fde28b617c324c7ebb9d4571f))
* **runtime:** add visible logging to MCP server startup and request handling ([077907a](https://github.com/christian-marino-alvarez/agentic-workflow/commit/077907aa0f2400c3c5607cf43b34fcefb6d38b3d))
* **runtime:** redirect engine logs to stderr to protect MCP stdout protocol ([50756d8](https://github.com/christian-marino-alvarez/agentic-workflow/commit/50756d8a8ab9bb88e0854f71f2ac9605aea6641c))
* **runtime:** resolve relative paths in MCP server ([e7fc272](https://github.com/christian-marino-alvarez/agentic-workflow/commit/e7fc272bbaa6a4d9f27614bf78be657c856e91b5))
* **runtime:** resolve relative paths in MCP server ([ac55d5d](https://github.com/christian-marino-alvarez/agentic-workflow/commit/ac55d5dbf3737ee8c800267987bdea19ca124b48))

## [1.25.4-beta.4](https://github.com/christian-marino-alvarez/agentic-workflow/compare/agentic-workflow-v1.25.4-beta.3...agentic-workflow-v1.25.4-beta.4) (2026-02-03)

### Bug Fixes

* **templates:** propagate init template traceability fields into dist artifacts.
* **tasklifecycle-short:** ensure init workflow mapping is available in core snapshot.

## [1.25.4-beta.3](https://github.com/christian-marino-alvarez/agentic-workflow/compare/agentic-workflow-v1.25.3-beta.3...agentic-workflow-v1.25.4-beta.3) (2026-02-03)

### Bug Fixes

* **release:** prepare 1.25.3-beta.5 ([ac187f0](https://github.com/christian-marino-alvarez/agentic-workflow/commit/ac187f0ee65ad655d4fb7ef3620b205271a2f282))
* **release:** prepare 1.25.3-beta.5 ([a9b820e](https://github.com/christian-marino-alvarez/agentic-workflow/commit/a9b820e10cbcb8f91db4adccd62c7b62a43d2b99))

## [1.25.3-beta.5](https://github.com/christian-marino-alvarez/agentic-workflow/compare/agentic-workflow-v1.25.3-beta.4...agentic-workflow-v1.25.3-beta.5) (2026-02-03)

## [1.25.2-beta.5](https://github.com/christian-marino-alvarez/agentic-workflow/compare/agentic-workflow-v1.25.2-beta.4...agentic-workflow-v1.25.2-beta.5) (2026-02-03)

### Bug Fixes

* **workflows:** fix double frontmatter issue in `init.md` causing runtime failures.

<## [1.24.0-beta.3](https://github.com/christian-marino-alvarez/agentic-workflow/compare/agentic-workflow-v1.23.0-beta.3...agentic-workflow-v1.24.0-beta.3) (2026-02-03)

### Features

* **cli:** add register-mcp command for Antigravity and Codex integration ([a249a41](https://github.com/christian-marino-alvarez/agentic-workflow/commit/a249a412233fc14026b99c04b01eb771d796ddef))
* **constitution:** add runtime_integration constitution for MCP workflow integration ([fb7adf8](https://github.com/christian-marino-alvarez/agentic-workflow/commit/fb7adf875951dce53747f60ece03982397cef6b5))
* **governance:** release v1.22.0-beta.8 ([3834bb4](https://github.com/christian-marino-alvarez/agentic-workflow/commit/3834bb4593dcdb32f65ccb3b98c9f6da692296a0))
* **governance:** release v1.22.0-beta.8 - introduce modular skills system and runtime hardening ([f4458fa](https://github.com/christian-marino-alvarez/agentic-workflow/commit/f4458fa25357eb3202e3d464f601946e3818018e))
* implement global runtime logging and verification ([340fa95](https://github.com/christian-marino-alvarez/agentic-workflow/commit/340fa954b3f2b0e6fe7aa417a4f32c92b8d9650f))
* **mcp:** add runtime.next_step and runtime.get_state endpoints ([958e246](https://github.com/christian-marino-alvarez/agentic-workflow/commit/958e246b902ce1974a5abb29cceb80f394f48d67))
* Runtime Global Logging Implementation ([38110f4](https://github.com/christian-marino-alvarez/agentic-workflow/commit/38110f4a0fd4f0b15e67b69b86c639b3870841ff))
* **runtime:** expose next_step and implement granular execution service ([84c9af7](https://github.com/christian-marino-alvarez/agentic-workflow/commit/84c9af77bfa04d994942ab78281ed728d30cf55f))

### Bug Fixes

* **runtime:** add visible logging to MCP server startup and request handling ([077907a](https://github.com/christian-marino-alvarez/agentic-workflow/commit/077907aa0f2400c3c5607cf43b34fcefb6d38b3d))
* **runtime:** redirect engine logs to stderr to protect MCP stdout protocol ([50756d8](https://github.com/christian-marino-alvarez/agentic-workflow/commit/50756d8a8ab9bb88e0854f71f2ac9605aea6641c))

## [1.25.3-beta.4](https://github.com/christian-marino-alvarez/agentic-workflow/compare/agentic-workflow-v1.25.3-beta.3...agentic-workflow-v1.25.3-beta.4) (2026-02-03)

### Maintenance

* **release:** force patch release to distribute init.md fix (previously shadowed by 1.25.3-beta.3).

## [1.25.3-beta.3](https://github.com/christian-marino-alvarez/agentic-workflow/compare/agentic-workflow-v1.25.2-beta.3...agentic-workflow-v1.25.3-beta.3) (2026-02-03)


### Bug Fixes

* **runtime:** add global workflow fallback for phase resolution ([4be6ff3](https://github.com/christian-marino-alvarez/agentic-workflow/commit/4be6ff39dc13af0fde28b617c324c7ebb9d4571f))

## [1.25.2-beta.3](https://github.com/christian-marino-alvarez/agentic-workflow/compare/agentic-workflow-v1.25.1-beta.3...agentic-workflow-v1.25.2-beta.3) (2026-02-03)


### Bug Fixes

* **runtime:** resolve relative paths in MCP server ([e7fc272](https://github.com/christian-marino-alvarez/agentic-workflow/commit/e7fc272bbaa6a4d9f27614bf78be657c856e91b5))
* **runtime:** resolve relative paths in MCP server ([ac55d5d](https://github.com/christian-marino-alvarez/agentic-workflow/commit/ac55d5dbf3737ee8c800267987bdea19ca124b48))

## [1.25.1-beta.3](https://github.com/christian-marino-alvarez/agentic-workflow/compare/agentic-workflow-v1.25.0-beta.3...agentic-workflow-v1.25.1-beta.3) (2026-02-03)


### Bug Fixes

* **cli:** read version dynamically from package.json ([365b5ad](https://github.com/christian-marino-alvarez/agentic-workflow/commit/365b5ad16237247ce85aa7929fa1646fa6c1ce37))
* **cli:** read version dynamically from package.json ([ac4c9d5](https://github.com/christian-marino-alvarez/agentic-workflow/commit/ac4c9d52064c6f120f87509033bd33b51cffa6ef))

## [1.25.0-beta.3](https://github.com/christian-marino-alvarez/agentic-workflow/compare/agentic-workflow-v1.24.0-beta.3...agentic-workflow-v1.25.0-beta.3) (2026-02-03)


### Features

* **workflow:** align init.md with runtime_integration constitution ([e5d38c6](https://github.com/christian-marino-alvarez/agentic-workflow/commit/e5d38c6987f692d580761456311e117d1beb802a))
* **workflow:** align init.md with runtime_integration constitution ([f670f52](https://github.com/christian-marino-alvarez/agentic-workflow/commit/f670f5226e2d1a11eaf0b9c1d844c12fb0d25275))

## [1.22.0-beta.9](https://github.com/christian-marino-alvarez/agentic-workflow/compare/agentic-workflow-v1.22.0-beta.8...agentic-workflow-v1.22.0-beta.9) (2026-02-03)

### Maintenance

* **cli:** align static version string in `bin/cli.js` with `package.json`.

## [1.22.0-beta.8](https://github.com/christian-marino-alvarez/agentic-workflow/compare/agentic-workflow-v1.22.0-beta.7...agentic-workflow-v1.22.0-beta.8) (2026-02-03)

### Features

* **governance:** introduce modular "Governance Skills" (e.g., `skill.runtime-governance`) to encapsulate MCP traceability and auditing rules.
* **cli:** add support for creating system skills via `create skill <name>` command.
* **cli:** allow automatic creation of skill subdirectories and `SKILL.md` templates.
* **documentation:** comprehensive update of English and Spanish READMEs including domain indexing and lifecycle details.
* **architecture:** formalize Skills domain with dedicated indexing for alias-based loading.

### Bug Fixes

* **runtime:** fix task-loader inconsistency to correctly parse `phase.current` from both YAML frontmatter and internal blocks.
* **workflows:** synchronize `src/` core workflows with MCP traceability requirements and governance skill references.

## [1.22.0-beta.6](https://github.com/christian-marino-alvarez/agentic-workflow/compare/agentic-workflow-v1.22.0-beta.5...agentic-workflow-v1.22.0-beta.6) (2026-02-02)

### Features

* **runtime:** re-trigger release for logging features.

## [1.22.0-beta.5](https://github.com/christian-marino-alvarez/agentic-workflow/compare/agentic-workflow-v1.22.0-beta.4...agentic-workflow-v1.22.0-beta.5) (2026-02-02)

### Features

* **runtime:** add structured logging via log event.

## [1.23.0-beta.3](https://github.com/christian-marino-alvarez/agentic-workflow/compare/agentic-workflow-v1.22.0-beta.3...agentic-workflow-v1.23.0-beta.3) (2026-02-02)


### Features

* **runtime:** add MCP-governed engine ([f712346](https://github.com/christian-marino-alvarez/agentic-workflow/commit/f7123464487f849072fac3d2cf00d0aa5df52d08))

## [1.22.0-beta.4](https://github.com/christian-marino-alvarez/agentic-workflow/compare/agentic-workflow-v1.22.0-beta.3...agentic-workflow-v1.22.0-beta.4) (2026-02-02)

### Features

* **runtime:** add headless runtime engine with MCP governance, state persistence, and event stream.
* **cli:** support `init --start-mcp` to launch the MCP server after initialization.
* **testing:** add MCP smoke test script for end-to-end validation.

### Bug Fixes

* **workflows:** quote init workflow description for valid YAML parsing.
* **package:** include `dist/runtime` in npm files and keep CLI entrypoint aligned to runtime distribution.

### Maintenance

* **templates:** add front-matter and migrate agentic-system-structure markdowns for consistent parsing.
## [1.22.0-beta.3](https://github.com/christian-marino-alvarez/agentic-workflow/compare/agentic-workflow-v1.21.0-beta.3...agentic-workflow-v1.22.0-beta.3) (2026-02-02)


### Features

* add clean command for legacy MCP config ([e2220d3](https://github.com/christian-marino-alvarez/agentic-workflow/commit/e2220d35ef3ba86c726406f59c9226fc2cc4c903))
* add non-interactive init mode ([5b82d4b](https://github.com/christian-marino-alvarez/agentic-workflow/commit/5b82d4bec8102554dc0b20ca1dfe7c822325c869))
* add optional bootstrap bundle build ([bc14cdc](https://github.com/christian-marino-alvarez/agentic-workflow/commit/bc14cdc0726f89cdf97fc8e28e182421a4f4b9ef))
* add run_command tool to MCP server ([54d5ab0](https://github.com/christian-marino-alvarez/agentic-workflow/commit/54d5ab01c2a7252020556572692b50cfedac2b87))
* add test bootstrap bundle ([24611da](https://github.com/christian-marino-alvarez/agentic-workflow/commit/24611dacc069d2f06ba30dc348da67d0304619e3))
* align constitution aliases ([dbf339c](https://github.com/christian-marino-alvarez/agentic-workflow/commit/dbf339c54ed62477f38199c58a8a1f534fc0826c))
* align init aliases ([05f7dac](https://github.com/christian-marino-alvarez/agentic-workflow/commit/05f7dacc0355781f3d9a8d0d91725373459230f3))
* clean dist before build ([2a46570](https://github.com/christian-marino-alvarez/agentic-workflow/commit/2a46570be3859cbc48c66eb8ab6c57748a903681))
* **extension:** add activity bar webview shell ([f444d5c](https://github.com/christian-marino-alvarez/agentic-workflow/commit/f444d5c5c1c3256dcfc629394b44d359f2cc965b))
* **extension:** scaffold vscode-agentinc ([f6b54d6](https://github.com/christian-marino-alvarez/agentic-workflow/commit/f6b54d6db3a92ac80b5f1d913de482bfaf24f20d))
* **identity:** add premium SVG icons and update identity rules ([2e4460b](https://github.com/christian-marino-alvarez/agentic-workflow/commit/2e4460b00d048f26a7c0ed1cf6ca1130952277bd))
* init uses bootstrap alias without bootstrap tool ([30b2bda](https://github.com/christian-marino-alvarez/agentic-workflow/commit/30b2bdacfeb41794c04eec4ea91ad3be0c20f5db))
* initial commit (agentic-workflow core) ([3eed177](https://github.com/christian-marino-alvarez/agentic-workflow/commit/3eed1775b76a260174ab6355379b371c8db62ac9))
* prebuild core bootstrap bundle ([7ec0fb8](https://github.com/christian-marino-alvarez/agentic-workflow/commit/7ec0fb8ae70a8cc882bb935dec55af1164acdf60))
* remove MCP and simplify bootstrap ([b3d31ad](https://github.com/christian-marino-alvarez/agentic-workflow/commit/b3d31ad2353bbdb362c6a2599a2d1395d1ec612f))
* require explicit gate confirmation ([ef1e62b](https://github.com/christian-marino-alvarez/agentic-workflow/commit/ef1e62b4243ea342741d32ddf9ce0319b8aac0df))
* reset core content to extensio backup baseline ([c5e6b03](https://github.com/christian-marino-alvarez/agentic-workflow/commit/c5e6b03780ea0e601701c284d6a98ec5ad3e4c77))
* simplify init and add clarification questions ([cb24916](https://github.com/christian-marino-alvarez/agentic-workflow/commit/cb2491644380b8bb1ce56082619b43303268bf96))
* **vscode-extension:** add Lit core base, CSP fixes, logging, and setup view ([546444b](https://github.com/christian-marino-alvarez/agentic-workflow/commit/546444bab7a9b9f2d0ee44585cd026da5ca30ab5))


### Bug Fixes

* **build:** exclude vscode extension from build ([6104370](https://github.com/christian-marino-alvarez/agentic-workflow/commit/610437024b286428a7cd56964291a2ee5928906f))
* **cli:** handle null backup on reinit ([61fb7a5](https://github.com/christian-marino-alvarez/agentic-workflow/commit/61fb7a55496f435f75c0f93ef36278650cdfd3f1))
* **cli:** handle null backup on reinit ([19fd617](https://github.com/christian-marino-alvarez/agentic-workflow/commit/19fd617b30406c4447a6bbf03bbd3d5f2ecc863d))
* **extension:** add lit and openai dependencies ([2eca134](https://github.com/christian-marino-alvarez/agentic-workflow/commit/2eca1349c206169adcc1865f3ee35436dbfe86a1))
* **extension:** render mainView webview ([84d8a0c](https://github.com/christian-marino-alvarez/agentic-workflow/commit/84d8a0c2b148b43b63c11817d30221d58a46add1))
* **extension:** render mainView webview ([eba8643](https://github.com/christian-marino-alvarez/agentic-workflow/commit/eba864391126f2f518d6083c2b8931573b5c9b53))
* **identity:** revert to standard markdown-compatible icons ([a6df583](https://github.com/christian-marino-alvarez/agentic-workflow/commit/a6df583cbe9acd6eef322019d8f66a51b186abe5))
* **init:** copy core into local .agent ([07a265d](https://github.com/christian-marino-alvarez/agentic-workflow/commit/07a265d7973525e708c0e55b3eb244f8090dd873))
* remove self-dependency and fix vulnerabilities with overrides ([c21cde3](https://github.com/christian-marino-alvarez/agentic-workflow/commit/c21cde3905623f9731caf12c3d2453a44e3aabd4))
* resolve conflicts for release branch 1.18.4-beta.2 ([3ac83de](https://github.com/christian-marino-alvarez/agentic-workflow/commit/3ac83de2cc4a3a62073d0829f56cc992770622ad))
* resolve conflicts for release-please PR 43 ([af4c7f9](https://github.com/christian-marino-alvarez/agentic-workflow/commit/af4c7f9fb6a1e1277e2adfa60b422886dac04594))
* resolve merge conflicts in CHANGELOG and package files ([089de5c](https://github.com/christian-marino-alvarez/agentic-workflow/commit/089de5ce34fdf29f8e7048dc1714b91b09c5fb76))
* restore standard .agent paths for customer installation ([555dce5](https://github.com/christian-marino-alvarez/agentic-workflow/commit/555dce5a8c4c35421f8dd381c4c44da52b58f98c))

## [1.21.0-beta.3](https://github.com/christian-marino-alvarez/agentic-workflow/compare/agentic-workflow-v1.21.0-beta.2...agentic-workflow-v1.21.0-beta.3) (2026-02-02)

### Bug Fixes

* **package:** include dist/infrastructure in npm files to fix init on beta installs.

## [1.21.0-beta.2](https://github.com/christian-marino-alvarez/agentic-workflow/compare/agentic-workflow-v1.21.0-beta.1...agentic-workflow-v1.21.0-beta.2) (2026-02-02)

### Bug Fixes

* **extension:** add lit and openai dependencies to fix TypeScript module resolution.
* **build:** exclude VSCode extension from `npm run build`.

## [1.21.0-beta.1](https://github.com/christian-marino-alvarez/agentic-workflow/compare/agentic-workflow-v1.20.2-beta.1...agentic-workflow-v1.21.0-beta.1) (2026-02-02)


### Features

* add clean command for legacy MCP config ([e2220d3](https://github.com/christian-marino-alvarez/agentic-workflow/commit/e2220d35ef3ba86c726406f59c9226fc2cc4c903))
* add non-interactive init mode ([5b82d4b](https://github.com/christian-marino-alvarez/agentic-workflow/commit/5b82d4bec8102554dc0b20ca1dfe7c822325c869))
* add optional bootstrap bundle build ([bc14cdc](https://github.com/christian-marino-alvarez/agentic-workflow/commit/bc14cdc0726f89cdf97fc8e28e182421a4f4b9ef))
* add run_command tool to MCP server ([54d5ab0](https://github.com/christian-marino-alvarez/agentic-workflow/commit/54d5ab01c2a7252020556572692b50cfedac2b87))
* add test bootstrap bundle ([24611da](https://github.com/christian-marino-alvarez/agentic-workflow/commit/24611dacc069d2f06ba30dc348da67d0304619e3))
* align constitution aliases ([dbf339c](https://github.com/christian-marino-alvarez/agentic-workflow/commit/dbf339c54ed62477f38199c58a8a1f534fc0826c))
* align init aliases ([05f7dac](https://github.com/christian-marino-alvarez/agentic-workflow/commit/05f7dacc0355781f3d9a8d0d91725373459230f3))
* clean dist before build ([2a46570](https://github.com/christian-marino-alvarez/agentic-workflow/commit/2a46570be3859cbc48c66eb8ab6c57748a903681))
* **extension:** add activity bar webview shell ([f444d5c](https://github.com/christian-marino-alvarez/agentic-workflow/commit/f444d5c5c1c3256dcfc629394b44d359f2cc965b))
* **extension:** scaffold vscode-agentinc ([f6b54d6](https://github.com/christian-marino-alvarez/agentic-workflow/commit/f6b54d6db3a92ac80b5f1d913de482bfaf24f20d))
* **identity:** add premium SVG icons and update identity rules ([2e4460b](https://github.com/christian-marino-alvarez/agentic-workflow/commit/2e4460b00d048f26a7c0ed1cf6ca1130952277bd))
* init uses bootstrap alias without bootstrap tool ([30b2bda](https://github.com/christian-marino-alvarez/agentic-workflow/commit/30b2bdacfeb41794c04eec4ea91ad3be0c20f5db))
* initial commit (agentic-workflow core) ([3eed177](https://github.com/christian-marino-alvarez/agentic-workflow/commit/3eed1775b76a260174ab6355379b371c8db62ac9))
* prebuild core bootstrap bundle ([7ec0fb8](https://github.com/christian-marino-alvarez/agentic-workflow/commit/7ec0fb8ae70a8cc882bb935dec55af1164acdf60))
* remove MCP and simplify bootstrap ([b3d31ad](https://github.com/christian-marino-alvarez/agentic-workflow/commit/b3d31ad2353bbdb362c6a2599a2d1395d1ec612f))
* require explicit gate confirmation ([ef1e62b](https://github.com/christian-marino-alvarez/agentic-workflow/commit/ef1e62b4243ea342741d32ddf9ce0319b8aac0df))
* reset core content to extensio backup baseline ([c5e6b03](https://github.com/christian-marino-alvarez/agentic-workflow/commit/c5e6b03780ea0e601701c284d6a98ec5ad3e4c77))
* simplify init and add clarification questions ([cb24916](https://github.com/christian-marino-alvarez/agentic-workflow/commit/cb2491644380b8bb1ce56082619b43303268bf96))

### Bug Fixes

* **vscode-extension:** add Lit core base, CSP fixes, logging, and setup view ([546444b](https://github.com/christian-marino-alvarez/agentic-workflow/commit/546444bab7a9b9f2d0ee44585cd026da5ca30ab5))


### Bug Fixes

* **cli:** handle null backup on reinit ([61fb7a5](https://github.com/christian-marino-alvarez/agentic-workflow/commit/61fb7a55496f435f75c0f93ef36278650cdfd3f1))
* **cli:** handle null backup on reinit ([19fd617](https://github.com/christian-marino-alvarez/agentic-workflow/commit/19fd617b30406c4447a6bbf03bbd3d5f2ecc863d))
* **extension:** render mainView webview ([84d8a0c](https://github.com/christian-marino-alvarez/agentic-workflow/commit/84d8a0c2b148b43b63c11817d30221d58a46add1))
* **extension:** render mainView webview ([eba8643](https://github.com/christian-marino-alvarez/agentic-workflow/commit/eba864391126f2f518d6083c2b8931573b5c9b53))
* **identity:** revert to standard markdown-compatible icons ([a6df583](https://github.com/christian-marino-alvarez/agentic-workflow/commit/a6df583cbe9acd6eef322019d8f66a51b186abe5))
* **init:** copy core into local .agent ([07a265d](https://github.com/christian-marino-alvarez/agentic-workflow/commit/07a265d7973525e708c0e55b3eb244f8090dd873))
* remove self-dependency and fix vulnerabilities with overrides ([c21cde3](https://github.com/christian-marino-alvarez/agentic-workflow/commit/c21cde3905623f9731caf12c3d2453a44e3aabd4))
* resolve conflicts for release branch 1.18.4-beta.2 ([3ac83de](https://github.com/christian-marino-alvarez/agentic-workflow/commit/3ac83de2cc4a3a62073d0829f56cc992770622ad))
* resolve conflicts for release-please PR 43 ([af4c7f9](https://github.com/christian-marino-alvarez/agentic-workflow/commit/af4c7f9fb6a1e1277e2adfa60b422886dac04594))
* resolve merge conflicts in CHANGELOG and package files ([089de5c](https://github.com/christian-marino-alvarez/agentic-workflow/commit/089de5ce34fdf29f8e7048dc1714b91b09c5fb76))
* restore standard .agent paths for customer installation ([555dce5](https://github.com/christian-marino-alvarez/agentic-workflow/commit/555dce5a8c4c35421f8dd381c4c44da52b58f98c))

## [1.20.2-beta.1](https://github.com/christian-marino-alvarez/agentic-workflow/compare/agentic-workflow-v1.20.1...agentic-workflow-v1.20.2-beta.1) (2026-02-02)

### Refactor
* **agent:** remove GEMINI constitution references and normalize tasklifecycle alias namespace.

### Bug Fixes
* **cli:** resolve installed core using @christianmaf80 scope.

## [1.20.1](https://github.com/christian-marino-alvarez/agentic-workflow/compare/agentic-workflow-v1.20.0...agentic-workflow-v1.20.1) (2026-01-30)


### Bug Fixes

* **extension:** render mainView webview ([84d8a0c](https://github.com/christian-marino-alvarez/agentic-workflow/commit/84d8a0c2b148b43b63c11817d30221d58a46add1))
* **extension:** render mainView webview ([eba8643](https://github.com/christian-marino-alvarez/agentic-workflow/commit/eba864391126f2f518d6083c2b8931573b5c9b53))

## [1.20.0](https://github.com/christian-marino-alvarez/agentic-workflow/compare/agentic-workflow-v1.19.1...agentic-workflow-v1.20.0) (2026-01-30)


### Features

* add clean command for legacy MCP config ([e2220d3](https://github.com/christian-marino-alvarez/agentic-workflow/commit/e2220d35ef3ba86c726406f59c9226fc2cc4c903))
* add non-interactive init mode ([5b82d4b](https://github.com/christian-marino-alvarez/agentic-workflow/commit/5b82d4bec8102554dc0b20ca1dfe7c822325c869))
* add optional bootstrap bundle build ([bc14cdc](https://github.com/christian-marino-alvarez/agentic-workflow/commit/bc14cdc0726f89cdf97fc8e28e182421a4f4b9ef))
* add run_command tool to MCP server ([54d5ab0](https://github.com/christian-marino-alvarez/agentic-workflow/commit/54d5ab01c2a7252020556572692b50cfedac2b87))
* add test bootstrap bundle ([24611da](https://github.com/christian-marino-alvarez/agentic-workflow/commit/24611dacc069d2f06ba30dc348da67d0304619e3))
* align constitution aliases ([dbf339c](https://github.com/christian-marino-alvarez/agentic-workflow/commit/dbf339c54ed62477f38199c58a8a1f534fc0826c))
* align init aliases ([05f7dac](https://github.com/christian-marino-alvarez/agentic-workflow/commit/05f7dacc0355781f3d9a8d0d91725373459230f3))
* clean dist before build ([2a46570](https://github.com/christian-marino-alvarez/agentic-workflow/commit/2a46570be3859cbc48c66eb8ab6c57748a903681))
* **extension:** add activity bar webview shell ([f444d5c](https://github.com/christian-marino-alvarez/agentic-workflow/commit/f444d5c5c1c3256dcfc629394b44d359f2cc965b))
* **extension:** scaffold vscode-agentinc ([f6b54d6](https://github.com/christian-marino-alvarez/agentic-workflow/commit/f6b54d6db3a92ac80b5f1d913de482bfaf24f20d))
* **identity:** add premium SVG icons and update identity rules ([2e4460b](https://github.com/christian-marino-alvarez/agentic-workflow/commit/2e4460b00d048f26a7c0ed1cf6ca1130952277bd))
* init uses bootstrap alias without bootstrap tool ([30b2bda](https://github.com/christian-marino-alvarez/agentic-workflow/commit/30b2bdacfeb41794c04eec4ea91ad3be0c20f5db))
* initial commit (agentic-workflow core) ([3eed177](https://github.com/christian-marino-alvarez/agentic-workflow/commit/3eed1775b76a260174ab6355379b371c8db62ac9))
* prebuild core bootstrap bundle ([7ec0fb8](https://github.com/christian-marino-alvarez/agentic-workflow/commit/7ec0fb8ae70a8cc882bb935dec55af1164acdf60))
* remove MCP and simplify bootstrap ([b3d31ad](https://github.com/christian-marino-alvarez/agentic-workflow/commit/b3d31ad2353bbdb362c6a2599a2d1395d1ec612f))
* require explicit gate confirmation ([ef1e62b](https://github.com/christian-marino-alvarez/agentic-workflow/commit/ef1e62b4243ea342741d32ddf9ce0319b8aac0df))
* reset core content to extensio backup baseline ([c5e6b03](https://github.com/christian-marino-alvarez/agentic-workflow/commit/c5e6b03780ea0e601701c284d6a98ec5ad3e4c77))
* simplify init and add clarification questions ([cb24916](https://github.com/christian-marino-alvarez/agentic-workflow/commit/cb2491644380b8bb1ce56082619b43303268bf96))


### Bug Fixes

* **cli:** handle null backup on reinit ([61fb7a5](https://github.com/christian-marino-alvarez/agentic-workflow/commit/61fb7a55496f435f75c0f93ef36278650cdfd3f1))
* **cli:** handle null backup on reinit ([19fd617](https://github.com/christian-marino-alvarez/agentic-workflow/commit/19fd617b30406c4447a6bbf03bbd3d5f2ecc863d))
* **identity:** revert to standard markdown-compatible icons ([a6df583](https://github.com/christian-marino-alvarez/agentic-workflow/commit/a6df583cbe9acd6eef322019d8f66a51b186abe5))
* **init:** copy core into local .agent ([07a265d](https://github.com/christian-marino-alvarez/agentic-workflow/commit/07a265d7973525e708c0e55b3eb244f8090dd873))
* remove self-dependency and fix vulnerabilities with overrides ([c21cde3](https://github.com/christian-marino-alvarez/agentic-workflow/commit/c21cde3905623f9731caf12c3d2453a44e3aabd4))
* resolve conflicts for release branch 1.18.4-beta.2 ([3ac83de](https://github.com/christian-marino-alvarez/agentic-workflow/commit/3ac83de2cc4a3a62073d0829f56cc992770622ad))
* resolve conflicts for release-please PR 43 ([af4c7f9](https://github.com/christian-marino-alvarez/agentic-workflow/commit/af4c7f9fb6a1e1277e2adfa60b422886dac04594))
* resolve merge conflicts in CHANGELOG and package files ([089de5c](https://github.com/christian-marino-alvarez/agentic-workflow/commit/089de5ce34fdf29f8e7048dc1714b91b09c5fb76))
* restore standard .agent paths for customer installation ([555dce5](https://github.com/christian-marino-alvarez/agentic-workflow/commit/555dce5a8c4c35421f8dd381c4c44da52b58f98c))

## [1.19.1] (2026-01-30)

### Features
* **VSCode**: Activity bar view with webview scaffold and icon.
* **Distribution**: Agent markdown assets moved under `dist/agent` and mirror `src/agent` removed.

### Fixes
* **Core**: Resolver updated to locate agent assets in `dist/agent`.

## [1.19.1-beta.10](https://github.com/christian-marino-alvarez/agentic-workflow/compare/agentic-workflow-v1.19.0-beta.10...agentic-workflow-v1.19.1-beta.10) (2026-01-30)


### Bug Fixes

* **cli:** handle null backup on reinit ([61fb7a5](https://github.com/christian-marino-alvarez/agentic-workflow/commit/61fb7a55496f435f75c0f93ef36278650cdfd3f1))
* **cli:** handle null backup on reinit ([19fd617](https://github.com/christian-marino-alvarez/agentic-workflow/commit/19fd617b30406c4447a6bbf03bbd3d5f2ecc863d))

## [1.19.0-beta.13] (2026-01-30)

### Bug Fixes
* **cli:** handle null backup result during re-initialization.

## [1.19.0-beta.12] (2026-01-30)

### CI/CD
* **Publish**: Prepare beta release via ci/publish workflow.


## [1.19.0-beta.10](https://github.com/christian-marino-alvarez/agentic-workflow/compare/agentic-workflow-v1.18.4-beta.10...agentic-workflow-v1.19.0-beta.10) (2026-01-29)

### Features
* **identity:** add premium SVG icons and update identity rules ([2e4460b](https://github.com/christian-marino-alvarez/agentic-workflow/commit/2e4460b00d048f26a7c0ed1cf6ca1130952277bd))

### Bug Fixes
* **identity:** revert to standard markdown-compatible icons ([a6df583](https://github.com/christian-marino-alvarez/agentic-workflow/commit/a6df583cbe9acd6eef322019d8f66a51b186abe5))

## [1.18.4-beta.18] (2026-01-29)

### Documentation
* **README**: Add instructions for bootstrapping the system via chat command.

## [1.18.4-beta.17] (2026-01-29)

### Identity
* **Icons**: Revert to standard markdown-compatible icons (🏛️, 🛡️, 🔍, 🤖) for maximum chat compatibility.

## [1.18.4-beta.10](https://github.com/christian-marino-alvarez/agentic-workflow/compare/agentic-workflow-v1.18.3-beta.10...agentic-workflow-v1.18.4-beta.10) (2026-01-29)

### CI/CD
* **Trusted Publishing**: Fully migrate to OIDC and Provenance.
* **Release**: Synchronize release-please with manual releases.

## [1.18.4-beta.3] (2026-01-29)

### CI/CD
* **Trusted Publishing**: Fully migrate to OIDC and Provenance.

## [1.18.4-beta.2] (2026-01-29)

### CI/CD
* **Publishing**: Enable OIDC and Trusted Publishing for npm.

## [1.18.4-beta.1] (2026-01-29)

### Refactor
* **Structure**: Reorganize agentic system structure and centralize backups.
* **CLI**: Update `init` command for new structure and standard `.agent` paths.
* **VSCode**: Update extension name and activation events.

## [1.18.2-beta.10](https://github.com/christian-marino-alvarez/agentic-workflow/compare/agentic-workflow-v1.18.1-beta.10...agentic-workflow-v1.18.2-beta.10) (2026-01-28)

### Bug Fixes
* restore standard .agent paths for customer installation ([555dce5](https://github.com/christian-marino-alvarez/agentic-workflow/commit/555dce5a8c4c35421f8dd381c4c44da52b58f98c))

## [1.18.3] (2026-01-28)

### Features
* **Stable**: Full release following internal protocol.

## [1.18.1](https://github.com/christian-marino-alvarez/agentic-workflow/compare/v1.18.0-beta.11...v1.18.1) (2026-01-28)

### Features
* **Core**: Stable release with flattened architecture and security hardening.
* **CLI**: Portable system with `init`, `create`, `restore`, and `clean` commands.
* **VSCode**: Prepared for VSCode extension integration.

### Bug Fixes
* **Security**: Remove self-dependency and fix vulnerabilities with overrides.

## [1.18.1-beta.10](https://github.com/christian-marino-alvarez/agentic-workflow/compare/agentic-workflow-v1.18.0-beta.10...agentic-workflow-v1.18.1-beta.10) (2026-01-27)

### Bug Fixes
* remove self-dependency and fix vulnerabilities with overrides ([c21cde3](https://github.com/christian-marino-alvarez/agentic-workflow/commit/c21cde3905623f9731caf12c3d2453a44e3aabd4))

## [1.18.0-beta.11](https://github.com/christian-marino-alvarez/agentic-workflow/compare/agentic-workflow-v1.18.0-beta.10...v1.18.0-beta.11) (2026-01-28)

### Refactor
* reestructurar src para extension vscode ([0de9db2](https://github.com/christian-marino-alvarez/agentic-workflow/commit/0de9db2))

## [1.18.0-beta.10](https://github.com/christian-marino-alvarez/agentic-workflow/compare/agentic-workflow-v1.17.0-beta.10...agentic-workflow-v1.18.0-beta.10) (2026-01-25)
