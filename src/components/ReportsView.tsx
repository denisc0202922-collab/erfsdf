import React, { useState } from 'react';
import { ReportRecord, ReportType, OfficerProfile, CriminalCase } from '../types';
import {
  FileSpreadsheet,
  PlusCircle,
  Award,
  CheckCircle2,
  Clock,
  Send,
  Printer,
  Copy,
  Plus,
  Trash2,
  Edit,
  X,
  Sparkles,
  TrendingUp,
  FileCheck2,
  UserCheck,
  Briefcase,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { reportToBBCode } from '../utils/bbcode';

interface ReportsViewProps {
  reports: ReportRecord[];
  officer: OfficerProfile;
  cases: CriminalCase[];
  onAddReport: (report: ReportRecord) => void;
  onUpdateReport: (report: ReportRecord) => void;
  onDeleteReport: (id: string) => void;
  onShowToast: (msg: string) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  reports,
  officer,
  cases,
  onAddReport,
  onUpdateReport,
  onDeleteReport,
  onShowToast
}) => {
  const [selectedReport, setSelectedReport] = useState<ReportRecord | null>(reports[0] || null);
  const [isNewReportModalOpen, setIsNewReportModalOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // New report form state
  const [formReport, setFormReport] = useState<Partial<ReportRecord>>({
    type: 'weekly_activity',
    title: 'Еженедельный отчет о следственной деятельности',
    authorName: officer.fullName,
    authorRank: officer.rank,
    targetLeader: 'Руководителю Главного следственного управления СК РФ по г. Москве',
    date: new Date().toLocaleDateString('ru-RU'),
    status: 'submitted',
    summary: '',
    actionsPerformed: [
      'Проведено допросов подозреваемых и свидетелей',
      'Осуществлен выезд на осмотр места происшествия',
      'Назначены судебные экспертизы'
    ],
    attachedCases: [],
    attachedEvidenceCount: 3,
    interrogationsCount: 4,
    arrestsCount: 1,
    pointsCalculated: 50,
    juniorOfficerName: '',
    juniorOfficerBadge: '',
    internshipRecommendation: 'promote_lieutenant'
  });

  const filteredReports = reports.filter((r) => {
    if (typeFilter === 'all') return true;
    return r.type === typeFilter;
  });

  const calculatePoints = (
    interrogations: number,
    evidence: number,
    arrests: number,
    casesCount: number
  ) => {
    return interrogations * 5 + evidence * 3 + arrests * 10 + casesCount * 20;
  };

  const handleOpenNewModal = (type: ReportType = 'weekly_activity') => {
    let title = 'Еженедельный отчет следователя';
    let target = 'Руководителю Главного следственного управления СК РФ по г. Москве';
    let actions = [
      'Проведено следственных допросов',
      'Приобщено вещественных доказательств',
      'Составлено процессуальных протоколов'
    ];
    let summary = '';
    let juniorName = '';
    let juniorBadge = '';
    let rec: 'promote_lieutenant' | 'continue_training' | 'excellent' = 'promote_lieutenant';

    if (type === 'promotion') {
      title = `Рапорт о присвоении очередного специального звания`;
      target = 'Председателю Следственного комитета Российской Федерации';
      summary = `Докладываю, что установленный срок выслуги лет в специальном звании «${officer.rank}» истек. За отчетный период расследовано уголовных дел в полном объеме, показатели раскрываемости стабильно высокие. Дисциплинарных взысканий не имею. Ходатайствую о присвоении очередного специального звания.`;
      actions = [
        'Истечение установленного срока выслуги в текущем звании',
        'Высокие показатели раскрываемости и качества следствия',
        'Отсутствие действующих дисциплинарных взысканий'
      ];
    } else if (type === 'leave') {
      title = 'Рапорт на предоставление очередного ежегодного отпуска';
      target = 'Руководителю следственного отдела СК РФ';
      summary = 'Прошу предоставить очередной основной оплачиваемый отпуск продолжительностью 30 календарных дней. Неотложные следственные действия выполнены, дела переданы по акту дежурному следователю.';
      actions = ['Завершение срочных процессуальных действий по делам', 'Передача материалов дежурному следователю'];
    } else if (type === 'junior_internship') {
      title = 'Рапорт о прохождении стажировки помощником следователя (мл. лейтенантом)';
      target = 'Руководителю Главного следственного управления СК РФ по г. Москве';
      summary = 'Докладываю, что прикрепленный помощник следователя (младший лейтенант юстиции) успешно освоил базовую программу следственной практики. Совместно выполнены выезды на место происшествия, допросы, изъятие и опечатывание вещественных доказательств, составление проектов процессуальных протоколов. Сотрудник проявил высокую дисциплину и знание норм УПК РФ. Ходатайствую о зачете стажировки и допуске к присвоению специального звания «Лейтенант юстиции».';
      actions = [
        'Отработка совместного выезда на ОМП и составление протокола осмотра',
        'Проведение процессуальных допросов под контролем следователя-наставника',
        'Изъятие и опечатывание вещественных доказательств в сейф-пакет',
        'Подготовка проектов постановлений по уголовным делам',
        'Инструктаж по правилам применения оружия и регламенту спецсвязи'
      ];
      juniorName = 'Морозов Дмитрий Алексеевич';
      juniorBadge = 'СК-77-0492';
      rec = 'promote_lieutenant';
    }

    const nextNum = reports.length + 1;
    const repNum = `РАПОРТ № 77/2026-${String(nextNum).padStart(2, '0')}`;
    const isJunior = type === 'junior_internship';

    setFormReport({
      id: `rep-${Date.now()}`,
      reportNumber: repNum,
      type,
      title,
      authorName: officer.fullName,
      authorRank: officer.rank,
      targetLeader: target,
      date: new Date().toLocaleDateString('ru-RU'),
      status: 'submitted',
      summary,
      actionsPerformed: actions,
      attachedCases: isJunior ? [] : cases.slice(0, 2).map((c) => c.caseNumber),
      attachedEvidenceCount: isJunior ? 0 : 4,
      interrogationsCount: isJunior ? 0 : 6,
      arrestsCount: isJunior ? 0 : 2,
      pointsCalculated: isJunior ? 25 : calculatePoints(6, 4, 2, 2),
      juniorOfficerName: juniorName,
      juniorOfficerBadge: juniorBadge,
      internshipRecommendation: rec
    });
    setIsNewReportModalOpen(true);
  };

  const handleTypeChangeInModal = (newType: ReportType) => {
    let title = formReport.title || '';
    let summary = formReport.summary || '';
    let target = formReport.targetLeader || 'Руководителю Главного следственного управления СК РФ по г. Москве';
    let actions = formReport.actionsPerformed || [];
    let juniorName = formReport.juniorOfficerName || '';
    let juniorBadge = formReport.juniorOfficerBadge || '';
    let points = formReport.pointsCalculated || 50;
    const isJunior = newType === 'junior_internship';

    if (isJunior) {
      title = 'Рапорт о прохождении стажировки помощником следователя (мл. лейтенантом)';
      target = 'Руководителю Главного следственного управления СК РФ по г. Москве';
      summary = 'Докладываю, что прикрепленный помощник следователя (младший лейтенант юстиции) успешно освоил базовую программу следственной практики. Совместно выполнены выезды на место происшествия, допросы, изъятие и опечатывание вещественных доказательств, составление проектов процессуальных протоколов. Сотрудник проявил высокую дисциплину и знание норм УПК РФ. Ходатайствую о зачете стажировки и допуске к присвоению специального звания «Лейтенант юстиции».';
      actions = [
        'Отработка совместного выезда на ОМП и составление протокола осмотра',
        'Проведение процессуальных допросов под контролем следователя-наставника',
        'Изъятие и опечатывание вещественных доказательств в сейф-пакет',
        'Подготовка проектов постановлений по уголовным делам',
        'Инструктаж по правилам применения оружия и регламенту спецсвязи'
      ];
      if (!juniorName) juniorName = 'Морозов Дмитрий Алексеевич';
      if (!juniorBadge) juniorBadge = 'СК-77-0492';
      points = 25;
    } else if (newType === 'weekly_activity') {
      title = 'Еженедельный отчет о следственной деятельности';
      actions = [
        'Проведено следственных допросов',
        'Приобщено вещественных доказательств',
        'Составлено процессуальных протоколов'
      ];
      points = calculatePoints(
        formReport.interrogationsCount || 6,
        formReport.attachedEvidenceCount || 4,
        formReport.arrestsCount || 2,
        formReport.attachedCases?.length || 2
      );
    } else if (newType === 'promotion') {
      title = 'Рапорт о присвоении очередного специального звания';
      target = 'Председателю Следственного комитета Российской Федерации';
      actions = [
        'Истечение установленного срока выслуги в текущем звании',
        'Высокие показатели раскрываемости и качества следствия',
        'Отсутствие действующих дисциплинарных взысканий'
      ];
    }

    setFormReport({
      ...formReport,
      type: newType,
      title,
      summary,
      targetLeader: target,
      actionsPerformed: actions,
      juniorOfficerName: juniorName,
      juniorOfficerBadge: juniorBadge,
      pointsCalculated: points
    });
  };

  const handleSaveReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formReport.title || !formReport.summary) return;

    const fullReport: ReportRecord = {
      ...formReport,
      id: formReport.id || `rep-${Date.now()}`,
      actionsPerformed: formReport.actionsPerformed || [],
      attachedCases: formReport.attachedCases || []
    } as ReportRecord;

    onAddReport(fullReport);
    setSelectedReport(fullReport);
    setIsNewReportModalOpen(false);
    onShowToast(`Рапорт «${fullReport.reportNumber}» успешно зарегистрирован!`);
  };

  const handleCopyBBCode = (rep: ReportRecord) => {
    const bb = reportToBBCode(rep);
    navigator.clipboard.writeText(bb);
    onShowToast('BB-код рапорта скопирован для форума фракции!');
  };

  const getStatusBadge = (status: ReportRecord['status']) => {
    switch (status) {
      case 'approved':
        return (
          <span className="bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded text-xs font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Утвержден руководством
          </span>
        );
      case 'submitted':
        return (
          <span className="bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded text-xs font-semibold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> На рассмотрении
          </span>
        );
      case 'rejected':
        return (
          <span className="bg-rose-500/15 text-rose-300 border border-rose-500/30 px-2.5 py-0.5 rounded text-xs font-semibold">
            Отклонен / Доработать
          </span>
        );
      default:
        return (
          <span className="bg-slate-800 text-slate-400 border border-slate-700 px-2.5 py-0.5 rounded text-xs font-semibold">
            Черновик
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-amber-400" />
            Рапорты о проделанной работе и служебная отчетность
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Отчеты для руководства, баллы активности, рапорты о стажерах (пом. следователя) и ходатайства
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleOpenNewModal('junior_internship')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg text-xs font-bold transition shadow-sm cursor-pointer"
            title="Составить рапорт о стажере / помощнике следователя"
          >
            <UserCheck className="w-4 h-4" />
            <span>Рапорт о мл. лейтенанте (стажере)</span>
          </button>
          <button
            onClick={() => handleOpenNewModal('weekly_activity')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold transition shadow-sm cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Составить рапорт</span>
          </button>
          <button
            onClick={() => handleOpenNewModal('promotion')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition border border-emerald-500/40 shadow-sm cursor-pointer"
          >
            <Award className="w-4 h-4" />
            <span>На повышение</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column: Reports List & Active Report Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Reports List (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-mono text-slate-400">
              Подано рапортов: {filteredReports.length}
            </span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-2 py-1 bg-slate-950 border border-slate-800 rounded text-xs text-slate-300"
            >
              <option value="all">Все типы</option>
              <option value="junior_internship">О стажерах (мл. лейтенантах)</option>
              <option value="weekly_activity">Еженедельные</option>
              <option value="promotion">На повышение</option>
              <option value="leave">На отпуск</option>
            </select>
          </div>

          <div className="space-y-2.5 max-h-[750px] overflow-y-auto pr-1">
            {filteredReports.map((report) => {
              const isSelected = selectedReport?.id === report.id;
              const isJuniorReport = report.type === 'junior_internship';

              return (
                <div
                  key={report.id}
                  onClick={() => setSelectedReport(report)}
                  className={`cursor-pointer border rounded-xl p-3.5 transition ${
                    isSelected
                      ? 'bg-slate-850 border-amber-500/60 shadow-md ring-1 ring-amber-500/20'
                      : 'bg-slate-900/80 hover:bg-slate-850 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-xs font-mono font-bold text-amber-400">
                      {report.reportNumber}
                    </span>
                    <div className="flex items-center gap-1">
                      {isJuniorReport && (
                        <span className="px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 font-mono text-[9px] font-bold">
                          СТАЖИРОВКА
                        </span>
                      )}
                      <span className="text-[11px] font-mono text-slate-500">
                        {report.date}
                      </span>
                    </div>
                  </div>

                  <h4 className="text-xs sm:text-sm font-bold text-slate-100 line-clamp-1">
                    {report.title}
                  </h4>

                  {report.juniorOfficerName && (
                    <div className="text-[11px] text-blue-300 font-medium mt-1 flex items-center gap-1">
                      <UserCheck className="w-3 h-3" />
                      <span>Пом. следователя: {report.juniorOfficerName}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-850">
                    {getStatusBadge(report.status)}
                    <span className="text-xs font-mono font-bold text-amber-400">
                      +{report.pointsCalculated} б.
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Full Report Document Preview (8 cols) */}
        <div className="lg:col-span-8">
          {selectedReport ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
              {/* Header Actions */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-bold text-amber-400">
                      {selectedReport.reportNumber}
                    </span>
                    {selectedReport.type === 'junior_internship' && (
                      <span className="px-2 py-0.5 rounded bg-blue-500/20 border border-blue-500/40 text-blue-300 font-bold text-[10px]">
                        О СТАЖЕРЕ (МЛ. ЛЕЙТЕНАНТЕ)
                      </span>
                    )}
                    {getStatusBadge(selectedReport.status)}
                  </div>
                  <h3 className="text-lg font-bold text-slate-100">
                    {selectedReport.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyBBCode(selectedReport)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition border border-slate-700 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5 text-amber-400" />
                    <span>Скопировать BB-код</span>
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold transition cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Печать</span>
                  </button>
                </div>
              </div>

              {/* Printable Body */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-5 space-y-5 text-xs">
                {/* Addressing */}
                <div className="text-right space-y-1 text-slate-400 text-xs border-b border-slate-850 pb-3">
                  <div><strong>Кому: </strong>{selectedReport.targetLeader}</div>
                  <div><strong>От кого (Следователь-наставник): </strong>{selectedReport.authorRank} {selectedReport.authorName}</div>
                  <div><strong>Дата составления: </strong>{selectedReport.date}</div>
                </div>

                {/* Special Box for Junior Officer Report */}
                {selectedReport.juniorOfficerName && (
                  <div className="p-4 bg-gradient-to-r from-blue-950/50 to-slate-900 border border-blue-500/30 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-blue-300 font-bold">
                        <UserCheck className="w-4 h-4 text-blue-400" />
                        <span>Служебные данные стажера / помощника следователя:</span>
                      </div>
                      <span className="font-mono text-xs text-amber-400 font-bold">
                        Жетон: {selectedReport.juniorOfficerBadge || 'СК-77-0492'}
                      </span>
                    </div>
                    <div className="text-slate-200">
                      <b>ФИО сотрудника:</b> <span className="text-white font-bold">{selectedReport.juniorOfficerName}</span> (Младший лейтенант юстиции)
                    </div>
                    <div className="text-slate-300 text-[11px] flex items-center gap-1.5 pt-1 border-t border-blue-500/20">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>
                        <b>Итоговая резолюция наставника:</b>{' '}
                        {selectedReport.internshipRecommendation === 'promote_lieutenant'
                          ? 'Ходатайствую о присвоении звания «Лейтенант юстиции» (Дать добро)'
                          : selectedReport.internshipRecommendation === 'excellent'
                          ? 'С отличием • Ходатайствую о досрочном присвоении звания'
                          : 'Рекомендуется дополнительная практика'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Summary narrative */}
                <div className="space-y-1.5">
                  <h5 className="font-semibold text-slate-200">1. Описание проделанной работы и служебный отзыв:</h5>
                  <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {selectedReport.summary}
                  </p>
                </div>

                {/* Performed Actions */}
                <div className="space-y-2">
                  <h5 className="font-semibold text-slate-200">
                    2. Перечень выполненных следственных мероприятий и практических этапов:
                  </h5>
                  <div className="space-y-1.5 pl-2">
                    {selectedReport.actionsPerformed.map((act, i) => (
                      <div key={i} className="flex items-start gap-2 text-slate-300">
                        <span className="text-amber-400 font-mono font-bold">{i + 1}.</span>
                        <span>{act}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Statistics Box */}
                {selectedReport.type === 'junior_internship' ? (
                  <div className="bg-slate-900 border border-blue-500/40 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-300">
                        <Sparkles className="w-5 h-5 text-amber-400" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-100 text-xs">
                          Норматив за кураторство и наставничество младшего лейтенанта
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Фиксированное начисление баллов следственной активности наставника
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-black text-amber-400 font-mono">25 баллов</div>
                      <div className="text-[10px] text-emerald-400 font-semibold uppercase">Статичный норматив</div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="p-2">
                      <div className="text-lg font-bold text-cyan-400 font-mono">
                        {selectedReport.interrogationsCount}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Допросов (x5 б.)</div>
                    </div>
                    <div className="p-2">
                      <div className="text-lg font-bold text-amber-400 font-mono">
                        {selectedReport.attachedEvidenceCount}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Вещдоков (x3 б.)</div>
                    </div>
                    <div className="p-2">
                      <div className="text-lg font-bold text-emerald-400 font-mono">
                        {selectedReport.arrestsCount}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Задержаний (x10 б.)</div>
                    </div>
                    <div className="p-2">
                      <div className="text-lg font-bold text-amber-400 font-mono">
                        {selectedReport.pointsCalculated}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Итоговых баллов</div>
                    </div>
                  </div>
                )}

                {/* Footer Signature */}
                <div className="pt-4 border-t border-slate-850 flex items-center justify-between text-slate-400 text-[11px]">
                  <div>Служебная ЭЦП Следственного комитета РФ</div>
                  <div className="font-mono text-slate-300">
                    Подписал: {selectedReport.authorRank} {selectedReport.authorName}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-12 text-center text-slate-500">
              Выберите рапорт из списка слева для детального просмотра
            </div>
          )}
        </div>
      </div>

      {/* ================= MODAL: CREATE NEW REPORT ================= */}
      {isNewReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 text-slate-100 rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto border border-slate-800 shadow-2xl p-6 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-amber-400" />
                <span>Составление служебного рапорта</span>
              </h3>
              <button
                onClick={() => setIsNewReportModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveReport} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1">Номер рапорта *</label>
                  <input
                    type="text"
                    required
                    value={formReport.reportNumber || ''}
                    onChange={(e) =>
                      setFormReport({ ...formReport, reportNumber: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-amber-400 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Тип рапорта</label>
                  <select
                    value={formReport.type || 'weekly_activity'}
                    onChange={(e) => handleTypeChangeInModal(e.target.value as ReportType)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 font-medium"
                  >
                    <option value="junior_internship">Рапорт о мл. лейтенанте (пом. следователя / стажере)</option>
                    <option value="weekly_activity">Еженедельный отчет о деятельности</option>
                    <option value="promotion">Рапорт на повышение в звании</option>
                    <option value="leave">Рапорт на очередной отпуск</option>
                    <option value="special_operation">Рапорт о спецоперации / рейде</option>
                  </select>
                </div>
              </div>

              {/* Special Fields if Junior Officer Internship Report */}
              {formReport.type === 'junior_internship' && (
                <div className="p-3.5 bg-blue-950/40 border border-blue-500/40 rounded-xl space-y-3">
                  <div className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-blue-400" />
                    <span>Данные стажера (младшего лейтенанта юстиции / помощника):</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1">ФИО помощника следователя *</label>
                      <input
                        type="text"
                        required
                        value={formReport.juniorOfficerName || ''}
                        onChange={(e) => setFormReport({ ...formReport, juniorOfficerName: e.target.value })}
                        placeholder="Морозов Дмитрий Алексеевич"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Номер служебного жетона</label>
                      <input
                        type="text"
                        value={formReport.juniorOfficerBadge || ''}
                        onChange={(e) => setFormReport({ ...formReport, juniorOfficerBadge: e.target.value })}
                        placeholder="СК-77-0492"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Итоговая рекомендация следователя-наставника *</label>
                    <select
                      value={formReport.internshipRecommendation || 'promote_lieutenant'}
                      onChange={(e) => setFormReport({ ...formReport, internshipRecommendation: e.target.value as any })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-emerald-300 font-bold"
                    >
                      <option value="promote_lieutenant">🟢 Ходатайствую о присвоении звания «Лейтенант юстиции» (Дать добро)</option>
                      <option value="excellent">⭐ С отличием • Ходатайствую о досрочном присвоении звания</option>
                      <option value="continue_training">🟡 Продлить стажировку на 7 дней (требуется дополнительная практика)</option>
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-slate-400 mb-1">Кому (Адресат / Руководитель) *</label>
                <input
                  type="text"
                  required
                  value={formReport.targetLeader || ''}
                  onChange={(e) =>
                    setFormReport({ ...formReport, targetLeader: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Заголовок рапорта *</label>
                <input
                  type="text"
                  required
                  value={formReport.title || ''}
                  onChange={(e) => setFormReport({ ...formReport, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Текст доклада (Суть работы) *</label>
                <textarea
                  rows={4}
                  required
                  value={formReport.summary || ''}
                  onChange={(e) => setFormReport({ ...formReport, summary: e.target.value })}
                  placeholder="Докладываю о проделанной следственной работе..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 leading-relaxed"
                />
              </div>

              {/* Statistics Metrics */}
              {formReport.type === 'junior_internship' ? (
                <div className="p-3.5 bg-slate-950 rounded-xl border border-blue-500/40 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
                    <div>
                      <div className="font-bold text-slate-100 text-xs">Баллы за кураторство стажера (пом. следователя)</div>
                      <div className="text-[11px] text-slate-400">Статичное начисление за наставничество и подготовку офицера</div>
                    </div>
                  </div>
                  <div className="text-right pl-3">
                    <div className="text-lg font-black text-amber-400 font-mono">25 б.</div>
                    <div className="text-[10px] text-emerald-400 font-semibold uppercase">Фиксировано</div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <div>
                    <label className="block text-slate-400 mb-1">Допросов</label>
                    <input
                      type="number"
                      min="0"
                      value={formReport.interrogationsCount || 0}
                      onChange={(e) => {
                        const count = parseInt(e.target.value) || 0;
                        setFormReport({
                          ...formReport,
                          interrogationsCount: count,
                          pointsCalculated: calculatePoints(
                            count,
                            formReport.attachedEvidenceCount || 0,
                            formReport.arrestsCount || 0,
                            formReport.attachedCases?.length || 0
                          )
                        });
                      }}
                      className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-100 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Вещдоков</label>
                    <input
                      type="number"
                      min="0"
                      value={formReport.attachedEvidenceCount || 0}
                      onChange={(e) => {
                        const count = parseInt(e.target.value) || 0;
                        setFormReport({
                          ...formReport,
                          attachedEvidenceCount: count,
                          pointsCalculated: calculatePoints(
                            formReport.interrogationsCount || 0,
                            count,
                            formReport.arrestsCount || 0,
                            formReport.attachedCases?.length || 0
                          )
                        });
                      }}
                      className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-100 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Задержаний</label>
                    <input
                      type="number"
                      min="0"
                      value={formReport.arrestsCount || 0}
                      onChange={(e) => {
                        const count = parseInt(e.target.value) || 0;
                        setFormReport({
                          ...formReport,
                          arrestsCount: count,
                          pointsCalculated: calculatePoints(
                            formReport.interrogationsCount || 0,
                            formReport.attachedEvidenceCount || 0,
                            count,
                            formReport.attachedCases?.length || 0
                          )
                        });
                      }}
                      className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-100 font-mono"
                    />
                  </div>
                  <div className="flex flex-col justify-center items-center">
                    <div className="text-slate-400 text-[10px]">Баллы RP</div>
                    <div className="text-base font-bold text-amber-400 font-mono">
                      {formReport.pointsCalculated} б.
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewReportModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition cursor-pointer shadow-md"
                >
                  Подать рапорт
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsView;
