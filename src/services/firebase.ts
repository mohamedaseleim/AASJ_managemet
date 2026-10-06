import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase app once
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Keep Firebase Auth session across refresh/browser restarts
setPersistence(auth, browserLocalPersistence).catch((e) => {
  console.warn('Failed to set Firebase auth persistence:', e);
});
