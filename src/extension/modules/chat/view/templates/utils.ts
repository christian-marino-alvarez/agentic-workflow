import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { marked } from 'marked';
import { getRoleIcon } from '../../../settings/view/templates/icons.js';

// Configure marked for chat-friendly output
marked.setOptions({
  gfm: true,
  breaks: true,
});

export function renderMarkdown(text: string): ReturnType<typeof unsafeHTML> {
  try {
    let htmlContent = marked.parse(text) as string;
    // Convert file paths inside <code> tags to clickable links
    htmlContent = linkifyFilePaths(htmlContent);
    return unsafeHTML(htmlContent);
  } catch {
    return unsafeHTML(`<p>${text}</p>`);
  }
}

/**
 * Detect file paths inside <code> tags and make them clickable.
 * Matches patterns like: .agent/artifacts/..., src/..., *.md, *.ts, etc.
 */
function linkifyFilePaths(html: string): string {
  // Match content inside <code>...</code> that looks like a file path
  return html.replace(/<code>([^<]+)<\/code>/g, (_match, content: string) => {
    const trimmed = content.trim();
    // Check if it looks like a file path
    const isPath = /^[\w./-]+\.\w{1,5}$/.test(trimmed) || // file.ext
      /^\.?agent\//.test(trimmed) ||          // .agent/...
      /^src\//.test(trimmed) ||                // src/...
      /^\.\//.test(trimmed);                   // ./...
    if (isPath) {
      return `<code class="file-link" data-file-path="${trimmed}" title="Click to open ${trimmed}">${trimmed}</code>`;
    }
    return `<code>${content}</code>`;
  });
}

export function getIcon(role?: string) {
  if (role === 'user') {
    return html`<svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor"><path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4Zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10Z"/></svg>`;
  }
  if (role === 'system') {
    return html`<svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a2 2 0 0 1 2 2v2H6V3a2 2 0 0 1 2-2zm3 4V3a3 3 0 1 0-6 0v2a3 3 0 0 0-3 3v7h12V8a3 3 0 0 0-3-3zM7 14v-2h2v2H7zm0-3V9h2v2H7z"/></svg>`;
  }
  return getRoleIcon(role || 'architect');
}

export function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}
