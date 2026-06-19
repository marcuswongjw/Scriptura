import { concentrations, modules } from './modules.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, setPersistence, browserSessionPersistence } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { getFirestore, doc, getDoc, setDoc, collection, getDocs, onSnapshot, addDoc, query, orderBy, limit } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

// ==========================================================================
// Firebase Initialization
// ==========================================================================
const firebaseConfig = {
  projectId: "scriptura-study-2026",
  appId: "1:672733276555:web:89c11cfd510ba13272678e",
  storageBucket: "scriptura-study-2026.firebasestorage.app",
  apiKey: "AIzaSyC4LtEjnfu8CzP6KSM_hVgJxhqWndJpFTo",
  authDomain: "scriptura-study-2026.firebaseapp.com",
  messagingSenderId: "672733276555"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ==========================================================================
// Application State
// ==========================================================================
let userState = {
  xp: 0,
  streak: 0,
  completedModules: [],
  lastActiveDate: null,
  translation: 'ESV',
  quizStats: { correctFirstTry: 0, totalQuestions: 0 },
  country: ''
};

let activeModule = null;
let currentSlideIndex = 0;
let selectedOptionIndex = null;
let isQuizAnswered = false;
let currentQuestionFirstAttempt = true;
let currentTab = 'home';
let currentDashboardSubtab = 'studying';

const moduleIcons = {
  'beautiful-book-intro':   '📖',
  'genesis-creation':       '🏛️',
  'genesis-fall-sin':       '🍎',
  'genesis-twelve-abraham': '🌟',
  'genesis-twentyfive-fifty-patriarchs': '🤼',
  'exodus-deliverance':     '📜',
  'leviticus-worship':      '🐂',
  'numbers-wilderness':     '📊',
};

// ==========================================================================
// DOM Elements
// ==========================================================================
const el = {
  // Top bar
  header:          document.getElementById('main-header'),
  userPill:        document.getElementById('user-pill'),
  headerProfileTrigger: document.getElementById('header-profile-trigger'),
  headerAvatar:    document.getElementById('header-avatar'),
  userDisplayName: document.getElementById('user-display-name'),
  signoutBtn:      document.getElementById('signout-btn'),
  translationSelect: document.getElementById('translation-select'),

  // Auth Portal
  authPortal:      document.getElementById('auth-portal'),
  tabLogin:        document.getElementById('tab-login'),
  tabRegister:     document.getElementById('tab-register'),
  loginForm:       document.getElementById('login-form'),
  registerForm:    document.getElementById('register-form'),
  loginEmail:      document.getElementById('login-email'),
  loginPass:       document.getElementById('login-password'),
  registerEmail:   document.getElementById('register-email'),
  registerPass:    document.getElementById('register-password'),
  googleSignInBtn: document.getElementById('google-signin-btn'),
  authError:       document.getElementById('auth-error'),

  // Tab Views
  viewHome:     document.getElementById('view-home'),
  viewCourses:  document.getElementById('view-courses'),
  viewNetwork:  document.getElementById('view-network'),
  viewStats:    document.getElementById('view-stats'),
  bottomNav:    document.getElementById('bottom-nav'),

  // Dashboard Sub-tabs
  subtabStudying:       document.getElementById('subtab-studying'),
  subtabCurriculum:     document.getElementById('subtab-curriculum'),
  subcontentStudying:   document.getElementById('subcontent-studying'),
  subcontentCurriculum: document.getElementById('subcontent-curriculum'),
  currentStudyContainer: document.getElementById('current-study-container'),
  concentrationGrid:     document.getElementById('concentration-grid'),

  // Courses View
  courseSearch:       document.getElementById('course-search'),
  catalogContainer:   document.getElementById('catalog-container'),
  courseOnboarding:   document.getElementById('course-onboarding'),
  closeOnboarding:    document.getElementById('close-onboarding'),
  onboardTag:         document.getElementById('onboard-tag'),
  onboardTitle:       document.getElementById('onboard-title'),
  onboardDesc:        document.getElementById('onboard-desc'),
  onboardIcon:        document.getElementById('onboard-icon'),
  onboardBulletPoints: document.getElementById('onboard-bullet-points'),
  onboardLessonCount: document.getElementById('onboard-lesson-count'),
  onboardChapterTitle: document.getElementById('onboard-chapter-title'),
  courseHighlightsList: document.getElementById('course-highlights-list'),
  startOnboardedLesson: document.getElementById('start-onboarded-lesson'),

  // Network View

  // Profile Modal
  profileDialog:            document.getElementById('profile-dialog'),
  closeProfileBtn:          document.getElementById('close-profile-btn'),
  profileEditForm:          document.getElementById('profile-edit-form'),
  avatarPresetsContainer:   document.getElementById('avatar-presets-container'),
  profilePhotoUrl:          document.getElementById('profile-photo-url'),
  profileNameInput:         document.getElementById('profile-name-input'),
  profileEmailInput:        document.getElementById('profile-email-input'),
  profileChurchInput:       document.getElementById('profile-church-input'),
  profileCountrySelect:     document.getElementById('profile-country-select'),

  // Event Modal
  eventDialog:              document.getElementById('event-dialog'),
  closeEventBtn:            document.getElementById('close-event-btn'),
  eventCreateForm:          document.getElementById('event-create-form'),
  eventTitleInput:          document.getElementById('event-title-input'),
  eventDescInput:           document.getElementById('event-desc-input'),
  eventTimeInput:           document.getElementById('event-time-input'),

  // Network sub-views / controls
  netNavItems:              document.querySelectorAll('.net-nav-item'),
  netSubviews:              document.querySelectorAll('.net-subview'),
  peopleSearch:             document.getElementById('people-search'),
  peopleGrid:               document.getElementById('people-grid'),
  createEventBtn:           document.getElementById('create-event-btn'),
  eventsList:               document.getElementById('events-list'),
  chatMessages:             document.getElementById('chat-messages'),
  chatInputForm:            document.getElementById('chat-input-form'),
  chatMessageInput:         document.getElementById('chat-message-input'),

  // Stats View
  statsXpVal:        document.getElementById('stats-xp-val'),
  statsCompletedVal: document.getElementById('stats-completed-val'),
  statsStreakVal:    document.getElementById('stats-streak-val'),
  statsAccuracyVal:  document.getElementById('stats-accuracy-val'),

  // Lesson Screen
  lessonView:        document.getElementById('lesson-view'),
  lessonTopbar:      document.getElementById('lesson-topbar'),
  lessonDotsBar:     document.getElementById('lesson-dots-bar'),
  lessonProgressBar: document.getElementById('lesson-progress-bar'),
  lessonContentArea: document.getElementById('lesson-content-area'),
  takeawayBanner:    document.getElementById('takeaway-banner'),
  takeawayIcon:      document.getElementById('takeaway-icon'),
  takeawayText:      document.getElementById('takeaway-text'),
  activeCard:        document.getElementById('active-card'),
  aiTutorTrigger:    document.getElementById('ai-tutor-trigger'),
  prevSlideBtn:      document.getElementById('prev-slide'),
  closeLessonBtn:    document.getElementById('close-lesson'),
  nextSlideBtn:      document.getElementById('next-slide'),
  nextBtnText:       document.getElementById('next-btn-text'),

  // AI Tutor Sheet
  aiTutorModal:         document.getElementById('ai-tutor-modal'),
  closeTutor:           document.getElementById('close-tutor'),
  tutorExplanationText: document.getElementById('tutor-explanation-text')
};

// ==========================================================================
// Auth Observer & Init
// ==========================================================================
function init() {
  setupEventListeners();
  setPersistence(auth, browserSessionPersistence).catch(err => console.error(err));

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      el.userPill.classList.remove('hidden');
      el.authPortal.classList.add('hidden');

      await loadUserCloudData(user);
      updateHeaderProfile();
      updateStreak();
      updateStatsDisplay();
      switchTab('home');
      initNetworkViewer();
    } else {
      el.userPill.classList.add('hidden');
      el.authPortal.classList.remove('hidden');
      resetLocalState();
    }
  });
}

