import * as vscode from 'vscode';
import { Background, ViewHtml } from '../../core/index.js';
import { NAME, MESSAGES } from '../constants.js';

export class Auth extends Background implements vscode.AuthenticationProvider {
  // Contract: https://code.visualstudio.com/api/references/vscode-api#AuthenticationProvider

  private static instance: Auth;

  // Required by interface
  onDidChangeSessions: vscode.Event<vscode.AuthenticationProviderAuthenticationSessionsChangeEvent>;
  private _onDidChangeSessions = new vscode.EventEmitter<vscode.AuthenticationProviderAuthenticationSessionsChangeEvent>();

  private constructor(context: vscode.ExtensionContext) {
    super(NAME.toLowerCase(), context.extensionUri, 'auth-view');
    this.onDidChangeSessions = this._onDidChangeSessions.event;

    // Register the provider immediately upon instantiation (which happens in App.activate)
    this.disposables.push(
      vscode.authentication.registerAuthenticationProvider(
        'agw-auth',
        'Agentic Workflow Auth',
        this,
        { supportsMultipleAccounts: false }
      )
    );

    this.log('Auth Provider Registered');
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

  /**
   * Handle incoming messages from the View layer.
   */
  public override async listen(message: any): Promise<void> {
    const { command } = message.payload || {};

    switch (command) {
      case MESSAGES.LOGIN_REQUEST:
        this.log('Login request received');
        try {
          await this.createSession(['openid', 'profile']);
        } catch (e: any) {
          this.log('Login failed:', e.message);
        }
        break;
      case MESSAGES.LOGOUT_REQUEST:
        this.log('Logout request received');
        // Assuming single session for now or passing ID from payload
        await this.removeSession('current-session-id');
        break;
    }
  }

  /**
   * Required by Core.Background base class.
   * Returns a placeholder HTML since Auth is headless/system-integrated.
   */
  protected getHtmlForWebview(webview: vscode.Webview): string {
    const scriptPath = 'dist/extension/modules/auth/view/index.js';
    return ViewHtml.getWebviewHtml(webview, this._extensionUri, this.viewTagName, scriptPath);
  }

  // --- AuthenticationProvider Implementation ---

  // Simple in-memory session store for testing
  private _sessions: vscode.AuthenticationSession[] = [];

  public async getSessions(scopes?: readonly string[]): Promise<vscode.AuthenticationSession[]> {
    this.log('getSessions called', scopes);
    return this._sessions;
  }

  public async createSession(scopes: readonly string[]): Promise<vscode.AuthenticationSession> {
    this.log('createSession called', scopes);

    // Simulate login delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const newSession: vscode.AuthenticationSession = {
      id: `session-${Date.now()}`,
      accessToken: `mock-token-${Date.now()}`,
      account: {
        id: 'test-user-1',
        label: 'Test User'
      },
      scopes: scopes as string[]
    };

    this._sessions.push(newSession);
    this._onDidChangeSessions.fire({ added: [newSession], removed: [], changed: [] });

    this.log('Session created:', newSession.id);
    return newSession;
  }

  public async removeSession(sessionId: string): Promise<void> {
    this.log('removeSession called', sessionId);

    const index = this._sessions.findIndex(s => s.id === sessionId);
    if (index > -1) {
      const removed = this._sessions.splice(index, 1);
      this._onDidChangeSessions.fire({ added: [], removed: removed, changed: [] });
      this.log('Session removed:', sessionId);
    }
  }
}
