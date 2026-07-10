// Shared static maps and default state factory (Phase 1 extract)

export const moduleIcons = {
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

/** Shared concentration icons (catalog, onboarding, stats) */
export const conIcons = {
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

export const toastIcons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };
export const toastTitles = { success: 'Success', error: 'Error', warning: 'Warning', info: 'Info' };

/** Fresh default userState object (new reference each call). */
export function createDefaultUserState() {
  return {
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
}
