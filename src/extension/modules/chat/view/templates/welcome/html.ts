import { html, TemplateResult, nothing } from 'lit';
import { IChatView } from '../../types.js';

// ─── Welcome Screen ──────────────────────────────────────
export function renderWelcome(view: IChatView): TemplateResult {
  const hasSessions = view.sessionList.length > 0;

  return html`
    <div class="welcome-screen">
      <div class="welcome-content">
        <div class="welcome-icon">${hasSessions ? '👋' : '🚀'}</div>
        <h2 class="welcome-title">${hasSessions ? '¡Hola de nuevo!' : 'Extensio Agent'}</h2>
        <p class="welcome-description">
          ${hasSessions
      ? 'Retoma una tarea existente o empieza una nueva.'
      : html`Tu asistente de desarrollo con agentes especializados.
              Cada tarea sigue un ciclo de vida guiado: desde la definición
              hasta la verificación.`}
        </p>

        ${hasSessions ? renderSessionList(view) : renderFeatures()}

        <button
          class="welcome-start-btn"
          @click=${() => view.startNewTask()}
        >
          ✨ ${hasSessions ? 'Nueva tarea' : 'Empezar nueva tarea'}
        </button>
      </div>
    </div>
  `;
}

// ─── Features (empty state) ─────────────────────────────
function renderFeatures(): TemplateResult {
  return html`
    <div class="welcome-features">
      <div class="welcome-feature">
        <span class="feature-icon">🏗️</span>
        <span class="feature-text">Arquitectura modular con agentes expertos</span>
      </div>
      <div class="welcome-feature">
        <span class="feature-icon">🔄</span>
        <span class="feature-text">Workflows guiados con gates de calidad</span>
      </div>
      <div class="welcome-feature">
        <span class="feature-icon">📋</span>
        <span class="feature-text">Trazabilidad completa del ciclo de vida</span>
      </div>
    </div>
  `;
}

// ─── Session List (resume state) ─────────────────────────
function renderSessionList(view: IChatView): TemplateResult {
  // First session is the most recent — show as primary "resume" card
  const lastSession = view.sessionList[0];
  const others = view.sessionList.slice(1, 4); // Show up to 3 more

  return html`
    <div class="welcome-sessions">
      ${lastSession ? html`
        <button
          class="welcome-resume-btn"
          @click=${() => view.loadSession(lastSession.id)}
        >
          <div class="resume-label">▶ Retomar última tarea</div>
          <div class="resume-title">${lastSession.title || 'Sin título'}</div>
          <div class="resume-meta">
            ${lastSession.messageCount || 0} mensajes
            · ${formatTimeAgo(lastSession.timestamp)}
          </div>
        </button>
      ` : nothing}

      ${others.length > 0 ? html`
        <div class="welcome-others-label">Otras tareas</div>
        <div class="welcome-others">
          ${others.map(s => html`
            <button
              class="welcome-session-item"
              @click=${() => view.loadSession(s.id)}
            >
              <span class="session-title">${s.title || 'Sin título'}</span>
              <span class="session-meta">${formatTimeAgo(s.timestamp)}</span>
            </button>
          `)}
        </div>
      ` : nothing}
    </div>
  `;
}

function formatTimeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) { return 'ahora'; }
  if (mins < 60) { return `hace ${mins}m`; }
  const hours = Math.floor(mins / 60);
  if (hours < 24) { return `hace ${hours}h`; }
  const days = Math.floor(hours / 24);
  return `hace ${days}d`;
}
