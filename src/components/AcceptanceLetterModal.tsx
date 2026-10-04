import React, { useRef, useState, useEffect } from 'react';
import {
  Printer,
  X,
  ExternalLink,
  Award,
  CheckCircle2,
  QrCode,
  Copy,
  Check,
  ShieldCheck,
  Download,
  FileCheck,
  Sliders,
  Calendar,
  Upload,
  Image as ImageIcon,
  RotateCcw,
} from 'lucide-react';
import { useJournal } from '../context/JournalContext';
import { useAuth } from '../context/AuthContext';
import { useTemplate } from '../context/TemplateContext';
import { Manuscript } from '../types/journal';
import { JournalLogo } from './JournalLogo';
import { JournalSeal } from './JournalSeal';
import { generateAcceptanceQRCodeSvg } from '../utils/qrCode';
import { printDocumentContent, downloadDocumentAsHtml } from '../utils/printDocument';
import { AdminTemplateEditorModal } from './AdminTemplateEditorModal';

interface AcceptanceLetterModalProps {
  manuscript: Manuscript;
  onClose: () => void;
}

export const AcceptanceLetterModal: React.FC<AcceptanceLetterModalProps> = ({
  manuscript,
  onClose,
}) => {
  const { language: systemLanguage } = useJournal();
  const { currentUser } = useAuth();
  const {
    acceptanceTemplate,
    customBarcodeUrl,
    barcodeMode,
    setCustomBarcodeUrl,
    setBarcodeMode,
  } = useTemplate();

  // Language state (defaults to English)
  const [letterLanguage, setLetterLanguage] = useState<'en' | 'ar'>('en');
  const [qrSvg, setQrSvg] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [printSuccessFeedback, setPrintSuccessFeedback] = useState(false);

  // Optional Received Date Feature
  const [showReceivedDate, setShowReceivedDate] = useState<boolean>(
    Boolean(manuscript.receiveDate) || acceptanceTemplate.showReceivedDateDefault
  );
  const [receivedDateInput, setReceivedDateInput] = useState<string>(
    manuscript.receiveDate ||
      new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  const printAreaRef = useRef<HTMLDivElement>(null);
  const barcodeFileInputRef = useRef<HTMLInputElement>(null);
  const isEn = letterLanguage === 'en';

  const formattedDateEn = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const formattedDateAr = new Date().toLocaleDateString('ar-EG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const formattedReceivedDateEn = new Date(receivedDateInput).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const formattedReceivedDateAr = new Date(receivedDateInput).toLocaleDateString('ar-EG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const currentYear = new Date().getFullYear();
  // Clean reference without Q1
  const refNumber = `AASJ/ACC-EKB/${currentYear}/${manuscript.id.replace('AASJ-', '')}`;
  const verificationUrl = `https://aasj.journals.ekb.eg/verify-acceptance?id=${manuscript.id}&ref=${refNumber}`;

  // Check if current user is admin / editor
  const isAdminOrEditor =
    !currentUser ||
    ['admin', 'general_supervisor', 'editor_in_chief', 'managing_editor', 'executive_editor', 'secretary'].includes(
      currentUser.role
    );

  // Generate QR Code with responsive scaling
  useEffect(() => {
    let isMounted = true;
    generateAcceptanceQRCodeSvg({
      manuscriptId: manuscript.id,
      articleTitle: manuscript.articleTitle,
      authorName: `${manuscript.correspondAuthorFirstName} ${manuscript.correspondAuthorLastName}`,
      doi: manuscript.doi || `${acceptanceTemplate.headerDoiPrefix}.${currentYear}.${manuscript.id.replace('AASJ-', '')}`,
      issueDate: formattedDateEn,
      volume: manuscript.volume || 8,
      issue: manuscript.issue || 1,
    }).then((svg) => {
      if (isMounted) setQrSvg(svg);
    });

    return () => {
      isMounted = false;
    };
  }, [manuscript, formattedDateEn, currentYear, acceptanceTemplate.headerDoiPrefix]);

  // Handle direct barcode upload from modal
  const handleBarcodeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('حجم صورة الباركود كبير جداً، يرجى اختيار صورة أقل من 2 ميجابايت (PNG / SVG / JPG)');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setCustomBarcodeUrl(result);
        setBarcodeMode('custom_barcode');
      };
      reader.readAsDataURL(file);
    }
  };

  // Robust isolated iframe printing tailored strictly for single A4 page
  const handlePrint = () => {
    const success = printDocumentContent(printAreaRef.current, {
      title: `${manuscript.id} - Acceptance Letter - AASJ`,
      orientation: 'portrait',
      dir: isEn ? 'ltr' : 'rtl',
    });
    if (success) {
      setPrintSuccessFeedback(true);
      setTimeout(() => setPrintSuccessFeedback(false), 3000);
    }
  };

  // Direct document download as standalone HTML file
  const handleDownload = () => {
    downloadDocumentAsHtml(
      printAreaRef.current,
      `AASJ-Acceptance-Letter-${manuscript.id}`,
      {
        title: `${manuscript.id} - Official Acceptance Letter - AASJ`,
        orientation: 'portrait',
        dir: isEn ? 'ltr' : 'rtl',
      }
    );
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(verificationUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const isCustomBarcodeActive = barcodeMode === 'custom_barcode' && Boolean(customBarcodeUrl);

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-slate-950/80 backdrop-blur-xs p-1 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden my-1 sm:my-auto flex flex-col max-h-[96dvh] sm:max-h-[96vh]">
        
        {/* Modal Toolbar (hidden during print) - Sticky & shrink-0 */}
        <div className="bg-slate-900 text-white print:hidden border-b border-slate-800 shrink-0 sticky top-0 z-20 shadow-md">
          {/* Top Row: Title, ID Badge & Close Button */}
          <div className="px-3 sm:px-6 py-2 flex items-center justify-between gap-2 border-b border-slate-800/60">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-600/30 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shrink-0">
                <Award className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-xs sm:text-sm text-white truncate">
                    {isEn ? 'Formal Acceptance Letter' : 'خطاب القبول النهائي للنشر المعتمد'}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 shrink-0">
                    {manuscript.id}
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 border border-amber-500/30 font-medium shrink-0">
                    صفحة واحدة A4
                  </span>
                </div>
              </div>
            </div>

            {/* Close Button at top corner */}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 active:bg-slate-700 rounded-lg transition-colors cursor-pointer shrink-0 bg-slate-800/60 border border-slate-700/50"
              aria-label="Close"
              title={isEn ? 'Close' : 'إغلاق'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Action Ribbon - ALL BUTTONS ALWAYS 100% VISIBLE ON MOBILE */}
          <div className="px-3 sm:px-6 py-2 bg-slate-950 flex items-center gap-1.5 sm:gap-2 flex-wrap">
            {/* 1. Print & PDF Button */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-sm transition-colors cursor-pointer shrink-0 ring-1 ring-emerald-500/40"
              title="طباعة الخطاب في صفحة واحدة A4 أو حفظه كـ PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{printSuccessFeedback ? (isEn ? 'Opening...' : 'جارٍ الطباعة...') : (isEn ? 'Print A4' : 'طباعة A4')}</span>
            </button>

            {/* 2. Direct Download HTML / PDF */}
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors cursor-pointer shrink-0"
              title="تحميل نسخة المستند المستقلة بصيغة HTML جاهزة للحفظ كـ PDF"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isEn ? 'Download' : 'تحميل'}</span>
            </button>

            {/* 3. Copy Verification Link */}
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors cursor-pointer shrink-0"
              title="Copy official verification link"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? (isEn ? 'Copied' : 'تم النسخ') : (isEn ? 'Copy' : 'نسخ')}</span>
            </button>

            {/* 4. Barcode Feature Controller (Upload / Auto QR Switcher) */}
            <div className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-lg border border-slate-700 text-xs shrink-0">
              <input
                ref={barcodeFileInputRef}
                type="file"
                accept="image/*"
                onChange={handleBarcodeUpload}
                className="hidden"
              />

              {customBarcodeUrl ? (
                <button
                  type="button"
                  onClick={() => setBarcodeMode(isCustomBarcodeActive ? 'auto_qr' : 'custom_barcode')}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
                    isCustomBarcodeActive
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'bg-slate-700 text-slate-300 hover:text-white'
                  }`}
                  title={isCustomBarcodeActive ? 'التبديل إلى رمز QR التلقائي' : 'تفعيل الباركود المخصص المرفوع'}
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>{isCustomBarcodeActive ? 'مخصص' : 'تلقائي'}</span>
                </button>
              ) : null}

              <button
                type="button"
                onClick={() => barcodeFileInputRef.current?.click()}
                className="flex items-center gap-1 px-2 py-0.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-[11px] font-semibold rounded cursor-pointer transition-colors"
                title="تحميل صورة باركود للمخطوطة (PNG, SVG, JPG)"
              >
                <Upload className="w-3.5 h-3.5 text-amber-400" />
                <span>{customBarcodeUrl ? 'تغيير' : 'تحميل باركود'}</span>
              </button>
            </div>

            {/* 5. Optional Received Date Toggle & Picker */}
            <div className="flex items-center gap-1.5 bg-slate-800 px-2 py-1 rounded-lg border border-slate-700 text-xs shrink-0">
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white select-none">
                <input
                  type="checkbox"
                  checked={showReceivedDate}
                  onChange={(e) => setShowReceivedDate(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                />
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[11px] font-medium">
                  {isEn ? 'Received' : 'الاستلام'}
                </span>
              </label>

              {showReceivedDate && (
                <input
                  type="date"
                  value={receivedDateInput}
                  onChange={(e) => setReceivedDateInput(e.target.value)}
                  className="bg-slate-900 text-slate-200 text-[11px] px-1 py-0.5 rounded border border-slate-600 font-mono"
                  title="تحديد موعد استلام المخطوطة"
                />
              )}
            </div>

            {/* 6. Admin Template Editor Toggle Button */}
            {isAdminOrEditor && (
              <button
                type="button"
                onClick={() => setShowTemplateEditor(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg shadow-xs transition-colors cursor-pointer shrink-0"
                title="تخصيص نص القالب والترويسة والتذييل والشعار والختم والباركود"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>{isEn ? 'Edit Template' : 'تحرير القالب'}</span>
              </button>
            )}

            {/* 7. Language Switcher */}
            <div className="inline-flex rounded-lg border border-slate-700 bg-slate-800 p-0.5 text-xs font-medium shrink-0 ml-auto rtl:mr-auto rtl:ml-0">
              <button
                type="button"
                onClick={() => setLetterLanguage('en')}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                  isEn
                    ? 'bg-emerald-600 text-white font-bold shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Switch to English version"
              >
                <span>EN</span>
              </button>
              <button
                type="button"
                onClick={() => setLetterLanguage('ar')}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                  !isEn
                    ? 'bg-emerald-600 text-white font-bold shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="التحويل إلى النسخة العربية المعتمدة"
              >
                <span>عربي</span>
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Document Container */}
        <div className="overflow-y-auto flex-1 bg-slate-100 p-2 sm:p-5 print:p-0 print:bg-white print:overflow-visible">
          
          {/* Printable Official Paper Canvas (Engineered to strictly fit in 1 single A4 Page) */}
          <div
            ref={printAreaRef}
            dir={isEn ? 'ltr' : 'rtl'}
            className={`a4-acceptance-canvas mx-auto bg-white text-slate-900 shadow-xl border border-slate-300 rounded-xl p-5 sm:p-7 print:shadow-none print:border-none print:rounded-none print:p-0 print:m-0 max-w-[800px] font-serif leading-snug relative ${
              isEn ? 'text-left' : 'text-right'
            }`}
          >
            
            {/* Background Watermark using Loaded Journal Logo */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.035] select-none z-0">
              <JournalLogo className="w-[360px] h-[360px]" />
            </div>

            <div className="relative z-10 flex flex-col justify-between">

              {/* Top Section */}
              <div>
                {/* 1. Header: Banner & Official Journal Identity */}
                <div className="border-b border-emerald-950 pb-2 mb-2 sm:pb-2.5 sm:mb-2.5">
                  <div className="flex items-center justify-between gap-3">
                    
                    {/* Left: Official Journal Identity (Speaking in the name of the Journal) */}
                    <div className="space-y-0.5 max-w-[72%]">
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-900 text-emerald-100 text-[9px] font-sans font-bold uppercase tracking-wider">
                        <span>{isEn ? acceptanceTemplate.headerBadgeEn : acceptanceTemplate.headerBadgeAr}</span>
                      </div>

                      <h1 className="text-lg sm:text-xl font-black text-emerald-950 tracking-tight font-serif uppercase leading-tight">
                        {isEn ? acceptanceTemplate.journalNameEn : acceptanceTemplate.journalNameAr}
                      </h1>
                      
                      <p className="text-[11px] sm:text-xs font-bold text-emerald-800 font-sans leading-tight">
                        {isEn ? acceptanceTemplate.journalNameAr : acceptanceTemplate.journalNameEn} (AASJ)
                      </p>

                      <p className="text-[10px] text-slate-600 font-sans leading-tight">
                        {isEn ? acceptanceTemplate.headerAffiliationEn : acceptanceTemplate.headerAffiliationAr}
                        <br />
                        Web Portal: <span className="font-mono text-emerald-700 font-bold">{acceptanceTemplate.headerPortalUrl}</span>
                      </p>

                      {/* ISSNs & Indexing Badges */}
                      <div className="pt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[9.5px] font-mono font-bold text-slate-700">
                        <span>Print ISSN: {acceptanceTemplate.headerIssnPrint}</span>
                        <span>•</span>
                        <span>Online ISSN: {acceptanceTemplate.headerIssnOnline}</span>
                        <span>•</span>
                        <span>Crossref DOI Prefix: {acceptanceTemplate.headerDoiPrefix}</span>
                      </div>
                    </div>

                    {/* Right: Loaded Official Journal Logo */}
                    <div className="shrink-0 flex flex-col items-center">
                      <div className="p-1.5 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-center">
                        <JournalLogo className="w-14 h-14 sm:w-16 sm:h-16" />
                      </div>
                      <span className="text-[8.5px] font-mono uppercase text-emerald-950 mt-0.5 font-extrabold tracking-wider">
                        AASJ JOURNAL
                      </span>
                      <span className="text-[7.5px] font-sans text-slate-500 font-semibold">
                        Editorial Board
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Formal Reference Header Grid (With Optional Received Date) */}
                <div className={`grid gap-2 bg-slate-50 rounded-lg p-2 border border-slate-200 text-[10px] font-sans mb-2 ${
                  showReceivedDate ? 'grid-cols-2 sm:grid-cols-5' : 'grid-cols-2 sm:grid-cols-4'
                }`}>
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase font-bold tracking-wider">
                      {isEn ? 'Reference Number' : 'الرقم الإشاري الرسمي'}
                    </span>
                    <span className="font-mono font-bold text-emerald-950 text-[10.5px]">
                      {refNumber}
                    </span>
                  </div>

                  {/* Optional Received Date Column */}
                  {showReceivedDate && (
                    <div>
                      <span className="text-slate-500 block text-[9px] uppercase font-bold tracking-wider">
                        {isEn ? 'Received Date' : 'تاريخ الاستلام'}
                      </span>
                      <span className="font-medium text-slate-900 text-[10px]">
                        {isEn ? formattedReceivedDateEn : formattedReceivedDateAr}
                      </span>
                    </div>
                  )}

                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase font-bold tracking-wider">
                      {isEn ? 'Decision Date' : 'تاريخ القرار العلمي'}
                    </span>
                    <span className="font-medium text-slate-900 text-[10px]">
                      {isEn ? formattedDateEn : formattedDateAr}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase font-bold tracking-wider">
                      {isEn ? 'Peer-Review Track' : 'مسار التحكيم المعتمد'}
                    </span>
                    <span className="font-semibold text-emerald-800 text-[10px] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 inline shrink-0" />
                      {isEn ? 'Double-Blind Review' : 'تحكيم مزدوج معتمد'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase font-bold tracking-wider">
                      {isEn ? 'Publication Status' : 'حالة النشر النهائية'}
                    </span>
                    <span className="inline-block px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold text-[9px] border border-emerald-300">
                      {isEn ? 'FINAL ACCEPTANCE' : 'مقبول نهائياً للنشر'}
                    </span>
                  </div>
                </div>

                {/* 3. Recipient Addressee Block */}
                <div className="mb-2 font-sans text-[11px] text-slate-800 border-l-2 rtl:border-l-0 rtl:border-r-2 border-emerald-800 pl-2 rtl:pl-0 rtl:pr-2">
                  <p className="text-[9.5px] text-slate-500 uppercase font-bold tracking-wider">
                    {isEn ? 'To Corresponding Author:' : 'إلى السيد الباحث الرئيسي المنسق:'}
                  </p>
                  <p className="font-bold text-slate-950 text-xs sm:text-sm font-serif">
                    {manuscript.correspondAuthorTitle || 'Dr.'} {manuscript.correspondAuthorFirstName} {manuscript.correspondAuthorLastName}
                  </p>
                  <p className="text-slate-700 text-[10.5px]">
                    {manuscript.correspondAuthorAffiliation || 'Faculty of Agriculture, Assiut, Egypt'}
                  </p>
                  <p className="text-slate-500 font-mono text-[9.5px]">
                    Email: {manuscript.correspondAuthorEmail}
                  </p>
                </div>

                {/* 4. Acceptance Notice Title */}
                <div className="bg-emerald-950 text-white rounded-md py-1 px-3 text-center mb-2 shadow-xs">
                  <h2 className="text-xs sm:text-sm font-bold font-serif tracking-wide uppercase">
                    {isEn ? acceptanceTemplate.letterTitleEn : acceptanceTemplate.letterTitleAr}
                  </h2>
                  <p className="text-[9.5px] text-emerald-200 font-sans">
                    {isEn ? acceptanceTemplate.letterSubtitleEn : acceptanceTemplate.letterSubtitleAr}
                  </p>
                </div>

                {/* 5. Main Body - Speaking strictly in the Name of the Journal */}
                {isEn ? (
                  /* ENGLISH VERSION */
                  <div className="space-y-1.5 text-[10.5px] text-slate-800 text-justify">
                    <p className="font-serif text-xs">
                      {acceptanceTemplate.salutationEn}{' '}
                      <strong>Dr. {manuscript.correspondAuthorLastName}</strong> and Co-authors,
                    </p>

                    <p className="leading-snug">
                      {acceptanceTemplate.openingTextEn}
                    </p>

                    {/* Highlighting Article Card */}
                    <div className="my-1.5 p-2.5 bg-emerald-50/70 border-l-3 border-emerald-800 rounded-r-md font-sans space-y-1 text-[10px]">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-emerald-900 tracking-wider block">
                          Manuscript Title:
                        </span>
                        <p className="font-serif font-bold text-slate-950 text-xs sm:text-[13px] leading-tight italic mt-0.5">
                          "{manuscript.articleTitle}"
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-0.5 pt-1.5 border-t border-emerald-200/80 text-[10px]">
                        <div>
                          <strong className="text-slate-700">Manuscript ID:</strong>{' '}
                          <span className="font-mono font-bold text-emerald-950">{manuscript.id}</span>
                        </div>
                        <div>
                          <strong className="text-slate-700">Authors:</strong>{' '}
                          <span>{manuscript.authorsNames || `${manuscript.firstAuthorFullName}, et al.`}</span>
                        </div>
                        <div>
                          <strong className="text-slate-700">Subject Discipline:</strong>{' '}
                          <span>{manuscript.subjectsRelated?.join(', ') || 'Agricultural & Biological Sciences'}</span>
                        </div>
                        <div>
                          <strong className="text-slate-700">Assigned DOI:</strong>{' '}
                          <span className="font-mono text-emerald-800 font-bold">
                            {manuscript.doi ? `https://doi.org/${manuscript.doi}` : `https://doi.org/${acceptanceTemplate.headerDoiPrefix}.${currentYear}.${manuscript.id.replace('AASJ-', '')}`}
                          </span>
                        </div>

                        {showReceivedDate && (
                          <div>
                            <strong className="text-slate-700">Received Date:</strong>{' '}
                            <span>{formattedReceivedDateEn}</span>
                          </div>
                        )}

                        <div>
                          <strong className="text-slate-700">Scheduled Appearance:</strong>{' '}
                          <span>Volume {manuscript.volume || 8}, Issue {manuscript.issue || 1} ({manuscript.publishedYear || currentYear})</span>
                        </div>
                        <div>
                          <strong className="text-slate-700">Editorial Track:</strong>{' '}
                          <span className="text-emerald-900 font-bold">Accepted Unconditionally (Final Clear)</span>
                        </div>
                      </div>
                    </div>

                    <p className="leading-snug">
                      {acceptanceTemplate.evaluationEn}
                    </p>

                    {/* Production & Publication Next Steps */}
                    <div className="bg-slate-50 border border-slate-200 rounded-md p-2 space-y-1 font-sans text-[10px]">
                      <h3 className="font-bold text-emerald-950 flex items-center gap-1.5 text-[10px] uppercase tracking-wide">
                        <FileCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                        <span>Production Pipeline & Next Publication Milestones:</span>
                      </h3>
                      <ol className="list-decimal list-inside space-y-0.5 text-slate-700 pl-1 leading-tight text-[9.5px]">
                        {acceptanceTemplate.milestonesEn.map((step, idx) => (
                          <li key={idx}>{step}</li>
                        ))}
                      </ol>
                    </div>

                    <p className="text-[9.5px] text-slate-600 font-sans italic leading-tight">
                      On behalf of the Editorial Board and Scientific Committee of the Archives of Agriculture Sciences Journal (AASJ), we congratulate you on this noteworthy scientific achievement and appreciate your choosing AASJ for publishing your research.
                    </p>
                  </div>
                ) : (
                  /* ARABIC VERSION */
                  <div className="space-y-1.5 text-[10.5px] text-slate-800 text-justify font-sans">
                    <p className="text-xs font-bold text-slate-950">
                      {acceptanceTemplate.salutationAr}{' '}
                      <strong>{manuscript.correspondAuthorFirstName} {manuscript.correspondAuthorLastName}</strong>،،،
                    </p>

                    <p className="leading-snug">
                      {acceptanceTemplate.openingTextAr}
                    </p>

                    <div className="py-1 px-2 bg-emerald-100 text-emerald-950 font-bold text-center rounded border border-emerald-300 text-xs">
                      «القبول النهائي والبات لنشر البحث العلمي بمجلة أرشيف العلوم الزراعية (AASJ)»
                    </div>

                    {/* بطاقة بيانات البحث بالعربية */}
                    <div className="my-1.5 p-2.5 bg-emerald-50/70 border-r-3 border-emerald-800 rounded-l-md space-y-1 text-[10px]">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-emerald-900 block mb-0.5">
                          عنوان البحث المعتمد للنشر:
                        </span>
                        <p className="font-serif font-bold text-slate-950 text-xs sm:text-[13px] leading-tight italic">
                          "{manuscript.articleTitle}"
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-0.5 pt-1.5 border-t border-emerald-200/80 text-[10px]">
                        <div>
                          <strong className="text-slate-700">كود المخطوطة:</strong>{' '}
                          <span className="font-mono font-bold text-emerald-950">{manuscript.id}</span>
                        </div>
                        <div>
                          <strong className="text-slate-700">الباحث الرئيسي / المشاركون:</strong>{' '}
                          <span>{manuscript.authorsNames || manuscript.firstAuthorFullName}</span>
                        </div>
                        <div>
                          <strong className="text-slate-700">التخصص العلمي:</strong>{' '}
                          <span>{manuscript.subjectsRelated?.join('، ') || 'العلوم الزراعية والتطبيقية'}</span>
                        </div>
                        <div>
                          <strong className="text-slate-700">المُعرّف الرقمي الدولي (DOI):</strong>{' '}
                          <span className="font-mono text-emerald-800 font-bold" dir="ltr">
                            {manuscript.doi ? `https://doi.org/${manuscript.doi}` : `${acceptanceTemplate.headerDoiPrefix}.${currentYear}.${manuscript.id.replace('AASJ-', '')}`}
                          </span>
                        </div>

                        {showReceivedDate && (
                          <div>
                            <strong className="text-slate-700">تاريخ استلام البحث:</strong>{' '}
                            <span>{formattedReceivedDateAr}</span>
                          </div>
                        )}

                        <div>
                          <strong className="text-slate-700">العدد والمجلد المخصص للنشر:</strong>{' '}
                          <span>المجلد ({manuscript.volume || 8})، العدد ({manuscript.issue || 1})، لعام {manuscript.publishedYear || currentYear}م</span>
                        </div>
                        <div>
                          <strong className="text-slate-700">حالة الإجازة العلمية:</strong>{' '}
                          <span className="text-emerald-900 font-bold">مستوفٍ لكافة معايير اللجان العلمية الدائمة</span>
                        </div>
                      </div>
                    </div>

                    <p className="leading-snug">
                      {acceptanceTemplate.evaluationAr}
                    </p>

                    {/* مراحل النشر */}
                    <div className="bg-slate-50 border border-slate-200 rounded-md p-2 space-y-1 text-[10px]">
                      <h3 className="font-bold text-emerald-950 flex items-center gap-1.5 text-[10px]">
                        <FileCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                        <span>مراحل الإنتاج والنشر الأكاديمي المعتمدة:</span>
                      </h3>
                      <ol className="list-decimal list-inside space-y-0.5 text-slate-700 pr-1 leading-tight text-[9.5px]">
                        {acceptanceTemplate.milestonesAr.map((step, idx) => (
                          <li key={idx}>{step}</li>
                        ))}
                      </ol>
                    </div>

                    <div className="p-1.5 bg-slate-50 border border-slate-200 rounded text-[9.5px] leading-snug text-slate-700">
                      <p>
                        <strong>ملاحظة رسمية:</strong> تمنح هذه الإفادة الرسمية بناءً على طلب الباحث لتقديمها إلى اللجان العلمية الدائمة للترقيات، وإدارات الدراسات العليا والبحوث، والجهات الأكاديمية المختصة، وتعتبر وثيقة معتمدة وموثقة برمز باركود ورقم مرجعي دولي.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Section: Signatures & Verification Authority (Dual signatories + Journal Seal + Barcode/QR) */}
              <div className="mt-3 pt-2 border-t border-slate-300">
                <div className="flex items-center justify-between gap-3 font-sans">
                  
                  {/* Left Signatory: Editor-in-Chief of the Journal */}
                  <div className="text-left rtl:text-right space-y-0.5 text-[10px] min-w-[130px]">
                    <div className="h-7 flex items-center justify-start">
                      <span className="font-serif italic text-base font-bold text-emerald-950">
                        {acceptanceTemplate.signatory1Name}
                      </span>
                    </div>
                    <p className="font-bold text-slate-900 text-xs">
                      {isEn ? acceptanceTemplate.signatory1Name : acceptanceTemplate.signatory1NameAr}
                    </p>
                    <p className="text-emerald-900 font-semibold text-[9.5px]">
                      {isEn ? acceptanceTemplate.signatory1Title : acceptanceTemplate.signatory1TitleAr}
                    </p>
                    <p className="text-slate-500 text-[9px]">
                      {acceptanceTemplate.journalNameEn} (AASJ)
                    </p>
                  </div>

                  {/* Center: Official Journal Seal (Supports Uploaded Custom Seal or Vector Seal) */}
                  <div className="shrink-0 flex flex-col items-center">
                    <JournalSeal
                      id={manuscript.id}
                      className="w-18 h-18 sm:w-20 sm:h-20"
                      sealTextTop={acceptanceTemplate.sealTextTop}
                      sealTextCenter={acceptanceTemplate.sealTextCenter}
                      sealTextBottom={acceptanceTemplate.sealTextBottom}
                    />
                  </div>

                  {/* Right: Barcode / QR Code Verification Container */}
                  <div className="flex flex-col items-end rtl:items-start text-right rtl:text-left space-y-0.5 text-[10px] min-w-[130px]">
                    
                    {/* Fixed & Proportionate Barcode / QR Box */}
                    <div className="w-28 sm:w-32 h-16 sm:h-18 bg-white border border-slate-300 rounded-lg p-1 shadow-xs flex items-center justify-center overflow-hidden relative group">
                      {isCustomBarcodeActive ? (
                        <img
                          src={customBarcodeUrl!}
                          alt="Official Acceptance Barcode"
                          className="max-w-full max-h-full object-contain"
                        />
                      ) : qrSvg ? (
                        <div
                          className="w-full h-full flex items-center justify-center [&_svg]:w-full [&_svg]:h-full [&_svg]:block"
                          dangerouslySetInnerHTML={{ __html: qrSvg }}
                          title="Scan to verify official acceptance document online"
                        />
                      ) : (
                        <QrCode className="w-8 h-8 text-slate-400 animate-pulse" />
                      )}

                      {/* On-screen quick upload/toggle hover overlay (hidden in print) */}
                      {isAdminOrEditor && (
                        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-2xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 print:hidden p-1">
                          <button
                            type="button"
                            onClick={() => barcodeFileInputRef.current?.click()}
                            className="p-1 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded text-[9px] font-bold flex items-center gap-0.5 shadow-xs cursor-pointer"
                            title="تحميل صورة باركود"
                          >
                            <Upload className="w-3 h-3" />
                            <span>رفع</span>
                          </button>

                          {customBarcodeUrl && (
                            <button
                              type="button"
                              onClick={() => setBarcodeMode(isCustomBarcodeActive ? 'auto_qr' : 'custom_barcode')}
                              className="p-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-[9px] font-bold flex items-center gap-0.5 shadow-xs cursor-pointer"
                              title={isCustomBarcodeActive ? 'التبديل إلى QR التلقائي' : 'التبديل إلى الباركود المخصص'}
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>{isCustomBarcodeActive ? 'QR' : 'باركود'}</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    <span className="text-[9px] font-mono text-emerald-950 font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-600 inline shrink-0" />
                      <span>
                        {isCustomBarcodeActive
                          ? (isEn ? 'Official Barcode Verification' : 'باركود التحقق المعتمد')
                          : (isEn ? 'Scan to Verify' : 'امسح للتحقق')}
                      </span>
                    </span>
                    <p className="text-[9px] text-slate-500 font-mono">
                      Ref: {refNumber.split('/').slice(-2).join('/')}
                    </p>
                  </div>

                </div>

                {/* 6. Editable Footer Section */}
                <div className="mt-2 pt-1 border-t border-slate-200 text-[9px] text-slate-500 font-sans flex flex-wrap items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-700">Digital Security Hash:</span>
                    <span className="font-mono text-slate-600">
                      {acceptanceTemplate.footerSecurityHashText}:{manuscript.id}-{currentYear}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600">
                      {acceptanceTemplate.footerPortalText}: <a href={acceptanceTemplate.headerPortalUrl} target="_blank" rel="noreferrer" className="text-emerald-700 underline font-mono">{acceptanceTemplate.headerPortalUrl.replace('https://', '')}</a>
                    </span>
                    <span>•</span>
                    <span className="font-bold text-emerald-900">Page 1 of 1</span>
                  </div>
                </div>

                {/* 7. Editable Footer Notice */}
                <div className="mt-0.5 text-[8px] sm:text-[8.5px] text-slate-400 text-center font-sans border-t border-slate-100 pt-0.5">
                  {isEn ? acceptanceTemplate.footerNoticeEn : acceptanceTemplate.footerNoticeAr}
                </div>

              </div>

            </div>
          </div>
        </div>

      </div>

      {/* Admin Template Editor Modal */}
      {showTemplateEditor && (
        <AdminTemplateEditorModal
          initialTab="acceptance"
          onClose={() => setShowTemplateEditor(false)}
        />
      )}
    </div>
  );
};
