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

function renderRoleRow(view: Settings, roleData: { name: string, icon?: string, description?: string }) {
  const role = roleData.name;
  const currentModelId = view.roleBindings[role] || '';
  /* Use icon from binding or default */
  const roleIcon = getRoleIcon(role, roleData.icon);

  return html`
    <div class="model-card">
      <div class="model-icon-left">
        ${roleIcon}
      </div>
      <div class="model-info">
        <span class="model-name">${role}</span>
        <span class="model-details" title="${roleData.description || `Controls ${role} agent responsibilities`}">${roleData.description || `Controls ${role} agent responsibilities`
    }</span>
      </div>
      <div class="model-actions">
        <select 
          class="select-input"
          style="min-width: 140px; padding: 4px 8px; border-radius: 4px; background: var(--vscode-dropdown-background); color: var(--vscode-dropdown-foreground); border: 1px solid var(--vscode-dropdown-border);"
          @change="${(e: Event) => view.updateBinding(role, (e.target as HTMLSelectElement).value)}"
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
