import { View } from '../../core/view/index.js';
import { customElement, state, property } from 'lit/decorators.js';
import { html } from 'lit';
import { styles } from './templates/css.js';
import { render } from './templates/html.js';
import '../../settings/view/index.js';
import '../../chat/view/index.js';
import { NAME } from '../constants.js';

@customElement(`${NAME}-view`)
export class AppView extends View {
  protected override readonly moduleName = NAME;
  static override styles = styles;

  @state()
  public activeTab: string = 'chat';

  @state()
  public tabTransitioning: boolean = true;

  @state()
  public historySessions: Array<{ id: string, title: string, timestamp: number, messageCount: number }> = [];

  public getChatView(): any {
    return this.renderRoot?.querySelector('chat-view') || document.querySelector('chat-view');
  }

  public switchTab(tab: string) {
    if (tab === this.activeTab) { return; }
    this.tabTransitioning = true;
    this.activeTab = tab;

    // When switching to History, eagerly save + load sessions
    if (tab === 'history') {
      const chatView = this.getChatView();
      if (chatView?.saveCurrentSession) { chatView.saveCurrentSession(); }
      // Request sessions and poll for update
      if (chatView?.requestSessions) { chatView.requestSessions(); }
      setTimeout(() => { this.refreshHistorySessions(); }, 300);
    }

    setTimeout(() => {
      this.tabTransitioning = false;
      // Re-read sessions after transition to ensure fresh data
      if (tab === 'history') { this.refreshHistorySessions(); }
    }, 1000);
  }

  public refreshHistorySessions() {
    const chatView = this.getChatView();
    if (chatView?.sessionList) {
      this.historySessions = [...chatView.sessionList];
    }
  }

  @state()
  public pendingDeleteSessionId: string | undefined;
  private deleteTimeout: any;

  public handleDeleteSession(sessionId: string) {
    if (this.pendingDeleteSessionId === sessionId) {
      // Second click — confirm delete
      const chatView = this.getChatView();
      if (chatView?.handleDeleteSession) {
        chatView.handleDeleteSession(sessionId); // triggers second-click in ChatView too
      }
      this.pendingDeleteSessionId = undefined;
      clearTimeout(this.deleteTimeout);
      // Refresh list after delete completes
      setTimeout(() => this.refreshHistorySessions(), 500);
      return;
    }

    // First click — mark as pending
    this.pendingDeleteSessionId = sessionId;
    clearTimeout(this.deleteTimeout);
    this.deleteTimeout = setTimeout(() => {
      if (this.pendingDeleteSessionId === sessionId) {
        this.pendingDeleteSessionId = undefined;
      }
    }, 3000);
  }

  @state()
  public isSecure: boolean = false;

  @property({ type: String })
  public appVersion: string = '';

  override connectedCallback() {
    super.connectedCallback();
    this.addEventListener('secure-state-changed', ((e: CustomEvent) => {
      this.isSecure = e.detail?.secure ?? false;
    }) as EventListener);
    setTimeout(() => { this.tabTransitioning = false; }, 1000);
  }

  override render() {
    return render(this);
  }

  /**
   * Handle incoming global app messages.
   */
  public override async listen(message: any): Promise<void> {
    const { command, data } = message.payload || {};

    switch (command) {
      // Add global app command handlers here
      case 'ping::response':
        this.log('Ping response received:', data);
        break;
    }
  }
}
