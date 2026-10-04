import React, { useMemo, useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Search,
  Filter,
  Download,
  Trash2,
  Calendar,
  Clock,
  User,
  Activity,
  FileText,
  Key,
  Coins,
  Archive,
  Users,
  Database,
  CheckCircle2,
  AlertTriangle,
  Info,
  RefreshCw,
  ExternalLink,
  Plus,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useJournal } from '../context/JournalContext';
import { ROLE_INFO } from '../data/journalSections';
import { ActivityActionType, ActivityLogItem } from '../types/journal';

export const ActivityLogsModule: React.FC = () => {
  const { currentUser } = useAuth();
  const { activityLogs, addActivityLog, clearActivityLogs, language } = useJournal();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedActionType, setSelectedActionType] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'timeline'>('table');

  // Strict Security Guard: Only Admin can access
  if (currentUser?.role !== 'admin') {
    return (
      <div className="bg-white rounded-2xl border border-rose-200 p-8 text-center max-w-2xl mx-auto shadow-sm my-12">
        <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold font-serif text-rose-950 mb-2">
          وصول مقيد ومحمي أمنياً
        </h2>
        <p className="text-xs text-rose-800 leading-relaxed mb-4">
          هذه الشاشة مخصصة حصرياً لمسؤول النظام (System Administrator) للاطلاع على سجل تدقيق النشاطات والعمليات ومراقبة أمن المنظومة التحريرية لمجلة أرشيف العلوم الزراعية.
        </p>
        <span className="inline-block text-[11px] font-mono text-slate-500 bg-slate-100 px-3 py-1 rounded-md">
          دورك الحالي: {currentUser ? ROLE_INFO[currentUser.role]?.titleAr : 'غير مسجل'}
        </span>
      </div>
    );
  }

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return activityLogs.filter((log) => {
      // Search
      const search = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !search ||
        log.title.toLowerCase().includes(search) ||
        log.description.toLowerCase().includes(search) ||
        log.username.toLowerCase().includes(search) ||
        log.userFullName.toLowerCase().includes(search) ||
        (log.targetId && log.targetId.toLowerCase().includes(search)) ||
        (log.ipAddress && log.ipAddress.toLowerCase().includes(search));

      // Action Type
      const matchesAction =
        selectedActionType === 'all' || log.actionType === selectedActionType;

      // Severity
      const matchesSeverity =
        selectedSeverity === 'all' || log.severity === selectedSeverity;

      // User
      const matchesUser =
        selectedUser === 'all' || log.username === selectedUser;

      return matchesSearch && matchesAction && matchesSeverity && matchesUser;
    });
  }, [activityLogs, searchTerm, selectedActionType, selectedSeverity, selectedUser]);

  // Statistics
  const stats = useMemo(() => {
    const total = activityLogs.length;
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const todayCount = activityLogs.filter((l) => l.timestamp.startsWith(todayStr)).length;
    const editorialCount = activityLogs.filter((l) =>
      ['manuscript_create', 'manuscript_update', 'manuscript_status', 'reviewer_assign'].includes(l.actionType)
    ).length;
    const authAndSecurityCount = activityLogs.filter((l) =>
      ['login', 'logout', 'user_management', 'system_backup'].includes(l.actionType)
    ).length;

    return { total, todayCount, editorialCount, authAndSecurityCount };
  }, [activityLogs]);

  // Unique users in logs for filtering
  const uniqueUsers = useMemo(() => {
    const userMap = new Map<string, string>();
    activityLogs.forEach((l) => {
      if (!userMap.has(l.username)) {
        userMap.set(l.username, l.userFullName);
      }
    });
    return Array.from(userMap.entries());
  }, [activityLogs]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['المعرف', 'التاريخ والوقت', 'اسم المستخدم', 'الاسم الكامل', 'الدور', 'نوع النشاط', 'العنوان', 'التفاصيل', 'المرجع', 'عنوان IP'];
    const rows = filteredLogs.map((l) => [
      l.id,
      new Date(l.timestamp).toLocaleString('ar-EG'),
      l.username,
      l.userFullName,
      ROLE_INFO[l.userRole]?.titleAr || l.userRole,
      l.actionType,
      `"${l.title.replace(/"/g, '""')}"`,
      `"${l.description.replace(/"/g, '""')}"`,
      l.targetId || '',
      l.ipAddress || '',
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `AASJ_Activity_Audit_Log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Simulate a live activity log (for live audit verification)
  const handleSimulateLog = () => {
    addActivityLog({
      username: 'admin',
      userFullName: currentUser.fullName,
      userRole: 'admin',
      actionType: 'system_backup',
      title: 'إجراء فحص أمني وتدقيق لسجلات النظام',
      description: 'تم تشغيل مراجعة السلامة الأمنية لسجلات المجلة وقاعدة البيانات.',
      ipAddress: '196.221.14.88 (System Admin Console)',
      severity: 'info',
    });
  };

  const getActionMeta = (type: ActivityActionType) => {
    switch (type) {
      case 'login':
      case 'logout':
        return {
          label: 'تسجيل دخول/خروج',
          icon: <Key className="w-3.5 h-3.5" />,
          color: 'text-sky-800 bg-sky-50 border-sky-200',
        };
      case 'manuscript_create':
      case 'manuscript_update':
      case 'manuscript_status':
      case 'manuscript_delete':
        return {
          label: 'إجراء تحريري (مخطوطات)',
          icon: <FileText className="w-3.5 h-3.5" />,
          color: 'text-emerald-800 bg-emerald-50 border-emerald-200',
        };
      case 'reviewer_assign':
        return {
          label: 'تكليف وتحكيم أقران',
          icon: <Users className="w-3.5 h-3.5" />,
          color: 'text-indigo-800 bg-indigo-50 border-indigo-200',
        };
      case 'notification_alert':
        return {
          label: 'تنبيه تأخر تحكيم / تذكير',
          icon: <AlertTriangle className="w-3.5 h-3.5" />,
          color: 'text-rose-800 bg-rose-50 border-rose-200',
        };
      case 'deadline_extended':
        return {
          label: 'تمديد مهلة تحكيم',
          icon: <Clock className="w-3.5 h-3.5" />,
          color: 'text-amber-800 bg-amber-50 border-amber-200',
        };
      case 'fee_payment':
      case 'cash_transaction':
        return {
          label: 'معاملة مالية / رسوم APC',
          icon: <Coins className="w-3.5 h-3.5" />,
          color: 'text-amber-800 bg-amber-50 border-amber-200',
        };
      case 'document_archive':
        return {
          label: 'أرشفة وثائق صادر/وارد',
          icon: <Archive className="w-3.5 h-3.5" />,
          color: 'text-teal-800 bg-teal-50 border-teal-200',
        };
      case 'user_management':
        return {
          label: 'إدارة حسابات وصلاحيات',
          icon: <ShieldCheck className="w-3.5 h-3.5" />,
          color: 'text-purple-800 bg-purple-50 border-purple-200',
        };
      case 'system_backup':
        return {
          label: 'نسخ احتياطي ونظام',
          icon: <Database className="w-3.5 h-3.5" />,
          color: 'text-slate-800 bg-slate-100 border-slate-300',
        };
      default:
        return {
          label: 'نشاط عام',
          icon: <Activity className="w-3.5 h-3.5" />,
          color: 'text-slate-700 bg-slate-50 border-slate-200',
        };
    }
  };

  const getSeverityBadge = (sev: ActivityLogItem['severity']) => {
    switch (sev) {
      case 'success':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            <span>ناجح</span>
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
            <span>تنبيه</span>
          </span>
        );
      case 'danger':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-800 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
            <span>حرج / حذف</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
            <span>معلومات</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold text-rose-800 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-md flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-700" />
              <span>لوحة أمنية سرية ومحصورة بالآدمن (Admin Only)</span>
            </span>
            <span className="text-xs font-mono text-slate-400">
              Audit & Activity Log Trail
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold font-serif text-slate-900 leading-tight">
            سجل مراقبة النشاطات والعمليات الأمنية
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
            توثيق رقمي فوري لجميع العمليات والتحركات التي تتم عبر التطبيق: تسجيلات الدخول، القرارات التحريرية، تعيينات المحكمين، السندات المالية، وإدارة الحسابات.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={handleSimulateLog}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl transition-colors cursor-pointer"
            title="تسجيل إشعار تدقيق أمني فوري"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>تسجيل نشاط فحص</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl transition-colors cursor-pointer shadow-2xs"
            title="تنزيل سجل التدقيق كملف CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>تصدير تقرير (CSV)</span>
          </button>

          <button
            onClick={() => {
              if (confirm('هل أنت متأكد من تفريغ سجل النشاطات بالكامل؟ هذا الإجراء لا يمكن التراجع عنه.')) {
                clearActivityLogs();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-700 hover:text-white bg-rose-50 hover:bg-rose-700 border border-rose-200 rounded-xl transition-colors cursor-pointer"
            title="تفريغ السجل"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>مسح السجل</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Logs */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">إجمالي العمليات المسجلة</span>
            <Activity className="w-4 h-4 text-emerald-800" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-950">
            {stats.total}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            موثقة بأختام زمنية ومصدر IP
          </p>
        </div>

        {/* Today's Logs */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">نشاطات اليوم</span>
            <Clock className="w-4 h-4 text-sky-800" />
          </div>
          <div className="text-2xl font-bold font-mono text-sky-950">
            {stats.todayCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            عمليات تمت خلال الـ 24 ساعة الماضية
          </p>
        </div>

        {/* Editorial Operations */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">الإجراءات التحريرية</span>
            <FileText className="w-4 h-4 text-indigo-800" />
          </div>
          <div className="text-2xl font-bold font-mono text-indigo-950">
            {stats.editorialCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            مخطوطات، تغييرات حالة، وتعيين محكمين
          </p>
        </div>

        {/* Auth & Security */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">عمليات الأمان والدخول</span>
            <ShieldCheck className="w-4 h-4 text-amber-800" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-950">
            {stats.authAndSecurityCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            تسجيلات الدخول وإدارة المستخدمين
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          
          {/* Search Term */}
          <div className="lg:col-span-4 relative">
            <Search className="w-4 h-4 absolute top-2.5 right-3 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="بحث بالمخطوطة، اسم المستخدم، تفاصيل النشاط..."
              className="w-full text-xs py-2 pr-9 pl-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700 font-medium"
            />
          </div>

          {/* Action Category Filter */}
          <div className="lg:col-span-3">
            <select
              value={selectedActionType}
              onChange={(e) => setSelectedActionType(e.target.value)}
              className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800"
            >
              <option value="all">جميع أنواع النشاطات</option>
              <option value="login">تسجيل الدخول (Auth)</option>
              <option value="manuscript_status">تغيير حالة المخطوطة</option>
              <option value="manuscript_create">تقديم مخطوطة جديدة</option>
              <option value="reviewer_assign">تعيين محكم علمي</option>
              <option value="fee_payment">سداد رسوم نشر (APC)</option>
              <option value="cash_transaction">حركات التدفق النقدي</option>
              <option value="document_archive">أرشفة الوثائق</option>
              <option value="user_management">إدارة المستخدمين</option>
              <option value="system_backup">النسخ الاحتياطي للنظام</option>
            </select>
          </div>

          {/* Severity Filter */}
          <div className="lg:col-span-2">
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800"
            >
              <option value="all">جميع مستويات الأهمية</option>
              <option value="info">معلومات (Info)</option>
              <option value="success">ناجح (Success)</option>
              <option value="warning">تنبيه (Warning)</option>
              <option value="danger">عمليات حرجة (Danger)</option>
            </select>
          </div>

          {/* User Filter */}
          <div className="lg:col-span-2">
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800"
            >
              <option value="all">جميع المستخدمين ({uniqueUsers.length})</option>
              {uniqueUsers.map(([uname, fullname]) => (
                <option key={uname} value={uname}>
                  {uname} ({fullname.slice(0, 18)}...)
                </option>
              ))}
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="lg:col-span-1 flex items-center border border-slate-200 rounded-xl overflow-hidden p-0.5 bg-slate-100">
            <button
              onClick={() => setViewMode('table')}
              className={`flex-1 py-1.5 text-center text-xs font-bold rounded-lg transition-colors ${
                viewMode === 'table'
                  ? 'bg-white text-emerald-950 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="عرض كجدول تدقيق"
            >
              جدول
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`flex-1 py-1.5 text-center text-xs font-bold rounded-lg transition-colors ${
                viewMode === 'timeline'
                  ? 'bg-white text-emerald-950 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="عرض كخط زمني"
            >
              مسار
            </button>
          </div>

        </div>

        {/* Results summary & reset */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>
            يتم عرض <strong>{filteredLogs.length}</strong> من إجمالي <strong>{activityLogs.length}</strong> نشاط مسجل
          </span>
          {(searchTerm || selectedActionType !== 'all' || selectedSeverity !== 'all' || selectedUser !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedActionType('all');
                setSelectedSeverity('all');
                setSelectedUser('all');
              }}
              className="text-emerald-800 hover:underline font-bold"
            >
              إعادة ضبط الفلاتر ✕
            </button>
          )}
        </div>
      </div>

      {/* Main Content View (Table or Timeline) */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <th className="py-3 px-4">التاريخ والوقت</th>
                  <th className="py-3 px-4">المستخدم والصفة</th>
                  <th className="py-3 px-4">نوع النشاط</th>
                  <th className="py-3 px-4">عنوان العملية والتفاصيل</th>
                  <th className="py-3 px-4">المرجع</th>
                  <th className="py-3 px-4">عنوان IP والموقع</th>
                  <th className="py-3 px-4 text-center">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => {
                    const meta = getActionMeta(log.actionType);
                    const userRoleData = ROLE_INFO[log.userRole];
                    const dateObj = new Date(log.timestamp);
                    const timeStr = dateObj.toLocaleTimeString('ar-EG', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    });
                    const dateStr = dateObj.toLocaleDateString('ar-EG', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    });

                    return (
                      <tr
                        key={log.id}
                        className="hover:bg-slate-50/80 transition-colors group"
                      >
                        {/* Timestamp */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="font-mono font-bold text-slate-900">{timeStr}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{dateStr}</div>
                        </td>

                        {/* User & Role */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="font-bold text-slate-900 leading-snug">
                            {log.userFullName}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="font-mono text-[10px] text-emerald-800 bg-slate-100 px-1 rounded">
                              @{log.username}
                            </span>
                            <span className={`text-[9px] px-1.5 py-0.2 rounded border ${userRoleData?.badgeColor || 'bg-slate-100'}`}>
                              {userRoleData?.titleAr || log.userRole}
                            </span>
                          </div>
                        </td>

                        {/* Action Category */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-bold ${meta.color}`}
                          >
                            {meta.icon}
                            <span>{meta.label}</span>
                          </span>
                        </td>

                        {/* Description & Title */}
                        <td className="py-3 px-4 min-w-[280px]">
                          <div className="font-bold text-slate-900 leading-snug">
                            {log.title}
                          </div>
                          <div className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                            {log.description}
                          </div>
                        </td>

                        {/* Target Reference */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          {log.targetId ? (
                            <button
                              onClick={() => setSearchTerm(log.targetId!)}
                              className="font-mono text-[11px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200 transition-colors"
                              title="تصفية حسب هذا المرجع"
                            >
                              {log.targetId}
                            </button>
                          ) : (
                            <span className="text-slate-300 font-mono">—</span>
                          )}
                        </td>

                        {/* IP Address & Network */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="font-mono text-[11px] text-slate-600">
                            {log.ipAddress || 'شبكة الكلية المحلية'}
                          </div>
                        </td>

                        {/* Severity Status */}
                        <td className="py-3 px-4 whitespace-nowrap text-center">
                          {getSeverityBadge(log.severity)}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <ShieldCheck className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                      <p className="text-xs font-semibold">لا توجد نشاطات مطابقة لشروط البحث والفلاتر المحددة</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Timeline View */
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="relative border-r-2 border-slate-200 pr-6 mr-3 space-y-6">
            {filteredLogs.map((log) => {
              const meta = getActionMeta(log.actionType);
              const userRoleData = ROLE_INFO[log.userRole];
              const dateObj = new Date(log.timestamp);
              const formattedDate = dateObj.toLocaleString('ar-EG');

              return (
                <div key={log.id} className="relative group">
                  {/* Timeline Dot */}
                  <div className="absolute -right-[31px] top-1.5 w-4 h-4 rounded-full bg-white border-2 border-emerald-700 group-hover:scale-125 transition-transform flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-800"></span>
                  </div>

                  <div className="p-4 bg-slate-50 hover:bg-emerald-50/40 border border-slate-200 rounded-xl transition-colors">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md border text-[11px] font-bold ${meta.color}`}>
                          {meta.icon}
                          <span>{meta.label}</span>
                        </span>
                        <span className="font-bold text-sm text-slate-900">{log.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getSeverityBadge(log.severity)}
                        <span className="text-[11px] font-mono text-slate-400">{formattedDate}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed mb-3">
                      {log.description}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200 text-[11px] text-slate-500">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">{log.userFullName}</span>
                        <span className="font-mono text-emerald-800">(@{log.username})</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded border ${userRoleData?.badgeColor}`}>
                          {userRoleData?.titleAr}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 font-mono text-slate-400">
                        {log.targetId && (
                          <span className="text-emerald-800 font-bold bg-white px-2 py-0.5 rounded border border-emerald-200">
                            {log.targetId}
                          </span>
                        )}
                        <span>{log.ipAddress}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Security & Audit Compliance Notice */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>
            نظام التدقيق الأمني متوافق مع معايير الحماية لجامعة الأزهر وبنك المعرفة المصري (EKB). السجلات لا يمكن تعديلها أو حذفها إلا بصلاحيات كاملة لمسؤول النظام.
          </span>
        </div>
        <span className="font-mono text-[11px] text-slate-400 shrink-0">
          AASJ Audit Engine v2.0
        </span>
      </div>

    </div>
  );
};
