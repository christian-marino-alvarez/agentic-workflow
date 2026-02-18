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

// --- Google OAuth 2.0 Configuration ---

/**
 * VS Code settings key for the Google OAuth Client ID.
 * Users configure this via settings or the setup wizard.
 */
export const GOOGLE_CLIENT_ID_KEY = 'agenticWorkflow.googleClientId';
export const GOOGLE_CLIENT_SECRET_KEY = 'agenticWorkflow.googleClientSecret';

export const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
export const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
export const GOOGLE_TOKENINFO_URL = 'https://oauth2.googleapis.com/tokeninfo';

/**
 * OAuth scopes for Google sign-in.
 * Basic identity scopes — the Gemini API accepts OAuth access tokens
 * without requiring a specific API scope on the consent screen.
 */
export const GOOGLE_SCOPES = [
  'openid',
  'email',
  'profile',
];

/** Auth provider ID registered in VS Code */
export const AUTH_PROVIDER_ID = 'agw-google-oauth';
export const AUTH_PROVIDER_LABEL = 'Google (Gemini)';

/** SecretStorage keys for persisting tokens */
export const SECRET_KEYS = {
  ACCESS_TOKEN: 'agw.google.accessToken',
  REFRESH_TOKEN: 'agw.google.refreshToken',
  ACCOUNT_INFO: 'agw.google.accountInfo',
};
