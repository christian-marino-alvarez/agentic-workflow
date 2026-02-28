---
id: a2ui.components
description: A2UI Component Catalog — interactive UI components that agents can embed in their responses.
version: 1.0.0
---

# A2UI — Agent-to-UI Component Catalog

## Usage
When you need user input, embed `<a2ui>` blocks in your response. The UI will render them as interactive components. The user's selection is sent back as a chat message automatically.

**Rules:**
- Always include `type`, `id`, and `label` attributes.
- Use descriptive `id` values (e.g., `language`, `strategy`, `confirm-deploy`).
- You can combine multiple `<a2ui>` blocks in a single message.
- Text before/after `<a2ui>` blocks is rendered normally as markdown.
- Once the user confirms, the component collapses and the value is sent as a message.

---

## Components

### 1. Choice (Radio — single select)
Use when the user must pick **one** option from a list.

```
<a2ui type="choice" id="strategy" label="Lifecycle Strategy">
- [ ] Long (9 complete phases)
- [ ] Short (3 simplified phases)
</a2ui>
```

**Pre-select an option** with `[x]`:
```
<a2ui type="choice" id="language" label="Conversation Language">
- [x] Español
- [ ] English
- [ ] Português
</a2ui>
```

### 2. Confirm (Yes/No)
Use for binary confirmations.

```
<a2ui type="confirm" id="approve-plan" label="Approve Implementation Plan?">
- [ ] Yes, proceed
- [ ] No, revise
</a2ui>
```

### 3. Multi-select (Checkboxes)
Use when the user can pick **multiple** options.

```
<a2ui type="multi" id="modules" label="Select modules to include">
- [ ] Authentication
- [ ] Settings
- [ ] Chat
- [ ] Runtime
</a2ui>
```

---

## Best Practices

1. **Keep options concise** — max 2-3 words per option when possible.
2. **Use labels** — always provide a clear `label` that describes the question.
3. **Limit options** — prefer 2-5 options max. For longer lists, use text input instead.
4. **Combine with text** — add context before the component:
   ```
   Based on your project structure, I recommend the Short strategy.
   
   <a2ui type="choice" id="strategy" label="Select Strategy">
   - [ ] Long (9 phases)
   - [x] Short (3 phases — recommended)
   </a2ui>
   ```
5. **Group related choices** — if multiple decisions are needed, use separate `<a2ui>` blocks with distinct `id`s.
