// Feature module: admin (Phase 2)
import { auth, db } from './firebase.js?v=2.0.24';
import { doc, getDoc, setDoc, collection, getDocs, addDoc, query, orderBy, limit, where, updateDoc, deleteDoc } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { concentrations, modules } from '../modules.js?v=2.0.24';
import { sanitizeHTML, getDayOfYear } from './utils.js?v=2.0.24';
import { showToast, showStatusEl } from './toast.js?v=2.0.24';
import { state } from './state.js?v=2.0.24';
import { renderCoursesCatalog } from './catalog.js?v=2.0.24';
import { renderDashboard } from './dashboard.js?v=2.0.24';
import { fetchRegisteredUsers } from './network.js?v=2.0.24';
import { switchTab } from './routing.js?v=2.0.24';
import { checkAdminNavVisibility, fetchAndMergeCustomModules, loadModuleSchedules, saveState } from './user.js?v=2.0.24';
import { dailyReadings } from '../daily_readings.js?v=2.0.24';
import {
  getBaseReadingForDay,
  resolveReadingForDay,
  resolveTodaysReading,
  saveReadingContent,
  resetReadingContentToDefault,
  clearReadingOverrideCache,
  renderDailyReading
} from './daily.js?v=2.0.24';

export function handleTemplateToggle(e) {
  const templateBox = document.getElementById('publisher-template-box');
  if (!templateBox) return;
  templateBox.classList.toggle('hidden');
  e.target.textContent = templateBox.classList.contains('hidden') ? 'Show Schema Template' : 'Hide Schema Template';
}

export function handlePublisherFileInput(e) {
  const file = e.target.files[0];
  if (!file) return;
  const form = e.target.closest('#admin-publisher-form');
  const jsonTextArea = form?.querySelector('#publisher-json-textarea');
  const statusEl = form?.querySelector('#publisher-status');
  const reader = new FileReader();
  reader.onload = (evt) => {
    if (jsonTextArea) jsonTextArea.value = evt.target.result;
    showStatusEl(statusEl, 'File loaded successfully!', 'success');
  };
  reader.onerror = () => {
    showStatusEl(statusEl, 'Failed to read file.', 'error');
  };
  reader.readAsText(file);
}

export function handlePublisherSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const jsonTextArea = form.querySelector('#publisher-json-textarea');
  const parentConSelect = form.querySelector('#publisher-parent-con');
  const statusEl = form.querySelector('#publisher-status');
  const fileInput = form.querySelector('#publisher-file-input');

  const rawJson = jsonTextArea.value.trim();
  const parentCon = parentConSelect.value;

  if (!rawJson) {
    showStatusEl(statusEl, 'Please enter or upload a valid JSON module schema.', 'error');
    return;
  }

  let parsedModule;
  try {
    parsedModule = JSON.parse(rawJson);
  } catch (err) {
    showStatusEl(statusEl, `JSON Syntax Error: ${err.message}`, 'error');
    return;
  }

  const requiredFields = ['id', 'title', 'category', 'duration', 'slides'];
  for (const field of requiredFields) {
    if (parsedModule[field] === undefined) {
      showStatusEl(statusEl, `Validation Error: Missing required field "${field}".`, 'error');
      return;
    }
  }

  if (!Array.isArray(parsedModule.slides) || parsedModule.slides.length === 0) {
    showStatusEl(statusEl, 'Validation Error: "slides" must be a non-empty array.', 'error');
    return;
  }

  parsedModule.parentConcentrationId = parentCon;
  showStatusEl(statusEl, 'Validating and publishing to Firestore...', 'success');

  (async () => {
    try {
      const docRef = doc(db, 'custom_modules', parsedModule.id);
      await setDoc(docRef, parsedModule);
      showStatusEl(statusEl, `Module "${parsedModule.title}" published successfully! Reloading...`, 'success');
      jsonTextArea.value = '';
      if (fileInput) fileInput.value = '';
      await fetchAndMergeCustomModules();
      await renderAdminDashboard();
      renderCoursesCatalog();
      renderDashboard();
    } catch (err) {
      console.error('Firestore save error:', err);
      showStatusEl(statusEl, `Database Error: ${err.message}`, 'error');
    }
  })();
}

