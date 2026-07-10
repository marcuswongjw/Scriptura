import { concentrations, modules } from './modules.js?v=2.0.11';
import { dailyReadings } from './daily_readings.js?v=2.0.11';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, setPersistence, browserSessionPersistence } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { getFirestore, doc, getDoc, setDoc, collection, getDocs, onSnapshot, addDoc, query, orderBy, limit } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { getMessaging, getToken, onMessage } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging.js';

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
const messaging = getMessaging(app);
const VAPID_KEY = "BO-hBNUqSqDpYLSE8Oz2c0nNKtUDyK27fyzjoTdoiBMLZUGIENy9qcZzegNRFcGE-G_KVPwKC-zcNxnh6dan0xE";


// ==========================================================================
// Utility: HTML sanitization helper
// ==========================================================================
function sanitizeHTML(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ==========================================================================
// Utility: Debounce helper
// ==========================================================================
function debounce(fn, delay = 300) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// ==========================================================================
// Toast Notification System
// ==========================================================================
const toastIcons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };
const toastTitles = { success: 'Success', error: 'Error', warning: 'Warning', info: 'Info' };

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

function showToast(message, type = 'info', duration = 4000) {
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

// ==========================================================================
// Application State
// ==========================================================================
let userState = {
  xp: 0,
  streak: 0,
  longestStreak: 0,
  completedModules: [],
  modulesStarted: [],
  dailyReadingsCompleted: [],
  lastDailyReadingDate: null,
  lastActiveDate: null,
  lastActiveAt: null,
  translation: 'ESV',
  quizStats: { correctFirstTry: 0, totalQuestions: 0 },
  quizHistory: [],
  country: '',
  role: 'user',
  headline: '',
  goals: '',
  interests: '',
  social: '',
  lessonProgress: {},
  timeSpent: 0,
  activityLog: []
};

let sessionStartTime = Date.now();
let swRegistration = null;

let activeModule = null;
let currentSlideIndex = 0;
let cardQuizSubIndex = 0;
let selectedOptionIndex = null;
let isQuizAnswered = false;
let currentQuestionFirstAttempt = true;
let currentTab = 'home';
let catalogFilters = {
  topic: 'all',
  progress: 'all',
  status: 'all'
};
let moduleSchedules = {};
let currentDashboardSubtab = 'studying';

const moduleIcons = {
  'beautiful-book': '📖',
  'genesis-1': '🏛️',
  'genesis-2': '🍎',
  'genesis-3': '🌟',
  'exodus-1': '📜',
  'exodus-2': '⛺',
  'leviticus': '🐂',
  'numbers-1': '📊',
  'numbers-2': '🐍',
  'deuteronomy-1': '📜',
  'deuteronomy-2': '🌅',
  'joshua': '⚔️',
  'judges': '⚖️',
  'ruth': '🌾',
  '1samuel': '👑',
  '2samuel': '🏰',
  '1kings': '👑',
  '2kings': '🏰',
  'joel': '🦗',
  'hosea': '❤️',
  'psalms': '🎵',
  'proverbs': '💡',
  '1chronicles': '📜',
  '2chronicles': '🏰',
  'ezra': '🏛️',
  'nehemiah': '🧱',
  'esther-1': '👑',
  'esther-2': '🍷',
  'job-1': '🌪️',
  'job-2': '🐏',
  'heaven-1': '🌤️',
  'heaven-2': '🌅',
  'heaven-3': '👑',
};

// Shared concentration icons map (used by catalog, onboarding, and stats)
const conIcons = {
  'foundations': '📖',
  'genesis': '🏛️',
  'exodus': '📜',
  'leviticus': '🐂',
  'numbers': '📊',
  'deuteronomy': '🌅',
  'joshua': '⚔️',
  'judges': '⚖️',
  'ruth': '🌾',
  '1samuel': '👑',
  '2samuel': '🏰',
  '1kings': '👑',
  '2kings': '🏰',
  'joel': '🦗',
  'hosea': '❤️',
  'psalms': '🎵',
  'proverbs': '💡',
  '1chronicles': '📜',
  '2chronicles': '🏰',
  'ezra': '🏛️',
  'nehemiah': '🧱',
  'esther': '🍷',
  'job': '🌪️',
  'heaven': '🌤️'
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
  registerName:    document.getElementById('register-name'),
  registerCountry: document.getElementById('register-country'),
  googleSignInBtn: document.getElementById('google-signin-btn'),
  authError:       document.getElementById('auth-error'),

  // Tab Views
  viewHome:     document.getElementById('view-home'),
  viewCourses:  document.getElementById('view-courses'),
  viewNetwork:  document.getElementById('view-network'),
  viewStats:    document.getElementById('view-stats'),
  viewAdmin:    document.getElementById('view-admin'),
  bottomNav:    document.getElementById('bottom-nav'),

  // Dashboard Sub-tabs
  subtabStudying:       document.getElementById('subtab-studying'),
  subtabCurriculum:     document.getElementById('subtab-curriculum'),
  subcontentStudying:   document.getElementById('subcontent-studying'),
  subcontentCurriculum: document.getElementById('subcontent-curriculum'),
  currentStudyContainer: document.getElementById('current-study-container'),
  concentrationGrid:     document.getElementById('concentration-grid'),

  // Courses View (Renovated)
  courseSearch:         document.getElementById('course-search'),
  filtersModal:         document.getElementById('filters-modal'),
  openFiltersModalBtn:  document.getElementById('open-filters-modal-btn'),
  closeFiltersModalBtn: document.getElementById('close-filters-modal'),
  saveFiltersBtn:       document.getElementById('save-filters-btn'),
  activeStatusBadge:    document.getElementById('active-status-badge'),
  catalogGrid:          document.getElementById('catalog-grid'),

  // Course Details
  courseOnboarding:   document.getElementById('course-onboarding'),
  closeOnboarding:    document.getElementById('close-onboarding'),
  onboardTag:         document.getElementById('onboard-tag'),
  onboardTitle:       document.getElementById('onboard-title'),
  onboardDesc:        document.getElementById('onboard-desc'),
  onboardIcon:        document.getElementById('onboard-icon'),
  onboardBulletPoints: document.getElementById('onboard-bullet-points'),
  onboardLessonCount: document.getElementById('onboard-lesson-count'),
  startOnboardedLesson: document.getElementById('start-onboarded-lesson'),

  // Network View
  // Profile Modal (Enriched)
  profileDialog:            document.getElementById('profile-dialog'),
  closeProfileBtn:          document.getElementById('close-profile-btn'),
  profileEditForm:          document.getElementById('profile-edit-form'),
  avatarPresetsContainer:   document.getElementById('avatar-presets-container'),
  profileNameInput:         document.getElementById('profile-name-input'),
  profileEmailInput:        document.getElementById('profile-email-input'),
  profileChurchInput:       document.getElementById('profile-church-input'),
  profileCountrySelect:     document.getElementById('profile-country-select'),
  btnToggleNotifications:   document.getElementById('btn-toggle-notifications'),
  pushStatusText:           document.getElementById('push-status-text'),

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
async function fetchAndMergeCustomModules() {
  try {
    const customCol = collection(db, 'custom_modules');
    const querySnapshot = await getDocs(customCol);
    const customModulesList = [];
    
    querySnapshot.forEach(docSnap => {
      customModulesList.push({
        id: docSnap.id,
        ...docSnap.data()
      });
    });

    if (customModulesList.length > 0) {
      customModulesList.forEach(customMod => {
        if (customMod.deleted) {
          // If soft deleted, remove from global modules list if it exists
          const existingIdx = modules.findIndex(m => m.id === customMod.id);
          if (existingIdx !== -1) {
            modules.splice(existingIdx, 1);
          }
          // Remove from concentrations lists
          concentrations.forEach(con => {
            const idx = con.modules.indexOf(customMod.id);
            if (idx !== -1) con.modules.splice(idx, 1);
          });
          return;
        }

        // Merge into global modules array
        const existingIdx = modules.findIndex(m => m.id === customMod.id);
        if (existingIdx !== -1) {
          modules[existingIdx] = customMod;
        } else {
          modules.push(customMod);
        }

        // Dynamically add to concentrations modules list if parentConcentrationId is specified
        if (customMod.parentConcentrationId) {
          const parentCon = concentrations.find(c => c.id === customMod.parentConcentrationId);
          if (parentCon) {
            if (!parentCon.modules.includes(customMod.id)) {
              parentCon.modules.push(customMod.id);
            }
          }
        }
      });
    }
  } catch (err) {
    console.warn('Failed to load custom modules (using local assets fallback):', err);
  }
}

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
      el.authPortal.classList.add('hidden');

      // Load custom courses first, then module schedules and user data
      await fetchAndMergeCustomModules();
      await loadModuleSchedules();
      await loadUserCloudData(user);
      sessionStartTime = Date.now();
      
      checkAdminNavVisibility();
      updateHeaderProfile();
      updateStreak();
      updateStatsDisplay();
      
      // Update UI displays to reflect custom modules
      renderCoursesCatalog();
      renderDashboard();
      
      routeToPath(window.location.pathname, false);
      initNetworkViewer();
      
      // Sync push token if permission was previously granted
      if (Notification.permission === 'granted') {
        checkAndSyncPushToken();
      }
    } else {
      el.userPill.classList.add('hidden');
      el.authPortal.classList.remove('hidden');
      resetLocalState();
    }
  });
}

