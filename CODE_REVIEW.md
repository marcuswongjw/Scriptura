# Scriptura Code Review & Improvement Plan

## Executive Summary

I reviewed the main application files (`app.js`, `index.html`, `style.css`, `modules.js`). The app is feature-rich and works, but `app.js` has grown to **3,550 lines** of mostly imperative, globally-scoped code. This creates real maintenance, testing, and bug-risks. The good news: the UI is well-structured in HTML/CSS, and the data model (`concentrations` + `modules`) is clean. The highest-value improvement is **modularizing `app.js`** while preserving the exact DOM IDs and behavior.

---

## 1. What’s Working Well

| Area | Observation |
|------|-------------|
| **Data model** | `modules.js` cleanly separates `concentrations` from `modules`. This is a good foundation. |
| **Firebase setup** | Auth, Firestore, and Messaging are initialized correctly with the v10 modular SDK. |
| **UI/UX** | The HTML/CSS implements a polished Quantic-style interface with clear view separation (`view-home`, `view-courses`, etc.). |
| **Feature breadth** | Dashboard, catalog with filters, onboarding, slide-based lessons, quizzes, network map, events, chat, admin publisher, visual editor, and push notifications are all present. |
| **Accessibility touches** | `role="button"`, `tabindex="0"`, keyboard handlers for Enter/Space, Escape-to-close modals, and ARIA live regions for toasts are included. |
| **State persistence** | Cloud/local merge logic for guest → authenticated users is thoughtful. |

---

## 2. Critical Issues (Fix First)

### 2.1 `app.js` is a 3,550-line monolith
- **Risk**: Impossible to unit test, easy to introduce regressions, hard for multiple developers to work in parallel.
- **Evidence**: All logic—auth, routing, catalog, lesson flow, network, admin, stats, PWA—lives in one file with shared mutable globals (`userState`, `activeModule`, `currentSlideIndex`, etc.).
- **Recommendation**: Split into ES modules by feature. Keep `index.html` and DOM IDs unchanged to avoid breaking the UI. A suggested structure is below.

### 2.2 Heavy use of global mutable state
- **Risk**: Functions mutate shared variables as side effects, making data flow unpredictable.
- **Evidence**: `userState`, `activeModule`, `currentSlideIndex`, `cardQuizSubIndex`, `isQuizAnswered`, `catalogFilters`, `registeredUsers`, etc., are all module-level `let` variables.
- **Recommendation**: Centralize state in a single reactive store (e.g., `state.js`) and make components subscribe to it. This also makes the app easier to debug and test.

### 2.3 Event listener duplication / memory leaks
- **Risk**: Many elements are `cloneNode`’d to “remove old listeners,” which is fragile and can still leak if references are held elsewhere.
- **Evidence**: `initNetworkViewer` clones nav items, search input, event button, forms, and chat form. The visual editor and publisher forms are also cloned on every admin render.
- **Recommendation**: Use event delegation where possible, or attach listeners once in an `init()` function and never re-clone. For dynamic content, bind listeners at render time and store unsubscribe handles.

### 2.4 Firestore reads are unguarded and can be expensive
- **Risk**: `fetchRegisteredUsers()` loads the entire `users` collection on every admin/network render. As the user base grows this becomes slow and costly.
- **Evidence**: `renderAdminDashboard` calls `fetchRegisteredUsers()` and then iterates all users in memory for analytics. The network map also loads every user document.
- **Recommendation**: Use aggregation queries, Cloud Functions, or a dedicated `stats` document for admin metrics. For the directory, paginate with `limit` and cursor-based pagination.

### 2.5 Security rule assumptions
- **Risk**: Client-side role checks (`userState.role === 'admin'`) are not enough. A malicious user can call Firestore directly.
- **Evidence**: Admin role toggling and module editing are gated only by local state.
- **Recommendation**: Enforce admin-only writes in `firestore.rules` using custom claims or a server-side Cloud Function. Never trust the client for authorization.

