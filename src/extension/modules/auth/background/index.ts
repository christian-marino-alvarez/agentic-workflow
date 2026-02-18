import * as vscode from 'vscode';
import * as http from 'http';
import * as crypto from 'crypto';
import { Background, ViewHtml } from '../../core/index.js';
import {
  NAME, MESSAGES,
  GOOGLE_CLIENT_ID_KEY, GOOGLE_CLIENT_SECRET_KEY, GOOGLE_AUTH_URL, GOOGLE_TOKEN_URL,
  GOOGLE_SCOPES, AUTH_PROVIDER_ID, AUTH_PROVIDER_LABEL,
  SECRET_KEYS
} from '../constants.js';

/**
 * Auth Background — Google OAuth 2.0 with PKCE.
 * Implements vscode.AuthenticationProvider for integration with VS Code's auth API.
 */
export class Auth extends Background implements vscode.AuthenticationProvider {

  private static instance: Auth;
  private context: vscode.ExtensionContext;

  // Required by AuthenticationProvider interface
  onDidChangeSessions: vscode.Event<vscode.AuthenticationProviderAuthenticationSessionsChangeEvent>;
  private _onDidChangeSessions = new vscode.EventEmitter<vscode.AuthenticationProviderAuthenticationSessionsChangeEvent>();

  // Session store
  private _sessions: vscode.AuthenticationSession[] = [];

  private constructor(context: vscode.ExtensionContext) {
    super(NAME.toLowerCase(), context.extensionUri, 'auth-view');
    this.context = context;
    this.onDidChangeSessions = this._onDidChangeSessions.event;

    // Register as a VS Code authentication provider
    this.disposables.push(
      vscode.authentication.registerAuthenticationProvider(
        AUTH_PROVIDER_ID,
        AUTH_PROVIDER_LABEL,
        this,
        { supportsMultipleAccounts: false }
      )
    );

    this.log('Auth Provider Registered');

    // Attempt to restore session from SecretStorage on startup
    this.restoreSession().catch(err => {
      this.log('Could not restore session:', err.message);
    });
  }

  public static getInstance(context?: vscode.ExtensionContext): Auth {
    if (!Auth.instance) {
      if (!context) {
        throw new Error('Auth initialized without context');
      }
      Auth.instance = new Auth(context);
    }
    return Auth.instance;
  }

  // ─── AuthenticationProvider Interface ────────────────────

  public async getSessions(scopes?: readonly string[]): Promise<vscode.AuthenticationSession[]> {
    this.log('getSessions called', scopes);
    return this._sessions;
  }

