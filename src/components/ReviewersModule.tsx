import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Mail,
  Phone,
  CreditCard,
  Edit,
  Trash2,
  CheckCircle,
  Star,
  ExternalLink,
  Award,
} from 'lucide-react';
import { useJournal } from '../context/JournalContext';
import { DISCIPLINE_TRANSLATIONS } from '../translations';
import { JournalDiscipline, ReviewerPaymentMethod, ReviewerProfile } from '../types/journal';
import { ReviewerCertificateModal } from './ReviewerCertificateModal';

export const ReviewersModule: React.FC = () => {
  const { language, reviewers, addReviewer, updateReviewer, deleteReviewer, setActiveModule } = useJournal();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [disciplineFilter, setDisciplineFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ReviewerProfile | null>(null);
  const [selectedReviewerForCert, setSelectedReviewerForCert] = useState<ReviewerProfile | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [affiliation, setAffiliation] = useState('');
  const [telephone, setTelephone] = useState('');
  const [mobile, setMobile] = useState('');
  const [fax, setFax] = useState('');
  const [major, setMajor] = useState<JournalDiscipline>('Plant Production');
  const [reviewingInterests, setReviewingInterests] = useState('');
  const [daysSinceLastReview, setDaysSinceLastReview] = useState<number>(0);
  const [reviewsCompleted, setReviewsCompleted] = useState<number>(0);
  const [reviewRequestsDeclined, setReviewRequestsDeclined] = useState<number>(0);
  const [averageDaysToComplete, setAverageDaysToComplete] = useState<number>(14);
  const [paymentMethod, setPaymentMethod] = useState<ReviewerPaymentMethod>('Bank Transfer');
  const [paymentDetails, setPaymentDetails] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [isActive, setIsActive] = useState<boolean>(true);

  const disciplinesList: JournalDiscipline[] = [
    'Agricultural Economics, Rural Sociology and Agricultural Extension',
    'Animal and Poultry Production',
    'Chemistry, Agricultural Microbiology, and Genetics',
    'Dairy Science, Food Science and Technology',
    'Plant Pathology and Plant Protection',
    'Plant Production',
    'Soils and Water, and Agricultural Engineering',
  ];

  const paymentMethods: ReviewerPaymentMethod[] = [
    'PayPal',
    'Fawry',
    'Vodafone Cash',
    'Orange Cash',
    'Etisalat Cash',
    'WE Pay',
    'Cash',
    'Bank Transfer',
  ];

  const handleOpenAdd = () => {
    setEditingItem(null);
    setName('');
    setEmail('');
    setAffiliation('');
    setTelephone('');
    setMobile('');
    setFax('');
    setMajor('Plant Production');
    setReviewingInterests('');
    setDaysSinceLastReview(0);
    setReviewsCompleted(0);
    setReviewRequestsDeclined(0);
    setAverageDaysToComplete(14);
    setPaymentMethod('Bank Transfer');
    setPaymentDetails('');
    setRating(5);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (r: ReviewerProfile) => {
    setEditingItem(r);
    setName(r.name);
    setEmail(r.email);
    setAffiliation(r.affiliation);
    setTelephone(r.telephone || '');
    setMobile(r.mobile);
    setFax(r.fax || '');
    setMajor(r.major);
    setReviewingInterests(r.reviewingInterests);
    setDaysSinceLastReview(r.daysSinceLastReview);
    setReviewsCompleted(r.reviewsCompleted);
    setReviewRequestsDeclined(r.reviewRequestsDeclined);
    setAverageDaysToComplete(r.averageDaysToComplete);
    setPaymentMethod(r.paymentMethod);
    setPaymentDetails(r.paymentDetails);
    setRating(r.rating || 5);
    setIsActive(r.isActive);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      alert(language === 'ar' ? 'يرجى إكمال الاسم والبريد الإلكتروني' : 'Please provide name and email');
      return;
    }

    if (editingItem) {
      updateReviewer(editingItem.id, {
        name,
        email,
        affiliation,
        telephone,
        mobile,
        fax,
        major,
        reviewingInterests,
        daysSinceLastReview: Number(daysSinceLastReview),
        reviewsCompleted: Number(reviewsCompleted),
        reviewRequestsDeclined: Number(reviewRequestsDeclined),
        averageDaysToComplete: Number(averageDaysToComplete),
        paymentMethod,
        paymentDetails,
        rating,
        isActive,
      });
    } else {
      addReviewer({
        name,
        email,
        affiliation,
        telephone,
        mobile,
        fax,
        major,
        reviewingInterests,
        daysSinceLastReview: Number(daysSinceLastReview),
        reviewsCompleted: Number(reviewsCompleted),
        reviewRequestsDeclined: Number(reviewRequestsDeclined),
        averageDaysToComplete: Number(averageDaysToComplete),
        paymentMethod,
        paymentDetails,
        rating,
        isActive,
      });
    }

    setIsModalOpen(false);
  };

  const filteredReviewers = reviewers.filter((r) => {
    if (disciplineFilter !== 'all' && r.major !== disciplineFilter) return false;
    const q = searchTerm.toLowerCase().trim();
    if (!q) return true;
    return (
      r.name.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      r.affiliation.toLowerCase().includes(q) ||
      r.reviewingInterests.toLowerCase().includes(q) ||
      r.mobile.includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {language === 'ar' ? 'سجل وقاعدة بيانات المحكمين (Reviewers Roster)' : 'Reviewers Roster & Directory'}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {language === 'ar'
                ? 'إدارة نخبة المحكمين الدوليين، ومتابعة سرعة التحكيم والتقييمات، وبيانات استحقاق المكافآت المالية.'
                : 'Directory of peer reviewers, turnaround metrics, evaluation quality, and honorarium payment methods.'}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
            <button
              onClick={() => setActiveModule('certificates')}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-amber-950 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              <Award className="w-4 h-4 text-amber-600" />
              <span>{language === 'ar' ? 'منظومة شهادات التحكيم (QR)' : 'Certificates Hub'}</span>
            </button>

            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'ar' ? 'إضافة محكم جديد' : 'Add Reviewer'}</span>
            </button>
          </div>
        </div>

        {/* Search & Discipline Filter */}
        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute top-2.5 right-3 rtl:right-3 rtl:left-auto ltr:left-3 ltr:right-auto text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={language === 'ar' ? 'بحث بالاسم، البريد، الجامعة، الاهتمامات...' : 'Search by name, email, institution, interests...'}
              className="w-full text-xs py-2 px-3 rtl:pr-8 ltr:pl-8 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <div>
            <select
              value={disciplineFilter}
              onChange={(e) => setDisciplineFilter(e.target.value)}
              className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 truncate"
            >
              <option value="all">{language === 'ar' ? 'كافة التخصصات العلمية' : 'All Disciplines'}</option>
              {disciplinesList.map((disc) => (
                <option key={disc} value={disc}>
                  {language === 'ar' ? DISCIPLINE_TRANSLATIONS[disc]?.ar || disc : disc}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Reviewers Grid Cards (Zero-Pill & Single Elevation) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredReviewers.map((r) => {
          const discipline = DISCIPLINE_TRANSLATIONS[r.major];
          return (
            <div
              key={r.id}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-colors flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header with Name & Rating */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{r.name}</h3>
                    <p className="text-xs text-slate-500 line-clamp-1">{r.affiliation}</p>
                  </div>
                  <div className="flex items-center gap-0.5 text-amber-500 shrink-0">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span className="text-xs font-mono font-bold text-slate-700">{r.rating || 5}.0</span>
                  </div>
                </div>

                {/* Major Discipline */}
                <div className="text-xs font-semibold text-blue-700 bg-blue-50/60 p-2 rounded-lg border border-blue-100">
                  {language === 'ar' ? discipline?.ar || r.major : discipline?.en || r.major}
                </div>

                {/* Reviewing Interests */}
                <div className="text-xs text-slate-600 line-clamp-2">
                  <span className="font-semibold text-slate-800">{language === 'ar' ? 'الاهتمامات: ' : 'Interests: '}</span>
                  {r.reviewingInterests}
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-center font-mono">
                  <div>
                    <span className="text-[10px] text-slate-500 block">{language === 'ar' ? 'أنجز' : 'Done'}</span>
                    <span className="font-bold text-slate-900 text-xs tabular-nums">{r.reviewsCompleted}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">{language === 'ar' ? 'متوسط الأيام' : 'Avg Days'}</span>
                    <span className="font-bold text-slate-900 text-xs tabular-nums">{r.averageDaysToComplete}d</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">{language === 'ar' ? 'آخر تكليف' : 'Idle'}</span>
                    <span className="font-bold text-slate-900 text-xs tabular-nums">{r.daysSinceLastReview}d</span>
                  </div>
                </div>

                {/* Contact and Payment details */}
                <div className="space-y-1 text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2 truncate font-mono">
                    <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{r.email}</span>
                  </div>
                  <div className="flex items-center gap-2 truncate font-mono">
                    <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{r.mobile}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <CreditCard className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span className="font-semibold">{r.paymentMethod}</span>
                    {r.paymentDetails && <span className="text-slate-400 truncate">({r.paymentDetails})</span>}
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <a
                    href={`mailto:${r.email}?subject=AASJ%20Peer%20Review%20Invitation`}
                    className="font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <Mail className="w-3 h-3" />
                    <span>{language === 'ar' ? 'دعوة تحكيم' : 'Invite'}</span>
                  </a>

                  <button
                    onClick={() => setSelectedReviewerForCert(r)}
                    className="flex items-center gap-1 text-3xs font-extrabold text-amber-800 hover:text-amber-950 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                    title="إصدار شهادة شكر وتقدير معتمدة"
                  >
                    <Award className="w-3.5 h-3.5 text-amber-600" />
                    <span>{language === 'ar' ? 'الشهادة' : 'Cert'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(r)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 rounded transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(language === 'ar' ? 'حذف المحكم من السجل؟' : 'Remove reviewer?')) {
                        deleteReviewer(r.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Reviewer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-slate-900/70 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden my-1 sm:my-auto flex flex-col max-h-[96dvh] sm:max-h-[94vh]">
            <div className="px-4 sm:px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0 sticky top-0 z-20">
              <h3 className="font-bold text-sm">
                {editingItem
                  ? language === 'ar' ? 'تعديل بيانات المحكم' : 'Edit Reviewer'
                  : language === 'ar' ? 'إضافة محكم جديد لقاعدة البيانات' : 'Add New Reviewer'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-3 text-xs overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">
                    {language === 'ar' ? 'اسم المحكم الرباعي:' : 'Reviewer Name:'}
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Prof. / Dr. ..."
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">
                    {language === 'ar' ? 'البريد الإلكتروني:' : 'Reviewer Email:'}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">
                  {language === 'ar' ? 'الجامعة / الجهة الأكاديمية:' : 'Reviewer Affiliation:'}
                </label>
                <input
                  type="text"
                  value={affiliation}
                  onChange={(e) => setAffiliation(e.target.value)}
                  required
                  placeholder="e.g. Faculty of Agriculture, Cairo University"
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">{language === 'ar' ? 'الهاتف الجوال:' : 'Mobile:'}</label>
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    required
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">{language === 'ar' ? 'الهاتف الأرضي:' : 'Telephone:'}</label>
                  <input
                    type="tel"
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">{language === 'ar' ? 'الفاكس:' : 'Fax:'}</label>
                  <input
                    type="tel"
                    value={fax}
                    onChange={(e) => setFax(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">
                  {language === 'ar' ? 'التخصص الرئيسي (Major):' : 'Major Discipline:'}
                </label>
                <select
                  value={major}
                  onChange={(e) => setMajor(e.target.value as JournalDiscipline)}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                >
                  {disciplinesList.map((d) => (
                    <option key={d} value={d}>
                      {language === 'ar' ? DISCIPLINE_TRANSLATIONS[d]?.ar || d : d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">
                  {language === 'ar' ? 'الاهتمامات والمجالات البحثية للتحكيم:' : 'Reviewing Interests:'}
                </label>
                <textarea
                  rows={2}
                  value={reviewingInterests}
                  onChange={(e) => setReviewingInterests(e.target.value)}
                  placeholder="e.g. soil fertility, biochar, salinity remediation, drip irrigation..."
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              {/* Payment Settings */}
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg space-y-3">
                <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wide">
                  {language === 'ar' ? 'طريقة استلام المكافآت المالية للتحكيم' : 'Payment & Honorarium Method'}
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-600 block mb-1">
                      {language === 'ar' ? 'الطريقة المفضلة:' : 'Preferred Method:'}
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as ReviewerPaymentMethod)}
                      className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                    >
                      {paymentMethods.map((pm) => (
                        <option key={pm} value={pm}>{pm}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-600 block mb-1">
                      {language === 'ar' ? 'بيانات الحساب / الرقم:' : 'Payment Details / Account:'}
                    </label>
                    <input
                      type="text"
                      value={paymentDetails}
                      onChange={(e) => setPaymentDetails(e.target.value)}
                      placeholder="Account number, phone wallet, IBAN..."
                      className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Metrics (Days & Performance) */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-600 block mb-1">{language === 'ar' ? 'أبحاث منجزة:' : 'Completed:'}</label>
                  <input
                    type="number"
                    value={reviewsCompleted}
                    onChange={(e) => setReviewsCompleted(Number(e.target.value))}
                    className="w-full p-1.5 border border-slate-300 rounded font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-600 block mb-1">{language === 'ar' ? 'اعتذار عن التحكيم:' : 'Declined:'}</label>
                  <input
                    type="number"
                    value={reviewRequestsDeclined}
                    onChange={(e) => setReviewRequestsDeclined(Number(e.target.value))}
                    className="w-full p-1.5 border border-slate-300 rounded font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-600 block mb-1">{language === 'ar' ? 'متوسط الأيام:' : 'Avg Days:'}</label>
                  <input
                    type="number"
                    value={averageDaysToComplete}
                    onChange={(e) => setAverageDaysToComplete(Number(e.target.value))}
                    className="w-full p-1.5 border border-slate-300 rounded font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  {language === 'ar' ? 'حفظ بيانات المحكم' : 'Save Reviewer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Reviewer Appreciation Certificate Modal */}
      {selectedReviewerForCert && (
        <ReviewerCertificateModal
          reviewer={selectedReviewerForCert}
          onClose={() => setSelectedReviewerForCert(null)}
        />
      )}
    </div>
  );
};
