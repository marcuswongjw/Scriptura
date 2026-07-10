/**
 * Scriptura Cloud Functions
 *
 * dailyReadingReminder — runs every hour (Asia/Singapore).
 * Sends FCM to users who:
 *   - have fcmTokens
 *   - notificationPrefs.dailyReminder !== false
 *   - notificationPrefs.reminderHour matches current SGT hour (default 8)
 *   - have not completed today's reading (lastDailyReadingDate not today SGT)
 *   - have not already been server-reminded today (lastServerDailyReminderDate)
 */

const { onSchedule } = require('firebase-functions/v2/scheduler');
const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { getMessaging } = require('firebase-admin/messaging');
const { logger } = require('firebase-functions');

initializeApp();
const db = getFirestore();
const messaging = getMessaging();

/**
 * Bootstrap admins — always re-applied by scheduled job so owners cannot stay locked out.
 * Edit this list (redeploy functions) to add/remove permanent admins.
 */
const BOOTSTRAP_ADMIN_EMAILS = [
  'marcuswongjw@gmail.com'
].map((e) => e.toLowerCase());

async function ensureBootstrapAdmins() {
  const snap = await db.collection('users').limit(500).get();
  let fixed = 0;
  for (const docSnap of snap.docs) {
    const u = docSnap.data() || {};
    const email = (u.email || '').toLowerCase();
    if (!email || !BOOTSTRAP_ADMIN_EMAILS.includes(email)) continue;
    if (u.role === 'admin') continue;
    await docSnap.ref.update({ role: 'admin' });
    fixed += 1;
    logger.info('Restored bootstrap admin', { uid: docSnap.id, email });
  }
  return fixed;
}

/**
 * Callable: if the signed-in user's email is in BOOTSTRAP_ADMIN_EMAILS,
 * force role=admin and return { admin: true }. Called on every login.
 */
exports.claimBootstrapAdmin = onCall(
  { region: 'asia-southeast1' },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Sign in required.');
    }
    const email = (request.auth.token.email || '').toLowerCase();
    const uid = request.auth.uid;
    if (!email || !BOOTSTRAP_ADMIN_EMAILS.includes(email)) {
      // Still return current role from firestore if present
      const snap = await db.collection('users').doc(uid).get();
      const role = snap.exists && snap.data()?.role === 'admin' ? 'admin' : 'user';
      return { admin: role === 'admin', bootstrap: false };
    }
    await db.collection('users').doc(uid).set(
      { role: 'admin', email },
      { merge: true }
    );
    logger.info('claimBootstrapAdmin granted', { uid, email });
    return { admin: true, bootstrap: true };
  }
);

function singaporeNowParts() {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Singapore',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    hour12: false
  });
  const parts = Object.fromEntries(fmt.formatToParts(new Date()).map(p => [p.type, p.value]));
  return {
    dateKey: `${parts.year}-${parts.month}-${parts.day}`,
    hour: Number(parts.hour)
  };
}

function dateKeyFromIso(iso, timeZone = 'Asia/Singapore') {
  if (!iso) return null;
  try {
    const fmt = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    const parts = Object.fromEntries(fmt.formatToParts(new Date(iso)).map(p => [p.type, p.value]));
    return `${parts.year}-${parts.month}-${parts.day}`;
  } catch {
    return null;
  }
}

async function sendToTokens(tokens, payload) {
  if (!tokens.length) return { successCount: 0, failureCount: 0, invalid: [] };
  const res = await messaging.sendEachForMulticast({
    tokens,
    notification: payload.notification,
    data: payload.data || {},
    webpush: {
      fcmOptions: { link: payload.link || 'https://scriptura-study-2026.web.app/' },
      notification: {
        icon: '/icon-192.png',
        badge: '/icon-192.png'
      }
    }
  });
  const invalid = [];
  res.responses.forEach((r, i) => {
    if (!r.success) {
      const code = r.error?.code || '';
      if (
        code.includes('registration-token-not-registered') ||
        code.includes('invalid-registration-token')
      ) {
        invalid.push(tokens[i]);
      }
    }
  });
  return {
    successCount: res.successCount,
    failureCount: res.failureCount,
    invalid
  };
}

