# Task Candidate

- title: T032: Runtime Server & Action Sandbox
- objective: Implement a dedicated runtime process/server to execute Agent actions (File I/O, Command Execution) with a permission/sandboxing layer (Allow/Deny prompts).
- description: Develop a robust backend runtime (likely Node.js/Electron sidecar) that handles dangerous operations isolated from the Extension Host. It must support a permission model to request user approval for sensitive actions.
- strategy: long
