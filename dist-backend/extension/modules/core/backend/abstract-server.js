import fastify from 'fastify';
import cors from '@fastify/cors';
/**
 * Abstract implementation of a Backend Server sidecar.
 * Handles lifecycle, messaging bridge, and standard middleware.
 */
export class AbstractBackend {
    moduleName;
    server;
    port;
    host;
    name;
    constructor(moduleName, options = {}) {
        this.moduleName = moduleName;
        this.name = options.name || `${moduleName}-backend`;
        this.port = options.port || Number(process.env.PORT) || 3000;
        this.host = options.host || '127.0.0.1';
        this.server = fastify({
            logger: false // Manual logging for cleaner integration with VS Code Output
        });
        this.configure();
    }
    configure() {
        // Standard Middleware
        this.server.register(cors, {
            origin: true
        });
        // Health Check
        this.server.get('/health', async () => {
            return { status: 'ok', name: this.name, module: this.moduleName, timestamp: new Date().toISOString() };
        });
        // Global Error Handler
        this.server.setErrorHandler((error, request, reply) => {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`[${this.name}] Error:`, error);
            reply.status(500).send({ error: 'Internal Server Error', message: errorMessage });
        });
        // Register Command Endpoint
        this.server.post('/command', async (request, reply) => {
            const { command, data } = request.body;
            try {
                const result = await this.handleCommand(command, data);
                return { success: true, result };
            }
            catch (error) {
                console.error(`[${this.name}] Command Error (${command}):`, error);
                return { success: false, error: error instanceof Error ? error.message : String(error) };
            }
        });
    }
    /**
     * Start the server.
     */
    async start() {
        try {
            await this.server.listen({ port: this.port, host: this.host });
            console.log(`[${this.name}] Listening on http://${this.host}:${this.port}`);
        }
        catch (err) {
            console.error(`[${this.name}] Fatal Error:`, err);
            process.exit(1);
        }
    }
    /**
     * Stop the server.
     */
    async stop() {
        await this.server.close();
    }
}
//# sourceMappingURL=abstract-server.js.map