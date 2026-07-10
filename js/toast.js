// Toast notifications (Phase 1 extract)
import { sanitizeHTML } from './utils.js?v=2.0.16';
import { toastIcons, toastTitles } from './constants.js?v=2.0.16';

function ensureToastContainer() {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    container.setAttribute('role', 'alert');
    container.setAttribute('aria-live', 'polite');
    document.body.appendChild(container);
  }
  return container;
}

export function showToast(message, type = 'info', duration = 4000) {
  const container = ensureToastContainer();
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.setAttribute('role', 'alert');
  toast.innerHTML = `
    <span class="toast-icon" aria-hidden="true">${toastIcons[type] || 'ℹ'}</span>
    <div class="toast-content">
      <span class="toast-title">${toastTitles[type] || 'Info'}</span>
      <span class="toast-message">${sanitizeHTML(message)}</span>
    </div>
    <button class="toast-close" aria-label="Close notification">✕</button>
  `;
  container.appendChild(toast);
  const removeToast = () => {
    toast.classList.add('toast-out');
    setTimeout(() => toast.remove(), 250);
  };
  toast.querySelector('.toast-close').addEventListener('click', removeToast);
  if (duration > 0) setTimeout(removeToast, duration);
  return toast;
}

/** Publisher / form status line helper */
export function showStatusEl(targetEl, msg, type) {
  if (!targetEl) return;
  targetEl.textContent = msg;
  targetEl.className = 'publisher-status';
  if (type === 'success') {
    targetEl.style.color = 'var(--brand-green)';
  } else if (type === 'error') {
    targetEl.style.color = '#b91c1c';
  } else {
    targetEl.style.color = 'var(--gray-600)';
  }
  targetEl.classList.remove('hidden');
}

export function showStatus(msg, type) {
  const statusEl = document.getElementById('publisher-status');
  if (!statusEl) return;
  showStatusEl(statusEl, msg, type);
}
