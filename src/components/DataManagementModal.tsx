import React, { useState } from 'react';
import {
  Database,
  Download,
  Upload,
  RotateCcw,
  X,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  ShieldCheck,
  HardDrive
} from 'lucide-react';

interface DataManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: () => void;
  onImport: (jsonStr: string) => void;
  onReset: () => void;
  offendersCount: number;
  casesCount: number;
  reportsCount: number;
  documentsCount: number;
}

export const DataManagementModal: React.FC<DataManagementModalProps> = ({
  isOpen,
  onClose,
  onExport,
  onImport,
  onReset,
  offendersCount,
  casesCount,
  reportsCount,
  documentsCount
}) => {
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      if (content) {
        setImportText(content);
        setImportError(null);
      }
    };
    reader.onerror = () => {
      setImportError('Не удалось прочитать файл');
    };
    reader.readAsText(file);
  };

  const handleExecuteImport = () => {
    if (!importText.trim()) {
      setImportError('Вставьте JSON-код или загрузите файл резервной копии');
      return;
    }
    try {
      const parsed = JSON.parse(importText);
      if (!parsed || typeof parsed !== 'object') {
        setImportError('Некорректная структура JSON-файла');
        return;
      }
      onImport(importText);
      onClose();
    } catch {
      setImportError('Ошибка парсинга JSON: синтаксическая ошибка в данных');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2.5 text-slate-100 font-bold text-base">
            <Database className="w-5 h-5 text-amber-400" />
            <span>Управление базой данных ЕИС СК РФ</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Storage stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 text-center">
            <div>
              <div className="text-[10px] font-mono text-slate-400 uppercase">Досье</div>
              <div className="text-lg font-bold text-rose-400 font-mono">{offendersCount}</div>
            </div>
            <div>
              <div className="text-[10px] font-mono text-slate-400 uppercase">Дела</div>
              <div className="text-lg font-bold text-cyan-400 font-mono">{casesCount}</div>
            </div>
            <div>
              <div className="text-[10px] font-mono text-slate-400 uppercase">Рапорты</div>
              <div className="text-lg font-bold text-amber-400 font-mono">{reportsCount}</div>
            </div>
            <div>
              <div className="text-[10px] font-mono text-slate-400 uppercase">Бланки</div>
              <div className="text-lg font-bold text-emerald-400 font-mono">{documentsCount}</div>
            </div>
          </div>

          {/* Physical Database File Box */}
          <div className="bg-emerald-950/30 p-4 rounded-xl border border-emerald-500/40 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="w-5 h-5 text-emerald-400" />
                <div>
                  <div className="text-sm font-bold text-emerald-300">
                    Физическая база данных (database.json)
                  </div>
                  <div className="text-[11px] text-emerald-400/80">
                    Все действия, дела, отчеты и профили автоматически пишутся в файл на сервере
                  </div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold font-mono">
                ONLINE • АКТИВНА
              </span>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  fetch('/api/db/sync', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      timestamp: new Date().toISOString()
                    })
                  }).catch(() => {});
                  onExport();
                }}
                className="flex-1 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Синхронизировать и выгрузить БД</span>
              </button>
            </div>
          </div>

          {/* Export Section */}
          <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>Выгрузка резервной копии</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Сохраняет все уголовные дела, протоколы, досье и профиль следователя в JSON-файл
                </p>
              </div>
            </div>
            <button
              onClick={onExport}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-emerald-600/80 hover:bg-emerald-600 text-white text-xs font-semibold transition border border-emerald-500/40 shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Скачать резервную копию базы (.json)</span>
            </button>
          </div>

          {/* Import Section */}
          <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/80 space-y-3">
            <div>
              <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Upload className="w-4 h-4 text-cyan-400" />
                <span>Восстановление из резервной копии</span>
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Загрузите файл или вставьте JSON-код для восстановления состояния
              </p>
            </div>

            <div className="space-y-2">
              <label className="flex items-center justify-center gap-2 py-2 px-3 bg-slate-800/80 hover:bg-slate-750 text-slate-300 rounded-lg text-xs font-medium border border-slate-700 cursor-pointer transition">
                <FileCode className="w-4 h-4 text-cyan-400" />
                <span>Выбрать JSON-файл с диска</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <textarea
                value={importText}
                onChange={(e) => {
                  setImportText(e.target.value);
                  setImportError(null);
                }}
                placeholder="Или вставьте текст JSON резервной копии сюда..."
                rows={3}
                className="w-full bg-slate-950 text-slate-200 text-xs font-mono p-2.5 rounded-lg border border-slate-800 focus:border-cyan-500/60 focus:outline-none"
              />

              {importError && (
                <div className="text-xs text-rose-400 flex items-center gap-1.5 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{importError}</span>
                </div>
              )}

              <button
                onClick={handleExecuteImport}
                disabled={!importText.trim()}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-cyan-600/80 hover:bg-cyan-600 disabled:opacity-40 text-white text-xs font-semibold transition border border-cyan-500/40 shadow-sm"
              >
                <Upload className="w-4 h-4" />
                <span>Восстановить данные из файла</span>
              </button>
            </div>
          </div>

          {/* Reset Section */}
          <div className="bg-rose-950/20 p-4 rounded-xl border border-rose-900/40 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-rose-300 flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-rose-400" />
                  <span>Сброс к исходным демо-данным</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Сбрасывает все таблицы к стандартным следственным делам и фигурантам
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                onReset();
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-rose-900/40 hover:bg-rose-800/60 text-rose-200 text-xs font-semibold transition border border-rose-700/50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Сбросить данные к эталону</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-950/80 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
