import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  INITIAL_CASH_FLOW,
  INITIAL_DOCUMENTS,
  INITIAL_DONATIONS,
  INITIAL_MANUSCRIPTS,
  INITIAL_REVIEWERS,
  INITIAL_WAITING_LIST,
} from '../data/initialData';
import { INITIAL_ACTIVITY_LOGS } from '../data/initialActivityLogs';
import { Language } from '../translations';
import {
  ActiveModule,
  ActivityLogItem,
  CashFlowTransaction,
  DocumentArchiveItem,
  DonationRecord,
  Manuscript,
  ManuscriptStatus,
  ReviewerAssignment,
  ReviewerProfile,
  WaitingListItem,
} from '../types/journal';

interface JournalContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  activeModule: ActiveModule;
  setActiveModule: (module: ActiveModule) => void;
  globalSearch: string;
  setGlobalSearch: (q: string) => void;

  // Manuscripts
  manuscripts: Manuscript[];
  addManuscript: (m: Omit<Manuscript, 'createdAt' | 'updatedAt'>) => void;
  updateManuscript: (id: string, m: Partial<Manuscript>) => void;
  deleteManuscript: (id: string) => void;
  updateManuscriptStatus: (id: string, status: ManuscriptStatus, comment?: string) => void;
  assignReviewerToManuscript: (
    manuscriptId: string,
    slot: 'reviewerOne' | 'reviewerTwo' | 'reviewerThree' | 'reviewerFour',
    reviewer: ReviewerAssignment
  ) => void;

  // Waiting list
  waitingList: WaitingListItem[];
  addWaitingItem: (item: Omit<WaitingListItem, 'id' | 'addedDate'>) => void;
  updateWaitingItem: (id: string, item: Partial<WaitingListItem>) => void;
  deleteWaitingItem: (id: string) => void;

  // Donations / APC
  donations: DonationRecord[];
  addDonation: (d: Omit<DonationRecord, 'id'>) => void;
  updateDonation: (id: string, d: Partial<DonationRecord>) => void;
  deleteDonation: (id: string) => void;

  // Documents
  documents: DocumentArchiveItem[];
  addDocument: (doc: Omit<DocumentArchiveItem, 'id' | 'createdAt'>) => void;
  updateDocument: (id: string, doc: Partial<DocumentArchiveItem>) => void;
  deleteDocument: (id: string) => void;

  // Reviewers
  reviewers: ReviewerProfile[];
  addReviewer: (r: Omit<ReviewerProfile, 'id'>) => void;
  updateReviewer: (id: string, r: Partial<ReviewerProfile>) => void;
  deleteReviewer: (id: string) => void;

  // Cash flow
  cashFlow: CashFlowTransaction[];
  addCashTransaction: (tx: CashFlowTransaction) => void;
  updateCashTransaction: (id: string, tx: Partial<CashFlowTransaction>) => void;
  deleteCashTransaction: (id: string) => void;

  // Activity / Audit Logs (Admin only)
  activityLogs: ActivityLogItem[];
  addActivityLog: (log: Omit<ActivityLogItem, 'id' | 'timestamp'>) => void;
  clearActivityLogs: () => void;

  // Utilities
  resetToDefaultData: () => void;
  exportDatabaseJson: () => void;
  importDatabaseJson: (jsonString: string) => boolean;
}

const JournalContext = createContext<JournalContextType | undefined>(undefined);

const STORAGE_KEY = 'AASJ_JOURNAL_DATABASE_ALAZHAR_EKB_V2';
const LANG_STORAGE_KEY = 'AASJ_JOURNAL_LANG_V2';
const ACTIVITY_LOGS_KEY = 'AASJ_ACTIVITY_LOGS_ALAZHAR_V2';

