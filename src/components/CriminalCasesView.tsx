import React, { useState } from 'react';
import {
  CriminalCase,
  Evidence,
  InterrogationRecord,
  TimelineEvent,
  CaseStatus,
  Offender,
  LawArticle
} from '../types';
import {
  Briefcase,
  PlusCircle,
  Search,
  Filter,
  FileText,
  ShieldAlert,
  Clock,
  MapPin,
  Users,
  Eye,
  CheckCircle2,
  FolderOpen,
  Plus,
  Trash2,
  Edit,
  X,
  ChevronRight,
  Fingerprint,
  Mic,
  Video,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';

interface CriminalCasesViewProps {
  cases: CriminalCase[];
  offenders: Offender[];
  articles: LawArticle[];
  officerName: string;
  officerRank: string;
  onAddCase: (newCase: CriminalCase) => void;
  onUpdateCase: (updatedCase: CriminalCase) => void;
  onDeleteCase: (caseId: string) => void;
  selectedCaseId?: string | null;
  onShowToast: (msg: string) => void;
}

export const CriminalCasesView: React.FC<CriminalCasesViewProps> = ({
  cases,
  offenders,
  articles,
  officerName,
  officerRank,
  onAddCase,
  onUpdateCase,
  onDeleteCase,
  selectedCaseId,
  onShowToast
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const [activeCase, setActiveCase] = useState<CriminalCase | null>(() => {
    if (selectedCaseId) {
      return cases.find((c) => c.id === selectedCaseId) || null;
    }
    return cases[0] || null;
  });

  React.useEffect(() => {
    if (selectedCaseId) {
      const found = cases.find((c) => c.id === selectedCaseId);
      if (found) {
        setActiveCase(found);
      }
    } else if (!activeCase && cases.length > 0) {
      setActiveCase(cases[0]);
    }
  }, [selectedCaseId, cases]);

  const [activeTab, setActiveTab] = useState<'summary' | 'evidence' | 'interrogations' | 'timeline'>('summary');

  // Modals
  const [isNewCaseModalOpen, setIsNewCaseModalOpen] = useState(false);
  const [isNewEvidenceModalOpen, setIsNewEvidenceModalOpen] = useState(false);
  const [isNewInterrogationModalOpen, setIsNewInterrogationModalOpen] = useState(false);
  const [isNewTimelineModalOpen, setIsNewTimelineModalOpen] = useState(false);

  // New Case form state
  const [newCaseData, setNewCaseData] = useState<Partial<CriminalCase>>({
    title: '',
    articles: ['105 ч.1'],
    priority: 'Обычный',
    status: 'in_progress',
    incidentLocation: 'г. Москва, ул. ',
    incidentDate: new Date().toLocaleDateString('ru-RU') + ' 12:00',
    summary: '',
    suspects: [],
    victims: [],
    witnesses: []
  });

  // Filter cases
  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      c.caseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.suspects.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
      c.leadInvestigator.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || c.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleOpenNewCaseModal = () => {
    const nextNum = cases.length + 1;
    const padNum = String(nextNum).padStart(3, '0');
    const caseNum = `№ 2026/08-${padNum}-УД`;

    setNewCaseData({
      id: `case-${Date.now()}`,
      caseNumber: caseNum,
      title: '',
      articles: ['105 ч.1'],
      priority: 'Обычный',
      status: 'in_progress',
      leadInvestigator: `${officerRank} ${officerName}`,
      investigationTeam: [],
      department: 'Отдел по расследованию особо важных дел (ОРОВД)',
      openedDate: new Date().toLocaleDateString('ru-RU'),
      incidentDate: new Date().toLocaleDateString('ru-RU') + ' 12:00',
      incidentLocation: 'г. Москва',
      summary: '',
      suspects: [],
      victims: [],
      witnesses: [],
      evidences: [],
      interrogations: [],
      timeline: [
        {
          id: `tl-${Date.now()}`,
          date: new Date().toLocaleDateString('ru-RU') + ' 09:00',
          title: 'Возбуждение уголовного дела',
          description: 'Вынесено постановление о возбуждении уголовного дела и принятии к производству.',
          officer: officerName
        }
      ]
    });
    setIsNewCaseModalOpen(true);
  };

  const handleSaveNewCase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCaseData.title || !newCaseData.summary) return;

    const fullCase = {
      ...newCaseData,
      id: newCaseData.id || `case-${Date.now()}`,
      evidences: newCaseData.evidences || [],
      interrogations: newCaseData.interrogations || [],
      timeline: newCaseData.timeline || []
    } as CriminalCase;

    onAddCase(fullCase);
    setActiveCase(fullCase);
    setIsNewCaseModalOpen(false);
    onShowToast(`Уголовное дело ${fullCase.caseNumber} успешно зарегистрировано!`);
  };

  const handleStatusChange = (newStatus: CaseStatus) => {
    if (!activeCase) return;
    const updated = {
      ...activeCase,
      status: newStatus,
      closedDate:
        newStatus === 'closed' || newStatus === 'transferred_court'
          ? new Date().toLocaleDateString('ru-RU')
          : activeCase.closedDate
    };
    onUpdateCase(updated);
    setActiveCase(updated);
    onShowToast(`Статус уголовного дела изменен на «${getStatusLabel(newStatus)}»`);
  };

  // Add Evidence Handler
  const handleAddEvidence = (ev: Evidence) => {
    if (!activeCase) return;
    const updated = {
      ...activeCase,
      evidences: [...activeCase.evidences, ev]
    };
    onUpdateCase(updated);
    setActiveCase(updated);
    setIsNewEvidenceModalOpen(false);
    onShowToast(`Вещественное доказательство «${ev.title}» приобщено к делу`);
  };

  // Add Interrogation Handler
  const handleAddInterrogation = (record: InterrogationRecord) => {
    if (!activeCase) return;
    const updated = {
      ...activeCase,
      interrogations: [...activeCase.interrogations, record]
    };
    onUpdateCase(updated);
    setActiveCase(updated);
    setIsNewInterrogationModalOpen(false);
    onShowToast(`Протокол допроса (${record.personName}) успешно приобщен`);
  };

  // Add Timeline Event
  const handleAddTimeline = (event: TimelineEvent) => {
    if (!activeCase) return;
    const updated = {
      ...activeCase,
      timeline: [...activeCase.timeline, event]
    };
    onUpdateCase(updated);
    setActiveCase(updated);
    setIsNewTimelineModalOpen(false);
    onShowToast('Следственное действие добавлено в хронологию дела');
  };

  const getStatusLabel = (status: CaseStatus) => {
    switch (status) {
      case 'in_progress':
        return 'В производстве';
      case 'inquest':
        return 'Доследственная проверка';
      case 'suspended':
        return 'Приостановлено';
      case 'transferred_prosecutor':
        return 'В прокуратуре';
      case 'transferred_court':
        return 'Передано в суд';
      case 'closed':
        return 'Прекращено / В архиве';
      default:
        return status;
    }
  };

  const getStatusBadge = (status: CaseStatus) => {
    switch (status) {
      case 'in_progress':
        return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
      case 'inquest':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'suspended':
        return 'bg-slate-800 text-slate-400 border-slate-700';
      case 'transferred_court':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      case 'closed':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      default:
        return 'bg-slate-800 text-slate-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-cyan-400" />
            Следственное производство и уголовные дела
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Реестр уголовных дел, вещдоки, протоколы допросов, фабулы и процессуальные решения
          </p>
        </div>

        <button
          onClick={handleOpenNewCaseModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs sm:text-sm font-semibold transition shadow-md"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Возбудить уголовное дело</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по номеру дела, фабуле, следователю или фигуранту..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-cyan-500/60"
          >
            <option value="all">Все статусы дел</option>
            <option value="in_progress">В производстве</option>
            <option value="inquest">Доследственная проверка</option>
            <option value="suspended">Приостановлено</option>
            <option value="transferred_court">Передано в суд</option>
            <option value="closed">Прекращено / Закрыто</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-cyan-500/60"
          >
            <option value="all">Любой контроль</option>
            <option value="Особый контроль">Особый контроль</option>
            <option value="Повышенный">Повышенный</option>
            <option value="Обычный">Обычный</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Cases List & Active Case File */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Cases List Column (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-mono text-slate-400 px-1 flex justify-between items-center">
            <span>Зарегистрировано дел: {filteredCases.length}</span>
            <span className="text-cyan-400 font-semibold">
              В работе: {filteredCases.filter((c) => c.status === 'in_progress').length}
            </span>
          </div>

          <div className="space-y-2.5 max-h-[800px] overflow-y-auto pr-1">
            {filteredCases.map((caseItem) => {
              const isSelected = activeCase?.id === caseItem.id;
              return (
                <div
                  key={caseItem.id}
                  onClick={() => setActiveCase(caseItem)}
                  className={`cursor-pointer border rounded-xl p-3.5 transition ${
                    isSelected
                      ? 'bg-slate-850 border-cyan-500/60 shadow-md ring-1 ring-cyan-500/20'
                      : 'bg-slate-900/80 hover:bg-slate-850 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-xs font-mono font-bold text-amber-400">
                      {caseItem.caseNumber}
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.2 rounded border ${getStatusBadge(caseItem.status)}`}>
                      {getStatusLabel(caseItem.status)}
                    </span>
                  </div>

                  <h4 className="text-xs sm:text-sm font-bold text-slate-200 line-clamp-2">
                    {caseItem.title}
                  </h4>

                  <div className="flex flex-wrap gap-1 mt-2">
                    {caseItem.articles.map((art, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-950 text-slate-300 border border-slate-800"
                      >
                        ст. {art}
                      </span>
                    ))}
                    <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                      caseItem.priority === 'Особый контроль'
                        ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      {caseItem.priority}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2.5 pt-2 border-t border-slate-850 font-mono">
                    <span>Следователь: {caseItem.leadInvestigator.split(' ')[0]}</span>
                    <span>Улик: {caseItem.evidences.length}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Active Case Workspace (8 cols) */}
        <div className="lg:col-span-8">
          {activeCase ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 shadow-xl space-y-6">
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row items-start justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                      {activeCase.caseNumber}
                    </span>
                    <span className={`text-xs font-mono font-semibold px-2 py-0.5 rounded border ${getStatusBadge(activeCase.status)}`}>
                      {getStatusLabel(activeCase.status)}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Возбуждено: {activeCase.openedDate}
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-100 mt-1">
                    {activeCase.title}
                  </h3>
                  <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-3">
                    <span><strong>Следователь:</strong> {activeCase.leadInvestigator}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      {activeCase.incidentLocation}
                    </span>
                  </div>
                </div>

                {/* Status Switcher */}
                <div className="w-full sm:w-auto flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono text-slate-400 uppercase">
                    Процессуальный статус дела:
                  </label>
                  <select
                    value={activeCase.status}
                    onChange={(e) => handleStatusChange(e.target.value as CaseStatus)}
                    className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 font-semibold focus:outline-none focus:border-cyan-500"
                  >
                    <option value="in_progress">В производстве</option>
                    <option value="inquest">Доследственная проверка</option>
                    <option value="suspended">Приостановлено (ст. 208 УПК)</option>
                    <option value="transferred_prosecutor">Передано в прокуратуру</option>
                    <option value="transferred_court">Передано в суд</option>
                    <option value="closed">Прекращено / В архив</option>
                  </select>
                </div>
              </div>

              {/* Sub-Navigation Tabs */}
              <div className="flex border-b border-slate-800 gap-2 overflow-x-auto pb-1">
                <button
                  onClick={() => setActiveTab('summary')}
                  className={`px-3.5 py-2 text-xs font-semibold rounded-t-lg transition flex items-center gap-1.5 whitespace-nowrap ${
                    activeTab === 'summary'
                      ? 'bg-slate-800 text-cyan-400 border-b-2 border-cyan-400'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  Фабула и фигуранты
                </button>
                <button
                  onClick={() => setActiveTab('evidence')}
                  className={`px-3.5 py-2 text-xs font-semibold rounded-t-lg transition flex items-center gap-1.5 whitespace-nowrap ${
                    activeTab === 'evidence'
                      ? 'bg-slate-800 text-cyan-400 border-b-2 border-cyan-400'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Fingerprint className="w-3.5 h-3.5" />
                  Вещдоки ({activeCase.evidences.length})
                </button>
                <button
                  onClick={() => setActiveTab('interrogations')}
                  className={`px-3.5 py-2 text-xs font-semibold rounded-t-lg transition flex items-center gap-1.5 whitespace-nowrap ${
                    activeTab === 'interrogations'
                      ? 'bg-slate-800 text-cyan-400 border-b-2 border-cyan-400'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Mic className="w-3.5 h-3.5" />
                  Допросы ({activeCase.interrogations.length})
                </button>
                <button
                  onClick={() => setActiveTab('timeline')}
                  className={`px-3.5 py-2 text-xs font-semibold rounded-t-lg transition flex items-center gap-1.5 whitespace-nowrap ${
                    activeTab === 'timeline'
                      ? 'bg-slate-800 text-cyan-400 border-b-2 border-cyan-400'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  Хронология ({activeCase.timeline.length})
                </button>
              </div>

              {/* Tab 1: Summary & Participants */}
              {activeTab === 'summary' && (
                <div className="space-y-5 text-xs">
                  {/* Narrative summary */}
                  <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-4">
                    <h4 className="font-semibold text-slate-200 mb-2">
                      Описательно-мотивировочная часть (Фабула дела):
                    </h4>
                    <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {activeCase.summary}
                    </p>
                  </div>

                  {/* Grid of Suspects, Victims, Witnesses */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Suspects */}
                    <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3.5">
                      <div className="text-rose-400 font-bold mb-2 flex items-center gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        Подозреваемые / Обвиняемые
                      </div>
                      <div className="space-y-1.5">
                        {activeCase.suspects.length > 0 ? (
                          activeCase.suspects.map((s, idx) => (
                            <div
                              key={idx}
                              className="bg-slate-900 border border-slate-800 p-2 rounded text-slate-200 font-medium"
                            >
                              {s}
                            </div>
                          ))
                        ) : (
                          <div className="text-slate-500 italic">Лица не установлены</div>
                        )}
                      </div>
                    </div>

                    {/* Victims */}
                    <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3.5">
                      <div className="text-amber-400 font-bold mb-2 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" />
                        Потерпевшие
                      </div>
                      <div className="space-y-1.5">
                        {activeCase.victims.length > 0 ? (
                          activeCase.victims.map((v, idx) => (
                            <div
                              key={idx}
                              className="bg-slate-900 border border-slate-800 p-2 rounded text-slate-200"
                            >
                              {v}
                            </div>
                          ))
                        ) : (
                          <div className="text-slate-500 italic">Потерпевшие отсутствуют</div>
                        )}
                      </div>
                    </div>

                    {/* Witnesses */}
                    <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3.5">
                      <div className="text-cyan-400 font-bold mb-2 flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5" />
                        Свидетели / Очевидцы
                      </div>
                      <div className="space-y-1.5">
                        {activeCase.witnesses.length > 0 ? (
                          activeCase.witnesses.map((w, idx) => (
                            <div
                              key={idx}
                              className="bg-slate-900 border border-slate-800 p-2 rounded text-slate-200"
                            >
                              {w}
                            </div>
                          ))
                        ) : (
                          <div className="text-slate-500 italic">Свидетели не установлены</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {activeCase.courtOutcome && (
                    <div className="bg-purple-950/30 border border-purple-900/50 rounded-lg p-3.5">
                      <div className="text-purple-300 font-bold mb-1">
                        Результаты рассмотрения в суде:
                      </div>
                      <p className="text-purple-200">{activeCase.courtOutcome}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Evidence Locker */}
              {activeTab === 'evidence' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-mono">
                      Камера хранения вещественных доказательств (КХВД)
                    </span>
                    <button
                      onClick={() => setIsNewEvidenceModalOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Приобщить вещдок
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activeCase.evidences.map((ev) => (
                      <div
                        key={ev.id}
                        className="bg-slate-950 border border-slate-800 rounded-lg p-3.5 space-y-2 text-xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-bold text-slate-100">{ev.title}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                            {ev.type}
                          </span>
                        </div>
                        <p className="text-slate-400 leading-relaxed">{ev.description}</p>
                        <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                          <span>Хранение: {ev.storageLocation}</span>
                          <span>{ev.collectedAt}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 3: Interrogations */}
              {activeTab === 'interrogations' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-mono">
                      Протоколы допросов участников процесса
                    </span>
                    <button
                      onClick={() => setIsNewInterrogationModalOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Оформить протокол допроса
                    </button>
                  </div>

                  <div className="space-y-3">
                    {activeCase.interrogations.length > 0 ? (
                      activeCase.interrogations.map((int) => (
                        <div
                          key={int.id}
                          className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-100 text-sm">
                                {int.personName}
                              </span>
                              <span className="bg-slate-800 text-slate-300 px-2 py-0.2 rounded text-[10px] font-semibold">
                                {int.role}
                              </span>
                            </div>
                            <span className="text-slate-500 font-mono text-[11px]">
                              {int.date}
                            </span>
                          </div>

                          <div className="text-slate-300 font-medium">
                            {int.summary}
                          </div>

                          <div className="bg-slate-900/80 p-3 rounded border border-slate-850 font-mono text-[11px] text-slate-400 whitespace-pre-wrap leading-relaxed">
                            {int.transcript}
                          </div>

                          <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-500 font-mono">
                            <span>Допросил: {int.interrogator}</span>
                            {int.audioVideoRecorded && (
                              <span className="text-emerald-400 flex items-center gap-1">
                                <Video className="w-3 h-3" /> Видеозапись велась
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center p-8 bg-slate-950/40 border border-slate-800 rounded-lg text-slate-500 text-xs">
                        В деле пока нет оформленных протоколов допроса.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 4: Timeline */}
              {activeTab === 'timeline' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-mono">
                      Хронологический ход расследования
                    </span>
                    <button
                      onClick={() => setIsNewTimelineModalOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Добавить действие
                    </button>
                  </div>

                  <div className="relative pl-6 border-l-2 border-slate-800 space-y-5">
                    {activeCase.timeline.map((evt) => (
                      <div key={evt.id} className="relative group">
                        <div className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-cyan-500 border-2 border-slate-900 shadow" />
                        <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs space-y-1">
                          <div className="flex items-center justify-between text-slate-400 font-mono text-[11px]">
                            <span className="text-cyan-400 font-bold">{evt.date}</span>
                            <span>{evt.officer}</span>
                          </div>
                          <h5 className="font-bold text-slate-200">{evt.title}</h5>
                          <p className="text-slate-400 leading-relaxed">{evt.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-900/50 border border-slate-800 border-dashed rounded-xl p-12 text-center text-slate-400 space-y-3">
              <FolderOpen className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-base font-semibold text-slate-300">
                Дело не выбрано
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Выберите уголовное дело из списка слева для просмотра материалов или зарегистрируйте новое производство.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal: New Criminal Case */}
      {isNewCaseModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-slate-100">
                Возбуждение нового уголовного дела
              </h3>
              <button
                onClick={() => setIsNewCaseModalOpen(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewCase} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1">Регистрационный номер дела *</label>
                  <input
                    type="text"
                    required
                    value={newCaseData.caseNumber || ''}
                    onChange={(e) => setNewCaseData({ ...newCaseData, caseNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-amber-400 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Уровень контроля</label>
                  <select
                    value={newCaseData.priority || 'Обычный'}
                    onChange={(e) =>
                      setNewCaseData({
                        ...newCaseData,
                        priority: e.target.value as CriminalCase['priority']
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                  >
                    <option value="Обычный">Обычный</option>
                    <option value="Повышенный">Повышенный</option>
                    <option value="Особый контроль">Особый контроль руководства</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Наименование уголовного дела *</label>
                <input
                  type="text"
                  required
                  value={newCaseData.title || ''}
                  onChange={(e) => setNewCaseData({ ...newCaseData, title: e.target.value })}
                  placeholder="Вооруженное нападение на инкассаторов / Убийство гражданина..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1">Дата и время происшествия</label>
                  <input
                    type="text"
                    value={newCaseData.incidentDate || ''}
                    onChange={(e) =>
                      setNewCaseData({ ...newCaseData, incidentDate: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Место происшествия (ОМП)</label>
                  <input
                    type="text"
                    value={newCaseData.incidentLocation || ''}
                    onChange={(e) =>
                      setNewCaseData({ ...newCaseData, incidentLocation: e.target.value })
                    }
                    placeholder="г. Москва, ул. Ленина, д. 5"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">
                  Статьи УК РФ (через запятую: 105 ч.2, 162 ч.2)
                </label>
                <input
                  type="text"
                  value={newCaseData.articles?.join(', ') || ''}
                  onChange={(e) =>
                    setNewCaseData({
                      ...newCaseData,
                      articles: e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">
                  Подозреваемые фигуранты (через запятую)
                </label>
                <input
                  type="text"
                  value={newCaseData.suspects?.join(', ') || ''}
                  onChange={(e) =>
                    setNewCaseData({
                      ...newCaseData,
                      suspects: e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                    })
                  }
                  placeholder="Белов Р.В. («Седой»), Неустановленные лица"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Фабула дела (Описание события) *</label>
                <textarea
                  rows={4}
                  required
                  value={newCaseData.summary || ''}
                  onChange={(e) => setNewCaseData({ ...newCaseData, summary: e.target.value })}
                  placeholder="В ходе следственных мероприятий установлено, что..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewCaseModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg"
                >
                  Возбудить уголовное дело
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New Evidence */}
      {isNewEvidenceModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-5 space-y-4">
            <h4 className="text-sm font-bold text-slate-100">Приобщение вещественного доказательства</h4>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as any;
                handleAddEvidence({
                  id: `ev-${Date.now()}`,
                  title: form.title.value,
                  type: form.type.value,
                  description: form.description.value,
                  storageLocation: form.location.value,
                  collectedAt: new Date().toLocaleDateString('ru-RU') + ' ' + new Date().toLocaleTimeString('ru-RU').slice(0, 5),
                  collectedBy: `${officerRank} ${officerName}`,
                  status: 'examined'
                });
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block text-slate-400 mb-1">Наименование вещдока *</label>
                <input
                  name="title"
                  required
                  placeholder="Стреляные гильзы 9мм / Пистолет ПМ / Пакет с веществом"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Тип экспертизы / улик</label>
                <select name="type" className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100">
                  <option value="ballistics">Баллистика (Оружие/гильзы)</option>
                  <option value="fingerprints">Дактилоскопия (Отпечатки)</option>
                  <option value="dna">ДНК / Биоматериалы</option>
                  <option value="video">Видео / Фотозапись</option>
                  <option value="document">Документы / Бухгалтерия</option>
                  <option value="narcotics">Наркотические вещества</option>
                  <option value="weapon">Холодное / Огнестрельное оружие</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Номер ячейки хранения (КХВД)</label>
                <input
                  name="location"
                  defaultValue="Сейф КХВД № 3-Б"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Описание и обстоятельства изъятия</label>
                <textarea
                  name="description"
                  required
                  rows={3}
                  placeholder="Изъято в ходе осмотра места происшествия с асфальта..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewEvidenceModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-cyan-600 text-white font-bold rounded-lg"
                >
                  Приобщить к делу
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New Interrogation */}
      {isNewInterrogationModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-5 space-y-4">
            <h4 className="text-sm font-bold text-slate-100">Оформление протокола допроса</h4>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as any;
                handleAddInterrogation({
                  id: `int-${Date.now()}`,
                  personName: form.personName.value,
                  role: form.role.value,
                  date: new Date().toLocaleDateString('ru-RU') + ' ' + new Date().toLocaleTimeString('ru-RU').slice(0, 5),
                  interrogator: `${officerRank} ${officerName}`,
                  audioVideoRecorded: form.video.checked,
                  advocatePresent: form.advocate.checked,
                  summary: form.summary.value,
                  transcript: form.transcript.value
                });
              }}
              className="space-y-3 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">ФИО допрашиваемого *</label>
                  <input
                    name="personName"
                    required
                    placeholder="Иванов И.И."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Процессуальный статус</label>
                  <select name="role" className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100">
                    <option value="Подозреваемый">Подозреваемый</option>
                    <option value="Обвиняемый">Обвиняемый</option>
                    <option value="Свидетель">Свидетель</option>
                    <option value="Потерпевший">Потерпевший</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Краткая суть показаний *</label>
                <input
                  name="summary"
                  required
                  placeholder="Дал признательные показания, указал место схрона оружия..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Стенограмма допроса (Вопрос-Ответ)</label>
                <textarea
                  name="transcript"
                  required
                  rows={4}
                  defaultValue="Следователь: Где вы находились в момент совершения преступления?\nДопрашиваемый: Я находился дома..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 font-mono text-[11px]"
                />
              </div>

              <div className="flex items-center gap-4 py-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input name="video" type="checkbox" defaultChecked className="rounded bg-slate-950 border-slate-800 text-cyan-500" />
                  Видеозапись велась
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input name="advocate" type="checkbox" defaultChecked className="rounded bg-slate-950 border-slate-800 text-cyan-500" />
                  Адвокат присутствовал
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewInterrogationModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-cyan-600 text-white font-bold rounded-lg"
                >
                  Сохранить протокол
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New Timeline Event */}
      {isNewTimelineModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-5 space-y-4">
            <h4 className="text-sm font-bold text-slate-100">Добавить следственное действие в ход дела</h4>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as any;
                handleAddTimeline({
                  id: `tl-${Date.now()}`,
                  date: new Date().toLocaleDateString('ru-RU') + ' ' + new Date().toLocaleTimeString('ru-RU').slice(0, 5),
                  title: form.title.value,
                  description: form.description.value,
                  officer: officerName
                });
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block text-slate-400 mb-1">Следственное действие *</label>
                <input
                  name="title"
                  required
                  placeholder="Проведен обыск в жилище / Назначена баллистическая экспертиза"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Подробности выполнения</label>
                <textarea
                  name="description"
                  required
                  rows={3}
                  placeholder="В ходе следственного действия изъяты..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewTimelineModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-cyan-600 text-white font-bold rounded-lg"
                >
                  Добавить в хронику
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