---

## 3. Medium-Priority Improvements

### 3.1 Routing
- The custom router (`routeToPath`, `switchTab`, `history.pushState`) works but is tightly coupled to the rest of the app.
- **Recommendation**: Extract a tiny router module that maps paths to view names and emits events. This makes deep-linking and testing easier.

### 3.2 Markdown parser
- `formatMarkdown` is hand-rolled and uses lookbehind regex (`(?<!\*)`) which may fail in older browsers.
- **Recommendation**: Replace with a small, tested library like `marked` (or `micromark`) for reliability, or at least add unit tests for the current parser.

### 3.3 Slide/quiz state machine
- Quiz logic (`isQuizAnswered`, `currentQuestionFirstAttempt`, `cardQuizSubIndex`, `selectedOptionIndex`) is scattered and easy to break.
- **Recommendation**: Model a lesson as a state machine with explicit states: `idle`, `answered-correct`, `answered-incorrect`, `completed`. Keep all quiz data in one object per slide.

### 3.4 Repetitive HTML string building
- Many render functions build large HTML strings with inline styles and event handlers.
- **Recommendation**: Use small template helper functions or a lightweight templating approach. This reduces XSS risk and makes UI changes easier.

### 3.5 Error handling
- Many `try/catch` blocks just `console.error` and show a generic toast.
- **Recommendation**: Distinguish user-recoverable errors (network offline, permission denied) from unexpected errors. Provide actionable messages and retry options.

### 3.6 Offline support
- The app registers a service worker but has no explicit offline data strategy.
- **Recommendation**: Cache module data with IndexedDB or a simple offline-first wrapper. Show cached content when Firestore is unreachable.

---

## 4. Low-Priority / Polish

| Item | Suggestion |
|------|------------|
| **CSS size** | `style.css` is 4,273 lines. Consider splitting by view/component and using CSS custom properties consistently. |
| **Country list** | The country `<select>` is repeated in `index.html` (hundreds of lines). Generate it from a JSON array in JS. |
| **Avatar URLs** | `api.dicebear.com` is used in many places. Centralize in a helper so the style/seed can be changed in one place. |
| **Magic numbers** | `30000`, `2000`, `1200`, `1000 * 60 * 60 * 24` are scattered. Use named constants. |
| **Console logging** | Remove or gate debug `console.log` statements behind a debug flag. |
| **Type safety** | Consider adding JSDoc types or migrating to TypeScript for the core state and module schemas. |

---

## 5. Proposed File Structure (Preserving Existing HTML/CSS)

This refactor keeps `index.html` and `style.css` untouched. Only `app.js` is split.

```
scriptura/
├── index.html
├── style.css
├── modules.js
├── firebase-messaging-sw.js
├── app.js                 # thin orchestrator
├── src/
│   ├── firebase/
│   │   └── config.js      # initializeApp, auth, db, messaging
│   ├── state/
│   │   └── store.js       # reactive userState + getters/setters
│   ├── ui/
│   │   ├── dom.js         # all document.getElementById refs
│   │   ├── toast.js       # showToast
│   │   ├── router.js      # switchTab, routeToPath
│   │   └── views.js       # show/hide helpers
│   ├── features/
│   │   ├── auth.js        # login, register, google, signout
│   │   ├── dashboard.js   # renderDashboard, renderCurriculumGrid
│   │   ├── catalog.js     # renderCoursesCatalog, filters, onboarding
│   │   ├── lesson.js      # startModule, renderSlide, quiz logic
│   │   ├── network.js     # map, directory, people, events, chat
│   │   ├── profile.js     # profile dialog, avatar, photo upload
│   │   ├── stats.js       # updateStatsDisplay
│   │   └── pwa.js         # service worker, push notifications
│   ├── admin/
│   │   ├── dashboard.js   # renderAdminDashboard, role toggles
│   │   ├── publisher.js   # JSON publisher
│   │   └── editor.js      # visual module editor
│   └── utils/
│       ├── helpers.js     # sanitizeHTML, debounce, formatMarkdown
│       └── constants.js   # moduleIcons, conIcons, topicOrder, countryMetadata
```

