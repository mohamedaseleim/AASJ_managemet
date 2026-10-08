import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence, signInAnonymously } from 'firebase/auth';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  getFirestore,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase app once
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Firebase services
export const auth = getAuth(app);

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
      signInAnonymously(auth).catch(() => {
        // Anonymous sign-in may not be enabled in console, proceed without error
      });
    }
  });
}