export const JournalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem(LANG_STORAGE_KEY) as Language) || 'ar';
  });

  const [activeModule, setActiveModule] = useState<ActiveModule>('dashboard');
  const [globalSearch, setGlobalSearch] = useState<string>('');

  const [manuscripts, setManuscripts] = useState<Manuscript[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.manuscripts && Array.isArray(parsed.manuscripts)) {
          return parsed.manuscripts;
        }
      }
    } catch (e) {
      console.error('Error loading stored manuscripts', e);
    }
    return INITIAL_MANUSCRIPTS;
  });

  const [waitingList, setWaitingList] = useState<WaitingListItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.waitingList && Array.isArray(parsed.waitingList)) {
          return parsed.waitingList;
        }
      }
    } catch (e) {
      console.error('Error loading stored waitingList', e);
    }
    return INITIAL_WAITING_LIST;
  });

  const [donations, setDonations] = useState<DonationRecord[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.donations && Array.isArray(parsed.donations)) {
          return parsed.donations;
        }
      }
    } catch (e) {
      console.error('Error loading stored donations', e);
    }
    return INITIAL_DONATIONS;
  });

  const [documents, setDocuments] = useState<DocumentArchiveItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.documents && Array.isArray(parsed.documents)) {
          return parsed.documents;
        }
      }
    } catch (e) {
      console.error('Error loading stored documents', e);
    }
    return INITIAL_DOCUMENTS;
  });

  const [reviewers, setReviewers] = useState<ReviewerProfile[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.reviewers && Array.isArray(parsed.reviewers)) {
          return parsed.reviewers;
        }
      }
    } catch (e) {
      console.error('Error loading stored reviewers', e);
    }
    return INITIAL_REVIEWERS;
  });

  const [cashFlow, setCashFlow] = useState<CashFlowTransaction[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.cashFlow && Array.isArray(parsed.cashFlow)) {
          return parsed.cashFlow;
        }
      }
    } catch (e) {
      console.error('Error loading stored cashFlow', e);
    }
    return INITIAL_CASH_FLOW;
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>(() => {
    try {
      // 1) V2 first
      const v2Stored = localStorage.getItem(ACTIVITY_LOGS_KEY);
      if (v2Stored !== null) {
        const parsed = JSON.parse(v2Stored);
        if (Array.isArray(parsed)) {
          return parsed; // even if []
        }
      }

      // 2) Optional migration from V1
      const v1Stored = localStorage.getItem('AASJ_ACTIVITY_LOGS_ALAZHAR_V1');
      if (v1Stored !== null) {
        const parsedV1 = JSON.parse(v1Stored);
        if (Array.isArray(parsedV1)) {
          localStorage.setItem(ACTIVITY_LOGS_KEY, JSON.stringify(parsedV1));
          return parsedV1;
        }
      }
    } catch (e) {
      console.error('Error loading stored activity logs', e);
    }

    // first run only
    return import.meta.env.DEV ? INITIAL_ACTIVITY_LOGS : [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(ACTIVITY_LOGS_KEY, JSON.stringify(activityLogs));
    } catch (e) {
      console.error('Failed to save activity logs', e);
    }
  }, [activityLogs]);

  const addActivityLog = (log: Omit<ActivityLogItem, 'id' | 'timestamp'>) => {
    const newLog: ActivityLogItem = {
      ...log,
      id: `LOG-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString(),
    };
    setActivityLogs((prev) => [newLog, ...prev]);
  };

  const clearActivityLogs = () => {
    setActivityLogs([]);
  };

  // Sync language with document direction
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(LANG_STORAGE_KEY, lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  };

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  // Persist to LocalStorage on state changes
  useEffect(() => {
    try {
      const payload = {
        manuscripts,
        waitingList,
        donations,
        documents,
        reviewers,
        cashFlow,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.error('Failed to auto-save to localStorage', e);
    }
  }, [manuscripts, waitingList, donations, documents, reviewers, cashFlow]);

  // Manuscripts CRUD
  const addManuscript = (m: Omit<Manuscript, 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newManuscript: Manuscript = {
      ...m,
      createdAt: now,
      updatedAt: now,
    };
    setManuscripts((prev) => [newManuscript, ...prev]);

    // Audit log
    addActivityLog({
      username: 'editorial_office',
      userFullName: 'الهيئة التحريرية',
      userRole: 'editor',
      actionType: 'manuscript_create',
      title: `تسجيل مخطوطة جديدة: ${newManuscript.id}`,
      description: `تم إيداع بحث جديد بعنوان "${(newManuscript.articleTitle || '').slice(0, 60)}..."`,
      targetId: newManuscript.id,
      ipAddress: '196.221.14.88',
      severity: 'success',
    });
  };

  const updateManuscript = (id: string, m: Partial<Manuscript>) => {
    setManuscripts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...m, updatedAt: new Date().toISOString() } : item))
    );
  };

  const deleteManuscript = (id: string) => {
    setManuscripts((prev) => prev.filter((item) => item.id !== id));
    addActivityLog({
      username: 'editorial_office',
      userFullName: 'الهيئة التحريرية',
      userRole: 'editor',
      actionType: 'manuscript_delete',
      title: `حذف مخطوطة من المنظومة: ${id}`,
      description: `تم حذف المخطوطة ${id} من قاعدة البيانات النشطة`,
      targetId: id,
      ipAddress: '196.221.14.88',
      severity: 'danger',
    });
  };

  const updateManuscriptStatus = (id: string, status: ManuscriptStatus, comment?: string) => {
    setManuscripts((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            status,
            comment: comment !== undefined ? comment : item.comment,
            updatedAt: new Date().toISOString(),
          };
        }
        return item;
      })
    );
    addActivityLog({
      username: 'editor',
      userFullName: 'الهيئة التحريرية',
      userRole: 'editor',
      actionType: 'manuscript_status',
      title: `تغيير حالة المخطوطة ${id}`,
      description: `تم تحديث الحالة إلى: "${status}"`,
      targetId: id,
      ipAddress: '196.221.14.88',
      severity: 'info',
    });
  };

  const assignReviewerToManuscript = (
    manuscriptId: string,
    slot: 'reviewerOne' | 'reviewerTwo' | 'reviewerThree' | 'reviewerFour',
    reviewer: ReviewerAssignment
  ) => {
    setManuscripts((prev) =>
      prev.map((item) => {
        if (item.id === manuscriptId) {
          return {
            ...item,
            [slot]: reviewer,
            status: item.status === 'Submitted Manuscript' ? 'Manuscript Assigned to Reviewers' : item.status,
            updatedAt: new Date().toISOString(),
          };
        }
        return item;
      })
    );
  };

  // Waiting list CRUD
  const addWaitingItem = (item: Omit<WaitingListItem, 'id' | 'addedDate'>) => {
    const newItem: WaitingListItem = {
      ...item,
      id: `WAIT-${Date.now().toString().slice(-4)}`,
      addedDate: new Date().toISOString().split('T')[0],
    };
    setWaitingList((prev) => [...prev, newItem]);
  };

  const updateWaitingItem = (id: string, item: Partial<WaitingListItem>) => {
    setWaitingList((prev) => prev.map((w) => (w.id === id ? { ...w, ...item } : w)));
  };

  const deleteWaitingItem = (id: string) => {
    setWaitingList((prev) => prev.filter((w) => w.id !== id));
  };

  // Donations CRUD
  const addDonation = (d: Omit<DonationRecord, 'id'>) => {
    const newDonation: DonationRecord = {
      ...d,
      id: `DON-${Date.now().toString().slice(-4)}`,
    };
    setDonations((prev) => [newDonation, ...prev]);
  };

  const updateDonation = (id: string, d: Partial<DonationRecord>) => {
    setDonations((prev) => prev.map((item) => (item.id === id ? { ...item, ...d } : item)));
  };

  const deleteDonation = (id: string) => {
    setDonations((prev) => prev.filter((item) => item.id !== id));
  };

  // Documents CRUD
  const addDocument = (doc: Omit<DocumentArchiveItem, 'id' | 'createdAt'>) => {
    const newDoc: DocumentArchiveItem = {
      ...doc,
      id: `DOC-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString(),
    };
    setDocuments((prev) => [newDoc, ...prev]);
  };

  const updateDocument = (id: string, doc: Partial<DocumentArchiveItem>) => {
    setDocuments((prev) => prev.map((item) => (item.id === id ? { ...item, ...doc } : item)));
  };

  const deleteDocument = (id: string) => {
    setDocuments((prev) => prev.filter((item) => item.id !== id));
  };

  // Reviewers CRUD
  const addReviewer = (r: Omit<ReviewerProfile, 'id'>) => {
    const newReviewer: ReviewerProfile = {
      ...r,
      id: `REV-${Date.now().toString().slice(-4)}`,
    };
    setReviewers((prev) => [newReviewer, ...prev]);
  };

  const updateReviewer = (id: string, r: Partial<ReviewerProfile>) => {
    setReviewers((prev) => prev.map((item) => (item.id === id ? { ...item, ...r } : item)));
  };

  const deleteReviewer = (id: string) => {
    setReviewers((prev) => prev.filter((item) => item.id !== id));
  };

  // Cash Flow CRUD
  const addCashTransaction = (tx: CashFlowTransaction) => {
    setCashFlow((prev) => [tx, ...prev]);
  };

  const updateCashTransaction = (id: string, tx: Partial<CashFlowTransaction>) => {
    setCashFlow((prev) => prev.map((item) => (item.id === id ? { ...item, ...tx } : item)));
  };

  const deleteCashTransaction = (id: string) => {
    setCashFlow((prev) => prev.filter((item) => item.id !== id));
  };

  // Reset to default
  const resetToDefaultData = () => {
    if (window.confirm('هل تريد بالتأكيد استعادة البيانات الافتراضية؟ سيتم استبدال أية تغييرات غير محفوظة.')) {
      setManuscripts(INITIAL_MANUSCRIPTS);
      setWaitingList(INITIAL_WAITING_LIST);
      setDonations(INITIAL_DONATIONS);
      setDocuments(INITIAL_DOCUMENTS);
      setReviewers(INITIAL_REVIEWERS);
      setCashFlow(INITIAL_CASH_FLOW);
      setActivityLogs(import.meta.env.DEV ? INITIAL_ACTIVITY_LOGS : []);
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(ACTIVITY_LOGS_KEY);
    }
  };

  // Export JSON
  const exportDatabaseJson = () => {
    const data = {
      manuscripts,
      waitingList,
      donations,
      documents,
      reviewers,
      cashFlow,
      activityLogs,
      exportedAt: new Date().toISOString(),
      system: 'AASJ Editorial Board Management System',
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AASJ_Database_Backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON
  const importDatabaseJson = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.manuscripts && Array.isArray(parsed.manuscripts)) {
        setManuscripts(parsed.manuscripts);
      }
      if (parsed.waitingList && Array.isArray(parsed.waitingList)) {
        setWaitingList(parsed.waitingList);
      }
      if (parsed.donations && Array.isArray(parsed.donations)) {
        setDonations(parsed.donations);
      }
      if (parsed.documents && Array.isArray(parsed.documents)) {
        setDocuments(parsed.documents);
      }
      if (parsed.reviewers && Array.isArray(parsed.reviewers)) {
        setReviewers(parsed.reviewers);
      }
      if (parsed.cashFlow && Array.isArray(parsed.cashFlow)) {
        setCashFlow(parsed.cashFlow);
      }
      if (parsed.activityLogs && Array.isArray(parsed.activityLogs)) {
        setActivityLogs(parsed.activityLogs);
      }
      return true;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  };

  return (
    <JournalContext.Provider
      value={{
        language,
        setLanguage,
        activeModule,
        setActiveModule,
        globalSearch,
        setGlobalSearch,
        manuscripts,
        addManuscript,
        updateManuscript,
        deleteManuscript,
        updateManuscriptStatus,
        assignReviewerToManuscript,
        waitingList,
        addWaitingItem,
        updateWaitingItem,
        deleteWaitingItem,
        donations,
        addDonation,
        updateDonation,
        deleteDonation,
        documents,
        addDocument,
        updateDocument,
        deleteDocument,
        reviewers,
        addReviewer,
        updateReviewer,
        deleteReviewer,
        cashFlow,
        addCashTransaction,
        updateCashTransaction,
        deleteCashTransaction,
        activityLogs,
        addActivityLog,
        clearActivityLogs,
        resetToDefaultData,
        exportDatabaseJson,
        importDatabaseJson,
      }}
    >
      {children}
    </JournalContext.Provider>
  );
};

export const useJournal = () => {
  const context = useContext(JournalContext);
  if (!context) {
    throw new Error('useJournal must be used within a JournalProvider');
  }
  return context;
};
