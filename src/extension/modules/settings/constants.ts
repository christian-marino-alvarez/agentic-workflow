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
  /** Background handler that processes Settings requests (AppBackground) */
  BACKGROUND: 'app',
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
};

export const DELETE_TIMEOUT = 3000;
