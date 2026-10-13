import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp, Unsubscribe } from 'firebase/firestore';
import { db, ensureFirebaseAuth } from './firebase';
import { ActivityActionType, ActivityLogItem, UserRole } from '../types/journal';

export type LogPayload = {
  username: string;
  userFullName: string;
  userRole: UserRole;
  actionType: ActivityActionType;
  title: string;
  description: string;
  targetId?: string;
  severity: 'info' | 'success' | 'warning' | 'danger';
  ipAddress?: string;
  actorId?: string;
};

export async function logActivity(payload: LogPayload): Promise<void> {
  try {
    const firebaseUser = await ensureFirebaseAuth();
    // Firestore rejects an entire document when any field is `undefined`.
    // Optional audit fields must therefore be omitted, not sent as undefined.
    const definedPayload = Object.fromEntries(
      Object.entries(payload).filter(([, value]) => value !== undefined)
    );
    await addDoc(collection(db, 'activity_logs'), {
      ...definedPayload,
      // uid is the Firebase technical session; actorId is the application's user account.
      uid: firebaseUser.uid,
      createdAt: serverTimestamp(),
      clientTime: new Date().toISOString(),
      userAgent: navigator.userAgent,
    });
  } catch (error: any) {
    console.error('[activityLogger] failed to write log:', error?.code, error?.message);
  }
}

/**
 * Reads the audit collection directly so logs created by every browser/user
 * are visible to the administrator, instead of relying on a last-writer-wins
 * copy embedded in journal_state.
 */
export function subscribeToActivityLogs(
  onLogsChanged: (logs: ActivityLogItem[]) => void,
  onError?: (error: unknown) => void
): Unsubscribe {
  let cancelled = false;
  let unsubscribe: Unsubscribe = () => {};

  ensureFirebaseAuth()
    .then(() => {
      if (cancelled) return;
      const logsQuery = query(collection(db, 'activity_logs'), orderBy('clientTime', 'desc'));
      unsubscribe = onSnapshot(
        logsQuery,
        (snapshot) => {
          const logs = snapshot.docs.map((entry) => {
            const data = entry.data() as Partial<ActivityLogItem> & { clientTime?: string };
            return {
              id: entry.id,
              timestamp: data.timestamp || data.clientTime || new Date().toISOString(),
              username: data.username || 'unknown',
              userFullName: data.userFullName || 'غير معروف',
              userRole: data.userRole || 'author',
              actionType: data.actionType || 'system_backup',
              title: data.title || 'نشاط مسجل',
              description: data.description || '',
              targetId: data.targetId,
              ipAddress: data.ipAddress,
              severity: data.severity || 'info',
            } as ActivityLogItem;
          });
          onLogsChanged(logs);
        },
        (error) => onError?.(error)
      );
    })
    .catch((error) => onError?.(error));

  return () => {
    cancelled = true;
    unsubscribe();
  };
}
