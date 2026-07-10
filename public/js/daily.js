// Daily reading + reflections (edit/delete, privacy, archive, community feed)
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  where,
  limit,
  updateDoc
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { dailyReadings } from '../daily_readings.js?v=2.0.18';
import { auth, db } from './firebase.js?v=2.0.18';
import { sanitizeHTML, getDayOfYear } from './utils.js?v=2.0.18';
import { showToast } from './toast.js?v=2.0.18';
import { state } from './state.js?v=2.0.18';
import { awardXP, logActivity, recordActivity, saveState } from './user.js?v=2.0.18';
import { notifyCommunityOfReflection } from './notifications.js?v=2.0.18';

const REFLECTION_MAX = 1200;

export function getTodaysReading() {
  if (!dailyReadings || dailyReadings.length === 0) return null;
  const dayOfYear = getDayOfYear();
  const index = (dayOfYear - 1) % dailyReadings.length;
  return dailyReadings[index];
}

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
    return dt.toLocaleString([], {
      month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  } catch {
    return '';
  }
}

function readingForDayNumber(dayNum) {
  return dailyReadings.find(r => r.day === dayNum) || null;
}

async function loadMyReflection(dateKey, uid) {
  if (!uid) return null;
  try {
    const snap = await getDoc(doc(db, 'daily_reflections', dateKey, 'entries', uid));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  } catch (err) {
    console.warn('Could not load reflection:', err);
    return null;
  }
}

async function loadDayReflections(dateKey) {
  try {
    const col = collection(db, 'daily_reflections', dateKey, 'entries');
    // Query public only so private entries don't break list security rules.
    let snap;
    try {
      snap = await getDocs(query(col, where('isPublic', '==', true), limit(50)));
    } catch (err) {
      console.warn('Public reflection query failed:', err);
      return [];
    }
    const uid = auth.currentUser?.uid;
    const list = [];
    snap.forEach(docSnap => {
      const data = { id: docSnap.id, ...docSnap.data() };
      const isMine = data.authorUid === uid || data.id === uid;
      if (data.reported && !isMine) return; // hide reported from others
      list.push(data);
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

async function loadMyArchive(uid, maxDays = 21) {
  if (!uid) return [];
  const keys = [...(state.userState.dailyReflectionDates || [])].reverse().slice(0, maxDays);
  // Also probe last 14 calendar days in case list is incomplete
  const set = new Set(keys);
  for (let i = 0; i < 14; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    set.add(getLocalDateKey(d));
  }
  const results = [];
  await Promise.all([...set].map(async dateKey => {
    const mine = await loadMyReflection(dateKey, uid);
    if (mine?.text) results.push({ dateKey, ...mine });
  }));
  results.sort((a, b) => (a.dateKey < b.dateKey ? 1 : -1));
  return results;
}

function renderReflectionsList(list, container, { dateKey, onChange } = {}) {
  if (!container) return;
  if (!list.length) {
    container.innerHTML = `<p class="reflections-empty">No public reflections yet — be the first to share.</p>`;
    return;
  }

  const uid = auth.currentUser?.uid;
  const isAdmin = state.userState.role === 'admin';

  container.innerHTML = list.map(item => {
    const isMine = item.authorUid === uid || item.id === uid;
    const avatar = item.authorPhoto || `https://api.dicebear.com/7.x/bottts/svg?seed=${item.authorUid || item.id}`;
    const name = item.authorName || 'Learner';
    const time = formatReflectionTime(item.updatedAt || item.createdAt);
    const privacy = item.isPublic === false
      ? '<span class="reflection-privacy private">Private</span>'
      : '<span class="reflection-privacy public">Public</span>';
    const actions = [];
    if (isMine) {
      actions.push(`<button type="button" class="text-link-btn reflection-edit-btn" data-uid="${item.id}">Edit</button>`);
      actions.push(`<button type="button" class="text-link-btn reflection-delete-btn" data-uid="${item.id}">Delete</button>`);
    } else if (!item.reported) {
      actions.push(`<button type="button" class="text-link-btn reflection-report-btn" data-uid="${item.id}">Report</button>`);
    }
    if (isAdmin && item.reported) {
      actions.push(`<button type="button" class="text-link-btn reflection-clear-report-btn" data-uid="${item.id}">Clear report</button>`);
    }
    if (isAdmin && !isMine) {
      actions.push(`<button type="button" class="text-link-btn reflection-delete-btn" data-uid="${item.id}">Remove</button>`);
    }

    return `
      <article class="reflection-item ${isMine ? 'is-mine' : ''} ${item.reported ? 'is-reported' : ''}" data-uid="${item.id}">
        <img class="reflection-avatar" src="${avatar}" alt="" loading="lazy">
        <div class="reflection-body">
          <div class="reflection-author-row">
            <span class="reflection-author">${sanitizeHTML(name)}${isMine ? ' (you)' : ''}</span>
            ${privacy}
            ${time ? `<span class="reflection-time">${time}</span>` : ''}
            ${item.reported ? '<span class="reflection-flag">Reported</span>' : ''}
          </div>
          <div class="reflection-text">${sanitizeHTML(item.text)}</div>
          ${actions.length ? `<div class="reflection-actions">${actions.join('')}</div>` : ''}
        </div>
      </article>
    `;
  }).join('');

  container.querySelectorAll('.reflection-edit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = list.find(x => x.id === btn.dataset.uid);
      const ta = document.getElementById('daily-reflection-input');
      const pub = document.getElementById('daily-reflection-public');
      if (item && ta) {
        ta.value = item.text || '';
        ta.focus();
        ta.dispatchEvent(new Event('input'));
        if (pub) pub.checked = item.isPublic !== false;
        showToast('Loaded into the editor — save when ready.', 'info');
        ta.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  });

  container.querySelectorAll('.reflection-delete-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('Delete this reflection?')) return;
      try {
        await deleteDoc(doc(db, 'daily_reflections', dateKey, 'entries', btn.dataset.uid));
        showToast('Reflection deleted.', 'success');
        onChange?.();
      } catch (err) {
        console.error(err);
        showToast('Could not delete reflection.', 'error');
      }
    });
  });

  container.querySelectorAll('.reflection-report-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('Report this reflection for review?')) return;
      try {
        await updateDoc(doc(db, 'daily_reflections', dateKey, 'entries', btn.dataset.uid), {
          reported: true,
          reportedBy: uid,
          reportedAt: new Date().toISOString()
        });
        showToast('Thanks — hidden from the public feed.', 'success');
        onChange?.();
      } catch (err) {
        console.error(err);
        showToast('Could not report. Try again.', 'error');
      }
    });
  });

  container.querySelectorAll('.reflection-clear-report-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      try {
        await updateDoc(doc(db, 'daily_reflections', dateKey, 'entries', btn.dataset.uid), {
          reported: false,
          reportedBy: null,
          reportedAt: null
        });
        showToast('Report cleared.', 'success');
        onChange?.();
      } catch (err) {
        showToast('Could not clear report.', 'error');
      }
    });
  });
}