export async function computeAdminStats() {
  // Compute aggregate stats from the fetched registered users and write them
  // to a central `stats/aggregated` document so future dashboard loads are fast.
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const totalUsers = state.registeredUsers.length;
  let totalCompleted = 0;
  let totalStarted = 0;
  let dailyActiveCount = 0;
  let weeklyActiveCount = 0;
  let monthlyActiveCount = 0;
  let funnelStarted = 0;
  let funnelCompleted = 0;

  const moduleEngagement = {};
  modules.forEach(m => {
    moduleEngagement[m.id] = {
      moduleId: m.id,
      title: m.title,
      startedCount: 0,
      completedCount: 0
    };
  });

  state.registeredUsers.forEach(u => {
    const userCompleted = u.completedModules
      ? u.completedModules.filter(mId => modules.some(m => m.id === mId))
      : [];
    const completedCount = userCompleted.length;
    const progressKeys = Object.keys(u.lessonProgress || {}).filter(mId => modules.some(m => m.id === mId));
    const progressCount = progressKeys.length;
    const startedCount = Math.max(completedCount, progressCount);

    totalCompleted += completedCount;
    totalStarted += startedCount;

    if (u.lastActiveDate) {
      const lastActive = new Date(u.lastActiveDate);
      if (lastActive >= oneDayAgo) dailyActiveCount++;
      if (lastActive >= oneWeekAgo) weeklyActiveCount++;
      if (lastActive >= oneMonthAgo) monthlyActiveCount++;
    }

    if (progressCount > 0) funnelStarted++;
    if (completedCount > 0) funnelCompleted++;

    // Per-module engagement.
    modules.forEach(m => {
      const isCompleted = userCompleted.includes(m.id);
      const hasProgress = progressKeys.includes(m.id);
      if (isCompleted || hasProgress) {
        moduleEngagement[m.id].startedCount++;
      }
      if (isCompleted) {
        moduleEngagement[m.id].completedCount++;
      }
    });
  });

  const completionRate = totalStarted > 0 ? Math.round((totalCompleted / totalStarted) * 100) : 100;
  const dauWauRatio = weeklyActiveCount > 0 ? Math.round((dailyActiveCount / weeklyActiveCount) * 100) : 0;
  const avgCompleted = totalUsers > 0 ? parseFloat((totalCompleted / totalUsers).toFixed(1)) : 0;

  const engagementList = Object.values(moduleEngagement).map(m => ({
    ...m,
    completionRate: m.startedCount > 0 ? Math.round((m.completedCount / m.startedCount) * 100) : 0
  })).sort((a, b) => a.completionRate - b.completionRate);

  const statsDoc = {
    computedAt: now.toISOString(),
    totalUsers,
    dailyActiveCount,
    weeklyActiveCount,
    monthlyActiveCount,
    totalCompleted,
    totalStarted,
    completionRate,
    dauWauRatio,
    avgCompleted,
    funnelStarted,
    funnelCompleted,
    moduleEngagement: engagementList
  };

  try {
    const statsRef = doc(db, 'stats', 'aggregated');
    await setDoc(statsRef, statsDoc);
  } catch (err) {
    console.error('Failed to write aggregated stats:', err);
  }

  return statsDoc;
}

export async function loadAdminStats() {
  // Try to read cached aggregated stats. If missing or stale (>24h), recompute.
  const STALE_MS = 24 * 60 * 60 * 1000;
  try {
    const statsRef = doc(db, 'stats', 'aggregated');
    const statsSnap = await getDoc(statsRef);
    if (statsSnap.exists()) {
      const data = statsSnap.data();
      const computedAt = data.computedAt ? new Date(data.computedAt) : null;
      const isStale = !computedAt || (Date.now() - computedAt.getTime() > STALE_MS);
      if (!isStale) return data;
    }
  } catch (err) {
    console.warn('Failed to load aggregated stats, recomputing:', err);
  }
  return await computeAdminStats();
}

export function wireAdminTabs() {
  const nav = document.querySelector('.admin-tabs');
  if (!nav || nav.dataset.wired) return;
  nav.dataset.wired = '1';
  nav.addEventListener('click', (e) => {
    const btn = e.target.closest('.admin-tab');
    if (!btn) return;
    const tab = btn.getAttribute('data-admin-tab');
    document.querySelectorAll('.admin-tab').forEach(b => {
      b.classList.toggle('active', b === btn);
    });
    document.querySelectorAll('.admin-tab-panel').forEach(p => {
      const id = `admin-panel-${tab}`;
      const show = p.id === id;
      p.classList.toggle('active', show);
      p.classList.toggle('hidden', !show);
    });
    if (tab === 'moderation') loadModerationPanel();
    if (tab === 'daily') loadDailyReadingEditor();
  });
  wireDailyReadingEditor();
}

