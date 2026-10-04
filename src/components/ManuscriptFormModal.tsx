import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { useJournal } from '../context/JournalContext';
import { DISCIPLINE_TRANSLATIONS, STATUS_TRANSLATIONS } from '../translations';
import {
  AuthorDegree,
  AuthorPosition,
  AuthorTitle,
  DocumentType,
  JournalDiscipline,
  Manuscript,
  ManuscriptStatus,
  ReviewerRecommendation,
} from '../types/journal';

export const ManuscriptFormModal: React.FC<{
  initialData?: Manuscript | null;
  onClose: () => void;
}> = ({ initialData, onClose }) => {
  const { language, addManuscript, updateManuscript } = useJournal();
  const [formTab, setFormTab] = useState<'metadata' | 'authors' | 'reviewers' | 'files'>('metadata');

  // Form State
  const [id, setId] = useState(initialData?.id || `AASJ-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
  const [status, setStatus] = useState<ManuscriptStatus>(initialData?.status || 'Submitted Manuscript');
  const [comment, setComment] = useState(initialData?.comment || '');
  const [documentType, setDocumentType] = useState<DocumentType>(initialData?.documentType || 'Research Article');
  const [doi, setDoi] = useState(initialData?.doi || '');
  const [articleTitle, setArticleTitle] = useState(initialData?.articleTitle || '');
  const [keywords, setKeywords] = useState(initialData?.keywords || '');
  const [volume, setVolume] = useState<number>(initialData?.volume || 12);
  const [issue, setIssue] = useState<number>(initialData?.issue || 1);
  const [pagesFrom, setPagesFrom] = useState<number | undefined>(initialData?.pagesFrom);
  const [pagesTo, setPagesTo] = useState<number | undefined>(initialData?.pagesTo);
  const [publishedYear, setPublishedYear] = useState<number>(initialData?.publishedYear || new Date().getFullYear());
  const [receiveDate, setReceiveDate] = useState(initialData?.receiveDate || new Date().toISOString().split('T')[0]);
  const [reviseDate, setReviseDate] = useState(initialData?.reviseDate || '');
  const [acceptDate, setAcceptDate] = useState(initialData?.acceptDate || '');
  const [publishDate, setPublishDate] = useState(initialData?.publishDate || '');
  const [subjectsRelated, setSubjectsRelated] = useState<JournalDiscipline[]>(
    initialData?.subjectsRelated || ['Plant Production']
  );
  const [specificFieldOfStudy, setSpecificFieldOfStudy] = useState(initialData?.specificFieldOfStudy || '');

  // Files
  const [submittedFileUrl, setSubmittedFileUrl] = useState(initialData?.submittedFileUrl || '');
  const [revisedFileUrl, setRevisedFileUrl] = useState(initialData?.revisedFileUrl || '');
  const [layoutFileUrl, setLayoutFileUrl] = useState(initialData?.layoutFileUrl || '');
  const [publishedFileUrl, setPublishedFileUrl] = useState(initialData?.publishedFileUrl || '');

  // Corresponding Author
  const [correspondAuthorTitle, setCorrespondAuthorTitle] = useState<AuthorTitle>(initialData?.correspondAuthorTitle || 'Dr.');
  const [correspondAuthorFirstName, setCorrespondAuthorFirstName] = useState(initialData?.correspondAuthorFirstName || '');
  const [correspondAuthorMiddle, setCorrespondAuthorMiddle] = useState(initialData?.correspondAuthorMiddle || '');
  const [correspondAuthorLastName, setCorrespondAuthorLastName] = useState(initialData?.correspondAuthorLastName || '');
  const [correspondAuthorDegree, setCorrespondAuthorDegree] = useState<AuthorDegree>(initialData?.correspondAuthorDegree || 'PhD');
  const [correspondAuthorPosition, setCorrespondAuthorPosition] = useState<AuthorPosition>(initialData?.correspondAuthorPosition || 'Associate Professor');
  const [correspondAuthorSpecialty, setCorrespondAuthorSpecialty] = useState(initialData?.correspondAuthorSpecialty || 'Plant Production');
  const [correspondAuthorSpecificField, setCorrespondAuthorSpecificField] = useState(initialData?.correspondAuthorSpecificField || '');
  const [correspondAuthorORCID, setCorrespondAuthorORCID] = useState(initialData?.correspondAuthorORCID || '');
  const [correspondAuthorEmail, setCorrespondAuthorEmail] = useState(initialData?.correspondAuthorEmail || '');
  const [correspondAuthorPhone, setCorrespondAuthorPhone] = useState(initialData?.correspondAuthorPhone || '');
  const [correspondAuthorMobile, setCorrespondAuthorMobile] = useState(initialData?.correspondAuthorMobile || '');
  const [correspondAuthorFax, setCorrespondAuthorFax] = useState(initialData?.correspondAuthorFax || '');
  const [correspondAuthorAffiliation, setCorrespondAuthorAffiliation] = useState(initialData?.correspondAuthorAffiliation || '');

  // Authors
  const [firstAuthorFullName, setFirstAuthorFullName] = useState(initialData?.firstAuthorFullName || '');
  const [authorsNames, setAuthorsNames] = useState(initialData?.authorsNames || '');
  const [authorsEmails, setAuthorsEmails] = useState(initialData?.authorsEmails || '');
  const [authorsAffiliations, setAuthorsAffiliations] = useState(initialData?.authorsAffiliations || '');

  // Reviewer 1
  const [r1Name, setR1Name] = useState(initialData?.reviewerOne?.name || '');
  const [r1Email, setR1Email] = useState(initialData?.reviewerOne?.email || '');
  const [r1Affiliation, setR1Affiliation] = useState(initialData?.reviewerOne?.affiliation || '');
  const [r1AssignDate, setR1AssignDate] = useState(initialData?.reviewerOne?.assignDate || '');
  const [r1DueDate, setR1DueDate] = useState(initialData?.reviewerOne?.reviewDueDate || '');
  const [r1Recommendation, setR1Recommendation] = useState<ReviewerRecommendation | ''>(initialData?.reviewerOne?.recommendation || '');
  const [r1Date, setR1Date] = useState(initialData?.reviewerOne?.reviewDate || '');
  const [r1Comment, setR1Comment] = useState(initialData?.reviewerOne?.comment || '');
  const [r1File, setR1File] = useState(initialData?.reviewerOne?.fileUrl || '');

  // Reviewer 2
  const [r2Name, setR2Name] = useState(initialData?.reviewerTwo?.name || '');
  const [r2Email, setR2Email] = useState(initialData?.reviewerTwo?.email || '');
  const [r2Affiliation, setR2Affiliation] = useState(initialData?.reviewerTwo?.affiliation || '');
  const [r2AssignDate, setR2AssignDate] = useState(initialData?.reviewerTwo?.assignDate || '');
  const [r2DueDate, setR2DueDate] = useState(initialData?.reviewerTwo?.reviewDueDate || '');
  const [r2Recommendation, setR2Recommendation] = useState<ReviewerRecommendation | ''>(initialData?.reviewerTwo?.recommendation || '');
  const [r2Date, setR2Date] = useState(initialData?.reviewerTwo?.reviewDate || '');
  const [r2Comment, setR2Comment] = useState(initialData?.reviewerTwo?.comment || '');
  const [r2File, setR2File] = useState(initialData?.reviewerTwo?.fileUrl || '');

  const handleDisciplineToggle = (disc: JournalDiscipline) => {
    if (subjectsRelated.includes(disc)) {
      if (subjectsRelated.length > 1) {
        setSubjectsRelated(subjectsRelated.filter((d) => d !== disc));
      }
    } else {
      setSubjectsRelated([...subjectsRelated, disc]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!articleTitle.trim()) {
      alert(language === 'ar' ? 'يرجى إدخال عنوان المخطوطة' : 'Please provide article title');
      return;
    }

    const payload: Omit<Manuscript, 'createdAt' | 'updatedAt'> = {
      id,
      status,
      comment,
      documentType,
      doi,
      articleTitle,
      keywords,
      volume: Number(volume),
      issue: Number(issue),
      pagesFrom: pagesFrom ? Number(pagesFrom) : undefined,
      pagesTo: pagesTo ? Number(pagesTo) : undefined,
      publishedYear: Number(publishedYear),
      receiveDate,
      reviseDate,
      acceptDate,
      publishDate,
      subjectsRelated,
      specificFieldOfStudy,
      submittedFileUrl,
      revisedFileUrl,
      layoutFileUrl,
      publishedFileUrl,
      correspondAuthorTitle,
      correspondAuthorFirstName,
      correspondAuthorMiddle,
      correspondAuthorLastName,
      correspondAuthorDegree,
      correspondAuthorPosition,
      correspondAuthorSpecialty,
      correspondAuthorSpecificField,
      correspondAuthorORCID,
      correspondAuthorEmail,
      correspondAuthorPhone,
      correspondAuthorMobile,
      correspondAuthorFax,
      correspondAuthorAffiliation,
      firstAuthorFullName: firstAuthorFullName || `${correspondAuthorTitle} ${correspondAuthorFirstName} ${correspondAuthorLastName}`,
      authorsNames: authorsNames || `${correspondAuthorFirstName} ${correspondAuthorLastName}`,
      authorsEmails: authorsEmails || correspondAuthorEmail,
      authorsAffiliations: authorsAffiliations || correspondAuthorAffiliation,
      reviewerOne: r1Name
        ? {
            name: r1Name,
            email: r1Email,
            affiliation: r1Affiliation,
            assignDate: r1AssignDate,
            reviewDueDate: r1DueDate,
            recommendation: r1Recommendation,
            reviewDate: r1Date,
            comment: r1Comment,
            fileUrl: r1File,
          }
        : undefined,
      reviewerTwo: r2Name
        ? {
            name: r2Name,
            email: r2Email,
            affiliation: r2Affiliation,
            assignDate: r2AssignDate,
            reviewDueDate: r2DueDate,
            recommendation: r2Recommendation,
            reviewDate: r2Date,
            comment: r2Comment,
            fileUrl: r2File,
          }
        : undefined,
    };

    if (initialData) {
      updateManuscript(initialData.id, payload);
    } else {
      addManuscript(payload);
    }

    onClose();
  };

  const disciplinesList: JournalDiscipline[] = [
    'Agricultural Economics, Rural Sociology and Agricultural Extension',
    'Animal and Poultry Production',
    'Chemistry, Agricultural Microbiology, and Genetics',
    'Dairy Science, Food Science and Technology',
    'Plant Pathology and Plant Protection',
    'Plant Production',
    'Soils and Water, and Agricultural Engineering',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-slate-900/70 backdrop-blur-xs p-1.5 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden my-1 sm:my-auto flex flex-col max-h-[96dvh] sm:max-h-[96vh]">
        
        {/* Header - Sticky & shrink-0 */}
        <div className="p-3 sm:px-6 sm:py-3.5 bg-slate-900 text-white flex items-center justify-between gap-3 shrink-0 sticky top-0 z-20 shadow-md">
          <div className="min-w-0">
            <h2 className="text-xs sm:text-base font-bold truncate">
              {initialData
                ? language === 'ar'
                  ? `تعديل بيانات المخطوطة [${initialData.id}]`
                  : `Edit Manuscript [${initialData.id}]`
                : language === 'ar'
                ? 'إدراج مخطوطة وبحث علمي جديد في سجل AASJ'
                : 'Add New Manuscript to AASJ Registry'}
            </h2>
            <p className="text-[10px] sm:text-xs text-slate-400 truncate">
              {language === 'ar'
                ? 'وفقاً لنموذج واستمارة هيئة التحرير المعتمدة بمجلة العلوم العربية والأفريقية'
                : 'Aligned with AASJ Editorial Board official submission specifications'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 active:bg-slate-700 rounded-lg transition-colors shrink-0 cursor-pointer bg-slate-800/60 border border-slate-700/50"
            title={language === 'ar' ? 'إغلاق' : 'Close'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="px-3 sm:px-6 border-b border-slate-200 bg-slate-50 flex space-x-4 sm:space-x-6 rtl:space-x-reverse text-xs font-semibold overflow-x-auto no-scrollbar shrink-0">
          <button
            type="button"
            onClick={() => setFormTab('metadata')}
            className={`py-3 border-b-2 transition-colors ${
              formTab === 'metadata'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            {language === 'ar' ? '1. بيانات البحث والتصنيف' : '1. Article & Classification'}
          </button>
          <button
            type="button"
            onClick={() => setFormTab('authors')}
            className={`py-3 border-b-2 transition-colors ${
              formTab === 'authors'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            {language === 'ar' ? '2. المؤلفون والباحث المراسل' : '2. Authors & Affiliations'}
          </button>
          <button
            type="button"
            onClick={() => setFormTab('reviewers')}
            className={`py-3 border-b-2 transition-colors ${
              formTab === 'reviewers'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            {language === 'ar' ? '3. المحكمون وتوصيات التحكيم' : '3. Peer Review Assignment'}
          </button>
          <button
            type="button"
            onClick={() => setFormTab('files')}
            className={`py-3 border-b-2 transition-colors ${
              formTab === 'files'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            {language === 'ar' ? '4. روابط الملفات والتواريخ' : '4. Files & Milestones'}
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 max-h-[62vh] overflow-y-auto text-xs space-y-4">
            
            {/* TAB 1: Metadata */}
            {formTab === 'metadata' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      {language === 'ar' ? 'رقم المخطوطة (Manuscript ID):' : 'Manuscript ID:'}
                    </label>
                    <input
                      type="text"
                      value={id}
                      onChange={(e) => setId(e.target.value)}
                      required
                      className="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      {language === 'ar' ? 'نوع الوثيقة (Document Type):' : 'Document Type:'}
                    </label>
                    <select
                      value={documentType}
                      onChange={(e) => setDocumentType(e.target.value as DocumentType)}
                      className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                    >
                      <option value="Research Article">Research Article (بحث أصيل)</option>
                      <option value="Review Article">Review Article (مقالة مرجعية)</option>
                      <option value="Short Communication">Short Communication (ملاحظة بحثية موجزة)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      {language === 'ar' ? 'حالة المخطوطة (Status):' : 'Manuscript Status:'}
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as ManuscriptStatus)}
                      className="w-full p-2 border border-slate-300 rounded-lg bg-white truncate"
                    >
                      {Object.keys(STATUS_TRANSLATIONS).map((st) => (
                        <option key={st} value={st}>
                          {language === 'ar' ? STATUS_TRANSLATIONS[st as ManuscriptStatus].ar : st}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    {language === 'ar' ? 'عنوان البحث (Article Title):' : 'Article Title:'}
                  </label>
                  <input
                    type="text"
                    value={articleTitle}
                    onChange={(e) => setArticleTitle(e.target.value)}
                    required
                    placeholder="e.g. Impact of Biochar on Sorghum Yield..."
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-sm font-semibold"
                  />
                </div>

                {/* Disciplines Selection (7 Disciplines from AASJ) */}
                <div>
                  <label className="font-semibold text-slate-700 block mb-1.5">
                    {language === 'ar' ? 'التخصصات المرتبطة بالمجلة (Subjects Related):' : 'Subjects Related to Article:'}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    {disciplinesList.map((disc) => {
                      const isChecked = subjectsRelated.includes(disc);
                      return (
                        <label
                          key={disc}
                          className="flex items-start gap-2 cursor-pointer text-slate-800 hover:text-blue-700"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleDisciplineToggle(disc)}
                            className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                          />
                          <span className="leading-snug">
                            {language === 'ar' ? DISCIPLINE_TRANSLATIONS[disc]?.ar || disc : disc}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      {language === 'ar' ? 'مجال الدراسة الدقيق (Specific Field):' : 'Specific Field of Study:'}
                    </label>
                    <input
                      type="text"
                      value={specificFieldOfStudy}
                      onChange={(e) => setSpecificFieldOfStudy(e.target.value)}
                      placeholder="e.g. Soil Chemistry and Fertility Management"
                      className="w-full p-2 border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      {language === 'ar' ? 'الكلمات المفتاحية (Keywords):' : 'Keywords:'}
                    </label>
                    <input
                      type="text"
                      value={keywords}
                      onChange={(e) => setKeywords(e.target.value)}
                      placeholder="e.g. Biochar, Soil Salinity, Sorghum, Humic Acid"
                      className="w-full p-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div>
                    <label className="text-slate-600 block mb-1">{language === 'ar' ? 'المجلد:' : 'Volume:'}</label>
                    <input
                      type="number"
                      value={volume}
                      onChange={(e) => setVolume(Number(e.target.value))}
                      className="w-full p-1.5 border border-slate-300 rounded bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 block mb-1">{language === 'ar' ? 'العدد:' : 'Issue:'}</label>
                    <input
                      type="number"
                      value={issue}
                      onChange={(e) => setIssue(Number(e.target.value))}
                      className="w-full p-1.5 border border-slate-300 rounded bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 block mb-1">{language === 'ar' ? 'من ص:' : 'Pages From:'}</label>
                    <input
                      type="number"
                      value={pagesFrom || ''}
                      onChange={(e) => setPagesFrom(e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full p-1.5 border border-slate-300 rounded bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 block mb-1">{language === 'ar' ? 'إلى ص:' : 'Pages To:'}</label>
                    <input
                      type="number"
                      value={pagesTo || ''}
                      onChange={(e) => setPagesTo(e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full p-1.5 border border-slate-300 rounded bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 block mb-1">{language === 'ar' ? 'سنة النشر:' : 'Year:'}</label>
                    <input
                      type="number"
                      value={publishedYear}
                      onChange={(e) => setPublishedYear(Number(e.target.value))}
                      className="w-full p-1.5 border border-slate-300 rounded bg-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      {language === 'ar' ? 'المعرف الرقمي الدولي (DOI):' : 'DOI:'}
                    </label>
                    <input
                      type="text"
                      value={doi}
                      onChange={(e) => setDoi(e.target.value)}
                      placeholder="10.59275/j.aasj.2026.xxx"
                      className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      {language === 'ar' ? 'ملاحظة تحريرية حول المخطوطة:' : 'Write a Comment About Manuscript:'}
                    </label>
                    <input
                      type="text"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder={language === 'ar' ? 'ملاحظات المحرر...' : 'Internal notes...'}
                      className="w-full p-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Authors */}
            {formTab === 'authors' && (
              <div className="space-y-4">
                <div className="bg-blue-50/50 border border-blue-200 p-4 rounded-xl space-y-3">
                  <h3 className="font-bold text-blue-900 text-xs uppercase tracking-wider">
                    {language === 'ar' ? 'بيانات الباحث المراسل (Correspond Author)' : 'Corresponding Author Profile'}
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="text-slate-600 block mb-1">{language === 'ar' ? 'اللقب (Title):' : 'Title:'}</label>
                      <select
                        value={correspondAuthorTitle}
                        onChange={(e) => setCorrespondAuthorTitle(e.target.value as AuthorTitle)}
                        className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                      >
                        <option value="Dr.">Dr.</option>
                        <option value="Prof.">Prof.</option>
                        <option value="Mr.">Mr.</option>
                        <option value="Ms.">Ms.</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-600 block mb-1">{language === 'ar' ? 'الاسم الأول:' : 'First Name:'}</label>
                      <input
                        type="text"
                        value={correspondAuthorFirstName}
                        onChange={(e) => setCorrespondAuthorFirstName(e.target.value)}
                        required
                        className="w-full p-2 border border-slate-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="text-slate-600 block mb-1">{language === 'ar' ? 'الاسم الأوسط:' : 'Middle Name:'}</label>
                      <input
                        type="text"
                        value={correspondAuthorMiddle}
                        onChange={(e) => setCorrespondAuthorMiddle(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="text-slate-600 block mb-1">{language === 'ar' ? 'اسم العائلة:' : 'Last Name:'}</label>
                      <input
                        type="text"
                        value={correspondAuthorLastName}
                        onChange={(e) => setCorrespondAuthorLastName(e.target.value)}
                        required
                        className="w-full p-2 border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-slate-600 block mb-1">{language === 'ar' ? 'الدرجة العلمية:' : 'Degree:'}</label>
                      <select
                        value={correspondAuthorDegree}
                        onChange={(e) => setCorrespondAuthorDegree(e.target.value as AuthorDegree)}
                        className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                      >
                        <option value="PhD">PhD</option>
                        <option value="PhD candidate">PhD candidate</option>
                        <option value="MSc">MSc</option>
                        <option value="MSc Student">MSc Student</option>
                        <option value="BSc">BSc</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-600 block mb-1">{language === 'ar' ? 'المنصب / الرتبة:' : 'Position:'}</label>
                      <select
                        value={correspondAuthorPosition}
                        onChange={(e) => setCorrespondAuthorPosition(e.target.value as AuthorPosition)}
                        className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                      >
                        <option value="Professor">Professor</option>
                        <option value="Associate Professor">Associate Professor</option>
                        <option value="Assistant Professor">Assistant Professor</option>
                        <option value="Instructor">Instructor</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-600 block mb-1">ORCID ID:</label>
                      <input
                        type="text"
                        value={correspondAuthorORCID}
                        onChange={(e) => setCorrespondAuthorORCID(e.target.value)}
                        placeholder="0000-0002-xxxx-xxxx"
                        className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-slate-600 block mb-1">{language === 'ar' ? 'البريد الإلكتروني:' : 'Email:'}</label>
                      <input
                        type="email"
                        value={correspondAuthorEmail}
                        onChange={(e) => setCorrespondAuthorEmail(e.target.value)}
                        required
                        className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-slate-600 block mb-1">{language === 'ar' ? 'الهاتف الجوال:' : 'Mobile:'}</label>
                      <input
                        type="tel"
                        value={correspondAuthorMobile}
                        onChange={(e) => setCorrespondAuthorMobile(e.target.value)}
                        required
                        className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-slate-600 block mb-1">{language === 'ar' ? 'الهاتف الأرضي / الفاكس:' : 'Phone / Fax:'}</label>
                      <input
                        type="tel"
                        value={correspondAuthorPhone}
                        onChange={(e) => setCorrespondAuthorPhone(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-600 block mb-1">{language === 'ar' ? 'الجهة والانتساب الأكاديمي:' : 'Affiliation:'}</label>
                    <input
                      type="text"
                      value={correspondAuthorAffiliation}
                      onChange={(e) => setCorrespondAuthorAffiliation(e.target.value)}
                      placeholder="e.g. Faculty of Agriculture, University of Khartoum, Sudan"
                      className="w-full p-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>

                {/* Co-Authors List */}
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
                  <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                    {language === 'ar' ? 'بيانات باقي الباحثين والمشاركين' : 'Co-Authors Information'}
                  </h3>

                  <div>
                    <label className="text-slate-600 block mb-1">{language === 'ar' ? 'اسم الباحث الأول بالكامل:' : 'First Author Full Name:'}</label>
                    <input
                      type="text"
                      value={firstAuthorFullName}
                      onChange={(e) => setFirstAuthorFullName(e.target.value)}
                      placeholder="e.g. Dr. Tariq El-Hassan Sulaiman"
                      className="w-full p-2 border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="text-slate-600 block mb-1">{language === 'ar' ? 'أسماء جميع الباحثين (مفصولة بفواصل):' : "Authors' Names:"}</label>
                    <textarea
                      rows={2}
                      value={authorsNames}
                      onChange={(e) => setAuthorsNames(e.target.value)}
                      placeholder="e.g. Tariq E. Sulaiman, Mona A. Babiker, Omer H. Idris"
                      className="w-full p-2 border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="text-slate-600 block mb-1">{language === 'ar' ? 'عناوين البريد الإلكتروني للمؤلفين:' : "Authors' Emails:"}</label>
                    <textarea
                      rows={2}
                      value={authorsEmails}
                      onChange={(e) => setAuthorsEmails(e.target.value)}
                      placeholder="tariq@uofk.edu.sd, mona@uofk.edu.sd"
                      className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-slate-600 block mb-1">{language === 'ar' ? 'الجهات الأكاديمية للمؤلفين:' : "Authors' Affiliations:"}</label>
                    <textarea
                      rows={2}
                      value={authorsAffiliations}
                      onChange={(e) => setAuthorsAffiliations(e.target.value)}
                      placeholder="University of Khartoum; Red Sea University, Port Sudan"
                      className="w-full p-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Reviewers */}
            {formTab === 'reviewers' && (
              <div className="space-y-6">
                {/* Reviewer 1 */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide border-b border-slate-200 pb-2">
                    {language === 'ar' ? 'بيانات المحكم الأول (Reviewer One)' : 'Reviewer One Profile & Recommendation'}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-slate-600 block mb-1">{language === 'ar' ? 'اسم المحكم:' : 'Name:'}</label>
                      <input
                        type="text"
                        value={r1Name}
                        onChange={(e) => setR1Name(e.target.value)}
                        placeholder="Prof. Abdelrahman Galal"
                        className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-slate-600 block mb-1">{language === 'ar' ? 'البريد الإلكتروني:' : 'Email:'}</label>
                      <input
                        type="email"
                        value={r1Email}
                        onChange={(e) => setR1Email(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-lg bg-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-slate-600 block mb-1">{language === 'ar' ? 'الجامعة / الجهة:' : 'Affiliation:'}</label>
                      <input
                        type="text"
                        value={r1Affiliation}
                        onChange={(e) => setR1Affiliation(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-slate-600 block mb-1">{language === 'ar' ? 'تاريخ التعيين:' : 'Assign Date:'}</label>
                      <input
                        type="date"
                        value={r1AssignDate}
                        onChange={(e) => setR1AssignDate(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-lg bg-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-slate-600 block mb-1">{language === 'ar' ? 'موعد الاستحقاق (Due Date):' : 'Review Due Date:'}</label>
                      <input
                        type="date"
                        value={r1DueDate}
                        onChange={(e) => setR1DueDate(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-lg bg-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-slate-600 block mb-1">{language === 'ar' ? 'توصية المحكم:' : 'Recommendation:'}</label>
                      <select
                        value={r1Recommendation}
                        onChange={(e) => setR1Recommendation(e.target.value as ReviewerRecommendation)}
                        className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                      >
                        <option value="">— {language === 'ar' ? 'بانتظار التحكيم' : 'Pending'} —</option>
                        <option value="Accept Manuscript">Accept Manuscript (قبول البحث)</option>
                        <option value="Manuscript Needs Revision (Acceptance with Minor Revision)">Acceptance with Minor Revision</option>
                        <option value="Manuscript Needs Revision (Minor Revision)">Minor Revision Required</option>
                        <option value="Manuscript Needs Revision (Major Revision)">Major Revision Required</option>
                        <option value="Reject Manuscript">Reject Manuscript (رفض البحث)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-600 block mb-1">{language === 'ar' ? 'ملاحظة المحكم لرئيس التحرير:' : 'Comment for Editor:'}</label>
                      <textarea
                        rows={2}
                        value={r1Comment}
                        onChange={(e) => setR1Comment(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-slate-600 block mb-1">{language === 'ar' ? 'رابط ملف تقرير التحكيم:' : 'Review Report File URL:'}</label>
                      <input
                        type="url"
                        value={r1File}
                        onChange={(e) => setR1File(e.target.value)}
                        placeholder="https://aasj.ppmj.net/reviews/..."
                        className="w-full p-2 border border-slate-300 rounded-lg bg-white font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Reviewer 2 */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide border-b border-slate-200 pb-2">
                    {language === 'ar' ? 'بيانات المحكم الثاني (Reviewer Two)' : 'Reviewer Two Profile & Recommendation'}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-slate-600 block mb-1">{language === 'ar' ? 'اسم المحكم:' : 'Name:'}</label>
                      <input
                        type="text"
                        value={r2Name}
                        onChange={(e) => setR2Name(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-slate-600 block mb-1">{language === 'ar' ? 'البريد الإلكتروني:' : 'Email:'}</label>
                      <input
                        type="email"
                        value={r2Email}
                        onChange={(e) => setR2Email(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-lg bg-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-slate-600 block mb-1">{language === 'ar' ? 'الجامعة / الجهة:' : 'Affiliation:'}</label>
                      <input
                        type="text"
                        value={r2Affiliation}
                        onChange={(e) => setR2Affiliation(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-slate-600 block mb-1">{language === 'ar' ? 'تاريخ التعيين:' : 'Assign Date:'}</label>
                      <input
                        type="date"
                        value={r2AssignDate}
                        onChange={(e) => setR2AssignDate(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-lg bg-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-slate-600 block mb-1">{language === 'ar' ? 'موعد الاستحقاق:' : 'Due Date:'}</label>
                      <input
                        type="date"
                        value={r2DueDate}
                        onChange={(e) => setR2DueDate(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-lg bg-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-slate-600 block mb-1">{language === 'ar' ? 'توصية المحكم:' : 'Recommendation:'}</label>
                      <select
                        value={r2Recommendation}
                        onChange={(e) => setR2Recommendation(e.target.value as ReviewerRecommendation)}
                        className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                      >
                        <option value="">— {language === 'ar' ? 'بانتظار التحكيم' : 'Pending'} —</option>
                        <option value="Accept Manuscript">Accept Manuscript</option>
                        <option value="Manuscript Needs Revision (Acceptance with Minor Revision)">Acceptance with Minor Revision</option>
                        <option value="Manuscript Needs Revision (Minor Revision)">Minor Revision Required</option>
                        <option value="Manuscript Needs Revision (Major Revision)">Major Revision Required</option>
                        <option value="Reject Manuscript">Reject Manuscript</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: Files & Dates */}
            {formTab === 'files' && (
              <div className="space-y-4">
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide">
                    {language === 'ar' ? 'روابط ملفات ومستندات البحث' : 'Manuscript Document Links'}
                  </h4>

                  <div>
                    <label className="text-slate-600 block mb-1">
                      {language === 'ar' ? 'المخطوطة الأصلية المقدمة (Upload submitted Manuscript):' : 'Submitted Manuscript URL:'}
                    </label>
                    <input
                      type="url"
                      value={submittedFileUrl}
                      onChange={(e) => setSubmittedFileUrl(e.target.value)}
                      placeholder="https://aasj.ppmj.net/docs/..."
                      className="w-full p-2 border border-slate-300 rounded-lg font-mono bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-slate-600 block mb-1">
                      {language === 'ar' ? 'المخطوطة بعد مراجعة وتعديل المؤلف (Upload revised Manuscript):' : 'Revised Manuscript URL:'}
                    </label>
                    <input
                      type="url"
                      value={revisedFileUrl}
                      onChange={(e) => setRevisedFileUrl(e.target.value)}
                      placeholder="https://aasj.ppmj.net/docs/..."
                      className="w-full p-2 border border-slate-300 rounded-lg font-mono bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-slate-600 block mb-1">
                      {language === 'ar' ? 'بروفة الإخراج والتصميم الفني (Upload layout Manuscript):' : 'Layout Proof URL:'}
                    </label>
                    <input
                      type="url"
                      value={layoutFileUrl}
                      onChange={(e) => setLayoutFileUrl(e.target.value)}
                      placeholder="https://aasj.ppmj.net/docs/..."
                      className="w-full p-2 border border-slate-300 rounded-lg font-mono bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-slate-600 block mb-1">
                      {language === 'ar' ? 'النسخة المنشورة النهائية (Upload published Manuscript):' : 'Published Final URL:'}
                    </label>
                    <input
                      type="url"
                      value={publishedFileUrl}
                      onChange={(e) => setPublishedFileUrl(e.target.value)}
                      placeholder="https://aasj.ppmj.net/archives/..."
                      className="w-full p-2 border border-slate-300 rounded-lg font-mono bg-white"
                    />
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide">
                    {language === 'ar' ? 'التواريخ الرسمية للنشر' : 'Key Process Dates'}
                  </h4>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="text-slate-600 block mb-1">{language === 'ar' ? 'تاريخ الاستلام:' : 'Receive Date:'}</label>
                      <input
                        type="date"
                        value={receiveDate}
                        onChange={(e) => setReceiveDate(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-lg font-mono bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-slate-600 block mb-1">{language === 'ar' ? 'تاريخ التعديل:' : 'Revise Date:'}</label>
                      <input
                        type="date"
                        value={reviseDate}
                        onChange={(e) => setReviseDate(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-lg font-mono bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-slate-600 block mb-1">{language === 'ar' ? 'تاريخ القبول:' : 'Accept Date:'}</label>
                      <input
                        type="date"
                        value={acceptDate}
                        onChange={(e) => setAcceptDate(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-lg font-mono bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-slate-600 block mb-1">{language === 'ar' ? 'تاريخ النشر:' : 'Publish Date:'}</label>
                      <input
                        type="date"
                        value={publishDate}
                        onChange={(e) => setPublishDate(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-lg font-mono bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors"
            >
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>

            <div className="flex items-center gap-2">
              {formTab !== 'files' && (
                <button
                  type="button"
                  onClick={() => {
                    if (formTab === 'metadata') setFormTab('authors');
                    else if (formTab === 'authors') setFormTab('reviewers');
                    else if (formTab === 'reviewers') setFormTab('files');
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors"
                >
                  {language === 'ar' ? 'التالي ←' : 'Next →'}
                </button>
              )}
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{initialData ? (language === 'ar' ? 'حفظ التعديلات' : 'Update Manuscript') : (language === 'ar' ? 'تسجيل المخطوطة' : 'Submit Manuscript')}</span>
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
};
