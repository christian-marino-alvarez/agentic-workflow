import { html, TemplateResult } from 'lit';
import { Settings } from '../../index.js';

function formatTokens(n: number): string {
  if (n >= 1_000_000) { return `${(n / 1_000_000).toFixed(1)}M`; }
  if (n >= 1_000) { return `${(n / 1_000).toFixed(1)}K`; }
  return String(n);
}

function formatMonth(key: string): string {
  if (!key) { return ''; }
  const [year, month] = key.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[parseInt(month) - 1]} ${year}`;
}

export function renderPricing(view: Settings): TemplateResult {
  const pricing = view.pricing || {};
  const keys = Object.keys(pricing).filter(k => k !== 'default');
  const usage = view.monthlyUsage;
  const hasUsage = usage && usage.totalTokens > 0;

  return html`
    <div class="section pricing-section">
      <div class="section-header">
        <h2>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -2px; margin-right: 4px;">
            <line x1="12" y1="1" x2="12" y2="23"/>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
          Usage &amp; Pricing
        </h2>
      </div>

      <div class="settings-list-container">
        <!-- Monthly Usage Summary -->
        <div class="usage-summary">
          <div class="usage-month">${view.currentMonth ? formatMonth(view.currentMonth) : 'Current month'}</div>
          <div class="usage-stats">
            <div class="usage-stat">
              <span class="usage-stat-value">${hasUsage ? formatTokens(usage.totalTokens) : '0'}</span>
              <span class="usage-stat-label">tokens</span>
            </div>
            <div class="usage-stat">
              <span class="usage-stat-value">${hasUsage ? formatTokens(usage.inputTokens) : '0'}</span>
              <span class="usage-stat-label">input</span>
            </div>
            <div class="usage-stat">
              <span class="usage-stat-value">${hasUsage ? formatTokens(usage.outputTokens) : '0'}</span>
              <span class="usage-stat-label">output</span>
            </div>
            <div class="usage-stat">
              <span class="usage-stat-value cost">${hasUsage ? `$${usage.estimatedCost < 0.01 ? '<0.01' : usage.estimatedCost.toFixed(2)}` : '$0.00'}</span>
              <span class="usage-stat-label">cost</span>
            </div>
            <div class="usage-stat">
              <span class="usage-stat-value">${hasUsage ? usage.requests : 0}</span>
              <span class="usage-stat-label">requests</span>
            </div>
          </div>
        </div>

        <!-- Pricing Configuration -->
        <div class="pricing-grid">
          <div class="pricing-header">
            <span>Model</span>
            <span>Input</span>
            <span>Output</span>
          </div>
          ${keys.map(key => {
    const rate = pricing[key] || { input: 0, output: 0 };
    return html`
              <div class="pricing-row">
                <span class="pricing-model">${key}</span>
                <input
                  type="number"
                  class="pricing-input"
                  step="0.01"
                  min="0"
                  .value="${String(rate.input)}"
                  @change="${(e: Event) => view.updatePricing(key, 'input', parseFloat((e.target as HTMLInputElement).value) || 0)}"
                />
                <input
                  type="number"
                  class="pricing-input"
                  step="0.01"
                  min="0"
                  .value="${String(rate.output)}"
                  @change="${(e: Event) => view.updatePricing(key, 'output', parseFloat((e.target as HTMLInputElement).value) || 0)}"
                />
              </div>
            `;
  })}
        </div>
        <div class="pricing-actions">
          <button class="pricing-add-btn" @click="${() => view.addPricingRow()}">+ Add model</button>
        </div>
        <p style="font-size: 11px; color: var(--vscode-descriptionForeground); margin: 8px 0 0;">
          Rates in USD per 1M tokens. Model names are matched by pattern (e.g. "flash" matches "gemini-2.5-flash").
        </p>
      </div>
    </div>
  `;
}
