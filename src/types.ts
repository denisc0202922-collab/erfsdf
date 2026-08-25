export type RankType =
  | 'Младший лейтенант юстиции'
  | 'Лейтенант юстиции'
  | 'Старший лейтенант юстиции'
  | 'Капитан юстиции'
  | 'Майор юстиции'
  | 'Подполковник юстиции'
  | 'Полковник юстиции'
  | 'Генерал-майор юстиции'
  | 'Генерал-лейтенант юстиции'
  | 'Генерал-полковник юстиции'
  | 'Генерал юстиции РФ';

export type DepartmentType =
  | 'Главное следственное управление (ГСУ)'
  | 'Отдел по расследованию особо важных дел (ОРОВД)'
  | 'Следственный отдел по Центральному округу'
  | 'Следственный отдел по Северному округу'
  | 'Отдел криминалистики (Криминалистический центр)'
  | 'Управление собственной безопасности (УСБ СК РФ)'
  | 'Военное следственное управление (ВСУ СК РФ)'
  | string;

export interface DepartmentItem {
  id: string;
  name: string;
  shortName: string;
  code: string;
  headName: string;
  headRank: string;
  address: string;
  phone: string;
  staffCount: number;
  jurisdiction: string;
  status: 'active' | 'reorganizing' | 'archived';
  badgeColor?: string;
  createdAt: string;
}

export interface CitizenAppeal {
  id: string;
  regNumber: string;
  fullName: string;
  phone: string;
  email?: string;
  address?: string;
  topic: 'crime_report' | 'corruption' | 'procedural_complaint' | 'chairman_appeal' | 'general';
  topicLabel: string;
  content: string;
  status: 'registered' | 'in_review' | 'assigned' | 'resolved';
  submittedAt: string;
}

export type UserRoleType = 'guest' | 'investigator' | 'forensic' | 'head' | 'operative' | 'admin';

export interface ServiceRoleItem {
  id: string;
  title: string;
  accessRole: 'admin' | 'head' | 'investigator' | 'forensic' | 'operative';
  badgeColor?: 'red' | 'blue' | 'purple' | 'amber' | 'emerald' | 'cyan' | 'slate';
  description?: string;
  isSystem?: boolean;
}

export interface UserAccount {
  id: string;
  username: string;
  password: string;
  fullName: string;
  rank: RankType;
  position: string;
  serviceRoleTitle?: string;
  departmentId: string;
  departmentName: string;
  badgeNumber: string;
  serviceId: string;
  callsign: string;
  role: 'admin' | 'investigator' | 'forensic' | 'head' | 'operative';
  clearanceLevel: 'Секретно' | 'Совершенно секретно' | 'Особой важности';
  status: 'active' | 'suspended' | 'dismissed';
  photoUrl: string;
  weaponType?: string;
  weaponSerial?: string;
  phone?: string;
  createdAt: string;
  lastLogin?: string;
  notes?: string;
}

export interface ChairmanOrder {
  id: string;
  orderNumber: string;
  date: string;
  type: 'appointment' | 'rank_promotion' | 'award' | 'disciplinary' | 'department_creation' | 'general';
  title: string;
  targetOfficerName?: string;
  targetDepartment?: string;
  content: string;
  issuedBy: string;
  seal: boolean;
  status: 'active' | 'revoked';
}

export interface OfficerProfile {
  fullName: string;
  rank: RankType;
  position: string;
  department: DepartmentType;
  badgeNumber: string;
  serviceId: string;
  photoUrl: string;
  callsign: string;
  issueDate: string;
  expiryDate: string;
  weaponType: string;
  weaponSerial: string;
  onDuty: boolean;
  clearanceLevel: 'Секретно' | 'Совершенно секретно' | 'Особой важности';
  awards: string[];
  disciplinaryActions: string[];
}

export type OffenderStatus =
  | 'wanted'        // В федеральном розыске
  | 'detained'      // Задержан
  | 'arrested'      // Заключен под стражу (СИЗО)
  | 'sentenced'     // Осужден
  | 'on_probation'  // Подписка о невыезде
  | 'cleared'       // Оправдан / Дело прекращено
  | 'witness';      // Свидетель / Лицо представляющее интерес

export interface Offender {
  id: string;
  fullName: string;
  alias?: string;
  gender: 'Мужской' | 'Женский';
  birthDate: string;
  passportNumber: string;
  phone?: string;
  status: OffenderStatus;
  wantedLevel: number; // 1 to 6
  wantedReason?: string;
  faction?: string;
  photoUrl: string;
  articles: string[]; // List of article codes e.g. ["105 ч.2", "222 ч.1"]
  fingerprintsScanned: boolean;
  dnaScanned: boolean;
  address?: string;
  vehicle?: string;
  vehiclePlate?: string;
  distinctiveMarks: string; // Особые приметы (татуировки, шрамы)
  dangerLevel: 'Низкий' | 'Средний' | 'Высокий' | 'Особо опасен';
  notes: string;
  arrestCount: number;
  addedAt: string;
  updatedAt: string;
}

export type CaseStatus =
  | 'in_progress'          // В производстве
  | 'inquest'              // Доследственная проверка
  | 'suspended'            // Приостановлено
  | 'transferred_prosecutor' // Передано в прокуратуру
  | 'transferred_court'    // Передано в суд
  | 'closed';              // Закрыто

