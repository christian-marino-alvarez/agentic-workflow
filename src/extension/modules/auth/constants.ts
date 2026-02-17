import { IModule } from '../core/module.js';

export const NAME = 'Auth';

export const AUTH_MODULE: IModule = {
  id: NAME.toLowerCase(),
  label: NAME,
  icon: 'lock',
  viewComponent: 'auth-view'
};

export const MESSAGES = {
  LOGIN_REQUEST: 'auth:login_request',
  LOGOUT_REQUEST: 'auth:logout_request'
};