function updateHeaderProfile() {
  if (auth.currentUser) {
    el.userDisplayName.textContent = userState.name || auth.currentUser.displayName || auth.currentUser.email || 'Learner';
    if (userState.photo) {
      el.headerAvatar.src = userState.photo;
    } else {
      el.headerAvatar.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${auth.currentUser.uid}`;
    }
  }
}

async function loadUserCloudData(user) {
  try {
    const userRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(userRef);

    let cloudData = null;
    if (docSnap.exists()) cloudData = docSnap.data();

    const localSaved = localStorage.getItem('berea_user_state') || localStorage.getItem('scriptura_user_state');
    let guestState = null;
    if (localSaved) { try { guestState = JSON.parse(localSaved); } catch(e) {} }

      if (cloudData) {
      userState = {
        xp: 0,
        streak: 0,
        completedModules: [],
        lastActiveDate: null,
        translation: 'ESV',
        quizStats: { correctFirstTry: 0, totalQuestions: 0 },
        country: '',
        name: user.displayName || '',
        photo: user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`,
        email: user.email || '',
        church: '',
        ...cloudData
      };
      if (!userState.quizStats) userState.quizStats = { correctFirstTry: 0, totalQuestions: 0 };
      if (!userState.completedModules) userState.completedModules = [];

      // Only merge guest data if the cloud account has NO progress yet (brand new account)
      const isMigrated = localStorage.getItem('berea_local_migrated') === 'true';
      const cloudHasProgress = (cloudData.xp || 0) > 0 || (cloudData.completedModules || []).length > 0;
      if (guestState && !isMigrated && !cloudHasProgress) {
        let merged = false;
        if (guestState.xp > (userState.xp || 0)) { userState.xp = guestState.xp; merged = true; }
        if (guestState.streak > (userState.streak || 0)) { userState.streak = guestState.streak; merged = true; }
        const cloudCompleted = userState.completedModules || [];
        const guestCompleted = guestState.completedModules || [];
        const mergedCompleted = Array.from(new Set([...cloudCompleted, ...guestCompleted]));
        if (mergedCompleted.length > cloudCompleted.length) { userState.completedModules = mergedCompleted; merged = true; }
        if (merged) await setDoc(userRef, userState);
        localStorage.setItem('berea_local_migrated', 'true');
      }
    } else {
      if (guestState) {
        userState = {
          xp: 0,
          streak: 0,
          completedModules: [],
          lastActiveDate: null,
          translation: 'ESV',
          quizStats: { correctFirstTry: 0, totalQuestions: 0 },
          country: '',
          name: user.displayName || '',
          photo: user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`,
          email: user.email || '',
          church: '',
          ...guestState
        };
      } else {
        userState = {
          xp: 0,
          streak: 0,
          completedModules: [],
          lastActiveDate: null,
          translation: 'ESV',
          quizStats: { correctFirstTry: 0, totalQuestions: 0 },
          country: '',
          name: user.displayName || '',
          photo: user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`,
          email: user.email || '',
          church: ''
        };
      }
      await setDoc(userRef, userState);
      localStorage.setItem('berea_local_migrated', 'true');
    }

    if (userState.translation) el.translationSelect.value = userState.translation;
  } catch (err) {
    console.error('Error loading user cloud data:', err);
  }
}

function resetLocalState() {
  userState = { xp: 0, streak: 0, completedModules: [], lastActiveDate: null, translation: 'ESV', quizStats: { correctFirstTry: 0, totalQuestions: 0 }, country: '', name: '', photo: '', email: '', church: '' };
  // Clear migration flag so a different account logging in gets a fresh start
  localStorage.removeItem('berea_local_migrated');
  localStorage.removeItem('berea_user_state');
  updateStatsDisplay();
}

async function saveState() {
  localStorage.setItem('berea_user_state', JSON.stringify(userState));
  updateStatsDisplay();
  if (auth.currentUser) {
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await setDoc(userRef, userState);
    } catch (err) { console.error('Failed to sync progress:', err); }
  }
}

function updateStreak() {
  const todayStr = new Date().toDateString();
  const lastActive = userState.lastActiveDate ? new Date(userState.lastActiveDate) : null;
  if (!lastActive) { userState.streak = 0; return; }
  const lastActiveStr = lastActive.toDateString();
  if (todayStr !== lastActiveStr) {
    const diffDays = Math.ceil(Math.abs(new Date(todayStr) - lastActive) / (1000 * 60 * 60 * 24));
    userState.streak = diffDays === 1 ? userState.streak + 1 : 1;
  }
}

function recordActivity() {
  const todayStr = new Date().toDateString();
  const lastActiveStr = userState.lastActiveDate ? new Date(userState.lastActiveDate).toDateString() : null;
  if (todayStr !== lastActiveStr) {
    if (userState.streak === 0) userState.streak = 1;
    userState.lastActiveDate = new Date().toISOString();
    saveState();
  }
}

// ==========================================================================
// Tab Router
// ==========================================================================
function switchTab(tabId) {
  currentTab = tabId;
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.getAttribute('data-tab') === tabId);
  });

  const views = { home: el.viewHome, courses: el.viewCourses, network: el.viewNetwork, stats: el.viewStats };
  Object.keys(views).forEach(key => views[key].classList.toggle('hidden', key !== tabId));

  if (tabId === 'courses') renderCoursesCatalog();
  else if (tabId === 'home') renderDashboard();
  else if (tabId === 'stats') updateStatsDisplay();
  else if (tabId === 'network') updateNetworkView();

  window.scrollTo({ top: 0, behavior: 'instant' });
}

function switchDashboardSubtab(subtab) {
  currentDashboardSubtab = subtab;
  const isStudying = subtab === 'studying';
  el.subtabStudying.classList.toggle('active', isStudying);
  el.subtabCurriculum.classList.toggle('active', !isStudying);
  el.subcontentStudying.classList.toggle('hidden', !isStudying);
  el.subcontentCurriculum.classList.toggle('hidden', isStudying);
  if (!isStudying) renderCurriculumGrid();
}

