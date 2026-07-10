// First-run onboarding: name, church, location, start first module
import { modules } from '../modules.js?v=2.0.29';
import { state } from './state.js?v=2.0.29';
import { saveState, updateHeaderProfile, isModuleReleased } from './user.js?v=2.0.29';
import { showToast } from './toast.js?v=2.0.29';
import { startModule } from './lesson.js?v=2.0.29';
import { setNotificationPrefs, getNotificationPrefs } from './notifications.js?v=2.0.29';
import { requestAndSaveToken } from './push.js?v=2.0.29';

export function needsOnboarding() {
  if (state.userState.onboardingCompleted) return false;
  const name = (state.userState.name || '').trim();
  const country = (state.userState.country || '').trim();
  return !name || name === 'Scriptura Learner' || !country;
}

function firstReleasedModule() {
  return modules.find(m => m && isModuleReleased(m.id)) || modules[0] || null;
}

export function maybeShowOnboarding() {
  if (!needsOnboarding()) return;
  const overlay = document.getElementById('onboarding-overlay');
  if (!overlay) return;

  const nameInput = document.getElementById('onboard-name');
  const churchInput = document.getElementById('onboard-church');
  const countrySelect = document.getElementById('onboard-country');
  const dailyCb = document.getElementById('onboard-daily-reminder');

  if (nameInput) nameInput.value = state.userState.name || '';
  if (churchInput) churchInput.value = state.userState.church || '';
  if (countrySelect) countrySelect.value = state.userState.country || 'SG';
  if (dailyCb) dailyCb.checked = getNotificationPrefs().dailyReminder !== false;

  const first = firstReleasedModule();
  const moduleHint = document.getElementById('onboard-module-hint');
  if (moduleHint && first) {
    moduleHint.textContent = `Suggested first lesson: ${first.title}`;
  }

  overlay.classList.remove('hidden');
}

export function wireOnboarding() {
  const overlay = document.getElementById('onboarding-overlay');
  if (!overlay || overlay.dataset.wired) return;
  overlay.dataset.wired = '1';

  document.getElementById('onboard-skip-btn')?.addEventListener('click', async () => {
    state.userState.onboardingCompleted = true;
    if (!state.userState.country) state.userState.country = 'SG';
    await saveState();
    overlay.classList.add('hidden');
  });

  document.getElementById('onboard-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('onboard-name')?.value.trim();
    const church = document.getElementById('onboard-church')?.value.trim();
    const country = document.getElementById('onboard-country')?.value || 'SG';
    const dailyReminder = document.getElementById('onboard-daily-reminder')?.checked !== false;
    const startLesson = document.getElementById('onboard-start-lesson')?.checked;

    if (!name) {
      showToast('Please enter your name.', 'warning');
      return;
    }

    state.userState.name = name;
    state.userState.church = church || '';
    state.userState.country = country;
    state.userState.onboardingCompleted = true;
    await setNotificationPrefs({ dailyReminder, reminderHour: 8 });
    await saveState();
    updateHeaderProfile();

    if (dailyReminder && typeof Notification !== 'undefined' && Notification.permission === 'default') {
      try {
        const perm = await Notification.requestPermission();
        if (perm === 'granted') {
          await requestAndSaveToken(state.swRegistration);
        }
      } catch (_) { /* ignore */ }
    }

    overlay.classList.add('hidden');
    showToast(`Welcome, ${name}!`, 'success');

    if (startLesson) {
      const first = firstReleasedModule();
      if (first) startModule(first.id);
    }
  });
}
