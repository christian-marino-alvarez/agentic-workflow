import { html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { AgwViewBase } from '../../../core/web/index.js';
import './components/agw-unified-shell.js';

@customElement('agw-main-view')
export class MainView extends AgwViewBase {
  protected override createRenderRoot() {
    return this; // Use light DOM to ensure styles propagate to children
  }

  protected renderView() {
    return html`<agw-unified-shell></agw-unified-shell>`;
  }
}
