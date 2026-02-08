// POC: Verificar compatibilidad de @openai/agents con Node.js 20.x
console.log('Node.js version:', process.version);
console.log('Attempting to import @openai/agents...\n');

try {
  // Intentar importar el módulo
  const agents = await import('@openai/agents');
  console.log('✅ SUCCESS: @openai/agents imported successfully!');
  console.log('Available exports:', Object.keys(agents));

  // Verificar que Agent class existe
  if (agents.Agent) {
    console.log('✅ Agent class is available');
  }

  process.exit(0);
} catch (error) {
  console.error('❌ FAILED: Could not import @openai/agents');
  console.error('Error:', error.message);

  if (error.message.includes('ERR_UNSUPPORTED_ENGINE')) {
    console.error('\n🔴 INCOMPATIBLE: This package requires a different Node.js version');
  }

  process.exit(1);
}
