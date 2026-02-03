import { Logger } from '../../engine/logger.js';

export function withTrace<TParams, TResult>(name: string, handler: (params: TParams) => Promise<TResult> | TResult) {
  return async (params: TParams): Promise<TResult> => {
    Logger.info('MCPv2', `Inicio ${name}`);
    const result = await handler(params);
    Logger.info('MCPv2', `Fin ${name}`);
    return result;
  };
}
