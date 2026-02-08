import { Agent, Runner } from '@openai/agents';

/**
 * POC Demo: Calculator Assistant Agent
 * 
 * This demo demonstrates@openai/agents running successfully in VS Code Extension Host
 * Features:
 * - Agent with custom instructions
 * - Tool calling (calculator)
 * - Response streaming
 */

// Define calculator tool
const calculatorTool = {
  type: 'function' as const,
  function: {
    name: 'calculator',
    description: 'Performs basic arithmetic operations (add, subtract, multiply, divide)',
    parameters: {
      type: 'object',
      properties: {
        operation: {
          type: 'string',
          enum: ['add', 'subtract', 'multiply', 'divide'],
          description: 'The arithmetic operation to perform'
        },
        a: {
          type: 'number',
          description: 'First number'
        },
        b: {
          type: 'number',
          description: 'Second number'
        }
      },
      required: ['operation', 'a', 'b']
    }
  }
};

// Calculator tool implementation
function executeCalculator(args: { operation: string; a: number; b: number }): number {
  const { operation, a, b } = args;

  switch (operation) {
    case 'add':
      return a + b;
    case 'subtract':
      return a - b;
    case 'multiply':
      return a * b;
    case 'divide':
      if (b === 0) throw new Error('Division by zero');
      return a / b;
    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
}

// Create the agent
const calculatorAgent = new Agent({
  name: 'Calculator Assistant',
  instructions: `You are a helpful calculator assistant. When users ask for mathematical calculations,
use the calculator tool to perform the operations accurately. Always show your work and provide
clear explanations of the results.`,
  tools: [calculatorTool],
  model: 'gpt-4' // or process.env.OPENAI_MODEL || 'gpt-4'
});

// Register tool handler
calculatorAgent.use(async (context, next) => {
  const { messages } = context;

  for (const message of messages) {
    if (message.tool_calls) {
      for (const toolCall of message.tool_calls) {
        if (toolCall.function.name === 'calculator') {
          const args = JSON.parse(toolCall.function.arguments);
          const result = executeCalculator(args);

          // Add tool response to context
          context.messages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: result.toString()
          });
        }
      }
    }
  }

  return next();
});

// Main demo function
async function runDemo() {
  console.log('🤖 Calculator Agent POC Demo');
  console.log('===============================\n');
  console.log(`Node.js version: ${process.version}\n`);

  // Verify API key
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ Error: OPENAI_API_KEY environment variable not set');
    console.error('Please set your OpenAI API key:');
    console.error('  export OPENAI_API_KEY="your-api-key-here"\n');
    process.exit(1);
  }

  try {
    // Create runner
    const runner = new Runner({
      agent: calculatorAgent
    });

    // Test query
    const query = 'What is 25 * 4?';
    console.log(`📝 Query: "${query}"\n`);
    console.log('🔄 Processing...\n');

    // Run the agent
    const result = await runner.run({
      messages: [
        {
          role: 'user',
          content: query
        }
      ]
    });

    // Display result
    console.log('✅ Response:');
    console.log('---');

    for (const message of result.messages) {
      if (message.role === 'assistant' && message.content) {
        console.log(message.content);
      }
    }

    console.log('---\n');
    console.log('✅ Demo completed successfully!');
    console.log(`📊 Total messages: ${result.messages.length}`);

  } catch (error) {
    console.error('❌ Error running demo:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  runDemo().catch(console.error);
}

export { calculatorAgent, runDemo };
