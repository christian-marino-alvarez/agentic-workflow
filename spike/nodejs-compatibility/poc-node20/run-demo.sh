#!/bin/bash

# POC Demo Runner
# Executes the Calculator Agent demo to verify @openai/agents functionality

set -e

echo "🚀 Starting Calculator Agent POC Demo"
echo "======================================"
echo ""

# Check Node.js version
echo "📦 Node.js version:"
node --version
echo ""

# Check if OPENAI_API_KEY is set
if [ -z "$OPENAI_API_KEY" ]; then
    echo "⚠️  Warning: OPENAI_API_KEY not set"
    echo "The demo requires an OpenAI API key to function."
    echo ""
    echo "To set your API key:"
    echo "  export OPENAI_API_KEY='your-api-key-here'"
    echo ""
    echo "Or create a .env file with:"
    echo "  OPENAI_API_KEY=your-api-key-here"
    echo ""
    exit 1
fi

# Compile TypeScript
echo "🔨 Compiling TypeScript..."
npx tsc agent-demo.ts --lib es2015,dom --module commonjs --target es2015 --esModuleInterop

# Run the demo
echo ""
echo "▶️  Running demo..."
echo ""
node agent-demo.js

# Clean up compiled JS
rm -f agent-demo.js

echo ""
echo "✅ Demo execution complete!"
