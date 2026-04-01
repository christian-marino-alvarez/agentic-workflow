import { css } from 'lit';

export const a2uiStyles = css`
  /* ─── A2UI Component Card ─── */
  .a2ui-card {
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    padding: 14px 16px;
    margin: 10px 0 4px;
    transition: all 0.3s ease;
  }

  .a2ui-card:hover {
    border-color: rgba(255, 255, 255, 0.18);
    background: rgba(255, 255, 255, 0.06);
  }

  .a2ui-label {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    color: rgba(232, 197, 110, 0.8);
    margin-bottom: 10px;
  }

  /* ─── Radio Options ─── */
  .a2ui-options {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 12px;
  }

  .a2ui-option {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid transparent;
  }

  .a2ui-option:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.12);
  }

  .a2ui-option input[type="radio"] {
    display: none;
  }

  .a2ui-option-radio {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.3);
    flex-shrink: 0;
    position: relative;
    transition: all 0.2s ease;
  }

  .a2ui-option-radio::after {
    content: '';
    position: absolute;
    top: 3px;
    left: 3px;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: transparent;
    transition: all 0.2s ease;
  }

  .a2ui-option input[type="radio"]:checked + .a2ui-option-radio {
    border-color: #e67e22;
  }

  .a2ui-option input[type="radio"]:checked + .a2ui-option-radio::after {
    background: #e67e22;
  }

  .a2ui-option input[type="radio"]:checked ~ .a2ui-option-text {
    color: rgba(255, 255, 255, 0.95);
    font-weight: 500;
  }

  .a2ui-option-text {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.7);
    line-height: 1.3;
  }

  /* ─── Action Buttons ─── */
  .a2ui-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
  }

  .a2ui-btn {
    padding: 6px 16px;
    border-radius: 6px;
    border: none;
    cursor: pointer;
    font-size: 12px;
    font-weight: 600;
    transition: all 0.2s ease;
    letter-spacing: 0.3px;
  }

  .a2ui-btn-confirm {
    background: #e67e22;
    color: white;
  }

  .a2ui-btn-confirm:hover {
    background: #d35400;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(230, 126, 34, 0.3);
  }

  .a2ui-btn-cancel {
    background: rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.5);
  }

  .a2ui-btn-cancel:hover {
    background: rgba(244, 67, 54, 0.15);
    color: #f44336;
  }

  /* ─── Result State ─── */
  .a2ui-completed {
    background: rgba(76, 175, 80, 0.08);
    border-color: rgba(76, 175, 80, 0.3);
    padding: 10px 14px;
  }

  .a2ui-dismissed {
    background: rgba(255, 255, 255, 0.02);
    border-color: rgba(255, 255, 255, 0.05);
    padding: 8px 14px;
    opacity: 0.5;
  }

  .a2ui-result {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.8);
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .a2ui-result-icon {
    font-size: 14px;
  }

  .a2ui-result-dismissed {
    color: rgba(255, 255, 255, 0.4);
  }

  /* ─── Shake Animation ─── */
  @keyframes a2ui-shake {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-4px); }
    40% { transform: translateX(4px); }
    60% { transform: translateX(-3px); }
    80% { transform: translateX(3px); }
  }

  .a2ui-shake {
    animation: a2ui-shake 0.4s ease;
    border-color: rgba(244, 67, 54, 0.5) !important;
  }

  /* ─── Sequential Flow ─── */
  .a2ui-sequence {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .a2ui-pending {
    opacity: 0.35;
    padding: 8px 14px;
    pointer-events: none;
  }

  .a2ui-pending .a2ui-label {
    margin-bottom: 2px;
    font-size: 10px;
  }

  .a2ui-pending-hint {
    font-size: 10px;
    color: rgba(255, 255, 255, 0.3);
    font-style: italic;
  }

  .a2ui-active {
    border-color: rgba(230, 126, 34, 0.3);
    animation: a2ui-fadein 0.3s ease;
  }

  @keyframes a2ui-fadein {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;
