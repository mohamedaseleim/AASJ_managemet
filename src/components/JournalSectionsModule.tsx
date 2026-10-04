import React from 'react';
import {
  Layers,
  FileText,
  Users,
  ChevronRight,
  UserCheck,
  Building2,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useJournal } from '../context/JournalContext';
import { JOURNAL_SECTIONS } from '../data/journalSections';
import { JournalDiscipline } from '../types/journal';

export const JournalSectionsModule: React.FC<{
  onSelectSectionFilter: (discipline: JournalDiscipline) => void;
}> = ({ onSelectSectionFilter }) => {
  const { language, manuscripts, reviewers } = useJournal();
  const { users, currentUser } = useAuth();

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-700" />
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide">
              {language === 'ar' ? 'الهيكل الأكاديمي للمجلة' : 'Academic Structure'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-serif text-slate-900">
            {language === 'ar'
              ? 'أجزاء المجلة السبعة والتخصصات العلمية المعتمدة'
              : 'The Seven Journal Sections (Departments)'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-4xl leading-relaxed">
            {language === 'ar'
              ? 'تتكون مجلة أرشيف العلوم الزراعية (AASJ) من سبعة أجزاء علمية رئيسية تمثل الأقسام الأكاديمية لكلية الزراعة (فرع أسيوط) بجامعة الأزهر. يشرف على كل جزء محرر تنفيذي (Executive Editor) معني بمتابعة التدفق التحريري وتحكيم أبحاث القسم.'
              : 'Archives of Agriculture Sciences Journal consists of seven official disciplinary parts corresponding to the academic departments of the Faculty of Agriculture (Assiut Branch), Al-Azhar University. Each section is directed by an Executive Editor.'}
          </p>
        </div>
      </div>

      {/* Grid of the 7 Journal Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {JOURNAL_SECTIONS.map((sec) => {
          // Count manuscripts in this section
          const sectionManuscripts = manuscripts.filter((m) =>
            m.subjectsRelated.includes(sec.discipline)
          );
          // Find the assigned executive editor
          const executiveEditor = users.find(
            (u) => u.role === 'executive_editor' && u.assignedSection === sec.discipline
          );
          // Reviewers in this discipline
          const sectionReviewers = reviewers.filter((r) => r.major === sec.discipline);

          const isUserSection =
            currentUser?.role === 'executive_editor' &&
            currentUser.assignedSection === sec.discipline;

          return (
            <div
              key={sec.id}
              className={`bg-white border rounded-xl p-5 shadow-xs flex flex-col justify-between transition-all hover:shadow-md ${
                isUserSection
                  ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                  : 'border-slate-200 hover:border-emerald-300'
              }`}
            >
              <div className="space-y-3">
                {/* Header Badge */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Dept: {sec.departmentCode} · Part {sec.id}
                  </span>
                  {isUserSection && (
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                      {language === 'ar' ? 'قسمك الإشرافي ✓' : 'Your Section ✓'}
                    </span>
                  )}
                </div>

                {/* Section Titles */}
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-serif leading-snug">
                    {language === 'ar' ? sec.arabicName : sec.englishName}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {language === 'ar' ? sec.englishName : sec.arabicName}
                  </p>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                  {language === 'ar' ? sec.descriptionAr : sec.descriptionEn}
                </p>

                {/* Executive Editor Card */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{language === 'ar' ? 'المحرر التنفيذي للجزء:' : 'Executive Section Editor:'}</span>
                  </div>
                  {executiveEditor ? (
                    <div>
                      <p className="font-bold text-slate-900 text-xs">{executiveEditor.fullName}</p>
                      <p className="text-[11px] text-slate-500 font-mono">{executiveEditor.email}</p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">
                      {language === 'ar' ? 'بانتظار تعيين محرر تنفيذي للقسم' : 'Pending appointment'}
                    </p>
                  )}
                </div>

                {/* Counts */}
                <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono">
                  <div className="p-2 bg-emerald-50/50 rounded border border-emerald-100">
                    <span className="text-[10px] text-slate-500 block">{language === 'ar' ? 'المخطوطات' : 'Papers'}</span>
                    <span className="font-bold text-emerald-900 text-sm">{sectionManuscripts.length}</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">{language === 'ar' ? 'المحكمون' : 'Reviewers'}</span>
                    <span className="font-bold text-slate-900 text-sm">{sectionReviewers.length}</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <button
                  onClick={() => onSelectSectionFilter(sec.discipline)}
                  className="w-full py-2 px-3 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>
                    {language === 'ar'
                      ? `استعراض أبحاث هذا الجزء (${sectionManuscripts.length}) ←`
                      : `View Section Manuscripts (${sectionManuscripts.length}) →`}
                  </span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
