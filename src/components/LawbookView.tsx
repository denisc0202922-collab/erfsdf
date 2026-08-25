import React, { useState } from 'react';
import { LawArticle } from '../types';
import {
  BookOpen,
  Search,
  Calculator,
  ShieldAlert,
  Coins,
  Clock,
  CheckCircle2,
  XCircle,
  Copy,
  RotateCcw,
  Sparkles,
  Layers
} from 'lucide-react';

interface LawbookViewProps {
  articles: LawArticle[];
  onShowToast: (msg: string) => void;
}

export const LawbookView: React.FC<LawbookViewProps> = ({ articles, onShowToast }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedArticleIds, setSelectedArticleIds] = useState<string[]>([]);

  const filteredArticles = articles.filter((art) => {
    const matchesSearch =
      art.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.chapter.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCat = categoryFilter === 'all' || art.category === categoryFilter;

    return matchesSearch && matchesCat;
  });

  const toggleArticleSelection = (id: string) => {
    if (selectedArticleIds.includes(id)) {
      setSelectedArticleIds(selectedArticleIds.filter((item) => item !== id));
    } else {
      setSelectedArticleIds([...selectedArticleIds, id]);
    }
  };

  const selectedArticles = articles.filter((a) => selectedArticleIds.includes(a.id));

  // Cumulative penalties calculation (ст. 69 УК РФ - Совокупность преступлений)
  const totalTerm = selectedArticles.reduce((acc, a) => acc + a.termYears, 0);
  const totalFine = selectedArticles.reduce((acc, a) => acc + a.fine, 0);
  const maxWantedLevel = selectedArticles.length
    ? Math.min(6, Math.max(...selectedArticles.map((a) => a.wantedLevel)))
    : 0;
  const isBailAllowed =
    selectedArticles.length > 0 && selectedArticles.every((a) => a.bailAllowed);

  const handleCopyCharge = () => {
    if (!selectedArticles.length) return;
    const codes = selectedArticles.map((a) => `ст. ${a.code} УК РФ`).join(', ');
    const text = `Квалификация обвинения: ${codes}\nСовокупный срок: до ${totalTerm} лет лишения свободы\nШтраф: ${totalFine.toLocaleString('ru-RU')} руб.\nУровень розыска: ${maxWantedLevel} звезд\nПраво на залог: ${isBailAllowed ? 'Разрешен' : 'Запрещен (Тяжкая/Особо тяжкая статья)'}`;
    navigator.clipboard.writeText(text);
    onShowToast('Расчет обвинения скопирован в буфер обмена!');
  };

  const getCategoryLabel = (cat: LawArticle['category']) => {
    switch (cat) {
      case 'life_health':
        return 'Против жизни и здоровья';
      case 'property':
        return 'Против собственности';
      case 'public_safety':
        return 'Общественная безопасность';
      case 'state_power':
        return 'Против гос. власти';
      case 'drugs_weapons':
        return 'Оружие и наркотики';
      default:
        return 'Иные составы';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            Уголовный кодекс РФ & Интерактивный калькулятор наказаний
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Справочник статей, сроки лишения свободы, калькулятор совокупности преступлений (ст. 69 УК РФ)
          </p>
        </div>

        {selectedArticleIds.length > 0 && (
          <button
            onClick={() => setSelectedArticleIds([])}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Сбросить выбор ({selectedArticleIds.length})</span>
          </button>
        )}
      </div>

      {/* Main 2-Column: Articles List & Sticky Penalty Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Articles Browser (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Filters */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5 flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск по номеру статьи, названию или ключевым словам..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-amber-500/60"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-amber-500/60"
            >
              <option value="all">Все разделы УК</option>
              <option value="life_health">Жизнь и здоровье</option>
              <option value="property">Собственность</option>
              <option value="public_safety">Общественная безопасность</option>
              <option value="drugs_weapons">Оружие и наркотики</option>
              <option value="state_power">Гос. власть и взятки</option>
            </select>
          </div>

          {/* Articles list */}
          <div className="space-y-3 max-h-[750px] overflow-y-auto pr-1">
            {filteredArticles.map((art) => {
              const isSelected = selectedArticleIds.includes(art.id);
              return (
                <div
                  key={art.id}
                  onClick={() => toggleArticleSelection(art.id)}
                  className={`cursor-pointer border rounded-xl p-4 transition ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500/60 shadow-md ring-1 ring-amber-500/20'
                      : 'bg-slate-900/80 hover:bg-slate-850 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}} // handled by parent onClick
                        className="rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-0"
                      />
                      <span className="text-sm font-mono font-bold text-amber-400">
                        ст. {art.code} УК РФ
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-950 text-slate-400 border border-slate-800">
                        {getCategoryLabel(art.category)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-mono font-bold text-rose-400">
                        {'★'.repeat(art.wantedLevel)}
                      </span>
                    </div>
                  </div>

                  <h4 className="text-xs sm:text-sm font-bold text-slate-100 mt-2">
                    {art.title}
                  </h4>

                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {art.description}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2 border-t border-slate-850 text-xs">
                    <div className="flex items-center gap-3 text-slate-300 font-mono text-[11px]">
                      <span className="flex items-center gap-1 text-cyan-400">
                        <Clock className="w-3.5 h-3.5" /> Срок: до {art.termYears} лет
                      </span>
                      <span className="flex items-center gap-1 text-emerald-400">
                        <Coins className="w-3.5 h-3.5" /> Штраф: {art.fine.toLocaleString('ru-RU')} ₽
                      </span>
                    </div>

                    <div>
                      {art.bailAllowed ? (
                        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          Залог разрешен
                        </span>
                      ) : (
                        <span className="text-[10px] text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                          Залог запрещен
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Sticky Penalty Calculator (5 cols) */}
        <div className="lg:col-span-5">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 shadow-xl space-y-5 sticky top-20">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <Calculator className="w-4 h-4" />
                <span>Калькулятор совокупности наказаний</span>
              </div>
              <span className="text-xs font-mono bg-slate-950 px-2 py-0.5 rounded text-slate-400 border border-slate-800">
                Выбрано: {selectedArticles.length}
              </span>
            </div>

            {selectedArticles.length > 0 ? (
              <div className="space-y-4 text-xs">
                {/* Selected articles tags */}
                <div className="space-y-1.5">
                  <div className="text-slate-400 font-medium">Инкриминируемые составы:</div>
                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                    {selectedArticles.map((art) => (
                      <div
                        key={art.id}
                        className="bg-slate-950 border border-amber-500/40 text-amber-300 px-2 py-1 rounded flex items-center gap-1.5 font-mono text-[11px]"
                      >
                        <span>ст. {art.code}</span>
                        <button
                          onClick={() => toggleArticleSelection(art.id)}
                          className="hover:text-rose-400"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Calculation Cards */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-center">
                    <div className="text-slate-400 text-[10px]">Совокупный срок</div>
                    <div className="text-xl font-bold text-cyan-400 font-mono mt-0.5">
                      до {totalTerm} лет
                    </div>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-center">
                    <div className="text-slate-400 text-[10px]">Уровень розыска</div>
                    <div className="text-xl font-bold text-rose-400 font-mono mt-0.5">
                      {maxWantedLevel > 0 ? '★'.repeat(maxWantedLevel) : '—'}
                    </div>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-center col-span-2">
                    <div className="text-slate-400 text-[10px]">Штрафные санкции</div>
                    <div className="text-lg font-bold text-emerald-400 font-mono mt-0.5">
                      {totalFine.toLocaleString('ru-RU')} ₽
                    </div>
                  </div>
                </div>

                {/* Bail eligibility status */}
                <div
                  className={`p-3 rounded-lg border flex items-center gap-2.5 text-xs ${
                    isBailAllowed
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                      : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                  }`}
                >
                  {isBailAllowed ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                      <span>Выход под залог процессуально допустим (нетяжкие составы)</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                      <span>Выход под залог категорически запрещен (тяжкие / особо тяжкие статьи)</span>
                    </>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-2 space-y-2">
                  <button
                    onClick={handleCopyCharge}
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg font-bold transition flex items-center justify-center gap-2 shadow-sm text-xs"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Скопировать расчет в буфер</span>
                  </button>
                  <button
                    onClick={() => setSelectedArticleIds([])}
                    className="w-full py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-slate-200 rounded-lg text-[11px] transition"
                  >
                    Очистить калькулятор
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 text-xs space-y-2">
                <Layers className="w-8 h-8 mx-auto text-slate-600" />
                <p>
                  Отметьте галочками одну или несколько статей из списка слева для автоматического расчета совокупного наказания по ст. 69 УК РФ.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
