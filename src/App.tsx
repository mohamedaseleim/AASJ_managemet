import React, { useState, useEffect } from 'react';
import { AcceptanceLetterModal } from './components/AcceptanceLetterModal';
import { ActivityLogsModule } from './components/ActivityLogsModule';
import { AuthorPortalModule } from './components/AuthorPortalModule';
import { CashFlowModule } from './components/CashFlowModule';
import { DashboardOverview } from './components/DashboardOverview';
import { DocumentsModule } from './components/DocumentsModule';
import { DonatesModule } from './components/DonatesModule';
import { GoogleDriveExplorerModule } from './components/GoogleDriveExplorerModule';
import { Header } from './components/Header';
import { JournalSectionsModule } from './components/JournalSectionsModule';
import { ManuscriptDetailModal } from './components/ManuscriptDetailModal';
import { ManuscriptFormModal } from './components/ManuscriptFormModal';
import { ManuscriptsModule } from './components/ManuscriptsModule';
import { PortalLoginPage } from './components/PortalLoginPage';
import { ReceiptVoucherModal } from './components/ReceiptVoucherModal';
import { ReviewerPortalModule } from './components/ReviewerPortalModule';
import { ReviewersModule } from './components/ReviewersModule';
import { CertificateModule } from './components/CertificateModule';
import { EditorialReportsModule } from './components/EditorialReportsModule';
import { UsersManagementModule } from './components/UsersManagementModule';
import { WaitingListModule } from './components/WaitingListModule';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GoogleDriveProvider } from './context/GoogleDriveContext';
import { JournalProvider, useJournal } from './context/JournalContext';
import { NotificationProvider } from './context/NotificationContext';
import { TemplateProvider } from './context/TemplateContext';
import { DonationRecord, JournalDiscipline, Manuscript } from './types/journal';
import { OfflineIndicator } from './components/OfflineIndicator';

