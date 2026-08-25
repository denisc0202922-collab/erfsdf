import React, { useState, useEffect } from 'react';
import {
  ActiveTabType,
  OfficerProfile,
  Offender,
  CriminalCase,
  LawArticle,
  ReportRecord,
  ProceduralDocument,
  RPBinderEntry,
  DepartmentItem,
  UserAccount,
  ChairmanOrder,
  UserRoleType,
  ServiceRoleItem
} from './types';
import {
  getOfficerProfile,
  saveOfficerProfile,
  getOffenders,
  saveOffenders,
  getCriminalCases,
  saveCriminalCases,
  getLawArticles,
  getReports,
  saveReports,
  getDocuments,
  saveDocuments,
  getRPBinds,
  saveRPBinds,
  getDepartments,
  saveDepartments,
  getAccounts,
  saveAccounts,
  getOrders,
  saveOrders,
  getServiceRoles,
  saveServiceRoles,
  exportFullBackup,
  importFullBackup,
  resetToInitialSeedData,
  fetchDatabaseFromServer,
  syncDatabaseToServer
} from './utils/storage';

import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { HomeView } from './components/HomeView';
import { ChairmanAdminView } from './components/ChairmanAdminView';
import { DashboardView } from './components/DashboardView';
import { OffendersDatabaseView } from './components/OffendersDatabaseView';
import { CriminalCasesView } from './components/CriminalCasesView';
import { DocumentGeneratorView } from './components/DocumentGeneratorView';
import { ReportsView } from './components/ReportsView';
import { LawbookView } from './components/LawbookView';
import { OfficerBadgeView } from './components/OfficerBadgeView';
import { RPBinderView } from './components/RPBinderView';
import { JuniorExamView } from './components/JuniorExamView';
import { SearchModal } from './components/SearchModal';
import { DataManagementModal } from './components/DataManagementModal';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { CheckCircle2, ShieldAlert, Lock, ArrowRight, Home as HomeIcon } from 'lucide-react';

