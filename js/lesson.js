// Feature module: lesson (Phase 2)
import { ensureModuleLoaded, modules } from '../modules.js?v=2.0.33';
import { formatMarkdown, sanitizeHTML } from './utils.js?v=2.0.33';
import { showToast } from './toast.js?v=2.0.33';
import { el } from './dom.js?v=2.0.33';
import { state } from './state.js?v=2.0.33';
import { switchTab } from './routing.js?v=2.0.33';
import { awardXP, isModuleReleased, logActivity, logQuizAnswer, recordActivity, saveState } from './user.js?v=2.0.33';
import { requireAuth } from './auth_ui.js?v=2.0.33';

function ensureQuizClearedMap() {
  if (!state.userState.lessonQuizCleared || typeof state.userState.lessonQuizCleared !== 'object') {
    state.userState.lessonQuizCleared = {};
  }
}

function isSlideQuizCleared(moduleId, slideIndex) {
  ensureQuizClearedMap();
  const arr = state.userState.lessonQuizCleared[moduleId];
  return Array.isArray(arr) && arr.includes(slideIndex);
}

function markSlideQuizCleared(moduleId, slideIndex) {
  ensureQuizClearedMap();
  const arr = state.userState.lessonQuizCleared[moduleId] || [];
  if (!arr.includes(slideIndex)) {
    state.userState.lessonQuizCleared[moduleId] = [...arr, slideIndex];
    saveState();
  }
}

function clearModuleQuizCleared(moduleId) {
  ensureQuizClearedMap();
  delete state.userState.lessonQuizCleared[moduleId];
}

/** Highest slide index the learner may open (reached before, or completed = all). */
function getFurthestUnlockedIndex() {
  if (!state.activeModule) return 0;
  const total = state.activeModule.slides.length;
  const last = Math.max(0, total - 1);
  const moduleId = state.activeModule.id;
  if (state.userState.completedModules?.includes(moduleId)) return last;

  if (!state.userState.lessonProgress) state.userState.lessonProgress = {};
  const saved = Number(state.userState.lessonProgress[moduleId] || 0);
  // completed path stores slides.length; clamp into valid indices
  const savedIdx = Math.min(Math.max(0, saved), last);
  return Math.max(savedIdx, state.currentSlideIndex || 0);
}

/** Persist furthest + exact resume position (same key: high-water mark of index). */
function persistLessonProgress({ awardIfNew = true } = {}) {
  if (!state.activeModule) return;
  if (!state.userState.lessonProgress) state.userState.lessonProgress = {};
  const moduleId = state.activeModule.id;
  const previousProgress = Number(state.userState.lessonProgress[moduleId] || 0);
  const idx = state.currentSlideIndex;

  if (idx > previousProgress) {
    state.userState.lessonProgress[moduleId] = idx;
    if (awardIfNew) {
      const slide = state.activeModule.slides[idx];
      awardXP(10, 'slide_viewed');
      logActivity('slide_viewed', {
        moduleId,
        slideIndex: idx,
        slideTitle: slide?.title,
      });
    }
    saveState();
  } else if (idx !== previousProgress && previousProgress < state.activeModule.slides.length) {
    // Keep high-water mark for unlock/resume; do not lower on back-nav.
    // Resume still uses high-water (furthest reached).
    saveState();
  }
}

/**
 * Jump to a slide by index. Only unlocked slides (already reached) are allowed
 * so learners cannot skip unreached quizzes / content.
 */
export function goToSlide(targetIndex) {
  if (!state.activeModule) return;
  const total = state.activeModule.slides.length;
  if (!Number.isFinite(targetIndex) || targetIndex < 0 || targetIndex >= total) return;

  const furthest = getFurthestUnlockedIndex();
  if (targetIndex > furthest) {
    showToast('Finish earlier slides to unlock this one.', 'info');
    return;
  }
  if (targetIndex === state.currentSlideIndex) return;

  state.currentSlideIndex = targetIndex;
  state.cardQuizSubIndex = 0;
  state.selectedOptionIndex = null;
  state.isQuizAnswered = false;
  state.currentQuestionFirstAttempt = true;
  renderSlide();
}

/**
 * @param {string} moduleId
 * @param {boolean} [pushState=true]
 * @param {{ forceRestart?: boolean }} [options]
 */
