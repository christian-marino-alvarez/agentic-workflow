class ChatViewController {
  constructor(vscode) {
    this.vscode = vscode;
    this.apiUrl = document.body?.dataset?.apiUrl || '';
    this.status = document.getElementById('status');
    this.button = document.getElementById('testButton');
    this.loading = document.getElementById('loading');
    this.chatkit = document.getElementById('chatkit');
  }

  init() {
    this.log('info', 'init');
    this.attachEvents();
    this.log('info', 'webview-ready');
    this.vscode.postMessage({ type: 'webview-ready', view: 'chatView' });
  }

  attachEvents() {
    window.addEventListener('message', (event) => this.handleMessage(event));
    window.addEventListener('load', () => this.setLoadingVisible(false));
    this.button?.addEventListener('click', () => this.handleTestClick());
  }

  setStatus(message) {
    if (this.status) {
      this.status.textContent = message;
    }
  }

  setTestVisible(visible) {
    if (this.button) {
      this.button.hidden = !visible;
    }
  }

  setLoadingVisible(visible) {
    if (this.loading) {
      this.loading.hidden = !visible;
    }
  }

  async initChatKit() {
    if (!this.apiUrl) {
      this.setStatus('Missing API URL.');
      this.setLoadingVisible(false);
      this.log('error', 'missing-api-url');
      return;
    }

    if (!this.chatkit) {
      this.setStatus('ChatKit element not found.');
      this.setLoadingVisible(false);
      this.log('error', 'missing-chatkit-element');
      return;
    }

    this.setTestVisible(false);
    this.setLoadingVisible(true);
    this.log('info', 'chatkit-wait');
    await customElements.whenDefined('openai-chatkit');
    this.log('info', 'chatkit-defined');
    this.chatkit.setOptions({
      apiURL: this.apiUrl,
      api: { url: this.apiUrl, domainKey: 'local-dev' },
      theme: 'light',
      newThreadView: {
        heading: 'Agentic Workflow',
        description: 'Chat con Neo'
      }
    });
    this.setStatus('Ready');
    this.setLoadingVisible(false);
    this.setTestVisible(true);
    this.log('info', 'chatkit-ready');
  }

  async handleTestClick() {
    if (!this.chatkit) {
      return;
    }
    this.setStatus('Sending…');
    this.log('info', 'send-test');
    const timeoutMs = 10000;
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Tenemos problemas, reintentelo mas tarde'));
      }, timeoutMs);
    });
    try {
      await Promise.race([
        this.chatkit.sendUserMessage({
          text: 'Hello I am the first agent called Neo',
          newThread: true
        }),
        timeoutPromise
      ]);
      this.setStatus('Ready');
      this.log('info', 'send-test-ok');
    } catch (error) {
      this.setStatus(error?.message ?? 'Tenemos problemas, reintentelo mas tarde');
      this.log('error', 'send-test-error', { message: error?.message });
    }
  }

  handleMessage(event) {
    const type = event.data?.type;
    if (type === 'api-key-saved') {
      this.log('info', 'api-key-saved');
      this.initChatKit().catch((error) => {
        this.setStatus(error?.message ?? 'Failed to load ChatKit.');
        this.setLoadingVisible(false);
        this.log('error', 'init-chatkit-error', { message: error?.message });
      });
    }
    if (type === 'api-key-missing') {
      this.setStatus('Missing API key.');
      this.setTestVisible(false);
      this.setLoadingVisible(false);
      this.log('info', 'api-key-missing');
    }
    if (type === 'api-key-present') {
      this.log('info', 'api-key-present');
      this.initChatKit().catch((error) => {
        this.setStatus(error?.message ?? 'Failed to load ChatKit.');
        this.setLoadingVisible(false);
        this.log('error', 'init-chatkit-error', { message: error?.message });
      });
    }
  }

  log(level, message, payload) {
    this.vscode.postMessage({ type: 'log', level, message, payload });
  }
}

new ChatViewController(acquireVsCodeApi()).init();
