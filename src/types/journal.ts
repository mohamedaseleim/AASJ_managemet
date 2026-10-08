/**
 * AASJ Journal Management System Types
 * Al-Azhar University, Faculty of Agriculture (Assiut Branch), Egypt
 * Website: https://aasj.journals.ekb.eg
 */

export type DocumentType = 'Research Article' | 'Review Article' | 'Short Communication';

// The 7 Official Sections / Disciplines of the Journal (أجزاء المجلة السبعة)
export type JournalDiscipline =
  | 'Agricultural Economics, Rural Sociology and Agricultural Extension'
  | 'Animal and Poultry Production'
  | 'Chemistry, Agricultural Microbiology, and Genetics'
  | 'Dairy Science, Food Science and Technology'
  | 'Plant Pathology and Plant Protection'
  | 'Plant Production'
  | 'Soils and Water, and Agricultural Engineering';

export type AuthorTitle = 'Dr.' | 'Prof.' | 'Mr.' | 'Ms.';
export type AuthorDegree = 'PhD' | 'PhD candidate' | 'MSc' | 'MSc Student' | 'BSc' | 'Other';
export type AuthorPosition = 'Professor' | 'Associate Professor' | 'Assistant Professor' | 'Instructor' | 'Other';

export type ReviewerRecommendation =
  | 'Accept Manuscript'
  | 'Manuscript Needs Revision (Acceptance with Minor Revision)'
  | 'Manuscript Needs Revision (Minor Revision)'
  | 'Manuscript Needs Revision (Major Revision)'
  | 'Reject Manuscript';

export type ManuscriptStatus =
  | 'Submitted Manuscript'
  | 'Similarity Check'
  | 'Manuscript Assigned to Reviewers'
  | 'Manuscript Requiring Additional Reviewers'
  | 'Reviewers Not Reviewed Manuscript in Review Due Date'
  | 'Manuscript Reviewed by Reviewers'
  | 'Manuscript Reviewed by All Reviewers'
  | 'Manuscript Assigned to Editorial Board'
  | 'Manuscript Assigned to Technical Editor'
  | 'Rejected Manuscript (Aims and Scope)'
  | 'Rejected Manuscript (Extra Submission)'
  | 'Rejected Manuscript (Similar Results)'
  | 'Rejected Manuscript (Not Receiving Priority)'
  | 'Rejected Manuscript (Literary Problems)'
  | 'Rejected Manuscript (All Reviewers Declined to Review)'
  | 'Rejected Manuscript (Reviewers/Editor Recommendation)'
  | 'Rejected Manuscript'
  | 'Manuscript Sent Back to Author for Resubmit'
  | 'Manuscript Needs Revision (Major Revision)'
  | 'Manuscript Needs Revision (Minor Revision)'
  | 'Manuscript Needs Revision (Acceptance with Minor Revision)'
  | 'Manuscript Revised by Author'
  | 'Manuscript Not Revised by Authors After Revision Due Date'
  | 'Manuscript Sent to Author for Payment'
  | 'Manuscript Sent to Language Editor'
  | 'Manuscript Sent to Page Designer'
  | 'Manuscript Sent to Author for Galley Proof'
  | 'Manuscript Accepted (Preliminary Scientific)'
  | 'Manuscript Accepted (Final)'
  | 'Manuscript Published in Journal'
  | 'Deleted Manuscript'
  | 'Withdrawn Manuscript';

export interface ReviewerAssignment {
  name: string;
  email: string;
  affiliation?: string;
  assignDate?: string;
  assignedDate?: string;
  reviewDueDate?: string;
  deadline?: string;
  status?: 'pending' | 'in_progress' | 'completed' | 'rejected' | string;
  score?: number;
  reviewerId?: string;
  recommendation?: ReviewerRecommendation | '';
  reviewDate?: string;
  comment?: string;
  fileUrl?: string;
}

