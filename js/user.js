// Feature module: user (Phase 2)
import { auth, db, functions } from './firebase.js?v=2.0.22';
import { doc, getDoc, setDoc, collection, getDocs } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { httpsCallable } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-functions.js';
import { concentrations, modules } from '../modules.js?v=2.0.22';
import { createDefaultUserState } from './constants.js?v=2.0.22';
import { el } from './dom.js?v=2.0.22';
import { state } from './state.js?v=2.0.22';
import { updateStatsDisplay } from './stats.js?v=2.0.22';

export async function fetchAndMergeCustomModules() {
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

export function checkAdminNavVisibility() {
  const adminNav = document.getElementById('nav-item-admin');
  if (!adminNav) return;
  const isAdmin = state.userState.role === 'admin';
  adminNav.classList.toggle('hidden', !isAdmin);
  adminNav.setAttribute('aria-hidden', isAdmin ? 'false' : 'true');
}

/**
 * Server-side bootstrap: if email is on the permanent admin list, force role=admin.
 * Also re-reads role from Firestore so localStorage cannot hide the Admin tab.
 */
export async function syncAdminRoleFromServer() {
  if (!auth.currentUser) return false;
  try {
    const claim = httpsCallable(functions, 'claimBootstrapAdmin');
    const res = await claim({});
    if (res?.data?.admin) {
      state.userState.role = 'admin';
    } else {
      // Fall back to a fresh user doc read
      const snap = await getDoc(doc(db, 'users', auth.currentUser.uid));
      state.userState.role = snap.exists() && snap.data()?.role === 'admin' ? 'admin' : 'user';
    }
  } catch (err) {
    console.warn('syncAdminRoleFromServer failed, reading Firestore role:', err);
    try {
      const snap = await getDoc(doc(db, 'users', auth.currentUser.uid));
      state.userState.role = snap.exists() && snap.data()?.role === 'admin' ? 'admin' : 'user';
    } catch (_) {
      /* keep local */
    }
  }
  localStorage.setItem('scriptura_user_state', JSON.stringify(state.userState));
  checkAdminNavVisibility();
  return state.userState.role === 'admin';
}

export function updateHeaderProfile() {
  if (auth.currentUser) {
    el.userDisplayName.textContent = state.userState.name || auth.currentUser.displayName || auth.currentUser.email || 'Learner';
    if (state.userState.photo) {
      el.headerAvatar.src = state.userState.photo;
    } else {
      el.headerAvatar.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${auth.currentUser.uid}`;
    }
  }
}

export async function loadUserCloudData(user) {
  try {
    const userRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(userRef);

    let cloudData = null;
    if (docSnap.exists()) cloudData = docSnap.data();

    const localSaved = localStorage.getItem('scriptura_user_state');
    let guestState = null;
    if (localSaved) { try { guestState = JSON.parse(localSaved); } catch(e) {} }

    if (cloudData) {
      state.userState = {
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
      if (!state.userState.quizStats) state.userState.quizStats = { correctFirstTry: 0, totalQuestions: 0 };
      if (!state.userState.completedModules) state.userState.completedModules = [];
      if (!state.userState.modulesStarted) state.userState.modulesStarted = [];
      if (!state.userState.dailyReadingsCompleted) state.userState.dailyReadingsCompleted = [];
      if (!state.userState.lessonProgress) state.userState.lessonProgress = {};
      if (!state.userState.quizHistory) state.userState.quizHistory = [];
      if (!state.userState.activityLog) state.userState.activityLog = [];

      const isMigrated = localStorage.getItem('scriptura_local_migrated') === 'true';
      const cloudHasProgress = (cloudData.xp || 0) > 0 || (cloudData.completedModules || []).length > 0;
      if (guestState && !isMigrated && !cloudHasProgress) {
        let merged = false;
        if (guestState.xp > (state.userState.xp || 0)) { state.userState.xp = guestState.xp; merged = true; }
        if (guestState.streak > (state.userState.streak || 0)) { state.userState.streak = guestState.streak; merged = true; }
        if (guestState.longestStreak > (state.userState.longestStreak || 0)) { state.userState.longestStreak = guestState.longestStreak; merged = true; }
        const cloudCompleted = state.userState.completedModules || [];
        const guestCompleted = guestState.completedModules || [];
        const mergedCompleted = Array.from(new Set([...cloudCompleted, ...guestCompleted]));
        if (mergedCompleted.length > cloudCompleted.length) { state.userState.completedModules = mergedCompleted; merged = true; }
        const cloudStarted = state.userState.modulesStarted || [];
        const guestStarted = guestState.modulesStarted || [];
        const mergedStarted = Array.from(new Set([...cloudStarted, ...guestStarted]));
        if (mergedStarted.length > cloudStarted.length) { state.userState.modulesStarted = mergedStarted; merged = true; }
        if (guestState.timeSpent > (state.userState.timeSpent || 0)) { state.userState.timeSpent = guestState.timeSpent; merged = true; }
        // Preserve cloud role — never rewrite it from guest merge.
        if (merged) await setDoc(userRef, userDocWithoutRole(), { merge: true });
        localStorage.setItem('scriptura_local_migrated', 'true');
      }
      // Authoritative role always comes from cloud for existing users
      state.userState.role = cloudData.role === 'admin' ? 'admin' : 'user';
    } else {
      if (guestState) {
        state.userState = {
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
          country: 'SG',
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
          role: 'user',
          country: (guestState && guestState.country) || 'SG'
        };
      } else {
        state.userState = {
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
          country: state.pendingRegistrationDetails?.country || 'SG',
          name: state.pendingRegistrationDetails?.name || user.displayName || '',
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
      // First-time create may set role user only
      await setDoc(userRef, { ...state.userState, role: 'user' });
      localStorage.setItem('scriptura_local_migrated', 'true');
      state.pendingRegistrationDetails = null;
    }

    if (state.userState.translation) el.translationSelect.value = state.userState.translation;

    // Final authoritative role sync (bootstrap claim + fresh doc)
    await syncAdminRoleFromServer();
  } catch (err) {
    console.error('Error loading user cloud data:', err);
  }
}

export function resetLocalState() {
  state.userState = {
    ...createDefaultUserState(),
    name: '',
    photo: '',
    email: '',
    church: ''
  };
  localStorage.removeItem('scriptura_local_migrated');
  localStorage.removeItem('scriptura_user_state');
  updateStatsDisplay();
}

// ==========================================================================
// Stats helpers
// ==========================================================================

export function awardXP(amount, reason) {
  if (!amount || amount <= 0) return;
  state.userState.xp = (state.userState.xp || 0) + amount;
  logActivity('xp_earned', { amount, reason, xp: state.userState.xp });
}

export function logActivity(type, metadata = {}) {
  if (!state.userState.activityLog) state.userState.activityLog = [];
  const entry = {
    type,
    timestamp: new Date().toISOString(),
    ...metadata
  };
  state.userState.activityLog.push(entry);
  if (state.userState.activityLog.length > 100) {
    state.userState.activityLog = state.userState.activityLog.slice(-100);
  }
}

export function logQuizAnswer(moduleId, slideIndex, question, selectedAnswer, correctAnswer, isCorrect, isFirstAttempt) {
  if (!state.userState.quizHistory) state.userState.quizHistory = [];
  state.userState.quizHistory.push({
    moduleId,
    slideIndex,
    question: question?.substring(0, 200),
    selectedAnswer,
    correctAnswer,
    isCorrect,
    isFirstAttempt,
    timestamp: new Date().toISOString()
  });
  if (state.userState.quizHistory.length > 50) {
    state.userState.quizHistory = state.userState.quizHistory.slice(-50);
  }
}

/** Payload for user doc writes — never includes `role` (role only via admin toggle / bootstrap). */
function userDocWithoutRole(extra = {}) {
  const payload = { ...state.userState, ...extra };
  delete payload.role;
  return payload;
}

export async function saveState() {
  // Keep local role honest for UI, but never write role from client save paths.
  if (state.userState.role !== 'admin' && state.userState.role !== 'user') {
    state.userState.role = 'user';
  }
  localStorage.setItem('scriptura_user_state', JSON.stringify(state.userState));
  updateStatsDisplay();
  state.stateDirty = true;
  if (auth.currentUser && !state.stateSaveTimer) {
    state.stateSaveTimer = setTimeout(async () => {
      if (state.stateDirty && auth.currentUser) {
        try {
          const userRef = doc(db, 'users', auth.currentUser.uid);
          // merge: true + omit role so progress saves cannot demote/promote
          await setDoc(userRef, userDocWithoutRole(), { merge: true });
          state.stateDirty = false;
        } catch (err) { console.error('Failed to sync progress:', err); }
      }
      state.stateSaveTimer = null;
    }, 2000);
  }
}

export function updateStreak() {
  const todayStr = new Date().toDateString();
  const lastActive = state.userState.lastActiveDate ? new Date(state.userState.lastActiveDate) : null;
  if (!lastActive) { state.userState.streak = 1; return; }
  const lastActiveStr = lastActive.toDateString();
  if (todayStr !== lastActiveStr) {
    const diffDays = Math.ceil(Math.abs(new Date(todayStr) - lastActive) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      state.userState.streak = (state.userState.streak || 0) + 1;
    } else {
      state.userState.streak = 1;
    }
    if ((state.userState.streak || 0) > (state.userState.longestStreak || 0)) {
      state.userState.longestStreak = state.userState.streak;
    }
  }
}

export function recordActivity() {
  const now = new Date();
  const todayStr = now.toDateString();
  const lastActiveStr = state.userState.lastActiveDate ? new Date(state.userState.lastActiveDate).toDateString() : null;
  const streakIncremented = todayStr !== lastActiveStr;
  if (streakIncremented) {
    updateStreak();
    state.userState.lastActiveDate = now.toISOString();
    state.userState.lastActiveAt = now.toISOString();
    // Award streak maintenance XP once per day.
    awardXP(20, 'daily_streak');
    logActivity('streak_updated', { streak: state.userState.streak, longestStreak: state.userState.longestStreak });
    saveState();
  } else {
    state.userState.lastActiveAt = now.toISOString();
  }
}

// ==========================================================================
// Release Date Checking
// ==========================================================================

export function isModuleReleased(moduleId) {
  if (state.userState.role === 'admin') return true;
  const releaseDateStr = state.moduleSchedules[moduleId];
  if (!releaseDateStr) return true;
  const releaseDate = new Date(releaseDateStr);
  const now = new Date();
  return now >= releaseDate;
}

export async function loadModuleSchedules() {
  try {
    const docRef = doc(db, 'events', 'module_schedules');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      state.moduleSchedules = docSnap.data();
    } else {
      state.moduleSchedules = {};
    }
  } catch (err) {
    console.error('Failed to load module schedules:', err);
  }
}

