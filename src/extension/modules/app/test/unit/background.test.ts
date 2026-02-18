import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AppBackground } from '../../background/index.js';
import { MessagingBackground } from '../../../core/messaging/background.js';
import { Logger, Message } from '../../../core/index.js';
import * as path from 'path';

// Mock MessagingBackground
vi.mock('../../../core/messaging/background.js', () => {
  const MockMessagingBackground = vi.fn();
  MockMessagingBackground.prototype.emit = vi.fn();
  MockMessagingBackground.prototype.subscribe = vi.fn((identity: any, handler: (msg: Message) => void) => {
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
vi.mock('../../../core/index.js', async (importOriginal: () => Promise<any>) => {
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
  let contextMock: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Fix: AppBackground constructor expects context, NOT uri
    contextMock = {
      extensionUri: {
        fsPath: '/mock/uri',
        path: '/mock/uri',
        scheme: 'file',
        with: vi.fn(),
        toString: vi.fn()
      },
      subscriptions: [],
      asAbsolutePath: vi.fn()
    };

    console.log('Creating AppBackground with mock context');
    background = new AppBackground(contextMock);
    messengerMock = (MessagingBackground as any).mock.instances[0];
  });

  it('should initialize with "app" module name and "app-view" tag', () => {
    expect((background as any).moduleName).toBe('app');
    expect((background as any).viewTagName).toBe('app-view');
  });

  it('should log "Initialized" on construction', () => {
    expect(Logger.log).toHaveBeenCalledWith('[app::background] Initialized');
  });

  it('should subscribe to messages on construction', () => {
    expect(messengerMock.subscribe).toHaveBeenCalledWith('app::background', expect.any(Function));
  });

  it('should process "log" command', () => {
    const messageHandler = (MessagingBackground as any).handler;
    expect(messageHandler).toBeDefined();

    const mockMessage = {
      payload: {
        command: 'log',
        data: { message: 'Test Log', args: [123] }
      }
    };

    messageHandler(mockMessage);

    expect(Logger.log).toHaveBeenCalledWith(
      '[View] Test Log',
      123
    );
  });
});
