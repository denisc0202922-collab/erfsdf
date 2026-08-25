import {
  OfficerProfile,
  Offender,
  CriminalCase,
  LawArticle,
  ReportRecord,
  ProceduralDocument,
  RPBinderEntry,
  RPBind,
  DepartmentItem,
  UserAccount,
  ChairmanOrder
} from '../types';
import {
  INITIAL_OFFICER,
  INITIAL_OFFENDERS,
  INITIAL_CASES,
  INITIAL_ARTICLES,
  INITIAL_REPORTS,
  INITIAL_DOCUMENTS,
  INITIAL_BINDS,
  INITIAL_DEPARTMENTS,
  INITIAL_ACCOUNTS,
  INITIAL_ORDERS
} from '../data/initialData';

const KEYS = {
  OFFICER: 'sk_rf_officer_profile_v1',
  OFFENDERS: 'sk_rf_offenders_db_v1',
  CASES: 'sk_rf_cases_db_v1',
  ARTICLES: 'sk_rf_articles_db_v1',
  REPORTS: 'sk_rf_reports_db_v1',
  DOCUMENTS: 'sk_rf_documents_db_v1',
  BINDS: 'sk_rf_binds_db_v1',
  DEPARTMENTS: 'sk_rf_departments_db_v1',
  ACCOUNTS: 'sk_rf_accounts_db_v1',
  ORDERS: 'sk_rf_orders_db_v1',
  CLEARED_FLAG: 'sk_rf_cleared_empty_v1'
};

// Immediate synchronization: ensure offenders, criminal cases, and reports are wiped as requested
try {
  if (typeof window !== 'undefined' && localStorage.getItem(KEYS.CLEARED_FLAG) !== 'true') {
    localStorage.setItem(KEYS.OFFENDERS, JSON.stringify([]));
    localStorage.setItem(KEYS.CASES, JSON.stringify([]));
    localStorage.setItem(KEYS.REPORTS, JSON.stringify([]));
    localStorage.setItem(KEYS.CLEARED_FLAG, 'true');
  }
} catch {
  // Ignore storage access errors in restricted sandbox
}

// Direct entity getters and setters
export function getOfficerProfile(): OfficerProfile {
  try {
    const raw = localStorage.getItem(KEYS.OFFICER);
    return raw ? JSON.parse(raw) : INITIAL_OFFICER;
  } catch {
    return INITIAL_OFFICER;
  }
}

export function saveOfficerProfile(officer: OfficerProfile) {
  try {
    localStorage.setItem(KEYS.OFFICER, JSON.stringify(officer));
  } catch (err) {
    console.error('Failed to save officer profile:', err);
  }
}

export function getDepartments(): DepartmentItem[] {
  try {
    const raw = localStorage.getItem(KEYS.DEPARTMENTS);
    return raw ? JSON.parse(raw) : INITIAL_DEPARTMENTS;
  } catch {
    return INITIAL_DEPARTMENTS;
  }
}

export function saveDepartments(departments: DepartmentItem[]) {
  try {
    localStorage.setItem(KEYS.DEPARTMENTS, JSON.stringify(departments));
  } catch (err) {
    console.error('Failed to save departments:', err);
  }
}

export function getAccounts(): UserAccount[] {
  try {
    const raw = localStorage.getItem(KEYS.ACCOUNTS);
    return raw ? JSON.parse(raw) : INITIAL_ACCOUNTS;
  } catch {
    return INITIAL_ACCOUNTS;
  }
}

export function saveAccounts(accounts: UserAccount[]) {
  try {
    localStorage.setItem(KEYS.ACCOUNTS, JSON.stringify(accounts));
  } catch (err) {
    console.error('Failed to save accounts:', err);
  }
}

export function getOrders(): ChairmanOrder[] {
  try {
    const raw = localStorage.getItem(KEYS.ORDERS);
    return raw ? JSON.parse(raw) : INITIAL_ORDERS;
  } catch {
    return INITIAL_ORDERS;
  }
}

export function saveOrders(orders: ChairmanOrder[]) {
  try {
    localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));
  } catch (err) {
    console.error('Failed to save orders:', err);
  }
}

export function getOffenders(): Offender[] {
  try {
    const raw = localStorage.getItem(KEYS.OFFENDERS);
    return raw ? JSON.parse(raw) : INITIAL_OFFENDERS;
  } catch {
    return INITIAL_OFFENDERS;
  }
}

export function saveOffenders(offenders: Offender[]) {
  try {
    localStorage.setItem(KEYS.OFFENDERS, JSON.stringify(offenders));
  } catch (err) {
    console.error('Failed to save offenders:', err);
  }
}

export function getCriminalCases(): CriminalCase[] {
  try {
    const raw = localStorage.getItem(KEYS.CASES);
    return raw ? JSON.parse(raw) : INITIAL_CASES;
  } catch {
    return INITIAL_CASES;
  }
}

export function saveCriminalCases(cases: CriminalCase[]) {
  try {
    localStorage.setItem(KEYS.CASES, JSON.stringify(cases));
  } catch (err) {
    console.error('Failed to save cases:', err);
  }
}

