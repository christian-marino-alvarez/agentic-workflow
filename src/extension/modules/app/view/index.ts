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

  @state() accessor activeTab: string = 'chat';
  @state() accessor tabTransitioning: boolean = true;
  @state() accessor historySessions: Array<{ id: string, title: string, timestamp: number, messageCount: number }> = [];
  @state() accessor pendingDeleteSessionId: string | undefined;
  @state() accessor isSecure: boolean = false;

  @property({ type: String })
  public appVersion: string = '';

  private deleteTimeout: any;

  public getChatView(): any {
    return this.renderRoot?.querySelector('chat-view') || document.querySelector('chat-view');
  }

  public switchTab(tab: string) {
    if (tab === this.activeTab) { return; }
    this.tabTransitioning = true;
    this.activeTab = tab;

    if (tab === 'history') {
      const chatView = this.getChatView();
      if (chatView?.saveCurrentSession) { chatView.saveCurrentSession(); }
      if (chatView?.requestSessions) { chatView.requestSessions(); }
      setTimeout(() => { this.refreshHistorySessions(); }, 300);
    }

    setTimeout(() => {
      this.tabTransitioning = false;
      if (tab === 'history') { this.refreshHistorySessions(); }
    }, 1000);
  }

  public refreshHistorySessions() {
    const chatView = this.getChatView();
    if (chatView?.sessionList) {
      this.historySessions = [...chatView.sessionList];
    }
  }

  public handleDeleteSession(sessionId: string) {
    if (this.pendingDeleteSessionId === sessionId) {
      const chatView = this.getChatView();
      if (chatView) {
        chatView.pendingDeleteSessionId = sessionId;
        chatView.handleDeleteSession(sessionId);
      }
      this.pendingDeleteSessionId = undefined;
      clearTimeout(this.deleteTimeout);
      setTimeout(() => this.refreshHistorySessions(), 500);
      return;
    }

    this.pendingDeleteSessionId = sessionId;
    clearTimeout(this.deleteTimeout);
    this.deleteTimeout = setTimeout(() => {
      if (this.pendingDeleteSessionId === sessionId) {
        this.pendingDeleteSessionId = undefined;
      }
    }, 3000);
  }

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

  public override async listen(message: any): Promise<void> {
    const { command, data } = message.payload || {};
    switch (command) {
      case 'ping::response':
        this.log('Ping response received:', data);
        break;
    }
  }
}
