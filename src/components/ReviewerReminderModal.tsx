import React, { useState } from 'react';
import {
  X,
  Mail,
  Copy,
  Check,
  ExternalLink,
  Clock,
  AlertTriangle,
  Send,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { ReviewerOverdueNotification } from '../types/notifications';
import { useNotifications } from '../context/NotificationContext';

interface ReviewerReminderModalProps {
  notification: ReviewerOverdueNotification;
  onClose: () => void;
  onSelectManuscript?: (id: string) => void;
}

export const ReviewerReminderModal: React.FC<ReviewerReminderModalProps> = ({
  notification,
  onClose,
}) => {
  const { sendReminder, extendDeadline, thresholdDays } = useNotifications();
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<'urgent' | 'standard' | 'final'>('urgent');
  const [copied, setCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [customNote, setCustomNote] = useState('');

  // Templates
  const templates = {
    standard: {
      titleAr: 'تذكير رسمي عادي بالمهلة (21 يوماً)',
      subject: `تذكير بموعد تحكيم البحث [${notification.manuscriptId}] - مجلة أرشيف العلوم الزراعية`,
      getBody: () =>
`سعادة الأستاذ الدكتور / ${notification.reviewerName} المحترم،
تحية طيبة وبعد،،،

تهديكم هيئة تحرير مجلة أرشيف العلوم الزراعية (AASJ) الصادرة عن كلية الزراعة بجامعة الأزهر أطيب التحيات وخالص التقدير.

نود تذكير سعادتكم الكريمة بالبحث العلمي المحال إليكم لتحكيمه بعنوان:
"${notification.manuscriptTitle}"
(كود البحث: ${notification.manuscriptId} | التخصص: ${notification.discipline})

علماً بأن المهلة المحددة للتحكيم هي (${thresholdDays}) يوماً، وموعد الاستحقاق هو: ${notification.dueDate}.
نرجو من سعادتكم التكرم بموافاتنا بتقرير التحكيم العلمي المعتمد وملاحظاتكم القيمة عبر النظام أو الرد على هذا البريد في أقرب وقت ممكن تيسيراً لمراحل نشر البحث.

وتفضلوا بقبول فائق الاحترام والتقدير،،،
هيئة التحرير - مجلة أرشيف العلوم الزراعية (AASJ)
كلية الزراعة بأسيوط، جامعة الأزهر
الموقع الإلكتروني: https://aasj.journals.ekb.eg`,
    },
    urgent: {
      titleAr: 'تنبيه عاجل بتجاوز المهلة المحددة',
      subject: `[عاجل جداً] تجاوز المهلة المحددة لتحكيم البحث [${notification.manuscriptId}] - مجلة أرشيف العلوم الزراعية`,
      getBody: () =>
`سعادة الأستاذ الدكتور / ${notification.reviewerName} المحترم،
تحية طيبة وبعد،،،

بالإشارة إلى إسناد تحكيم البحث العلمي الموسوم بـ:
"${notification.manuscriptTitle}"
(كود البحث: ${notification.manuscriptId} - تاريخ الإسناد: ${notification.assignedDate})

نحيط سعادتكم الكريمة علماً بأنه قد انقضت المهلة الرسمية المقررة لتحكيم البحث (${thresholdDays} يوماً) وتجاوز الموعد المحدد (${notification.dueDate}) بما يقارب (${notification.overdueDays}) يوماً دون تلقي تقرير التحكيم أو اعتذار من جانبكم.

نظراً لحرص إدارة وهيئة تحرير المجلة على سرعة إنجاز الأبحاث العلمية والالتزام بمواعيد الصدور المحددة ببنك المعرفة المصري، نرجو من سعادتكم التكرم بموافاتنا بتقرير التحكيم خلال (48-72 ساعة) أو إفادتنا بإمكانية إنجازه.

شاكرين ومقدرين حسن تعاونكم الدائم لدعم الرصانة العلمية بالمجلة،،،
رئيس هيئة التحرير
مجلة أرشيف العلوم الزراعية (AASJ) - جامعة الأزهر
https://aasj.journals.ekb.eg`,
    },
    final: {
      titleAr: 'إنذار نهائي قبل إسناد البحث لمحكم بديل',
      subject: `[إشعار نهائي] مهلة أخيرة لتحكيم البحث [${notification.manuscriptId}] قبل الاستبدال`,
      getBody: () =>
`سعادة الأستاذ الدكتور / ${notification.reviewerName} المحترم،
تحية طيبة وبعد،،،

نظراً لتأخر استلام تقرير تحكيم البحث كود [${notification.manuscriptId}] بعنوان:
"${notification.manuscriptTitle}"
والذي تجاوز موعد استحقاقه المحدد منذ ${notification.overdueDays} يوماً،

نود إحاطة سعادتكم بأنه في حال تعذر استكمال التحكيم خلال موعد أقصاه يومين من تاريخه، ستضطر هيئة التحرير آسفةً لسحب البحث وإحالته إلى محكم بديل ضماناً لحقوق الباحثين في سرعة النشر.

إذا كنتم بحاجة لمهلة إضافية محددة نرجو إخطارنا فوراً للترتيب.
مع خالص الشكر والامتنان،،،
سكرتارية التحرير - مجلة أرشيف العلوم الزراعية (AASJ)`,
    },
  };

  const currentTemplate = templates[selectedTemplateKey];
  const emailBody = currentTemplate.getBody() + (customNote ? `\n\nملاحظة خاصة من المحرر:\n${customNote}` : '');

  const handleCopy = () => {
    navigator.clipboard.writeText(`${currentTemplate.subject}\n\n${emailBody}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendMailto = () => {
    const to = notification.reviewerEmail || '';
    const subject = encodeURIComponent(currentTemplate.subject);
    const body = encodeURIComponent(emailBody);
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
  };

  const handleRecordSent = () => {
    sendReminder(notification, customNote);
    setIsSaved(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-slate-950/80 backdrop-blur-xs p-1.5 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden my-1 sm:my-auto flex flex-col max-h-[96dvh] sm:max-h-[94vh]">
        
        {/* Header - Sticky shrink-0 */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 text-white p-3.5 sm:px-6 sm:py-4 flex items-center justify-between border-b border-slate-800 shrink-0 sticky top-0 z-20">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-amber-400 text-slate-950 font-bold shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-xs sm:text-base truncate">
                  إرسال تذكير رسمي للمحكم المتأخر
                </h3>
                <span className="px-2 py-0.5 rounded-full text-3xs font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/40 shrink-0">
                  متأخر بـ {notification.overdueDays} يوم
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-300 truncate mt-0.5">
                {notification.reviewerName} ({notification.slotLabelAr}) · البحث [{notification.manuscriptId}]
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors shrink-0"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-3.5 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          
          {/* Reviewer & Manuscript Summary Card */}
          <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl space-y-2">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <span className="text-[11px] font-bold text-amber-900 block">
                  المحكم المستهدف: {notification.reviewerName}
                </span>
                <span className="text-[10.5px] text-amber-800">
                  {notification.reviewerEmail} {notification.reviewerAffiliation ? `· ${notification.reviewerAffiliation}` : ''}
                </span>
              </div>
              <div className="text-right rtl:text-right font-mono text-[11px] text-slate-600">
                <div>تاريخ الإسناد: <strong>{notification.assignedDate}</strong></div>
                <div>موعد الاستحقاق: <strong className="text-rose-700">{notification.dueDate}</strong></div>
              </div>
            </div>

            <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between text-[11px] text-slate-700 flex-wrap gap-1">
              <span className="truncate max-w-md">
                <strong>البحث:</strong> [{notification.manuscriptId}] {notification.manuscriptTitle}
              </span>
              <span className="font-semibold text-slate-600 bg-white px-2 py-0.5 rounded border border-amber-200">
                عدد التذكيرات السابقة: {notification.reminderCount}
              </span>
            </div>
          </div>

          {/* Template Choice Tabs */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              اختر صيغة الخطاب والتذكير:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedTemplateKey('standard')}
                className={`p-2.5 rounded-xl border text-right rtl:text-right font-semibold transition-all cursor-pointer ${
                  selectedTemplateKey === 'standard'
                    ? 'bg-blue-50 border-blue-400 text-blue-950 ring-2 ring-blue-300'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="font-bold text-xs flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>تذكير رسمي أول</span>
                </div>
                <p className="text-3xs text-slate-500 mt-1">تذكير ودي بالمهلة (21 يوماً) واستفسار عن التقرير</p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTemplateKey('urgent')}
                className={`p-2.5 rounded-xl border text-right rtl:text-right font-semibold transition-all cursor-pointer ${
                  selectedTemplateKey === 'urgent'
                    ? 'bg-rose-50 border-rose-400 text-rose-950 ring-2 ring-rose-300'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="font-bold text-xs flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  <span>تنبيه عاجل بتجاوز المهلة</span>
                </div>
                <p className="text-3xs text-slate-500 mt-1">إشعار رسمي بانقضاء المهلة وطلب الإفادة خلال 48 ساعة</p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTemplateKey('final')}
                className={`p-2.5 rounded-xl border text-right rtl:text-right font-semibold transition-all cursor-pointer ${
                  selectedTemplateKey === 'final'
                    ? 'bg-amber-50 border-amber-400 text-amber-950 ring-2 ring-amber-300'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="font-bold text-xs flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                  <span>إنذار نهائي بالاستبدال</span>
                </div>
                <p className="text-3xs text-slate-500 mt-1">مهلة أخيرة قبل سحب البحث وإحالته لمحكم بديل</p>
              </button>
            </div>
          </div>

          {/* Subject Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              موضوع الرسالة (Subject):
            </label>
            <input
              type="text"
              readOnly
              value={currentTemplate.subject}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800"
            />
          </div>

          {/* Body Preview */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700">
                نص الخطاب الأكاديمي المعتمد:
              </label>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1 text-3xs font-bold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'تم نسخ النص' : 'نسخ النص'}</span>
              </button>
            </div>
            <textarea
              readOnly
              rows={9}
              value={emailBody}
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-mono text-[11px] leading-relaxed text-slate-800 focus:outline-none"
            />
          </div>

          {/* Optional Editor Custom Note */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              إضافة ملاحظة خاصة من رئيس التحرير (اختياري تظهر في أسفل التذكير):
            </label>
            <input
              type="text"
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="مثال: يرجى التركيز على منهجية التحليل الإحصائي، شاكرين تعاونكم..."
              className="w-full p-2 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-emerald-700 focus:outline-none"
            />
          </div>

          {/* Quick Extension Options */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-slate-700">
              <Calendar className="w-4 h-4 text-emerald-700" />
              <span>إذا طلب المحكم وقتاً إضافياً: تمديد المهلة مباشرة:</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => extendDeadline(notification.manuscriptId, notification.slot, 7)}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg font-bold text-slate-700 text-3xs transition-colors"
                title="إضافة 7 أيام إضافية"
              >
                + 7 أيام
              </button>
              <button
                type="button"
                onClick={() => extendDeadline(notification.manuscriptId, notification.slot, 14)}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg font-bold text-slate-700 text-3xs transition-colors"
                title="إضافة 14 يوماً إضافية"
              >
                + 14 يوماً
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3.5 sm:px-6 bg-slate-100 border-t border-slate-200 flex items-center justify-between gap-2 flex-wrap shrink-0">
          <div className="text-[11px] text-slate-500 font-medium">
            {isSaved ? (
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>تم تسجيل إرسال التذكير بنجاح وتوثيقه في سجل النشاطات!</span>
              </span>
            ) : (
              <span>يتم توثيق إرسال التذكير تلقائياً بسجل التدقيق التحريري للمجلة</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSendMailto}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
              title="فتح تطبيق البريد الافتراضي لإرسال الرسالة"
            >
              <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
              <span>فتح تطبيق البريد</span>
            </button>

            <button
              type="button"
              onClick={handleRecordSent}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer ring-1 ring-emerald-500/50"
            >
              <Send className="w-3.5 h-3.5 text-emerald-200" />
              <span>تأكيد الإرسال وحفظ التذكير</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
