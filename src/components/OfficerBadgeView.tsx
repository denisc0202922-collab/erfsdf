import React, { useState } from 'react';
import { OfficerProfile, RankType, DepartmentType, UserAccount, DepartmentItem } from '../types';
import {
  IdCard,
  ShieldCheck,
  Award,
  Lock,
  Copy,
  Check,
  Printer,
  Sparkles,
  User,
  ShieldAlert,
  Edit3,
  ExternalLink,
  ChevronRight,
  FileBadge,
  Maximize2,
  X,
  Crosshair,
  BadgeAlert,
  Camera,
  Upload,
  Image as ImageIcon,
  Link as LinkIcon
} from 'lucide-react';
import { OfficialEmblem, OfficialStampSeal } from './OfficialEmblem';
import { OfficerPhoto } from './OfficerPhoto';
import { saveAccounts } from '../utils/storage';

interface OfficerBadgeViewProps {
  officer: OfficerProfile;
  userRole?: string;
  isAdmin?: boolean;
  accounts?: UserAccount[];
  departments?: DepartmentItem[];
  onUpdateOfficer: (officer: OfficerProfile) => void;
  onSwitchOfficer?: (account: UserAccount) => void;
  onShowToast: (msg: string) => void;
}

export const OfficerBadgeView: React.FC<OfficerBadgeViewProps> = ({
  officer,
  userRole = 'investigator',
  isAdmin = false,
  accounts = [],
  departments = [],
  onUpdateOfficer,
  onSwitchOfficer,
  onShowToast
}) => {
  const [formData, setFormData] = useState<OfficerProfile>(officer);
  const [isEditing, setIsEditing] = useState(false);
  const [isCopiedRP, setIsCopiedRP] = useState(false);
  const [isFullscreenModal, setIsFullscreenModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'badge' | 'file' | 'weapons'>('badge');

  // Photo customization modal state
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [tempPhotoUrl, setTempPhotoUrl] = useState(officer.photoUrl || '');
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [photoSourceMode, setPhotoSourceMode] = useState<'upload' | 'url' | 'presets'>('presets');

  // Quick photo presets for roleplay
  const photoPresets = [
    { label: 'Мужской (Парадная форма СК РФ)', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80' },
    { label: 'Мужской (Служебный китель юстиции)', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80' },
    { label: 'Мужской (Оперативная куртка / ОРОВД)', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80' },
    { label: 'Мужской (Старший офицерский состав)', url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80' },
    { label: 'Женский (Служебная форма СК РФ)', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80' },
    { label: 'Женский (Парадный китель юстиции)', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80' },
    { label: 'Женский (Офицер следственного отдела)', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80' }
  ];

  // Handle local file upload
  const handlePhotoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      onShowToast('Ошибка: Пожалуйста, выберите файл изображения (JPG, PNG, WEBP)');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setTempPhotoUrl(result);
        onShowToast('Фотография загружена! Нажмите «Сохранить фото в профиль»');
      }
    };
    reader.readAsDataURL(file);
  };

  // Save custom photo to officer & sync accounts
  const handleSavePhoto = () => {
    if (!tempPhotoUrl.trim()) {
      onShowToast('Укажите или загрузите фотографию');
      return;
    }
    const updated = {
      ...officer,
      photoUrl: tempPhotoUrl
    };
    setFormData((prev) => ({ ...prev, photoUrl: tempPhotoUrl }));
    onUpdateOfficer(updated);

    if (accounts && accounts.length > 0) {
      const updatedAccounts = accounts.map((acc) => {
        if (
          acc.fullName.toLowerCase() === officer.fullName.toLowerCase() ||
          acc.badgeNumber === officer.badgeNumber
        ) {
          return { ...acc, photoUrl: tempPhotoUrl };
        }
        return acc;
      });
      try {
        saveAccounts(updatedAccounts);
      } catch {
        // ignore
      }
    }

    setIsPhotoModalOpen(false);
    onShowToast('Служебная фотография удостоверения и профиля успешно обновлена!');
  };

  const ranks: RankType[] = [
    'Младший лейтенант юстиции',
    'Лейтенант юстиции',
    'Старший лейтенант юстиции',
    'Капитан юстиции',
    'Майор юстиции',
    'Подполковник юстиции',
    'Полковник юстиции',
    'Генерал-майор юстиции',
    'Генерал-лейтенант юстиции',
    'Генерал-полковник юстиции',
    'Генерал юстиции РФ'
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      onShowToast('Ошибка: Только Председатель СК РФ имеет право редактировать личные дела и служебные удостоверения!');
      return;
    }
    onUpdateOfficer(formData);
    setIsEditing(false);
    onShowToast('Служебное удостоверение и личное дело успешно обновлены Председателем СК РФ!');
  };

  const copyRPAction = () => {
    const rpText = `/me легким движением руки достал из внутреннего кармана кителя служебное удостоверение сотрудника Следственного комитета РФ серии ${officer.badgeNumber || 'МКВ № 04921'} на имя ${officer.fullName} и развернул его перед гражданином в открытом виде\n/do В удостоверении: Следственный комитет РФ | ${officer.rank} ${officer.fullName} | Должность: ${officer.position} | Фотография с гербовой голограммой и круглой печатью.`;
    navigator.clipboard.writeText(rpText);
    setIsCopiedRP(true);
    setTimeout(() => setIsCopiedRP(false), 2500);
    onShowToast('RP-отыгровка показа удостоверения скопирована в буфер обмена!');
  };

  const handlePrint = () => {
    window.print();
  };

  // Split full name into Surname and Name + Patronymic for authentic typography
  const nameParts = (officer.fullName || 'Сергеев Алексей Сергеевич').split(' ');
  const surname = nameParts[0] || 'Сергеев';
  const nameAndPatronymic = nameParts.slice(1).join(' ') || 'Алексей Сергеевич';

  return (
    <div className="space-y-6">
      {/* Top Controls Header */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-lg bg-red-50 border border-red-200 text-[#85181b] font-mono text-xs font-bold">
              ГОЗНАК • СТРОГАЯ ОТЧЕТНОСТЬ
            </span>
            {isAdmin ? (
              <span className="px-2.5 py-0.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                Права Председателя СК РФ (Полный доступ)
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 text-xs font-semibold flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                Режим просмотра сотрудника (Защита от изменений)
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <IdCard className="w-6 h-6 text-[#85181b]" />
            <span>Служебное удостоверение и личное дело сотрудника СК РФ</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Официальный служебный документ государственного образца с голографической защитой, гербовой печатью и допуском к табельному оружию.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <button
            type="button"
            onClick={() => {
              setTempPhotoUrl(officer.photoUrl || '');
              setIsPhotoModalOpen(true);
            }}
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 font-bold text-xs transition cursor-pointer shadow-sm"
            title="Загрузить свою фотографию с ПК или выбрать служебную форму"
          >
            <Camera className="w-4 h-4 text-amber-700" />
            <span>Сменить фото профиля</span>
          </button>

          <button
            type="button"
            onClick={copyRPAction}
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition border border-slate-200 cursor-pointer shadow-sm"
            title="Скопировать /me отыгровку для чата в буфер"
          >
            {isCopiedRP ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700">Отыгровка скопирована!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-600" />
                <span>Отыграть показ в чат (/me)</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsFullscreenModal(true)}
            className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition border border-slate-200 cursor-pointer shadow-sm"
            title="Развернуть удостоверение на весь экран для проверки"
          >
            <Maximize2 className="w-4 h-4 text-slate-600" />
            <span className="hidden sm:inline">Во весь экран</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition border border-slate-200 cursor-pointer shadow-sm"
            title="Распечатать служебное удостоверение"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span className="hidden sm:inline">Печать</span>
          </button>

          {/* EDIT BUTTON: Accessible only to Chairman */}
          {isAdmin ? (
            <button
              type="button"
              onClick={() => {
                setFormData(officer);
                setIsEditing(!isEditing);
              }}
              className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#85181b] hover:bg-[#6b1316] text-white font-bold text-xs transition shadow-md cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
              <span>{isEditing ? 'Закрыть редактор' : 'Редактировать личное дело (Председатель)'}</span>
            </button>
          ) : (
            <div
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 text-xs font-semibold cursor-not-allowed"
              title="Редактирование личных дел и удостоверений доступно только Председателю Следственного комитета РФ"
            >
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Редактирование: только Председатель</span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs Navigation (Удостоверение / Личное дело / Оружие) */}
      <div className="flex border-b border-slate-200 space-x-2">
        <button
          onClick={() => setActiveTab('badge')}
          className={`py-2.5 px-4 rounded-t-xl font-bold text-xs transition cursor-pointer flex items-center gap-2 border-b-2 ${
            activeTab === 'badge'
              ? 'border-[#85181b] text-[#85181b] bg-white shadow-sm'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100'
          }`}
        >
          <IdCard className="w-4 h-4" />
          <span>Служебное удостоверение (Бланк Гознак)</span>
        </button>

        <button
          onClick={() => setActiveTab('file')}
          className={`py-2.5 px-4 rounded-t-xl font-bold text-xs transition cursor-pointer flex items-center gap-2 border-b-2 ${
            activeTab === 'file'
              ? 'border-[#85181b] text-[#85181b] bg-white shadow-sm'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Личное дело и послужной список</span>
        </button>

        <button
          onClick={() => setActiveTab('weapons')}
          className={`py-2.5 px-4 rounded-t-xl font-bold text-xs transition cursor-pointer flex items-center gap-2 border-b-2 ${
            activeTab === 'weapons'
              ? 'border-[#85181b] text-[#85181b] bg-white shadow-sm'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100'
          }`}
        >
          <Crosshair className="w-4 h-4" />
          <span>Табельное оружие и допуски</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. AUTHENTIC RUSSIAN INVESTIGATIVE COMMITTEE ID BOOKLET (КАК НА ФОТО)     */}
      {/* ========================================================================= */}
      {activeTab === 'badge' && (
        <div className="flex flex-col items-center justify-center my-4 overflow-x-auto p-1 sm:p-4">
          
          {/* Leather Booklet Outer Casing (Бордовая кожаная обложка с золотой строчкой и прозрачными карманами) */}
          <div
            id="official-badge-card"
            className="bg-[#6b1417] p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-2xl border-4 sm:border-8 border-[#450b0d] max-w-5xl w-full flex flex-col md:flex-row gap-4 relative select-none"
            style={{
              backgroundImage: 'radial-gradient(circle at 50% 50%, #7d191d 0%, #540e11 100%)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45), inset 0 0 15px rgba(0,0,0,0.6)'
            }}
          >
            {/* Center Leather Spine / Crease / Folding Hinge */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-5 -translate-x-1/2 bg-gradient-to-r from-black/50 via-[#36080a] to-black/50 z-30 pointer-events-none shadow-inner" />

            {/* ========================================================= */}
            {/* LEFT WING / ЛЕВАЯ СТОРОНА УДОСТОВЕРЕНИЯ                   */}
            {/* ========================================================= */}
            <div
              className="flex-1 bg-[#d8ecf8] text-slate-950 rounded-xl p-4 sm:p-5 shadow-2xl border border-sky-300/80 relative flex flex-col justify-between overflow-hidden min-h-[360px]"
              style={{
                background: 'linear-gradient(135deg, #e8f4fc 0%, #cbe5f5 50%, #b8dcf2 100%)',
                backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.7) 0%, rgba(184,220,242,0.85) 100%)'
              }}
            >
              {/* Guilloche Fine Line Wave Mesh & Microtext Watermark */}
              <div
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                  backgroundImage: `radial-gradient(circle at 10px 10px, #0284c7 1px, transparent 0)`,
                  backgroundSize: '8px 8px'
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.07] font-serif font-black text-4xl sm:text-6xl text-sky-950 tracking-widest uppercase rotate-[-25deg] select-none">
                РОССИЯ РОССИЯ
              </div>

              {/* Left Wing Content: Photo on left, Emblem and Ministry Header on right */}
              <div className="relative z-10 flex gap-3.5 sm:gap-4 items-start h-full">
                
                {/* Photo Column */}
                <div className="flex flex-col items-center flex-shrink-0">
                  {/* Photo Container with Official Frame */}
                  <div className="relative w-28 sm:w-32 h-36 sm:h-40 rounded-sm border-2 border-slate-700 overflow-hidden bg-slate-200 shadow-md group">
                    <OfficerPhoto
                      src={officer.photoUrl}
                      alt={officer.fullName}
                      className="w-full h-full object-cover"
                      rank={officer.rank}
                      fallbackInitials={officer.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                    />

                    {/* Change Photo Overlay Button on Hover */}
                    <button
                      type="button"
                      onClick={() => {
                        setTempPhotoUrl(officer.photoUrl || '');
                        setIsPhotoModalOpen(true);
                      }}
                      className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 text-white text-[10px] font-bold cursor-pointer backdrop-blur-[1px]"
                      title="Нажмите, чтобы загрузить новое фото или сменить форму"
                    >
                      <Camera className="w-5 h-5 text-amber-300 animate-bounce" />
                      <span className="bg-black/60 px-2 py-0.5 rounded border border-white/20">Сменить фото</span>
                    </button>

                    {/* Hologram Overlay (in the top corner of the photo / emblem border) */}
                    <div
                      className="absolute top-1 right-1 w-9 h-9 rounded-full bg-gradient-to-tr from-yellow-300 via-amber-100 to-yellow-500 border border-yellow-600/60 shadow-md flex flex-col items-center justify-center text-[6.5px] font-black text-amber-950 opacity-90 backdrop-blur-[1px]"
                      style={{
                        boxShadow: '0 0 8px rgba(234, 179, 8, 0.6), inset 0 0 4px rgba(255,255,255,0.8)'
                      }}
                      title="Защитный голографический знак Гознак РФ"
                    >
                      <span className="leading-none text-[6px]">СК</span>
                      <span className="leading-none text-[5px] font-mono">РФ</span>
                    </div>
                  </div>

                  {/* Personal Number under photo ("Личный № ...") */}
                  <div className="mt-2 text-center">
                    <div className="text-[11px] sm:text-xs font-serif font-bold text-slate-900 tracking-wide">
                      Личный № <span className="font-mono text-slate-950 font-bold">{officer.serviceId || 'М-049218'}</span>
                    </div>
                  </div>
                </div>

                {/* Left Wing Center-Right Column: State Coat of Arms / Emblem & Ministry Name */}
                <div className="flex-1 flex flex-col items-center justify-between text-center h-full py-1">
                  
                  {/* State / SK RF Emblem */}
                  <div className="my-auto flex flex-col items-center">
                    <div className="drop-shadow-lg transform hover:scale-105 transition-transform">
                      <OfficialEmblem size={72} />
                    </div>

                    {/* Lettering Under Emblem */}
                    <div className="mt-2 space-y-0.5">
                      <div className="text-[11px] sm:text-xs font-black font-serif text-slate-900 uppercase tracking-wider leading-tight">
                        СЛЕДСТВЕННЫЙ
                      </div>
                      <div className="text-[11px] sm:text-xs font-black font-serif text-slate-900 uppercase tracking-wider leading-tight">
                        КОМИТЕТ
                      </div>
                      <div className="text-[10px] sm:text-[11px] font-black font-serif text-slate-900 uppercase tracking-wider leading-tight">
                        РОССИЙСКОЙ
                      </div>
                      <div className="text-[10px] sm:text-[11px] font-black font-serif text-slate-900 uppercase tracking-wider leading-tight">
                        ФЕДЕРАЦИИ
                      </div>
                    </div>

                    {/* Series & Number (e.g. МКВ № 04921) */}
                    <div className="mt-2.5 text-xs sm:text-sm font-mono font-black text-slate-950 tracking-wider">
                      МКВ <span className="text-red-900">№ {officer.badgeNumber?.replace(/[^0-9]/g, '') || '04921'}</span>
                    </div>
                  </div>

                  {/* Vertical right side text: Issue & Expiry rail */}
                  <div className="w-full flex justify-between items-center text-[9px] sm:text-[10px] font-serif text-slate-700 font-semibold border-t border-sky-400/50 pt-1.5 mt-2">
                    <div>Выдано: <b className="font-mono text-slate-900">{officer.issueDate || '15.01.2024'}</b></div>
                    <div>Действительно до: <b className="font-mono text-slate-900">{officer.expiryDate || '15.01.2029'}</b></div>
                  </div>

                </div>
              </div>
            </div>

            {/* ========================================================= */}
            {/* RIGHT WING / ПРАВАЯ СТОРОНА УДОСТОВЕРЕНИЯ                 */}
            {/* ========================================================= */}
            <div
              className="flex-1 bg-[#d8ecf8] text-slate-950 rounded-xl p-4 sm:p-5 shadow-2xl border border-sky-300/80 relative flex flex-col justify-between overflow-hidden min-h-[360px]"
              style={{
                background: 'linear-gradient(135deg, #e8f4fc 0%, #cbe5f5 50%, #b8dcf2 100%)',
                backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.75) 0%, rgba(184,220,242,0.85) 100%)'
              }}
            >
              {/* Guilloche Security Wave Mesh */}
              <div
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                  backgroundImage: `radial-gradient(circle at 10px 10px, #0284c7 1px, transparent 0)`,
                  backgroundSize: '8px 8px'
                }}
              />

              {/* Subtle Red Eagle Watermark in Center Background */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.08] select-none">
                <OfficialEmblem size={180} />
              </div>

              {/* Top Ornamental Header Banner */}
              <div className="relative z-10 text-center space-y-1">
                <div className="inline-block px-3 sm:px-5 py-1 bg-white/70 rounded border border-sky-400/80 shadow-xs">
                  <div className="text-[9.5px] sm:text-[11px] font-black font-serif uppercase tracking-widest text-slate-900">
                    СЛЕДСТВЕННЫЙ КОМИТЕТ РОССИЙСКОЙ ФЕДЕРАЦИИ
                  </div>
                </div>

                <div className="text-[11px] sm:text-xs font-serif font-black uppercase text-slate-900 tracking-wider">
                  СЛУЖЕБНОЕ УДОСТОВЕРЕНИЕ <span className="font-mono text-red-950">МКВ № {officer.badgeNumber?.replace(/[^0-9]/g, '') || '04921'}</span>
                </div>
              </div>

              {/* Officer Rank, Full Name & Position in Official Serif Typography */}
              <div className="relative z-10 my-auto text-center space-y-1.5 py-1">
                
                {/* Officer Rank (Italic Calligraphic Serif) */}
                <div className="text-sm sm:text-base font-serif italic text-slate-900 font-bold tracking-wide">
                  {officer.rank}
                </div>

                {/* Officer Full Name (Prominent Large Serif) */}
                <div className="space-y-0.5">
                  <div className="text-lg sm:text-2xl font-serif font-bold text-slate-950 tracking-tight leading-tight">
                    {surname}
                  </div>
                  <div className="text-base sm:text-xl font-serif font-bold text-slate-950 tracking-normal leading-tight">
                    {nameAndPatronymic}
                  </div>
                </div>

                {/* Position / Должность */}
                <div className="pt-1 text-[11px] sm:text-xs font-serif text-slate-900 leading-snug max-w-sm mx-auto">
                  <span className="font-medium text-slate-700">Состоит в должности: </span>
                  <span className="font-bold underline decoration-sky-400/50 decoration-1 underline-offset-2">
                    {officer.position} {officer.department}
                  </span>
                </div>

                {/* Weapons Permit Legal Line */}
                <div className="pt-1.5 text-[9.5px] sm:text-[10px] font-serif text-slate-800 italic leading-snug max-w-sm mx-auto">
                  Имеет право на постоянное ношение и хранение боевого ручного стрелкового оружия и специальных средств.
                </div>
              </div>

              {/* Bottom Authority Signatory & Authentic Circular Stamp */}
              <div className="relative z-10 pt-2 border-t border-sky-400/50 flex items-end justify-between text-left">
                
                {/* Authority Designation & Signature */}
                <div className="text-[8.5px] sm:text-[9.5px] font-serif text-slate-800 leading-tight space-y-0.5 max-w-[200px]">
                  <div className="font-bold">Председатель</div>
                  <div>Следственного комитета</div>
                  <div>Российской Федерации</div>
                  <div className="pt-1 font-serif italic font-bold text-slate-950 text-[11px]">
                    / А. И. Бастрыкин /
                  </div>
                </div>

                {/* Official Round Stamp Seal (overlapping signatory and background) */}
                <div className="relative">
                  <OfficialStampSeal
                    title="СЛЕДСТВЕННЫЙ КОМИТЕТ РОССИИ"
                    subTitle="ГЛАВНОЕ УПРАВЛЕНИЕ КАДРОВ"
                    code="ГЕРБОВАЯ ПЕЧАТЬ № 01"
                    className="w-24 sm:w-28 h-24 sm:h-28 -mr-2 -mb-2 opacity-85 pointer-events-none drop-shadow"
                  />
                </div>

              </div>

            </div>

          </div>

          {/* Helper caption below badge */}
          <div className="mt-3 text-center text-xs text-slate-500 font-medium flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Государственный бланк Гознак СК РФ • Защищен микрошрифтом и голограммой подлинности</span>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. CHAIRMAN EDITING MODAL / PANEL (ONLY ACCESSIBLE TO CHAIRMAN / ADMIN)   */}
      {/* ========================================================================= */}
      {isEditing && isAdmin && (
        <div className="bg-white border-2 border-[#85181b] rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 animate-in fade-in">
          
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-[#85181b]">
                <Edit3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  Редактирование служебного удостоверения и личного дела
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Панель кадрового администрирования Председателя Следственного комитета РФ
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsEditing(false)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-6 text-xs">
            
            {/* Quick Photo Presets */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
              <label className="text-xs font-bold text-slate-800 block">
                Служебное фото в форме (выберите готовый образец или введите URL):
              </label>
              <div className="flex flex-wrap gap-2">
                {photoPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setFormData({ ...formData, photoUrl: preset.url })}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer flex items-center gap-2 ${
                      formData.photoUrl === preset.url
                        ? 'bg-[#85181b] text-white border-[#85181b]'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-red-300'
                    }`}
                  >
                    <img src={preset.url} alt="" className="w-5 h-5 rounded-full object-cover" />
                    <span>{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              
              {/* Full Name */}
              <div className="space-y-1">
                <label className="block text-slate-700 font-bold">ФИО сотрудника *</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Сергеев Алексей Сергеевич"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-[#85181b]"
                />
              </div>

              {/* Special Rank */}
              <div className="space-y-1">
                <label className="block text-slate-700 font-bold">Специальное звание юстиции *</label>
                <select
                  value={formData.rank}
                  onChange={(e) => setFormData({ ...formData, rank: e.target.value as RankType })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-[#85181b]"
                >
                  {ranks.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              {/* Position */}
              <div className="space-y-1">
                <label className="block text-slate-700 font-bold">Занимаемая должность *</label>
                <input
                  type="text"
                  required
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  placeholder="Старший следователь по ОВД"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-[#85181b]"
                />
              </div>

              {/* Department */}
              <div className="space-y-1">
                <label className="block text-slate-700 font-bold">Следственный орган / Подразделение *</label>
                <input
                  type="text"
                  required
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="ГСУ СК РФ по г. Москве"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-[#85181b]"
                />
              </div>

              {/* Badge & Credential Series */}
              <div className="space-y-1">
                <label className="block text-slate-700 font-bold">Серия и номер удостоверения (МКВ №) *</label>
                <input
                  type="text"
                  required
                  value={formData.badgeNumber}
                  onChange={(e) => setFormData({ ...formData, badgeNumber: e.target.value })}
                  placeholder="МКВ № 04921"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono font-bold focus:outline-none focus:border-[#85181b]"
                />
              </div>

              {/* Service / Personnel ID Number */}
              <div className="space-y-1">
                <label className="block text-slate-700 font-bold">Личный номер сотрудника (Личный №) *</label>
                <input
                  type="text"
                  required
                  value={formData.serviceId}
                  onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
                  placeholder="М-049218"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono font-bold focus:outline-none focus:border-[#85181b]"
                />
              </div>

              {/* Issue Date */}
              <div className="space-y-1">
                <label className="block text-slate-700 font-bold">Дата выдачи удостоверения</label>
                <input
                  type="text"
                  value={formData.issueDate}
                  onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                  placeholder="15.01.2024"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-[#85181b]"
                />
              </div>

              {/* Expiry Date */}
              <div className="space-y-1">
                <label className="block text-slate-700 font-bold">Действительно до</label>
                <input
                  type="text"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  placeholder="15.01.2029"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-[#85181b]"
                />
              </div>

              {/* Security Clearance */}
              <div className="space-y-1">
                <label className="block text-slate-700 font-bold">Гриф допуска к гостайне</label>
                <select
                  value={formData.clearanceLevel}
                  onChange={(e) => setFormData({ ...formData, clearanceLevel: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-[#85181b]"
                >
                  <option value="Секретно">Форма 3 (Секретно)</option>
                  <option value="Совершенно секретно">Форма 2 (Совершенно секретно)</option>
                  <option value="Особой важности">Форма 1 (Особой важности / Высший допуск)</option>
                </select>
              </div>

              {/* Weapon Type */}
              <div className="space-y-1">
                <label className="block text-slate-700 font-bold">Табельное боевое оружие</label>
                <input
                  type="text"
                  value={formData.weaponType}
                  onChange={(e) => setFormData({ ...formData, weaponType: e.target.value })}
                  placeholder="Пистолет Макарова (ПМ 9мм)"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-[#85181b]"
                />
              </div>

              {/* Weapon Serial */}
              <div className="space-y-1">
                <label className="block text-slate-700 font-bold">Серийный номер оружия</label>
                <input
                  type="text"
                  value={formData.weaponSerial}
                  onChange={(e) => setFormData({ ...formData, weaponSerial: e.target.value })}
                  placeholder="СЕ-8841-К"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono font-bold focus:outline-none focus:border-[#85181b]"
                />
              </div>

              {/* Photo URL manual */}
              <div className="space-y-1">
                <label className="block text-slate-700 font-bold">Прямой URL фотографии</label>
                <input
                  type="text"
                  value={formData.photoUrl}
                  onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-[#85181b]"
                />
              </div>

            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition cursor-pointer"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#85181b] hover:bg-[#6b1316] text-white font-bold rounded-xl shadow-md transition cursor-pointer flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Утвердить изменения в личном деле</span>
              </button>
            </div>

          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. PERSONAL FILE / ПОСЛУЖНОЙ СПИСОК И НАГРАДЫ                             */}
      {/* ========================================================================= */}
      {activeTab === 'file' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in">
          
          {/* Left Column: Officer Passport Summary */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="text-center space-y-2">
              <div className="relative w-28 h-36 mx-auto rounded-2xl overflow-hidden border-2 border-slate-200 shadow-md group">
                <OfficerPhoto
                  src={officer.photoUrl}
                  alt={officer.fullName}
                  className="w-full h-full object-cover"
                  rank={officer.rank}
                  fallbackInitials={officer.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                />
                <button
                  type="button"
                  onClick={() => {
                    setTempPhotoUrl(officer.photoUrl || '');
                    setIsPhotoModalOpen(true);
                  }}
                  className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-white text-[10px] font-bold cursor-pointer backdrop-blur-[1px]"
                  title="Нажмите, чтобы сменить фото"
                >
                  <Camera className="w-5 h-5 text-amber-300" />
                  <span>Сменить фото</span>
                </button>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">{officer.fullName}</h3>
                <p className="text-xs text-[#85181b] font-bold">{officer.rank}</p>
                <p className="text-[11px] text-slate-500 font-medium">{officer.position}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Личный номер:</span>
                <span className="font-mono font-bold text-slate-900">{officer.serviceId}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Удостоверение:</span>
                <span className="font-mono font-bold text-[#85181b]">{officer.badgeNumber}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Подразделение:</span>
                <span className="font-semibold text-slate-900 text-right">{officer.department}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Гриф секретности:</span>
                <span className="font-bold text-red-700">{officer.clearanceLevel}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Статус смены:</span>
                <span className={`font-bold ${officer.onDuty ? 'text-emerald-600' : 'text-slate-500'}`}>
                  {officer.onDuty ? '● На боевом дежурстве' : '○ Вне смены'}
                </span>
              </div>
            </div>
          </div>

          {/* Center Column: Awards & Honours */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-600" />
              <span>Государственные и ведомственные награды</span>
            </h4>

            <div className="space-y-2.5 text-xs">
              {officer.awards && officer.awards.length > 0 ? (
                officer.awards.map((award, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/80 text-slate-800 flex items-start gap-2.5"
                  >
                    <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                    <div>
                      <div className="font-bold text-slate-900">{award}</div>
                      <div className="text-[10px] text-amber-900 font-medium">Приказ Председателя СК РФ</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-slate-400 text-xs bg-slate-50 rounded-xl">
                  Наградных записей нет
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Service Record / Disciplinary Actions */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Служебная аттестация и допуски</span>
            </h4>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Квалификационная аттестация пройдена</span>
                </div>
                <p className="text-[11px] text-emerald-700 leading-snug">
                  Сотрудник полностью соответствует занимаемой должности в следственном органе.
                </p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="font-bold text-slate-800">Дисциплинарная практика:</div>
                <p className="text-[11px] text-slate-600">
                  {officer.disciplinaryActions && officer.disciplinaryActions.length > 0
                    ? officer.disciplinaryActions.join(', ')
                    : 'Действующих дисциплинарных взысканий не имеет.'}
                </p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="font-bold text-slate-800">Особые отметки кадровой службы:</div>
                <p className="text-[11px] text-slate-600">
                  Закреплен за дежурной следственной группой особого реагирования. Допущен к проведению следственных действий без понятых в установленных законом случаях.
                </p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. WEAPONS & TACTICAL GEAR TAB                                            */}
      {/* ========================================================================= */}
      {activeTab === 'weapons' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-[#85181b]">
              <Crosshair className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Карточка учета табельного оружия и специального снаряжения
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Разрешение на постоянное ношение и применение в соответствии с ФЗ «О Следственном комитете РФ»
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="text-slate-500 font-medium">Тип боевого оружия:</span>
              <div className="text-sm font-bold text-slate-900">{officer.weaponType || 'Пистолет Макарова (ПМ 9мм)'}</div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="text-slate-500 font-medium">Серийный номер ствола:</span>
              <div className="text-sm font-mono font-bold text-[#85181b]">{officer.weaponSerial || 'СЕ-8841-К'}</div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="text-slate-500 font-medium">Боекомплект:</span>
              <div className="text-sm font-bold text-slate-900">2 магазина по 8 патронов (9х18 мм)</div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="text-slate-500 font-medium">Спецсредства:</span>
              <div className="text-sm font-bold text-slate-900">Наручники БРС-2, газовый баллончик «Шок»</div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="text-slate-500 font-medium">Средства бронезащиты:</span>
              <div className="text-sm font-bold text-slate-900">Скрытый бронежилет «Кора-Кулон» (Бр2 класс)</div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="text-slate-500 font-medium">Криминалистический комплект:</span>
              <div className="text-sm font-bold text-slate-900">Унифицированный чемодан следователя СК РФ</div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. FULLSCREEN INSPECTION MODAL                                            */}
      {/* ========================================================================= */}
      {isFullscreenModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative max-w-5xl w-full bg-slate-900 rounded-3xl p-6 border border-slate-700 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between text-white pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <IdCard className="w-5 h-5 text-amber-400" />
                <span className="font-bold text-sm">Проверка служебного удостоверения в развернутом виде</span>
              </div>

              <button
                onClick={() => setIsFullscreenModal(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 flex justify-center">
              {/* Scaled ID Booklet */}
              <div
                className="bg-[#6b1417] p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-2xl border-4 border-[#450b0d] max-w-4xl w-full flex flex-col md:flex-row gap-4 relative select-none"
                style={{
                  backgroundImage: 'radial-gradient(circle at 50% 50%, #7d191d 0%, #540e11 100%)'
                }}
              >
                {/* Center fold */}
                <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-5 -translate-x-1/2 bg-gradient-to-r from-black/50 via-[#36080a] to-black/50 z-30 pointer-events-none" />

                {/* Left wing */}
                <div
                  className="flex-1 bg-[#d8ecf8] text-slate-950 rounded-xl p-4 shadow-xl border border-sky-300 relative flex flex-col justify-between overflow-hidden min-h-[320px]"
                  style={{
                    background: 'linear-gradient(135deg, #e8f4fc 0%, #cbe5f5 50%, #b8dcf2 100%)'
                  }}
                >
                  <div className="relative z-10 flex gap-3 items-start h-full">
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className="w-24 h-32 rounded-sm border-2 border-slate-700 overflow-hidden bg-slate-200 shadow relative">
                        <img src={officer.photoUrl} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="mt-1 text-[10px] font-serif font-bold text-slate-900">
                        Личный № <span className="font-mono">{officer.serviceId}</span>
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-between text-center h-full">
                      <div className="my-auto flex flex-col items-center">
                        <OfficialEmblem size={60} />
                        <div className="mt-1 space-y-0.5 font-serif font-black text-[10px] text-slate-900 uppercase">
                          <div>СЛЕДСТВЕННЫЙ</div>
                          <div>КОМИТЕТ</div>
                          <div>РОССИЙСКОЙ</div>
                          <div>ФЕДЕРАЦИИ</div>
                        </div>
                        <div className="mt-1 text-xs font-mono font-bold text-slate-950">
                          МКВ <span className="text-red-900">№ {officer.badgeNumber?.replace(/[^0-9]/g, '') || '04921'}</span>
                        </div>
                      </div>
                      <div className="w-full flex justify-between text-[8px] font-serif text-slate-700 font-semibold border-t border-sky-400/50 pt-1">
                        <div>Выдано: <b>{officer.issueDate}</b></div>
                        <div>Действительно до: <b>{officer.expiryDate}</b></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right wing */}
                <div
                  className="flex-1 bg-[#d8ecf8] text-slate-950 rounded-xl p-4 shadow-xl border border-sky-300 relative flex flex-col justify-between overflow-hidden min-h-[320px]"
                  style={{
                    background: 'linear-gradient(135deg, #e8f4fc 0%, #cbe5f5 50%, #b8dcf2 100%)'
                  }}
                >
                  <div className="relative z-10 text-center space-y-0.5">
                    <div className="text-[9px] font-serif font-black uppercase text-slate-900">
                      СЛЕДСТВЕННЫЙ КОМИТЕТ РОССИЙСКОЙ ФЕДЕРАЦИИ
                    </div>
                    <div className="text-[10px] font-serif font-black uppercase text-slate-900">
                      СЛУЖЕБНОЕ УДОСТОВЕРЕНИЕ МКВ № {officer.badgeNumber?.replace(/[^0-9]/g, '') || '04921'}
                    </div>
                  </div>

                  <div className="relative z-10 text-center space-y-1 my-auto">
                    <div className="text-xs font-serif italic text-slate-900 font-bold">{officer.rank}</div>
                    <div className="text-base font-serif font-bold text-slate-950">{officer.fullName}</div>
                    <div className="text-[9.5px] font-serif text-slate-900 leading-snug">
                      Состоит в должности: <b>{officer.position}</b>
                    </div>
                    <div className="text-[8.5px] font-serif text-slate-700 italic leading-snug">
                      Имеет право на постоянное ношение и хранение боевого ручного стрелкового оружия и специальных средств.
                    </div>
                  </div>

                  <div className="relative z-10 pt-1 border-t border-sky-400/50 flex items-end justify-between">
                    <div className="text-[8px] font-serif text-slate-800 leading-tight">
                      <div className="font-bold">Председатель СК РФ</div>
                      <div className="italic font-bold">/ Бастрыкин А. И. /</div>
                    </div>
                    <OfficialStampSeal className="w-20 h-20 -mr-2 -mb-2 opacity-85 pointer-events-none" />
                  </div>
                </div>

              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsFullscreenModal(false)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition cursor-pointer"
              >
                Закрыть просмотр
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. PHOTO CUSTOMIZATION & UPLOAD MODAL                                     */}
      {/* ========================================================================= */}
      {isPhotoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative max-w-2xl w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 animate-in zoom-in-95">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-[#85181b]">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    Служебная фотография сотрудника СК РФ
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Загрузите свой файл, укажите прямую ссылку или выберите образец ведомственной формы
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsPhotoModalOpen(false)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Source Mode Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
              <button
                type="button"
                onClick={() => setPhotoSourceMode('presets')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  photoSourceMode === 'presets'
                    ? 'bg-white text-[#85181b] shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                <span>Образцы формы (Пресеты)</span>
              </button>

              <button
                type="button"
                onClick={() => setPhotoSourceMode('upload')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  photoSourceMode === 'upload'
                    ? 'bg-white text-[#85181b] shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Upload className="w-4 h-4" />
                <span>Загрузить с ПК / Телефона</span>
              </button>

              <button
                type="button"
                onClick={() => setPhotoSourceMode('url')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  photoSourceMode === 'url'
                    ? 'bg-white text-[#85181b] shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LinkIcon className="w-4 h-4" />
                <span>Прямая ссылка (URL)</span>
              </button>
            </div>

            {/* Mode 1: Presets */}
            {photoSourceMode === 'presets' && (
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-700 block">
                  Выберите готовую служебную форму для удостоверения:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
                  {photoPresets.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setTempPhotoUrl(preset.url)}
                      className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition cursor-pointer flex items-center gap-3 ${
                        tempPhotoUrl === preset.url
                          ? 'bg-red-50 border-[#85181b] text-[#85181b] shadow-sm ring-1 ring-[#85181b]'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <img src={preset.url} alt="" className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0" />
                      <div className="leading-snug">{preset.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Mode 2: File Upload */}
            {photoSourceMode === 'upload' && (
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-700 block">
                  Загрузить фотографию с вашего устройства (ПК / Ноутбук / Телефон):
                </label>
                <label className="border-2 border-dashed border-slate-300 hover:border-[#85181b] rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer bg-slate-50 hover:bg-red-50/40 transition">
                  <Upload className="w-8 h-8 text-[#85181b]" />
                  <span className="text-xs font-bold text-slate-800">
                    Нажмите для выбора файла или перетащите изображение сюда
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Поддерживаются форматы: PNG, JPG, JPEG, WEBP
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}

            {/* Mode 3: Direct URL */}
            {photoSourceMode === 'url' && (
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-700 block">
                  Вставьте прямую ссылку на изображение (URL):
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={customUrlInput}
                    onChange={(e) => setCustomUrlInput(e.target.value)}
                    placeholder="https://example.com/my-officer-photo.jpg"
                    className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:border-[#85181b]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customUrlInput.trim()) {
                        setTempPhotoUrl(customUrlInput.trim());
                        onShowToast('Ссылка применена к предпросмотру');
                      }
                    }}
                    className="px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition cursor-pointer"
                  >
                    Применить
                  </button>
                </div>
              </div>
            )}

            {/* Live Preview Section */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-center gap-4">
              <div className="relative w-24 h-32 rounded-sm border-2 border-slate-700 overflow-hidden bg-slate-200 shadow-md shrink-0">
                <OfficerPhoto
                  src={tempPhotoUrl}
                  alt="Предпросмотр"
                  className="w-full h-full object-cover"
                  rank={officer.rank}
                />
                <div
                  className="absolute top-1 right-1 w-7 h-7 rounded-full bg-gradient-to-tr from-yellow-300 via-amber-100 to-yellow-500 border border-yellow-600/60 shadow-md flex flex-col items-center justify-center text-[5.5px] font-black text-amber-950 opacity-90"
                >
                  <span className="leading-none text-[5px]">СК</span>
                  <span className="leading-none text-[4.5px] font-mono">РФ</span>
                </div>
              </div>

              <div className="space-y-1 text-center sm:text-left">
                <div className="text-xs font-bold text-slate-900">Предпросмотр в служебном бланке удостоверения</div>
                <div className="text-[11px] text-slate-500 leading-relaxed">
                  Фотография будет автоматически встроена в официальное служебное удостоверение, личное дело и профиль сотрудника.
                </div>
                <div className="text-[11px] font-mono text-[#85181b] font-bold">
                  {officer.rank} • {officer.fullName}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsPhotoModalOpen(false)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition cursor-pointer"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={handleSavePhoto}
                className="px-6 py-2.5 bg-[#85181b] hover:bg-[#6b1316] text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Сохранить фото в профиль и удостоверение</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