export async function renderAdminDashboard() {
  if (state.userState.role !== 'admin') {
    switchTab('home');
    return;
  }

  wireAdminTabs();
  const badge = document.getElementById('admin-you-badge');
  if (badge) {
    badge.textContent = state.userState.email || auth.currentUser?.email || 'Admin';
  }

  await fetchRegisteredUsers();
  await loadModuleSchedules();
  loadModerationPanel();
  // Prefill daily editor in background so tab opens quickly
  loadDailyReadingEditor().catch(() => {});

  // Use aggregated stats for fast dashboard rendering.
  const stats = await loadAdminStats();
  const totalUsers = stats.totalUsers || 0;
  const totalCompleted = stats.totalCompleted || 0;
  const totalStarted = stats.totalStarted || 1;
  const weeklyActiveCount = stats.weeklyActiveCount || 0;
  const dailyActiveCount = stats.dailyActiveCount || 0;
  const monthlyActiveCount = stats.monthlyActiveCount || 0;
  const funnelStarted = stats.funnelStarted || 0;
  const funnelCompleted = stats.funnelCompleted || 0;

  const completionRate = stats.completionRate ?? Math.round((totalCompleted / totalStarted) * 100);
  const dauWauRatio = stats.dauWauRatio ?? (weeklyActiveCount > 0 ? Math.round((dailyActiveCount / weeklyActiveCount) * 100) : 0);
  const avgCompleted = stats.avgCompleted ?? (totalUsers > 0 ? parseFloat((totalCompleted / totalUsers).toFixed(1)) : 0);

  document.getElementById('admin-total-users').textContent = totalUsers;
  
  const completionRateEl = document.getElementById('admin-completion-rate');
  if (completionRateEl) {
    completionRateEl.textContent = `${completionRate}%`;
  }
  
  const weeklyActiveEl = document.getElementById('admin-weekly-active');
  if (weeklyActiveEl) {
    weeklyActiveEl.textContent = weeklyActiveCount;
  }

  // Populate Cohorts UI
  const dauWauRatioEl = document.getElementById('admin-dau-wau-ratio');
  if (dauWauRatioEl) dauWauRatioEl.textContent = `${dauWauRatio}%`;

  const mauCountEl = document.getElementById('admin-mau-count');
  if (mauCountEl) mauCountEl.textContent = monthlyActiveCount;

  const avgModulesActiveEl = document.getElementById('admin-avg-modules-active');
  if (avgModulesActiveEl) avgModulesActiveEl.textContent = avgCompleted;

  // Build Dropout Funnel bars
  const funnelContainer = document.getElementById('admin-dropout-funnel-container');
  if (funnelContainer) {
    const totalFunnel = Math.max(funnelStarted, totalUsers);
    const startPct = totalFunnel > 0 ? Math.round((funnelStarted / totalFunnel) * 100) : 0;
    const completePct = totalFunnel > 0 ? Math.round((funnelCompleted / totalFunnel) * 100) : 0;

    funnelContainer.innerHTML = `
      <div>
        <div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-bottom:0.25rem;">
          <span style="font-weight:600; color:var(--gray-700);">Started a Module (${funnelStarted})</span>
          <span style="font-weight:700; color:var(--gray-500);">${startPct}%</span>
        </div>
        <div style="height:12px; background:var(--gray-200); border-radius:6px; overflow:hidden;">
          <div style="height:100%; width:${startPct}%; background:var(--brand-coral); transition:width 0.5s;"></div>
        </div>
      </div>
      <div>
        <div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-bottom:0.25rem; margin-top:0.5rem;">
          <span style="font-weight:600; color:var(--gray-700);">Completed a Module (${funnelCompleted})</span>
          <span style="font-weight:700; color:var(--gray-500);">${completePct}%</span>
        </div>
        <div style="height:12px; background:var(--gray-200); border-radius:6px; overflow:hidden;">
          <div style="height:100%; width:${completePct}%; background:var(--brand-green); transition:width 0.5s;"></div>
        </div>
      </div>
    `;
  }

  // Render Module Engagement table
  const engagement = stats.moduleEngagement || [];
  let engagementPanel = document.getElementById('admin-module-engagement-panel');
  if (!engagementPanel) {
    engagementPanel = document.createElement('div');
    engagementPanel.id = 'admin-module-engagement-panel';
    engagementPanel.className = 'admin-panel-card';
    const host = document.getElementById('admin-module-engagement-host')
      || document.querySelector('.admin-shell')
      || document.querySelector('.admin-grid-layout');
    host?.appendChild(engagementPanel);
  }
  const engagementRows = engagement.map(m => `
    <tr>
      <td>
        <div style="font-weight:600; color:var(--gray-900);">${sanitizeHTML(m.title)}</div>
        <div style="font-size:0.75rem; color:var(--gray-400);">${m.moduleId}</div>
      </td>
      <td>${m.startedCount}</td>
      <td>${m.completedCount}</td>
      <td>
        <div style="display:flex; align-items:center; gap:0.5rem;">
          <div style="flex:1; height:8px; background:var(--gray-200); border-radius:4px; overflow:hidden;">
            <div style="height:100%; width:${m.completionRate}%; background:${m.completionRate >= 70 ? 'var(--brand-green)' : (m.completionRate >= 40 ? 'var(--brand-coral)' : '#ef4444')}; transition:width 0.3s;"></div>
          </div>
          <span style="font-size:0.8rem; font-weight:700; color:var(--gray-700); min-width:2.5rem; text-align:right;">${m.completionRate}%</span>
        </div>
      </td>
    </tr>
  `).join('');
  engagementPanel.innerHTML = `
    <h3 class="admin-panel-title">Module Engagement</h3>
    <p class="admin-panel-subtitle">Started vs completed counts across all learners, sorted by completion rate.</p>
    <div class="admin-table-wrapper" style="margin-top:1rem;">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Module</th>
            <th>Started</th>
            <th>Completed</th>
            <th>Completion Rate</th>
          </tr>
        </thead>
        <tbody>
          ${engagementRows || '<tr><td colspan="4" style="text-align:center; color:var(--gray-400);">No engagement data yet.</td></tr>'}
        </tbody>
      </table>
    </div>
  `;

  // Populate Users Table
  const usersListEl = document.getElementById('admin-users-list');
  if (usersListEl) {
    usersListEl.innerHTML = '';
    state.registeredUsers.forEach(u => {
      const role = u.role || 'user';
      const userCompleted = u.completedModules ? u.completedModules.filter(mId => modules.some(m => m.id === mId)) : [];
      const completedCount = userCompleted.length;
      const progressRatio = `${completedCount} / ${modules.length}`;

      const row = document.createElement('tr');
      row.innerHTML = `
        <td>
          <div style="display:flex; align-items:center; gap:0.5rem;">
            <img src="${u.photo || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.uid}`}" style="width:28px; height:28px; border-radius:50%; background:#f1f5f9;">
            <span style="font-weight:600;">${u.name || 'Anonymous Learner'}</span>
          </div>
        </td>
        <td>${u.email || 'N/A'}</td>
        <td><span class="role-badge ${role}">${role.toUpperCase()}</span></td>
        <td>
          <div style="font-weight:600; color:var(--gray-700);">${progressRatio}</div>
        </td>
        <td>
          <div style="display:flex; gap:0.5rem;">
            <button class="primary-btn compact-btn admin-role-toggle-btn" data-uid="${u.uid}" data-role="${role}">
              Make ${role === 'admin' ? 'Learner' : 'Admin'}
            </button>
            <button class="secondary-btn compact-btn admin-view-progress-btn" data-uid="${u.uid}" style="border: 1px solid var(--gray-200); background:#fff; color:var(--gray-700);">
              View
            </button>
          </div>
        </td>
      `;
      usersListEl.appendChild(row);
    });

    usersListEl.querySelectorAll('.admin-role-toggle-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (state.userState.role !== 'admin') {
          showToast('Only admins can change roles.', 'error');
          return;
        }
        const uid = btn.dataset.uid;
        const currentRole = btn.dataset.role;
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        
        try {
          // Admin-only write of another user's role (or self). Rules allow isAdmin() updates.
          const userDocRef = doc(db, 'users', uid);
          await setDoc(userDocRef, { role: newRole }, { merge: true });
          
          if (uid === auth.currentUser?.uid) {
            state.userState.role = newRole;
            // Persist non-role fields without re-escalating via full save after demotion.
            await saveState();
            checkAdminNavVisibility();
            if (newRole !== 'admin') {
              switchTab('home');
              return;
            }
          }
          await renderAdminDashboard();
          showToast(`User role updated to ${newRole}.`, 'success');
        } catch (err) {
          console.error('Failed to update user role:', err);
          showToast('Error updating user role. Please try again.', 'error');
        }
      });
    });

    usersListEl.querySelectorAll('.admin-view-progress-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const uid = btn.dataset.uid;
        const learner = state.registeredUsers.find(u => u.uid === uid);
        if (!learner) return;

        document.getElementById('progress-learner-name').textContent = learner.name || 'Anonymous Learner';
        document.getElementById('progress-learner-email').textContent = learner.email || 'N/A';
        
        const userCompleted = learner.completedModules ? learner.completedModules.filter(mId => modules.some(m => m.id === mId)) : [];
        const completedCount = userCompleted.length;
        document.getElementById('progress-learner-completed-count').textContent = completedCount;
        document.getElementById('progress-learner-streak').textContent = `${learner.streak || 0} days`;

        const listEl = document.getElementById('progress-learner-modules-list');
        listEl.innerHTML = '';

        modules.forEach(m => {
          const isLCompleted = learner.completedModules ? learner.completedModules.includes(m.id) : false;
          const progressVal = learner.lessonProgress ? (learner.lessonProgress[m.id] || 0) : 0;
          const totalSlides = m.slides ? m.slides.length : 0;

          let pct = 0;
          let progressText = 'Not started';
          if (isLCompleted) {
            pct = 100;
            progressText = 'Completed';
          } else if (progressVal > 0) {
            pct = totalSlides > 0 ? Math.round((progressVal / totalSlides) * 100) : 0;
            progressText = `${progressVal}/${totalSlides} slides (${pct}%)`;
          }

          const item = document.createElement('div');
          item.style.cssText = 'background: var(--gray-50); border: 1px solid var(--gray-150); border-radius: var(--r-md); padding: 0.75rem 1rem; display: flex; flex-direction: column; gap: 0.35rem;';
          item.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span style="font-weight:600; color:var(--gray-800); font-size:0.9rem;">${m.title}</span>
              <span style="font-size:0.75rem; font-weight:700; color:${isLCompleted ? 'var(--brand-green)' : (progressVal > 0 ? 'var(--brand-purple)' : 'var(--gray-400)')};">${progressText}</span>
            </div>
            <div style="height:6px; background:var(--gray-200); border-radius:3px; overflow:hidden;">
              <div style="height:100%; width:${pct}%; background:${isLCompleted ? 'var(--brand-green)' : 'var(--brand-purple)'}; transition:width 0.3s;"></div>
            </div>
          `;
          listEl.appendChild(item);
        });

        document.getElementById('learner-progress-dialog').classList.remove('hidden');
      });
    });
  }

  // Populate Module Schedules Table
  const modulesListEl = document.getElementById('admin-modules-list');
  if (modulesListEl) {
    modulesListEl.innerHTML = '';
    modules.forEach(m => {
      const releaseDate = state.moduleSchedules[m.id] || '';
      const isLocked = releaseDate && new Date(releaseDate) > new Date();
      const statusText = isLocked ? 'Scheduled' : 'Released';
      const statusClass = isLocked ? 'locked' : 'released';
      const concentration = concentrations.find(c => c.modules.includes(m.id))?.title || 'General';

      const row = document.createElement('tr');
      row.innerHTML = `
        <td>
          <div style="font-weight:600; color:var(--gray-900);">${m.title}</div>
          <div style="font-size:0.75rem; color:var(--gray-400);">${m.id}</div>
        </td>
        <td>${concentration}</td>
        <td>
          <input type="date" class="admin-date-input" data-mid="${m.id}" value="${releaseDate}">
        </td>
        <td><span class="status-badge ${statusClass}">${statusText}</span></td>
        <td>
          <div style="display:flex; gap:0.5rem;">
            <button class="primary-btn compact-btn admin-edit-module-btn" data-mid="${m.id}">Edit</button>
            <button class="secondary-btn compact-btn admin-delete-module-btn" data-mid="${m.id}" style="border:1px solid #fee2e2; background:#fef2f2; color:#b91c1c; padding: 0.25rem 0.5rem;">Delete</button>
          </div>
        </td>
      `;
      modulesListEl.appendChild(row);
    });

    modulesListEl.querySelectorAll('.admin-date-input').forEach(input => {
      input.addEventListener('change', async () => {
        const mid = input.dataset.mid;
        const newDate = input.value;

        try {
          const schedulesRef = doc(db, 'events', 'module_schedules');
          await setDoc(schedulesRef, { [mid]: newDate }, { merge: true });
          
          await loadModuleSchedules();
          await renderAdminDashboard();
        } catch (err) {
          console.error('Failed to save module schedule:', err);
          showToast('Error saving schedule. Please try again.', 'error');
        }
      });
    });

    // Wire up Edit & Delete Actions
    modulesListEl.querySelectorAll('.admin-edit-module-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        openVisualEditor(btn.dataset.mid);
      });
    });

    modulesListEl.querySelectorAll('.admin-delete-module-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        deleteModuleAction(btn.dataset.mid);
      });
    });
  }

}

