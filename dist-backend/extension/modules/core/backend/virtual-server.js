/**
 * Base class for creating Virtual Backends.
 */
export class AbstractVirtualBackend {
    moduleName;
    constructor(moduleName) {
        this.moduleName = moduleName;
    }
    async register(server, prefix) {
        const routePrefix = prefix || `/${this.moduleName}`;
        console.log(`[VirtualBackend:${this.moduleName}] Registering at ${routePrefix}`);
        server.register(async (instance) => {
            this.configureRoutes(instance);
        }, { prefix: routePrefix });
    }
}
//# sourceMappingURL=virtual-server.js.map