/**
 * Hourly job — filters by each user's preferred reminder hour (SGT).
 */
exports.dailyReadingReminder = onSchedule(
  {
    schedule: '0 * * * *',
    timeZone: 'Asia/Singapore',
    region: 'asia-southeast1',
    retryCount: 1
  },
  async () => {
    const { dateKey, hour } = singaporeNowParts();
    logger.info('dailyReadingReminder tick', { dateKey, hour });

    // Keep bootstrap owners as admin even if a client write demoted them.
    try {
      const restored = await ensureBootstrapAdmins();
      if (restored) logger.info('bootstrap admins restored', { restored });
    } catch (err) {
      logger.warn('ensureBootstrapAdmins failed', err);
    }

    const snap = await db.collection('users').limit(500).get();
    let attempted = 0;
    let sent = 0;

    for (const docSnap of snap.docs) {
      const u = docSnap.data() || {};
      const prefs = u.notificationPrefs || {};
      if (prefs.dailyReminder === false) continue;

      const preferHour = Number.isFinite(prefs.reminderHour) ? prefs.reminderHour : 8;
      if (preferHour !== hour) continue;

      if (u.lastServerDailyReminderDate === dateKey) continue;

      const lastReadKey = dateKeyFromIso(u.lastDailyReadingDate);
      if (lastReadKey === dateKey) continue;

      const tokens = Array.isArray(u.fcmTokens) ? u.fcmTokens.filter(Boolean) : [];
      if (!tokens.length) continue;

      attempted += 1;
      const result = await sendToTokens(tokens, {
        notification: {
          title: 'Scriptura — Daily reading',
          body: 'Your Scripture reading for today is ready. Open Scriptura to reflect.'
        },
        data: {
          type: 'daily_reading',
          dateKey,
          url: '/'
        },
        link: 'https://scriptura-study-2026.web.app/'
      });

      sent += result.successCount;

      const updates = { lastServerDailyReminderDate: dateKey };
      if (result.invalid.length) {
        updates.fcmTokens = FieldValue.arrayRemove(...result.invalid);
      }
      await docSnap.ref.update(updates).catch(err => {
        logger.warn('Failed to update user after send', docSnap.id, err);
      });
    }

    logger.info('dailyReadingReminder done', { attempted, sent, dateKey, hour });
    return null;
  }
);

/**
 * When a public reflection is created/updated we already fan out client-side.
 * This trigger is a lightweight server complement for create only.
 * Path: daily_reflections/{dateId}/entries/{userId}
 */
exports.onPublicReflectionCreated = onDocumentCreated(
  {
    document: 'daily_reflections/{dateId}/entries/{userId}',
    region: 'asia-southeast1'
  },
  async (event) => {
    const data = event.data?.data();
    if (!data || data.isPublic === false) return null;

    const authorUid = data.authorUid || event.params.userId;
    const title = 'New community reflection';
    const body = `${data.authorName || 'Someone'} reflected on “${data.readingTitle || 'today’s reading'}”`;

    const users = await db.collection('users').limit(80).get();
    const jobs = [];

    for (const docSnap of users.docs) {
      if (docSnap.id === authorUid) continue;
      const u = docSnap.data() || {};
      const prefs = u.notificationPrefs || {};
      if (prefs.reflectionAlerts === false) continue;
      const tokens = Array.isArray(u.fcmTokens) ? u.fcmTokens.filter(Boolean) : [];
      if (!tokens.length) continue;

      jobs.push(
        sendToTokens(tokens, {
          notification: { title, body },
          data: { type: 'reflection', url: '/' },
          link: 'https://scriptura-study-2026.web.app/'
        })
      );
    }

    await Promise.allSettled(jobs);
    logger.info('onPublicReflectionCreated fanout', { jobs: jobs.length });
    return null;
  }
);
