import React, { useState } from 'react';
import {
  Coins,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Printer,
  Edit,
  Trash2,
} from 'lucide-react';
import { useJournal } from '../context/JournalContext';
import { DonationRecord } from '../types/journal';

export const DonatesModule: React.FC<{
  onPrintReceipt: (d: DonationRecord) => void;
}> = ({ onPrintReceipt }) => {
  const { language, donations, addDonation, updateDonation, deleteDonation, manuscripts } = useJournal();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterReceived, setFilterReceived] = useState<'all' | 'Yes' | 'No'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DonationRecord | null>(null);

  // Form State
  const [manuscriptId, setManuscriptId] = useState('');
  const [manuscriptTitle, setManuscriptTitle] = useState('');
  const [authorsNames, setAuthorsNames] = useState('');
  const [manuscriptStatus, setManuscriptStatus] = useState<'Under Reviewing' | 'Under Revising' | 'Under Publishing' | 'Published'>('Under Publishing');
  const [donateReceived, setDonateReceived] = useState<'Yes' | 'No'>('No');
  const [donateDate, setDonateDate] = useState('');
  const [donateAmount, setDonateAmount] = useState<number>(200);
  const [currency, setCurrency] = useState<'USD' | 'EGP' | 'SDG' | 'SAR' | 'EUR'>('USD');
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');
  const [receiptNumber, setReceiptNumber] = useState('');
  const [notes, setNotes] = useState('');

  const handleSelectManuscript = (mId: string) => {
    setManuscriptId(mId);
    const m = manuscripts.find((item) => item.id === mId);
    if (m) {
      setManuscriptTitle(m.articleTitle);
      setAuthorsNames(m.authorsNames || `${m.correspondAuthorFirstName} ${m.correspondAuthorLastName}`);
      if (m.status.includes('Published')) setManuscriptStatus('Published');
      else if (m.status.includes('Revision')) setManuscriptStatus('Under Revising');
      else setManuscriptStatus('Under Publishing');
    }
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setManuscriptId('');
    setManuscriptTitle('');
    setAuthorsNames('');
    setManuscriptStatus('Under Publishing');
    setDonateReceived('No');
    setDonateDate('');
    setDonateAmount(200);
    setCurrency('USD');
    setPaymentMethod('Bank Transfer');
    setReceiptNumber(`AASJ-REC-${Date.now().toString().slice(-4)}`);
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (d: DonationRecord) => {
    setEditingItem(d);
    setManuscriptId(d.manuscriptId);
    setManuscriptTitle(d.manuscriptTitle);
    setAuthorsNames(d.authorsNames);
    setManuscriptStatus(d.manuscriptStatus);
    setDonateReceived(d.donateReceived);
    setDonateDate(d.donateDate || '');
    setDonateAmount(d.donateAmount);
    setCurrency(d.currency);
    setPaymentMethod(d.paymentMethod || 'Bank Transfer');
    setReceiptNumber(d.receiptNumber || '');
    setNotes(d.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manuscriptId || !manuscriptTitle) {
      alert(language === 'ar' ? 'يرجى إكمال البيانات المطلوبة' : 'Please provide required fields');
      return;
    }

    if (editingItem) {
      updateDonation(editingItem.id, {
        manuscriptId,
        manuscriptTitle,
        authorsNames,
        manuscriptStatus,
        donateReceived,
        donateDate: donateReceived === 'Yes' && !donateDate ? new Date().toISOString().split('T')[0] : donateDate,
        donateAmount: Number(donateAmount),
        currency,
        paymentMethod,
        receiptNumber,
        notes,
      });
    } else {
      addDonation({
        manuscriptId,
        manuscriptTitle,
        authorsNames,
        manuscriptStatus,
        donateReceived,
        donateDate: donateReceived === 'Yes' && !donateDate ? new Date().toISOString().split('T')[0] : donateDate,
        donateAmount: Number(donateAmount),
        currency,
        paymentMethod,
        receiptNumber,
        notes,
      });
    }

    setIsModalOpen(false);
  };

  const toggleReceivedStatus = (d: DonationRecord) => {
    const nextStatus = d.donateReceived === 'Yes' ? 'No' : 'Yes';
    updateDonation(d.id, {
      donateReceived: nextStatus,
      donateDate: nextStatus === 'Yes' ? (d.donateDate || new Date().toISOString().split('T')[0]) : '',
    });
  };

  const filteredDonations = donations.filter((d) => {
    if (filterReceived !== 'all' && d.donateReceived !== filterReceived) return false;
    const q = searchTerm.toLowerCase().trim();
    if (!q) return true;
    return (
      d.manuscriptId.toLowerCase().includes(q) ||
      d.manuscriptTitle.toLowerCase().includes(q) ||
      d.authorsNames.toLowerCase().includes(q) ||
      (d.receiptNumber || '').toLowerCase().includes(q)
    );
  });

  const totalCollected = donations
    .filter((d) => d.donateReceived === 'Yes')
    .reduce((sum, d) => sum + d.donateAmount, 0);

  const totalPending = donations
    .filter((d) => d.donateReceived === 'No')
    .reduce((sum, d) => sum + d.donateAmount, 0);

  return (
    <div className="space-y-6">
      {/* Title & Stats */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {language === 'ar' ? 'سجل رسوم النشر الأكاديمي والتبرعات (APC & Donates)' : 'APC Publishing Fees & Donations'}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {language === 'ar'
                ? 'متابعة سداد رسوم معالجة المقالات (Article Processing Charges) وإصدار إيصالات القبض الرسمية.'
                : 'Track author publication fees, institutional waivers, and print official verified receipts.'}
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'ar' ? 'تسجيل رسوم / تبرع جديد' : 'Record Fee / Donation'}</span>
          </button>
        </div>

        {/* Quick Financial Summary Bar */}
        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[11px] text-slate-500 block mb-0.5">{language === 'ar' ? 'إجمالي السجلات' : 'Total Records'}</span>
            <span className="font-mono text-base font-bold text-slate-900">{donations.length}</span>
          </div>
          <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
            <span className="text-[11px] text-emerald-700 block mb-0.5">{language === 'ar' ? 'المبالغ المحصلة' : 'Collected'}</span>
            <span className="font-mono text-base font-bold text-emerald-800">${totalCollected}</span>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
            <span className="text-[11px] text-amber-700 block mb-0.5">{language === 'ar' ? 'مبالغ قيد السداد' : 'Pending'}</span>
            <span className="font-mono text-base font-bold text-amber-800">${totalPending}</span>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <span className="text-[11px] text-blue-700 block mb-0.5">{language === 'ar' ? 'نسبة التحصيل' : 'Collection Rate'}</span>
            <span className="font-mono text-base font-bold text-blue-800">
              {donations.length ? Math.round((donations.filter((d) => d.donateReceived === 'Yes').length / donations.length) * 100) : 0}%
            </span>
          </div>
        </div>

        {/* Search & Status Filter */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-3.5 h-3.5 absolute top-2.5 right-3 rtl:right-3 rtl:left-auto ltr:left-3 ltr:right-auto text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={language === 'ar' ? 'بحث برقم المخطوطة أو اسم الباحث أو السند...' : 'Search by ID, title, author, voucher...'}
              className="w-full text-xs py-2 px-3 rtl:pr-8 ltr:pl-8 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs self-stretch sm:self-auto">
            <button
              onClick={() => setFilterReceived('all')}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
                filterReceived === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {language === 'ar' ? 'الكل' : 'All'}
            </button>
            <button
              onClick={() => setFilterReceived('Yes')}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
                filterReceived === 'Yes' ? 'bg-white text-emerald-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {language === 'ar' ? 'تم الاستلام' : 'Paid'}
            </button>
            <button
              onClick={() => setFilterReceived('No')}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
                filterReceived === 'No' ? 'bg-white text-amber-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {language === 'ar' ? 'معلق' : 'Pending'}
            </button>
          </div>
        </div>
      </div>

      {/* Donations Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {filteredDonations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4 font-mono">{language === 'ar' ? 'رقم المخطوطة' : 'Manuscript ID'}</th>
                  <th className="py-3 px-4">{language === 'ar' ? 'عنوان البحث والمؤلفون' : 'Title & Authors'}</th>
                  <th className="py-3 px-4">{language === 'ar' ? 'حالة النشر' : 'Stage'}</th>
                  <th className="py-3 px-4">{language === 'ar' ? 'المبلغ المطلوب' : 'Amount'}</th>
                  <th className="py-3 px-4">{language === 'ar' ? 'طريقة السداد والتاريخ' : 'Method & Date'}</th>
                  <th className="py-3 px-4 text-center">{language === 'ar' ? 'حالة الاستلام' : 'Status'}</th>
                  <th className="py-3 px-4 text-center">{language === 'ar' ? 'الإجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredDonations.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                    {/* ID */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {d.manuscriptId}
                    </td>

                    {/* Title */}
                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="font-semibold text-slate-900 line-clamp-1">{d.manuscriptTitle}</div>
                      <div className="text-[11px] text-slate-500 truncate">{d.authorsNames}</div>
                    </td>

                    {/* Stage */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium">
                        {d.manuscriptStatus}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 font-mono font-bold whitespace-nowrap text-slate-900">
                      ${d.donateAmount} {d.currency}
                    </td>

                    {/* Method & Date */}
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                      <div>{d.paymentMethod || 'Bank Wire'}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{d.donateDate || '—'}</div>
                    </td>

                    {/* Received Toggle */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => toggleReceivedStatus(d)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors ${
                          d.donateReceived === 'Yes'
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                        }`}
                      >
                        {d.donateReceived === 'Yes' ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{language === 'ar' ? 'تم الاستلام' : 'Received'}</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5" />
                            <span>{language === 'ar' ? 'معلق / غير مدفوع' : 'Pending'}</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onPrintReceipt(d)}
                          className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded"
                          title={language === 'ar' ? 'طباعة سند القبض' : 'Print Voucher'}
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(d)}
                          className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                          title="Edit"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(language === 'ar' ? 'حذف سجل الرسوم؟' : 'Delete payment record?')) {
                              deleteDonation(d.id);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400 text-xs">
            <Coins className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p>{language === 'ar' ? 'لا توجد سجلات رسوم مطابقة' : 'No donation / APC records found'}</p>
          </div>
        )}
      </div>

      {/* Add / Edit Donation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-slate-900/70 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden my-1 sm:my-auto flex flex-col max-h-[96dvh] sm:max-h-[94vh]">
            <div className="px-4 sm:px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0 sticky top-0 z-20">
              <h3 className="font-bold text-sm">
                {editingItem
                  ? language === 'ar' ? 'تعديل سجل رسوم النشر' : 'Edit APC / Donation Record'
                  : language === 'ar' ? 'إضافة سجل رسوم نشر / تبرع' : 'Record APC Fee / Donation'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-3 text-xs overflow-y-auto flex-1">
              {!editingItem && (
                <div>
                  <label className="text-slate-500 font-medium block mb-1">
                    {language === 'ar' ? 'اختيار من المخطوطات المسجلة:' : 'Auto-fill from manuscript:'}
                  </label>
                  <select
                    onChange={(e) => handleSelectManuscript(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50"
                  >
                    <option value="">— {language === 'ar' ? 'إدخال يدوي أو اختر بحثاً' : 'Select a manuscript'}</option>
                    {manuscripts.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.id} - {m.articleTitle.slice(0, 45)}...
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="text-slate-700 font-semibold block mb-1">
                  {language === 'ar' ? 'رقم المخطوطة (Manuscript ID):' : 'Manuscript ID:'}
                </label>
                <input
                  type="text"
                  value={manuscriptId}
                  onChange={(e) => setManuscriptId(e.target.value)}
                  required
                  placeholder="e.g. AASJ-2026-081"
                  className="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">
                  {language === 'ar' ? 'عنوان البحث (Manuscript Title):' : 'Manuscript Title:'}
                </label>
                <input
                  type="text"
                  value={manuscriptTitle}
                  onChange={(e) => setManuscriptTitle(e.target.value)}
                  required
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">
                  {language === 'ar' ? 'اسم الباحث / المؤلفين:' : "Authors' Names:"}
                </label>
                <input
                  type="text"
                  value={authorsNames}
                  onChange={(e) => setAuthorsNames(e.target.value)}
                  required
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">
                    {language === 'ar' ? 'حالة المخطوطة:' : 'Manuscript Status:'}
                  </label>
                  <select
                    value={manuscriptStatus}
                    onChange={(e) => setManuscriptStatus(e.target.value as any)}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Under Reviewing">Under Reviewing</option>
                    <option value="Under Revising">Under Revising</option>
                    <option value="Under Publishing">Under Publishing</option>
                    <option value="Published">Published</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 font-semibold block mb-1">
                    {language === 'ar' ? 'تم استلام المبلغ؟' : 'Donate Received:'}
                  </label>
                  <div className="flex items-center gap-4 mt-2">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="donateReceived"
                        value="Yes"
                        checked={donateReceived === 'Yes'}
                        onChange={() => setDonateReceived('Yes')}
                      />
                      <span>{language === 'ar' ? 'نعم (تم الاستلام)' : 'Yes'}</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="donateReceived"
                        value="No"
                        checked={donateReceived === 'No'}
                        onChange={() => setDonateReceived('No')}
                      />
                      <span>{language === 'ar' ? 'لا (معلق)' : 'No'}</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">{language === 'ar' ? 'المبلغ:' : 'Amount:'}</label>
                  <input
                    type="number"
                    value={donateAmount}
                    onChange={(e) => setDonateAmount(Number(e.target.value))}
                    required
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">{language === 'ar' ? 'العملة:' : 'Currency:'}</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as any)}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white font-mono"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EGP">EGP (ج.م)</option>
                    <option value="SDG">SDG (ج.س)</option>
                    <option value="SAR">SAR (ر.س)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">{language === 'ar' ? 'تاريخ السداد:' : 'Payment Date:'}</label>
                  <input
                    type="date"
                    value={donateDate}
                    onChange={(e) => setDonateDate(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">
                    {language === 'ar' ? 'طريقة التحويل / السداد:' : 'Payment Method:'}
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Bank Transfer">Bank Transfer (تحويل بنكي)</option>
                    <option value="PayPal">PayPal</option>
                    <option value="Vodafone Cash">Vodafone Cash (فودافون كاش)</option>
                    <option value="Fawry">Fawry (فوري)</option>
                    <option value="WE Pay">WE Pay</option>
                    <option value="Orange Cash">Orange Cash</option>
                    <option value="Etisalat Cash">Etisalat Cash</option>
                    <option value="Cash">Cash (نقدي)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 font-semibold block mb-1">
                    {language === 'ar' ? 'رقم الإيصال / السند:' : 'Receipt / Voucher No:'}
                  </label>
                  <input
                    type="text"
                    value={receiptNumber}
                    onChange={(e) => setReceiptNumber(e.target.value)}
                    placeholder="AASJ-REC-..."
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">{language === 'ar' ? 'ملاحظات:' : 'Notes:'}</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={language === 'ar' ? 'ملاحظات البنك أو الإعفاء...' : 'Bank wire reference, waiver notes...'}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
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
                  {language === 'ar' ? 'حفظ السجل' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
