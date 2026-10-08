import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence, signInAnonymously, User } from 'firebase/auth';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  getFirestore,
} from 'firebase/firestore';
import config from '../../firebase-applet-config.json';

// تصدير الإعدادات لاستخدامها لاحقاً لإنشاء تطبيق مصادقة ثانوي
export const firebaseConfig = config;

// Initialize Firebase app once
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Firebase services
export const auth = getAuth(app);

// Firestore rules evaluate request.auth. Wait for the anonymous session before
// any cloud operation so the first read/write is not sent unauthenticated.
let anonymousSignInPromise: Promise<User> | null = null;

export async function ensureFirebaseAuth(): Promise<User> {
  await auth.authStateReady();

  if (auth.currentUser) return auth.currentUser;

  if (!anonymousSignInPromise) {
    anonymousSignInPromise = signInAnonymously(auth)
      .then((credential) => credential.user)
      .finally(() => {
        anonymousSignInPromise = null;
      });
  }

  return anonymousSignInPromise;
}

// Initialize Firestore with multi-tab persistent cache for resilient offline support
export const db = (() => {
  try {
    return initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    });
  } catch {
    return getFirestore(app);
  }
})();

// Keep Firebase Auth session across refresh/browser restarts
setPersistence(auth, browserLocalPersistence).catch((e) => {
  console.warn('Failed to set Firebase auth persistence:', e);
});

// Optionally sign in anonymously if not authenticated to satisfy rules requiring auth
if (typeof window !== 'undefined') {
  auth.onAuthStateChanged((user) => {
    if (!user) {
      ensureFirebaseAuth().catch(() => {
        // Anonymous sign-in may not be enabled in console, proceed without error
      });
    }
  });
}