// ==========================================================================
// Visual Course Editor Controllers
// ==========================================================================
export function openVisualEditor(moduleId) {
  const mod = modules.find(m => m.id === moduleId);
  if (!mod) {
    showToast('Module not found.', 'error');
    return;
  }

  // Populate basic inputs
  document.getElementById('editor-module-id').value = mod.id;
  document.getElementById('editor-title').value = mod.title || '';
  document.getElementById('editor-category').value = mod.category || '';
  document.getElementById('editor-duration').value = mod.duration || '';
  document.getElementById('editor-description').value = mod.description || '';
  document.getElementById('editor-parent-con').value = mod.parentConcentrationId || '';

  // Copy slides state
  state.editorSlides = JSON.parse(JSON.stringify(mod.slides || []));
  renderEditorSlides();

  // Load backups list from Firestore
  loadModuleRevisionHistory(mod.id);

  // Show dialog
  document.getElementById('visual-editor-dialog').classList.remove('hidden');
}

function escapeEditorAttr(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;');
}

export function renderEditorSlides() {
  const container = document.getElementById('editor-slides-container');
  if (!container) return;
  container.innerHTML = '';

  const countEl = document.getElementById('editor-slide-count');
  if (countEl) {
    const n = state.editorSlides.length;
    countEl.textContent = `${n} slide${n === 1 ? '' : 's'}`;
  }

  if (state.editorSlides.length === 0) {
    container.innerHTML = `<div class="ved-empty">No slides yet. Click <strong>+ Add slide</strong> to begin.</div>`;
    return;
  }

  state.editorSlides.forEach((slide, idx) => {
    const slideCard = document.createElement('div');
    slideCard.className = 'ved-slide-card';

    let typeFieldsHtml = '';
    if (slide.type === 'info') {
      typeFieldsHtml = `
        <div class="ved-grid-2">
          <div class="form-field">
            <label>Illustration (emoji)</label>
            <input type="text" class="slide-illustration" value="${escapeEditorAttr(slide.illustration || '📖')}">
          </div>
          <div class="form-field">
            <label>Key takeaway</label>
            <input type="text" class="slide-takeaway" value="${escapeEditorAttr(slide.keyTakeaway || '')}">
          </div>
        </div>
        <div class="form-field">
          <label>Content (markdown **bold**, blank lines = paragraphs)</label>
          <textarea class="slide-content" rows="4">${escapeEditorAttr(slide.content || '')}</textarea>
        </div>
      `;
    } else if (slide.type === 'card-quiz') {
      typeFieldsHtml = `
        <div class="form-field">
          <label>Quiz question</label>
          <input type="text" class="slide-question" value="${escapeEditorAttr(slide.question || '')}">
        </div>
        <div class="ved-grid-2">
          <div class="form-field">
            <label>Correct answer</label>
            <select class="slide-correct-answer">
              <option value="yes" ${slide.correctAnswer === 'yes' ? 'selected' : ''}>Yes</option>
              <option value="no" ${slide.correctAnswer === 'no' ? 'selected' : ''}>No</option>
            </select>
          </div>
          <div class="form-field">
            <label>Explanation</label>
            <input type="text" class="slide-explanation" value="${escapeEditorAttr(slide.explanation || '')}">
          </div>
        </div>
      `;
    } else if (slide.type === 'summary') {
      typeFieldsHtml = `
        <div class="form-field">
          <label>Illustration (emoji)</label>
          <input type="text" class="slide-illustration" value="${escapeEditorAttr(slide.illustration || '🏆')}">
        </div>
        <div class="form-field">
          <label>Summary content</label>
          <textarea class="slide-content" rows="3">${escapeEditorAttr(slide.content || '')}</textarea>
        </div>
      `;
    } else if (slide.type === 'quiz') {
      typeFieldsHtml = `
        <div class="form-field">
          <label>Question</label>
          <input type="text" class="slide-question" value="${escapeEditorAttr(slide.question || '')}">
        </div>
        <div class="form-field">
          <label>Options (one per line)</label>
          <textarea class="slide-options" rows="4">${escapeEditorAttr((slide.options || []).join('\n'))}</textarea>
        </div>
        <div class="ved-grid-2">
          <div class="form-field">
            <label>Correct option index (0-based)</label>
            <input type="number" min="0" class="slide-correct-index" value="${slide.correctAnswer ?? 0}">
          </div>
          <div class="form-field">
            <label>Explanation</label>
            <input type="text" class="slide-explanation" value="${escapeEditorAttr(slide.explanation || '')}">
          </div>
        </div>
      `;
    }

    slideCard.innerHTML = `
      <div class="ved-slide-toolbar">
        <span class="ved-slide-num">Slide ${idx + 1}</span>
        <div class="ved-slide-tools">
          <button type="button" class="ved-icon-btn slide-up-btn" title="Move up" ${idx === 0 ? 'disabled' : ''}>↑</button>
          <button type="button" class="ved-icon-btn slide-down-btn" title="Move down" ${idx === state.editorSlides.length - 1 ? 'disabled' : ''}>↓</button>
          <select class="slide-type-select" aria-label="Slide type">
            <option value="info" ${slide.type === 'info' ? 'selected' : ''}>Info</option>
            <option value="quiz" ${slide.type === 'quiz' ? 'selected' : ''}>Multiple choice</option>
            <option value="card-quiz" ${slide.type === 'card-quiz' ? 'selected' : ''}>Yes / No</option>
            <option value="summary" ${slide.type === 'summary' ? 'selected' : ''}>Summary</option>
          </select>
          <button type="button" class="ved-icon-btn ved-danger slide-remove-btn" title="Remove">Remove</button>
        </div>
      </div>
      <div class="form-field">
        <label>Slide title</label>
        <input type="text" class="slide-title" value="${escapeEditorAttr(slide.title || '')}">
      </div>
      ${typeFieldsHtml}
      <div class="form-field">
        <label>AI tutor note</label>
        <textarea class="slide-aiTutor" rows="2">${escapeEditorAttr(slide.aiTutorExplanation || '')}</textarea>
      </div>
    `;

    slideCard.querySelector('.slide-type-select').addEventListener('change', (e) => {
      state.editorSlides[idx].type = e.target.value;
      if (e.target.value === 'quiz' && !state.editorSlides[idx].options) {
        state.editorSlides[idx].options = ['Option A', 'Option B', 'Option C', 'Option D'];
        state.editorSlides[idx].correctAnswer = 0;
      }
      renderEditorSlides();
    });
    slideCard.querySelector('.slide-remove-btn').addEventListener('click', () => {
      if (!confirm(`Remove slide ${idx + 1}?`)) return;
      state.editorSlides.splice(idx, 1);
      renderEditorSlides();
    });
    slideCard.querySelector('.slide-up-btn')?.addEventListener('click', () => {
      if (idx <= 0) return;
      const tmp = state.editorSlides[idx - 1];
      state.editorSlides[idx - 1] = state.editorSlides[idx];
      state.editorSlides[idx] = tmp;
      renderEditorSlides();
    });
    slideCard.querySelector('.slide-down-btn')?.addEventListener('click', () => {
      if (idx >= state.editorSlides.length - 1) return;
      const tmp = state.editorSlides[idx + 1];
      state.editorSlides[idx + 1] = state.editorSlides[idx];
      state.editorSlides[idx] = tmp;
      renderEditorSlides();
    });

    slideCard.querySelectorAll('input, textarea, select').forEach(input => {
      input.addEventListener('input', () => {
        if (input.classList.contains('slide-title')) state.editorSlides[idx].title = input.value;
        if (input.classList.contains('slide-illustration')) state.editorSlides[idx].illustration = input.value;
        if (input.classList.contains('slide-takeaway')) state.editorSlides[idx].keyTakeaway = input.value;
        if (input.classList.contains('slide-content')) state.editorSlides[idx].content = input.value;
        if (input.classList.contains('slide-question')) state.editorSlides[idx].question = input.value;
        if (input.classList.contains('slide-correct-answer')) state.editorSlides[idx].correctAnswer = input.value;
        if (input.classList.contains('slide-explanation')) state.editorSlides[idx].explanation = input.value;
        if (input.classList.contains('slide-aiTutor')) state.editorSlides[idx].aiTutorExplanation = input.value;
        if (input.classList.contains('slide-options')) {
          state.editorSlides[idx].options = input.value.split('\n').map(s => s.trim()).filter(Boolean);
        }
        if (input.classList.contains('slide-correct-index')) {
          state.editorSlides[idx].correctAnswer = parseInt(input.value, 10) || 0;
        }
      });
    });

    container.appendChild(slideCard);
  });
}