// ==========================================================================
// Dashboard Tab
// ==========================================================================
function renderDashboard() {
  try {
    const completedList = (userState && Array.isArray(userState.completedModules)) ? userState.completedModules : [];
    
    if (!modules || modules.length === 0) {
      el.currentStudyContainer.innerHTML = `<div class="study-card-title">No modules loaded</div>`;
      return;
    }

    const nextModule = modules.find(m => m && !completedList.includes(m.id)) || modules[modules.length - 1];
    if (!nextModule) {
      el.currentStudyContainer.innerHTML = `<div class="study-card-title">Error identifying next module</div>`;
      return;
    }

    const isAllComplete = modules.every(m => m && completedList.includes(m.id));
    const icon = moduleIcons[nextModule.id] || '📖';
    const completed = completedList.length;
    const total = modules.length;

    if (isAllComplete) {
      el.currentStudyContainer.innerHTML = `
        <div class="study-card-label">ALL COURSES COMPLETED</div>
        <div class="study-card-title">🎓 Berea Scholar!</div>
        <div class="study-card-desc">Congratulations — you have completed all foundational modules. Review any lesson below.</div>
        <button class="primary-btn" id="btn-dashboard-review" style="margin-top:0.5rem;">REVIEW COURSES</button>
      `;
      document.getElementById('btn-dashboard-review')?.addEventListener('click', () => switchTab('courses'));
    } else {
      el.currentStudyContainer.innerHTML = `
        <div class="study-card-label">CURRENTLY STUDYING • ${completed} of ${total} COMPLETE</div>
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
    const fallbackModule = modules[0] || { id: 'beautiful-book-intro', title: 'Introduction to The Beautiful Book', description: 'Start your Berea learning journey.' };
    el.currentStudyContainer.innerHTML = `
      <div class="study-card-label">READY TO STUDY</div>
      <div class="study-card-title">${fallbackModule.title}</div>
      <div class="study-card-desc">${fallbackModule.description || ''}</div>
      <button class="primary-btn" id="btn-dashboard-resume-fallback" style="margin-top:0.5rem;">START COURSE</button>
    `;
    document.getElementById('btn-dashboard-resume-fallback')?.addEventListener('click', () => {
      openOnboarding(fallbackModule.id);
    });
  }
}

// ==========================================================================
// Curriculum Grid (SVG rings)
// ==========================================================================
function renderCurriculumGrid() {
  try {
    el.concentrationGrid.innerHTML = '';
    const radius = 28;
    const circ = 2 * Math.PI * radius;
    const completedList = (userState && Array.isArray(userState.completedModules)) ? userState.completedModules : [];

    // Group concentrations
    const groups = {};
    concentrations.forEach(con => {
      const gName = con.group || 'General';
      if (!groups[gName]) groups[gName] = [];
      groups[gName].push(con);
    });

    Object.keys(groups).forEach(gName => {
      const groupTitleHtml = `<h3 class="curriculum-group-title" style="grid-column: 1/-1; margin-top: 1rem; font-family: var(--font-display); font-weight: 800; font-size: 1.1rem; color: var(--gray-800); border-bottom: 1px solid var(--gray-100); padding-bottom: 0.5rem; text-align: left;">${gName.toUpperCase()}</h3>`;
      el.concentrationGrid.insertAdjacentHTML('beforeend', groupTitleHtml);

      groups[gName].forEach(con => {
        const total = con.modules.length;
        const completed = con.modules.filter(mid => completedList.includes(mid)).length;
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
      badge.addEventListener('click', () => {
        switchTab('courses');
      });
    });
  } catch (err) {
    console.error('Error rendering curriculum grid:', err);
  }
}

function renderCoursesCatalog() {
  el.catalogContainer.innerHTML = '';
  const searchVal = el.courseSearch.value.trim().toLowerCase();

  // Group concentrations
  const groups = {};
  concentrations.forEach(con => {
    const gName = con.group || 'General';
    if (!groups[gName]) groups[gName] = [];
    groups[gName].push(con);
  });

  Object.keys(groups).forEach(gName => {
    let hasMatchingModules = false;
    groups[gName].forEach(con => {
      const matches = modules.filter(m =>
        con.modules.includes(m.id) &&
        (searchVal === '' || m.title.toLowerCase().includes(searchVal) || m.description.toLowerCase().includes(searchVal))
      );
      if (matches.length > 0) hasMatchingModules = true;
    });

    if (!hasMatchingModules) return;

    const groupHeaderHtml = `<div class="catalog-group-header" style="margin-top: 1.5rem; font-family: var(--font-display); font-weight: 800; font-size: 1.2rem; color: var(--brand-coral); border-bottom: 2px solid rgba(225, 29, 72, 0.1); padding-bottom: 0.25rem; margin-bottom: 0.75rem; text-align: left;">${gName.toUpperCase()}</div>`;
    el.catalogContainer.insertAdjacentHTML('beforeend', groupHeaderHtml);

    groups[gName].forEach(con => {
      const filteredModules = modules.filter(m =>
        con.modules.includes(m.id) &&
        (searchVal === '' || m.title.toLowerCase().includes(searchVal) || m.description.toLowerCase().includes(searchVal))
      );
      if (filteredModules.length === 0) return;

      // Section header
      const headerHtml = `<div class="catalog-section-header" style="margin-top: 0.5rem; font-size: 0.9rem; font-weight: 700; color: var(--gray-600); text-align: left; margin-bottom: 0.5rem;">${con.title.toUpperCase()}</div>`;
      el.catalogContainer.insertAdjacentHTML('beforeend', headerHtml);

      filteredModules.forEach(mod => {
        const isComplete = userState.completedModules.includes(mod.id);
        const icon = moduleIcons[mod.id] || '📖';
        const completedLabel = isComplete
          ? `<div class="module-row-completed-label">✓ COMPLETED</div>`
          : `<div class="module-row-completed-label" style="color:var(--gray-400);">⚡ +${mod.xpReward} XP • ${mod.duration}</div>`;

        const rowHtml = `
          <div class="module-row" data-mod-id="${mod.id}">
            <div class="module-row-icon ${isComplete ? 'complete' : ''}">${icon}</div>
            <div class="module-row-body">
              <div class="module-row-title">${mod.title}</div>
              <div class="module-row-desc">${mod.description}</div>
              ${completedLabel}
            </div>
            <span class="module-row-chevron">›</span>
          </div>
        `;
        el.catalogContainer.insertAdjacentHTML('beforeend', rowHtml);
      });
    });
  });

  document.querySelectorAll('.module-row').forEach(row => {
    row.addEventListener('click', () => openOnboarding(row.getAttribute('data-mod-id')));
  });
}

// ==========================================================================
// Course Onboarding / Detail Overlay
// ==========================================================================
function openOnboarding(moduleId) {
  const mod = modules.find(m => m.id === moduleId);
  if (!mod) return;

  const icon = moduleIcons[mod.id] || '📖';
  const infoSlides = mod.slides.filter(s => s.type === 'info');
  const totalSlides = mod.slides.length;
  const isComplete = userState.completedModules.includes(mod.id);

  el.onboardIcon.textContent = icon;
  el.onboardTag.textContent = mod.category.toUpperCase();
  el.onboardTitle.textContent = mod.title;
  el.onboardDesc.textContent = mod.description;
  el.onboardLessonCount.textContent = `${totalSlides} SLIDES`;
  el.onboardChapterTitle.textContent = mod.title;

  // Lesson list items
  el.onboardBulletPoints.innerHTML = '';
  infoSlides.slice(0, 4).forEach((slide, idx) => {
    const html = `
      <div class="onboard-lesson-item">
        <div class="lesson-green-bar"></div>
        <div class="onboard-lesson-item-inner">
          <div class="onboard-lesson-number">SLIDE ${idx + 1}</div>
          <div class="onboard-lesson-title">${slide.title}</div>
        </div>
      </div>
    `;
    el.onboardBulletPoints.insertAdjacentHTML('beforeend', html);
  });

  // Course highlights
  el.courseHighlightsList.innerHTML = '';
  infoSlides.slice(0, 3).forEach(slide => {
    const li = document.createElement('li');
    li.textContent = slide.keyTakeaway || slide.title;
    el.courseHighlightsList.appendChild(li);
  });

  el.startOnboardedLesson.setAttribute('data-id', moduleId);
  el.startOnboardedLesson.textContent = isComplete ? 'REVIEW COURSE' : 'START COURSE';
  el.courseOnboarding.classList.remove('hidden');
}

// Global Network & World Map
// ==========================================================================
const countryMetadata = {
  US: { name: 'United States', flag: '🇺🇸', cx: 210, cy: 140 },
  SG: { name: 'Singapore', flag: '🇸🇬', cx: 770, cy: 240 },
  GB: { name: 'United Kingdom', flag: '🇬🇧', cx: 510, cy: 110 },
  AU: { name: 'Australia', flag: '🇦🇺', cx: 850, cy: 380 },
  CA: { name: 'Canada', flag: '🇨🇦', cx: 180, cy: 120 },
  ZA: { name: 'South Africa', flag: '🇿🇦', cx: 540, cy: 360 },
  PH: { name: 'Philippines', flag: '🇵🇭', cx: 830, cy: 180 },
  KR: { name: 'South Korea', flag: '🇰🇷', cx: 810, cy: 130 },
  MY: { name: 'Malaysia', flag: '🇲🇾', cx: 750, cy: 210 },
  HK: { name: 'Hong Kong', flag: '🇭🇰', cx: 790, cy: 160 }
};

let registeredUsers = [];
let currentNetworkTab = 'map';

async function initNetworkViewer() {
  // Setup sub-navigation listener
  el.netNavItems.forEach(item => {
    item.addEventListener('click', () => {
      switchNetworkTab(item.getAttribute('data-net-tab'));
    });
  });

  // Setup toolbar handlers
  if (el.peopleSearch) {
    el.peopleSearch.addEventListener('input', renderPeopleDirectory);
  }

  // Setup Event form
  if (el.createEventBtn) {
    el.createEventBtn.addEventListener('click', () => {
      el.eventDialog.classList.remove('hidden');
    });
  }
  if (el.closeEventBtn) {
    el.closeEventBtn.addEventListener('click', () => {
      el.eventDialog.classList.add('hidden');
    });
  }
  if (el.eventCreateForm) {
    el.eventCreateForm.addEventListener('submit', handleCreateEvent);
  }

  // Setup Chat form
  if (el.chatInputForm) {
    el.chatInputForm.addEventListener('submit', handleSendChatMessage);
  }

  await fetchRegisteredUsers();
  updateNetworkView();
  switchNetworkTab('map');
}

async function fetchRegisteredUsers() {
  try {
    const querySnapshot = await getDocs(collection(db, 'users'));
    registeredUsers = [];
    querySnapshot.forEach(docSnap => {
      registeredUsers.push({
        uid: docSnap.id,
        ...docSnap.data()
      });
    });
  } catch (err) {
    console.error('Failed to fetch registered users:', err);
  }
}

function updateNetworkView() {
  const currentCountry = userState.country;
  
  // Update regional active count display
  const countEl = document.getElementById('regional-active-count');
  if (countEl) {
    const counts = {};
    registeredUsers.forEach(u => {
      if (u.country) {
        counts[u.country] = (counts[u.country] || 0) + 1;
      }
    });
    const countryCount = currentCountry ? (counts[currentCountry] || 0) : 0;
    countEl.textContent = countryCount.toLocaleString();
  }

  renderMapClusters();
  renderDirectoryList();
}

function renderMapClusters() {
  const clusterGroup = document.getElementById('map-clusters');
  if (!clusterGroup) return;
  clusterGroup.innerHTML = '';
  
  const counts = {};
  registeredUsers.forEach(u => {
    if (u.country) {
      counts[u.country] = (counts[u.country] || 0) + 1;
    }
  });
  
  Object.keys(counts).forEach(countryCode => {
    const meta = countryMetadata[countryCode];
    if (!meta) return;
    const count = counts[countryCode];
    
    // Calculate radius dynamically
    const r = 12 + Math.min(count, 10) * 2;
    
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', `map-cluster ${countryCode === userState.country ? 'active' : ''}`);
    g.setAttribute('data-country', countryCode);
    
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', meta.cx);
    circle.setAttribute('cy', meta.cy);
    circle.setAttribute('r', r);
    circle.setAttribute('class', 'map-cluster-circle');
    if (countryCode === userState.country) {
      circle.style.fill = '#10b981'; // Green for active user country
    }
    
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', meta.cx);
    text.setAttribute('y', meta.cy);
    text.setAttribute('class', 'map-cluster-text');
    text.textContent = count;
    
    g.appendChild(circle);
    g.appendChild(text);
    clusterGroup.appendChild(g);
    
    g.addEventListener('click', async () => {
      userState.country = countryCode;
      await saveState();
      await fetchRegisteredUsers();
      updateNetworkView();
    });
  });
}

function renderDirectoryList() {
  const listEl = document.getElementById('network-directory-list');
  if (!listEl) return;
  listEl.innerHTML = '';
  
  const counts = {};
  registeredUsers.forEach(u => {
    if (u.country) {
      counts[u.country] = (counts[u.country] || 0) + 1;
    }
  });
  
  Object.keys(counts).forEach(code => {
    const info = countryMetadata[code];
    if (!info) return;
    const count = counts[code];
    const isUserCountry = code === userState.country;
    
    const html = `
      <div class="directory-item ${isUserCountry ? 'active-user-country' : ''}" data-country-code="${code}">
        <div class="directory-country-name">
          <span class="directory-country-flag">${info.flag}</span>
          <span>${info.name} ${isUserCountry ? '(You)' : ''}</span>
        </div>
        <div class="directory-user-count">${count} registered</div>
      </div>
    `;
    listEl.insertAdjacentHTML('beforeend', html);
  });
  
  document.querySelectorAll('.directory-item').forEach(item => {
    item.addEventListener('click', async () => {
      const code = item.getAttribute('data-country-code');
      userState.country = code;
      await saveState();
      await fetchRegisteredUsers();
      updateNetworkView();
    });
  });
}

function switchNetworkTab(tabId) {
  currentNetworkTab = tabId;
  el.netNavItems.forEach(item => {
    item.classList.toggle('active', item.getAttribute('data-net-tab') === tabId);
  });
  el.netSubviews.forEach(view => {
    const shouldBeActive = view.id === `net-subview-${tabId}`;
    view.classList.toggle('active', shouldBeActive);
    view.classList.toggle('hidden', !shouldBeActive);
  });
  
  if (tabId === 'people') {
    renderPeopleDirectory();
  } else if (tabId === 'events') {
    loadEvents();
  } else if (tabId === 'messages') {
    loadChatMessages();
  }
}

function renderPeopleDirectory() {
  if (!el.peopleGrid) return;
  el.peopleGrid.innerHTML = '';
  
  const searchQuery = el.peopleSearch.value.toLowerCase().trim();
  
  const filtered = registeredUsers.filter(u => {
    const countryMeta = countryMetadata[u.country] || { name: '' };
    const matchesSearch = !searchQuery || 
      (u.name && u.name.toLowerCase().includes(searchQuery)) ||
      (u.church && u.church.toLowerCase().includes(searchQuery)) ||
      (countryMeta.name && countryMeta.name.toLowerCase().includes(searchQuery));
      
    return matchesSearch;
  });
  
  if (filtered.length === 0) {
    el.peopleGrid.innerHTML = `<div style="grid-column: 1/-1; padding: 2rem; color: var(--gray-400); text-align: center;">No learners found matching filters.</div>`;
    return;
  }
  
  filtered.forEach(u => {
    const avatarUrl = u.photo || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.uid}`;
    const countryMeta = countryMetadata[u.country] || { name: 'Unknown', flag: '🌍' };
    const modCount = u.completedModules ? u.completedModules.length : 0;
    
    const html = `
      <div class="user-card">
        <img class="card-avatar" src="${avatarUrl}" alt="${u.name || 'Learner'}">
        <div class="card-name">${u.name || 'Anonymous Learner'}</div>
        <div class="card-church">${u.church || 'No Fellowship Spec.'}</div>
        <span class="card-country-tag">${countryMeta.flag} ${countryMeta.name}</span>
        <div class="card-meta-row">
          <span class="card-badge">🧠 ${u.xp || 0} XP</span>
          <span class="card-badge">🔥 ${u.streak || 0}d</span>
          <span class="card-badge">📖 ${modCount} Modules</span>
        </div>
      </div>
    `;
    el.peopleGrid.insertAdjacentHTML('beforeend', html);
  });
}

