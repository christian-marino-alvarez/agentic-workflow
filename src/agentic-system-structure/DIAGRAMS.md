# Agentic System — Architecture & Workflows

![Conceptual Architecture](./conceptual_architecture.png)

## Agent & Tools Structure (Skills)

![Agents and Tools](./agentic_structure_rules.png)

> [!TIP]
> **Interactive Presentation Available**: I have generated an interactive presentation page with high-quality visuals in `PRESENTATION.html`.

This document contains the technical reference for the system diagrams.

## 1. System Architecture (Core)

The system is designed to be portable and execution-agnostic (IDE or CLI).

```mermaid
graph TD
    subgraph "External Agent (Antigravity / Codex)"
        Assistant[AI Assistant]
    end

    subgraph "Agentic Core (Ported)"
        CLI[CLI Controller]
        Runtime[Runtime Engine]
        MCP[MCP Server]
        Structure[Agentic System Structure]
        rules[.agent/rules]
        workflows[.agent/workflows]
        templates[.agent/templates]
    end

    Assistant <-->|JSON-RPC| MCP
    MCP <--> Runtime
    CLI <--> Runtime
    Runtime <-->|Read/Write| Structure
    Structure --- rules
    Structure --- workflows
    Structure --- templates

    style Assistant fill:#f9f,stroke:#333,stroke-width:2px
    style Runtime fill:#00d5ff,stroke:#005577,stroke-width:3px,color:#fff
    style MCP fill:#7b2ff7,stroke:#330066,stroke-width:2px,color:#fff
    style Structure fill:#eee,stroke:#333,stroke-dasharray: 5 5
```

---

## 2. Conceptual Flow & Governance

This diagram explains how the agent system "thinks" and "executes" through the interaction between the LLM, the MCP protocol, and the Runtime that governs the filesystem.

```mermaid
sequenceDiagram
    participant LLM as AI Assistant (LLM)
    participant MCP as MCP Server (Bridge)
    participant RT as Runtime Engine (Governor)
    participant FS as Filesystem (.agent/MD)

    Note over LLM, FS: 1. Capability Discovery
    LLM->>MCP: ListTools()
    MCP-->>LLM: Runtime Tools (run, next_step, etc.)

    Note over LLM, FS: 2. Contextual Memory Implementation
    FS->>RT: Read constitution.clean_code + task.md
    RT-->>MCP: Current State + Active Rules
    MCP-->>LLM: Context injected into System Prompt

    Note over LLM, FS: 3. Execution & Governance
    LLM->>MCP: CallTool("runtime_next_step")
    MCP->>RT: Validate Gate (Constitution)
    RT->>FS: Update task.md (Frontmatter + Markdown)
    FS-->>RT: Protected Write ACK
    RT-->>MCP: Phase updated confirmation
    MCP-->>LLM: New Workspace State
```

---

## 3. Data Structure (Markdown as Single Source of Truth)

The system uses Markdown files with specific metadata to maintain state consistency.

```mermaid
graph LR
    subgraph "MD File Structure"
        FM[Frontmatter YAML]
        Body[Markdown Content]
        RT_Tags[Runtime Markers]
    end

    subgraph "Runtime Logic"
        Parse[Markdown Parser]
        Sync[Frontmatter Sync]
        Guard[Write Guard]
    end

    FM -->|Metadata| Sync
    Sync --> Parse
    Body --> Parse
    Parse --> Guard
    Guard -->|Persistence| FS[(.agent/artifacts)]

    style FM fill:#ffcc00,color:#000
    style Body fill:#fff,color:#000
    style RT_Tags fill:#00d5ff,color:#000
    style Guard fill:#f66,color:#fff
```

---

## 4. Task Lifecycle (Long Strategy)

The system guarantees traceability through mandatory phases and approval gates.

```mermaid
sequenceDiagram
    participant User as Developer
    participant Arch as Architect Agent
    participant Runtime as System Runtime

    User->>Arch: "Sync branch..."
    Arch->>Runtime: Phase 0: Acceptance Criteria
    Runtime-->>User: Validation Questions
    User->>Runtime: Answers (YES/NO)
    
    rect rgb(0, 213, 255)
        Note over Arch, Runtime: Phase 1: Research (Researcher Agent)
        Arch->>Runtime: Execute technical research
        Runtime-->>User: Research Report
        User->>Runtime: Approval (YES)
    end

    rect rgb(123, 47, 247)
        Note over Arch, Runtime: Phase 2: Analysis & Phase 3: Planning
        Arch->>Runtime: Create Implementation Plan
        Runtime-->>User: Detailed Plan (Subtasks/Agents)
        User->>Runtime: Approval (YES)
    end

    rect rgb(0, 150, 0)
        Note over Arch, Runtime: Phase 4: Implementation
        Arch->>Runtime: Delegation to Neo/Implementation Agent
        Runtime-->>User: Gate for each subtask
        User->>Runtime: Subtask Approval (YES)
    end

    Arch->>Runtime: Phase 5: Verification & Phase 6: Results
    Runtime-->>User: Final Report and Changelog
    User->>Runtime: Final Acceptance (YES)
```

---

## 5. Runtime vs Workspaces Interaction

The `Runtime` is the engine that coordinates constitution reading and artifact persistence.

```mermaid
flowchart LR
    W[Workspace Root] -->|Search| A[.agent/]
    A --> R[Rules]
    A --> WF[Workflows]
    R --> C[Constitution]
    WF --> P[Phase States]

    Runtime -->|Load| C
    Runtime -->|Advance| P
    Runtime -->|Persist| Art[Artifacts]

    style Runtime fill:#00d5ff,stroke:#005577,color:#fff
    style C fill:#ffcc00,stroke:#333
    style P fill:#7b2ff7,stroke:#fff,color:#fff
```

## 6. Portability (Agnosticism)

The ported system can now be installed as an NPM dependency:

1.  **CLI**: `npx agentic-workflow`
2.  **MCP**: Configured in the IDE as an STDIO server.
3.  **Core**: Programmatically usable by other automation scripts.
