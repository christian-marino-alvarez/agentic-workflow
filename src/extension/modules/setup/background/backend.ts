import { FastifyInstance, FastifyPluginOptions } from 'fastify';

export default async function (fastify: FastifyInstance, opts: FastifyPluginOptions) {
  fastify.get('/config', async (request, reply) => {
    return { status: 'ok', config: {} };
  });

  fastify.post('/config', async (request, reply) => {
    return { status: 'ok', message: 'Config saved (stub)' };
  });
}