let unsubscribeEvents = null;
function loadEvents() {
  if (unsubscribeEvents) unsubscribeEvents();
  
  const eventsCol = collection(db, 'events');
  unsubscribeEvents = onSnapshot(query(eventsCol, orderBy('time', 'asc')), (snapshot) => {
    el.eventsList.innerHTML = '';
    let events = [];
    snapshot.forEach(docSnap => {
      events.push({ id: docSnap.id, ...docSnap.data() });
    });
    
    if (events.length === 0) {
      el.eventsList.innerHTML = `<div style="padding: 2rem; color: var(--gray-400); text-align: center;">No study events scheduled. Click "Schedule Event" to create one!</div>`;
      return;
    }
    
    events.forEach(ev => {
      const timeStr = new Date(ev.time).toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      const hostAvatar = ev.hostPhoto || `https://api.dicebear.com/7.x/bottts/svg?seed=${ev.hostUid}`;
      
      const html = `
        <div class="event-card">
          <div class="event-info">
            <span class="event-time-badge">${timeStr}</span>
            <div class="event-title">${ev.title}</div>
            <p class="event-desc">${ev.description}</p>
            <div class="event-host">
              <img class="event-host-avatar" src="${hostAvatar}" alt="Host">
              <span>Hosted by ${ev.hostName || 'Host'}</span>
            </div>
          </div>
          <div class="event-actions">
            <button class="primary-btn compact-btn join-event-btn" data-event-id="${ev.id}">RSVP / JOIN</button>
          </div>
        </div>
      `;
      el.eventsList.insertAdjacentHTML('beforeend', html);
    });
    
    document.querySelectorAll('.join-event-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        alert('You have successfully RSVPed to this study event! Check back closer to the time.');
      });
    });
  }, (err) => {
    console.error("Error loading events: ", err);
  });
}

