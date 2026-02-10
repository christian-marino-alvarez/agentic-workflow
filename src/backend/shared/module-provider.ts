import type { FastifyInstance, FastifyPluginOptions } from 'fastify';

/**
 * Definición genérica para un módulo del backend.
 */
export interface BackendModuleContext {
  get(path: string, handler: (request: any, reply: any) => Promise<any>): void;
  get(path: string, options: any, handler: (request: any, reply: any) => Promise<any>): void;
  post(path: string, handler: (request: any, reply: any) => Promise<any>): void;
  post(path: string, options: any, handler: (request: any, reply: any) => Promise<any>): void;
  log: {
    info(msg: string): void;
    error(msg: string | Error): void;
  };
}

export type BackendModulePlugin = (context: BackendModuleContext) => Promise<void>;

/**
 * Adaptador para convertir un BackendModulePlugin en un plugin de Fastify.
 */
export function wrapAsPlugin(plugin: BackendModulePlugin) {
  return async (fastify: FastifyInstance, opts: FastifyPluginOptions) => {
    const context: BackendModuleContext = {
      get: (path: string, ...args: any[]) => (fastify as any).get(path, ...args),
      post: (path: string, ...args: any[]) => (fastify as any).post(path, ...args),
      log: fastify.log
    };
    await plugin(context);
  };
}
