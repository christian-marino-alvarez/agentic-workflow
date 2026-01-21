---
trigger: always_on
---

# PROJECT ARCHITECTURE - FRAMEWORK RULES

This document defines the **fundamental architectural principles** of the project. For detailed contractual rules of each component, consult their specific constitution.

---

## 1. ARCHITECTURAL PRINCIPLES (PERMANENT)

### 1.1 Base Philosophy
The Agentic Workflow framework is built on the principle of **Maximum Discipline**. It assumes that AI agents are more effective when their autonomy is constrained by strict lifecycles and human approval gates.

### 1.2 Independence and Dependency Direction
- All components MUST be independent and versionable.
- The framework is decoupled from any specific implementation (e.g., Extensio).
- It relies on **Architecture by Reference** to maintain a clean local environment.

### 1.3 Separation of Concerns
- The SRP (Single Responsibility Principle) MUST be strictly applied to all rules, workflows, and tools.

---

## 2. PROJECT SCOPES (PERMANENT)

### 2.1 Core Orchestration
- Workflows, lifecycle management, and gate enforcement logic.

### 2.2 CLI & Tooling
- Initialization, maintenance, and developer assistance utilities.

### 2.3 Rules & Constitution
- The legal framework governing agent behavior.

---

## 3. CORE CONCEPTS (PERMANENT)

- **AHRP**: Agentic Handover & Reasoning Protocol.
- **Gate**: Synchronous approval checkpoint.
- **Artifact**: Verifiable document of record for each phase.
- **Score 0**: Automatic penalty for protocol violation.

---

## 4. CONSTITUTIONS

For detailed contractual rules, consult:

| Component | Constitution |
|-----------|--------------|
| System    | `constitution.agent_system` |
| Behavior  | `constitution.agents_behavior` |
| Clean Code| `constitution.clean_code` |
| Architecture| `constitution.project_architecture` |
