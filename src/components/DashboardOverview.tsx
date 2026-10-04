import React, { useState } from 'react';
import {
  FileText,
  Clock,
  Coins,
  Archive,
  Users,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  Sparkles,
  Mail,
  BarChart3,
} from 'lucide-react';
import { useJournal } from '../context/JournalContext';
import { DISCIPLINE_TRANSLATIONS, STATUS_TRANSLATIONS } from '../translations';
import { Manuscript } from '../types/journal';
import { AnnualEditorialReportModal } from './AnnualEditorialReportModal';
import { EmailTemplatesHubModal } from './EmailTemplatesHubModal';
import { AcademicProofreadingModal } from './AcademicProofreadingModal';
import { ReviewerOverdueWidget } from './ReviewerOverdueWidget';
import { ReviewerNotificationsModal } from './ReviewerNotificationsModal';

export const DashboardOverview: React.FC<{
  onSelectManuscript: (m: Manuscript) => void;
  onOpenAddManuscript: () => void;
}> = ({ onSelectManuscript, onOpenAddManuscript }) => {
  const {
    language,
    setActiveModule,
    manuscripts,
    waitingList,
    donations,
    documents,
    reviewers,
    cashFlow,
  } = useJournal();

  const [showAnnualReport, setShowAnnualReport] = useState(false);
  const [showEmailHub, setShowEmailHub] = useState(false);
  const [showProofreader, setShowProofreader] = useState(false);
  const [showNotificationsHub, setShowNotificationsHub] = useState(false);

  // Metric Computations
  const totalSubmissions = manuscripts.length;
  
  const inReviewCount = manuscripts.filter((m) =>
    m.status.includes('Review') || m.status === 'Submitted Manuscript' || m.status === 'Similarity Check'
  ).length;

  const inRevisionCount = manuscripts.filter((m) =>
    m.status.includes('Revision') || m.status.includes('Resubmit')
  ).length;

  const acceptedCount = manuscripts.filter((m) =>
    m.status.includes('Accepted')
  ).length;

  const publishedCount = manuscripts.filter((m) =>
    m.status === 'Manuscript Published in Journal'
  ).length;

  const waitingCount = waitingList.length;
  const activeReviewersCount = reviewers.filter((r) => r.isActive).length;

  // Cash flow summary
  const totalInflow = cashFlow
    .filter((tx) => tx.transactionType === 'incoming')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalOutflow = cashFlow
    .filter((tx) => tx.transactionType === 'outgoing')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const netBalance = totalInflow - totalOutflow;

  // Unpaid accepted/published manuscripts
  const unpaidDonations = donations.filter((d) => d.donateReceived === 'No');

  // Urgent action items
  const overdueManuscripts = manuscripts.filter(
    (m) =>
      m.status === 'Reviewers Not Reviewed Manuscript in Review Due Date' ||
      m.status === 'Manuscript Requiring Additional Reviewers'
  );

  return (
    <div className="space-y-6">
      {/* Editorial Welcome & Context Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {language === 'ar' ? 'جامعة الأزهر - كلية الزراعة بأسيوط' : 'Al-Azhar University · Faculty of Agriculture (Assiut)'}
              </span>
              <span className="text-slate-400 font-mono">·</span>
              <span className="font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[11px] font-semibold">
                Print ISSN: 2535-1680 · Online ISSN: 2535-1699
              </span>
              <span className="text-slate-400 font-mono">·</span>
              <span className="text-slate-500 font-medium text-[11px]">
                {language === 'ar' ? 'دورية ثلاث مرات سنوياً' : 'Three Times Per Year'}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-serif">
              {language === 'ar'
                ? 'مجلة أرشيف العلوم الزراعية - Archives of Agriculture Sciences Journal'
                : 'Archives of Agriculture Sciences Journal (AASJ)'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-3xl">
              {language === 'ar'
                ? 'المنظومة التحريرية الشاملة لإدارة وتحكيم المخطوطات والتحكيم المزدوج، وقوائم الانتظار، وسداد رسوم النشر وأرشيف الوثائق عبر منصة بنك المعرفة المصري (EKB).'
                : 'Editorial control center managing double-blind peer review, queue scheduling, APC fees, and archiving under Egyptian Knowledge Bank (EKB).'}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button
              onClick={() => setActiveModule('editorial_reports')}
              className="px-3.5 py-2 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer ring-1 ring-emerald-500/50"
              title="وحدة التقارير البيانية والإحصائيات التحريرية الشاملة"
            >
              <BarChart3 className="w-3.5 h-3.5 text-emerald-200" />
              <span>{language === 'ar' ? 'التقارير البيانية والأداء' : 'Editorial Analytics'}</span>
            </button>

            <button
              onClick={() => setShowAnnualReport(true)}
              className="px-3 py-2 text-xs font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
              title="تقرير الأداء السنوي والإحصائي لهيئة التحرير والعميد"
            >
              <TrendingUp className="w-3.5 h-3.5 text-emerald-700" />
              <span>{language === 'ar' ? 'تقرير الأداء السنوي (KPIs)' : 'Annual Report'}</span>
            </button>

            <button
              onClick={() => setShowEmailHub(true)}
              className="px-3 py-2 text-xs font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
              title="مركز قوالب المراسلات الأكاديمية"
            >
              <Mail className="w-3.5 h-3.5 text-blue-600" />
              <span>{language === 'ar' ? 'قوالب المراسلات' : 'Email Hub'}</span>
            </button>

            <button
              onClick={() => setShowProofreader(true)}
              className="px-3 py-2 text-xs font-bold text-emerald-950 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
              title="المساعد الأكاديمي وصياغة المستخلصات (Groq AI)"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>{language === 'ar' ? 'تدقيق AI للملخصات' : 'AI Proofread'}</span>
            </button>

            <a
              href="https://aasj.journals.ekb.eg"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <span>{language === 'ar' ? 'موقع المجلة (EKB)' : 'EKB Portal'}</span>
              <span className="text-[10px] opacity-70">↗</span>
            </a>
            <button
              onClick={onOpenAddManuscript}
              className="px-3.5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              {language === 'ar' ? '+ إدراج بحث جديد' : '+ Add Manuscript'}
            </button>
          </div>
        </div>
      </div>

      {/* Reviewer Overdue Notifications Alert Widget */}
      <ReviewerOverdueWidget
        onOpenNotificationsHub={() => setShowNotificationsHub(true)}
      />

      {/* KPI Stat Grid with Tabular Numerals */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Submissions */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">
              {language === 'ar' ? 'إجمالي المخطوطات' : 'Total Submissions'}
            </span>
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {totalSubmissions}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
            <span>{publishedCount} {language === 'ar' ? 'منشورة' : 'published'}</span>
            <span aria-hidden="true">·</span>
            <span>{acceptedCount} {language === 'ar' ? 'مقبولة' : 'accepted'}</span>
          </div>
        </div>

        {/* Peer Review Active */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">
              {language === 'ar' ? 'قيد التحكيم والمراجعة' : 'In Peer Review'}
            </span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-blue-600 font-mono tabular-nums">
            {inReviewCount}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
            <span>{inRevisionCount} {language === 'ar' ? 'في مرحلة التعديل' : 'in revision'}</span>
            <span aria-hidden="true">·</span>
            <span>{activeReviewersCount} {language === 'ar' ? 'محكم نشط' : 'reviewers'}</span>
          </div>
        </div>

        {/* Waiting List Queue */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">
              {language === 'ar' ? 'قائمة الانتظار للأعداد' : 'Waiting Queue'}
            </span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600 font-mono tabular-nums">
            {waitingCount}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
            <span>{language === 'ar' ? 'مجدولة للإصدارات القادمة' : 'Scheduled for next issues'}</span>
          </div>
        </div>

        {/* Net Cash Flow */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">
              {language === 'ar' ? 'صافي الرصيد المالي' : 'Net Cash Balance'}
            </span>
            <Coins className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 font-mono tabular-nums">
            ${netBalance.toLocaleString()}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
            <span className="text-emerald-600">+${totalInflow}</span>
            <span aria-hidden="true">·</span>
            <span className="text-rose-600">-${totalOutflow}</span>
          </div>
        </div>
      </div>

      {/* Workflow Stage Visual Pipeline */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-700 mb-4">
          {language === 'ar' ? 'مراحل تدفق النشر العلمي' : 'Publication Workflow Pipeline'}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
          <div
            onClick={() => setActiveModule('manuscripts')}
            className="p-3 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 cursor-pointer transition-colors"
          >
            <div className="text-xs text-slate-500 mb-1">{language === 'ar' ? 'التقديم الأولي' : '1. Submission'}</div>
            <div className="text-lg font-bold text-slate-900 font-mono tabular-nums">
              {manuscripts.filter((m) => m.status === 'Submitted Manuscript').length}
            </div>
          </div>
          <div
            onClick={() => setActiveModule('manuscripts')}
            className="p-3 bg-indigo-50/50 hover:bg-indigo-50 rounded-lg border border-indigo-100 cursor-pointer transition-colors"
          >
            <div className="text-xs text-indigo-700 mb-1">{language === 'ar' ? 'فحص الاقتباس' : '2. Plagiarism'}</div>
            <div className="text-lg font-bold text-indigo-900 font-mono tabular-nums">
              {manuscripts.filter((m) => m.status === 'Similarity Check').length}
            </div>
          </div>
          <div
            onClick={() => setActiveModule('manuscripts')}
            className="p-3 bg-blue-50/50 hover:bg-blue-50 rounded-lg border border-blue-100 cursor-pointer transition-colors"
          >
            <div className="text-xs text-blue-700 mb-1">{language === 'ar' ? 'التحكيم العلمي' : '3. Peer Review'}</div>
            <div className="text-lg font-bold text-blue-900 font-mono tabular-nums">
              {manuscripts.filter((m) => m.status.includes('Review')).length}
            </div>
          </div>
          <div
            onClick={() => setActiveModule('manuscripts')}
            className="p-3 bg-amber-50/50 hover:bg-amber-50 rounded-lg border border-amber-100 cursor-pointer transition-colors"
          >
            <div className="text-xs text-amber-700 mb-1">{language === 'ar' ? 'تعديل الباحث' : '4. Revisions'}</div>
            <div className="text-lg font-bold text-amber-900 font-mono tabular-nums">
              {manuscripts.filter((m) => m.status.includes('Revision')).length}
            </div>
          </div>
          <div
            onClick={() => setActiveModule('manuscripts')}
            className="p-3 bg-purple-50/50 hover:bg-purple-50 rounded-lg border border-purple-100 cursor-pointer transition-colors"
          >
            <div className="text-xs text-purple-700 mb-1">{language === 'ar' ? 'القبول والتنضيد' : '5. Accepted & Proof'}</div>
            <div className="text-lg font-bold text-purple-900 font-mono tabular-nums">
              {manuscripts.filter((m) => m.status.includes('Accepted') || m.status.includes('Galley')).length}
            </div>
          </div>
          <div
            onClick={() => setActiveModule('manuscripts')}
            className="p-3 bg-emerald-50/50 hover:bg-emerald-50 rounded-lg border border-emerald-100 cursor-pointer transition-colors"
          >
            <div className="text-xs text-emerald-700 mb-1">{language === 'ar' ? 'النشر النهائي' : '6. Published'}</div>
            <div className="text-lg font-bold text-emerald-900 font-mono tabular-nums">
              {publishedCount}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Urgent Attention & Recent Submissions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 Cols): Recent Manuscripts Table */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">
              {language === 'ar' ? 'أحدث المخطوطات في السجل' : 'Recent Submissions'}
            </h2>
            <button
              onClick={() => setActiveModule('manuscripts')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
            >
              {language === 'ar' ? 'عرض الكل ←' : 'View All →'}
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {manuscripts.slice(0, 5).map((m) => {
              const statusInfo = STATUS_TRANSLATIONS[m.status] || {
                ar: m.status,
                en: m.status,
                badgeClass: 'text-slate-700 bg-slate-100',
              };
              const discipline = m.subjectsRelated[0] ? DISCIPLINE_TRANSLATIONS[m.subjectsRelated[0]] : null;

              return (
                <div
                  key={m.id}
                  onClick={() => onSelectManuscript(m)}
                  className="p-4 sm:px-6 hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1 min-w-0">
                      {/* Zero-Pill Metadata */}
                      <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                        <span className="font-bold text-slate-900">{m.id}</span>
                        <span aria-hidden="true">·</span>
                        <span>Vol. {m.volume}, Iss. {m.issue}</span>
                        <span aria-hidden="true">·</span>
                        <span>{m.receiveDate}</span>
                      </div>

                      <h3 className="text-sm font-semibold text-slate-900 leading-snug truncate">
                        {m.articleTitle}
                      </h3>

                      <div className="text-xs text-slate-500 flex items-center gap-2">
                        <span>{m.firstAuthorFullName || m.correspondAuthorFirstName + ' ' + m.correspondAuthorLastName}</span>
                        {discipline && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="truncate max-w-xs">{language === 'ar' ? discipline.ar : discipline.en}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <span className={`inline-block px-2.5 py-1 text-xs font-medium rounded-md ${statusInfo.badgeClass}`}>
                        {language === 'ar' ? statusInfo.ar : statusInfo.en}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (1 Col): Urgent Alerts & Module Fast Access */}
        <div className="space-y-6">
          
          {/* Urgent Attention Box */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>{language === 'ar' ? 'تنبيهات عاجلة لهيئة التحرير' : 'Editorial Action Items'}</span>
              </h3>
              <span className="text-xs font-mono bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-semibold">
                {overdueManuscripts.length + unpaidDonations.length}
              </span>
            </div>

            <div className="space-y-3">
              {overdueManuscripts.map((m) => (
                <div
                  key={m.id}
                  onClick={() => onSelectManuscript(m)}
                  className="p-3 bg-rose-50/60 hover:bg-rose-50 border border-rose-200 rounded-lg cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between text-xs text-rose-800 font-semibold mb-1">
                    <span>{m.id}</span>
                    <span>{language === 'ar' ? 'تأخر التحكيم' : 'Review Overdue'}</span>
                  </div>
                  <div className="text-xs text-slate-700 font-medium line-clamp-1">
                    {m.articleTitle}
                  </div>
                </div>
              ))}

              {unpaidDonations.map((d) => (
                <div
                  key={d.id}
                  onClick={() => setActiveModule('donates')}
                  className="p-3 bg-amber-50/60 hover:bg-amber-50 border border-amber-200 rounded-lg cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between text-xs text-amber-800 font-semibold mb-1">
                    <span>{d.manuscriptId}</span>
                    <span>${d.donateAmount} {language === 'ar' ? 'قيد السداد' : 'Unpaid APC'}</span>
                  </div>
                  <div className="text-xs text-slate-700 font-medium line-clamp-1">
                    {d.manuscriptTitle}
                  </div>
                </div>
              ))}

              {overdueManuscripts.length === 0 && unpaidDonations.length === 0 && (
                <div className="text-center py-4 text-xs text-slate-500">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                  <span>{language === 'ar' ? 'لا توجد تنبيهات عاجلة حالياً' : 'No urgent alerts pending.'}</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Module Navigation Cards */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {language === 'ar' ? 'الأقسام الإدارية السريعة' : 'Management Modules'}
            </h3>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setActiveModule('reviewers')}
                className="p-3 text-left rtl:text-right bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
              >
                <div className="flex items-center justify-between text-slate-700 mb-1">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-bold font-mono">{reviewers.length}</span>
                </div>
                <div className="text-xs font-semibold text-slate-900">
                  {language === 'ar' ? 'سجل المحكمين' : 'Reviewers'}
                </div>
              </button>

              <button
                onClick={() => setActiveModule('waiting_list')}
                className="p-3 text-left rtl:text-right bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
              >
                <div className="flex items-center justify-between text-slate-700 mb-1">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-bold font-mono">{waitingList.length}</span>
                </div>
                <div className="text-xs font-semibold text-slate-900">
                  {language === 'ar' ? 'قائمة الانتظار' : 'Waiting List'}
                </div>
              </button>

              <button
                onClick={() => setActiveModule('donates')}
                className="p-3 text-left rtl:text-right bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
              >
                <div className="flex items-center justify-between text-slate-700 mb-1">
                  <Coins className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold font-mono">{donations.length}</span>
                </div>
                <div className="text-xs font-semibold text-slate-900">
                  {language === 'ar' ? 'رسوم النشر' : 'APC & Donates'}
                </div>
              </button>

              <button
                onClick={() => setActiveModule('files')}
                className="p-3 text-left rtl:text-right bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
              >
                <div className="flex items-center justify-between text-slate-700 mb-1">
                  <Archive className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-bold font-mono">{documents.length}</span>
                </div>
                <div className="text-xs font-semibold text-slate-900">
                  {language === 'ar' ? 'أرشيف الوثائق' : 'Documents'}
                </div>
              </button>
            </div>
          </div>

        </div>

      </div>
      {/* Feature Modals */}
      {showAnnualReport && (
        <AnnualEditorialReportModal onClose={() => setShowAnnualReport(false)} />
      )}

      {showEmailHub && (
        <EmailTemplatesHubModal onClose={() => setShowEmailHub(false)} />
      )}

      {showProofreader && (
        <AcademicProofreadingModal onClose={() => setShowProofreader(false)} />
      )}

      {/* Reviewer Overdue Notifications Hub Modal */}
      {showNotificationsHub && (
        <ReviewerNotificationsModal
          onClose={() => setShowNotificationsHub(false)}
          onSelectManuscript={(m) => {
            setShowNotificationsHub(false);
            onSelectManuscript(m);
          }}
        />
      )}
    </div>
  );
};
