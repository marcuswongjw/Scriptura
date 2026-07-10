// Feature module: stats (Phase 2)
import { concentrations, modules } from '../modules.js?v=2.0.17';
import { conIcons } from './constants.js?v=2.0.17';
import { formatDuration } from './utils.js?v=2.0.17';
import { el } from './dom.js?v=2.0.17';
import { state } from './state.js?v=2.0.17';
import { openOnboarding } from './catalog.js?v=2.0.17';
import { switchTab } from './routing.js?v=2.0.17';
import { isModuleReleased } from './user.js?v=2.0.17';

export function updateStatsDisplay() {
  const completedList = (state.userState.completedModules || []).filter(id => modules.some(m => m.id === id));

  const releasedCons = concentrations.filter(c => c.modules.some(mid => isModuleReleased(mid)));
  const completedCons = releasedCons.filter(c => c.modules.every(mid => completedList.includes(mid)));
  el.statsCompletedVal.textContent = `${completedCons.length} / ${releasedCons.length}`;

  el.statsStreakVal.textContent = state.userState.streak || 0;
  const accuracy = state.userState.quizStats && state.userState.quizStats.totalQuestions > 0
    ? Math.round((state.userState.quizStats.correctFirstTry / state.userState.quizStats.totalQuestions) * 100)
    : 100;
  if (el.statsAccuracyVal) {
    el.statsAccuracyVal.textContent = `${accuracy}%`;
  }

  // Render additional stat cards (XP, longest streak, time spent).
  const statsGrid = document.querySelector('.stats-grid');
  if (statsGrid) {
    const extraCards = [
      { icon: '✨', value: state.userState.xp || 0, label: 'Total XP' },
      { icon: '🔥', value: state.userState.longestStreak || 0, label: 'Longest Streak' },
      { icon: '⏱️', value: formatDuration(state.userState.timeSpent || 0), label: 'Time Studied' }
    ];
    extraCards.forEach(card => {
      const existing = statsGrid.querySelector(`.stat-card[data-stat="${card.label}"]`);
      if (existing) {
        existing.querySelector('.stat-number').textContent = card.value;
      } else {
        const cardHtml = `
          <div class="stat-card" data-stat="${card.label}">
            <div class="stat-icon">${card.icon}</div>
            <div class="stat-number">${card.value}</div>
            <div class="stat-label">${card.label}</div>
          </div>
        `;
        statsGrid.insertAdjacentHTML('beforeend', cardHtml);
      }
    });
  }

  const listEl = document.getElementById('stats-modules-list');
  if (listEl) {
    listEl.innerHTML = '';
    
    // Group concentrations by topic
    const groups = {};
    concentrations.forEach(con => {
      const conLessons = modules.filter(m => con.modules.includes(m.id));
      const hasReleased = conLessons.some(m => isModuleReleased(m.id));
      if (!hasReleased) return;
      
      const tName = con.group || 'Books of the Bible';
      if (!groups[tName]) groups[tName] = [];
      groups[tName].push(con);
    });

    const topicOrder = [
      "Books of the Bible",
      "Bibliology",
      "Theology",
      "Anthropology",
      "Christology",
      "Pneumatology",
      "Ecclesiology",
      "Eschatology"
    ];

    const sortedGroupNames = Object.keys(groups).sort((a, b) => {
      const idxA = topicOrder.indexOf(a);
      const idxB = topicOrder.indexOf(b);
      if (idxA === -1 && idxB === -1) return 0;
      if (idxA === -1) return 1;
      if (idxB === -1) return -1;
      return idxA - idxB;
    });

    sortedGroupNames.forEach(gName => {
      const headerHtml = `
        <div class="stats-topic-header" style="margin-top: 1.25rem; font-size: 0.8rem; font-weight: 800; color: var(--brand-coral); text-transform: uppercase; letter-spacing: 0.08em; padding-bottom: 0.25rem; border-bottom: 1px solid rgba(225, 29, 72, 0.1); margin-bottom: 0.75rem; text-align: left;">
          ${gName}
        </div>
      `;
      listEl.insertAdjacentHTML('beforeend', headerHtml);

      groups[gName].forEach(con => {
        const conLessons = modules.filter(m => con.modules.includes(m.id));
        const total = conLessons.length;
        const completed = conLessons.filter(m => completedList.includes(m.id)).length;
        const isComplete = completed === total;
        const icon = conIcons[con.id] || '📖';

        let badgeHtml = '';
        if (isComplete) {
          badgeHtml = '<span class="stats-module-badge completed" style="font-size: 0.75rem; font-weight: 700; color: var(--brand-green); background: rgba(16, 185, 129, 0.1); padding: 0.25rem 0.6rem; border-radius: 999px;">✓ Done</span>';
        } else {
          badgeHtml = `<span class="stats-module-badge" style="font-size: 0.75rem; font-weight: 700; color: var(--gray-500); background: var(--gray-100); padding: 0.25rem 0.6rem; border-radius: 999px;">${completed}/${total} Done</span>`;
        }

        const rowHtml = `
          <div class="stats-module-row clickable-stats-row ${isComplete ? 'done' : ''}" data-con-id="${con.id}" style="cursor: pointer; display: flex; align-items: center; justify-content: space-between; padding: 0.85rem 1rem; background: #fff; border-radius: var(--r-md); border: 1px solid var(--gray-100); margin-bottom: 0.5rem; transition: all 0.2s;">
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <span class="stats-module-icon" style="font-size: 1.25rem;">${icon}</span>
              <div style="display: flex; flex-direction: column; text-align: left;">
                <span class="stats-module-title" style="font-weight: 700; color: var(--gray-800); font-size: 0.92rem; line-height: 1.2;">${con.title}</span>
                <span style="font-size: 0.75rem; color: var(--gray-400); margin-top: 0.15rem; line-height: 1.2;">${con.description}</span>
              </div>
            </div>
            <div style="flex-shrink: 0; margin-left: 0.5rem;">
              ${badgeHtml}
            </div>
          </div>
        `;
        listEl.insertAdjacentHTML('beforeend', rowHtml);
      });
    });

    listEl.querySelectorAll('.clickable-stats-row').forEach(row => {
      row.setAttribute('role', 'button');
      row.setAttribute('tabindex', '0');
      row.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); row.click(); } });
      row.addEventListener('click', () => {
        const conId = row.getAttribute('data-con-id');
        if (conId) {
          switchTab('courses');
          openOnboarding(conId);
        }
      });
    });
  }
}

