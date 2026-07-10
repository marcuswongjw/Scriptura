// Feature module: catalog (Phase 2)
import { concentrations, modules } from '../modules.js?v=2.0.26';
import { conIcons } from './constants.js?v=2.0.24';
import { showToast } from './toast.js?v=2.0.24';
import { el } from './dom.js?v=2.0.24';
import { state } from './state.js?v=2.0.24';
import { startModule } from './lesson.js?v=2.0.24';
import { switchTab } from './routing.js?v=2.0.24';
import { isModuleReleased } from './user.js?v=2.0.24';

export function updateFilterTagsUI() {
  document.querySelectorAll('.filter-tag-btn').forEach(btn => {
    const fType = btn.getAttribute('data-filter-type');
    const val = btn.getAttribute('data-value');
    if (fType && val) {
      if (state.catalogFilters[fType] === val) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    }
  });

  const topicLabel = document.getElementById('topic-btn-label');
  if (topicLabel) {
    if (state.catalogFilters.topic === 'all') {
      topicLabel.textContent = 'Set Filters';
    } else {
      topicLabel.textContent = state.catalogFilters.topic;
    }
  }

  const statusLabel = document.getElementById('status-btn-label');
  if (statusLabel) {
    if (state.catalogFilters.status === 'all') {
      statusLabel.textContent = 'Any Status';
    } else {
      statusLabel.textContent = state.catalogFilters.status.charAt(0).toUpperCase() + state.catalogFilters.status.slice(1);
    }
  }
}

export function renderCoursesCatalog() {
  if (!el.catalogGrid) return;
  el.catalogGrid.innerHTML = '';

  const searchVal = el.courseSearch ? el.courseSearch.value.trim().toLowerCase() : '';
  const filterTopic = state.catalogFilters.topic;
  const filterProgress = state.catalogFilters.progress;
  const filterStatus = state.catalogFilters.status;

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
    const completed = conLessons.filter(m => state.userState.completedModules.includes(m.id)).length;
    const anyStarted = conLessons.some(m => (state.userState.lessonProgress?.[m.id] || 0) > 0 || state.userState.completedModules.includes(m.id));
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
    if (state.userState.role !== 'admin' && !isReleased) return false;

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
        const completed = conLessons.filter(m => state.userState.completedModules.includes(m.id)).length;
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

export function openOnboarding(concentrationId, pushState = true) {
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
  let nextUpLesson = conLessons.find(l => !state.userState.completedModules.includes(l.id));
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

  const completedCount = conLessons.filter(l => state.userState.completedModules.includes(l.id)).length;
  el.onboardLessonCount.textContent = `${completedCount} OF ${conLessons.length} LESSONS COMPLETED`;

  const chapterLabel = document.getElementById('onboard-chapter-label');
  if (chapterLabel) {
    chapterLabel.textContent = `LESSONS`;
  }

  el.onboardBulletPoints.innerHTML = '';
  conLessons.forEach((lesson, idx) => {
    const isLCompleted = state.userState.completedModules.includes(lesson.id);
    const progressVal = state.userState.lessonProgress?.[lesson.id] || 0;
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

