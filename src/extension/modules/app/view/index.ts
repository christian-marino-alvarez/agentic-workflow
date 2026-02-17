import { View } from '../../core/view/index.js';
import { customElement, state } from 'lit/decorators.js';
import { html } from 'lit';
import { styles } from './templates/css.js';
import { render } from './templates/html.js';
import '../../settings/view/index.js';
import { NAME } from '../constants.js';

@customElement(`${NAME}-view`)
export class AppView extends View {
  protected override readonly moduleName = NAME;
  static override styles = styles;

  @state()
  public activeTab: string = 'settings';

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
