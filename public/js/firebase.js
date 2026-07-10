// Firebase config and initialized services (Phase 1 extract)
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { getMessaging } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging.js';

export const firebaseConfig = {
  projectId: "scriptura-study-2026",
  appId: "1:672733276555:web:89c11cfd510ba13272678e",
  storageBucket: "scriptura-study-2026.firebasestorage.app",
  apiKey: "AIzaSyC4LtEjnfu8CzP6KSM_hVgJxhqWndJpFTo",
  authDomain: "scriptura-study-2026.firebaseapp.com",
  messagingSenderId: "672733276555"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const messaging = getMessaging(app);
export const VAPID_KEY = "BO-hBNUqSqDpYLSE8Oz2c0nNKtUDyK27fyzjoTdoiBMLZUGIENy9qcZzegNRFcGE-G_KVPwKC-zcNxnh6dan0xE";
