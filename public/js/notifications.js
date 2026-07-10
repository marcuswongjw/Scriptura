// In-app notifications + local daily reading reminders
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  updateDoc,
  doc,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { auth, db } from './firebase.js?v=2.0.30';
import { state } from './state.js?v=2.0.30';
import { saveState } from './user.js?v=2.0.30';
import { showToast } from './toast.js?v=2.0.30';

function defaultPrefs() {
  return {
    dailyReminder: true,
    reminderHour: 8,
    eventAlerts: true,
    reflectionAlerts: true
  };
}

export function getNotificationPrefs() {
  return {
    ...defaultPrefs(),
    ...(state.userState.notificationPrefs || {})
  };
}

export async function setNotificationPrefs(partial) {
  state.userState.notificationPrefs = {
    ...getNotificationPrefs(),
    ...partial
  };
  await saveState();
}

/** Local browser notification (works when permission granted). */
export function showLocalNotification(title, body, { tag, url } = {}) {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
  try {
    const n = new Notification(title, {
      body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: tag || 'scriptura',
      data: { url: url || '/' }
    });
    n.onclick = () => {
      window.focus();
      if (url) window.location.href = url;
      n.close();
    };
  } catch (err) {
    console.warn('Local notification failed:', err);
  }
}

/**
 * On app open / periodic: if user wants a daily reading reminder and hasn't been
 * reminded today after their preferred hour, fire a local notification.
 */
function localDateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function maybeSendDailyReadingReminder() {
  if (!auth.currentUser) return;
  const prefs = getNotificationPrefs();
  if (!prefs.dailyReminder) return;
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;

  const now = new Date();
  const hour = prefs.reminderHour ?? 8;
  if (now.getHours() < hour) return;

  const todayKey = localDateKey(now);
  if (state.userState.lastDailyReminderDate === todayKey) return;

  // Don't nag if already completed today's reading
  const lastActive = state.userState.lastDailyReadingDate
    ? new Date(state.userState.lastDailyReadingDate).toDateString()
    : null;
  if (lastActive === now.toDateString()) {
    state.userState.lastDailyReminderDate = todayKey;
    saveState().catch(() => {});
    return;
  }

  const title = 'Scriptura — Daily reading';
  const body = 'Your daily Scripture reading is ready. Open Scriptura to reflect.';

  showLocalNotification(title, body, { tag: `daily-${todayKey}`, url: '/' });
  state.userState.lastDailyReminderDate = todayKey;
  saveState().catch(() => {});
}

/** Create in-app notification for a recipient (best-effort, capped). */
export async function createInAppNotification(recipientUid, { type, title, body, link }) {
  if (!recipientUid || recipientUid === auth.currentUser?.uid) return;
  try {
    await addDoc(collection(db, 'notifications'), {
      recipientUid,
      type: type || 'info',
      title: title || 'Scriptura',
      body: body || '',
      link: link || '/',
      read: false,
      createdAt: new Date().toISOString()
    });
  } catch (err) {
    console.warn('notify failed', err);
  }
}

/** Notify other registered users about a new public event (client-side fanout, max 40). */
export async function notifyCommunityOfEvent(event) {
  const prefsFilter = 'eventAlerts';
  await fanoutNotification({
    prefsFilter,
    type: 'event',
    title: 'New study event',
    body: event?.title ? `"${event.title}" was scheduled` : 'A new study event was scheduled',
    link: '/network'
  });
}

export async function notifyCommunityOfReflection({ authorName, readingTitle }) {
  await fanoutNotification({
    prefsFilter: 'reflectionAlerts',
    type: 'reflection',
    title: 'New reflection',
    body: `${authorName || 'Someone'} shared on “${readingTitle || 'today’s reading'}”`,
    link: '/'
  });
}

async function fanoutNotification({ prefsFilter, type, title, body, link }) {
  if (!auth.currentUser) return;
  try {
    const snap = await getDocs(query(collection(db, 'users'), limit(40)));
    const jobs = [];
    snap.forEach(docSnap => {
      if (docSnap.id === auth.currentUser.uid) return;
      const data = docSnap.data() || {};
      const prefs = { ...defaultPrefs(), ...(data.notificationPrefs || {}) };
      if (prefsFilter === 'eventAlerts' && prefs.eventAlerts === false) return;
      if (prefsFilter === 'reflectionAlerts' && prefs.reflectionAlerts === false) return;
      jobs.push(createInAppNotification(docSnap.id, { type, title, body, link }));
    });
    await Promise.allSettled(jobs.slice(0, 40));
  } catch (err) {
    console.warn('fanout failed', err);
  }
}

export async function loadMyNotifications(max = 20) {
  if (!auth.currentUser) return [];
  try {
    let snap;
    try {
      snap = await getDocs(query(
        collection(db, 'notifications'),
        where('recipientUid', '==', auth.currentUser.uid),
        orderBy('createdAt', 'desc'),
        limit(max)
      ));
    } catch {
      // Fallback without composite index
      snap = await getDocs(query(
        collection(db, 'notifications'),
        where('recipientUid', '==', auth.currentUser.uid),
        limit(max)
      ));
    }
    const list = [];
    snap.forEach(d => list.push({ id: d.id, ...d.data() }));
    list.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    return list;
  } catch (err) {
    console.warn('load notifications', err);
    return [];
  }
}

export async function markNotificationRead(id) {
  try {
    await updateDoc(doc(db, 'notifications', id), { read: true });
  } catch (_) { /* ignore */ }
}

/** Show a small toast summary of unread in-app alerts on login. */
export async function surfaceUnreadNotifications() {
  const list = await loadMyNotifications(10);
  const unread = list.filter(n => !n.read);
  if (unread.length === 0) return;
  const first = unread[0];
  showToast(
    unread.length === 1
      ? `${first.title}: ${first.body}`
      : `${unread.length} new updates — latest: ${first.title}`,
    'info',
    6000
  );
  // Mark first few read so we don't spam every refresh
  await Promise.all(unread.slice(0, 5).map(n => markNotificationRead(n.id)));
}

// Silence unused import warning for serverTimestamp if tree-shaken
void serverTimestamp;
