// Feature module: dashboard (Phase 2)
import { concentrations, modules } from '../modules.js?v=2.0.16';
import { el } from './dom.js?v=2.0.16';
import { state } from './state.js?v=2.0.16';
import { openOnboarding, renderCoursesCatalog, updateFilterTagsUI } from './catalog.js?v=2.0.16';
import { renderDailyReading } from './daily.js?v=2.0.16';
import { switchTab } from './routing.js?v=2.0.16';
import { isModuleReleased } from './user.js?v=2.0.16';

export function renderDashboard() {
  try {
    renderDailyReading();

    const completedList = (state.userState && Array.isArray(state.userState.completedModules))
      ? state.userState.completedModules.filter(id => modules.some(m => m.id === id))
      : [];
    
    if (!modules || modules.length === 0) {
      el.currentStudyContainer.innerHTML = `<div class="study-card-title">No modules loaded</div>`;
      return;
    }

    // Find next uncompleted module that is released
    const nextModule = modules.find(m => m && !completedList.includes(m.id) && isModuleReleased(m.id)) || modules.find(m => isModuleReleased(m.id));
    if (!nextModule) {
      el.currentStudyContainer.innerHTML = `<div class="study-card-title">All released modules completed!</div>`;
      return;
    }

    const isAllComplete = modules.every(m => m && completedList.includes(m.id));
    const completed = completedList.length;
    const total = modules.filter(m => isModuleReleased(m.id)).length;

    if (isAllComplete) {
      el.currentStudyContainer.innerHTML = `
        <div class="study-card-label">ALL COURSES COMPLETED</div>
        <div class="study-card-title">🎓 Scriptura Scholar!</div>
        <div class="study-card-desc">Congratulations — you have completed all foundational modules. Review any lesson below.</div>
        <button class="primary-btn" id="btn-dashboard-review" style="margin-top:0.5rem;">REVIEW COURSES</button>
      `;
      document.getElementById('btn-dashboard-review')?.addEventListener('click', () => switchTab('courses'));
    } else {
      el.currentStudyContainer.innerHTML = `
        <div class="study-card-label">CURRENTLY STUDYING • ${completed} of ${total} RELEASED COMPLETE</div>
        <div class="study-card-title">${nextModule.title}</div>
        <div class="study-card-desc">${nextModule.description || ''}</div>
        <button class="primary-btn" id="btn-dashboard-resume" data-id="${nextModule.id}" style="margin-top:0.5rem;">START COURSE</button>
      `;
      document.getElementById('btn-dashboard-resume')?.addEventListener('click', () => {
        openOnboarding(nextModule.id);
      });
    }
  } catch (err) {
    console.error('Error rendering dashboard:', err);
  }
}

// ==========================================================================
// Curriculum Grid (SVG rings)
// ==========================================================================

export function renderCurriculumGrid() {
  try {
    el.concentrationGrid.innerHTML = '';
    const radius = 28;
    const circ = 2 * Math.PI * radius;
    const completedList = (state.userState && Array.isArray(state.userState.completedModules))
      ? state.userState.completedModules.filter(id => modules.some(m => m.id === id))
      : [];

    const groups = {};
    concentrations.forEach(con => {
      const gName = con.group || 'General';
      if (!groups[gName]) groups[gName] = [];
      groups[gName].push(con);
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
      let groupHasReleased = false;
      groups[gName].forEach(con => {
        const released = con.modules.filter(mid => isModuleReleased(mid));
        if (released.length > 0) groupHasReleased = true;
      });

      if (!groupHasReleased) return;

      const groupTitleHtml = `<h3 class="curriculum-group-title" style="grid-column: 1/-1; margin-top: 1rem; font-family: var(--font-display); font-weight: 800; font-size: 1.1rem; color: var(--gray-800); border-bottom: 1px solid var(--gray-100); padding-bottom: 0.5rem; text-align: left;">${gName.toUpperCase()}</h3>`;
      el.concentrationGrid.insertAdjacentHTML('beforeend', groupTitleHtml);

      groups[gName].forEach(con => {
        const releasedInCon = con.modules.filter(mid => isModuleReleased(mid));
        if (releasedInCon.length === 0) return;

        const total = releasedInCon.length;
        const completed = releasedInCon.filter(mid => completedList.includes(mid)).length;
        const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
        const offset = circ - (pct / 100) * circ;
        const isComplete = pct === 100;
        const firstLetter = con.title.charAt(0).toUpperCase();

        const html = `
          <div class="concentration-badge ${isComplete ? 'complete' : ''}" data-con-id="${con.id}">
            <div class="badge-ring-wrap">
              <svg width="72" height="72" viewBox="0 0 72 72">
                <circle class="ring-bg" cx="36" cy="36" r="${radius}" stroke-width="5" fill="none"/>
                <circle class="ring-fill" cx="36" cy="36" r="${radius}" stroke-width="5" fill="none"
                  stroke-dasharray="${circ.toFixed(2)}" stroke-dashoffset="${offset.toFixed(2)}"/>
              </svg>
              <div class="badge-center">${isComplete ? '✓' : firstLetter}</div>
            </div>
            <div class="badge-name">${con.title}</div>
            <div class="badge-count">${completed} of ${total}</div>
          </div>
        `;
        el.concentrationGrid.insertAdjacentHTML('beforeend', html);
      });
    });

    document.querySelectorAll('.concentration-badge').forEach(badge => {
      badge.setAttribute('role', 'button');
      badge.setAttribute('tabindex', '0');
      badge.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); badge.click(); } });
      badge.addEventListener('click', () => {
        const conId = badge.getAttribute('data-con-id');
        const con = concentrations.find(c => c.id === conId);
        if (con) {
          state.catalogFilters.topic = con.group;
          // Visual tag button update inside modal
          updateFilterTagsUI();
        }
        renderCoursesCatalog();
        switchTab('courses');
      });
    });
  } catch (err) {
    console.error('Error rendering curriculum grid:', err);
  }
}

