import { FastifyInstance } from 'fastify';

/**
 * Módulo de ejemplo que integra (mock) @openai/agents
 * @param server Instancia de Fastify
 */
export default async function helloWorldAgent(server: FastifyInstance) {
  server.get('/demo', async (request, reply) => {
    // Aquí invocariamos la librería @openai/agents
    // const agent = new Agent({ name: "Demo" });
    // const result = await agent.run(...)

    // Mock response
    return {
      status: 'success',
      agent: 'Hello World Agent',
      message: 'This is a response from the backend sidecar using Node.js environment.',
      library_check: '@openai/agents integration ready'
    };
  });
}
