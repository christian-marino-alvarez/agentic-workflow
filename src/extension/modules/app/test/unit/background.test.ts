import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AppBackground } from '../../background/index.js';
import { MessagingBackground } from '../../../core/messaging/background.js';
import { Logger, Message } from '../../../core/index.js';

// Mock MessagingBackground
vi.mock('../../../core/messaging/background.js', () => {
  const MockMessagingBackground = vi.fn();
  MockMessagingBackground.prototype.emit = vi.fn();
  MockMessagingBackground.prototype.subscribe = vi.fn((identity, handler: (msg: Message) => void) => {
    // Store handler to simulate receiving messages
    (MockMessagingBackground as any).handler = handler;
    return { dispose: vi.fn() };
  });
  MockMessagingBackground.prototype.setWebview = vi.fn();
  MockMessagingBackground.prototype.dispose = vi.fn();
  return { MessagingBackground: MockMessagingBackground };
});

// Mock Logger
vi.mock('../../../core/logger.js', () => ({
  Logger: {
    log: vi.fn(),
    init: vi.fn(),
    show: vi.fn()
  }
}));

// Mock vscode
vi.mock('vscode', () => ({
  Uri: { joinPath: vi.fn() },
  window: {
    createOutputChannel: vi.fn(() => ({
      appendLine: vi.fn(),
      show: vi.fn()
    }))
  }
}));

// Mock Core modules
vi.mock('../../../core/index.js', async (importOriginal) => {
  const original = await importOriginal() as any;
  return {
    ...original,
    ViewHtml: {
      getWebviewHtml: vi.fn(() => '<html>test</html>')
    }
  };
});

describe('AppBackground', () => {
  let background: AppBackground;
  let messengerMock: any;

  beforeEach(() => {
    vi.clearAllMocks();
    background = new AppBackground({ path: '/mock/uri' } as any);
    messengerMock = (MessagingBackground as any).mock.instances[0];
  });

  it('should initialize with "main" module name and "main-view" tag', () => {
    expect((background as any).moduleName).toBe('main');
    expect((background as any).viewTagName).toBe('main-view');
  });

  it('should log "Initialized" on construction', () => {
    expect(Logger.log).toHaveBeenCalledWith('[Background:main] Initialized');
  });

  it('should subscribe to messages on construction', () => {
    expect(messengerMock.subscribe).toHaveBeenCalledWith('main::background', expect.any(Function));
  });

  it('should log received messages', () => {
    const messageHandler = (MessagingBackground as any).handler;
    expect(messageHandler).toBeDefined();

    const mockMessage = {
      payload: {
        command: 'ping',
        data: { test: true }
      }
    };

    messageHandler(mockMessage);

    expect(Logger.log).toHaveBeenCalledWith(
      '[Background:main] Received Message: ping',
      { test: true }
    );
  });
});
