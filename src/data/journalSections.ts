import { JournalDiscipline, JournalSectionDetails, UserRole } from '../types/journal';

export const JOURNAL_SECTIONS: JournalSectionDetails[] = [
  {
    id: 1,
    discipline: 'Soils and Water, and Agricultural Engineering',
    arabicName: 'الجزء الأول: علوم الأراضي والمياه والهندسة الزراعية',
    englishName: 'Part 1: Soils, Water, and Agricultural Engineering',
    descriptionAr: 'يغطي أبحاث كيمياء وخصوبة التربة، إدارة الموارد المائية، نظم الري الحديثة، ومعالجة الملوحة والهندسة الزراعية.',
    descriptionEn: 'Covers soil fertility, water resources management, modern irrigation systems, salinity dynamics, and agricultural machinery.',
    departmentCode: 'SWE',
  },
  {
    id: 2,
    discipline: 'Plant Production',
    arabicName: 'الجزء الثاني: الإنتاج النباتي والمحاصيل وبساتين',
    englishName: 'Part 2: Plant Production, Field Crops and Horticulture',
    descriptionAr: 'يغطي فسيولوجيا المحاصيل الحقلية، زراعة الخضر والفاكهة، نباتات الزينة والطبية، وتحسين الإنتاجية الزراعية في صعيد مصر.',
    descriptionEn: 'Field crops physiology, pomology, vegetable crops, medicinal plants, and sustainable crop production in Upper Egypt.',
    departmentCode: 'PPR',
  },
  {
    id: 3,
    discipline: 'Plant Pathology and Plant Protection',
    arabicName: 'الجزء الثالث: أمراض النبات ووقاية المزروعات',
    englishName: 'Part 3: Plant Pathology and Plant Protection',
    descriptionAr: 'يغطي الفيروسات النباتية، الفطريات والبكتيريا الممرضة، الحشرات الاقتصادية، والمكافحة الحيوية والمتكاملة للآفات.',
    descriptionEn: 'Plant virology, phytopathology, economic entomology, pest management, and biological crop protection.',
    departmentCode: 'PPP',
  },
  {
    id: 4,
    discipline: 'Animal and Poultry Production',
    arabicName: 'الجزء الرابع: الإنتاج الحيواني والداجني',
    englishName: 'Part 4: Animal and Poultry Production',
    descriptionAr: 'يغطي رعاية وتغذية المجترات والدواجن، التحسين الوراثي والتناسل، فسيولوجيا التكيف الحراري لسلالات الماشية والأغنام.',
    descriptionEn: 'Livestock and poultry nutrition, breeding genetics, reproductive physiology, and environmental adaptation of local breeds.',
    departmentCode: 'APP',
  },
  {
    id: 5,
    discipline: 'Dairy Science, Food Science and Technology',
    arabicName: 'الجزء الخامس: علوم وتكنولوجيا الألبان والأغذية',
    englishName: 'Part 5: Dairy Science, Food Science and Technology',
    descriptionAr: 'يغطي تكنولوجيا وتصنيع منتجات الألبان والأغذية الوظيفية، البروبيوتيك، سلامة وجودة الغذاء والكيمياء الحيوية الغذائية.',
    descriptionEn: 'Dairy chemistry and processing, functional food biotechnology, probiotics, food safety, and post-harvest technology.',
    departmentCode: 'DFT',
  },
  {
    id: 6,
    discipline: 'Agricultural Economics, Rural Sociology and Agricultural Extension',
    arabicName: 'الجزء السادس: الاقتصاد الزراعي وعلم الاجتماع الريفي والإرشاد',
    englishName: 'Part 6: Agricultural Economics, Rural Sociology & Agricultural Extension',
    descriptionAr: 'يغطي اقتصاديات الإنتاج والمزارع، سلاسل القيمة والتسويق، التنمية الريفية المستدامة، وتبني التكنولوجيا الزراعية الحديثة.',
    descriptionEn: 'Farm production economics, agribusiness marketing, rural community sociology, and agricultural extension adoption.',
    departmentCode: 'AER',
  },
  {
    id: 7,
    discipline: 'Chemistry, Agricultural Microbiology, and Genetics',
    arabicName: 'الجزء السابع: الكيمياء والميكروبيولوجيا الزراعية والوراثة',
    englishName: 'Part 7: Chemistry, Agricultural Microbiology, and Genetics',
    descriptionAr: 'يغطي التكنولوجيا الحيوية الزراعية، التوصيف الجزيئي، ميكروبيولوجيا التربة والتخمر، والمبيدات والكيمياء الحيوية.',
    descriptionEn: 'Agricultural biotechnology, molecular markers, soil rhizobacteria, environmental bio-chemistry, and genetics.',
    departmentCode: 'CMG',
  },
];

export const ROLE_INFO: Record<
  UserRole,
  {
    titleAr: string;
    titleEn: string;
    descriptionAr: string;
    descriptionEn: string;
    badgeColor: string;
  }
