import { IModule } from '../core/module.js';

export const NAME = 'settings';

export const SETTINGS = {
  id: 'settings',
  viewId: 'settings-view',
};

export const SETTINGS_MODULE: IModule = {
  id: 'settings',
  label: 'Settings',
  icon: 'extension', // TODO: Customize icon
  viewComponent: 'settings-view'
};

/**
 * Message routing scopes.
 * Defines the targets for sendMessage calls.
 */
export const SCOPES = {
  /** Background handler that processes Settings requests */
  BACKGROUND: 'settings',
  /** View layer target for responses */
  VIEW: 'view',
};

export const COMMANDS = {
  MODEL_GET: 'MODEL_GET',
  MODEL_SAVE: 'MODEL_SAVE',
  MODEL_DELETE: 'MODEL_DELETE',
  MODEL_SELECT: 'MODEL_SELECT',
  MODEL_GET_ACTIVE: 'MODEL_GET_ACTIVE',
};

export const MESSAGES = {
  GET_REQUEST: 'MODEL_GET_REQUEST',
  SAVE_REQUEST: 'MODEL_SAVE_REQUEST',
  DELETE_REQUEST: 'MODEL_DELETE_REQUEST',
  SELECT_REQUEST: 'MODEL_SELECT_REQUEST',
  TEST_CONNECTION_REQUEST: 'MODEL_TEST_CONNECTION_REQUEST',
  // Google OAuth
  SAVE_GOOGLE_CLIENT_ID: 'SAVE_GOOGLE_CLIENT_ID',
  GET_GOOGLE_CREDENTIALS: 'GET_GOOGLE_CREDENTIALS',
  REMOVE_GOOGLE_CREDENTIALS: 'REMOVE_GOOGLE_CREDENTIALS',
  // OpenAI OAuth
  SAVE_OPENAI_CLIENT_ID: 'SAVE_OPENAI_CLIENT_ID',
  GET_OPENAI_CREDENTIALS: 'GET_OPENAI_CREDENTIALS',
  REMOVE_OPENAI_CREDENTIALS: 'REMOVE_OPENAI_CREDENTIALS',
};

// Enum for Settings View State
export enum ViewState {
  LOADING = 'LOADING',
  LIST = 'LIST',
  FORM = 'FORM',
  OAUTH_SETUP = 'OAUTH_SETUP',
}

export const DELETE_TIMEOUT = 3000;


export const PROVIDERS = {
  GEMINI: 'gemini',
  CODEX: 'codex',
  CLAUDE: 'claude',
} as const;

export const AUTH_TYPES = {
  API_KEY: 'apiKey',
  OAUTH: 'oauth',
} as const;

export const PROVIDER_URLS = {
  CODEX: 'https://api.openai.com/v1/models',
  GEMINI: 'https://generativelanguage.googleapis.com/v1beta/models',
  CLAUDE: 'https://api.anthropic.com/v1/models',
} as const;

export const PROVIDER_HEADERS = {
  CODEX: {
    AUTH_KEY: 'Authorization',
    AUTH_PREFIX: 'Bearer',
  },
  CLAUDE: {
    API_KEY: 'x-api-key',
    VERSION_KEY: 'anthropic-version',
    VERSION_VALUE: '2023-06-01',
  },
} as const;


