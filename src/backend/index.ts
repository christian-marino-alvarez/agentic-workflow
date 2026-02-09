import { createServer } from './app.js';

/**
 * Start the server
 */
const start = async () => {
  const server = await createServer();
  try {
    const port = Number(process.env.PORT) || 3000;
    await server.listen({ port, host: '127.0.0.1' });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
