import { FastifyInstance } from 'fastify';

/**
 * Interface for a Virtual Server (Backend) that runs dependent on a physical server.
 * Instead of having its own process and port, it registers routes/logic on an existing AbstractBackend.
 */
export interface VirtualBackend {
  /**
   * Register the virtual backend on the host server.
   * @param server The Fastify instance of the physical server.
   * @param prefix Optional prefix for routes (e.g. /chat, /auth).
   */
  register(server: FastifyInstance, prefix?: string): Promise<void>;
}

/**
 * Base class for creating Virtual Backends.
 */
export abstract class AbstractVirtualBackend implements VirtualBackend {
  constructor(protected readonly moduleName: string) { }

  public async register(server: FastifyInstance, prefix?: string): Promise<void> {
    const routePrefix = prefix || `/${this.moduleName}`;

    console.log(`[VirtualBackend:${this.moduleName}] Registering at ${routePrefix}`);

    server.register(async (instance) => {
      this.configureRoutes(instance);
    }, { prefix: routePrefix });
  }

  /**
   * Implement route configuration here.
   * @param instance Scoped Fastify instance (with prefix).
   */
  protected abstract configureRoutes(instance: FastifyInstance): void;
}
