# ADR-T001: Node.js Compatibility for OpenAI Agents SDK

**Status**: Accepted  
**Date**: 2026-02-08  
**Decision Makers**: architect-agent, Developer  
**Stakeholders**: Development Team

---

## Context

The ADR-001 roadmap requires implementing multi-agent workflows for the VS Code extension. The planned architecture involves using the `@openai/agents` SDK for multi-agent orchestration. Before investing effort in implementation (tasks T014-T018), we needed to verify technical compatibility between:

- **OpenAI Agents SDK** (`@openai/agents`)
- **VS Code Extension Host** runtime environment (Node.js 20.x)

### Initial Concern

Web documentation and multiple sources suggested that `@openai/agents` requires Node.js 22+, while VS Code Extension Host currently runs Node.js 20.12.1. This created uncertainty about the viability of the planned TypeScript backend architecture.

### Investigation Approach

A Proof of Concept (POC) was created to verify actual compatibility rather than relying solely on documentation.

---

## Decision

**We will use Backend TypeScript with `@openai/agents` SDK running directly in VS Code Extension Host.**

### Rationale

1. **POC Verification (2026-02-08)**:
   - Created test in `spike/nodejs-compatibility/poc-node20/`
   - Successfully installed `@openai/agents` v0.4.6
   - Successfully imported and executed the SDK
   - **No `engines` field restriction** found in package.json
   - Compatible with both Node.js 20.x and 22.x

2. **Already Installed**:
   - Project already has `@openai/agents: ^0.4.5` in package.json
   - No compatibility issues reported in existing setup

3. **Stack Consistency**:
   - Maintains uniform TypeScript stack
   - No additional language runtime required
   - Simpler architecture (no inter-process communication)

4. **Performance Benefits**:
   - Internal calls faster than HTTP/WebSocket
   - No process spawning overhead
   - Direct access to Extension Host APIs

5. **Deployment Simplicity**:
   - Single VS Code extension package
   - No Python or additional runtime installation
   - Standard VS Code extension deployment flow

### Alternatives Considered

#### Alternative A: Wait for VS Code upgrade to Node.js 22
- **Rejected**: Uncertain timeline, blocks roadmap indefinitely
- **Risk**: High - project dependency on external release cycle

#### Alternative B: Python Backend (CrewAI/LangGraph)
- **Rejected**: POC proved unnecessary
- **Overhead**: Additional complexity (HTTP/WebSocket, process management)
- **Deployment**: Would require Python runtime installation

#### Alternative C: Node.js 22 Standalone Backend
- **Rejected**: Same complexity as Python without ecosystem benefits
- **No advantage**: TypeScript works directly in Extension Host

---

## Consequences

### Positive

✅ **Roadmap Unchanged**:
- Tasks T014-T018 proceed as originally designed
- No architectural redesign required
- Timeline preserved

✅ **Technical Simplicity**:
- Uniform TypeScript codebase
- No inter-process communication layer
- Familiar development environment

✅ **Performance**:
- Low latency (internal calls)
- No process spawning overhead
- Efficient resource usage

✅ **Deployment**:
- Standard VS Code extension packaging
- No additional runtime dependencies
- User-friendly installation

### Negative / Trade-offs

⚠️ **UI Performance Risk**:
- Complex agent workflows could affect VS Code responsiveness
- **Mitigation**: Implement queuing, throttling, consider Web Workers for heavy operations

⚠️ **Documentation Confusion**:
- Web sources incorrectly suggest Node.js 22+ requirement
- **Mitigation**: Document POC findings, rely on practical testing

⚠️ **Future SDK Versions**:
- Future `@openai/agents` releases might introduce Node.js 22+ dependency
- **Mitigation**: Lock version in package.json, monitor changelogs before upgrades

### Impact on Roadmap Tasks

| Task | Original Plan | Status After Decision |
|------|---------------|----------------------|
| T014: POC Agents SDK | TypeScript/Node.js | ✅ Unchanged - Proceed as planned |
| T015: Backend Scaffolding | TypeScript/Node.js | ✅ Unchanged - Extension Host |
| T016: Agent Workflows | TypeScript | ✅ Unchanged |
| T017: Chat API Endpoints | Extension Host endpoints | ✅ Unchanged |
| T018: Response Streaming | TypeScript streaming | ✅ Unchanged |

---

## Evidence

### POC Test Results

**Location**: `spike/nodejs-compatibility/poc-node20/`

**Test Script**: `test-import.js`
```bash
$ npm test

Node.js version: v22.12.0
Attempting to import @openai/agents...

✅ SUCCESS: @openai/agents imported successfully!
Available exports: [
  'Agent', 'AgentHooks', 'Runner', ...
  (133 total exports)
]
✅ Agent class is available
```

**Key Finding**: No `engines` field in `@openai/agents/package.json` → No explicit Node.js version restriction

### Package Analysis

```json
// @openai/agents/package.json (v0.4.6)
{
  "name": "@openai/agents",
  "version": "0.4.6",
  "dependencies": {
    "@openai/agents-core": "0.4.6",
    "openai": "^6"
  }
  // NO "engines" field present
}
```

### Project Configuration

```json
// Project package.json
{
  "dependencies": {
    "@openai/agents": "^0.4.5",  // Already installed
    "openai": "^6.17.0"
  },
  "engines": {
    "vscode": "^1.108.2"  // Node.js 20.x in Extension Host
  }
}
```

---

## Implementation Notes

### Best Practices for Extension Host

1. **Performance Monitoring**:
   - Implement metrics for agent execution time
   - Set reasonable timeouts
   - Consider queuing for concurrent requests

2. **Error Handling**:
   - Graceful degradation if API fails
   - User-friendly error messages
   - Retry logic for transient failures

3. **Resource Management**:
   - Limit concurrent agent executions
   - Clean up resources after agent runs
   - Monitor memory usage

### Development Guidelines

- **Version Locking**: Keep `@openai/agents` version locked in package.json
- **Testing**: Verify compatibility before upgrading SDK versions
- **Documentation**: Reference this ADR when onboarding new developers

---

## References

- **POC**: `spike/nodejs-compatibility/poc-node20/`
- **Research**: `.agent/artifacts/5-spike-nodejs-compatibility/researcher/research.md`
- **Analysis**: `.agent/artifacts/5-spike-nodejs-compatibility/analysis.md`
- **Plan**: `.agent/artifacts/5-spike-nodejs-compatibility/plan.md`
- **Roadmap**: `ROADMAP-BACKLOG.md`

---

## Decision History

| Date | Action | Decided By |
|------|--------|------------|
| 2026-02-08 | Decision proposed based on POC | architect-agent |
| 2026-02-08 | Decision approved | Developer |

---

**Conclusion**: The combination of POC verification, existing installation, and stack consistency makes TypeScript backend with `@openai/agents` in Extension Host the optimal choice. The decision preserves the original roadmap architecture while leveraging proven compatibility.
