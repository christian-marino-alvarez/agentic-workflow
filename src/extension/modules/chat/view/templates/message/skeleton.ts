import { html } from 'lit';
import { getIcon } from '../utils.js';

/**
 * Full-page loading skeleton shown while the chat is initializing.
 */
export function renderLoadingSkeleton() {
  return html`
    <div class="skeleton-chat">
      <div class="msg-bubble msg-agent skeleton">
        <div class="skeleton-header"></div>
        <div class="skeleton-content">
          <div class="skeleton-line full"></div>
          <div class="skeleton-line" style="width: 75%"></div>
          <div class="skeleton-line half"></div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Compact response skeleton shown while the agent generates a structured response.
 * Rendered in place of the message content during JSON mode streaming.
 */
export function renderResponseSkeleton(role: string = 'agent') {
  return html`
    <div class="msg-bubble msg-agent">
      <div class="msg-header">
        <span class="msg-icon">${getIcon(role)}</span>
        <span class="msg-sender">${role}</span>
      </div>
      <div class="msg-content">
        <div class="response-skeleton">
          <div class="skeleton-line" style="width: 85%; animation-delay: 0s"></div>
          <div class="skeleton-line" style="width: 60%; animation-delay: 0.15s"></div>
          <div class="skeleton-line" style="width: 40%; animation-delay: 0.3s"></div>
        </div>
      </div>
    </div>
  `;
}
