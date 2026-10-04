import React, { useState } from 'react';
import {
  X,
  FileText,
  Printer,
  Edit,
  Trash2,
  ExternalLink,
  Users,
  CheckCircle,
  Clock,
  Calendar,
  BookOpen,
  Sparkles,
  Award,
  Mail,
  UserCheck,
} from 'lucide-react';
import { useJournal } from '../context/JournalContext';
import { DISCIPLINE_TRANSLATIONS, STATUS_TRANSLATIONS } from '../translations';
import { Manuscript, ManuscriptStatus, ReviewerAssignment } from '../types/journal';
import { SmartReviewerMatchModal } from './SmartReviewerMatchModal';
import { AcademicProofreadingModal } from './AcademicProofreadingModal';
import { EmailTemplatesHubModal } from './EmailTemplatesHubModal';
import { ReviewerCertificateModal } from './ReviewerCertificateModal';
import { ReviewDeadlineBadge } from './ReviewDeadlineBadge';

export const ManuscriptDetailModal: React.FC<{
  manuscript: Manuscript;
  onClose: () => void;
  onEdit: (m: Manuscript) => void;
  onPrintLetter: (m: Manuscript) => void;
}> = ({ manuscript, onClose, onEdit, onPrintLetter }) => {
  const { language, updateManuscriptStatus, deleteManuscript, assignReviewerToManuscript, updateManuscript } = useJournal();
  const [activeTab, setActiveTab] = useState<'info' | 'authors' | 'reviewers' | 'workflow'>('info');
  const [selectedStatus, setSelectedStatus] = useState<ManuscriptStatus>(manuscript.status);
  const [editorialComment, setEditorialComment] = useState<string>(manuscript.comment || '');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // New Feature Modals
  const [showSmartMatch, setShowSmartMatch] = useState(false);
  const [showProofreader, setShowProofreader] = useState(false);
  const [showEmailHub, setShowEmailHub] = useState(false);
  const [selectedReviewerCert, setSelectedReviewerCert] = useState<any | null>(null);

  const statusInfo = STATUS_TRANSLATIONS[manuscript.status] || {
    ar: manuscript.status,
    en: manuscript.status,
    badgeClass: 'text-slate-700 bg-slate-100',
  };

  const handleStatusSave = () => {
    updateManuscriptStatus(manuscript.id, selectedStatus, editorialComment);
    setIsUpdatingStatus(false);
  };

  const handleDelete = () => {
    if (
      window.confirm(
        language === 'ar'
          ? `هل أنت متأكد من حذف المخطوطة ${manuscript.id} نهائياً؟`
          : `Permanently delete manuscript ${manuscript.id}?`
      )
    ) {
      deleteManuscript(manuscript.id);
      onClose();
    }
  };

  const reviewersList: { key: string; label: string; data?: ReviewerAssignment }[] = [
    { key: 'one', label: language === 'ar' ? 'المحكم الأول' : 'Reviewer One', data: manuscript.reviewerOne },
    { key: 'two', label: language === 'ar' ? 'المحكم الثاني' : 'Reviewer Two', data: manuscript.reviewerTwo },
    { key: 'three', label: language === 'ar' ? 'المحكم الثالث' : 'Reviewer Three', data: manuscript.reviewerThree },
    { key: 'four', label: language === 'ar' ? 'المحكم الرابع' : 'Reviewer Four', data: manuscript.reviewerFour },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-slate-900/70 backdrop-blur-xs p-1.5 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden my-1 sm:my-auto flex flex-col max-h-[96dvh] sm:max-h-[96vh]">
        
        {/* Header - Sticky & shrink-0 so it is ALWAYS prominently visible at top of mobile & desktop */}
        <div className="bg-slate-900 text-white border-b border-slate-800 shrink-0 sticky top-0 z-20 shadow-md">
          {/* Top Row: Meta info & Close Button */}
          <div className="px-3 sm:px-6 pt-2.5 pb-1.5 flex items-center justify-between gap-2 border-b border-slate-800/60">
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-mono text-slate-400 flex-wrap min-w-0">
              <span className="font-bold text-white text-xs sm:text-sm bg-emerald-900/80 text-emerald-300 px-2 py-0.5 rounded border border-emerald-700/60 shrink-0">
                {manuscript.id}
              </span>
              <span className="text-slate-500">·</span>
              <span className="text-slate-300 font-sans text-[11px] sm:text-xs truncate">{manuscript.documentType}</span>
              <span className="text-slate-500">·</span>
              <span className="text-slate-400 text-[11px] sm:text-xs shrink-0">Vol. {manuscript.volume}, Iss. {manuscript.issue} ({manuscript.publishedYear})</span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 active:bg-slate-700 rounded-lg transition-colors cursor-pointer shrink-0 bg-slate-800/60 border border-slate-700/50"
              aria-label="Close"
              title={language === 'ar' ? 'إغلاق' : 'Close'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Title Row */}
          <div className="px-3 sm:px-6 py-2 bg-slate-900/90">
            <h2 className="text-xs sm:text-base font-bold text-white leading-snug line-clamp-2">
              {manuscript.articleTitle}
            </h2>
          </div>

          {/* Action Toolbar - ALL BUTTONS ALWAYS 100% VISIBLE AND TOUCH-FRIENDLY */}
          <div className="px-3 sm:px-6 py-2 bg-slate-950 border-t border-slate-800 flex items-center gap-1.5 sm:gap-2 flex-wrap">
            {/* 1. Official Acceptance Letter - High Priority Highlighted Button */}
            <button
              onClick={() => onPrintLetter(manuscript)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-lg shadow-sm transition-all cursor-pointer shrink-0 ring-1 ring-emerald-400/50"
              title={language === 'ar' ? 'فتح وطباعة خطاب القبول الرسمي للنشر' : 'Official Acceptance Letter'}
            >
              <Printer className="w-4 h-4 text-emerald-100" />
              <span>{language === 'ar' ? 'خطاب القبول' : 'Acceptance Letter'}</span>
            </button>

            {/* 2. AI Proofreading */}
            <button
              onClick={() => setShowProofreader(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-slate-950 rounded-lg transition-colors cursor-pointer shadow-xs shrink-0"
              title="المساعد الأكاديمي والتدقيق وصياغة المستخلص"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'تدقيق AI' : 'AI Edit'}</span>
            </button>

            {/* 3. Academic Emails Hub */}
            <button
              onClick={() => setShowEmailHub(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-100 rounded-lg transition-colors cursor-pointer border border-slate-700 shadow-xs shrink-0"
              title="مركز قوالب المراسلات الأكاديمية"
            >
              <Mail className="w-3.5 h-3.5 text-amber-400" />
              <span>{language === 'ar' ? 'المراسلات' : 'Emails'}</span>
            </button>

            {/* 4. Edit Manuscript */}
            <button
              onClick={() => {
                onEdit(manuscript);
                onClose();
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 active:bg-slate-600 border border-slate-700 rounded-lg transition-colors shrink-0 cursor-pointer"
              title="تعديل بيانات المخطوطة"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'تعديل' : 'Edit'}</span>
            </button>

            {/* 5. Delete Manuscript */}
            <button
              onClick={handleDelete}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-rose-300 hover:text-rose-100 bg-rose-950/40 hover:bg-rose-900/60 active:bg-rose-900 border border-rose-800/40 rounded-lg transition-colors shrink-0 cursor-pointer ml-auto rtl:mr-auto rtl:ml-0"
              title="حذف المخطوطة"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'حذف' : 'Delete'}</span>
            </button>
          </div>
        </div>

        {/* Status Bar */}
        <div className="px-3 sm:px-6 py-2 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">{language === 'ar' ? 'الحالة الحالية:' : 'Current Status:'}</span>
            <span className={`px-2.5 py-1 rounded-md font-semibold ${statusInfo.badgeClass}`}>
              {language === 'ar' ? statusInfo.ar : statusInfo.en}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!isUpdatingStatus ? (
              <button
                onClick={() => setIsUpdatingStatus(true)}
                className="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md transition-colors"
              >
                {language === 'ar' ? 'تغيير الحالة الإدارية ▾' : 'Change Status ▾'}
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as ManuscriptStatus)}
                  className="text-xs py-1 px-2 border border-slate-300 rounded-md bg-white text-slate-800 max-w-xs truncate"
                >
                  {Object.keys(STATUS_TRANSLATIONS).map((st) => (
                    <option key={st} value={st}>
                      {language === 'ar' ? STATUS_TRANSLATIONS[st as ManuscriptStatus].ar : st}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleStatusSave}
                  className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold"
                >
                  {language === 'ar' ? 'تطبيق' : 'Apply'}
                </button>
                <button
                  onClick={() => setIsUpdatingStatus(false)}
                  className="px-2 py-1 bg-slate-200 text-slate-700 rounded-md text-xs"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-3 sm:px-6 border-b border-slate-200 bg-white overflow-x-auto no-scrollbar shrink-0">
          <div className="flex space-x-4 sm:space-x-6 rtl:space-x-reverse text-xs font-semibold whitespace-nowrap min-w-max">
            <button
              onClick={() => setActiveTab('info')}
              className={`py-2.5 sm:py-3 border-b-2 transition-colors shrink-0 ${
                activeTab === 'info'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              {language === 'ar' ? 'بيانات المخطوطة والمصنفات' : 'Manuscript Details'}
            </button>
            <button
              onClick={() => setActiveTab('authors')}
              className={`py-2.5 sm:py-3 border-b-2 transition-colors shrink-0 ${
                activeTab === 'authors'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              {language === 'ar' ? 'فريق المؤلفين والباحث المراسل' : 'Authors & Affiliations'}
            </button>
            <button
              onClick={() => setActiveTab('reviewers')}
              className={`py-2.5 sm:py-3 border-b-2 transition-colors shrink-0 ${
                activeTab === 'reviewers'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              {language === 'ar' ? 'تقارير المحكمين (4 محكمين)' : 'Peer Reviewers (1-4)'}
            </button>
            <button
              onClick={() => setActiveTab('workflow')}
              className={`py-2.5 sm:py-3 border-b-2 transition-colors shrink-0 ${
                activeTab === 'workflow'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              {language === 'ar' ? 'الملفات وسجل التواريخ' : 'Files & Timeline'}
            </button>
          </div>
        </div>

        {/* Tab Body */}
        <div className="p-3.5 sm:p-6 flex-1 overflow-y-auto text-xs space-y-6">
          
          {/* Tab 1: Info */}
          {activeTab === 'info' && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-500 font-medium">
                    {language === 'ar' ? 'عنوان البحث الكامل:' : 'Full Article Title:'}
                  </span>
                  <button
                    onClick={() => setShowProofreader(true)}
                    className="flex items-center gap-1 text-3xs font-extrabold text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-lg cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>{language === 'ar' ? 'تدقيق وصياغة المستخلص بالذكاء الاصطناعي' : 'Polish Abstract'}</span>
                  </button>
                </div>
                <p className="text-sm font-semibold text-slate-900 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  {manuscript.articleTitle}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-500 font-medium">{language === 'ar' ? 'التخصصات العلمية:' : 'Disciplines:'}</span>
                  <div className="mt-1 space-y-1">
                    {manuscript.subjectsRelated.map((sub) => (
                      <span key={sub} className="block text-slate-800 font-semibold">
                        • {language === 'ar' ? DISCIPLINE_TRANSLATIONS[sub]?.ar || sub : sub}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 font-medium">{language === 'ar' ? 'مجال الدراسة الدقيق:' : 'Specific Field of Study:'}</span>
                  <p className="mt-1 text-slate-800 font-semibold">{manuscript.specificFieldOfStudy || '—'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-500">{language === 'ar' ? 'المجلد / العدد:' : 'Vol / Issue:'}</span>
                  <p className="font-bold text-slate-900 font-mono">Vol {manuscript.volume}, Iss {manuscript.issue}</p>
                </div>
                <div>
                  <span className="text-slate-500">{language === 'ar' ? 'الصفحات:' : 'Pages:'}</span>
                  <p className="font-bold text-slate-900 font-mono">
                    {manuscript.pagesFrom && manuscript.pagesTo ? `${manuscript.pagesFrom} - ${manuscript.pagesTo}` : 'In press'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500">{language === 'ar' ? 'سنة النشر:' : 'Year:'}</span>
                  <p className="font-bold text-slate-900 font-mono">{manuscript.publishedYear}</p>
                </div>
                <div>
                  <span className="text-slate-500">DOI:</span>
                  <p className="font-bold text-slate-900 font-mono truncate">{manuscript.doi || 'Pending'}</p>
                </div>
              </div>

              <div>
                <span className="text-slate-500 font-medium">{language === 'ar' ? 'الكلمات المفتاحية:' : 'Keywords:'}</span>
                <p className="text-slate-800 mt-1">{manuscript.keywords}</p>
              </div>

              {manuscript.comment && (
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg">
                  <span className="text-amber-800 font-semibold block mb-0.5">
                    {language === 'ar' ? 'ملاحظات هيئة التحرير الداخلية:' : 'Editorial Board Internal Notes:'}
                  </span>
                  <p className="text-slate-700">{manuscript.comment}</p>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Authors */}
          {activeTab === 'authors' && (
            <div className="space-y-6">
              {/* Corresponding Author Card */}
              <div className="border border-blue-200 bg-blue-50/30 p-4 rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-blue-200 pb-2">
                  <span className="font-bold text-blue-900 text-xs uppercase tracking-wide">
                    {language === 'ar' ? 'بيانات المؤلف المراسل (Corresponding Author)' : 'Corresponding Author Dossier'}
                  </span>
                  <span className="text-[11px] font-mono text-blue-700 font-semibold">
                    {manuscript.correspondAuthorORCID ? `ORCID: ${manuscript.correspondAuthorORCID}` : ''}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-500">{language === 'ar' ? 'الاسم الكامل:' : 'Full Name:'}</span>
                    <p className="font-bold text-slate-900 text-sm">
                      {manuscript.correspondAuthorTitle} {manuscript.correspondAuthorFirstName}{' '}
                      {manuscript.correspondAuthorMiddle ? manuscript.correspondAuthorMiddle + ' ' : ''}
                      {manuscript.correspondAuthorLastName}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500">{language === 'ar' ? 'الدرجة والرتبة العلمية:' : 'Degree & Academic Rank:'}</span>
                    <p className="font-semibold text-slate-800">
                      {manuscript.correspondAuthorDegree} · {manuscript.correspondAuthorPosition}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500">{language === 'ar' ? 'البريد الإلكتروني:' : 'Email Address:'}</span>
                    <p className="font-mono text-blue-600 font-semibold">{manuscript.correspondAuthorEmail}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">{language === 'ar' ? 'رقم الهاتف / الجوال:' : 'Mobile / Phone:'}</span>
                    <p className="font-mono text-slate-800">{manuscript.correspondAuthorMobile || manuscript.correspondAuthorPhone || '—'}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-slate-500">{language === 'ar' ? 'الجهة الأكاديمية والانتساب:' : 'Institutional Affiliation:'}</span>
                    <p className="font-semibold text-slate-900">{manuscript.correspondAuthorAffiliation}</p>
                  </div>
                </div>
              </div>

              {/* Co-Authors List */}
              <div className="border border-slate-200 p-4 rounded-xl space-y-3">
                <span className="font-bold text-slate-900 text-xs uppercase tracking-wide block border-b border-slate-200 pb-2">
                  {language === 'ar' ? 'كافة الباحثين والمشاركين' : 'All Contributing Authors'}
                </span>
                
                <div className="space-y-2">
                  <div>
                    <span className="text-slate-500 font-semibold">{language === 'ar' ? 'الباحث الأول:' : 'First Author:'}</span>
                    <p className="text-slate-900 font-bold">{manuscript.firstAuthorFullName || '—'}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold">{language === 'ar' ? 'أسماء جميع الباحثين:' : 'All Authors Names:'}</span>
                    <p className="text-slate-800">{manuscript.authorsNames || '—'}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold">{language === 'ar' ? 'عناوين البريد الإلكتروني:' : 'Authors Emails:'}</span>
                    <p className="text-slate-600 font-mono text-[11px]">{manuscript.authorsEmails || '—'}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold">{language === 'ar' ? 'الجهات التابع لها الباحثون:' : 'Authors Affiliations:'}</span>
                    <p className="text-slate-800">{manuscript.authorsAffiliations || '—'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Reviewers */}
          {activeTab === 'reviewers' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-emerald-50/80 p-3 rounded-2xl border border-emerald-200">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-800 text-amber-300 rounded-lg">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-extrabold text-emerald-950 block">
                      {language === 'ar' ? 'المطابقة الذكية للمحكمين (AI Smart Match)' : 'Smart AI Reviewer Matching'}
                    </span>
                    <span className="text-3xs text-emerald-700">
                      {language === 'ar'
                        ? 'ترشيح أفضل 3 محكمين مؤهلين بناءً على التخصص وسرعة المراجعة'
                        : 'Recommends top 3 specialized reviewers'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowSmartMatch(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-amber-300 font-extrabold text-xs rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>{language === 'ar' ? 'ترشيح المحكمين الأنسب' : 'Match Reviewers'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reviewersList.map(({ key, label, data }) => (
                  <div
                    key={key}
                    className={`p-4 rounded-xl border ${
                      data?.name ? 'bg-slate-50 border-slate-200' : 'bg-slate-50/40 border-dashed border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-2 flex-wrap gap-1">
                      <span className="font-bold text-slate-800 text-xs">{label}</span>
                      <div className="flex items-center gap-1">
                        <ReviewDeadlineBadge assignment={data} />
                        {data?.recommendation && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                            {data.recommendation}
                          </span>
                        )}
                      </div>
                    </div>

                    {data?.name ? (
                      <div className="space-y-1.5">
                        <p className="font-bold text-slate-900">{data.name}</p>
                        <p className="text-slate-600 font-mono text-[11px]">{data.email}</p>
                        <p className="text-slate-500 text-[11px]">{data.affiliation}</p>
                        
                        <div className="pt-2 text-[11px] text-slate-500 border-t border-slate-200 space-y-0.5">
                          <div>{language === 'ar' ? 'تاريخ التعيين:' : 'Assigned:'} <span className="font-mono text-slate-800">{data.assignDate || data.assignedDate || '—'}</span></div>
                          <div>{language === 'ar' ? 'المهلة المحددة:' : 'Due Date:'} <span className="font-mono text-slate-800">{data.reviewDueDate || data.deadline || '—'}</span></div>
                          {data.reviewDate && (
                            <div>{language === 'ar' ? 'تاريخ اكتمال التحكيم:' : 'Reviewed On:'} <span className="font-mono text-emerald-700 font-bold">{data.reviewDate}</span></div>
                          )}
                        </div>

                        {data.comment && (
                          <div className="mt-2 p-2 bg-white rounded border border-slate-200 text-slate-700 text-[11px]">
                            <strong className="block text-slate-900 mb-0.5">{language === 'ar' ? 'ملاحظة لرئيس التحرير:' : 'Comment for Editor:'}</strong>
                            {data.comment}
                          </div>
                        )}

                        <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedReviewerCert({
                                id: `REV-${key}-${manuscript.id}`,
                                name: data.name,
                                email: data.email,
                                affiliation: data.affiliation || 'جامعة الأزهر',
                                specialization: manuscript.subjectsRelated[0] || 'العلوم الزراعية',
                              });
                            }}
                            className="flex items-center gap-1 text-3xs font-extrabold text-amber-800 hover:text-amber-950 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                          >
                            <Award className="w-3.5 h-3.5 text-amber-600" />
                            <span>{language === 'ar' ? 'إصدار شهادة تحكيم معتمدة' : 'Issue Certificate'}</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="py-6 text-center text-slate-400">
                        {language === 'ar' ? 'لم يتم تعيين محكم في هذه الخانة بعد' : 'Not assigned yet'}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 4: Workflow & Files */}
          {activeTab === 'workflow' && (
            <div className="space-y-6">
              {/* Submission Dates Timeline */}
              <div className="border border-slate-200 p-4 rounded-xl space-y-3">
                <span className="font-bold text-slate-900 uppercase tracking-wide block border-b border-slate-200 pb-2">
                  {language === 'ar' ? 'المحطات الزمنية للمخطوطة' : 'Milestone Dates'}
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-2 bg-slate-50 rounded border border-slate-200">
                    <span className="text-slate-500 block mb-1">{language === 'ar' ? 'تاريخ الاستلام' : 'Received'}</span>
                    <span className="font-mono font-bold text-slate-900">{manuscript.receiveDate || '—'}</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded border border-slate-200">
                    <span className="text-slate-500 block mb-1">{language === 'ar' ? 'تاريخ التعديل' : 'Revised'}</span>
                    <span className="font-mono font-bold text-slate-900">{manuscript.reviseDate || '—'}</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded border border-slate-200">
                    <span className="text-slate-500 block mb-1">{language === 'ar' ? 'تاريخ القبول' : 'Accepted'}</span>
                    <span className="font-mono font-bold text-emerald-700">{manuscript.acceptDate || '—'}</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded border border-slate-200">
                    <span className="text-slate-500 block mb-1">{language === 'ar' ? 'تاريخ النشر' : 'Published'}</span>
                    <span className="font-mono font-bold text-blue-700">{manuscript.publishDate || '—'}</span>
                  </div>
                </div>
              </div>

              {/* Uploaded Files */}
              <div className="border border-slate-200 p-4 rounded-xl space-y-3">
                <span className="font-bold text-slate-900 uppercase tracking-wide block border-b border-slate-200 pb-2">
                  {language === 'ar' ? 'ملفات ونسخ المخطوطة' : 'Manuscript Document Files'}
                </span>

                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-slate-500" />
                      <span className="font-semibold text-slate-800">{language === 'ar' ? 'المخطوطة الأصلية المقدمة (Submitted)' : 'Original Submitted Manuscript'}</span>
                    </div>
                    {manuscript.submittedFileUrl ? (
                      <a
                        href={manuscript.submittedFileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        <span>{language === 'ar' ? 'تحميل' : 'Download'}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <span className="text-slate-400">{language === 'ar' ? 'غير مرفق' : 'Not attached'}</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-amber-500" />
                      <span className="font-semibold text-slate-800">{language === 'ar' ? 'المخطوطة المعدلة من المؤلف (Revised)' : 'Author Revised Manuscript'}</span>
                    </div>
                    {manuscript.revisedFileUrl ? (
                      <a
                        href={manuscript.revisedFileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        <span>{language === 'ar' ? 'تحميل' : 'Download'}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <span className="text-slate-400">{language === 'ar' ? 'غير مرفق' : 'Not attached'}</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-purple-500" />
                      <span className="font-semibold text-slate-800">{language === 'ar' ? 'بروفة الإخراج الفني (Galley Proof)' : 'Layout Galley Proof'}</span>
                    </div>
                    {manuscript.layoutFileUrl ? (
                      <a
                        href={manuscript.layoutFileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        <span>{language === 'ar' ? 'تحميل' : 'Download'}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <span className="text-slate-400">{language === 'ar' ? 'غير مرفق' : 'Not attached'}</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-emerald-500" />
                      <span className="font-semibold text-slate-800">{language === 'ar' ? 'النسخة المنشورة النهائية (Published)' : 'Final Published Version (PDF)'}</span>
                    </div>
                    {manuscript.publishedFileUrl ? (
                      <a
                        href={manuscript.publishedFileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        <span>{language === 'ar' ? 'تحميل' : 'Download'}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <span className="text-slate-400">{language === 'ar' ? 'غير مرفق' : 'Not attached'}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-mono">
            {language === 'ar' ? 'تم التحديث في: ' : 'Updated: '} {manuscript.updatedAt ? new Date(manuscript.updatedAt).toLocaleString() : '—'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors"
          >
            {language === 'ar' ? 'إغلاق' : 'Close'}
          </button>
        </div>

      </div>

      {/* Feature Modals */}
      {showSmartMatch && (
        <SmartReviewerMatchModal
          manuscript={manuscript}
          onClose={() => setShowSmartMatch(false)}
          onAssignReviewer={(slot, assignment) => {
            assignReviewerToManuscript(manuscript.id, slot, assignment);
          }}
        />
      )}

      {showProofreader && (
        <AcademicProofreadingModal
          manuscript={manuscript}
          onClose={() => setShowProofreader(false)}
          onApplyText={(polishedText) => {
            updateManuscript(manuscript.id, {
              comment: (manuscript.comment ? manuscript.comment + '\n\n' : '') + '[مستخلص مدقق]:\n' + polishedText,
            });
          }}
        />
      )}

      {showEmailHub && (
        <EmailTemplatesHubModal
          manuscript={manuscript}
          onClose={() => setShowEmailHub(false)}
        />
      )}

      {selectedReviewerCert && (
        <ReviewerCertificateModal
          reviewer={selectedReviewerCert}
          manuscript={manuscript}
          onClose={() => setSelectedReviewerCert(null)}
        />
      )}
    </div>
  );
};