export function getLawArticles(): LawArticle[] {
  try {
    const raw = localStorage.getItem(KEYS.ARTICLES);
    return raw ? JSON.parse(raw) : INITIAL_ARTICLES;
  } catch {
    return INITIAL_ARTICLES;
  }
}

export function saveLawArticles(articles: LawArticle[]) {
  try {
    localStorage.setItem(KEYS.ARTICLES, JSON.stringify(articles));
  } catch (err) {
    console.error('Failed to save articles:', err);
  }
}

export function getReports(): ReportRecord[] {
  try {
    const raw = localStorage.getItem(KEYS.REPORTS);
    return raw ? JSON.parse(raw) : INITIAL_REPORTS;
  } catch {
    return INITIAL_REPORTS;
  }
}

export function saveReports(reports: ReportRecord[]) {
  try {
    localStorage.setItem(KEYS.REPORTS, JSON.stringify(reports));
  } catch (err) {
    console.error('Failed to save reports:', err);
  }
}

export function getDocuments(): ProceduralDocument[] {
  try {
    const raw = localStorage.getItem(KEYS.DOCUMENTS);
    return raw ? JSON.parse(raw) : INITIAL_DOCUMENTS;
  } catch {
    return INITIAL_DOCUMENTS;
  }
}

export function saveDocuments(documents: ProceduralDocument[]) {
  try {
    localStorage.setItem(KEYS.DOCUMENTS, JSON.stringify(documents));
  } catch (err) {
    console.error('Failed to save documents:', err);
  }
}

export function getRPBinds(): RPBinderEntry[] {
  try {
    const raw = localStorage.getItem(KEYS.BINDS);
    return raw ? JSON.parse(raw) : (INITIAL_BINDS as RPBinderEntry[]);
  } catch {
    return INITIAL_BINDS as RPBinderEntry[];
  }
}

export function saveRPBinds(binds: RPBinderEntry[]) {
  try {
    localStorage.setItem(KEYS.BINDS, JSON.stringify(binds));
  } catch (err) {
    console.error('Failed to save binds:', err);
  }
}

// Backup & Restore
export function exportFullBackup(): string {
  const data = {
    system: 'ЕИС Следственный Комитет РФ (RP Portal)',
    version: '3.0.0',
    exportDate: new Date().toISOString(),
    officer: getOfficerProfile(),
    offenders: getOffenders(),
    cases: getCriminalCases(),
    articles: getLawArticles(),
    reports: getReports(),
    documents: getDocuments(),
    binds: getRPBinds(),
    departments: getDepartments(),
    accounts: getAccounts(),
    orders: getOrders()
  };
  return JSON.stringify(data, null, 2);
}

export function importFullBackup(jsonString: string): boolean {
  try {
    const parsed = JSON.parse(jsonString);
    if (parsed.officer) saveOfficerProfile(parsed.officer);
    if (parsed.offenders) saveOffenders(parsed.offenders);
    if (parsed.cases) saveCriminalCases(parsed.cases);
    if (parsed.articles) saveLawArticles(parsed.articles);
    if (parsed.reports) saveReports(parsed.reports);
    if (parsed.documents) saveDocuments(parsed.documents);
    if (parsed.binds) saveRPBinds(parsed.binds);
    if (parsed.departments) saveDepartments(parsed.departments);
    if (parsed.accounts) saveAccounts(parsed.accounts);
    if (parsed.orders) saveOrders(parsed.orders);
    return true;
  } catch (err) {
    console.error('Error importing backup:', err);
    return false;
  }
}

export function clearOffenders() {
  saveOffenders([]);
}

export function clearCriminalCases() {
  saveCriminalCases([]);
}

export function clearReports() {
  saveReports([]);
}

export function resetToInitialSeedData() {
  localStorage.removeItem(KEYS.OFFICER);
  localStorage.removeItem(KEYS.OFFENDERS);
  localStorage.removeItem(KEYS.CASES);
  localStorage.removeItem(KEYS.ARTICLES);
  localStorage.removeItem(KEYS.REPORTS);
  localStorage.removeItem(KEYS.DOCUMENTS);
  localStorage.removeItem(KEYS.BINDS);
  localStorage.removeItem(KEYS.DEPARTMENTS);
  localStorage.removeItem(KEYS.ACCOUNTS);
  localStorage.removeItem(KEYS.ORDERS);
}

// Legacy aliases
export const loadStoredData = () => ({
  officer: getOfficerProfile(),
  offenders: getOffenders(),
  cases: getCriminalCases(),
  articles: getLawArticles(),
  reports: getReports(),
  documents: getDocuments(),
  binds: getRPBinds(),
  departments: getDepartments(),
  accounts: getAccounts(),
  orders: getOrders()
});

export const exportDatabaseBackup = exportFullBackup;
export const importDatabaseBackup = importFullBackup;
export const resetDatabaseToDefaults = resetToInitialSeedData;