export async function loadModuleRevisionHistory(moduleId) {
  const backupsList = document.getElementById('editor-backups-list');
  if (!backupsList) return;
  backupsList.innerHTML = '<div style="font-size: 0.8rem; color: var(--gray-400); text-align: center; padding: 0.5rem;">Loading revisions...</div>';

  try {
    const q = query(collection(db, 'custom_modules_backups'), orderBy('timestamp', 'desc'), limit(15));
    const querySnapshot = await getDocs(q);
    const listItems = [];

    querySnapshot.forEach(docSnap => {
      const data = docSnap.data();
      if (data.moduleId === moduleId) {
        listItems.push({
          id: docSnap.id,
          ...data
        });
      }
    });

    if (listItems.length === 0) {
      backupsList.innerHTML = '<div style="font-size: 0.8rem; color: var(--gray-400); text-align: center; padding: 0.5rem;">No revisions saved yet.</div>';
      return;
    }

    backupsList.innerHTML = '';
    listItems.forEach(backup => {
      const dateStr = new Date(backup.timestamp).toLocaleString();
      const backupDiv = document.createElement('div');
      backupDiv.style.display = 'flex';
      backupDiv.style.justify = 'space-between';
      backupDiv.style.alignItems = 'center';
      backupDiv.style.padding = '0.4rem 0.75rem';
      backupDiv.style.background = '#fff';
      backupDiv.style.borderRadius = 'var(--r-md)';
      backupDiv.style.border = '1px solid var(--gray-200)';
      backupDiv.style.fontSize = '0.8rem';

      backupDiv.innerHTML = `
        <div>
          <span style="font-weight: 600; color: var(--gray-800);">${dateStr}</span>
          <span style="color: var(--gray-400); font-size: 0.75rem;">(${backup.editorEmail || 'system'})</span>
        </div>
        <button type="button" class="primary-btn compact-btn editor-restore-btn" style="font-size: 0.75rem; padding: 0.2rem 0.5rem;">Restore</button>
      `;

      backupDiv.querySelector('.editor-restore-btn').addEventListener('click', async () => {
        if (confirm(`Are you sure you want to restore the module to this version?`)) {
          // Re-populate state
          state.editorSlides = JSON.parse(JSON.stringify(backup.moduleData.slides || []));
          document.getElementById('editor-title').value = backup.moduleData.title || '';
          document.getElementById('editor-category').value = backup.moduleData.category || '';
          document.getElementById('editor-duration').value = backup.moduleData.duration || '';
          document.getElementById('editor-description').value = backup.moduleData.description || '';
          document.getElementById('editor-parent-con').value = backup.moduleData.parentConcentrationId || '';
          renderEditorSlides();
        }
      });

      backupsList.appendChild(backupDiv);
    });
  } catch (err) {
    console.error('Error fetching revisions:', err);
    backupsList.innerHTML = '<div style="font-size: 0.8rem; color: #b91c1c; text-align: center; padding: 0.5rem;">Error loading revision backups.</div>';
  }
}