const JournalAppContent: React.FC = () => {
  const { activeModule, setActiveModule, language } = useJournal();
  const { currentUser, canAccessModule } = useAuth();

  // If user is not authenticated, show the official Portal Login Gateway page
  if (!currentUser) {
    return <PortalLoginPage />;
  }

  // Modal states
  const [selectedManuscriptForDossier, setSelectedManuscriptForDossier] = useState<Manuscript | null>(null);
  const [isAddOrEditManuscriptOpen, setIsAddOrEditManuscriptOpen] = useState(false);
  const [manuscriptToEdit, setManuscriptToEdit] = useState<Manuscript | null>(null);
  const [acceptanceLetterManuscript, setAcceptanceLetterManuscript] = useState<Manuscript | null>(null);
  const [receiptDonation, setReceiptDonation] = useState<DonationRecord | null>(null);

  // Filter passing from 7 Sections view to Manuscripts view
  const [selectedSectionFilter, setSelectedSectionFilter] = useState<string>('all');

  // Automatic routing based on user role
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'reviewer' && activeModule !== 'reviewer_portal' && activeModule !== 'sections') {
        setActiveModule('reviewer_portal');
      } else if (currentUser.role === 'author' && activeModule !== 'author_portal' && activeModule !== 'sections') {
        setActiveModule('author_portal');
      } else if (!canAccessModule(activeModule)) {
        setActiveModule('dashboard');
      }
    }
  }, [currentUser, activeModule]);

  const handleOpenAddManuscript = () => {
    setManuscriptToEdit(null);
    setIsAddOrEditManuscriptOpen(true);
  };

  const handleEditManuscript = (m: Manuscript) => {
    setManuscriptToEdit(m);
    setIsAddOrEditManuscriptOpen(true);
  };

  const handleViewDossier = (m: Manuscript) => {
    setSelectedManuscriptForDossier(m);
  };

  const handlePrintLetter = (m: Manuscript) => {
    setAcceptanceLetterManuscript(m);
  };

  const handlePrintReceipt = (d: DonationRecord) => {
    setReceiptDonation(d);
  };

  const handleSelectSectionFilter = (discipline: JournalDiscipline) => {
    setSelectedSectionFilter(discipline);
    setActiveModule('manuscripts');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/70 text-slate-900 font-sans selection:bg-emerald-700 selection:text-white">
      {/* Top Bar Header */}
      <Header onOpenAddManuscript={handleOpenAddManuscript} />

      {/* Main Viewport Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8">
        {activeModule === 'dashboard' && (
          <DashboardOverview
            onSelectManuscript={handleViewDossier}
            onOpenAddManuscript={handleOpenAddManuscript}
          />
        )}

        {activeModule === 'sections' && (
          <JournalSectionsModule
            onSelectSectionFilter={handleSelectSectionFilter}
          />
        )}

        {activeModule === 'manuscripts' && (
          <ManuscriptsModule
            onSelectManuscript={handleViewDossier}
            onEditManuscript={handleEditManuscript}
            onPrintLetter={handlePrintLetter}
            onOpenAdd={handleOpenAddManuscript}
            initialDisciplineFilter={selectedSectionFilter}
          />
        )}

        {activeModule === 'waiting_list' && <WaitingListModule />}

        {activeModule === 'donates' && (
          <DonatesModule onPrintReceipt={handlePrintReceipt} />
        )}

        {activeModule === 'files' && <DocumentsModule />}

        {activeModule === 'google_drive' && <GoogleDriveExplorerModule />}

        {activeModule === 'reviewers' && <ReviewersModule />}

        {activeModule === 'certificates' && (
          <CertificateModule onSelectManuscript={handleViewDossier} />
        )}

        {activeModule === 'editorial_reports' && (
          <EditorialReportsModule onSelectManuscript={handleViewDossier} />
        )}

        {activeModule === 'cash_flow' && <CashFlowModule />}

        {activeModule === 'users' && <UsersManagementModule />}

        {activeModule === 'activity_logs' && <ActivityLogsModule />}

        {activeModule === 'reviewer_portal' && (
          <ReviewerPortalModule onSelectManuscript={handleViewDossier} />
        )}

        {activeModule === 'author_portal' && (
          <AuthorPortalModule
            onOpenAddManuscript={handleOpenAddManuscript}
            onSelectManuscript={handleViewDossier}
            onPrintLetter={handlePrintLetter}
            onPrintReceipt={handlePrintReceipt}
          />
        )}
      </main>

      {/* Scholarly Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 mb-16 md:mb-0 text-xs text-slate-500 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-0.5 text-center sm:text-left rtl:sm:text-right">
            <p className="font-bold text-emerald-950 font-serif text-sm">
              Archives of Agriculture Sciences Journal (AASJ) · مجلة أرشيف العلوم الزراعية
            </p>
            <p className="text-[11px] text-slate-600">
              Al-Azhar University, Faculty of Agriculture (Assiut Branch), Egypt · جامعة الأزهر، كلية الزراعة بأسيوط
            </p>
            <div className="text-[11px] text-amber-800 font-mono font-semibold space-x-2 rtl:space-x-reverse pt-0.5">
              <span>Print ISSN: 2535-1680</span>
              <span>·</span>
              <span>Online ISSN: 2535-1699</span>
              <span>·</span>
              <span>Frequency: Three Times Per Year</span>
              <span>·</span>
              <a
                href="https://aasj.journals.ekb.eg"
                target="_blank"
                rel="noreferrer"
                className="text-emerald-700 underline hover:text-emerald-900"
              >
                https://aasj.journals.ekb.eg
              </a>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 text-center sm:text-right rtl:sm:text-left">
            <span>© {new Date().getFullYear()} Faculty of Agriculture (Assiut), Al-Azhar University. All rights reserved.</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {selectedManuscriptForDossier && (
        <ManuscriptDetailModal
          manuscript={selectedManuscriptForDossier}
          onClose={() => setSelectedManuscriptForDossier(null)}
          onEdit={handleEditManuscript}
          onPrintLetter={handlePrintLetter}
        />
      )}

      {isAddOrEditManuscriptOpen && (
        <ManuscriptFormModal
          initialData={manuscriptToEdit}
          onClose={() => {
            setIsAddOrEditManuscriptOpen(false);
            setManuscriptToEdit(null);
          }}
        />
      )}

      {acceptanceLetterManuscript && (
        <AcceptanceLetterModal
          manuscript={acceptanceLetterManuscript}
          onClose={() => setAcceptanceLetterManuscript(null)}
        />
      )}

      {receiptDonation && (
        <ReceiptVoucherModal
          donation={receiptDonation}
          onClose={() => setReceiptDonation(null)}
        />
      )}

      {/* PWA Offline Status Indicator */}
      <OfflineIndicator />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <JournalProvider>
        <NotificationProvider>
          <TemplateProvider>
            <GoogleDriveProvider>
              <JournalAppContent />
            </GoogleDriveProvider>
          </TemplateProvider>
        </NotificationProvider>
      </JournalProvider>
    </AuthProvider>
  );
}