function checkAdminNavVisibility() {
  const adminNav = document.getElementById('nav-item-admin');
  if (adminNav) {
    if (userState.role === 'admin') {
      adminNav.classList.remove('hidden');
    } else {
      adminNav.classList.add('hidden');
    }
  }
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

    const localSaved = localStorage.getItem('scriptura_user_state');
    let guestState = null;
    if (localSaved) { try { guestState = JSON.parse(localSaved); } catch(e) {} }

    if (cloudData) {
      userState = {
        xp: 0,
        streak: 0,
        longestStreak: 0,
        completedModules: [],
        modulesStarted: [],
        lastActiveDate: null,
        lastActiveAt: null,
        translation: 'ESV',
        quizStats: { correctFirstTry: 0, totalQuestions: 0 },
        quizHistory: [],
        country: '',
        name: user.displayName || '',
        photo: user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`,
        email: user.email || '',
        church: '',
        role: 'user',
        headline: '',
        goals: '',
        interests: '',
        social: '',
        lessonProgress: {},
        timeSpent: 0,
        activityLog: [],
        ...cloudData
      };
      if (!userState.quizStats) userState.quizStats = { correctFirstTry: 0, totalQuestions: 0 };
      if (!userState.completedModules) userState.completedModules = [];
      if (!userState.modulesStarted) userState.modulesStarted = [];
      if (!userState.dailyReadingsCompleted) userState.dailyReadingsCompleted = [];
      if (!userState.lessonProgress) userState.lessonProgress = {};
      if (!userState.quizHistory) userState.quizHistory = [];
      if (!userState.activityLog) userState.activityLog = [];

      const isMigrated = localStorage.getItem('scriptura_local_migrated') === 'true';
      const cloudHasProgress = (cloudData.xp || 0) > 0 || (cloudData.completedModules || []).length > 0;
      if (guestState && !isMigrated && !cloudHasProgress) {
        let merged = false;
        if (guestState.xp > (userState.xp || 0)) { userState.xp = guestState.xp; merged = true; }
        if (guestState.streak > (userState.streak || 0)) { userState.streak = guestState.streak; merged = true; }
        if (guestState.longestStreak > (userState.longestStreak || 0)) { userState.longestStreak = guestState.longestStreak; merged = true; }
        const cloudCompleted = userState.completedModules || [];
        const guestCompleted = guestState.completedModules || [];
        const mergedCompleted = Array.from(new Set([...cloudCompleted, ...guestCompleted]));
        if (mergedCompleted.length > cloudCompleted.length) { userState.completedModules = mergedCompleted; merged = true; }
        const cloudStarted = userState.modulesStarted || [];
        const guestStarted = guestState.modulesStarted || [];
        const mergedStarted = Array.from(new Set([...cloudStarted, ...guestStarted]));
        if (mergedStarted.length > cloudStarted.length) { userState.modulesStarted = mergedStarted; merged = true; }
        if (guestState.timeSpent > (userState.timeSpent || 0)) { userState.timeSpent = guestState.timeSpent; merged = true; }
        if (merged) await setDoc(userRef, userState);
        localStorage.setItem('scriptura_local_migrated', 'true');
      }
    } else {
      if (guestState) {
        userState = {
          xp: 0,
          streak: 0,
          longestStreak: 0,
          completedModules: [],
          modulesStarted: [],
          lastActiveDate: null,
          lastActiveAt: null,
          translation: 'ESV',
          quizStats: { correctFirstTry: 0, totalQuestions: 0 },
          quizHistory: [],
          country: '',
          name: user.displayName || '',
          photo: user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`,
          email: user.email || '',
          church: '',
          role: 'user',
          headline: '',
          goals: '',
          interests: '',
          social: '',
          lessonProgress: {},
          timeSpent: 0,
          activityLog: [],
          ...guestState,
          // Guest localStorage must never grant admin (rules also require role == 'user' on create).
          role: 'user'
        };
      } else {
        userState = {
          xp: 0,
          streak: 0,
          longestStreak: 0,
          completedModules: [],
          modulesStarted: [],
          lastActiveDate: null,
          lastActiveAt: null,
          translation: 'ESV',
          quizStats: { correctFirstTry: 0, totalQuestions: 0 },
          quizHistory: [],
          country: pendingRegistrationDetails?.country || '',
          name: pendingRegistrationDetails?.name || user.displayName || '',
          photo: user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`,
          email: user.email || '',
          church: '',
          role: 'user',
          headline: '',
          goals: '',
          interests: '',
          social: '',
          lessonProgress: {},
          timeSpent: 0,
          activityLog: []
        };
      }
      await setDoc(userRef, userState);
      localStorage.setItem('scriptura_local_migrated', 'true');
      pendingRegistrationDetails = null;
    }

    if (userState.translation) el.translationSelect.value = userState.translation;
  } catch (err) {
    console.error('Error loading user cloud data:', err);
  }
}

// ==========================================================================
// Utility: Show status helper for publisher form
// ==========================================================================
function showStatus(msg, type) {
  const statusEl = document.getElementById('publisher-status');
  if (!statusEl) return;
  showStatusEl(statusEl, msg, type);
}

function showStatusEl(el, msg, type) {
  if (!el) return;
  el.textContent = msg;
  el.className = 'publisher-status';
  if (type === 'success') {
    el.style.color = 'var(--brand-green)';
  } else if (type === 'error') {
    el.style.color = '#b91c1c';
  } else {
    el.style.color = 'var(--gray-600)';
  }
  el.classList.remove('hidden');
}

function resetLocalState() {
  userState = {
    xp: 0, streak: 0, longestStreak: 0, completedModules: [], modulesStarted: [],
    dailyReadingsCompleted: [], lastDailyReadingDate: null,
    lastActiveDate: null, lastActiveAt: null, translation: 'ESV',
    quizStats: { correctFirstTry: 0, totalQuestions: 0 }, quizHistory: [],
    country: '', name: '', photo: '', email: '', church: '', role: 'user',
    headline: '', goals: '', interests: '', social: '', lessonProgress: {},
    timeSpent: 0, activityLog: []
  };
  localStorage.removeItem('scriptura_local_migrated');
  localStorage.removeItem('scriptura_user_state');
  updateStatsDisplay();
}

// ==========================================================================
// Stats helpers
// ==========================================================================
function awardXP(amount, reason) {
  if (!amount || amount <= 0) return;
  userState.xp = (userState.xp || 0) + amount;
  logActivity('xp_earned', { amount, reason, xp: userState.xp });
}

function logActivity(type, metadata = {}) {
  if (!userState.activityLog) userState.activityLog = [];
  const entry = {
    type,
    timestamp: new Date().toISOString(),
    ...metadata
  };
  userState.activityLog.push(entry);
  if (userState.activityLog.length > 100) {
    userState.activityLog = userState.activityLog.slice(-100);
  }
}

function logQuizAnswer(moduleId, slideIndex, question, selectedAnswer, correctAnswer, isCorrect, isFirstAttempt) {
  if (!userState.quizHistory) userState.quizHistory = [];
  userState.quizHistory.push({
    moduleId,
    slideIndex,
    question: question?.substring(0, 200),
    selectedAnswer,
    correctAnswer,
    isCorrect,
    isFirstAttempt,
    timestamp: new Date().toISOString()
  });
  if (userState.quizHistory.length > 50) {
    userState.quizHistory = userState.quizHistory.slice(-50);
  }
}

function formatDuration(totalSeconds) {
  if (!totalSeconds || totalSeconds <= 0) return '0m';
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

let stateDirty = false;
let stateSaveTimer = null;

async function saveState() {
  // Client-side role clamp: non-admins cannot escalate. Server rules are authoritative.
  if (userState.role !== 'admin') {
    userState.role = 'user';
  }
  localStorage.setItem('scriptura_user_state', JSON.stringify(userState));
  updateStatsDisplay();
  stateDirty = true;
  if (auth.currentUser && !stateSaveTimer) {
    stateSaveTimer = setTimeout(async () => {
      if (stateDirty && auth.currentUser) {
        try {
          const userRef = doc(db, 'users', auth.currentUser.uid);
          // Never write a role change for non-admins (Firestore rules also enforce this).
          if (userState.role !== 'admin') {
            userState.role = 'user';
          }
          await setDoc(userRef, userState);
          stateDirty = false;
        } catch (err) { console.error('Failed to sync progress:', err); }
      }
      stateSaveTimer = null;
    }, 2000);
  }
}

function updateStreak() {
  const todayStr = new Date().toDateString();
  const lastActive = userState.lastActiveDate ? new Date(userState.lastActiveDate) : null;
  if (!lastActive) { userState.streak = 1; return; }
  const lastActiveStr = lastActive.toDateString();
  if (todayStr !== lastActiveStr) {
    const diffDays = Math.ceil(Math.abs(new Date(todayStr) - lastActive) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      userState.streak = (userState.streak || 0) + 1;
    } else {
      userState.streak = 1;
    }
    if ((userState.streak || 0) > (userState.longestStreak || 0)) {
      userState.longestStreak = userState.streak;
    }
  }
}

function recordActivity() {
  const now = new Date();
  const todayStr = now.toDateString();
  const lastActiveStr = userState.lastActiveDate ? new Date(userState.lastActiveDate).toDateString() : null;
  const streakIncremented = todayStr !== lastActiveStr;
  if (streakIncremented) {
    updateStreak();
    userState.lastActiveDate = now.toISOString();
    userState.lastActiveAt = now.toISOString();
    // Award streak maintenance XP once per day.
    awardXP(20, 'daily_streak');
    logActivity('streak_updated', { streak: userState.streak, longestStreak: userState.longestStreak });
    saveState();
  } else {
    userState.lastActiveAt = now.toISOString();
  }
}

// ==========================================================================
// Release Date Checking
// ==========================================================================
function isModuleReleased(moduleId) {
  if (userState.role === 'admin') return true;
  const releaseDateStr = moduleSchedules[moduleId];
  if (!releaseDateStr) return true;
  const releaseDate = new Date(releaseDateStr);
  const now = new Date();
  return now >= releaseDate;
}

async function loadModuleSchedules() {
  try {
    const docRef = doc(db, 'events', 'module_schedules');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      moduleSchedules = docSnap.data();
    } else {
      moduleSchedules = {};
    }
  } catch (err) {
    console.error('Failed to load module schedules:', err);
  }
}

// ==========================================================================
// Tab Router
// ==========================================================================
function switchTab(tabId, pushState = true) {
  currentTab = tabId;
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

function routeToPath(path, pushState = true) {
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
// Daily Reading
// ==========================================================================
function getDayOfYear(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start;
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

function getTodaysReading() {
  if (!dailyReadings || dailyReadings.length === 0) return null;
  const dayOfYear = getDayOfYear();
  const index = (dayOfYear - 1) % dailyReadings.length;
  return dailyReadings[index];
}

function isDailyReadingCompletedToday() {
  const todayStr = new Date().toDateString();
  const lastDate = userState.lastDailyReadingDate ? new Date(userState.lastDailyReadingDate).toDateString() : null;
  return lastDate === todayStr;
}

function renderDailyReading() {
  const container = document.getElementById('daily-reading-container');
  if (!container) return;

  const reading = getTodaysReading();
  if (!reading) {
    container.innerHTML = '';
    return;
  }

  const isCompleted = isDailyReadingCompletedToday();
  const completedCount = (userState.dailyReadingsCompleted || []).length;
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

      userState.lastDailyReadingDate = new Date().toISOString();
      if (!userState.dailyReadingsCompleted.includes(reading.day)) {
        userState.dailyReadingsCompleted.push(reading.day);
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

// ==========================================================================
// Dashboard Tab
// ==========================================================================
function renderDashboard() {
  try {
    renderDailyReading();

    const completedList = (userState && Array.isArray(userState.completedModules))
      ? userState.completedModules.filter(id => modules.some(m => m.id === id))
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
function renderCurriculumGrid() {
  try {
    el.concentrationGrid.innerHTML = '';
    const radius = 28;
    const circ = 2 * Math.PI * radius;
    const completedList = (userState && Array.isArray(userState.completedModules))
      ? userState.completedModules.filter(id => modules.some(m => m.id === id))
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
          catalogFilters.topic = con.group;
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

function updateFilterTagsUI() {
  document.querySelectorAll('.filter-tag-btn').forEach(btn => {
    const fType = btn.getAttribute('data-filter-type');
    const val = btn.getAttribute('data-value');
    if (fType && val) {
      if (catalogFilters[fType] === val) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    }
  });

  const topicLabel = document.getElementById('topic-btn-label');
  if (topicLabel) {
    if (catalogFilters.topic === 'all') {
      topicLabel.textContent = 'Set Filters';
    } else {
      topicLabel.textContent = catalogFilters.topic;
    }
  }

  const statusLabel = document.getElementById('status-btn-label');
  if (statusLabel) {
    if (catalogFilters.status === 'all') {
      statusLabel.textContent = 'Any Status';
    } else {
      statusLabel.textContent = catalogFilters.status.charAt(0).toUpperCase() + catalogFilters.status.slice(1);
    }
  }
}

function renderCoursesCatalog() {
  if (!el.catalogGrid) return;
  el.catalogGrid.innerHTML = '';

  const searchVal = el.courseSearch ? el.courseSearch.value.trim().toLowerCase() : '';
  const filterTopic = catalogFilters.topic;
  const filterProgress = catalogFilters.progress;
  const filterStatus = catalogFilters.status;

  const filteredConcentrations = concentrations.filter(con => {
    // 1. Search text matches title or description of concentration or its child modules
    const conLessons = modules.filter(m => con.modules.includes(m.id));
    const matchesSearch = searchVal === '' ||
      con.title.toLowerCase().includes(searchVal) ||
      con.description.toLowerCase().includes(searchVal) ||
      conLessons.some(m => m.title.toLowerCase().includes(searchVal) || m.description.toLowerCase().includes(searchVal));

    if (!matchesSearch) return false;

    // 2. Topic filter
    if (filterTopic !== 'all' && con.group !== filterTopic) return false;

    // 3. Progress filter
    const total = conLessons.length;
    const completed = conLessons.filter(m => userState.completedModules.includes(m.id)).length;
    const anyStarted = conLessons.some(m => (userState.lessonProgress?.[m.id] || 0) > 0 || userState.completedModules.includes(m.id));
    const isConComplete = completed === total;
    const isConInProgress = !isConComplete && anyStarted;
    const isConNotStarted = !isConComplete && !anyStarted;

    if (filterProgress === 'completed' && !isConComplete) return false;
    if (filterProgress === 'in-progress' && !isConInProgress) return false;
    if (filterProgress === 'not-started' && !isConNotStarted) return false;

    // 4. Status filter (released if at least one lesson is released)
    const isReleased = conLessons.some(m => isModuleReleased(m.id));
    if (filterStatus === 'released' && !isReleased) return false;
    if (filterStatus === 'locked' && isReleased) return false;

    // Safety check for standard users hiding unreleased modules
    if (userState.role !== 'admin' && !isReleased) return false;

    return true;
  });

  const lockedTopics = [
    { title: "Bibliology", description: "The study of the nature, inspiration, authority, and canon of the Holy Scriptures." },
    { title: "Theology", description: "The study of the existence, attributes, and works of God the Father." },
    { title: "Anthropology", description: "The study of humanity, the image of God, the fall, and the nature of sin." },
    { title: "Christology", description: "The study of the person, deity, humanity, and redemptive work of Jesus Christ." },
    { title: "Pneumatology", description: "The study of the person, deity, and ministry of the Holy Spirit." },
    { title: "Ecclesiology", description: "The study of the nature, structure, ordinances, and mission of the Church." }
  ];

  const matchedLockedTopics = [];
  lockedTopics.forEach(lt => {
    const matchesSearch = searchVal === '' ||
      lt.title.toLowerCase().includes(searchVal) ||
      lt.description.toLowerCase().includes(searchVal);
    if (!matchesSearch) return;

    if (filterTopic !== 'all' && filterTopic !== lt.title) return;
    if (filterProgress !== 'all' && filterProgress !== 'not-started') return;
    if (filterStatus !== 'all' && filterStatus !== 'locked') return;

    matchedLockedTopics.push(lt);
  });

  if (filteredConcentrations.length === 0 && matchedLockedTopics.length === 0) {
    el.catalogGrid.innerHTML = `
      <div style="grid-column: 1/-1; padding: 4rem 2rem; color: var(--gray-400); text-align: center; background: #fff; border-radius: var(--r-lg); border: 2px dashed var(--gray-200);">
        <p style="font-size: 1.1rem; font-weight: 500; margin-bottom: 0.5rem;">No courses match your criteria</p>
        <span style="font-size: 0.85rem;">Try adjusting search terms or clearing dynamic filters.</span>
      </div>
    `;
    return;
  }

  // Group concentrations by topic
  const groups = {};
  filteredConcentrations.forEach(con => {
    const tName = con.group || 'Books of the Bible';
    if (!groups[tName]) groups[tName] = [];
    groups[tName].push(con);
  });

  matchedLockedTopics.forEach(lt => {
    const tName = lt.title;
    if (!groups[tName]) groups[tName] = [];
    groups[tName].push({ isLockedTopic: true, title: lt.title, description: lt.description });
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
    const gridId = `catalog-grid-${gName.replace(/\s+/g, '-').toLowerCase()}`;
    el.catalogGrid.insertAdjacentHTML('beforeend', `
      <div class="catalog-topic-group-container">
        <h2 class="catalog-topic-header">${gName}</h2>
        <div id="${gridId}" class="catalog-grid-layout"></div>
      </div>
    `);

    const subGrid = document.getElementById(gridId);
    if (!subGrid) return;

    groups[gName].forEach(item => {
      if (item.isLockedTopic) {
        const cardHtml = `
          <div class="premium-course-card locked-card" style="opacity: 0.6; pointer-events: none;">
            <div class="course-card-circle-icon">🔒</div>
            <div class="course-card-details">
              <h3 class="course-card-title">${item.title}</h3>
              <p class="course-card-desc">${item.description}</p>
              <span class="course-card-progress-text incomplete">LOCKED</span>
              <span class="course-card-tag-label">${item.title.toUpperCase()}</span>
            </div>
          </div>
        `;
        subGrid.insertAdjacentHTML('beforeend', cardHtml);
      } else {
        const con = item;
        const conLessons = modules.filter(m => con.modules.includes(m.id));
        const total = conLessons.length;
        const completed = conLessons.filter(m => userState.completedModules.includes(m.id)).length;
        const isComplete = completed === total;

        const icon = conIcons[con.id] || '📖';
        const isReleased = conLessons.some(m => isModuleReleased(m.id));

        let progressText = '';
        let progressClass = 'incomplete';
        if (isComplete) {
          progressText = `✓ ${completed} OF ${total} LESSONS COMPLETED`;
          progressClass = 'completed';
        } else {
          progressText = `${completed} OF ${total} LESSONS COMPLETED`;
          progressClass = 'incomplete';
        }

        const cardHtml = `
          <div class="premium-course-card ${!isReleased ? 'locked-card' : ''}" data-con-id="${con.id}">
            <div class="course-card-circle-icon">${isReleased ? icon : '🔒'}</div>
            <div class="course-card-details">
              <h3 class="course-card-title">${con.title}</h3>
              <p class="course-card-desc">${con.description}</p>
              <span class="course-card-progress-text ${progressClass}">${progressText}</span>
              <span class="course-card-tag-label">${con.group.toUpperCase()}</span>
            </div>
          </div>
        `;
        subGrid.insertAdjacentHTML('beforeend', cardHtml);
      }
    });
  });

  el.catalogGrid.querySelectorAll('.premium-course-card').forEach(card => {
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.click(); } });
    card.addEventListener('click', () => {
      const conId = card.getAttribute('data-con-id');
      if (conId) openOnboarding(conId);
    });
  });
}

function openOnboarding(concentrationId, pushState = true) {
  let con = concentrations.find(c => c.id === concentrationId);
  if (!con) {
    const parentCon = concentrations.find(c => c.modules.includes(concentrationId));
    if (parentCon) {
      con = parentCon;
      concentrationId = parentCon.id;
    }
  }
  if (!con) return;

  const conLessons = modules.filter(m => con.modules.includes(m.id));
  if (conLessons.length === 0) return;

  const releasedLessons = conLessons.filter(l => isModuleReleased(l.id));
  if (releasedLessons.length === 0) {
    showToast('This course is not yet released!', 'warning');
    switchTab('courses');
    return;
  }

  const icon = conIcons[con.id] || '📖';
  el.onboardIcon.textContent = icon;
  el.onboardTag.textContent = con.group.toUpperCase();
  el.onboardTitle.textContent = con.title;
  el.onboardDesc.textContent = con.description;

  // Find next up lesson (first uncompleted lesson)
  let nextUpLesson = conLessons.find(l => !userState.completedModules.includes(l.id));
  let isAllComplete = false;
  if (!nextUpLesson) {
    nextUpLesson = conLessons[0];
    isAllComplete = true;
  }

  const nextUpIndex = con.modules.indexOf(nextUpLesson.id) + 1;
  const nextUpEyebrow = document.getElementById('onboard-next-up-eyebrow');
  const nextUpTitle = document.getElementById('onboard-next-up-title');
  
  if (nextUpEyebrow) {
    nextUpEyebrow.textContent = `LESSON ${nextUpIndex}`;
  }
  if (nextUpTitle) {
    nextUpTitle.textContent = isAllComplete ? `ALL LESSONS COMPLETED` : `NEXT UP: ${nextUpLesson.title}`;
  }

  el.startOnboardedLesson.setAttribute('data-id', nextUpLesson.id);
  el.startOnboardedLesson.textContent = isAllComplete ? 'REVIEW COURSE' : 'RESUME';

  const completedCount = conLessons.filter(l => userState.completedModules.includes(l.id)).length;
  el.onboardLessonCount.textContent = `${completedCount} OF ${conLessons.length} LESSONS COMPLETED`;

  const chapterLabel = document.getElementById('onboard-chapter-label');
  if (chapterLabel) {
    chapterLabel.textContent = `LESSONS`;
  }

  el.onboardBulletPoints.innerHTML = '';
  conLessons.forEach((lesson, idx) => {
    const isLCompleted = userState.completedModules.includes(lesson.id);
    const progressVal = userState.lessonProgress?.[lesson.id] || 0;
    const isLInProgress = !isLCompleted && progressVal > 0;

    let statusClass = 'not-started';
    let statusText = '›';
    if (isLCompleted) {
      statusClass = 'completed';
      statusText = '✓';
    } else if (isLInProgress) {
      statusClass = 'in-progress';
      statusText = '›';
    }

    const lessonItemHtml = `
      <div class="onboard-lesson-row-item" data-lesson-id="${lesson.id}">
        <div class="onboard-lesson-item-text">
          <div class="onboard-lesson-row-eyebrow">LESSON ${idx + 1}</div>
          <div class="onboard-lesson-row-title">${lesson.title}</div>
        </div>
        <div class="onboard-lesson-status-strip ${statusClass}">${statusText}</div>
      </div>
    `;
    el.onboardBulletPoints.insertAdjacentHTML('beforeend', lessonItemHtml);
  });

  el.onboardBulletPoints.querySelectorAll('.onboard-lesson-row-item').forEach(item => {
    item.setAttribute('role', 'button');
    item.setAttribute('tabindex', '0');
    item.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); item.click(); } });
    item.addEventListener('click', () => {
      const lid = item.getAttribute('data-lesson-id');
      if (lid) startModule(lid);
    });
  });

  el.courseOnboarding.classList.remove('hidden');

  if (pushState) {
    history.pushState({ concentrationId }, '', `/courses/${concentrationId}`);
  }
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

let networkListenersAttached = false;

async function initNetworkViewer() {
  if (!networkListenersAttached) {
    // Use event delegation for network nav items so re-renders never duplicate listeners.
    document.querySelector('.network-sidebar')?.addEventListener('click', e => {
      const item = e.target.closest('.net-nav-item');
      if (item) switchNetworkTab(item.getAttribute('data-net-tab'));
    });

    if (el.peopleSearch) {
      el.peopleSearch.addEventListener('input', debounce(renderPeopleDirectory, 250));
    }

    if (el.createEventBtn) {
      el.createEventBtn.addEventListener('click', () => el.eventDialog.classList.remove('hidden'));
    }

    if (el.closeEventBtn) {
      el.closeEventBtn.addEventListener('click', () => el.eventDialog.classList.add('hidden'));
    }

    if (el.eventCreateForm) {
      el.eventCreateForm.addEventListener('submit', handleCreateEvent);
    }

    if (el.chatInputForm) {
      el.chatInputForm.addEventListener('submit', handleSendChatMessage);
    }

    networkListenersAttached = true;
  }

  await fetchRegisteredUsers();
  updateNetworkView();
  switchNetworkTab('map');
}

async function fetchRegisteredUsers() {
  try {
    const querySnapshot = await getDocs(query(collection(db, 'users'), limit(100)));
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
    const isUserCountry = countryCode === userState.country;
    
    const r = 12 + Math.min(count, 10) * 2;
    
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', `map-cluster ${isUserCountry ? 'active' : ''}`);
    g.setAttribute('data-country', countryCode);
    
    // Pulsing circle backdrop
    const pulse = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    pulse.setAttribute('cx', meta.cx);
    pulse.setAttribute('cy', meta.cy);
    pulse.setAttribute('r', r);
    pulse.setAttribute('class', `map-cluster-pulse ${isUserCountry ? 'active-user' : ''}`);
    
    // Main interactive circle
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', meta.cx);
    circle.setAttribute('cy', meta.cy);
    circle.setAttribute('r', r);
    circle.setAttribute('class', `map-cluster-circle ${isUserCountry ? 'active-user' : ''}`);
    
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', meta.cx);
    text.setAttribute('y', meta.cy);
    text.setAttribute('dy', '4');
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('class', 'map-cluster-text');
    text.textContent = count;
    
    g.appendChild(pulse);
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
    item.setAttribute('role', 'button');
    item.setAttribute('tabindex', '0');
    item.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); item.click(); } });
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
  const navItems = document.querySelectorAll('.net-nav-item');
  const subviews = document.querySelectorAll('.net-subview');

  navItems.forEach(item => {
    item.classList.toggle('active', item.getAttribute('data-net-tab') === tabId);
  });
  subviews.forEach(view => {
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

// Render Enriched People Profiles in Directory
function renderPeopleDirectory() {
  if (!el.peopleGrid) return;
  el.peopleGrid.innerHTML = '';
  
  const searchQuery = el.peopleSearch ? el.peopleSearch.value.toLowerCase().trim() : '';
  
  const filtered = registeredUsers.filter(u => {
    const countryMeta = countryMetadata[u.country] || { name: '' };
    const matchesSearch = !searchQuery || 
      (u.name && u.name.toLowerCase().includes(searchQuery)) ||
      (u.church && u.church.toLowerCase().includes(searchQuery)) ||
      (u.headline && u.headline.toLowerCase().includes(searchQuery)) ||
      (countryMeta.name && countryMeta.name.toLowerCase().includes(searchQuery));
      
    return matchesSearch;
  });
  
  if (filtered.length === 0) {
    el.peopleGrid.innerHTML = `<div style="grid-column: 1/-1; padding: 3rem 1.5rem; color: var(--gray-400); text-align: center; background:#fff; border-radius:var(--r-lg);">No learners found matching filters.</div>`;
    return;
  }
  
  filtered.forEach(u => {
    const avatarUrl = u.photo || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.uid}`;
    const countryMeta = countryMetadata[u.country] || { name: 'Unknown', flag: '🌍' };
    const modCount = u.completedModules
      ? u.completedModules.filter(id => modules.some(m => m.id === id)).length
      : 0;
    
    // Process Interests
    const interestPills = (u.interests || '')
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)
      .map(tag => `<span class="interest-pill">${sanitizeHTML(tag)}</span>`)
      .join('');

    const socialLinkHtml = u.social ? `
      <a href="${u.social}" target="_blank" rel="noopener noreferrer" class="card-social-link">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
        <span>Contact</span>
      </a>
    ` : '';

    const html = `
      <div class="user-card premium-user-card">
        <div class="user-card-header">
          <img class="card-avatar" src="${avatarUrl}" alt="${u.name || 'Learner'}">
          <div class="header-text-block">
            <div class="card-name">${sanitizeHTML(u.name) || 'Anonymous Learner'}</div>
            <div class="card-headline">${sanitizeHTML(u.headline) || 'Scriptura Learner'}</div>
          </div>
        </div>
        <div class="card-body-section">
          <div class="card-church">⛪ ${sanitizeHTML(u.church) || 'Independent Fellowship'}</div>
          <span class="card-country-tag">${countryMeta.flag} ${countryMeta.name}</span>
          ${u.goals ? `<div class="card-goals"><strong>Goal:</strong> ${sanitizeHTML(u.goals)}</div>` : ''}
          ${interestPills ? `<div class="card-interests-wrapper">${interestPills}</div>` : ''}
        </div>
        <div class="card-footer-section">
          <div class="card-meta-row">
            <span class="card-badge">🔥 ${u.streak || 0}d streak</span>
            <span class="card-badge">📖 ${modCount} modules</span>
          </div>
          ${socialLinkHtml}
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
        showToast('You have successfully RSVPed to this study event! Check back closer to the time.', 'success');
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
      hostName: userState.name || auth.currentUser.displayName || 'Scriptura Learner',
      hostPhoto: userState.photo || `https://api.dicebear.com/7.x/bottts/svg?seed=${auth.currentUser.uid}`
    });
    
    el.eventCreateForm.reset();
    el.eventDialog.classList.add('hidden');
  } catch (err) {
    console.error('Failed to create event:', err);
    showToast('Failed to schedule event. Please try again.', 'error');
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
            <div class="chat-msg-bubble">${sanitizeHTML(msg.text)}</div>
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
      senderName: userState.name || auth.currentUser.displayName || 'Scriptura Learner',
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
  
  const uid = auth.currentUser ? auth.currentUser.uid.slice(0,8) : 'scriptura';
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
      wrapper.dataset.selectedUrl = url;
      el.avatarPresetsContainer.dataset.selectedUrl = url;
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
      document.querySelectorAll('.avatar-preset-wrapper').forEach(p => p.classList.remove('selected'));
      el.avatarPresetsContainer.dataset.selectedUrl = '';
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
  
  // Enriched fields
  document.getElementById('profile-headline-input').value = userState.headline || '';
  document.getElementById('profile-goals-input').value = userState.goals || '';
  document.getElementById('profile-interests-input').value = userState.interests || '';
  document.getElementById('profile-social-input').value = userState.social || '';
  const roleSelect = document.getElementById('profile-role-select');
  if (roleSelect) {
    roleSelect.value = userState.role || 'user';
    // Only allow admins to see/change role in the profile dialog.
    // Real authorization must still be enforced in Firestore rules.
    if (userState.role !== 'admin') {
      roleSelect.disabled = true;
      roleSelect.closest('.form-field')?.classList.add('hidden');
    } else {
      roleSelect.disabled = false;
      roleSelect.closest('.form-field')?.classList.remove('hidden');
    }
  }
  
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
  
  const newHeadline = document.getElementById('profile-headline-input').value;
  const newGoals = document.getElementById('profile-goals-input').value;
  const newInterests = document.getElementById('profile-interests-input').value;
  const newSocial = document.getElementById('profile-social-input').value;
  const roleSelect = document.getElementById('profile-role-select');
  const newRole = roleSelect?.value || userState.role || 'user';
  
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
  
  userState.headline = newHeadline;
  userState.goals = newGoals;
  userState.interests = newInterests;
  userState.social = newSocial;
  // Prevent non-admin users from escalating their own role.
  // Admins may change their own role; Firestore rules are the real guard.
  if (userState.role === 'admin') {
    userState.role = (newRole === 'admin' || newRole === 'user') ? newRole : 'admin';
  } else {
    userState.role = 'user';
  }
  
  await saveState();
  updateHeaderProfile();
  checkAdminNavVisibility();
  el.profileDialog.classList.add('hidden');
  
  await fetchRegisteredUsers();
  updateNetworkView();
}

