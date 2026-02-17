import { html } from 'lit';

export function renderSkeleton() {
  return html`
    <div class="settings-list-container">
      ${[1, 2, 3].map(() => html`
        <div class="model-card skeleton">
          <div class="model-info" style="width: 100%">
            <div class="skeleton-title"></div>
            <div class="skeleton-meta"></div>
          </div>
          <div class="model-actions">
            <div class="skeleton-button"></div>
          </div>
        </div>
      `)}
    </div>
  `;
}
