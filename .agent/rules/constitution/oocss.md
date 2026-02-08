---
kind: rule
name: oocss
source: architect-agent
---

# OOCSS Constitution (Object-Oriented CSS)

type: rules
version: 1
status: injected
scope: global

---

## 1. Core Principles

The objective of OOCSS is to create a maintainable, scalable, and reusable CSS framework by following two main principles:

### 1.1 Separation of Structure from Skin
- **Structure**: Layout and spacing (e.g., width, height, padding, margin, display, position).
- **Skin**: Colors, borders, shadows, and fonts (e.g., background, color, border-color, font-weight).
- **Rule**: Define base objects solely for structure. Apply skins via modifiers.

### 1.2 Separation of Container from Content
- **Rule**: A component MUST look and function the same regardless of its parent container.
- **Rule**: Never use location-dependent selectors (e.g., `.sidebar .btn`). Instead, use classes that describe the object itself.

---

## 2. Naming Conventions (BEM-light)

We use a simplified BEM (Block Element Modifier) convention to support OOCSS:

- **Block (Object)**: `.btn`, `.card`, `.field`
- **Modifier (Skin)**: `.btn--primary`, `.card--active`, `.alert--error`
- **Element**: `.card__title`, `.field__label` (Use sparingly; prefer independent objects when possible).

---

## 3. Mandatory Rules

1.  **Strict Variable Usage**: ALL colors and theme-dependent properties MUST use VS Code CSS variables (`--vscode-*`).
2.  **No Inline Styles**: Using the `style` attribute in HTML/Lit is STRICTLY PROHIBITED.
3.  **Encapsulation**: Styles MUST be scoped at the component level (e.g., in Lit components).
4.  **No Nesting over 2 levels**: Deeply nested CSS selectors lead to high specificity and fragile styles. Avoid them.
5.  **Reusability**: Shared objects MUST reside in `common/css/` and be imported by specialized views.

---

## 4. Examples

### 4.1 Base Objects (Structure)
```css
/* common/css/index.ts */
.btn {
  display: inline-flex;
  padding: 8px 12px;
  border-radius: 2px;
  cursor: pointer;
  border: 1px solid transparent;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
```

### 4.2 Skins (Modifiers)
```css
/* common/css/index.ts */
.btn--primary {
  background: var(--vscode-button-background);
  color: var(--vscode-button-foreground);
}

.btn--secondary {
  background: var(--vscode-button-secondaryBackground);
  color: var(--vscode-button-secondaryForeground);
}
```

### 4.3 Implementation (HTML/Lit)
```typescript
/* html/index.ts */
html`
  <div class="field">
    <label class="label">Username</label>
    <input class="input" type="text" />
  </div>
  <button class="btn btn--primary">Submit</button>
`
```