export interface Evidence {
  id: string;
  type: 'ballistics' | 'fingerprints' | 'dna' | 'video' | 'photo' | 'audio' | 'document' | 'weapon' | 'narcotics' | 'other';
  title: string;
  description: string;
  storageLocation: string; // Номер ячейки вещдоков
  collectedAt: string;
  collectedBy: string;
  imageUrl?: string;
  status: 'collected' | 'under_examination' | 'examined' | 'court_evidence' | 'destroyed';
}

export interface InterrogationRecord {
  id: string;
  personName: string;
  role: 'Подозреваемый' | 'Обвиняемый' | 'Свидетель' | 'Потерпевший' | 'Эксперт';
  date: string;
  interrogator: string;
  audioVideoRecorded: boolean;
  advocatePresent: boolean;
  advocateName?: string;
  summary: string;
  transcript: string;
}

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  officer: string;
}

export interface CriminalCase {
  id: string;
  caseNumber: string; // e.g. № 2026/08-14-УД
  title: string;
  articles: string[];
  status: CaseStatus;
  priority: 'Обычный' | 'Повышенный' | 'Особый контроль';
  leadInvestigator: string;
  investigationTeam: string[];
  department: string;
  openedDate: string;
  closedDate?: string;
  incidentDate: string;
  incidentLocation: string;
  summary: string; // Фабула дела
  suspects: string[]; // Names or IDs
  victims: string[];
  witnesses: string[];
  evidences: Evidence[];
  interrogations: InterrogationRecord[];
  timeline: TimelineEvent[];
  courtOutcome?: string;
}

export interface LawArticle {
  id: string;
  code: string; // e.g. "105 ч.1"
  chapter: string;
  title: string;
  description: string;
  category: 'life_health' | 'property' | 'public_safety' | 'state_power' | 'military' | 'traffic' | 'drugs_weapons';
  termYears: number; // Срок лишения свободы (лет)
  wantedLevel: number; // 1-6 звезд
  fine: number; // Рубли / RP валюта
  bailAllowed: boolean;
  punishmentNotes: string;
}

export type ReportType =
  | 'daily_shift'       // Ежедневный отчет о дежурстве
  | 'weekly_activity'   // Еженедельный отчет следователя
  | 'promotion'         // Рапорт на повышение в звании
  | 'leave'             // Рапорт на предоставление отпуска
  | 'case_closure'      // Рапорт о завершении расследования
  | 'special_operation' // Рапорт о проведенном ОРМ / рейде
  | 'award_request'     // Ходатайство о награждении
  | 'junior_internship'; // Рапорт о мл. лейтенанте (помощнике следователя / стажере)

export interface ReportRecord {
  id: string;
  reportNumber: string;
  type: ReportType;
  title: string;
  authorName: string;
  authorRank: string;
  targetLeader: string; // Кому: Руководителю ГСУ СК РФ...
  date: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  summary: string;
  actionsPerformed: string[]; // Список выполненных пунктов
  attachedCases: string[];
  attachedEvidenceCount: number;
  interrogationsCount: number;
  arrestsCount: number;
  pointsCalculated: number;
  reviewerComment?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  juniorOfficerName?: string; // ФИО младшего лейтенанта / помощника следователя
  juniorOfficerBadge?: string; // Номер жетона стажера
  internshipRecommendation?: 'promote_lieutenant' | 'continue_training' | 'excellent';
}

export type DocumentType =
  | 'case_opening'        // Постановление о возбуждении уголовного дела
  | 'search_warrant'      // Ордер / Постановление на обыск и выемку
  | 'arrest_warrant'      // Постановление о заключении под стражу / задержании
  | 'interrogation_form'  // Протокол допроса
  | 'crime_scene_form'    // Протокол осмотра места происшествия (ОМП)
  | 'charge_indictment'   // Постановление о привлечении в качестве обвиняемого
  | 'forensic_assignment' // Постановление о назначении экспертизы
  | 'case_closure_doc'    // Постановление о прекращении / передаче в суд
  | 'investigative_order' // Следственное поручение оперативным службам
  | 'wanted_announcement';// Ориентировка на розыск

export interface ProceduralDocument {
  id: string;
  docType: DocumentType;
  docNumber: string;
  date: string;
  city: string;
  investigatorName: string;
  investigatorRank: string;
  investigatorPosition: string;
  caseNumber?: string;
  suspectName?: string;
  suspectBirth?: string;
  suspectAddress?: string;
  articles?: string[];
  targetLocation?: string; // Для обыска / ОМП
  crimeDetails: string;    // Фабула / Описание
  decisionText: string;    // Постановил: ...
  sealType: 'gsu' | 'so_msk' | 'crim' | 'usb';
  isSecret: boolean;
  createdAt: string;
}

export type ActiveTabType =
  | 'home'
  | 'dashboard'
  | 'offenders'
  | 'cases'
  | 'documents'
  | 'reports'
  | 'lawbook'
  | 'binder'
  | 'badge'
  | 'admin'
  | 'junior_exam';

export interface RPBinderEntry {
  id: string;
  category: 'arrest' | 'search' | 'interrogation' | 'patrol' | 'radio' | 'weapons' | 'documents' | 'forensic' | 'general';
  title: string;
  hotkey?: string;
  description?: string;
  lines: string[];
}

export interface RPBind {
  id: string;
  category: 'general' | 'arrest' | 'search' | 'interrogation' | 'forensic' | 'documents' | 'radio' | 'patrol' | 'weapons';
  title: string;
  hotkey?: string;
  description?: string;
  lines: string[];
}
