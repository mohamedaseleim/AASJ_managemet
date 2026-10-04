import React, { useState, useMemo } from 'react';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Upload,
  ExternalLink,
  MessageSquare,
  Save,
  Award,
  Download,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useJournal } from '../context/JournalContext';
import { DISCIPLINE_TRANSLATIONS, STATUS_TRANSLATIONS } from '../translations';
import { Manuscript, ReviewerRecommendation } from '../types/journal';
import { ReviewDeadlineBadge } from './ReviewDeadlineBadge';
import { ReviewerCertificateModal } from './ReviewerCertificateModal';

export const ReviewerPortalModule: React.FC<{
  onSelectManuscript: (m: Manuscript) => void;
}> = ({ onSelectManuscript }) => {
  const { currentUser } = useAuth();
  const { manuscripts, updateManuscript } = useJournal();
  
  const [selectedManuscriptForReview, setSelectedManuscriptForReview] = useState<Manuscript | null>(null);
  const [recommendation, setRecommendation] = useState<ReviewerRecommendation>('Manuscript Needs Revision (Minor Revision)');
  const [editorComment, setEditorComment] = useState('');
  const [reviewFileUrl, setReviewFileUrl] = useState('');
  const [showCertificateFor, setShowCertificateFor] = useState<Manuscript | null>(null);
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);

  // Find manuscripts assigned to this reviewer (or all manuscripts if admin with full privileges)
  const assignedManuscripts = useMemo(() => {
    if (currentUser?.role === 'admin') {
      return manuscripts;
    }
    const userEmail = (currentUser?.email || '').toLowerCase().trim();
    const userName = (currentUser?.fullName || '').toLowerCase().trim();

    return manuscripts.filter((m) => {
      const matchesR1 = m.reviewerOne?.email.toLowerCase() === userEmail || (userName && m.reviewerOne?.name.toLowerCase().includes(userName));
      const matchesR2 = m.reviewerTwo?.email.toLowerCase() === userEmail || (userName && m.reviewerTwo?.name.toLowerCase().includes(userName));
      const matchesR3 = m.reviewerThree?.email.toLowerCase() === userEmail || (userName && m.reviewerThree?.name.toLowerCase().includes(userName));
      const matchesR4 = m.reviewerFour?.email.toLowerCase() === userEmail || (userName && m.reviewerFour?.name.toLowerCase().includes(userName));

      return matchesR1 || matchesR2 || matchesR3 || matchesR4;
    });
  }, [currentUser, manuscripts]);

  const handleOpenReviewForm = (m: Manuscript) => {
    setSelectedManuscriptForReview(m);
    // Find reviewer slot
    const userEmail = (currentUser?.email || '').toLowerCase().trim();
    let existingData;
    if (m.reviewerOne?.email.toLowerCase() === userEmail) existingData = m.reviewerOne;
    else if (m.reviewerTwo?.email.toLowerCase() === userEmail) existingData = m.reviewerTwo;
    else if (m.reviewerThree?.email.toLowerCase() === userEmail) existingData = m.reviewerThree;
    else if (m.reviewerFour?.email.toLowerCase() === userEmail) existingData = m.reviewerFour;
    else existingData = m.reviewerOne;

    setRecommendation(existingData?.recommendation || 'Manuscript Needs Revision (Minor Revision)');
    setEditorComment(existingData?.comment || '');
    setReviewFileUrl(existingData?.fileUrl || '');
  };

  const handleSaveReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedManuscriptForReview) return;

    const m = selectedManuscriptForReview;
    const userEmail = (currentUser?.email || '').toLowerCase().trim();
    const today = new Date().toISOString().split('T')[0];

    let updatedSlots: Partial<Manuscript> = {};

    if (m.reviewerOne?.email.toLowerCase() === userEmail) {
      updatedSlots = {
        reviewerOne: {
          ...m.reviewerOne,
          recommendation,
          comment: editorComment,
          fileUrl: reviewFileUrl,
          reviewDate: today,
        },
      };
    } else if (m.reviewerTwo?.email.toLowerCase() === userEmail) {
      updatedSlots = {
        reviewerTwo: {
          ...m.reviewerTwo,
          recommendation,
          comment: editorComment,
          fileUrl: reviewFileUrl,
          reviewDate: today,
        },
      };
    } else {
      // Default to reviewerOne
      updatedSlots = {
        reviewerOne: {
          ...(m.reviewerOne || {
            name: currentUser?.fullName || 'محكم معتمد',
            email: currentUser?.email || 'reviewer@azhar.edu.eg',
            affiliation: currentUser?.affiliation || 'كلية الزراعة، جامعة الأزهر',
            assignDate: today,
            reviewDueDate: today,
          }),
          recommendation,
          comment: editorComment,
          fileUrl: reviewFileUrl,
          reviewDate: today,
        },
      };
    }

    updateManuscript(m.id, {
      ...updatedSlots,
      status: 'Manuscript Reviewed by Reviewers',
    });

    setStatusFeedback('تم إرسال تقرير التحكيم بنجاح إلى هيئة التحرير واعتماد المراجعة!');
    setSelectedManuscriptForReview(null);
    setTimeout(() => setStatusFeedback(null), 4000);
  };

  const completedManuscripts = useMemo(() => {
    return assignedManuscripts.filter((m) => {
      const userEmail = (currentUser?.email || '').toLowerCase().trim();
      const mySlot =
        m.reviewerOne?.email.toLowerCase() === userEmail
          ? m.reviewerOne
          : m.reviewerTwo?.email.toLowerCase() === userEmail
          ? m.reviewerTwo
          : m.reviewerThree?.email.toLowerCase() === userEmail
          ? m.reviewerThree
          : m.reviewerFour?.email.toLowerCase() === userEmail
          ? m.reviewerFour
          : m.reviewerOne;
      return Boolean(mySlot?.reviewDate || mySlot?.recommendation);
    });
  }, [assignedManuscripts, currentUser]);

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {statusFeedback && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-950 px-4 py-3 rounded-xl flex items-center justify-between text-xs font-bold shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{statusFeedback}</span>
          </div>
          <button onClick={() => setStatusFeedback(null)} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>
      )}

      {/* Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                بوابة التحكيم العلمي المزدوج (Double-Blind Peer Review Portal)
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-emerald-800 font-semibold">جامعة الأزهر</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-serif text-slate-900">
              أهلاً بك، {currentUser?.fullName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-3xl">
              تتيح لك هذه المنصة السرية استعراض المخطوطات والأبحاث المسندة إليك لتحكيمها، وتنزيل نسخة البحث، ورفع تقرير التقييم الفني، وتحميل شهادات التحكيم الرسمية المعتمدة فور إنجاز المراجعة.
            </p>
          </div>

          {completedManuscripts.length > 0 && (
            <div className="bg-amber-50/80 border border-amber-300 rounded-xl p-3 shrink-0 text-center">
              <div className="flex items-center justify-center gap-1.5 text-amber-900 font-extrabold text-xs">
                <Award className="w-4 h-4 text-amber-600" />
                <span>الشهادات المتاحة للتحميل:</span>
              </div>
              <div className="text-xl font-black text-amber-950 font-mono mt-0.5">
                {completedManuscripts.length}
              </div>
              <span className="text-3xs text-amber-800">شهادة معتمدة مع كود QR</span>
            </div>
          )}
        </div>
      </div>

      {/* Dedicated Reviewer Certificates Quick Hub */}
      {completedManuscripts.length > 0 && (
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-950 to-emerald-900 text-white rounded-2xl p-5 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-800/80">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-400/20 text-amber-300 rounded-xl border border-amber-300/30">
                <Award className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                  <span>شهادات التحكيم الرسمية المعتمدة الخاصة بك (Official Certificates)</span>
                  <span className="px-2 py-0.5 bg-amber-400 text-slate-950 text-3xs font-black rounded-md">
                    متاحة للتحميل الفوري
                  </span>
                </h3>
                <p className="text-3xs text-emerald-200">
                  شهادات رسمية معتمدة من عميد الكلية ورئيس التحرير ومزودة برمز تحقق رقمي QR
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
            {completedManuscripts.map((cm) => (
              <div
                key={cm.id}
                className="bg-white/10 hover:bg-white/15 border border-emerald-700/60 rounded-xl p-3.5 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-3xs text-amber-300 font-mono mb-1">
                    <span>{cm.id}</span>
                    <span className="bg-emerald-800/80 px-1.5 py-0.5 rounded text-white">معتمد</span>
                  </div>
                  <h4 className="text-xs font-bold text-white line-clamp-2 mb-2 leading-snug">
                    {cm.articleTitle}
                  </h4>
                </div>

                <div className="pt-2 border-t border-emerald-800/60 flex items-center justify-between">
                  <span className="text-3xs text-emerald-300 font-mono">AASJ-CERT-2026</span>
                  <button
                    type="button"
                    onClick={() => setShowCertificateFor(cm)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-3xs rounded-lg transition-colors cursor-pointer shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>تحميل الشهادة (PDF)</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Manuscripts List */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
          المخطوطات والأبحاث المكلف بتحكيمها ({assignedManuscripts.length})
        </h2>

        {assignedManuscripts.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {assignedManuscripts.map((m) => {
              const statusInfo = STATUS_TRANSLATIONS[m.status] || {
                ar: m.status,
                badgeClass: 'text-slate-700 bg-slate-100',
              };

              // Identify this reviewer's assignment
              const userEmail = (currentUser?.email || '').toLowerCase().trim();
              const mySlot =
                m.reviewerOne?.email.toLowerCase() === userEmail
                  ? m.reviewerOne
                  : m.reviewerTwo?.email.toLowerCase() === userEmail
                  ? m.reviewerTwo
                  : m.reviewerOne;

              const isCompleted = Boolean(mySlot?.reviewDate);

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
                        <span>تاريخ التكليف: {mySlot?.assignDate || m.receiveDate}</span>
                        <span>·</span>
                        <span className="text-rose-700 font-bold">موعد الاستحقاق: {mySlot?.reviewDueDate || '—'}</span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 leading-snug">
                        {m.articleTitle}
                      </h3>

                      <p className="text-xs text-slate-500 line-clamp-2">
                        الكلمات المفتاحية: {m.keywords}
                      </p>
                    </div>

                    <div className="shrink-0 text-left rtl:text-right flex flex-col items-end gap-1.5">
                      <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-md ${statusInfo.badgeClass}`}>
                        {statusInfo.ar}
                      </span>
                      <ReviewDeadlineBadge assignment={mySlot} />
                    </div>
                  </div>

                  {/* Actions & File Link */}
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      {m.submittedFileUrl ? (
                        <a
                          href={m.submittedFileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1.5 transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>تحميل المخطوطة للتحكيم (PDF)</span>
                        </a>
                      ) : (
                        <span className="text-slate-400">ملف البحث غير متاح للتحميل</span>
                      )}

                      <button
                        onClick={() => onSelectManuscript(m)}
                        className="text-slate-600 hover:text-slate-900 font-semibold underline"
                      >
                        معاينة تفاصيل البحث
                      </button>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {isCompleted && (
                        <button
                          type="button"
                          onClick={() => setShowCertificateFor(m)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-xs"
                          title="تحميل شهادة التحكيم الرسمية المعتمدة"
                        >
                          <Award className="w-4 h-4" />
                          <span>شهادة التحكيم المعتمدة</span>
                        </button>
                      )}

                      {isCompleted ? (
                        <div className="flex items-center gap-1.5 text-emerald-700 font-bold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>تم تسليم التقرير ({mySlot?.reviewDate})</span>
                          <button
                            onClick={() => handleOpenReviewForm(m)}
                            className="mr-2 text-xs text-blue-700 hover:underline font-normal"
                          >
                            تعديل التقرير
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleOpenReviewForm(m)}
                          className="px-4 py-2 font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>تعبئة تقرير وتوصية التحكيم</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400 text-xs space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <p className="font-semibold text-slate-700 text-sm">لا توجد أبحاث جديدة قيد التحكيم مسندة إلى حسابك حالياً</p>
            <p>سيصلك إشعار بالبريد الإلكتروني فور إسناد أي بحث جديد إليك من قبل هيئة التحرير.</p>
          </div>
        )}
      </div>

      {/* Review Evaluation Form Modal */}
      {selectedManuscriptForReview && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-slate-900/70 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-1 sm:my-auto flex flex-col max-h-[96dvh] sm:max-h-[94vh]">
            <div className="px-4 sm:px-6 py-3.5 bg-emerald-950 text-white flex items-center justify-between shrink-0 sticky top-0 z-20">
              <div>
                <h3 className="font-bold text-sm">استمارة تقرير التحكيم العلمي السري</h3>
                <p className="text-xs text-emerald-200">بحث رقم: {selectedManuscriptForReview.id}</p>
              </div>
              <button
                onClick={() => setSelectedManuscriptForReview(null)}
                className="p-1 text-emerald-200 hover:text-white rounded-lg hover:bg-emerald-900 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveReview} className="p-4 sm:p-6 space-y-4 text-xs overflow-y-auto flex-1">
              <div>
                <span className="font-semibold text-slate-500 block mb-1">عنوان المخطوطة:</span>
                <p className="font-bold text-slate-900 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-sm">
                  {selectedManuscriptForReview.articleTitle}
                </p>
              </div>

              {/* Recommendation Choice */}
              <div>
                <label className="font-bold text-slate-800 block mb-1.5">
                  التوصية العلمية النهائية لرئيس التحرير (Recommendation):
                </label>
                <select
                  value={recommendation}
                  onChange={(e) => setRecommendation(e.target.value as ReviewerRecommendation)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg bg-white font-bold text-emerald-950"
                >
                  <option value="Accept Manuscript">Accept Manuscript (قبول البحث للنشر كما هو دون تعديل)</option>
                  <option value="Manuscript Needs Revision (Acceptance with Minor Revision)">
                    Acceptance with Minor Revision (قبول مشروط بإجراء تعديلات طفيفة)
                  </option>
                  <option value="Manuscript Needs Revision (Minor Revision)">
                    Manuscript Needs Revision (Minor Revision - تعديلات طفيفة مطلوبة)
                  </option>
                  <option value="Manuscript Needs Revision (Major Revision)">
                    Manuscript Needs Revision (Major Revision - تعديلات جوهرية وإعادة تقديم)
                  </option>
                  <option value="Reject Manuscript">Reject Manuscript (رفض البحث لعدم استيفاء المعايير العلمية)</option>
                </select>
              </div>

              {/* Comments for Editor */}
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  تقرير وملاحظات التحكيم (موجهة لهيئة ورئيس التحرير وللباحث):
                </label>
                <textarea
                  rows={5}
                  value={editorComment}
                  onChange={(e) => setEditorComment(e.target.value)}
                  required
                  placeholder="بيان نقاط القوة والضعف، أصالة الموضوع، المنهجية الإحصائية، دقة النتائج والمراجع، والتعديلات المطلوبة من الباحث..."
                  className="w-full p-3 border border-slate-300 rounded-lg text-slate-800 leading-relaxed"
                />
              </div>

              {/* Review Report File URL */}
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  رابط ملف الملاحظات التفصيلي على المخطوطة (إن وجد):
                </label>
                <input
                  type="url"
                  value={reviewFileUrl}
                  onChange={(e) => setReviewFileUrl(e.target.value)}
                  placeholder="https://aasj.journals.ekb.eg/... أو رابط السحابة"
                  className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedManuscriptForReview(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-lg shadow-xs flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>اعتماد وإرسال التقرير</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Appreciation Certificate Modal for Reviewer */}
      {showCertificateFor && (
        <ReviewerCertificateModal
          reviewer={{
            id: currentUser?.id || 'REV-USER',
            name: currentUser?.fullName || 'سعادة الأستاذ الدكتور المحكم',
            email: currentUser?.email || 'reviewer@azhar.edu.eg',
            affiliation: currentUser?.affiliation || 'كلية الزراعة، جامعة الأزهر',
            specialization: showCertificateFor.subjectsRelated[0] || 'العلوم الزراعية',
            major: showCertificateFor.subjectsRelated[0] || 'Plant Production',
            reviewingInterests: 'العلوم الزراعية والأبحاث التخصصية',
            mobile: '01000000000',
            daysSinceLastReview: 0,
            reviewsCompleted: 5,
            reviewRequestsDeclined: 0,
            averageDaysToComplete: 14,
            paymentMethod: 'Bank Transfer',
            paymentDetails: 'سجل كلية الزراعة الرسمي',
            rating: 5,
            isActive: true,
          }}
          manuscript={showCertificateFor}
          onClose={() => setShowCertificateFor(null)}
        />
      )}
    </div>
  );
};
