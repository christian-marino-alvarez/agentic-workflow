---
kind: rule
name: constant-driven-types
source: project-architect
---

# Constant-Driven Types

type: rules
version: 1
status: injected
scope: global

---

## Purpose

This document defines the **mandatory pattern** for defining enumeration-like literals and their types within the core infrastructure. This ensures a **single source of truth** (SSoT) and prevents duplication of literal values across types and implementation.

---

## 1. The Pattern (MANDATORY)

Every set of related literal values MUST be defined following these two steps:

### 1.1 Step 1: Immutable Constant Definition
Define the values as a `const` object with `as const` in a `constants.ts` file.

```typescript
// src/extension/core/constants.ts
export const ViewStage = {
  Resolve: 'resolve',
  Connect: 'connect',
  Ready: 'ready'
} as const;
```

### 1.2 Step 2: Derived Type Definition
Derive the type from the constant in the `types.d.ts` file using `typeof` and indexed access.

```typescript
// src/extension/core/types.d.ts
import { ViewStage } from './constants.js';

export type ViewStage = typeof ViewStage[keyof typeof ViewStage];
```

---

## 2. Benefits
- **Single Source of Truth**: Litera strings are only written once.
- **Type Safety**: The type automatically stays in sync with the constant.
- **IDE Support**: Auto-completion works for both the constant keys and the resulting type values.

---

## 3. Ambiguity Resolution (index.ts)

When exporting both the Type and the Constant from a central `index.ts`, you MUST use explicit exports if there is a name collision, as TypeScript namespaces types and values separately but wildcard exports can cause resolution issues.

```typescript
// ✅ CORRECT
export { type ViewStage } from './types.js';
export { ViewStage } from './constants.js';
```

---

## 4. Forbidden
- ❌ Defining literal unions directly in types (e.g., `type Stage = 'a' | 'b'`).
- ❌ Duplicating literal strings in multiple files.
- ❌ Using standard TypeScript `enum` (use `const` + `as const` pattern instead).
