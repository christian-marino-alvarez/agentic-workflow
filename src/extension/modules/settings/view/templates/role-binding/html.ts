import { html, nothing } from 'lit';
import { Settings } from '../../index.js';
import { getRoleIcon } from '../icons.js';


function renderEmptyState() {
  return html`
    <div class="empty-state">
      <div class="empty-state-content">
        <span class="codicon codicon-info" style="font-size: 24px; margin-bottom: 8px;"></span>
        <p>No roles found in .agent/rules/roles/</p>
      </div>
    </div>
  `;
}

const powerIcon = html`
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M18.36 6.64a9 9 0 1 1-12.73 0"/>
    <line x1="12" y1="2" x2="12" y2="12"/>
  </svg>
`;

function renderPowerButton(view: Settings, role: string, isDisabled: boolean, isPending: boolean) {
  if (isPending) {
    const tooltip = isDisabled ? 'Click again to confirm activation' : 'Click again to confirm deactivation';
    const label = isDisabled ? 'Activate?' : 'Deactivate?';
    return html`
      <div class="power-btn-wrap" data-tooltip="${tooltip}">
        <button class="power-btn pending" @click="${() => view.toggleRole(role)}" title="${tooltip}">
          ${powerIcon}
          <span class="power-btn-label">${label}</span>
        </button>
      </div>
    `;
  }

  const tooltip = isDisabled ? 'Click to activate this agent' : 'Click to deactivate this agent';
  return html`
    <div class="power-btn-wrap" data-tooltip="${tooltip}">
      <button class="power-btn ${isDisabled ? 'off' : 'on'}" @click="${() => view.toggleRole(role)}" title="${tooltip}">
        ${powerIcon}
      </button>
    </div>
  `;
}

/**
 * Get distinct providers from registered models.
 */
function getDistinctProviders(view: Settings): string[] {
  const providers = new Set(view.models.map(m => m.provider));
  return Array.from(providers);
}

/**
 * Default capabilities that can be inferred from a model.
 */
const ALL_CAPABILITIES = ['vision', 'tooling', 'streaming', 'code_execution'];

function renderCapabilityToggles(view: Settings, role: string, capabilities: Record<string, boolean> | undefined, isDisabled: boolean) {
  const caps = capabilities || {};

  return html`
    <div class="capability-toggles">
      ${ALL_CAPABILITIES.map(cap => {
    const isActive = !!caps[cap];
    return html`
          <button
            class="capability-tag ${isActive ? 'active' : ''}"
            @click="${() => view.toggleCapability(role, cap)}"
            ?disabled="${isDisabled}"
            title="${cap}: ${isActive ? 'enabled' : 'disabled'}"
          >
            ${cap.replace('_', ' ')}
          </button>
        `;
  })}
    </div>
  `;
}

function renderProviderDropdown(view: Settings, role: string, currentProvider: string | undefined, isDisabled: boolean) {
  const providers = getDistinctProviders(view);

  return html`
    <div class="dropdown-group">
      <label class="dropdown-label">Provider</label>
      <select
        class="dropdown"
        @change="${(e: Event) => view.userActionProviderChangedForRole(role, e)}"
        ?disabled="${isDisabled}"
      >
        <option value="" ?selected="${!currentProvider}">Select provider…</option>
        ${providers.map(p => html`
          <option value="${p}" ?selected="${p === currentProvider}">
            ${p.charAt(0).toUpperCase() + p.slice(1)}
          </option>
        `)}
      </select>
    </div>
  `;
}

function renderModelDropdown(view: Settings, role: string, currentProvider: string | undefined, currentModelId: string | undefined, isDisabled: boolean) {
  if (!currentProvider) {
    return html`
      <div class="dropdown-group">
        <label class="dropdown-label">Model</label>
        <select class="dropdown" disabled>
          <option>Select provider first…</option>
        </select>
      </div>
    `;
  }

  // Use discovered models from API if available, otherwise fall back to registered models
  const discovered = view.providerDiscoveredModels[currentProvider];
  const hasDiscovered = discovered && discovered.length > 0;

  // Fallback to registered models for this provider
  const registeredForProvider = view.models
    .filter(m => m.provider === currentProvider)
    .map(m => ({ id: m.id, displayName: m.name }));

  const modelList = hasDiscovered ? discovered : registeredForProvider;

  return html`
    <div class="dropdown-group">
      <label class="dropdown-label">Model ${hasDiscovered ? `(${modelList.length})` : ''}</label>
      <select
        class="dropdown"
        @change="${(e: Event) => view.userActionModelChangedForRole(role, currentProvider, e)}"
        ?disabled="${isDisabled}"
      >
        <option value="" ?selected="${!currentModelId}">Select model…</option>
        ${modelList.map(model => html`
          <option value="${model.id}" ?selected="${model.id === currentModelId}">
            ${model.displayName || model.id}
          </option>
        `)}
      </select>
    </div>
  `;
}

function renderRoleRow(view: Settings, roleData: { name: string, icon?: string, description?: string, model?: { provider?: string, id?: string }, capabilities?: Record<string, boolean> }) {
  const role = roleData.name;
  const roleIcon = getRoleIcon(role, roleData.icon);
  const isDisabled = view.disabledRoles.has(role);
  const isPending = view.pendingToggleRole === role;

  const currentProvider = roleData.model?.provider;
  const currentModelId = roleData.model?.id;

  return html`
    <div class="model-card ${isDisabled ? 'disabled' : ''}">
      <div class="role-row-header">
        <div class="model-icon-left">${roleIcon}</div>
        <div class="model-info">
          <span class="model-name">${role}</span>
          <span class="model-details" title="${roleData.description || `Controls ${role} agent`}">${roleData.description || `Controls ${role} agent`}</span>
        </div>
        ${renderPowerButton(view, role, isDisabled, isPending)}
      </div>

      <div class="role-row-config ${isDisabled ? 'config-disabled' : ''}">
        <div class="role-dropdowns">
          ${renderProviderDropdown(view, role, currentProvider, isDisabled)}
          ${renderModelDropdown(view, role, currentProvider, currentModelId, isDisabled)}
        </div>
        ${renderCapabilityToggles(view, role, roleData.capabilities, isDisabled || !currentModelId)}
      </div>
    </div>
  `;
}

function renderRoleList(view: Settings) {
  if (view.roles.length === 0) {
    return renderEmptyState();
  }

  return html`
    ${view.roles.map(role => renderRoleRow(view, role))}
  `;
}

export function renderRoleBinding(view: Settings) {
  return html`
    <div class="section role-binding-section">
      <div class="section-header">
        <h2>Agents</h2>
      </div>
      
      <div class="settings-list-container">
        ${renderRoleList(view)}
      </div>
    </div>
  `;
}
