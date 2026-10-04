import React from 'react';
import { Printer, X } from 'lucide-react';
import { useJournal } from '../context/JournalContext';
import { DonationRecord } from '../types/journal';
import { AasjLogo } from './AasjLogo';

export const ReceiptVoucherModal: React.FC<{
  donation: DonationRecord;
  onClose: () => void;
}> = ({ donation, onClose }) => {
  const { language } = useJournal();

  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-slate-900/70 backdrop-blur-xs p-1.5 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden my-1 sm:my-auto flex flex-col max-h-[96dvh] sm:max-h-[96vh]">
        
        {/* Toolbar - Sticky & shrink-0 */}
        <div className="p-3 sm:px-6 sm:py-3 bg-slate-900 text-white flex items-center justify-between gap-2 shrink-0 sticky top-0 z-20 shadow-md print:hidden">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-bold text-xs sm:text-sm truncate">
              {language === 'ar' ? 'إيصال سداد رسوم النشر (APC)' : 'Official APC Payment Voucher'}
            </span>
            <span className="text-xs text-amber-400 font-mono shrink-0">[{donation.manuscriptId}]</span>
          </div>

          <div className="flex items-center gap-2 shrink-0 ml-auto rtl:mr-auto rtl:ml-0">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'طباعة' : 'Print'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 active:bg-slate-700 rounded-lg transition-colors cursor-pointer bg-slate-800/60 border border-slate-700/50"
              title="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Voucher */}
        <div className="p-8 sm:p-12 bg-white text-slate-900 font-sans print:p-6">
          <div className="border border-slate-300 rounded-xl p-6 sm:p-8 relative">
            
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-200 pb-4 mb-6">
              <div>
                <h1 className="text-lg font-bold text-emerald-950 font-serif">
                  ARCHIVES OF AGRICULTURE SCIENCES JOURNAL
                </h1>
                <p className="text-xs font-bold text-emerald-800">
                  مجلة أرشيف العلوم الزراعية (AASJ) · كلية الزراعة بأسيوط، جامعة الأزهر
                </p>
                <p className="text-[11px] text-slate-600 font-mono">
                  Print ISSN: 2535-1680 · Online ISSN: 2535-1699 · https://aasj.journals.ekb.eg
                </p>
              </div>
              <AasjLogo className="w-14 h-14" />
            </div>

            {/* Title & Voucher Number */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-xs uppercase tracking-wider text-slate-500 font-bold block">
                  {language === 'ar' ? 'سند قبض مالي رسمي' : 'OFFICIAL PAYMENT RECEIPT'}
                </span>
                <span className="text-sm font-mono font-bold text-slate-900">
                  VOUCHER #{donation.receiptNumber || `AASJ-REC-${donation.id.replace('DON-', '')}`}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 block">{language === 'ar' ? 'تاريخ المعاملة' : 'Date'}</span>
                <span className="text-xs font-mono font-bold text-slate-900">{donation.donateDate || currentDate}</span>
              </div>
            </div>

            {/* Details Table */}
            <div className="bg-slate-50 rounded-lg border border-slate-200 p-4 space-y-3 text-xs mb-6">
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-500 font-semibold">{language === 'ar' ? 'رقم المخطوطة:' : 'Manuscript ID:'}</span>
                <span className="col-span-2 font-mono font-bold text-slate-900">{donation.manuscriptId}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-500 font-semibold">{language === 'ar' ? 'عنوان البحث:' : 'Article Title:'}</span>
                <span className="col-span-2 font-semibold text-slate-900">{donation.manuscriptTitle}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-500 font-semibold">{language === 'ar' ? 'اسم الباحث / المؤلفين:' : 'Received From:'}</span>
                <span className="col-span-2 text-slate-800">{donation.authorsNames}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-500 font-semibold">{language === 'ar' ? 'طريقة التحويل / السداد:' : 'Payment Method:'}</span>
                <span className="col-span-2 text-slate-800">{donation.paymentMethod || 'Bank Wire Transfer'}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-500 font-semibold">{language === 'ar' ? 'حالة السداد:' : 'Payment Status:'}</span>
                <span className="col-span-2">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    donation.donateReceived === 'Yes' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {donation.donateReceived === 'Yes'
                      ? (language === 'ar' ? 'تم استلام المبلغ بالكامل ✓' : 'PAID IN FULL ✓')
                      : (language === 'ar' ? 'معلق / بانتظار التأكيد' : 'PENDING PAYMENT')}
                  </span>
                </span>
              </div>
            </div>

            {/* Amount Box */}
            <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-200 rounded-lg mb-8">
              <span className="text-xs font-bold text-emerald-900 uppercase tracking-wide">
                {language === 'ar' ? 'المبلغ المستلم (رسوم معالجة النشر APC)' : 'Total Received (APC Fee)'}
              </span>
              <span className="text-xl font-mono font-extrabold text-emerald-800 tabular-nums">
                {donation.donateAmount} {donation.currency}
              </span>
            </div>

            {/* Footer / Treasury Signatures */}
            <div className="flex items-end justify-between pt-4 border-t border-slate-200 text-xs text-slate-600">
              <div>
                <p className="font-bold text-slate-900">{language === 'ar' ? 'أمانة الصندوق والشئون المالية' : 'Finance & Treasury Department'}</p>
                <p className="text-[11px] text-slate-500">Archives of Agriculture Sciences Journal · Al-Azhar University (Assiut)</p>
              </div>

              <div className="w-24 h-24 border border-dashed border-emerald-700 rounded-full flex flex-col items-center justify-center text-center text-emerald-800 text-[9px] font-bold p-1">
                <span>AASJ TREASURY</span>
                <span className="text-[10px] my-0.5 text-emerald-950">VERIFIED</span>
                <span>PAID</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