### Migration strategy
1. **Phase 1 (safe)**: Move constants and pure helpers to `src/utils/` and import them. No behavior change.
2. **Phase 2**: Extract Firebase config and DOM refs. Update `app.js` to import them.
3. **Phase 3**: Move one feature at a time (auth → dashboard → catalog → lesson → network → admin). After each move, run manual smoke tests.
4. **Phase 4**: Introduce a central state store and migrate `userState` mutations gradually.
5. **Phase 5**: Add unit tests for pure functions (markdown, filters, quiz scoring).

---

## 6. Quick Wins You Can Apply Immediately

1. **Move `moduleIcons`, `conIcons`, `topicOrder`, `countryMetadata`, `lockedTopics` to `src/utils/constants.js`.**
2. **Move `sanitizeHTML`, `debounce`, `formatMarkdown` to `src/utils/helpers.js`.**
3. **Move Firebase initialization to `src/firebase/config.js`.**
4. **Move the DOM element cache (`el`) to `src/ui/dom.js`.**
5. **Replace inline `cloneNode` listener removal with event delegation for `.net-nav-item`, `.filter-tag-btn`, `.admin-role-toggle-btn`, `.admin-view-progress-btn`, `.admin-edit-module-btn`, `.admin-delete-module-btn`, `.join-event-btn`, `.quiz-option`, `.yn-btn`, `.concentration-badge`, `.premium-course-card`, `.onboard-lesson-row-item`, `.clickable-stats-row`, `.directory-item`, and `.map-cluster`.**
6. **Add a `const DEBUG = false;` flag and wrap `console.log` / `console.warn` debug output.**
7. **Add `firestore.rules` tests for admin-only writes.**

---

## 7. Security Checklist

- [ ] `firestore.rules` restricts write access to `users/{uid}` to the authenticated owner (except admin claims).
- [ ] `custom_modules` writes are restricted to users with an `admin` custom claim, not just a `role` field.
- [ ] `events` and `messages` collections have rate-limiting or validation rules.
- [ ] Module schedules (`events/module_schedules`) are write-protected.
- [ ] FCM tokens are stored per-user and not readable by other users.

---

## 8. Testing Recommendations

| Type | What to test |
|------|--------------|
| **Unit** | `formatMarkdown`, filter logic, quiz scoring, streak calculation, module release date logic. |
| **Integration** | Auth state changes → UI updates, catalog filter → rendered cards, lesson completion → state save. |
| **E2E** | Sign up → complete a lesson → view stats → open network → admin publishes a module. |
| **Rules** | Firestore security rules for every collection. |

---

## 9. Bugs Fixed in This Pass

The following critical bugs were fixed directly in `app.js`:

1. **Profile role self-elevation vulnerability** — Non-admin users can no longer see or change the role select in the profile dialog, and `handleProfileSave` ignores role changes unless the current user is already an admin.
2. **Unbounded Firestore user reads** — `fetchRegisteredUsers()` now uses `limit(100)` instead of loading the entire `users` collection.
3. **Markdown parser compatibility** — Replaced the `(?<!\*)` lookbehind regex in `formatMarkdown` with a broader-browser-safe alternative.
4. **Listener duplication / memory-leak-prone `cloneNode` patterns** — Removed `cloneNode` listener swaps in `initNetworkViewer` and the admin publisher form. Network nav items now use event delegation; publisher form listeners are attached once in `setupEventListeners`.
5. **Quiz selector scoping & null safety** — Quiz option and yes/no selectors are now scoped to `el.activeCard`, and `activeModule`/`slide` null checks were added to `checkQuizAnswer`, `checkCardQuizAnswer`, `handleNextClick`, and `selectYesNoOption`.
6. **Variable shadowing** — Renamed the local `el` in `showStatus` to `statusEl` to avoid shadowing the global DOM cache.

