import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { User } from 'firebase/auth';
import {
  googleSignIn,
  initAuth,
  logoutGoogle,
  setCachedAccessToken,
} from '../services/googleDriveAuth';
import {
  DriveItem,
  FolderStructureStatus,
  GoogleDriveService,
} from '../services/googleDriveService';
import { useJournal } from './JournalContext';

interface GoogleDriveContextType {
  isGoogleConnected: boolean;
  needsReconnect: boolean;
  googleUser: User | null;
  accessToken: string | null;
  isAuthenticating: boolean;
  folderStructure: FolderStructureStatus | null;
  isSettingUpFolders: boolean;
  setupProgress: string;
  connectGoogleDrive: () => Promise<string | null>;
  disconnectGoogleDrive: () => Promise<void>;
  setupJournalFolders: () => Promise<FolderStructureStatus | null>;
  uploadFileToDrive: (
    file: File | Blob,
    filename: string,
    targetFolderId?: string,
    mimeType?: string
  ) => Promise<DriveItem>;
  uploadBackupToDrive: (
    jsonContent: string,
    filename?: string
  ) => Promise<DriveItem>;
}

const GDRIVE_STORAGE_KEY = 'AASJ_GDRIVE_STRUCTURE_V1';

const GoogleDriveContext = createContext<GoogleDriveContextType | undefined>(undefined);