async function handleCreateEvent(e) {
  e.preventDefault();
  if (!auth.currentUser) return;
  
  const title = el.eventTitleInput.value;
  const description = el.eventDescInput.value;
  const time = el.eventTimeInput.value;
  
  try {
    await addDoc(collection(db, 'events'), {
      title,
      description,
      time,
      hostUid: auth.currentUser.uid,
      hostName: userState.name || auth.currentUser.displayName || 'Berea Learner',
      hostPhoto: userState.photo || `https://api.dicebear.com/7.x/bottts/svg?seed=${auth.currentUser.uid}`
    });
    
    el.eventCreateForm.reset();
    el.eventDialog.classList.add('hidden');
  } catch (err) {
    console.error('Failed to create event:', err);
    alert('Failed to schedule event. Please try again.');
  }
}

let unsubscribeChat = null;
function loadChatMessages() {
  if (unsubscribeChat) unsubscribeChat();
  
  const messagesCol = collection(db, 'messages');
  const q = query(messagesCol, orderBy('timestamp', 'asc'));
  
  unsubscribeChat = onSnapshot(q, (snapshot) => {
    el.chatMessages.innerHTML = '';
    snapshot.forEach(docSnap => {
      const msg = docSnap.data();
      const isSelf = msg.senderUid === auth.currentUser?.uid;
      const avatarUrl = msg.senderPhoto || `https://api.dicebear.com/7.x/bottts/svg?seed=${msg.senderUid}`;
      let timeStr = 'Just now';
      if (msg.timestamp) {
        try {
          timeStr = new Date(msg.timestamp.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch (ex) {
          timeStr = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
      }
      
      const html = `
        <div class="chat-msg ${isSelf ? 'self' : ''}">
          <img class="chat-msg-avatar" src="${avatarUrl}" alt="Avatar">
          <div class="chat-msg-content">
            <div class="chat-msg-header">
              <span class="chat-msg-author">${msg.senderName || 'Anonymous'}</span>
              <span class="chat-msg-time">${timeStr}</span>
            </div>
            <div class="chat-msg-bubble">${msg.text}</div>
          </div>
        </div>
      `;
      el.chatMessages.insertAdjacentHTML('beforeend', html);
    });
    
    el.chatMessages.scrollTop = el.chatMessages.scrollHeight;
  }, (err) => {
    console.error("Error loading chat: ", err);
  });
}

async function handleSendChatMessage(e) {
  e.preventDefault();
  if (!auth.currentUser) return;
  
  const text = el.chatMessageInput.value.trim();
  if (!text) return;
  
  el.chatMessageInput.value = '';
  
  try {
    await addDoc(collection(db, 'messages'), {
      text,
      senderUid: auth.currentUser.uid,
      senderName: userState.name || auth.currentUser.displayName || 'Berea Learner',
      senderPhoto: userState.photo || `https://api.dicebear.com/7.x/bottts/svg?seed=${auth.currentUser.uid}`,
      timestamp: new Date()
    });
  } catch (err) {
    console.error('Failed to send message:', err);
  }
}

function renderAvatarPresets() {
  if (!el.avatarPresetsContainer) return;
  el.avatarPresetsContainer.innerHTML = '';
  
  const uid = auth.currentUser ? auth.currentUser.uid.slice(0,8) : 'berea';
  // Cute avatar styles with different seeds for variety
  const presets = [
    { style: 'open-peeps', seed: uid },
    { style: 'open-peeps', seed: uid + '1' },
    { style: 'open-peeps', seed: uid + '2' },
    { style: 'big-smile', seed: uid },
    { style: 'big-smile', seed: uid + '1' },
    { style: 'big-smile', seed: uid + '2' },
    { style: 'adventurer', seed: uid },
    { style: 'adventurer', seed: uid + '1' },
    { style: 'adventurer', seed: uid + '2' },
    { style: 'fun-emoji', seed: uid },
    { style: 'fun-emoji', seed: uid + '1' },
    { style: 'fun-emoji', seed: uid + '2' },
    { style: 'lorelei', seed: uid },
    { style: 'lorelei', seed: uid + '1' },
    { style: 'lorelei', seed: uid + '2' },
    { style: 'avataaars', seed: uid },
  ];
  
  presets.forEach(({ style, seed }) => {
    const url = `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}`;
    const wrapper = document.createElement('div');
    wrapper.className = 'avatar-preset-wrapper';
    const img = document.createElement('img');
    img.className = 'avatar-preset';
    img.src = url;
    img.alt = style;
    img.loading = 'lazy';
    
    if (userState.photo === url) {
      wrapper.classList.add('selected');
    }
    
    wrapper.addEventListener('click', () => {
      document.querySelectorAll('.avatar-preset-wrapper').forEach(p => p.classList.remove('selected'));
      wrapper.classList.add('selected');
      // Store the selection so save can use it
      wrapper.dataset.selectedUrl = url;
      el.avatarPresetsContainer.dataset.selectedUrl = url;
      // Hide any uploaded photo preview
      const preview = document.getElementById('profile-photo-preview');
      if (preview) preview.classList.add('hidden');
    });
    
    wrapper.appendChild(img);
    el.avatarPresetsContainer.appendChild(wrapper);
  });
}

function setupPhotoUpload() {
  const uploadInput = document.getElementById('profile-photo-upload');
  const preview = document.getElementById('profile-photo-preview');
  if (!uploadInput || !preview) return;
  
  uploadInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      preview.src = ev.target.result;
      preview.classList.remove('hidden');
      // Deselect any avatar preset
      document.querySelectorAll('.avatar-preset-wrapper').forEach(p => p.classList.remove('selected'));
      el.avatarPresetsContainer.dataset.selectedUrl = '';
      // Store data URL for saving
      preview.dataset.dataUrl = ev.target.result;
    };
    reader.readAsDataURL(file);
  });
}

function openProfileDialog() {
  if (!auth.currentUser) return;
  
  el.profileNameInput.value = userState.name || auth.currentUser.displayName || '';
  el.profileEmailInput.value = userState.email || auth.currentUser.email || '';
  el.profileChurchInput.value = userState.church || '';
  el.profileCountrySelect.value = userState.country || '';
  
  // Display current photo if it exists and is a custom upload (data:image)
  const preview = document.getElementById('profile-photo-preview');
  if (preview) {
    if (userState.photo && userState.photo.startsWith('data:image')) {
      preview.src = userState.photo;
      preview.classList.remove('hidden');
      preview.dataset.dataUrl = userState.photo;
    } else {
      preview.classList.add('hidden');
      preview.dataset.dataUrl = '';
    }
  }
  const uploadInput = document.getElementById('profile-photo-upload');
  if (uploadInput) uploadInput.value = '';
  
  renderAvatarPresets();
  el.profileDialog.classList.remove('hidden');
}

