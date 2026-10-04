import React, { useState } from 'react';
import {
  TrendingUp,
  Plus,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  Calendar,
  ExternalLink,
  Edit,
  Trash2,
} from 'lucide-react';
import { useJournal } from '../context/JournalContext';
import { CashFlowTransaction } from '../types/journal';

export const CashFlowModule: React.FC = () => {
  const { language, cashFlow, addCashTransaction, updateCashTransaction, deleteCashTransaction, manuscripts } = useJournal();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'incoming' | 'outgoing'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CashFlowTransaction | null>(null);

  // Form State
  const [id, setId] = useState(`TXN-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
  const [transactionType, setTransactionType] = useState<'incoming' | 'outgoing'>('incoming');
  const [amount, setAmount] = useState<number>(200);
  const [currency, setCurrency] = useState<'USD' | 'EGP' | 'SDG'>('USD');
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<any>('APC Publishing Fee');
  const [description, setDescription] = useState('');
  const [documentUrl, setDocumentUrl] = useState('');
  const [relatedManuscriptId, setRelatedManuscriptId] = useState('');

  const categories = [
    'APC Publishing Fee',
    'Reviewer Honorarium',
    'Author Donation',
    'Page Layout & Typesetting',
    'Language Editing',
    'Web Hosting & DOI Registration',
    'Office & Editorial Expenses',
    'Other',
  ];

  const handleOpenAdd = () => {
    setEditingItem(null);
    setId(`TXN-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
    setTransactionType('incoming');
    setAmount(200);
    setCurrency('USD');
    setTransactionDate(new Date().toISOString().split('T')[0]);
    setCategory('APC Publishing Fee');
    setDescription('');
    setDocumentUrl('');
    setRelatedManuscriptId('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tx: CashFlowTransaction) => {
    setEditingItem(tx);
    setId(tx.id);
    setTransactionType(tx.transactionType);
    setAmount(tx.amount);
    setCurrency(tx.currency);
    setTransactionDate(tx.transactionDate);
    setCategory(tx.category);
    setDescription(tx.description);
    setDocumentUrl(tx.documentUrl || '');
    setRelatedManuscriptId(tx.relatedManuscriptId || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || amount <= 0) {
      alert(language === 'ar' ? 'يرجى إدخال الوصف ومبلغ صحيح' : 'Please provide description and valid amount');
      return;
    }

    if (editingItem) {
      updateCashTransaction(editingItem.id, {
        transactionType,
        amount: Number(amount),
        currency,
        transactionDate,
        category,
        description,
        documentUrl,
        relatedManuscriptId,
      });
    } else {
      addCashTransaction({
        id,
        transactionType,
        amount: Number(amount),
        currency,
        transactionDate,
        category,
        description,
        documentUrl,
        relatedManuscriptId,
      });
    }

    setIsModalOpen(false);
  };

  const filteredTransactions = cashFlow.filter((tx) => {
    if (typeFilter !== 'all' && tx.transactionType !== typeFilter) return false;
    const q = searchTerm.toLowerCase().trim();
    if (!q) return true;
    return (
      tx.id.toLowerCase().includes(q) ||
      tx.description.toLowerCase().includes(q) ||
      tx.category.toLowerCase().includes(q) ||
      (tx.relatedManuscriptId || '').toLowerCase().includes(q)
    );
  });

  // Summary Metrics
  const totalInflow = cashFlow
    .filter((tx) => tx.transactionType === 'incoming')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalOutflow = cashFlow
    .filter((tx) => tx.transactionType === 'outgoing')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const netBalance = totalInflow - totalOutflow;

  return (
    <div className="space-y-6">
      {/* Title & Stats */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {language === 'ar' ? 'حركة التدفق النقدي والمالية (Cash Flow & Financial Ledger)' : 'Cash Flow & Financial Ledger'}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {language === 'ar'
                ? 'سجل الإيرادات من رسوم النشر والتبرعات مقابل مصروفات مكافآت المحكمين واستضافة المجلة والإخراج الفني.'
                : 'Journal accounting ledger tracking APC inflows, reviewer honorariums, and production expenses.'}
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'ar' ? 'إضافة معاملة مالية' : 'Add Transaction'}</span>
          </button>
        </div>

        {/* Financial KPI Cards with Tabular Numerals */}
        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wide">
                {language === 'ar' ? 'إجمالي المقبوضات (الإيرادات)' : 'Total Inflow (Revenue)'}
              </span>
              <div className="text-2xl font-bold text-emerald-900 font-mono tabular-nums mt-1">
                +${totalInflow.toLocaleString()}
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-200/60 flex items-center justify-center text-emerald-800">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 bg-rose-50 rounded-xl border border-rose-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-rose-800 uppercase tracking-wide">
                {language === 'ar' ? 'إجمالي المدفوعات (المصروفات)' : 'Total Outflow (Expenses)'}
              </span>
              <div className="text-2xl font-bold text-rose-900 font-mono tabular-nums mt-1">
                -${totalOutflow.toLocaleString()}
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-rose-200/60 flex items-center justify-center text-rose-800">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 bg-slate-900 text-white rounded-xl border border-slate-800 flex items-center justify-between shadow-xs">
            <div>
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
                {language === 'ar' ? 'صافي الرصيد النقدي' : 'Net Operating Balance'}
              </span>
              <div className="text-2xl font-bold text-amber-400 font-mono tabular-nums mt-1">
                ${netBalance.toLocaleString()}
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-amber-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Search & Type Filter */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-3.5 h-3.5 absolute top-2.5 right-3 rtl:right-3 rtl:left-auto ltr:left-3 ltr:right-auto text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={language === 'ar' ? 'بحث برقم المعاملة أو الوصف أو التصنيف...' : 'Search by ID, description, category...'}
              className="w-full text-xs py-2 px-3 rtl:pr-8 ltr:pl-8 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs self-stretch sm:self-auto">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
                typeFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {language === 'ar' ? 'كافة المعاملات' : 'All Transactions'}
            </button>
            <button
              onClick={() => setTypeFilter('incoming')}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
                typeFilter === 'incoming' ? 'bg-white text-emerald-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {language === 'ar' ? 'إيرادات (+)' : 'Inflow (+)'}
            </button>
            <button
              onClick={() => setTypeFilter('outgoing')}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
                typeFilter === 'outgoing' ? 'bg-white text-rose-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {language === 'ar' ? 'مصروفات (-)' : 'Outflow (-)'}
            </button>
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {filteredTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4 font-mono">{language === 'ar' ? 'رقم الإذن' : 'Txn ID'}</th>
                  <th className="py-3 px-4">{language === 'ar' ? 'البيان والوصف' : 'Description'}</th>
                  <th className="py-3 px-4">{language === 'ar' ? 'البند المالي' : 'Category'}</th>
                  <th className="py-3 px-4 font-mono">{language === 'ar' ? 'التاريخ' : 'Date'}</th>
                  <th className="py-3 px-4 font-mono">{language === 'ar' ? 'المبلغ' : 'Amount'}</th>
                  <th className="py-3 px-4 text-center">{language === 'ar' ? 'الإجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                    {/* ID */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {tx.id}
                    </td>

                    {/* Description */}
                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="font-semibold text-slate-900">{tx.description}</div>
                      {tx.relatedManuscriptId && (
                        <div className="text-[11px] text-blue-600 font-mono mt-0.5">
                          Ref: {tx.relatedManuscriptId}
                        </div>
                      )}
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-700">
                      <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[11px] font-medium">
                        {tx.category}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono text-slate-600 text-[11px]">
                      {tx.transactionDate}
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono font-bold">
                      <span className={tx.transactionType === 'incoming' ? 'text-emerald-700' : 'text-rose-700'}>
                        {tx.transactionType === 'incoming' ? '+' : '-'}${tx.amount.toLocaleString()} {tx.currency}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        {tx.documentUrl && (
                          <a
                            href={tx.documentUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 text-slate-400 hover:text-blue-600 rounded"
                            title="Receipt Document"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <button
                          onClick={() => handleOpenEdit(tx)}
                          className="p-1 text-slate-400 hover:text-blue-600 rounded"
                          title="Edit"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(language === 'ar' ? 'حذف المعاملة المالية؟' : 'Delete transaction?')) {
                              deleteCashTransaction(tx.id);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded"
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
            <TrendingUp className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p>{language === 'ar' ? 'لا توجد معاملات مالية مسجلة' : 'No financial transactions found'}</p>
          </div>
        )}
      </div>

      {/* Add / Edit Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-slate-900/70 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden my-1 sm:my-auto flex flex-col max-h-[96dvh] sm:max-h-[94vh]">
            <div className="px-4 sm:px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0 sticky top-0 z-20">
              <h3 className="font-bold text-sm">
                {editingItem
                  ? language === 'ar' ? 'تعديل المعاملة المالية' : 'Edit Transaction'
                  : language === 'ar' ? 'تسجيل معاملة نقدية جديدة' : 'Add Cash Flow Transaction'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-3 text-xs overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">
                    {language === 'ar' ? 'رقم الإذن / المعاملة:' : 'Transaction ID:'}
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
                  <label className="text-slate-700 font-semibold block mb-1">
                    {language === 'ar' ? 'نوع الحركة (Type):' : 'Transaction Type:'}
                  </label>
                  <select
                    value={transactionType}
                    onChange={(e) => setTransactionType(e.target.value as any)}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white font-bold"
                  >
                    <option value="incoming">{language === 'ar' ? 'إيرادات واردة (Inflow)' : 'Incoming (Inflow)'}</option>
                    <option value="outgoing">{language === 'ar' ? 'مصروفات صادرة (Outflow)' : 'Outgoing (Outflow)'}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">{language === 'ar' ? 'المبلغ:' : 'Amount:'}</label>
                  <input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    required
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold text-sm"
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
                  </select>
                </div>
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">{language === 'ar' ? 'التاريخ:' : 'Date:'}</label>
                  <input
                    type="date"
                    value={transactionDate}
                    onChange={(e) => setTransactionDate(e.target.value)}
                    required
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">
                  {language === 'ar' ? 'البند والتصنيف المالي:' : 'Category:'}
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">
                  {language === 'ar' ? 'شرح وبيان المعاملة:' : 'Description:'}
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  placeholder="e.g. Peer reviewer evaluation stipend for Prof. Galal..."
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">
                    {language === 'ar' ? 'رقم المخطوطة المرتبطة (إن وجد):' : 'Related Manuscript ID:'}
                  </label>
                  <input
                    type="text"
                    value={relatedManuscriptId}
                    onChange={(e) => setRelatedManuscriptId(e.target.value)}
                    placeholder="AASJ-2026-..."
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-semibold block mb-1">
                    {language === 'ar' ? 'رابط الإيصال / الفاتورة (Document URL):' : 'Document URL:'}
                  </label>
                  <input
                    type="url"
                    value={documentUrl}
                    onChange={(e) => setDocumentUrl(e.target.value)}
                    placeholder="https://aasj.ppmj.net/..."
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono"
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
                  {language === 'ar' ? 'حفظ المعاملة' : 'Save Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
