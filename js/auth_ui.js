// Feature module: auth_ui (Phase 2)
import { auth } from './firebase.js?v=2.0.33';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { el } from './dom.js?v=2.0.33';
import { state } from './state.js?v=2.0.33';

export function showAuthError(msg) {
  el.authError.textContent = msg;
  el.authError.classList.remove('hidden');
}

export function clearAuthError() {
  el.authError.textContent = '';
  el.authError.classList.add('hidden');
}

/**
 * Show login/register overlay.
 * @param {{ message?: string, intent?: object }} [opts]
 *   intent is stored on state.pendingAuthIntent and resumed after successful auth.
 */
export function showAuthPortal(opts = {}) {
  clearAuthError();
  if (opts.intent) state.pendingAuthIntent = opts.intent;
  if (opts.message && el.authGateMessage) {
    el.authGateMessage.textContent = opts.message;
    el.authGateMessage.classList.remove('hidden');
  } else if (el.authGateMessage) {
    el.authGateMessage.textContent = '';
    el.authGateMessage.classList.add('hidden');
  }
  // Guests can dismiss and keep browsing courses
  if (el.authBrowseBtn) el.authBrowseBtn.classList.remove('hidden');
  if (el.authCloseBtn) el.authCloseBtn.classList.remove('hidden');
  el.authPortal.classList.remove('hidden');
  el.authPortal.setAttribute('aria-hidden', 'false');
}

/** Hide overlay so guests can browse the course catalog. */
export function hideAuthPortal() {
  clearAuthError();
  el.authPortal.classList.add('hidden');
  el.authPortal.setAttribute('aria-hidden', 'true');
  if (el.authGateMessage) el.authGateMessage.classList.add('hidden');
}

export function isLoggedIn() {
  return !!auth.currentUser;
}

/** If not signed in, open auth and optionally stash intent. Returns false when blocked. */
export function requireAuth(intent, message) {
  if (auth.currentUser) return true;
  showAuthPortal({
    intent: intent || null,
    message: message || 'Sign in to start this lesson and save your progress.',
  });
  return false;
}

export async function handleLoginSubmit(e) {
  e.preventDefault();
  clearAuthError();
  try {
    await signInWithEmailAndPassword(auth, el.loginEmail.value.trim(), el.loginPass.value);
  } catch (err) {
    console.error('Login failed:', err);
    showAuthError('Invalid credentials. Please try again.');
  }
}

export async function handleRegisterSubmit(e) {
  e.preventDefault();
  clearAuthError();
  
  const nameVal = el.registerName ? el.registerName.value.trim() : '';
  const countryVal = el.registerCountry ? el.registerCountry.value : '';

  state.pendingRegistrationDetails = {
    name: nameVal,
    country: countryVal
  };

  try {
    await createUserWithEmailAndPassword(auth, el.registerEmail.value.trim(), el.registerPass.value);
  } catch (err) {
    console.error('Registration failed:', err);
    showAuthError('Registration failed. Email may already be in use.');
    state.pendingRegistrationDetails = null;
  }
}

export async function handleGoogleSignIn() {
  clearAuthError();
  try {
    await signInWithPopup(auth, new GoogleAuthProvider());
  } catch (err) {
    console.error('Google sign-in failed:', err);
    showAuthError('Google Sign-In failed. Please try again.');
  }
}

export function switchAuthTab(tab) {
  clearAuthError();
  const isLogin = tab === 'login';
  el.tabLogin.classList.toggle('active', isLogin);
  el.tabRegister.classList.toggle('active', !isLogin);
  el.loginForm.classList.toggle('hidden', !isLogin);
  el.registerForm.classList.toggle('hidden', isLogin);
}

