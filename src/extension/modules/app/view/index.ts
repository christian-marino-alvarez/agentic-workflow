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

  public switchTab(tab: string) {
    if (tab === this.activeTab) { return; }
    this.tabTransitioning = true;
    this.activeTab = tab;
    setTimeout(() => { this.tabTransitioning = false; }, 1000);
  }

  @state()
  public isSecure: boolean = false;

  @property({ type: String })
  public appVersion: string = '';

  override connectedCallback() {
    super.connectedCallback();
    // Listen for secure state changes from Settings View
    this.addEventListener('secure-state-changed', ((e: CustomEvent) => {
      this.isSecure = e.detail?.secure ?? false;
    }) as EventListener);
    // Initial 1s skeleton on first mount
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
