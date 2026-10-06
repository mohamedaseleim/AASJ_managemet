import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import { ActivityActionType, UserRole } from '../types/journal';

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
};

export async function logActivity(payload: LogPayload): Promise<void> {
  try {
    await addDoc(collection(db, 'activity_logs'), {
      ...payload,
      uid: auth.currentUser?.uid ?? null,
      createdAt: serverTimestamp(),
      clientTime: new Date().toISOString(),
      userAgent: navigator.userAgent,
    });
  } catch (error: any) {
    console.error('[activityLogger] failed to write log:', error?.code, error?.message);
  }
}
