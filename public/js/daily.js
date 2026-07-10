// Feature module: daily (Phase 2)
import { dailyReadings } from '../daily_readings.js?v=2.0.14';
import { sanitizeHTML, getDayOfYear } from './utils.js?v=2.0.14';
import { showToast } from './toast.js?v=2.0.14';
import { state } from './state.js?v=2.0.14';
import { awardXP, logActivity, recordActivity, saveState } from './user.js?v=2.0.14';

export function getTodaysReading() {
  if (!dailyReadings || dailyReadings.length === 0) return null;
  const dayOfYear = getDayOfYear();
  const index = (dayOfYear - 1) % dailyReadings.length;
  return dailyReadings[index];
}

export function isDailyReadingCompletedToday() {
  const todayStr = new Date().toDateString();
  const lastDate = state.userState.lastDailyReadingDate ? new Date(state.userState.lastDailyReadingDate).toDateString() : null;
  return lastDate === todayStr;
}

export function renderDailyReading() {
  const container = document.getElementById('daily-reading-container');
  if (!container) return;

  const reading = getTodaysReading();
  if (!reading) {
    container.innerHTML = '';
    return;
  }

  const isCompleted = isDailyReadingCompletedToday();
  const completedCount = (state.userState.dailyReadingsCompleted || []).length;
  const totalCount = dailyReadings.length;

  container.innerHTML = `
    <div class="daily-reading-card-inner" style="background: linear-gradient(135deg, #fff7ed 0%, #fff 100%); border: 1px solid #fed7aa; border-radius: var(--r-lg); padding: 1.25rem; box-shadow: var(--shadow-sm); position: relative; overflow: hidden;">
      <div style="position: absolute; top: 0; right: 0; width: 80px; height: 80px; background: radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 70%); border-radius: 50%;"></div>
      <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem;">
        <span style="font-size: 1.25rem;">🌅</span>
        <span style="font-size: 0.75rem; font-weight: 800; color: var(--brand-coral); text-transform: uppercase; letter-spacing: 0.08em;">Today's Daily Reading</span>
        <span style="margin-left: auto; font-size: 0.7rem; font-weight: 600; color: var(--gray-400); background: var(--gray-50); padding: 0.2rem 0.5rem; border-radius: 999px;">Day ${reading.day} of ${totalCount}</span>
      </div>
      <h3 style="font-family: var(--font-display); font-weight: 700; font-size: 1.1rem; color: var(--gray-900); margin-bottom: 0.35rem;">${sanitizeHTML(reading.title)}</h3>
      <div style="font-size: 0.9rem; line-height: 1.5; color: var(--gray-700); margin-bottom: 0.75rem;">
        <span style="font-style: italic; color: var(--gray-600);">"${sanitizeHTML(reading.verse)}"</span>
        <span style="font-weight: 700; color: var(--brand-coral); white-space: nowrap;">— ${sanitizeHTML(reading.reference)}</span>
      </div>
      <p style="font-size: 0.85rem; line-height: 1.55; color: var(--gray-600); margin-bottom: 0.75rem;">${sanitizeHTML(reading.reflection)}</p>
      ${reading.question ? `<div style="background: #fff; border-left: 3px solid var(--brand-coral); padding: 0.6rem 0.85rem; border-radius: 0 var(--r-md) var(--r-md) 0; margin-bottom: 1rem;"><p style="font-size: 0.8rem; color: var(--gray-600); margin: 0;"><strong>Reflect:</strong> ${sanitizeHTML(reading.question)}</p></div>` : ''}
      <div style="display: flex; align-items: center; justify-content: space-between; gap: 1rem;">
        <div style="font-size: 0.75rem; color: var(--gray-400);">${completedCount} of ${totalCount} readings completed</div>
        <button id="daily-reading-action-btn" class="primary-btn ${isCompleted ? 'secondary-btn' : ''}" style="min-width: 140px; ${isCompleted ? 'background: #d1fae5; color: #065f46; border-color: rgba(6,95,70,0.2);' : ''}">
          ${isCompleted ? '✓ Completed' : 'Mark as Read'}
        </button>
      </div>
    </div>
  `;

  const actionBtn = document.getElementById('daily-reading-action-btn');
  if (actionBtn && !isCompleted) {
    actionBtn.addEventListener('click', async () => {
      const todayStr = new Date().toDateString();
      if (isDailyReadingCompletedToday()) return;

      state.userState.lastDailyReadingDate = new Date().toISOString();
      if (!state.userState.dailyReadingsCompleted.includes(reading.day)) {
        state.userState.dailyReadingsCompleted.push(reading.day);
      }
      awardXP(15, 'daily_reading_completed');
      logActivity('daily_reading_completed', { day: reading.day, title: reading.title, reference: reading.reference });
      recordActivity();
      await saveState();
      renderDailyReading();
      showToast('+15 XP — Daily reading completed!', 'success');
    });
  }
}

