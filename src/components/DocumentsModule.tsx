import React, { useState } from 'react';
import {
  Archive,
  Plus,
  Search,
  ExternalLink,
  Edit,
  Trash2,
  FileCheck,
  Send,
  Inbox,
  Cloud,
} from 'lucide-react';
import { useJournal } from '../context/JournalContext';
import { DocumentArchiveItem } from '../types/journal';

export const DocumentsModule: React.FC = () => {
  const { language, documents, addDocument, updateDocument, deleteDocument, setActiveModule } = useJournal();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'Outgoing' | 'Issued' | 'Incoming'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DocumentArchiveItem | null>(null);

  // Form State
  const [documentType, setDocumentType] = useState<'Outgoing' | 'Issued' | 'Incoming'>('Issued');
  const [documentDescription, setDocumentDescription] = useState('');
  const [outgoingNumber, setOutgoingNumber] = useState('');
  const [issuedOn, setIssuedOn] = useState('');
  const [incomingNumber, setIncomingNumber] = useState('');
  const [incomingDated, setIncomingDated] = useState('');
  const [archiveLocation, setArchiveLocation] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [senderOrRecipient, setSenderOrRecipient] = useState('');

  const handleOpenAdd = () => {
    setEditingItem(null);
    setDocumentType('Issued');
    setDocumentDescription('');
    setOutgoingNumber(`AASJ/DEC/${new Date().getFullYear()}/${Date.now().toString().slice(-3)}`);
    setIssuedOn(new Date().toISOString().split('T')[0]);
    setIncomingNumber('');
    setIncomingDated('');
    setArchiveLocation('Archive Cabinet A - Shelf 2');
    setFileUrl('');
    setSenderOrRecipient('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (doc: DocumentArchiveItem) => {
    setEditingItem(doc);
    setDocumentType(doc.documentType);
    setDocumentDescription(doc.documentDescription);
    setOutgoingNumber(doc.outgoingNumber || '');
    setIssuedOn(doc.issuedOn || '');
    setIncomingNumber(doc.incomingNumber || '');
    setIncomingDated(doc.incomingDated || '');
    setArchiveLocation(doc.archiveLocation || '');
    setFileUrl(doc.fileUrl || '');
    setSenderOrRecipient(doc.senderOrRecipient || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!documentDescription.trim()) {
      alert(language === 'ar' ? 'يرجى إدخال وصف الوثيقة' : 'Please provide document description');
      return;
    }

    if (editingItem) {
      updateDocument(editingItem.id, {
        documentType,
        documentDescription,
        outgoingNumber,
        issuedOn,
        incomingNumber,
        incomingDated,
        archiveLocation,
        fileUrl,
        senderOrRecipient,
      });
    } else {
      addDocument({
        documentType,
        documentDescription,
        outgoingNumber,
        issuedOn,
        incomingNumber,
        incomingDated,
        archiveLocation,
        fileUrl,
        senderOrRecipient,
      });
    }

    setIsModalOpen(false);
  };

  const filteredDocs = documents.filter((doc) => {
    if (typeFilter !== 'all' && doc.documentType !== typeFilter) return false;
    const q = searchTerm.toLowerCase().trim();
    if (!q) return true;
    return (
      doc.documentDescription.toLowerCase().includes(q) ||
      (doc.outgoingNumber || '').toLowerCase().includes(q) ||
      (doc.incomingNumber || '').toLowerCase().includes(q) ||
      doc.archiveLocation.toLowerCase().includes(q) ||
      (doc.senderOrRecipient || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Title & Stats */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {language === 'ar' ? 'أرشيف الوثائق والمستندات الرسمية (Files & Documents Archive)' : 'Official Documents & Archives'}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {language === 'ar'
                ? 'فهرسة وتوثيق المكاتبات الصادرة والواردة، قرارات هيئة التحرير، اتفاقيات الفهرسة، وأماكن الحفظ بالأرشيف.'
                : 'Indexing outgoing, incoming, and issued editorial decisions, MoUs, and shelf archive locations.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setActiveModule('google_drive')}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-emerald-950 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              <Cloud className="w-4 h-4 text-emerald-800" />
              <span>{language === 'ar' ? 'مجلدات Google Drive السحابية' : 'Google Drive Cloud Folders'}</span>
            </button>

            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'ar' ? 'أرشفة وثيقة جديدة' : 'Archive New Document'}</span>
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-3.5 h-3.5 absolute top-2.5 right-3 rtl:right-3 rtl:left-auto ltr:left-3 ltr:right-auto text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={language === 'ar' ? 'بحث برقم الصادر/الوارد أو الوصف أو الموقع...' : 'Search by reference number, description, shelf...'}
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
              {language === 'ar' ? 'الكل' : 'All'}
            </button>
            <button
              onClick={() => setTypeFilter('Issued')}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
                typeFilter === 'Issued' ? 'bg-white text-blue-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {language === 'ar' ? 'معتمدة / صادرة داخلية' : 'Issued'}
            </button>
            <button
              onClick={() => setTypeFilter('Outgoing')}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
                typeFilter === 'Outgoing' ? 'bg-white text-purple-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {language === 'ar' ? 'صادرة' : 'Outgoing'}
            </button>
            <button
              onClick={() => setTypeFilter('Incoming')}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
                typeFilter === 'Incoming' ? 'bg-white text-emerald-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {language === 'ar' ? 'واردة' : 'Incoming'}
            </button>
          </div>
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {filteredDocs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">{language === 'ar' ? 'نوع الوثيقة' : 'Type'}</th>
                  <th className="py-3 px-4">{language === 'ar' ? 'بيان وموضوع الوثيقة' : 'Description'}</th>
                  <th className="py-3 px-4 font-mono">{language === 'ar' ? 'رقم الإشارة والتاريخ' : 'Ref & Date'}</th>
                  <th className="py-3 px-4">{language === 'ar' ? 'موقع الحفظ بالأرشيف' : 'Archive Location'}</th>
                  <th className="py-3 px-4 text-center">{language === 'ar' ? 'الملف' : 'File'}</th>
                  <th className="py-3 px-4 text-center">{language === 'ar' ? 'الإجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                    {/* Type Badge */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold ${
                        doc.documentType === 'Issued'
                          ? 'bg-blue-50 text-blue-800 border border-blue-200'
                          : doc.documentType === 'Outgoing'
                          ? 'bg-purple-50 text-purple-800 border border-purple-200'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}>
                        {doc.documentType === 'Issued' && <FileCheck className="w-3 h-3" />}
                        {doc.documentType === 'Outgoing' && <Send className="w-3 h-3" />}
                        {doc.documentType === 'Incoming' && <Inbox className="w-3 h-3" />}
                        <span>
                          {doc.documentType === 'Issued'
                            ? (language === 'ar' ? 'معتمدة' : 'Issued')
                            : doc.documentType === 'Outgoing'
                            ? (language === 'ar' ? 'صادرة' : 'Outgoing')
                            : (language === 'ar' ? 'واردة' : 'Incoming')}
                        </span>
                      </span>
                    </td>

                    {/* Description */}
                    <td className="py-3.5 px-4 max-w-md">
                      <div className="font-semibold text-slate-900">{doc.documentDescription}</div>
                      {doc.senderOrRecipient && (
                        <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                          {doc.senderOrRecipient}
                        </div>
                      )}
                    </td>

                    {/* Numbers & Dates */}
                    <td className="py-3.5 px-4 font-mono text-[11px] whitespace-nowrap text-slate-700">
                      {doc.outgoingNumber && <div>Out: <span className="font-bold">{doc.outgoingNumber}</span></div>}
                      {doc.issuedOn && <div className="text-slate-400">Date: {doc.issuedOn}</div>}
                      {doc.incomingNumber && <div>In: <span className="font-bold">{doc.incomingNumber}</span></div>}
                      {doc.incomingDated && <div className="text-slate-400">Date: {doc.incomingDated}</div>}
                    </td>

                    {/* Archive Shelf */}
                    <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap">
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-medium border border-slate-200">
                        {doc.archiveLocation || 'Digital Archive'}
                      </span>
                    </td>

                    {/* File Attachment */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {doc.fileUrl ? (
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>{language === 'ar' ? 'عرض' : 'View'}</span>
                        </a>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(doc)}
                          className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                          title="Edit"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(language === 'ar' ? 'حذف الوثيقة من الأرشيف؟' : 'Delete archived document?')) {
                              deleteDocument(doc.id);
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
            <Archive className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p>{language === 'ar' ? 'لا توجد وثائق مؤرشفة مطابقة' : 'No archived documents found'}</p>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-slate-900/70 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden my-1 sm:my-auto flex flex-col max-h-[96dvh] sm:max-h-[94vh]">
            <div className="px-4 sm:px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0 sticky top-0 z-20">
              <h3 className="font-bold text-sm">
                {editingItem
                  ? language === 'ar' ? 'تعديل بيانات الوثيقة المؤرشفة' : 'Edit Archived Document'
                  : language === 'ar' ? 'أرشفة وتسجيل وثيقة جديدة' : 'Archive New Document'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-3 text-xs overflow-y-auto flex-1">
              <div>
                <label className="text-slate-700 font-semibold block mb-1">
                  {language === 'ar' ? 'نوع الوثيقة (Document Type):' : 'Document Type:'}
                </label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value as any)}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Issued">Issued (معتمدة / صادرة بقرار داخلي)</option>
                  <option value="Outgoing">Outgoing (صادرة لجهة خارجية أو باحث)</option>
                  <option value="Incoming">Incoming (واردة من مؤسسة أو باحث)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">
                  {language === 'ar' ? 'وصف وموضوع الوثيقة:' : 'Document Description:'}
                </label>
                <textarea
                  rows={2}
                  value={documentDescription}
                  onChange={(e) => setDocumentDescription(e.target.value)}
                  required
                  placeholder="e.g. Official Editorial Board Decision on Call for Papers..."
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">
                  {language === 'ar' ? 'الجهة المرسلة أو المستلمة:' : 'Sender or Recipient Organization:'}
                </label>
                <input
                  type="text"
                  value={senderOrRecipient}
                  onChange={(e) => setSenderOrRecipient(e.target.value)}
                  placeholder="e.g. Crossref USA, Red Sea University, Deanship..."
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">
                    {language === 'ar' ? 'الرقم الصادر (Outgoing Number):' : 'Outgoing Number:'}
                  </label>
                  <input
                    type="text"
                    value={outgoingNumber}
                    onChange={(e) => setOutgoingNumber(e.target.value)}
                    placeholder="AASJ/DEC/..."
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">
                    {language === 'ar' ? 'تاريخ الصدور (Issued On):' : 'Issued On:'}
                  </label>
                  <input
                    type="date"
                    value={issuedOn}
                    onChange={(e) => setIssuedOn(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">
                    {language === 'ar' ? 'الرقم الوارد (Incoming Number):' : 'Incoming Number:'}
                  </label>
                  <input
                    type="text"
                    value={incomingNumber}
                    onChange={(e) => setIncomingNumber(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">
                    {language === 'ar' ? 'تاريخ الورود (Incoming Dated):' : 'Incoming Dated:'}
                  </label>
                  <input
                    type="date"
                    value={incomingDated}
                    onChange={(e) => setIncomingDated(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">
                  {language === 'ar' ? 'موقع الحفظ بالأرشيف (Archive Location):' : 'Archive Location / Cabinet:'}
                </label>
                <input
                  type="text"
                  value={archiveLocation}
                  onChange={(e) => setArchiveLocation(e.target.value)}
                  required
                  placeholder="e.g. Cabinet A - Shelf 3 - Binder 2026"
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">
                  {language === 'ar' ? 'رابط الملف الرقمي (File URL):' : 'File URL / Digital Link:'}
                </label>
                <input
                  type="url"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  placeholder="https://aasj.ppmj.net/archive/..."
                  className="w-full p-2 border border-slate-300 rounded-lg font-mono"
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
                  {language === 'ar' ? 'حفظ الوثيقة' : 'Save Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
