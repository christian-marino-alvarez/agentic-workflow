class HistoryViewController {
  constructor(vscode) {
    this.vscode = vscode;
    this.loading = document.getElementById('loading');
  }

  init() {
    this.log('info', 'init');
    window.addEventListener('load', () => this.hideLoading());
    this.log('info', 'webview-ready');
    this.vscode.postMessage({ type: 'webview-ready', view: 'historyView' });
  }

  hideLoading() {
    if (this.loading) {
      this.loading.hidden = true;
    }
  }

  log(level, message, payload) {
    this.vscode.postMessage({ type: 'log', level, message, payload });
  }
}

new HistoryViewController(acquireVsCodeApi()).init();
