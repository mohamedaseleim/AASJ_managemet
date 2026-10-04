import React, { createContext, useContext, useEffect, useState } from 'react';
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

interface GoogleDriveContextType {
  isGoogleConnected: boolean;
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

  // Listen to Firebase Auth state on mount
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setGoogleUser(user);
        setAccessToken(token);
        setCachedAccessToken(token);
      },
      () => {
        // Token needs refresh / not authenticated
        setAccessToken(null);
        setCachedAccessToken(null);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  const connectGoogleDrive = async (): Promise<string | null> => {
    setIsAuthenticating(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setGoogleUser(result.user);
        setAccessToken(result.accessToken);
        setCachedAccessToken(result.accessToken);
        return result.accessToken;
      }
      return null;
    } catch (err: any) {
      if (
        err?.code === 'auth/popup-closed-by-user' ||
        err?.code === 'auth/cancelled-popup-request' ||
        err?.message?.includes('popup-closed-by-user')
      ) {
        console.info('Google Drive sign-in cancelled by user.');
        return null;
      }
      console.warn('Could not connect to Google Drive:', err?.message || err);
      return null;
    } finally {
      setIsAuthenticating(false);
    }
  };

  const disconnectGoogleDrive = async () => {
    try {
      await logoutGoogle();
      setGoogleUser(null);
      setAccessToken(null);
      setCachedAccessToken(null);
    } catch (err) {
      console.error('Failed to disconnect Google Drive', err);
    }
  };

  const setupJournalFolders = async (): Promise<FolderStructureStatus | null> => {
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
      return structure;
    } catch (err: any) {
      console.warn('Notice while setting up journal folders in Google Drive:', err?.message || err);
      setSetupProgress(`تعذر إكمال إنشاء المجلدات: ${err?.message || 'خطأ في الاتصال'}`);
      return null;
    } finally {
      setIsSettingUpFolders(false);
    }
  };

  const uploadFileToDrive = async (
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

    // Default to root folder if no specific folder provided
    const parentId = targetFolderId || folderStructure?.rootFolderId || undefined;
    return await GoogleDriveService.uploadFile(currentToken, file, filename, parentId, mimeType);
  };

  const uploadBackupToDrive = async (
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

    return await GoogleDriveService.uploadTextContent(
      currentToken,
      defaultFilename,
      jsonContent,
      parentId,
      'application/json'
    );
  };

  return (
    <GoogleDriveContext.Provider
      value={{
        isGoogleConnected: !!accessToken,
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
      }}
    >
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
