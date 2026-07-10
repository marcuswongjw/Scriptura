// Import scripts for Firebase Cloud Messaging (Compat version)
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

const firebaseConfig = {
  projectId: "scriptura-study-2026",
  appId: "1:672733276555:web:89c11cfd510ba13272678e",
  storageBucket: "scriptura-study-2026.firebasestorage.app",
  apiKey: "AIzaSyC4LtEjnfu8CzP6KSM_hVgJxhqWndJpFTo",
  authDomain: "scriptura-study-2026.firebaseapp.com",
  messagingSenderId: "672733276555"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification?.title || 'Scriptura';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: payload.data || {}
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification?.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if ('focus' in client) {
          client.navigate?.(url);
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});

// ---------------------------------------------------------------------------
// PWA cache — network-first for HTML shell; stale-while-revalidate for assets
// ---------------------------------------------------------------------------
const CACHE_NAME = 'scriptura-pwa-cache-v2.0.29';

self.addEventListener('install', (e) => {
  e.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

function isFirebaseApi(url) {
  return (
    url.includes('firestore.googleapis.com') ||
    url.includes('firebaseinstallations.googleapis.com') ||
    url.includes('fcmregistrations.googleapis.com') ||
    url.includes('identitytoolkit.googleapis.com') ||
    url.includes('securetoken.googleapis.com') ||
    url.includes('googleapis.com') ||
    url.includes('gstatic.com')
  );
}

function isHtmlNavigation(request, url) {
  if (request.mode === 'navigate') return true;
  const path = url.pathname;
  return path === '/' || path.endsWith('.html') || path.endsWith('/');
}

function isAppShellAsset(url) {
  const path = url.pathname;
  return (
    path.endsWith('.js') ||
    path.endsWith('.css') ||
    path.endsWith('.json') ||
    path.endsWith('.png') ||
    path.endsWith('.svg') ||
    path.endsWith('.ico')
  );
}

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  if (isFirebaseApi(url.href)) return;
  // Only same-origin
  if (url.origin !== self.location.origin) return;

  // HTML / navigations: network-first so deploys are visible immediately
  if (isHtmlNavigation(e.request, url)) {
    e.respondWith(
      fetch(e.request)
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(e.request, copy));
          }
          return response;
        })
        .catch(() => caches.match(e.request).then((c) => c || caches.match('/index.html')))
    );
    return;
  }

  // JS/CSS/images: stale-while-revalidate
  if (isAppShellAsset(url)) {
    e.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(e.request);
        const networkPromise = fetch(e.request)
          .then((response) => {
            if (response && response.ok) cache.put(e.request, response.clone());
            return response;
          })
          .catch(() => cached);
        return cached || networkPromise;
      })
    );
  }
});
