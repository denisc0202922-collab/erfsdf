import React, { useState, useEffect, useRef } from 'react';
import {
  Offender,
  CriminalCase,
  LawArticle,
  ProceduralDocument,
  ReportRecord,
  RPBinderEntry,
  ActiveTabType
} from '../types';
import {
  Search,
  X,
  Users,
  Briefcase,
  BookOpen,
  FileText,
  FileSpreadsheet,
  Terminal,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  offenders: Offender[];
  cases: CriminalCase[];
  articles: LawArticle[];
  documents: ProceduralDocument[];
  reports: ReportRecord[];
  binds: RPBinderEntry[];
  onNavigate: (tab: ActiveTabType) => void;
  onSelectOffender: (offender: Offender) => void;
  onSelectCase: (caseItem: CriminalCase) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  offenders,
  cases,
  articles,
  documents,
  reports,
  binds,
  onNavigate,
  onSelectOffender,
  onSelectCase
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Handle ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  const matchingOffenders = q
    ? offenders.filter(
        (o) =>
          o.fullName.toLowerCase().includes(q) ||
          (o.alias && o.alias.toLowerCase().includes(q)) ||
          o.passportNumber.toLowerCase().includes(q) ||
          o.articles.some((a) => a.toLowerCase().includes(q)) ||
          (o.faction && o.faction.toLowerCase().includes(q))
      )
    : [];

  const matchingCases = q
    ? cases.filter(
        (c) =>
          c.caseNumber.toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q) ||
          c.summary.toLowerCase().includes(q) ||
          c.suspects.some((s) => s.toLowerCase().includes(q))
      )
    : [];

  const matchingArticles = q
    ? articles.filter(
        (a) =>
          a.code.toLowerCase().includes(q) ||
          a.title.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q)
      )
    : [];

  const matchingDocuments = q
    ? documents.filter(
        (d) =>
          d.docNumber.toLowerCase().includes(q) ||
          (d.suspectName && d.suspectName.toLowerCase().includes(q)) ||
          (d.caseNumber && d.caseNumber.toLowerCase().includes(q))
      )
    : [];

  const matchingReports = q
    ? reports.filter(
        (r) =>
          r.reportNumber.toLowerCase().includes(q) ||
          r.title.toLowerCase().includes(q) ||
          r.summary.toLowerCase().includes(q)
      )
    : [];

  const matchingBinds = q
    ? binds.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.lines.some((l) => l.toLowerCase().includes(q))
      )
    : [];

  const totalResults =
    matchingOffenders.length +
    matchingCases.length +
    matchingArticles.length +
    matchingDocuments.length +
    matchingReports.length +
    matchingBinds.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-800 bg-slate-950/60">
          <Search className="w-5 h-5 text-amber-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по ЕИС: ФИО фигуранта, номер дела, статья УК, рапорт, отыгровка..."
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block bg-slate-800 text-[10px] font-mono text-slate-400 px-2 py-1 rounded border border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!q ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              <Search className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-40" />
              <p>Введите ключевые слова для поиска по всей базе данных СК РФ</p>
              <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-[11px] text-slate-400">
                <span className="bg-slate-800/60 px-2 py-1 rounded border border-slate-700/60">
                  Подозреваемые
                </span>
                <span className="bg-slate-800/60 px-2 py-1 rounded border border-slate-700/60">
                  Уголовные дела
                </span>
                <span className="bg-slate-800/60 px-2 py-1 rounded border border-slate-700/60">
                  Статьи УК РФ
                </span>
                <span className="bg-slate-800/60 px-2 py-1 rounded border border-slate-700/60">
                  RP-Бинды
                </span>
              </div>
            </div>
          ) : totalResults === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              <p>Ничего не найдено по запросу «{query}»</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Offenders Section */}
              {matchingOffenders.length > 0 && (
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-rose-400 font-semibold mb-2 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    <span>Картотека фигурантов и розыск ({matchingOffenders.length})</span>
                  </div>
                  <div className="space-y-1.5">
                    {matchingOffenders.slice(0, 4).map((off) => (
                      <div
                        key={off.id}
                        onClick={() => {
                          onSelectOffender(off);
                          onClose();
                        }}
                        className="p-2.5 rounded-lg bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-rose-500/40 cursor-pointer flex items-center justify-between transition group"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={off.photoUrl}
                            alt=""
                            className="w-8 h-8 rounded object-cover border border-slate-700"
                          />
                          <div>
                            <div className="text-xs font-semibold text-slate-200 group-hover:text-amber-300 transition">
                              {off.fullName}{' '}
                              {off.alias && (
                                <span className="text-amber-400/80 font-normal">
                                  ({off.alias})
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              Паспорт: {off.passportNumber} • Ст: {off.articles.join(', ')}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-rose-400 font-mono">
                            {'★'.repeat(off.wantedLevel)}
                          </span>
                          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-200" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cases Section */}
              {matchingCases.length > 0 && (
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-semibold mb-2 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>Уголовные дела ({matchingCases.length})</span>
                  </div>
                  <div className="space-y-1.5">
                    {matchingCases.slice(0, 4).map((c) => (
                      <div
                        key={c.id}
                        onClick={() => {
                          onSelectCase(c);
                          onClose();
                        }}
                        className="p-2.5 rounded-lg bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-cyan-500/40 cursor-pointer flex items-center justify-between transition group"
                      >
                        <div>
                          <div className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 transition">
                            <span className="text-amber-400 font-mono mr-2">{c.caseNumber}</span>
                            {c.title}
                          </div>
                          <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                            {c.summary}
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-200 shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Articles Section */}
              {matchingArticles.length > 0 && (
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-semibold mb-2 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Статьи УК РФ ({matchingArticles.length})</span>
                  </div>
                  <div className="space-y-1.5">
                    {matchingArticles.slice(0, 4).map((art) => (
                      <div
                        key={art.id}
                        onClick={() => {
                          onNavigate('lawbook');
                          onClose();
                        }}
                        className="p-2.5 rounded-lg bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-amber-500/40 cursor-pointer flex items-center justify-between transition group"
                      >
                        <div>
                          <div className="text-xs font-semibold text-slate-200 group-hover:text-amber-300 transition">
                            <span className="text-amber-400 font-mono mr-2">ст. {art.code}</span>
                            {art.title}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Срок: {art.termYears} лет • Розыск: {art.wantedLevel} зв.
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-200 shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* RP Binds Section */}
              {matchingBinds.length > 0 && (
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-semibold mb-2 flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5" />
                    <span>RP-Биндер ({matchingBinds.length})</span>
                  </div>
                  <div className="space-y-1.5">
                    {matchingBinds.slice(0, 3).map((bind) => (
                      <div
                        key={bind.id}
                        onClick={() => {
                          onNavigate('binder');
                          onClose();
                        }}
                        className="p-2.5 rounded-lg bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-emerald-500/40 cursor-pointer flex items-center justify-between transition group"
                      >
                        <div>
                          <div className="text-xs font-semibold text-slate-200 group-hover:text-emerald-300 transition">
                            {bind.title}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono line-clamp-1 mt-0.5">
                            {bind.lines[0]}
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-200 shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-slate-950/80 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between font-mono">
          <span>Найдено совпадений: {totalResults}</span>
          <span>ЕИС Следственного комитета РФ</span>
        </div>
      </div>
    </div>
  );
};
