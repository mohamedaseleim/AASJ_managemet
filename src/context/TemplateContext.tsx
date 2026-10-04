import React, { createContext, useContext, useState, useEffect } from 'react';

export interface AcceptanceTemplateData {
  journalNameEn: string;
  journalNameAr: string;
  journalTaglineEn: string;
  journalTaglineAr: string;
  // Header Customization Fields
  headerBadgeEn: string;
  headerBadgeAr: string;
  headerAffiliationEn: string;
  headerAffiliationAr: string;
  headerPortalUrl: string;
  headerIssnPrint: string;
  headerIssnOnline: string;
  headerDoiPrefix: string;
  // Document Body Fields
  letterTitleEn: string;
  letterTitleAr: string;
  letterSubtitleEn: string;
  letterSubtitleAr: string;
  salutationEn: string;
  salutationAr: string;
  openingTextEn: string;
  openingTextAr: string;
  evaluationEn: string;
  evaluationAr: string;
  milestonesEn: string[];
  milestonesAr: string[];
  // Signatories
  signatory1Name: string;
  signatory1Title: string;
  signatory1NameAr: string;
  signatory1TitleAr: string;
  signatory2Name: string;
  signatory2Title: string;
  signatory2NameAr: string;
  signatory2TitleAr: string;
  // Seal Texts
  sealTextTop: string;
  sealTextCenter: string;
  sealTextBottom: string;
  // Footer Customization Fields
  footerSecurityHashText: string;
  footerNoticeEn: string;
  footerNoticeAr: string;
  footerPortalText: string;
  showReceivedDateDefault: boolean;
  // Barcode Customization
  barcodeMode: 'auto_qr' | 'custom_barcode';
}

export interface ReviewerCertificateTemplateData {
  titleAr: string;
  titleEn: string;
  issuingBodyAr: string;
  issuingBodyEn: string;
  introTextAr: string;
  introTextEn: string;
  bodyTextAr: string;
  bodyTextEn: string;
  signatory1Name: string;
  signatory1Title: string;
  signatory1NameAr: string;
  signatory1TitleAr: string;
  signatory2Name: string;
  signatory2Title: string;
  signatory2NameAr: string;
  signatory2TitleAr: string;
  sealText: string;
}

interface TemplateContextType {
  acceptanceTemplate: AcceptanceTemplateData;
  certificateTemplate: ReviewerCertificateTemplateData;
  customLogoUrl: string | null;
  customSealUrl: string | null;
  customBarcodeUrl: string | null;
  barcodeMode: 'auto_qr' | 'custom_barcode';
  updateAcceptanceTemplate: (updates: Partial<AcceptanceTemplateData>) => void;
  updateCertificateTemplate: (updates: Partial<ReviewerCertificateTemplateData>) => void;
  setCustomLogoUrl: (logoUrl: string | null) => void;
  setCustomSealUrl: (sealUrl: string | null) => void;
  setCustomBarcodeUrl: (barcodeUrl: string | null) => void;
  setBarcodeMode: (mode: 'auto_qr' | 'custom_barcode') => void;
  resetAcceptanceTemplate: () => void;
  resetCertificateTemplate: () => void;
}

