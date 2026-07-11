// Scriptura app entry — wires Phase 1 + Phase 2 modules
import { auth } from './js/firebase.js?v=2.0.32';
import { signOut, onAuthStateChanged, setPersistence, browserSessionPersistence } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { debounce } from './js/utils.js?v=2.0.32';
import { showToast } from './js/toast.js?v=2.0.32';
import { el } from './js/dom.js?v=2.0.32';
import { state } from './js/state.js?v=2.0.32';
import { handlePublisherFileInput, handlePublisherSubmit, handleTemplateToggle, wireVisualEditor } from './js/admin.js?v=2.0.32';
import { handleGoogleSignIn, handleLoginSubmit, handleRegisterSubmit, hideAuthPortal, showAuthPortal, switchAuthTab } from './js/auth_ui.js?v=2.0.32';
import { renderCoursesCatalog, updateFilterTagsUI } from './js/catalog.js?v=2.0.32';
import { renderDashboard } from './js/dashboard.js?v=2.0.32';
import { closeLesson, handleNextClick, handlePrevClick, renderSlide, startModule } from './js/lesson.js?v=2.0.32';
import { handleProfileSave, initNetworkViewer, openProfileDialog, setupPhotoUpload } from './js/network.js?v=2.0.32';
import { checkAndSyncPushToken, registerServiceWorker } from './js/push.js?v=2.0.32';
import { routeToPath, switchDashboardSubtab, switchTab } from './js/routing.js?v=2.0.32';
import { updateStatsDisplay } from './js/stats.js?v=2.0.32';
import { checkAdminNavVisibility, fetchAndMergeCustomModules, loadModuleSchedules, loadUserCloudData, resetLocalState, saveState, updateHeaderProfile, updateStreak } from './js/user.js?v=2.0.32';
import { wireOnboarding, maybeShowOnboarding } from './js/onboarding.js?v=2.0.32';
import { maybeSendDailyReadingReminder, surfaceUnreadNotifications } from './js/notifications.js?v=2.0.32';

async function init() {
  setupEventListeners();
  registerServiceWorker();
  
  try {
    await setPersistence(auth, browserSessionPersistence);
  } catch (err) {
    console.error(err);
  }

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      el.userPill.classList.remove('hidden');
      if (el.guestSignInBtn) el.guestSignInBtn.classList.add('hidden');
      hideAuthPortal();
      document.body.classList.remove('guest-mode');

      // Load custom courses first, then module schedules and user data
      await fetchAndMergeCustomModules();
      await loadModuleSchedules();
      await loadUserCloudData(user);
      state.sessionStartTime = Date.now();
      
      checkAdminNavVisibility();
      updateHeaderProfile();
      updateStreak();
      updateStatsDisplay();
      
      // Update UI displays to reflect custom modules
      renderCoursesCatalog();
      renderDashboard();
      
      // Resume action that required login (e.g. start lesson from guest browse)
      const intent = state.pendingAuthIntent;
      state.pendingAuthIntent = null;
      if (intent?.type === 'startModule' && intent.moduleId) {
        startModule(intent.moduleId, true, { forceRestart: !!intent.forceRestart });
      } else if (intent?.type === 'tab' && intent.tabId) {
        switchTab(intent.tabId, true);
      } else {
        routeToPath(window.location.pathname, false);
      }

      initNetworkViewer();
      
      // Sync push token if permission was previously granted
      if (Notification.permission === 'granted') {
        checkAndSyncPushToken();
      }

      wireOnboarding();
      maybeShowOnboarding();
      maybeSendDailyReadingReminder();
      surfaceUnreadNotifications().catch(() => {});
    } else {
      // Guest mode: browse courses without signing in
      el.userPill.classList.add('hidden');
      if (el.guestSignInBtn) el.guestSignInBtn.classList.remove('hidden');
      document.body.classList.add('guest-mode');
      hideAuthPortal();
      resetLocalState();
      checkAdminNavVisibility();

      try {
        await fetchAndMergeCustomModules();
      } catch (_) { /* optional for guests */ }
      try {
        await loadModuleSchedules();
      } catch (_) { /* optional for guests */ }

      renderCoursesCatalog();

      const path = window.location.pathname || '/';
      if (path.startsWith('/courses')) {
        routeToPath(path, false);
      } else if (path.startsWith('/learn/')) {
        // Deep link to a lesson → show catalog + auth gate for that module
        const moduleId = path.replace('/learn/', '').replace(/\/$/, '');
        switchTab('courses', false);
        if (moduleId) {
          showAuthPortal({
            intent: { type: 'startModule', moduleId },
            message: 'Sign in to start this lesson and save your progress.',
          });
        }
      } else {
        switchTab('courses', false);
      }
    }
  });
}


