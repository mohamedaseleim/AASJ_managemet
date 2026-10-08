import React, { createContext, useContext, useEffect, useState } from 'react';
import { INITIAL_USERS } from '../data/initialUsers';
import { ActiveModule, UserAccount } from '../types/journal';
import {
  subscribeToUsers,
  saveUserToCloud,
  updateUserInCloud,
  deleteUserFromCloud,
  findUserInCloud,
  fetchAllUsersFromCloud,
} from '../services/userService';

export type CloudSyncStatus = 'synced' | 'syncing' | 'offline' | 'error';

interface AuthContextType {
  currentUser: UserAccount | null;
  users: UserAccount[];
  login: (username: string, password: string) => Promise<boolean> | boolean;
  logout: () => void;
  switchRoleQuickly: (username: string) => void;
  changePassword: (
    userIdOrUsername: string,
    currentPass: string,
    newPass: string
  ) => Promise<{ success: boolean; message: string }> | { success: boolean; message: string };
  addUser: (user: Omit<UserAccount, 'id' | 'createdAt'>) => Promise<UserAccount>;
  updateUser: (id: string, updates: Partial<UserAccount>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  canAccessModule: (module: ActiveModule) => boolean;
  syncStatus: CloudSyncStatus;
  refreshUsers: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_STORAGE_KEY = 'AASJ_USERS_DATABASE_ALAZHAR_V1';
const SESSION_STORAGE_KEY = 'AASJ_CURRENT_USER_SESSION_V1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<UserAccount[]>(() => {
    try {
      const stored = localStorage.getItem(USERS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load users from localStorage', e);
    }
    return INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const storedSession = localStorage.getItem(SESSION_STORAGE_KEY);
      if (storedSession) {
        const parsed = JSON.parse(storedSession);
        if (parsed && parsed.id) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load user session', e);
    }
    return null;
  });

  const [syncStatus, setSyncStatus] = useState<CloudSyncStatus>('syncing');

  // Real-time synchronization with cloud Firestore across devices
  useEffect(() => {
    setSyncStatus('syncing');

    const unsubscribe = subscribeToUsers(
      (cloudUsers) => {
        if (cloudUsers && cloudUsers.length > 0) {
          setUsers(cloudUsers);
          try {
            localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(cloudUsers));
          } catch (e) {
            console.error('Failed to save synced users to localStorage', e);
          }

          // Update current user session if updated remotely on another device
          setCurrentUser((prevSession) => {
            if (!prevSession) return null;
            const fresh = cloudUsers.find((u) => u.id === prevSession.id);
            return fresh || prevSession;
          });

          setSyncStatus('synced');
        }
      },
      users, // Fallback seed if cloud collection is pristine
      (error) => {
        console.warn('[AuthContext] Cloud sync unavailable or offline:', error?.message || error);
        setSyncStatus('offline');
      }
    );

    // Multi-tab sync on same browser/device
    const handleStorageEvent = (event: StorageEvent) => {
      if (event.key === USERS_STORAGE_KEY && event.newValue) {
        try {
          const parsed = JSON.parse(event.newValue);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setUsers(parsed);
          }
        } catch {
          /* ignore */
        }
      }
    };
    window.addEventListener('storage', handleStorageEvent);

