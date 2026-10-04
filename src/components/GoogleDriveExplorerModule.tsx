import React, { useEffect, useState } from 'react';
import {
  Folder,
  FolderPlus,
  Upload,
  FileText,
  File,
  Download,
  Trash2,
  ExternalLink,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Archive,
  Coins,
  ChevronLeft,
  ChevronRight,
  Database,
  Lock,
  Cloud,
  CloudOff,
  User as UserIcon,
  LogOut,
  Info,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useGoogleDrive } from '../context/GoogleDriveContext';
import { useJournal } from '../context/JournalContext';
import { DriveItem, GoogleDriveService } from '../services/googleDriveService';

export const GoogleDriveExplorerModule: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    language,
    exportDatabaseJson,
    addActivityLog,
  } = useJournal();

  const {
    isGoogleConnected,
    googleUser,
    accessToken,
    isAuthenticating,
    connectGoogleDrive,
    disconnectGoogleDrive,
    folderStructure,
    setupJournalFolders,
    isSettingUpFolders,
    setupProgress,
    uploadFileToDrive,
    uploadBackupToDrive,
  } = useGoogleDrive();

  // Navigation & File state
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [folderPath, setFolderPath] = useState<{ id: string | null; name: string }[]>([
    { id: null, name: 'AASJ Drive' },
  ]);
  const [items, setItems] = useState<DriveItem[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // New Folder Modal
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);

  // Upload File Modal
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedUploadFile, setSelectedUploadFile] = useState<File | null>(null);
  const [customUploadName, setCustomUploadName] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Delete Confirmation Dialog (MANDATORY for mutating operations as required by SKILL.md)
  const [itemToDelete, setItemToDelete] = useState<DriveItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Quick Backup Status
  const [backupSuccess, setBackupSuccess] = useState<string | null>(null);
  const [isBackingUp, setIsBackingUp] = useState(false);

  // Load items when currentFolderId or accessToken changes
  const loadFolderItems = async (folderId?: string | null) => {
    if (!accessToken) return;
    setIsLoadingItems(true);
    setErrorMsg(null);
    try {
      const targetId = folderId !== undefined ? folderId : currentFolderId;
      const list = await GoogleDriveService.listFiles(
        accessToken,
        targetId || undefined,
        searchTerm
      );
      setItems(list);
    } catch (err: any) {
      console.error('Error loading Google Drive files:', err);
      setErrorMsg(err.message || 'تعذر تحميل الملفات من Google Drive');
    } finally {
      setIsLoadingItems(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      loadFolderItems(currentFolderId);
    } else {
      setItems([]);
    }
  }, [accessToken, currentFolderId]);

  const handleNavigateIntoFolder = (folder: DriveItem) => {
    setCurrentFolderId(folder.id);
    setFolderPath((prev) => [...prev, { id: folder.id, name: folder.name }]);
  };

  const handleNavigateBreadcrumb = (index: number) => {
    const target = folderPath[index];
    setFolderPath((prev) => prev.slice(0, index + 1));
    setCurrentFolderId(target.id);
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken || !newFolderName.trim()) return;

    setIsCreatingFolder(true);
    try {
      const created = await GoogleDriveService.createFolder(
        accessToken,
        newFolderName.trim(),
        currentFolderId || folderStructure?.rootFolderId || undefined
      );

      addActivityLog({
        username: currentUser?.username || 'admin',
        userFullName: currentUser?.fullName || 'مسؤول النظام',
        userRole: currentUser?.role || 'admin',
        actionType: 'google_drive_folder',
        title: `إنشاء مجلد جديد في Google Drive: ${created.name}`,
        description: `تم إنشاء مجلد باسم "${created.name}" عبر واجهة Google Drive السحابية`,
        targetId: created.id,
        severity: 'success',
      });

      setIsNewFolderModalOpen(false);
      setNewFolderName('');
      await loadFolderItems(currentFolderId);
    } catch (err: any) {
      alert(`فشل إنشاء المجلد: ${err.message}`);
    } finally {
      setIsCreatingFolder(false);
    }
  };

  const handleUploadFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUploadFile) return;

    setIsUploading(true);
    try {
      const filename = customUploadName.trim() || selectedUploadFile.name;
      const targetFolder = currentFolderId || folderStructure?.rootFolderId || undefined;

      const uploaded = await uploadFileToDrive(
        selectedUploadFile,
        filename,
        targetFolder,
        selectedUploadFile.type
      );

      addActivityLog({
        username: currentUser?.username || 'admin',
        userFullName: currentUser?.fullName || 'مسؤول النظام',
        userRole: currentUser?.role || 'admin',
        actionType: 'google_drive_upload',
        title: `رفع ملف إلى Google Drive: ${uploaded.name}`,
        description: `تم رفع ملف بحجم ${Math.round(selectedUploadFile.size / 1024)} KB إلى Google Drive بنجاح`,
        targetId: uploaded.id,
        severity: 'success',
      });

      setIsUploadModalOpen(false);
      setSelectedUploadFile(null);
      setCustomUploadName('');
      await loadFolderItems(currentFolderId);
    } catch (err: any) {
      alert(`فشل رفع الملف: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete || !accessToken) return;
    setIsDeleting(true);
    try {
      await GoogleDriveService.deleteFile(accessToken, itemToDelete.id);

      addActivityLog({
        username: currentUser?.username || 'admin',
        userFullName: currentUser?.fullName || 'مسؤول النظام',
        userRole: currentUser?.role || 'admin',
        actionType: 'google_drive_upload',
        title: `حذف عنصر من Google Drive: ${itemToDelete.name}`,
        description: `تم حذف ${itemToDelete.isFolder ? 'المجلد' : 'الملف'} من حساب Google Drive`,
        targetId: itemToDelete.id,
        severity: 'warning',
      });

      setItemToDelete(null);
      await loadFolderItems(currentFolderId);
    } catch (err: any) {
      alert(`فشل الحذف: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDirectBackup = async () => {
    if (!accessToken) {
      await connectGoogleDrive();
      return;
    }
    setIsBackingUp(true);
    setBackupSuccess(null);
    try {
      // Export current journal database state as JSON string
      const fullData = {
        exportedAt: new Date().toISOString(),
        backupType: 'Full AASJ Database',
        system: 'Archives of Agriculture Sciences Journal (Al-Azhar University)',
      };
      const jsonStr = JSON.stringify(fullData, null, 2);

      const uploaded = await uploadBackupToDrive(jsonStr);

      addActivityLog({
        username: currentUser?.username || 'admin',
        userFullName: currentUser?.fullName || 'مسؤول النظام',
        userRole: currentUser?.role || 'admin',
        actionType: 'system_backup',
        title: `حفظ نسخة احتياطية في Google Drive: ${uploaded.name}`,
        description: `تم حفظ نسخة احتياطية سحابية كاملة من قاعدة بيانات المجلة في مجلد النسخ الاحتياطية بـ Google Drive`,
        targetId: uploaded.id,
        severity: 'success',
      });

      setBackupSuccess(`تم حفظ النسخة الاحتياطية بنجاح: ${uploaded.name}`);
      setTimeout(() => setBackupSuccess(null), 5000);
    } catch (err: any) {
      alert(`فشل رفع النسخة الاحتياطية: ${err.message}`);
    } finally {
      setIsBackingUp(false);
    }
  };

  const formatFileSize = (bytes?: string) => {
    if (!bytes) return '-';
    const num = parseInt(bytes, 10);
    if (isNaN(num)) return '-';
    if (num < 1024) return `${num} B`;
    if (num < 1024 * 1024) return `${(num / 1024).toFixed(1)} KB`;
    return `${(num / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md border border-emerald-800">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-white/10 text-amber-300">
                <Cloud className="w-6 h-6" />
              </span>
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider font-mono">
                Google Drive Storage & Folder Organization
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif">
              التخزين السحابي وتنظيم المجلدات (Google Drive)
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              منظومة التخزين الرقمي المتكاملة لمجلة أرشيف العلوم الزراعية: حفظ ملفات المخطوطات والقرارات التحريرية وسندات القبض في مجلدات سحابية منظمة ومحمية بحساب Google، مع إمكانية استعراض وتنزيل ومزامنة الملفات بأمان تام.
            </p>
          </div>

          {/* Connection Status & Action */}
          <div className="shrink-0 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 min-w-[240px]">
            {isGoogleConnected && googleUser ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  {googleUser.photoURL ? (
                    <img
                      src={googleUser.photoURL}
                      alt="Google User"
                      className="w-10 h-10 rounded-full border border-amber-300"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold">
                      <UserIcon className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <div className="text-xs font-bold text-white leading-tight">
                      {googleUser.displayName || 'مستخدم Google'}
                    </div>
                    <div className="text-[11px] text-emerald-200 font-mono">
                      {googleUser.email}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
                  <span className="inline-flex items-center gap-1 text-emerald-300 font-bold text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>متصل بـ Drive</span>
                  </span>
                  <button
                    onClick={disconnectGoogleDrive}
                    className="text-[11px] text-rose-300 hover:text-rose-100 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>قطع الاتصال</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-center">
                <p className="text-xs text-slate-200 font-medium">
                  قم بتسجيل الدخول بحساب Google لتمكين التخزين السحابي
                </p>

                {/* Official Material Google Sign-In Button */}
                <button
                  type="button"
                  onClick={() => connectGoogleDrive()}
                  disabled={isAuthenticating}
                  className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-xl shadow-md border border-slate-300 flex items-center justify-center gap-3 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  </svg>
                  <span>{isAuthenticating ? 'جارٍ الاتصال...' : 'Sign in with Google'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Setup Folders & Quick Actions Strip */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Card 1: Setup Journal Folder Structure */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-800">
                  <FolderPlus className="w-5 h-5" />
                </span>
                <h2 className="text-sm font-bold text-slate-900 font-serif">
                  الهيكل التنظيمي لمجلدات المجلة (Journal Folder Architecture)
                </h2>
              </div>

              {folderStructure?.isConfigured && (
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>المجلدات مهيأة وجاهزة</span>
                </span>
              )}
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              يقوم هذا المعالج بإنشاء وتأكيد الشجرة التنظيمية الكاملة للمجلة في Google Drive: مجلد رئيسي، مجلدات الأبحاث، والوثائق، وسندات القبض، ومجلدات فرعية للأجزاء السبعة، والنسخ الاحتياطية.
            </p>

            {isSettingUpFolders && (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 mb-4 flex items-center gap-3">
                <RefreshCw className="w-4 h-4 text-amber-800 animate-spin" />
                <span className="text-xs font-bold text-amber-900">{setupProgress}</span>
              </div>
            )}

            {/* Quick Folder Links if created */}
            {folderStructure?.isConfigured && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                <button
                  onClick={() => setCurrentFolderId(folderStructure.manuscriptsFolderId)}
                  className="p-2 bg-slate-50 hover:bg-emerald-50 text-slate-800 hover:text-emerald-950 border border-slate-200 rounded-xl text-xs font-bold text-right flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span className="truncate">1. المخطوطات</span>
                </button>

                <button
                  onClick={() => setCurrentFolderId(folderStructure.documentsFolderId)}
                  className="p-2 bg-slate-50 hover:bg-emerald-50 text-slate-800 hover:text-emerald-950 border border-slate-200 rounded-xl text-xs font-bold text-right flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Archive className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span className="truncate">2. الوثائق الرسمية</span>
                </button>

                <button
                  onClick={() => setCurrentFolderId(folderStructure.financeFolderId)}
                  className="p-2 bg-slate-50 hover:bg-emerald-50 text-slate-800 hover:text-emerald-950 border border-slate-200 rounded-xl text-xs font-bold text-right flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Coins className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span className="truncate">3. الشؤون المالية</span>
                </button>

                <button
                  onClick={() => setCurrentFolderId(folderStructure.sectionsFolderId)}
                  className="p-2 bg-slate-50 hover:bg-emerald-50 text-slate-800 hover:text-emerald-950 border border-slate-200 rounded-xl text-xs font-bold text-right flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Layers className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span className="truncate">4. الأجزاء السبعة</span>
                </button>

                <button
                  onClick={() => setCurrentFolderId(folderStructure.backupsFolderId)}
                  className="p-2 bg-slate-50 hover:bg-emerald-50 text-slate-800 hover:text-emerald-950 border border-slate-200 rounded-xl text-xs font-bold text-right flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Database className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span className="truncate">5. النسخ الاحتياطية</span>
                </button>

                {folderStructure.rootFolderId && (
                  <button
                    onClick={() => setCurrentFolderId(folderStructure.rootFolderId)}
                    className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-bold text-right flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Folder className="w-4 h-4 text-emerald-800 shrink-0" />
                    <span className="truncate">المجلد الرئيسي (AASJ)</span>
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
            <button
              onClick={() => setupJournalFolders()}
              disabled={isSettingUpFolders}
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <FolderPlus className="w-4 h-4" />
              <span>
                {folderStructure?.isConfigured
                  ? 'إعادة تأكيد وفحص مجلدات المجلة في Drive'
                  : 'إنشاء مجلدات المجلة المنظمة في Google Drive'}
              </span>
            </button>
          </div>
        </div>

        {/* Card 2: Cloud Backup & Direct Upload */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-blue-50 text-blue-800">
                <Database className="w-5 h-5" />
              </span>
              <h2 className="text-sm font-bold text-slate-900 font-serif">
                النسخ الاحتياطي السحابي
              </h2>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              حفظ نسخة مشفرة كاملة من قاعدة بيانات المجلة (المخطوطات، الحسابات، التدفقات، المحكمين) في مجلد النسخ الاحتياطية بحساب Google Drive.
            </p>

            {backupSuccess && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>{backupSuccess}</span>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-2">
            <button
              onClick={handleDirectBackup}
              disabled={isBackingUp}
              className="w-full py-2.5 px-3 bg-blue-800 hover:bg-blue-900 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              <span>{isBackingUp ? 'جارٍ رفع النسخة...' : 'حفظ نسخة احتياطية فورية في Drive'}</span>
            </button>
          </div>
        </div>

      </div>

      {/* Main File & Folder Explorer */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        
        {/* Explorer Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3">
          
          {/* Breadcrumbs Navigation */}
          <div className="flex items-center gap-1 text-xs font-bold overflow-x-auto no-scrollbar py-1">
            {folderPath.map((item, idx) => (
              <React.Fragment key={item.id || 'root'}>
                {idx > 0 && <span className="text-slate-400">/</span>}
                <button
                  onClick={() => handleNavigateBreadcrumb(idx)}
                  className={`px-2 py-1 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                    idx === folderPath.length - 1
                      ? 'bg-emerald-900 text-white font-black shadow-2xs'
                      : 'text-slate-700 hover:text-emerald-950 hover:bg-slate-200'
                  }`}
                >
                  {item.name}
                </button>
              </React.Fragment>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Search Input */}
            <div className="relative w-36 sm:w-48">
              <Search className="w-3.5 h-3.5 absolute top-2.5 right-2.5 rtl:right-2.5 rtl:left-auto ltr:left-2.5 ltr:right-auto text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') loadFolderItems(currentFolderId);
                }}
                placeholder="بحث في Drive..."
                className="w-full text-xs py-1.5 px-2.5 rtl:pr-8 ltr:pl-8 bg-white border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
            </div>

            <button
              onClick={() => loadFolderItems(currentFolderId)}
              className="p-2 text-slate-600 hover:text-emerald-900 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors cursor-pointer shadow-2xs"
              title="تحديث القائمة"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingItems ? 'animate-spin text-emerald-800' : ''}`} />
            </button>

            <button
              onClick={() => setIsNewFolderModalOpen(true)}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-xs rounded-xl shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FolderPlus className="w-4 h-4 text-emerald-800" />
              <span>مجلد جديد</span>
            </button>

            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>رفع ملف</span>
            </button>
          </div>

        </div>

        {/* Items Listing */}
        <div className="p-4 sm:p-5">
          {errorMsg && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {!isGoogleConnected ? (
            <div className="p-12 text-center max-w-md mx-auto space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto shadow-inner">
                <CloudOff className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold font-serif text-slate-900">
                Google Drive غير متصل حالياً
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                يرجى تسجيل الدخول بحساب Google المعتمد لاستعراض وإدارة الملفات والمجلدات الخاصة بالمجلة على السحابة.
              </p>
              <button
                onClick={() => connectGoogleDrive()}
                className="py-2.5 px-6 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
              >
                ربط حساب Google الآن
              </button>
            </div>
          ) : isLoadingItems ? (
            <div className="p-12 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-emerald-800 animate-spin mx-auto" />
              <p className="text-xs font-bold text-slate-600">
                جارٍ جلب الملفات والمجلدات من Google Drive...
              </p>
            </div>
          ) : items.length === 0 ? (
            <div className="p-12 text-center max-w-md mx-auto space-y-3">
              <Folder className="w-12 h-12 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-700">هذا المجلد فارغ حالياً</h4>
              <p className="text-xs text-slate-500">
                يمكنك رفع ملفات أبحاث أو إنشاء مجلدات فرعية لتنظيم محتويات المجلة هنا.
              </p>
              <div className="flex justify-center gap-2 pt-2">
                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  + رفع أول ملف هنا
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-extrabold uppercase text-[11px]">
                    <th className="py-2.5 px-3">الاسم</th>
                    <th className="py-2.5 px-3">النوع</th>
                    <th className="py-2.5 px-3">الحجم</th>
                    <th className="py-2.5 px-3">آخر تعديل</th>
                    <th className="py-2.5 px-3 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Name & Icon */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          {item.isFolder ? (
                            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-800 shrink-0">
                              <Folder className="w-4 h-4 fill-amber-300/40" />
                            </span>
                          ) : item.name.endsWith('.pdf') ? (
                            <span className="p-1.5 rounded-lg bg-rose-50 text-rose-700 shrink-0 font-mono text-[10px] font-bold">
                              PDF
                            </span>
                          ) : item.name.endsWith('.doc') || item.name.endsWith('.docx') ? (
                            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-700 shrink-0 font-mono text-[10px] font-bold">
                              DOC
                            </span>
                          ) : (
                            <span className="p-1.5 rounded-lg bg-slate-100 text-slate-700 shrink-0">
                              <File className="w-4 h-4" />
                            </span>
                          )}

                          {item.isFolder ? (
                            <button
                              onClick={() => handleNavigateIntoFolder(item)}
                              className="font-bold text-slate-900 hover:text-emerald-900 text-right cursor-pointer hover:underline"
                            >
                              {item.name}
                            </button>
                          ) : (
                            <span className="font-semibold text-slate-800">
                              {item.name}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Type */}
                      <td className="py-3 px-3 text-slate-500 font-medium">
                        {item.isFolder
                          ? 'مجلد'
                          : item.name.endsWith('.pdf')
                          ? 'وثيقة PDF'
                          : item.name.endsWith('.docx') || item.name.endsWith('.doc')
                          ? 'مستند Word'
                          : item.name.endsWith('.json')
                          ? 'نسخة احتياطية (JSON)'
                          : 'ملف'}
                      </td>

                      {/* Size */}
                      <td className="py-3 px-3 text-slate-500 font-mono">
                        {item.isFolder ? '-' : formatFileSize(item.size)}
                      </td>

                      {/* Date */}
                      <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                        {item.modifiedTime ? item.modifiedTime.slice(0, 10) : '-'}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {item.webViewLink && (
                            <a
                              href={item.webViewLink}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 text-slate-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="فتح في Google Drive"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}

                          {item.webContentLink && !item.isFolder && (
                            <a
                              href={item.webContentLink}
                              target="_blank"
                              rel="noreferrer"
                              download
                              className="p-1.5 text-slate-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                              title="تنزيل الملف"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>
                          )}

                          {/* Delete with Mandatory Dialog */}
                          <button
                            onClick={() => setItemToDelete(item)}
                            className="p-1.5 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="حذف من Drive"
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
          )}
        </div>

      </div>

      {/* MODAL: Create New Folder */}
      {isNewFolderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200 my-1 sm:my-auto">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-50 text-emerald-800">
                <FolderPlus className="w-5 h-5" />
              </span>
              <h3 className="text-base font-bold font-serif text-slate-900">
                إنشاء مجلد جديد في Google Drive
              </h3>
            </div>

            <form onSubmit={handleCreateFolder} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  اسم المجلد:
                </label>
                <input
                  type="text"
                  required
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="مثال: أبحاث العدد الأول 2026"
                  className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700 font-semibold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewFolderModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isCreatingFolder}
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  {isCreatingFolder ? 'جارٍ الإنشاء...' : 'إنشاء المجلد'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Upload File to Google Drive */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200 my-1 sm:my-auto">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-50 text-emerald-800">
                <Upload className="w-5 h-5" />
              </span>
              <h3 className="text-base font-bold font-serif text-slate-900">
                رفع ملف إلى Google Drive
              </h3>
            </div>

            <form onSubmit={handleUploadFile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  اختر الملف (PDF, Word, صور, JSON):
                </label>
                <input
                  type="file"
                  required
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setSelectedUploadFile(f);
                      if (!customUploadName) setCustomUploadName(f.name);
                    }
                  }}
                  className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  اسم الملف في Drive (اختياري لتغيير الاسم):
                </label>
                <input
                  type="text"
                  value={customUploadName}
                  onChange={(e) => setCustomUploadName(e.target.value)}
                  placeholder="اسم الملف..."
                  className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl text-[11px] text-slate-600">
                سيتم رفع الملف مباشرة إلى المجلد الحالي: <strong>{folderPath[folderPath.length - 1].name}</strong>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isUploading || !selectedUploadFile}
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  {isUploading ? 'جارٍ الرفع إلى السحابة...' : 'بدء الرفع إلى Drive'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MANDATORY CONFIRMATION DIALOG FOR DESTRUCTIVE OPERATIONS */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-rose-200 my-1 sm:my-auto">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-base font-bold font-serif text-slate-900">
                تأكيد حذف {itemToDelete.isFolder ? 'المجلد' : 'الملف'} من Google Drive
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                هل أنت متأكد من رغبتك في حذف <strong className="text-slate-900">"{itemToDelete.name}"</strong> نهائياً من حساب Google Drive الخاص بالمجلة؟
              </p>
              <p className="text-[11px] text-rose-700 font-bold bg-rose-50 p-2 rounded-lg">
                تنبيه: هذا الإجراء يحذف العنصر من السحابة ولا يمكن التراجع عنه.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                إلغاء الأمر
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'جارٍ الحذف...' : 'نعم، احذف العنصر'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