export interface Manuscript {
  id: string; // e.g. AASJ-2026-081
  code?: string; // alias for id
  status: ManuscriptStatus;
  comment?: string;
  documentType: DocumentType;
  doi?: string;
  articleTitle: string;
  titleAr?: string; // alias
  titleEn?: string; // alias
  abstractAr?: string;
  abstractEn?: string;
  abstract?: string;
  section?: string;
  authorName?: string;
  authorEmail?: string;
  keywords: string;
  volume: number;
  issue: number;
  pagesFrom?: number;
  pagesTo?: number;
  publishedYear: number;
  receiveDate: string;
  reviseDate?: string;
  acceptDate?: string;
  publishDate?: string;
  subjectsRelated: JournalDiscipline[];
  specificFieldOfStudy: string;
  
  // Manuscript Files
  submittedFileUrl?: string;
  revisedFileUrl?: string;
  layoutFileUrl?: string;
  publishedFileUrl?: string;

  // Corresponding Author
  correspondAuthorTitle: AuthorTitle;
  correspondAuthorFirstName: string;
  correspondAuthorMiddle?: string;
  correspondAuthorLastName: string;
  correspondAuthorDegree: AuthorDegree;
  correspondAuthorPosition: AuthorPosition;
  correspondAuthorSpecialty: string;
  correspondAuthorSpecificField: string;
  correspondAuthorORCID?: string;
  correspondAuthorEmail: string;
  correspondAuthorPhone?: string;
  correspondAuthorMobile: string;
  correspondAuthorFax?: string;
  correspondAuthorAffiliation: string;

  // Authors
  firstAuthorFullName: string;
  authorsNames: string;
  authorsEmails: string;
  authorsAffiliations: string;

  // Reviewers (Up to 4)
  reviewerOne?: ReviewerAssignment;
  reviewerTwo?: ReviewerAssignment;
  reviewerThree?: ReviewerAssignment;
  reviewerFour?: ReviewerAssignment;
  
  createdAt: string;
  updatedAt: string;
}

export interface WaitingListItem {
  id: string;
  manuscriptId: string;
  manuscriptTitle: string;
  authorNames: string;
  subjects: JournalDiscipline;
  volume: number;
  issue: number;
  waitingNumber: number;
  addedDate: string;
  notes?: string;
}

export interface DonationRecord {
  id: string;
  manuscriptId: string;
  manuscriptTitle: string;
  authorsNames: string;
  manuscriptStatus: 'Under Reviewing' | 'Under Revising' | 'Under Publishing' | 'Published';
  donateReceived: 'Yes' | 'No';
  donateDate?: string;
  donateAmount: number;
  currency: 'USD' | 'EGP' | 'SDG' | 'SAR' | 'EUR';
  paymentMethod?: string;
  receiptNumber?: string;
  notes?: string;
}

export interface DocumentArchiveItem {
  id: string;
  documentType: 'Outgoing' | 'Issued' | 'Incoming';
  documentDescription: string;
  outgoingNumber?: string;
  issuedOn?: string;
  incomingNumber?: string;
  incomingDated?: string;
  archiveLocation: string;
  fileUrl?: string;
  senderOrRecipient?: string;
  createdAt: string;
}

export type ReviewerPaymentMethod =
  | 'PayPal'
  | 'Fawry'
  | 'Vodafone Cash'
  | 'Orange Cash'
  | 'Etisalat Cash'
  | 'WE Pay'
  | 'Cash'
  | 'Bank Transfer';

export interface ReviewerProfile {
  id: string;
  name: string;
  email: string;
  affiliation: string;
  telephone?: string;
  mobile: string;
  fax?: string;
  major: JournalDiscipline;
  specialization?: string;
  subSpecialty?: string;
  reviewingInterests: string;
  daysSinceLastReview: number;
  reviewsCompleted: number;
  reviewRequestsDeclined: number;
  averageDaysToComplete: number;
  paymentMethod: ReviewerPaymentMethod;
  paymentDetails: string;
  rating?: number;
  isActive: boolean;
}