export function App() {
  // Navigation State - restored from localStorage or default 'home'
  const [activeTab, setActiveTab] = useState<ActiveTabType>(() => {
    try {
      const saved = localStorage.getItem('sk_rf_active_tab') as ActiveTabType;
      return saved || 'home';
    } catch {
      return 'home';
    }
  });
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [selectedOffenderId, setSelectedOffenderId] = useState<string | null>(null);

  // App Data State
  const [officer, setOfficer] = useState<OfficerProfile>(getOfficerProfile);
  const [offenders, setOffenders] = useState<Offender[]>(getOffenders);
  const [cases, setCases] = useState<CriminalCase[]>(getCriminalCases);
  const [articles, setArticles] = useState<LawArticle[]>(getLawArticles);
  const [reports, setReports] = useState<ReportRecord[]>(getReports);
  const [documents, setDocuments] = useState<ProceduralDocument[]>(getDocuments);
  const [binds, setBinds] = useState<RPBinderEntry[]>(getRPBinds);
  const [departments, setDepartments] = useState<DepartmentItem[]>(getDepartments);
  const [accounts, setAccounts] = useState<UserAccount[]>(getAccounts);
  const [orders, setOrders] = useState<ChairmanOrder[]>(getOrders);
  const [serviceRoles, setServiceRoles] = useState<ServiceRoleItem[]>(getServiceRoles);

  // Authentication & RBAC State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('sk_rf_is_authenticated');
      if (saved !== null) return saved === 'true';
      return Boolean(officer.fullName && officer.rank);
    } catch {
      return true;
    }
  });

  const [userRole, setUserRole] = useState<UserRoleType>(() => {
    try {
      const saved = localStorage.getItem('sk_rf_user_role') as UserRoleType;
      if (saved && saved !== 'guest') return saved;
      if (officer.fullName.includes('Чернов') || officer.rank === 'Генерал юстиции РФ') {
        return 'admin';
      }
      return 'investigator';
    } catch {
      return 'admin';
    }
  });

  const handleNavigateTab = (tab: ActiveTabType) => {
    setActiveTab(tab);
    try {
      localStorage.setItem('sk_rf_active_tab', tab);
    } catch {
      // Ignore
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Modal States
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Keyboard shortcut for universal search (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Initial server database synchronization (data/database.json)
  useEffect(() => {
    fetchDatabaseFromServer().then((db) => {
      if (db) {
        if (db.officer) setOfficer(db.officer);
        if (db.offenders) setOffenders(db.offenders);
        if (db.cases) setCases(db.cases);
        if (db.articles) setArticles(db.articles);
        if (db.reports) setReports(db.reports);
        if (db.documents) setDocuments(db.documents);
        if (db.binds) setBinds(db.binds);
        if (db.departments) setDepartments(db.departments);
        if (db.accounts) setAccounts(db.accounts);
        if (db.orders) setOrders(db.orders);
        if (db.serviceRoles) setServiceRoles(db.serviceRoles);
      }
    });
  }, []);

  const handleUpdateServiceRoles = (roles: ServiceRoleItem[]) => {
    setServiceRoles(roles);
    saveServiceRoles(roles);
  };

  // Sync state changes to storage
  const handleUpdateOfficer = (updated: OfficerProfile) => {
    setOfficer(updated);
    saveOfficerProfile(updated);

    // Sync with accounts
    setAccounts((prev) => {
      const updatedAccounts = prev.map((a) => {
        if (
          a.fullName.toLowerCase() === updated.fullName.toLowerCase() ||
          a.badgeNumber === updated.badgeNumber
        ) {
          return {
            ...a,
            rank: updated.rank,
            photoUrl: updated.photoUrl,
            position: updated.position,
            departmentName: updated.department
          };
        }
        return a;
      });
      saveAccounts(updatedAccounts);
      return updatedAccounts;
    });

    showToast('Служебные данные следователя обновлены');
  };

  // Switch officer from user account
  const handleSwitchOfficer = (account: UserAccount) => {
    const role: UserRoleType = account.role || (account.username === 'chernov_d' || account.fullName.includes('Чернов') ? 'admin' : 'investigator');
    const updated: OfficerProfile = {
      ...officer,
      rank: account.rank,
      fullName: account.fullName,
      position: account.position,
      department: account.departmentName,
      badgeNumber: account.badgeNumber,
      serviceId: account.serviceId || 'СК-00-0001',
      callsign: account.callsign,
      photoUrl: account.photoUrl,
      weaponType: account.weaponType || 'Пистолет Макарова (ПМ 9мм)',
      weaponSerial: account.weaponSerial || 'СК-77-9912',
      clearanceLevel: account.clearanceLevel,
      onDuty: true
    };
    setOfficer(updated);
    saveOfficerProfile(updated);
    setIsAuthenticated(true);
    setUserRole(role);
    try {
      localStorage.setItem('sk_rf_is_authenticated', 'true');
      localStorage.setItem('sk_rf_user_role', role);
      localStorage.setItem('sk_rf_active_username', account.username);
    } catch {
      // Ignore
    }
  };

  // Logout Handler
  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole('guest');
    handleNavigateTab('home');
    try {
      localStorage.setItem('sk_rf_is_authenticated', 'false');
      localStorage.setItem('sk_rf_user_role', 'guest');
      localStorage.setItem('sk_rf_active_tab', 'home');
    } catch {
      // Ignore
    }
    showToast('Вы вышли из служебной учетной записи');
  };

  // Chairman Admin handlers
  const handleUpdateDepartments = (updated: DepartmentItem[]) => {
    setDepartments(updated);
    saveDepartments(updated);
  };

  const handleUpdateAccounts = (updated: UserAccount[]) => {
    setAccounts(updated);
    saveAccounts(updated);
    // If the active logged in officer's account was modified (e.g. rank promoted), update current officer profile too
    const currentAcc = updated.find(
      (a) => a.fullName.toLowerCase() === officer.fullName.toLowerCase() || a.badgeNumber === officer.badgeNumber
    );
    if (currentAcc && currentAcc.rank !== officer.rank) {
      const updatedOfficer = {
        ...officer,
        rank: currentAcc.rank
      };
      setOfficer(updatedOfficer);
      saveOfficerProfile(updatedOfficer);
    }
  };

  const handleUpdateOrders = (updated: ChairmanOrder[]) => {
    setOrders(updated);
    saveOrders(updated);
  };

  // Offender Handlers
  const handleAddOffender = (newOffender: Offender) => {
    const updated = [newOffender, ...offenders];
    setOffenders(updated);
    saveOffenders(updated);
  };

  const handleUpdateOffender = (updatedOffender: Offender) => {
    const updated = offenders.map((o) => (o.id === updatedOffender.id ? updatedOffender : o));
    setOffenders(updated);
    saveOffenders(updated);
  };

  const handleDeleteOffender = (id: string) => {
    const updated = offenders.filter((o) => o.id !== id);
    setOffenders(updated);
    saveOffenders(updated);
    showToast('Досье гражданина удалено из базы');
  };

  // Case Handlers
  const handleAddCase = (newCase: CriminalCase) => {
    const updated = [newCase, ...cases];
    setCases(updated);
    saveCriminalCases(updated);
  };

  const handleUpdateCase = (updatedCase: CriminalCase) => {
    const updated = cases.map((c) => (c.id === updatedCase.id ? updatedCase : c));
    setCases(updated);
    saveCriminalCases(updated);
  };

  const handleDeleteCase = (id: string) => {
    const updated = cases.filter((c) => c.id !== id);
    setCases(updated);
    saveCriminalCases(updated);
    showToast('Уголовное дело удалено из реестра');
  };

  // Document Handlers
  const handleSaveDocument = (newDoc: ProceduralDocument) => {
    const updated = [newDoc, ...documents];
    setDocuments(updated);
    saveDocuments(updated);
  };

  const handleDeleteDocument = (id: string) => {
    const updated = documents.filter((d) => d.id !== id);
    setDocuments(updated);
    saveDocuments(updated);
    showToast('Документ удален из архива');
  };

  // Report Handlers
  const handleAddReport = (newReport: ReportRecord) => {
    const updated = [newReport, ...reports];
    setReports(updated);
    saveReports(updated);
  };

  const handleUpdateReport = (updatedReport: ReportRecord) => {
    const updated = reports.map((r) => (r.id === updatedReport.id ? updatedReport : r));
    setReports(updated);
    saveReports(updated);
  };

  const handleDeleteReport = (id: string) => {
    const updated = reports.filter((r) => r.id !== id);
    setReports(updated);
    saveReports(updated);
    showToast('Рапорт удален');
  };

  // RP Binds Handlers
  const handleAddBind = (newBind: RPBinderEntry) => {
    const updated = [newBind, ...binds];
    setBinds(updated);
    saveRPBinds(updated);
  };

  const handleDeleteBind = (id: string) => {
    const updated = binds.filter((b) => b.id !== id);
    setBinds(updated);
    saveRPBinds(updated);
    showToast('RP-бинд удален');
  };

  // Import / Export
  const handleExportData = () => {
    const jsonStr = exportFullBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SK_RF_EIS_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    showToast('Резервная копия базы данных ЕИС СК РФ успешно выгружена!');
  };

  const handleImportData = (jsonData: string) => {
    const success = importFullBackup(jsonData);
    if (success) {
      setOfficer(getOfficerProfile());
      setOffenders(getOffenders());
      setCases(getCriminalCases());
      setArticles(getLawArticles());
      setReports(getReports());
      setDocuments(getDocuments());
      setBinds(getRPBinds());
      setDepartments(getDepartments());
      setAccounts(getAccounts());
      setOrders(getOrders());
      showToast('База данных ЕИС СК РФ успешно восстановлена!');
    } else {
      showToast('Ошибка при чтении файла резервной копии!');
    }
  };

  const handleResetData = () => {
    resetToInitialSeedData();
    setOfficer(getOfficerProfile());
    setOffenders(getOffenders());
    setCases(getCriminalCases());
    setArticles(getLawArticles());
    setReports(getReports());
    setDocuments(getDocuments());
    setBinds(getRPBinds());
    setDepartments(getDepartments());
    setAccounts(getAccounts());
    setOrders(getOrders());
    showToast('База данных синхронизирована к эталонному состоянию');
  };

  // Counters for badges and operational header
  const activeCasesCount = cases.filter((c) => c.status === 'in_progress' || c.status === 'inquest').length;
  const wantedCount = offenders.filter((o) => o.status === 'wanted').length;

  // Clearance and Access check
  const isProtectedTab = activeTab !== 'home' && activeTab !== 'lawbook';
  const isCitizenBlocked = !isAuthenticated && isProtectedTab;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans selection:bg-[#85181b] selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-white border-2 border-[#85181b] text-[#85181b] px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-[#85181b] flex-shrink-0" />
          <span className="text-xs sm:text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Main Header (displayed in operational workspaces) */}
      {activeTab !== 'home' && (
        <Header
          officer={officer}
          userRole={userRole}
          isAuthenticated={isAuthenticated}
          onUpdateOfficer={handleUpdateOfficer}
          onOpenSearch={() => setIsSearchModalOpen(true)}
          onOpenDataModal={() => setIsDataModalOpen(true)}
          onOpenChangePassword={() => setIsChangePasswordModalOpen(true)}
          onNavigateHome={() => {
            setActiveTab('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onLogout={handleLogout}
          activeWantedCount={wantedCount}
          activeCasesCount={activeCasesCount}
        />
      )}

      {/* Workspace Area: Sidebar + Main Views */}
      <div className="flex-1 flex flex-col md:flex-row w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6 gap-4 sm:gap-6">
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          userRole={userRole}
          officerRank={officer.rank}
          isAuthenticated={isAuthenticated}
          onTabChange={handleNavigateTab}
          wantedCount={wantedCount}
          activeCasesCount={activeCasesCount}
          reportsCount={reports.length}
        />

        {/* Content Container */}
        <main className="flex-1 min-w-0 pb-12">
          {/* Guest/Citizen Access Guard for Protected Internal Modules */}
          {isCitizenBlocked ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 text-center text-slate-900 shadow-xl space-y-6 max-w-2xl mx-auto my-8 animate-in fade-in">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-[#85181b]">
                <Lock className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <span className="px-3 py-1 rounded-full bg-red-50 border border-red-200 text-[#85181b] font-mono text-xs font-bold uppercase">
                  Требуется служебный доступ
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  Закрытый служебный модуль СК РФ
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
                  Материалы уголовных дел, базы досье и процессуальные бланки доступны исключительно действующим сотрудникам ведомства после ввода логина и пароля.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => handleNavigateTab('home')}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#85181b] hover:bg-[#6b1316] text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>Перейти на главную для авторизации</span>
                </button>
                <button
                  onClick={() => handleNavigateTab('home')}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs border border-slate-300 transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <HomeIcon className="w-4 h-4" />
                  <span>Общественная приёмная для граждан</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {activeTab === 'home' && (
                <HomeView
                  officer={officer}
                  accounts={accounts}
                  departments={departments}
                  userRole={userRole}
                  isAuthenticated={isAuthenticated}
                  onUpdateOfficer={handleUpdateOfficer}
                  onSwitchOfficer={handleSwitchOfficer}
                  onLogin={(targetTab = 'dashboard') => {
                    handleNavigateTab(targetTab);
                  }}
                  offenders={offenders}
                  cases={cases}
                  onShowToast={showToast}
                />
              )}

              {activeTab === 'admin' && (
                <ChairmanAdminView
                  departments={departments}
                  accounts={accounts}
                  orders={orders}
                  cases={cases}
                  serviceRoles={serviceRoles}
                  reports={reports}
                  currentOfficer={officer}
                  onUpdateDepartments={handleUpdateDepartments}
                  onUpdateAccounts={handleUpdateAccounts}
                  onUpdateOrders={handleUpdateOrders}
                  onUpdateServiceRoles={handleUpdateServiceRoles}
                  onUpdateReport={handleUpdateReport}
                  onSwitchOfficer={handleSwitchOfficer}
                  onNavigate={handleNavigateTab}
                  onShowToast={showToast}
                />
              )}

              {activeTab === 'dashboard' && (
                <DashboardView
                  officer={officer}
                  offenders={offenders}
                  cases={cases}
                  reports={reports}
                  onNavigate={handleNavigateTab}
                  onSelectCase={(caseItem) => {
                    setSelectedCaseId(caseItem.id);
                    handleNavigateTab('cases');
                  }}
                  onSelectOffender={(offender) => {
                    setSelectedOffenderId(offender.id);
                    handleNavigateTab('offenders');
                  }}
                  onQuickNewCase={() => {
                    handleNavigateTab('cases');
                  }}
                  onQuickNewOffender={() => {
                    handleNavigateTab('offenders');
                  }}
                  onQuickNewDoc={() => {
                    handleNavigateTab('documents');
                  }}
                  onQuickNewReport={() => {
                    handleNavigateTab('reports');
                  }}
                />
              )}

              {activeTab === 'offenders' && (
                <OffendersDatabaseView
                  offenders={offenders}
                  articles={articles}
                  onAddOffender={handleAddOffender}
                  onUpdateOffender={handleUpdateOffender}
                  onDeleteOffender={handleDeleteOffender}
                  selectedOffenderId={selectedOffenderId}
                  onShowToast={showToast}
                />
              )}

              {activeTab === 'cases' && (
                <CriminalCasesView
                  cases={cases}
                  offenders={offenders}
                  articles={articles}
                  officerName={officer.fullName}
                  officerRank={officer.rank}
                  onAddCase={handleAddCase}
                  onUpdateCase={handleUpdateCase}
                  onDeleteCase={handleDeleteCase}
                  selectedCaseId={selectedCaseId}
                  onShowToast={showToast}
                />
              )}

              {activeTab === 'documents' && (
                <DocumentGeneratorView
                  documents={documents}
                  officer={officer}
                  cases={cases}
                  offenders={offenders}
                  onSaveDocument={handleSaveDocument}
                  onDeleteDocument={handleDeleteDocument}
                  onShowToast={showToast}
                />
              )}

              {activeTab === 'reports' && (
                <ReportsView
                  reports={reports}
                  officer={officer}
                  cases={cases}
                  accounts={accounts}
                  userRole={userRole}
                  isAdmin={userRole === 'admin' || officer.fullName.includes('Чернов') || officer.rank === 'Генерал юстиции РФ'}
                  onAddReport={handleAddReport}
                  onUpdateReport={handleUpdateReport}
                  onDeleteReport={handleDeleteReport}
                  onUpdateAccounts={handleUpdateAccounts}
                  onShowToast={showToast}
                />
              )}

              {activeTab === 'lawbook' && (
                <LawbookView articles={articles} onShowToast={showToast} />
              )}

              {activeTab === 'badge' && (
                <OfficerBadgeView
                  officer={officer}
                  userRole={userRole}
                  isAdmin={userRole === 'admin'}
                  accounts={accounts}
                  departments={departments}
                  onUpdateOfficer={handleUpdateOfficer}
                  onUpdateAccounts={handleUpdateAccounts}
                  onSwitchOfficer={handleSwitchOfficer}
                  onShowToast={showToast}
                />
              )}

              {activeTab === 'junior_exam' && (
                <JuniorExamView
                  officer={officer}
                  accounts={accounts}
                  orders={orders}
                  userRole={userRole}
                  onPromoteToLieutenant={() => {
                    const updated = {
                      ...officer,
                      rank: 'Лейтенант юстиции' as const,
                      awards: [...officer.awards, 'Квалификационный аттестат СК РФ (с отличием)']
                    };
                    handleUpdateOfficer(updated);
                  }}
                  onUpdateOfficer={handleUpdateOfficer}
                  onUpdateAccounts={handleUpdateAccounts}
                  onUpdateOrders={handleUpdateOrders}
                  onShowToast={showToast}
                />
              )}

              {activeTab === 'binder' && (
                <RPBinderView
                  binds={binds}
                  officer={officer}
                  onAddBind={handleAddBind}
                  onDeleteBind={handleDeleteBind}
                  onShowToast={showToast}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Global Universal Search Modal */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        offenders={offenders}
        cases={cases}
        articles={articles}
        documents={documents}
        reports={reports}
        binds={binds}
        onNavigate={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onSelectOffender={(off) => {
          setSelectedOffenderId(off.id);
          setActiveTab('offenders');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onSelectCase={(c) => {
          setSelectedCaseId(c.id);
          setActiveTab('cases');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Database Backup / Import / Reset Modal */}
      <DataManagementModal
        isOpen={isDataModalOpen}
        onClose={() => setIsDataModalOpen(false)}
        onExport={handleExportData}
        onImport={handleImportData}
        onReset={handleResetData}
        offendersCount={offenders.length}
        casesCount={cases.length}
        reportsCount={reports.length}
        documentsCount={documents.length}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
        currentOfficer={officer}
        accounts={accounts}
        onUpdateAccounts={handleUpdateAccounts}
        onShowToast={showToast}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 text-center text-slate-600 text-xs font-mono no-print">
        Единая информационная система Следственного комитета Российской Федерации (ЕИС СК РФ) •
        Конфиденциально • Для служебного пользования
      </footer>
    </div>
  );
}

export default App;
