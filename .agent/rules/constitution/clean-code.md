# Clean Code Rules

type: rules
version: 2
status: injected
scope: global

---

## Purpose

This document defines the **mandatory Clean Code rules** for all source code
and workflows in this project.

These rules are inspired by **Robert C. Martin – Clean Code** and adapted to:
- TypeScript + ES Modules
- Modular systems
- Multi-agent workflows

Any code that violates these rules MUST be considered incomplete.

---

## 1. Naming Rules (Clarity over Cleverness)

### 1.1 General
- Names MUST reveal intent.
- Names MUST NOT require comments to be understood.
- Avoid abbreviations unless they are domain-standard (`id`, `url`, `api`).

### 1.2 Variables
- Use **nouns** for variables.
- Avoid generic names: `data`, `info`, `tmp`, `value`.

❌ `let data;`  
✅ `let activeTabId;`

### 1.3 Functions / Methods
- Use **verbs** or verb phrases.
- Names MUST describe exactly **one responsibility**.

❌ `handleStuff()`  
✅ `persistSessionState()`

### 1.4 Classes
- Use **nouns**.
- One clear domain responsibility per class.

❌ `Manager`, `Processor`, `Helper`  
✅ `StorageDriver`, `TabsEngine`

---

## 2. Functions & Methods (Small and Focused)

### 2.1 Size
- A function MUST do **one thing only**.
- Recommended maximum:
  - **4–6 lines**
  - **0–3 parameters**

If it exceeds this, it MUST be split.

### 2.2 Parameters
- Prefer **objects** over multiple parameters.
- Avoid boolean flags (they hide responsibility branches).

❌ `loadTab(id, true)`  
✅ `loadTab({ id, forceReload })`

---

## 3. Single Responsibility Principle (Strict)

- Every function, class, and file MUST have **one reason to change**.
- Mixing concerns is forbidden.

Examples of forbidden mixes:
- UI logic + storage logic
- Browser API calls + business rules
- Validation + mutation

---

## 4. Comments (Last Resort)

### 4.1 Rules
- Comments MUST NOT explain *what* the code does.
- Comments MAY explain *why* something non-obvious exists.

If a comment is needed to explain *what*, the code is wrong.

### 4.2 Forbidden
- Commented-out code
- TODO without owner or intent

---

## 5. Error Handling (Explicit and Local)

- Errors MUST be handled where they occur.
- Do NOT silently ignore errors.
- Do NOT use generic `catch (e) {}` blocks.

❌
```ts
try { doSomething(); } catch {}
```

✅
```ts
try { doSomething(); }
catch (error) {
  throw new StorageInitializationError(error);
}
```

---

## 6. Formatting & Structure

### 6.1 Consistency
- Follow existing project conventions.
- Similar concepts MUST look similar.

### 6.2 Class Member Order (MANDATORY)

1. Static properties  
2. Static methods  
3. Instance properties  
4. constructor  
5. Event handlers / listeners  
6. Private methods  
7. Public methods  

Any deviation is a violation.

---

## 7. Files & Modules

- One primary responsibility per file.
- File name MUST match the main exported concept.
- Avoid “utils” files unless the domain is explicit.

❌ `utils.ts`  
✅ `tab-url-normalizer.ts`

---

## 8. Integration Layers

- Integration layers MUST be thin facades.
- NO business logic inside adapters or transport layers.
- Environment-specific adaptations ONLY.

---

## 9. Modules

- Modules MUST be domain-focused.
- Modules MUST communicate ONLY through reactive storage or defined APIs.
- No direct cross-module imports unless explicitly allowed.

---

## 10. Duplication & Abstraction

- Duplication is preferred over **wrong abstraction**.
- Abstract ONLY when at least **two concrete implementations exist**.
- Avoid mechanical duplication where the logic is identical and only the input or label changes.
- If two loops/processes differ only by a type string or list, extract a small function or data-driven loop.

---

## 11. Tests & Verifiability (Conceptual)

- Code MUST be verifiable in isolation.
- Hidden side effects are forbidden.
- Deterministic behavior is mandatory.

## 11.1 TypeScript Compile Gate (MANDATORY)

- `npm run compile` MUST succeed before any phase gate can be approved.
- If compile fails, the phase is considered **BLOCKED** until fixed.

---

## 12. Clean Code Gate

Any agent, workflow, or human contributor MUST ensure:

- Code reads like **well-written prose**
- Intent is obvious without explanation
- No fear when modifying the code

If modifying code feels risky, it is **not clean**.

---

## Authority

Inspired by:
- Robert C. Martin – *Clean Code*
- Robert C. Martin – *Clean Architecture*

Adapted for this project.

This rule set is **binding** when referenced as `INJECTED`.
