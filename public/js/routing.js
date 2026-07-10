// Feature module: routing (Phase 2)
import { el } from './dom.js?v=2.0.22';
import { state } from './state.js?v=2.0.22';
import { renderAdminDashboard } from './admin.js?v=2.0.22';
import { openOnboarding, renderCoursesCatalog } from './catalog.js?v=2.0.22';
import { renderCurriculumGrid, renderDashboard } from './dashboard.js?v=2.0.22';
import { startModule } from './lesson.js?v=2.0.22';
import { updateNetworkView } from './network.js?v=2.0.22';
import { updateStatsDisplay } from './stats.js?v=2.0.22';

export function switchTab(tabId, pushState = true) {
  state.currentTab = tabId;
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.getAttribute('data-tab') === tabId);
  });

  const views = { 
    home: el.viewHome, 
    courses: el.viewCourses, 
    network: el.viewNetwork, 
    stats: el.viewStats,
    admin: el.viewAdmin
  };
  Object.keys(views).forEach(key => {
    if (views[key]) {
      views[key].classList.toggle('hidden', key !== tabId);
    }
  });

  if (tabId === 'courses') renderCoursesCatalog();
  else if (tabId === 'home') renderDashboard();
  else if (tabId === 'stats') updateStatsDisplay();
  else if (tabId === 'network') updateNetworkView();
  else if (tabId === 'admin') renderAdminDashboard();

  // Reset overlay screens when switching tabs
  el.courseOnboarding.classList.add('hidden');
  el.lessonView.classList.add('hidden');
  el.lessonView.classList.remove('cardquiz-mode');
  el.bottomNav.classList.remove('hidden');
  el.header.classList.remove('hidden');

  if (pushState) {
    const path = tabId === 'home' ? '/' : '/' + tabId;
    history.pushState({ tabId }, '', path);
  }

  window.scrollTo({ top: 0, behavior: 'instant' });
}

export function routeToPath(path, pushState = true) {
  if (!path) path = '/';
  if (path.length > 1 && path.endsWith('/')) {
    path = path.slice(0, -1);
  }

  if (path.startsWith('/courses/')) {
    const moduleId = path.replace('/courses/', '');
    switchTab('courses', false);
    openOnboarding(moduleId, pushState);
  } else if (path.startsWith('/learn/')) {
    const moduleId = path.replace('/learn/', '');
    startModule(moduleId, pushState);
  } else if (path === '/courses') {
    switchTab('courses', pushState);
  } else if (path === '/network') {
    switchTab('network', pushState);
  } else if (path === '/stats') {
    switchTab('stats', pushState);
  } else if (path === '/admin') {
    switchTab('admin', pushState);
  } else {
    switchTab('home', pushState);
  }
}

export function switchDashboardSubtab(subtab) {
  state.currentDashboardSubtab = subtab;
  const isStudying = subtab === 'studying';
  el.subtabStudying.classList.toggle('active', isStudying);
  el.subtabCurriculum.classList.toggle('active', !isStudying);
  el.subcontentStudying.classList.toggle('hidden', !isStudying);
  el.subcontentCurriculum.classList.toggle('hidden', isStudying);
  if (!isStudying) renderCurriculumGrid();
}

