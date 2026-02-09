import { html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { AgwViewBase } from '../../../core/view/base.js';
import { Tab, MessageType, CHAT_API_URL } from '../constants.js';

// Import modular parts
import { renderShell } from './shell/index.js';
import { commonStyles, renderNotFound } from './common/index.js';
import { mainStyles, renderMain } from './main/index.js';

@customElement('agw-chat-view')
export class ChatView extends AgwViewBase {
  @state()
  private tab: string = Tab.Main;

  @state()
  private environment: 'dev' | 'pro' = 'pro';

  @state()
  private modelId: string = '';

  @state()
  private secretKeyId: string = '';

  public static styles = [
    AgwViewBase.styles,
    commonStyles,
    mainStyles
  ];

  protected listen(): void {
    window.addEventListener('message', (event) => {
      const message = event.data;
      if (message.type === MessageType.StateUpdate) {
        this.tab = message.tab;
        this.modelId = message.activeModelId || '';
        this.environment = message.activeEnvironment;
        this.requestUpdate();
      }
    });
    this.postMessage({ type: MessageType.WebviewReady });
  }

  private handleSend() {
    try {
      const payloadElement = this.renderRoot.querySelector('#payload') as HTMLTextAreaElement;
      const payload = JSON.parse(payloadElement.value || '{}');
      const apiUrl = CHAT_API_URL;
      this.postMessage({ type: MessageType.ChatRequest, apiUrl, payload });
    } catch (e) {
      console.error('Invalid JSON payload');
    }
  }

  protected renderView() {
    if (this.tab === Tab.Main) {
      return renderMain({
        environment: this.environment,
        modelId: this.modelId,
        onSend: () => this.handleSend()
      });
    }
    return renderNotFound();
  }
}

export default { render: renderShell };
