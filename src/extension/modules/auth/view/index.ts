import { View } from '../../core/view/index.js';
import { customElement } from 'lit/decorators.js';
import { NAME } from '../constants.js';
import { styles } from './templates/css.js';
import { render } from './templates/html.js';

@customElement('auth-view')
export class Auth extends View {
  static override styles = styles;
  protected override readonly moduleName = NAME;

  override render() {
    return render(this);
  }

  public override listen(message: any): void {
    // Handle incoming messages if needed
  }
}
