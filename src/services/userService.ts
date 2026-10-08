import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import { UserAccount } from '../types/journal';

/**
 * Removes any undefined fields to prevent Firestore serialization errors:
 * "Unsupported field value: undefined"
 */
export function sanitizeForFirestore<T extends Record<string, any>>(obj: T): Record<string, any> {
  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
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
  };
}

/**
 * Seeds Firestore with default users if the collection is empty.
 */
export async function seedUsersIfEmpty(defaultUsers: UserAccount[]): Promise<void> {
  try {
    const snap = await getDocs(collection(db, 'users'));
    if (snap.empty && defaultUsers.length > 0) {
      console.info('[userService] Seeding Firestore with initial users...');
      for (const user of defaultUsers) {
        await setDoc(doc(db, 'users', user.id), sanitizeForFirestore(user));
      }
    }
  } catch (err) {
    console.warn('[userService] Failed to check or seed initial users:', err);
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
  try {
    const usersCollection = collection(db, 'users');

    const unsubscribe = onSnapshot(
      usersCollection,
      async (snapshot) => {
        if (snapshot.empty && defaultUsers.length > 0) {
          // If Firestore is empty, seed it with the default users
          await seedUsersIfEmpty(defaultUsers);
          return;
        }

        const users: UserAccount[] = snapshot.docs.map((docSnap) =>
          docToUserAccount(docSnap.id, docSnap.data())
        );

        if (users.length > 0) {
          onUsersChanged(users);
        }
      },
      (error) => {
        console.warn('[userService] Realtime users listener error:', error?.message || error);
        if (onError) onError(error);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('[userService] Failed to initialize Firestore user subscription:', err);
    return () => {};
  }
}

/**
 * Adds or replaces a user document in Firestore.
 */
export async function saveUserToCloud(user: UserAccount): Promise<void> {
  try {
    await setDoc(doc(db, 'users', user.id), sanitizeForFirestore(user), { merge: true });
  } catch (err: any) {
    console.error('[userService] Failed to save user to Firestore:', err?.message || err);
    throw err;
  }
}

/**
 * Updates partial user fields in Firestore.
 */
export async function updateUserInCloud(id: string, updates: Partial<UserAccount>): Promise<void> {
  try {
    await setDoc(doc(db, 'users', id), sanitizeForFirestore(updates), { merge: true });
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
    await deleteDoc(doc(db, 'users', id));
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
    const q = query(collection(db, 'users'), where('username', '==', cleanUsername));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const docSnap = snap.docs[0];
      return docToUserAccount(docSnap.id, docSnap.data());
    }

    // Fallback: check all docs in case username casing or index is pending
    const allSnap = await getDocs(collection(db, 'users'));
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
 */
export async function fetchAllUsersFromCloud(): Promise<UserAccount[]> {
  try {
    const snap = await getDocs(collection(db, 'users'));
    if (!snap.empty) {
      return snap.docs.map((d) => docToUserAccount(d.id, d.data()));
    }
  } catch (err) {
    console.warn('[userService] Failed to fetch users from Firestore:', err);
  }
  return [];
}
