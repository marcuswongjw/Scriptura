// Feature module: lesson (Phase 2)
import { modules } from '../modules.js?v=2.0.18';
import { formatMarkdown } from './utils.js?v=2.0.18';
import { showToast } from './toast.js?v=2.0.18';
import { el } from './dom.js?v=2.0.18';
import { state } from './state.js?v=2.0.18';
import { switchTab } from './routing.js?v=2.0.18';
import { awardXP, isModuleReleased, logActivity, logQuizAnswer, recordActivity, saveState } from './user.js?v=2.0.18';

export function startModule(moduleId, pushState = true) {
  if (!isModuleReleased(moduleId)) {
    showToast('This course is not yet released!', 'warning');
    switchTab('courses');
    return;
  }

  state.activeModule = modules.find(m => m.id === moduleId);
  if (!state.activeModule) return;

  state.currentSlideIndex = 0;
  state.cardQuizSubIndex = 0;
  state.selectedOptionIndex = null;
  state.isQuizAnswered = false;
  state.currentQuestionFirstAttempt = true;

  // Track module start for stats.
  if (!state.userState.modulesStarted.includes(moduleId)) {
    state.userState.modulesStarted.push(moduleId);
    logActivity('module_started', { moduleId, moduleTitle: state.activeModule.title });
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

export function closeLesson(pushState = true) {
  state.activeModule = null;
  el.lessonView.classList.add('hidden');
  el.lessonView.classList.remove('cardquiz-mode');
  el.bottomNav.classList.remove('hidden');
  el.header.classList.remove('hidden');
  switchTab('courses', pushState);
}

export function renderProgressDots() {
  if (!state.activeModule) return;
  const total = state.activeModule.slides.length;

  const createDot = (idx) => {
    let cls = 'progress-dot';
    if (total > 10) cls += ' small';
    if (idx < state.currentSlideIndex) cls += ' done';
    else if (idx === state.currentSlideIndex) cls += ' current';
    return `<div class="${cls}"></div>`;
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
  const previousProgress = state.userState.lessonProgress[state.activeModule.id] || 0;
  if (state.currentSlideIndex > previousProgress) {
    state.userState.lessonProgress[state.activeModule.id] = state.currentSlideIndex;
    // Award XP the first time a slide is viewed.
    awardXP(10, 'slide_viewed');
    logActivity('slide_viewed', { moduleId: state.activeModule.id, slideIndex: state.currentSlideIndex, slideTitle: slide.title });
    saveState();
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
    const trans = state.userState.translation;
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
    state.isQuizAnswered = true;

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
        <div id="quiz-feedback-box" class="quiz-feedback hidden" hidden>
          <span class="feedback-icon" id="feedback-icon">✓</span>
          <div class="feedback-text">
            <h4 id="feedback-title">Correct!</h4>
            <p id="feedback-desc"></p>
          </div>
        </div>
      </div>
    `;

    state.selectedOptionIndex = null;
    state.isQuizAnswered = false;
    state.currentQuestionFirstAttempt = true;
    el.nextBtnText.textContent = 'SUBMIT';
    el.nextSlideBtn.disabled = true;

  } else if (slide.type === 'card-quiz') {
    const qs = slide.questions || [{
      question: slide.question,
      correctAnswer: slide.correctAnswer,
      explanation: slide.explanation
    }];
    if (state.cardQuizSubIndex >= qs.length) state.cardQuizSubIndex = 0;
    const currentQ = qs[state.cardQuizSubIndex];

    cardHtml = `
      <div class="cardquiz-screen">
        <p class="cardquiz-prompt">DO YOU THINK THE FOLLOWING IS TRUE? (${state.cardQuizSubIndex + 1}/${qs.length})</p>
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

    state.selectedOptionIndex = null;
    state.isQuizAnswered = false;
    state.currentQuestionFirstAttempt = true;
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
    state.isQuizAnswered = true;
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
    (((slide.questions && slide.questions[state.cardQuizSubIndex]) || {}).aiTutorExplanation || slide.aiTutorExplanation) : 
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
    feedbackDesc.textContent  = currentQ.explanation;

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
  if (slide.type === 'quiz' && !state.isQuizAnswered) {
    checkQuizAnswer();
  } else if (slide.type === 'card-quiz' && !state.isQuizAnswered) {
    checkCardQuizAnswer();
  } else {
    if (state.currentSlideIndex < state.activeModule.slides.length - 1) {
      state.currentSlideIndex += 1;
      state.cardQuizSubIndex = 0;
      renderSlide();
    } else {
      completeActiveModule();
    }
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