export async function startModule(moduleId, pushState = true, options = {}) {
  // Guests may browse the catalog and course details; starting a lesson needs an account.
  if (!requireAuth(
    { type: 'startModule', moduleId, forceRestart: options.forceRestart === true },
    'Sign in to start this lesson and save your progress.'
  )) {
    return;
  }

  if (!isModuleReleased(moduleId)) {
    showToast('This course is not yet released!', 'warning');
    switchTab('courses');
    return;
  }

  // Lazy-load full slides for this book/chunk (catalog only had metadata)
  showToast('Loading lesson…', 'info');
  let mod;
  try {
    mod = await ensureModuleLoaded(moduleId);
  } catch (err) {
    console.error(err);
    showToast('Could not load lesson content. Check your connection.', 'error');
    return;
  }
  if (!mod || !Array.isArray(mod.slides) || mod.slides.length === 0) {
    showToast('Lesson content is missing or empty.', 'error');
    return;
  }

  state.activeModule = mod;

  const forceRestart = options.forceRestart === true;
  const total = state.activeModule.slides.length;
  const last = Math.max(0, total - 1);
  const isCompleted = state.userState.completedModules?.includes(moduleId);
  if (!state.userState.lessonProgress) state.userState.lessonProgress = {};

  if (forceRestart) {
    // Clear slide progress so unlocks and resume start fresh (keep completion history for stats).
    state.userState.lessonProgress[moduleId] = 0;
    clearModuleQuizCleared(moduleId);
    // If restarting a completed module intentionally, allow full playthrough again.
    if (isCompleted) {
      state.userState.completedModules = state.userState.completedModules.filter(id => id !== moduleId);
    }
    state.currentSlideIndex = 0;
    saveState();
    showToast('Restarted from the beginning', 'info');
  } else {
    const savedRaw = Number(state.userState.lessonProgress[moduleId] || 0);
    // Resume incomplete lessons at furthest reached slide; completed restarts at 0 for review.
    if (!isCompleted && savedRaw > 0) {
      state.currentSlideIndex = Math.min(savedRaw, last);
    } else {
      state.currentSlideIndex = 0;
    }
  }

  state.cardQuizSubIndex = 0;
  state.selectedOptionIndex = null;
  state.isQuizAnswered = false;
  state.currentQuestionFirstAttempt = true;

  // Track module start for stats.
  if (!state.userState.modulesStarted.includes(moduleId)) {
    state.userState.modulesStarted.push(moduleId);
    logActivity('module_started', { moduleId, moduleTitle: state.activeModule.title });
    saveState();
  } else if (forceRestart) {
    logActivity('module_restarted', { moduleId, moduleTitle: state.activeModule.title });
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

  if (!forceRestart && !isCompleted && state.currentSlideIndex > 0) {
    showToast(`Resumed at slide ${state.currentSlideIndex + 1} of ${total}`, 'info');
  }

  renderSlide();
  el.lessonContentArea.scrollTop = 0;
  window.scrollTo({ top: 0, behavior: 'instant' });

  if (pushState) {
    history.pushState({ moduleId, type: 'learn' }, '', `/learn/${moduleId}`);
  }
}

/** Save furthest slide progress without tearing down UI (used by close + tab routing). */
export function saveActiveLessonProgress() {
  if (!state.activeModule) return;
  if (!state.userState.lessonProgress) state.userState.lessonProgress = {};
  const moduleId = state.activeModule.id;
  if (state.userState.completedModules?.includes(moduleId)) return;
  const prev = Number(state.userState.lessonProgress[moduleId] || 0);
  const idx = state.currentSlideIndex || 0;
  if (idx > prev) state.userState.lessonProgress[moduleId] = idx;
  saveState();
}

/**
 * Leave the lesson overlay. When navigateAway is false, only hides UI
 * (caller handles tab/route). Always persists progress first.
 */
export function closeLesson(pushState = true, navigateAway = true) {
  saveActiveLessonProgress();

  state.activeModule = null;
  el.lessonView.classList.add('hidden');
  el.lessonView.classList.remove('cardquiz-mode');
  el.bottomNav.classList.remove('hidden');
  el.header.classList.remove('hidden');
  if (navigateAway) {
    switchTab('courses', pushState);
  }
}

export function renderProgressDots() {
  if (!state.activeModule) return;
  const total = state.activeModule.slides.length;
  const furthest = getFurthestUnlockedIndex();

  const createDot = (idx) => {
    let cls = 'progress-dot';
    if (total > 10) cls += ' small';
    if (idx < state.currentSlideIndex) cls += ' done';
    else if (idx === state.currentSlideIndex) cls += ' current';
    if (idx <= furthest) cls += ' clickable';
    else cls += ' locked';
    const label = state.activeModule.slides[idx]?.title || `Slide ${idx + 1}`;
    const title = idx <= furthest
      ? `Go to slide ${idx + 1}: ${label}`
      : `Locked — reach this slide first`;
    return `<button type="button" class="${cls}" data-slide-index="${idx}" title="${title.replace(/"/g, '&quot;')}" aria-label="${title.replace(/"/g, '&quot;')}" ${idx > furthest ? 'disabled' : ''}></button>`;
  };

  let dotsHtml = '';
  if (total <= 10) {
    el.lessonDotsBar.classList.remove('two-rows');
    dotsHtml = state.activeModule.slides.map((_, idx) => createDot(idx)).join('');
  } else {
    el.lessonDotsBar.classList.add('two-rows');
    const half = Math.ceil(total / 2);
    const row1 = state.activeModule.slides.slice(0, half).map((_, idx) => createDot(idx)).join('');
    const row2 = state.activeModule.slides.slice(half).map((_, idx) => createDot(half + idx)).join('');
    dotsHtml = `<div class="dots-row">${row1}</div><div class="dots-row staggered">${row2}</div>`;
  }

  el.lessonDotsBar.innerHTML = dotsHtml;

  el.lessonDotsBar.querySelectorAll('.progress-dot.clickable').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const idx = parseInt(btn.getAttribute('data-slide-index'), 10);
      goToSlide(idx);
    });
  });

  const progressPercent = total > 1
    ? Math.round((state.currentSlideIndex / (total - 1)) * 100)
    : (state.currentSlideIndex === 0 ? 0 : 100);
  el.lessonProgressBar.style.width = `${progressPercent}%`;

  const counter = document.getElementById('lesson-slide-counter');
  if (counter) {
    counter.textContent = `${state.currentSlideIndex + 1} / ${total}`;
  }
  const modTitle = document.getElementById('lesson-module-title');
  if (modTitle) {
    modTitle.textContent = state.activeModule.title || '';
  }
}

