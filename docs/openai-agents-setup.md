# OpenAI Agents SDK - Setup Guide for VS Code Extension Host

This guide explains how to use `@openai/agents` SDK within a VS Code Extension Host environment.

## Prerequisites

### Node.js Version

- **Minimum**: Node.js 20.x
- **Recommended**: Node.js 20.x or 22.x
- **VS Code Extension Host**: Uses Node.js 20.12.1 (compatible)

### Verification

The project includes a compatibility spike that verified:
✅ `@openai/agents` works on Node.js 20+  
✅ No explicit `engines` restriction in package.json  
✅ Successfully tested import and execution

See: `spike/nodejs-compatibility/` for POC evidence

---

## Installation

### 1. Add Dependency

The SDK is already included in `package.json`:

```json
{
  "dependencies": {
    "@openai/agents": "^0.4.5",
    "openai": "^6.17.0"
  }
}
```

### 2. Install Packages

```bash
npm install
```

---

## Basic Usage

### Creating an Agent

```typescript
import { Agent } from '@openai/agents';

const myAgent = new Agent({
  name: 'My Assistant',
  instructions: 'You are a helpful assistant that...',
  model: 'gpt-4',
  tools: [] // Optional tools
});
```

### Running an Agent

```typescript
import { Runner } from '@openai/agents';

const runner = new Runner({
  agent: myAgent
});

const result = await runner.run({
  messages: [
    { role: 'user', content: 'Hello!' }
  ]
});

console.log(result.messages);
```

### Adding Tools

```typescript
const calculatorTool = {
  type: 'function' as const,
  function: {
    name: 'calculator',
    description: 'Performs arithmetic',
    parameters: {
      type: 'object',
      properties: {
        operation: { type: 'string', enum: ['add', 'subtract'] },
        a: { type: 'number' },
        b: { type: 'number' }
      },
      required: ['operation', 'a', 'b']
    }
  }
};

const agent = new Agent({
  name: 'Calculator',
  instructions: 'Use the calculator tool for math',
  tools: [calculatorTool]
});

// Register tool handler
agent.use(async (context, next) => {
  // Tool execution logic here
  return next();
});
```

---

## Best Practices for Extension Host

### 1. Performance Considerations

**Problem**: Complex agent workflows can block VS Code UI.

**Solutions**:
- Implement request queuing for concurrent executions
- Set reasonable timeouts (e.g., 30s max per agent run)
- Consider using VS Code's progress API for long-running operations:

```typescript
await vscode.window.withProgress({
  location: vscode.ProgressLocation.Notification,
  title: 'Running agent...'
}, async (progress) => {
  const result = await runner.run({ messages });
  return result;
});
```

### 2. Error Handling

**Always handle errors gracefully**:

```typescript
try {
  const result = await runner.run({ messages });
  // Process result
} catch (error) {
  if (error instanceof Error) {
    vscode.window.showErrorMessage(
      `Agent error: ${error.message}`
    );
  }
  // Fallback behavior
}
```

### 3. API Key Management

**DO NOT hardcode API keys**. Use VS Code's SecretStorage:

```typescript
// Store API key
await context.secrets.store('openai-api-key', apiKey);

// Retrieve API key
const apiKey = await context.secrets.get('openai-api-key');

// Use in OpenAI client
const openai = new OpenAI({ apiKey });
```

### 4. Resource Cleanup

**Clean up resources after agent execution**:

```typescript
let runner: Runner | undefined;

try {
  runner = new Runner({ agent: myAgent });
  const result = await runner.run({ messages });
  // Use result
} finally {
  // Cleanup if needed
  runner = undefined;
}
```

### 5. Streaming Responses

**For better UX, use streaming**:

```typescript
const stream = await runner.stream({
  messages: [{ role: 'user', content: query }]
});

for await (const chunk of stream) {
  if (chunk.type === 'message') {
    // Update UI with partial response
    updateChatUI(chunk.content);
  }
}
```

---

## Common Patterns

### Pattern 1: Simple Q&A Agent

```typescript
async function askAgent(query: string): Promise<string> {
  const agent = new Agent({
    name: 'Assistant',
    instructions: 'Answer questions concisely',
    model: 'gpt-4'
  });
  
  const runner = new Runner({ agent });
  const result = await runner.run({
    messages: [{ role: 'user', content: query }]
  });
  
  const lastMessage = result.messages[result.messages.length - 1];
  if (lastMessage.role === 'assistant' && lastMessage.content) {
    return lastMessage.content;
  }
  
  throw new Error('No response from agent');
}
```

### Pattern 2: Agent with Handoff

```typescript
import { Handoff } from '@openai/agents';

const specialistAgent = new Agent({ name: 'Specialist', ...config });

const mainAgent = new Agent({
  name: 'Main',
  instructions: 'Transfer complex questions to specialist',
  handoffs: [
    new Handoff({ agent: specialistAgent, description: 'For complex queries' })
  ]
});
```

### Pattern 3: Conversation History

```typescript
class AgentSession {
  private messages: Array<{ role: string; content: string }> = [];
  
  async chat(userMessage: string): Promise<string> {
    this.messages.push({ role: 'user', content: userMessage });
    
    const runner = new Runner({ agent: this.agent });
    const result = await runner.run({ messages: this.messages });
    
    // Update history with full conversation
    this.messages = result.messages;
    
    return this.getLastAssistantMessage();
  }
}
```

---

## Troubleshooting

### Issue: "Module not found: @openai/agents"

**Solution**:
```bash
npm install @openai/agents
```

### Issue: API Key Errors

**Solution**: Ensure API key is set:
```typescript
const apiKey = await context.secrets.get('openai-api-key');
if (!apiKey) {
  vscode.window.showErrorMessage('Please configure OpenAI API key');
  return;
}
```

### Issue: Slow Response Times

**Possible causes**:
- Network latency
- Complex prompts/tools
- Model selection

**Solutions**:
- Use streaming for better perceived performance
- Show progress indicator
- Consider using `gpt-4-turbo` for faster responses
- Implement timeout handling

### Issue: Extension Host Crashes

**If the extension crashes**:
- Check for unhandled promise rejections
- Verify you're not blocking the main thread
- Review error logs in VS Code Developer Tools

---

## Testing

### Unit Testing Agents

```typescript
import { describe, it, expect } from 'vitest';

describe('Calculator Agent', () => {
  it('should perform addition', async () => {
    const result = await runner.run({
      messages: [{ role: 'user', content: 'What is 2 + 2?' }]
    });
    
    expect(result.messages).toContainEqual(
      expect.objectContaining({
        role: 'assistant',
        content: expect.stringContaining('4')
      })
    );
  });
});
```

### Integration Testing

See `spike/nodejs-compatibility/poc-node20/` for example integration tests.

---

## Resources

- **Official Docs**: https://github.com/openai/openai-agents
- **ADR**: `spike/nodejs-compatibility/adr.md`
- **POC Demo**: `spike/nodejs-compatibility/poc-node20/`
- **OpenAI API Docs**: https://platform.openai.com/docs

---

## Next Steps

After setup:
1. Implement agent workflows (T016)
2. Create API endpoints (T017)
3. Add streaming support (T018)

See `ROADMAP-BACKLOG.md` for full task list.
