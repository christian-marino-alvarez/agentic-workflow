import type { ChatController } from './background/index.js';
import type { ModuleRegistration } from '../router/index.js';
import type { ModelConfig } from '../../providers/index.js';
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
  models?: ModelConfig[];
  activeModelId?: string;
  activeEnvironment: 'dev' | 'pro';
  sessionKey?: string;
};

export type ModelProposalData = {
  currentModel: string;
  proposedModel: string;
  reason: string;
  phase: string;
  estimatedSavings: {
    cost: number;
    speed: number;
  };
};

export type ModelProposalMessage = {
  type: typeof MessageType.ModelProposal;
  proposal: ModelProposalData;
};

export type ModelDecisionMessage = {
  type: typeof MessageType.ModelDecision;
  accepted: boolean;
  proposal: ModelProposalData;
};
