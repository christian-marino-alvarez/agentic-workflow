🏛️ **architect-agent** (Gemini): Research — OpenAI Agents SDK JS (`@openai/agents`) Suitability

---
artifact: research-addendum-gemini
phase: phase-2-analysis
owner: architect-agent
status: complete
related_task: 19-agent-factory
---

# Research: OpenAI Agents SDK Suitability Analysis (Gemini Opinion)

## 1. Executive Summary

**Recommendation**: **Adopt the OpenAI Agents SDK** (`@openai/agents`) with caveats.

**Reasoning**: The SDK provides a robust, production-ready framework for multi-agent orchestration that aligns perfectly with our architectural goals (Manager/Agents-as-Tools pattern). While it introduces a dependency on OpenAI's ecosystem, the benefits of avoiding custom orchestrator development outweigh the risks, especially given the model-agnostic capabilities via `ModelProvider` and Vercel AI SDK adapters.

## 2. Technical Fit Analysis

### Strength: Agent Loop & Orchestration
The most significant value proposition is the built-in **Agent Loop**. Implementing a reliable loop that handles tool execution, context management, error recovery, and termination conditions is non-trivial. The SDK provides this out-of-the-box.
- **Fit**: High. Replaces planned custom logic in `LLMFactory`.

### Strength: Tools & Validation
The integration with `zod` for schema validation is modern and TypeScript-native.
- **Fit**: High. Matches our project's strict typing standards.

### Strength: Multi-Provider Strategy
The ability to implement `ModelProvider` interfaces or use Vercel AI SDK adapters is critical. Our requirement to support Gemini and Claude is achievable.
- **Fit**: Medium-High. Requires implementation effort (writing adapters), but the path is clear.

### Concern: Node.js Runtime Requirement
Requires Node.js ≥ 22.
- **Impact**: Low. Our sidecar architecture allows us to controlling the runtime environment.

### Concern: OpenAI-Centric Tracing
Tracing features are optimized for OpenAI's dashboard.
- **Impact**: Low. We can implement custom tracing if needed, or simply not use this feature initially.

## 3. Risk Assessment

| Risk | Probability | Impact | Mitigation |
|:--|:--|:--|:--|
| **Vendor Lock-in** | Medium | High | Use the `ModelProvider` interface strictly to abstract provider details. Avoid using OpenAI-specific extensions unless necessary. |
| **API Instability** | Medium | Medium | The SDK is relatively new (2025). Pin versions and wrap SDK usage in our own factory/adapter classes to isolate changes. |
| **Performance Overhead** | Low | Low | The SDK is described as "lightweight". Node.js execution overhead is negligible compared to LLM latency. |

## 4. Architectural Alignment

### Workflow Orchestration
The SDK's "Manager" pattern (Agents as Tools) maps directly to our **Architect Agent** concept. The Architect can be the primary agent, with other agents (Backend, View, QA) exposed as tools. This allows the Architect to:
1.  Receive a high-level task.
2.  Decompose it.
3.  Call "Backend Tool" (Backend Agent) to write code.
4.  Call "View Tool" (View Agent) to create UI.
5.  Synthesize the results.

This is a **superior** model to manual orchestration.

### Dynamic Roles
The SDK's `instructions` property accepts a function `(context) => string`. This empowers our requirement for dynamic role loading from `.agent/rules/roles/*.md`. We can inject the file content at runtime based on the requested agent role.

## 5. Conclusion

I concur with the Claude analysis. Adopting `@openai/agents` is the strategic choice. It accelerates development of T019 significantly by providing the "plumbing" for agents, allowing us to focus on the "business logic" (our specific roles, workflows, and tools).

**Recommendation**: Proceed with `@openai/agents` as the core of the Agent Factory.
