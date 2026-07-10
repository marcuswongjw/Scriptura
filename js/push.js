// Feature module: push (Phase 2)
import { auth, db, messaging, VAPID_KEY } from './firebase.js?v=2.0.21';
import { doc, getDoc, setDoc } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { getToken, onMessage } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging.js';
import { showToast } from './toast.js?v=2.0.21';
import { el } from './dom.js?v=2.0.21';
import { state } from './state.js?v=2.0.21';
import { routeToPath } from './routing.js?v=2.0.21';

export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/firebase-messaging-sw.js')
        .then(reg => {
          console.log('ServiceWorker registered with scope:', reg.scope);
          state.swRegistration = reg;
          initPushNotifications(reg);
        })
        .catch(err => {
          console.error('ServiceWorker registration failed:', err);
        });
    });
  }
}

export async function initPushNotifications(registration) {
  if (!el.btnToggleNotifications || !el.pushStatusText) return;

  // Sync initial toggle UI
  updatePushToggleUI(Notification.permission);

  // Wire up click event for the custom profile toggle button
  el.btnToggleNotifications.addEventListener('click', async () => {
    try {
      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        updatePushToggleUI(permission);
        if (permission === 'granted') {
          await requestAndSaveToken(registration);
        }
      } else if (Notification.permission === 'granted') {
        // Toggle refresh/resync
        await requestAndSaveToken(registration);
        showToast('Notification token is active and has been refreshed.', 'success');
      } else {
        showToast('Notifications are blocked by your browser settings. Please enable them manually.', 'warning', 6000);
      }
    } catch (err) {
      console.error('Error toggling push notifications:', err);
    }
  });

  // Handle messages in the foreground (when user is active in the app)
  onMessage(messaging, (payload) => {
    console.log('Foreground push notification received: ', payload);
    const body = payload.notification?.body || '';
    const title = payload.notification?.title || 'Scriptura';
    showToast(`${title}: ${body}`, 'info', 6000);
  });
}

export function updatePushToggleUI(permission) {
  if (!el.btnToggleNotifications || !el.pushStatusText) return;

  if (permission === 'granted') {
    el.pushStatusText.textContent = 'Enabled';
    el.btnToggleNotifications.textContent = 'Active';
    el.btnToggleNotifications.style.background = '#d1fae5';
    el.btnToggleNotifications.style.color = '#065f46';
    el.btnToggleNotifications.style.borderColor = 'rgba(6, 95, 70, 0.2)';
  } else if (permission === 'denied') {
    el.pushStatusText.textContent = 'Blocked';
    el.btnToggleNotifications.textContent = 'Blocked';
    el.btnToggleNotifications.style.background = '#fee2e2';
    el.btnToggleNotifications.style.color = '#991b1b';
    el.btnToggleNotifications.style.borderColor = 'rgba(153, 27, 27, 0.2)';
  } else {
    el.pushStatusText.textContent = 'Disabled';
    el.btnToggleNotifications.textContent = 'Enable';
    el.btnToggleNotifications.style.background = 'var(--brand-coral-light)';
    el.btnToggleNotifications.style.color = 'var(--brand-coral)';
    el.btnToggleNotifications.style.borderColor = 'rgba(225, 29, 72, 0.2)';
  }
}

export async function requestAndSaveToken(registration) {
  try {
    const currentToken = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration || state.swRegistration
    });
    if (currentToken) {
      console.log('FCM Token received:', currentToken);
      if (auth.currentUser) {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        const userDoc = await getDoc(userRef);
        let fcmTokens = [];
        if (userDoc.exists()) {
          fcmTokens = userDoc.data().fcmTokens || [];
        }
        if (!fcmTokens.includes(currentToken)) {
          fcmTokens.push(currentToken);
          await setDoc(userRef, { fcmTokens }, { merge: true });
        }
        console.log('FCM Token successfully synced with Firestore profile.');
      }
    } else {
      console.warn('No token retrieved. Ensure notifications are allowed.');
    }
  } catch (err) {
    console.error('Error retrieving FCM token:', err);
  }
}

export async function checkAndSyncPushToken() {
  if (state.swRegistration) {
    await requestAndSaveToken(state.swRegistration);
  } else if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(async (reg) => {
      state.swRegistration = reg;
      await requestAndSaveToken(reg);
    });
  }
}

