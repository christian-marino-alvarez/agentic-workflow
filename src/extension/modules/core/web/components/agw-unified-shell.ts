import { html, css, LitElement } from 'lit';
import { customElement, state } from 'lit/decorators.js';

// Import child views to ensure they are registered as custom elements
import '../../../chat/web/view.js';
import '../../../security/web/view.js';
import '../../../workflow/web/view.js';
import '../../../history/web/view.js';

/**
 * Unified Shell component for Agentic Workflow VS Code Extension.
 * Handles tabbed navigation between Chat, Workflow, History, and Security modules.
 */
@customElement('agw-unified-shell')
export class AgwUnifiedShell extends LitElement {
  @state()
  private activeTab: 'chat' | 'workflow' | 'history' | 'security' = 'chat';

  protected override createRenderRoot() {
    return this; // Use light DOM to match MainView
  }

  private setTab(tab: typeof this.activeTab) {
    console.log('[AgwUnifiedShell] Switching tab to:', tab);
    this.activeTab = tab;
    this.requestUpdate();
  }

  static styles = css`
    agw-unified-shell {
      display: flex;
      flex-direction: column;
      height: 100vh;
      width: 100%;
      background-color: var(--vscode-sideBar-background);
      color: var(--vscode-sideBar-foreground);
      font-family: var(--vscode-font-family);
    }

    .tabs-header {
      display: flex;
      border-bottom: 1px solid var(--vscode-panel-border);
      background-color: var(--vscode-sideBarHeader-background);
    }

    .tab-item {
      padding: 8px 12px;
      cursor: pointer;
      font-size: 11px;
      text-transform: uppercase;
      opacity: 0.6;
      border-bottom: 2px solid transparent;
      transition: opacity 0.2s, border-color 0.2s;
    }

    .tab-item:hover {
      opacity: 1;
    }

    .tab-item.active {
      opacity: 1;
      border-bottom-color: var(--vscode-settings-headerForeground);
      font-weight: bold;
    }

    .view-content {
      flex: 1;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      height: calc(100% - 33px); /* Match header height */
    }

    .view-content > * {
      flex: 1;
      height: 100%;
    }

    .view-content > [hidden] {
      display: none !important;
    }

    /* Placeholder styles for views */
    .view-placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      font-style: italic;
      color: var(--vscode-descriptionForeground);
    }
  `;

  render() {
    return html`
      <style>
        agw-unified-shell {
          display: flex;
          flex-direction: column;
          height: 100vh;
          width: 100%;
          background-color: var(--vscode-sideBar-background);
          color: var(--vscode-sideBar-foreground);
          font-family: var(--vscode-font-family);
        }

        .tabs-header {
          display: flex;
          border-bottom: 1px solid var(--vscode-panel-border);
          background-color: var(--vscode-sideBarHeader-background);
        }

        .tab-item {
          padding: 8px 12px;
          cursor: pointer;
          font-size: 11px;
          text-transform: uppercase;
          opacity: 0.6;
          border-bottom: 2px solid transparent;
          transition: opacity 0.2s, border-color 0.2s;
        }

        .tab-item:hover {
          opacity: 1;
        }

        .tab-item.active {
          opacity: 1;
          border-bottom-color: var(--vscode-settings-headerForeground);
          font-weight: bold;
        }

        .view-content {
          flex: 1;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          height: calc(100% - 33px); /* Match header height aproximadamente */
        }

        .view-content > * {
          flex: 1;
          height: 100%;
        }

        .view-content > [hidden] {
          display: none !important;
        }

        /* Placeholder styles for views */
        .view-placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          font-style: italic;
          color: var(--vscode-descriptionForeground);
        }
      </style>
      <div class="tabs-header">
        <div 
          class="tab-item ${this.activeTab === 'chat' ? 'active' : ''}" 
          @click="${() => this.setTab('chat')}"
        >
          Chat
        </div>
        <div 
          class="tab-item ${this.activeTab === 'workflow' ? 'active' : ''}" 
          @click="${() => this.setTab('workflow')}"
        >
          Workflow
        </div>
        <div 
          class="tab-item ${this.activeTab === 'history' ? 'active' : ''}" 
          @click="${() => this.setTab('history')}"
        >
          History
        </div>
        <div 
          class="tab-item ${this.activeTab === 'security' ? 'active' : ''}" 
          @click="${() => this.setTab('security')}"
        >
          Security
        </div>
      </div>
      <div class="view-content">
        <agw-chat-view ?hidden="${this.activeTab !== 'chat'}"></agw-chat-view>
        <agw-workflow-view ?hidden="${this.activeTab !== 'workflow'}"></agw-workflow-view>
        <agw-history-view ?hidden="${this.activeTab !== 'history'}"></agw-history-view>
        <agw-security-view ?hidden="${this.activeTab !== 'security'}"></agw-security-view>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'agw-unified-shell': AgwUnifiedShell;
  }
}
