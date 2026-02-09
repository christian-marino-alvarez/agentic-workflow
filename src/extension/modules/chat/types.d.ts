import type { ChatController } from './background/index.js';
import type { ModuleRegistration } from '../router/index.js';
import { Tab, MessageType } from './constants.js';

export type Tab = typeof Tab[keyof typeof Tab];
export type MessageType = typeof MessageType[keyof typeof MessageType];

export type TemplateParams = {
  nonce: string;
  scriptUri: string;
  cspSource: string;
};

export type ChatViewState = {
  tab: Tab;
};

export type ChatDomain = {
  view: ChatController;
};

export type ChatModule = ModuleRegistration<ChatDomain>;

export type StateUpdateMessage = {
  type: MessageType;
  tab: Tab;
  activeModelId?: string;
  activeEnvironment: 'dev' | 'pro';
};
