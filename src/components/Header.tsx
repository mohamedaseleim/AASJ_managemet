import React, { useRef, useState } from 'react';
import {
  FileText,
  Clock,
  Coins,
  Archive,
  Users,
  TrendingUp,
  Download,
  Upload,
  RefreshCw,
  Globe,
  Search,
  ExternalLink,
  Layers,
  ShieldCheck,
  UserCheck,
  BookOpen,
  LogOut,
  Menu,
  X,
  Plus,
  Home,
  Activity,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Cloud,
  Sparkles,
  Mail,
  BarChart3,
  Award,
  Bell,
  Key,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useGoogleDrive } from '../context/GoogleDriveContext';
import { useJournal } from '../context/JournalContext';
import { useNotifications } from '../context/NotificationContext';
import { ROLE_INFO } from '../data/journalSections';
import { UI_STRINGS } from '../translations';
import { ActiveModule } from '../types/journal';
import { AasjLogo } from './AasjLogo';
import { LoginModal } from './LoginModal';
import { PWAInstallButton } from './PWAInstallButton';
import { AcademicProofreadingModal } from './AcademicProofreadingModal';
import { EmailTemplatesHubModal } from './EmailTemplatesHubModal';
import { AnnualEditorialReportModal } from './AnnualEditorialReportModal';
import { ReviewerNotificationsModal } from './ReviewerNotificationsModal';
import { ChangePasswordModal } from './ChangePasswordModal';

