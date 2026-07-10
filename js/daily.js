// Feature module: daily reading + community reflections
import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  query,
  orderBy,
  limit
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { dailyReadings } from '../daily_readings.js?v=2.0.15';
import { auth, db } from './firebase.js?v=2.0.15';
import { sanitizeHTML, getDayOfYear } from './utils.js?v=2.0.15';
import { showToast } from './toast.js?v=2.0.15';
import { state } from './state.js?v=2.0.15';
import { awardXP, logActivity, recordActivity, saveState } from './user.js?v=2.0.15';

const REFLECTION_MAX = 1200;

export function getTodaysReading() {
  if (!dailyReadings || dailyReadings.length === 0) return null;
  const dayOfYear = getDayOfYear();
  const index = (dayOfYear - 1) % dailyReadings.length;
  return dailyReadings[index];
}

/** Local calendar date key YYYY-MM-DD for aggregation buckets. */
export function getLocalDateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function isDailyReadingCompletedToday() {
  const todayStr = new Date().toDateString();
  const lastDate = state.userState.lastDailyReadingDate
    ? new Date(state.userState.lastDailyReadingDate).toDateString()
    : null;
  return lastDate === todayStr;
}

function formatReflectionTime(isoOrTs) {
  if (!isoOrTs) return '';
  try {
    const dt = typeof isoOrTs?.toDate === 'function' ? isoOrTs.toDate() : new Date(isoOrTs);
    return dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

async function loadMyReflection(dateKey, uid) {
  if (!uid) return null;
  try {
    const ref = doc(db, 'daily_reflections', dateKey, 'entries', uid);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : null;
  } catch (err) {
    console.warn('Could not load reflection:', err);
    return null;
  }
}

async function loadTodayReflections(dateKey) {
  try {
    const col = collection(db, 'daily_reflections', dateKey, 'entries');
    // Prefer ordered query; fall back to unordered if index missing
    let snap;
    try {
      snap = await getDocs(query(col, orderBy('updatedAt', 'desc'), limit(40)));
    } catch {
      snap = await getDocs(query(col, limit(40)));
    }
    const list = [];
    snap.forEach(docSnap => {
      list.push({ id: docSnap.id, ...docSnap.data() });
    });
    list.sort((a, b) => {
      const ta = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const tb = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return tb - ta;
    });
    return list;
  } catch (err) {
    console.warn('Could not load community reflections:', err);
    return [];
  }
}

function renderReflectionsList(list, container) {
  if (!container) return;
  if (!list.length) {
    container.innerHTML = `<p class="reflections-empty">No community reflections yet — be the first to share.</p>`;
    return;
  }

  const uid = auth.currentUser?.uid;
  container.innerHTML = list.map(item => {
    const isMine = item.authorUid === uid || item.id === uid;
    const avatar = item.authorPhoto || `https://api.dicebear.com/7.x/bottts/svg?seed=${item.authorUid || item.id}`;
    const name = item.authorName || 'Learner';
    const time = formatReflectionTime(item.updatedAt || item.createdAt);
    return `
      <article class="reflection-item ${isMine ? 'is-mine' : ''}">
        <img class="reflection-avatar" src="${avatar}" alt="" loading="lazy">
        <div class="reflection-body">
          <div class="reflection-author-row">
            <span class="reflection-author">${sanitizeHTML(name)}${isMine ? ' (you)' : ''}</span>
            ${time ? `<span class="reflection-time">${time}</span>` : ''}
          </div>
          <div class="reflection-text">${sanitizeHTML(item.text)}</div>
        </div>
      </article>
    `;
  }).join('');
}

export async function renderDailyReading() {
  const container = document.getElementById('daily-reading-container');
  if (!container) return;

  const reading = getTodaysReading();
  if (!reading) {
    container.innerHTML = '';
    return;
  }

  const isCompleted = isDailyReadingCompletedToday();
  const completedCount = (state.userState.dailyReadingsCompleted || []).length;
  const totalCount = dailyReadings.length;
  const dateKey = getLocalDateKey();
  const uid = auth.currentUser?.uid;

  // Show shell immediately, then hydrate reflection data
  container.innerHTML = `
    <div class="daily-reading-card-inner">
      <div class="daily-reading-glow" aria-hidden="true"></div>
      <div class="daily-reading-top">
        <span aria-hidden="true">🌅</span>
        <span class="daily-reading-kicker">Today's Daily Reading</span>
        <span class="daily-reading-day-pill">Day ${reading.day} of ${totalCount}</span>
      </div>
      <h3 class="daily-reading-title">${sanitizeHTML(reading.title)}</h3>
      <div class="daily-reading-verse">
        <em>"${sanitizeHTML(reading.verse)}"</em>
        <span class="daily-reading-ref"> — ${sanitizeHTML(reading.reference)}</span>
      </div>
      <p class="daily-reading-body">${sanitizeHTML(reading.reflection)}</p>
      ${reading.question ? `
        <div class="daily-reading-prompt">
          <p><strong>Reflect:</strong> ${sanitizeHTML(reading.question)}</p>
        </div>
      ` : ''}

      <div class="daily-reflection-box">
        <label class="daily-reflection-label" for="daily-reflection-input">Your reflection</label>
        <textarea
          id="daily-reflection-input"
          class="daily-reflection-textarea"
          maxlength="${REFLECTION_MAX}"
          placeholder="What is God bringing to mind today? Write a short reflection to share with the community…"
          ${uid ? '' : 'disabled'}
        ></textarea>
        <div class="daily-reflection-meta">
          <span id="daily-reflection-status">${uid ? 'Shared with learners · editable today' : 'Sign in to save a reflection'}</span>
          <span id="daily-reflection-count">0 / ${REFLECTION_MAX}</span>
        </div>
      </div>

      <div class="daily-reading-actions">
        <div class="daily-reading-progress">${completedCount} of ${totalCount} readings completed</div>
        <div class="daily-reading-actions-btns">
          <button type="button" id="daily-reflection-save-btn" class="secondary-btn compact-btn" ${uid ? '' : 'disabled'}>
            Save reflection
          </button>
          <button type="button" id="daily-reading-action-btn" class="primary-btn compact-btn ${isCompleted ? 'daily-reading-done' : ''}" ${uid ? '' : 'disabled'}>
            ${isCompleted ? '✓ Completed' : 'Mark as read'}
          </button>
        </div>
      </div>

      <section class="daily-reflections-feed" aria-label="Community reflections">
        <div class="daily-reflections-feed-header">
          <h4 class="daily-reflections-feed-title">Community reflections</h4>
          <span class="daily-reflections-count" id="daily-reflections-count">…</span>
        </div>
        <div id="daily-reflections-list" class="reflections-list">
          <p class="reflections-empty">Loading reflections…</p>
        </div>
      </section>
    </div>
  `;

  const textarea = document.getElementById('daily-reflection-input');
  const countEl = document.getElementById('daily-reflection-count');
  const statusEl = document.getElementById('daily-reflection-status');
  const listEl = document.getElementById('daily-reflections-list');
  const countBadge = document.getElementById('daily-reflections-count');

  const updateCount = () => {
    if (countEl && textarea) countEl.textContent = `${textarea.value.length} / ${REFLECTION_MAX}`;
  };
  textarea?.addEventListener('input', updateCount);

  // Hydrate my draft + community list
  const [mine, community] = await Promise.all([
    uid ? loadMyReflection(dateKey, uid) : Promise.resolve(null),
    loadTodayReflections(dateKey)
  ]);

  // Avoid stale overwrite if user re-rendered meanwhile
  if (!document.getElementById('daily-reflection-input')) return;

  if (mine?.text && textarea) {
    textarea.value = mine.text;
    updateCount();
    if (statusEl) statusEl.textContent = 'Saved · visible in community feed';
  } else {
    updateCount();
  }

  if (countBadge) {
    countBadge.textContent = `${community.length} today`;
  }
  renderReflectionsList(community, listEl);

  const saveBtn = document.getElementById('daily-reflection-save-btn');
  if (saveBtn && uid) {
    saveBtn.addEventListener('click', async () => {
      const text = (textarea?.value || '').trim();
      if (!text) {
        showToast('Write a short reflection first.', 'warning');
        return;
      }
      if (text.length > REFLECTION_MAX) {
        showToast(`Keep reflections under ${REFLECTION_MAX} characters.`, 'warning');
        return;
      }

      saveBtn.disabled = true;
      saveBtn.textContent = 'Saving…';
      try {
        const now = new Date().toISOString();
        const entryRef = doc(db, 'daily_reflections', dateKey, 'entries', uid);
        const payload = {
          text,
          authorUid: uid,
          authorName: state.userState.name || auth.currentUser?.displayName || 'Learner',
          authorPhoto: state.userState.photo || `https://api.dicebear.com/7.x/bottts/svg?seed=${uid}`,
          readingDay: reading.day,
          readingTitle: reading.title,
          readingReference: reading.reference,
          dateKey,
          updatedAt: now,
          createdAt: mine?.createdAt || now
        };
        await setDoc(entryRef, payload, { merge: true });

        // Also track on user doc for personal history
        if (!state.userState.dailyReflectionDates) state.userState.dailyReflectionDates = [];
        if (!state.userState.dailyReflectionDates.includes(dateKey)) {
          state.userState.dailyReflectionDates.push(dateKey);
          // keep list bounded
          if (state.userState.dailyReflectionDates.length > 60) {
            state.userState.dailyReflectionDates = state.userState.dailyReflectionDates.slice(-60);
          }
        }
        logActivity('daily_reflection_saved', { dateKey, readingDay: reading.day });
        await saveState();

        if (statusEl) statusEl.textContent = 'Saved · visible in community feed';
        showToast('Reflection shared with the community.', 'success');

        const refreshed = await loadTodayReflections(dateKey);
        if (countBadge) countBadge.textContent = `${refreshed.length} today`;
        renderReflectionsList(refreshed, listEl);
      } catch (err) {
        console.error('Failed to save reflection:', err);
        showToast('Could not save reflection. Try again.', 'error');
      } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save reflection';
      }
    });
  }

  const actionBtn = document.getElementById('daily-reading-action-btn');
  if (actionBtn && !isCompleted && uid) {
    actionBtn.addEventListener('click', async () => {
      if (isDailyReadingCompletedToday()) return;

      state.userState.lastDailyReadingDate = new Date().toISOString();
      if (!state.userState.dailyReadingsCompleted) state.userState.dailyReadingsCompleted = [];
      if (!state.userState.dailyReadingsCompleted.includes(reading.day)) {
        state.userState.dailyReadingsCompleted.push(reading.day);
      }
      awardXP(15, 'daily_reading_completed');
      logActivity('daily_reading_completed', {
        day: reading.day,
        title: reading.title,
        reference: reading.reference
      });
      recordActivity();
      await saveState();
      showToast('+15 XP — Daily reading completed!', 'success');
      // Re-render to update button; preserve textarea via re-load
      await renderDailyReading();
    });
  }
}