async function handleProfileSave(e) {
  e.preventDefault();
  if (!auth.currentUser) return;
  
  const newName = el.profileNameInput.value;
  const newEmail = el.profileEmailInput.value;
  const newChurch = el.profileChurchInput.value;
  const newCountry = el.profileCountrySelect.value;
  
  // Determine photo: uploaded file > selected preset > keep existing
  const preview = document.getElementById('profile-photo-preview');
  const uploadedDataUrl = preview?.dataset.dataUrl;
  const selectedPresetUrl = el.avatarPresetsContainer?.dataset.selectedUrl;
  let newPhoto = userState.photo;
  if (uploadedDataUrl) {
    newPhoto = uploadedDataUrl;
  } else if (selectedPresetUrl) {
    newPhoto = selectedPresetUrl;
  }
  
  userState.name = newName;
  userState.email = newEmail;
  userState.church = newChurch;
  userState.country = newCountry;
  userState.photo = newPhoto;
  
  await saveState();
  updateHeaderProfile();
  el.profileDialog.classList.add('hidden');
  
  await fetchRegisteredUsers();
  updateNetworkView();
}

// ==========================================================================
// Stats
// ==========================================================================
function updateStatsDisplay() {
  el.statsXpVal.textContent = (userState.xp || 0).toLocaleString();
  el.statsCompletedVal.textContent = `${(userState.completedModules || []).length} / ${modules.length}`;
  el.statsStreakVal.textContent = userState.streak || 0;
  const accuracy = userState.quizStats && userState.quizStats.totalQuestions > 0
    ? Math.round((userState.quizStats.correctFirstTry / userState.quizStats.totalQuestions) * 100)
    : 100;
  el.statsAccuracyVal.textContent = `${accuracy}%`;

  // Render module progress list
  const listEl = document.getElementById('stats-modules-list');
  if (listEl) {
    const completedList = userState.completedModules || [];
    listEl.innerHTML = modules.map(m => {
      const done = completedList.includes(m.id);
      const icon = moduleIcons[m.id] || '📖';
      return `
        <div class="stats-module-row ${done ? 'done' : ''}">  
          <span class="stats-module-icon">${icon}</span>
          <span class="stats-module-title">${m.title}</span>
          <span class="stats-module-badge">${done ? '✓ Done' : m.duration}</span>
        </div>
      `;
    }).join('');
  }
}

// ==========================================================================
// Lesson Flow
// ==========================================================================
function startModule(moduleId) {
  activeModule = modules.find(m => m.id === moduleId);
  if (!activeModule) return;

  currentSlideIndex = 0;
  selectedOptionIndex = null;
  isQuizAnswered = false;
  currentQuestionFirstAttempt = true;

  el.courseOnboarding.classList.add('hidden');

  // Hide all nav elements, show lesson
  el.viewHome.classList.add('hidden');
  el.viewCourses.classList.add('hidden');
  el.viewNetwork.classList.add('hidden');
  el.viewStats.classList.add('hidden');
  el.bottomNav.classList.add('hidden');
  el.header.classList.add('hidden');
  el.lessonView.classList.remove('hidden');

  renderSlide();
  el.lessonContentArea.scrollTop = 0;
  window.scrollTo({ top: 0, behavior: 'instant' });
}

function closeLesson() {
  activeModule = null;
  el.lessonView.classList.add('hidden');
  el.lessonView.classList.remove('cardquiz-mode');
  el.bottomNav.classList.remove('hidden');
  el.header.classList.remove('hidden');
  switchTab('courses');
}

// --------------------------------------------------------------------------
// Lesson progress dots
// --------------------------------------------------------------------------
function renderProgressDots() {
  if (!activeModule) return;
  const total = activeModule.slides.length;
  // Show at most 20 dots; if more, just show a thinner line
  const dotsHtml = activeModule.slides.map((_, idx) => {
    let cls = 'progress-dot';
    if (idx < currentSlideIndex) cls += ' done';
    else if (idx === currentSlideIndex) cls += ' current';
    return `<div class="${cls}"></div>`;
  }).join('');

  el.lessonDotsBar.innerHTML = dotsHtml;

  const progressPercent = total > 1
    ? Math.round((currentSlideIndex / (total - 1)) * 100)
    : (currentSlideIndex === 0 ? 0 : 100);
  el.lessonProgressBar.style.width = `${progressPercent}%`;
}

