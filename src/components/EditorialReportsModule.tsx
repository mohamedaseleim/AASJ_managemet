import React, { useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Inbox,
  Clock,
  Filter,
  Calendar,
  Layers,
  Download,
  Printer,
  ChevronRight,
  Eye,
  FileText,
  Percent,
  Timer,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { useJournal } from '../context/JournalContext';
import { JOURNAL_SECTIONS } from '../data/journalSections';
import { DISCIPLINE_TRANSLATIONS } from '../translations';
import { JournalDiscipline, Manuscript, ManuscriptStatus } from '../types/journal';

interface Props {
  onSelectManuscript?: (m: Manuscript) => void;
}

// Arabic and English month names
const MONTH_NAMES_AR = [
  'يناير',
  'فبراير',
  'مارس',
  'أبريل',
  'مايو',
  'يونيو',
  'يوليو',
  'أغسطس',
  'سبتمبر',
  'أكتوبر',
  'نوفمبر',
  'ديسمبر',
];

const MONTH_NAMES_EN = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

// Helper to determine if a status is accepted
const isAcceptedStatus = (status: ManuscriptStatus | string): boolean => {
  return (
    status === 'Manuscript Accepted (Preliminary Scientific)' ||
    status === 'Manuscript Accepted (Final)' ||
    status === 'Manuscript Published in Journal' ||
    status === 'accepted' ||
    status === 'published'
  );
};

// Helper to determine if a status is rejected
const isRejectedStatus = (status: ManuscriptStatus | string): boolean => {
  return (
    status.startsWith('Rejected') ||
    status === 'rejected' ||
    status === 'Deleted Manuscript' ||
    status === 'Withdrawn Manuscript'
  );
};

// Distinct colors for disciplines
const DISCIPLINE_COLORS = [
  '#059669', // emerald
  '#0284c7', // sky
  '#8b5cf6', // violet
  '#d97706', // amber
  '#e11d48', // rose
  '#0d9488', // teal
  '#475569', // slate
];

export const EditorialReportsModule: React.FC<Props> = ({ onSelectManuscript }) => {
  const { manuscripts, language } = useJournal();

  // Filters state
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('all');
  const [selectedDocType, setSelectedDocType] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'monthly' | 'disciplines' | 'breakdown' | 'turnaround'>('monthly');
  const [selectedDrilldownMonth, setSelectedDrilldownMonth] = useState<string | null>(null);

  // Available years extracted dynamically from manuscripts
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    manuscripts.forEach((m) => {
      const year = m.receiveDate ? m.receiveDate.substring(0, 4) : m.publishedYear?.toString();
      if (year) years.add(year);
    });
    // Ensure 2026 and 2025 exist
    years.add('2026');
    years.add('2025');
    return Array.from(years).sort((a, b) => b.localeCompare(a));
  }, [manuscripts]);

  // Filtered manuscripts based on selected year, discipline, and document type
  const filteredManuscripts = useMemo(() => {
    return manuscripts.filter((m) => {
      // Year filter
      if (selectedYear !== 'all') {
        const mYear = m.receiveDate ? m.receiveDate.substring(0, 4) : m.publishedYear?.toString();
        if (mYear !== selectedYear) return false;
      }

      // Discipline filter
      if (selectedDiscipline !== 'all') {
        if (!m.subjectsRelated || !m.subjectsRelated.includes(selectedDiscipline as JournalDiscipline)) {
          return false;
        }
      }

      // Document Type filter
      if (selectedDocType !== 'all') {
        if (m.documentType !== selectedDocType) return false;
      }

      return true;
    });
  }, [manuscripts, selectedYear, selectedDiscipline, selectedDocType]);

  // Monthly statistical breakdown data (12 months)
  const monthlyData = useMemo(() => {
    // 12 months initialized
    const months = Array.from({ length: 12 }, (_, i) => {
      const monthNum = i + 1;
      const monthKey = `${selectedYear === 'all' ? '2026' : selectedYear}-${monthNum.toString().padStart(2, '0')}`;
      return {
        monthIndex: i,
        monthNumber: monthNum,
        monthKey,
        nameAr: MONTH_NAMES_AR[i],
        nameEn: MONTH_NAMES_EN[i],
        label: language === 'ar' ? MONTH_NAMES_AR[i] : MONTH_NAMES_EN[i],
        received: 0,
        accepted: 0,
        rejected: 0,
        inProgress: 0,
        acceptanceRate: 0,
        rejectionRate: 0,
        avgDaysToDecision: 0,
        totalDays: 0,
        decidedCount: 0,
        manuscriptsList: [] as Manuscript[],
      };
    });

    // Populate data
    filteredManuscripts.forEach((m) => {
      if (!m.receiveDate) return;
      const [yearStr, monthStr] = m.receiveDate.split('-');
      if (!monthStr) return;

      const monthIndex = parseInt(monthStr, 10) - 1;
      if (monthIndex < 0 || monthIndex > 11) return;

      // In case selectedYear is 'all', match by month index
      const targetMonth = months[monthIndex];
      if (!targetMonth) return;

      targetMonth.received += 1;
      targetMonth.manuscriptsList.push(m);

      const accepted = isAcceptedStatus(m.status);
      const rejected = isRejectedStatus(m.status);

      if (accepted) {
        targetMonth.accepted += 1;
      } else if (rejected) {
        targetMonth.rejected += 1;
      } else {
        targetMonth.inProgress += 1;
      }

      // Calculate turnaround duration if decision date exists
      const decisionDateStr = m.acceptDate || (rejected ? m.updatedAt?.substring(0, 10) : null);
      if (decisionDateStr && m.receiveDate) {
        const start = new Date(m.receiveDate).getTime();
        const end = new Date(decisionDateStr).getTime();
        const diffDays = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
        if (!isNaN(diffDays) && diffDays < 365) {
          targetMonth.totalDays += diffDays;
          targetMonth.decidedCount += 1;
        }
      }
    });

    // Compute rates and averages
    return months.map((m) => {
      const decided = m.accepted + m.rejected;
      const rate = m.received > 0 ? Math.round((m.accepted / m.received) * 100) : 0;
      const rejRate = m.received > 0 ? Math.round((m.rejected / m.received) * 100) : 0;
      const avgDays = m.decidedCount > 0 ? Math.round(m.totalDays / m.decidedCount) : 0;

      return {
        ...m,
        acceptanceRate: rate,
        rejectionRate: rejRate,
        avgDaysToDecision: avgDays,
      };
    });
  }, [filteredManuscripts, selectedYear, language]);

  // Overall KPI metrics
  const kpis = useMemo(() => {
    const totalReceived = filteredManuscripts.length;
    let totalAccepted = 0;
    let totalRejected = 0;
    let totalInProgress = 0;
    let totalDecisionDays = 0;
    let decidedWithDatesCount = 0;

    filteredManuscripts.forEach((m) => {
      if (isAcceptedStatus(m.status)) {
        totalAccepted += 1;
      } else if (isRejectedStatus(m.status)) {
        totalRejected += 1;
      } else {
        totalInProgress += 1;
      }

      const decisionDateStr = m.acceptDate || (isRejectedStatus(m.status) ? m.updatedAt?.substring(0, 10) : null);
      if (decisionDateStr && m.receiveDate) {
        const start = new Date(m.receiveDate).getTime();
        const end = new Date(decisionDateStr).getTime();
        const diffDays = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
        if (!isNaN(diffDays) && diffDays < 365) {
          totalDecisionDays += diffDays;
          decidedWithDatesCount += 1;
        }
      }
    });

    const overallAcceptanceRate = totalReceived > 0 ? Math.round((totalAccepted / totalReceived) * 100) : 0;
    const overallRejectionRate = totalReceived > 0 ? Math.round((totalRejected / totalReceived) * 100) : 0;
    const avgTurnaroundDays = decidedWithDatesCount > 0 ? Math.round(totalDecisionDays / decidedWithDatesCount) : 34;

    return {
      totalReceived,
      totalAccepted,
      totalRejected,
      totalInProgress,
      overallAcceptanceRate,
      overallRejectionRate,
      avgTurnaroundDays,
    };
  }, [filteredManuscripts]);

  // Distribution by Journal Discipline (7 Sections)
  const disciplineData = useMemo(() => {
    return JOURNAL_SECTIONS.map((sec, idx) => {
      const sectionManuscripts = filteredManuscripts.filter((m) =>
        m.subjectsRelated && m.subjectsRelated.includes(sec.discipline)
      );

      const received = sectionManuscripts.length;
      const accepted = sectionManuscripts.filter((m) => isAcceptedStatus(m.status)).length;
      const rejected = sectionManuscripts.filter((m) => isRejectedStatus(m.status)).length;
      const inProgress = received - accepted - rejected;
      const rate = received > 0 ? Math.round((accepted / received) * 100) : 0;

      return {
        code: sec.departmentCode,
        name: language === 'ar' ? sec.arabicName : sec.englishName,
        discipline: sec.discipline,
        received,
        accepted,
        rejected,
        inProgress,
        acceptanceRate: rate,
        color: DISCIPLINE_COLORS[idx % DISCIPLINE_COLORS.length],
      };
    }).filter((item) => item.received > 0);
  }, [filteredManuscripts, language]);

  // Active manuscripts list for drilldown
  const drilldownManuscripts = useMemo(() => {
    if (selectedDrilldownMonth === null) return null;
    const target = monthlyData.find((m) => m.monthKey === selectedDrilldownMonth || m.nameEn === selectedDrilldownMonth || m.nameAr === selectedDrilldownMonth);
    return target ? target.manuscriptsList : null;
  }, [selectedDrilldownMonth, monthlyData]);

  // Print Report Handler
  const handlePrintReport = () => {
    window.print();
  };

  // Export to CSV Handler
  const handleExportCSV = () => {
    const headers = [
      'Month',
      'Received',
      'Accepted',
      'Rejected',
      'In Progress',
      'Acceptance Rate (%)',
      'Rejection Rate (%)',
      'Avg Turnaround Days',
    ];

    const rows = monthlyData.map((m) => [
      language === 'ar' ? m.nameAr : m.nameEn,
      m.received,
      m.accepted,
      m.rejected,
      m.inProgress,
      `${m.acceptanceRate}%`,
      `${m.rejectionRate}%`,
      m.avgDaysToDecision,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `AASJ_Editorial_Performance_Report_${selectedYear}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Editorial Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-sans">
              <span className="font-semibold text-emerald-800">
                {language === 'ar' ? 'مجلة أرشيف العلوم الزراعية (AASJ)' : 'Archives of Agriculture Sciences Journal'}
              </span>
              <span>·</span>
              <span>{language === 'ar' ? 'جامعة الأزهر' : 'Al-Azhar University'}</span>
              <span>·</span>
              <span>{language === 'ar' ? 'بنك المعرفة المصري EKB' : 'Egyptian Knowledge Bank'}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-serif text-slate-900 flex items-center gap-2.5">
              <span className="p-2 bg-emerald-800 text-white rounded-xl shadow-xs">
                <BarChart3 className="w-5 h-5" />
              </span>
              <span>{language === 'ar' ? 'التقارير البيانية وتقييم الأداء التحريري' : 'Editorial Performance & Manuscript Analytics'}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
              {language === 'ar'
                ? 'رصد ومتابعة حركة المخطوطات المستلمة والمقبولة والمرفوضة شهرياً لقياس معدلات الإنجاز وسرعة اتخاذ القرارات التحريرية وفق معايير قواعد البيانات العالمية.'
                : 'Monthly tracking of received, accepted, and rejected manuscripts to evaluate editorial throughput, turnaround times, and acceptance metrics.'}
            </p>
          </div>

          {/* Action Buttons: Print & Export */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-xl transition-colors cursor-pointer"
              title="تصدير جدول البيانات CSV"
            >
              <Download className="w-4 h-4 text-slate-600" />
              <span>{language === 'ar' ? 'تصدير CSV' : 'Export CSV'}</span>
            </button>
            <button
              onClick={handlePrintReport}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-700 active:bg-emerald-900 rounded-xl shadow-xs transition-colors cursor-pointer"
              title="طباعة التقرير التحريري الرسمي"
            >
              <Printer className="w-4 h-4 text-emerald-200" />
              <span>{language === 'ar' ? 'طباعة التقرير' : 'Print Report'}</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
          {/* Year Filter */}
          <div>
            <label className="block text-slate-500 font-semibold mb-1 text-[11px]">
              {language === 'ar' ? 'السنة الميلادية:' : 'Year:'}
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-700 cursor-pointer"
            >
              <option value="all">{language === 'ar' ? 'جميع السنوات المتاحة' : 'All Years'}</option>
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>

          {/* Discipline Filter */}
          <div>
            <label className="block text-slate-500 font-semibold mb-1 text-[11px]">
              {language === 'ar' ? 'القسم / التخصص العلمي:' : 'Discipline / Section:'}
            </label>
            <select
              value={selectedDiscipline}
              onChange={(e) => setSelectedDiscipline(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-700 truncate cursor-pointer"
            >
              <option value="all">{language === 'ar' ? 'جميع الأقسام العلمية السبعة' : 'All 7 Sections'}</option>
              {JOURNAL_SECTIONS.map((sec) => (
                <option key={sec.departmentCode} value={sec.discipline}>
                  {sec.departmentCode} - {language === 'ar' ? sec.arabicName : sec.englishName}
                </option>
              ))}
            </select>
          </div>

          {/* Document Type Filter */}
          <div>
            <label className="block text-slate-500 font-semibold mb-1 text-[11px]">
              {language === 'ar' ? 'نوع الوثيقة:' : 'Document Type:'}
            </label>
            <select
              value={selectedDocType}
              onChange={(e) => setSelectedDocType(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-700 cursor-pointer"
            >
              <option value="all">{language === 'ar' ? 'جميع الأنواع' : 'All Types'}</option>
              <option value="Research Article">{language === 'ar' ? 'بحث أصيل (Research Article)' : 'Research Article'}</option>
              <option value="Review Article">{language === 'ar' ? 'مقال مرجعي (Review Article)' : 'Review Article'}</option>
              <option value="Short Communication">{language === 'ar' ? 'مراسلة علمية قصيرة (Short Comm.)' : 'Short Communication'}</option>
            </select>
          </div>

          {/* Active Submissions Counter Indicator */}
          <div className="flex flex-col justify-end">
            <div className="py-2 px-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-emerald-950 flex items-center justify-between">
              <span className="font-semibold text-[11px]">
                {language === 'ar' ? 'المخطوطات المطابقة:' : 'Matching Manuscripts:'}
              </span>
              <span className="font-mono font-bold text-sm bg-emerald-800 text-white px-2 py-0.5 rounded-lg">
                {kpis.totalReceived}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Performance Highlights Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Received */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">{language === 'ar' ? 'المستلمة' : 'Received'}</span>
            <Inbox className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">
            {kpis.totalReceived}
          </div>
          <p className="text-[10.5px] text-slate-500">
            {language === 'ar' ? 'إجمالي الأبحاث المقدمة' : 'Total submissions'}
          </p>
        </div>

        {/* Accepted */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold text-emerald-800">{language === 'ar' ? 'المقبولة' : 'Accepted'}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-800">
            {kpis.totalAccepted}
          </div>
          <p className="text-[10.5px] text-emerald-700 font-medium">
            {language === 'ar' ? `بنسبة ${kpis.overallAcceptanceRate}%` : `${kpis.overallAcceptanceRate}% acceptance`}
          </p>
        </div>

        {/* Rejected */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold text-rose-800">{language === 'ar' ? 'المرفوضة' : 'Rejected'}</span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-800">
            {kpis.totalRejected}
          </div>
          <p className="text-[10.5px] text-rose-700 font-medium">
            {language === 'ar' ? `بنسبة ${kpis.overallRejectionRate}%` : `${kpis.overallRejectionRate}% rejection`}
          </p>
        </div>

        {/* In Progress */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold text-amber-800">{language === 'ar' ? 'قيد التحكيم' : 'Under Review'}</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-800">
            {kpis.totalInProgress}
          </div>
          <p className="text-[10.5px] text-slate-500">
            {language === 'ar' ? 'بانتظار التقارير والتعديل' : 'Pending peer review'}
          </p>
        </div>

        {/* Acceptance Rate % */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold text-slate-700">{language === 'ar' ? 'معدل القبول' : 'Acceptance Rate'}</span>
            <Percent className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-800">
            {kpis.overallAcceptanceRate}%
          </div>
          <p className="text-[10.5px] text-slate-500">
            {language === 'ar' ? 'المعيار المستهدف: < 65%' : 'Benchmark: < 65%'}
          </p>
        </div>

        {/* Avg Turnaround Time */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold text-slate-700">{language === 'ar' ? 'زمن القرار' : 'Turnaround'}</span>
            <Timer className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-indigo-800">
            {kpis.avgTurnaroundDays} <span className="text-xs font-sans font-normal text-slate-500">{language === 'ar' ? 'يوماً' : 'days'}</span>
          </div>
          <p className="text-[10.5px] text-slate-500">
            {language === 'ar' ? 'متوسط سرعة البت' : 'Avg first decision'}
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-xl overflow-x-auto">
        <button
          onClick={() => setActiveTab('monthly')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'monthly'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>{language === 'ar' ? 'المخطط الشهري الشامل (مستلمة / مقبولة / مرفوضة)' : 'Monthly Overview Chart'}</span>
        </button>

        <button
          onClick={() => setActiveTab('breakdown')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'breakdown'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>{language === 'ar' ? 'التدفق التراكمي ونسب الإنجاز' : 'Cumulative Flow & Rates'}</span>
        </button>

        <button
          onClick={() => setActiveTab('disciplines')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'disciplines'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>{language === 'ar' ? 'التوزيع حسب الأقسام العلمية (7 أجزاء)' : 'Discipline Distribution'}</span>
        </button>

        <button
          onClick={() => setActiveTab('turnaround')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'turnaround'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Timer className="w-4 h-4" />
          <span>{language === 'ar' ? 'سرعة التحكيم بالأيام' : 'Turnaround Speed (Days)'}</span>
        </button>
      </div>

      {/* Visual Charts Containers */}

      {/* 1. Main Monthly Overview Chart */}
      {activeTab === 'monthly' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold font-serif text-slate-900">
                {language === 'ar'
                  ? `توزيع المخطوطات المستلمة والمقبولة والمرفوضة شهرياً (${selectedYear === 'all' ? 'كافة السنوات' : selectedYear})`
                  : `Monthly Distribution of Received, Accepted & Rejected Manuscripts (${selectedYear})`}
              </h2>
              <p className="text-xs text-slate-500">
                {language === 'ar'
                  ? 'مقارنة بيانية دقيقة بين أعداد المخطوطات المستلمة والقرارات النهائية، مع خط بياني لمعدل القبول %.'
                  : 'Direct comparison between received submissions and final editorial decisions with acceptance rate trend.'}
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-slate-700">
                <span className="w-3 h-3 rounded bg-slate-400"></span>
                <span>{language === 'ar' ? 'المستلمة' : 'Received'}</span>
              </span>
              <span className="flex items-center gap-1.5 text-emerald-800">
                <span className="w-3 h-3 rounded bg-emerald-600"></span>
                <span>{language === 'ar' ? 'المقبولة' : 'Accepted'}</span>
              </span>
              <span className="flex items-center gap-1.5 text-rose-800">
                <span className="w-3 h-3 rounded bg-rose-600"></span>
                <span>{language === 'ar' ? 'المرفوضة' : 'Rejected'}</span>
              </span>
              <span className="flex items-center gap-1.5 text-amber-800">
                <span className="w-3 h-1 bg-amber-500"></span>
                <span>{language === 'ar' ? 'نسبة القبول %' : 'Acceptance %'}</span>
              </span>
            </div>
          </div>

          {/* Recharts Composed Chart */}
          <div className="h-80 sm:h-96 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={monthlyData}
                margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                onClick={(e) => {
                  if (e && e.activeLabel) {
                    setSelectedDrilldownMonth(String(e.activeLabel));
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="label"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#cbd5e1' }}
                />
                <YAxis
                  yAxisId="left"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#cbd5e1' }}
                  allowDecimals={false}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={[0, 100]}
                  stroke="#d97706"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${val}%`}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white text-xs rounded-xl p-3 shadow-xl border border-slate-800 space-y-1.5 min-w-[180px]">
                          <div className="font-bold border-b border-slate-800 pb-1 text-emerald-400">
                            {data.label} {selectedYear}
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-slate-300">{language === 'ar' ? 'المستلمة:' : 'Received:'}</span>
                            <span className="font-mono font-bold">{data.received}</span>
                          </div>
                          <div className="flex justify-between gap-4 text-emerald-300">
                            <span>{language === 'ar' ? 'المقبولة:' : 'Accepted:'}</span>
                            <span className="font-mono font-bold">{data.accepted}</span>
                          </div>
                          <div className="flex justify-between gap-4 text-rose-300">
                            <span>{language === 'ar' ? 'المرفوضة:' : 'Rejected:'}</span>
                            <span className="font-mono font-bold">{data.rejected}</span>
                          </div>
                          <div className="flex justify-between gap-4 text-amber-300">
                            <span>{language === 'ar' ? 'قيد التحكيم:' : 'In Progress:'}</span>
                            <span className="font-mono font-bold">{data.inProgress}</span>
                          </div>
                          <div className="pt-1 border-t border-slate-800 flex justify-between gap-4 text-amber-400 font-bold">
                            <span>{language === 'ar' ? 'معدل القبول:' : 'Acceptance Rate:'}</span>
                            <span>{data.acceptanceRate}%</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar yAxisId="left" dataKey="received" name={language === 'ar' ? 'المستلمة' : 'Received'} fill="#94a3b8" radius={[4, 4, 0, 0]} maxBarSize={28} />
                <Bar yAxisId="left" dataKey="accepted" name={language === 'ar' ? 'المقبولة' : 'Accepted'} fill="#059669" radius={[4, 4, 0, 0]} maxBarSize={28} />
                <Bar yAxisId="left" dataKey="rejected" name={language === 'ar' ? 'المرفوضة' : 'Rejected'} fill="#e11d48" radius={[4, 4, 0, 0]} maxBarSize={28} />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="acceptanceRate"
                  name={language === 'ar' ? 'معدل القبول %' : 'Acceptance Rate %'}
                  stroke="#d97706"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#d97706', strokeWidth: 1.5, stroke: '#ffffff' }}
                  activeDot={{ r: 6 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 2. Cumulative Flow & Rates */}
      {activeTab === 'breakdown' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cumulative Area Chart */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <h2 className="text-base font-bold font-serif text-slate-900">
              {language === 'ar' ? 'مسار التدفق الشهري للمخطوطات والقرارات' : 'Monthly Submissions & Flow Trend'}
            </h2>
            <p className="text-xs text-slate-500">
              {language === 'ar'
                ? 'مساحة التدفق توضح تراكم الأبحاث المستلمة مقارنة بالأبحاث المبتوت فيها.'
                : 'Area visualization demonstrating cumulative input versus final editorial processing.'}
            </p>
            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                  <defs>
                    <linearGradient id="colorReceived" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorAccepted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="label" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="received"
                    name={language === 'ar' ? 'المستلمة' : 'Received'}
                    stroke="#0284c7"
                    fillOpacity={1}
                    fill="url(#colorReceived)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="accepted"
                    name={language === 'ar' ? 'المقبولة' : 'Accepted'}
                    stroke="#059669"
                    fillOpacity={1}
                    fill="url(#colorAccepted)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Acceptance Rate % Line Chart */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <h2 className="text-base font-bold font-serif text-slate-900">
              {language === 'ar' ? 'معدل القبول مقابل الرفض الشهري (%)' : 'Monthly Acceptance vs Rejection Ratio (%)'}
            </h2>
            <p className="text-xs text-slate-500">
              {language === 'ar'
                ? 'رصد التوازن العلمي التحريري وضمان جودة المعايير الأكاديمية للمجلة.'
                : 'Scientific rigor monitoring to ensure compliance with global indexing benchmarks.'}
            </p>
            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="label" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis domain={[0, 100]} stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(v) => `${v}%`} />
                  <Tooltip formatter={(value: any) => [`${value}%`]} />
                  <Line
                    type="monotone"
                    dataKey="acceptanceRate"
                    name={language === 'ar' ? 'نسبة القبول' : 'Acceptance Rate'}
                    stroke="#059669"
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="rejectionRate"
                    name={language === 'ar' ? 'نسبة الرفض' : 'Rejection Rate'}
                    stroke="#e11d48"
                    strokeWidth={2.5}
                    strokeDasharray="4 4"
                    dot={{ r: 4 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* 3. Discipline Distribution */}
      {activeTab === 'disciplines' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pie Chart of disciplines */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3 flex flex-col justify-between">
            <div>
              <h2 className="text-base font-bold font-serif text-slate-900">
                {language === 'ar' ? 'حصة الأقسام العلمية من الأبحاث' : 'Discipline Share of Submissions'}
              </h2>
              <p className="text-xs text-slate-500">
                {language === 'ar' ? 'توزيع الأبحاث المستلمة على تخصصات المجلة' : 'Relative volume of submissions across disciplines'}
              </p>
            </div>

            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={disciplineData}
                    dataKey="received"
                    nameKey="code"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={45}
                    paddingAngle={3}
                  >
                    {disciplineData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white text-xs rounded-xl p-3 shadow-xl border border-slate-800 space-y-1">
                            <div className="font-bold text-emerald-400">{d.code}</div>
                            <div className="text-[11px] text-slate-300">{d.name}</div>
                            <div className="flex justify-between gap-4 pt-1 border-t border-slate-800">
                              <span>المستلمة:</span>
                              <span className="font-bold">{d.received}</span>
                            </div>
                            <div className="flex justify-between gap-4 text-emerald-300">
                              <span>المقبولة:</span>
                              <span className="font-bold">{d.accepted} ({d.acceptanceRate}%)</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="text-[11px] text-slate-500 text-center font-mono">
              {language === 'ar' ? `إجمالي الأقسام النشطة: ${disciplineData.length}` : `Active Disciplines: ${disciplineData.length}`}
            </div>
          </div>

          {/* Bar Chart comparing Received vs Accepted across Disciplines */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <h2 className="text-base font-bold font-serif text-slate-900">
              {language === 'ar' ? 'المستلم والمقبول لكل قسم علمي' : 'Submissions vs Acceptance by Discipline'}
            </h2>
            <p className="text-xs text-slate-500">
              {language === 'ar'
                ? 'مقارنة حجم الاستلام مع قرارات القبول حسب كل تخصص من تخصصات المجلة السبعة.'
                : 'Comparison of submission volumes and accepted manuscripts per journal section.'}
            </p>
            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={disciplineData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="code" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="received" name={language === 'ar' ? 'المستلمة' : 'Received'} fill="#0284c7" radius={[4, 4, 0, 0]} maxBarSize={30} />
                  <Bar dataKey="accepted" name={language === 'ar' ? 'المقبولة' : 'Accepted'} fill="#059669" radius={[4, 4, 0, 0]} maxBarSize={30} />
                  <Bar dataKey="rejected" name={language === 'ar' ? 'المرفوضة' : 'Rejected'} fill="#e11d48" radius={[4, 4, 0, 0]} maxBarSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* 4. Turnaround Speed (Days) */}
      {activeTab === 'turnaround' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold font-serif text-slate-900">
                {language === 'ar' ? 'متوسط زمن اتخاذ القرار التحريري (بالأيام)' : 'Average Editorial Decision Turnaround (Days)'}
              </h2>
              <p className="text-xs text-slate-500">
                {language === 'ar'
                  ? 'المدة المستغرقة من استلام المخطوطة حتى صدور قرار القبول أو الرفض النهائي.'
                  : 'Time elapsed from initial manuscript submission until final acceptance or rejection decision.'}
              </p>
            </div>
            <div className="text-xs font-mono font-bold text-indigo-900 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-xl">
              {language === 'ar' ? 'المعدل العام: ' : 'Average: '} {kpis.avgTurnaroundDays} {language === 'ar' ? 'يوماً' : 'days'}
            </div>
          </div>

          <div className="h-80 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="label" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  formatter={(value: any) => [`${value} ${language === 'ar' ? 'يوماً' : 'days'}`, language === 'ar' ? 'متوسط مدة القرار' : 'Avg Turnaround']}
                />
                <Bar dataKey="avgDaysToDecision" name={language === 'ar' ? 'أيام اتخاذ القرار' : 'Turnaround Days'} fill="#4f46e5" radius={[4, 4, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Detailed Monthly Tabular Report */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold font-serif text-slate-900">
              {language === 'ar'
                ? `التقرير الجدولي الشهري المفصل (${selectedYear === 'all' ? 'جميع السنوات' : selectedYear})`
                : `Detailed Monthly Performance Table (${selectedYear})`}
            </h3>
            <p className="text-xs text-slate-500">
              {language === 'ar'
                ? 'انقر على اسم أي شهر لعرض المخطوطات المرتبطة به بالتفصيل.'
                : 'Click any month row to view the underlying manuscripts list.'}
            </p>
          </div>
          <div className="text-xs text-slate-500 font-mono">
            {language === 'ar' ? 'المعايير المعتمدة: EKB & Scopus' : 'Standard: EKB & Scopus'}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right rtl:text-right ltr:text-left divide-y divide-slate-200">
            <thead className="bg-slate-50 text-slate-700 font-bold">
              <tr>
                <th className="px-4 py-3">{language === 'ar' ? 'الشهر' : 'Month'}</th>
                <th className="px-4 py-3 text-center">{language === 'ar' ? 'المستلمة' : 'Received'}</th>
                <th className="px-4 py-3 text-center text-emerald-800">{language === 'ar' ? 'المقبولة' : 'Accepted'}</th>
                <th className="px-4 py-3 text-center text-rose-800">{language === 'ar' ? 'المرفوضة' : 'Rejected'}</th>
                <th className="px-4 py-3 text-center text-amber-800">{language === 'ar' ? 'قيد التحكيم' : 'In Progress'}</th>
                <th className="px-4 py-3 text-center text-emerald-900">{language === 'ar' ? 'نسبة القبول %' : 'Acceptance %'}</th>
                <th className="px-4 py-3 text-center text-rose-900">{language === 'ar' ? 'نسبة الرفض %' : 'Rejection %'}</th>
                <th className="px-4 py-3 text-center text-indigo-900">{language === 'ar' ? 'متوسط القرار' : 'Turnaround'}</th>
                <th className="px-4 py-3 text-center">{language === 'ar' ? 'الإجراء' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {monthlyData.map((m) => (
                <tr
                  key={m.monthNumber}
                  onClick={() => setSelectedDrilldownMonth(selectedDrilldownMonth === m.label ? null : m.label)}
                  className={`hover:bg-slate-50 transition-colors cursor-pointer ${
                    selectedDrilldownMonth === m.label ? 'bg-emerald-50/60 font-semibold' : ''
                  }`}
                >
                  <td className="px-4 py-3 font-bold text-slate-900">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                      <span>{m.label}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center font-mono font-bold text-slate-800">
                    {m.received}
                  </td>
                  <td className="px-4 py-3 text-center font-mono font-bold text-emerald-700">
                    {m.accepted}
                  </td>
                  <td className="px-4 py-3 text-center font-mono font-bold text-rose-700">
                    {m.rejected}
                  </td>
                  <td className="px-4 py-3 text-center font-mono font-bold text-amber-700">
                    {m.inProgress}
                  </td>
                  <td className="px-4 py-3 text-center font-mono font-bold text-emerald-800">
                    {m.acceptanceRate}%
                  </td>
                  <td className="px-4 py-3 text-center font-mono font-bold text-rose-800">
                    {m.rejectionRate}%
                  </td>
                  <td className="px-4 py-3 text-center font-mono text-indigo-800">
                    {m.avgDaysToDecision > 0 ? `${m.avgDaysToDecision} ${language === 'ar' ? 'يوم' : 'd'}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDrilldownMonth(selectedDrilldownMonth === m.label ? null : m.label);
                      }}
                      className="px-2.5 py-1 text-3xs font-bold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    >
                      {selectedDrilldownMonth === m.label ? (language === 'ar' ? 'إخفاء' : 'Hide') : (language === 'ar' ? 'عرض' : 'View')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            {/* Total Row */}
            <tfoot className="bg-slate-100 text-slate-900 font-bold border-t-2 border-slate-300">
              <tr>
                <td className="px-4 py-3 font-serif">
                  {language === 'ar' ? 'الإجمالي العام' : 'Overall Total'}
                </td>
                <td className="px-4 py-3 text-center font-mono text-sm">{kpis.totalReceived}</td>
                <td className="px-4 py-3 text-center font-mono text-sm text-emerald-800">{kpis.totalAccepted}</td>
                <td className="px-4 py-3 text-center font-mono text-sm text-rose-800">{kpis.totalRejected}</td>
                <td className="px-4 py-3 text-center font-mono text-sm text-amber-800">{kpis.totalInProgress}</td>
                <td className="px-4 py-3 text-center font-mono text-sm text-emerald-900">{kpis.overallAcceptanceRate}%</td>
                <td className="px-4 py-3 text-center font-mono text-sm text-rose-900">{kpis.overallRejectionRate}%</td>
                <td className="px-4 py-3 text-center font-mono text-sm text-indigo-900">{kpis.avgTurnaroundDays} {language === 'ar' ? 'يوم' : 'd'}</td>
                <td className="px-4 py-3 text-center">—</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Drilldown Month Manuscripts Modal / Expandable Panel */}
      {selectedDrilldownMonth && drilldownManuscripts && (
        <div className="bg-white border-2 border-emerald-600 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-base font-bold font-serif text-slate-900 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                <span>
                  {language === 'ar' ? `المخطوطات المسجلة في شهر: ${selectedDrilldownMonth} (${selectedYear})` : `Manuscripts in: ${selectedDrilldownMonth} (${selectedYear})`}
                </span>
                <span className="text-xs font-mono font-bold bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded-full">
                  {drilldownManuscripts.length} {language === 'ar' ? 'مخطوطة' : 'manuscripts'}
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {language === 'ar' ? 'قائمة تفصيلية بالأبحاث مع خيار فتح الملف التحريري الكامل' : 'Detailed list of papers with quick link to full editorial dossier'}
              </p>
            </div>
            <button
              onClick={() => setSelectedDrilldownMonth(null)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              {language === 'ar' ? 'إغلاق القائمة' : 'Close List'}
            </button>
          </div>

          {drilldownManuscripts.length > 0 ? (
            <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
              {drilldownManuscripts.map((m) => {
                const isAcc = isAcceptedStatus(m.status);
                const isRej = isRejectedStatus(m.status);
                return (
                  <div
                    key={m.id}
                    className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 px-2 rounded-xl transition-colors"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap text-xs">
                        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {m.id}
                        </span>
                        <span className="text-slate-500 font-sans text-[11px] truncate">
                          {m.documentType}
                        </span>
                        <span>·</span>
                        <span className="text-slate-400 font-mono text-[11px]">
                          {m.receiveDate}
                        </span>
                        <span
                          className={`font-semibold text-3xs px-2 py-0.5 rounded ${
                            isAcc
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              : isRej
                              ? 'bg-rose-100 text-rose-900 border border-rose-300'
                              : 'bg-amber-100 text-amber-900 border border-amber-300'
                          }`}
                        >
                          {m.status}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-xs leading-snug line-clamp-1">
                        {m.articleTitle}
                      </h4>
                      <div className="text-[11px] text-slate-500 truncate">
                        {m.authorsNames || `${m.correspondAuthorFirstName} ${m.correspondAuthorLastName}`} · {m.subjectsRelated?.[0] || ''}
                      </div>
                    </div>

                    {onSelectManuscript && (
                      <button
                        onClick={() => onSelectManuscript(m)}
                        className="shrink-0 flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{language === 'ar' ? 'عرض الملف' : 'View Dossier'}</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400 text-xs">
              {language === 'ar' ? 'لا توجد مخطوطات مسجلة في هذا الشهر.' : 'No manuscripts recorded for this month.'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