export async function deleteModuleAction(moduleId) {
  if (!confirm(`Are you sure you want to delete the module "${moduleId}"? This will remove it from catalog and dashboards.`)) {
    return;
  }

  try {
    const docRef = doc(db, 'custom_modules', moduleId);
    await setDoc(docRef, { deleted: true }, { merge: true });

    showToast(`Module "${moduleId}" has been soft-deleted successfully.`, 'success');
    
    // Reload databases
    await fetchAndMergeCustomModules();
    await renderAdminDashboard();
    renderCoursesCatalog();
    renderDashboard();
  } catch (err) {
    console.error('Failed to delete module:', err);
    showToast(`Error deleting module: ${err.message}`, 'error');
  }
}

export function wireVisualEditor() {
  const closeBtn = document.getElementById('close-visual-editor-btn');
  const cancelBtn = document.getElementById('editor-cancel-btn');
  const dialog = document.getElementById('visual-editor-dialog');
  const form = document.getElementById('visual-editor-form');
  const addSlideBtn = document.getElementById('editor-add-slide-btn');

  if (closeBtn) closeBtn.addEventListener('click', () => dialog.classList.add('hidden'));
  if (cancelBtn) cancelBtn.addEventListener('click', () => dialog.classList.add('hidden'));

  if (addSlideBtn) {
    addSlideBtn.addEventListener('click', () => {
      state.editorSlides.push({
        type: 'info',
        title: 'New Slide',
        illustration: '📖',
        content: '',
        aiTutorExplanation: ''
      });
      renderEditorSlides();
    });
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const moduleId = document.getElementById('editor-module-id').value;
      const title = document.getElementById('editor-title').value;
      const category = document.getElementById('editor-category').value;
      const duration = document.getElementById('editor-duration').value;
      const description = document.getElementById('editor-description').value;
      const parentCon = document.getElementById('editor-parent-con').value;

      if (state.editorSlides.length === 0) {
        showToast('Module must contain at least 1 slide.', 'warning');
        return;
      }

      const updatedModule = {
        id: moduleId,
        title,
        category,
        duration,
        description,
        parentConcentrationId: parentCon,
        slides: state.editorSlides
      };

      try {
        const docRef = doc(db, 'custom_modules', moduleId);
        await setDoc(docRef, updatedModule);

        const backupRef = collection(db, 'custom_modules_backups');
        await addDoc(backupRef, {
          moduleId,
          timestamp: new Date().toISOString(),
          editorEmail: auth.currentUser?.email || 'admin',
          moduleData: updatedModule
        });

        showToast(`Module "${title}" updated and revision backup created!`, 'success');
        dialog.classList.add('hidden');

        await fetchAndMergeCustomModules();
        await renderAdminDashboard();
        renderCoursesCatalog();
        renderDashboard();
      } catch (err) {
        console.error('Error saving edits:', err);
        showToast(`Failed to save module modifications: ${err.message}`, 'error');
      }
    });
  }
}



