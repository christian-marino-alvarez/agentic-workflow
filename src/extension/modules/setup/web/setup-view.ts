import { html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { AgwViewBase } from '../../../core/view/base.js';

@customElement('agw-setup-view')
export class View extends AgwViewBase {
  @state()
  private openaiKeyPresent = false;

  public static styles = [
    AgwViewBase.styles,
    css`
      .container {
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .provider-card {
        border: 1px solid var(--vscode-widget-border, rgba(255, 255, 255, 0.1));
        background: var(--vscode-editor-background);
        border-radius: 8px;
        padding: 12px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        transition: border-color 0.2s;
        cursor: pointer;
      }
      .provider-card:hover {
        border-color: var(--vscode-button-background, #0e639c);
      }
      .provider-card.active {
        border-color: var(--vscode-button-background);
        box-shadow: 0 0 0 1px var(--vscode-button-background);
      }
      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .title {
        font-weight: 600;
        font-size: 13px;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .title input {
        margin: 0;
      }
      .status-badge {
        font-size: 10px;
        padding: 2px 6px;
        border-radius: 10px;
        text-transform: uppercase;
      }
      .status-badge.present {
        background: var(--vscode-charts-green, #388a34);
        color: white;
      }
      .status-badge.missing {
        background: var(--vscode-charts-red, #d13438);
        color: white;
      }
      .actions {
        display: flex;
        gap: 8px;
      }
      button {
        border: 1px solid var(--vscode-button-border, transparent);
        background: var(--vscode-button-background, #0e639c);
        color: var(--vscode-button-foreground, #ffffff);
        padding: 4px 10px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 11px;
      }
      button.secondary {
        background: var(--vscode-button-secondaryBackground, #3a3d41);
        color: var(--vscode-button-secondaryForeground, #ffffff);
      }
      button:hover {
        opacity: 0.9;
      }
      .footer {
        margin-top: 10px;
        display: flex;
        justify-content: center;
      }
      .go-chat-btn {
        width: 100%;
        padding: 8px;
        font-weight: 600;
      }
      .loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 10px;
        min-height: 200px;
      }
      .spinner {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: 3px solid var(--vscode-editorHoverWidget-border, #c7c7c7);
        border-top-color: var(--vscode-button-background, #0e639c);
        animation: spin 0.9s linear infinite;
      }
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      .intro {
        margin-bottom: 8px;
      }
      .intro-title {
        font-size: 13px;
        font-weight: 600;
        margin-bottom: 4px;
      }
      .intro-text {
        font-size: 12px;
        opacity: 0.8;
      }
    `
  ];

  protected listen() {
    window.addEventListener('message', (event) => {
      const message = event.data;
      if (message.type === 'state-update') {
        this.openaiKeyPresent = message.openaiKeyPresent;
        this.requestUpdate();
      }
    });
  }

  protected async loadData() {
    this.postMessage({ type: 'get-initial-state' });
  }

  private handleSetKey() {
    this.postMessage({ type: 'set-api-key' });
  }

  private handleClearKey() {
    this.postMessage({ type: 'clear-api-key' });
  }

  private handleGoChat(): void {
    this.postMessage({ type: 'go-chat' });
  }

  protected renderView() {
    return html`
      <div class="container">
        <div class="intro">
          <div class="intro-title">Configuración de OpenAI</div>
          <div class="intro-text">
            Configura tu clave de OpenAI para habilitar el chat.
          </div>
        </div>

        <div class="provider-card active">
          <div class="header">
            <div class="title">OpenAI</div>
            <span class="status-badge ${this.openaiKeyPresent ? 'present' : 'missing'}">
              ${this.openaiKeyPresent ? 'Configurada' : 'Faltante'}
            </span>
          </div>
          <div class="actions">
            <button @click=${this.handleSetKey}>
              ${this.openaiKeyPresent ? 'Cambiar Clave' : 'Configurar Clave'}
            </button>
            ${this.openaiKeyPresent ? html`
              <button class="secondary" @click=${this.handleClearKey}>
                Borrar
              </button>
            ` : ''}
          </div>
        </div>

        <div class="footer">
          <button class="go-chat-btn" ?disabled=${!this.openaiKeyPresent} @click=${this.handleGoChat}>
            Ir a Chat
          </button>
        </div>
      </div>
    `;
  }
}
