import React, { useState } from 'react';
import {
  Lock,
  User,
  Key,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  BookOpen,
  Layers,
  Award,
  Users,
  FileText,
  Clock,
  ArrowRight,
  Info,
  ShieldAlert,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { JOURNAL_SECTIONS, ROLE_INFO } from '../data/journalSections';
import { UserRole } from '../types/journal';
import { AasjLogo } from './AasjLogo';

export const PortalLoginPage: React.FC = () => {
  const { login, users } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'login' | 'roles' | 'sections'>('login');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!username.trim() || !password.trim()) {
      setErrorMsg('يرجى إدخال اسم المستخدم وكلمة المرور.');
      return;
    }

    const success = login(username, password);
    if (!success) {
      setErrorMsg('اسم المستخدم أو كلمة المرور غير صحيحة. يرجى التحقق من صحة بيانات الدخول والمحاولة مجدداً.');
    }
  };

  // Group roles for structured directory display
  const highManagement = users.filter((u) =>
    ['general_supervisor', 'editor_in_chief', 'advisory_head', 'managing_editor'].includes(u.role)
  );
  const editorialBoard = users.filter((u) =>
    ['secretary', 'executive_editor', 'editor', 'layout_editor'].includes(u.role)
  );
  const peerAndPublic = users.filter((u) =>
    ['reviewer', 'author', 'admin'].includes(u.role)
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900 font-sans selection:bg-emerald-700 selection:text-white">
      {/* Top Academic Banner */}
      <div className="bg-emerald-950 text-white border-b border-emerald-900 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="font-semibold text-emerald-200">
              بوابة الدخول الموحدة للمنظومة التحريرية والإدارية
            </span>
          </div>

          <div className="flex items-center gap-4 text-emerald-300 font-mono text-[11px]">
            <span>Print ISSN: 2535-1680</span>
            <span>·</span>
            <span>Online ISSN: 2535-1699</span>
            <span>·</span>
            <a
              href="https://aasj.journals.ekb.eg"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-amber-300 hover:text-amber-200 underline font-sans font-bold"
            >
              <span>موقع المجلة ببنك المعرفة (EKB)</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Main Header / Brand Identity */}
      <header className="bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 text-right">
              <AasjLogo className="w-16 h-16 sm:w-20 sm:h-20 shrink-0" />
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-serif font-black text-emerald-950 tracking-tight leading-tight">
                  مجلة أرشيف العلوم الزراعية (AASJ)
                </h1>
                <p className="text-sm font-semibold text-emerald-800 tracking-wide font-serif">
                  Archives of Agriculture Sciences Journal
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  جامعة الأزهر · كلية الزراعة (فرع أسيوط)، جمهورية مصر العربية · Al-Azhar University
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600">
              <div className="text-right">
                <div className="font-bold text-slate-800">الدورية: ٣ أعداد سنوياً</div>
                <div className="text-[11px] text-slate-500 font-mono">Three Times Per Year</div>
              </div>
              <div className="h-8 w-px bg-slate-200 mx-1"></div>
              <div className="text-right">
                <div className="font-bold text-emerald-800">التحكيم الأكاديمي</div>
                <div className="text-[11px] text-slate-500">Double-Blind Peer Review</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-300 mb-8 bg-white rounded-t-xl p-1 shadow-xs max-w-2xl mx-auto">
          <button
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-3 px-4 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'login'
                ? 'bg-emerald-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-emerald-950 hover:bg-slate-100'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>تسجيل الدخول للمنظومة</span>
          </button>

          <button
            onClick={() => setActiveTab('roles')}
            className={`flex-1 py-3 px-4 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'roles'
                ? 'bg-emerald-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-emerald-950 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>الهيكل التنظيمي والأدوار (11 دور)</span>
          </button>

          <button
            onClick={() => setActiveTab('sections')}
            className={`flex-1 py-3 px-4 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'sections'
                ? 'bg-emerald-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-emerald-950 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>أجزاء المجلة (7 أقسام)</span>
          </button>
        </div>

        {/* TAB 1: LOGIN FORM & SECURITY OVERVIEW */}
        {activeTab === 'login' && (
          <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Login Card */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-md p-6 sm:p-8">
              <div className="mb-6">
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                  نظام إدارة وهيئة تحرير المجلة
                </span>
                <h2 className="text-xl font-bold font-serif text-slate-900 mt-2">
                  تسجيل الدخول الآمن
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  أدخل اسم المستخدم وكلمة المرور المعتمدة للوصول إلى لوحة التحكم المخصصة لحسابك.
                </p>
              </div>

              {errorMsg && (
                <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2.5">
                  <span className="text-base shrink-0">⚠️</span>
                  <span className="font-semibold leading-relaxed">{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    اسم المستخدم (Username):
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute top-3 right-3 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      placeholder="أدخل اسم المستخدم المعتمد..."
                      className="w-full text-xs py-2.5 pr-10 pl-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-emerald-700 font-mono text-slate-900 bg-slate-50 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    كلمة المرور (Password):
                  </label>
                  <div className="relative">
                    <Key className="w-4 h-4 absolute top-3 right-3 text-slate-400 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full text-xs py-2.5 pr-10 pl-10 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-emerald-700 font-mono text-slate-900 bg-slate-50 focus:bg-white transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute top-2.5 left-3 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 text-sm font-bold text-white bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 mt-5 cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>تسجيل الدخول للمنظومة التحريرية</span>
                </button>
              </form>

              <div className="mt-6 pt-4 border-t border-slate-100 text-[11.5px] text-slate-500 leading-relaxed">
                <p>
                  بوابة النشر العلمي محكمة ومخصصة لأعضاء هيئة التحرير، المحكمين المعتمدين، والباحثين المسجلين.
                </p>
              </div>
            </div>

            {/* Official Academic Information Sidebar */}
            <div className="lg:col-span-5 space-y-4">
              {/* Journal Academic Standing */}
              <div className="bg-emerald-900 text-white rounded-2xl p-6 shadow-md border border-emerald-800 space-y-3">
                <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>بوابة النشر العلمي المحكمة</span>
                </div>
                <h3 className="text-base font-serif font-bold leading-snug">
                  منظومة إدارة التحرير والنشر الأكاديمي
                </h3>
                <p className="text-xs text-emerald-100 leading-relaxed">
                  تلتزم مجلة أرشيف العلوم الزراعية بأعلى معايير النزاهة العلمية والتحكيم الأكاديمي المزدوج المعمى (Double-Blind Peer Review) المعتمد من المجلس الأعلى للجامعات وبنك المعرفة المصري.
                </p>

                <div className="pt-2 border-t border-emerald-800 text-[11px] text-emerald-200 space-y-1.5 font-sans">
                  <div className="flex items-center justify-between">
                    <span>الجهة الناشرة:</span>
                    <strong className="text-white">جامعة الأزهر - كلية الزراعة بأسيوط</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>قواعد البيانات:</span>
                    <strong className="text-amber-300">بنك المعرفة المصري EKB</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>سياسة الوصول:</span>
                    <strong className="text-white">Open Access (CC-BY 4.0)</strong>
                  </div>
                </div>
              </div>

              {/* Security & Access Notice */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 text-xs text-slate-600 space-y-2.5 shadow-xs">
                <div className="flex items-center gap-2 font-bold text-slate-800">
                  <Lock className="w-4 h-4 text-emerald-800" />
                  <span>سياسة الحسابات وسرية النشر</span>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-500">
                  يتم إصدار واعتماد حسابات هيئة التحرير والمحكمين حصرياً عبر إدارة النظام وسكرتارية المجلة. للحفاظ على سرية التحكيم، يُرجى عدم مشاركة بيانات تسجيل الدخول وتغيير كلمة المرور دورياً.
                </p>
                <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>للدعم الفني وأمانة السر:</span>
                  <a
                    href="mailto:aasj@azhar.edu.eg"
                    className="font-mono text-emerald-800 font-bold hover:underline"
                  >
                    aasj@azhar.edu.eg
                  </a>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: ROLES & EDITORIAL HIERARCHY DIRECTORY (PURELY INFORMATIVE, NO DEMO BUTTONS) */}
        {activeTab === 'roles' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <h2 className="text-xl font-bold font-serif text-emerald-950">
                الهيكل التنظيمي والمسؤوليات التحريرية (Editorial Hierarchy & Roles)
              </h2>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                تعتمد المجلة هيكلية تحريرية دقيقة تتوزع فيها الصلاحيات وفقاً للمهام الأكاديمية والإدارية والرقابية لضمان جودة وسرعة النشر العلمي.
              </p>
            </div>

            {/* Section A: High Leadership */}
            <div>
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                القيادة العليا والإشراف الأكاديمي والاستشاري:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {highManagement.map((u) => {
                  const roleMeta = ROLE_INFO[u.role];
                  return (
                    <div
                      key={u.id}
                      className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <span className={`text-[10.5px] font-bold px-2.5 py-0.5 rounded-full border ${roleMeta.badgeColor}`}>
                              {roleMeta.titleAr}
                            </span>
                            <h4 className="text-sm font-bold text-slate-900 mt-2">{u.fullName}</h4>
                          </div>
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
                            {roleMeta.titleEn}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed mb-3">
                          {roleMeta.descriptionAr}
                        </p>
                        <div className="text-[11px] text-slate-400 border-t border-slate-100 pt-2">
                          {u.affiliation}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Section B: Editorial Board */}
            <div>
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                الهيئة التحريرية والتنفيذية والتنسيقية:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {editorialBoard.map((u) => {
                  const roleMeta = ROLE_INFO[u.role];
                  return (
                    <div
                      key={u.id}
                      className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-1 mb-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${roleMeta.badgeColor}`}>
                            {roleMeta.titleAr}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 mb-1 leading-tight">{u.fullName}</h4>
                        {u.assignedSection && (
                          <div className="text-[10px] text-sky-800 bg-sky-50 p-1.5 rounded mb-2 font-medium">
                            مشرف على: {u.assignedSection}
                          </div>
                        )}
                        <p className="text-[11px] text-slate-600 leading-relaxed mb-3">
                          {roleMeta.descriptionAr}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Section C: Reviewer, Author, Admin */}
            <div>
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                المحكمون والباحثون وإدارة النظام:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {peerAndPublic.map((u) => {
                  const roleMeta = ROLE_INFO[u.role];
                  const isAdminRole = u.role === 'admin';
                  return (
                    <div
                      key={u.id}
                      className={`bg-white rounded-2xl border p-5 shadow-xs flex flex-col justify-between ${
                        isAdminRole
                          ? 'border-slate-300 bg-slate-50/50'
                          : 'border-slate-200'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${roleMeta.badgeColor}`}>
                            {roleMeta.titleAr}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {roleMeta.titleEn}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 mb-1">{u.fullName}</h4>
                        <p className="text-[11px] text-slate-600 leading-relaxed mb-3">
                          {roleMeta.descriptionAr}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: THE 7 JOURNAL SECTIONS */}
        {activeTab === 'sections' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <h2 className="text-xl font-bold font-serif text-emerald-950">
                الأقسام والتخصصات العلمية السبعة (AASJ 7 Sections)
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                تغطي المجلة سبعة مجالات علمية زراعية رئيسية، يرأس كل جزء منها محرر تنفيذي وهيئة تحكيم متخصصة.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {JOURNAL_SECTIONS.map((sec) => (
                <div
                  key={sec.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                        الجزء رقم {sec.id}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        كود: {sec.departmentCode}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 leading-snug mb-1">
                      {sec.arabicName}
                    </h3>
                    <p className="text-[11px] font-serif text-emerald-800 italic mb-2">
                      {sec.englishName}
                    </p>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {sec.descriptionAr}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 font-medium">
                    التحكيم مزدوج التعمية عبر المحكمين الأكاديميين المعتمدين في القسم
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Scholarly Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-0.5 text-center sm:text-left rtl:sm:text-right">
            <p className="font-bold text-emerald-950 font-serif text-sm">
              Archives of Agriculture Sciences Journal (AASJ) · مجلة أرشيف العلوم الزراعية
            </p>
            <p className="text-[11px] text-slate-600">
              Al-Azhar University, Faculty of Agriculture (Assiut Branch), Egypt · جامعة الأزهر، كلية الزراعة بأسيوط
            </p>
            <div className="text-[11px] text-amber-800 font-mono font-semibold space-x-2 rtl:space-x-reverse pt-0.5">
              <span>Print ISSN: 2535-1680</span>
              <span>·</span>
              <span>Online ISSN: 2535-1699</span>
              <span>·</span>
              <span>Frequency: Three Times Per Year</span>
              <span>·</span>
              <a
                href="https://aasj.journals.ekb.eg"
                target="_blank"
                rel="noreferrer"
                className="text-emerald-700 underline hover:text-emerald-900"
              >
                https://aasj.journals.ekb.eg
              </a>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 text-center sm:text-right rtl:sm:text-left">
            <span>© {new Date().getFullYear()} Faculty of Agriculture (Assiut), Al-Azhar University. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
