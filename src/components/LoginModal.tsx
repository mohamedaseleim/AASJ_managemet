import React, { useState } from 'react';
import { Lock, User, Key, Eye, EyeOff, ShieldCheck, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AasjLogo } from './AasjLogo';

export const LoginModal: React.FC<{ isOpen: boolean; onClose?: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { login, logout, currentUser } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      const success = await login(username, password);
      if (success) {
        if (onClose) onClose();
      } else {
        setErrorMsg('اسم المستخدم أو كلمة المرور غير صحيحة، يرجى التحقق من صحة البيانات.');
      }
    } catch {
      setErrorMsg('تعذر تسجيل الدخول، يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-slate-900/70 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden my-1 sm:my-auto flex flex-col">
        
        {/* Header */}
        <div className="bg-emerald-950 text-white p-6 text-center relative">
          <div className="flex justify-center mb-3">
            <AasjLogo className="w-14 h-14" />
          </div>
          <h2 className="text-base font-serif font-bold tracking-tight">
            مجلة أرشيف العلوم الزراعية (AASJ)
          </h2>
          <p className="text-xs text-emerald-200 mt-1">
            كلية الزراعة (فرع أسيوط)، جامعة الأزهر · بنك المعرفة المصري (EKB)
          </p>
          <p className="text-[11px] text-emerald-300/80 font-sans mt-0.5">
            تسجيل الدخول للمنظومة التحريرية
          </p>

          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 left-4 text-emerald-300 hover:text-white p-1 rounded-lg hover:bg-emerald-900 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
                <span>⚠️</span>
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                اسم المستخدم (Username):
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute top-2.5 right-3 text-slate-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="أدخل اسم المستخدم..."
                  className="w-full text-xs py-2 pr-9 pl-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-700 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                كلمة المرور (Password):
              </label>
              <div className="relative">
                <Key className="w-4 h-4 absolute top-2.5 right-3 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full text-xs py-2 pr-9 pl-9 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-700 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-2.5 left-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 disabled:opacity-60 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 mt-4 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'جارٍ التحقق وتأكيد الدخول...' : 'تسجيل الدخول للمنظومة'}</span>
            </button>
          </form>

          {currentUser && (
            <div className="mt-5 pt-4 border-t border-slate-200 flex items-center justify-between gap-2 text-xs">
              <span className="text-slate-500 truncate">
                المستخدم الحالي: <strong className="text-slate-900">{currentUser.fullName}</strong>
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="px-3 py-1.5 font-bold text-rose-700 hover:text-white bg-rose-50 hover:bg-rose-700 border border-rose-200 rounded-xl transition-colors cursor-pointer shrink-0"
              >
                تسجيل الخروج
              </button>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-center text-[11px] text-slate-500 font-mono">
          Archives of Agriculture Sciences Journal · AASJ
        </div>

      </div>
    </div>
  );
};
