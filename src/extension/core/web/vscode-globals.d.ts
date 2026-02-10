interface VsCodeApi {
  postMessage(message: Record<string, unknown>): void;
  getState?(): unknown;
  setState?(state: unknown): void;
}

interface Window {
  acquireVsCodeApi?: () => VsCodeApi;
}