function setupEventListeners() {
  el.loginForm.addEventListener('submit', handleLoginSubmit);
  el.registerForm.addEventListener('submit', handleRegisterSubmit);
  el.signoutBtn.addEventListener('click', () => signOut(auth));
  el.googleSignInBtn.addEventListener('click', handleGoogleSignIn);
  el.tabLogin.addEventListener('click', () => switchAuthTab('login'));
  el.tabRegister.addEventListener('click', () => switchAuthTab('register'));

  if (el.guestSignInBtn) {
    el.guestSignInBtn.addEventListener('click', () => {
      showAuthPortal({ message: 'Sign in to save progress and unlock the full app.' });
    });
  }
  if (el.authBrowseBtn) {
    el.authBrowseBtn.addEventListener('click', () => {
      hideAuthPortal();
      switchTab('courses', true);
    });
  }
  if (el.authCloseBtn) {
    el.authCloseBtn.addEventListener('click', () => hideAuthPortal());
  }
  // Click backdrop to dismiss when browsing as guest
  if (el.authPortal) {
    el.authPortal.addEventListener('click', (e) => {
      if (e.target === el.authPortal && !auth.currentUser) hideAuthPortal();
    });
  }

  el.subtabStudying.addEventListener('click', () => switchDashboardSubtab('studying'));
  el.subtabCurriculum.addEventListener('click', () => switchDashboardSubtab('curriculum'));

  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => switchTab(item.getAttribute('data-tab')));
  });

  if (el.courseSearch) {
    el.courseSearch.addEventListener('input', debounce(renderCoursesCatalog, 250));
  }
  if (el.openFiltersModalBtn) {
    el.openFiltersModalBtn.addEventListener('click', () => {
      updateFilterTagsUI();
      if (el.filtersModal) el.filtersModal.classList.remove('hidden');
    });
  }

  if (el.activeStatusBadge) {
    el.activeStatusBadge.addEventListener('click', () => {
      // Toggle: all -> released -> locked -> all
      if (state.catalogFilters.status === 'all') {
        state.catalogFilters.status = 'released';
      } else if (state.catalogFilters.status === 'released') {
        state.catalogFilters.status = 'locked';
      } else {
        state.catalogFilters.status = 'all';
      }
      updateFilterTagsUI();
      renderCoursesCatalog();
    });
  }

  if (el.closeFiltersModalBtn) {
    el.closeFiltersModalBtn.addEventListener('click', () => {
      if (el.filtersModal) el.filtersModal.classList.add('hidden');
    });
  }

  if (el.saveFiltersBtn) {
    el.saveFiltersBtn.addEventListener('click', () => {
      if (el.filtersModal) el.filtersModal.classList.add('hidden');
      renderCoursesCatalog();
    });
  }

  // Filter tags selection listeners
  document.querySelectorAll('.filter-tag-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.classList.contains('locked') || btn.disabled) return;
      const fType = btn.getAttribute('data-filter-type');
      const val = btn.getAttribute('data-value');
      if (fType && val) {
        state.catalogFilters[fType] = val;
        updateFilterTagsUI();
      }
    });
  });

  el.closeOnboarding.addEventListener('click', () => {
    el.courseOnboarding.classList.add('hidden');
    history.pushState({ tabId: 'courses' }, '', '/courses');
  });
  el.startOnboardedLesson.addEventListener('click', () => {
    startModule(el.startOnboardedLesson.getAttribute('data-id'));
  });
  if (el.restartOnboardedLesson) {
    el.restartOnboardedLesson.addEventListener('click', () => {
      const id = el.restartOnboardedLesson.getAttribute('data-id');
      if (!id) return;
      const ok = window.confirm('Restart this lesson from the beginning? Your place in this lesson will be reset.');
      if (ok) startModule(id, true, { forceRestart: true });
    });
  }

  el.translationSelect.addEventListener('change', e => {
    state.userState.translation = e.target.value;
    saveState();
    if (state.activeModule && state.activeModule.slides[state.currentSlideIndex].type === 'info') renderSlide();
  });

  if (el.headerProfileTrigger) {
    el.headerProfileTrigger.addEventListener('click', openProfileDialog);
  }
  if (el.closeProfileBtn) {
    el.closeProfileBtn.addEventListener('click', () => el.profileDialog.classList.add('hidden'));
  }
  if (el.profileEditForm) {
    el.profileEditForm.addEventListener('submit', handleProfileSave);
  }

  // Admin publisher: attach listeners once, never clone the form.
  const publisherForm = document.getElementById('admin-publisher-form');
  if (publisherForm) publisherForm.addEventListener('submit', handlePublisherSubmit);
  const publisherFileInput = document.getElementById('publisher-file-input');
  if (publisherFileInput) publisherFileInput.addEventListener('change', handlePublisherFileInput);
  const templateToggle = document.getElementById('publisher-template-toggle');
  if (templateToggle) templateToggle.addEventListener('click', handleTemplateToggle);
  // Profile role select is display-only / hidden — do not bind change→save (prevents demotion).
  setupPhotoUpload();
  wireVisualEditor();

  el.closeLessonBtn.addEventListener('click', closeLesson);
  el.prevSlideBtn.addEventListener('click', handlePrevClick);
  el.nextSlideBtn.addEventListener('click', handleNextClick);

  el.aiTutorTrigger.addEventListener('click', () => el.aiTutorModal.classList.remove('hidden'));
  el.closeTutor.addEventListener('click', () => el.aiTutorModal.classList.add('hidden'));
  el.aiTutorModal.addEventListener('click', e => {
    if (e.target === el.aiTutorModal) el.aiTutorModal.classList.add('hidden');
  });

  const closeLearnerProgressBtn = document.getElementById('close-learner-progress-btn');
  if (closeLearnerProgressBtn) {
    closeLearnerProgressBtn.addEventListener('click', () => {
      document.getElementById('learner-progress-dialog').classList.add('hidden');
    });
  }
  const learnerProgressDialog = document.getElementById('learner-progress-dialog');
  if (learnerProgressDialog) {
    learnerProgressDialog.addEventListener('click', e => {
      if (e.target === learnerProgressDialog) {
        learnerProgressDialog.classList.add('hidden');
      }
    });
  }

  // Background tracking for user session time spent
  setInterval(async () => {
    if (auth.currentUser && state.userState) {
      const now = Date.now();
      const elapsedSeconds = Math.round((now - state.sessionStartTime) / 1000);
      if (elapsedSeconds > 0) {
        state.userState.timeSpent = (state.userState.timeSpent || 0) + elapsedSeconds;
        state.sessionStartTime = now;
        await saveState();
      }
    }
  }, 30000);

  document.addEventListener('visibilitychange', async () => {
    if (auth.currentUser && state.userState) {
      if (document.visibilityState === 'hidden') {
        const now = Date.now();
        const elapsedSeconds = Math.round((now - state.sessionStartTime) / 1000);
        if (elapsedSeconds > 0) {
          state.userState.timeSpent = (state.userState.timeSpent || 0) + elapsedSeconds;
          state.sessionStartTime = now;
          await saveState();
        }
      } else if (document.visibilityState === 'visible') {
        state.sessionStartTime = Date.now();
      }
    }
  });

  window.addEventListener('pagehide', async () => {
    if (auth.currentUser && state.userState) {
      const now = Date.now();
      const elapsedSeconds = Math.round((now - state.sessionStartTime) / 1000);
      if (elapsedSeconds > 0) {
        state.userState.timeSpent = (state.userState.timeSpent || 0) + elapsedSeconds;
        state.sessionStartTime = now;
        await saveState();
      }
    }
  });

    // ==========================================================================
  // Escape-to-close & Focus Management for Modals
  // ==========================================================================
  const modalConfigs = [
    { overlay: el.profileDialog, closeBtn: el.closeProfileBtn, focusSelector: '.profile-modal-card' },
    { overlay: el.filtersModal, closeBtn: el.closeFiltersModal, focusSelector: '.filters-modal-sheet' },
    { overlay: el.aiTutorModal, closeBtn: el.closeTutor, focusSelector: '.tutor-sheet-inner' },
    { overlay: el.eventDialog, closeBtn: el.closeEventBtn, focusSelector: '.profile-modal-card' },
    { overlay: el.courseOnboarding, closeBtn: el.closeOnboarding, focusSelector: '.course-detail-page' }
  ];

  modalConfigs.forEach(function(config) {
    if (!config.overlay) return;
    config.overlay.addEventListener('click', function(e) {
      if (e.target === config.overlay) {
        config.overlay.classList.add('hidden');
      }
    });
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      const dialogs = [
        document.getElementById('visual-editor-dialog'),
        document.getElementById('learner-progress-dialog'),
        el.filtersModal,
        el.aiTutorModal,
        el.profileDialog,
        el.eventDialog,
        el.courseOnboarding
      ];
      for (let i = 0; i < dialogs.length; i++) {
        if (dialogs[i] && !dialogs[i].classList.contains('hidden')) {
          dialogs[i].classList.add('hidden');
          break;
        }
      }
    }
  });

window.addEventListener('keydown', e => {
    if (!state.activeModule) return;
    const slide = state.activeModule.slides[state.currentSlideIndex];
    if (e.key === 'Enter') {
      if (slide.type === 'info' || state.isQuizAnswered || state.selectedOptionIndex !== null) handleNextClick();
    }
    if (e.key === 'ArrowLeft' && state.currentSlideIndex > 0) handlePrevClick();
  });
}

// ==========================================================================
// PWA & Push Notification Helpers
// ==========================================================================


// ==========================================================================
// Start
// ==========================================================================
window.addEventListener('DOMContentLoaded', init);

window.addEventListener('popstate', () => {
  routeToPath(window.location.pathname, false);
});

