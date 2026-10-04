import React, { useState } from 'react';
import { Download, Smartphone, X, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{ className?: string; compact?: boolean }> = ({
  className = '',
  compact = false,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      setInstallSuccess(true);
      setTimeout(() => setInstallSuccess(false), 4000);
    }
  };

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <>
        <button
          onClick={handleInstallClick}
          title="تثبيت المنظومة كتطبيق هاتف أو سطح مكتب"
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-950 bg-emerald-100/90 hover:bg-emerald-200 border border-emerald-300 rounded-xl transition-all shadow-xs cursor-pointer ${className}`}
        >
          <Smartphone className="w-3.5 h-3.5 text-emerald-800" />
          <span>{compact ? 'تثبيت' : 'تثبيت التطبيق (PWA)'}</span>
        </button>

        {installSuccess && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-emerald-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-emerald-700 animate-bounce">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-bold">تم تثبيت التطبيق بنجاح على جهازك!</span>
          </div>
        )}
      </>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          title="تثبيت التطبيق على أجهزة iPhone / iPad"
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-950 bg-emerald-100/90 hover:bg-emerald-200 border border-emerald-300 rounded-xl transition-all shadow-xs cursor-pointer ${className}`}
        >
          <Smartphone className="w-3.5 h-3.5 text-emerald-800" />
          <span>{compact ? 'تثبيت iOS' : 'تثبيت على iPhone'}</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
            <div className="w-full max-w-sm rounded-2xl bg-white p-5 sm:p-6 shadow-2xl border border-slate-200 text-slate-800 my-1 sm:my-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">تثبيت التطبيق على iOS</h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                لتثبيت تطبيق المجلة والوصول السريع من الشاشة الرئيسية لهاتفك بدون متجر:
              </p>

              <ol className="space-y-2.5 text-xs font-medium text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center shrink-0 text-2xs font-bold">1</span>
                  <span>اضغط على زر <strong>المشاركة (Share)</strong> في شريط متصفح Safari السفلي.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center shrink-0 text-2xs font-bold">2</span>
                  <span>مرر للأسفل واضغط على <strong>إضافة إلى الصفحة الرئيسية (Add to Home Screen)</strong>.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center shrink-0 text-2xs font-bold">3</span>
                  <span>اضغط <strong>إضافة (Add)</strong> بالأعلى لتظهر أيقونة المجلة على شاشتك.</span>
                </li>
              </ol>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-emerald-800 py-2.5 text-xs font-bold text-white hover:bg-emerald-900 transition-colors shadow-sm"
              >
                حسناً، فهمت
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback for desktop Chrome or when prompt is not yet ready:
  return (
    <button
      onClick={() => {
        alert('لتثبيت تطبيق المجلة: انقر على أيقونة التثبيت (⊕ أو الشاشة) في شريط عنوان المتصفح، أو اختر من القائمة: تثبيت التطبيق.');
      }}
      title="تثبيت المنظومة كتطبيق هاتف أو سطح مكتب"
      className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-emerald-950 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl transition-all shadow-xs cursor-pointer ${className}`}
    >
      <Download className="w-3.5 h-3.5 text-emerald-800" />
      <span>تثبيت التطبيق</span>
    </button>
  );
};