// --------------------------------------------------------------------------
// Slide Renderer
// --------------------------------------------------------------------------
function renderSlide() {
  if (!activeModule) return;

  const slide = activeModule.slides[currentSlideIndex];
  renderProgressDots();

  el.prevSlideBtn.disabled = currentSlideIndex === 0;

  // Scroll content area back to top
  el.lessonContentArea.scrollTop = 0;

  // Configure takeaway banner
  if (slide.type === 'info' && slide.keyTakeaway) {
    el.takeawayIcon.textContent = slide.illustration || '🧠';
    el.takeawayText.textContent = slide.keyTakeaway;
    el.takeawayBanner.className = 'takeaway-banner';
    el.takeawayBanner.classList.remove('hidden');
  } else if (slide.type === 'card-quiz') {
    el.takeawayText.textContent = 'Select an answer for each card';
    el.takeawayIcon.textContent = '❓';
    el.takeawayBanner.className = 'takeaway-banner purple';
    el.takeawayBanner.classList.remove('hidden');
  } else {
    el.takeawayBanner.classList.add('hidden');
  }

  // Card-quiz: full purple lesson screen, hide bottom CONTINUE button (auto-advance handles it)
  if (slide.type === 'card-quiz') {
    el.lessonView.classList.add('cardquiz-mode');
    el.lessonTopbar.style.background = 'var(--brand-purple-bg)';
    el.lessonProgressBar.style.background = 'var(--brand-purple)';
    el.nextSlideBtn.style.display = 'none';
  } else {
    el.lessonView.classList.remove('cardquiz-mode');
    el.lessonTopbar.style.background = '';
    el.lessonProgressBar.style.background = '';
    el.nextSlideBtn.style.display = '';
  }

  // Build slide HTML
  let cardHtml = '';

  if (slide.type === 'info') {
    const trans = userState.translation;
    const scriptureText = slide.scriptureText?.[trans] || slide.scriptureText?.['ESV'] || '';

    // Process content — detect dialogue style
    let bodyHtml = '';
    if (slide.content.includes('Luke:') || slide.content.includes('Ben:')) {
      bodyHtml = slide.content.split('\n\n').map(p => {
        if (p.startsWith('Luke:')) {
          return `<div class="dialogue-block"><div class="dialogue-speaker">Luke (Student)</div>${p.replace('Luke:', '').trim()}</div>`;
        } else if (p.startsWith('Ben:')) {
          return `<div class="dialogue-block"><div class="dialogue-speaker tutor">Ben (Mentor)</div>${p.replace('Ben:', '').trim()}</div>`;
        }
        return `<p>${p.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</p>`;
      }).join('');
    } else {
      bodyHtml = slide.content.split('\n\n').map(p => {
        const lines = p.split('\n');
        let isList = false;
        let isNumbered = false;
        const listItems = [];
        const nonListItems = [];
        
        lines.forEach(line => {
          const trimmed = line.trim();
          const applyInline = t => t
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '<em>$1</em>')
            .replace(/^> (.+)/, '<blockquote>$1</blockquote>');
          if (trimmed.match(/^\d+\.\s/)) {
            isNumbered = true;
            listItems.push(`<li>${applyInline(trimmed.replace(/^\d+\.\s/, ''))}</li>`);
          } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            isList = true;
            listItems.push(`<li>${applyInline(trimmed.substring(2))}</li>`);
          } else if (trimmed.startsWith('> ')) {
            nonListItems.push(`<blockquote>${applyInline(trimmed.substring(2))}</blockquote>`);
          } else {
            nonListItems.push(applyInline(line));
          }
        });
        
        if (isNumbered) {
          return `${nonListItems.length > 0 ? `<p>${nonListItems.join('<br>')}</p>` : ''}<ol>${listItems.join('')}</ol>`;
        } else if (isList) {
          return `${nonListItems.length > 0 ? `<p>${nonListItems.join('<br>')}</p>` : ''}<ul>${listItems.join('')}</ul>`;
        } else {
          return `<p>${lines.map(l => l
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '<em>$1</em>')
            .replace(/^> (.+)/, '<blockquote>$1</blockquote>')
          ).join('<br>')}</p>`;
        }
      }).join('');
    }

    cardHtml = `
      <div class="info-slide">
        <h2 class="slide-title">${slide.title}</h2>
        ${scriptureText ? `
        <div class="scripture-callout">
          <div class="scripture-text">"${scriptureText}"</div>
          <span class="scripture-ref">— ${slide.scripture} (${trans})</span>
        </div>` : ''}
        <div class="slide-body">${bodyHtml}</div>
      </div>
    `;

    el.nextBtnText.textContent = 'CONTINUE';
    el.nextSlideBtn.disabled = false;
    isQuizAnswered = true;

  } else if (slide.type === 'quiz') {
    const optionsHtml = slide.options.map((opt, idx) => {
      const letter = String.fromCharCode(65 + idx);
      return `
        <button class="quiz-option" data-index="${idx}">
          <span class="option-letter">${letter}</span>
          <span class="option-text">${opt}</span>
        </button>
      `;
    }).join('');

    cardHtml = `
      <div class="quiz-slide">
        <p class="quiz-question">${slide.question}</p>
        <div class="quiz-options" id="quiz-options">${optionsHtml}</div>
        <div id="quiz-feedback-box" class="quiz-feedback hidden" style="display:none;">
          <span class="feedback-icon" id="feedback-icon">✓</span>
          <div class="feedback-text">
            <h4 id="feedback-title">Correct!</h4>
            <p id="feedback-desc"></p>
          </div>
        </div>
      </div>
    `;

    selectedOptionIndex = null;
    isQuizAnswered = false;
    currentQuestionFirstAttempt = true;
    el.nextBtnText.textContent = 'SUBMIT';
    el.nextSlideBtn.disabled = true;

  } else if (slide.type === 'card-quiz') {
    cardHtml = `
      <div class="cardquiz-screen">
        <p class="cardquiz-prompt">DO YOU THINK THE FOLLOWING IS TRUE?</p>
        <div class="stack-wrapper">
          <div class="stack-card-shadow-2"></div>
          <div class="stack-card-shadow-1"></div>
          <div class="stack-card-main">${slide.question}</div>
        </div>
        <div class="yes-no-row">
          <button class="yn-btn yes" data-val="yes">yes</button>
          <button class="yn-btn no" data-val="no">no</button>
        </div>
        <div id="quiz-feedback-box" class="cardquiz-feedback hidden" style="display:none;">
          <div class="cardquiz-feedback-title" id="feedback-title">Correct!</div>
          <p id="feedback-desc"></p>
        </div>
      </div>
    `;

    selectedOptionIndex = null;
    isQuizAnswered = false;
    currentQuestionFirstAttempt = true;
    el.nextBtnText.textContent = 'SUBMIT';
    el.nextSlideBtn.disabled = true;

  } else if (slide.type === 'summary') {
    cardHtml = `
      <div class="summary-slide">
        <span class="summary-emoji">${slide.illustration || '🏆'}</span>
        <h2 class="summary-title">${slide.title}</h2>
        <p class="summary-body">${slide.content}</p>
        <div class="xp-badge">⚡ +${activeModule.xpReward} XP Earned</div>
      </div>
    `;
    el.nextBtnText.textContent = 'COMPLETE';
    el.nextSlideBtn.disabled = false;
    isQuizAnswered = true;
  }

  el.activeCard.innerHTML = cardHtml;

  // Wire up interactive elements
  if (slide.type === 'quiz') {
    document.querySelectorAll('.quiz-option').forEach(opt => {
      opt.addEventListener('click', () => selectQuizOption(parseInt(opt.getAttribute('data-index'))));
    });
  } else if (slide.type === 'card-quiz') {
    document.querySelectorAll('.yn-btn').forEach(btn => {
      btn.addEventListener('click', () => selectYesNoOption(btn.getAttribute('data-val')));
    });
  }

  // AI Tutor bar
  if (slide.aiTutorExplanation) {
    el.aiTutorTrigger.classList.remove('hidden');
    if (slide.type === 'card-quiz') {
      el.aiTutorTrigger.classList.add('dark-mode');
    } else {
      el.aiTutorTrigger.classList.remove('dark-mode');
    }
  } else {
    el.aiTutorTrigger.classList.add('hidden');
  }

  el.tutorExplanationText.innerHTML = slide.aiTutorExplanation
    ? `<p>${slide.aiTutorExplanation}</p>`
    : `<p>This slide provides theological and historical context on the scriptures.</p>`;
}

// --------------------------------------------------------------------------
// Quiz interaction
// --------------------------------------------------------------------------
function selectQuizOption(index) {
  if (isQuizAnswered) return;
  selectedOptionIndex = index;
  document.querySelectorAll('.quiz-option').forEach((opt, idx) => {
    opt.classList.toggle('selected', idx === index);
  });
  el.nextSlideBtn.disabled = false;
}

function selectYesNoOption(value) {
  if (isQuizAnswered) return;
  selectedOptionIndex = value;
  const yesBtn = document.querySelector('.yn-btn.yes');
  const noBtn  = document.querySelector('.yn-btn.no');
  if (value === 'yes') { yesBtn.classList.add('selected-yes'); noBtn.classList.remove('selected-no'); }
  else { noBtn.classList.add('selected-no'); yesBtn.classList.remove('selected-yes'); }
  // Immediately check — no SUBMIT step needed
  checkCardQuizAnswer();
}

function checkQuizAnswer() {
  const slide = activeModule.slides[currentSlideIndex];
  const feedbackBox   = document.getElementById('quiz-feedback-box');
  const feedbackTitle = document.getElementById('feedback-title');
  const feedbackDesc  = document.getElementById('feedback-desc');

  const isCorrect = selectedOptionIndex === slide.correctAnswer;

  if (slide.type === 'quiz') {
    const selectedBtn = document.querySelector(`.quiz-option[data-index="${selectedOptionIndex}"]`);

    if (isCorrect) {
      selectedBtn.classList.remove('selected');
      selectedBtn.classList.add('correct');
      feedbackBox.className = 'quiz-feedback correct';
      const feedbackIcon = document.getElementById('feedback-icon');
      if (feedbackIcon) feedbackIcon.textContent = '✓';
      feedbackTitle.textContent = 'Correct!';
      feedbackDesc.textContent  = slide.explanation;
      if (currentQuestionFirstAttempt) userState.quizStats.correctFirstTry += 1;
      userState.quizStats.totalQuestions += 1;
      isQuizAnswered = true;
      recordActivity();
      el.nextBtnText.textContent = 'CONTINUE';
      document.querySelectorAll('.quiz-option').forEach(opt => {
        if (opt !== selectedBtn) opt.style.opacity = '0.45';
        opt.setAttribute('disabled', 'true');
      });
    } else {
      selectedBtn.classList.remove('selected');
      selectedBtn.classList.add('incorrect');
      feedbackBox.className = 'quiz-feedback incorrect';
      const feedbackIcon = document.getElementById('feedback-icon');
      if (feedbackIcon) feedbackIcon.textContent = '✕';
      feedbackTitle.textContent = 'Try Again';
      feedbackDesc.textContent  = 'That option is incorrect. Select a different answer.';
      currentQuestionFirstAttempt = false;
      el.nextSlideBtn.disabled = true;
    }

  }

  feedbackBox.style.display = 'flex';
  feedbackBox.classList.remove('hidden');
}

