import React, { useState } from 'react';
import {
  X,
  Save,
  RotateCcw,
  Check,
  FileText,
  Award,
  Image as ImageIcon,
  Upload,
  Trash2,
  Sliders,
  ShieldCheck,
  Stamp,
  Heading,
  Calendar,
  QrCode,
} from 'lucide-react';
import { useTemplate } from '../context/TemplateContext';
import { JournalLogo } from './JournalLogo';
import { JournalSeal } from './JournalSeal';

interface AdminTemplateEditorModalProps {
  initialTab?: 'acceptance' | 'header_footer' | 'certificate' | 'logo_seal';
  onClose: () => void;
}

export const AdminTemplateEditorModal: React.FC<AdminTemplateEditorModalProps> = ({
  initialTab = 'acceptance',
  onClose,
}) => {
  const {
    acceptanceTemplate,
    certificateTemplate,
    customLogoUrl,
    customSealUrl,
    customBarcodeUrl,
    barcodeMode,
    updateAcceptanceTemplate,
    updateCertificateTemplate,
    setCustomLogoUrl,
    setCustomSealUrl,
    setCustomBarcodeUrl,
    setBarcodeMode,
    resetAcceptanceTemplate,
    resetCertificateTemplate,
  } = useTemplate();

  const [activeTab, setActiveTab] = useState<'acceptance' | 'header_footer' | 'certificate' | 'logo_seal'>(initialTab);
  const [accForm, setAccForm] = useState({ ...acceptanceTemplate });
  const [certForm, setCertForm] = useState({ ...certificateTemplate });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveAcceptance = (e: React.FormEvent) => {
    e.preventDefault();
    updateAcceptanceTemplate(accForm);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleSaveCertificate = (e: React.FormEvent) => {
    e.preventDefault();
    updateCertificateTemplate(certForm);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('حجم الصورة كبير جداً، يرجى اختيار صورة أقل من 2 ميجابايت');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setCustomLogoUrl(result);
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 2500);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSealUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('حجم الختم كبير جداً، يرجى اختيار صورة أقل من 2 ميجابايت (يفضل PNG شفاف)');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setCustomSealUrl(result);
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 2500);
      };
      reader.readAsDataURL(file);
    }
  };

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
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 2500);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetCurrent = () => {
    if (activeTab === 'acceptance' || activeTab === 'header_footer') {
      if (confirm('هل أنت متأكد من استعادة النموذج الافتراضي لخطاب القبول والترويسة والتذييل؟')) {
        resetAcceptanceTemplate();
        setAccForm({ ...acceptanceTemplate });
      }
    } else if (activeTab === 'certificate') {
      if (confirm('هل أنت متأكد من استعادة النموذج الافتراضي لشهادة التحكيم؟')) {
        resetCertificateTemplate();
        setCertForm({ ...certificateTemplate });
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-slate-950/80 backdrop-blur-xs p-1 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-4xl overflow-hidden my-1 sm:my-auto flex flex-col max-h-[96dvh] sm:max-h-[94vh]">
        
        {/* Header - Sticky & shrink-0 */}
        <div className="p-3 sm:px-6 sm:py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 gap-2 flex-wrap sm:flex-nowrap shrink-0 sticky top-0 z-20 shadow-md">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="p-1.5 sm:p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
              <Sliders className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-xs sm:text-base text-white flex items-center gap-1.5 flex-wrap">
                <span className="truncate">تخصيص القوالب والوثائق الرسمية</span>
                <span className="text-[9px] sm:text-[10px] bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-full shrink-0">
                  صلاحيات الإدارة
                </span>
              </h2>
              <p className="text-[10px] sm:text-xs text-slate-400 truncate">
                تعديل الصياغة، الترويسة والتذييل، الموقّعين، الشعار، الختم والباركود
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 ml-auto rtl:mr-auto rtl:ml-0">
            {savedSuccess && (
              <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg border border-emerald-500/40 flex items-center gap-1.5 animate-pulse">
                <Check className="w-3.5 h-3.5" />
                <span>تم الحفظ</span>
              </span>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 active:bg-slate-700 rounded-lg transition-colors cursor-pointer shrink-0 bg-slate-800/60 border border-slate-700/50"
              title="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="bg-slate-100 px-3 sm:px-6 py-2 border-b border-slate-200 flex items-center gap-2 text-xs font-bold overflow-x-auto no-scrollbar shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('acceptance')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all shrink-0 ${
              activeTab === 'acceptance'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>متن خطاب القبول (Acceptance Text)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('header_footer')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all shrink-0 ${
              activeTab === 'header_footer'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <Heading className="w-4 h-4" />
            <span>الترويسة والتذييل (Header & Footer)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('certificate')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all shrink-0 ${
              activeTab === 'certificate'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>شهادة التحكيم (Reviewer Certificate)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('logo_seal')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all shrink-0 ${
              activeTab === 'logo_seal'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <Stamp className="w-4 h-4 text-amber-400" />
            <span>الشعار والختم والباركود (Logo, Seal & Barcode)</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 text-sm text-slate-800">
          
          {/* TAB 1: ACCEPTANCE LETTER BODY */}
          {activeTab === 'acceptance' && (
            <form onSubmit={handleSaveAcceptance} className="space-y-6">
              
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-950 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <p>
                  <strong>المعايير المعتمدة:</strong> يتم التحدث باسم <strong>مجلة أرشيف العلوم الزراعية (AASJ)</strong> وهيئة تحريرها كجهة إصدار رسمية مستقلة، مع إمكانية تعديل صيغ الخطاب باللغتين الإنجليزية والعربية والموقّعين.
                </p>
              </div>

              {/* Journal Names */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    اسم المجلة بالإنجليزية (Journal Name - EN)
                  </label>
                  <input
                    type="text"
                    value={accForm.journalNameEn}
                    onChange={(e) => setAccForm({ ...accForm, journalNameEn: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-sans"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    اسم المجلة بالعربية (Journal Name - AR)
                  </label>
                  <input
                    type="text"
                    value={accForm.journalNameAr}
                    onChange={(e) => setAccForm({ ...accForm, journalNameAr: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-sans"
                    required
                  />
                </div>
              </div>

              {/* Titles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    عنوان الخطاب بالإنجليزية (Letter Title - EN)
                  </label>
                  <input
                    type="text"
                    value={accForm.letterTitleEn}
                    onChange={(e) => setAccForm({ ...accForm, letterTitleEn: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-sans"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    عنوان الخطاب بالعربية (Letter Title - AR)
                  </label>
                  <input
                    type="text"
                    value={accForm.letterTitleAr}
                    onChange={(e) => setAccForm({ ...accForm, letterTitleAr: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-sans"
                  />
                </div>
              </div>

              {/* Salutations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    صيغة المخاطبة بالإنجليزية (Salutation - EN)
                  </label>
                  <input
                    type="text"
                    value={accForm.salutationEn}
                    onChange={(e) => setAccForm({ ...accForm, salutationEn: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-sans"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    صيغة المخاطبة بالعربية (Salutation - AR)
                  </label>
                  <input
                    type="text"
                    value={accForm.salutationAr}
                    onChange={(e) => setAccForm({ ...accForm, salutationAr: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-sans"
                  />
                </div>
              </div>

              {/* Opening Statement */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    البيان الافتتاحي للقبول باسم المجلة (Opening Decision Statement - EN)
                  </label>
                  <textarea
                    rows={3}
                    value={accForm.openingTextEn}
                    onChange={(e) => setAccForm({ ...accForm, openingTextEn: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-sans"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    البيان الافتتاحي للقبول باسم المجلة (Opening Decision Statement - AR)
                  </label>
                  <textarea
                    rows={3}
                    value={accForm.openingTextAr}
                    onChange={(e) => setAccForm({ ...accForm, openingTextAr: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-sans"
                  />
                </div>
              </div>

              {/* Scientific Evaluation Paragraph */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    فقرة الإشادة والتقييم الأكاديمي (Academic Commendation - EN)
                  </label>
                  <textarea
                    rows={2}
                    value={accForm.evaluationEn}
                    onChange={(e) => setAccForm({ ...accForm, evaluationEn: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-sans"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    فقرة الإشادة والتقييم الأكاديمي (Academic Commendation - AR)
                  </label>
                  <textarea
                    rows={2}
                    value={accForm.evaluationAr}
                    onChange={(e) => setAccForm({ ...accForm, evaluationAr: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-sans"
                  />
                </div>
              </div>

              {/* Signatories */}
              <div className="border-t border-slate-200 pt-4">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                  بيانات الموقّعين الرسميين على الخطاب
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Signatory 1: Editor-in-Chief */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                    <span className="text-[11px] font-bold text-emerald-950 block">الموقّع الأول (رئيس التحرير):</span>
                    <div>
                      <label className="text-[10px] text-slate-500 block">الاسم بالإنجليزية</label>
                      <input
                        type="text"
                        value={accForm.signatory1Name}
                        onChange={(e) => setAccForm({ ...accForm, signatory1Name: e.target.value })}
                        className="w-full px-2 py-1 text-xs border rounded"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 block">الصفة التحريرية بالإنجليزية</label>
                      <input
                        type="text"
                        value={accForm.signatory1Title}
                        onChange={(e) => setAccForm({ ...accForm, signatory1Title: e.target.value })}
                        className="w-full px-2 py-1 text-xs border rounded"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 block">الاسم بالعربية</label>
                      <input
                        type="text"
                        value={accForm.signatory1NameAr}
                        onChange={(e) => setAccForm({ ...accForm, signatory1NameAr: e.target.value })}
                        className="w-full px-2 py-1 text-xs border rounded"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 block">الصفة التحريرية بالعربية</label>
                      <input
                        type="text"
                        value={accForm.signatory1TitleAr}
                        onChange={(e) => setAccForm({ ...accForm, signatory1TitleAr: e.target.value })}
                        className="w-full px-2 py-1 text-xs border rounded"
                      />
                    </div>
                  </div>

                  {/* Signatory 2: Managing Editor */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                    <span className="text-[11px] font-bold text-emerald-950 block">الموقّع الثاني (مدير التحرير):</span>
                    <div>
                      <label className="text-[10px] text-slate-500 block">الاسم بالإنجليزية</label>
                      <input
                        type="text"
                        value={accForm.signatory2Name}
                        onChange={(e) => setAccForm({ ...accForm, signatory2Name: e.target.value })}
                        className="w-full px-2 py-1 text-xs border rounded"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 block">الصفة التحريرية بالإنجليزية</label>
                      <input
                        type="text"
                        value={accForm.signatory2Title}
                        onChange={(e) => setAccForm({ ...accForm, signatory2Title: e.target.value })}
                        className="w-full px-2 py-1 text-xs border rounded"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 block">الاسم بالعربية</label>
                      <input
                        type="text"
                        value={accForm.signatory2NameAr}
                        onChange={(e) => setAccForm({ ...accForm, signatory2NameAr: e.target.value })}
                        className="w-full px-2 py-1 text-xs border rounded"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 block">الصفة التحريرية بالعربية</label>
                      <input
                        type="text"
                        value={accForm.signatory2TitleAr}
                        onChange={(e) => setAccForm({ ...accForm, signatory2TitleAr: e.target.value })}
                        className="w-full px-2 py-1 text-xs border rounded"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={handleResetCurrent}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>استعادة النموذج الافتراضي</span>
                </button>

                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-600 rounded-lg shadow-md transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>حفظ التعديلات في القالب</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: HEADER & FOOTER CUSTOMIZATION */}
          {activeTab === 'header_footer' && (
            <form onSubmit={handleSaveAcceptance} className="space-y-6">
              
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 text-xs text-blue-950 flex items-start gap-2">
                <Heading className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                <p>
                  <strong>تخصيص الترويسة والتذييل:</strong> يمكنك التحكم الكامل في بيانات أعلى الخطاب (الشارة، عنوان المجلة، سطر النشر والانتساب، أرقام المعرّفات) وبيانات التذييل والشفرة الأمنية.
                </p>
              </div>

              {/* Header Badge */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    شارة الترويسة العليا بالإنجليزية (Header Top Badge - EN)
                  </label>
                  <input
                    type="text"
                    value={accForm.headerBadgeEn}
                    onChange={(e) => setAccForm({ ...accForm, headerBadgeEn: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-sans"
                    placeholder="Peer-Reviewed Agricultural Science Journal"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    شارة الترويسة العليا بالعربية (Header Top Badge - AR)
                  </label>
                  <input
                    type="text"
                    value={accForm.headerBadgeAr}
                    onChange={(e) => setAccForm({ ...accForm, headerBadgeAr: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-sans"
                    placeholder="مجلة علمية دولية محكمة ومعتمدة"
                  />
                </div>
              </div>

              {/* Affiliation / Publisher lines */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    سطر الانتساب والنشر بالإنجليزية (Affiliation / Publisher - EN)
                  </label>
                  <textarea
                    rows={2}
                    value={accForm.headerAffiliationEn}
                    onChange={(e) => setAccForm({ ...accForm, headerAffiliationEn: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-sans"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    سطر الانتساب والنشر بالعربية (Affiliation / Publisher - AR)
                  </label>
                  <textarea
                    rows={2}
                    value={accForm.headerAffiliationAr}
                    onChange={(e) => setAccForm({ ...accForm, headerAffiliationAr: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-sans"
                  />
                </div>
              </div>

              {/* Portal & Identifiers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    رابط بوابة المجلة
                  </label>
                  <input
                    type="text"
                    value={accForm.headerPortalUrl}
                    onChange={(e) => setAccForm({ ...accForm, headerPortalUrl: e.target.value })}
                    className="w-full px-2 py-1.5 text-xs border rounded font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    ISSN المطبوع (Print)
                  </label>
                  <input
                    type="text"
                    value={accForm.headerIssnPrint}
                    onChange={(e) => setAccForm({ ...accForm, headerIssnPrint: e.target.value })}
                    className="w-full px-2 py-1.5 text-xs border rounded font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    ISSN الإلكتروني (Online)
                  </label>
                  <input
                    type="text"
                    value={accForm.headerIssnOnline}
                    onChange={(e) => setAccForm({ ...accForm, headerIssnOnline: e.target.value })}
                    className="w-full px-2 py-1.5 text-xs border rounded font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    بادئة الـ DOI (Crossref)
                  </label>
                  <input
                    type="text"
                    value={accForm.headerDoiPrefix}
                    onChange={(e) => setAccForm({ ...accForm, headerDoiPrefix: e.target.value })}
                    className="w-full px-2 py-1.5 text-xs border rounded font-mono"
                  />
                </div>
              </div>

              {/* Footer Section */}
              <div className="border-t border-slate-200 pt-4 space-y-4">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  إعدادات وتذييل الخطاب (Footer Settings)
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      نص الإشعار القانوني بالتذييل بالإنجليزية (Footer Notice - EN)
                    </label>
                    <textarea
                      rows={2}
                      value={accForm.footerNoticeEn}
                      onChange={(e) => setAccForm({ ...accForm, footerNoticeEn: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      نص الإشعار القانوني بالتذييل بالعربية (Footer Notice - AR)
                    </label>
                    <textarea
                      rows={2}
                      value={accForm.footerNoticeAr}
                      onChange={(e) => setAccForm({ ...accForm, footerNoticeAr: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-sans"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      بادئة رمز التحقق الرقمي الأمني (Security Hash Prefix)
                    </label>
                    <input
                      type="text"
                      value={accForm.footerSecurityHashText}
                      onChange={(e) => setAccForm({ ...accForm, footerSecurityHashText: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      نص رابط البوابة بالتذييل
                    </label>
                    <input
                      type="text"
                      value={accForm.footerPortalText}
                      onChange={(e) => setAccForm({ ...accForm, footerPortalText: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-sans"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={handleResetCurrent}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>استعادة النموذج الافتراضي</span>
                </button>

                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-600 rounded-lg shadow-md transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>حفظ إعدادات الترويسة والتذييل</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: CERTIFICATE TEMPLATE */}
          {activeTab === 'certificate' && (
            <form onSubmit={handleSaveCertificate} className="space-y-6">
              
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <p>
                  <strong>إصدار شهادات التحكيم:</strong> تصدر الشهادة رسمياً باسم <strong>مجلة أرشيف العلوم الزراعية (AASJ)</strong> تقديراً للمحكم، مع توقيع رئيس التحرير وختم المجلة ورمز QR للتحقق المباشر.
                </p>
              </div>

              {/* Titles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    عنوان الشهادة بالعربية (Certificate Title - AR)
                  </label>
                  <input
                    type="text"
                    value={certForm.titleAr}
                    onChange={(e) => setCertForm({ ...certForm, titleAr: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-sans"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    عنوان الشهادة بالإنجليزية (Certificate Title - EN)
                  </label>
                  <input
                    type="text"
                    value={certForm.titleEn}
                    onChange={(e) => setCertForm({ ...certForm, titleEn: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-sans"
                    required
                  />
                </div>
              </div>

              {/* Issuing Body */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    الجهة المصدرة باسم المجلة بالعربية
                  </label>
                  <input
                    type="text"
                    value={certForm.issuingBodyAr}
                    onChange={(e) => setCertForm({ ...certForm, issuingBodyAr: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-sans"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    الجهة المصدرة باسم المجلة بالإنجليزية
                  </label>
                  <input
                    type="text"
                    value={certForm.issuingBodyEn}
                    onChange={(e) => setCertForm({ ...certForm, issuingBodyEn: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-sans"
                  />
                </div>
              </div>

              {/* Intro Salutation */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    صيغة الإهداء والتقدير باسم المجلة (بالعربية)
                  </label>
                  <textarea
                    rows={2}
                    value={certForm.introTextAr}
                    onChange={(e) => setCertForm({ ...certForm, introTextAr: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-sans"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    صيغة الإهداء والتقدير باسم المجلة (بالإنجليزية)
                  </label>
                  <textarea
                    rows={2}
                    value={certForm.introTextEn}
                    onChange={(e) => setCertForm({ ...certForm, introTextEn: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-sans"
                  />
                </div>
              </div>

              {/* Main Commendation Body */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    متن شهادة الشكر لجهود التحكيم العلمي (بالعربية)
                  </label>
                  <textarea
                    rows={3}
                    value={certForm.bodyTextAr}
                    onChange={(e) => setCertForm({ ...certForm, bodyTextAr: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-sans"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    متن شهادة الشكر لجهود التحكيم العلمي (بالإنجليزية)
                  </label>
                  <textarea
                    rows={3}
                    value={certForm.bodyTextEn}
                    onChange={(e) => setCertForm({ ...certForm, bodyTextEn: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-sans"
                  />
                </div>
              </div>

              {/* Signatories */}
              <div className="border-t border-slate-200 pt-4">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                  بيانات الموقّعين على شهادة التحكيم
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                    <span className="text-[11px] font-bold text-emerald-950 block">الموقّع الأول (رئيس التحرير):</span>
                    <div>
                      <label className="text-[10px] text-slate-500 block">الاسم بالعربية</label>
                      <input
                        type="text"
                        value={certForm.signatory1NameAr}
                        onChange={(e) => setCertForm({ ...certForm, signatory1NameAr: e.target.value })}
                        className="w-full px-2 py-1 text-xs border rounded"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 block">الصفة بالعربية</label>
                      <input
                        type="text"
                        value={certForm.signatory1TitleAr}
                        onChange={(e) => setCertForm({ ...certForm, signatory1TitleAr: e.target.value })}
                        className="w-full px-2 py-1 text-xs border rounded"
                      />
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                    <span className="text-[11px] font-bold text-emerald-950 block">الموقّع الثاني (مدير التحرير):</span>
                    <div>
                      <label className="text-[10px] text-slate-500 block">الاسم بالعربية</label>
                      <input
                        type="text"
                        value={certForm.signatory2NameAr}
                        onChange={(e) => setCertForm({ ...certForm, signatory2NameAr: e.target.value })}
                        className="w-full px-2 py-1 text-xs border rounded"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 block">الصفة بالعربية</label>
                      <input
                        type="text"
                        value={certForm.signatory2TitleAr}
                        onChange={(e) => setCertForm({ ...certForm, signatory2TitleAr: e.target.value })}
                        className="w-full px-2 py-1 text-xs border rounded"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={handleResetCurrent}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>استعادة النموذج الافتراضي</span>
                </button>

                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-600 rounded-lg shadow-md transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>حفظ التعديلات في القالب</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: JOURNAL LOGO & SEAL MANAGEMENT */}
          {activeTab === 'logo_seal' && (
            <div className="space-y-6">
              
              {/* Informative Banner */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-950 flex items-start gap-3">
                <Stamp className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-emerald-950 mb-1">
                    إدارة شعار وختم المجلة الرسمي المعتمد
                  </h4>
                  <p className="text-slate-700 leading-relaxed">
                    يمكنك تحميل <strong>شعار المجلة</strong> (الذي يظهر في الترويسة والعلامة المائية) و<strong>ختم المجلة الرسمي</strong> (الذي يظهر فوق التوقيعات بأسفل الخطاب والشهادات بدلاً من الختم الرقمي).
                  </p>
                </div>
              </div>

              {/* Section 1: Journal Logo */}
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-emerald-700" />
                  <span>1. شعار المجلة المعتمد (Journal Logo)</span>
                </h4>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 p-2 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-center overflow-hidden">
                      <JournalLogo className="w-16 h-16" />
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-900 text-sm">
                        {customLogoUrl ? 'شعار مخصص محمّل (Custom Logo)' : 'الشعار الافتراضي المتجهي (AASJ Emblem)'}
                      </h5>
                      <p className="text-xs text-slate-500 mt-0.5">
                        يظهر في الترويسة والعلامة المائية في الخلفية
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-600 rounded-xl cursor-pointer shadow-xs transition-colors">
                      <Upload className="w-4 h-4" />
                      <span>تحميل شعار جديد</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>

                    {customLogoUrl && (
                      <button
                        type="button"
                        onClick={() => setCustomLogoUrl(null)}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors"
                        title="إلغاء الشعار المخصص"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>استعادة الأصلي</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 2: Journal Official Seal (New requested feature) */}
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <Stamp className="w-4 h-4 text-amber-600" />
                  <span>2. ختم المجلة الرسمي المعتمد (Official Journal Stamp / Seal)</span>
                </h4>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 p-2 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-center overflow-hidden">
                      <JournalSeal className="w-20 h-20" />
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-900 text-sm">
                        {customSealUrl ? 'ختم رسمي محمّل (Custom Official Stamp)' : 'الختم الرقمي النافر الافتراضي (Digital Vector Seal)'}
                      </h5>
                      <p className="text-xs text-slate-500 mt-0.5">
                        يظهر أسفل الخطاب والشهادات بجانب التوقيعات ورمز QR
                      </p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900">
                        {customSealUrl ? 'ختم حقيقي نشط' : 'ختم رقمي متجهي نشط'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl cursor-pointer shadow-xs transition-colors">
                      <Upload className="w-4 h-4" />
                      <span>تحميل ختم المجلة (PNG شفاف / JPG)</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleSealUpload}
                        className="hidden"
                      />
                    </label>

                    {customSealUrl && (
                      <button
                        type="button"
                        onClick={() => setCustomSealUrl(null)}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors"
                        title="إلغاء الختم المرفوع والعودة للختم الرقمي"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>العودة للختم الرقمي</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 3: Acceptance Letter Barcode Management (New requested feature) */}
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-emerald-700" />
                    <span>3. باركود / رمز التحقق المعتمد لخطاب القبول (Custom Barcode / QR Code)</span>
                  </h4>
                  <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 font-bold">
                    {barcodeMode === 'custom_barcode' && customBarcodeUrl ? 'باركود مخصص نشط' : 'رمز QR التلقائي نشط'}
                  </span>
                </div>

                {/* Mode Selector */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setBarcodeMode('auto_qr')}
                    className={`p-3 rounded-xl border text-right transition-all flex items-start gap-3 cursor-pointer ${
                      barcodeMode === 'auto_qr'
                        ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-bold ring-1 ring-emerald-500'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`p-2 rounded-lg mt-0.5 ${barcodeMode === 'auto_qr' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      <QrCode className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold">رمز QR تلقائي مخصص للبحث</div>
                      <div className="text-[11px] font-normal text-slate-500 mt-0.5">
                        يُولّد رمز استجابة سريعة تلقائياً متضمناً كود البحث والـ DOI ورابط التحقق الفوري.
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (customBarcodeUrl) {
                        setBarcodeMode('custom_barcode');
                      }
                    }}
                    className={`p-3 rounded-xl border text-right transition-all flex items-start gap-3 cursor-pointer ${
                      barcodeMode === 'custom_barcode'
                        ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-bold ring-1 ring-emerald-500'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`p-2 rounded-lg mt-0.5 ${barcodeMode === 'custom_barcode' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      <Sliders className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold">صورة باركود معتمد مرفوعة</div>
                      <div className="text-[11px] font-normal text-slate-500 mt-0.5">
                        استخدام صورة باركود رسمي محملة (خطي 1D أو رمز 2D) بدلاً من الرمز التلقائي.
                      </div>
                    </div>
                  </button>
                </div>

                {/* Barcode Upload & Preview Box */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-4">
                    <div className="w-32 h-20 p-2 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center overflow-hidden">
                      {customBarcodeUrl ? (
                        <img
                          src={customBarcodeUrl}
                          alt="Custom Barcode Preview"
                          className="max-w-full max-h-full object-contain"
                        />
                      ) : (
                        <div className="text-center text-slate-400">
                          <QrCode className="w-8 h-8 mx-auto mb-1 opacity-50" />
                          <span className="text-[9px] block">لا يوجد باركود مرفوع</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-900 text-sm">
                        {customBarcodeUrl ? 'صورة باركود مخصصة جاهزة' : 'لم يتم رفع صورة باركود بعد'}
                      </h5>
                      <p className="text-xs text-slate-500 mt-0.5">
                        صيغ مقبولة: PNG، JPG، SVG (يدعم الباركود الخطي 1D والـ QR)
                      </p>
                      {customBarcodeUrl && (
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                          barcodeMode === 'custom_barcode'
                            ? 'bg-emerald-100 text-emerald-900'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {barcodeMode === 'custom_barcode' ? 'قيد الاستخدام في الخطاب حالياً' : 'مرفوع (غير مفعل)'}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-600 rounded-xl cursor-pointer shadow-xs transition-colors">
                      <Upload className="w-4 h-4" />
                      <span>{customBarcodeUrl ? 'تغيير صورة الباركود' : 'تحميل صورة باركود'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleBarcodeUpload}
                        className="hidden"
                      />
                    </label>

                    {customBarcodeUrl && (
                      <button
                        type="button"
                        onClick={() => setCustomBarcodeUrl(null)}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors cursor-pointer"
                        title="حذف الباركود المرفوع والعودة للـ QR التلقائي"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>حذف الباركود</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>نظام إدارة قوالب مجلة أرشيف العلوم الزراعية (AASJ)</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-700 transition-colors"
          >
            إغلاق النافذة
          </button>
        </div>

      </div>
    </div>
  );
};
