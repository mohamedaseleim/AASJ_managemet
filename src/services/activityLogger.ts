import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase'; // عدّل المسار حسب مشروعك
import { ActivityActionType, UserRole } from '../types/journal';

type LogPayload = {
  uid: string;
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

export async function logActivity(payload: LogPayload) {
  await addDoc(collection(db, 'activity_logs'), {
    ...payload,
    createdAt: serverTimestamp(),
    clientTime: new Date().toISOString(),
    userAgent: navigator.userAgent,
  });
}