> **Note:** Client-side role guards are a stopgap. You must still enforce admin-only writes in `firestore.rules` (see Security Checklist below).

## 10. Phase A — Client-Side Stats Improvements (Implemented)

The following stats-collection improvements were implemented in `app.js`:

1. **XP is now meaningful** — Awards are granted for:
   - +10 XP per new slide viewed
   - +50 XP per first-time module completion
   - +5 XP per correct first-try quiz/card-quiz answer
   - +20 XP per daily streak maintained
2. **Activity log** — `userState.activityLog` records `module_started`, `slide_viewed`, `quiz_answered`, `module_completed`, `xp_earned`, and `streak_updated` events, capped at 100 entries.
3. **Streak tracking** — Added `longestStreak` and `lastActiveAt` (ISO timestamp). `updateStreak()` now correctly increments/reset streaks and updates the longest streak.
4. **Modules started** — Added `modulesStarted` array, populated in `startModule()`.
5. **Quiz history** — Added `quizHistory` array with question, selected/correct answers, correctness, first-attempt flag, and timestamp, capped at 50 entries.
6. **Time spent displayed** — `updateStatsDisplay()` now dynamically adds stat cards for Total XP, Longest Streak, and Time Studied.

## 11. Phase B — Admin Dashboard Aggregation (Implemented)

The following admin-dashboard improvements were implemented:

1. **Centralized stats aggregation** — Added `computeAdminStats()` and `loadAdminStats()` in `app.js`. The dashboard now reads from a cached `stats/aggregated` Firestore document and only recomputes when the cache is missing or older than 24 hours.
2. **Aggregated metrics** — The cached document stores: total users, DAU, WAU, MAU, total completed/started modules, completion rate, DAU/WAU ratio, average modules completed per user, and funnel counts.
3. **Module engagement table** — Added a new "Module Engagement" panel in the admin dashboard showing started count, completed count, and completion rate per module, sorted by completion rate to surface struggling modules.
4. **Firestore rules** — Added a `match /stats/{docId}` rule allowing authenticated reads/writes. This is intentionally permissive for Phase B; Phase C should restrict writes to admin-only.

> **Note:** This is a client-side aggregation trigger. For a production app with many users, replace this with a Cloud Function or scheduled job that writes `stats/aggregated` server-side, so the admin dashboard never needs to scan user documents.

## 12. Daily Reading / Devotional Feature (Implemented)

A daily devotional card was added to the Home view to drive daily engagement:

1. **Content source** — New `daily_readings.js` file with 30 daily readings. Each reading includes a title, verse, reference, reflection, and optional reflection question. The content is a mix of key verses from existing modules and original devotional reflections.
2. **Daily selection** — `getTodaysReading()` selects the reading deterministically by day of year, cycling through the 30 entries. Every user sees the same reading on the same day.
3. **Completion tracking** — `userState.dailyReadingsCompleted` and `lastDailyReadingDate` track which readings the user has completed.
4. **XP & streak integration** — Marking a reading complete awards +15 XP, logs `daily_reading_completed` to the activity log, and calls `recordActivity()` to maintain the streak.
5. **UI placement** — The daily reading card appears above the "Currently Studying" section on the Home view.

## 13. Conclusion

Scriptura is a solid, feature-complete application. The biggest return on investment will come from **modularizing `app.js`**, **centralizing state**, and **hardening Firestore security rules**. These changes will make the codebase easier to extend, test, and maintain without requiring a rewrite of the UI.

If you want, I can start implementing Phase 1 (constants + helpers + Firebase config extraction) as a safe, behavior-preserving next step, move on to Phase C (Firestore security with custom claims), or continue adding more daily readings and features.