export const Header: React.FC<{ onOpenAddManuscript: () => void }> = ({ onOpenAddManuscript }) => {
  const {
    language,
    setLanguage,
    activeModule,
    setActiveModule,
    globalSearch,
    setGlobalSearch,
    resetToDefaultData,
    exportDatabaseJson,
    importDatabaseJson,
  } = useJournal();

  const { isGoogleConnected } = useGoogleDrive();
  const { currentUser, canAccessModule, logout } = useAuth();
  const { totalActiveAlertsCount, overdueCount, thresholdDays } = useNotifications();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showProofreadingModal, setShowProofreadingModal] = useState(false);
  const [showEmailHubModal, setShowEmailHubModal] = useState(false);
  const [showAnnualReportModal, setShowAnnualReportModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = UI_STRINGS[language];

  // Complete navigation items filtered by RBAC
  const allNavItems: {
    id: ActiveModule;
    label: string;
    icon: React.ReactNode;
    category: 'editorial' | 'academic' | 'finance' | 'admin' | 'portal';
    badge?: string;
  }[] = [
    {
      id: 'dashboard',
      label: t.nav.dashboard,
      icon: <TrendingUp className="w-4 h-4" />,
      category: 'editorial',
    },
    {
      id: 'sections',
      label: language === 'ar' ? 'أجزاء المجلة (7)' : '7 Sections',
      icon: <Layers className="w-4 h-4" />,
      category: 'editorial',
    },
    {
      id: 'manuscripts',
      label: t.nav.manuscripts,
      icon: <FileText className="w-4 h-4" />,
      category: 'editorial',
    },
    {
      id: 'waiting_list',
      label: t.nav.waitingList,
      icon: <Clock className="w-4 h-4" />,
      category: 'editorial',
    },
    {
      id: 'editorial_reports',
      label: t.nav.editorialReports,
      icon: <BarChart3 className="w-4 h-4" />,
      category: 'editorial',
      badge: language === 'ar' ? 'بياني' : 'Charts',
    },
    {
      id: 'reviewers',
      label: t.nav.reviewers,
      icon: <Users className="w-4 h-4" />,
      category: 'academic',
    },
    {
      id: 'certificates',
      label: language === 'ar' ? 'شهادات التحكيم (QR)' : 'Certificates',
      icon: <Award className="w-4 h-4" />,
      category: 'academic',
      badge: language === 'ar' ? 'معتمدة' : 'Official',
    },
    {
      id: 'files',
      label: t.nav.files,
      icon: <Archive className="w-4 h-4" />,
      category: 'academic',
    },
    {
      id: 'google_drive',
      label: t.nav.googleDrive,
      icon: <Cloud className="w-4 h-4" />,
      category: 'academic',
      badge: isGoogleConnected ? (language === 'ar' ? 'سحابي' : 'Cloud') : undefined,
    },
    {
      id: 'cash_flow',
      label: t.nav.cashFlow,
      icon: <TrendingUp className="w-4 h-4" />,
      category: 'finance',
    },
    {
      id: 'donates',
      label: t.nav.donates,
      icon: <Coins className="w-4 h-4" />,
      category: 'finance',
    },
    {
      id: 'users',
      label: language === 'ar' ? 'إدارة المستخدمين' : 'Users & Roles',
      icon: <ShieldCheck className="w-4 h-4" />,
      category: 'admin',
      badge: currentUser?.role === 'admin' ? (language === 'ar' ? 'تحكم كامل' : 'Full') : undefined,
    },
    {
      id: 'activity_logs',
      label: language === 'ar' ? 'سجل النشاطات' : 'Activity Logs',
      icon: <Activity className="w-4 h-4" />,
      category: 'admin',
      badge: language === 'ar' ? 'سري - الآدمن' : 'Admin Only',
    },
    {
      id: 'reviewer_portal',
      label: language === 'ar' ? 'بوابة المحكم' : 'Reviewer Portal',
      icon: <UserCheck className="w-4 h-4" />,
      category: 'portal',
    },
    {
      id: 'author_portal',
      label: language === 'ar' ? 'بوابة الباحث' : 'Author Portal',
      icon: <BookOpen className="w-4 h-4" />,
      category: 'portal',
    },
  ];

  const visibleNavItems = allNavItems.filter((item) => canAccessModule(item.id));

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importDatabaseJson(content);
        if (success) {
          alert(language === 'ar' ? 'تم استيراد البيانات بنجاح!' : 'Database imported successfully!');
        } else {
          alert(language === 'ar' ? 'فشل استيراد الملف، تحقق من صيغة JSON' : 'Failed to import JSON data');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const userRoleMeta = currentUser ? ROLE_INFO[currentUser.role] : null;

  const navigateTo = (mod: ActiveModule) => {
    setActiveModule(mod);
    setIsMobileMenuOpen(false);
  };

  const isAdmin = currentUser?.role === 'admin';

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-slate-300 shadow-sm">
        {/* Tier 1: Main Brand, Search, Utilities, User Status */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18 gap-2 sm:gap-4">
            
            {/* Brand Logo & Academic Identity */}
            <div
              className="flex items-center gap-2 sm:gap-3 shrink-0 cursor-pointer py-1"
              onClick={() => {
                if (currentUser?.role === 'reviewer') navigateTo('reviewer_portal');
                else if (currentUser?.role === 'author') navigateTo('author_portal');
                else navigateTo('dashboard');
              }}
              title="العودة للرئيسية"
            >
              <AasjLogo className="w-10 h-10 sm:w-11 sm:h-11" showSubtext={true} />
            </div>

            {/* Desktop Actions & Utilities */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              
              {/* Quick Search */}
              <div className="relative hidden md:block w-36 lg:w-48">
                <Search className="w-3.5 h-3.5 absolute top-2.5 right-3 rtl:right-3 rtl:left-auto ltr:left-3 ltr:right-auto text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                  placeholder={language === 'ar' ? 'بحث سريع...' : 'Search...'}
                  className="w-full text-xs py-1.5 px-3 rtl:pr-8 ltr:pl-8 bg-slate-50 hover:bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white text-slate-800 placeholder-slate-400 font-semibold transition-all shadow-2xs"
                />
              </div>

              {/* PWA Install Button */}
              <PWAInstallButton />

              {/* Reviewer Overdue Notifications Bell */}
              <button
                type="button"
                onClick={() => setShowNotificationsModal(true)}
                title={
                  totalActiveAlertsCount > 0
                    ? `إشعارات تأخر التحكيم: ${overdueCount} محكم متأخر عن المهلة (${thresholdDays} يوماً)`
                    : 'إشعارات التحكيم والمهل الزمنية'
                }
                className="relative p-2 text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl transition-all cursor-pointer shadow-2xs"
              >
                <Bell className={`w-4 h-4 ${overdueCount > 0 ? 'text-rose-600 animate-pulse' : 'text-slate-600'}`} />
                {totalActiveAlertsCount > 0 && (
                  <span
                    className={`absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full text-[10px] font-black flex items-center justify-center text-white border-2 border-white shadow-xs ${
                      overdueCount > 0 ? 'bg-rose-600 animate-bounce' : 'bg-amber-500'
                    }`}
                  >
                    {totalActiveAlertsCount}
                  </span>
                )}
              </button>

              {/* Language Switcher */}
              <button
                onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
                title={language === 'ar' ? 'Switch to English' : 'التحويل للعربية'}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:text-emerald-950 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl transition-colors cursor-pointer shadow-2xs"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-800" />
                <span>{language === 'ar' ? 'English' : 'عربي'}</span>
              </button>

              {/* Editorial & AI Utility Shortcuts */}
              <div className="hidden xl:flex items-center gap-1 bg-emerald-50/80 border border-emerald-200 rounded-xl p-0.5">
                <button
                  type="button"
                  onClick={() => setShowProofreadingModal(true)}
                  title="المساعد الأكاديمي وصياغة المستخلصات (Groq AI)"
                  className="flex items-center gap-1 px-2 py-1 text-3xs font-extrabold text-emerald-950 hover:bg-white rounded-lg transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>تدقيق AI</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowEmailHubModal(true)}
                  title="مركز قوالب المراسلات الأكاديمية"
                  className="flex items-center gap-1 px-2 py-1 text-3xs font-extrabold text-slate-800 hover:bg-white rounded-lg transition-all cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5 text-blue-600" />
                  <span>المراسلات</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowAnnualReportModal(true)}
                  title="تقرير الأداء السنوي والإحصائي لهيئة التحرير والعميد"
                  className="flex items-center gap-1 px-2 py-1 text-3xs font-extrabold text-slate-800 hover:bg-white rounded-lg transition-all cursor-pointer"
                >
                  <BarChart3 className="w-3.5 h-3.5 text-emerald-700" />
                  <span>التقرير السنوي</span>
                </button>
              </div>

              {/* Backup / Export / Reset Controls (Admin / Dean) */}
              {(isAdmin || currentUser?.role === 'general_supervisor') && (
                <div className="hidden lg:flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl p-0.5">
                  <button
                    onClick={exportDatabaseJson}
                    title={t.actions.exportJson}
                    className="p-1.5 text-slate-600 hover:text-emerald-900 hover:bg-white border border-transparent hover:border-slate-200 rounded-lg transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    title={t.actions.importJson}
                    className="p-1.5 text-slate-600 hover:text-emerald-900 hover:bg-white border border-transparent hover:border-slate-200 rounded-lg transition-all cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                  </button>
                  <button
                    onClick={resetToDefaultData}
                    title={t.actions.resetData}
                    className="p-1.5 text-slate-600 hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-lg transition-all cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              )}

              {/* User Session & Role Card */}
              {currentUser ? (
                <div className="flex items-center gap-1.5">
                  <div
                    onClick={() => setIsLoginModalOpen(true)}
                    className={`flex items-center gap-2 p-1.5 pl-2 rtl:pl-1.5 rtl:pr-2 rounded-xl border transition-all cursor-pointer shadow-2xs ${
                      isAdmin
                        ? 'bg-red-50/80 border-red-200 hover:bg-red-100/80'
                        : 'bg-emerald-50/80 border-emerald-200 hover:bg-emerald-100/80'
                    }`}
                    title="انقر لتبديل الدور أو استعراض الحساب"
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shadow-xs ${
                        isAdmin
                          ? 'bg-red-700 text-white ring-2 ring-red-400'
                          : 'bg-emerald-900 text-amber-300'
                      }`}
                    >
                      {currentUser.fullName.charAt(currentUser.fullName.indexOf(' ') + 1) || 'ع'}
                    </div>
                    <div className="hidden sm:block text-right rtl:text-right ltr:text-left">
                      <div className="text-xs font-bold text-slate-900 leading-tight flex items-center gap-1">
                        <span>{currentUser.fullName.split(' ')[0]}</span>
                        {isAdmin && (
                          <span className="text-[10px] bg-red-600 text-white font-mono px-1.5 py-0.2 rounded-md font-bold">
                            ADMIN
                          </span>
                        )}
                      </div>
                      <div
                        className={`text-[10px] font-bold ${
                          isAdmin ? 'text-red-700' : 'text-emerald-800'
                        }`}
                      >
                        {isAdmin
                          ? language === 'ar'
                            ? 'كامل الصلاحيات'
                            : 'Full Privileges'
                          : userRoleMeta?.titleAr || currentUser.role}
                      </div>
                    </div>
                  </div>

                  {/* Change Password Button */}
                  <button
                    type="button"
                    onClick={() => setShowChangePasswordModal(true)}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:text-emerald-950 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl transition-all cursor-pointer shadow-2xs"
                    title={language === 'ar' ? 'تغيير كلمة المرور وتأمين الحساب' : 'Change Password'}
                  >
                    <Key className="w-3.5 h-3.5 text-amber-600" />
                    <span className="hidden md:inline">
                      {language === 'ar' ? 'كلمة المرور' : 'Password'}
                    </span>
                  </button>

                  {/* Direct Logout Button */}
                  <button
                    onClick={logout}
                    className="flex items-center gap-1 px-2 py-1.5 text-xs font-bold text-rose-700 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200 hover:border-rose-600 rounded-xl transition-all cursor-pointer shadow-2xs"
                    title="تسجيل الخروج والعودة لصفحة البوابة الرئيسية"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">
                      {language === 'ar' ? 'خروج' : 'Logout'}
                    </span>
                  </button>
                </div>
              ) : null}

              {/* Mobile Menu Hamburger Toggle */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="xl:hidden p-2 text-slate-800 hover:text-emerald-950 bg-slate-100 hover:bg-emerald-50 border border-slate-300 rounded-xl transition-colors cursor-pointer shadow-2xs"
                aria-label="القائمة الرئيسية"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5 text-rose-700" />
                ) : (
                  <Menu className="w-5 h-5 text-emerald-900" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Tier 2: Dedicated Desktop & Tablet Navigation Bar with Crystal Clear Contrast */}
        <div className="hidden xl:block bg-slate-100/90 border-t border-slate-200 shadow-inner">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
            <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
              
              {/* Navigation Button Pills */}
              <nav className="flex items-center gap-1.5 flex-nowrap shrink-0">
                {visibleNavItems.map((item) => {
                  const isActive = activeModule === item.id;
                  const isAudit = item.id === 'activity_logs';
                  const isUsers = item.id === 'users';

                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveModule(item.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap shrink-0 cursor-pointer shadow-2xs border ${
                        isActive
                          ? isAudit
                            ? 'bg-rose-900 text-white border-rose-950 shadow-sm ring-1 ring-rose-950 font-black'
                            : 'bg-emerald-900 text-white border-emerald-950 shadow-sm ring-1 ring-emerald-950 font-black'
                          : isAudit
                          ? 'bg-rose-50 text-rose-900 hover:bg-rose-100 border-rose-300 hover:border-rose-400 font-extrabold'
                          : isUsers
                          ? 'bg-amber-50/80 text-amber-950 hover:bg-amber-100 border-amber-300 hover:border-amber-400 font-bold'
                          : 'bg-white text-slate-800 hover:text-emerald-950 hover:bg-emerald-50 border-slate-300 hover:border-emerald-300'
                      }`}
                    >
                      <span
                        className={
                          isActive
                            ? 'text-amber-300'
                            : isAudit
                            ? 'text-rose-700'
                            : isUsers
                            ? 'text-amber-700'
                            : 'text-emerald-800'
                        }
                      >
                        {item.icon}
                      </span>
                      <span>{item.label}</span>

                      {/* Special admin badge */}
                      {item.badge && (
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full uppercase tracking-tighter ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : isAudit
                              ? 'bg-rose-200 text-rose-900 font-black'
                              : 'bg-amber-200 text-amber-900 font-bold'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>

              {/* Quick Add Manuscript CTA in Desktop Ribbon */}
              <button
                type="button"
                onClick={onOpenAddManuscript}
                className="hidden xl:flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-xs border border-emerald-900 transition-all cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>+ تسجيل مخطوطة</span>
              </button>
            </div>
          </div>
        </div>

        {/* Medium Screen Horizontal Ribbon (Tablet & Compact Desktop: md -> xl-1) */}
        <div className="hidden md:flex xl:hidden bg-slate-100 border-t border-slate-200 px-4 py-2 overflow-x-auto no-scrollbar gap-1.5">
          {visibleNavItems.map((item) => {
            const isActive = activeModule === item.id;
            const isAudit = item.id === 'activity_logs';

            return (
              <button
                key={item.id}
                onClick={() => setActiveModule(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border transition-all whitespace-nowrap shrink-0 cursor-pointer shadow-2xs ${
                  isActive
                    ? isAudit
                      ? 'bg-rose-900 text-white border-rose-950 shadow-sm font-extrabold'
                      : 'bg-emerald-900 text-white border-emerald-950 shadow-sm font-extrabold'
                    : isAudit
                    ? 'bg-rose-50 text-rose-900 border-rose-300 font-bold'
                    : 'bg-white hover:bg-emerald-50 text-slate-800 border-slate-300 font-bold'
                }`}
              >
                <span className={isActive ? 'text-amber-300' : isAudit ? 'text-rose-700' : 'text-emerald-800'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
                {item.badge && (
                  <span className="text-[9px] bg-rose-200 text-rose-900 px-1 rounded-sm font-mono">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Mobile Slide-down Drawer Menu (< xl) with Structured, High-Contrast Sections */}
        {isMobileMenuOpen && (
          <div className="xl:hidden bg-white border-t border-slate-300 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="p-4 space-y-4">
              
              {/* User Profile Card on Mobile */}
              {currentUser && (
                <div
                  className={`p-3 rounded-2xl border flex items-center justify-between ${
                    isAdmin
                      ? 'bg-red-50/90 border-red-200'
                      : 'bg-emerald-50/90 border-emerald-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl font-bold flex items-center justify-center text-sm shadow-xs ${
                        isAdmin
                          ? 'bg-red-700 text-white ring-2 ring-red-300'
                          : 'bg-emerald-900 text-amber-300'
                      }`}
                    >
                      {currentUser.fullName.charAt(currentUser.fullName.indexOf(' ') + 1) || 'ع'}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{currentUser.fullName}</span>
                        {isAdmin && (
                          <span className="text-[10px] bg-red-600 text-white font-mono px-1.5 py-0.2 rounded-md font-bold">
                            ADMIN
                          </span>
                        )}
                      </div>
                      <div
                        className={`text-xs font-bold ${
                          isAdmin ? 'text-red-700' : 'text-emerald-800'
                        }`}
                      >
                        {isAdmin
                          ? 'مسؤول النظام - كامل الصلاحيات'
                          : userRoleMeta?.titleAr || currentUser.role}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsLoginModalOpen(true);
                    }}
                    className="text-xs font-bold text-emerald-800 hover:underline bg-white px-2.5 py-1.5 rounded-lg border border-emerald-300 shadow-2xs"
                  >
                    تبديل الدور
                  </button>
                </div>
              )}

              {/* Mobile Quick Add CTA Button */}
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenAddManuscript();
                }}
                className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer border border-emerald-800"
              >
                <Plus className="w-5 h-5 stroke-[2.5]" />
                <span>+ تسجيل مخطوطة جديدة بالمنظومة</span>
              </button>

              {/* Mobile Reviewer Overdue Notifications Alert Button */}
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setShowNotificationsModal(true);
                }}
                className={`w-full p-3 rounded-xl border flex items-center justify-between text-xs font-bold transition-all shadow-xs cursor-pointer ${
                  overdueCount > 0
                    ? 'bg-rose-50 border-rose-300 text-rose-950'
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Bell className={`w-4 h-4 ${overdueCount > 0 ? 'text-rose-600 animate-pulse' : 'text-slate-600'}`} />
                  <span>إشعارات تأخر المحكمين والمهل</span>
                </div>
                {totalActiveAlertsCount > 0 ? (
                  <span className={`px-2 py-0.5 rounded-full text-3xs font-black text-white ${overdueCount > 0 ? 'bg-rose-600' : 'bg-amber-500'}`}>
                    {overdueCount > 0 ? `${overdueCount} متأخر` : `${totalActiveAlertsCount} تنبيه`}
                  </span>
                ) : (
                  <span className="text-3xs text-emerald-700 font-semibold">مكتمل ومنتظم</span>
                )}
              </button>

              {/* Mobile Search Input */}
              <div className="relative">
                <Search className="w-4 h-4 absolute top-3 right-3 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                  placeholder="بحث في المخطوطات والقرارات والمحكمين..."
                  className="w-full text-xs py-2.5 pr-9 pl-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              {/* Categorized Mobile Navigation Sections */}
              <div className="space-y-4 pt-1">
                
                {/* 1. العمليات التحريرية */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider px-1">
                    العمليات التحريرية والنشر
                  </div>
                  {visibleNavItems
                    .filter((item) => item.category === 'editorial')
                    .map((item) => {
                      const isActive = activeModule === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => navigateTo(item.id)}
                          className={`w-full flex items-center justify-between p-3 rounded-xl border text-sm font-bold transition-all cursor-pointer ${
                            isActive
                              ? 'bg-emerald-900 text-white border-emerald-950 shadow-xs'
                              : 'bg-slate-50 hover:bg-emerald-50 text-slate-800 border-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={isActive ? 'text-amber-300' : 'text-emerald-800'}>
                              {item.icon}
                            </span>
                            <span>{item.label}</span>
                          </div>
                          {isActive && (
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                          )}
                        </button>
                      );
                    })}
                </div>

                {/* 2. التحكيم والملفات الأكاديمية */}
                {visibleNavItems.some((item) => item.category === 'academic') && (
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider px-1">
                      التحكيم العلمي وأرشيف الوثائق
                    </div>
                    {visibleNavItems
                      .filter((item) => item.category === 'academic')
                      .map((item) => {
                        const isActive = activeModule === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => navigateTo(item.id)}
                            className={`w-full flex items-center justify-between p-3 rounded-xl border text-sm font-bold transition-all cursor-pointer ${
                              isActive
                                ? 'bg-emerald-900 text-white border-emerald-950 shadow-xs'
                                : 'bg-slate-50 hover:bg-emerald-50 text-slate-800 border-slate-200'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className={isActive ? 'text-amber-300' : 'text-emerald-800'}>
                                {item.icon}
                              </span>
                              <span>{item.label}</span>
                            </div>
                            {isActive && (
                              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                            )}
                          </button>
                        );
                      })}
                  </div>
                )}

                {/* 3. الشؤون المالية والرسوم */}
                {visibleNavItems.some((item) => item.category === 'finance') && (
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider px-1">
                      الشؤون المالية ورسوم النشر
                    </div>
                    {visibleNavItems
                      .filter((item) => item.category === 'finance')
                      .map((item) => {
                        const isActive = activeModule === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => navigateTo(item.id)}
                            className={`w-full flex items-center justify-between p-3 rounded-xl border text-sm font-bold transition-all cursor-pointer ${
                              isActive
                                ? 'bg-emerald-900 text-white border-emerald-950 shadow-xs'
                                : 'bg-slate-50 hover:bg-emerald-50 text-slate-800 border-slate-200'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className={isActive ? 'text-amber-300' : 'text-emerald-800'}>
                                {item.icon}
                              </span>
                              <span>{item.label}</span>
                            </div>
                            {isActive && (
                              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                            )}
                          </button>
                        );
                      })}
                  </div>
                )}

                {/* 4. أدوات إدارة النظام والأمان (خاصة بالمسؤول) */}
                {visibleNavItems.some((item) => item.category === 'admin') && (
                  <div className="space-y-1.5 bg-red-50/50 p-2.5 rounded-2xl border border-red-200">
                    <div className="text-[11px] font-extrabold text-red-800 uppercase tracking-wider flex items-center justify-between px-1">
                      <span>إدارة النظام والتدقيق الأمني</span>
                      <span className="text-[10px] bg-red-700 text-white font-mono px-1.5 py-0.5 rounded">
                        ADMIN ONLY
                      </span>
                    </div>
                    {visibleNavItems
                      .filter((item) => item.category === 'admin')
                      .map((item) => {
                        const isActive = activeModule === item.id;
                        const isAudit = item.id === 'activity_logs';
                        return (
                          <button
                            key={item.id}
                            onClick={() => navigateTo(item.id)}
                            className={`w-full flex items-center justify-between p-3 rounded-xl border text-sm font-bold transition-all cursor-pointer ${
                              isActive
                                ? 'bg-rose-900 text-white border-rose-950 shadow-xs'
                                : isAudit
                                ? 'bg-white hover:bg-rose-100 text-rose-900 border-rose-300 font-extrabold'
                                : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className={isActive ? 'text-amber-300' : isAudit ? 'text-rose-700' : 'text-slate-700'}>
                                {item.icon}
                              </span>
                              <span>{item.label}</span>
                            </div>
                            {item.badge && (
                              <span className="text-[10px] bg-rose-200 text-rose-900 font-bold px-2 py-0.5 rounded-full">
                                {item.badge}
                              </span>
                            )}
                          </button>
                        );
                      })}
                  </div>
                )}

                {/* 5. البوابات المتخصصة */}
                {visibleNavItems.some((item) => item.category === 'portal') && (
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider px-1">
                      البوابات المتخصصة
                    </div>
                    {visibleNavItems
                      .filter((item) => item.category === 'portal')
                      .map((item) => {
                        const isActive = activeModule === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => navigateTo(item.id)}
                            className={`w-full flex items-center justify-between p-3 rounded-xl border text-sm font-bold transition-all cursor-pointer ${
                              isActive
                                ? 'bg-emerald-900 text-white border-emerald-950 shadow-xs'
                                : 'bg-slate-50 hover:bg-emerald-50 text-slate-800 border-slate-200'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className={isActive ? 'text-amber-300' : 'text-emerald-800'}>
                                {item.icon}
                              </span>
                              <span>{item.label}</span>
                            </div>
                            {isActive && (
                              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                            )}
                          </button>
                        );
                      })}
                  </div>
                )}
              </div>

              {/* Mobile Backup Tools for Admin/Dean */}
              {(isAdmin || currentUser?.role === 'general_supervisor') && (
                <div className="pt-2 border-t border-slate-200">
                  <div className="text-[11px] font-bold text-slate-500 mb-2">نسخ احتياطي واستعادة:</div>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={exportDatabaseJson}
                      className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold flex flex-col items-center gap-1"
                    >
                      <Download className="w-4 h-4 text-emerald-800" />
                      <span>تصدير JSON</span>
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold flex flex-col items-center gap-1"
                    >
                      <Upload className="w-4 h-4 text-emerald-800" />
                      <span>استيراد JSON</span>
                    </button>
                    <button
                      onClick={resetToDefaultData}
                      className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-xl text-xs font-bold flex flex-col items-center gap-1"
                    >
                      <RefreshCw className="w-4 h-4 text-rose-700" />
                      <span>استعادة</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Mobile AI and Editorial Tools */}
              <div className="pt-2 border-t border-slate-200 space-y-2">
                <span className="text-3xs font-extrabold text-slate-500 uppercase tracking-wide block">
                  الأدوات الذكية والتقارير:
                </span>
                <div className="grid grid-cols-3 gap-2 text-2xs font-extrabold">
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setShowProofreadingModal(true);
                    }}
                    className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 rounded-xl flex flex-col items-center gap-1 text-center"
                  >
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>تدقيق AI</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setShowEmailHubModal(true);
                    }}
                    className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-950 border border-blue-200 rounded-xl flex flex-col items-center gap-1 text-center"
                  >
                    <Mail className="w-4 h-4 text-blue-700" />
                    <span>المراسلات</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setShowAnnualReportModal(true);
                    }}
                    className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border border-emerald-300 rounded-xl flex flex-col items-center gap-1 text-center"
                  >
                    <BarChart3 className="w-4 h-4 text-emerald-800" />
                    <span>تقرير سنوي</span>
                  </button>
                </div>

                <div className="pt-1">
                  <PWAInstallButton className="w-full justify-center py-2" />
                </div>
              </div>

              {/* Mobile Utility Controls */}
              <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-2 text-xs font-bold">
                <button
                  onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
                  className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                >
                  <Globe className="w-4 h-4 text-emerald-800" />
                  <span>{language === 'ar' ? 'English (EN)' : 'عربي (AR)'}</span>
                </button>

                <a
                  href="https://aasj.journals.ekb.eg"
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <span>موقع المجلة (EKB)</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Mobile Change Password Button */}
              {currentUser && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setShowChangePasswordModal(true);
                  }}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                >
                  <Key className="w-4 h-4 text-amber-600" />
                  <span>{language === 'ar' ? 'تغيير كلمة المرور وتأمين الحساب' : 'Change Password'}</span>
                </button>
              )}

              {/* Mobile Logout Button */}
              {currentUser && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                >
                  <LogOut className="w-4 h-4" />
                  <span>تسجيل الخروج والعودة لصفحة البوابة الرئيسية</span>
                </button>
              )}

            </div>
          </div>
        )}
      </header>

      {/* Mobile Ergonomic Bottom Navigation Bar (Phones only, < md) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-300 shadow-xl px-2 py-1.5 flex items-center justify-around text-[10px] font-bold">
        {/* Tab 1: Dashboard or Role Portal */}
        <button
          onClick={() => {
            if (currentUser?.role === 'reviewer') navigateTo('reviewer_portal');
            else if (currentUser?.role === 'author') navigateTo('author_portal');
            else navigateTo('dashboard');
          }}
          className={`flex flex-col items-center gap-0.5 p-1 rounded-lg transition-colors ${
            activeModule === 'dashboard' || activeModule === 'reviewer_portal' || activeModule === 'author_portal'
              ? 'text-emerald-900 font-black'
              : 'text-slate-600'
          }`}
        >
          <Home className="w-5 h-5" />
          <span>الرئيسية</span>
        </button>

        {/* Tab 2: Manuscripts */}
        {canAccessModule('manuscripts') ? (
          <button
            onClick={() => navigateTo('manuscripts')}
            className={`flex flex-col items-center gap-0.5 p-1 rounded-lg transition-colors ${
              activeModule === 'manuscripts' ? 'text-emerald-900 font-black' : 'text-slate-600'
            }`}
          >
            <FileText className="w-5 h-5" />
            <span>المخطوطات</span>
          </button>
        ) : (
          <button
            onClick={() => navigateTo('sections')}
            className={`flex flex-col items-center gap-0.5 p-1 rounded-lg transition-colors ${
              activeModule === 'sections' ? 'text-emerald-900 font-black' : 'text-slate-600'
            }`}
          >
            <Layers className="w-5 h-5" />
            <span>الأجزاء (7)</span>
          </button>
        )}

        {/* Tab 3: Center Elevated Add Manuscript Action */}
        <button
          onClick={onOpenAddManuscript}
          className="flex flex-col items-center justify-center -mt-5 w-12 h-12 rounded-full bg-emerald-800 text-white shadow-lg active:bg-emerald-950 border-2 border-white cursor-pointer"
          title="تسجيل مخطوطة جديدة"
        >
          <Plus className="w-6 h-6 stroke-[3]" />
        </button>

        {/* Tab 4: 7 Sections or Activity Logs for Admin */}
        {isAdmin ? (
          <button
            onClick={() => navigateTo('activity_logs')}
            className={`flex flex-col items-center gap-0.5 p-1 rounded-lg transition-colors ${
              activeModule === 'activity_logs' ? 'text-rose-800 font-black' : 'text-slate-600'
            }`}
          >
            <Activity className="w-5 h-5 text-rose-600" />
            <span>النشاطات</span>
          </button>
        ) : (
          <button
            onClick={() => navigateTo('sections')}
            className={`flex flex-col items-center gap-0.5 p-1 rounded-lg transition-colors ${
              activeModule === 'sections' ? 'text-emerald-900 font-black' : 'text-slate-600'
            }`}
          >
            <Layers className="w-5 h-5" />
            <span>التخصصات</span>
          </button>
        )}

        {/* Tab 5: Mobile Menu Drawer Toggle */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className={`flex flex-col items-center gap-0.5 p-1 rounded-lg transition-colors ${
            isMobileMenuOpen ? 'text-emerald-900 font-black' : 'text-slate-600'
          }`}
        >
          <Menu className="w-5 h-5" />
          <span>القائمة</span>
        </button>
      </nav>

      {/* Login / Role Switcher Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />

      {/* Academic Proofreading & Abstract Enhancement Modal */}
      {showProofreadingModal && (
        <AcademicProofreadingModal
          onClose={() => setShowProofreadingModal(false)}
        />
      )}

      {/* Email Templates Hub Modal */}
      {showEmailHubModal && (
        <EmailTemplatesHubModal
          onClose={() => setShowEmailHubModal(false)}
        />
      )}

      {/* Annual Editorial Performance Report Modal */}
      {showAnnualReportModal && (
        <AnnualEditorialReportModal
          onClose={() => setShowAnnualReportModal(false)}
        />
      )}

      {/* Reviewer Overdue & Deadlines Notifications Modal */}
      {showNotificationsModal && (
        <ReviewerNotificationsModal
          onClose={() => setShowNotificationsModal(false)}
          onSelectManuscript={() => {
            setShowNotificationsModal(false);
            setActiveModule('manuscripts');
          }}
        />
      )}
      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <ChangePasswordModal
          isOpen={showChangePasswordModal}
          onClose={() => setShowChangePasswordModal(false)}
        />
      )}
    </>
  );
};
