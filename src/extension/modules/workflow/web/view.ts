import { html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { AgwViewBase } from '../../../core/web/index.js';

@customElement('agw-workflow-view')
export class View extends AgwViewBase {
  constructor() {
    super();
    this.domain = 'workflowView';
  }
  public static styles = [
    AgwViewBase.styles,
    css`
      .container {
        padding: 16px;
        text-align: center;
      }
      .title {
        font-size: 13px;
        font-weight: 600;
        margin-bottom: 6px;
      }
      .subtitle {
        font-size: 12px;
        opacity: 0.8;
      }
    `
  ];

  protected async loadData(): Promise<void> {
    this.log('info', 'init', { human: 'Inicializando vista de workflows' });
    this.postMessage({ type: 'webview-ready', view: 'workflowView' });
  }

  protected renderView() {
    return html`
      <div class="container">
        <div class="title">Workflows</div>
        <div class="subtitle">Proximamente.</div>
      </div>
    `;
  }
}
