import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useJournal } from './JournalContext';
import { Manuscript, ReviewerAssignment } from '../types/journal';
import { ReviewerOverdueNotification } from '../types/notifications';

interface ReminderRecord {
  lastSent: string;
  count: number;
}

interface NotificationContextType {
  thresholdDays: number;
  setThresholdDays: (days: number) => void;
  notifications: ReviewerOverdueNotification[];
  activeOverdueNotifications: ReviewerOverdueNotification[];
  activeApproachingNotifications: ReviewerOverdueNotification[];
  activeRemindedNotifications: ReviewerOverdueNotification[];
  overdueCount: number;
  approachingCount: number;
  totalActiveAlertsCount: number;
  sendReminder: (notification: ReviewerOverdueNotification, note?: string) => void;
  extendDeadline: (manuscriptId: string, slot: string, extraDays: number) => void;
  dismissNotification: (id: string) => void;
  restoreNotification: (id: string) => void;
  clearAllDismissed: () => void;
  isSoundEnabled: boolean;
  setIsSoundEnabled: (enabled: boolean) => void;
  playNotificationSound: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const THRESHOLD_STORAGE_KEY = 'AASJ_REVIEWER_OVERDUE_THRESHOLD_DAYS';
const REMINDER_HISTORY_KEY = 'AASJ_REVIEWER_REMINDER_HISTORY_V1';
const DISMISSED_ALERTS_KEY = 'AASJ_REVIEWER_DISMISSED_ALERTS_V1';
const SOUND_ENABLED_KEY = 'AASJ_NOTIFICATION_SOUND_ENABLED';

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { manuscripts, updateManuscript, addActivityLog } = useJournal();

  // 1. Configurable overdue threshold in days (default: 21 days standard AASJ peer review time)
  const [thresholdDays, setThresholdDaysState] = useState<number>(() => {
    try {
      const stored = localStorage.getItem(THRESHOLD_STORAGE_KEY);
      if (stored) {
        const val = parseInt(stored, 10);
        if (!isNaN(val) && val > 0) return val;
      }
    } catch (e) {
      console.error(e);
    }
    return 21; // 21 days default
  });

  const setThresholdDays = (days: number) => {
    const validDays = Math.max(1, Math.min(180, days));
    setThresholdDaysState(validDays);
    try {
      localStorage.setItem(THRESHOLD_STORAGE_KEY, validDays.toString());
    } catch (e) {
      console.error(e);
    }
  };

  // 2. Track reminder history by alert ID
  const [reminderHistory, setReminderHistory] = useState<Record<string, ReminderRecord>>(() => {
    try {
      const stored = localStorage.getItem(REMINDER_HISTORY_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return {};
  });

  useEffect(() => {
    try {
      localStorage.setItem(REMINDER_HISTORY_KEY, JSON.stringify(reminderHistory));
    } catch (e) {
      console.error(e);
    }
  }, [reminderHistory]);

  // 3. Track dismissed alerts
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(DISMISSED_ALERTS_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(DISMISSED_ALERTS_KEY, JSON.stringify(dismissedAlerts));
    } catch (e) {
      console.error(e);
    }
  }, [dismissedAlerts]);

