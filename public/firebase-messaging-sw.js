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

// Initialize Firebase App inside Service Worker context
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Handle background notification triggers
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification?.title || 'Scriptura Notification';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: payload.data
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// PWA Caching logic
const CACHE_NAME = 'scriptura-pwa-cache-v1.0.1';
const ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/modules.js',
  '/manifest.json',
  '/favicon.png',
  '/icon-192.png',
  '/icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  // Let external calls (like Firestore API) bypass PWA caching
  if (
    e.request.url.includes('firestore.googleapis.com') ||
    e.request.url.includes('firebaseinstallations.googleapis.com') ||
    e.request.url.includes('fcmregistrations.googleapis.com') ||
    e.request.url.includes('identitytoolkit.googleapis.com')
  ) {
    return;
  }
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      return cachedResponse || fetch(e.request);
    })
  );
});