export function renderSlide() {
  if (!state.activeModule) return;

  const slide = state.activeModule.slides[state.currentSlideIndex];
  renderProgressDots();

  if (!state.userState.lessonProgress) state.userState.lessonProgress = {};
  const previousProgress = Number(state.userState.lessonProgress[state.activeModule.id] || 0);
  if (state.currentSlideIndex > previousProgress) {
    persistLessonProgress({ awardIfNew: true });
  } else {
    // Still flush state periodically so cloud/local keep in sync while reviewing
    // (no XP re-award).
  }

  el.prevSlideBtn.disabled = state.currentSlideIndex === 0;
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

  const cardQuizAlreadyCleared = slide.type === 'card-quiz'
    && isSlideQuizCleared(state.activeModule.id, state.currentSlideIndex);

  if (slide.type === 'card-quiz' && !cardQuizAlreadyCleared) {
    el.lessonView.classList.add('cardquiz-mode');
    el.lessonTopbar.style.background = 'var(--brand-purple-bg)';
    el.lessonProgressBar.style.background = 'var(--brand-purple)';
    // Hide bottom bar during active multi-card flow — use in-card Continue.
    // (Keyboard Enter still goes through handleNextClick, which steps cards safely.)
    el.nextSlideBtn.style.display = 'none';
  } else {
    el.lessonView.classList.remove('cardquiz-mode');
    el.lessonTopbar.style.background = '';
    el.lessonProgressBar.style.background = '';
    el.nextSlideBtn.style.display = '';
  }

  let cardHtml = '';

  if (slide.type === 'info') {
    const trans = state.userState.translation;
    const scriptureText = slide.scriptureText?.[trans] || slide.scriptureText?.['ESV'] || '';
    const safeTitle = sanitizeHTML(slide.title || '');
    const safeScripture = sanitizeHTML(slide.scripture || '');
    const safeScriptureText = sanitizeHTML(scriptureText);

    let bodyHtml = '';
    if (slide.content && (slide.content.includes('Luke:') || slide.content.includes('Ben:'))) {
      bodyHtml = slide.content.split('\n\n').map(p => {
        if (p.startsWith('Luke:')) {
          return `<div class="dialogue-block"><div class="dialogue-speaker">Luke (Student)</div>${sanitizeHTML(p.replace('Luke:', '').trim())}</div>`;
        } else if (p.startsWith('Ben:')) {
          return `<div class="dialogue-block"><div class="dialogue-speaker tutor">Ben (Mentor)</div>${sanitizeHTML(p.replace('Ben:', '').trim())}</div>`;
        }
        return `<p>${sanitizeHTML(p).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</p>`;
      }).join('');
    } else {
      bodyHtml = formatMarkdown(slide.content);
    }

    cardHtml = `
      <div class="info-slide">
        <h2 class="slide-title">${safeTitle}</h2>
        ${scriptureText ? `
        <div class="scripture-callout">
          <div class="scripture-text">"${safeScriptureText}"</div>
          <span class="scripture-ref">— ${safeScripture} (${sanitizeHTML(trans)})</span>
        </div>` : ''}
        <div class="slide-body">${bodyHtml}</div>
      </div>
    `;

    el.nextBtnText.textContent = 'CONTINUE';
    el.nextSlideBtn.disabled = false;
    state.isQuizAnswered = true;

  } else if (slide.type === 'quiz') {
    const alreadyCleared = isSlideQuizCleared(state.activeModule.id, state.currentSlideIndex);
    const optionsHtml = slide.options.map((opt, idx) => {
      const letter = String.fromCharCode(65 + idx);
      const isCorrectOpt = idx === slide.correctAnswer;
      const extra = alreadyCleared && isCorrectOpt ? ' correct' : '';
      const dim = alreadyCleared && !isCorrectOpt ? ' style="opacity:0.45"' : '';
      const dis = alreadyCleared ? ' disabled' : '';
      return `
        <button class="quiz-option${extra}" data-index="${idx}"${dim}${dis}>
          <span class="option-letter">${letter}</span>
          <span class="option-text">${sanitizeHTML(opt)}</span>
        </button>
      `;
    }).join('');

    const safeQ = sanitizeHTML(slide.question || '');
    const safeExpl = sanitizeHTML(slide.explanation || 'You cleared this quiz earlier — continue when ready.');

    cardHtml = `
      <div class="quiz-slide">
        <p class="quiz-question">${safeQ}</p>
        <div class="quiz-options" id="quiz-options">${optionsHtml}</div>
        <div id="quiz-feedback-box" class="quiz-feedback ${alreadyCleared ? 'correct' : 'hidden'}" ${alreadyCleared ? 'style="display:flex"' : 'hidden'}>
          <span class="feedback-icon" id="feedback-icon">✓</span>
          <div class="feedback-text">
            <h4 id="feedback-title">${alreadyCleared ? 'Already answered' : 'Correct!'}</h4>
            <p id="feedback-desc">${alreadyCleared ? safeExpl : ''}</p>
          </div>
        </div>
      </div>
    `;

    if (alreadyCleared) {
      state.selectedOptionIndex = slide.correctAnswer;
      state.isQuizAnswered = true;
      state.currentQuestionFirstAttempt = false;
      el.nextBtnText.textContent = 'CONTINUE';
      el.nextSlideBtn.disabled = false;
    } else {
      state.selectedOptionIndex = null;
      state.isQuizAnswered = false;
      state.currentQuestionFirstAttempt = true;
      el.nextBtnText.textContent = 'SUBMIT';
      el.nextSlideBtn.disabled = true;
    }

  } else if (slide.type === 'card-quiz') {
    const qs = slide.questions || [{
      question: slide.question,
      correctAnswer: slide.correctAnswer,
      explanation: slide.explanation
    }];
    const alreadyCleared = cardQuizAlreadyCleared;

    if (alreadyCleared) {
      cardHtml = `
        <div class="cardquiz-screen">
          <p class="cardquiz-prompt">CARD QUIZ COMPLETE</p>
          <div class="stack-wrapper">
            <div class="stack-card-shadow-2"></div>
            <div class="stack-card-shadow-1"></div>
            <div class="stack-card-main">You already cleared this set (${qs.length} card${qs.length === 1 ? '' : 's'}). Continue to the next slide.</div>
          </div>
          <div id="quiz-feedback-box" class="cardquiz-feedback correct" style="display:flex; flex-direction: column;">
            <div class="cardquiz-feedback-title" id="feedback-title">✓ Already completed</div>
            <p id="feedback-desc">No need to re-answer — pick up where you left off.</p>
          </div>
        </div>
      `;
      state.selectedOptionIndex = null;
      state.isQuizAnswered = true;
      state.currentQuestionFirstAttempt = false;
      state.cardQuizSubIndex = 0;
      el.nextBtnText.textContent = 'CONTINUE';
      el.nextSlideBtn.disabled = false;
    } else {
      if (state.cardQuizSubIndex >= qs.length) state.cardQuizSubIndex = 0;
      const currentQ = qs[state.cardQuizSubIndex];

      cardHtml = `
        <div class="cardquiz-screen">
          <p class="cardquiz-prompt">DO YOU THINK THE FOLLOWING IS TRUE? (${state.cardQuizSubIndex + 1}/${qs.length})</p>
          <div class="stack-wrapper">
            <div class="stack-card-shadow-2"></div>
            <div class="stack-card-shadow-1"></div>
            <div class="stack-card-main">${sanitizeHTML(currentQ.question || '')}</div>
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

      state.selectedOptionIndex = null;
      state.isQuizAnswered = false;
      state.currentQuestionFirstAttempt = true;
      el.nextBtnText.textContent = 'SUBMIT';
      el.nextSlideBtn.disabled = true;
    }

  } else if (slide.type === 'summary') {
    cardHtml = `
      <div class="summary-slide">
        <span class="summary-emoji">${sanitizeHTML(slide.illustration || '🏆')}</span>
        <h2 class="summary-title">${sanitizeHTML(slide.title || '')}</h2>
        <div class="summary-body">${formatMarkdown(slide.content)}</div>
      </div>
    `;
    el.nextBtnText.textContent = 'COMPLETE';
    el.nextSlideBtn.disabled = false;
    state.isQuizAnswered = true;
  }

  el.activeCard.innerHTML = cardHtml;

  if (slide.type === 'quiz') {
    el.activeCard.querySelectorAll('.quiz-option').forEach(opt => {
      opt.addEventListener('click', () => selectQuizOption(parseInt(opt.getAttribute('data-index'))));
    });
  } else if (slide.type === 'card-quiz' && !cardQuizAlreadyCleared) {
    el.activeCard.querySelectorAll('.yn-btn').forEach(btn => {
      btn.addEventListener('click', () => selectYesNoOption(btn.getAttribute('data-val')));
    });
  }

  const currentQaiTutor = (slide.type === 'card-quiz')
    ? (((slide.questions && slide.questions[state.cardQuizSubIndex]) || {}).aiTutorExplanation || slide.aiTutorExplanation)
    : slide.aiTutorExplanation;

  if (currentQaiTutor) {
    el.aiTutorTrigger.classList.remove('hidden');
    if (slide.type === 'card-quiz' && !cardQuizAlreadyCleared) {
      el.aiTutorTrigger.classList.add('dark-mode');
    } else {
      el.aiTutorTrigger.classList.remove('dark-mode');
    }
  } else {
    el.aiTutorTrigger.classList.add('hidden');
  }

  el.tutorExplanationText.innerHTML = currentQaiTutor
    ? `<p>${sanitizeHTML(currentQaiTutor)}</p>`
    : `<p>This slide provides theological and historical context on the scriptures.</p>`;
}

export function selectQuizOption(index) {
  if (state.isQuizAnswered || !el.activeCard) return;
  state.selectedOptionIndex = index;
  el.activeCard.querySelectorAll('.quiz-option').forEach((opt, idx) => {
    opt.classList.toggle('selected', idx === index);
  });
  el.nextSlideBtn.disabled = false;
}

export function selectYesNoOption(value) {
  if (state.isQuizAnswered || !el.activeCard) return;
  state.selectedOptionIndex = value;
  const yesBtn = el.activeCard.querySelector('.yn-btn.yes');
  const noBtn  = el.activeCard.querySelector('.yn-btn.no');
  if (!yesBtn || !noBtn) return;
  if (value === 'yes') { yesBtn.classList.add('selected-yes'); noBtn.classList.remove('selected-no'); }
  else { noBtn.classList.add('selected-no'); yesBtn.classList.remove('selected-yes'); }
  checkCardQuizAnswer();
}

export function checkQuizAnswer() {
  if (!state.activeModule) return;
  const slide = state.activeModule.slides[state.currentSlideIndex];
  if (!slide) return;
  const feedbackBox   = document.getElementById('quiz-feedback-box');
  const feedbackTitle = document.getElementById('feedback-title');
  const feedbackDesc  = document.getElementById('feedback-desc');

  const isCorrect = state.selectedOptionIndex === slide.correctAnswer;

  if (slide.type === 'quiz') {
    const selectedBtn = el.activeCard.querySelector(`.quiz-option[data-index="${state.selectedOptionIndex}"]`);

    // Log this quiz attempt.
    logQuizAnswer(
      state.activeModule.id,
      state.currentSlideIndex,
      slide.question,
      slide.options[state.selectedOptionIndex],
      slide.options[slide.correctAnswer],
      isCorrect,
      state.currentQuestionFirstAttempt
    );

    if (isCorrect) {
      selectedBtn.classList.remove('selected');
      selectedBtn.classList.add('correct');
      feedbackBox.className = 'quiz-feedback correct';
      const feedbackIcon = document.getElementById('feedback-icon');
      if (feedbackIcon) feedbackIcon.textContent = '✓';
      feedbackTitle.textContent = 'Correct!';
      feedbackDesc.textContent  = slide.explanation;
      if (state.currentQuestionFirstAttempt) {
        state.userState.quizStats.correctFirstTry += 1;
        awardXP(5, 'correct_quiz_first_try');
      }
      state.userState.quizStats.totalQuestions += 1;
      state.isQuizAnswered = true;
      markSlideQuizCleared(state.activeModule.id, state.currentSlideIndex);
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
      state.currentQuestionFirstAttempt = false;
      el.nextBtnText.textContent = 'SUBMIT';
      el.nextSlideBtn.disabled = false;
      state.selectedOptionIndex = null;
    }
  }

  feedbackBox.hidden = false;
  feedbackBox.style.display = 'flex';
  feedbackBox.classList.remove('hidden');
  // Bring feedback into view on mobile
  requestAnimationFrame(() => {
    feedbackBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
}

export function checkCardQuizAnswer() {
  if (!state.activeModule || !el.activeCard) return;
  const slide = state.activeModule.slides[state.currentSlideIndex];
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
  const currentQ = qs[state.cardQuizSubIndex];

  const isCorrect = state.selectedOptionIndex === currentQ.correctAnswer;

  // Log this card-quiz attempt.
  logQuizAnswer(
    state.activeModule.id,
    state.currentSlideIndex,
    currentQ.question,
    state.selectedOptionIndex,
    currentQ.correctAnswer,
    isCorrect,
    state.currentQuestionFirstAttempt
  );

  yesBtn.setAttribute('disabled', 'true');
  noBtn.setAttribute('disabled', 'true');

  feedbackBox.hidden = false;
  feedbackBox.style.display = 'flex';
  feedbackBox.classList.remove('hidden');
  requestAnimationFrame(() => {
    feedbackBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  if (isCorrect) {
    if (state.selectedOptionIndex === 'yes') yesBtn.style.background = 'var(--brand-green)';
    else noBtn.style.background = 'var(--brand-green)';

    feedbackBox.className = 'cardquiz-feedback correct';
    feedbackTitle.textContent = '✓ Correct!';
    feedbackDesc.textContent = currentQ.explanation || '';

    if (state.currentQuestionFirstAttempt) {
      state.userState.quizStats.correctFirstTry += 1;
      awardXP(5, 'correct_cardquiz_first_try');
    }
    state.userState.quizStats.totalQuestions += 1;
    state.isQuizAnswered = true;
    recordActivity();

    const continueBtn = document.getElementById('cardquiz-continue-btn');
    if (continueBtn) {
      continueBtn.style.display = 'block';
      continueBtn.classList.remove('hidden');

      const newContinueBtn = continueBtn.cloneNode(true);
      continueBtn.parentNode.replaceChild(newContinueBtn, continueBtn);

      newContinueBtn.addEventListener('click', () => {
        if (state.cardQuizSubIndex < qs.length - 1) {
          state.cardQuizSubIndex += 1;
          renderSlide();
        } else {
          markSlideQuizCleared(state.activeModule.id, state.currentSlideIndex);
          state.cardQuizSubIndex = 0;
          if (state.currentSlideIndex < state.activeModule.slides.length - 1) {
            state.currentSlideIndex += 1;
            renderSlide();
          } else {
            completeActiveModule();
          }
        }
      });
    }
  } else {
    if (state.selectedOptionIndex === 'yes') yesBtn.style.background = '#ef4444';
    else noBtn.style.background = '#ef4444';

    feedbackBox.className = 'cardquiz-feedback incorrect';
    feedbackTitle.textContent = '✕ Not quite';
    feedbackDesc.textContent  = 'Try again!';
    state.currentQuestionFirstAttempt = false;

    setTimeout(() => {
      yesBtn.removeAttribute('disabled');
      noBtn.removeAttribute('disabled');
      yesBtn.style.background = '';
      noBtn.style.background = '';
      yesBtn.classList.remove('selected-yes');
      noBtn.classList.remove('selected-no');
      feedbackBox.style.display = 'none';
      feedbackBox.classList.add('hidden');
      state.selectedOptionIndex = null;
    }, 1200);
  }
}

export function handleNextClick() {
  if (!state.activeModule) return;
  const slide = state.activeModule.slides[state.currentSlideIndex];
  if (!slide) return;

  // Multi-choice quiz: submit first
  if (slide.type === 'quiz' && !state.isQuizAnswered) {
    checkQuizAnswer();
    return;
  }

  // Card-quiz: submit current card if not yet answered
  if (slide.type === 'card-quiz' && !state.isQuizAnswered) {
    checkCardQuizAnswer();
    return;
  }

  // Card-quiz mid-set: after a correct card, advance to the NEXT CARD — never skip remaining cards
  // (Enter key / bottom bar must not jump to the next lesson slide early).
  if (slide.type === 'card-quiz' && state.isQuizAnswered) {
    const qs = slide.questions || [{
      question: slide.question,
      correctAnswer: slide.correctAnswer,
      explanation: slide.explanation
    }];
    const fullyCleared = isSlideQuizCleared(state.activeModule.id, state.currentSlideIndex);

    if (!fullyCleared && state.cardQuizSubIndex < qs.length - 1) {
      state.cardQuizSubIndex += 1;
      state.selectedOptionIndex = null;
      state.isQuizAnswered = false;
      state.currentQuestionFirstAttempt = true;
      renderSlide();
      return;
    }

    // Last card finished (or set already cleared on resume)
    markSlideQuizCleared(state.activeModule.id, state.currentSlideIndex);
    state.cardQuizSubIndex = 0;
  } else if (slide.type === 'quiz' && state.isQuizAnswered) {
    markSlideQuizCleared(state.activeModule.id, state.currentSlideIndex);
  }

  if (state.currentSlideIndex < state.activeModule.slides.length - 1) {
    state.currentSlideIndex += 1;
    state.cardQuizSubIndex = 0;
    renderSlide();
  } else {
    completeActiveModule();
  }
}

export function handlePrevClick() {
  if (state.currentSlideIndex > 0) {
    state.currentSlideIndex -= 1;
    state.cardQuizSubIndex = 0;
    renderSlide();
  }
}

export function completeActiveModule() {
  const isFirstCompletion = !state.userState.completedModules.includes(state.activeModule.id);
  if (isFirstCompletion) {
    state.userState.completedModules.push(state.activeModule.id);
    awardXP(50, 'module_completed');
    logActivity('module_completed', { moduleId: state.activeModule.id, moduleTitle: state.activeModule.title });
  }
  if (!state.userState.lessonProgress) state.userState.lessonProgress = {};
  state.userState.lessonProgress[state.activeModule.id] = state.activeModule.slides.length;
  recordActivity();
  saveState();
  closeLesson();
}