  // 4. Sound notification preference
  const [isSoundEnabled, setIsSoundEnabledState] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(SOUND_ENABLED_KEY);
      return stored !== 'false';
    } catch {
      return true;
    }
  });

  const setIsSoundEnabled = (enabled: boolean) => {
    setIsSoundEnabledState(enabled);
    try {
      localStorage.setItem(SOUND_ENABLED_KEY, enabled.toString());
    } catch (e) {
      console.error(e);
    }
  };

  // Web Audio API chime generator (no external audio file dependencies)
  const playNotificationSound = () => {
    if (!isSoundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      // Pleasant high double beep
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {
      // Audio might be blocked by autoplay policies
      console.warn('Audio chime skipped', e);
    }
  };

  // Helper to extract reviewers from a manuscript
  const reviewerSlots: Array<{
    slot: 'reviewerOne' | 'reviewerTwo' | 'reviewerThree' | 'reviewerFour';
    labelAr: string;
    labelEn: string;
  }> = [
    { slot: 'reviewerOne', labelAr: 'المحكم الأول', labelEn: 'Reviewer 1' },
    { slot: 'reviewerTwo', labelAr: 'المحكم الثاني', labelEn: 'Reviewer 2' },
    { slot: 'reviewerThree', labelAr: 'المحكم الثالث', labelEn: 'Reviewer 3' },
    { slot: 'reviewerFour', labelAr: 'المحكم الرابع', labelEn: 'Reviewer 4' },
  ];

  // 5. Compute all notifications dynamically based on current manuscripts & threshold
  const notifications = useMemo<ReviewerOverdueNotification[]>(() => {
    const list: ReviewerOverdueNotification[] = [];
    const now = new Date();

    manuscripts.forEach((m: Manuscript) => {
      // Skip completed or rejected manuscripts
      if (
        m.status === 'Manuscript Published in Journal' ||
        m.status === 'Manuscript Accepted (Final)' ||
        m.status === 'Deleted Manuscript' ||
        m.status === 'Withdrawn Manuscript'
      ) {
        return;
      }

      reviewerSlots.forEach(({ slot, labelAr, labelEn }) => {
        const assignment = m[slot] as ReviewerAssignment | undefined;
        if (!assignment || !assignment.name || assignment.name.trim() === '') {
          return;
        }

        // Check if review has already been submitted or completed
        const isCompleted =
          assignment.status === 'completed' ||
          (assignment.recommendation && assignment.recommendation.trim() !== '') ||
          (assignment.reviewDate && assignment.reviewDate.trim() !== '');

        const isDeclined = assignment.status === 'rejected';

        if (isCompleted || isDeclined) {
          return;
        }

        // Determine assigned date and due date
        const rawAssignedDate = assignment.assignedDate || assignment.assignDate || m.receiveDate || '2026-01-01';
        let assignedDateObj = new Date(rawAssignedDate);
        if (isNaN(assignedDateObj.getTime())) {
          assignedDateObj = new Date('2026-01-01');
        }

        let dueDateObj: Date;
        if (assignment.reviewDueDate || assignment.deadline) {
          dueDateObj = new Date(assignment.reviewDueDate || assignment.deadline || '');
          if (isNaN(dueDateObj.getTime())) {
            dueDateObj = new Date(assignedDateObj.getTime() + thresholdDays * 24 * 60 * 60 * 1000);
          }
        } else {
          dueDateObj = new Date(assignedDateObj.getTime() + thresholdDays * 24 * 60 * 60 * 1000);
        }

        const diffMs = dueDateObj.getTime() - now.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        const alertId = `${m.id}_${slot}`;
        const reminderInfo = reminderHistory[alertId];
        const isDismissed = dismissedAlerts.includes(alertId);

        const isOverdue = diffDays < 0;
        const overdueDays = isOverdue ? Math.abs(diffDays) : 0;
        const daysRemaining = !isOverdue ? Math.max(0, diffDays) : 0;
        const isApproaching = !isOverdue && daysRemaining <= 5;

        // Status classification
        let status: 'overdue' | 'approaching' | 'on_track' | 'reminded' = 'on_track';
        if (reminderInfo && reminderInfo.count > 0) {
          status = 'reminded';
        } else if (isOverdue) {
          status = 'overdue';
        } else if (isApproaching) {
          status = 'approaching';
        }

        // Only include if overdue, approaching, or previously reminded
        if (isOverdue || isApproaching || reminderInfo) {
          list.push({
            id: alertId,
            manuscriptId: m.id,
            manuscriptTitle: m.articleTitle || m.titleAr || m.titleEn || 'بدون عنوان',
            discipline: m.subjectsRelated?.[0] || m.specificFieldOfStudy || 'العلوم الزراعية',
            authorName: m.authorsNames || `${m.correspondAuthorFirstName || ''} ${m.correspondAuthorLastName || ''}`.trim(),
            authorEmail: m.correspondAuthorEmail,
            slot,
            slotLabelAr: labelAr,
            slotLabelEn: labelEn,
            reviewerName: assignment.name,
            reviewerEmail: assignment.email,
            reviewerAffiliation: assignment.affiliation,
            assignedDate: assignedDateObj.toISOString().split('T')[0],
            dueDate: dueDateObj.toISOString().split('T')[0],
            overdueDays,
            daysRemaining,
            isOverdue,
            isApproaching,
            status,
            lastReminderSentAt: reminderInfo?.lastSent,
            reminderCount: reminderInfo?.count || 0,
            isDismissed,
          });
        }
      });
    });

    // Sort: Overdue highest days first, then approaching by soonest deadline
    return list.sort((a, b) => {
      if (a.isOverdue && b.isOverdue) {
        return b.overdueDays - a.overdueDays;
      }
      if (a.isOverdue) return -1;
      if (b.isOverdue) return 1;
      return a.daysRemaining - b.daysRemaining;
    });
  }, [manuscripts, thresholdDays, reminderHistory, dismissedAlerts]);

  // Derived filtered notification sets
  const activeOverdueNotifications = useMemo(() => {
    return notifications.filter((n) => !n.isDismissed && n.isOverdue);
  }, [notifications]);

  const activeApproachingNotifications = useMemo(() => {
    return notifications.filter((n) => !n.isDismissed && n.isApproaching);
  }, [notifications]);

  const activeRemindedNotifications = useMemo(() => {
    return notifications.filter((n) => !n.isDismissed && n.reminderCount > 0);
  }, [notifications]);

  const overdueCount = activeOverdueNotifications.length;
  const approachingCount = activeApproachingNotifications.length;
  const totalActiveAlertsCount = overdueCount + approachingCount;

  // Actions
  const sendReminder = (notification: ReviewerOverdueNotification, note?: string) => {
    const nowIso = new Date().toISOString();
    setReminderHistory((prev) => {
      const current = prev[notification.id] || { lastSent: nowIso, count: 0 };
      return {
        ...prev,
        [notification.id]: {
          lastSent: nowIso,
          count: current.count + 1,
        },
      };
    });

    // Audit log in journal system
    addActivityLog({
      username: 'editorial_office',
      userFullName: 'الهيئة التحريرية (نظام التنبيهات)',
      userRole: 'editor',
      actionType: 'notification_alert',
      title: `إرسال تذكير تحكيم متأخر للمحكم: ${notification.reviewerName}`,
      description: `تم إرسال تذكير للمحكم (${notification.reviewerName}) بشأن المخطوطة [${notification.manuscriptId}] لتأخره بـ ${notification.overdueDays} يوماً عن الموعد المحدد (${notification.dueDate}). ${note ? `ملاحظة: ${note}` : ''}`,
      targetId: notification.manuscriptId,
      ipAddress: '196.221.14.88',
      severity: 'warning',
    });
  };

  const extendDeadline = (manuscriptId: string, slot: string, extraDays: number) => {
    const targetManuscript = manuscripts.find((m) => m.id === manuscriptId);
    if (!targetManuscript) return;

    const assignment = (targetManuscript as Record<string, any>)[slot] as ReviewerAssignment | undefined;
    if (!assignment) return;

    const currentDueDate = assignment.reviewDueDate || assignment.deadline || new Date().toISOString().split('T')[0];
    const baseDate = new Date(currentDueDate);
    const newDueDate = new Date(baseDate.getTime() + extraDays * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    const updatedAssignment: ReviewerAssignment = {
      ...assignment,
      reviewDueDate: newDueDate,
      deadline: newDueDate,
    };

    updateManuscript(manuscriptId, {
      [slot]: updatedAssignment,
    });

    addActivityLog({
      username: 'editorial_office',
      userFullName: 'الهيئة التحريرية',
      userRole: 'editor',
      actionType: 'deadline_extended',
      title: `تمديد مهلة التحكيم للمخطوطة ${manuscriptId}`,
      description: `تم تمديد مهلة التحكيم لـ ${assignment.name} (${extraDays} أيام إضافية) حتى ${newDueDate}.`,
      targetId: manuscriptId,
      ipAddress: '196.221.14.88',
      severity: 'info',
    });
  };

  const dismissNotification = (id: string) => {
    setDismissedAlerts((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const restoreNotification = (id: string) => {
    setDismissedAlerts((prev) => prev.filter((item) => item !== id));
  };

  const clearAllDismissed = () => {
    setDismissedAlerts([]);
  };

  return (
    <NotificationContext.Provider
      value={{
        thresholdDays,
        setThresholdDays,
        notifications,
        activeOverdueNotifications,
        activeApproachingNotifications,
        activeRemindedNotifications,
        overdueCount,
        approachingCount,
        totalActiveAlertsCount,
        sendReminder,
        extendDeadline,
        dismissNotification,
        restoreNotification,
        clearAllDismissed,
        isSoundEnabled,
        setIsSoundEnabled,
        playNotificationSound,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
