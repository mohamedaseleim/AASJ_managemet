export type NotificationFilterTab = 'all' | 'overdue' | 'approaching' | 'reminded';

export interface ReviewerOverdueNotification {
  id: string; // e.g. `${manuscriptId}_${slot}`
  manuscriptId: string;
  manuscriptTitle: string;
  discipline: string;
  authorName: string;
  authorEmail?: string;
  slot: 'reviewerOne' | 'reviewerTwo' | 'reviewerThree' | 'reviewerFour';
  slotLabelAr: string;
  slotLabelEn: string;
  reviewerName: string;
  reviewerEmail: string;
  reviewerAffiliation?: string;
  assignedDate: string;
  dueDate: string;
  overdueDays: number;
  daysRemaining: number;
  isOverdue: boolean;
  isApproaching: boolean;
  status: 'overdue' | 'approaching' | 'on_track' | 'reminded';
  lastReminderSentAt?: string;
  reminderCount: number;
  isDismissed?: boolean;
}

export interface ReminderEmailTemplate {
  id: string;
  titleAr: string;
  titleEn: string;
  subject: string;
  body: string;
}
