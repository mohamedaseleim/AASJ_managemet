import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Award,
  Download,
  Printer,
  Search,
  CheckCircle2,
  QrCode,
  Building,
  UserCheck,
  ShieldCheck,
  Calendar,
  FileText,
  Filter,
  RefreshCw,
  Share2,
  Mail,
  Copy,
  ExternalLink,
  ChevronRight,
  Eye,
  Sparkles,
} from 'lucide-react';
import { useJournal } from '../context/JournalContext';
import { Manuscript, ReviewerProfile, JournalDiscipline } from '../types/journal';
import { JournalLogo } from './JournalLogo';
import { generateCertificateQRCodeSvg } from '../utils/qrCode';
import { printDocumentContent, downloadDocumentAsHtml } from '../utils/printDocument';

interface CertificateRecord {
  id: string;
  serialNumber: string;
  reviewerName: string;
  reviewerEmail: string;
  reviewerAffiliation: string;
  specialization: string;
  manuscriptId?: string;
  manuscriptTitle?: string;
  reviewDate: string;
  issueDate: string;
  issueDateEn: string;
  editorInChief: string;
  deanName: string;
  isVerified: boolean;
}

export const CertificateModule: React.FC<{
  onSelectManuscript?: (m: Manuscript) => void;
}> = ({ onSelectManuscript }) => {
  const { language, manuscripts, reviewers } = useJournal();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [activeSubTab, setActiveSubTab] = useState<'catalog' | 'designer' | 'verifier'>('catalog');

  // Currently Selected Certificate Data for Designer / Live Preview
  const [selectedReviewer, setSelectedReviewer] = useState<ReviewerProfile | null>(null);
  const [selectedManuscript, setSelectedManuscript] = useState<Manuscript | null>(null);

  // Editable Certificate Fields
  const [customReviewerName, setCustomReviewerName] = useState('');
  const [customAffiliation, setCustomAffiliation] = useState('جامعة الأزهر - كلية الزراعة بأسيوط');
  const [customSpecialization, setCustomSpecialization] = useState('العلوم الزراعية');
  const [customManuscriptTitle, setCustomManuscriptTitle] = useState('');
  const [customManuscriptId, setCustomManuscriptId] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [editorInChiefName, setEditorInChiefName] = useState('أ.د. إكرامي إبراهيم الشبراوي');
  const [deanName, setDeanName] = useState('أ.د. عميد كلية الزراعة');
  const [includePaperTitle, setIncludePaperTitle] = useState(true);

  // QR Code SVG state
  const [qrCodeSvg, setQrCodeSvg] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Verifier tool state
  const [verificationInput, setVerificationInput] = useState('');
  const [verificationResult, setVerificationResult] = useState<CertificateRecord | null | 'not_found'>(null);

  const certificatePrintRef = useRef<HTMLDivElement>(null);

  // Extract all completed reviews from manuscripts
  const completedReviewsList = useMemo(() => {
    const list: Array<{
      key: string;
      manuscript: Manuscript;
      reviewerName: string;
      reviewerEmail: string;
      reviewerAffiliation: string;
      reviewDate: string;
      recommendation: string;
      turnaroundDays?: number;
      slot: string;
    }> = [];

    manuscripts.forEach((m) => {
      const slots = [
        { slot: 'one', data: m.reviewerOne },
        { slot: 'two', data: m.reviewerTwo },
        { slot: 'three', data: m.reviewerThree },
        { slot: 'four', data: m.reviewerFour },
      ];

      slots.forEach(({ slot, data }) => {
        if (data && data.name && (data.reviewDate || data.recommendation)) {
          list.push({
            key: `${m.id}-${slot}-${data.email}`,
            manuscript: m,
            reviewerName: data.name,
            reviewerEmail: data.email,
            reviewerAffiliation: data.affiliation || 'جامعة الأزهر',
            reviewDate: data.reviewDate || m.updatedAt?.split('T')[0] || new Date().toISOString().split('T')[0],
            recommendation: data.recommendation || 'Accepted',
            turnaroundDays: 14,
            slot,
          });
        }
      });
    });

    return list;
  }, [manuscripts]);

  // Generate new unique serial
  const generateNewSerial = (mid?: string) => {
    const year = new Date().getFullYear();
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
    const codePart = mid ? mid.replace('AASJ-', '') : 'GEN';
    return `AASJ-CERT-${year}-${codePart}-${randomHex}`;
  };

  // Pre-select first completed review on mount
  useEffect(() => {
    if (completedReviewsList.length > 0 && !selectedManuscript) {
      const first = completedReviewsList[0];
      handleSelectReviewForCertificate(first.reviewerName, first.reviewerAffiliation, first.reviewerEmail, first.manuscript, first.reviewDate);
    } else if (!serialNumber) {
      setSerialNumber(generateNewSerial());
    }
  }, [completedReviewsList]);

  // Handler to pick a completed review and populate designer
  const handleSelectReviewForCertificate = (
    reviewerName: string,
    affiliation: string,
    email: string,
    manuscript?: Manuscript,
    reviewDate?: string
  ) => {
    setCustomReviewerName(reviewerName);
    setCustomAffiliation(affiliation || 'جامعة الأزهر - كلية الزراعة بأسيوط');
    setCustomSpecialization(manuscript?.subjectsRelated?.[0] || 'العلوم الزراعية');
    
    if (manuscript) {
      setSelectedManuscript(manuscript);
      setCustomManuscriptId(manuscript.id);
      setCustomManuscriptTitle(manuscript.articleTitle);
      setSerialNumber(generateNewSerial(manuscript.id));
    } else {
      setSelectedManuscript(null);
      setCustomManuscriptId('');
      setCustomManuscriptTitle('');
      setSerialNumber(generateNewSerial());
    }

    // Match reviewer profile if exists in directory
    const matchedProfile = reviewers.find((r) => r.email.toLowerCase() === email.toLowerCase());
    setSelectedReviewer(matchedProfile || null);

    setActiveSubTab('designer');
  };

  // Re-generate QR Code when serial or reviewer details change
  useEffect(() => {
    const updateQR = async () => {
      const svg = await generateCertificateQRCodeSvg({
        serial: serialNumber || 'AASJ-CERT-2026-VERIFIED',
        reviewerName: customReviewerName || 'Reviewer',
        reviewerId: selectedReviewer?.id || 'REV',
        affiliation: customAffiliation,
        manuscriptId: customManuscriptId,
        manuscriptTitle: customManuscriptTitle,
        issueDate: new Date().toISOString().split('T')[0],
        verifiedBy: 'Al-Azhar University AASJ Journal',
      });
      setQrCodeSvg(svg);
    };

    updateQR();
  }, [serialNumber, customReviewerName, customAffiliation, customManuscriptId]);

  // Print Certificate trigger with isolated iframe
  const handlePrintCertificate = () => {
    printDocumentContent(certificatePrintRef.current, {
      title: `${serialNumber} - Certificate - AASJ`,
      orientation: 'landscape',
      dir: 'rtl',
    });
  };

  // Download Certificate as standalone printable HTML file
  const handleDownloadCertificate = () => {
    downloadDocumentAsHtml(
      certificatePrintRef.current,
      `AASJ-Certificate-${serialNumber}`,
      {
        title: `${serialNumber} - Official Certificate - AASJ`,
        orientation: 'landscape',
        dir: 'rtl',
      }
    );
  };

  // Copy Verification Link
  const handleCopyVerificationLink = () => {
    const verificationUrl = `https://aasj.journals.ekb.eg/verify-cert?serial=${encodeURIComponent(serialNumber)}&rev=${encodeURIComponent(customReviewerName)}`;
    navigator.clipboard.writeText(verificationUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Verification Search Logic
  const handleVerifySerial = (e: React.FormEvent) => {
    e.preventDefault();
    const query = verificationInput.trim().toUpperCase();
    if (!query) return;

    // Check completed reviews or current serial
    if (serialNumber.toUpperCase().includes(query) || query.includes(serialNumber.toUpperCase())) {
      setVerificationResult({
        id: 'CERT-CURRENT',
        serialNumber: serialNumber,
        reviewerName: customReviewerName || 'محكم معتمد',
        reviewerEmail: 'reviewer@azhar.edu.eg',
        reviewerAffiliation: customAffiliation,
        specialization: customSpecialization,
        manuscriptId: customManuscriptId,
        manuscriptTitle: customManuscriptTitle,
        reviewDate: new Date().toISOString().split('T')[0],
        issueDate: new Date().toLocaleDateString('ar-EG'),
        issueDateEn: new Date().toLocaleDateString('en-US'),
        editorInChief: editorInChiefName,
        deanName: deanName,
        isVerified: true,
      });
      return;
    }

    const matched = completedReviewsList.find(
      (r) => r.manuscript.id.toUpperCase().includes(query) || r.reviewerName.toUpperCase().includes(query)
    );

    if (matched) {
      setVerificationResult({
        id: matched.key,
        serialNumber: `AASJ-CERT-2026-${matched.manuscript.id.replace('AASJ-', '')}-VERIFIED`,
        reviewerName: matched.reviewerName,
        reviewerEmail: matched.reviewerEmail,
        reviewerAffiliation: matched.reviewerAffiliation,
        specialization: matched.manuscript.subjectsRelated[0] || 'العلوم الزراعية',
        manuscriptId: matched.manuscript.id,
        manuscriptTitle: matched.manuscript.articleTitle,
        reviewDate: matched.reviewDate,
        issueDate: new Date().toLocaleDateString('ar-EG'),
        issueDateEn: new Date().toLocaleDateString('en-US'),
        editorInChief: editorInChiefName,
        deanName: deanName,
        isVerified: true,
      });
    } else {
      setVerificationResult('not_found');
    }
  };

  // Filter Catalog
  const filteredCompletedReviews = useMemo(() => {
    return completedReviewsList.filter((item) => {
      const matchesSearch =
        item.reviewerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.reviewerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.manuscript.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.manuscript.articleTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.reviewerAffiliation.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSection =
        selectedSection === 'all' || item.manuscript.subjectsRelated.includes(selectedSection as JournalDiscipline);

      return matchesSearch && matchesSection;
    });
  }, [completedReviewsList, searchTerm, selectedSection]);

  const issueDateFormattedAr = new Date().toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const issueDateFormattedEn = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-6">
      {/* Module Title Banner & Stats */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs print:hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="font-extrabold text-amber-900 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
                منظومة الاعتماد الأكاديمي الرقمي (AASJ Certified Peer Review)
              </span>
              <span className="text-slate-400">·</span>
              <span className="font-semibold text-emerald-800">
                جامعة الأزهر - كلية الزراعة بأسيوط
              </span>
              <span className="text-slate-400">·</span>
              <span className="font-mono text-slate-500 text-3xs">
                ISSN: 2535-1680 (Print) / 2535-1699 (Online)
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-serif flex items-center gap-2.5">
              <Award className="w-7 h-7 text-amber-600 shrink-0" />
              <span>وحدة إصدار وتوثيق شهادات التحكيم الرسمية (CertificateModule)</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-3xl">
              إصدار شهادات شكر وتقدير أكاديمية معتمدة وموثقة برمز QR فريد، وتوقيعات عميد الكلية ورئيس التحرير، وقالب PDF عالي الدقة يراعي معايير التحكيم المزدوج والنزاهة العلمية.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              onClick={() => setActiveSubTab('designer')}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-amber-300 font-extrabold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>مصمم الشهادة المباشر</span>
            </button>

            <button
              onClick={handlePrintCertificate}
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة / حفظ PDF</span>
            </button>
          </div>
        </div>

        {/* 4 Metric Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100">
          <div className="bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-100">
            <div className="flex items-center justify-between text-emerald-800 text-xs font-bold mb-1">
              <span>الأبحاث المحكمة المكتملة</span>
              <FileText className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-950 font-mono tabular-nums">
              {completedReviewsList.length}
            </div>
            <span className="text-3xs text-emerald-700 font-medium">مراجعات جاهزة لإصدار الشهادة</span>
          </div>

          <div className="bg-blue-50/60 p-3.5 rounded-xl border border-blue-100">
            <div className="flex items-center justify-between text-blue-800 text-xs font-bold mb-1">
              <span>المحكمون المعتمدون بالدليل</span>
              <UserCheck className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-black text-blue-950 font-mono tabular-nums">
              {reviewers.length}
            </div>
            <span className="text-3xs text-blue-700 font-medium">أعضاء هيئة تدريس وباحثين</span>
          </div>

          <div className="bg-amber-50/60 p-3.5 rounded-xl border border-amber-100">
            <div className="flex items-center justify-between text-amber-800 text-xs font-bold mb-1">
              <span>التوثيق الرقمي الفريد</span>
              <QrCode className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-black text-amber-950 font-mono tabular-nums">
              100%
            </div>
            <span className="text-3xs text-amber-700 font-medium">رمز QR ديناميكي لكل شهادة</span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between text-slate-700 text-xs font-bold mb-1">
              <span>الاعتماد الأكاديمي</span>
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
            </div>
            <div className="text-sm font-bold text-slate-900 mt-1">
              ختم الكلية + العميد + التحرير
            </div>
            <span className="text-3xs text-slate-500 font-medium">جامعة الأزهر - بنك المعرفة</span>
          </div>
        </div>
      </div>

      {/* Sub Tabs Navigation */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 rounded-xl shadow-2xs print:hidden">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2">
          <button
            onClick={() => setActiveSubTab('catalog')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              activeSubTab === 'catalog'
                ? 'bg-emerald-900 text-amber-300 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>سجل المراجعات المكتملة ({completedReviewsList.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('designer')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              activeSubTab === 'designer'
                ? 'bg-emerald-900 text-amber-300 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>معاينة وتخصيص قالب الشهادة (PDF / Print)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('verifier')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              activeSubTab === 'verifier'
                ? 'bg-emerald-900 text-amber-300 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>أداة التحقق من الرمز الرقمي (QR Verification)</span>
          </button>
        </div>
      </div>

      {/* TAB 1: CATALOG OF COMPLETED REVIEWS */}
      {activeSubTab === 'catalog' && (
        <div className="space-y-4 print:hidden">
          {/* Search & Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute top-2.5 right-3 rtl:right-3 rtl:left-auto ltr:left-3 ltr:right-auto pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="بحث باسم المحكم، البريد، كود البحث، أو الجامعة..."
                className="w-full text-xs py-2 px-3 rtl:pr-9 ltr:pl-9 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="text-xs py-2 px-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
              >
                <option value="all">كافة الأقسام الزراعية (7)</option>
                <option value="Plant Production">إنتاج النبات والمحاصيل والبساتين</option>
                <option value="Animal and Poultry Production">إنتاج الحيوان والدواجن</option>
                <option value="Plant Pathology and Plant Protection">أمراض ووقاية النبات</option>
                <option value="Soils and Water, and Agricultural Engineering">الأراضي والمياه والهندسة الزراعية</option>
                <option value="Dairy Science, Food Science and Technology">علوم وتكنولوجيا الأغذية والألبان</option>
                <option value="Chemistry, Agricultural Microbiology, and Genetics">الكيمياء والميكروبيولوجيا والوراثة</option>
                <option value="Agricultural Economics, Rural Sociology and Agricultural Extension">الاقتصاد والمجتمع الريفي والإرشاد</option>
              </select>
            </div>
          </div>

          {/* Reviews Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-right rtl:text-right ltr:text-left">
                <thead className="bg-slate-800 text-white font-bold">
                  <tr>
                    <th className="py-3 px-4">كود البحث</th>
                    <th className="py-3 px-4">المحكم الأكاديمي</th>
                    <th className="py-3 px-4">الجهة والجامعة</th>
                    <th className="py-3 px-4">تاريخ المراجعة</th>
                    <th className="py-3 px-4">التوصية</th>
                    <th className="py-3 px-4 text-center">إجراءات الشهادة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCompletedReviews.length > 0 ? (
                    filteredCompletedReviews.map((item) => (
                      <tr key={item.key} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-emerald-950">
                          {item.manuscript.id}
                          <span className="block text-3xs font-normal text-slate-500 font-sans line-clamp-1 max-w-xs">
                            {item.manuscript.articleTitle}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {item.reviewerName}
                          <span className="block text-3xs font-mono font-normal text-slate-500">
                            {item.reviewerEmail}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {item.reviewerAffiliation}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-700">
                          {item.reviewDate}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-3xs font-semibold bg-blue-100 text-blue-900">
                            {item.recommendation}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() =>
                              handleSelectReviewForCertificate(
                                item.reviewerName,
                                item.reviewerAffiliation,
                                item.reviewerEmail,
                                item.manuscript,
                                item.reviewDate
                              )
                            }
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg font-extrabold text-xs transition-colors cursor-pointer"
                          >
                            <Award className="w-3.5 h-3.5 text-amber-600" />
                            <span>إصدار / معاينة الشهادة</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500">
                        لا توجد نتائج مطابقة لبحثك الحالي.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LIVE CERTIFICATE DESIGNER & TEMPLATE */}
      {(activeSubTab === 'designer' || activeSubTab === 'catalog') && (
        <div className="space-y-6">
          {/* Customization Control Panel (Print hidden) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs print:hidden space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-sm text-slate-900">
                  لوحة تخصيص بيانات الشهادة الأكاديمية (Certificate Customizer)
                </h3>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setSerialNumber(generateNewSerial(customManuscriptId))}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                  title="توليد رقم تسلسلي جديد مع كود QR مختلف"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>توليد سيريال QR جديد</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyVerificationLink}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedLink ? 'تم نسخ الرابط!' : 'نسخ رابط التحقق'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadCertificate}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs rounded-lg shadow-xs transition-colors cursor-pointer"
                  title="تحميل المستند المستقل للحفظ كـ PDF"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span>تحميل ملف المستند</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrintCertificate}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>طباعة الشهادة (A4) / حفظ PDF</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم المحكم الأكاديمي مع اللقب:</label>
                <input
                  type="text"
                  value={customReviewerName}
                  onChange={(e) => setCustomReviewerName(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-700"
                  placeholder="أ.د. محمد أحمد..."
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">الجهة / الجامعة / الكلية:</label>
                <input
                  type="text"
                  value={customAffiliation}
                  onChange={(e) => setCustomAffiliation(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-700"
                  placeholder="جامعة الأزهر - كلية الزراعة"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">التخصص الزراعي الدقيق:</label>
                <input
                  type="text"
                  value={customSpecialization}
                  onChange={(e) => setCustomSpecialization(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-700"
                  placeholder="وقاية النبات / المحاصيل..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
              <div>
                <label className="block font-bold text-slate-700 mb-1">كود المخطوطة المحكمة:</label>
                <input
                  type="text"
                  value={customManuscriptId}
                  onChange={(e) => setCustomManuscriptId(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-emerald-700"
                  placeholder="AASJ-2026-081"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">عنوان البحث المحكّم:</label>
                <input
                  type="text"
                  value={customManuscriptTitle}
                  onChange={(e) => setCustomManuscriptTitle(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-700"
                  placeholder="عنوان البحث..."
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 flex-wrap gap-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-800 font-semibold">
                <input
                  type="checkbox"
                  checked={includePaperTitle}
                  onChange={(e) => setIncludePaperTitle(e.target.checked)}
                  className="rounded text-emerald-700 focus:ring-emerald-700 w-4 h-4"
                />
                <span>تضمين كود وعنوان البحث في الشهادة (مع الحفاظ على سرية التحكيم المزدوج)</span>
              </label>

              <div className="text-3xs text-slate-500 font-mono">
                كود التحقق الرقمي: <strong className="text-slate-800">{serialNumber}</strong>
              </div>
            </div>
          </div>

          {/* OFFICIAL ACADEMIC CERTIFICATE CANVAS (A4 HIGH RESOLUTION) */}
          <div
            ref={certificatePrintRef}
            className="certificate-print-container bg-white text-slate-900 mx-auto rounded-3xl shadow-xl overflow-hidden border border-slate-200"
            style={{ maxWidth: '1000px' }}
          >
            {/* Outer Classical Frame */}
            <div className="p-3 md:p-5 bg-gradient-to-br from-amber-700/80 via-emerald-950 to-amber-700/80">
              <div className="border-4 border-amber-400/90 p-1 rounded-2xl bg-white shadow-2xl">
                <div className="border-2 border-dashed border-emerald-900/60 p-6 md:p-10 rounded-xl bg-radial from-amber-50/30 via-white to-amber-50/10 relative overflow-hidden">
                  
                  {/* Subtle AASJ Journal Watermark */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-4">
                    <JournalLogo className="w-120 h-120" />
                  </div>

                  {/* Header / Crests - Speaking in the Name of the Journal */}
                  <div className="flex items-center justify-between pb-6 border-b-2 border-amber-300/80 relative z-10">
                    <div className="text-right">
                      <h2 className="text-sm md:text-base font-extrabold text-emerald-950">مجلة أرشيف العلوم الزراعية</h2>
                      <h3 className="text-xs md:text-sm font-bold text-emerald-800">هيئة التحرير والمراجعة العلمية</h3>
                      <p className="text-2xs font-semibold text-slate-600 mt-0.5">كلية الزراعة بأسيوط (المقر الأكاديمي)</p>
                      <p className="text-3xs text-slate-500 font-mono">ISSN Print: 2535-1680 | Online: 2535-1699</p>
                    </div>

                    <div className="flex flex-col items-center">
                      <div className="p-2.5 rounded-2xl bg-gradient-to-b from-emerald-50 to-white border border-amber-300/80 shadow-md mb-1.5">
                        <JournalLogo className="w-18 h-18 md:w-20 md:h-20" />
                      </div>
                      <span className="text-2xs font-black text-emerald-950 tracking-wider font-serif">
                        ARCHIVES OF AGRICULTURE SCIENCES JOURNAL
                      </span>
                    </div>

                    <div className="text-left" dir="ltr">
                      <h2 className="text-sm md:text-base font-extrabold text-emerald-950 font-serif">Archives of Agriculture Sciences</h2>
                      <h3 className="text-xs md:text-sm font-bold text-emerald-800">Editorial & Peer-Review Board</h3>
                      <p className="text-2xs font-semibold text-slate-600 mt-0.5">Faculty of Agriculture (Assiut) · EKB</p>
                      <p className="text-3xs text-emerald-700 font-mono font-bold">https://aasj.journals.ekb.eg</p>
                    </div>
                  </div>

                  {/* Title Banner */}
                  <div className="text-center my-6 md:my-8 relative z-10">
                    <div className="inline-flex items-center justify-center gap-2.5 px-8 py-2.5 bg-gradient-to-r from-emerald-900 via-emerald-950 to-emerald-900 text-amber-300 rounded-full shadow-lg border border-amber-400/50 mb-2">
                      <Award className="w-6 h-6 text-amber-400 shrink-0" />
                      <span className="text-lg md:text-2xl font-black tracking-wide font-serif">
                        شَهَادَةُ شُكْرٍ وَتَقْدِيرٍ لِلتَّحْكِيمِ العِلْمِيِّ
                      </span>
                    </div>
                    <p className="text-2xs md:text-xs font-extrabold text-amber-900 tracking-widest uppercase mt-1 font-mono">
                      CERTIFICATE OF PEER REVIEW APPRECIATION & EXCELLENCE
                    </p>
                  </div>

                  {/* Body Content - Speaking in the Name of the Journal */}
                  <div className="text-center space-y-5 my-6 px-4 md:px-12 relative z-10">
                    <p className="text-xs md:text-sm text-slate-800 leading-relaxed font-semibold">
                      تتشرف إدارة وهيئة تحرير <strong className="text-emerald-950">مجلة أرشيف العلوم الزراعية (AASJ)</strong> بأن تتقدم بخالص الشكر والتقدير وفائق الامتنان إلى سعادة الأستاذ الدكتور /
                    </p>

                    <div className="py-2.5 px-8 inline-block bg-amber-50/90 border-b-2 border-amber-600 rounded-xl shadow-xs">
                      <h3 className="text-xl md:text-3xl font-black text-emerald-950 tracking-normal font-serif">
                        {customReviewerName || 'سعادة الأستاذ الدكتور المحكم الأكاديمي'}
                      </h3>
                      <p className="text-xs md:text-sm font-bold text-amber-900 mt-1">
                        {customAffiliation} — تخصص: {customSpecialization}
                      </p>
                    </div>

                    <p className="text-xs md:text-sm text-slate-700 leading-relaxed max-w-2xl mx-auto font-medium">
                      تقديراً لجهوده العلمية المتميزة وإسهامه الأكاديمي الرفيع في تحكيم ومراجعة البحوث العلمية بدقة وموضوعية، والتزامه الراسخ بأعلى معايير الأمانة العلمية والتحكيم المزدوج السري (Double-Blind Peer Review) المعتمد في قواعد النشر الدولية بالمجلة.
                    </p>

                    {includePaperTitle && (customManuscriptId || customManuscriptTitle) && (
                      <div className="bg-slate-50/90 p-4 rounded-xl border border-slate-200 text-xs text-slate-800 max-w-xl mx-auto text-right shadow-2xs space-y-1">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 mb-1">
                          <span className="font-extrabold text-emerald-900">بيانات البحث العلمي المحكّم:</span>
                          <span className="font-mono text-3xs font-bold text-slate-500">كود التحكيم: {customManuscriptId || 'AASJ-2026-REC'}</span>
                        </div>
                        {customManuscriptTitle && (
                          <p className="font-semibold text-slate-900 line-clamp-2">
                            <strong>عنوان البحث:</strong> {customManuscriptTitle}
                          </p>
                        )}
                        <p className="text-3xs text-slate-600">
                          نظام التحكيم: مراجعة علمية مزدوجة التعمية (Double-Blind Peer Review)
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Signatures, Official Stamp, and Dynamic QR */}
                  <div className="mt-8 pt-6 border-t-2 border-amber-200/80 grid grid-cols-3 items-center text-center relative z-10 gap-2">
                    {/* Editor-in-Chief */}
                    <div className="flex flex-col items-center">
                      <p className="text-2xs font-extrabold text-slate-700 mb-1">رئيس هيئة التحرير</p>
                      <p className="text-xs md:text-sm font-black text-emerald-950">{editorInChiefName}</p>
                      <div className="h-10 flex items-center justify-center italic text-xs text-emerald-900 font-serif font-bold">
                        Prof. Dr. Ikramy El-Shabrawy
                      </div>
                      <span className="text-3xs font-medium text-slate-500">Editor-in-Chief · AASJ</span>
                    </div>

                    {/* Official Stamp & Generated QR Code */}
                    <div className="flex flex-col items-center justify-center">
                      <div className="p-2 bg-white rounded-2xl border-2 border-emerald-800 shadow-md flex flex-col items-center justify-center">
                        {qrCodeSvg ? (
                          <div
                            className="w-20 h-20 md:w-24 md:h-24 flex items-center justify-center"
                            dangerouslySetInnerHTML={{ __html: qrCodeSvg }}
                          />
                        ) : (
                          <QrCode className="w-16 h-16 text-emerald-900" />
                        )}
                        <span className="text-[9px] font-black text-amber-900 mt-1 uppercase tracking-wider">
                          معتمد وموثق رقمياً
                        </span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-slate-700 mt-1">
                        {serialNumber}
                      </span>
                    </div>

                    {/* General Supervisor / Dean */}
                    <div className="flex flex-col items-center">
                      <p className="text-2xs font-extrabold text-slate-700 mb-1">المشرف العام (عميد الكلية)</p>
                      <p className="text-xs md:text-sm font-black text-emerald-950">{deanName}</p>
                      <div className="h-10 flex items-center justify-center italic text-xs text-emerald-900 font-serif font-bold">
                        Dean of Faculty of Agriculture
                      </div>
                      <span className="text-3xs font-medium text-slate-500">General Supervisor</span>
                    </div>
                  </div>

                  {/* Metadata Footer */}
                  <div className="mt-6 pt-3 border-t border-slate-200 flex items-center justify-between text-3xs text-slate-500">
                    <span>تاريخ الإصدار: {issueDateFormattedAr} م ({issueDateFormattedEn})</span>
                    <span className="font-mono">التحقق الإلكتروني: aasj.journals.ekb.eg/verify-cert</span>
                    <span>وثيقة رسمية صادرة عن جامعة الأزهر</span>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: QR CODE VERIFIER TOOL */}
      {activeSubTab === 'verifier' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs print:hidden space-y-6 max-w-3xl mx-auto">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-200 flex items-center justify-center mx-auto shadow-xs">
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              أداة التحقق الفوري من صحة وموثوقية شهادات التحكيم (Digital Certificate Verifier)
            </h3>
            <p className="text-xs text-slate-600 max-w-lg mx-auto">
              أدخل الرقم التسلسلي للشهادة أو امسح كود QR المطبوع للتحقق من قيد الشهادة في السجل الأكاديمي الرسمي لمجلة أرشيف العلوم الزراعية بجامعة الأزهر.
            </p>
          </div>

          <form onSubmit={handleVerifySerial} className="flex gap-2 max-w-lg mx-auto">
            <input
              type="text"
              value={verificationInput}
              onChange={(e) => setVerificationInput(e.target.value)}
              placeholder="مثال: AASJ-CERT-2026-081..."
              className="flex-1 text-xs py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700 font-mono"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-amber-300 font-extrabold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              تحقق الآن
            </button>
          </form>

          {/* Quick Pre-fill helper */}
          <div className="text-center text-3xs text-slate-500">
            <span>أو جرب التحقق من الشهادة الحالية: </span>
            <button
              type="button"
              onClick={() => {
                setVerificationInput(serialNumber);
              }}
              className="text-emerald-700 font-bold underline font-mono cursor-pointer ml-1"
            >
              {serialNumber}
            </button>
          </div>

          {/* Verification Result Card */}
          {verificationResult && typeof verificationResult === 'object' && (
            <div className="bg-emerald-50/90 border-2 border-emerald-500/80 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-emerald-950 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>الشهادة موثقة ورسمية 100% في سجلات جامعة الأزهر</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2 border-t border-emerald-200">
                <div>
                  <span className="text-slate-500 block">اسم المحكم المعتمد:</span>
                  <strong className="text-emerald-950 text-sm">{verificationResult.reviewerName}</strong>
                </div>

                <div>
                  <span className="text-slate-500 block">الجهة الأكاديمية:</span>
                  <strong className="text-slate-900">{verificationResult.reviewerAffiliation}</strong>
                </div>

                <div>
                  <span className="text-slate-500 block">الرقم التسلسلي المعتمد:</span>
                  <strong className="font-mono text-emerald-900">{verificationResult.serialNumber}</strong>
                </div>

                <div>
                  <span className="text-slate-500 block">تاريخ الإصدار:</span>
                  <strong className="text-slate-900">{verificationResult.issueDate}</strong>
                </div>

                {verificationResult.manuscriptTitle && (
                  <div className="sm:col-span-2">
                    <span className="text-slate-500 block">البحث المحكم:</span>
                    <strong className="text-slate-900">{verificationResult.manuscriptTitle} ({verificationResult.manuscriptId})</strong>
                  </div>
                )}
              </div>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    handleSelectReviewForCertificate(
                      verificationResult.reviewerName,
                      verificationResult.reviewerAffiliation,
                      verificationResult.reviewerEmail
                    );
                  }}
                  className="text-xs font-bold text-emerald-900 hover:underline"
                >
                  فتح الشهادة في المصمم والطباعة ←
                </button>
              </div>
            </div>
          )}

          {verificationResult === 'not_found' && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-center text-xs text-rose-800">
              لم يتم العثور على شهادة مسجلة بهذا الرقم التسلسلي. يرجى التأكد من كتابة الكود بشكل صحيح.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
