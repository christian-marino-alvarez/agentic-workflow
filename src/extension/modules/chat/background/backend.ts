import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import fs from 'fs/promises';
import path from 'path';

export default async function (fastify: FastifyInstance, opts: FastifyPluginOptions) {
  fastify.get('/roles', async (request, reply) => {
    // Path to agent roles
    // In production, this might be relative to the bundle or configured via env
    const rolesPath = path.resolve(process.cwd(), 'src/agentic-system-structure/rules/roles');

    try {
      const files = await fs.readdir(rolesPath);
      const roles = files
        .filter(f => f.endsWith('.md'))
        .map(f => f.replace('.md', ''));

      return { status: 'ok', roles };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to read roles' });
    }
  });

  fastify.post('/create-agent', async (request, reply) => {
    const { role } = request.body as { role: string };
    // Logic to create OpenAI Agent from Markdown role...
    return { status: 'ok', message: `Agent for role ${role} created (stub)` };
  });
}
