import React, { useState } from 'react';
import {
  Mail,
  X,
  Copy,
  Check,
  Send,
  FileText,
  Clock,
  Coins,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { Manuscript } from '../types/journal';

interface EmailTemplatesHubModalProps {
  manuscript?: Manuscript;
  onClose: () => void;
}

export const EmailTemplatesHubModal: React.FC<EmailTemplatesHubModalProps> = ({
  manuscript,
  onClose,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<
    'review_invitation' | 'acceptance_notice' | 'revision_request' | 'fee_payment' | 'deadline_reminder'
  >('review_invitation');
  const [copied, setCopied] = useState(false);

  // Fallback manuscript mock if opened standalone
  const m = manuscript || {
    id: 'sample',
    code: 'AASJ-2026-101',
    titleAr: 'تأثير التسميد العضوي والحيوي على إنتاجية وجودة القمح تحت ظروف التربة الجيرية',
    titleEn: 'Impact of Organic and Bio-fertilization on Wheat Productivity under Calcareous Soil Conditions',
    section: 'الإنتاج النباتي',
    authorName: 'د. أحمد محمود علي',
    authorEmail: 'author@alazhar.edu.eg',
  };

  const deadlineDate = new Date();
  deadlineDate.setDate(deadlineDate.getDate() + 21);
  const deadlineStr = deadlineDate.toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const getTemplateContent = () => {
    switch (selectedTemplate) {
      case 'review_invitation':
        return {
          subject: `دعوة لتحكيم بحث علمي - مجلة أرشيف العلوم الزراعية (AASJ) [${m.code}]`,
          recipient: 'محكم معتمد / سعادة الأستاذ الدكتور',
          body: `سعادة الأستاذ الدكتور / المحترم،
السلام عليكم ورحمة الله وبركاته،،،

تحية طيبة وبعد،،،
تهديكم هيئة تحرير "مجلة أرشيف العلوم الزراعية (Archives of Agriculture Sciences Journal - AASJ)"، الصادرة عن كلية الزراعة (أسيوط) - جامعة الأزهر، أطيب تحياتها وتمنياتها لكم بموفور الصحة والتوفيق.

نظراً لمكانتكم العلمية المرموقة وخبرتكم المشهود لها في مجال (${m.section})، يشرفنا ويسعدنا دعوتكم لتحكيم وتقييم البحث العلمي الموسوم بـ:
عنوان البحث: "${m.titleAr || m.titleEn}"
كود البحث: ${m.code}
قسم التخصص: ${m.section}

نحيط سعادتكم علماً بأن مهلة التحكيم المحددة باللائحة هي (21 يوماً) تنتهي في: ${deadlineStr}.
نرجو من سعادتكم التكرم بإفادتنا بموافقتكم الكريمة عبر الرد على هذه الرسالة أو من خلال بوابة التحكيم الإلكترونية للمجلة، مع التزام المجلة التام بنظام التحكيم المزدوج المعمى (Double-Blind Peer Review) وموافاتكم بشهادة تحكيم معتمدة فور إتمام المراجعة.

شاكرين ومقدرين لسعادتكم حسن تعاونكم الدائم في خدمة البحث العلمي.

وتفضلوا بقبول فائق الاحترام والتقدير،،،

هيئة تحرير مجلة أرشيف العلوم الزراعية (AASJ)
كلية الزراعة - جامعة الأزهر
aasj@azhar.edu.eg`,
        };

      case 'acceptance_notice':
        return {
          subject: `إشعار قبول نهائي لنشر بحث علمي - مجلة أرشيف العلوم الزراعية [${m.code}]`,
          recipient: m.authorName || 'الباحث الرئيسي',
          body: `سعادة الباحث / ${m.authorName || 'المحترم'}،
السلام عليكم ورحمة الله وبركاته،،،

يسر هيئة تحرير "مجلة أرشيف العلوم الزراعية (AASJ)"، كلية الزراعة - جامعة الأزهر، إفادتكم بأنه بعد استيفاء بحثكم العلمي لكافة شروط التحكيم والمراجعة العلمية الدقيقة:
كود البحث: ${m.code}
عنوان البحث: "${m.titleAr || m.titleEn}"

قد تقرر رسمياً: **قبول البحث للنشر** في الأعداد القادمة للمجلة، والمفهرسة في بنك المعرفة المصري (EKB).
يمكنكم الآن تحميل خطاب القبول الرسمي المعتمد والمختوم من خلال بوابة الباحث الخاصة بكم في النظام.

خالص التهاني والتبريكات،،،

رئيس هيئة التحرير
مجلة أرشيف العلوم الزراعية - جامعة الأزهر`,
        };

      case 'revision_request':
        return {
          subject: `طلب إجراء تعديلات على البحث العلمي [${m.code}] - مجلة أرشيف العلوم الزراعية`,
          recipient: m.authorName || 'الباحث الرئيسي',
          body: `السيد الباحث / ${m.authorName || 'المحترم'}،
السلام عليكم ورحمة الله وبركاته،،،

بخصوص بحثكم العلمي المرفوع للنشر بمجلة أرشيف العلوم الزراعية بعنوان:
"${m.titleAr || m.titleEn}" (كود: ${m.code}).

نحيطكم علماً بأن تقارير السادة المحكمين قد أوصت بضرورة إجراء بعض التعديلات العلمية والموضوعية والشكلية على البحث قبل اتخاذ قرار النشر النهائي.
يرجى الاطلاع على ملاحظات المحكمين المرفقة عبر بوابة الباحث، وموافاتنا بالنسخة المنقحة والمعدلة مع جدول توضيحي بالرد على استفسارات المحكمين في موعد أقصاه 14 يوماً من تاريخه.

شاكرين لكم حسن تعاونكم.

سكرتارية هيئة التحرير - مجلة AASJ`,
        };

      case 'fee_payment':
        return {
          subject: `إشعار سداد رسوم النشر والتحكيم (APC) - مجلة أرشيف العلوم الزراعية [${m.code}]`,
          recipient: m.authorName || 'الباحث الرئيسي',
          body: `سعادة الباحث / ${m.authorName || 'المحترم'}،
السلام عليكم ورحمة الله وبركاته،،،

نهديكم أطيب التحيات من مجلة أرشيف العلوم الزراعية (AASJ) - جامعة الأزهر.
يرجى التكرم بسداد رسوم النشر والتجهيز المقررة لبحثكم كود (${m.code}) وفقاً للائحة المالية للمجلة، وذلك عبر الإيداع في الحساب البنكي الرسمي لكلية الزراعة بجامعة الأزهر أو الخزينة المالية بمقر الكلية، ورفع إشعار/إيصال التحويل البنكي عبر النظام لإصدار سند القبض الرسمي.

مع خالص التحية والتقدير،،،
الإدارة المالية وهيئة التحرير - مجلة AASJ`,
        };

      case 'deadline_reminder':
        return {
          subject: `تذكير بموعد استحقاق تحكيم البحث [${m.code}] - مجلة أرشيف العلوم الزراعية`,
          recipient: 'سعادة الأستاذ الدكتور المحكم',
          body: `سعادة الأستاذ الدكتور / المحترم،
السلام عليكم ورحمة الله وبركاته،،،

نود تذكير سعادتكم الكريمة باقتراب موعد انتهاء المهلة المحددة (21 يوماً) لتحكيم البحث العلمي المحال لسعادتكم بعنوان:
"${m.titleAr || m.titleEn}" [كود: ${m.code}].

نظراً لأهمية سرعة دورة النشر والتزامنا تجاه الباحثين، نرجو من سعادتكم التكرم بموافاتنا بتقرير التحكيم في أقرب وقت ممكن.
شاكرين ومقدرين جهودكم العلمية المخلصة في الارتقاء بمستوى المجلة.

مع وافر التقدير والامتنان،،،
هيئة التحرير - مجلة AASJ`,
        };
    }
  };

  const currentTemplate = getTemplateContent();

  const handleCopy = () => {
    navigator.clipboard.writeText(`${currentTemplate.subject}\n\n${currentTemplate.body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleMailto = () => {
    const to = m.authorEmail || '';
    const subject = encodeURIComponent(currentTemplate.subject);
    const body = encodeURIComponent(currentTemplate.body);
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/75 backdrop-blur-xs p-1.5 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-slate-200 my-1 sm:my-auto flex flex-col max-h-[96dvh] sm:max-h-[96vh]">
        {/* Header - Sticky & shrink-0 */}
        <div className="flex items-center justify-between p-3 sm:px-6 sm:py-3.5 bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 text-white gap-2 shrink-0 sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="p-1.5 sm:p-2 bg-amber-400 text-slate-950 rounded-xl shadow-xs shrink-0">
              <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-extrabold text-xs sm:text-base truncate">مركز قوالب المراسلات الأكاديمية (Email Templates Hub)</h3>
              <p className="text-[10px] sm:text-xs text-emerald-200 mt-0.5 truncate">
                مراسلات تحريرية رسمية جاهزة للإرسال الفوري للباحثين والمحكمين
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white rounded-xl hover:bg-white/10 active:bg-white/20 transition-colors cursor-pointer shrink-0"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Templates Selector */}
        <div className="p-3 sm:p-6 space-y-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            <button
              onClick={() => setSelectedTemplate('review_invitation')}
              className={`p-2.5 sm:p-3 rounded-2xl text-xs font-bold text-center border transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                selectedTemplate === 'review_invitation'
                  ? 'bg-emerald-900 text-amber-300 border-emerald-800 shadow-md ring-2 ring-emerald-700'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>دعوة تحكيم</span>
            </button>

            <button
              onClick={() => setSelectedTemplate('acceptance_notice')}
              className={`p-2.5 sm:p-3 rounded-2xl text-xs font-bold text-center border transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                selectedTemplate === 'acceptance_notice'
                  ? 'bg-emerald-900 text-amber-300 border-emerald-800 shadow-md ring-2 ring-emerald-700'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>إشعار قبول نشر</span>
            </button>

            <button
              onClick={() => setSelectedTemplate('revision_request')}
              className={`p-2.5 sm:p-3 rounded-2xl text-xs font-bold text-center border transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                selectedTemplate === 'revision_request'
                  ? 'bg-emerald-900 text-amber-300 border-emerald-800 shadow-md ring-2 ring-emerald-700'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>طلب تعديلات</span>
            </button>

            <button
              onClick={() => setSelectedTemplate('fee_payment')}
              className={`p-2.5 sm:p-3 rounded-2xl text-xs font-bold text-center border transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                selectedTemplate === 'fee_payment'
                  ? 'bg-emerald-900 text-amber-300 border-emerald-800 shadow-md ring-2 ring-emerald-700'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
              }`}
            >
              <Coins className="w-4 h-4" />
              <span>سداد الرسوم APC</span>
            </button>

            <button
              onClick={() => setSelectedTemplate('deadline_reminder')}
              className={`p-2.5 sm:p-3 rounded-2xl text-xs font-bold text-center border transition-all cursor-pointer flex flex-col items-center gap-1.5 col-span-2 sm:col-span-1 ${
                selectedTemplate === 'deadline_reminder'
                  ? 'bg-emerald-900 text-amber-300 border-emerald-800 shadow-md ring-2 ring-emerald-700'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>تذكير بالمهلة</span>
            </button>
          </div>

          {/* Email Preview Container */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-3.5 sm:p-5 space-y-3 shadow-inner">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2.5">
              <div className="text-xs">
                <span className="font-bold text-slate-500">الموضوع (Subject): </span>
                <span className="font-bold text-emerald-950">{currentTemplate.subject}</span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'تم النسخ!' : 'نسخ الرسالة'}</span>
                </button>

                <button
                  onClick={handleMailto}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>فتح في تطبيق البريد</span>
                </button>
              </div>
            </div>

            <div className="whitespace-pre-line text-xs font-medium text-slate-800 leading-relaxed bg-white p-4 rounded-xl border border-slate-200">
              {currentTemplate.body}
            </div>
          </div>

          <div className="flex items-center justify-between text-3xs text-slate-500 pt-2 border-t border-slate-100">
            <span>* يتم إدراج بيانات البحث والمؤلف وتواريخ المهل تلقائياً من قاعدة بيانات المجلة.</span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