const DEFAULT_ACCEPTANCE_TEMPLATE: AcceptanceTemplateData = {
  journalNameEn: 'Archives of Agriculture Sciences Journal',
  journalNameAr: 'مجلة أرشيف العلوم الزراعية',
  journalTaglineEn: 'Peer-Reviewed International Agricultural Science Journal · Editorial Board',
  journalTaglineAr: 'المجلة العلمية المحكمة للعلوم الزراعية والتطبيقية · مجلس وهيئة التحرير',
  // Header defaults
  headerBadgeEn: 'Peer-Reviewed Agricultural Science Journal',
  headerBadgeAr: 'مجلة علمية دولية محكمة ومعتمدة',
  headerAffiliationEn: 'Faculty of Agriculture (Assiut Branch), Egypt · In Partnership with Egyptian Knowledge Bank (EKB)',
  headerAffiliationAr: 'كلية الزراعة بأسيوط، جمهورية مصر العربية · بالتعاون مع بنك المعرفة المصري',
  headerPortalUrl: 'https://aasj.journals.ekb.eg',
  headerIssnPrint: '2535-1680',
  headerIssnOnline: '2535-1699',
  headerDoiPrefix: '10.21608/aasj',
  // Body defaults
  letterTitleEn: 'Official Notice of Final Acceptance for Publication',
  letterTitleAr: 'خطاب وبراءة القبول النهائي للنشر العلمي المحكّم',
  letterSubtitleEn: 'Editorial Decision & Scientific Certification — Archives of Agriculture Sciences Journal',
  letterSubtitleAr: 'قرار هيئة التحرير والإجازة العلمية الصادرة عن مجلس إدارة المجلة',
  salutationEn: 'Dear Respected Author(s),',
  salutationAr: 'سعادة الباحث الرئيسي والباحثون المشاركون المحترمون،،،',
  openingTextEn: 'On behalf of the Editorial Board and Scientific Committee of the Archives of Agriculture Sciences Journal (AASJ), we are pleased to inform you that following rigorous double-blind peer review by international academic referees and subsequent editorial board assessment, your manuscript detailed below has been formally ACCEPTED FOR FINAL PUBLICATION in the Archives of Agriculture Sciences Journal (AASJ).',
  openingTextAr: 'يسر مجلس إدارة وهيئة تحرير مجلة أرشيف العلوم الزراعية (Archives of Agriculture Sciences Journal - AASJ) بالتعاون مع بنك المعرفة المصري، إحاطتكم علمًا بأنه بعد اجتياز البحث لكافة مراحل التحكيم العلمي المزدوج المعمّى (Double-Blind Peer Review) واستيفاء الملاحظات الفنية والموضوعية، صدر القرار النهائي بالقبول النهائي والبات لنشر البحث بالمجلة.',
  evaluationEn: 'Editorial Assessment: The Editorial Board and external reviewers commend the manuscript\'s rigorous methodology, novel scientific contribution, and relevance to sustainable agricultural sciences. The study satisfies all academic integrity and quality benchmarks set by AASJ.',
  evaluationAr: 'التقييم الأكاديمي: أشادت هيئة التحرير ولجان التحكيم التخصصية بالمستوى العلمي الرفيع والمنهجية الرصينة للبحث، ومطابقته لأعلى معايير الرصانة والأمانة العلمية المعتمدة في المجلة.',
  milestonesEn: [
    'Typesetting & Proofreading: Transferred to AASJ production department; author galley proofs will be dispatched within 5–7 business days.',
    'Online First & Crossref DOI: Published immediately upon proof clearance on the Egyptian Knowledge Bank (EKB) portal with permanent Crossref DOI linkage.',
    'Open Access & Archiving: Distributed under Creative Commons Attribution 4.0 (CC BY 4.0) with perpetual archiving across international scientific indices.',
    'Academic Certification: Officially recognized by scientific promotion committees and graduate studies councils.'
  ],
  milestonesAr: [
    'التنضيد والبروفات الطباعية: إحالة البحث لقسم الإخراج الفني بالمجلة وإرسال نسخة البروفة للمؤلف للمراجعة النهائية خلال 5-7 أيام عمل.',
    'النشر الإلكتروني الفوري: النشر بالمعرّف الرقمي الدائم (Crossref DOI) عبر البوابة الرسمية لبنك المعرفة المصري (EKB).',
    'الوصول الحر والتوثيق: النشر بنظام الوصول الحر المفتوح بترخيص المشاع الإبداعي الدولي (CC BY 4.0) مع الإيداع في فهارس الاقتباس الدولية.',
    'الاعتمادية الأكاديمية: وثيقة رسمية معتمدة وموجهة لكافة اللجان العلمية الدائمة للترقيات وإدارات الدراسات العليا والبحوث.'
  ],
  signatory1Name: 'Prof. Dr. Ahmed Mohamed Soliman',
  signatory1Title: 'Editor-in-Chief, Archives of Agriculture Sciences Journal (AASJ)',
  signatory1NameAr: 'أ.د. أحمد محمد سليمان',
  signatory1TitleAr: 'رئيس تحرير مجلة أرشيف العلوم الزراعية',
  signatory2Name: 'Prof. Dr. Mahmoud Abdel-Rahman',
  signatory2Title: 'Managing Editor, Archives of Agriculture Sciences Journal (AASJ)',
  signatory2NameAr: 'أ.د. محمود عبد الرحمن',
  signatory2TitleAr: 'مدير تحرير مجلة أرشيف العلوم الزراعية',
  sealTextTop: '★ ARCHIVES OF AGRICULTURE SCIENCES JOURNAL ★',
  sealTextCenter: 'AASJ EDITORIAL BOARD',
  sealTextBottom: 'OFFICIAL ACCEPTANCE SEAL',
  // Footer defaults
  footerSecurityHashText: 'SHA256:AASJ-ACCEPT-VERIFIED',
  footerNoticeEn: 'Official publication certification issued by the Editorial Office of Archives of Agriculture Sciences Journal (AASJ). All rights reserved.',
  footerNoticeAr: 'وثيقة قبول نشر رسمية صادرة ومعتمدة من مجلس إدارة وهيئة تحرير مجلة أرشيف العلوم الزراعية (AASJ). كافة الحقوق محفوظة.',
  footerPortalText: 'aasj.journals.ekb.eg',
  showReceivedDateDefault: false,
  barcodeMode: 'auto_qr'
};

