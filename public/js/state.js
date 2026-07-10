// Shared mutable application state (Phase 2)
import { createDefaultUserState } from './constants.js?v=2.0.13';

export const state = {
  userState: createDefaultUserState(),
  sessionStartTime: Date.now(),
  swRegistration: null,
  activeModule: null,
  currentSlideIndex: 0,
  cardQuizSubIndex: 0,
  selectedOptionIndex: null,
  isQuizAnswered: false,
  currentQuestionFirstAttempt: true,
  currentTab: 'home',
  catalogFilters: {
    topic: 'all',
    progress: 'all',
    status: 'all'
  },
  moduleSchedules: {},
  currentDashboardSubtab: 'studying',
  stateDirty: false,
  stateSaveTimer: null,
  registeredUsers: [],
  currentNetworkTab: 'map',
  networkListenersAttached: false,
  unsubscribeEvents: null,
  unsubscribeChat: null,
  editorSlides: [],
  pendingRegistrationDetails: null,
  countryMetadata: {
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
  }
};
