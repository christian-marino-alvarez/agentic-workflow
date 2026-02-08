# Calculator Agent POC Demo

This directory contains a Proof of Concept (POC) demonstrating that `@openai/agents` works correctly in Node.js 20+, which is the runtime environment for VS Code Extension Host.

## Purpose

Verify compatibility between:
- **OpenAI Agents SDK** (`@openai/agents`)
- **Node.js 20.x** (VS Code Extension Host runtime)

## Files

- **test-import.js** - Basic import test (verifies SDK loads without errors)
- **agent-demo.ts** - Functional agent demo with calculator tool
- **run-demo.sh** - Script to execute the demo
- **package.json** - NPM configuration

## Quick Start

### 1. Set OpenAI API Key

```bash
export OPENAI_API_KEY="your-api-key-here"
```

Or create a `.env` file:
```
OPENAI_API_KEY=your-api-key-here
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Import Test

```bash
npm test
```

Expected output:
```
✅ SUCCESS: @openai/agents imported successfully!
✅ Agent class is available
```

### 4. Run Agent Demo

```bash
./run-demo.sh
```

Expected output:
```
🤖 Calculator Agent POC Demo
Node.js version: v20.x.x (or v22.x.x)

📝 Query: "What is 25 * 4?"
🔄 Processing...

✅ Response:
The result is 100.

✅ Demo completed successfully!
```

## What the Demo Proves

✅ **Import Success**: @openai/agents loads without Node.js version errors  
✅ **Agent Creation**: Can create agents with custom instructions  
✅ **Tool Calling**: Successfully executes tool functions  
✅ **Response Generation**: Agent produces coherent responses  
✅ **Node.js 20+ Compatible**: No runtime incompatibilities detected

## Architecture Decision

Based on this POC, the project will use:
- **Backend**: TypeScript running in VS Code Extension Host
- **SDK**: `@openai/agents` for multi-agent workflows
- **No additional runtime required**: Python or standalone Node.js NOT needed

See [ADR](../adr.md) for full decision documentation.

## Troubleshooting

### Error: OPENAI_API_KEY not set

**Solution**: Export the environment variable:
```bash
export OPENAI_API_KEY="sk-..."
```

### Error: Cannot Find Module

**Solution**: Install dependencies:
```bash
npm install
```

###  TypeScript Compilation Errors

**Solution**: Ensure TypeScript is available:
```bash
npx tsc --version
```

## Next Steps

After validating this POC, proceed with:
1. T014: POC Agents SDK Integration
2. T015: Backend Scaffolding
3. T016-T018: Multi-agent workflows implementation

---

**Related Documents**:
- [ADR](../adr.md) - Architecture Decision Record
- [Analysis](../../.agent/artifacts/5-spike-nodejs-compatibility/analysis.md)
- [Plan](../../.agent/artifacts/5-spike-nodejs-compatibility/plan.md)