function getLocalDateKeyOffset(daysAgo = 0) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

async function loadReportedReflections() {
  const results = [];
  // Scan last 30 local days for reported entries (no collection group index required).
  const jobs = [];
  for (let i = 0; i < 30; i++) {
    const dateKey = getLocalDateKeyOffset(i);
    jobs.push((async () => {
      try {
        const col = collection(db, 'daily_reflections', dateKey, 'entries');
        const snap = await getDocs(query(col, where('reported', '==', true), limit(30)));
        snap.forEach(docSnap => {
          results.push({ id: docSnap.id, dateKey, ...docSnap.data() });
        });
      } catch (err) {
        // day folder may not exist
      }
    })());
  }
  await Promise.all(jobs);
  results.sort((a, b) => (a.reportedAt < b.reportedAt ? 1 : -1));
  return results;
}

export async function loadModerationPanel() {
  const listEl = document.getElementById('admin-moderation-list');
  if (!listEl) return;
  listEl.innerHTML = `<p class="admin-muted">Scanning reported reflections…</p>`;

  const refreshBtn = document.getElementById('admin-refresh-moderation');
  if (refreshBtn && !refreshBtn.dataset.wired) {
    refreshBtn.dataset.wired = '1';
    refreshBtn.addEventListener('click', () => loadModerationPanel());
  }

  try {
    const items = await loadReportedReflections();
    if (!items.length) {
      listEl.innerHTML = `<div class="empty-state soft"><p class="empty-state-title">All clear</p><p class="empty-state-text">No reported reflections in the last 30 days.</p></div>`;
      return;
    }

    listEl.innerHTML = items.map(item => {
      const text = (item.text || '').slice(0, 280);
      const when = item.reportedAt ? new Date(item.reportedAt).toLocaleString() : item.dateKey;
      return `
        <article class="moderation-card" data-date="${item.dateKey}" data-uid="${item.id}">
          <div class="moderation-card-top">
            <div>
              <strong>${sanitizeHTML(item.authorName || 'Learner')}</strong>
              <span class="admin-muted"> · ${sanitizeHTML(item.dateKey)} · ${sanitizeHTML(item.readingTitle || '')}</span>
            </div>
            <span class="moderation-flag">Reported</span>
          </div>
          <p class="moderation-text">${sanitizeHTML(text)}</p>
          <div class="moderation-meta">Reported ${sanitizeHTML(when)}${item.reportedBy ? ` · by ${sanitizeHTML(item.reportedBy.slice(0, 8))}…` : ''}</div>
          <div class="moderation-actions">
            <button type="button" class="secondary-btn compact-btn mod-clear-btn" data-date="${item.dateKey}" data-uid="${item.id}">Keep & clear flag</button>
            <button type="button" class="primary-btn compact-btn mod-delete-btn" data-date="${item.dateKey}" data-uid="${item.id}" style="background:#b91c1c;">Delete reflection</button>
          </div>
        </article>
      `;
    }).join('');

    listEl.querySelectorAll('.mod-clear-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        try {
          await updateDoc(doc(db, 'daily_reflections', btn.dataset.date, 'entries', btn.dataset.uid), {
            reported: false,
            reportedBy: null,
            reportedAt: null
          });
          showToast('Report cleared — reflection visible again.', 'success');
          loadModerationPanel();
        } catch (err) {
          console.error(err);
          showToast('Could not clear report.', 'error');
        }
      });
    });

    listEl.querySelectorAll('.mod-delete-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('Permanently delete this reflection?')) return;
        try {
          await deleteDoc(doc(db, 'daily_reflections', btn.dataset.date, 'entries', btn.dataset.uid));
          showToast('Reflection deleted.', 'success');
          loadModerationPanel();
        } catch (err) {
          console.error(err);
          showToast('Could not delete.', 'error');
        }
      });
    });
  } catch (err) {
    console.error(err);
    listEl.innerHTML = `<p class="admin-muted">Failed to load moderation queue.</p>`;
  }
}

