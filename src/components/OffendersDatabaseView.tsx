import React, { useState } from 'react';
import { Offender, OffenderStatus, LawArticle } from '../types';
import {
  Search,
  UserPlus,
  ShieldAlert,
  Car,
  Fingerprint,
  Dna,
  Edit,
  Trash2,
  Share2,
  Printer,
  Copy,
  Check,
  AlertTriangle,
  X,
  Plus,
  Eye,
  SlidersHorizontal
} from 'lucide-react';
import { OfficialStampSeal } from './OfficialEmblem';
import { wantedPosterToBBCode } from '../utils/bbcode';

interface OffendersDatabaseViewProps {
  offenders: Offender[];
  articles: LawArticle[];
  onAddOffender: (offender: Offender) => void;
  onUpdateOffender: (offender: Offender) => void;
  onDeleteOffender: (id: string) => void;
  selectedOffenderId?: string | null;
  onShowToast: (msg: string) => void;
}

export const OffendersDatabaseView: React.FC<OffendersDatabaseViewProps> = ({
  offenders,
  articles,
  onAddOffender,
  onUpdateOffender,
  onDeleteOffender,
  selectedOffenderId,
  onShowToast
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dangerFilter, setDangerFilter] = useState<string>('all');

  const [activeOffender, setActiveOffender] = useState<Offender | null>(() => {
    if (selectedOffenderId) {
      return offenders.find((o) => o.id === selectedOffenderId) || null;
    }
    return null;
  });

  React.useEffect(() => {
    if (selectedOffenderId) {
      const found = offenders.find((o) => o.id === selectedOffenderId);
      if (found) {
        setActiveOffender(found);
      }
    }
  }, [selectedOffenderId, offenders]);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isBoloModalOpen, setIsBoloModalOpen] = useState(false);
  const [editingOffender, setEditingOffender] = useState<Partial<Offender> | null>(null);

  // Filtered offenders list
  const filteredOffenders = offenders.filter((o) => {
    const matchesSearch =
      o.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.alias && o.alias.toLowerCase().includes(searchQuery.toLowerCase())) ||
      o.passportNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.vehiclePlate && o.vehiclePlate.toLowerCase().includes(searchQuery.toLowerCase())) ||
      o.articles.some((art) => art.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (o.faction && o.faction.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchesDanger = dangerFilter === 'all' || o.dangerLevel === dangerFilter;

    return matchesSearch && matchesStatus && matchesDanger;
  });

  const handleOpenCreateModal = () => {
    setEditingOffender({
      id: `off-${Date.now()}`,
      fullName: '',
      alias: '',
      gender: 'Мужской',
      birthDate: '01.01.1990',
      passportNumber: '4500 ' + Math.floor(100000 + Math.random() * 900000),
      phone: '555-' + Math.floor(1000 + Math.random() * 9000),
      status: 'wanted',
      wantedLevel: 3,
      wantedReason: '',
      faction: '',
      photoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
      articles: ['158 ч.2'],
      fingerprintsScanned: true,
      dnaScanned: false,
      address: '',
      vehicle: '',
      vehiclePlate: '',
      distinctiveMarks: 'Особых примет нет',
      dangerLevel: 'Средний',
      notes: '',
      arrestCount: 0,
      addedAt: new Date().toLocaleDateString('ru-RU'),
      updatedAt: new Date().toLocaleDateString('ru-RU')
    });
    setIsEditModalOpen(true);
  };

  const handleOpenEditModal = (offender: Offender) => {
    setEditingOffender({ ...offender });
    setIsEditModalOpen(true);
  };

  const handleSaveOffender = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOffender || !editingOffender.fullName) return;

    const fullObj = {
      ...editingOffender,
      updatedAt: new Date().toLocaleDateString('ru-RU')
    } as Offender;

    const exists = offenders.some((o) => o.id === fullObj.id);
    if (exists) {
      onUpdateOffender(fullObj);
      onShowToast(`Досье гражданина ${fullObj.fullName} обновлено`);
    } else {
      onAddOffender(fullObj);
      onShowToast(`Гражданин ${fullObj.fullName} внесен в базу данных`);
    }

    setActiveOffender(fullObj);
    setIsEditModalOpen(false);
    setEditingOffender(null);
  };

  const handleToggleWantedStatus = (offender: Offender) => {
    const newStatus: OffenderStatus = offender.status === 'wanted' ? 'on_probation' : 'wanted';
    const updated = {
      ...offender,
      status: newStatus,
      wantedLevel: newStatus === 'wanted' ? Math.max(1, offender.wantedLevel) : 0,
      updatedAt: new Date().toLocaleDateString('ru-RU')
    };
    onUpdateOffender(updated);
    setActiveOffender(updated);
    onShowToast(
      newStatus === 'wanted'
        ? `Гражданин ${offender.fullName} объявлен в федеральный розыск!`
        : `Розыск с гражданина ${offender.fullName} снят`
    );
  };

  const handleCopyBBCode = (offender: Offender) => {
    const bb = wantedPosterToBBCode(offender);
    navigator.clipboard.writeText(bb);
    onShowToast('BB-код ориентировки скопирован в буфер обмена!');
  };

  const getStatusBadge = (status: OffenderStatus) => {
    switch (status) {
      case 'wanted':
        return (
          <span className="bg-rose-500/15 text-rose-400 border border-rose-500/30 px-2.5 py-0.5 rounded text-xs font-semibold flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5" /> В розыске
          </span>
        );
      case 'detained':
        return (
          <span className="bg-amber-500/15 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded text-xs font-semibold">
            Задержан (ст. 91)
          </span>
        );
      case 'arrested':
        return (
          <span className="bg-purple-500/15 text-purple-400 border border-purple-500/30 px-2.5 py-0.5 rounded text-xs font-semibold">
            Под стражей (СИЗО)
          </span>
        );
      case 'on_probation':
        return (
          <span className="bg-blue-500/15 text-blue-400 border border-blue-500/30 px-2.5 py-0.5 rounded text-xs font-semibold">
            Подписка о невыезде
          </span>
        );
      case 'cleared':
        return (
          <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded text-xs font-semibold">
            Дело прекращено
          </span>
        );
      default:
        return (
          <span className="bg-slate-800 text-slate-300 border border-slate-700 px-2.5 py-0.5 rounded text-xs font-semibold">
            Свидетель
          </span>
        );
    }
  };

  const getDangerBadge = (danger: Offender['dangerLevel']) => {
    switch (danger) {
      case 'Особо опасен':
        return 'bg-rose-950 text-rose-300 border-rose-600/60 animate-pulse';
      case 'Высокий':
        return 'bg-orange-950 text-orange-300 border-orange-600/40';
      case 'Средний':
        return 'bg-amber-950 text-amber-300 border-amber-600/40';
      default:
        return 'bg-slate-900 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Search Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-500" />
            База данных правонарушителей и подозреваемых
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Федеральный розыск, досье граждан, биометрия, инкриминируемые статьи и оперативный учет
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs sm:text-sm font-semibold transition shadow-md"
        >
          <UserPlus className="w-4 h-4" />
          <span>Внести новое досье</span>
        </button>
      </div>

      {/* Filters Strip */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по ФИО, кличке, паспорту, госномеру авто, банде или статье..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/60"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-amber-500/60"
          >
            <option value="all">Все статусы</option>
            <option value="wanted">В розыске</option>
            <option value="detained">Задержан (ст. 91)</option>
            <option value="arrested">Под стражей (СИЗО)</option>
            <option value="on_probation">Подписка о невыезде</option>
            <option value="cleared">Дело прекращено</option>
            <option value="witness">Свидетель</option>
          </select>

          <select
            value={dangerFilter}
            onChange={(e) => setDangerFilter(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-amber-500/60"
          >
            <option value="all">Любая опасность</option>
            <option value="Особо опасен">Особо опасен</option>
            <option value="Высокий">Высокий</option>
            <option value="Средний">Средний</option>
            <option value="Низкий">Низкий</option>
          </select>
        </div>
      </div>

      {/* Main Content: 2-Columns (List & Active Dossier) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Offenders List (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-mono text-slate-400 px-1 flex justify-between items-center">
            <span>Найдено записей: {filteredOffenders.length}</span>
            <span className="text-rose-400">
              В розыске: {filteredOffenders.filter((o) => o.status === 'wanted').length}
            </span>
          </div>

          <div className="space-y-2.5 max-h-[750px] overflow-y-auto pr-1">
            {filteredOffenders.length === 0 ? (
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8 text-center text-slate-400 text-sm">
                Ни одного фигуранта не найдено по заданным параметрам.
              </div>
            ) : (
              filteredOffenders.map((offender) => {
                const isSelected = activeOffender?.id === offender.id;
                return (
                  <div
                    key={offender.id}
                    onClick={() => setActiveOffender(offender)}
                    className={`cursor-pointer border rounded-xl p-3.5 transition group flex items-start gap-3.5 ${
                      isSelected
                        ? 'bg-slate-850 border-amber-500/60 shadow-md ring-1 ring-amber-500/20'
                        : 'bg-slate-900/80 hover:bg-slate-850 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <img
                      src={offender.photoUrl}
                      alt={offender.fullName}
                      className="w-14 h-14 rounded-lg object-cover border border-slate-700 flex-shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <div>
                          <h4 className="text-sm font-bold text-slate-100 truncate group-hover:text-amber-300 transition">
                            {offender.fullName}
                          </h4>
                          {offender.alias && (
                            <span className="text-xs text-amber-400 font-medium">
                              {offender.alias}
                            </span>
                          )}
                        </div>

                        {offender.wantedLevel > 0 && (
                          <span className="text-xs font-mono font-bold text-rose-400">
                            {'★'.repeat(offender.wantedLevel)}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        {getStatusBadge(offender.status)}
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded border font-mono ${getDangerBadge(
                            offender.dangerLevel
                          )}`}
                        >
                          {offender.dangerLevel}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1 mt-2">
                        {offender.articles.slice(0, 3).map((art, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-950 text-slate-300 border border-slate-800"
                          >
                            ст. {art}
                          </span>
                        ))}
                        {offender.articles.length > 3 && (
                          <span className="text-[10px] font-mono text-slate-500">
                            +{offender.articles.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Full Selected Dossier (7 cols on lg) */}
        <div className="lg:col-span-7">
          {activeOffender ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 shadow-xl space-y-6 sticky top-20">
              {/* Dossier Header */}
              <div className="flex flex-col sm:flex-row items-start justify-between gap-4 pb-4 border-b border-slate-800">
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <img
                      src={activeOffender.photoUrl}
                      alt={activeOffender.fullName}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover border-2 border-slate-700 shadow-md"
                    />
                    {activeOffender.status === 'wanted' && (
                      <span className="absolute -top-2 -right-2 bg-rose-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
                        РОЗЫСК
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono text-slate-400">
                        ID: {activeOffender.id}
                      </span>
                      {getStatusBadge(activeOffender.status)}
                    </div>
                    <h3 className="text-xl font-bold text-slate-100 mt-1">
                      {activeOffender.fullName}
                    </h3>
                    {activeOffender.alias && (
                      <div className="text-sm font-semibold text-amber-400">
                        Позывной / Кличка: {activeOffender.alias}
                      </div>
                    )}
                    <div className="text-xs text-slate-400 mt-1">
                      Дата рождения: {activeOffender.birthDate} ({activeOffender.gender})
                    </div>
                  </div>
                </div>

                {/* Dossier Actions */}
                <div className="flex flex-wrap sm:flex-col gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setIsBoloModalOpen(true)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 bg-rose-600/90 hover:bg-rose-600 text-white rounded-lg text-xs font-semibold transition border border-rose-500/40 shadow-sm"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Ориентировка</span>
                  </button>
                  <button
                    onClick={() => handleToggleWantedStatus(activeOffender)}
                    className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
                      activeOffender.status === 'wanted'
                        ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/80'
                        : 'bg-rose-950/80 text-rose-300 border-rose-500/40 hover:bg-rose-900/80'
                    }`}
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>
                      {activeOffender.status === 'wanted' ? 'Снять розыск' : 'Объявить в розыск'}
                    </span>
                  </button>
                  <button
                    onClick={() => handleOpenEditModal(activeOffender)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-slate-100 rounded-lg text-xs font-medium transition border border-slate-700"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Редактировать</span>
                  </button>
                </div>
              </div>

              {/* Grid of Key Dossier Parameters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3 space-y-2">
                  <div className="text-slate-400 font-medium">Паспортные данные</div>
                  <div className="text-slate-200 font-mono font-semibold">
                    {activeOffender.passportNumber}
                  </div>
                  <div className="text-slate-400 font-medium pt-1 border-t border-slate-850">
                    Номер телефона
                  </div>
                  <div className="text-slate-200 font-mono">
                    {activeOffender.phone || 'Не установлен'}
                  </div>
                  <div className="text-slate-400 font-medium pt-1 border-t border-slate-850">
                    Адрес регистрации / проживания
                  </div>
                  <div className="text-slate-200">
                    {activeOffender.address || 'Без определенного места жительства'}
                  </div>
                </div>

                <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3 space-y-2">
                  <div className="text-slate-400 font-medium">Принадлежность к группировкам</div>
                  <div className="text-amber-400 font-semibold">
                    {activeOffender.faction || 'Одиночка / Не состоит'}
                  </div>
                  <div className="text-slate-400 font-medium pt-1 border-t border-slate-850">
                    Транспортное средство
                  </div>
                  <div className="text-slate-200 flex items-center gap-1.5">
                    <Car className="w-3.5 h-3.5 text-slate-500" />
                    <span>{activeOffender.vehicle || 'Не зарегистрировано'} ({activeOffender.vehiclePlate || 'б/н'})</span>
                  </div>
                  <div className="text-slate-400 font-medium pt-1 border-t border-slate-850">
                    Опасность для сотрудников
                  </div>
                  <div className="text-rose-400 font-bold">
                    {activeOffender.dangerLevel}
                  </div>
                </div>
              </div>

              {/* Biometrics & Special marks */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3.5 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-300 font-semibold">
                  <span>Биометрические данные и криминалистический учет</span>
                  <div className="flex items-center gap-3 font-mono">
                    <span className={`flex items-center gap-1 ${activeOffender.fingerprintsScanned ? 'text-emerald-400' : 'text-slate-500'}`}>
                      <Fingerprint className="w-3.5 h-3.5" /> Дакт-карта: {activeOffender.fingerprintsScanned ? 'Есть' : 'Нет'}
                    </span>
                    <span className={`flex items-center gap-1 ${activeOffender.dnaScanned ? 'text-cyan-400' : 'text-slate-500'}`}>
                      <Dna className="w-3.5 h-3.5" /> ДНК: {activeOffender.dnaScanned ? 'Есть' : 'Нет'}
                    </span>
                  </div>
                </div>
                <div className="pt-2 text-slate-300 leading-relaxed">
                  <strong className="text-slate-400">Особые приметы: </strong>
                  {activeOffender.distinctiveMarks}
                </div>
              </div>

              {/* Criminal Articles */}
              <div>
                <div className="text-xs font-semibold text-slate-300 mb-2 flex items-center justify-between">
                  <span>Инкриминируемые статьи Уголовного кодекса РФ</span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Всего: {activeOffender.articles.length}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {activeOffender.articles.map((artCode, idx) => {
                    const foundArt = articles.find((a) => a.code === artCode);
                    return (
                      <div
                        key={idx}
                        className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs flex-1 min-w-[200px]"
                      >
                        <div className="font-mono font-bold text-amber-400">
                          ст. {artCode} УК РФ
                        </div>
                        <div className="text-slate-300 font-medium line-clamp-1 mt-0.5">
                          {foundArt ? foundArt.title : 'Преступление против закона'}
                        </div>
                        {foundArt && (
                          <div className="text-[10px] text-slate-400 mt-1">
                            До {foundArt.termYears} лет лишения свободы
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Wanted Reason & Notes */}
              {activeOffender.wantedReason && (
                <div className="bg-rose-950/30 border border-rose-900/50 rounded-lg p-3 text-xs">
                  <div className="text-rose-400 font-bold mb-1 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Основание для розыска:
                  </div>
                  <p className="text-rose-200 leading-relaxed">
                    {activeOffender.wantedReason}
                  </p>
                </div>
              )}

              {activeOffender.notes && (
                <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3 text-xs">
                  <div className="text-slate-400 font-semibold mb-1">Служебные пометки следователя:</div>
                  <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {activeOffender.notes}
                  </p>
                </div>
              )}

              {/* Footer info */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-[11px] text-slate-500 font-mono">
                <span>Внесено в ЕИС: {activeOffender.addedAt}</span>
                <span>Обновлено: {activeOffender.updatedAt}</span>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/50 border border-slate-800 border-dashed rounded-xl p-12 text-center text-slate-400 space-y-3">
              <ShieldAlert className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-base font-semibold text-slate-300">
                Фигурант не выбран
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Выберите гражданина из списка слева для просмотра полного следственного досье или добавьте новую запись.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Create / Edit Offender */}
      {isEditModalOpen && editingOffender && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-slate-100">
                {offenders.some((o) => o.id === editingOffender.id)
                  ? 'Редактирование досье гражданина'
                  : 'Внесение нового гражданина / подозреваемого в базу'}
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveOffender} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1">ФИО гражданина *</label>
                  <input
                    type="text"
                    required
                    value={editingOffender.fullName || ''}
                    onChange={(e) =>
                      setEditingOffender({ ...editingOffender, fullName: e.target.value })
                    }
                    placeholder="Иванов Иван Иванович"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Позывной / Кличка / Псевдоним</label>
                  <input
                    type="text"
                    value={editingOffender.alias || ''}
                    onChange={(e) =>
                      setEditingOffender({ ...editingOffender, alias: e.target.value })
                    }
                    placeholder="«Тень», «Бурый»..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Дата рождения</label>
                  <input
                    type="text"
                    value={editingOffender.birthDate || ''}
                    onChange={(e) =>
                      setEditingOffender({ ...editingOffender, birthDate: e.target.value })
                    }
                    placeholder="ДД.ММ.ГГГГ"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Паспортные данные / ID</label>
                  <input
                    type="text"
                    value={editingOffender.passportNumber || ''}
                    onChange={(e) =>
                      setEditingOffender({ ...editingOffender, passportNumber: e.target.value })
                    }
                    placeholder="Серия и номер"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Статус в ЕИС</label>
                  <select
                    value={editingOffender.status || 'wanted'}
                    onChange={(e) =>
                      setEditingOffender({
                        ...editingOffender,
                        status: e.target.value as OffenderStatus
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="wanted">В федеральном розыске</option>
                    <option value="detained">Задержан (ст. 91 УПК)</option>
                    <option value="arrested">Под стражей (СИЗО)</option>
                    <option value="on_probation">Подписка о невыезде</option>
                    <option value="cleared">Дело прекращено / Оправдан</option>
                    <option value="witness">Свидетель</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Уровень розыска (Звёзды)</label>
                  <select
                    value={editingOffender.wantedLevel ?? 1}
                    onChange={(e) =>
                      setEditingOffender({
                        ...editingOffender,
                        wantedLevel: parseInt(e.target.value)
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value={0}>0 (Нет розыска)</option>
                    <option value={1}>★ 1 уровень</option>
                    <option value={2}>★★ 2 уровень</option>
                    <option value={3}>★★★ 3 уровень</option>
                    <option value={4}>★★★★ 4 уровень</option>
                    <option value={5}>★★★★★ 5 уровень</option>
                    <option value={6}>★★★★★★ 6 уровень (Особо опасен)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Степень опасности</label>
                  <select
                    value={editingOffender.dangerLevel || 'Средний'}
                    onChange={(e) =>
                      setEditingOffender({
                        ...editingOffender,
                        dangerLevel: e.target.value as Offender['dangerLevel']
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Низкий">Низкий</option>
                    <option value="Средний">Средний</option>
                    <option value="Высокий">Высокий</option>
                    <option value="Особо опасен">Особо опасен</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Ссылка на фото / Фоторобот (URL)</label>
                  <input
                    type="text"
                    value={editingOffender.photoUrl || ''}
                    onChange={(e) =>
                      setEditingOffender({ ...editingOffender, photoUrl: e.target.value })
                    }
                    placeholder="https://..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Причастность к группировкам / ОПГ</label>
                <input
                  type="text"
                  value={editingOffender.faction || ''}
                  onChange={(e) =>
                    setEditingOffender({ ...editingOffender, faction: e.target.value })
                  }
                  placeholder="ОПГ «Северная», Мафия, Байкеры..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1">Автомобиль</label>
                  <input
                    type="text"
                    value={editingOffender.vehicle || ''}
                    onChange={(e) =>
                      setEditingOffender({ ...editingOffender, vehicle: e.target.value })
                    }
                    placeholder="BMW M5 F90, Mercedes..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Госномер авто</label>
                  <input
                    type="text"
                    value={editingOffender.vehiclePlate || ''}
                    onChange={(e) =>
                      setEditingOffender({ ...editingOffender, vehiclePlate: e.target.value })
                    }
                    placeholder="Е777КХ 777"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">
                  Статьи УК РФ (через запятую, напр: 105 ч.2, 222 ч.1)
                </label>
                <input
                  type="text"
                  value={editingOffender.articles?.join(', ') || ''}
                  onChange={(e) =>
                    setEditingOffender({
                      ...editingOffender,
                      articles: e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                    })
                  }
                  placeholder="105 ч.1, 162 ч.2"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Особые приметы</label>
                <input
                  type="text"
                  value={editingOffender.distinctiveMarks || ''}
                  onChange={(e) =>
                    setEditingOffender({ ...editingOffender, distinctiveMarks: e.target.value })
                  }
                  placeholder="Татуировки, шрамы, рост, особенности походки..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Основание розыска / Фабула правонарушения</label>
                <textarea
                  rows={2}
                  value={editingOffender.wantedReason || ''}
                  onChange={(e) =>
                    setEditingOffender({ ...editingOffender, wantedReason: e.target.value })
                  }
                  placeholder="Описание преступления, обстоятельства побега..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center gap-4 py-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingOffender.fingerprintsScanned || false}
                    onChange={(e) =>
                      setEditingOffender({
                        ...editingOffender,
                        fingerprintsScanned: e.target.checked
                      })
                    }
                    className="rounded bg-slate-950 border-slate-800 text-amber-500 focus:ring-0"
                  />
                  <span className="text-slate-300">Отпечатки в базе АДИС</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingOffender.dnaScanned || false}
                    onChange={(e) =>
                      setEditingOffender({
                        ...editingOffender,
                        dnaScanned: e.target.checked
                      })
                    }
                    className="rounded bg-slate-950 border-slate-800 text-amber-500 focus:ring-0"
                  />
                  <span className="text-slate-300">ДНК-профиль занесен</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition"
                >
                  Сохранить досье
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: BOLO Wanted Announcement Poster */}
      {isBoloModalOpen && activeOffender && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full p-6 shadow-2xl space-y-6 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-rose-400 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5" />
                Ориентировка на розыск гражданина (BOLO)
              </h3>
              <button
                onClick={() => setIsBoloModalOpen(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Poster Preview Card */}
            <div className="bg-white text-slate-950 p-6 rounded-lg border-4 border-rose-700 shadow-inner relative overflow-hidden font-serif-official">
              <div className="text-center border-b-2 border-rose-700 pb-3 mb-4">
                <div className="text-rose-700 text-xl font-bold uppercase tracking-widest">
                  ВНИМАНИЕ! РОЗЫСК!
                </div>
                <div className="text-xs font-bold uppercase tracking-tight text-slate-800">
                  Главное следственное управление Следственного комитета РФ
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-5 items-start">
                <div className="w-36 h-44 border-2 border-slate-900 flex-shrink-0 relative overflow-hidden bg-slate-100">
                  <img
                    src={activeOffender.photoUrl}
                    alt={activeOffender.fullName}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-rose-700 text-white text-[10px] text-center font-bold font-sans py-0.5">
                    {activeOffender.dangerLevel.toUpperCase()}
                  </div>
                </div>

                <div className="flex-1 text-xs space-y-1.5 font-sans">
                  <div className="text-lg font-bold text-slate-900 font-serif-official leading-tight">
                    {activeOffender.fullName} {activeOffender.alias && `(${activeOffender.alias})`}
                  </div>
                  <div>
                    <strong>Дата рождения:</strong> {activeOffender.birthDate} | <strong>Паспорт:</strong> {activeOffender.passportNumber}
                  </div>
                  <div>
                    <strong>Особые приметы:</strong> {activeOffender.distinctiveMarks}
                  </div>
                  {activeOffender.vehicle && (
                    <div>
                      <strong>Транспорт:</strong> {activeOffender.vehicle} ({activeOffender.vehiclePlate || 'б/н'})
                    </div>
                  )}
                  <div>
                    <strong>Инкриминируемые статьи:</strong>{' '}
                    <span className="font-mono font-bold text-rose-700">
                      {activeOffender.articles.join(', ')} УК РФ
                    </span>
                  </div>
                  <div className="pt-1.5 text-slate-800 leading-snug">
                    <strong>Основание розыска:</strong> {activeOffender.wantedReason || 'Совершение тяжкого преступления.'}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-300 flex items-center justify-between text-[11px] font-sans">
                <div className="text-rose-800 font-bold">
                  Вооружен и опасен! Тел. дежурной части СК: 112 / 02
                </div>
                <OfficialStampSeal className="w-24 h-24 absolute right-4 bottom-2 opacity-80" />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold"
              >
                <Printer className="w-4 h-4" />
                <span>Распечатать</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyBBCode(activeOffender)}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold transition"
                >
                  <Copy className="w-4 h-4" />
                  <span>Скопировать BB-Code для форума</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
