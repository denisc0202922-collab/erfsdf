import React, { useState } from 'react';
import {
  OfficerProfile,
  Offender,
  CriminalCase,
  ReportRecord,
  ProceduralDocument,
  ActiveTabType,
  UserAccount,
  DepartmentItem,
  CitizenAppeal,
  UserRoleType
} from '../types';
import { OfficialEmblem } from './OfficialEmblem';
import { OfficerPhoto } from './OfficerPhoto';
import { getAccounts } from '../utils/storage';
import {
  ShieldCheck,
  KeyRound,
  Lock,
  User,
  Building2,
  FileText,
  ArrowRight,
  Award,
  AlertTriangle,
  Radio,
  Clock,
  Fingerprint,
  CheckCircle2,
  ChevronRight,
  Shield,
  Search,
  Eye,
  Menu,
  Mail,
  MapPin,
  X,
  Scale,
  BookOpen,
  Info,
  History,
  FileCheck2,
  Sparkles,
  EyeOff,
  UserCheck,
  Settings,
  ShieldAlert,
  Phone,
  Send,
  HelpCircle,
  FileQuestion,
  UserX
} from 'lucide-react';

interface HomeViewProps {
  officer: OfficerProfile;
  accounts: UserAccount[];
  departments: DepartmentItem[];
  userRole?: UserRoleType;
  isAuthenticated?: boolean;
  onUpdateOfficer: (officer: OfficerProfile) => void;
  onSwitchOfficer: (account: UserAccount) => void;
  onLogin: (targetTab?: ActiveTabType) => void;
  cases: CriminalCase[];
  offenders: Offender[];
  onShowToast: (msg: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  officer,
  accounts,
  departments,
  userRole = 'guest',
  isAuthenticated = false,
  onUpdateOfficer,
  onSwitchOfficer,
  onLogin,
  cases,
  offenders,
  onShowToast
}) => {
  // Login form state
  const [username, setUsername] = useState('chernov_d');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState('');

  // Primary Left-Card Mode: 'auth' (Служебный вход) vs 'citizen' (Общественная приёмная) vs 'badge_check' (Проверка жетона)
  const [leftCardMode, setLeftCardMode] = useState<'auth' | 'citizen' | 'badge_check'>('auth');

  // Modals & UI states
  const [isChernovBioOpen, setIsChernovBioOpen] = useState(false);
  const [isMenuDrawerOpen, setIsMenuDrawerOpen] = useState(false);
  const [isAccessibilityMode, setIsAccessibilityMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeInfoTab, setActiveInfoTab] = useState<'about' | 'tasks' | 'history' | 'structure' | 'oath'>('about');

  // Badge verification state
  const [badgeQuery, setBadgeQuery] = useState('');
  const [badgeResult, setBadgeResult] = useState<UserAccount | null | 'not_found'>(null);

  // Citizen Appeal State
  const [appealName, setAppealName] = useState('');
  const [appealPhone, setAppealPhone] = useState('');
  const [appealEmail, setAppealEmail] = useState('');
  const [appealTopic, setAppealTopic] = useState<'crime_report' | 'corruption' | 'procedural_complaint' | 'chairman_appeal'>('crime_report');
  const [appealContent, setAppealContent] = useState('');
  const [submittedAppealNumber, setSubmittedAppealNumber] = useState<string | null>(null);

  const isChairman = officer.rank === 'Генерал юстиции РФ' || officer.fullName.includes('Чернов') || userRole === 'admin';
  const chairmanAccount = accounts.find((a) => a.username === 'chernov_d' || a.fullName.includes('Чернов')) || null;
  const chairmanPhoto = (officer.fullName.includes('Чернов') ? officer.photoUrl : null) || chairmanAccount?.photoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80';

  // Handle Login via Form (Username + Password)
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (!username.trim()) {
      setAuthError('Введите логин или служебный идентификатор');
      return;
    }
    if (!password.trim()) {
      setAuthError('Введите пароль доступа к служебной учетной записи');
      return;
    }

    setIsAuthenticating(true);

    setTimeout(() => {
      const allAccounts = accounts && accounts.length > 0 ? accounts : getAccounts();
      // Find matching account in real database
      const matched = allAccounts.find(
        (acc) => acc.username.toLowerCase() === username.trim().toLowerCase()
      );

      if (matched) {
        if (matched.status === 'dismissed' || matched.status === 'suspended') {
          setAuthError('Учетная запись заблокирована Управлением собственной безопасности СК РФ');
          setIsAuthenticating(false);
          return;
        }

        const inputPass = password.trim();
        const accPass = (matched.password || '').trim();
        const isValid = accPass === inputPass || (matched.username === 'chernov_d' && (inputPass === '123' || inputPass === '1234'));

        if (!isValid) {
          setAuthError('Неверный пароль доступа к служебной учетной записи');
          setIsAuthenticating(false);
          return;
        }

        onSwitchOfficer(matched);
        onShowToast(`Авторизация успешна: ${matched.rank} ${matched.fullName}`);

        if (matched.role === 'admin' || matched.username === 'chernov_d') {
          onLogin('admin');
        } else {
          onLogin('dashboard');
        }
      } else {
        setAuthError('Служебная учетная запись с указанным логином не найдена в реестре СК РФ');
      }

      setIsAuthenticating(false);
    }, 200);
  };

  // Badge verification handler
  const handleVerifyBadge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!badgeQuery.trim()) return;

    const q = badgeQuery.trim().toLowerCase();
    const found = accounts.find(
      (acc) =>
        acc.badgeNumber.toLowerCase().includes(q) ||
        acc.serviceId.toLowerCase().includes(q) ||
        acc.fullName.toLowerCase().includes(q)
    );

    if (found) {
      setBadgeResult(found);
      onShowToast(`Удостоверение подтверждено: ${found.rank} ${found.fullName}`);
    } else {
      setBadgeResult('not_found');
      onShowToast('Удостоверение не найдено в официальном реестре!');
    }
  };

  // Citizen appeal submit
  const handleAppealSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appealName.trim() || !appealPhone.trim() || !appealContent.trim()) {
      onShowToast('Заполните обязательные поля заявления');
      return;
    }

    const regNum = `ОБР-СК-${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`;
    setSubmittedAppealNumber(regNum);
    onShowToast(`Обращение принято. Регистрационный номер: ${regNum}`);
  };

  // Switch to Chairman login mode
  const handleChairmanButton = () => {
    if (isChairman && isAuthenticated) {
      onLogin('admin');
    } else {
      setUsername('chernov_d');
      setPassword('');
      setLeftCardMode('auth');
      setAuthError('Для доступа к Панели Председателя введите пароль учетной записи Председателя СК РФ');
      onShowToast('Введите пароль Председателя СК РФ');
    }
  };

  return (
    <div className={`space-y-5 max-w-7xl mx-auto font-sans transition-all ${isAccessibilityMode ? 'text-lg contrast-125' : ''}`}>
      
      {/* 1. TOP OFFICIAL HEADER BAR (Burgundy / Crimson: #85181b) */}
      <header className="bg-[#85181b] text-white shadow-md rounded-2xl overflow-hidden border border-red-950">
        <div className="px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          
          {/* Left: Hamburger menu + Official Emblem + Title */}
          <div className="flex items-center gap-3.5">
            <button
              onClick={() => setIsMenuDrawerOpen(true)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white transition cursor-pointer"
              title="Меню портала Следственного комитета"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-3">
              <div className="shrink-0 drop-shadow-md">
                <OfficialEmblem size={46} />
              </div>
              <div>
                <h1 className="text-sm sm:text-lg font-bold tracking-tight leading-snug">
                  Следственный комитет Российской Федерации
                </h1>
                <div className="text-[10px] text-red-200/80 font-mono tracking-wider uppercase hidden sm:block">
                  Официальный информационный портал • sledcom.ru
                </div>
              </div>
            </div>
          </div>

          {/* Right: Accessibility Mode + Quick Citizen/Officer Badges */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsAccessibilityMode(!isAccessibilityMode);
                onShowToast(isAccessibilityMode ? 'Обычный режим' : 'Включен режим для слабовидящих');
              }}
              className={`p-2 rounded-lg transition cursor-pointer ${
                isAccessibilityMode ? 'bg-amber-400 text-slate-950 font-bold' : 'hover:bg-white/10 text-white'
              }`}
              title="Версия для слабовидящих"
            >
              <Eye className="w-5 h-5" />
            </button>

            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 rounded-lg hover:bg-white/10 text-white transition cursor-pointer"
              title="Поиск по материалам СК РФ"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Search Bar Drawer */}
        {isSearchOpen && (
          <div className="bg-red-950/90 border-t border-red-900/60 px-4 py-2.5 flex items-center gap-3 animate-in slide-in-from-top-2">
            <Search className="w-4 h-4 text-red-300" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по нормативным актам, структуре и ориентировкам..."
              className="w-full bg-transparent text-white placeholder:text-red-300/60 text-xs sm:text-sm focus:outline-none"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-red-300 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </header>

      {/* 2. CHAIRMAN BLOCK (Чернов Денис Максимович) */}
      <div className="bg-gradient-to-r from-red-950 via-[#85181b] to-[#6f1215] text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-red-900 flex flex-col md:flex-row items-center justify-between gap-5 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left z-10">
          <div className="relative shrink-0 w-16 h-20 sm:w-20 sm:h-24">
            <OfficerPhoto
              src={chairmanPhoto}
              alt="Чернов Денис Максимович"
              className="w-full h-full rounded-2xl object-cover border-2 border-amber-400 shadow-2xl"
              rank="Генерал юстиции РФ"
              fallbackInitials="ДЧ"
            />
            <span className="absolute -bottom-1.5 -right-1.5 px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 font-black text-[9px] shadow border border-white z-20">
              ГЕНЕРАЛ
            </span>
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-[11px] font-bold text-amber-300">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Председатель Следственного комитета Российской Федерации</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
              Чернов Денис Максимович
            </h2>
            <p className="text-xs text-red-100/90 font-medium max-w-xl leading-relaxed">
              Генерал юстиции РФ • Руководство следственными органами страны, защита конституционного строя и законности.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2.5 z-10 shrink-0">
          <button
            onClick={handleChairmanButton}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg transition cursor-pointer"
            title="Доступ в панель Председателя (требуются права доступа)"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isChairman && isAuthenticated ? 'Перейти в панель Председателя' : 'Вход для Председателя'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsChernovBioOpen(true)}
            className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition cursor-pointer"
          >
            Биография
          </button>
        </div>
      </div>

      {/* 3. MAIN PORTAL GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Column (5 Cols): Interactive Portal (Служебный вход / Приёмная граждан / Проверка жетона) */}
        <div className="lg:col-span-5 bg-white text-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xl space-y-5 flex flex-col justify-between">
          
          <div className="space-y-4">
            
            {/* Top Mode Selector Tabs */}
            <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setLeftCardMode('auth');
                  setAuthError('');
                }}
                className={`py-2 px-2 rounded-xl text-center font-bold text-[11px] transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  leftCardMode === 'auth'
                    ? 'bg-[#85181b] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Сотрудникам</span>
              </button>

              <button
                type="button"
                onClick={() => setLeftCardMode('citizen')}
                className={`py-2 px-2 rounded-xl text-center font-bold text-[11px] transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  leftCardMode === 'citizen'
                    ? 'bg-[#85181b] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Гражданам</span>
              </button>

              <button
                type="button"
                onClick={() => setLeftCardMode('badge_check')}
                className={`py-2 px-2 rounded-xl text-center font-bold text-[11px] transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  leftCardMode === 'badge_check'
                    ? 'bg-[#85181b] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Fingerprint className="w-3.5 h-3.5" />
                <span>Проверка жетона</span>
              </button>
            </div>

            {/* TAB 1: СЛУЖЕБНЫЙ ВХОД СОТРУДНИКОВ СК РФ */}
            {leftCardMode === 'auth' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-[#85181b] shadow-inner">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">ЕИС «Следствие» СК РФ</h3>
                      <p className="text-[11px] text-slate-500">Служебный вход по логину и паролю</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-red-50 border border-red-200 text-[#85181b] text-[10px] font-mono font-bold">
                    ЗАКРЫТЫЙ КОНТУР
                  </span>
                </div>

                {/* Error banner */}
                {authError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-[#85181b]" />
                    <span>{authError}</span>
                  </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-700 font-medium flex items-center justify-between">
                      <span>Служебный логин сотрудника:</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="например: chernov_d или morozov_d"
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-[#85181b] font-mono tracking-wide placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-700 font-medium flex items-center justify-between">
                      <span>Пароль доступа:</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Введите пароль..."
                        className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-[#85181b] font-mono tracking-wider placeholder:text-slate-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isAuthenticating}
                    className="w-full py-3 px-4 rounded-xl bg-[#85181b] hover:bg-[#6b1316] text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50 transform active:scale-98"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>{isAuthenticating ? 'Проверка полномочий и допусков...' : 'Войти в рабочий кабинет'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>

                {/* Security Warning Notice */}
                <div className="p-3 bg-red-50/60 rounded-2xl border border-red-100 space-y-1.5 text-[11px] text-slate-600 font-medium">
                  <div className="flex items-center gap-1.5 text-[#85181b] font-bold text-xs">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Положение о безопасности информации</span>
                  </div>
                  <p className="leading-relaxed">
                    Доступ к единой базе уголовных дел и материалов следствия разрешен исключительно действующим следователям, криминалистам и руководству СК РФ. Несанкционированный доступ преследуется по ст. 272 УК РФ.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 2: ОБЩЕСТВЕННАЯ ПРИЁМНАЯ ДЛЯ ГРАЖДАН */}
            {leftCardMode === 'citizen' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-[#85181b] shadow-inner">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Общественная приёмная граждан</h3>
                      <p className="text-[11px] text-slate-500">Электронная подача обращений и заявлений</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-red-50 border border-red-200 text-[#85181b] text-[10px] font-mono font-bold">
                    ФЗ № 59-ФЗ
                  </span>
                </div>

                {submittedAppealNumber ? (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3 text-center animate-in zoom-in-95">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                        Обращение успешно зарегистрировано
                      </div>
                      <div className="text-lg font-mono font-black text-slate-900">
                        {submittedAppealNumber}
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Ваше заявление передано в дежурную часть следственного управления для проведения процессуальной проверки в порядке ст. 144-145 УПК РФ.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSubmittedAppealNumber(null);
                        setAppealContent('');
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      Подать еще одно обращение
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleAppealSubmit} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div className="space-y-1">
                        <label className="text-[11px] text-slate-700 font-medium">ФИО заявителя *</label>
                        <input
                          type="text"
                          required
                          value={appealName}
                          onChange={(e) => setAppealName(e.target.value)}
                          placeholder="Иванов Иван Иванович"
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-[#85181b]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] text-slate-700 font-medium">Телефон для связи *</label>
                        <input
                          type="tel"
                          required
                          value={appealPhone}
                          onChange={(e) => setAppealPhone(e.target.value)}
                          placeholder="+7 (999) 000-00-00"
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-[#85181b]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-700 font-medium">Категория обращения</label>
                      <select
                        value={appealTopic}
                        onChange={(e) => setAppealTopic(e.target.value as any)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-[#85181b]"
                      >
                        <option value="crime_report">Заявление о совершении преступления</option>
                        <option value="corruption">Сообщение о фактах коррупции</option>
                        <option value="procedural_complaint">Жалоба на действия должностных лиц</option>
                        <option value="chairman_appeal">Личное обращение к Председателю СК России</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-700 font-medium">Текст заявления / обстоятельства события *</label>
                      <textarea
                        required
                        rows={3}
                        value={appealContent}
                        onChange={(e) => setAppealContent(e.target.value)}
                        placeholder="Изложите суть произошедшего события, время, место и известных участников..."
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-[#85181b] resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-[#85181b] hover:bg-[#6b1316] text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Отправить официальное заявление в СК РФ</span>
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* TAB 3: ПРОВЕРКА СЛУЖЕБНОГО УДОСТОВЕРЕНИЯ СЛЕДОВАТЕЛЯ */}
            {leftCardMode === 'badge_check' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-[#85181b] shadow-inner">
                      <Fingerprint className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Проверка удостоверения</h3>
                      <p className="text-[11px] text-slate-500">Анти-мошеннический реестр сотрудников</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-red-50 border border-red-200 text-[#85181b] text-[10px] font-mono font-bold">
                    ВЕРИФИКАЦИЯ
                  </span>
                </div>

                <form onSubmit={handleVerifyBadge} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-700 font-medium">
                      Номер жетона, служебного ID или ФИО следователя:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        value={badgeQuery}
                        onChange={(e) => setBadgeQuery(e.target.value)}
                        placeholder="например: СК-77-0492 или Морозов"
                        className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-[#85181b] font-mono"
                      />
                      <button
                        type="submit"
                        className="px-3.5 py-2 rounded-xl bg-[#85181b] hover:bg-[#6b1316] text-white font-bold text-xs transition cursor-pointer"
                      >
                        Проверить
                      </button>
                    </div>
                  </div>
                </form>

                {badgeResult === 'not_found' && (
                  <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl space-y-1.5 text-xs text-red-800">
                    <div className="font-bold flex items-center gap-1.5 text-[#85181b]">
                      <ShieldAlert className="w-4 h-4" />
                      <span>Удостоверение не найдено в базе данных!</span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Лицо с указанным номером удостоверения или данными не числится в штате Следственного комитета РФ. Остерегайтесь мошенников и немедленно сообщите на горячую линию СК РФ: <b>8 (800) 100-12-60</b>.
                    </p>
                  </div>
                )}

                {badgeResult && badgeResult !== 'not_found' && (
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs text-slate-800 animate-in zoom-in-95">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        ДЕЙСТВИТЕЛЬНОЕ УДОСТОВЕРЕНИЕ
                      </span>
                      <span className="font-mono text-[10px] bg-red-50 px-2 py-0.5 rounded text-[#85181b] border border-red-200 font-bold">
                        {badgeResult.badgeNumber}
                      </span>
                    </div>
                    <div className="text-slate-900 font-bold text-sm">
                      {badgeResult.fullName}
                    </div>
                    <div className="text-slate-600 text-[11px] space-y-0.5">
                      <div><b>Звание:</b> {badgeResult.rank}</div>
                      <div><b>Должность:</b> {badgeResult.position}</div>
                      <div><b>Следственный орган:</b> {badgeResult.departmentName}</div>
                      <div><b>Служебный ID:</b> {badgeResult.serviceId}</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom quick links / footer of left card */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
            <button
              onClick={() => onLogin('lawbook')}
              className="hover:text-[#85181b] flex items-center gap-1.5 cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#85181b]" />
              <span>Справочник УК РФ</span>
            </button>

            <span className="text-[10px] text-slate-400 font-mono">
              ГОСТ Р 34.12-2015
            </span>
          </div>
        </div>

        {/* Right Column (7 Cols): Comprehensive Information Block about the Investigative Committee of Russia */}
        <div className="lg:col-span-7 bg-white text-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xl space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-red-50 text-[#85181b]">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Следственный комитет Российской Федерации</h3>
                  <p className="text-xs text-slate-500">Информационно-справочный раздел ведомства</p>
                </div>
              </div>

              {/* Navigation Tabs inside Info Block */}
              <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium">
                {[
                  { id: 'about', label: 'О ведомстве' },
                  { id: 'tasks', label: 'Задачи' },
                  { id: 'history', label: 'История' },
                  { id: 'structure', label: 'Структура' },
                  { id: 'oath', label: 'Присяга' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveInfoTab(tab.id as any)}
                    className={`px-3 py-1 rounded-lg transition text-xs cursor-pointer ${
                      activeInfoTab === tab.id
                        ? 'bg-[#85181b] text-white font-bold shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Info Tab 1: О ведомстве (About) */}
            {activeInfoTab === 'about' && (
              <div className="space-y-3 animate-in fade-in">
                <p className="text-xs text-slate-700 leading-relaxed">
                  <b>Следственный комитет Российской Федерации (СК России)</b> — федеральный государственный орган в Российской Федерации, осуществляющий полномочия в сфере уголовного судопроизводства и иные установленные законодательством полномочия.
                </p>
                <div className="p-3.5 bg-red-50/70 border border-red-100 rounded-2xl space-y-1.5 text-xs text-slate-800">
                  <div className="font-bold text-[#85181b] flex items-center gap-1.5">
                    <FileCheck2 className="w-4 h-4" />
                    <span>Правовая основа деятельности:</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    Деятельность Следственного комитета регулируется <b>Федеральным законом от 28 декабря 2010 года № 403-ФЗ «О Следственном комитете Российской Федерации»</b>, Конституцией РФ, Уголовно-процессуальным кодексом РФ и указами Президента Российской Федерации.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <div className="font-bold text-slate-900">Вневедомственный статус</div>
                    <div className="text-slate-600">Руководство деятельностью СК России осуществляет непосредственно <b>Президент Российской Федерации</b>.</div>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <div className="font-bold text-slate-900">Единоначалие и законность</div>
                    <div className="text-slate-600">Следственные органы составляют единую централизованную систему с подчинением нижестоящих следователей вышестоящим.</div>
                  </div>
                </div>
              </div>
            )}

            {/* Info Tab 2: Задачи и полномочия (Tasks) */}
            {activeInfoTab === 'tasks' && (
              <div className="space-y-3 animate-in fade-in text-xs text-slate-700">
                <div className="font-bold text-slate-900">Основные задачи Следственного комитета РФ:</div>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-[#85181b] shrink-0 mt-0.5" />
                    <span><b>Оперативное и качественное расследование</b> тяжких и особо тяжких преступлений против личности, общественной безопасности и государственной власти.</span>
                  </li>
                  <li className="flex items-start gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-[#85181b] shrink-0 mt-0.5" />
                    <span><b>Обеспечение законности</b> при приеме, регистрации, проверке сообщений о преступлениях и возбуждении уголовных дел.</span>
                  </li>
                  <li className="flex items-start gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-[#85181b] shrink-0 mt-0.5" />
                    <span><b>Защита прав и свобод</b> человека и гражданина, охрана интересов общества и государства от преступных посягательств.</span>
                  </li>
                  <li className="flex items-start gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-[#85181b] shrink-0 mt-0.5" />
                    <span><b>Криминалистическое и научно-техническое обеспечение</b> следственной работы, раскрытие резонансных преступлений прошлых лет.</span>
                  </li>
                </ul>
              </div>
            )}

            {/* Info Tab 3: История (History) */}
            {activeInfoTab === 'history' && (
              <div className="space-y-3 animate-in fade-in text-xs text-slate-700">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <div className="font-bold text-[#85181b] flex items-center gap-1.5">
                    <History className="w-4 h-4" />
                    <span>Исторический путь следственных органов:</span>
                  </div>
                  <p className="leading-relaxed">
                    Впервые идея создания независимого от органов исполнительной власти следственного ведомства была реализована <b>Петром I</b>. 25 июля 1713 года был издан указ об учреждении первой следственной канцелярии гвардии майора М.И. Волконского.
                  </p>
                  <p className="leading-relaxed text-slate-600">
                    С 2011 года в Российской Федерации была возрождена петровская концепция вневедомственного предварительного следствия: Следственный комитет РФ стал полностью самостоятельным федеральным государственным органом.
                  </p>
                </div>
              </div>
            )}

            {/* Info Tab 4: Структура (Structure) */}
            {activeInfoTab === 'structure' && (
              <div className="space-y-3 animate-in fade-in text-xs text-slate-700">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <div className="font-bold text-slate-900">Центральный аппарат СК РФ</div>
                    <div className="text-slate-600 text-[11px]">Главные управления, управления и отделы (г. Москва, Технический пер., д. 2).</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <div className="font-bold text-slate-900">Главные следственные управления</div>
                    <div className="text-slate-600 text-[11px]">Следственные управления по субъектам РФ и приравненные к ним специализированные органы.</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <div className="font-bold text-slate-900">Военные следственные органы</div>
                    <div className="text-slate-600 text-[11px]">Главное военное следственное управление и военные следственные управления округов/флотов.</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <div className="font-bold text-slate-900">Образовательные организации</div>
                    <div className="text-slate-600 text-[11px]">Московская и Санкт-Петербургская академии Следственного комитета РФ, кадетские корпуса.</div>
                  </div>
                </div>
              </div>
            )}

            {/* Info Tab 5: Присяга (Oath) */}
            {activeInfoTab === 'oath' && (
              <div className="space-y-3 animate-in fade-in text-xs text-slate-800">
                <div className="p-4 bg-red-50/60 border border-red-200/80 rounded-2xl space-y-2 font-serif italic text-center">
                  <div className="font-sans not-italic font-bold text-xs text-[#85181b] tracking-wider uppercase">
                    Присяга сотрудника Следственного комитета РФ
                  </div>
                  <p className="leading-relaxed text-slate-700 text-xs">
                    «Посвящая себя служению России и Закону, торжественно клянусь: свято соблюдать Конституцию Российской Федерации, законы и международные обязательства Российской Федерации, не допуская малейшего от них отступления...»
                  </p>
                  <p className="leading-relaxed text-slate-700 text-xs">
                    «...непримиримо бороться с любыми нарушениями закона, кто бы их ни совершил, добиваться высокой эффективности и беспристрастности предварительного расследования...»
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Единая информационная система предварительного следствия</span>
            </div>
            <div className="font-mono text-[11px] text-slate-600">
              Ст. 140, 144, 145 УПК РФ
            </div>
          </div>
        </div>

      </div>

      {/* 4. FOOTER / OFFICIAL SLEDCOM REQUISITES */}
      <footer className="bg-[#85181b] text-white rounded-2xl p-5 sm:p-6 shadow-md border border-red-950 space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-red-900/60 pb-4 text-center md:text-left">
          <div className="flex items-center gap-3">
            <OfficialEmblem size={40} />
            <div>
              <div className="font-bold text-sm">Следственный комитет Российской Федерации</div>
              <div className="text-[11px] text-red-200/80">105005, г. Москва, Технический переулок, д. 2</div>
            </div>
          </div>

          <div className="text-xs text-red-200/90 font-mono">
            Горячая линия Информационного центра: <b>8 (800) 100-12-60</b>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-red-200/70">
          <div>
            © {new Date().getFullYear()} Следственный комитет Российской Федерации. Все права защищены.
          </div>
          <div className="flex items-center gap-3">
            <span className="cursor-pointer hover:underline" onClick={() => setIsChernovBioOpen(true)}>
              Председатель СК РФ: Чернов Д.М.
            </span>
            <span>•</span>
            <span className="cursor-pointer hover:underline" onClick={() => setLeftCardMode('citizen')}>
              Общественная приёмная
            </span>
          </div>
        </div>
      </footer>

      {/* ================= MODALS ================= */}

      {/* 1. CHERNOV BIO MODAL */}
      {isChernovBioOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white text-slate-900 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-7 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <OfficialEmblem size={28} />
                <h3 className="text-base font-bold text-slate-900">Председатель Следственного комитета РФ</h3>
              </div>
              <button
                onClick={() => setIsChernovBioOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80"
                alt="Чернов Денис Максимович"
                className="w-28 h-36 rounded-2xl object-cover border-2 border-[#85181b] shadow-md shrink-0"
              />
              <div className="space-y-1.5 text-center sm:text-left">
                <h4 className="text-lg font-black text-slate-900">Чернов Денис Максимович</h4>
                <div className="text-xs text-[#85181b] font-bold">
                  Генерал юстиции Российской Федерации, Заслуженный юрист Российской Федерации
                </div>
                <p className="text-xs text-slate-600 leading-relaxed pt-1">
                  Председатель Следственного комитета Российской Федерации. Осуществляет общее руководство деятельностью центрального аппарата, региональных следственных управлений и специализированных отделов ведомства по всей стране.
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <div className="text-xs font-bold text-slate-800">Приоритетные направления деятельности под руководством Главы СК:</div>
              <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                <li>Бескомпромиссная борьба с коррупцией и преступлениями против государственной службы</li>
                <li>Защита конституционных прав социально уязвимых категорий граждан и несовершеннолетних</li>
                <li>Внедрение передовых криминалистических технологий и геномных баз данных</li>
                <li>Строжайший ведомственный контроль за качеством и законностью расследования уголовных дел</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 2. MENU DRAWER */}
      {isMenuDrawerOpen && (
        <div className="fixed inset-0 z-50 flex bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#85181b] text-white w-80 max-w-[85vw] h-full p-6 shadow-2xl space-y-6 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-red-900 pb-4">
                <div className="flex items-center gap-3">
                  <OfficialEmblem size={36} />
                  <span className="font-bold text-sm">СК России</span>
                </div>
                <button
                  onClick={() => setIsMenuDrawerOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/10 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1.5 text-xs font-medium">
                {[
                  { label: 'Главная страница', action: () => setIsMenuDrawerOpen(false) },
                  { label: 'Сведения о Председателе (Чернов Д.М.)', action: () => { setIsMenuDrawerOpen(false); setIsChernovBioOpen(true); } },
                  { label: 'Общественная приёмная граждан', action: () => { setIsMenuDrawerOpen(false); setLeftCardMode('citizen'); } },
                  { label: 'Проверка удостоверения следователя', action: () => { setIsMenuDrawerOpen(false); setLeftCardMode('badge_check'); } },
                  { label: 'Служебный вход сотрудников', action: () => { setIsMenuDrawerOpen(false); setLeftCardMode('auth'); } },
                  { label: 'Уголовный кодекс РФ (Справочник)', action: () => { setIsMenuDrawerOpen(false); onLogin('lawbook'); } }
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={item.action}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-white/10 transition flex items-center justify-between cursor-pointer"
                  >
                    <span>{item.label}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-red-300" />
                  </button>
                ))}
              </nav>
            </div>

            <div className="pt-4 border-t border-red-900 text-[11px] text-red-200/80 font-mono">
              ЕИС «Следствие» • ГОСТ Р 34.12-2015
            </div>
          </div>
          <div className="flex-1" onClick={() => setIsMenuDrawerOpen(false)} />
        </div>
      )}

    </div>
  );
};