  /**
   * Create a new session via Google OAuth 2.0 + PKCE.
   * Opens the user's browser for Google login, receives the auth code
   * via a local callback server, and exchanges it for tokens.
   */
  public async createSession(scopes: readonly string[]): Promise<vscode.AuthenticationSession> {
    this.log('createSession called — starting Google OAuth PKCE flow');

    // ─── Pre-flight: Check if Client ID is configured ───
    const clientId = this.getGoogleClientId();
    if (!clientId) {
      throw new Error('OAUTH_SETUP_REQUIRED');
    }

    // 1. Generate PKCE pair
    const codeVerifier = this.generateCodeVerifier();
    const codeChallenge = this.generateCodeChallenge(codeVerifier);

    // 2. Start local callback server
    const { port, codePromise, server } = await this.startCallbackServer();
    this.log(`Callback server listening on port ${port}`);

    // 3. Build auth URL and open browser
    const redirectUri = `http://localhost:${port}/callback`;
    const state = crypto.randomUUID();

    const authUrl = new URL(GOOGLE_AUTH_URL);
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', GOOGLE_SCOPES.join(' '));
    authUrl.searchParams.set('code_challenge', codeChallenge);
    authUrl.searchParams.set('code_challenge_method', 'S256');
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('access_type', 'offline');
    authUrl.searchParams.set('prompt', 'consent');

    this.log('Opening browser for Google login...');
    const opened = await vscode.env.openExternal(vscode.Uri.parse(authUrl.toString()));
    if (!opened) {
      server.close();
      throw new Error('Failed to open browser for authentication');
    }

    // 4. Wait for the authorization code (with 120s timeout)
    let authCode: string;
    try {
      authCode = await Promise.race([
        codePromise,
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('OAuth login timed out (120s)')), 120_000)
        )
      ]);
    } catch (error: any) {
      server.close();
      // Detect invalid_client and signal view to show setup wizard
      if (error.message?.includes('invalid_client')) {
        throw new Error('OAUTH_SETUP_REQUIRED');
      }
      throw error;
    } finally {
      server.close();
    }

    this.log('Authorization code received, exchanging for tokens...');

    // 5. Exchange code for tokens
    const tokens = await this.exchangeCodeForTokens(authCode, codeVerifier, redirectUri);

    // 6. Get user info from the ID token or userinfo endpoint
    const userInfo = await this.getUserInfo(tokens.access_token);

    // 7. Persist tokens in SecretStorage
    await this.context.secrets.store(SECRET_KEYS.ACCESS_TOKEN, tokens.access_token);
    if (tokens.refresh_token) {
      await this.context.secrets.store(SECRET_KEYS.REFRESH_TOKEN, tokens.refresh_token);
    }
    await this.context.secrets.store(SECRET_KEYS.ACCOUNT_INFO, JSON.stringify(userInfo));

    // 8. Create the VS Code AuthenticationSession
    const session: vscode.AuthenticationSession = {
      id: `google-${Date.now()}`,
      accessToken: tokens.access_token,
      account: {
        id: userInfo.email || userInfo.sub || 'google-user',
        label: userInfo.name || userInfo.email || 'Google User',
      },
      scopes: scopes as string[],
    };

    this._sessions = [session];
    this._onDidChangeSessions.fire({ added: [session], removed: [], changed: [] });

    this.log('Session created:', session.account.label);
    return session;
  }

  public async removeSession(sessionId: string): Promise<void> {
    this.log('removeSession called', sessionId);

    const index = this._sessions.findIndex(s => s.id === sessionId);
    if (index > -1) {
      const removed = this._sessions.splice(index, 1);
      this._onDidChangeSessions.fire({ added: [], removed, changed: [] });
    }

    // Clear stored tokens
    await this.context.secrets.delete(SECRET_KEYS.ACCESS_TOKEN);
    await this.context.secrets.delete(SECRET_KEYS.REFRESH_TOKEN);
    await this.context.secrets.delete(SECRET_KEYS.ACCOUNT_INFO);

    this.log('Session removed and tokens cleared');
  }

  // ─── Message Handler ────────────────────────────────────

  public override async listen(message: any): Promise<void> {
    const { command } = message.payload || {};

    switch (command) {
      case MESSAGES.LOGIN_REQUEST:
        this.log('Login request received');
        try {
          await this.createSession(GOOGLE_SCOPES);
        } catch (e: any) {
          this.log('Login failed:', e.message);
        }
        break;
      case MESSAGES.LOGOUT_REQUEST:
        this.log('Logout request received');
        if (this._sessions.length > 0) {
          await this.removeSession(this._sessions[0].id);
        }
        break;
    }
  }

  protected getHtmlForWebview(webview: vscode.Webview): string {
    const scriptPath = 'dist/extension/modules/auth/view/index.js';
    return ViewHtml.getWebviewHtml(webview, this._extensionUri, this.viewTagName, scriptPath);
  }
  // ─── Google Client ID from Settings ─────────────────────

  /**
   * Read the Google OAuth Client ID from VS Code settings.
   * Returns empty string if not configured.
   */
  private getGoogleClientId(): string {
    return vscode.workspace.getConfiguration().get<string>(GOOGLE_CLIENT_ID_KEY, '');
  }

  private getGoogleClientSecret(): string {
    return vscode.workspace.getConfiguration().get<string>(GOOGLE_CLIENT_SECRET_KEY, '');
  }

  /**
   * Save Google OAuth credentials to VS Code global settings.
   */
  public async saveGoogleCredentials(clientId: string, clientSecret: string): Promise<void> {
    const config = vscode.workspace.getConfiguration();
    await config.update(GOOGLE_CLIENT_ID_KEY, clientId, vscode.ConfigurationTarget.Global);
    await config.update(GOOGLE_CLIENT_SECRET_KEY, clientSecret, vscode.ConfigurationTarget.Global);
    this.log('Google OAuth credentials saved to settings');
  }

  /**
   * Remove all stored Google OAuth credentials and tokens.
   */
  public async removeGoogleCredentials(): Promise<void> {
    await this.context.secrets.delete(SECRET_KEYS.ACCESS_TOKEN);
    await this.context.secrets.delete(SECRET_KEYS.REFRESH_TOKEN);
    await this.context.secrets.delete(SECRET_KEYS.ACCOUNT_INFO);
    // Remove the VS Code session so getSessions returns empty
    this._sessions = [];
    this._onDidChangeSessions.fire({ added: [], removed: [], changed: [] });
    this.log('Google OAuth credentials removed');
  }

  // ─── PKCE Helpers ───────────────────────────────────────

  private generateCodeVerifier(): string {
    return crypto.randomBytes(32).toString('base64url');
  }

  private generateCodeChallenge(verifier: string): string {
    return crypto.createHash('sha256').update(verifier).digest('base64url');
  }

  // ─── OAuth Exchange ─────────────────────────────────────

  private async exchangeCodeForTokens(
    code: string,
    codeVerifier: string,
    redirectUri: string
  ): Promise<{ access_token: string; refresh_token?: string; id_token?: string }> {
    this.log('Token exchange: redirectUri =', redirectUri);

    const body = new URLSearchParams({
      code,
      client_id: this.getGoogleClientId(),
      client_secret: this.getGoogleClientSecret(),
      code_verifier: codeVerifier,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    });

    const response = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      this.log('Token exchange FAILED:', response.status, errorBody);

      // Parse Google's error for a user-friendly message
      let userMessage = `Token exchange failed (${response.status})`;
      try {
        const parsed = JSON.parse(errorBody);
        if (parsed.error === 'redirect_uri_mismatch') {
          userMessage = 'Redirect URI mismatch. Make sure your OAuth Client type is "Desktop app" (not "Web application") in Google Cloud Console.';
        } else if (parsed.error === 'invalid_client') {
          userMessage = 'Invalid Client ID. Check your Google OAuth credentials.';
        } else if (parsed.error === 'invalid_grant') {
          userMessage = 'Authorization code expired or already used. Please try again.';
        } else if (parsed.error_description) {
          userMessage = parsed.error_description;
        }
      } catch { /* not JSON, use raw */ }

      throw new Error(userMessage);
    }

    this.log('Token exchange successful');
    return response.json();
  }

  /**
   * Refresh an expired access token using a stored refresh token.
   */
  public async refreshAccessToken(): Promise<string | null> {
    const refreshToken = await this.context.secrets.get(SECRET_KEYS.REFRESH_TOKEN);
    if (!refreshToken) {
      this.log('No refresh token available');
      return null;
    }

    const body = new URLSearchParams({
      client_id: this.getGoogleClientId(),
      client_secret: this.getGoogleClientSecret(),
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    });

    const response = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    if (!response.ok) {
      this.log('Token refresh failed:', response.status);
      return null;
    }

    const data: any = await response.json();
    const newToken = data.access_token;

    // Update storage and session
    await this.context.secrets.store(SECRET_KEYS.ACCESS_TOKEN, newToken);
    if (this._sessions.length > 0) {
      this._sessions[0] = { ...this._sessions[0], accessToken: newToken };
      this._onDidChangeSessions.fire({ added: [], removed: [], changed: this._sessions });
    }

    this.log('Access token refreshed');
    return newToken;
  }

  // ─── User Info ──────────────────────────────────────────

  private async getUserInfo(accessToken: string): Promise<{ sub?: string; email?: string; name?: string }> {
    const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      return { email: 'unknown@google.com', name: 'Google User' };
    }

    return response.json();
  }

  // ─── Session Restore ────────────────────────────────────

  private async restoreSession(): Promise<void> {
    const accessToken = await this.context.secrets.get(SECRET_KEYS.ACCESS_TOKEN);
    const accountInfoStr = await this.context.secrets.get(SECRET_KEYS.ACCOUNT_INFO);

    if (!accessToken || !accountInfoStr) {
      return; // No stored session
    }

    try {
      const accountInfo = JSON.parse(accountInfoStr);
      const session: vscode.AuthenticationSession = {
        id: `google-restored-${Date.now()}`,
        accessToken,
        account: {
          id: accountInfo.email || 'google-user',
          label: accountInfo.name || accountInfo.email || 'Google User',
        },
        scopes: GOOGLE_SCOPES,
      };

      this._sessions = [session];
      this._onDidChangeSessions.fire({ added: [session], removed: [], changed: [] });
      this.log('Session restored for:', session.account.label);
    } catch {
      this.log('Failed to parse stored account info');
    }
  }

  // ─── Local Callback Server ──────────────────────────────

  private startCallbackServer(): Promise<{ port: number; codePromise: Promise<string>; server: http.Server }> {
    return new Promise((resolve, reject) => {
      let resolveCode: (code: string) => void;
      let rejectCode: (err: Error) => void;

      const codePromise = new Promise<string>((res, rej) => {
        resolveCode = res;
        rejectCode = rej;
      });

      const server = http.createServer((req, res) => {
        if (!req.url?.startsWith('/callback')) {
          res.writeHead(404);
          res.end('Not found');
          return;
        }

        const url = new URL(req.url, `http://localhost`);
        const code = url.searchParams.get('code');
        const error = url.searchParams.get('error');

        if (error) {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(`
            <html><body style="font-family: system-ui; text-align: center; padding: 40px;">
              <h2>❌ Authentication Failed</h2>
              <p>Error: ${error}</p>
              <p>You can close this window.</p>
            </body></html>
          `);
          rejectCode!(new Error(`OAuth error: ${error}`));
          return;
        }

        if (code) {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(`
            <html><body style="font-family: system-ui; text-align: center; padding: 40px;">
              <h2>✅ Authentication Successful</h2>
              <p>You can close this window and return to VS Code.</p>
            </body></html>
          `);
          resolveCode!(code);
          return;
        }

        res.writeHead(400);
        res.end('Missing authorization code');
      });

      // Listen on random port
      server.listen(0, '127.0.0.1', () => {
        const addr = server.address();
        if (addr && typeof addr === 'object') {
          resolve({ port: addr.port, codePromise, server });
        } else {
          reject(new Error('Failed to get server port'));
        }
      });

      server.on('error', reject);
    });
  }
}