    return () => {
      unsubscribe();
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch (e) {
      console.error('Failed to save users', e);
    }
  }, [users]);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(SESSION_STORAGE_KEY);
      }
    } catch (e) {
      console.error('Failed to save session', e);
    }
  }, [currentUser]);

  const refreshUsers = async () => {
    setSyncStatus('syncing');
    try {
      const cloudUsers = await fetchAllUsersFromCloud();
      if (cloudUsers.length > 0) {
        setUsers(cloudUsers);
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(cloudUsers));
        setSyncStatus('synced');
      } else {
        setSyncStatus('synced');
      }
    } catch (err) {
      console.warn('[AuthContext] Manual refresh failed:', err);
      setSyncStatus('error');
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password.trim();

    // 1. Fast match against current memory / local cache
    const matchedLocal = users.find(
      (u) =>
        u.username.toLowerCase() === cleanUsername &&
        u.password === cleanPassword &&
        u.isActive
    );

    if (matchedLocal) {
      setCurrentUser(matchedLocal);
      return true;
    }

    // 2. Cross-device fallback: check cloud directly in case this device just loaded
    // and real-time snapshot has not yet resolved
    try {
      const cloudUser = await findUserInCloud(cleanUsername);
      if (
        cloudUser &&
        cloudUser.password === cleanPassword &&
        cloudUser.isActive
      ) {
        setUsers((prev) => {
          const exists = prev.some((u) => u.id === cloudUser.id);
          const updated = exists
            ? prev.map((u) => (u.id === cloudUser.id ? cloudUser : u))
            : [...prev, cloudUser];
          try {
            localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updated));
          } catch {
            /* ignore */
          }
          return updated;
        });

        setCurrentUser(cloudUser);
        return true;
      }
    } catch (err) {
      console.warn('[AuthContext] Cloud login fallback check error:', err);
    }

    return false;
  };

  // مهم: logout محلي فقط — لا يقطع اتصال Google Drive
  const logout = () => {
    setCurrentUser(null);
  };

  const switchRoleQuickly = (username: string) => {
    const user = users.find((u) => u.username === username);
    if (user) {
      setCurrentUser(user);
    }
  };

  const addUser = async (newUser: Omit<UserAccount, 'id' | 'createdAt'>): Promise<UserAccount> => {
    const account: UserAccount = {
      ...newUser,
      id: `USR-${Date.now().toString().slice(-5)}`,
      createdAt: new Date().toISOString(),
    };

    // Optimistic local update
    setUsers((prev) => {
      const next = [...prev, account];
      try {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });

    // Cloud synchronization
    try {
      setSyncStatus('syncing');
      await saveUserToCloud(account);
      setSyncStatus('synced');
    } catch (err) {
      console.error('[AuthContext] Failed to sync new user to cloud:', err);
      setSyncStatus('error');
    }

    return account;
  };

  const updateUser = async (id: string, updates: Partial<UserAccount>): Promise<void> => {
    // Optimistic local update
    setUsers((prev) => {
      const next = prev.map((u) => (u.id === id ? { ...u, ...updates } : u));
      try {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });

    if (currentUser?.id === id) {
      setCurrentUser((prev) => (prev ? { ...prev, ...updates } : null));
    }

    // Cloud synchronization
    try {
      setSyncStatus('syncing');
      await updateUserInCloud(id, updates);
      setSyncStatus('synced');
    } catch (err) {
      console.error('[AuthContext] Failed to sync updated user to cloud:', err);
      setSyncStatus('error');
    }
  };

  const deleteUser = async (id: string): Promise<void> => {
    if (currentUser?.id === id) {
      alert('لا يمكن حذف الحساب المسجل به حالياً!');
      return;
    }

    // Optimistic local update
    setUsers((prev) => {
      const next = prev.filter((u) => u.id !== id);
      try {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });

    // Cloud synchronization
    try {
      setSyncStatus('syncing');
      await deleteUserFromCloud(id);
      setSyncStatus('synced');
    } catch (err) {
      console.error('[AuthContext] Failed to delete user from cloud:', err);
      setSyncStatus('error');
    }
  };

  const changePassword = async (
    userIdOrUsername: string,
    currentPass: string,
    newPass: string
  ): Promise<{ success: boolean; message: string }> => {
    const targetUser = users.find(
      (u) =>
        u.id === userIdOrUsername ||
        u.username.toLowerCase() === userIdOrUsername.toLowerCase().trim()
    );

    if (!targetUser) {
      return { success: false, message: 'المستخدم غير موجود بالنظام.' };
    }

    if (targetUser.password !== currentPass.trim()) {
      return { success: false, message: 'كلمة المرور الحالية غير صحيحة.' };
    }

    if (!newPass || newPass.trim().length < 6) {
      return {
        success: false,
        message: 'يجب أن لا تقل كلمة المرور الجديدة عن 6 خانات أو رموز.',
      };
    }

    const updatedUsers = users.map((u) =>
      u.id === targetUser.id ? { ...u, password: newPass.trim() } : u
    );
    setUsers(updatedUsers);
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
    } catch {
      /* ignore */
    }

    if (currentUser?.id === targetUser.id) {
      setCurrentUser((prev) =>
        prev ? { ...prev, password: newPass.trim() } : null
      );
    }

    // Cloud synchronization
    try {
      setSyncStatus('syncing');
      await updateUserInCloud(targetUser.id, { password: newPass.trim() });
      setSyncStatus('synced');
    } catch (err) {
      console.error('[AuthContext] Failed to sync new password to cloud:', err);
      setSyncStatus('error');
    }

    return {
      success: true,
      message: 'تم تغيير كلمة المرور بنجاح وحفظها بشكل آمن ومزامنتها سحابياً.',
    };
  };

  const canAccessModule = (module: ActiveModule): boolean => {
    if (!currentUser) return false;
    const { role } = currentUser;

    if (module === 'activity_logs') {
      return role === 'admin';
    }

    if (role === 'admin') return true;

    switch (module) {
      case 'dashboard':
        return role !== 'reviewer' && role !== 'author';

      case 'sections':
        return true;

      case 'manuscripts':
      case 'editorial_reports':
        return (
          role === 'general_supervisor' ||
          role === 'editor_in_chief' ||
          role === 'advisory_head' ||
          role === 'managing_editor' ||
          role === 'secretary' ||
          role === 'executive_editor' ||
          role === 'editor' ||
          role === 'layout_editor'
        );

      case 'waiting_list':
        return (
          role === 'general_supervisor' ||
          role === 'editor_in_chief' ||
          role === 'managing_editor' ||
          role === 'secretary' ||
          role === 'executive_editor' ||
          role === 'editor' ||
          role === 'layout_editor'
        );

      case 'donates':
        return (
          role === 'general_supervisor' ||
          role === 'secretary' ||
          role === 'editor_in_chief'
        );

      case 'files':
      case 'google_drive':
        return (
          role === 'general_supervisor' ||
          role === 'editor_in_chief' ||
          role === 'managing_editor' ||
          role === 'secretary' ||
          role === 'advisory_head' ||
          role === 'executive_editor' ||
          role === 'editor'
        );

      case 'reviewers':
      case 'certificates':
        return (
          role === 'general_supervisor' ||
          role === 'editor_in_chief' ||
          role === 'managing_editor' ||
          role === 'secretary' ||
          role === 'executive_editor' ||
          role === 'editor' ||
          role === 'reviewer'
        );

      case 'cash_flow':
        return role === 'general_supervisor' || role === 'secretary';

      case 'users':
        return role === 'general_supervisor';

      case 'reviewer_portal':
        return role === 'reviewer';

      case 'author_portal':
        return role === 'author';

      default:
        return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        login,
        logout,
        switchRoleQuickly,
        addUser,
        updateUser,
        deleteUser,
        changePassword,
        canAccessModule,
        syncStatus,
        refreshUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