export const GoogleDriveProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isSettingUpFolders, setIsSettingUpFolders] = useState(false);
  const [setupProgress, setSetupProgress] = useState('');

  const { addActivityLog } = useJournal();

  const [folderStructure, setFolderStructure] = useState<FolderStructureStatus | null>(() => {
    try {
      const stored = localStorage.getItem(GDRIVE_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error loading stored Google Drive folder structure', e);
    }
    return null;
  });

  // Listen to Firebase Auth state on mount.
  // initAuth يستعيد التوكن المحفوظ (sessionStorage) ويتحقق من صلاحيته لدى Google.
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setGoogleUser(user);
        setAccessToken(token || null);
      },
      () => {
        setGoogleUser(null);
        setAccessToken(null);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  const connectGoogleDrive = useCallback(async (): Promise<string | null> => {
    setIsAuthenticating(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setGoogleUser(result.user);
        setAccessToken(result.accessToken);
        setCachedAccessToken(result.accessToken);

        addActivityLog({
          actionType: 'google_drive_folder',
          title: 'ربط Google Drive بالحساب',
          description: `تم تسجيل الدخول إلى Google Drive بواسطة ${result.user.displayName || result.user.email || 'مستخدم Google'}`,
          targetId: result.user.uid,
          severity: 'success',
        });

        return result.accessToken;
      }

      addActivityLog({
        actionType: 'google_drive_folder',
        title: 'إلغاء ربط Google Drive',
        description: 'تم إغلاق نافذة تسجيل الدخول إلى Google Drive قبل الإكمال',
        severity: 'warning',
      });

      return null;
    } catch (err: any) {
      if (
        err?.code === 'auth/popup-closed-by-user' ||
        err?.code === 'auth/cancelled-popup-request' ||
        err?.message?.includes('popup-closed-by-user')
      ) {
        console.info('Google Drive sign-in cancelled by user.');

        addActivityLog({
          actionType: 'google_drive_folder',
          title: 'إلغاء تسجيل الدخول إلى Google Drive',
          description: 'المستخدم أغلق نافذة تسجيل الدخول قبل الإكمال',
          severity: 'warning',
        });

        return null;
      }

      console.warn('Could not connect to Google Drive:', err?.message || err);

      addActivityLog({
        actionType: 'notification_alert',
        title: 'فشل ربط Google Drive',
        description: `تعذر الاتصال بـ Google Drive: ${err?.message || 'خطأ غير معروف'}`,
        severity: 'danger',
      });

      return null;
    } finally {
      setIsAuthenticating(false);
    }
  }, [addActivityLog]);

  const disconnectGoogleDrive = useCallback(async () => {
    try {
      await logoutGoogle();
      setGoogleUser(null);
      setAccessToken(null);
      setCachedAccessToken(null);

      addActivityLog({
        actionType: 'google_drive_folder',
        title: 'فصل Google Drive',
        description: 'تم تسجيل الخروج من Google Drive وفصل الاتصال',
        severity: 'info',
      });
    } catch (err: any) {
      console.error('Failed to disconnect Google Drive', err);

      addActivityLog({
        actionType: 'notification_alert',
        title: 'فشل فصل Google Drive',
        description: `تعذر فصل Google Drive: ${err?.message || 'خطأ غير معروف'}`,
        severity: 'danger',
      });
    }
  }, [addActivityLog]);

  const setupJournalFolders = useCallback(async (): Promise<FolderStructureStatus | null> => {
    let currentToken = accessToken;
    if (!currentToken) {
      currentToken = await connectGoogleDrive();
      if (!currentToken) return null;
    }

    setIsSettingUpFolders(true);
    setSetupProgress('بدء تهيئة الهيكل التنظيمي للمجلدات...');

    try {
      const structure = await GoogleDriveService.setupJournalFolderStructure(
        currentToken,
        (step) => setSetupProgress(step)
      );

      setFolderStructure(structure);
      try {
        localStorage.setItem(GDRIVE_STORAGE_KEY, JSON.stringify(structure));
      } catch (e) {
        console.error('Failed to persist folder structure', e);
      }

      setSetupProgress('تم إنشاء وتنظيم كافة المجلدات بنجاح!');

      addActivityLog({
        actionType: 'google_drive_folder',
        title: 'تهيئة هيكل مجلدات Google Drive',
        description: 'تم إنشاء/التحقق من المجلدات التنظيمية للمجلة بنجاح',
        targetId: structure.rootFolderId || undefined,
        severity: 'success',
      });

      return structure;
    } catch (err: any) {
      console.warn('Notice while setting up journal folders in Google Drive:', err?.message || err);
      setSetupProgress(`تعذر إكمال إنشاء المجلدات: ${err?.message || 'خطأ في الاتصال'}`);

      addActivityLog({
        actionType: 'notification_alert',
        title: 'فشل تهيئة مجلدات Google Drive',
        description: `تعذر إنشاء الهيكل التنظيمي للمجلدات: ${err?.message || 'خطأ في الاتصال'}`,
        severity: 'danger',
      });

      return null;
    } finally {
      setIsSettingUpFolders(false);
    }
  }, [accessToken, connectGoogleDrive, addActivityLog]);

  const uploadFileToDrive = useCallback(async (
    file: File | Blob,
    filename: string,
    targetFolderId?: string,
    mimeType?: string
  ): Promise<DriveItem> => {
    let currentToken = accessToken;
    if (!currentToken) {
      currentToken = await connectGoogleDrive();
      if (!currentToken) {
        throw new Error('يرجى تسجيل الدخول إلى Google Drive أولاً للمتابعة');
      }
    }

    const parentId = targetFolderId || folderStructure?.rootFolderId || undefined;

    try {
      const uploaded = await GoogleDriveService.uploadFile(
        currentToken,
        file,
        filename,
        parentId,
        mimeType
      );

      addActivityLog({
        actionType: 'google_drive_upload',
        title: `رفع ملف إلى Google Drive: ${filename}`,
        description: `تم رفع الملف بنجاح إلى ${parentId ? `المجلد (${parentId})` : 'الجذر'}`,
        targetId: uploaded.id,
        severity: 'success',
      });

      return uploaded;
    } catch (err: any) {
      addActivityLog({
        actionType: 'notification_alert',
        title: `فشل رفع ملف إلى Google Drive: ${filename}`,
        description: `حدث خطأ أثناء رفع الملف: ${err?.message || 'خطأ غير معروف'}`,
        targetId: parentId,
        severity: 'danger',
      });
      throw err;
    }
  }, [accessToken, connectGoogleDrive, folderStructure, addActivityLog]);

  const uploadBackupToDrive = useCallback(async (
    jsonContent: string,
    filename?: string
  ): Promise<DriveItem> => {
    let currentToken = accessToken;
    if (!currentToken) {
      currentToken = await connectGoogleDrive();
      if (!currentToken) {
        throw new Error('يرجى تسجيل الدخول إلى Google Drive أولاً للمتابعة');
      }
    }

    const defaultFilename =
      filename || `AASJ_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    const parentId = folderStructure?.backupsFolderId || folderStructure?.rootFolderId || undefined;

    try {
      const uploaded = await GoogleDriveService.uploadTextContent(
        currentToken,
        defaultFilename,
        jsonContent,
        parentId,
        'application/json'
      );

      addActivityLog({
        actionType: 'system_backup',
        title: `رفع نسخة احتياطية إلى Google Drive: ${defaultFilename}`,
        description: 'تم رفع نسخة JSON احتياطية بنجاح إلى Google Drive',
        targetId: uploaded.id,
        severity: 'success',
      });

      return uploaded;
    } catch (err: any) {
      addActivityLog({
        actionType: 'notification_alert',
        title: `فشل رفع النسخة الاحتياطية: ${defaultFilename}`,
        description: `تعذر رفع النسخة الاحتياطية: ${err?.message || 'خطأ غير معروف'}`,
        targetId: parentId,
        severity: 'danger',
      });
      throw err;
    }
  }, [accessToken, connectGoogleDrive, folderStructure, addActivityLog]);

  const contextValue = useMemo(() => ({
    // متصل فعليًا فقط عند وجود توكن صالح
    isGoogleConnected: !!accessToken,
    // الحساب معروف (جلسة Firebase) لكن التوكن انتهى أو ضاع
    needsReconnect: !!googleUser && !accessToken,
    googleUser,
    accessToken,
    isAuthenticating,
    folderStructure,
    isSettingUpFolders,
    setupProgress,
    connectGoogleDrive,
    disconnectGoogleDrive,
    setupJournalFolders,
    uploadFileToDrive,
    uploadBackupToDrive,
  }), [
    googleUser,
    accessToken,
    isAuthenticating,
    folderStructure,
    isSettingUpFolders,
    setupProgress,
    connectGoogleDrive,
    disconnectGoogleDrive,
    setupJournalFolders,
    uploadFileToDrive,
    uploadBackupToDrive,
  ]);

  return (
    <GoogleDriveContext.Provider value={contextValue}>
      {children}
    </GoogleDriveContext.Provider>
  );
};

export const useGoogleDrive = () => {
  const context = useContext(GoogleDriveContext);
  if (!context) {
    throw new Error('useGoogleDrive must be used within a GoogleDriveProvider');
  }
  return context;
};
