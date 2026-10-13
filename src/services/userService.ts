import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  deleteField,
  writeBatch,
  Unsubscribe,
} from 'firebase/firestore';
import { db, firebaseConfig, ensureFirebaseAuth } from './firebase';
import {
  createUserWithEmailAndPassword,
  getAuth,
  inMemoryPersistence,
  setPersistence,
  signOut,
} from 'firebase/auth';
import { deleteApp, initializeApp } from 'firebase/app';
import { UserAccount } from '../types/journal';

/**
 * Timeout helper for Firestore promises to avoid hanging indefinitely
 * when offline or when network is restricted.
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 7000,
  fallbackMsg: string = 'Operation timed out'
): Promise<T> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    throw new Error(`Device is offline (${fallbackMsg})`);
  }

  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<T>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(`${fallbackMsg} (${timeoutMs}ms)`));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/**
 * Removes any undefined fields to prevent Firestore serialization errors:
 * "Unsupported field value: undefined"
 * Optionally replaces undefined with deleteField() for partial updates
 */
export function sanitizeForFirestore<T extends Record<string, any>>(
  obj: T,
  deleteUndefined: boolean = false
): Record<string, any> {
  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) {
      if (deleteUndefined) {
        sanitized[key] = deleteField();
      }
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

/**
 * Converts a Firestore document data object into a clean UserAccount
 */
export function docToUserAccount(id: string, data: Record<string, any>): UserAccount {
  return {
    id,
    username: (data.username || '').trim(),
    password: data.password || '',
    fullName: data.fullName || '',
    email: data.email || '',
    role: data.role || 'author',
    assignedSection: data.assignedSection || undefined,
    title: data.title || undefined,
    affiliation: data.affiliation || undefined,
    phone: data.phone || undefined,
    isActive: data.isActive !== false,
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || undefined,
  };
}

/**
 * Seeds Firestore with default users if the collection is empty.
 */
export async function seedUsersIfEmpty(defaultUsers: UserAccount[]): Promise<void> {
  if (!defaultUsers || defaultUsers.length === 0) return;
  try {
    console.info('[userService] Seeding Firestore with initial users...');
    const batch = writeBatch(db);
    for (const user of defaultUsers) {
      batch.set(doc(db, 'users', user.id), sanitizeForFirestore(user, false));
    }
    await withTimeout(batch.commit(), 8000, 'seedUsersIfEmpty batch commit');
    console.info('[userService] Successfully seeded initial users in Firestore.');
  } catch (err) {
    console.warn('[userService] Failed to seed initial users:', err);
  }
}

/**
 * Subscribes to real-time changes in the 'users' collection in Firestore.
 * Automatically synchronizes changes from any device/browser.
 */
export function subscribeToUsers(
  onUsersChanged: (users: UserAccount[]) => void,
  defaultUsers: UserAccount[] = [],
  onError?: (error: any) => void
): Unsubscribe {
  let cancelled = false;
  let unsubscribe: Unsubscribe = () => {};

  ensureFirebaseAuth()
    .then(() => {
      if (cancelled) return;
      unsubscribe = onSnapshot(
        collection(db, 'users'),
        async (snapshot) => {
          if (snapshot.empty && defaultUsers.length > 0) {
            onUsersChanged(defaultUsers);
            await seedUsersIfEmpty(defaultUsers);
            return;
          }

          const users: UserAccount[] = snapshot.docs.map((docSnap) =>
            docToUserAccount(docSnap.id, docSnap.data())
          );
          if (users.length > 0) onUsersChanged(users);
        },
        (error) => {
          console.warn('[userService] Realtime users listener error:', error?.message || error);
          if (onError) onError(error);
        }
      );
    })
    .catch((error) => {
      console.warn('[userService] Firebase authentication is unavailable:', error?.message || error);
      if (onError) onError(error);
    });

  return () => {
    cancelled = true;
    unsubscribe();
  };
}

/**
 * Adds or replaces a user document in Firestore.
 */
export async function saveUserToCloud(user: UserAccount): Promise<void> {
  try {
    await withTimeout(
      ensureFirebaseAuth(),
      10000,
      `Firebase authentication for saveUserToCloud(${user.id})`
    );
    const payload = sanitizeForFirestore(user, false);
    let lastError: unknown;
    for (let attempt = 1; attempt <= 2; attempt += 1) {
      try {
        await withTimeout(
          setDoc(doc(db, 'users', user.id), payload, { merge: true }),
          10000,
          `saveUserToCloud(${user.id})`
        );
        return;
      } catch (error) {
        lastError = error;
        if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
    throw lastError;
  } catch (err: any) {
    console.error('[userService] Failed to save user to Firestore:', err?.message || err);
    throw err;
  }
}

/**
 * Saves multiple users in a single Firestore writeBatch.
 * Highly efficient for synchronization and seed operations.
 */
export async function batchSaveUsersToCloud(usersToSave: UserAccount[]): Promise<void> {
  if (!usersToSave || usersToSave.length === 0) return;
  try {
    await ensureFirebaseAuth();
    const batch = writeBatch(db);
    for (const user of usersToSave) {
      batch.set(doc(db, 'users', user.id), sanitizeForFirestore(user, false), { merge: true });
    }
    await withTimeout(batch.commit(), 8000, `batchSaveUsersToCloud(${usersToSave.length} users)`);
  } catch (err: any) {
    console.error('[userService] Failed batch save to Firestore:', err?.message || err);
    throw err;
  }
}

/**
 * Updates partial user fields in Firestore.
 */
export async function updateUserInCloud(id: string, updates: Partial<UserAccount>): Promise<void> {
  try {
    await ensureFirebaseAuth();
    await withTimeout(
      setDoc(doc(db, 'users', id), sanitizeForFirestore(updates, true), { merge: true }),
      7000,
      `updateUserInCloud(${id})`
    );
  } catch (err: any) {
    console.error('[userService] Failed to update user in Firestore:', err?.message || err);
    throw err;
  }
}

/**
 * Deletes a user document from Firestore.
 */
export async function deleteUserFromCloud(id: string): Promise<void> {
  try {
    await ensureFirebaseAuth();
    await withTimeout(
      deleteDoc(doc(db, 'users', id)),
      7000,
      `deleteUserFromCloud(${id})`
    );
  } catch (err: any) {
    console.error('[userService] Failed to delete user from Firestore:', err?.message || err);
    throw err;
  }
}

/**
 * Finds a single user in Firestore by username.
 * Useful for logging in from a new device before real-time sync snapshot arrives.
 */
export async function findUserInCloud(username: string): Promise<UserAccount | null> {
  const cleanUsername = username.trim().toLowerCase();
  try {
    await ensureFirebaseAuth();
    const q = query(collection(db, 'users'), where('username', '==', cleanUsername));
    const snap = await withTimeout(
      getDocs(q),
      5000,
      'findUserInCloud query'
    );
    if (!snap.empty) {
      const docSnap = snap.docs[0];
      return docToUserAccount(docSnap.id, docSnap.data());
    }

    // Fallback: check all docs in case username casing or index is pending
    const allSnap = await withTimeout(
      getDocs(collection(db, 'users')),
      5000,
      'findUserInCloud fallback'
    );
    for (const d of allSnap.docs) {
      const data = d.data();
      if ((data.username || '').toLowerCase() === cleanUsername) {
        return docToUserAccount(d.id, data);
      }
    }
  } catch (err) {
    console.warn('[userService] Query for user in Firestore failed:', err);
  }
  return null;
}

/**
 * Fetches all users directly from Firestore.
 * Throws if the network fails so callers can distinguish between network failure and empty collection.
 */
export async function fetchAllUsersFromCloud(): Promise<UserAccount[]> {
  try {
    await ensureFirebaseAuth();
    const snap = await withTimeout(
      getDocs(collection(db, 'users')),
      7000,
      'fetchAllUsersFromCloud'
    );
    if (!snap.empty) {
      return snap.docs.map((d) => docToUserAccount(d.id, d.data()));
    }
    return [];
  } catch (err) {
    console.warn('[userService] Failed to fetch users from Firestore:', err);
    throw err;
  }
}

/**
 * إنشاء مستخدم Auth عبر تطبيق Firebase ثانوي لتجنب تداخل جلسة المدير الحالية.
 */
export async function createAuthUserAndGetUid(email: string, password: string): Promise<string> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail) throw new Error('يرجى إدخال البريد الإلكتروني للمستخدم');
  if (password.length < 6) throw new Error('يجب أن تتكون كلمة المرور من 6 أحرف على الأقل');

  // استخدم تطبيق Firebase ثانويًا حتى لا نبدّل جلسة المدير الحالية.
  // هذا يتجنب مشاكل CORS وFailed to fetch الناتجة عن استدعاء REST اليدوي.
  const secondaryApp = initializeApp(firebaseConfig, `account-creation-${Date.now()}`);
  const secondaryAuth = getAuth(secondaryApp);
  try {
    await setPersistence(secondaryAuth, inMemoryPersistence);
    const credential = await createUserWithEmailAndPassword(secondaryAuth, cleanEmail, password);
    return credential.user.uid;
  } catch (error: any) {
    const code = error?.code || '';
    if (code === 'auth/email-already-in-use') throw new Error('auth/email-already-in-use');
    if (code === 'auth/invalid-email') throw new Error('البريد الإلكتروني غير صالح');
    if (code === 'auth/weak-password') throw new Error('كلمة المرور ضعيفة؛ استخدم 6 أحرف على الأقل');
    if (code === 'auth/network-request-failed') {
      throw new Error('تعذر الاتصال بخادم المصادقة. تحقق من اتصال الإنترنت ثم أعد المحاولة');
    }
    console.error('[userService] Failed to create auth user:', error);
    throw new Error(error?.message || 'فشل إنشاء الحساب في نظام المصادقة');
  } finally {
    await signOut(secondaryAuth).catch(() => undefined);
    await deleteApp(secondaryApp).catch(() => undefined);
  }
}
