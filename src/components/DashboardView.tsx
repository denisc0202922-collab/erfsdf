import React from 'react';
import {
  OfficerProfile,
  Offender,
  CriminalCase,
  ReportRecord
} from '../types';
import {
  ShieldAlert,
  Briefcase,
  FileCheck2,
  TrendingUp,
  PlusCircle,
  Search,
  UserPlus,
  FileSpreadsheet,
  FileText,
  AlertTriangle,
  Terminal,
  ExternalLink,
  ChevronRight,
  Car,
  Fingerprint,
  GraduationCap,
  Award
} from 'lucide-react';
import { NavTab } from './Sidebar';
import { OfficerPhoto } from './OfficerPhoto';

interface DashboardViewProps {
  officer: OfficerProfile;
  offenders: Offender[];
  cases: CriminalCase[];
  reports: ReportRecord[];
  onNavigate: (tab: NavTab) => void;
  onSelectOffender: (offender: Offender) => void;
  onSelectCase: (caseItem: CriminalCase) => void;
  onQuickNewCase: () => void;
  onQuickNewOffender: () => void;
  onQuickNewDoc: () => void;
  onQuickNewReport: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  officer,
  offenders,
  cases,
  reports,
  onNavigate,
  onSelectOffender,
  onSelectCase,
  onQuickNewCase,
  onQuickNewOffender,
  onQuickNewDoc,
  onQuickNewReport
}) => {
  const wantedList = offenders.filter((o) => o.status === 'wanted');
  const activeCases = cases.filter(
    (c) => c.status === 'in_progress' || c.status === 'inquest'
  );
  const closedCases = cases.filter(
    (c) => c.status === 'closed' || c.status === 'transferred_court'
  );

  const totalPoints = reports.reduce((acc, r) => acc + (r.pointsCalculated || 0), 0);

  return (
    <div className="space-y-6">
      {/* Officer Operational Card */}
      <div className="relative overflow-hidden bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-sm">
        {/* Background ambient watermarks */}
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 w-72 h-72 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0">
              <OfficerPhoto
                src={officer.photoUrl}
                alt={officer.fullName}
                className="w-full h-full rounded-2xl object-cover border-2 border-[#85181b]/30 shadow-md"
                rank={officer.rank}
                fallbackInitials={officer.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
              />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="bg-red-50 text-[#85181b] border border-red-200 text-xs font-mono px-2.5 py-0.5 rounded-lg font-bold">
                  {officer.rank}
                </span>
                <span className="bg-slate-100 text-slate-700 border border-slate-200 text-xs font-mono px-2.5 py-0.5 rounded-lg font-medium">
                  Гриф: {officer.clearanceLevel}
                </span>
                <span className="bg-slate-100 text-slate-700 border border-slate-200 text-xs font-mono px-2.5 py-0.5 rounded-lg font-medium">
                  Жетон: {officer.badgeNumber}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                {officer.fullName}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-medium">
                {officer.position} • {officer.department}
              </p>
            </div>
          </div>

          {/* Quick Command Action Buttons */}
          <div className="flex flex-wrap gap-2 w-full lg:w-auto">
            <button
              onClick={onQuickNewCase}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#85181b] hover:bg-[#6b1316] text-white font-bold text-xs transition shadow-sm cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Возбудить дело</span>
            </button>
            <button
              onClick={onQuickNewOffender}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-[#85181b] font-bold text-xs transition border border-red-200 shadow-sm cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>В розыск</span>
            </button>
            <button
              onClick={onQuickNewDoc}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition border border-slate-200 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-[#85181b]" />
              <span>Бланк / Ордер</span>
            </button>
            <button
              onClick={onQuickNewReport}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition border border-slate-200 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Рапорт</span>
            </button>
          </div>
        </div>
      </div>

      {/* Junior Lieutenant Qualification Exam Callout Banner */}
      {officer.rank.toLowerCase().includes('младший лейтенант') && (
        <div className="bg-linear-to-r from-amber-500/10 via-red-500/5 to-transparent border-2 border-amber-500/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-900 shrink-0 shadow-inner">
              <GraduationCap className="w-6 h-6 text-[#85181b]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-900 text-[10px] font-mono font-bold uppercase">
                  Квалификационная программа
                </span>
                <span className="text-xs text-amber-900 font-semibold">• Повышение до Лейтенанта</span>
              </div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 mt-0.5">
                Доступен учебный отдел: 3 квалификационных теста и экзамен (20 вопросов)
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Пройдите тестирование по УПК РФ, Уставу СК РФ и криминалистике для присвоения очередного специального звания.
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('junior_exam')}
            className="px-5 py-2.5 rounded-xl bg-[#85181b] hover:bg-[#6b1316] text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-2 shrink-0 w-full sm:w-auto justify-center"
          >
            <span>Открыть экзаменационный отдел</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => onNavigate('offenders')}
          className="cursor-pointer bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-red-300 p-4 rounded-2xl transition group shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-500 uppercase font-bold">
              В розыске
            </span>
            <div className="p-2 rounded-xl bg-red-50 text-[#85181b] border border-red-100 group-hover:scale-110 transition">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#85181b] font-mono">
              {wantedList.length}
            </span>
            <span className="text-xs text-slate-500">фигурантов</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">
            {offenders.filter((o) => o.dangerLevel === 'Особо опасен').length} особо опасных преступников
          </p>
        </div>

        <div
          onClick={() => onNavigate('cases')}
          className="cursor-pointer bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-red-300 p-4 rounded-2xl transition group shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-500 uppercase font-bold">
              Дел в производстве
            </span>
            <div className="p-2 rounded-xl bg-red-50 text-[#85181b] border border-red-100 group-hover:scale-110 transition">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono">
              {activeCases.length}
            </span>
            <span className="text-xs text-slate-500">уголовных дел</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">
            {cases.filter((c) => c.priority === 'Особый контроль').length} на особом контроле руководства
          </p>
        </div>

        <div
          onClick={() => onNavigate('reports')}
          className="cursor-pointer bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-red-300 p-4 rounded-2xl transition group shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-500 uppercase font-bold">
              Баллы активности
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 group-hover:scale-110 transition">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-600 font-mono">
              {totalPoints}
            </span>
            <span className="text-xs text-slate-500">баллов RP</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">
            {reports.length} служебных рапортов подано
          </p>
        </div>

        <div
          onClick={() => onNavigate('cases')}
          className="cursor-pointer bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-red-300 p-4 rounded-2xl transition group shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-500 uppercase font-bold">
              Раскрываемость
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 group-hover:scale-110 transition">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-600 font-mono">
              {closedCases.length} / {cases.length}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              ({cases.length ? Math.round((closedCases.length / cases.length) * 100) : 0}%)
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">
            Передано в суд и завершено
          </p>
        </div>
      </div>

      {/* Main Double Columns: Hot BOLO & Active Cases */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Hot BOLO / Федеральный розыск (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-[#85181b] font-bold text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>Срочный федеральный розыск</span>
              </div>
              <button
                onClick={() => onNavigate('offenders')}
                className="text-xs text-[#85181b] hover:underline font-bold flex items-center gap-1 cursor-pointer"
              >
                Все ({offenders.length}) <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-3 mt-4">
              {wantedList.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs font-medium bg-slate-50 rounded-xl border border-slate-100">
                  Активных ориентировок на розыск нет
                </div>
              ) : wantedList.slice(0, 3).map((offender) => (
                <div
                  key={offender.id}
                  onClick={() => onSelectOffender(offender)}
                  className="cursor-pointer bg-slate-50/80 hover:bg-red-50/50 border border-slate-200/80 hover:border-red-200 p-3 rounded-xl transition group flex items-start gap-3"
                >
                  <img
                    src={offender.photoUrl}
                    alt={offender.fullName}
                    className="w-14 h-14 rounded-xl object-cover border border-red-200 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate group-hover:text-[#85181b] transition">
                        {offender.fullName} {offender.alias && <span className="text-[#85181b] font-normal">{offender.alias}</span>}
                      </h4>
                      <span className="text-xs font-mono font-bold text-rose-600">
                        {'★'.repeat(offender.wantedLevel)}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1 mt-1">
                      {offender.articles.slice(0, 2).map((art, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-red-100 text-[#85181b] font-semibold"
                        >
                          ст. {art}
                        </span>
                      ))}
                      {offender.faction && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 truncate max-w-[130px] font-medium">
                          {offender.faction}
                        </span>
                      )}
                    </div>

                    {offender.vehicle && (
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1.5 truncate font-medium">
                        <Car className="w-3 h-3 text-slate-400" />
                        <span className="truncate">{offender.vehicle} ({offender.vehiclePlate || 'б/н'})</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <button
              onClick={() => onNavigate('offenders')}
              className="w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 rounded-xl text-xs font-bold transition text-center cursor-pointer"
            >
              Открыть картотеку граждан и ориентировки
            </button>
          </div>
        </div>

        {/* Right: Active Criminal Cases (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-[#85181b] font-bold text-sm">
                <Briefcase className="w-4 h-4" />
                <span>Текущее следственное производство</span>
              </div>
              <button
                onClick={() => onNavigate('cases')}
                className="text-xs text-[#85181b] hover:underline font-bold flex items-center gap-1 cursor-pointer"
              >
                Все дела ({cases.length}) <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-3 mt-4">
              {activeCases.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs font-medium bg-slate-50 rounded-xl border border-slate-100">
                  Активных уголовных дел в производстве нет
                </div>
              ) : activeCases.slice(0, 3).map((caseItem) => (
                <div
                  key={caseItem.id}
                  onClick={() => onSelectCase(caseItem)}
                  className="cursor-pointer bg-slate-50/80 hover:bg-red-50/40 border border-slate-200/80 hover:border-red-200 p-3.5 rounded-xl transition group"
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-[#85181b]">
                        {caseItem.caseNumber}
                      </span>
                      <span className={`text-[10px] font-mono px-2 py-0.2 rounded font-bold ${
                        caseItem.priority === 'Особый контроль'
                          ? 'bg-red-100 text-[#85181b]'
                          : 'bg-slate-200 text-slate-700'
                      }`}>
                        {caseItem.priority}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Возбуждено: {caseItem.openedDate}
                    </span>
                  </div>

                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#85181b] transition line-clamp-1">
                    {caseItem.title}
                  </h4>

                  <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                    {caseItem.summary}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-2 mt-2 pt-2 border-t border-slate-200/60 text-[11px] text-slate-500">
                    <div>
                      Фигуранты: <strong className="text-slate-800">{caseItem.suspects.join(', ') || 'Не установлены'}</strong>
                    </div>
                    <div className="flex items-center gap-3 text-slate-400 font-mono text-[10px]">
                      <span>Вещдоков: {caseItem.evidences.length}</span>
                      <span>Допросов: {caseItem.interrogations.length}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
            <button
              onClick={onQuickNewCase}
              className="py-2 px-4 bg-red-50 hover:bg-red-100 text-[#85181b] border border-red-200 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              + Возбудить новое уголовное дело
            </button>
            <button
              onClick={() => onNavigate('cases')}
              className="py-2 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition border border-slate-200 cursor-pointer"
            >
              Реестр всех дел
            </button>
          </div>
        </div>
      </div>

      {/* Quick RP Actions & Binders strip */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-red-50 text-[#85181b] border border-red-100">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Быстрый RP-Помощник следователя
            </h4>
            <p className="text-xs text-slate-500 font-medium">
              Отыгровки для чата (/me, /do, /todo), правила Миранды, следственные протоколы и таймер
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('binder')}
          className="flex items-center gap-2 px-4 py-2 bg-[#85181b] hover:bg-[#6b1316] text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
        >
          <span>Открыть RP-Биндер</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
