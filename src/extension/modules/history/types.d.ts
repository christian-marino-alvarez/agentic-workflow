import type { Controller } from './controller.js';
import type { ModuleRegistration } from '../router/index.js';

export type TemplateParams = {
  nonce: string;
  scriptUri: string;
  cspSource: string;
};

export type HistoryDomain = {
  view: Controller;
};

export type HistoryModule = ModuleRegistration<HistoryDomain>;
