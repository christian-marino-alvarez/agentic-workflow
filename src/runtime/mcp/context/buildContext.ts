import { Logger } from '../../engine/logger.js';

export type McpContext = {
  logger: Logger;
};

export function buildContext(): McpContext {
  return { logger: Logger.getInstance() };
}