function renderArchive(list, container) {
  if (!container) return;
  if (!list.length) {
    container.innerHTML = `<p class="reflections-empty">No past reflections yet. Write one above to start your archive.</p>`;
    return;
  }
  container.innerHTML = list.map(item => {
    const reading = readingForDayNumber(item.readingDay);
    const title = item.readingTitle || reading?.title || 'Daily reading';
    const ref = item.readingReference || reading?.reference || '';
    return `
      <article class="archive-item">
        <div class="archive-item-top">
          <span class="archive-date">${sanitizeHTML(item.dateKey)}</span>
          <span class="reflection-privacy ${item.isPublic === false ? 'private' : 'public'}">
            ${item.isPublic === false ? 'Private' : 'Public'}
          </span>
        </div>
        <div class="archive-reading">${sanitizeHTML(title)}${ref ? ` · ${sanitizeHTML(ref)}` : ''}</div>
        <div class="reflection-text">${sanitizeHTML(item.text)}</div>
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
          placeholder="What is God bringing to mind today?"
          ${uid ? '' : 'disabled'}
        ></textarea>
        <div class="daily-reflection-meta">
          <label class="privacy-toggle">
            <input type="checkbox" id="daily-reflection-public" ${uid ? '' : 'disabled'} checked>
            <span>Share with community</span>
          </label>
          <span id="daily-reflection-count">0 / ${REFLECTION_MAX}</span>
        </div>
        <p id="daily-reflection-status" class="daily-reflection-hint">
          ${uid ? 'Public reflections appear in the feed below. Uncheck to keep private.' : 'Sign in to save a reflection'}
        </p>
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
          <p class="reflections-empty">Loading…</p>
        </div>
      </section>

      <section class="daily-archive-section" aria-label="Your reflection archive">
        <button type="button" class="archive-toggle" id="daily-archive-toggle" ${uid ? '' : 'disabled'}>
          <span>My past reflections</span>
          <span class="archive-chevron" aria-hidden="true">▾</span>
        </button>
        <div id="daily-archive-list" class="archive-list hidden"></div>
      </section>
    </div>
  `;

  const textarea = document.getElementById('daily-reflection-input');
  const countEl = document.getElementById('daily-reflection-count');
  const statusEl = document.getElementById('daily-reflection-status');
  const publicCb = document.getElementById('daily-reflection-public');
  const listEl = document.getElementById('daily-reflections-list');
  const countBadge = document.getElementById('daily-reflections-count');
  const archiveList = document.getElementById('daily-archive-list');

  const updateCount = () => {
    if (countEl && textarea) countEl.textContent = `${textarea.value.length} / ${REFLECTION_MAX}`;
  };
  textarea?.addEventListener('input', updateCount);

  const refreshFeed = async () => {
    const community = await loadDayReflections(dateKey);
    if (countBadge) {
      const publicCount = community.filter(c => c.isPublic !== false).length;
      countBadge.textContent = `${publicCount} public`;
    }
    renderReflectionsList(community, listEl, {
      dateKey,
      onChange: () => refreshFeed()
    });
  };

  const [mine] = await Promise.all([
    uid ? loadMyReflection(dateKey, uid) : Promise.resolve(null),
    refreshFeed()
  ]);

  if (!document.getElementById('daily-reflection-input')) return;

  if (mine?.text && textarea) {
    textarea.value = mine.text;
    updateCount();
    if (publicCb) publicCb.checked = mine.isPublic !== false;
    if (statusEl) {
      statusEl.textContent = mine.isPublic === false
        ? 'Saved as private · only you can see it'
        : 'Saved · visible in community feed';
    }
  } else {
    updateCount();
  }

  document.getElementById('daily-archive-toggle')?.addEventListener('click', async () => {
    if (!uid || !archiveList) return;
    const open = archiveList.classList.toggle('hidden');
    // classList.toggle returns new state: if hidden was removed, open=false means visible... 
    // Actually toggle returns true if class is now present. So open=true means now hidden.
    const isHidden = archiveList.classList.contains('hidden');
    document.querySelector('#daily-archive-toggle .archive-chevron').textContent = isHidden ? '▾' : '▴';
    if (!isHidden && !archiveList.dataset.loaded) {
      archiveList.innerHTML = `<p class="reflections-empty">Loading archive…</p>`;
      const archive = await loadMyArchive(uid);
      renderArchive(archive, archiveList);
      archiveList.dataset.loaded = '1';
    }
  });

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

      const isPublic = publicCb ? publicCb.checked : true;
      saveBtn.disabled = true;
      saveBtn.textContent = 'Saving…';
      try {
        const now = new Date().toISOString();
        const entryRef = doc(db, 'daily_reflections', dateKey, 'entries', uid);
        const payload = {
          text,
          isPublic,
          authorUid: uid,
          authorName: state.userState.name || auth.currentUser?.displayName || 'Learner',
          authorPhoto: state.userState.photo || `https://api.dicebear.com/7.x/bottts/svg?seed=${uid}`,
          readingDay: reading.day,
          readingTitle: reading.title,
          readingReference: reading.reference,
          dateKey,
          updatedAt: now,
          createdAt: mine?.createdAt || now,
          reported: mine?.reported || false
        };
        await setDoc(entryRef, payload, { merge: true });

        if (!state.userState.dailyReflectionDates) state.userState.dailyReflectionDates = [];
        if (!state.userState.dailyReflectionDates.includes(dateKey)) {
          state.userState.dailyReflectionDates.push(dateKey);
          if (state.userState.dailyReflectionDates.length > 90) {
            state.userState.dailyReflectionDates = state.userState.dailyReflectionDates.slice(-90);
          }
        }
        logActivity('daily_reflection_saved', { dateKey, readingDay: reading.day, isPublic });
        await saveState();

        if (isPublic) {
          notifyCommunityOfReflection({
            authorName: payload.authorName,
            readingTitle: reading.title,
            dateKey
          }).catch(() => {});
        }

        if (statusEl) {
          statusEl.textContent = isPublic
            ? 'Saved · visible in community feed'
            : 'Saved as private · only you can see it';
        }
        showToast(isPublic ? 'Reflection shared with the community.' : 'Private reflection saved.', 'success');
        if (archiveList) archiveList.dataset.loaded = '';
        await refreshFeed();
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
      await renderDailyReading();
    });
  }
}
