import React, { useState } from 'react';
import { RPBinderEntry, OfficerProfile } from '../types';
import {
  Keyboard,
  Copy,
  PlusCircle,
  Search,
  Filter,
  Check,
  Sparkles,
  Terminal,
  Trash2,
  Edit,
  X,
  Play,
  Share2
} from 'lucide-react';

interface RPBinderViewProps {
  binds: RPBinderEntry[];
  officer: OfficerProfile;
  onAddBind: (bind: RPBinderEntry) => void;
  onDeleteBind: (id: string) => void;
  onShowToast: (msg: string) => void;
}

export const RPBinderView: React.FC<RPBinderViewProps> = ({
  binds,
  officer,
  onAddBind,
  onDeleteBind,
  onShowToast
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isNewBindModalOpen, setIsNewBindModalOpen] = useState(false);

  // New bind form
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<RPBinderEntry['category']>('arrest');
  const [newHotkey, setNewHotkey] = useState('NUMPAD 1');
  const [newLinesText, setNewLinesText] = useState('');

  const formatLine = (rawLine: string) => {
    return rawLine
      .replace(/{officer_name}/g, officer.fullName)
      .replace(/{rank}/g, officer.rank)
      .replace(/{badge_number}/g, officer.badgeNumber)
      .replace(/{department}/g, officer.department)
      .replace(/{weapon}/g, officer.weaponType);
  };

  const filteredBinds = binds.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.lines.some((l) => l.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = categoryFilter === 'all' || b.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const handleCopySingleLine = (line: string, id: string) => {
    const formatted = formatLine(line);
    navigator.clipboard.writeText(formatted);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
    onShowToast(`Отыгровка скопирована: "${formatted.slice(0, 35)}..."`);
  };

  const handleCopyAllLines = (bind: RPBinderEntry) => {
    const allFormatted = bind.lines.map((l) => formatLine(l)).join('\n');
    navigator.clipboard.writeText(allFormatted);
    onShowToast(`Вся цепочка отыгровки «${bind.title}» (${bind.lines.length} строк) скопирована!`);
  };

  const handleSaveNewBind = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newLinesText) return;

    const lines = newLinesText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    const newEntry: RPBinderEntry = {
      id: `bind-${Date.now()}`,
      title: newTitle,
      category: newCategory,
      hotkey: newHotkey,
      lines
    };

    onAddBind(newEntry);
    setIsNewBindModalOpen(false);
    setNewTitle('');
    setNewLinesText('');
    onShowToast(`RP-бинд «${newEntry.title}» успешно сохранен!`);
  };

  const getCategoryLabel = (cat: RPBinderEntry['category']) => {
    switch (cat) {
      case 'arrest':
        return 'Задержание и арест';
      case 'search':
        return 'Обыск и изъятие';
      case 'interrogation':
        return 'Допрос и следствие';
      case 'patrol':
        return 'Выезд и ОМП';
      case 'radio':
        return 'Рация и департамент';
      case 'weapons':
        return 'Оружие и спецсредства';
      default:
        return 'Отыгровки';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-amber-400" />
            RP-Биндер и голосовые отыгровки следователя СК РФ
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Готовые команды /me, /do, /try, права задержанного (Миранда), протоколы досмотра и рация департамента
          </p>
        </div>

        <button
          onClick={() => setIsNewBindModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs sm:text-sm font-bold transition shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Добавить бинд</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по названию отыгровки или тексту команд (/me, /do)..."
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/60"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-amber-500/60"
        >
          <option value="all">Все категории отыгровок</option>
          <option value="arrest">Задержание и арест</option>
          <option value="search">Обыск и изъятие</option>
          <option value="interrogation">Допрос и следствие</option>
          <option value="patrol">Выезд и ОМП</option>
          <option value="radio">Рация департамента</option>
          <option value="weapons">Оружие и спецсредства</option>
        </select>
      </div>

      {/* Binds Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredBinds.map((bind) => (
          <div
            key={bind.id}
            className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-lg space-y-3 flex flex-col justify-between"
          >
            <div>
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-semibold">
                      {getCategoryLabel(bind.category)}
                    </span>
                    {bind.hotkey && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                        {bind.hotkey}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-slate-100">{bind.title}</h3>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleCopyAllLines(bind)}
                    title="Скопировать всю цепочку"
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteBind(bind.id)}
                    title="Удалить"
                    className="p-1.5 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 rounded transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Lines sequence */}
              <div className="space-y-1.5 mt-3">
                {bind.lines.map((line, idx) => {
                  const formatted = formatLine(line);
                  const isCopied = copiedId === `${bind.id}-${idx}`;

                  // Determine line color by command type
                  let textColor = 'text-slate-300';
                  if (formatted.startsWith('/me')) textColor = 'text-purple-300';
                  else if (formatted.startsWith('/do')) textColor = 'text-amber-300';
                  else if (formatted.startsWith('/try')) textColor = 'text-cyan-300';
                  else if (formatted.startsWith('/d')) textColor = 'text-blue-300';

                  return (
                    <div
                      key={idx}
                      onClick={() => handleCopySingleLine(line, `${bind.id}-${idx}`)}
                      className={`group cursor-pointer p-2 rounded-lg font-mono text-xs flex items-center justify-between transition border ${
                        isCopied
                          ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300'
                          : 'bg-slate-950/70 hover:bg-slate-850 border-slate-800/80'
                      }`}
                    >
                      <span className={`break-all ${textColor}`}>{formatted}</span>
                      <span className="opacity-0 group-hover:opacity-100 transition ml-2 flex-shrink-0 text-slate-400">
                        {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom quick tip */}
            <div className="pt-2 text-[10px] text-slate-500 flex justify-between font-mono">
              <span>Клик по строке копирует команду</span>
              <span>Строк: {bind.lines.length}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: New Bind */}
      {isNewBindModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-100">Создание нового RP-бинда</h3>
              <button
                onClick={() => setIsNewBindModalOpen(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNewBind} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Название бинда *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Предъявление служебного удостоверения / Обыск багажника..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Категория</label>
                  <select
                    value={newCategory}
                    onChange={(e) =>
                      setNewCategory(e.target.value as RPBinderEntry['category'])
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                  >
                    <option value="arrest">Задержание и арест</option>
                    <option value="search">Обыск и изъятие</option>
                    <option value="interrogation">Допрос и следствие</option>
                    <option value="patrol">Выезд и ОМП</option>
                    <option value="radio">Рация департамента</option>
                    <option value="weapons">Оружие и спецсредства</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Горячая клавиша (Хоткей)</label>
                  <input
                    type="text"
                    value={newHotkey}
                    onChange={(e) => setNewHotkey(e.target.value)}
                    placeholder="NUMPAD 1 / Alt+1"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-slate-400">
                    Текст строк отыгровки (каждая команда с новой строки) *
                  </label>
                </div>
                <textarea
                  rows={5}
                  required
                  value={newLinesText}
                  onChange={(e) => setNewLinesText(e.target.value)}
                  placeholder="/me достал из внутреннего кармана удостоверение СК РФ&#10;/do В развернутом виде: «{rank} {officer_name}».&#10;/me предъявил удостоверение гражданину напротив"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 font-mono text-[11px]"
                />
                <p className="text-[10px] text-slate-500 mt-1 font-mono">
                  Переменные: {`{officer_name}, {rank}, {badge_number}, {department}`}
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewBindModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-500 text-slate-950 font-bold rounded-lg"
                >
                  Сохранить бинд
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
