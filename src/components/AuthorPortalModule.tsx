import React, { useState, useMemo } from 'react';
import {
  FileText,
  Plus,
  Upload,
  Printer,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useJournal } from '../context/JournalContext';
import { DISCIPLINE_TRANSLATIONS, STATUS_TRANSLATIONS } from '../translations';
import { DonationRecord, Manuscript } from '../types/journal';

export const AuthorPortalModule: React.FC<{
  onOpenAddManuscript: () => void;
  onSelectManuscript: (m: Manuscript) => void;
  onPrintLetter: (m: Manuscript) => void;
  onPrintReceipt: (d: DonationRecord) => void;
}> = ({ onOpenAddManuscript, onSelectManuscript, onPrintLetter, onPrintReceipt }) => {
  const { currentUser } = useAuth();
  const { manuscripts, donations, updateManuscript } = useJournal();
  
  const [uploadRevisedModal, setUploadRevisedModal] = useState<Manuscript | null>(null);
  const [revisedUrl, setRevisedUrl] = useState('');

  // Find manuscripts associated with this author (or all if admin)
  const authorManuscripts = useMemo(() => {
    if (currentUser?.role === 'admin') {
      return manuscripts;
    }
    const userEmail = (currentUser?.email || '').toLowerCase().trim();
    const userName = (currentUser?.fullName || '').toLowerCase().trim();

    return manuscripts.filter((m) => {
      const matchEmail =
        m.correspondAuthorEmail.toLowerCase() === userEmail ||
        (m.authorsEmails || '').toLowerCase().includes(userEmail);
      const matchName =
        (m.authorsNames || '').toLowerCase().includes(userName) ||
        m.correspondAuthorLastName.toLowerCase().includes(userName);

      return matchEmail || matchName;
    });
  }, [currentUser, manuscripts]);

  const handleSaveRevised = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadRevisedModal || !revisedUrl.trim()) return;

    updateManuscript(uploadRevisedModal.id, {
      revisedFileUrl: revisedUrl,
      status: 'Manuscript Revised by Author',
      reviseDate: new Date().toISOString().split('T')[0],
    });

    alert('تم رفع النسخة المعدلة بنجاح وإشعار هيئة التحرير!');
    setUploadRevisedModal(null);
    setRevisedUrl('');
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-xs">
              بوابة المؤلفين والباحثين (Author Submission & Tracking Portal)
            </span>
            <h1 className="text-xl sm:text-2xl font-bold font-serif text-slate-900">
              أهلاً بك يا {currentUser?.fullName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-3xl">
              متابعة حالة تحكيم أبحاثك المقدمة لمجلة أرشيف العلوم الزراعية، رفع النسخ المعدلة وفقاً لملاحظات المحكمين، وتنزيل خطابات القبول الرسمية وسندات سداد الرسوم.
            </p>
          </div>

          <button
            onClick={onOpenAddManuscript}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ تقديم بحث جديد للمجلة</span>
          </button>
        </div>
      </div>

      {/* Author Manuscripts List */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
          أبحاثك ومخطوطاتك المسجلة ({authorManuscripts.length})
        </h2>

        {authorManuscripts.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {authorManuscripts.map((m) => {
              const statusInfo = STATUS_TRANSLATIONS[m.status] || {
                ar: m.status,
                badgeClass: 'text-slate-700 bg-slate-100',
              };

              const isAccepted = m.status.includes('Accepted') || m.status.includes('Published');
              const needsRevision = m.status.includes('Revision') || m.status.includes('Resubmit');
              const relatedDonation = donations.find((d) => d.manuscriptId === m.id);

              return (
                <div
                  key={m.id}
                  className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-all space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                        <span className="font-bold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {m.id}
                        </span>
                        <span>·</span>
                        <span>{m.documentType}</span>
                        <span>·</span>
                        <span>تاريخ التقديم: {m.receiveDate}</span>
                        <span>·</span>
                        <span>المجلد {m.volume}، العدد {m.issue}</span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 leading-snug">
                        {m.articleTitle}
                      </h3>

                      <p className="text-xs text-slate-500">
                        الباحثون: {m.authorsNames || `${m.correspondAuthorFirstName} ${m.correspondAuthorLastName}`}
                      </p>
                    </div>

                    <div className="shrink-0 text-left rtl:text-right">
                      <span className={`inline-block px-3 py-1 text-xs font-bold rounded-md ${statusInfo.badgeClass}`}>
                        {statusInfo.ar}
                      </span>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => onSelectManuscript(m)}
                        className="font-semibold text-emerald-800 hover:underline"
                      >
                        عرض ملف المخطوطة والتعليقات
                      </button>

                      {m.submittedFileUrl && (
                        <a
                          href={m.submittedFileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-slate-500 hover:text-slate-900 flex items-center gap-1 font-mono"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>النسخة المقدمة</span>
                        </a>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Upload Revised Draft */}
                      {needsRevision && (
                        <button
                          onClick={() => {
                            setUploadRevisedModal(m);
                            setRevisedUrl(m.revisedFileUrl || '');
                          }}
                          className="px-3.5 py-1.5 font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>رفع المخطوطة المعدلة</span>
                        </button>
                      )}

                      {/* Official Acceptance Letter */}
                      {isAccepted && (
                        <button
                          onClick={() => onPrintLetter(m)}
                          className="px-3.5 py-1.5 font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>تحميل / طباعة خطاب القبول</span>
                        </button>
                      )}

                      {/* Payment Receipt */}
                      {relatedDonation && (
                        <button
                          onClick={() => onPrintReceipt(relatedDonation)}
                          className="px-3.5 py-1.5 font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors flex items-center gap-1.5"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>سند سداد الرسوم</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400 text-xs space-y-3">
            <FileText className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="font-semibold text-slate-700 text-sm">ليس لديك أبحاث مسجلة حالياً بهذا الحساب</p>
            <p>يمكنك تقديم بحثك الأول للنشر في مجلة أرشيف العلوم الزراعية بالضغط على الزر أدناه:</p>
            <button
              onClick={onOpenAddManuscript}
              className="px-4 py-2 font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg shadow-xs transition-colors inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>تقديم بحث جديد للنشر</span>
            </button>
          </div>
        )}
      </div>

      {/* Upload Revised Draft Modal */}
      {uploadRevisedModal && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-slate-900/70 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden my-1 sm:my-auto flex flex-col max-h-[96dvh] sm:max-h-[94vh]">
            <div className="px-4 sm:px-6 py-3.5 bg-emerald-950 text-white flex items-center justify-between shrink-0 sticky top-0 z-20">
              <div>
                <h3 className="font-bold text-sm">رفع النسخة المعدلة من البحث</h3>
                <p className="text-xs text-emerald-200">{uploadRevisedModal.id}</p>
              </div>
              <button
                onClick={() => setUploadRevisedModal(null)}
                className="p-1 text-emerald-200 hover:text-white rounded-lg hover:bg-emerald-900 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveRevised} className="p-4 sm:p-6 space-y-4 text-xs overflow-y-auto flex-1">
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  رابط ملف المخطوطة بعد تعديل ملاحظات المحكمين:
                </label>
                <input
                  type="url"
                  value={revisedUrl}
                  onChange={(e) => setRevisedUrl(e.target.value)}
                  required
                  placeholder="https://aasj.journals.ekb.eg/... أو رابط الملف"
                  className="w-full p-2.5 border border-slate-300 rounded-lg font-mono text-slate-800"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  يرجى التأكد من تمييز التعديلات المطلوبة (بألوان واضحة أو تعليقات الرد على المحكمين).
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setUploadRevisedModal(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-lg shadow-xs"
                >
                  تأكيد وإرسال النسخة المعدلة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
