import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Copy,
  Check,
  Languages,
  BookOpen,
  FileCheck,
  Tag,
  ArrowRightLeft,
  Loader2,
  AlertCircle,
  Key,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { Manuscript } from '../types/journal';
import {
  requestProofreading,
  getGroqApiKey,
  setGroqApiKey,
} from '../services/aiService';

interface AcademicProofreadingModalProps {
  manuscript?: Manuscript;
  initialText?: string;
  onClose: () => void;
  onApplyText?: (polishedText: string) => void;
}

export const AcademicProofreadingModal: React.FC<AcademicProofreadingModalProps> = ({
  manuscript,
  initialText = '',
  onClose,
  onApplyText,
}) => {
  const [inputText, setInputText] = useState(
    initialText ||
      manuscript?.abstractAr ||
      manuscript?.abstractEn ||
      manuscript?.titleAr ||
      ''
  );
  const [task, setTask] = useState<
    'proofread' | 'polish_abstract' | 'translate_en' | 'translate_ar' | 'extract_keywords'
  >('polish_abstract');
  const [isLoading, setIsLoading] = useState(false);
  const [resultText, setResultText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);
  const [showKeySettings, setShowKeySettings] = useState(false);
  const [keyInput, setKeyInput] = useState(() => getGroqApiKey());
  const [keySavedMsg, setKeySavedMsg] = useState('');

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
    setGroqApiKey(keyInput);
    setKeySavedMsg('تم حفظ مفتاح Groq بنجاح في متصفحك!');
    setTimeout(() => setKeySavedMsg(''), 3000);
  };

  const handleClearKey = () => {
    setGroqApiKey('');
    setKeyInput('');
    setKeySavedMsg('تم مسح المفتاح بنجاح.');
    setTimeout(() => setKeySavedMsg(''), 3000);
  };

  const handleProcess = async () => {
    if (!inputText.trim()) {
      setErrorMsg('يرجى إدخال أو لصق النص الأكاديمي أولاً');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    try {
      const response = await requestProofreading({
        text: inputText,
        task,
      });

      if (response.success && response.result) {
        setResultText(response.result);
      } else {
        setErrorMsg(response.error || 'فشلت معالجة النص، يرجى المحاولة لاحقاً');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'حدث خطأ أثناء الاتصال بالخادم الأكاديمي');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(resultText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApply = () => {
    if (onApplyText && resultText) {
      onApplyText(resultText);
      onClose();
    }
  };

  const hasApiKey = Boolean(getGroqApiKey());

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/75 backdrop-blur-xs p-1.5 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-slate-200 my-1 sm:my-auto flex flex-col max-h-[96dvh] sm:max-h-[96vh]">
        {/* Header - Sticky & shrink-0 */}
        <div className="flex items-center justify-between p-3 sm:px-6 sm:py-3.5 bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 text-white gap-2 shrink-0 sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="p-1.5 sm:p-2 bg-amber-400 text-slate-950 rounded-xl shadow-xs shrink-0">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h3 className="font-extrabold text-xs sm:text-base truncate">المساعد الأكاديمي للتدقيق وصياغة المستخلصات</h3>
                <span className="px-2 py-0.5 bg-emerald-800 text-amber-300 text-3xs font-extrabold rounded-full border border-emerald-700 shrink-0">
                  Groq AI Engine
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-emerald-200 mt-0.5 truncate">
                مجلة أرشيف العلوم الزراعية (AASJ)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setShowKeySettings(!showKeySettings)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                hasApiKey
                  ? 'bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 border-emerald-600'
                  : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border-amber-400/50'
              }`}
              title="إعداد مفتاح Groq API"
            >
              <Key className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {hasApiKey ? 'مفتاح Groq مفعّل' : 'إعداد مفتاح Groq'}
              </span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-300 hover:text-white rounded-xl hover:bg-white/10 active:bg-white/20 transition-colors cursor-pointer shrink-0"
              title="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Optional Groq API Key Configuration Panel */}
        {showKeySettings && (
          <div className="bg-slate-900 text-white p-4 border-b border-slate-800 text-xs animate-in slide-in-from-top-2 duration-150">
            <div className="max-w-3xl mx-auto space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-amber-400" />
                  <span className="font-bold">إعدادات مفتاح الذكاء الاصطناعي (Groq API Key):</span>
                </div>
                <a
                  href="https://console.groq.com/keys"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-amber-300 hover:underline flex items-center gap-1"
                >
                  <span>الحصول على مفتاح مجاني من console.groq.com</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed">
                يتيح لك مفتاح Groq تشغيل الذكاء الاصطناعي الفائق السرعة (Llama 3.3 70B) مباشرة على استضافة <strong>GitHub Pages</strong> وبشكل مجاني تماماً.
              </p>

              <form onSubmit={handleSaveKey} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="password"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder="gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition-colors cursor-pointer"
                >
                  حفظ المفتاح
                </button>
                {keyInput && (
                  <button
                    type="button"
                    onClick={handleClearKey}
                    className="px-3 py-2 bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-white border border-slate-700 rounded-xl transition-colors cursor-pointer"
                  >
                    مسح
                  </button>
                )}
              </form>

              {keySavedMsg && (
                <div className="text-emerald-400 font-semibold text-[11px] flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{keySavedMsg}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="p-3 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {/* Action Tabs */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              اختر العملية الأكاديمية المطلوبة:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <button
                type="button"
                onClick={() => setTask('polish_abstract')}
                className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  task === 'polish_abstract'
                    ? 'bg-emerald-900 text-amber-300 shadow-sm ring-2 ring-emerald-800'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>صياغة المستخلص</span>
              </button>

              <button
                type="button"
                onClick={() => setTask('proofread')}
                className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  task === 'proofread'
                    ? 'bg-emerald-900 text-amber-300 shadow-sm ring-2 ring-emerald-800'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span>تدقيق لغوي</span>
              </button>

              <button
                type="button"
                onClick={() => setTask('translate_en')}
                className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  task === 'translate_en'
                    ? 'bg-emerald-900 text-amber-300 shadow-sm ring-2 ring-emerald-800'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Languages className="w-3.5 h-3.5" />
                <span>ترجمة للإنجليزية</span>
              </button>

              <button
                type="button"
                onClick={() => setTask('translate_ar')}
                className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  task === 'translate_ar'
                    ? 'bg-emerald-900 text-amber-300 shadow-sm ring-2 ring-emerald-800'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Languages className="w-3.5 h-3.5" />
                <span>ترجمة للعربية</span>
              </button>

              <button
                type="button"
                onClick={() => setTask('extract_keywords')}
                className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  task === 'extract_keywords'
                    ? 'bg-emerald-900 text-amber-300 shadow-sm ring-2 ring-emerald-800'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Tag className="w-3.5 h-3.5" />
                <span>استخراج الكلمات</span>
              </button>
            </div>
          </div>

          {/* Manuscript Reference if present */}
          {manuscript && (
            <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
              <div>
                <span className="font-bold">البحث المستهدف: </span>
                <span className="font-semibold">{manuscript.code} — {manuscript.titleAr || manuscript.titleEn}</span>
              </div>
              <button
                type="button"
                onClick={() => setInputText(manuscript.abstractAr || manuscript.abstractEn || '')}
                className="text-emerald-800 hover:underline font-bold text-3xs shrink-0"
              >
                تحميل مستخلص البحث
              </button>
            </div>
          )}

          {/* Text Areas (Original vs Result) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Input Box */}
            <div className="flex flex-col">
              <label className="text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>النص الأصلي (مستخلص البحث أو المحتوى الأكاديمي):</span>
                <span className="text-slate-400 font-normal">{inputText.length} حرف</span>
              </label>
              <textarea
                rows={9}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="الصق نص مستخلص البحث هنا باللغة العربية أو الإنجليزية..."
                className="w-full p-3.5 text-xs bg-slate-50 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white text-slate-900 placeholder-slate-400 font-medium leading-relaxed resize-none transition-all shadow-inner"
              />
            </div>

            {/* Output Box */}
            <div className="flex flex-col">
              <label className="text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-emerald-950 font-bold">النتيجة المعالجة أكاديمياً:</span>
                </span>
                {resultText && (
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-3xs font-bold text-slate-600 hover:text-emerald-900 cursor-pointer"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'تم النسخ' : 'نسخ النتيجة'}</span>
                  </button>
                )}
              </label>

              <div className="relative flex-1 min-h-[200px] p-3.5 text-xs bg-emerald-50/40 border border-emerald-200/90 rounded-2xl overflow-y-auto text-slate-900 leading-relaxed font-medium">
                {isLoading ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 backdrop-blur-2xs gap-3">
                    <Loader2 className="w-8 h-8 text-emerald-700 animate-spin" />
                    <span className="text-xs font-bold text-emerald-950">جاري التدقيق والمعالجة الأكاديمية...</span>
                  </div>
                ) : resultText ? (
                  <div className="whitespace-pre-line">{resultText}</div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center py-8">
                    <Sparkles className="w-8 h-8 text-slate-300 mb-2" />
                    <p>انقر على "بدء التدقيق والمعالجة" بالأدنى لتوليد النتيجة المحسّنة.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action Footer */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-slate-100">
            <div className="text-3xs text-slate-500">
              * يتم فحص ومطابقة الصياغة الأكاديمية لمعايير النشر المعتمدة في بنك المعرفة المصري EKB.
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {resultText && onApplyText && (
                <button
                  type="button"
                  onClick={handleApply}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5 flex-1 sm:flex-initial"
                >
                  <Check className="w-4 h-4" />
                  <span>اعتماد النص في المخطوطة</span>
                </button>
              )}

              <button
                type="button"
                disabled={isLoading || !inputText.trim()}
                onClick={handleProcess}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-800 to-emerald-950 hover:from-emerald-900 hover:to-slate-900 text-amber-300 text-xs font-extrabold rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 flex-1 sm:flex-initial"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                    <span>جاري المعالجة...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>بدء التدقيق والمعالجة الأكاديمية</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
