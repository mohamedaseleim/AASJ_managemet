import React, { useRef, useState, useEffect } from 'react';
import {
  Award,
  Download,
  Printer,
  X,
  CheckCircle2,
  QrCode,
  Calendar,
  Building,
  UserCheck,
  ShieldCheck,
  Sliders,
  FileCheck,
} from 'lucide-react';
import { ReviewerProfile, Manuscript } from '../types/journal';
import { useAuth } from '../context/AuthContext';
import { useTemplate } from '../context/TemplateContext';
import { JournalLogo } from './JournalLogo';
import { JournalSeal } from './JournalSeal';
import { generateCertificateQRCodeSvg } from '../utils/qrCode';
import { printDocumentContent, downloadDocumentAsHtml } from '../utils/printDocument';
import { AdminTemplateEditorModal } from './AdminTemplateEditorModal';

interface ReviewerCertificateModalProps {
  reviewer: ReviewerProfile;
  manuscript?: Manuscript;
  onClose: () => void;
}

export const ReviewerCertificateModal: React.FC<ReviewerCertificateModalProps> = ({
  reviewer,
  manuscript,
  onClose,
}) => {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [qrSvg, setQrSvg] = useState<string>('');
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [printSuccessFeedback, setPrintSuccessFeedback] = useState(false);
  const { currentUser } = useAuth();
  const { certificateTemplate } = useTemplate();

  const isAdminOrEditor =
    !currentUser ||
    ['admin', 'general_supervisor', 'editor_in_chief', 'managing_editor', 'executive_editor', 'secretary'].includes(
      currentUser.role
    );

  // Generate certificate reference number
  const certNumber = `AASJ-CERT-${new Date().getFullYear()}-${reviewer.id.slice(-4).toUpperCase()}`;
  const issueDate = new Date().toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const issueDateEn = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  useEffect(() => {
    generateCertificateQRCodeSvg({
      serial: certNumber,
      reviewerName: reviewer.name,
      reviewerId: reviewer.id,
      affiliation: reviewer.affiliation || 'جامعة الأزهر',
      manuscriptId: manuscript?.id,
      manuscriptTitle: manuscript?.articleTitle,
      issueDate: new Date().toISOString().split('T')[0],
      verifiedBy: 'Archives of Agriculture Sciences Journal (AASJ) Editorial Board',
    }).then((svg) => setQrSvg(svg));
  }, [certNumber, reviewer, manuscript]);

  // Robust isolated iframe printing that formats cleanly in landscape A4
  const handlePrint = () => {
    const success = printDocumentContent(certificateRef.current, {
      title: `${certNumber} - Reviewer Certificate - AASJ`,
      orientation: 'landscape',
      dir: 'rtl',
    });
    if (success) {
      setPrintSuccessFeedback(true);
      setTimeout(() => setPrintSuccessFeedback(false), 3000);
    }
  };

  const handleDownload = () => {
    downloadDocumentAsHtml(
      certificateRef.current,
      `AASJ-Reviewer-Certificate-${reviewer.name.replace(/\s+/g, '_')}`,
      {
        title: `${certNumber} - Reviewer Appreciation Certificate - AASJ`,
        orientation: 'landscape',
        dir: 'rtl',
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/75 backdrop-blur-xs p-1 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden my-1 sm:my-auto border border-slate-200 flex flex-col max-h-[96dvh] sm:max-h-[94vh]">
        
        {/* Top Control Bar - Sticky & shrink-0 */}
        <div className="bg-slate-900 text-white print:hidden border-b border-slate-800 shrink-0 sticky top-0 z-20 shadow-md">
          {/* Top Row: Title & Close Button */}
          <div className="px-3 sm:px-6 py-2 flex items-center justify-between gap-2 border-b border-slate-800/60">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center border border-amber-400/30 shrink-0">
                <Award className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
              </div>
              <div className="min-w-0">
                <span className="font-bold text-xs sm:text-sm text-white truncate block">
                  شهادة تحكيم معتمدة | Reviewer Certificate
                </span>
                <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">
                  مجلة أرشيف العلوم الزراعية (AASJ) · هيئة التحرير
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 active:bg-slate-700 rounded-lg transition-colors cursor-pointer shrink-0 bg-slate-800/60 border border-slate-700/50"
              aria-label="Close"
              title="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Action Row - ALL BUTTONS ALWAYS 100% VISIBLE ON MOBILE */}
          <div className="px-3 sm:px-6 py-2 bg-slate-950 flex items-center gap-1.5 sm:gap-2 flex-wrap">
            {/* Print & PDF Button */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs transition-colors cursor-pointer shrink-0 ring-1 ring-emerald-400/40"
              title="طباعة الشهادة مباشرة أو حفظها بصيغة PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{printSuccessFeedback ? 'جارٍ الطباعة...' : 'طباعة / حفظ PDF'}</span>
            </button>

            {/* Direct Download HTML File - Visible on mobile */}
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs rounded-lg transition-colors cursor-pointer shrink-0"
              title="تحميل نسخة المستند المستقلة"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>تحميل المستند</span>
            </button>

            {/* Admin Template Editor Toggle Button */}
            {isAdminOrEditor && (
              <button
                type="button"
                onClick={() => setShowTemplateEditor(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg shadow-xs transition-colors cursor-pointer shrink-0 ml-auto rtl:mr-auto rtl:ml-0"
                title="تخصيص نص قالب الشهادة والموقّعين والشعار (Admin Template Editor)"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>تحرير قالب الشهادة</span>
              </button>
            )}
          </div>
        </div>

        {/* Certificate Container (A4 Printable Area) */}
        <div className="overflow-y-auto flex-1 p-2 sm:p-6 bg-slate-100">
          <div
            ref={certificateRef}
            dir="rtl"
            className="certificate-print-container p-6 md:p-10 bg-radial from-amber-50/40 via-white to-amber-50/20 text-slate-900 shadow-xl border border-slate-300 rounded-xl max-w-4xl mx-auto"
          >
            {/* Certificate Double Border Frame */}
            <div className="border-4 border-amber-600/70 p-1 rounded-2xl shadow-inner">
              <div className="border-2 border-dashed border-emerald-800/60 p-6 md:p-8 rounded-xl bg-white relative overflow-hidden">
                
                {/* Background Watermark using Loaded Journal Logo */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.035]">
                  <JournalLogo className="w-96 h-96" />
                </div>

                {/* Certificate Header - Speaking strictly in the Name of the Journal */}
                <div className="flex items-center justify-between pb-6 border-b border-amber-200/80 relative z-10">
                  <div className="text-right space-y-0.5">
                    <h3 className="text-sm font-extrabold text-emerald-950 font-serif">
                      مجلة أرشيف العلوم الزراعية
                    </h3>
                    <h4 className="text-xs font-bold text-emerald-800">
                      هيئة التحرير والمراجعة العلمية
                    </h4>
                    <p className="text-2xs font-semibold text-slate-600">
                      كلية الزراعة بأسيوط (المقر الأكاديمي)
                    </p>
                    <p className="text-3xs font-mono text-amber-800 font-bold">
                      Print ISSN: 2535-1680 | Online: 2535-1699
                    </p>
                  </div>

                  {/* Center Loaded Official Journal Logo */}
                  <div className="flex flex-col items-center">
                    <div className="p-2 rounded-2xl bg-white border border-emerald-200 shadow-xs mb-1">
                      <JournalLogo className="w-16 h-16" />
                    </div>
                    <span className="text-2xs font-extrabold text-emerald-950 tracking-wider">
                      AASJ JOURNAL
                    </span>
                  </div>

                  <div className="text-left space-y-0.5" dir="ltr">
                    <h3 className="text-sm font-extrabold text-emerald-950 font-serif">
                      Archives of Agriculture Sciences
                    </h3>
                    <h4 className="text-xs font-bold text-emerald-800">
                      Editorial & Peer-Review Board
                    </h4>
                    <p className="text-2xs font-semibold text-slate-600">
                      Published with Egyptian Knowledge Bank
                    </p>
                    <p className="text-3xs font-mono text-emerald-700 font-bold">
                      https://aasj.journals.ekb.eg
                    </p>
                  </div>
                </div>

                {/* Certificate Title */}
                <div className="text-center my-6 relative z-10">
                  <div className="inline-flex items-center justify-center gap-2 px-6 py-1.5 bg-gradient-to-r from-emerald-800 via-emerald-900 to-emerald-800 text-amber-300 rounded-full shadow-md mb-2">
                    <Award className="w-5 h-5 text-amber-400" />
                    <span className="text-base md:text-lg font-extrabold tracking-wide">
                      {certificateTemplate.titleAr}
                    </span>
                  </div>
                  <p className="text-2xs font-bold text-slate-500 tracking-widest uppercase font-mono">
                    {certificateTemplate.titleEn}
                  </p>
                </div>

                {/* Certificate Body - Speaking in the Name of the Journal */}
                <div className="text-center space-y-4 my-6 px-4 md:px-12 relative z-10">
                  <p className="text-xs md:text-sm text-slate-700 leading-relaxed font-medium">
                    {certificateTemplate.introTextAr}
                  </p>

                  <div className="py-2.5 px-6 inline-block bg-amber-50/80 border-b-2 border-amber-500 rounded-lg shadow-xs">
                    <h2 className="text-lg md:text-2xl font-black text-emerald-950 tracking-normal font-serif">
                      {reviewer.name}
                    </h2>
                    <p className="text-xs font-semibold text-slate-600 mt-0.5">
                      {reviewer.affiliation} — قسم {reviewer.specialization || reviewer.major || 'العلوم الزراعية'}
                    </p>
                  </div>

                  <p className="text-xs md:text-sm text-slate-700 leading-relaxed max-w-2xl mx-auto">
                    {certificateTemplate.bodyTextAr}
                  </p>

                  {manuscript && (
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/90 text-xs text-slate-700 max-w-xl mx-auto text-right">
                      <span className="font-bold text-emerald-900 block mb-1">بيانات البحث المحكّم (Research Details):</span>
                      <p className="font-medium text-slate-800">
                        <strong>كود البحث:</strong> {manuscript.id}
                      </p>
                      <p className="font-medium text-slate-800 line-clamp-1">
                        <strong>عنوان البحث:</strong> {manuscript.articleTitle}
                      </p>
                    </div>
                  )}
                </div>

                {/* Signatures & Seal Section (Journal Authority) */}
                <div className="mt-8 pt-6 border-t border-amber-200/80 grid grid-cols-3 items-center text-center relative z-10">
                  
                  {/* Editor-in-Chief of the Journal */}
                  <div className="flex flex-col items-center">
                    <p className="text-2xs text-slate-500 font-bold mb-1">
                      {certificateTemplate.signatory1TitleAr}
                    </p>
                    <p className="text-xs font-extrabold text-emerald-950 font-serif">
                      {certificateTemplate.signatory1NameAr}
                    </p>
                    <div className="h-9 flex items-center justify-center italic text-2xs text-emerald-800 font-serif">
                      {certificateTemplate.signatory1Name}
                    </div>
                    <span className="text-3xs text-slate-400 font-mono">
                      {certificateTemplate.signatory1Title}
                    </span>
                  </div>

                  {/* Official Journal Seal (Supports Uploaded Custom Seal or Vector Seal) */}
                  <div className="flex flex-col items-center">
                    <JournalSeal
                      id={certNumber}
                      className="w-24 h-24"
                      sealTextTop={certificateTemplate.issuingBodyAr}
                      sealTextCenter="AASJ EDITORIAL BOARD"
                      sealTextBottom="OFFICIAL REVIEW CERTIFICATION"
                    />
                    <div className="mt-2 w-16 h-16 bg-white border border-slate-300 rounded-lg p-1 shadow-2xs flex items-center justify-center overflow-hidden">
                      {qrSvg ? (
                        <div
                          className="w-full h-full flex items-center justify-center [&_svg]:w-full [&_svg]:h-full [&_svg]:block"
                          dangerouslySetInnerHTML={{ __html: qrSvg }}
                          title="مسح رمز التحقق الرقمي"
                        />
                      ) : (
                        <QrCode className="w-8 h-8 text-emerald-900" />
                      )}
                    </div>
                    <span className="text-[9px] font-mono text-slate-500 font-bold mt-0.5">{certNumber}</span>
                  </div>

                  {/* Managing Editor of the Journal */}
                  <div className="flex flex-col items-center">
                    <p className="text-2xs text-slate-500 font-bold mb-1">
                      {certificateTemplate.signatory2TitleAr}
                    </p>
                    <p className="text-xs font-extrabold text-emerald-950 font-serif">
                      {certificateTemplate.signatory2NameAr}
                    </p>
                    <div className="h-9 flex items-center justify-center italic text-2xs text-emerald-800 font-serif">
                      {certificateTemplate.signatory2Name}
                    </div>
                    <span className="text-3xs text-slate-400 font-mono">
                      {certificateTemplate.signatory2Title}
                    </span>
                  </div>
                </div>

                {/* Certificate Footer Metadata - Speaking in the Name of the Journal */}
                <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-3xs text-slate-500">
                  <span>تاريخ الإصدار: {issueDate} م ({issueDateEn})</span>
                  <span>رابط التحقق الإلكتروني: aasj.journals.ekb.eg/verify/{reviewer.id}</span>
                  <span>وثيقة تحكيم رسمية صادرة ومعتمدة من مجلس إدارة مجلة أرشيف العلوم الزراعية (AASJ)</span>
                </div>

              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Admin Template Editor Modal */}
      {showTemplateEditor && (
        <AdminTemplateEditorModal
          initialTab="certificate"
          onClose={() => setShowTemplateEditor(false)}
        />
      )}
    </div>
  );
};
