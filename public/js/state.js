// Shared mutable application state (Phase 2)
import { createDefaultUserState } from './constants.js?v=2.0.24';

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
  currentNetworkTab: 'hub',
  peopleCountryFilter: 'all',
  networkListenersAttached: false,
  unsubscribeEvents: null,
  unsubscribeChat: null,
  editorSlides: [],
  pendingRegistrationDetails: null,
  countryMetadata: {
    SG: { name: 'Singapore', flag: '🇸🇬', region: 'Southeast Asia' },
    PH: { name: 'Philippines', flag: '🇵🇭', region: 'Southeast Asia' },
    MY: { name: 'Malaysia', flag: '🇲🇾', region: 'Southeast Asia' },
    HK: { name: 'Hong Kong', flag: '🇭🇰', region: 'East Asia' },
    KR: { name: 'South Korea', flag: '🇰🇷', region: 'East Asia' },
    AU: { name: 'Australia', flag: '🇦🇺', region: 'Oceania' },
    US: { name: 'United States', flag: '🇺🇸', region: 'North America' },
    GB: { name: 'United Kingdom', flag: '🇬🇧', region: 'Europe' },
    CA: { name: 'Canada', flag: '🇨🇦', region: 'North America' },
    ZA: { name: 'South Africa', flag: '🇿🇦', region: 'Africa' },
    OTHER: { name: 'Other', flag: '🌍', region: 'Worldwide' }
  }
};
