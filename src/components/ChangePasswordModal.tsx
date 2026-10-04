import React, { useState } from 'react';
import {
  Key,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  X,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useJournal } from '../context/JournalContext';
import { ROLE_INFO } from '../data/journalSections';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  targetUsername?: string; // If not provided, defaults to currentUser.username
}

export const ChangePasswordModal: React.FC<Props> = ({
  isOpen,
  onClose,
  targetUsername,
}) => {
  const { currentUser, users, changePassword } = useAuth();
  const { addActivityLog, language } = useJournal();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const targetAccount =
    users.find(
      (u) =>
        u.username.toLowerCase() ===
        (targetUsername || currentUser?.username || '').toLowerCase()
    ) || currentUser;

  const roleMeta = targetAccount ? ROLE_INFO[targetAccount.role] : null;

  // Simple password strength calculation
  const calculateStrength = (pwd: string) => {
    if (!pwd) return { score: 0, text: '', color: 'bg-slate-200' };
    let s = 0;
    if (pwd.length >= 6) s += 1;
    if (pwd.length >= 8) s += 1;
    if (/[A-Z]/.test(pwd) || /[a-z]/.test(pwd)) s += 1;
    if (/[0-9]/.test(pwd)) s += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) s += 1;

    if (s <= 2) return { score: 1, text: language === 'ar' ? 'ضعيفة' : 'Weak', color: 'bg-rose-500' };
    if (s <= 3) return { score: 2, text: language === 'ar' ? 'متوسطة' : 'Medium', color: 'bg-amber-500' };
    return { score: 3, text: language === 'ar' ? 'قوية وموصى بها' : 'Strong', color: 'bg-emerald-600' };
  };

  const strength = calculateStrength(newPassword);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!targetAccount) {
      setErrorMsg('المستخدم غير محدد.');
      return;
    }

    if (!currentPassword.trim()) {
      setErrorMsg(language === 'ar' ? 'يرجى إدخال كلمة المرور الحالية.' : 'Please enter your current password.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setErrorMsg(
        language === 'ar'
          ? 'كلمة المرور الجديدة يجب أن لا تقل عن 6 خانات أو رموز.'
          : 'New password must be at least 6 characters.'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg(
        language === 'ar'
          ? 'كلمة المرور الجديدة غير متطابقة مع تأكيد كلمة المرور.'
          : 'New password and confirmation do not match.'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const res = changePassword(targetAccount.id, currentPassword, newPassword);

      if (!res.success) {
        setErrorMsg(res.message);
        setIsSubmitting(false);
        return;
      }

      setSuccessMsg(
        language === 'ar'
          ? 'تم تغيير كلمة المرور بنجاح! تم تحديث بيانات الحساب وتأمينها.'
          : 'Password changed successfully!'
      );

      // Log activity
      addActivityLog({
        username: currentUser?.username || targetAccount.username,
        userFullName: currentUser?.fullName || targetAccount.fullName,
        userRole: currentUser?.role || targetAccount.role,
        actionType: 'user_management',
        title: `تحديث كلمة المرور للحساب @${targetAccount.username}`,
        description: `قام المستخدم بتغيير كلمة المرور الخاصة به وتأمين الحساب بنجاح.`,
        targetId: targetAccount.id,
        severity: 'success',
      });

      // Clear fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      setTimeout(() => {
        setIsSubmitting(false);
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'حدث خطأ أثناء تغيير كلمة المرور.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-slate-900/70 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden my-1 sm:my-auto flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-emerald-700/80 text-white">
              <Key className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold font-serif">
                {language === 'ar' ? 'تغيير كلمة المرور وتأمين الحساب' : 'Change Account Password'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {language === 'ar' ? 'إدارة الأمان وكلمات المرور الرسمية' : 'Security & Password Management'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Account Info Banner */}
        {targetAccount && (
          <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500 font-medium">الحساب: </span>
              <strong className="text-slate-900 font-bold">{targetAccount.fullName}</strong>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[11px] text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                @{targetAccount.username}
              </span>
              {roleMeta && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${roleMeta.badgeColor}`}>
                  {roleMeta.titleAr}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2 font-medium">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2 font-bold animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* 1. Current Password */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">
              {language === 'ar' ? 'كلمة المرور الحالية:' : 'Current Password:'}
            </label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full py-2.5 px-3 rtl:pl-10 ltr:pr-10 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute top-2.5 rtl:left-3 ltr:right-3 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* 2. New Password */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">
              {language === 'ar' ? 'كلمة المرور الجديدة:' : 'New Password:'}
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full py-2.5 px-3 rtl:pl-10 ltr:pr-10 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute top-2.5 rtl:left-3 ltr:right-3 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Strength indicator */}
            {newPassword.length > 0 && (
              <div className="mt-1.5 space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                  <span>قوة كلمة المرور:</span>
                  <span className="font-bold">{strength.text}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${strength.color}`}
                    style={{ width: `${(strength.score / 3) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
            <p className="text-[10.5px] text-slate-500 mt-1">
              يجب أن تحتوي على 6 أحرف أو أرقام على الأقل.
            </p>
          </div>

          {/* 3. Confirm New Password */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">
              {language === 'ar' ? 'تأكيد كلمة المرور الجديدة:' : 'Confirm New Password:'}
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full py-2.5 px-3 rtl:pl-10 ltr:pr-10 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute top-2.5 rtl:left-3 ltr:right-3 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {confirmPassword.length > 0 && newPassword !== confirmPassword && (
              <p className="text-[11px] text-rose-600 font-semibold mt-1">
                كلمتا المرور غير متطابقتين.
              </p>
            )}
          </div>

          {/* Submit Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer"
            >
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isSubmitting || (confirmPassword.length > 0 && newPassword !== confirmPassword)}
              className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isSubmitting ? 'جارٍ الحفظ والتأمين...' : 'حفظ كلمة المرور الجديدة'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
