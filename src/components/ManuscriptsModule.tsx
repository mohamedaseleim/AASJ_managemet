import React, { useMemo, useState, useEffect } from 'react';
import {
  Search,
  Filter,
  FileText,
  Printer,
  Edit,
  Trash2,
  Eye,
  Plus,
  ArrowUpDown,
  Layers,
  AlertTriangle,
  Bell,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useJournal } from '../context/JournalContext';
import { useNotifications } from '../context/NotificationContext';
import { DISCIPLINE_TRANSLATIONS, STATUS_TRANSLATIONS } from '../translations';
import { JournalDiscipline, Manuscript, ManuscriptStatus } from '../types/journal';

export const ManuscriptsModule: React.FC<{
  onSelectManuscript: (m: Manuscript) => void;
  onEditManuscript: (m: Manuscript) => void;
  onPrintLetter: (m: Manuscript) => void;
  onOpenAdd: () => void;
  initialDisciplineFilter?: string;
}> = ({
  onSelectManuscript,
  onEditManuscript,
  onPrintLetter,
  onOpenAdd,
  initialDisciplineFilter = 'all',
}) => {
  const { language, manuscripts, deleteManuscript, globalSearch } = useJournal();
  const { currentUser } = useAuth();
  const { activeOverdueNotifications, overdueCount } = useNotifications();
  
  const [localSearch, setLocalSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [onlyOverdueFilter, setOnlyOverdueFilter] = useState(false);
  const [disciplineFilter, setDisciplineFilter] = useState<string>(() => {
    if (initialDisciplineFilter && initialDisciplineFilter !== 'all') {
      return initialDisciplineFilter;
    }
    if (currentUser?.role === 'executive_editor' && currentUser.assignedSection) {
      return currentUser.assignedSection;
    }
    return 'all';
  });
  const [sortBy, setSortBy] = useState<'id' | 'date' | 'title'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    if (initialDisciplineFilter && initialDisciplineFilter !== 'all') {
      setDisciplineFilter(initialDisciplineFilter);
    }
  }, [initialDisciplineFilter]);

  // Filter & Search Logic
  const filteredManuscripts = useMemo(() => {
    const q = (localSearch || globalSearch).toLowerCase().trim();

    return manuscripts.filter((m) => {
      // Text search
      if (q) {
        const matchId = m.id.toLowerCase().includes(q);
        const matchTitle = m.articleTitle.toLowerCase().includes(q);
        const matchAuthor = (m.authorsNames || '').toLowerCase().includes(q) ||
          m.correspondAuthorFirstName.toLowerCase().includes(q) ||
          m.correspondAuthorLastName.toLowerCase().includes(q) ||
          (m.firstAuthorFullName || '').toLowerCase().includes(q);
        const matchDoi = (m.doi || '').toLowerCase().includes(q);
        const matchKeywords = (m.keywords || '').toLowerCase().includes(q);

        if (!matchId && !matchTitle && !matchAuthor && !matchDoi && !matchKeywords) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== 'all') {
        if (statusFilter === 'under_review') {
          if (!m.status.includes('Review') && m.status !== 'Similarity Check' && m.status !== 'Submitted Manuscript') {
            return false;
          }
        } else if (statusFilter === 'in_revision') {
          if (!m.status.includes('Revision') && !m.status.includes('Resubmit')) {
            return false;
          }
        } else if (statusFilter === 'accepted') {
          if (!m.status.includes('Accepted') && !m.status.includes('Galley')) {
            return false;
          }
        } else if (statusFilter === 'published') {
          if (m.status !== 'Manuscript Published in Journal') {
            return false;
          }
        } else if (statusFilter === 'rejected') {
          if (!m.status.includes('Rejected')) {
            return false;
          }
        } else if (m.status !== statusFilter) {
          return false;
        }
      }

      // Discipline filter
      if (disciplineFilter !== 'all') {
        if (!m.subjectsRelated.includes(disciplineFilter as JournalDiscipline)) {
          return false;
        }
      }

      // Overdue Reviewer Filter
      if (onlyOverdueFilter) {
        const hasOverdueReviewer = activeOverdueNotifications.some((n) => n.manuscriptId === m.id);
        if (!hasOverdueReviewer) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'date') {
        cmp = (a.receiveDate || '').localeCompare(b.receiveDate || '');
      } else if (sortBy === 'id') {
        cmp = a.id.localeCompare(b.id);
      } else if (sortBy === 'title') {
        cmp = a.articleTitle.localeCompare(b.articleTitle);
      }
      return sortOrder === 'desc' ? -cmp : cmp;
    });
  }, [manuscripts, localSearch, globalSearch, statusFilter, disciplineFilter, onlyOverdueFilter, activeOverdueNotifications, sortBy, sortOrder]);

  const handleDelete = (m: Manuscript, e: React.MouseEvent) => {
    e.stopPropagation();
    if (
      window.confirm(
        language === 'ar'
          ? `هل أنت متأكد من حذف المخطوطة ${m.id} نهائياً؟`
          : `Permanently delete manuscript ${m.id}?`
      )
    ) {
      deleteManuscript(m.id);
    }
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
    <div className="space-y-6">
      {/* Module Title & Top Action Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {language === 'ar' ? 'سجل المخطوطات والأبحاث العلمية' : 'Manuscripts & Research Submissions'}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {language === 'ar'
                ? `إدارة ${manuscripts.length} مخطوطة بحثية مع تتبع كافة مراحل التحكيم والتعديل وقرارات القبول والنشر.`
                : `Managing ${manuscripts.length} manuscripts through peer-review, revisions, and publication decisions.`}
            </p>
          </div>

          <button
            onClick={onOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'ar' ? 'إضافة مخطوطة جديدة' : 'Add Manuscript'}</span>
          </button>
        </div>

        {/* Filters and Search Bar */}
        <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute top-2.5 right-3 rtl:right-3 rtl:left-auto ltr:left-3 ltr:right-auto text-slate-400" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder={language === 'ar' ? 'بحث بالرقم أو العنوان أو المؤلف...' : 'Search by ID, title, author...'}
              className="w-full text-xs py-2 px-3 rtl:pr-8 ltr:pl-8 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
            />
          </div>

          {/* Workflow Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 truncate"
            >
              <option value="all">{language === 'ar' ? 'جميع الحالات التحريرية' : 'All Statuses'}</option>
              <option value="Submitted Manuscript">{language === 'ar' ? 'مقدمة حديثاً' : 'Submitted Manuscript'}</option>
              <option value="under_review">{language === 'ar' ? 'قيد التحكيم العلمي (جميعها)' : 'Under Peer Review'}</option>
              <option value="in_revision">{language === 'ar' ? 'بانتظار تعديل الباحث' : 'In Revision'}</option>
              <option value="accepted">{language === 'ar' ? 'أبحاث مقبولة للنشر' : 'Accepted for Publication'}</option>
              <option value="published">{language === 'ar' ? 'أبحاث منشورة في المجلة' : 'Published in Journal'}</option>
              <option value="rejected">{language === 'ar' ? 'أبحاث مرفوضة' : 'Rejected Manuscripts'}</option>
            </select>
          </div>

          {/* Scientific Discipline Filter */}
          <div>
            <select
              value={disciplineFilter}
              onChange={(e) => setDisciplineFilter(e.target.value)}
              className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 truncate"
            >
              <option value="all">{language === 'ar' ? 'جميع التخصصات العلمية' : 'All Disciplines'}</option>
              {disciplinesList.map((disc) => (
                <option key={disc} value={disc}>
                  {language === 'ar' ? DISCIPLINE_TRANSLATIONS[disc]?.ar || disc : disc}
                </option>
              ))}
            </select>
          </div>

          {/* Sorting Control */}
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              <option value="date">{language === 'ar' ? 'ترتيب حسب: التاريخ' : 'Sort by Date'}</option>
              <option value="id">{language === 'ar' ? 'ترتيب حسب: رقم المخطوطة' : 'Sort by ID'}</option>
              <option value="title">{language === 'ar' ? 'ترتيب حسب: العنوان' : 'Sort by Title'}</option>
            </select>
            <button
              onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
              className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-600 transition-colors shrink-0"
              title="Toggle Sort Order"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Results Count & Active Filters Indicator */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-mono px-1 flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span>
            {language === 'ar' ? 'النتائج المعروضة: ' : 'Showing: '}
            <strong className="text-slate-900">{filteredManuscripts.length}</strong> {language === 'ar' ? 'مخطوطة' : 'manuscripts'}
          </span>

          {overdueCount > 0 && (
            <button
              type="button"
              onClick={() => setOnlyOverdueFilter(!onlyOverdueFilter)}
              className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-3xs font-extrabold transition-all cursor-pointer ${
                onlyOverdueFilter
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-300'
              }`}
              title="عرض الأبحاث التي تأخر محكموها فقط"
            >
              <AlertTriangle className="w-3 h-3 text-rose-500" />
              <span>أبحاث بها تأخر تحكيم ({overdueCount})</span>
            </button>
          )}
        </div>

        {(statusFilter !== 'all' || disciplineFilter !== 'all' || localSearch || onlyOverdueFilter) && (
          <button
            onClick={() => {
              setStatusFilter('all');
              setDisciplineFilter('all');
              setLocalSearch('');
              setOnlyOverdueFilter(false);
            }}
            className="text-blue-600 hover:underline font-sans"
          >
            {language === 'ar' ? 'إعادة ضبط التصفية' : 'Reset filters'}
          </button>
        )}
      </div>

      {/* Manuscripts Container: Desktop Table & Mobile Cards */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {filteredManuscripts.length > 0 ? (
          <>
            {/* 1. Mobile Cards View (md:hidden) */}
            <div className="md:hidden divide-y divide-slate-100">
              {filteredManuscripts.map((m) => {
                const statusInfo = STATUS_TRANSLATIONS[m.status] || {
                  ar: m.status,
                  en: m.status,
                  badgeClass: 'text-slate-700 bg-slate-100',
                };
                const primaryDiscipline = m.subjectsRelated[0]
                  ? DISCIPLINE_TRANSLATIONS[m.subjectsRelated[0]]
                  : null;
                const hasOverdueReviewer = activeOverdueNotifications.some((n) => n.manuscriptId === m.id);

                return (
                  <div
                    key={m.id}
                    onClick={() => onSelectManuscript(m)}
                    className="p-3.5 hover:bg-slate-50 transition-colors cursor-pointer space-y-2.5"
                  >
                    {/* Card Top: ID, Status Badge & Date */}
                    <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {m.id}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          Vol. {m.volume}, Iss. {m.issue}
                        </span>
                        {hasOverdueReviewer && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-3xs font-extrabold bg-rose-100 text-rose-950 border border-rose-300 animate-pulse">
                            <AlertTriangle className="w-3 h-3 text-rose-700" />
                            <span>تأخر تحكيم</span>
                          </span>
                        )}
                      </div>
                      <span className={`inline-block px-2 py-0.5 rounded-md font-semibold text-[10.5px] ${statusInfo.badgeClass}`}>
                        {language === 'ar' ? statusInfo.ar : statusInfo.en}
                      </span>
                    </div>

                    {/* Card Title */}
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">
                        {m.articleTitle}
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-1 truncate">
                        {m.authorsNames || `${m.correspondAuthorFirstName} ${m.correspondAuthorLastName}`}
                      </p>
                      {primaryDiscipline && (
                        <p className="text-[10.5px] text-emerald-800 font-medium mt-0.5 truncate">
                          {language === 'ar' ? primaryDiscipline.ar : primaryDiscipline.en}
                        </p>
                      )}
                    </div>

                    {/* Mobile Action Buttons - ALL VISIBLE AND EASY TO TAP */}
                    <div
                      className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5 flex-wrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Acceptance Letter Button - High Prominence */}
                      <button
                        onClick={() => onPrintLetter(m)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
                        title={language === 'ar' ? 'فتح وطباعة خطاب القبول' : 'Acceptance Letter'}
                      >
                        <Printer className="w-3.5 h-3.5 text-emerald-100" />
                        <span>{language === 'ar' ? 'خطاب القبول' : 'Acceptance Letter'}</span>
                      </button>

                      {/* View Dossier */}
                      <button
                        onClick={() => onSelectManuscript(m)}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                        title={language === 'ar' ? 'عرض الملف الكامل' : 'View Dossier'}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{language === 'ar' ? 'الملف' : 'View'}</span>
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => onEditManuscript(m)}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                        title={language === 'ar' ? 'تعديل' : 'Edit'}
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>{language === 'ar' ? 'تعديل' : 'Edit'}</span>
                      </button>

                      {/* Delete */}
                      <button
                        onClick={(e) => handleDelete(m, e)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer ml-auto rtl:mr-auto rtl:ml-0"
                        title={language === 'ar' ? 'حذف' : 'Delete'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 2. Desktop Table View (hidden md:block) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left rtl:text-right border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-4 font-mono">{language === 'ar' ? 'الرقم' : 'ID'}</th>
                    <th className="py-3 px-4">{language === 'ar' ? 'عنوان البحث والمؤلفون' : 'Title & Authors'}</th>
                    <th className="py-3 px-4">{language === 'ar' ? 'التخصص العلمي' : 'Discipline'}</th>
                    <th className="py-3 px-4">{language === 'ar' ? 'العدد / التاريخ' : 'Issue / Date'}</th>
                    <th className="py-3 px-4">{language === 'ar' ? 'الحالة التحريرية' : 'Status'}</th>
                    <th className="py-3 px-4 text-center">{language === 'ar' ? 'الإجراءات' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredManuscripts.map((m) => {
                    const statusInfo = STATUS_TRANSLATIONS[m.status] || {
                      ar: m.status,
                      en: m.status,
                      badgeClass: 'text-slate-700 bg-slate-100',
                    };
                    const primaryDiscipline = m.subjectsRelated[0]
                      ? DISCIPLINE_TRANSLATIONS[m.subjectsRelated[0]]
                      : null;

                    return (
                      <tr
                        key={m.id}
                        onClick={() => onSelectManuscript(m)}
                        className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                      >
                        {/* ID */}
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                          {m.id}
                        </td>

                        {/* Title & Author */}
                        <td className="py-3.5 px-4 max-w-md">
                          <div className="font-semibold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                            {m.articleTitle}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate mt-0.5">
                            {m.authorsNames || `${m.correspondAuthorFirstName} ${m.correspondAuthorLastName}`}
                            {m.correspondAuthorAffiliation && (
                              <span> · {m.correspondAuthorAffiliation}</span>
                            )}
                          </div>
                        </td>

                        {/* Discipline */}
                        <td className="py-3.5 px-4 max-w-xs text-slate-600">
                          <span className="truncate block" title={primaryDiscipline ? (language === 'ar' ? primaryDiscipline.ar : primaryDiscipline.en) : ''}>
                            {primaryDiscipline ? (language === 'ar' ? primaryDiscipline.ar : primaryDiscipline.en) : '—'}
                          </span>
                        </td>

                        {/* Issue & Date */}
                        <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px] text-slate-600">
                          <div>Vol. {m.volume}, Iss. {m.issue}</div>
                          <div className="text-slate-400">{m.receiveDate}</div>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1 items-start">
                            <span className={`inline-block px-2.5 py-0.5 rounded-md font-medium text-[11px] ${statusInfo.badgeClass}`}>
                              {language === 'ar' ? statusInfo.ar : statusInfo.en}
                            </span>
                            {activeOverdueNotifications.some((n) => n.manuscriptId === m.id) && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-3xs font-extrabold bg-rose-100 text-rose-950 border border-rose-300 animate-pulse">
                                <AlertTriangle className="w-3 h-3 text-rose-700" />
                                <span>تأخر تحكيم</span>
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => onPrintLetter(m)}
                              className="flex items-center gap-1 px-2 py-1 text-white bg-emerald-600 hover:bg-emerald-500 rounded text-xs font-semibold transition-colors shadow-xs"
                              title={language === 'ar' ? 'خطاب القبول' : 'Acceptance Letter'}
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span className="text-[11px]">{language === 'ar' ? 'خطاب القبول' : 'Letter'}</span>
                            </button>
                            <button
                              onClick={() => onSelectManuscript(m)}
                              className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title={language === 'ar' ? 'عرض الملف الكامل' : 'View Dossier'}
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onEditManuscript(m)}
                              className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                              title={language === 'ar' ? 'تعديل' : 'Edit'}
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => handleDelete(m, e)}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                              title={language === 'ar' ? 'حذف' : 'Delete'}
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
          </>
        ) : (
          <div className="py-14 text-center space-y-3">
            <FileText className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">
              {language === 'ar' ? 'لا توجد مخطوطات مطابقة لشروط البحث' : 'No manuscripts matching your criteria'}
            </p>
            <button
              onClick={() => {
                setStatusFilter('all');
                setDisciplineFilter('all');
                setLocalSearch('');
              }}
              className="px-3 py-1.5 text-xs text-blue-600 hover:text-blue-800 font-semibold"
            >
              {language === 'ar' ? 'إعادة ضبط كل عوامل التصفية' : 'Clear all filters'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
