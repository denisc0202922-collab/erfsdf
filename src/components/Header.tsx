import React, { useState, useEffect } from 'react';
import { OfficerProfile, UserRoleType } from '../types';
import { OfficialEmblem } from './OfficialEmblem';
import { OfficerPhoto } from './OfficerPhoto';
import {
  ShieldAlert,
  Clock,
  Radio,
  Search,
  Database,
  UserCheck,
  UserX,
  FileCheck,
  Award,
  Home,
  LogOut,
  ShieldCheck,
  LogIn,
  KeyRound
} from 'lucide-react';

interface HeaderProps {
  officer: OfficerProfile;
  userRole?: UserRoleType;
  isAuthenticated?: boolean;
  onUpdateOfficer: (officer: OfficerProfile) => void;
  onOpenSearch: () => void;
  onOpenDataModal: () => void;
  onOpenChangePassword?: () => void;
  onNavigateHome?: () => void;
  onLogout?: () => void;
  activeWantedCount: number;
  activeCasesCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  officer,
  userRole = 'guest',
  isAuthenticated = false,
  onUpdateOfficer,
  onOpenSearch,
  onOpenDataModal,
  onOpenChangePassword,
  onNavigateHome,
  onLogout,
  activeWantedCount,
  activeCasesCount
}) => {
  const [timeStr, setTimeStr] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');

  const isAdmin = userRole === 'admin';

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('ru-RU', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      );
      setDateStr(
        now.toLocaleDateString('ru-RU', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleDuty = () => {
    onUpdateOfficer({
      ...officer,
      onDuty: !officer.onDuty
    });
  };

  return (
    <header className="no-print bg-[#85181b] text-white shadow-lg border-b border-red-950 sticky top-0 z-40 px-4 lg:px-6 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Branding and Department */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div
            onClick={onNavigateHome}
            className="flex items-center gap-3 cursor-pointer group select-none"
            title="Перейти на главную страницу портала"
          >
            <div className="group-hover:scale-105 transition-transform drop-shadow-md">
              <OfficialEmblem size={44} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono tracking-widest text-amber-300 uppercase font-bold group-hover:text-amber-200 transition">
                  ЕИС «Следствие»
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/15 text-white border border-white/20 font-mono font-medium">
                  v2.5 RP
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-bold text-white leading-tight tracking-tight group-hover:text-amber-100 transition">
                Следственный комитет РФ
              </h1>
              <p className="text-xs text-red-100/90 hidden sm:block font-medium">
                {isAuthenticated ? officer.department : 'Общественная приёмная и служебный портал'}
              </p>
            </div>
          </div>

          {/* Mobile Duty toggle */}
          {isAuthenticated && (
            <div className="md:hidden">
              <button
                onClick={toggleDuty}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  officer.onDuty
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-black/30 text-white border border-white/20'
                }`}
              >
                {officer.onDuty ? (
                  <>
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                    </span>
                    На смене
                  </>
                ) : (
                  <>
                    <UserX className="w-3.5 h-3.5" />
                    Не на смене
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Center: Live RP clock & Operational Alerts */}
        <div className="hidden lg:flex items-center gap-4 text-xs font-mono bg-black/25 border border-white/15 px-4 py-1.5 rounded-xl backdrop-blur-sm">
          <div className="flex items-center gap-2 text-white">
            <Clock className="w-4 h-4 text-amber-300" />
            <span className="text-white font-bold">{timeStr}</span>
            <span className="text-red-300/60">|</span>
            <span className="text-red-100 font-medium">{dateStr}</span>
          </div>

          <div className="h-4 w-[1px] bg-white/20" />

          {/* Quick status indicators */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-amber-200">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Розыск: <strong className="text-white font-bold">{activeWantedCount}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 text-sky-200">
              <FileCheck className="w-3.5 h-3.5" />
              <span>Дел: <strong className="text-white font-bold">{activeCasesCount}</strong></span>
            </div>
          </div>
        </div>

        {/* Right: Search, Duty Toggle, Profile Preview, DB actions, Logout */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          
          {/* Universal Fast Search Button */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1.5 rounded-xl text-xs text-white transition shadow-sm cursor-pointer"
            title="Быстрый поиск по базе данных"
          >
            <Search className="w-3.5 h-3.5 text-red-200" />
            <span className="hidden sm:inline font-medium">Поиск по ЕИС...</span>
            <kbd className="hidden sm:inline-block bg-black/30 border border-white/20 text-[10px] px-1.5 py-0.5 rounded text-white font-mono">
              Ctrl+K
            </kbd>
          </button>

          {/* Backup / Export / Import Button (Chairman Only) */}
          {isAdmin && (
            <button
              onClick={onOpenDataModal}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white hover:text-amber-200 transition cursor-pointer shadow-sm"
              title="Резервное копирование и экспорт базы данных (только для Председателя СК РФ)"
            >
              <Database className="w-4 h-4" />
            </button>
          )}

          {/* Duty toggle (Desktop) */}
          {isAuthenticated && (
            <button
              onClick={toggleDuty}
              className={`hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer ${
                officer.onDuty
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-black/30 hover:bg-black/40 text-white border border-white/20'
              }`}
            >
              {officer.onDuty ? (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-200 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                  </span>
                  <span>На смене</span>
                </>
              ) : (
                <>
                  <UserX className="w-3.5 h-3.5" />
                  <span>Не на смене</span>
                </>
              )}
            </button>
          )}

          {/* Officer Quick Badge info & Logout */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2 pl-2 border-l border-white/20">
              <div
                onClick={onNavigateHome}
                className="flex items-center gap-2.5 cursor-pointer group"
                title="Служебный профиль сотрудника"
              >
                <div className="w-8 h-8 shrink-0 rounded-xl overflow-hidden border border-white/40 shadow-sm group-hover:border-amber-300 transition">
                  <OfficerPhoto
                    src={officer.photoUrl}
                    alt={officer.fullName}
                    className="w-full h-full object-cover"
                    rank={officer.rank}
                    fallbackInitials={officer.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  />
                </div>
                <div className="hidden xl:block text-left">
                  <div className="text-xs font-bold text-white leading-tight group-hover:text-amber-200 transition flex items-center gap-1.5">
                    <span>{officer.fullName}</span>
                    {isAdmin && (
                      <span className="px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 font-black text-[9px] shadow-sm">
                        ГЕНЕРАЛ
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-red-100 font-medium">
                    {officer.rank}
                  </div>
                </div>
              </div>

              {/* Change Password Button */}
              {onOpenChangePassword && (
                <button
                  type="button"
                  onClick={onOpenChangePassword}
                  className="p-2 rounded-xl bg-white/10 hover:bg-black/30 border border-white/20 text-white hover:text-amber-300 transition cursor-pointer shadow-sm"
                  title="Сменить служебный пароль учетной записи"
                >
                  <KeyRound className="w-4 h-4" />
                </button>
              )}

              {/* Logout Button */}
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="p-2 rounded-xl bg-white/10 hover:bg-black/30 border border-white/20 text-white hover:text-red-200 transition cursor-pointer shadow-sm"
                  title="Завершить смену и выйти из служебной учетной записи"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 pl-2 border-l border-white/20">
              <button
                onClick={onNavigateHome}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-red-50 text-[#85181b] font-bold text-xs shadow-md transition cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Служебный вход</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
