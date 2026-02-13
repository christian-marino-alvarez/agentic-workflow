# Domain Integrity & Responsibility

## Severity: PERMANENT

## Principle
Classes MUST own their domain logic and state. Avoid "Anemic Domain Models" where classes are just data buckets and logic is scattered across controllers or service classes.

## Rules
1. **Encapsulation of Infrastructure**: Classes representing a domain concept (like `Messaging`) must encapsulate the infrastructure details they manage.
2. **Minimize Parameter Passing**: If a class manages a specific lifecycle or resource (like a VS Code `Webview`), that resource should be integrated into the class state or its internal transport, rather than being passed repeatedly to methods.
3. **Internal Listening**: Components that "listen" to events from a specific source should own that subscription logic internally.
4. **Decoupling via Interfaces**: When a domain class needs to interact with platform-specific APIs (like VS Code), it must do so through abstracted interfaces (e.g., `IMessageTransport`) that hide the platform details.

## Example (Messaging)
❌ **BAD**: Passing the webview to a method.
```typescript
messaging.listenToView(webview);
```

✅ **GOOD**: Messaging owns the lifecycle and platform connection.
```typescript
class Messaging implements WebviewViewProvider {
  constructor(private context: ExtensionContext, private id: string) {
    window.registerWebviewViewProvider(id, this);
  }

  public resolveWebviewView(v: WebviewView) {
    v.webview.onDidReceiveMessage(m => this.handle(m));
  }
}
```
