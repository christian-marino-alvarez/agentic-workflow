import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Background } from '../../background/index.js';
import { MessagingBackground } from '../../messaging/background.js';
import { MessageOrigin } from '../../constants.js';

// Mock MessagingBackground
vi.mock('../../messaging/background.js', () => {
  const MockMessagingBackground = vi.fn();
  MockMessagingBackground.prototype.emit = vi.fn();
  MockMessagingBackground.prototype.subscribe = vi.fn(() => ({ dispose: vi.fn() }));
  return { MessagingBackground: MockMessagingBackground };
});

vi.mock('vscode', () => ({
  Uri: { joinPath: vi.fn() },
  Webview: {}
}));

vi.mock('../../view/html.js', () => ({
  getWebviewHtml: () => '<html>Mocked HTML</html>'
}));

class TestBackground extends Background {
  constructor() {
    super('test-background', { path: '/mock/uri' } as any, 'test-view');
  }

  protected getHtmlForWebview(_webview: any): string {
    return '<html>Mocked HTML</html>';
  }
}

describe('Background Layer', () => {
  let background: TestBackground;
  let messengerMock: any;

  beforeEach(() => {
    vi.clearAllMocks();
    background = new TestBackground();
    messengerMock = (MessagingBackground as any).mock.instances[0];
  });

  it('should initialize with correct identity', () => {
    expect((background as any).identity).toBe('test-background::background');
  });

  it('should delegate sendMessage to messenger', () => {
    background.sendMessage('target', 'cmd', { foo: 'bar' });

    expect(messengerMock.emit).toHaveBeenCalledWith(expect.objectContaining({
      from: 'test-background::background',
      to: 'target',
      origin: MessageOrigin.Server,
      payload: { command: 'cmd', data: { foo: 'bar' } }
    }));
  });

  it('should delegate onMessage to messenger.subscribe', () => {
    const handler = vi.fn();
    background.onMessage(handler);

    expect(messengerMock.subscribe).toHaveBeenCalledWith('test-background::background', handler);
  });
});
