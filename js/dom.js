// Cached DOM references (Phase 1 extract).
// Loaded as a module at end of body so nodes exist.

export const el = {
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
  restartOnboardedLesson: document.getElementById('restart-onboarded-lesson'),

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
