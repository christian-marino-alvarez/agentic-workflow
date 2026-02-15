import { View } from '../../core/view/index.js';
import { customElement, state } from 'lit/decorators.js';
import { styles } from './templates/css.js';
import { render } from './templates/html.js';

@customElement('main-view')
export class AppView extends View {
  static override styles = styles;

  @state()
  public lastPong: string = '-';

  @state()
  public pendingRequests: number = 0;

  override render() {
    return render.call(this);
  }

  override connectedCallback() {
    super.connectedCallback();
    this.log('MainView Connected');

    // Listen for backend responses forwarded by background
    this.onMessage((msg: any) => {
      if (msg.payload.command === 'ping::response') {
        this.log('Received Pong from Backend');
        const timestamp = new Date(msg.payload.data.result.timestamp).toLocaleTimeString();
        this.lastPong = timestamp;
        this.pendingRequests = Math.max(0, this.pendingRequests - 1);
        this.requestUpdate();
      }
    });
  }

  public ping() {
    this.log('Ping Button Clicked');
    this.pendingRequests++;
    this.requestUpdate();
    this.sendMessage('main::background', 'ping', { timestamp: Date.now() });
  }
}
