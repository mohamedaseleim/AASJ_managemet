import React, { useState } from 'react';
import {
  UserPlus,
  Shield,
  Key,
  Mail,
  Phone,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Cloud,
  CloudOff,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { JOURNAL_SECTIONS, ROLE_INFO } from '../data/journalSections';
import { DISCIPLINE_TRANSLATIONS } from '../translations';
import { JournalDiscipline, UserAccount, UserRole } from '../types/journal';
import { ChangePasswordModal } from './ChangePasswordModal';

export const UsersManagementModule: React.FC = () => {
  const { users, addUser, updateUser, deleteUser, currentUser, syncStatus, refreshUsers } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [passwordChangeTarget, setPasswordChangeTarget] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Form State
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [title, setTitle] = useState('د.');
  const [affiliation, setAffiliation] = useState('كلية الزراعة (فرع أسيوط)، جامعة الأزهر');
  const [role, setRole] = useState<UserRole>('editor');
  const [assignedSection, setAssignedSection] = useState<JournalDiscipline>(JOURNAL_SECTIONS[0].discipline);
  const [isActive, setIsActive] = useState(true);

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFullName('');
    setUsername('');
    setPassword('');
    setEmail('');
    setPhone('');
    setTitle('د.');
    setAffiliation('كلية الزراعة (فرع أسيوط)، جامعة الأزهر');
    setRole('editor');
    setAssignedSection(JOURNAL_SECTIONS[0].discipline);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (u: UserAccount) => {
    setEditingUser(u);
    setFullName(u.fullName);
    setUsername(u.username);
    setPassword('');
    setEmail(u.email);
    setPhone(u.phone || '');
    setTitle(u.title || 'د.');
    setAffiliation(u.affiliation || '');
    setRole(u.role);
    setAssignedSection(u.assignedSection || JOURNAL_SECTIONS[0].discipline);
    setIsActive(u.isActive);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshUsers();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUsername = username.toLowerCase().trim();
    const cleanFullName = fullName.trim();

    if (!cleanUsername || !cleanFullName || (!editingUser && !password.trim())) {
      alert('يرجى ملء جميع الحقول الإلزامية');
      return;
    }

    // Check duplicate username (exclude currently editing user)
    const isDuplicate = users.some((u) => {
      if (editingUser && u.id === editingUser.id) return false;
      return u.username.toLowerCase().trim() === cleanUsername;
    });

    if (isDuplicate) {
      alert('اسم المستخدم هذا مسجل مسبقاً، يرجى اختيار اسم مستخدم آخر');
      return;
    }

    setIsSaving(true);
    try {
      if (editingUser) {
        const updates: Partial<UserAccount> = {
          fullName: cleanFullName,
          username: cleanUsername,
          email: email.trim(),
          phone: phone.trim() || undefined,
          title: title.trim() || undefined,
          affiliation: affiliation.trim() || undefined,
          role,
          assignedSection: role === 'executive_editor' ? assignedSection : undefined,
          isActive,
        };
        if (password.trim()) {
          updates.password = password.trim();
        }
        await updateUser(editingUser.id, updates);
      } else {
        await addUser({
          fullName: cleanFullName,
          username: cleanUsername,
          password: password.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          title: title.trim() || undefined,
          affiliation: affiliation.trim() || undefined,
          role,
          assignedSection: role === 'executive_editor' ? assignedSection : undefined,
          isActive,
        });
      }

      setIsModalOpen(false);
      setEditingUser(null);
    } catch {
      alert('تم حفظ التعديلات محلياً، لكن تعذرت مزامنتها مع السحابة. يرجى التحقق من الاتصال والمحاولة مرة أخرى.');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    const q = searchTerm.toLowerCase().trim();
    if (!q) return true;
    return (
      u.fullName.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.affiliation || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Title & Action Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 font-serif">
              إدارة حسابات المستخدمين وصلاحيات الأدوار
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              إنشاء حسابات أعضاء هيئة التحرير، وتحديد الأدوار الأكاديمية والمزامنة السحابية الفورية لكافة الأجهزة.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            {/* Cloud Sync Status Indicator */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium ${
                syncStatus === 'synced'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : syncStatus === 'syncing'
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : syncStatus === 'error'
                  ? 'bg-rose-50 text-rose-800 border-rose-200'
                  : 'bg-slate-50 text-slate-700 border-slate-200'
              }`}
              title="حالة المزامنة السحابية الفورية للحسابات بين مختلف الأجهزة والمتصفحات"
            >
              {syncStatus === 'syncing' ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-700" />
              ) : syncStatus === 'synced' ? (
                <Cloud className="w-3.5 h-3.5 text-emerald-700" />
              ) : syncStatus === 'offline' ? (
                <CloudOff className="w-3.5 h-3.5 text-slate-500" />
              ) : (
                <CloudOff className="w-3.5 h-3.5 text-rose-600" />
              )}
              <span>
                {syncStatus === 'synced' && 'متزامن سحابياً (كافة الأجهزة)'}
                {syncStatus === 'syncing' && 'جارٍ المزامنة السحابية...'}
                {syncStatus === 'offline' && 'وضع محلي (دون اتصال)'}
                {syncStatus === 'error' && 'تنبيه اتصال سحابي'}
              </span>
            </div>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 text-slate-600 hover:text-emerald-800 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              title="مزامنة فورية وتحديث قائمة المستخدمين من السحابة الآن"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-700' : ''}`} />
            </button>

            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>إنشاء حساب مستخدم جديد</span>
            </button>
          </div>
        </div>

        {/* Cloud sync tip banner */}
        <div className="mt-4 p-2.5 bg-emerald-50/70 border border-emerald-100 rounded-lg flex items-center gap-2 text-xs text-emerald-900">
          <Cloud className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>
            <strong>المزامنة السحابية الموحدة:</strong> أي مستخدم يتم إنشاؤه، تعديله أو حذفه ينعكس مباشرة على قاعدة البيانات السحابية (Cloud Firestore)، ويمكن للمستخدم الدخول فوراً من أي جهاز أو متصفح آخر.
          </span>
        </div>

        {/* Filter and Search Bar */}
        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute top-2.5 right-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="بحث بالاسم، اسم المستخدم، البريد، الكلية..."
              className="w-full text-xs py-2 pr-9 pl-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
            />
          </div>

          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
            >
              <option value="all">كافة الأدوار التحريرية والإدارية</option>
              {Object.keys(ROLE_INFO).map((r) => (
                <option key={r} value={r}>
                  {ROLE_INFO[r as UserRole].titleAr}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">اسم المستخدم والحساب</th>
                <th className="py-3 px-4">الدور الوظيفي / الصلاحية</th>
                <th className="py-3 px-4">القسم / الجزء المرتبط</th>
                <th className="py-3 px-4">بيانات الاتصال</th>
                <th className="py-3 px-4 text-center">الحالة</th>
                <th className="py-3 px-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredUsers.map((u) => {
                const roleMeta = ROLE_INFO[u.role];
                return (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    {/* User Info */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{u.fullName}</div>
                      <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1.5 mt-0.5">
                        <span>@{u.username}</span>
                        <span>·</span>
                        <span className="text-slate-400">حماية الحساب: <strong className="text-slate-600 font-mono">••••••••</strong></span>
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-xs">{u.affiliation}</div>
                    </td>

                    {/* Role Badge */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`inline-block px-2.5 py-1 rounded-md text-[11px] border font-medium ${roleMeta.badgeColor}`}>
                        {roleMeta.titleAr}
                      </span>
                    </td>

                    {/* Assigned Section */}
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs">
                      {u.assignedSection ? (
                        <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded text-[11px] border border-emerald-200 truncate block">
                          {DISCIPLINE_TRANSLATIONS[u.assignedSection]?.ar || u.assignedSection}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    {/* Contact */}
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                      <div>{u.email}</div>
                      <div className="text-slate-400">{u.phone || '—'}</div>
                    </td>

                    {/* Active Status */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {u.isActive ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>نشط</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-600 font-semibold text-[11px]">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>معطل</span>
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setPasswordChangeTarget(u.username)}
                          className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                          title="تغيير كلمة المرور لهذا الحساب"
                        >
                          <Key className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(u)}
                          className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          title="تعديل الحساب"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={async () => {
                            if (window.confirm(`هل أنت متأكد من حذف الحساب "${u.username}" نهائياً من كافة الأجهزة والسحابة؟`)) {
                              await deleteUser(u.id);
                            }
                          }}
                          disabled={currentUser?.id === u.id}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-30 rounded-lg transition-colors cursor-pointer"
                          title="حذف الحساب"
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
      </div>

      {/* Add / Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-slate-900/70 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden my-1 sm:my-auto flex flex-col max-h-[96dvh] sm:max-h-[94vh]">
            <div className="px-4 sm:px-6 py-3.5 bg-emerald-950 text-white flex items-center justify-between shrink-0 sticky top-0 z-20">
              <h3 className="font-bold text-sm">
                {editingUser ? `تعديل بيانات الحساب [@${editingUser.username}]` : 'إنشاء حساب مستخدم جديد وتحديد الصلاحية'}
              </h3>
              <button onClick={handleCloseModal} className="p-1 text-emerald-200 hover:text-white rounded-lg hover:bg-emerald-900 transition-colors">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-3 text-xs overflow-y-auto flex-1">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">اللقب العلمي:</label>
                  <select
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="أ.د.">أ.د. (أستاذ دكتور)</option>
                    <option value="د.">د. (دكتور)</option>
                    <option value="م.">م. (مهندس)</option>
                    <option value="أ.">أ. (أستاذ)</option>
                    <option value="باحث">باحث</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-slate-700 font-semibold block mb-1">الاسم الرباعي واللقب:</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    placeholder="مثال: د. أحمد محمد علي"
                    className="w-full p-2 border border-slate-300 rounded-lg font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">اسم المستخدم (Username):</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder="e.g. ahmed_soliman"
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">
                    {editingUser ? 'كلمة المرور الجديدة (اختياري):' : 'كلمة المرور:'}
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required={!editingUser}
                    placeholder={editingUser ? 'اتركها فارغة للإبقاء على الحالية' : 'أدخل كلمة مرور الحساب...'}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="text-slate-700 font-semibold block mb-1">
                  الدور الوظيفي في المجلة (Role):
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg bg-white font-semibold text-emerald-950"
                >
                  <option value="general_supervisor">المشرف العام (عميد الكلية - إشراف مالي وإداري)</option>
                  <option value="editor_in_chief">رئيس التحرير (Editor-in-Chief)</option>
                  <option value="advisory_head">رئيس الهيئة الاستشارية (Head of Advisory Board)</option>
                  <option value="managing_editor">مدير التحرير (Managing Editor)</option>
                  <option value="secretary">سكرتير المجلة (Journal Secretary)</option>
                  <option value="executive_editor">محرر تنفيذي - مشرف على جزء من أجزاء المجلة السبعة</option>
                  <option value="editor">محرر (Editor) - فحص وتقييم الأبحاث وتوجيه التحكيم</option>
                  <option value="layout_editor">محرر تنسيق وإخراج فني (Layout Editor)</option>
                  <option value="reviewer">محكم علمي معتمد (Peer Reviewer)</option>
                  <option value="author">مؤلف وباحث (Author)</option>
                  <option value="admin">مسؤول النظام (System Administrator)</option>
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  {ROLE_INFO[role]?.descriptionAr}
                </p>
              </div>

              {/* If Executive Editor: Select the Section */}
              {role === 'executive_editor' && (
                <div className="p-3 bg-sky-50 border border-sky-200 rounded-lg space-y-1">
                  <label className="text-sky-900 font-bold block mb-1">
                    اختر الجزء/التخصص المشرف عليه (من الأجزاء السبعة):
                  </label>
                  <select
                    value={assignedSection}
                    onChange={(e) => setAssignedSection(e.target.value as JournalDiscipline)}
                    className="w-full p-2 border border-sky-300 rounded-lg bg-white font-semibold text-xs"
                  >
                    {JOURNAL_SECTIONS.map((sec) => (
                      <option key={sec.id} value={sec.discipline}>
                        {sec.arabicName}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">البريد الإلكتروني:</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="user@azhar.edu.eg"
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">رقم الهاتف / الجوال:</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+20 100..."
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">الجهة الأكاديمية والكلية:</label>
                <input
                  type="text"
                  value={affiliation}
                  onChange={(e) => setAffiliation(e.target.value)}
                  placeholder="كلية الزراعة (فرع أسيوط)، جامعة الأزهر"
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded text-emerald-700"
                  />
                  <span className="font-semibold text-slate-700">الحساب مفعل ونشط للوصول</span>
                </label>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-60 text-white font-bold rounded-lg shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>
                    {isSaving
                      ? 'جارٍ الحفظ والمزامنة السحابية...'
                      : editingUser
                      ? 'حفظ التعديلات السحابية'
                      : 'إنشاء وتفعيل الحساب سحابياً'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={Boolean(passwordChangeTarget)}
        onClose={() => setPasswordChangeTarget(null)}
        targetUsername={passwordChangeTarget || undefined}
      />
    </div>
  );
};