export interface CashFlowTransaction {
  id: string;
  transactionType: 'incoming' | 'outgoing';
  amount: number;
  currency: 'USD' | 'EGP' | 'SDG';
  transactionDate: string;
  category:
    | 'APC Publishing Fee'
    | 'Reviewer Honorarium'
    | 'Author Donation'
    | 'Page Layout & Typesetting'
    | 'Language Editing'
    | 'Web Hosting & DOI Registration'
    | 'Office & Editorial Expenses'
    | 'Other';
  description: string;
  documentUrl?: string;
  relatedManuscriptId?: string;
}

/**
 * Journal Roles (أدوار المجلة المعتمدة):
 * 1. المشرف العام (عميد الكلية): إشراف مالي وإداري
 * 2. رئيس التحرير
 * 3. رئيس الهيئة الاستشارية
 * 4. مدير التحرير
 * 5. سكرتير المجلة
 * 6. محرر تنفيذي (مشرف على جزء/قسم من أجزاء المجلة السبعة)
 * 7. محرر
 * 8. محرر تنسيق
 * 9. محكم
 * 10. مؤلف
 * 11. مسؤول النظام (Admin)
 */
export type UserRole =
  | 'admin'
  | 'general_supervisor' // عميد الكلية - مشرف عام
  | 'editor_in_chief' // رئيس التحرير
  | 'advisory_head' // رئيس الهيئة الاستشارية
  | 'managing_editor' // مدير التحرير
  | 'secretary' // سكرتير المجلة
  | 'executive_editor' // محرر تنفيذي (مشرف على جزء)
  | 'editor' // محرر
  | 'layout_editor' // محرر تنسيق
  | 'reviewer' // محكم
  | 'author'; // مؤلف

export interface UserAccount {
  id: string;
  username: string;
  password: string; // Stored securely in state/localStorage
  fullName: string;
  email: string;
  role: UserRole;
  assignedSection?: JournalDiscipline; // For executive editors (المشرف على جزء من الأجزاء السبعة)
  title?: string; // أ.د. / د. / م.
  affiliation?: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface JournalSectionDetails {
  id: number;
  discipline: JournalDiscipline;
  arabicName: string;
  englishName: string;
  descriptionAr: string;
  descriptionEn: string;
  departmentCode: string;
}

export type ActivityActionType =
  | 'login'
  | 'logout'
  | 'manuscript_create'
  | 'manuscript_update'
  | 'manuscript_status'
  | 'manuscript_delete'
  | 'reviewer_assign'
  | 'notification_alert'
  | 'deadline_extended'
  | 'fee_payment'
  | 'cash_transaction'
  | 'document_archive'
  | 'google_drive_upload'
  | 'google_drive_folder'
  | 'user_management'
  | 'system_backup';

export interface ActivityLogItem {
  id: string;
  timestamp: string;
  username: string;
  userFullName: string;
  userRole: UserRole;
  actionType: ActivityActionType;
  title: string;
  description: string;
  targetId?: string;
  ipAddress?: string;
  severity: 'info' | 'success' | 'warning' | 'danger';
}

export type ActiveModule =
  | 'dashboard'
  | 'sections' // أجزاء المجلة السبعة
  | 'manuscripts'
  | 'waiting_list'
  | 'donates'
  | 'files'
  | 'google_drive' // التخزين السحابي والمجلدات المنظمة Google Drive
  | 'reviewers'
  | 'certificates' // وحدة شهادات التحكيم الرسمية والتحقق الرقمي
  | 'editorial_reports' // وحدة التقارير البيانية وتقييم الأداء التحريري
  | 'cash_flow'
  | 'users' // إدارة المستخدمين والحسابات
  | 'activity_logs' // سجل جميع النشاطات ومراقبة النظام (حصرياً للآدمن)
  | 'reviewer_portal' // بوابة المحكم
  | 'author_portal'; // بوابة المؤلف