// ==========================================================================
// Daily reading content editor (Home card)
// ==========================================================================

function populateDailyDaySelect() {
  const sel = document.getElementById('admin-daily-day-select');
  if (!sel || sel.dataset.filled) return;
  const days = (dailyReadings || []).slice().sort((a, b) => a.day - b.day);
  sel.innerHTML = days.map(r =>
    `<option value="${r.day}">Day ${r.day}: ${escapeHtmlLite(r.title)}</option>`
  ).join('');
  sel.dataset.filled = '1';
}

function escapeHtmlLite(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/"/g, '&quot;');
}

function fillDailyForm(reading) {
  if (!reading) return;
  document.getElementById('admin-daily-title').value = reading.title || '';
  document.getElementById('admin-daily-reference').value = reading.reference || '';
  document.getElementById('admin-daily-verse').value = reading.verse || '';
  document.getElementById('admin-daily-reflection').value = reading.reflection || '';
  document.getElementById('admin-daily-question').value = reading.question || '';

  const badge = document.getElementById('admin-daily-source-badge');
  if (badge) {
    if (reading._fromFirestore) {
      badge.textContent = 'Custom (Firestore)';
      badge.classList.add('is-custom');
    } else {
      badge.textContent = 'Built-in catalog';
      badge.classList.remove('is-custom');
    }
  }
  const meta = document.getElementById('admin-daily-updated-meta');
  if (meta) {
    if (reading._fromFirestore && reading._updatedAt) {
      meta.textContent = `Last saved ${new Date(reading._updatedAt).toLocaleString()}${reading._updatedBy ? ` · ${reading._updatedBy}` : ''}`;
    } else {
      meta.textContent = 'Using the default text from the app catalog (daily_readings.js). Save to create an editable override.';
    }
  }
}

export async function loadDailyReadingEditor(dayNumber) {
  const panel = document.getElementById('admin-panel-daily');
  if (!panel) return;

  populateDailyDaySelect();
  const sel = document.getElementById('admin-daily-day-select');
  const todayBase = await resolveTodaysReading();
  const todayDay = todayBase?.day || ((getDayOfYear() - 1) % Math.max(dailyReadings?.length || 1, 1)) + 1;

  const hint = document.getElementById('admin-daily-today-hint');
  if (hint) {
    hint.textContent = `Today's Home card uses catalog Day ${todayDay} (day-of-year rotation).`;
  }

  let day = dayNumber != null ? Number(dayNumber) : Number(sel?.value || todayDay);
  if (!day || Number.isNaN(day)) day = todayDay;
  if (sel) sel.value = String(day);

  const reading = await resolveReadingForDay(day);
  fillDailyForm(reading);
}

export function wireDailyReadingEditor() {
  const form = document.getElementById('admin-daily-form');
  if (!form || form.dataset.wired) return;
  form.dataset.wired = '1';

  document.getElementById('admin-daily-day-select')?.addEventListener('change', (e) => {
    loadDailyReadingEditor(Number(e.target.value));
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const day = Number(document.getElementById('admin-daily-day-select')?.value);
    if (!day) {
      showToast('Pick a day number first.', 'warning');
      return;
    }
    const btn = document.getElementById('admin-daily-save-btn');
    if (btn) { btn.disabled = true; btn.textContent = 'Saving…'; }
    try {
      await saveReadingContent(day, {
        title: document.getElementById('admin-daily-title').value,
        verse: document.getElementById('admin-daily-verse').value,
        reference: document.getElementById('admin-daily-reference').value,
        reflection: document.getElementById('admin-daily-reflection').value,
        question: document.getElementById('admin-daily-question').value
      });
      showToast(`Day ${day} daily reading saved. Learners see it on Home.`, 'success');
      await loadDailyReadingEditor(day);
      try { await renderDailyReading(); } catch (_) {}
    } catch (err) {
      console.error(err);
      showToast('Could not save daily reading. Check admin access.', 'error');
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = 'Save daily reading'; }
    }
  });

  document.getElementById('admin-daily-reset-btn')?.addEventListener('click', async () => {
    const day = Number(document.getElementById('admin-daily-day-select')?.value);
    if (!day) return;
    if (!confirm(`Reset Day ${day} to the built-in catalog text? This deletes the Firestore override.`)) return;
    try {
      await resetReadingContentToDefault(day);
      showToast(`Day ${day} reset to built-in content.`, 'success');
      await loadDailyReadingEditor(day);
      try { await renderDailyReading(); } catch (_) {}
    } catch (err) {
      clearReadingOverrideCache(day);
      showToast('Using built-in content (no custom override found).', 'info');
      await loadDailyReadingEditor(day);
    }
  });

  document.getElementById('admin-daily-reload-btn')?.addEventListener('click', () => {
    const day = Number(document.getElementById('admin-daily-day-select')?.value);
    clearReadingOverrideCache(day);
    loadDailyReadingEditor(day);
  });
}
