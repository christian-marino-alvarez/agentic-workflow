import { View } from '../../core/view/index.js';
import { customElement, state } from 'lit/decorators.js';
import { styles } from './template/styles.js';
import { renderTemplate } from './template/html.js';

@customElement('main-view')
export class MainView extends View {
  static styles = styles;

  @state()
  public lastPong: string = '-';

  render() {
    return renderTemplate(this);
  }

  connectedCallback() {
    super.connectedCallback();
    this.log('MainView Connected');

    // Listen for backend responses forwarded by background
    this.onMessage((msg) => {
      if (msg.payload.command === 'ping::response') {
        this.log('Received Pong from Backend');
        const timestamp = new Date(msg.payload.data.result.timestamp).toLocaleTimeString();
        this.lastPong = timestamp;
        this.requestUpdate();
      }
    });
  }

  public ping() {
    this.log('Ping Button Clicked');
    this.sendMessage('main::background', 'ping', { timestamp: Date.now() });
  }
}
