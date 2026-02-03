import { Logger } from '../../engine/logger.js';

export function withAudit<TParams, TResult>(name: string, handler: (params: TParams) => Promise<TResult> | TResult) {
  return async (params: TParams): Promise<TResult> => {
    Logger.info('MCPv2', `Audit ${name}`);
    return handler(params);
  };
}
