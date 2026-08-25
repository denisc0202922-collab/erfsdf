import {
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
  ServiceRoleItem
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
  INITIAL_ORDERS,
  INITIAL_SERVICE_ROLES
} from '../data/initialData';
import { getExamSubmissions, saveExamSubmissions, ExamSubmission } from '../data/examQuestions';

export const KEYS = {
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
  SERVICE_ROLES: 'sk_rf_service_roles_db_v1',
  EXAM_SUBMISSIONS: 'sk_rf_exam_submissions_v1',
  CLEARED_FLAG: 'sk_rf_cleared_empty_v1',
  LAST_SYNC: 'sk_rf_last_db_sync_time'
};

// Immediate synchronization
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

// Debounce timer for background server database sync
let syncDebounceTimer: any = null;

export function queueDatabaseSync() {
  if (typeof window === 'undefined') return;
  if (syncDebounceTimer) clearTimeout(syncDebounceTimer);
  syncDebounceTimer = setTimeout(() => {
    syncDatabaseToServer();
  }, 500);
}

// Send current state to Server database.json
export async function syncDatabaseToServer(overrideData?: any) {
  if (typeof window === 'undefined') return;
  try {
    const payload = overrideData || {
      officer: getOfficerProfile(),
      offenders: getOffenders(),
      cases: getCriminalCases(),
      articles: getLawArticles(),
      reports: getReports(),
      documents: getDocuments(),
      binds: getRPBinds(),
      departments: getDepartments(),
      accounts: getAccounts(),
      orders: getOrders(),
      serviceRoles: getServiceRoles(),
      examSubmissions: getExamSubmissions()
    };

    const res = await fetch('/api/db/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      localStorage.setItem(KEYS.LAST_SYNC, new Date().toISOString());
    }
  } catch (err) {
    // Server is unreachable or running in static mode
  }
}

// Fetch whole database from Server database.json
export async function fetchDatabaseFromServer() {
  if (typeof window === 'undefined') return null;
  try {
    const res = await fetch('/api/db');
    if (!res.ok) return null;
    const json = await res.json();
    if (json && json.data) {
      const d = json.data;
      if (d.officer) localStorage.setItem(KEYS.OFFICER, JSON.stringify(d.officer));
      if (d.offenders) localStorage.setItem(KEYS.OFFENDERS, JSON.stringify(d.offenders));
      if (d.cases) localStorage.setItem(KEYS.CASES, JSON.stringify(d.cases));
      if (d.articles) localStorage.setItem(KEYS.ARTICLES, JSON.stringify(d.articles));
      if (d.reports) localStorage.setItem(KEYS.REPORTS, JSON.stringify(d.reports));
      if (d.documents) localStorage.setItem(KEYS.DOCUMENTS, JSON.stringify(d.documents));
      if (d.binds) localStorage.setItem(KEYS.BINDS, JSON.stringify(d.binds));
      if (d.departments) localStorage.setItem(KEYS.DEPARTMENTS, JSON.stringify(d.departments));
      if (d.accounts) localStorage.setItem(KEYS.ACCOUNTS, JSON.stringify(d.accounts));
      if (d.orders) localStorage.setItem(KEYS.ORDERS, JSON.stringify(d.orders));
      if (d.serviceRoles) localStorage.setItem(KEYS.SERVICE_ROLES, JSON.stringify(d.serviceRoles));
      if (d.examSubmissions) localStorage.setItem(KEYS.EXAM_SUBMISSIONS, JSON.stringify(d.examSubmissions));
      localStorage.setItem(KEYS.LAST_SYNC, new Date().toISOString());
      return d;
    }
  } catch (err) {
    // API not reached, using local data
  }
  return null;
}

// Reset Server Database
export async function resetServerDatabase() {
  try {
    await fetch('/api/db/reset', { method: 'POST' });
  } catch {
    // Ignore error
  }
  resetToInitialSeedData();
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
    queueDatabaseSync();
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
    queueDatabaseSync();
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
    queueDatabaseSync();
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
    queueDatabaseSync();
  } catch (err) {
    console.error('Failed to save orders:', err);
  }
}

export function getServiceRoles(): ServiceRoleItem[] {
  try {
    const raw = localStorage.getItem(KEYS.SERVICE_ROLES);
    return raw ? JSON.parse(raw) : INITIAL_SERVICE_ROLES;
  } catch {
    return INITIAL_SERVICE_ROLES;
  }
}

export function saveServiceRoles(roles: ServiceRoleItem[]) {
  try {
    localStorage.setItem(KEYS.SERVICE_ROLES, JSON.stringify(roles));
    queueDatabaseSync();
  } catch (err) {
    console.error('Failed to save service roles:', err);
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
    queueDatabaseSync();
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
    queueDatabaseSync();
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
    queueDatabaseSync();
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
    queueDatabaseSync();
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
    queueDatabaseSync();
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
    queueDatabaseSync();
  } catch (err) {
    console.error('Failed to save binds:', err);
  }
}

// Backup & Restore
export function exportFullBackup(): string {
  const data = {
    system: 'ЕИС Следственный Комитет РФ (RP Portal)',
    version: '3.5.0',
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
    orders: getOrders(),
    serviceRoles: getServiceRoles(),
    examSubmissions: getExamSubmissions()
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
    if (parsed.serviceRoles) saveServiceRoles(parsed.serviceRoles);
    if (parsed.examSubmissions) saveExamSubmissions(parsed.examSubmissions);
    queueDatabaseSync();
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
  localStorage.removeItem(KEYS.SERVICE_ROLES);
  localStorage.removeItem(KEYS.EXAM_SUBMISSIONS);
  queueDatabaseSync();
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