const DEFAULT_CERTIFICATE_TEMPLATE: ReviewerCertificateTemplateData = {
  titleAr: 'شَهَادَةُ شُكْرٍ وَتَقْدِيرٍ لِلتَّحْكِيمِ العِلْمِيِّ',
  titleEn: 'CERTIFICATE OF SCIENTIFIC PEER REVIEW APPRECIATION',
  issuingBodyAr: 'مجلس إدارة وهيئة تحرير مجلة أرشيف العلوم الزراعية (AASJ)',
  issuingBodyEn: 'Archives of Agriculture Sciences Journal (AASJ) Editorial Board',
  introTextAr: 'تتشرف إدارة وهيئة تحرير مجلة أرشيف العلوم الزراعية (AASJ) بأن تتقدم بخالص الشكر والتقدير وفائق الامتنان إلى سعادة الأستاذ الدكتور /',
  introTextEn: 'The Editorial Board of Archives of Agriculture Sciences Journal (AASJ) proudly presents this certificate of appreciation and highest gratitude to:',
  bodyTextAr: 'تقديراً لجهوده العلمية المتميزة وإسهامه القيّم في تحكيم وتقييم البحوث العلمية المحالة إليه بدقة وموضوعية، والتزامه بأعلى معايير الأمانة العلمية والتحكيم المزدوج (Double-Blind Peer Review) المعتمدة بالمجلة.',
  bodyTextEn: 'In recognition of outstanding academic expertise, objective critical evaluation, and valuable dedication to the peer-review process, adhering to the rigorous double-blind peer-review standards of the journal.',
  signatory1Name: 'Prof. Dr. Ahmed Mohamed Soliman',
  signatory1Title: 'Editor-in-Chief, AASJ',
  signatory1NameAr: 'أ.د. أحمد محمد سليمان',
  signatory1TitleAr: 'رئيس التحرير، مجلة أرشيف العلوم الزراعية',
  signatory2Name: 'Prof. Dr. Mahmoud Abdel-Rahman',
  signatory2Title: 'Managing Editor, AASJ',
  signatory2NameAr: 'أ.د. محمود عبد الرحمن',
  signatory2TitleAr: 'مدير التحرير، مجلة أرشيف العلوم الزراعية',
  sealText: 'AASJ OFFICIAL REVIEW CERTIFICATION'
};

const ACCEPTANCE_STORAGE_KEY = 'AASJ_ACCEPTANCE_TEMPLATE_V3';
const CERTIFICATE_STORAGE_KEY = 'AASJ_CERTIFICATE_TEMPLATE_V3';
const LOGO_STORAGE_KEY = 'AASJ_CUSTOM_JOURNAL_LOGO_V1';
const SEAL_STORAGE_KEY = 'AASJ_CUSTOM_JOURNAL_SEAL_V1';
const BARCODE_STORAGE_KEY = 'AASJ_CUSTOM_ACCEPTANCE_BARCODE_V1';
const BARCODE_MODE_STORAGE_KEY = 'AASJ_ACCEPTANCE_BARCODE_MODE_V1';

const TemplateContext = createContext<TemplateContextType | undefined>(undefined);

