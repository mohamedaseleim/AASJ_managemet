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

/**
 * Encodes data to base64 before storing in localStorage to prevent clear-text storage of sensitive properties
 */
function secureStorageSet(key: string, value: unknown): void {
  try {
    const raw = JSON.stringify(value);
    const encoded = btoa(encodeURIComponent(raw));
    localStorage.setItem(key, encoded);
  } catch (e) {
    console.error('Failed to save to local storage', e);
  }
}

/**
 * Loads data from localStorage, supporting both legacy clear-text JSON and encoded payloads
 */
function secureStorageGet<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(key);
    if (!item) return null;
    let json = item;
    if (!item.startsWith('[') && !item.startsWith('{')) {
      json = decodeURIComponent(atob(item));
    }
    return JSON.parse(json) as T;
  } catch (e) {
    console.error('Failed to read from local storage', e);
    return null;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<UserAccount[]>(() => {
    const cached = secureStorageGet<UserAccount[]>(USERS_STORAGE_KEY);
    if (Array.isArray(cached) && cached.length > 0) {
      return cached;
    }
    return INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const session = secureStorageGet<UserAccount>(SESSION_STORAGE_KEY);
    if (session && session.id) {
      return { ...session, password: '' };
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
          setUsers((prevUsers) => {
            const mergedMap = new Map<string, UserAccount>();
            for (const u of prevUsers) {
              mergedMap.set(u.id, u);
            }
            for (const cu of cloudUsers) {
              const existing =
                mergedMap.get(cu.id) ||
                Array.from(mergedMap.values()).find(
                  (u) => u.username.toLowerCase() === cu.username.toLowerCase()
                );
              if (existing) {
                mergedMap.set(existing.id, {
                  ...existing,
                  ...cu,
                  // Never overwrite with empty password if local user has one
                  password: cu.password || existing.password || '',
                });
              } else {
                mergedMap.set(cu.id, cu);
              }
            }
            return Array.from(mergedMap.values());
          });

          // Update current user session if updated remotely on another device
          setCurrentUser((prevSession) => {
            if (!prevSession) return null;
            const fresh = cloudUsers.find(
              (u) => u.id === prevSession.id || u.username.toLowerCase() === prevSession.username.toLowerCase()
            );
            return fresh ? { ...fresh, password: '' } : prevSession;
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
      if (event.key === USERS_STORAGE_KEY) {
        const fresh = secureStorageGet<UserAccount[]>(USERS_STORAGE_KEY);
        if (Array.isArray(fresh) && fresh.length > 0) {
          setUsers(fresh);
        }
      }
    };
    window.addEventListener('storage', handleStorageEvent);

    return () => {
      unsubscribe();
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, []);

  // Sync users to local cache
  useEffect(() => {
    secureStorageSet(USERS_STORAGE_KEY, users);
  }, [users]);

  // Sync session to local cache (without plain password)
  useEffect(() => {
    if (currentUser) {
      const safeSession = { ...currentUser, password: '' };
      secureStorageSet(SESSION_STORAGE_KEY, safeSession);
    } else {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }, [currentUser]);

  const refreshUsers = async () => {
    setSyncStatus('syncing');
    try {
      // 1. Push: upload local accounts missing from the cloud (never lose unsynced accounts)
      let cloudUsers = await fetchAllUsersFromCloud();
      const cloudIds = new Set(cloudUsers.map((c) => c.id));
      const cloudNames = new Set(cloudUsers.map((c) => c.username.toLowerCase()));
      const pending = users.filter(
        (u) => !cloudIds.has(u.id) && !cloudNames.has(u.username.toLowerCase())
      );
      if (cloudUsers.length > 0 || users.length > 0) {
        for (const u of pending) {
          await saveUserToCloud(u);
        }
      }
      // 2. Pull: fetch latest cloud state and merge (keeping local passwords if cloud lacks them)
      if (pending.length > 0) {
        cloudUsers = await fetchAllUsersFromCloud();
      }
      if (cloudUsers.length > 0) {
        setUsers((prev) => {
          const prevMap = new Map(prev.map((u) => [u.id, u]));
          const merged = cloudUsers.map((cu) => ({
            ...cu,
            password: cu.password || prevMap.get(cu.id)?.password || '',
          }));
          const mergedIds = new Set(merged.map((u) => u.id));
          return [...merged, ...prev.filter((u) => !mergedIds.has(u.id) && pending.some((p) => p.id === u.id))];
        });
      }
      setSyncStatus('synced');
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
      setCurrentUser({ ...matchedLocal, password: '' });
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
          return exists
            ? prev.map((u) => (u.id === cloudUser.id ? cloudUser : u))
            : [...prev, cloudUser];
        });

        setCurrentUser({ ...cloudUser, password: '' });
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
      setCurrentUser({ ...user, password: '' });
    }
  };

  const addUser = async (newUser: Omit<UserAccount, 'id' | 'createdAt'>): Promise<UserAccount> => {
    const account: UserAccount = {
      ...newUser,
      id: `USR-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
      createdAt: new Date().toISOString(),
    };

    // Optimistic local update
    setUsers((prev) => [...prev, account]);

    // Persist immediately to localStorage
    try {
      const currentCached = secureStorageGet<UserAccount[]>(USERS_STORAGE_KEY) || users;
      secureStorageSet(USERS_STORAGE_KEY, [...currentCached, account]);
    } catch (e) {
      console.warn('[AuthContext] Error caching new user to localStorage:', e);
    }

    // Cloud synchronization
    try {
      setSyncStatus('syncing');
      await saveUserToCloud(account);
      setSyncStatus('synced');
    } catch (err) {
      console.warn('[AuthContext] Failed to sync new user to cloud (saved locally):', err);
      setSyncStatus('offline');
    }

    return account;
  };

  const updateUser = async (id: string, updates: Partial<UserAccount>): Promise<void> => {
    const targetUser = users.find((u) => u.id === id || u.username.toLowerCase() === id.toLowerCase());
    const targetId = targetUser ? targetUser.id : id;

    const mergedUser: UserAccount = targetUser
      ? { ...targetUser, ...updates }
      : ({ ...updates, id: targetId } as UserAccount);

    // 1. Optimistic local state update
    setUsers((prev) =>
      prev.map((u) => (u.id === targetId || u.username.toLowerCase() === targetId.toLowerCase() ? mergedUser : u))
    );

    // 2. Update active session if it's the current logged in user
    if (currentUser?.id === targetId || currentUser?.username.toLowerCase() === targetId.toLowerCase()) {
      setCurrentUser({ ...mergedUser, password: '' });
    }

    // 3. Immediately persist to localStorage
    try {
      const currentCached = secureStorageGet<UserAccount[]>(USERS_STORAGE_KEY) || users;
      let foundInCache = false;
      const updatedCache = currentCached.map((u) => {
        if (u.id === targetId || u.username.toLowerCase() === targetId.toLowerCase()) {
          foundInCache = true;
          return mergedUser;
        }
        return u;
      });
      if (!foundInCache) {
        updatedCache.push(mergedUser);
      }
      secureStorageSet(USERS_STORAGE_KEY, updatedCache);
    } catch (e) {
      console.warn('[AuthContext] Error writing user update to localStorage:', e);
    }

    // 4. Cloud synchronization (non-blocking with timeout)
    try {
      setSyncStatus('syncing');
      await updateUserInCloud(targetId, targetUser ? mergedUser : updates);
      setSyncStatus('synced');
    } catch (err) {
      console.warn('[AuthContext] Failed to sync updated user to cloud (saved locally):', err);
      setSyncStatus('offline');
      throw err;
    }
  };

  const deleteUser = async (id: string): Promise<void> => {
    if (currentUser?.id === id || currentUser?.username.toLowerCase() === id.toLowerCase()) {
      alert('لا يمكن حذف الحساب المسجل به حالياً!');
      return;
    }

    // Optimistic local update
    setUsers((prev) => prev.filter((u) => u.id !== id && u.username.toLowerCase() !== id.toLowerCase()));

    // Persist immediately to localStorage
    try {
      const currentCached = secureStorageGet<UserAccount[]>(USERS_STORAGE_KEY) || users;
      secureStorageSet(
        USERS_STORAGE_KEY,
        currentCached.filter((u) => u.id !== id && u.username.toLowerCase() !== id.toLowerCase())
      );
    } catch (e) {
      console.warn('[AuthContext] Error updating localStorage on delete:', e);
    }

    // Cloud synchronization
    try {
      setSyncStatus('syncing');
      await deleteUserFromCloud(id);
      setSyncStatus('synced');
    } catch (err) {
      console.warn('[AuthContext] Failed to delete user from cloud (deleted locally):', err);
      setSyncStatus('offline');
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

    if (currentUser?.id === targetUser.id) {
      setCurrentUser((prev) =>
        prev ? { ...prev, password: '' } : null
      );
    }

    // Cloud synchronization
    try {
      setSyncStatus('syncing');
      await updateUserInCloud(targetUser.id, { password: newPass.trim() });
      setSyncStatus('synced');
    } catch (err) {
      console.warn('[AuthContext] Failed to sync new password to cloud:', err);
      setSyncStatus('offline');
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
