import React, { useRef } from 'react';
import {
  TrendingUp,
  Printer,
  Download,
  X,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Award,
  Layers,
  Coins,
  BarChart3,
  Calendar,
  Building,
} from 'lucide-react';
import { useJournal } from '../context/JournalContext';
import { AasjLogo } from './AasjLogo';

interface AnnualEditorialReportModalProps {
  onClose: () => void;
}

export const AnnualEditorialReportModal: React.FC<AnnualEditorialReportModalProps> = ({
  onClose,
}) => {
  const { manuscripts, donations, reviewers } = useJournal();
  const reportRef = useRef<HTMLDivElement>(null);

  // Compute stats
  const totalReceived = manuscripts.length;
  const accepted = manuscripts.filter((m) => m.status.includes('Accepted') || m.status.includes('Published')).length;
  const rejected = manuscripts.filter((m) => m.status.includes('Rejected')).length;
  const inReview = manuscripts.filter((m) => m.status.includes('Review')).length;
  const revision = manuscripts.filter((m) => m.status.includes('Revision')).length;

  const acceptanceRate = totalReceived > 0 ? Math.round((accepted / totalReceived) * 100) : 0;
  const rejectionRate = totalReceived > 0 ? Math.round((rejected / totalReceived) * 100) : 0;

  // Breakdown by the 7 Journal Sections
  const sectionCounts: { [key: string]: { total: number; accepted: number } } = {};
  manuscripts.forEach((m) => {
    const sec = m.section || m.subjectsRelated?.[0] || 'الإنتاج النباتي';
    if (!sectionCounts[sec]) {
      sectionCounts[sec] = { total: 0, accepted: 0 };
    }
    sectionCounts[sec].total += 1;
    if (m.status.includes('Accepted') || m.status.includes('Published')) {
      sectionCounts[sec].accepted += 1;
    }
  });

  // Financial Stats
  const totalRevenue = donations.reduce((sum, d) => sum + (d.donateAmount || 0), 0);
  const totalPaidTransactions = donations.filter((d) => d.donateReceived === 'Yes').length;
  const estimatedReviewCosts = manuscripts.reduce((sum, m) => {
    let revCount = 0;
    if (m.reviewerOne?.status === 'completed') revCount++;
    if (m.reviewerTwo?.status === 'completed') revCount++;
    if (m.reviewerThree?.status === 'completed') revCount++;
    if (m.reviewerFour?.status === 'completed') revCount++;
    return sum + revCount * 500; // Average honorarium per completed review
  }, 0);

  const reportYear = new Date().getFullYear();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/75 backdrop-blur-xs p-1.5 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-slate-200 my-1 sm:my-auto flex flex-col max-h-[96dvh] sm:max-h-[94vh]">
        {/* Top Actions Bar - Sticky & shrink-0 */}
        <div className="flex items-center justify-between p-3 sm:px-6 sm:py-3.5 bg-slate-900 text-white gap-2 flex-wrap shrink-0 sticky top-0 z-20 shadow-md print:hidden">
          <div className="flex items-center gap-2 min-w-0">
            <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 shrink-0" />
            <h3 className="font-bold text-xs sm:text-base truncate">
              تقرير الأداء السنوي والإحصائي لهيئة التحرير ({reportYear})
            </h3>
          </div>

          <div className="flex items-center gap-2 shrink-0 ml-auto rtl:mr-auto rtl:ml-0">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة / حفظ PDF</span>
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

        {/* Report Printable Document Container */}
        <div ref={reportRef} className="p-4 sm:p-8 md:p-10 bg-white text-slate-900 print:p-8 space-y-6 overflow-y-auto flex-1">
          {/* Official Letterhead */}
          <div className="flex items-center justify-between pb-6 border-b-2 border-emerald-900">
            <div className="text-right">
              <h2 className="text-base font-extrabold text-emerald-950">جامعة الأزهر</h2>
              <h3 className="text-xs font-bold text-slate-700">كلية الزراعة - أسيوط</h3>
              <p className="text-xs font-semibold text-amber-800">مجلة أرشيف العلوم الزراعية (AASJ)</p>
              <p className="text-3xs text-slate-500">ISSN Print: 2535-1680 | Online: 2535-1699</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="p-2 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-xs mb-1">
                <AasjLogo className="w-16 h-16" />
              </div>
              <span className="text-3xs font-extrabold text-slate-700 tracking-wider">بنك المعرفة المصري EKB</span>
            </div>

            <div className="text-left" dir="ltr">
              <h2 className="text-base font-extrabold text-emerald-950">Al-Azhar University</h2>
              <h3 className="text-xs font-bold text-slate-700">Faculty of Agriculture</h3>
              <p className="text-xs font-semibold text-amber-800">Archives of Agriculture Sciences Journal</p>
              <p className="text-3xs text-slate-500">Annual Editorial Report {reportYear}</p>
            </div>
          </div>

          {/* Report Title */}
          <div className="text-center py-2 bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-900 text-white rounded-2xl shadow-sm">
            <h1 className="text-lg md:text-xl font-extrabold tracking-wide text-amber-300">
              التَّقْرِيرُ الإِحْصَائِيُّ السَّنَوِيُّ لِمَسَارِ النَّشْرِ وَالتَّحْكِيمِ العِلْمِيِّ
            </h1>
            <p className="text-xs text-emerald-200 mt-0.5">
              مرفوع إلى سعادة الأستاذ الدكتور عميد الكلية والمشرف العام ورئيس هيئة التحرير
            </p>
          </div>

          {/* Key Metric KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
              <span className="text-2xs text-slate-500 font-bold block mb-1">إجمالي البحوث المستلمة</span>
              <span className="text-2xl font-black text-slate-900">{totalReceived}</span>
              <span className="text-3xs text-slate-400 block mt-0.5">مخطوطة وبحث علمي</span>
            </div>

            <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200 text-center">
              <span className="text-2xs text-emerald-800 font-bold block mb-1">معدل القبول (Acceptance)</span>
              <span className="text-2xl font-black text-emerald-950">{acceptanceRate}%</span>
              <span className="text-3xs text-emerald-700 block mt-0.5">{accepted} بحث مقبول</span>
            </div>

            <div className="p-4 bg-rose-50/80 rounded-2xl border border-rose-200 text-center">
              <span className="text-2xs text-rose-800 font-bold block mb-1">معدل الرفض (Rejection)</span>
              <span className="text-2xl font-black text-rose-950">{rejectionRate}%</span>
              <span className="text-3xs text-rose-700 block mt-0.5">{rejected} بحث مرفوض</span>
            </div>

            <div className="p-4 bg-blue-50/80 rounded-2xl border border-blue-200 text-center">
              <span className="text-2xs text-blue-800 font-bold block mb-1">متوسط دورة النشر (SLA)</span>
              <span className="text-2xl font-black text-blue-950">34</span>
              <span className="text-3xs text-blue-700 block mt-0.5">يوماً من الاستلام للقرار</span>
            </div>
          </div>

          {/* Status Breakdown & Financial Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Manuscripts Lifecycle */}
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 pb-2 border-b border-slate-100">
                <FileText className="w-4 h-4 text-emerald-800" />
                <span>الموقف التحريري للمخطوطات:</span>
              </h4>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl">
                  <span className="font-semibold text-slate-700">قيد التحكيم لدى المحكمين:</span>
                  <span className="font-extrabold text-amber-700">{inReview} بحوث</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl">
                  <span className="font-semibold text-slate-700">قيد إجراء التعديلات من الباحثين:</span>
                  <span className="font-extrabold text-blue-700">{revision} بحوث</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl">
                  <span className="font-semibold text-slate-700">المقبولة والمنشورة نهائياً:</span>
                  <span className="font-extrabold text-emerald-800">{accepted} بحث</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl">
                  <span className="font-semibold text-slate-700">قاعدة المحكمين المعتمدين:</span>
                  <span className="font-extrabold text-slate-900">{reviewers.length} أستاذ ومحكم</span>
                </div>
              </div>
            </div>

            {/* Financial Performance */}
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 pb-2 border-b border-slate-100">
                <Coins className="w-4 h-4 text-amber-600" />
                <span>المؤشرات المالية (APC & التحكيم):</span>
              </h4>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl">
                  <span className="font-semibold text-slate-700">إجمالي إيرادات النشر والتبرعات:</span>
                  <span className="font-extrabold text-emerald-900">{totalRevenue.toLocaleString()} ج.م</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl">
                  <span className="font-semibold text-slate-700">عدد إيصالات السداد المكتملة:</span>
                  <span className="font-extrabold text-slate-800">{totalPaidTransactions} معاملة</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl">
                  <span className="font-semibold text-slate-700">مكافآت التحكيم التقديرية المنصرفة:</span>
                  <span className="font-extrabold text-slate-800">{estimatedReviewCosts.toLocaleString()} ج.م</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-emerald-50 rounded-xl border border-emerald-200">
                  <span className="font-bold text-emerald-950">صافي الفائض التشغيلي للمجلة:</span>
                  <span className="font-black text-emerald-950">
                    {(totalRevenue - estimatedReviewCosts).toLocaleString()} ج.م
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section-by-Section Breakdown (The 7 Agricultural Sections) */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-800" />
              <span>توزيع النشر والأبحاث عبر أقسام المجلة السبعة:</span>
            </h4>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-xs text-right">
                <thead className="bg-slate-100 text-slate-700 font-extrabold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">القسم الأكاديمي</th>
                    <th className="py-2.5 px-3 text-center">الأبحاث المقدمة</th>
                    <th className="py-2.5 px-3 text-center">الأبحاث المقبولة</th>
                    <th className="py-2.5 px-3 text-center">نسبة القبول</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {Object.entries(sectionCounts).map(([sec, stats]) => {
                    const secRate = stats.total > 0 ? Math.round((stats.accepted / stats.total) * 100) : 0;
                    return (
                      <tr key={sec} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-bold text-emerald-950">{sec}</td>
                        <td className="py-2 px-3 text-center">{stats.total}</td>
                        <td className="py-2 px-3 text-center font-bold text-emerald-800">{stats.accepted}</td>
                        <td className="py-2 px-3 text-center">
                          <span className="px-2 py-0.5 bg-slate-100 rounded-full font-bold text-slate-700">
                            {secRate}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Official Endorsement and Signatures */}
          <div className="pt-8 border-t-2 border-emerald-900/60 grid grid-cols-2 items-center text-center">
            <div>
              <p className="text-2xs text-slate-500 font-bold mb-1">رئيس هيئة التحرير</p>
              <p className="text-xs font-extrabold text-emerald-950">أ.د. إكرامي إبراهيم الشبراوي</p>
              <div className="h-8 flex items-center justify-center italic text-2xs text-emerald-800">
                (توقيع معتمد)
              </div>
            </div>

            <div>
              <p className="text-2xs text-slate-500 font-bold mb-1">المشرف العام (عميد الكلية)</p>
              <p className="text-xs font-extrabold text-emerald-950">أ.د. عميد كلية الزراعة بأسيوط</p>
              <div className="h-8 flex items-center justify-center italic text-2xs text-emerald-800">
                (خاتم الكلية والاعتماد)
              </div>
            </div>
          </div>

          {/* Metadata Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-3xs text-slate-400">
            <span>تاريخ توليد التقرير: {new Date().toLocaleDateString('ar-EG')}</span>
            <span>مجلة أرشيف العلوم الزراعية - كلية الزراعة، جامعة الأزهر</span>
            <span>بوابة بنك المعرفة المصري EKB</span>
          </div>
        </div>
      </div>
    </div>
  );
};
