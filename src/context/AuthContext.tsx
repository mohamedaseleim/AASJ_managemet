import React, { createContext, useContext, useEffect, useState } from 'react';
import { INITIAL_USERS } from '../data/initialUsers';
import { ActiveModule, JournalDiscipline, UserAccount, UserRole } from '../types/journal';

interface AuthContextType {
  currentUser: UserAccount | null;
  users: UserAccount[];
  login: (username: string, password: string) => boolean;
  logout: () => void;
  switchRoleQuickly: (username: string) => void;
  changePassword: (
    userIdOrUsername: string,
    currentPass: string,
    newPass: string
  ) => { success: boolean; message: string };
  addUser: (user: Omit<UserAccount, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, updates: Partial<UserAccount>) => void;
  deleteUser: (id: string) => void;
  canAccessModule: (module: ActiveModule) => boolean;
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
    // No active session: lands on the Portal Login Gateway page
    return null;
  });

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

  const login = (username: string, password: string): boolean => {
    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password.trim();

    const user = users.find(
      (u) =>
        u.username.toLowerCase() === cleanUsername &&
        u.password === cleanPassword &&
        u.isActive
    );

    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const switchRoleQuickly = (username: string) => {
    const user = users.find((u) => u.username === username);
    if (user) {
      setCurrentUser(user);
    }
  };

  const addUser = (newUser: Omit<UserAccount, 'id' | 'createdAt'>) => {
    const account: UserAccount = {
      ...newUser,
      id: `USR-${Date.now().toString().slice(-5)}`,
      createdAt: new Date().toISOString(),
    };
    setUsers((prev) => [...prev, account]);
  };

  const updateUser = (id: string, updates: Partial<UserAccount>) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...updates } : u))
    );
    if (currentUser?.id === id) {
      setCurrentUser((prev) => (prev ? { ...prev, ...updates } : null));
    }
  };

  const deleteUser = (id: string) => {
    if (currentUser?.id === id) {
      alert('لا يمكن حذف الحساب المسجل به حالياً!');
      return;
    }
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const changePassword = (
    userIdOrUsername: string,
    currentPass: string,
    newPass: string
  ): { success: boolean; message: string } => {
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
        prev ? { ...prev, password: newPass.trim() } : null
      );
    }

    return {
      success: true,
      message: 'تم تغيير كلمة المرور بنجاح وحفظها بشكل آمن.',
    };
  };

  // Role-Based Access Control logic (RBAC)
  const canAccessModule = (module: ActiveModule): boolean => {
    if (!currentUser) return false;
    const { role } = currentUser;

    // Activity & Audit log is STRICTLY accessible ONLY by the Admin role
    if (module === 'activity_logs') {
      return role === 'admin';
    }

    if (role === 'admin') return true;

    switch (module) {
      case 'dashboard':
        return role !== 'reviewer' && role !== 'author';

      case 'sections':
        return true; // All authenticated users can view the 7 sections of the journal

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
        // Financial ledger is overseen by Dean / General Supervisor and Secretary
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
