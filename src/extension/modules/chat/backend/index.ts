import fs from 'fs/promises';
import path from 'path';
import { BackendModulePlugin, wrapAsPlugin } from '../../../../backend/shared/module-provider.js';
import { registerChatKitRoutes } from './chatkit/chatkit-routes.js';

const chatBackendPlugin: BackendModulePlugin = async (context) => {
  // Registering ChatKit routes
  registerChatKitRoutes(context);

  context.get('/roles', async (request, reply) => {
    const rolesPath = path.resolve(process.cwd(), 'src/agentic-system-structure/rules/roles');

    try {
      const files = await fs.readdir(rolesPath);
      const roles = files
        .filter(f => f.endsWith('.md'))
        .map(f => f.replace('.md', ''));

      return { status: 'ok', roles };
    } catch (error) {
      context.log.error(error as Error);
      return reply.status(500).send({ error: 'Failed to read roles' });
    }
  });

  context.post('/create-agent', async (request, reply) => {
    const { role } = request.body as { role: string };
    return { status: 'ok', message: `Agent for role ${role} created (stub)` };
  });
};

export default wrapAsPlugin(chatBackendPlugin);
