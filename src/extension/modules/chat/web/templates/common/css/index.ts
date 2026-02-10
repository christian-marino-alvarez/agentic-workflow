import { css } from 'lit';

export const commonStyles = css`
  :host {
    --agw-glass-bg: rgba(255, 255, 255, 0.03);
    --agw-glass-blur: blur(12px);
    --agw-accent: #6366f1;
    --agw-accent-glow: rgba(99, 102, 241, 0.3);
    --agw-gradient-primary: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
    --agw-surface: #0f172a;
    --agw-border: rgba(255, 255, 255, 0.1);
    
    font-family: 'Inter', 'Outfit', var(--vscode-font-family, sans-serif);
    color: var(--vscode-foreground);
  }

  .glass-card {
    background: var(--agw-glass-bg);
    backdrop-filter: var(--agw-glass-blur);
    -webkit-backdrop-filter: var(--agw-glass-blur);
    border: 1px solid var(--agw-border);
    border-radius: 12px;
    padding: 16px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .glass-card:hover {
    border-color: var(--agw-accent);
    box-shadow: 0 0 20px var(--agw-accent-glow);
    transform: translateY(-2px);
  }

  .btn-primary {
    background: var(--agw-gradient-primary);
    color: white;
    border: none;
    border-radius: 8px;
    padding: 10px 20px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-size: 12px;
  }

  .btn-primary:hover {
    opacity: 0.9;
    transform: scale(1.02);
    box-shadow: 0 4px 12px var(--agw-accent-glow);
  }

  .btn-primary:active {
    transform: scale(0.98);
  }

  .input-field {
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid var(--agw-border);
    border-radius: 8px;
    color: white;
    padding: 12px;
    width: 100%;
    box-sizing: border-box;
    transition: border-color 0.2s;
  }

  .input-field:focus {
    outline: none;
    border-color: var(--agw-accent);
  }

  .badge {
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 10px;
    font-weight: bold;
    text-transform: uppercase;
  }

  .badge-pro { background: #10b981; color: white; }
  .badge-dev { background: #f59e0b; color: white; }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .animate-fade {
    animation: fadeIn 0.4s ease-out forwards;
  }
`;
