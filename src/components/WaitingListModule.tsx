import React, { useState } from 'react';
import {
  Clock,
  Plus,
  Search,
  Trash2,
  Edit,
  ArrowUp,
  ArrowDown,
  CheckCircle,
  FileText,
} from 'lucide-react';
import { useJournal } from '../context/JournalContext';
import { DISCIPLINE_TRANSLATIONS } from '../translations';
import { JournalDiscipline, WaitingListItem } from '../types/journal';

export const WaitingListModule: React.FC = () => {
  const { language, waitingList, addWaitingItem, updateWaitingItem, deleteWaitingItem, manuscripts } = useJournal();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WaitingListItem | null>(null);

  // Form State
  const [manuscriptId, setManuscriptId] = useState('');
  const [manuscriptTitle, setManuscriptTitle] = useState('');
  const [authorNames, setAuthorNames] = useState('');
  const [subjects, setSubjects] = useState<JournalDiscipline>('Plant Production');
  const [volume, setVolume] = useState<number>(12);
  const [issue, setIssue] = useState<number>(1);
  const [waitingNumber, setWaitingNumber] = useState<number>(waitingList.length + 1);
  const [notes, setNotes] = useState('');

  const disciplinesList: JournalDiscipline[] = [
    'Agricultural Economics, Rural Sociology and Agricultural Extension',
    'Animal and Poultry Production',
    'Chemistry, Agricultural Microbiology, and Genetics',
    'Dairy Science, Food Science and Technology',
    'Plant Pathology and Plant Protection',
    'Plant Production',
    'Soils and Water, and Agricultural Engineering',
  ];

  // Auto-fill from manuscript ID if chosen
  const handleSelectExistingManuscript = (mId: string) => {
    setManuscriptId(mId);
    const m = manuscripts.find((item) => item.id === mId);
    if (m) {
      setManuscriptTitle(m.articleTitle);
      setAuthorNames(m.authorsNames || `${m.correspondAuthorFirstName} ${m.correspondAuthorLastName}`);
      if (m.subjectsRelated[0]) setSubjects(m.subjectsRelated[0]);
      setVolume(m.volume);
      setIssue(m.issue);
    }
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setManuscriptId('');
    setManuscriptTitle('');
    setAuthorNames('');
    setSubjects('Plant Production');
    setVolume(12);
    setIssue(1);
    setWaitingNumber(waitingList.length + 1);
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: WaitingListItem) => {
    setEditingItem(item);
    setManuscriptId(item.manuscriptId);
    setManuscriptTitle(item.manuscriptTitle);
    setAuthorNames(item.authorNames);
    setSubjects(item.subjects);
    setVolume(item.volume);
    setIssue(item.issue);
    setWaitingNumber(item.waitingNumber);
    setNotes(item.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manuscriptId || !manuscriptTitle) {
      alert(language === 'ar' ? 'يرجى إكمال البيانات المطلوبة' : 'Please fill all required fields');
      return;
    }

    if (editingItem) {
      updateWaitingItem(editingItem.id, {
        manuscriptId,
        manuscriptTitle,
        authorNames,
        subjects,
        volume: Number(volume),
        issue: Number(issue),
        waitingNumber: Number(waitingNumber),
        notes,
      });
    } else {
      addWaitingItem({
        manuscriptId,
        manuscriptTitle,
        authorNames,
        subjects,
        volume: Number(volume),
        issue: Number(issue),
        waitingNumber: Number(waitingNumber),
        notes,
      });
    }

    setIsModalOpen(false);
  };

  const movePriority = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= waitingList.length) return;
    
    const current = waitingList[index];
    const target = waitingList[targetIndex];

    updateWaitingItem(current.id, { waitingNumber: target.waitingNumber });
    updateWaitingItem(target.id, { waitingNumber: current.waitingNumber });
  };

  const filteredItems = waitingList
    .filter((item) => {
      const q = searchTerm.toLowerCase().trim();
      if (!q) return true;
      return (
        item.manuscriptId.toLowerCase().includes(q) ||
        item.manuscriptTitle.toLowerCase().includes(q) ||
        item.authorNames.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => a.waitingNumber - b.waitingNumber);

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {language === 'ar' ? 'قائمة الانتظار وإدارة الأعداد (Waiting List)' : 'Waiting List & Issue Queue'}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {language === 'ar'
                ? 'تنظيم المخطوطات المقبولة وترتيب أسبقية النشر حسب المجلدات والأعداد الدورية للمجلة.'
                : 'Prioritize accepted papers and allocate them to scheduled volumes and upcoming issues.'}
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'ar' ? 'إدراج في قائمة الانتظار' : 'Add to Waiting List'}</span>
          </button>
        </div>

        {/* Search */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
          <div className="relative w-full max-w-md">
            <Search className="w-3.5 h-3.5 absolute top-2.5 right-3 rtl:right-3 rtl:left-auto ltr:left-3 ltr:right-auto text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={language === 'ar' ? 'بحث برقم المخطوطة أو العنوان أو الباحث...' : 'Search by ID, title, author...'}
              className="w-full text-xs py-2 px-3 rtl:pr-8 ltr:pl-8 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <span className="text-xs font-mono text-slate-500 hidden sm:inline">
            {filteredItems.length} {language === 'ar' ? 'بحث في الانتظار' : 'queued papers'}
          </span>
        </div>
      </div>

      {/* Queue Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {filteredItems.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4 text-center font-mono w-16">{language === 'ar' ? 'الدور' : 'No.'}</th>
                  <th className="py-3 px-4 font-mono">{language === 'ar' ? 'رقم المخطوطة' : 'Manuscript ID'}</th>
                  <th className="py-3 px-4">{language === 'ar' ? 'عنوان البحث والباحثون' : 'Title & Authors'}</th>
                  <th className="py-3 px-4">{language === 'ar' ? 'التخصص العلمي' : 'Subject'}</th>
                  <th className="py-3 px-4 font-mono">{language === 'ar' ? 'المجلد / العدد المستهدف' : 'Target Issue'}</th>
                  <th className="py-3 px-4 text-center">{language === 'ar' ? 'الترتيب والإجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredItems.map((item, idx) => {
                  const discipline = DISCIPLINE_TRANSLATIONS[item.subjects];
                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      {/* Queue Number */}
                      <td className="py-3 px-4 text-center font-mono font-bold text-blue-600">
                        #{item.waitingNumber}
                      </td>

                      {/* Manuscript ID */}
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                        {item.manuscriptId}
                      </td>

                      {/* Title & Authors */}
                      <td className="py-3 px-4 max-w-sm">
                        <div className="font-semibold text-slate-900 line-clamp-1">{item.manuscriptTitle}</div>
                        <div className="text-[11px] text-slate-500 truncate">{item.authorNames}</div>
                        {item.notes && <div className="text-[10px] text-amber-700 italic mt-0.5">{item.notes}</div>}
                      </td>

                      {/* Discipline */}
                      <td className="py-3 px-4 text-slate-600 max-w-xs">
                        <span className="truncate block" title={language === 'ar' ? discipline?.ar : discipline?.en}>
                          {discipline ? (language === 'ar' ? discipline.ar : discipline.en) : item.subjects}
                        </span>
                      </td>

                      {/* Volume & Issue */}
                      <td className="py-3 px-4 font-mono whitespace-nowrap text-slate-700">
                        Vol. {item.volume}, Issue {item.issue}
                      </td>

                      {/* Reorder and Delete */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => movePriority(idx, 'up')}
                            disabled={idx === 0}
                            className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-30 rounded"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => movePriority(idx, 'down')}
                            disabled={idx === filteredItems.length - 1}
                            className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-30 rounded"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1 text-slate-400 hover:text-blue-600 rounded ml-1"
                            title="Edit"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(language === 'ar' ? 'حذف من قائمة الانتظار؟' : 'Remove from waiting list?')) {
                                deleteWaitingItem(item.id);
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
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400 text-xs">
            <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p>{language === 'ar' ? 'لا توجد أبحاث مسجلة في قائمة الانتظار' : 'Waiting list is empty'}</p>
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
                  ? language === 'ar' ? 'تعديل بيانات قائمة الانتظار' : 'Edit Waiting Queue Item'
                  : language === 'ar' ? 'إدراج بحث في قائمة الانتظار' : 'Add to Waiting List'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-3 text-xs overflow-y-auto flex-1">
              {/* Optional Quick Link with existing manuscript */}
              {!editingItem && (
                <div>
                  <label className="text-slate-500 font-medium block mb-1">
                    {language === 'ar' ? 'اختيار من المخطوطات المسجلة (تعبئة تلقائية):' : 'Pick from registered manuscripts:'}
                  </label>
                  <select
                    onChange={(e) => handleSelectExistingManuscript(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50"
                  >
                    <option value="">— {language === 'ar' ? 'إدخال يدوي أو اختر بحثاً' : 'Select a manuscript or manual'} —</option>
                    {manuscripts.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.id} - {m.articleTitle.slice(0, 50)}...
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
                  placeholder="e.g. AASJ-2026-074"
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
                  {language === 'ar' ? 'أسماء الباحثين (Author Names):' : "Authors' Names:"}
                </label>
                <input
                  type="text"
                  value={authorNames}
                  onChange={(e) => setAuthorNames(e.target.value)}
                  required
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">
                  {language === 'ar' ? 'التخصص العلمي:' : 'Subjects Related:'}
                </label>
                <select
                  value={subjects}
                  onChange={(e) => setSubjects(e.target.value as JournalDiscipline)}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                >
                  {disciplinesList.map((d) => (
                    <option key={d} value={d}>
                      {language === 'ar' ? DISCIPLINE_TRANSLATIONS[d]?.ar || d : d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">{language === 'ar' ? 'المجلد:' : 'Volume:'}</label>
                  <input
                    type="number"
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    required
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">{language === 'ar' ? 'العدد:' : 'Issue:'}</label>
                  <input
                    type="number"
                    value={issue}
                    onChange={(e) => setIssue(Number(e.target.value))}
                    required
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">{language === 'ar' ? 'رقم الدور:' : 'Queue No:'}</label>
                  <input
                    type="number"
                    value={waitingNumber}
                    onChange={(e) => setWaitingNumber(Number(e.target.value))}
                    required
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
                  placeholder={language === 'ar' ? 'ملاحظات الإصدار أو الجدولة...' : 'Scheduling notes...'}
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
                  {language === 'ar' ? 'حفظ البيانات' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