export const TemplateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [acceptanceTemplate, setAcceptanceTemplate] = useState<AcceptanceTemplateData>(() => {
    try {
      const saved = localStorage.getItem(ACCEPTANCE_STORAGE_KEY);
      if (saved) return { ...DEFAULT_ACCEPTANCE_TEMPLATE, ...JSON.parse(saved) };
    } catch (e) {
      console.error('Failed to load acceptance template', e);
    }
    return DEFAULT_ACCEPTANCE_TEMPLATE;
  });

  const [certificateTemplate, setCertificateTemplate] = useState<ReviewerCertificateTemplateData>(() => {
    try {
      const saved = localStorage.getItem(CERTIFICATE_STORAGE_KEY);
      if (saved) return { ...DEFAULT_CERTIFICATE_TEMPLATE, ...JSON.parse(saved) };
    } catch (e) {
      console.error('Failed to load certificate template', e);
    }
    return DEFAULT_CERTIFICATE_TEMPLATE;
  });

  const [customLogoUrl, setCustomLogoUrlState] = useState<string | null>(() => {
    try {
      return localStorage.getItem(LOGO_STORAGE_KEY) || null;
    } catch {
      return null;
    }
  });

  const [customSealUrl, setCustomSealUrlState] = useState<string | null>(() => {
    try {
      return localStorage.getItem(SEAL_STORAGE_KEY) || null;
    } catch {
      return null;
    }
  });

  const [customBarcodeUrl, setCustomBarcodeUrlState] = useState<string | null>(() => {
    try {
      return localStorage.getItem(BARCODE_STORAGE_KEY) || null;
    } catch {
      return null;
    }
  });

  const [barcodeMode, setBarcodeModeState] = useState<'auto_qr' | 'custom_barcode'>(() => {
    try {
      const saved = localStorage.getItem(BARCODE_MODE_STORAGE_KEY);
      if (saved === 'custom_barcode' || saved === 'auto_qr') return saved;
    } catch {}
    return 'auto_qr';
  });

  const updateAcceptanceTemplate = (updates: Partial<AcceptanceTemplateData>) => {
    setAcceptanceTemplate((prev) => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem(ACCEPTANCE_STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        console.error('Failed to save acceptance template', e);
      }
      return next;
    });
  };

  const updateCertificateTemplate = (updates: Partial<ReviewerCertificateTemplateData>) => {
    setCertificateTemplate((prev) => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem(CERTIFICATE_STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        console.error('Failed to save certificate template', e);
      }
      return next;
    });
  };

  const setCustomLogoUrl = (logoUrl: string | null) => {
    setCustomLogoUrlState(logoUrl);
    try {
      if (logoUrl) {
        localStorage.setItem(LOGO_STORAGE_KEY, logoUrl);
      } else {
        localStorage.removeItem(LOGO_STORAGE_KEY);
      }
    } catch (e) {
      console.error('Failed to save custom logo', e);
    }
  };

  const setCustomSealUrl = (sealUrl: string | null) => {
    setCustomSealUrlState(sealUrl);
    try {
      if (sealUrl) {
        localStorage.setItem(SEAL_STORAGE_KEY, sealUrl);
      } else {
        localStorage.removeItem(SEAL_STORAGE_KEY);
      }
    } catch (e) {
      console.error('Failed to save custom seal', e);
    }
  };

  const setCustomBarcodeUrl = (barcodeUrl: string | null) => {
    setCustomBarcodeUrlState(barcodeUrl);
    try {
      if (barcodeUrl) {
        localStorage.setItem(BARCODE_STORAGE_KEY, barcodeUrl);
        // Automatically switch mode to custom_barcode when a barcode is uploaded
        setBarcodeModeState('custom_barcode');
        localStorage.setItem(BARCODE_MODE_STORAGE_KEY, 'custom_barcode');
      } else {
        localStorage.removeItem(BARCODE_STORAGE_KEY);
        setBarcodeModeState('auto_qr');
        localStorage.setItem(BARCODE_MODE_STORAGE_KEY, 'auto_qr');
      }
    } catch (e) {
      console.error('Failed to save custom barcode', e);
    }
  };

  const setBarcodeMode = (mode: 'auto_qr' | 'custom_barcode') => {
    setBarcodeModeState(mode);
    try {
      localStorage.setItem(BARCODE_MODE_STORAGE_KEY, mode);
    } catch (e) {
      console.error('Failed to save barcode mode', e);
    }
  };

  const resetAcceptanceTemplate = () => {
    setAcceptanceTemplate(DEFAULT_ACCEPTANCE_TEMPLATE);
    try {
      localStorage.removeItem(ACCEPTANCE_STORAGE_KEY);
    } catch {}
  };

  const resetCertificateTemplate = () => {
    setCertificateTemplate(DEFAULT_CERTIFICATE_TEMPLATE);
    try {
      localStorage.removeItem(CERTIFICATE_STORAGE_KEY);
    } catch {}
  };

  return (
    <TemplateContext.Provider
      value={{
        acceptanceTemplate,
        certificateTemplate,
        customLogoUrl,
        customSealUrl,
        customBarcodeUrl,
        barcodeMode,
        updateAcceptanceTemplate,
        updateCertificateTemplate,
        setCustomLogoUrl,
        setCustomSealUrl,
        setCustomBarcodeUrl,
        setBarcodeMode,
        resetAcceptanceTemplate,
        resetCertificateTemplate,
      }}
    >
      {children}
    </TemplateContext.Provider>
  );
};

export const useTemplate = () => {
  const context = useContext(TemplateContext);
  if (!context) {
    throw new Error('useTemplate must be used within a TemplateProvider');
  }
  return context;
};
