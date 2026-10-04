import React, { useState } from 'react';
import {
  Bell,
  X,
  AlertTriangle,
  Clock,
  Mail,
  Send,
  Calendar,
  Sparkles,
  Volume2,
  VolumeX,
  CheckCircle2,
  Sliders,
  Search,
  ExternalLink,
  ChevronRight,
  Eye,
  UserCheck,
  RefreshCw,
  Info,
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { NotificationFilterTab, ReviewerOverdueNotification } from '../types/notifications';
import { ReviewerReminderModal } from './ReviewerReminderModal';
import { Manuscript } from '../types/journal';
import { useJournal } from '../context/JournalContext';

interface ReviewerNotificationsModalProps {
  onClose: () => void;
  onSelectManuscript?: (m: Manuscript) => void;
  onOpenSmartMatch?: (m: Manuscript) => void;
}

export const ReviewerNotificationsModal: React.FC<ReviewerNotificationsModalProps> = ({
  onClose,
  onSelectManuscript,
  onOpenSmartMatch,
}) => {
  const {
    thresholdDays,
    setThresholdDays,
    notifications,
    activeOverdueNotifications,
    activeApproachingNotifications,
    activeRemindedNotifications,
    overdueCount,
    approachingCount,
    totalActiveAlertsCount,
    extendDeadline,
    dismissNotification,
    restoreNotification,
    clearAllDismissed,
    isSoundEnabled,
    setIsSoundEnabled,
    playNotificationSound,
  } = useNotifications();

  const { manuscripts } = useJournal();

  const [activeTab, setActiveTab] = useState<NotificationFilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNotificationForReminder, setSelectedNotificationForReminder] = useState<ReviewerOverdueNotification | null>(null);
  const [isEditingThreshold, setIsEditingThreshold] = useState(false);
  const [customDaysInput, setCustomDaysInput] = useState(thresholdDays.toString());

  // Filter list by tab & search query
  const filteredList = notifications.filter((item) => {
    // Tab filter
    if (activeTab === 'overdue' && !item.isOverdue) return false;
    if (activeTab === 'approaching' && !item.isApproaching) return false;
    if (activeTab === 'reminded' && item.reminderCount === 0) return false;

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.reviewerName.toLowerCase().includes(q);
      const matchId = item.manuscriptId.toLowerCase().includes(q);
      const matchTitle = item.manuscriptTitle.toLowerCase().includes(q);
      const matchDiscipline = item.discipline.toLowerCase().includes(q);
      return matchName || matchId || matchTitle || matchDiscipline;
    }

    return true;
  });

  const handleApplyCustomThreshold = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(customDaysInput, 10);
    if (!isNaN(val) && val > 0) {
      setThresholdDays(val);
      setIsEditingThreshold(false);
    }
  };

  const handleOpenDossier = (manuscriptId: string) => {
    const target = manuscripts.find((m) => m.id === manuscriptId);
    if (target && onSelectManuscript) {
      onSelectManuscript(target);
      onClose();
    }
  };

  const handleOpenSmartReassign = (manuscriptId: string) => {
    const target = manuscripts.find((m) => m.id === manuscriptId);
    if (target && onOpenSmartMatch) {
      onOpenSmartMatch(target);
      onClose();
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-slate-950/80 backdrop-blur-xs p-1.5 sm:p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-300 w-full max-w-4xl overflow-hidden my-1 sm:my-auto flex flex-col max-h-[96dvh] sm:max-h-[94vh]">
          
          {/* Header - Sticky shrink-0 */}
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 text-white p-3.5 sm:px-6 sm:py-4 flex items-center justify-between border-b border-slate-800 shrink-0 sticky top-0 z-20 shadow-md">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="relative p-2 rounded-xl bg-amber-400 text-slate-950 font-bold shrink-0">
                <Bell className="w-5 h-5" />
                {totalActiveAlertsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-600 text-white rounded-full flex items-center justify-center text-[10px] font-black border-2 border-slate-950 animate-bounce">
                    {totalActiveAlertsCount}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-extrabold text-xs sm:text-base text-white truncate">
                    نظام إشعارات تأخر المحكمين والمهل الزمنية
                  </h2>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-800 text-emerald-200 border border-emerald-700 shrink-0">
                    هيئة التحرير AASJ
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-slate-300 truncate mt-0.5">
                  تنبيهات فورية للمحررين عند تجاوز فترة التحكيم المحددة ({thresholdDays} يوماً) دون تسليم التقرير
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 ml-auto rtl:mr-auto rtl:ml-0">
              {/* Sound Toggle */}
              <button
                type="button"
                onClick={() => {
                  setIsSoundEnabled(!isSoundEnabled);
                  if (!isSoundEnabled) playNotificationSound();
                }}
                className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                  isSoundEnabled
                    ? 'bg-emerald-900/60 border-emerald-600 text-emerald-300 hover:bg-emerald-800'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                }`}
                title={isSoundEnabled ? 'الصوت مفعل (انقر للتعطيل)' : 'الصوت معطل (انقر للتفعيل)'}
              >
                {isSoundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              <button
                onClick={onClose}
                className="p-1.5 text-slate-300 hover:text-white rounded-xl hover:bg-slate-800 active:bg-slate-700 transition-colors cursor-pointer bg-slate-800/60 border border-slate-700/50"
                title="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Timeframe Configuration Widget */}
          <div className="bg-slate-50 border-b border-slate-200 p-3 sm:px-6 py-2.5 flex items-center justify-between gap-3 flex-wrap text-xs shrink-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-emerald-700" />
                <span>فترة المهلة المعتمدة للتنبيه:</span>
              </span>

              {/* Quick Preset Buttons */}
              <div className="inline-flex rounded-lg bg-white border border-slate-300 p-0.5 shadow-2xs">
                {[14, 21, 30].map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setThresholdDays(days)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                      thresholdDays === days
                        ? 'bg-emerald-800 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {days} يوماً {days === 21 && '(المعتمد)'}
                  </button>
                ))}
              </div>

              {!isEditingThreshold ? (
                <button
                  type="button"
                  onClick={() => setIsEditingThreshold(true)}
                  className="text-[11px] text-blue-600 hover:underline font-semibold"
                >
                  تخصيص يدوي
                </button>
              ) : (
                <form onSubmit={handleApplyCustomThreshold} className="flex items-center gap-1">
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={customDaysInput}
                    onChange={(e) => setCustomDaysInput(e.target.value)}
                    className="w-16 px-1.5 py-0.5 text-xs border border-slate-300 rounded font-bold text-center"
                  />
                  <span className="text-[11px] text-slate-500">يوم</span>
                  <button
                    type="submit"
                    className="px-2 py-0.5 bg-emerald-700 hover:bg-emerald-800 text-white text-3xs font-bold rounded"
                  >
                    حفظ
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingThreshold(false)}
                    className="text-3xs text-slate-500 hover:underline"
                  >
                    إلغاء
                  </button>
                </form>
              )}
            </div>

            <div className="text-[11px] text-slate-500 font-mono">
              المتأخرين حالياً: <strong className="text-rose-600 font-bold">{overdueCount}</strong> · اقترب موعدهم: <strong className="text-amber-600 font-bold">{approachingCount}</strong>
            </div>
          </div>

          {/* Filter Tabs and Search Bar */}
          <div className="p-3 sm:px-6 py-2 border-b border-slate-200 bg-white flex items-center justify-between gap-3 flex-wrap shrink-0">
            {/* Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                الكل ({notifications.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('overdue')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  activeTab === 'overdue'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>متأخر تجاوز المهلة ({overdueCount})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('approaching')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  activeTab === 'approaching'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>اقترب الموعد ({approachingCount})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('reminded')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  activeTab === 'reminded'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>تذكيرات سابقة ({activeRemindedNotifications.length})</span>
              </button>
            </div>

            {/* Search Box */}
            <div className="relative w-full sm:w-56 shrink-0">
              <Search className="w-3.5 h-3.5 absolute top-2.5 right-3 rtl:right-3 rtl:left-auto ltr:left-3 ltr:right-auto text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث باسم المحكم أو كود البحث..."
                className="w-full text-xs py-1.5 px-3 rtl:pr-8 ltr:pl-8 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-700"
              />
            </div>
          </div>

          {/* Notifications List Body */}
          <div className="p-3 sm:p-6 overflow-y-auto flex-1 space-y-3 bg-slate-50/60">
            {filteredList.length > 0 ? (
              filteredList.map((item) => {
                return (
                  <div
                    key={item.id}
                    className={`bg-white rounded-2xl border p-3.5 sm:p-4 transition-all shadow-xs space-y-3 ${
                      item.isOverdue
                        ? 'border-rose-300 ring-1 ring-rose-200/50 hover:shadow-md'
                        : item.isApproaching
                        ? 'border-amber-300 ring-1 ring-amber-200/50 hover:shadow-md'
                        : 'border-slate-200 hover:shadow-sm'
                    } ${item.isDismissed ? 'opacity-60 bg-slate-100' : ''}`}
                  >
                    {/* Top Row: Reviewer Details & Overdue Badge */}
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-xs sm:text-sm text-slate-900">
                            {item.reviewerName}
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-3xs font-extrabold bg-slate-100 text-slate-700 border border-slate-200">
                            {item.slotLabelAr}
                          </span>
                          {item.reviewerAffiliation && (
                            <span className="text-[11px] text-slate-500 truncate max-w-xs">
                              · {item.reviewerAffiliation}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 font-mono">
                          {item.reviewerEmail}
                        </p>
                      </div>

                      {/* Urgency Badge */}
                      <div>
                        {item.isOverdue ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black bg-rose-100 text-rose-950 border border-rose-300 animate-pulse">
                            <AlertTriangle className="w-4 h-4 text-rose-600" />
                            <span>متأخر بـ {item.overdueDays} يوماً عن المهلة</span>
                          </span>
                        ) : item.isApproaching ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-100 text-amber-950 border border-amber-300">
                            <Clock className="w-3.5 h-3.5 text-amber-700" />
                            <span>متبقي {item.daysRemaining} {item.daysRemaining === 1 ? 'يوم' : 'أيام'} فقط</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold bg-blue-50 text-blue-900 border border-blue-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                            <span>تم إرسال تذكير سابق</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Middle Row: Manuscript Info */}
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between gap-2 flex-wrap text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-mono font-black text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-300 shrink-0">
                          {item.manuscriptId}
                        </span>
                        <p className="font-semibold text-slate-800 line-clamp-1 truncate" title={item.manuscriptTitle}>
                          {item.manuscriptTitle}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono shrink-0">
                        <span>الإسناد: <strong>{item.assignedDate}</strong></span>
                        <span>الاستحقاق: <strong className={item.isOverdue ? 'text-rose-700' : 'text-slate-800'}>{item.dueDate}</strong></span>
                      </div>
                    </div>

                    {/* Reminder Status History Tag */}
                    {item.reminderCount > 0 && (
                      <div className="text-[10.5px] text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1.5">
                        <Send className="w-3 h-3 text-emerald-600" />
                        <span>
                          تم توثيق إرسال التذكير لهذا المحكم ({item.reminderCount} مرات) — آخر تذكير: {new Date(item.lastReminderSentAt || '').toLocaleString('ar-EG')}
                        </span>
                      </div>
                    )}

                    {/* Bottom Row: Actions Bar */}
                    <div className="pt-1 flex items-center justify-between gap-1.5 flex-wrap">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* 1. Send Reminder Button */}
                        <button
                          type="button"
                          onClick={() => setSelectedNotificationForReminder(item)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-rose-700 hover:bg-rose-600 active:bg-rose-800 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer ring-1 ring-rose-500/40"
                          title="إرسال رسالة تذكير رسمية بموعد التحكيم"
                        >
                          <Mail className="w-3.5 h-3.5 text-rose-200" />
                          <span>إرسال تذكير رسمي</span>
                        </button>

                        {/* 2. Extend Deadline (+7 or +14 Days) */}
                        <div className="inline-flex rounded-lg border border-slate-300 bg-white p-0.5 text-3xs font-bold text-slate-700">
                          <button
                            type="button"
                            onClick={() => extendDeadline(item.manuscriptId, item.slot, 7)}
                            className="px-2 py-1 rounded hover:bg-slate-100 transition-colors"
                            title="تمديد مهلة المحكم 7 أيام إضافية"
                          >
                            +7 أيام
                          </button>
                          <button
                            type="button"
                            onClick={() => extendDeadline(item.manuscriptId, item.slot, 14)}
                            className="px-2 py-1 rounded hover:bg-slate-100 transition-colors border-r rtl:border-r-0 rtl:border-l border-slate-200"
                            title="تمديد مهلة المحكم 14 يوماً إضافية"
                          >
                            +14 يوماً
                          </button>
                        </div>

                        {/* 3. Reassign Reviewer with AI Smart Match */}
                        <button
                          type="button"
                          onClick={() => handleOpenSmartReassign(item.manuscriptId)}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                          title="ترشيح واستبدال المحكم بمحكم بديل عبر المطابقة الذكية"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                          <span>استبدال المحكم (Smart Match)</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5 ml-auto rtl:mr-auto rtl:ml-0">
                        {/* 4. View Dossier */}
                        <button
                          type="button"
                          onClick={() => handleOpenDossier(item.manuscriptId)}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                          title="عرض ملف المخطوطة كاملاً"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>عرض المخطوطة</span>
                        </button>

                        {/* 5. Dismiss / Restore */}
                        {!item.isDismissed ? (
                          <button
                            type="button"
                            onClick={() => dismissNotification(item.id)}
                            className="px-2 py-1 text-slate-400 hover:text-slate-600 text-3xs font-medium"
                            title="تجاهل مؤقت لهذا الإشعار"
                          >
                            تجاهل
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => restoreNotification(item.id)}
                            className="px-2 py-1 text-blue-600 hover:underline text-3xs font-bold"
                          >
                            استعادة التنبيه
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              /* Empty state */
              <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  لا توجد أي تأخيرات في التحكيم حالياً!
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  كافة المحكمين المعينين للمخطوطات ملتزمون بالمهلة الزمنية المحددة ({thresholdDays} يوماً) أو قاموا بتسليم تقاريرهم بالفعل.
                </p>
              </div>
            )}
          </div>

          {/* Footer Bar */}
          <div className="p-3 sm:px-6 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 flex-wrap gap-2 shrink-0">
            <div className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-slate-400" />
              <span>تُحسب المهل الزمنية تلقائياً وفقاً للائحة التحرير المعتمدة بمجلة أرشيف العلوم الزراعية.</span>
            </div>

            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            >
              إغلاق النافذة
            </button>
          </div>

        </div>
      </div>

      {/* Reminder Email Modal */}
      {selectedNotificationForReminder && (
        <ReviewerReminderModal
          notification={selectedNotificationForReminder}
          onClose={() => setSelectedNotificationForReminder(null)}
        />
      )}
    </>
  );
};
