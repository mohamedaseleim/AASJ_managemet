import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  X,
  UserCheck,
  Star,
  Clock,
  CheckCircle2,
  Building,
  Loader2,
  AlertCircle,
  HelpCircle,
  Award,
} from 'lucide-react';
import { Manuscript, ReviewerProfile, ReviewerAssignment } from '../types/journal';
import { useJournal } from '../context/JournalContext';
import { requestReviewerMatching, ReviewerMatchItem } from '../services/aiService';

interface SmartReviewerMatchModalProps {
  manuscript: Manuscript;
  onClose: () => void;
  onAssignReviewer: (
    slot: 'reviewerOne' | 'reviewerTwo' | 'reviewerThree' | 'reviewerFour',
    assignment: ReviewerAssignment
  ) => void;
}

export const SmartReviewerMatchModal: React.FC<SmartReviewerMatchModalProps> = ({
  manuscript,
  onClose,
  onAssignReviewer,
}) => {
  const { reviewers } = useJournal();
  const [isLoading, setIsLoading] = useState(true);
  const [matches, setMatches] = useState<ReviewerMatchItem[]>([]);
  const [editorialTip, setEditorialTip] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [assignedSlot, setAssignedSlot] = useState<string | null>(null);

  useEffect(() => {
    async function runMatch() {
      setIsLoading(true);
      setErrorMsg('');
      try {
        const response = await requestReviewerMatching({
          manuscriptTitle: manuscript.titleAr || manuscript.titleEn || manuscript.articleTitle,
          abstract: manuscript.abstractAr || manuscript.abstractEn || manuscript.articleTitle,
          sectionName: manuscript.section || manuscript.subjectsRelated?.[0] || 'العلوم الزراعية',
          reviewers,
        });

        if (response.success && response.matches) {
          setMatches(response.matches);
          if (response.editorialTip) {
            setEditorialTip(response.editorialTip);
          }
        } else {
          setErrorMsg(response.error || 'تعذر استرجاع ترشيحات المحكمين');
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'حدث خطأ أثناء الاتصال بالخادم الأكاديمي');
      } finally {
        setIsLoading(false);
      }
    }

    runMatch();
  }, [manuscript, reviewers]);

  const handleAssign = (
    reviewer: ReviewerProfile,
    slot: 'reviewerOne' | 'reviewerTwo' | 'reviewerThree' | 'reviewerFour'
  ) => {
    const today = new Date().toISOString().split('T')[0];
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 21); // 21 days deadline
    const deadlineStr = deadline.toISOString().split('T')[0];

    const assignment: ReviewerAssignment = {
      reviewerId: reviewer.id,
      name: reviewer.name,
      email: reviewer.email,
      assignedDate: today,
      status: 'pending',
      deadline: deadlineStr,
    };

    onAssignReviewer(slot, assignment);
    setAssignedSlot(`${reviewer.id}-${slot}`);
    setTimeout(() => setAssignedSlot(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/75 backdrop-blur-xs p-1.5 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-slate-200 my-1 sm:my-auto flex flex-col max-h-[96dvh] sm:max-h-[94vh]">
        {/* Header - Sticky & shrink-0 */}
        <div className="flex items-center justify-between p-3 sm:px-6 sm:py-3.5 bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 text-white gap-2 shrink-0 sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="p-1.5 sm:p-2 bg-amber-400 text-slate-950 rounded-xl shadow-xs shrink-0">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h3 className="font-extrabold text-xs sm:text-base truncate">المطابقة الذكية للمحكمين (Smart Reviewer Match)</h3>
                <span className="px-2 py-0.5 bg-emerald-800 text-amber-300 text-3xs font-extrabold rounded-full border border-emerald-700 shrink-0">
                  ذكاء اصطناعي
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-emerald-200 mt-0.5 truncate">
                ترشيح أفضل 3 محكمين مؤهلين بناءً على التخصص الدقيق
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white rounded-xl hover:bg-white/10 active:bg-white/20 transition-colors cursor-pointer shrink-0"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Manuscript Banner */}
        <div className="p-4 bg-amber-50/70 border-b border-amber-200/90 text-xs text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="font-bold text-emerald-900">البحث المراد تحكيمه: </span>
            <span className="font-bold">{manuscript.code}</span> —{' '}
            <span className="font-medium text-slate-800">{manuscript.titleAr || manuscript.titleEn}</span>
          </div>
          <span className="px-2.5 py-1 bg-amber-200/80 text-amber-900 text-3xs font-extrabold rounded-lg shrink-0">
            {manuscript.section}
          </span>
        </div>

        {/* Matches Body */}
        <div className="p-6 space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="w-10 h-10 text-emerald-700 animate-spin" />
              <p className="text-xs font-bold text-emerald-950">
                جاري تحليل مستخلص البحث ومطابقته مع تخصصات وسجلات المحكمين...
              </p>
              <p className="text-3xs text-slate-500">يتم الفحص عبر خوارزميات Groq AI والذكاء الاصطناعي الأكاديمي</p>
            </div>
          ) : errorMsg ? (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          ) : (
            <>
              {editorialTip && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-xl flex items-start gap-2">
                  <Award className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-2xs font-extrabold text-emerald-950">توصية تحريرية:</strong>
                    <span>{editorialTip}</span>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {matches.map((match, idx) => {
                  const reviewer = reviewers.find((r) => r.id === match.reviewerId);
                  if (!reviewer) return null;

                  return (
                    <div
                      key={reviewer.id}
                      className="p-4 bg-slate-50 hover:bg-white rounded-2xl border-2 border-slate-200 hover:border-emerald-600 transition-all shadow-xs"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        {/* Reviewer Details */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="w-6 h-6 rounded-full bg-emerald-800 text-amber-300 font-extrabold text-xs flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <h4 className="font-extrabold text-sm text-slate-900">{reviewer.name}</h4>
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 font-extrabold text-2xs rounded-full border border-emerald-300 flex items-center gap-1">
                              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                              <span>نسبة التطابق: {match.matchScore}%</span>
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-xs text-slate-600 font-medium">
                            <span className="flex items-center gap-1">
                              <Building className="w-3.5 h-3.5 text-slate-400" />
                              <span>{reviewer.affiliation}</span>
                            </span>
                            <span>•</span>
                            <span>القسم: {reviewer.specialization || reviewer.major}</span>
                            <span>•</span>
                            <span className="text-emerald-800 font-bold">التخصص: {reviewer.subSpecialty || 'زراعي عام'}</span>
                          </div>

                          <p className="text-xs text-slate-700 bg-white/80 p-2.5 rounded-xl border border-slate-200 mt-2 leading-relaxed">
                            <strong className="text-emerald-950">سبب الترشيح: </strong>
                            {match.reasonAr}
                          </p>
                        </div>

                        {/* Assign Buttons */}
                        <div className="shrink-0 flex flex-col sm:flex-row md:flex-col gap-1.5 min-w-[170px]">
                          <span className="text-3xs text-slate-500 font-bold text-center block mb-0.5">
                            تعيين فوري للبحث:
                          </span>
                          <button
                            onClick={() => handleAssign(reviewer, 'reviewerOne')}
                            className="w-full px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>كمحكم أول (1)</span>
                          </button>

                          <button
                            onClick={() => handleAssign(reviewer, 'reviewerTwo')}
                            className="w-full px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>كمحكم ثانٍ (2)</span>
                          </button>

                          {assignedSlot?.startsWith(reviewer.id) && (
                            <span className="text-3xs font-bold text-emerald-700 text-center flex items-center justify-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>تم تعيين المحكم بنجاح!</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-3xs text-slate-500">
            <span>* التعيين يمنح المحكم مهلة 21 يوماً للتحكيم تلقائياً وفقاً للائحة المجلة.</span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer text-xs"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
