import {
  doc,
  onSnapshot,
  setDoc,
  Unsubscribe,
} from 'firebase/firestore';
import { db, ensureFirebaseAuth } from './firebase';
import {
  ActivityLogItem,
  CashFlowTransaction,
  DocumentArchiveItem,
  DonationRecord,
  Manuscript,
  ReviewerProfile,
  WaitingListItem,
} from '../types/journal';

export type JournalCloudState = {
  manuscripts: Manuscript[];
  waitingList: WaitingListItem[];
  donations: DonationRecord[];
  documents: DocumentArchiveItem[];
  reviewers: ReviewerProfile[];
  cashFlow: CashFlowTransaction[];
  activityLogs: ActivityLogItem[];
  updatedAt?: string;
  updatedBy?: string;
};

const JOURNAL_STATE_PATH = ['journal_state', 'current'];

function cleanForFirestore<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function normalizeState(data: Record<string, unknown>): JournalCloudState {
  return {
    manuscripts: Array.isArray(data.manuscripts) ? data.manuscripts as Manuscript[] : [],
    waitingList: Array.isArray(data.waitingList) ? data.waitingList as WaitingListItem[] : [],
    donations: Array.isArray(data.donations) ? data.donations as DonationRecord[] : [],
    documents: Array.isArray(data.documents) ? data.documents as DocumentArchiveItem[] : [],
    reviewers: Array.isArray(data.reviewers) ? data.reviewers as ReviewerProfile[] : [],
    cashFlow: Array.isArray(data.cashFlow) ? data.cashFlow as CashFlowTransaction[] : [],
    activityLogs: Array.isArray(data.activityLogs) ? data.activityLogs as ActivityLogItem[] : [],
    updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : undefined,
    updatedBy: typeof data.updatedBy === 'string' ? data.updatedBy : undefined,
  };
}

export function subscribeToJournalState(
  onState: (state: JournalCloudState | null) => void,
  onError?: (error: unknown) => void
): Unsubscribe {
  let cancelled = false;
  let unsubscribe: Unsubscribe = () => {};

  ensureFirebaseAuth()
    .then(() => {
      if (cancelled) return;
      unsubscribe = onSnapshot(
        doc(db, JOURNAL_STATE_PATH[0], JOURNAL_STATE_PATH[1]),
        (snapshot) => {
          if (!snapshot.exists()) {
            onState(null);
            return;
          }
          onState(normalizeState(snapshot.data()));
        },
        (error) => {
          console.error('[journalCloudService] realtime sync failed:', error);
          onError?.(error);
        }
      );
    })
    .catch((error) => {
      console.error('[journalCloudService] authentication failed:', error);
      onError?.(error);
    });

  return () => {
    cancelled = true;
    unsubscribe();
  };
}

export async function saveJournalState(
  state: Omit<JournalCloudState, 'updatedAt' | 'updatedBy'>,
  updatedBy?: string
): Promise<void> {
  await ensureFirebaseAuth();
  await setDoc(doc(db, JOURNAL_STATE_PATH[0], JOURNAL_STATE_PATH[1]), cleanForFirestore({
    ...state,
    updatedAt: new Date().toISOString(),
    updatedBy: updatedBy || 'anonymous',
  }));
}
