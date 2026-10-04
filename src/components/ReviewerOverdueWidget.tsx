import React, { useState } from 'react';
import { AlertTriangle, Bell, Clock, Mail, ChevronLeft, ChevronRight, Send, Sparkles } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { ReviewerOverdueNotification } from '../types/notifications';
import { ReviewerReminderModal } from './ReviewerReminderModal';

interface ReviewerOverdueWidgetProps {
  onOpenNotificationsHub: () => void;
  onSelectManuscriptId?: (id: string) => void;
}

export const ReviewerOverdueWidget: React.FC<ReviewerOverdueWidgetProps> = ({
  onOpenNotificationsHub,
}) => {
  const { activeOverdueNotifications, overdueCount, thresholdDays } = useNotifications();
  const [selectedForReminder, setSelectedForReminder] = useState<ReviewerOverdueNotification | null>(null);

  if (overdueCount === 0) {
    return null;
  }

  // Display top 3 most overdue
  const topOverdue = activeOverdueNotifications.slice(0, 3);

  return (
    <>
      <div className="bg-gradient-to-l from-rose-950/95 via-rose-900/95 to-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-md border border-rose-700/60 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-12 -left-12 w-40 h-40 bg-rose-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="p-1.5 bg-rose-500 text-white rounded-xl shadow-xs">
                <AlertTriangle className="w-4 h-4 animate-bounce" />
              </span>
              <h2 className="font-extrabold text-sm sm:text-base text-white">
                تنبيه تحريري عاجل: تأخر محكمين في تسليم تقارير التحكيم لأكثر من {thresholdDays} يوماً
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-400 text-rose-950 shadow-xs">
                {overdueCount} محكم متأخر
              </span>
            </div>
            <p className="text-xs text-rose-200 leading-relaxed max-w-2xl">
              تجاوز هؤلاء المحكمون المهلة الرسمية المعتمدة لتحكيم الأبحاث ({thresholdDays} يوماً). يرجى اتخاذ الإجراء التحريري المناسب بإرسال تذكير رسمي، تمديد المهلة، أو إحالة البحث لمحكم بديل.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenNotificationsHub}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-rose-50 text-rose-950 font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer shrink-0 self-start md:self-auto"
          >
            <Bell className="w-4 h-4 text-rose-600" />
            <span>فتح مركز إشعارات المهل ({overdueCount})</span>
          </button>
        </div>

        {/* Quick Reviewer Cards */}
        <div className="mt-4 pt-3.5 border-t border-rose-800/80 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {topOverdue.map((item) => (
            <div
              key={item.id}
              className="bg-slate-900/80 border border-rose-800/60 rounded-xl p-3 flex flex-col justify-between gap-2 shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between gap-1 text-[11px]">
                  <span className="font-mono font-bold text-rose-300 bg-rose-950/80 px-1.5 py-0.5 rounded border border-rose-800/50">
                    {item.manuscriptId}
                  </span>
                  <span className="font-extrabold text-rose-400 bg-rose-950/90 px-1.5 py-0.5 rounded text-3xs">
                    متأخر بـ {item.overdueDays} يوماً
                  </span>
                </div>
                <h4 className="font-bold text-xs text-white mt-1.5 line-clamp-1">
                  {item.reviewerName}
                </h4>
                <p className="text-[10.5px] text-slate-400 truncate mt-0.5">
                  {item.slotLabelAr} · {item.discipline}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-1">
                <span className="text-[10px] text-slate-400 font-mono">
                  الاستحقاق: {item.dueDate}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedForReminder(item)}
                  className="flex items-center gap-1 px-2 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-3xs font-bold transition-colors cursor-pointer"
                >
                  <Mail className="w-3 h-3" />
                  <span>تذكير</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedForReminder && (
        <ReviewerReminderModal
          notification={selectedForReminder}
          onClose={() => setSelectedForReminder(null)}
        />
      )}
    </>
  );
};