// Separate handler for card-quiz that auto-advances
function checkCardQuizAnswer() {
  const slide = activeModule.slides[currentSlideIndex];
  const feedbackBox   = document.getElementById('quiz-feedback-box');
  const feedbackTitle = document.getElementById('feedback-title');
  const feedbackDesc  = document.getElementById('feedback-desc');
  const yesBtn = document.querySelector('.yn-btn.yes');
  const noBtn  = document.querySelector('.yn-btn.no');

  const isCorrect = selectedOptionIndex === slide.correctAnswer;

  // Disable buttons immediately
  yesBtn.setAttribute('disabled', 'true');
  noBtn.setAttribute('disabled', 'true');

  feedbackBox.style.display = 'flex';
  feedbackBox.classList.remove('hidden');

  if (isCorrect) {
    if (selectedOptionIndex === 'yes') yesBtn.style.background = 'var(--brand-green)';
    else noBtn.style.background = 'var(--brand-green)';

    feedbackBox.className = 'cardquiz-feedback correct';
    feedbackTitle.textContent = '✓ Correct!';
    feedbackDesc.textContent  = slide.explanation;

    if (currentQuestionFirstAttempt) userState.quizStats.correctFirstTry += 1;
    userState.quizStats.totalQuestions += 1;
    isQuizAnswered = true;
    recordActivity();

    // Auto-advance after 1.6s
    setTimeout(() => {
      if (currentSlideIndex < activeModule.slides.length - 1) {
        currentSlideIndex += 1;
        renderSlide();
      } else {
        completeActiveModule();
      }
    }, 1600);

  } else {
    if (selectedOptionIndex === 'yes') yesBtn.style.background = '#ef4444';
    else noBtn.style.background = '#ef4444';

    feedbackBox.className = 'cardquiz-feedback incorrect';
    feedbackTitle.textContent = '✕ Not quite';
    feedbackDesc.textContent  = 'Try again!';
    currentQuestionFirstAttempt = false;

    // Reset buttons after 1.2s so user can try again
    setTimeout(() => {
      yesBtn.removeAttribute('disabled');
      noBtn.removeAttribute('disabled');
      yesBtn.style.background = '';
      noBtn.style.background = '';
      yesBtn.classList.remove('selected-yes');
      noBtn.classList.remove('selected-no');
      feedbackBox.style.display = 'none';
      feedbackBox.classList.add('hidden');
      selectedOptionIndex = null;
    }, 1200);
  }
}

function handleNextClick() {
  const slide = activeModule.slides[currentSlideIndex];
  if ((slide.type === 'quiz' || slide.type === 'card-quiz') && !isQuizAnswered) {
    checkQuizAnswer();
  } else {
    if (currentSlideIndex < activeModule.slides.length - 1) {
      currentSlideIndex += 1;
      renderSlide();
    } else {
      completeActiveModule();
    }
  }
}

function handlePrevClick() {
  if (currentSlideIndex > 0) {
    currentSlideIndex -= 1;
    renderSlide();
  }
}

function completeActiveModule() {
  if (!userState.completedModules.includes(activeModule.id)) {
    userState.completedModules.push(activeModule.id);
    userState.xp += activeModule.xpReward;
  }
  recordActivity();
  saveState();
  closeLesson();
}

// ==========================================================================
// Auth UI
// ==========================================================================
function showAuthError(msg) {
  el.authError.textContent = msg;
  el.authError.classList.remove('hidden');
}

function clearAuthError() {
  el.authError.textContent = '';
  el.authError.classList.add('hidden');
}

async function handleLoginSubmit(e) {
  e.preventDefault();
  clearAuthError();
  try {
    await signInWithEmailAndPassword(auth, el.loginEmail.value.trim(), el.loginPass.value);
  } catch (err) {
    console.error('Login failed:', err);
    showAuthError('Invalid credentials. Please try again.');
  }
}

async function handleRegisterSubmit(e) {
  e.preventDefault();
  clearAuthError();
  try {
    await createUserWithEmailAndPassword(auth, el.registerEmail.value.trim(), el.registerPass.value);
  } catch (err) {
    console.error('Registration failed:', err);
    showAuthError('Registration failed. Email may already be in use.');
  }
}

async function handleGoogleSignIn() {
  clearAuthError();
  try {
    await signInWithPopup(auth, new GoogleAuthProvider());
  } catch (err) {
    console.error('Google sign-in failed:', err);
    showAuthError('Google Sign-In failed. Please try again.');
  }
}

function switchAuthTab(tab) {
  clearAuthError();
  const isLogin = tab === 'login';
  el.tabLogin.classList.toggle('active', isLogin);
  el.tabRegister.classList.toggle('active', !isLogin);
  el.loginForm.classList.toggle('hidden', !isLogin);
  el.registerForm.classList.toggle('hidden', isLogin);
}

// ==========================================================================
// Event Listeners
// ==========================================================================
function setupEventListeners() {
  // Auth
  el.loginForm.addEventListener('submit', handleLoginSubmit);
  el.registerForm.addEventListener('submit', handleRegisterSubmit);
  el.signoutBtn.addEventListener('click', () => signOut(auth));
  el.googleSignInBtn.addEventListener('click', handleGoogleSignIn);
  el.tabLogin.addEventListener('click', () => switchAuthTab('login'));
  el.tabRegister.addEventListener('click', () => switchAuthTab('register'));

  // Dashboard sub-tabs
  el.subtabStudying.addEventListener('click', () => switchDashboardSubtab('studying'));
  el.subtabCurriculum.addEventListener('click', () => switchDashboardSubtab('curriculum'));

  // Bottom nav
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => switchTab(item.getAttribute('data-tab')));
  });

  // Courses search
  el.courseSearch.addEventListener('input', renderCoursesCatalog);

  // Course onboarding overlay
  el.closeOnboarding.addEventListener('click', () => el.courseOnboarding.classList.add('hidden'));
  el.startOnboardedLesson.addEventListener('click', () => {
    startModule(el.startOnboardedLesson.getAttribute('data-id'));
  });

  // Translation
  el.translationSelect.addEventListener('change', e => {
    userState.translation = e.target.value;
    saveState();
    if (activeModule && activeModule.slides[currentSlideIndex].type === 'info') renderSlide();
  });

  // Profile modal triggers
  if (el.headerProfileTrigger) {
    el.headerProfileTrigger.addEventListener('click', openProfileDialog);
  }
  if (el.closeProfileBtn) {
    el.closeProfileBtn.addEventListener('click', () => el.profileDialog.classList.add('hidden'));
  }
  if (el.profileEditForm) {
    el.profileEditForm.addEventListener('submit', handleProfileSave);
  }
  setupPhotoUpload();

  // Lesson controls
  el.closeLessonBtn.addEventListener('click', closeLesson);
  el.prevSlideBtn.addEventListener('click', handlePrevClick);
  el.nextSlideBtn.addEventListener('click', handleNextClick);

  // AI Tutor
  el.aiTutorTrigger.addEventListener('click', () => el.aiTutorModal.classList.remove('hidden'));
  el.closeTutor.addEventListener('click', () => el.aiTutorModal.classList.add('hidden'));
  el.aiTutorModal.addEventListener('click', e => {
    if (e.target === el.aiTutorModal) el.aiTutorModal.classList.add('hidden');
  });

  // Keyboard shortcut
  window.addEventListener('keydown', e => {
    if (!activeModule) return;
    const slide = activeModule.slides[currentSlideIndex];
    if (e.key === 'Enter') {
      if (slide.type === 'info' || isQuizAnswered || selectedOptionIndex !== null) handleNextClick();
    }
    if (e.key === 'ArrowLeft' && currentSlideIndex > 0) handlePrevClick();
  });
}

// ==========================================================================
// Start
// ==========================================================================
window.addEventListener('DOMContentLoaded', init);