> = {
  admin: {
    titleAr: 'مدير النظام (كامل الصلاحيات)',
    titleEn: 'System Administrator (Full Privileges)',
    descriptionAr: 'يملك كافة الصلاحيات الإدارية والتحريرية والمالية والأمنية، إدارة المستخدمين، وسجل تدقيق النشاطات الكامل.',
    descriptionEn: 'Full system administration, editorial, financial, and security privileges across all modules.',
    badgeColor: 'bg-red-100 text-red-900 border-red-300 font-bold',
  },
  general_supervisor: {
    titleAr: 'المشرف العام (عميد الكلية)',
    titleEn: 'General Supervisor (Dean)',
    descriptionAr: 'عميد كلية الزراعة: الإشراف المالي والإداري الشامل، تقارير التدفق النقدي، والاعتمادات الرسمية.',
    descriptionEn: 'Faculty Dean: comprehensive financial and administrative oversight and official approvals.',
    badgeColor: 'bg-purple-100 text-purple-900 border-purple-200 font-bold',
  },
  editor_in_chief: {
    titleAr: 'رئيس التحرير',
    titleEn: 'Editor-in-Chief',
    descriptionAr: 'القيادة الأكاديمية للمجلة، القرارات التحريرية النهائية، وتعيين المحكمين واعتماد خطابات القبول.',
    descriptionEn: 'Overall academic leadership, final publication decisions, referee assignments, and acceptance letters.',
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold',
  },
  advisory_head: {
    titleAr: 'رئيس الهيئة الاستشارية',
    titleEn: 'Head of Advisory Board',
    descriptionAr: 'متابعة المعايير الدولية، سياسات الفهرسة، والتقييم الاستراتيجي لأعداد المجلة.',
    descriptionEn: 'Strategic international advisory, indexing quality policies, and editorial standards.',
    badgeColor: 'bg-blue-100 text-blue-900 border-blue-200',
  },
  managing_editor: {
    titleAr: 'مدير التحرير',
    titleEn: 'Managing Editor',
    descriptionAr: 'إدارة دورة حياة المخطوطات اليومية، تتبع مهام المحررين التنفيذيين، وجدولة قائمة الانتظار.',
    descriptionEn: 'Daily workflow coordination, tracking section reviews, and issue volume scheduling.',
    badgeColor: 'bg-teal-100 text-teal-900 border-teal-200',
  },
  secretary: {
    titleAr: 'سكرتير المجلة',
    titleEn: 'Journal Secretary',
    descriptionAr: 'استلام الأبحاث، فحص التشابه والاقتباس، تحصيل رسوم النشر وسندات القبض، وأرشيف الوثائق.',
    descriptionEn: 'Manuscript intake, similarity checks, fee collection receipts, and official archive indexing.',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-200',
  },
  executive_editor: {
    titleAr: 'محرر تنفيذي (مشرف على جزء)',
    titleEn: 'Executive Editor (Section Head)',
    descriptionAr: 'الإشراف الأكاديمي والتحريري على أحد الأجزاء والتخصصات السبعة وتوجيه تحكيم أبحاث القسم.',
    descriptionEn: 'Oversees one of the 7 journal sections, coordinating referees and evaluating section papers.',
    badgeColor: 'bg-sky-100 text-sky-900 border-sky-300',
  },
  editor: {
    titleAr: 'محرر (Editor)',
    titleEn: 'Academic Editor',
    descriptionAr: 'فحص وتقييم الأبحاث العلمية، متابعة عملية التحكيم، تقديم التوصيات التحريرية، والتواصل مع المحكمين والمؤلفين.',
    descriptionEn: 'Academic manuscript evaluation, review oversight, editorial recommendations, and referee coordination.',
    badgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-300 font-bold',
  },
  layout_editor: {
    titleAr: 'محرر تنسيق وإخراج فني',
    titleEn: 'Layout & Production Editor',
    descriptionAr: 'إعداد بروفة الإخراج الفني (Galley Proof)، التنضيد، والنسخ المنشورة النهائية.',
    descriptionEn: 'Desktop layout formatting, typesetting, galley proofs, and final issue publishing.',
    badgeColor: 'bg-pink-100 text-pink-900 border-pink-200',
  },
  reviewer: {
    titleAr: 'محكم علمي (Reviewer)',
    titleEn: 'Peer Reviewer',
    descriptionAr: 'فحص المخطوطات المسندة إليه في سرية تامة ورفع التقرير والتوصية الفنية.',
    descriptionEn: 'Access only to assigned manuscripts to review and submit confidential referee reports.',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  author: {
    titleAr: 'مؤلف وباحث (Author)',
    titleEn: 'Author / Researcher',
    descriptionAr: 'تقديم أبحاث جديدة، متابعة حالة البحث، رفع النسخ المعدلة، وتنزيل خطابات القبول وسندات السداد.',
    descriptionEn: 'Submits papers, tracks review progress, uploads revised files, and downloads acceptance letter.',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-200',
  },
};
