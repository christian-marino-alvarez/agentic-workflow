import type { Controller } from './background/index.js';
import type { ModuleRegistration } from '../router/index.js';
import { Tab, MessageType } from './constants.js';

export type Tab = typeof Tab[keyof typeof Tab];
export type MessageType = typeof MessageType[keyof typeof MessageType];

export type ChatDomain = {
  view: Controller;
};

export type ChatModule = ModuleRegistration<ChatDomain>;

export type StateUpdateMessage = {
  type: typeof MessageType.StateUpdate;
  tab: Tab;
};
