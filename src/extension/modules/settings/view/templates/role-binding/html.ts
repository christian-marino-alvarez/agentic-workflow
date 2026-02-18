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

function renderRoleRow(view: Settings, roleData: { name: string, icon?: string, description?: string }) {
  const role = roleData.name;
  const currentModelId = view.roleBindings[role] || '';
  const roleIcon = getRoleIcon(role, roleData.icon);
  const isDisabled = view.disabledRoles.has(role);
  const isPending = view.pendingToggleRole === role;

  return html`
    <div class="model-card ${isDisabled ? 'disabled' : ''}">
      <div class="model-icon-left">${roleIcon}</div>
      <div class="model-info">
        <span class="model-name">${role}</span>
        <span class="model-details" title="${roleData.description || `Controls ${role} agent responsibilities`}">${roleData.description || `Controls ${role} agent responsibilities`}</span>
      </div>
      <div class="model-actions">
        ${renderPowerButton(view, role, isDisabled, isPending)}
        <select 
          class="select-input"
          style="min-width: 140px; padding: 4px 8px; border-radius: 4px; background: var(--vscode-dropdown-background); color: var(--vscode-dropdown-foreground); border: 1px solid var(--vscode-dropdown-border);"
          @change="${(e: Event) => view.updateBinding(role, (e.target as HTMLSelectElement).value)}"
          ?disabled="${isDisabled}"
        >
          <option value="" ?selected="${!currentModelId}">-- Select Model --</option>
          ${view.models.map(model => html`
            <option value="${model.id}" ?selected="${model.id === currentModelId}">
              ${model.name} (${model.provider})
            </option>
          `)}
        </select>
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