// ==========================================================================
// Admin Dashboard
// ==========================================================================

function handleTemplateToggle(e) {
  const templateBox = document.getElementById('publisher-template-box');
  if (!templateBox) return;
  templateBox.classList.toggle('hidden');
  e.target.textContent = templateBox.classList.contains('hidden') ? 'Show Schema Template' : 'Hide Schema Template';
}

function handlePublisherFileInput(e) {
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

function handlePublisherSubmit(e) {
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

async function computeAdminStats() {
  // Compute aggregate stats from the fetched registered users and write them
  // to a central `stats/aggregated` document so future dashboard loads are fast.
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const totalUsers = registeredUsers.length;
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

  registeredUsers.forEach(u => {
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

async function loadAdminStats() {
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

async function renderAdminDashboard() {
  if (userState.role !== 'admin') {
    switchTab('home');
    return;
  }

  await fetchRegisteredUsers();
  await loadModuleSchedules();

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
    engagementPanel.style.gridColumn = '1 / -1';
    document.querySelector('.admin-grid-layout')?.appendChild(engagementPanel);
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
    registeredUsers.forEach(u => {
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
        if (userState.role !== 'admin') {
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
            userState.role = newRole;
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
        const learner = registeredUsers.find(u => u.uid === uid);
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
      const releaseDate = moduleSchedules[m.id] || '';
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
let editorSlides = [];

function openVisualEditor(moduleId) {
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
  editorSlides = JSON.parse(JSON.stringify(mod.slides || []));
  renderEditorSlides();

  // Load backups list from Firestore
  loadModuleRevisionHistory(mod.id);

  // Show dialog
  document.getElementById('visual-editor-dialog').classList.remove('hidden');
}

function renderEditorSlides() {
  const container = document.getElementById('editor-slides-container');
  if (!container) return;
  container.innerHTML = '';

  if (editorSlides.length === 0) {
    container.innerHTML = `<div style="text-align: center; color: var(--gray-400); font-size: 0.85rem; padding: 1rem; border: 1px dashed var(--gray-200); border-radius: var(--r-md);">No slides added yet. Click "+ Add Slide" to start.</div>`;
    return;
  }

  editorSlides.forEach((slide, idx) => {
    const slideId = `editor-slide-${idx}`;
    const slideCard = document.createElement('div');
    slideCard.className = 'admin-panel-card';
    slideCard.style.padding = '1rem';
    slideCard.style.background = '#f8fafc';
    slideCard.style.border = '1px solid var(--gray-250)';
    slideCard.style.borderRadius = 'var(--r-md)';

    let typeFieldsHtml = '';
    if (slide.type === 'info') {
      typeFieldsHtml = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-top: 0.5rem;">
          <div class="form-field">
            <label style="font-size:0.75rem;">Illustration (Emoji)</label>
            <input type="text" class="slide-illustration" value="${slide.illustration || '📖'}" style="padding: 0.4rem;">
          </div>
          <div class="form-field">
            <label style="font-size:0.75rem;">Key Takeaway</label>
            <input type="text" class="slide-takeaway" value="${slide.keyTakeaway || ''}" style="padding: 0.4rem;">
          </div>
        </div>
        <div class="form-field" style="margin-top: 0.5rem;">
          <label style="font-size:0.75rem;">Content Text (Supports Markdown **bold** & newlines)</label>
          <textarea class="slide-content" rows="3" style="padding: 0.4rem; font-size: 0.82rem;">${slide.content || ''}</textarea>
        </div>
      `;
    } else if (slide.type === 'card-quiz') {
      typeFieldsHtml = `
        <div class="form-field" style="margin-top: 0.5rem;">
          <label style="font-size:0.75rem;">Quiz Question</label>
          <input type="text" class="slide-question" value="${slide.question || ''}" style="padding: 0.4rem;">
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-top: 0.5rem;">
          <div class="form-field">
            <label style="font-size:0.75rem;">Correct Answer Option</label>
            <select class="slide-correct-answer" style="padding: 0.4rem; background:#fff; border: 1px solid var(--gray-250); border-radius: var(--r-md);">
              <option value="yes" ${slide.correctAnswer === 'yes' ? 'selected' : ''}>Yes</option>
              <option value="no" ${slide.correctAnswer === 'no' ? 'selected' : ''}>No</option>
            </select>
          </div>
          <div class="form-field">
            <label style="font-size:0.75rem;">Explanation Text</label>
            <input type="text" class="slide-explanation" value="${slide.explanation || ''}" style="padding: 0.4rem;">
          </div>
        </div>
      `;
    } else if (slide.type === 'summary') {
      typeFieldsHtml = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-top: 0.5rem;">
          <div class="form-field">
            <label style="font-size:0.75rem;">Illustration (Emoji)</label>
            <input type="text" class="slide-illustration" value="${slide.illustration || '🏆'}" style="padding: 0.4rem;">
          </div>
        </div>
        <div class="form-field" style="margin-top: 0.5rem;">
          <label style="font-size:0.75rem;">Summary content text</label>
          <textarea class="slide-content" rows="2" style="padding: 0.4rem; font-size: 0.82rem;">${slide.content || ''}</textarea>
        </div>
      `;
    }

    slideCard.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
        <span style="font-weight: 700; font-size: 0.85rem; color: var(--gray-700);">Slide #${idx + 1}</span>
        <div style="display: flex; gap: 0.5rem; align-items: center;">
          <select class="slide-type-select" style="padding: 0.25rem 0.5rem; font-size: 0.78rem; border-radius: var(--r-md); border: 1px solid var(--gray-250); background:#fff;">
            <option value="info" ${slide.type === 'info' ? 'selected' : ''}>Info</option>
            <option value="card-quiz" ${slide.type === 'card-quiz' ? 'selected' : ''}>Card Quiz</option>
            <option value="summary" ${slide.type === 'summary' ? 'selected' : ''}>Summary</option>
          </select>
          <button type="button" class="secondary-btn slide-remove-btn" style="padding: 0.25rem 0.5rem; font-size: 0.75rem; color: #b91c1c; border: 1px solid #fee2e2; background: #fef2f2;">Remove</button>
        </div>
      </div>
      <div class="form-field">
        <label style="font-size:0.75rem;">Slide Title</label>
        <input type="text" class="slide-title" value="${slide.title || ''}" style="padding: 0.4rem; font-size: 0.85rem;">
      </div>
      ${typeFieldsHtml}
      <div class="form-field" style="margin-top: 0.5rem;">
        <label style="font-size:0.75rem;">AI Tutor Deep Explanation</label>
        <textarea class="slide-aiTutor" rows="2" style="padding: 0.4rem; font-size: 0.82rem;">${slide.aiTutorExplanation || ''}</textarea>
      </div>
    `;

    // Bind inputs to state on changes
    slideCard.querySelector('.slide-type-select').addEventListener('change', (e) => {
      editorSlides[idx].type = e.target.value;
      renderEditorSlides();
    });
    slideCard.querySelector('.slide-remove-btn').addEventListener('click', () => {
      editorSlides.splice(idx, 1);
      renderEditorSlides();
    });

    // Save text state synchronously on inputs
    slideCard.querySelectorAll('input, textarea, select').forEach(input => {
      input.addEventListener('input', () => {
        if (input.classList.contains('slide-title')) editorSlides[idx].title = input.value;
        if (input.classList.contains('slide-illustration')) editorSlides[idx].illustration = input.value;
        if (input.classList.contains('slide-takeaway')) editorSlides[idx].keyTakeaway = input.value;
        if (input.classList.contains('slide-content')) editorSlides[idx].content = input.value;
        if (input.classList.contains('slide-question')) editorSlides[idx].question = input.value;
        if (input.classList.contains('slide-correct-answer')) editorSlides[idx].correctAnswer = input.value;
        if (input.classList.contains('slide-explanation')) editorSlides[idx].explanation = input.value;
        if (input.classList.contains('slide-aiTutor')) editorSlides[idx].aiTutorExplanation = input.value;
      });
    });

    container.appendChild(slideCard);
  });
}

async function loadModuleRevisionHistory(moduleId) {
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
          editorSlides = JSON.parse(JSON.stringify(backup.moduleData.slides || []));
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

async function deleteModuleAction(moduleId) {
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

// Wire Visual Editor Close/Submit Buttons inside window initialization
window.addEventListener('DOMContentLoaded', () => {
  const closeBtn = document.getElementById('close-visual-editor-btn');
  const cancelBtn = document.getElementById('editor-cancel-btn');
  const dialog = document.getElementById('visual-editor-dialog');
  const form = document.getElementById('visual-editor-form');
  const addSlideBtn = document.getElementById('editor-add-slide-btn');

  if (closeBtn) closeBtn.addEventListener('click', () => dialog.classList.add('hidden'));
  if (cancelBtn) cancelBtn.addEventListener('click', () => dialog.classList.add('hidden'));

  if (addSlideBtn) {
    addSlideBtn.addEventListener('click', () => {
      editorSlides.push({
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

      if (editorSlides.length === 0) {
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
        slides: editorSlides
      };

      try {
        // Save current to custom_modules
        const docRef = doc(db, 'custom_modules', moduleId);
        await setDoc(docRef, updatedModule);

        // Record backup snapshot log
        const backupRef = collection(db, 'custom_modules_backups');
        await addDoc(backupRef, {
          moduleId,
          timestamp: new Date().toISOString(),
          editorEmail: auth.currentUser?.email || 'admin',
          moduleData: updatedModule
        });

        showToast(`Module "${title}" updated and revision backup created!`, 'success');
        dialog.classList.add('hidden');

        // Reload lists & dashboard
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
});

// ==========================================================================
// Stats
// ==========================================================================
function updateStatsDisplay() {
  const completedList = (userState.completedModules || []).filter(id => modules.some(m => m.id === id));

  const releasedCons = concentrations.filter(c => c.modules.some(mid => isModuleReleased(mid)));
  const completedCons = releasedCons.filter(c => c.modules.every(mid => completedList.includes(mid)));
  el.statsCompletedVal.textContent = `${completedCons.length} / ${releasedCons.length}`;

  el.statsStreakVal.textContent = userState.streak || 0;
  const accuracy = userState.quizStats && userState.quizStats.totalQuestions > 0
    ? Math.round((userState.quizStats.correctFirstTry / userState.quizStats.totalQuestions) * 100)
    : 100;
  if (el.statsAccuracyVal) {
    el.statsAccuracyVal.textContent = `${accuracy}%`;
  }

  // Render additional stat cards (XP, longest streak, time spent).
  const statsGrid = document.querySelector('.stats-grid');
  if (statsGrid) {
    const extraCards = [
      { icon: '✨', value: userState.xp || 0, label: 'Total XP' },
      { icon: '🔥', value: userState.longestStreak || 0, label: 'Longest Streak' },
      { icon: '⏱️', value: formatDuration(userState.timeSpent || 0), label: 'Time Studied' }
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

// ==========================================================================
// Lesson Flow
// ==========================================================================
function startModule(moduleId, pushState = true) {
  if (!isModuleReleased(moduleId)) {
    showToast('This course is not yet released!', 'warning');
    switchTab('courses');
    return;
  }

  activeModule = modules.find(m => m.id === moduleId);
  if (!activeModule) return;

  currentSlideIndex = 0;
  cardQuizSubIndex = 0;
  selectedOptionIndex = null;
  isQuizAnswered = false;
  currentQuestionFirstAttempt = true;

  // Track module start for stats.
  if (!userState.modulesStarted.includes(moduleId)) {
    userState.modulesStarted.push(moduleId);
    logActivity('module_started', { moduleId, moduleTitle: activeModule.title });
    saveState();
  }

  el.courseOnboarding.classList.add('hidden');

  el.viewHome.classList.add('hidden');
  el.viewCourses.classList.add('hidden');
  el.viewNetwork.classList.add('hidden');
  el.viewStats.classList.add('hidden');
  if (el.viewAdmin) el.viewAdmin.classList.add('hidden');
  el.bottomNav.classList.add('hidden');
  el.header.classList.add('hidden');
  el.lessonView.classList.remove('hidden');

  renderSlide();
  el.lessonContentArea.scrollTop = 0;
  window.scrollTo({ top: 0, behavior: 'instant' });

  if (pushState) {
    history.pushState({ moduleId, type: 'learn' }, '', `/learn/${moduleId}`);
  }
}

function closeLesson(pushState = true) {
  activeModule = null;
  el.lessonView.classList.add('hidden');
  el.lessonView.classList.remove('cardquiz-mode');
  el.bottomNav.classList.remove('hidden');
  el.header.classList.remove('hidden');
  switchTab('courses', pushState);
}

function renderProgressDots() {
  if (!activeModule) return;
  const total = activeModule.slides.length;

  const createDot = (idx) => {
    let cls = 'progress-dot';
    if (total > 10) cls += ' small';
    if (idx < currentSlideIndex) cls += ' done';
    else if (idx === currentSlideIndex) cls += ' current';
    return `<div class="${cls}"></div>`;
  };

  let dotsHtml = '';
  if (total <= 10) {
    el.lessonDotsBar.classList.remove('two-rows');
    dotsHtml = activeModule.slides.map((_, idx) => createDot(idx)).join('');
  } else {
    el.lessonDotsBar.classList.add('two-rows');
    const half = Math.ceil(total / 2);
    const row1 = activeModule.slides.slice(0, half).map((_, idx) => createDot(idx)).join('');
    const row2 = activeModule.slides.slice(half).map((_, idx) => createDot(half + idx)).join('');
    dotsHtml = `<div class="dots-row">${row1}</div><div class="dots-row staggered">${row2}</div>`;
  }

  el.lessonDotsBar.innerHTML = dotsHtml;

  const progressPercent = total > 1
    ? Math.round((currentSlideIndex / (total - 1)) * 100)
    : (currentSlideIndex === 0 ? 0 : 100);
  el.lessonProgressBar.style.width = `${progressPercent}%`;
}

function formatMarkdown(content) {
  if (!content) return '';
  return content.split('\n\n').map(p => {
    const lines = p.split('\n');
    let isList = false;
    let isNumbered = false;
    const listItems = [];
    const nonListItems = [];
    
    const applyInline = t => t
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Replace single asterisks that are not part of a ** pair.
      .replace(/(^|[^*])\*([^*\n]+)\*([^*]|$)/g, '$1<em>$2</em>$3')
      .replace(/^###\s*(.+)/, '<h3>$1</h3>')
      .replace(/^##\s*(.+)/, '<h2>$1</h2>')
      .replace(/^#\s*(.+)/, '<h1>$1</h1>')
      .replace(/^> (.+)/, '<blockquote>$1</blockquote>');

    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.match(/^\d+\.\s/)) {
        isNumbered = true;
        listItems.push(`<li>${applyInline(trimmed.replace(/^\d+\.\s/, ''))}</li>`);
      } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        isList = true;
        listItems.push(`<li>${applyInline(trimmed.substring(2))}</li>`);
      } else if (trimmed.startsWith('> ')) {
        nonListItems.push(`<blockquote>${applyInline(trimmed.substring(2))}</blockquote>`);
      } else if (trimmed.startsWith('### ')) {
        nonListItems.push(`<h3>${applyInline(trimmed.substring(4))}</h3>`);
      } else if (trimmed.startsWith('## ')) {
        nonListItems.push(`<h2>${applyInline(trimmed.substring(3))}</h2>`);
      } else if (trimmed.startsWith('# ')) {
        nonListItems.push(`<h1>${applyInline(trimmed.substring(2))}</h1>`);
      } else {
        nonListItems.push(applyInline(line));
      }
    });
    
    if (isNumbered) {
      return `${nonListItems.length > 0 ? `<p>${nonListItems.join('<br>')}</p>` : ''}<ol>${listItems.join('')}</ol>`;
    } else if (isList) {
      return `${nonListItems.length > 0 ? `<p>${nonListItems.join('<br>')}</p>` : ''}<ul>${listItems.join('')}</ul>`;
    } else {
      return `<p>${nonListItems.join('<br>')}</p>`;
    }
  }).join('');
}

function renderSlide() {
  if (!activeModule) return;

  const slide = activeModule.slides[currentSlideIndex];
  renderProgressDots();

  if (!userState.lessonProgress) userState.lessonProgress = {};
  const previousProgress = userState.lessonProgress[activeModule.id] || 0;
  if (currentSlideIndex > previousProgress) {
    userState.lessonProgress[activeModule.id] = currentSlideIndex;
    // Award XP the first time a slide is viewed.
    awardXP(10, 'slide_viewed');
    logActivity('slide_viewed', { moduleId: activeModule.id, slideIndex: currentSlideIndex, slideTitle: slide.title });
    saveState();
  }

  el.prevSlideBtn.disabled = currentSlideIndex === 0;
  el.lessonContentArea.scrollTop = 0;

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

  let cardHtml = '';

  if (slide.type === 'info') {
    const trans = userState.translation;
    const scriptureText = slide.scriptureText?.[trans] || slide.scriptureText?.['ESV'] || '';

    let bodyHtml = '';
    if (slide.content && (slide.content.includes('Luke:') || slide.content.includes('Ben:'))) {
      bodyHtml = slide.content.split('\n\n').map(p => {
        if (p.startsWith('Luke:')) {
          return `<div class="dialogue-block"><div class="dialogue-speaker">Luke (Student)</div>${p.replace('Luke:', '').trim()}</div>`;
        } else if (p.startsWith('Ben:')) {
          return `<div class="dialogue-block"><div class="dialogue-speaker tutor">Ben (Mentor)</div>${p.replace('Ben:', '').trim()}</div>`;
        }
        return `<p>${p.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</p>`;
      }).join('');
    } else {
      bodyHtml = formatMarkdown(slide.content);
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
    const qs = slide.questions || [{
      question: slide.question,
      correctAnswer: slide.correctAnswer,
      explanation: slide.explanation
    }];
    if (cardQuizSubIndex >= qs.length) cardQuizSubIndex = 0;
    const currentQ = qs[cardQuizSubIndex];

    cardHtml = `
      <div class="cardquiz-screen">
        <p class="cardquiz-prompt">DO YOU THINK THE FOLLOWING IS TRUE? (${cardQuizSubIndex + 1}/${qs.length})</p>
        <div class="stack-wrapper">
          <div class="stack-card-shadow-2"></div>
          <div class="stack-card-shadow-1"></div>
          <div class="stack-card-main">${currentQ.question}</div>
        </div>
        <div class="yes-no-row">
          <button class="yn-btn yes" data-val="yes">yes</button>
          <button class="yn-btn no" data-val="no">no</button>
        </div>
        <div id="quiz-feedback-box" class="cardquiz-feedback hidden" style="display:none; flex-direction: column;">
          <div class="cardquiz-feedback-title" id="feedback-title">Correct!</div>
          <p id="feedback-desc"></p>
          <button id="cardquiz-continue-btn" class="cardquiz-continue-btn hidden" style="display:none;">Continue</button>
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
        <div class="summary-body">${formatMarkdown(slide.content)}</div>
      </div>
    `;
    el.nextBtnText.textContent = 'COMPLETE';
    el.nextSlideBtn.disabled = false;
    isQuizAnswered = true;
  }

  el.activeCard.innerHTML = cardHtml;

  if (slide.type === 'quiz') {
    el.activeCard.querySelectorAll('.quiz-option').forEach(opt => {
      opt.addEventListener('click', () => selectQuizOption(parseInt(opt.getAttribute('data-index'))));
    });
  } else if (slide.type === 'card-quiz') {
    el.activeCard.querySelectorAll('.yn-btn').forEach(btn => {
      btn.addEventListener('click', () => selectYesNoOption(btn.getAttribute('data-val')));
    });
  }

  const currentQaiTutor = (slide.type === 'card-quiz') ? 
    (((slide.questions && slide.questions[cardQuizSubIndex]) || {}).aiTutorExplanation || slide.aiTutorExplanation) : 
    slide.aiTutorExplanation;

  if (currentQaiTutor) {
    el.aiTutorTrigger.classList.remove('hidden');
    if (slide.type === 'card-quiz') {
      el.aiTutorTrigger.classList.add('dark-mode');
    } else {
      el.aiTutorTrigger.classList.remove('dark-mode');
    }
  } else {
    el.aiTutorTrigger.classList.add('hidden');
  }

  el.tutorExplanationText.innerHTML = currentQaiTutor
    ? `<p>${currentQaiTutor}</p>`
    : `<p>This slide provides theological and historical context on the scriptures.</p>`;
}

function selectQuizOption(index) {
  if (isQuizAnswered || !el.activeCard) return;
  selectedOptionIndex = index;
  el.activeCard.querySelectorAll('.quiz-option').forEach((opt, idx) => {
    opt.classList.toggle('selected', idx === index);
  });
  el.nextSlideBtn.disabled = false;
}

function selectYesNoOption(value) {
  if (isQuizAnswered || !el.activeCard) return;
  selectedOptionIndex = value;
  const yesBtn = el.activeCard.querySelector('.yn-btn.yes');
  const noBtn  = el.activeCard.querySelector('.yn-btn.no');
  if (!yesBtn || !noBtn) return;
  if (value === 'yes') { yesBtn.classList.add('selected-yes'); noBtn.classList.remove('selected-no'); }
  else { noBtn.classList.add('selected-no'); yesBtn.classList.remove('selected-yes'); }
  checkCardQuizAnswer();
}

function checkQuizAnswer() {
  if (!activeModule) return;
  const slide = activeModule.slides[currentSlideIndex];
  if (!slide) return;
  const feedbackBox   = document.getElementById('quiz-feedback-box');
  const feedbackTitle = document.getElementById('feedback-title');
  const feedbackDesc  = document.getElementById('feedback-desc');

  const isCorrect = selectedOptionIndex === slide.correctAnswer;

  if (slide.type === 'quiz') {
    const selectedBtn = el.activeCard.querySelector(`.quiz-option[data-index="${selectedOptionIndex}"]`);

    // Log this quiz attempt.
    logQuizAnswer(
      activeModule.id,
      currentSlideIndex,
      slide.question,
      slide.options[selectedOptionIndex],
      slide.options[slide.correctAnswer],
      isCorrect,
      currentQuestionFirstAttempt
    );

    if (isCorrect) {
      selectedBtn.classList.remove('selected');
      selectedBtn.classList.add('correct');
      feedbackBox.className = 'quiz-feedback correct';
      const feedbackIcon = document.getElementById('feedback-icon');
      if (feedbackIcon) feedbackIcon.textContent = '✓';
      feedbackTitle.textContent = 'Correct!';
      feedbackDesc.textContent  = slide.explanation;
      if (currentQuestionFirstAttempt) {
        userState.quizStats.correctFirstTry += 1;
        awardXP(5, 'correct_quiz_first_try');
      }
      userState.quizStats.totalQuestions += 1;
      isQuizAnswered = true;
      recordActivity();
      el.nextBtnText.textContent = 'CONTINUE';
      el.activeCard.querySelectorAll('.quiz-option').forEach(opt => {
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
      el.nextBtnText.textContent = 'SUBMIT';
      el.nextSlideBtn.disabled = false;
      selectedOptionIndex = null;
    }
  }

  feedbackBox.style.display = 'flex';
  feedbackBox.classList.remove('hidden');
}

function checkCardQuizAnswer() {
  if (!activeModule || !el.activeCard) return;
  const slide = activeModule.slides[currentSlideIndex];
  if (!slide) return;
  const feedbackBox   = document.getElementById('quiz-feedback-box');
  const feedbackTitle = document.getElementById('feedback-title');
  const feedbackDesc  = document.getElementById('feedback-desc');
  const yesBtn = el.activeCard.querySelector('.yn-btn.yes');
  const noBtn  = el.activeCard.querySelector('.yn-btn.no');
  if (!yesBtn || !noBtn) return;

  const qs = slide.questions || [{
    question: slide.question,
    correctAnswer: slide.correctAnswer,
    explanation: slide.explanation
  }];
  const currentQ = qs[cardQuizSubIndex];

  const isCorrect = selectedOptionIndex === currentQ.correctAnswer;

  // Log this card-quiz attempt.
  logQuizAnswer(
    activeModule.id,
    currentSlideIndex,
    currentQ.question,
    selectedOptionIndex,
    currentQ.correctAnswer,
    isCorrect,
    currentQuestionFirstAttempt
  );

  yesBtn.setAttribute('disabled', 'true');
  noBtn.setAttribute('disabled', 'true');

  feedbackBox.style.display = 'flex';
  feedbackBox.classList.remove('hidden');

  if (isCorrect) {
    if (selectedOptionIndex === 'yes') yesBtn.style.background = 'var(--brand-green)';
    else noBtn.style.background = 'var(--brand-green)';

    feedbackBox.className = 'cardquiz-feedback correct';
    feedbackTitle.textContent = '✓ Correct!';
    feedbackDesc.textContent  = currentQ.explanation;

    if (currentQuestionFirstAttempt) {
      userState.quizStats.correctFirstTry += 1;
      awardXP(5, 'correct_cardquiz_first_try');
    }
    userState.quizStats.totalQuestions += 1;
    isQuizAnswered = true;
    recordActivity();

    const continueBtn = document.getElementById('cardquiz-continue-btn');
    if (continueBtn) {
      continueBtn.style.display = 'block';
      continueBtn.classList.remove('hidden');

      const newContinueBtn = continueBtn.cloneNode(true);
      continueBtn.parentNode.replaceChild(newContinueBtn, continueBtn);

      newContinueBtn.addEventListener('click', () => {
        if (cardQuizSubIndex < qs.length - 1) {
          cardQuizSubIndex += 1;
          renderSlide();
        } else {
          cardQuizSubIndex = 0;
          if (currentSlideIndex < activeModule.slides.length - 1) {
            currentSlideIndex += 1;
            renderSlide();
          } else {
            completeActiveModule();
          }
        }
      });
    }
  } else {
    if (selectedOptionIndex === 'yes') yesBtn.style.background = '#ef4444';
    else noBtn.style.background = '#ef4444';

    feedbackBox.className = 'cardquiz-feedback incorrect';
    feedbackTitle.textContent = '✕ Not quite';
    feedbackDesc.textContent  = 'Try again!';
    currentQuestionFirstAttempt = false;

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
  if (!activeModule) return;
  const slide = activeModule.slides[currentSlideIndex];
  if (!slide) return;
  if (slide.type === 'quiz' && !isQuizAnswered) {
    checkQuizAnswer();
  } else if (slide.type === 'card-quiz' && !isQuizAnswered) {
    checkCardQuizAnswer();
  } else {
    if (currentSlideIndex < activeModule.slides.length - 1) {
      currentSlideIndex += 1;
      cardQuizSubIndex = 0;
      renderSlide();
    } else {
      completeActiveModule();
    }
  }
}

function handlePrevClick() {
  if (currentSlideIndex > 0) {
    currentSlideIndex -= 1;
    cardQuizSubIndex = 0;
    renderSlide();
  }
}

function completeActiveModule() {
  const isFirstCompletion = !userState.completedModules.includes(activeModule.id);
  if (isFirstCompletion) {
    userState.completedModules.push(activeModule.id);
    awardXP(50, 'module_completed');
    logActivity('module_completed', { moduleId: activeModule.id, moduleTitle: activeModule.title });
  }
  if (!userState.lessonProgress) userState.lessonProgress = {};
  userState.lessonProgress[activeModule.id] = activeModule.slides.length;
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

let pendingRegistrationDetails = null;

async function handleRegisterSubmit(e) {
  e.preventDefault();
  clearAuthError();
  
  const nameVal = el.registerName ? el.registerName.value.trim() : '';
  const countryVal = el.registerCountry ? el.registerCountry.value : '';

  pendingRegistrationDetails = {
    name: nameVal,
    country: countryVal
  };

  try {
    await createUserWithEmailAndPassword(auth, el.registerEmail.value.trim(), el.registerPass.value);
  } catch (err) {
    console.error('Registration failed:', err);
    showAuthError('Registration failed. Email may already be in use.');
    pendingRegistrationDetails = null;
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
  el.loginForm.addEventListener('submit', handleLoginSubmit);
  el.registerForm.addEventListener('submit', handleRegisterSubmit);
  el.signoutBtn.addEventListener('click', () => signOut(auth));
  el.googleSignInBtn.addEventListener('click', handleGoogleSignIn);
  el.tabLogin.addEventListener('click', () => switchAuthTab('login'));
  el.tabRegister.addEventListener('click', () => switchAuthTab('register'));

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
      if (catalogFilters.status === 'all') {
        catalogFilters.status = 'released';
      } else if (catalogFilters.status === 'released') {
        catalogFilters.status = 'locked';
      } else {
        catalogFilters.status = 'all';
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
        catalogFilters[fType] = val;
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

  el.translationSelect.addEventListener('change', e => {
    userState.translation = e.target.value;
    saveState();
    if (activeModule && activeModule.slides[currentSlideIndex].type === 'info') renderSlide();
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
  const roleSelect = document.getElementById('profile-role-select');
  if (roleSelect) {
    roleSelect.addEventListener('change', async () => {
      // Guard against self-elevation to admin.
      if (userState.role !== 'admin' && roleSelect.value === 'admin') {
        roleSelect.value = userState.role || 'user';
        showToast('Only administrators can change roles.', 'warning');
        return;
      }
      userState.role = roleSelect.value;
      await saveState();
      checkAdminNavVisibility();
    });
  }
  setupPhotoUpload();

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
    if (auth.currentUser && userState) {
      const now = Date.now();
      const elapsedSeconds = Math.round((now - sessionStartTime) / 1000);
      if (elapsedSeconds > 0) {
        userState.timeSpent = (userState.timeSpent || 0) + elapsedSeconds;
        sessionStartTime = now;
        await saveState();
      }
    }
  }, 30000);

  document.addEventListener('visibilitychange', async () => {
    if (auth.currentUser && userState) {
      if (document.visibilityState === 'hidden') {
        const now = Date.now();
        const elapsedSeconds = Math.round((now - sessionStartTime) / 1000);
        if (elapsedSeconds > 0) {
          userState.timeSpent = (userState.timeSpent || 0) + elapsedSeconds;
          sessionStartTime = now;
          await saveState();
        }
      } else if (document.visibilityState === 'visible') {
        sessionStartTime = Date.now();
      }
    }
  });

  window.addEventListener('pagehide', async () => {
    if (auth.currentUser && userState) {
      const now = Date.now();
      const elapsedSeconds = Math.round((now - sessionStartTime) / 1000);
      if (elapsedSeconds > 0) {
        userState.timeSpent = (userState.timeSpent || 0) + elapsedSeconds;
        sessionStartTime = now;
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
    if (!activeModule) return;
    const slide = activeModule.slides[currentSlideIndex];
    if (e.key === 'Enter') {
      if (slide.type === 'info' || isQuizAnswered || selectedOptionIndex !== null) handleNextClick();
    }
    if (e.key === 'ArrowLeft' && currentSlideIndex > 0) handlePrevClick();
  });
}

// ==========================================================================
// PWA & Push Notification Helpers
// ==========================================================================
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/firebase-messaging-sw.js')
        .then(reg => {
          console.log('ServiceWorker registered with scope:', reg.scope);
          swRegistration = reg;
          initPushNotifications(reg);
        })
        .catch(err => {
          console.error('ServiceWorker registration failed:', err);
        });
    });
  }
}

async function initPushNotifications(registration) {
  if (!el.btnToggleNotifications || !el.pushStatusText) return;

  // Sync initial toggle UI
  updatePushToggleUI(Notification.permission);

  // Wire up click event for the custom profile toggle button
  el.btnToggleNotifications.addEventListener('click', async () => {
    try {
      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        updatePushToggleUI(permission);
        if (permission === 'granted') {
          await requestAndSaveToken(registration);
        }
      } else if (Notification.permission === 'granted') {
        // Toggle refresh/resync
        await requestAndSaveToken(registration);
        showToast('Notification token is active and has been refreshed.', 'success');
      } else {
        showToast('Notifications are blocked by your browser settings. Please enable them manually.', 'warning', 6000);
      }
    } catch (err) {
      console.error('Error toggling push notifications:', err);
    }
  });

  // Handle messages in the foreground (when user is active in the app)
  onMessage(messaging, (payload) => {
    console.log('Foreground push notification received: ', payload);
    const body = payload.notification?.body || '';
    const title = payload.notification?.title || 'Scriptura';
    showToast(`${title}: ${body}`, 'info', 6000);
  });
}

function updatePushToggleUI(permission) {
  if (!el.btnToggleNotifications || !el.pushStatusText) return;

  if (permission === 'granted') {
    el.pushStatusText.textContent = 'Enabled';
    el.btnToggleNotifications.textContent = 'Active';
    el.btnToggleNotifications.style.background = '#d1fae5';
    el.btnToggleNotifications.style.color = '#065f46';
    el.btnToggleNotifications.style.borderColor = 'rgba(6, 95, 70, 0.2)';
  } else if (permission === 'denied') {
    el.pushStatusText.textContent = 'Blocked';
    el.btnToggleNotifications.textContent = 'Blocked';
    el.btnToggleNotifications.style.background = '#fee2e2';
    el.btnToggleNotifications.style.color = '#991b1b';
    el.btnToggleNotifications.style.borderColor = 'rgba(153, 27, 27, 0.2)';
  } else {
    el.pushStatusText.textContent = 'Disabled';
    el.btnToggleNotifications.textContent = 'Enable';
    el.btnToggleNotifications.style.background = 'var(--brand-coral-light)';
    el.btnToggleNotifications.style.color = 'var(--brand-coral)';
    el.btnToggleNotifications.style.borderColor = 'rgba(225, 29, 72, 0.2)';
  }
}

async function requestAndSaveToken(registration) {
  try {
    const currentToken = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration || swRegistration
    });
    if (currentToken) {
      console.log('FCM Token received:', currentToken);
      if (auth.currentUser) {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        const userDoc = await getDoc(userRef);
        let fcmTokens = [];
        if (userDoc.exists()) {
          fcmTokens = userDoc.data().fcmTokens || [];
        }
        if (!fcmTokens.includes(currentToken)) {
          fcmTokens.push(currentToken);
          await setDoc(userRef, { fcmTokens }, { merge: true });
        }
        console.log('FCM Token successfully synced with Firestore profile.');
      }
    } else {
      console.warn('No token retrieved. Ensure notifications are allowed.');
    }
  } catch (err) {
    console.error('Error retrieving FCM token:', err);
  }
}

async function checkAndSyncPushToken() {
  if (swRegistration) {
    await requestAndSaveToken(swRegistration);
  } else if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(async (reg) => {
      swRegistration = reg;
      await requestAndSaveToken(reg);
    });
  }
}

// ==========================================================================
// Start
// ==========================================================================
window.addEventListener('DOMContentLoaded', init);

window.addEventListener('popstate', () => {
  routeToPath(window.location.pathname, false);
});
