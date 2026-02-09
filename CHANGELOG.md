# Changelog

## [1.41.0-beta.9](https://github.com/christian-marino-alvarez/agentic-workflow/compare/agentic-workflow-v1.40.1-beta.9...agentic-workflow-v1.41.0-beta.9) (2026-02-09)


### Features

* **security:** implement multi-environment secrets and chat refactor ([40e3865](https://github.com/christian-marino-alvarez/agentic-workflow/commit/40e3865d1c1a12d29968ee1835094ffd536a40a8))
* **security:** implement multi-environment secrets and chat refactor ([c444f7c](https://github.com/christian-marino-alvarez/agentic-workflow/commit/c444f7cd7e871ea2216f876ae210c77cfb33b5d9))

## [1.40.1-beta.9](https://github.com/christian-marino-alvarez/agentic-workflow/compare/agentic-workflow-v1.40.0-beta.9...agentic-workflow-v1.40.1-beta.9) (2026-02-08)


### Bug Fixes

* adjust test coverage scope and setup-router test ([febf28d](https://github.com/christian-marino-alvarez/agentic-workflow/commit/febf28d2ab04683c421776755d422e361434fa00))

## [1.40.0-beta.9](https://github.com/christian-marino-alvarez/agentic-workflow/compare/agentic-workflow-v1.39.0-beta.9...agentic-workflow-v1.40.0-beta.9) (2026-02-08)


### Features

* **agent-poc:** add openai agents sdk poc and stabilize extension host ([d421fe7](https://github.com/christian-marino-alvarez/agentic-workflow/commit/d421fe7f2270499fadbfad92dc8f3dc51a1c3b00))
* **agent/poc:** implement OpenAI Agents SDK integration in VS Code extension ([7605f8f](https://github.com/christian-marino-alvarez/agentic-workflow/commit/7605f8f8b21fe1f1f051524376f199937ff1f342))
* **setup:** implement modular multi-provider LLM schemas and secret management ([1f7b4f3](https://github.com/christian-marino-alvarez/agentic-workflow/commit/1f7b4f343a9d4d3495950f76fc603332ce9ffe24))
* **setup:** implement modular setup UI with OOCSS architecture (T003/T004) ([333e3c2](https://github.com/christian-marino-alvarez/agentic-workflow/commit/333e3c2a38e43293b2f398efc6c3d99538b6c5cd))
* **setup:** implement SettingsStorage facade for Memento API persistence (T003) ([cf08faf](https://github.com/christian-marino-alvarez/agentic-workflow/commit/cf08faf6feeb665ea33f6c73920d17d5e746b6fa))
* **spike:** complete Node.js compatibility spike (T001) ([829ada2](https://github.com/christian-marino-alvarez/agentic-workflow/commit/829ada20f3d7de2caec03e7de10fa81166120160))

## [1.39.0-beta.9](https://github.com/christian-marino-alvarez/agentic-workflow/compare/agentic-workflow-v1.38.0-beta.9...agentic-workflow-v1.39.0-beta.9) (2026-02-05)


### Features

* update runtime governance, init workflow and add dev guide ([02f4dc1](https://github.com/christian-marino-alvarez/agentic-workflow/commit/02f4dc1f292550b4ea57999babba1b4968798e6a))


### Bug Fixes

* rename mcp tools to use underscores ([30c0850](https://github.com/christian-marino-alvarez/agentic-workflow/commit/30c0850ecfb6857e555cc00c67211d0f33224cf7))
* rename mcp tools to use underscores to satisfy regex validation ([2839541](https://github.com/christian-marino-alvarez/agentic-workflow/commit/28395410e32a81182a4c15d43d14851670916ee6))

## [1.38.0-beta.10](https://github.com/christian-marino-alvarez/agentic-workflow/compare/agentic-workflow-v1.38.0-beta.9...agentic-workflow-v1.38.0-beta.10) (2026-02-05)


### Bug Fixes

* **mcp:** rename tool definitions to use underscores to satisfy regex validation (e.g. `runtime.run` -> `runtime_run`)


## [1.38.0-beta.9](https://github.com/christian-marino-alvarez/agentic-workflow/compare/agentic-workflow-v1.37.0-beta.9...agentic-workflow-v1.38.0-beta.9) (2026-02-05)


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
* **init:** add --workspace support ([e27509f](https://github.com/christian-marino-alvarez/agentic-workflow/commit/e27509f70b60d2a1ca3f4c3026ac404b73c1048a))
* **init:** add non-interactive aliases ([d607431](https://github.com/christian-marino-alvarez/agentic-workflow/commit/d607431f2653f882e6dfa234413a16dc20cd8834))
* **init:** enforce workflow and role overwrite ([484a990](https://github.com/christian-marino-alvarez/agentic-workflow/commit/484a990ab95d50aedf72ac4ccbecdbbd346efa6b))
* initial commit (agentic-workflow core) ([3eed177](https://github.com/christian-marino-alvarez/agentic-workflow/commit/3eed1775b76a260174ab6355379b371c8db62ac9))
* **init:** persist workspace for mcp ([4a13588](https://github.com/christian-marino-alvarez/agentic-workflow/commit/4a13588c8dca756b78463a2125d2ee55b7aaeb6a))
* mcp refactor and distribution flow ([59bc352](https://github.com/christian-marino-alvarez/agentic-workflow/commit/59bc3529f7375ed9bd76b9e0bc45cd9d2c0f8f20))
* **mcp:** add --workspace flag ([b63a017](https://github.com/christian-marino-alvarez/agentic-workflow/commit/b63a017d15f1a9289c995996ccbd94d8d3e583d0))
* **mcp:** add resources list endpoints ([3badd6b](https://github.com/christian-marino-alvarez/agentic-workflow/commit/3badd6b8f6dbe8e38e7cfdd765af627c5897d639))
* **mcp:** add resources list endpoints ([f35d8a6](https://github.com/christian-marino-alvarez/agentic-workflow/commit/f35d8a6dfbe081be7377228a1e261637f4315aff))
* **mcp:** add resources list endpoints ([d75307f](https://github.com/christian-marino-alvarez/agentic-workflow/commit/d75307f1b70e14a9cde84e886a914826a0933410))
* **mcp:** add runtime.next_step and runtime.get_state endpoints ([958e246](https://github.com/christian-marino-alvarez/agentic-workflow/commit/958e246b902ce1974a5abb29cceb80f394f48d67))
* **mcp:** force local cli for registration ([a5b1f52](https://github.com/christian-marino-alvarez/agentic-workflow/commit/a5b1f52fb3fe224c2b22c33a14e05f7afd3d600c))
* **mcp:** log workspace context per tool call ([83f9961](https://github.com/christian-marino-alvarez/agentic-workflow/commit/83f99619a565a272e1345f519bb2bb02ef69a2cc))
* **mcp:** report package version on startup ([ec97aff](https://github.com/christian-marino-alvarez/agentic-workflow/commit/ec97aff5600d5d3e673f62edfe1b318b79922b2d))
* prebuild core bootstrap bundle ([7ec0fb8](https://github.com/christian-marino-alvarez/agentic-workflow/commit/7ec0fb8ae70a8cc882bb935dec55af1164acdf60))
* remove MCP and simplify bootstrap ([b3d31ad](https://github.com/christian-marino-alvarez/agentic-workflow/commit/b3d31ad2353bbdb362c6a2599a2d1395d1ec612f))
* require explicit gate confirmation ([ef1e62b](https://github.com/christian-marino-alvarez/agentic-workflow/commit/ef1e62b4243ea342741d32ddf9ce0319b8aac0df))
* reset core content to extensio backup baseline ([c5e6b03](https://github.com/christian-marino-alvarez/agentic-workflow/commit/c5e6b03780ea0e601701c284d6a98ec5ad3e4c77))
* Runtime Global Logging Implementation ([38110f4](https://github.com/christian-marino-alvarez/agentic-workflow/commit/38110f4a0fd4f0b15e67b69b86c639b3870841ff))
* **runtime:** add MCP-governed engine ([f712346](https://github.com/christian-marino-alvarez/agentic-workflow/commit/f7123464487f849072fac3d2cf00d0aa5df52d08))
* **runtime:** add structured logging via log event ([e363847](https://github.com/christian-marino-alvarez/agentic-workflow/commit/e363847dbe226d18b4976116fa1f1e5c871ef5fd))
* **runtime:** enforce write guard and reconcile ([7b7c494](https://github.com/christian-marino-alvarez/agentic-workflow/commit/7b7c494c21353bf33124bcd72b306d3e249b2805))
* **runtime:** expose next_step and implement granular execution service ([84c9af7](https://github.com/christian-marino-alvarez/agentic-workflow/commit/84c9af77bfa04d994942ab78281ed728d30cf55f))
* **runtime:** sync frontmatter ([e1d1812](https://github.com/christian-marino-alvarez/agentic-workflow/commit/e1d1812825632eb488bed4bf866e893e607db338))
* simplify init and add clarification questions ([cb24916](https://github.com/christian-marino-alvarez/agentic-workflow/commit/cb2491644380b8bb1ce56082619b43303268bf96))
* **vscode-extension:** add Lit core base, CSP fixes, logging, and setup view ([546444b](https://github.com/christian-marino-alvarez/agentic-workflow/commit/546444bab7a9b9f2d0ee44585cd026da5ca30ab5))
* **workflow:** align init.md with runtime_integration constitution ([e5d38c6](https://github.com/christian-marino-alvarez/agentic-workflow/commit/e5d38c6987f692d580761456311e117d1beb802a))
* **workflow:** align init.md with runtime_integration constitution ([f670f52](https://github.com/christian-marino-alvarez/agentic-workflow/commit/f670f5226e2d1a11eaf0b9c1d844c12fb0d25275))
* **workflow:** derive implementation owner from brief ([ea5ae9f](https://github.com/christian-marino-alvarez/agentic-workflow/commit/ea5ae9fac566802b9c2f85c6a53ea1b20f0c8128))
* **workflows:** update short lifecycle to 4 phases ([30d2a84](https://github.com/christian-marino-alvarez/agentic-workflow/commit/30d2a84608a08c161fb7ea69d0b18c30bd26852c))
>>>>>>> origin/develop


### Bug Fixes

<<<<<<< HEAD
* **mcp:** rename tool definitions to use underscores to satisfy regex validation (e.g. `runtime.run` -> `runtime_run`)
=======
* align init owner with architect-agent ([820fc3c](https://github.com/christian-marino-alvarez/agentic-workflow/commit/820fc3cd9b271d56064e7013f8f32b22481cb853))
* **build:** exclude vscode extension from build ([6104370](https://github.com/christian-marino-alvarez/agentic-workflow/commit/610437024b286428a7cd56964291a2ee5928906f))
* **cli:** handle null backup on reinit ([61fb7a5](https://github.com/christian-marino-alvarez/agentic-workflow/commit/61fb7a55496f435f75c0f93ef36278650cdfd3f1))
* **cli:** handle null backup on reinit ([19fd617](https://github.com/christian-marino-alvarez/agentic-workflow/commit/19fd617b30406c4447a6bbf03bbd3d5f2ecc863d))
* **cli:** overwrite workflows on init ([21551b6](https://github.com/christian-marino-alvarez/agentic-workflow/commit/21551b6998e0580638c1387bba78284ec3a7a66f))
* **cli:** read version dynamically from package.json ([365b5ad](https://github.com/christian-marino-alvarez/agentic-workflow/commit/365b5ad16237247ce85aa7929fa1646fa6c1ce37))
* **cli:** read version dynamically from package.json ([ac4c9d5](https://github.com/christian-marino-alvarez/agentic-workflow/commit/ac4c9d52064c6f120f87509033bd33b51cffa6ef))
* **extension:** add lit and openai dependencies ([2eca134](https://github.com/christian-marino-alvarez/agentic-workflow/commit/2eca1349c206169adcc1865f3ee35436dbfe86a1))
* **extension:** render mainView webview ([84d8a0c](https://github.com/christian-marino-alvarez/agentic-workflow/commit/84d8a0c2b148b43b63c11817d30221d58a46add1))
* **extension:** render mainView webview ([eba8643](https://github.com/christian-marino-alvarez/agentic-workflow/commit/eba864391126f2f518d6083c2b8931573b5c9b53))
* **identity:** revert to standard markdown-compatible icons ([a6df583](https://github.com/christian-marino-alvarez/agentic-workflow/commit/a6df583cbe9acd6eef322019d8f66a51b186abe5))
* **init:** align init template owner with architect-agent ([d5e8468](https://github.com/christian-marino-alvarez/agentic-workflow/commit/d5e8468ac2038db2c00272f2f524ed3c084562cb))
* **init:** align init workflow with timestamp candidates ([8cfea58](https://github.com/christian-marino-alvarez/agentic-workflow/commit/8cfea587ebeddeb8d4345813e46cf00fb09b1c99))
* **init:** copy core into local .agent ([07a265d](https://github.com/christian-marino-alvarez/agentic-workflow/commit/07a265d7973525e708c0e55b3eb244f8090dd873))
* **init:** normalize runtime.run candidate path ([bc11c79](https://github.com/christian-marino-alvarez/agentic-workflow/commit/bc11c799277cec46f22ee20bc7fcec31d0578acf))
* **init:** remove legacy init flow ([08dbcb0](https://github.com/christian-marino-alvarez/agentic-workflow/commit/08dbcb0c559005c65298b46edf03728ff9c3eaaf))
* **init:** resolve workspace and quote owner ([ab94a01](https://github.com/christian-marino-alvarez/agentic-workflow/commit/ab94a01a1fbb8cae0fbcf371c3a9e0579fa4d50a))
* **init:** scaffold skills ([a8a87bf](https://github.com/christian-marino-alvarez/agentic-workflow/commit/a8a87bf1b6a2f07637bcd2b4f219b676f7634a9a))
* **init:** scaffold skills ([62167a3](https://github.com/christian-marino-alvarez/agentic-workflow/commit/62167a31ac34f18fd067c7375281627d85f8482f))
* **mcp:** clean codex config headers ([58e3d81](https://github.com/christian-marino-alvarez/agentic-workflow/commit/58e3d81e57bca7967142536b237ac86bba14b44d))
* **mcp:** declare resources capability ([614ca81](https://github.com/christian-marino-alvarez/agentic-workflow/commit/614ca81f75fe6ace7a809e7450d567aae5094d3a))
* **mcp:** dedupe codex server entries ([fc41c00](https://github.com/christian-marino-alvarez/agentic-workflow/commit/fc41c003d223a067c1e8edec6c8b10352c3b2990))
* **mcp:** echo tool call logs to stderr ([61422d6](https://github.com/christian-marino-alvarez/agentic-workflow/commit/61422d6812eb16f78b5394fe2e39e258a9d431e8))
* **mcp:** resolve init paths and list templates ([722266c](https://github.com/christian-marino-alvarez/agentic-workflow/commit/722266c3257cf64844ffa78b916c2eb773c92acb))
* **mcp:** resolve init paths and list templates ([7535157](https://github.com/christian-marino-alvarez/agentic-workflow/commit/7535157af476287a3250f5eada765d8af12e177f))
* **mcp:** resolve init paths and list templates ([eab7151](https://github.com/christian-marino-alvarez/agentic-workflow/commit/eab7151b47c33ce9329c8327193b8eb2d38f6315))
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
* **runtime:** add task markers for write guard ([365f229](https://github.com/christian-marino-alvarez/agentic-workflow/commit/365f22909a5070416a74121f2e4119f20ba5ba64))
* **runtime:** add visible logging to MCP server startup and request handling ([077907a](https://github.com/christian-marino-alvarez/agentic-workflow/commit/077907aa0f2400c3c5607cf43b34fcefb6d38b3d))
* **runtime:** adjust write guard and cover frontmatter sync ([e06ca15](https://github.com/christian-marino-alvarez/agentic-workflow/commit/e06ca156c37b45304babcf7d24e3b200c47b7e64))
* **runtime:** load workspace from global config ([4b34350](https://github.com/christian-marino-alvarez/agentic-workflow/commit/4b34350637a898d97cbba6921da5ce770ce97586))
* **runtime:** redirect engine logs to stderr to protect MCP stdout protocol ([50756d8](https://github.com/christian-marino-alvarez/agentic-workflow/commit/50756d8a8ab9bb88e0854f71f2ac9605aea6641c))
* **runtime:** resolve relative paths in MCP server ([e7fc272](https://github.com/christian-marino-alvarez/agentic-workflow/commit/e7fc272bbaa6a4d9f27614bf78be657c856e91b5))
* **runtime:** resolve relative paths in MCP server ([ac55d5d](https://github.com/christian-marino-alvarez/agentic-workflow/commit/ac55d5dbf3737ee8c800267987bdea19ca124b48))
* **runtime:** validate string inputs ([6bebe64](https://github.com/christian-marino-alvarez/agentic-workflow/commit/6bebe6400efd105c9989fafe4805dace8fb449a4))
>>>>>>> origin/develop

## [1.37.0-beta.9](https://github.com/christian-marino-alvarez/agentic-workflow/compare/agentic-workflow-v1.37.0-beta.8...agentic-workflow-v1.37.0-beta.9) (2026-02-05)


### Bug Fixes

* **runtime:** add runtime markers to task template to allow guarded writes

## [1.37.0-beta.8](https://github.com/christian-marino-alvarez/agentic-workflow/compare/agentic-workflow-v1.36.2-beta.8...agentic-workflow-v1.37.0-beta.8) (2026-02-05)


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
* **init:** add --workspace support ([e27509f](https://github.com/christian-marino-alvarez/agentic-workflow/commit/e27509f70b60d2a1ca3f4c3026ac404b73c1048a))
* **init:** add non-interactive aliases ([d607431](https://github.com/christian-marino-alvarez/agentic-workflow/commit/d607431f2653f882e6dfa234413a16dc20cd8834))
* **init:** enforce workflow and role overwrite ([484a990](https://github.com/christian-marino-alvarez/agentic-workflow/commit/484a990ab95d50aedf72ac4ccbecdbbd346efa6b))
* initial commit (agentic-workflow core) ([3eed177](https://github.com/christian-marino-alvarez/agentic-workflow/commit/3eed1775b76a260174ab6355379b371c8db62ac9))
* **init:** persist workspace for mcp ([4a13588](https://github.com/christian-marino-alvarez/agentic-workflow/commit/4a13588c8dca756b78463a2125d2ee55b7aaeb6a))
* mcp refactor and distribution flow ([59bc352](https://github.com/christian-marino-alvarez/agentic-workflow/commit/59bc3529f7375ed9bd76b9e0bc45cd9d2c0f8f20))
* **mcp:** add --workspace flag ([b63a017](https://github.com/christian-marino-alvarez/agentic-workflow/commit/b63a017d15f1a9289c995996ccbd94d8d3e583d0))
* **mcp:** add resources list endpoints ([3badd6b](https://github.com/christian-marino-alvarez/agentic-workflow/commit/3badd6b8f6dbe8e38e7cfdd765af627c5897d639))
* **mcp:** add resources list endpoints ([f35d8a6](https://github.com/christian-marino-alvarez/agentic-workflow/commit/f35d8a6dfbe081be7377228a1e261637f4315aff))
* **mcp:** add resources list endpoints ([d75307f](https://github.com/christian-marino-alvarez/agentic-workflow/commit/d75307f1b70e14a9cde84e886a914826a0933410))
* **mcp:** add runtime.next_step and runtime.get_state endpoints ([958e246](https://github.com/christian-marino-alvarez/agentic-workflow/commit/958e246b902ce1974a5abb29cceb80f394f48d67))
* **mcp:** force local cli for registration ([a5b1f52](https://github.com/christian-marino-alvarez/agentic-workflow/commit/a5b1f52fb3fe224c2b22c33a14e05f7afd3d600c))
* **mcp:** log workspace context per tool call ([83f9961](https://github.com/christian-marino-alvarez/agentic-workflow/commit/83f99619a565a272e1345f519bb2bb02ef69a2cc))
* **mcp:** report package version on startup ([ec97aff](https://github.com/christian-marino-alvarez/agentic-workflow/commit/ec97aff5600d5d3e673f62edfe1b318b79922b2d))
* prebuild core bootstrap bundle ([7ec0fb8](https://github.com/christian-marino-alvarez/agentic-workflow/commit/7ec0fb8ae70a8cc882bb935dec55af1164acdf60))
* remove MCP and simplify bootstrap ([b3d31ad](https://github.com/christian-marino-alvarez/agentic-workflow/commit/b3d31ad2353bbdb362c6a2599a2d1395d1ec612f))
* require explicit gate confirmation ([ef1e62b](https://github.com/christian-marino-alvarez/agentic-workflow/commit/ef1e62b4243ea342741d32ddf9ce0319b8aac0df))
* reset core content to extensio backup baseline ([c5e6b03](https://github.com/christian-marino-alvarez/agentic-workflow/commit/c5e6b03780ea0e601701c284d6a98ec5ad3e4c77))
* Runtime Global Logging Implementation ([38110f4](https://github.com/christian-marino-alvarez/agentic-workflow/commit/38110f4a0fd4f0b15e67b69b86c639b3870841ff))
* **runtime:** add MCP-governed engine ([f712346](https://github.com/christian-marino-alvarez/agentic-workflow/commit/f7123464487f849072fac3d2cf00d0aa5df52d08))
* **runtime:** add structured logging via log event ([e363847](https://github.com/christian-marino-alvarez/agentic-workflow/commit/e363847dbe226d18b4976116fa1f1e5c871ef5fd))
* **runtime:** enforce write guard and reconcile ([7b7c494](https://github.com/christian-marino-alvarez/agentic-workflow/commit/7b7c494c21353bf33124bcd72b306d3e249b2805))
* **runtime:** expose next_step and implement granular execution service ([84c9af7](https://github.com/christian-marino-alvarez/agentic-workflow/commit/84c9af77bfa04d994942ab78281ed728d30cf55f))
* **runtime:** sync frontmatter ([e1d1812](https://github.com/christian-marino-alvarez/agentic-workflow/commit/e1d1812825632eb488bed4bf866e893e607db338))
* simplify init and add clarification questions ([cb24916](https://github.com/christian-marino-alvarez/agentic-workflow/commit/cb2491644380b8bb1ce56082619b43303268bf96))
* **vscode-extension:** add Lit core base, CSP fixes, logging, and setup view ([546444b](https://github.com/christian-marino-alvarez/agentic-workflow/commit/546444bab7a9b9f2d0ee44585cd026da5ca30ab5))
* **workflow:** align init.md with runtime_integration constitution ([e5d38c6](https://github.com/christian-marino-alvarez/agentic-workflow/commit/e5d38c6987f692d580761456311e117d1beb802a))
* **workflow:** align init.md with runtime_integration constitution ([f670f52](https://github.com/christian-marino-alvarez/agentic-workflow/commit/f670f5226e2d1a11eaf0b9c1d844c12fb0d25275))
* **workflow:** derive implementation owner from brief ([ea5ae9f](https://github.com/christian-marino-alvarez/agentic-workflow/commit/ea5ae9fac566802b9c2f85c6a53ea1b20f0c8128))
* **workflows:** update short lifecycle to 4 phases ([30d2a84](https://github.com/christian-marino-alvarez/agentic-workflow/commit/30d2a84608a08c161fb7ea69d0b18c30bd26852c))


### Bug Fixes

* **runtime:** add runtime markers to task template to allow guarded writes
* align init owner with architect-agent ([820fc3c](https://github.com/christian-marino-alvarez/agentic-workflow/commit/820fc3cd9b271d56064e7013f8f32b22481cb853))
* **build:** exclude vscode extension from build ([6104370](https://github.com/christian-marino-alvarez/agentic-workflow/commit/610437024b286428a7cd56964291a2ee5928906f))
* **cli:** handle null backup on reinit ([61fb7a5](https://github.com/christian-marino-alvarez/agentic-workflow/commit/61fb7a55496f435f75c0f93ef36278650cdfd3f1))
* **cli:** handle null backup on reinit ([19fd617](https://github.com/christian-marino-alvarez/agentic-workflow/commit/19fd617b30406c4447a6bbf03bbd3d5f2ecc863d))
* **cli:** overwrite workflows on init ([21551b6](https://github.com/christian-marino-alvarez/agentic-workflow/commit/21551b6998e0580638c1387bba78284ec3a7a66f))
* **cli:** read version dynamically from package.json ([365b5ad](https://github.com/christian-marino-alvarez/agentic-workflow/commit/365b5ad16237247ce85aa7929fa1646fa6c1ce37))
* **cli:** read version dynamically from package.json ([ac4c9d5](https://github.com/christian-marino-alvarez/agentic-workflow/commit/ac4c9d52064c6f120f87509033bd33b51cffa6ef))
* **extension:** add lit and openai dependencies ([2eca134](https://github.com/christian-marino-alvarez/agentic-workflow/commit/2eca1349c206169adcc1865f3ee35436dbfe86a1))
* **extension:** render mainView webview ([84d8a0c](https://github.com/christian-marino-alvarez/agentic-workflow/commit/84d8a0c2b148b43b63c11817d30221d58a46add1))
* **extension:** render mainView webview ([eba8643](https://github.com/christian-marino-alvarez/agentic-workflow/commit/eba864391126f2f518d6083c2b8931573b5c9b53))
* **identity:** revert to standard markdown-compatible icons ([a6df583](https://github.com/christian-marino-alvarez/agentic-workflow/commit/a6df583cbe9acd6eef322019d8f66a51b186abe5))
* **init:** align init template owner with architect-agent ([d5e8468](https://github.com/christian-marino-alvarez/agentic-workflow/commit/d5e8468ac2038db2c00272f2f524ed3c084562cb))
* **init:** align init workflow with timestamp candidates ([8cfea58](https://github.com/christian-marino-alvarez/agentic-workflow/commit/8cfea587ebeddeb8d4345813e46cf00fb09b1c99))
* **init:** copy core into local .agent ([07a265d](https://github.com/christian-marino-alvarez/agentic-workflow/commit/07a265d7973525e708c0e55b3eb244f8090dd873))
* **init:** normalize runtime.run candidate path ([bc11c79](https://github.com/christian-marino-alvarez/agentic-workflow/commit/bc11c799277cec46f22ee20bc7fcec31d0578acf))
* **init:** remove legacy init flow ([08dbcb0](https://github.com/christian-marino-alvarez/agentic-workflow/commit/08dbcb0c559005c65298b46edf03728ff9c3eaaf))
* **init:** resolve workspace and quote owner ([ab94a01](https://github.com/christian-marino-alvarez/agentic-workflow/commit/ab94a01a1fbb8cae0fbcf371c3a9e0579fa4d50a))
* **init:** scaffold skills ([a8a87bf](https://github.com/christian-marino-alvarez/agentic-workflow/commit/a8a87bf1b6a2f07637bcd2b4f219b676f7634a9a))
* **init:** scaffold skills ([62167a3](https://github.com/christian-marino-alvarez/agentic-workflow/commit/62167a31ac34f18fd067c7375281627d85f8482f))
* **mcp:** clean codex config headers ([58e3d81](https://github.com/christian-marino-alvarez/agentic-workflow/commit/58e3d81e57bca7967142536b237ac86bba14b44d))
* **mcp:** declare resources capability ([614ca81](https://github.com/christian-marino-alvarez/agentic-workflow/commit/614ca81f75fe6ace7a809e7450d567aae5094d3a))
* **mcp:** dedupe codex server entries ([fc41c00](https://github.com/christian-marino-alvarez/agentic-workflow/commit/fc41c003d223a067c1e8edec6c8b10352c3b2990))
* **mcp:** echo tool call logs to stderr ([61422d6](https://github.com/christian-marino-alvarez/agentic-workflow/commit/61422d6812eb16f78b5394fe2e39e258a9d431e8))
* **mcp:** resolve init paths and list templates ([722266c](https://github.com/christian-marino-alvarez/agentic-workflow/commit/722266c3257cf64844ffa78b916c2eb773c92acb))
* **mcp:** resolve init paths and list templates ([7535157](https://github.com/christian-marino-alvarez/agentic-workflow/commit/7535157af476287a3250f5eada765d8af12e177f))
* **mcp:** resolve init paths and list templates ([eab7151](https://github.com/christian-marino-alvarez/agentic-workflow/commit/eab7151b47c33ce9329c8327193b8eb2d38f6315))
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
* **runtime:** adjust write guard and cover frontmatter sync ([e06ca15](https://github.com/christian-marino-alvarez/agentic-workflow/commit/e06ca156c37b45304babcf7d24e3b200c47b7e64))
* **runtime:** load workspace from global config ([4b34350](https://github.com/christian-marino-alvarez/agentic-workflow/commit/4b34350637a898d97cbba6921da5ce770ce97586))
* **runtime:** redirect engine logs to stderr to protect MCP stdout protocol ([50756d8](https://github.com/christian-marino-alvarez/agentic-workflow/commit/50756d8a8ab9bb88e0854f71f2ac9605aea6641c))
* **runtime:** resolve relative paths in MCP server ([e7fc272](https://github.com/christian-marino-alvarez/agentic-workflow/commit/e7fc272bbaa6a4d9f27614bf78be657c856e91b5))
* **runtime:** resolve relative paths in MCP server ([ac55d5d](https://github.com/christian-marino-alvarez/agentic-workflow/commit/ac55d5dbf3737ee8c800267987bdea19ca124b48))
* **runtime:** validate string inputs ([6bebe64](https://github.com/christian-marino-alvarez/agentic-workflow/commit/6bebe6400efd105c9989fafe4805dace8fb449a4))
## [1.36.2-beta.8](https://github.com/christian-marino-alvarez/agentic-workflow/compare/agentic-workflow-v1.36.2-beta.7...agentic-workflow-v1.36.2-beta.8) (2026-02-05)


### Bug Fixes

* **cli:** overwrite workflows on init to avoid legacy inconsistencies

## [1.36.2-beta.7](https://github.com/christian-marino-alvarez/agentic-workflow/compare/agentic-workflow-v1.36.1-beta.7...agentic-workflow-v1.36.2-beta.7) (2026-02-05)


### Bug Fixes

* **mcp:** clean codex config headers ([58e3d81](https://github.com/christian-marino-alvarez/agentic-workflow/commit/58e3d81e57bca7967142536b237ac86bba14b44d))

## [1.36.1-beta.7](https://github.com/christian-marino-alvarez/agentic-workflow/compare/agentic-workflow-v1.36.0-beta.7...agentic-workflow-v1.36.1-beta.7) (2026-02-05)


### Bug Fixes

* **mcp:** dedupe codex server entries ([fc41c00](https://github.com/christian-marino-alvarez/agentic-workflow/commit/fc41c003d223a067c1e8edec6c8b10352c3b2990))

## [1.36.0-beta.7](https://github.com/christian-marino-alvarez/agentic-workflow/compare/agentic-workflow-v1.35.0-beta.7...agentic-workflow-v1.36.0-beta.7) (2026-02-05)


### Features

* **mcp:** force local cli for registration ([a5b1f52](https://github.com/christian-marino-alvarez/agentic-workflow/commit/a5b1f52fb3fe224c2b22c33a14e05f7afd3d600c))

## [1.35.0-beta.7](https://github.com/christian-marino-alvarez/agentic-workflow/compare/agentic-workflow-v1.34.1-beta.7...agentic-workflow-v1.35.0-beta.7) (2026-02-05)


### Features

* **init:** enforce workflow and role overwrite ([484a990](https://github.com/christian-marino-alvarez/agentic-workflow/commit/484a990ab95d50aedf72ac4ccbecdbbd346efa6b))
* **workflows:** update short lifecycle to 4 phases ([30d2a84](https://github.com/christian-marino-alvarez/agentic-workflow/commit/30d2a84608a08c161fb7ea69d0b18c30bd26852c))

## [1.34.1-beta.7](https://github.com/christian-marino-alvarez/agentic-workflow/compare/agentic-workflow-v1.34.0-beta.7...agentic-workflow-v1.34.1-beta.7) (2026-02-05)


### Bug Fixes

* **runtime:** adjust write guard and cover frontmatter sync ([e06ca15](https://github.com/christian-marino-alvarez/agentic-workflow/commit/e06ca156c37b45304babcf7d24e3b200c47b7e64))

## 1.34.0-beta.8
- chore(release): manual beta publish

## 1.33.2-beta.8
- feat(workflow): derive implementation owner from brief
- chore: sync workflow artifacts and owner defaults
- fix(runtime): expand write-guard to cover candidate and runtime state files

## [1.34.0-beta.7](https://github.com/christian-marino-alvarez/agentic-workflow/compare/agentic-workflow-v1.33.2-beta.7...agentic-workflow-v1.34.0-beta.7) (2026-02-05)


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
* **init:** add --workspace support ([e27509f](https://github.com/christian-marino-alvarez/agentic-workflow/commit/e27509f70b60d2a1ca3f4c3026ac404b73c1048a))
* **init:** add non-interactive aliases ([d607431](https://github.com/christian-marino-alvarez/agentic-workflow/commit/d607431f2653f882e6dfa234413a16dc20cd8834))
* initial commit (agentic-workflow core) ([3eed177](https://github.com/christian-marino-alvarez/agentic-workflow/commit/3eed1775b76a260174ab6355379b371c8db62ac9))
* **init:** persist workspace for mcp ([4a13588](https://github.com/christian-marino-alvarez/agentic-workflow/commit/4a13588c8dca756b78463a2125d2ee55b7aaeb6a))
* mcp refactor and distribution flow ([59bc352](https://github.com/christian-marino-alvarez/agentic-workflow/commit/59bc3529f7375ed9bd76b9e0bc45cd9d2c0f8f20))
* **mcp:** add --workspace flag ([b63a017](https://github.com/christian-marino-alvarez/agentic-workflow/commit/b63a017d15f1a9289c995996ccbd94d8d3e583d0))
* **mcp:** add resources list endpoints ([3badd6b](https://github.com/christian-marino-alvarez/agentic-workflow/commit/3badd6b8f6dbe8e38e7cfdd765af627c5897d639))
* **mcp:** add resources list endpoints ([f35d8a6](https://github.com/christian-marino-alvarez/agentic-workflow/commit/f35d8a6dfbe081be7377228a1e261637f4315aff))
* **mcp:** add resources list endpoints ([d75307f](https://github.com/christian-marino-alvarez/agentic-workflow/commit/d75307f1b70e14a9cde84e886a914826a0933410))
* **mcp:** add runtime.next_step and runtime.get_state endpoints ([958e246](https://github.com/christian-marino-alvarez/agentic-workflow/commit/958e246b902ce1974a5abb29cceb80f394f48d67))
* **mcp:** log workspace context per tool call ([83f9961](https://github.com/christian-marino-alvarez/agentic-workflow/commit/83f99619a565a272e1345f519bb2bb02ef69a2cc))
* **mcp:** report package version on startup ([ec97aff](https://github.com/christian-marino-alvarez/agentic-workflow/commit/ec97aff5600d5d3e673f62edfe1b318b79922b2d))
* prebuild core bootstrap bundle ([7ec0fb8](https://github.com/christian-marino-alvarez/agentic-workflow/commit/7ec0fb8ae70a8cc882bb935dec55af1164acdf60))
* remove MCP and simplify bootstrap ([b3d31ad](https://github.com/christian-marino-alvarez/agentic-workflow/commit/b3d31ad2353bbdb362c6a2599a2d1395d1ec612f))
* require explicit gate confirmation ([ef1e62b](https://github.com/christian-marino-alvarez/agentic-workflow/commit/ef1e62b4243ea342741d32ddf9ce0319b8aac0df))
* reset core content to extensio backup baseline ([c5e6b03](https://github.com/christian-marino-alvarez/agentic-workflow/commit/c5e6b03780ea0e601701c284d6a98ec5ad3e4c77))
* Runtime Global Logging Implementation ([38110f4](https://github.com/christian-marino-alvarez/agentic-workflow/commit/38110f4a0fd4f0b15e67b69b86c639b3870841ff))
* **runtime:** add MCP-governed engine ([f712346](https://github.com/christian-marino-alvarez/agentic-workflow/commit/f7123464487f849072fac3d2cf00d0aa5df52d08))
* **runtime:** add structured logging via log event ([e363847](https://github.com/christian-marino-alvarez/agentic-workflow/commit/e363847dbe226d18b4976116fa1f1e5c871ef5fd))
* **runtime:** enforce write guard and reconcile ([7b7c494](https://github.com/christian-marino-alvarez/agentic-workflow/commit/7b7c494c21353bf33124bcd72b306d3e249b2805))
* **runtime:** expose next_step and implement granular execution service ([84c9af7](https://github.com/christian-marino-alvarez/agentic-workflow/commit/84c9af77bfa04d994942ab78281ed728d30cf55f))
* **runtime:** sync frontmatter ([e1d1812](https://github.com/christian-marino-alvarez/agentic-workflow/commit/e1d1812825632eb488bed4bf866e893e607db338))
* simplify init and add clarification questions ([cb24916](https://github.com/christian-marino-alvarez/agentic-workflow/commit/cb2491644380b8bb1ce56082619b43303268bf96))
* **vscode-extension:** add Lit core base, CSP fixes, logging, and setup view ([546444b](https://github.com/christian-marino-alvarez/agentic-workflow/commit/546444bab7a9b9f2d0ee44585cd026da5ca30ab5))
* **workflow:** align init.md with runtime_integration constitution ([e5d38c6](https://github.com/christian-marino-alvarez/agentic-workflow/commit/e5d38c6987f692d580761456311e117d1beb802a))
* **workflow:** align init.md with runtime_integration constitution ([f670f52](https://github.com/christian-marino-alvarez/agentic-workflow/commit/f670f5226e2d1a11eaf0b9c1d844c12fb0d25275))
* **workflow:** derive implementation owner from brief ([ea5ae9f](https://github.com/christian-marino-alvarez/agentic-workflow/commit/ea5ae9fac566802b9c2f85c6a53ea1b20f0c8128))


### Bug Fixes

* align init owner with architect-agent ([820fc3c](https://github.com/christian-marino-alvarez/agentic-workflow/commit/820fc3cd9b271d56064e7013f8f32b22481cb853))
* **build:** exclude vscode extension from build ([6104370](https://github.com/christian-marino-alvarez/agentic-workflow/commit/610437024b286428a7cd56964291a2ee5928906f))
* **cli:** handle null backup on reinit ([61fb7a5](https://github.com/christian-marino-alvarez/agentic-workflow/commit/61fb7a55496f435f75c0f93ef36278650cdfd3f1))
* **cli:** handle null backup on reinit ([19fd617](https://github.com/christian-marino-alvarez/agentic-workflow/commit/19fd617b30406c4447a6bbf03bbd3d5f2ecc863d))
* **cli:** read version dynamically from package.json ([365b5ad](https://github.com/christian-marino-alvarez/agentic-workflow/commit/365b5ad16237247ce85aa7929fa1646fa6c1ce37))
* **cli:** read version dynamically from package.json ([ac4c9d5](https://github.com/christian-marino-alvarez/agentic-workflow/commit/ac4c9d52064c6f120f87509033bd33b51cffa6ef))
* **extension:** add lit and openai dependencies ([2eca134](https://github.com/christian-marino-alvarez/agentic-workflow/commit/2eca1349c206169adcc1865f3ee35436dbfe86a1))
* **extension:** render mainView webview ([84d8a0c](https://github.com/christian-marino-alvarez/agentic-workflow/commit/84d8a0c2b148b43b63c11817d30221d58a46add1))
* **extension:** render mainView webview ([eba8643](https://github.com/christian-marino-alvarez/agentic-workflow/commit/eba864391126f2f518d6083c2b8931573b5c9b53))
* **identity:** revert to standard markdown-compatible icons ([a6df583](https://github.com/christian-marino-alvarez/agentic-workflow/commit/a6df583cbe9acd6eef322019d8f66a51b186abe5))
* **init:** align init template owner with architect-agent ([d5e8468](https://github.com/christian-marino-alvarez/agentic-workflow/commit/d5e8468ac2038db2c00272f2f524ed3c084562cb))
* **init:** align init workflow with timestamp candidates ([8cfea58](https://github.com/christian-marino-alvarez/agentic-workflow/commit/8cfea587ebeddeb8d4345813e46cf00fb09b1c99))
* **init:** copy core into local .agent ([07a265d](https://github.com/christian-marino-alvarez/agentic-workflow/commit/07a265d7973525e708c0e55b3eb244f8090dd873))
* **init:** normalize runtime.run candidate path ([bc11c79](https://github.com/christian-marino-alvarez/agentic-workflow/commit/bc11c799277cec46f22ee20bc7fcec31d0578acf))
* **init:** remove legacy init flow ([08dbcb0](https://github.com/christian-marino-alvarez/agentic-workflow/commit/08dbcb0c559005c65298b46edf03728ff9c3eaaf))
* **init:** resolve workspace and quote owner ([ab94a01](https://github.com/christian-marino-alvarez/agentic-workflow/commit/ab94a01a1fbb8cae0fbcf371c3a9e0579fa4d50a))
* **init:** scaffold skills ([a8a87bf](https://github.com/christian-marino-alvarez/agentic-workflow/commit/a8a87bf1b6a2f07637bcd2b4f219b676f7634a9a))
* **init:** scaffold skills ([62167a3](https://github.com/christian-marino-alvarez/agentic-workflow/commit/62167a31ac34f18fd067c7375281627d85f8482f))
* **mcp:** declare resources capability ([614ca81](https://github.com/christian-marino-alvarez/agentic-workflow/commit/614ca81f75fe6ace7a809e7450d567aae5094d3a))
* **mcp:** echo tool call logs to stderr ([61422d6](https://github.com/christian-marino-alvarez/agentic-workflow/commit/61422d6812eb16f78b5394fe2e39e258a9d431e8))
* **mcp:** resolve init paths and list templates ([722266c](https://github.com/christian-marino-alvarez/agentic-workflow/commit/722266c3257cf64844ffa78b916c2eb773c92acb))
* **mcp:** resolve init paths and list templates ([7535157](https://github.com/christian-marino-alvarez/agentic-workflow/commit/7535157af476287a3250f5eada765d8af12e177f))
* **mcp:** resolve init paths and list templates ([eab7151](https://github.com/christian-marino-alvarez/agentic-workflow/commit/eab7151b47c33ce9329c8327193b8eb2d38f6315))
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
* **runtime:** load workspace from global config ([4b34350](https://github.com/christian-marino-alvarez/agentic-workflow/commit/4b34350637a898d97cbba6921da5ce770ce97586))
* **runtime:** redirect engine logs to stderr to protect MCP stdout protocol ([50756d8](https://github.com/christian-marino-alvarez/agentic-workflow/commit/50756d8a8ab9bb88e0854f71f2ac9605aea6641c))
* **runtime:** resolve relative paths in MCP server ([e7fc272](https://github.com/christian-marino-alvarez/agentic-workflow/commit/e7fc272bbaa6a4d9f27614bf78be657c856e91b5))
* **runtime:** resolve relative paths in MCP server ([ac55d5d](https://github.com/christian-marino-alvarez/agentic-workflow/commit/ac55d5dbf3737ee8c800267987bdea19ca124b48))
* **runtime:** validate string inputs ([6bebe64](https://github.com/christian-marino-alvarez/agentic-workflow/commit/6bebe6400efd105c9989fafe4805dace8fb449a4))

## 1.33.2-beta.7
- Fix: init scaffolds skills to enable runtime-governance

## [1.33.2-beta.6](https://github.com/christian-marino-alvarez/agentic-workflow/compare/agentic-workflow-v1.33.1-beta.6...agentic-workflow-v1.33.2-beta.6) (2026-02-04)


### Bug Fixes

* **init:** align init template owner with architect-agent ([d5e8468](https://github.com/christian-marino-alvarez/agentic-workflow/commit/d5e8468ac2038db2c00272f2f524ed3c084562cb))

## 1.33.1-beta.7
- fix(init): align init template owner with architect-agent

## [1.33.1-beta.6](https://github.com/christian-marino-alvarez/agentic-workflow/compare/agentic-workflow-v1.33.0-beta.6...agentic-workflow-v1.33.1-beta.6) (2026-02-04)


### Bug Fixes

* align init owner with architect-agent ([820fc3c](https://github.com/christian-marino-alvarez/agentic-workflow/commit/820fc3cd9b271d56064e7013f8f32b22481cb853))

## [1.33.0-beta.6](https://github.com/christian-marino-alvarez/agentic-workflow/compare/agentic-workflow-v1.32.0-beta.6...agentic-workflow-v1.33.0-beta.6) (2026-02-04)


### Features

* **mcp:** add --workspace flag ([b63a017](https://github.com/christian-marino-alvarez/agentic-workflow/commit/b63a017d15f1a9289c995996ccbd94d8d3e583d0))
* **runtime:** enforce write guard and reconcile ([7b7c494](https://github.com/christian-marino-alvarez/agentic-workflow/commit/7b7c494c21353bf33124bcd72b306d3e249b2805))


### Bug Fixes

* **mcp:** echo tool call logs to stderr ([61422d6](https://github.com/christian-marino-alvarez/agentic-workflow/commit/61422d6812eb16f78b5394fe2e39e258a9d431e8))
* **runtime:** load workspace from global config ([4b34350](https://github.com/christian-marino-alvarez/agentic-workflow/commit/4b34350637a898d97cbba6921da5ce770ce97586))
* **runtime:** validate string inputs ([6bebe64](https://github.com/christian-marino-alvarez/agentic-workflow/commit/6bebe6400efd105c9989fafe4805dace8fb449a4))

## 1.32.0-beta.10
- fix(runtime): validate string inputs

## 1.32.0-beta.9
- feat(mcp): add --workspace flag

## 1.32.0-beta.8
- fix(runtime): load workspace from global config

## 1.32.0-beta.7
- fix(mcp): echo tool call logs to stderr

## [1.32.0-beta.6](https://github.com/christian-marino-alvarez/agentic-workflow/compare/agentic-workflow-v1.31.0-beta.6...agentic-workflow-v1.32.0-beta.6) (2026-02-04)


### Features

* **init:** add non-interactive aliases ([d607431](https://github.com/christian-marino-alvarez/agentic-workflow/commit/d607431f2653f882e6dfa234413a16dc20cd8834))
* **mcp:** log workspace context per tool call ([83f9961](https://github.com/christian-marino-alvarez/agentic-workflow/commit/83f99619a565a272e1345f519bb2bb02ef69a2cc))

## 1.31.0-beta.9
- feat(mcp): log workspace context per tool call

## 1.31.0-beta.8
- feat(init): add non-interactive aliases

## 1.31.0-beta.7
- chore(release): ensure npm dist-tag is updated on publish

## [1.31.0-beta.6](https://github.com/christian-marino-alvarez/agentic-workflow/compare/agentic-workflow-v1.30.2-beta.6...agentic-workflow-v1.31.0-beta.6) (2026-02-04)


### Features

* **init:** add --workspace support ([e27509f](https://github.com/christian-marino-alvarez/agentic-workflow/commit/e27509f70b60d2a1ca3f4c3026ac404b73c1048a))
* **init:** persist workspace for mcp ([4a13588](https://github.com/christian-marino-alvarez/agentic-workflow/commit/4a13588c8dca756b78463a2125d2ee55b7aaeb6a))
* **mcp:** add resources list endpoints ([3badd6b](https://github.com/christian-marino-alvarez/agentic-workflow/commit/3badd6b8f6dbe8e38e7cfdd765af627c5897d639))
* **mcp:** report package version on startup ([ec97aff](https://github.com/christian-marino-alvarez/agentic-workflow/commit/ec97aff5600d5d3e673f62edfe1b318b79922b2d))


### Bug Fixes

* **mcp:** declare resources capability ([614ca81](https://github.com/christian-marino-alvarez/agentic-workflow/commit/614ca81f75fe6ace7a809e7450d567aae5094d3a))

## [1.30.2-beta.6](https://github.com/christian-marino-alvarez/agentic-workflow/compare/agentic-workflow-v1.30.1-beta.6...agentic-workflow-v1.30.2-beta.6) (2026-02-04)


### Bug Fixes

* **init:** align init workflow with timestamp candidates ([8cfea58](https://github.com/christian-marino-alvarez/agentic-workflow/commit/8cfea587ebeddeb8d4345813e46cf00fb09b1c99))

## 1.30.2-beta.7
- feat(init): add --workspace support to init

## 1.30.2-beta.8
- feat(mcp): add resources/list and domain alias endpoints

## 1.30.2-beta.9
- docs(init): document workspace resolution

## 1.30.2-beta.10
- fix(mcp): declare resources capability for resources/list

## 1.30.2-beta.11
- feat(init): persist workspace config for runtime

## 1.30.2-beta.12
- feat(mcp): log installed package version on startup

## 1.30.2-beta.13
- chore(release): ensure npm dist-tag is updated on publish

## 1.30.1-beta.8
- fix(init): resolve workspace for relative candidate paths
- fix(init): quote owner placeholder in init template

## 1.30.1-beta.7
- fix(init): align init workflow with timestamp candidates

## [1.30.1-beta.6](https://github.com/christian-marino-alvarez/agentic-workflow/compare/agentic-workflow-v1.30.0-beta.6...agentic-workflow-v1.30.1-beta.6) (2026-02-04)


### Bug Fixes

* **init:** normalize runtime.run candidate path ([bc11c79](https://github.com/christian-marino-alvarez/agentic-workflow/commit/bc11c799277cec46f22ee20bc7fcec31d0578acf))

## 1.30.0-beta.8
- fix(init): normalize runtime.run candidate path and forbid legacy init.md

## 1.30.0-beta.7
- feat(init): index init candidates in artifacts/candidate/index.md
- chore(artifacts): drop legacy artifacts from system structure

## [1.30.0-beta.6](https://github.com/christian-marino-alvarez/agentic-workflow/compare/agentic-workflow-v1.29.0-beta.6...agentic-workflow-v1.30.0-beta.6) (2026-02-04)


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
* mcp refactor and distribution flow ([59bc352](https://github.com/christian-marino-alvarez/agentic-workflow/commit/59bc3529f7375ed9bd76b9e0bc45cd9d2c0f8f20))
* **mcp:** add resources list endpoints ([f35d8a6](https://github.com/christian-marino-alvarez/agentic-workflow/commit/f35d8a6dfbe081be7377228a1e261637f4315aff))
* **mcp:** add resources list endpoints ([d75307f](https://github.com/christian-marino-alvarez/agentic-workflow/commit/d75307f1b70e14a9cde84e886a914826a0933410))
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
* **init:** remove legacy init flow ([08dbcb0](https://github.com/christian-marino-alvarez/agentic-workflow/commit/08dbcb0c559005c65298b46edf03728ff9c3eaaf))
* **mcp:** resolve init paths and list templates ([722266c](https://github.com/christian-marino-alvarez/agentic-workflow/commit/722266c3257cf64844ffa78b916c2eb773c92acb))
* **mcp:** resolve init paths and list templates ([7535157](https://github.com/christian-marino-alvarez/agentic-workflow/commit/7535157af476287a3250f5eada765d8af12e177f))
* **mcp:** resolve init paths and list templates ([eab7151](https://github.com/christian-marino-alvarez/agentic-workflow/commit/eab7151b47c33ce9329c8327193b8eb2d38f6315))
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

## 1.29.0-beta.6
- chore(init): remove legacy init.md after scaffold
- chore(pkg): remove init.md from artifacts

## [1.29.0-beta.5](https://github.com/christian-marino-alvarez/agentic-workflow/compare/agentic-workflow-v1.28.0-beta.5...agentic-workflow-v1.29.0-beta.5) (2026-02-04)


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
* mcp refactor and distribution flow ([59bc352](https://github.com/christian-marino-alvarez/agentic-workflow/commit/59bc3529f7375ed9bd76b9e0bc45cd9d2c0f8f20))
* **mcp:** add resources list endpoints ([f35d8a6](https://github.com/christian-marino-alvarez/agentic-workflow/commit/f35d8a6dfbe081be7377228a1e261637f4315aff))
* **mcp:** add resources list endpoints ([d75307f](https://github.com/christian-marino-alvarez/agentic-workflow/commit/d75307f1b70e14a9cde84e886a914826a0933410))
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
* **init:** remove legacy init flow ([08dbcb0](https://github.com/christian-marino-alvarez/agentic-workflow/commit/08dbcb0c559005c65298b46edf03728ff9c3eaaf))
* **mcp:** resolve init paths and list templates ([722266c](https://github.com/christian-marino-alvarez/agentic-workflow/commit/722266c3257cf64844ffa78b916c2eb773c92acb))
* **mcp:** resolve init paths and list templates ([7535157](https://github.com/christian-marino-alvarez/agentic-workflow/commit/7535157af476287a3250f5eada765d8af12e177f))
* **mcp:** resolve init paths and list templates ([eab7151](https://github.com/christian-marino-alvarez/agentic-workflow/commit/eab7151b47c33ce9329c8327193b8eb2d38f6315))
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

## 1.28.0-beta.5
- fix(init): remove legacy init flow
- chore(pkg): include dist/mcp in npm package
## [1.28.0-beta.4](https://github.com/christian-marino-alvarez/agentic-workflow/compare/agentic-workflow-v1.27.0-beta.4...agentic-workflow-v1.28.0-beta.4) (2026-02-04)


### Features

* mcp refactor and distribution flow ([59bc352](https://github.com/christian-marino-alvarez/agentic-workflow/commit/59bc3529f7375ed9bd76b9e0bc45cd9d2c0f8f20))

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
# [1.36.0-beta.13] (2026-02-05)

### Bug Fixes
* **CLI**: Overwrite workflows on `init` to avoid legacy inconsistencies.
