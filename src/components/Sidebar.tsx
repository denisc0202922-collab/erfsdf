import React from 'react';
import {
  Home,
  LayoutDashboard,
  Users,
  Briefcase,
  FileText,
  FileSpreadsheet,
  BookOpen,
  IdCard,
  Terminal,
  ShieldAlert,
  ShieldCheck,
  Building2,
  Flame,
  Lock,
  GraduationCap
} from 'lucide-react';
import { ActiveTabType, UserRoleType, RankType } from '../types';

export type NavTab = ActiveTabType;

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  wantedCount: number;
  activeCasesCount: number;
  reportsCount: number;
  userRole?: UserRoleType;
  officerRank?: RankType;
  isAuthenticated?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  wantedCount,
  activeCasesCount,
  reportsCount,
  userRole = 'guest',
  officerRank,
  isAuthenticated = false
}) => {
  const isAdmin = userRole === 'admin';
  const isJuniorLieutenant = officerRank?.toLowerCase().includes('младший лейтенант') || false;

  const navItems = [
    {
      id: 'home' as NavTab,
      label: 'Главная страница (Вход)',
      shortLabel: 'Главная',
      icon: Home,
      badge: null,
      publicAccess: true
    },
    {
      id: 'admin' as NavTab,
      label: 'Панель Председателя',
      shortLabel: 'Управление',
      icon: ShieldCheck,
      badge: 'ГЕНЕРАЛ',
      badgeColor: 'bg-red-500/20 text-red-300 border-red-500/30',
      adminOnly: true
    },
    {
      id: 'junior_exam' as NavTab,
      label: 'Аттестация и экзамен',
      shortLabel: 'Аттестация',
      icon: GraduationCap,
      badge: '3 ТЕСТА',
      badgeColor: 'bg-amber-500/20 text-amber-900 border-amber-500/30 font-bold',
      juniorOnly: true
    },
    {
      id: 'dashboard' as NavTab,
      label: 'Сводка и дежурство',
      shortLabel: 'Сводка',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'offenders' as NavTab,
      label: 'База правонарушителей',
      shortLabel: 'Розыск / Досье',
      icon: Users,
      badge: wantedCount > 0 ? wantedCount : null,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30'
    },
    {
      id: 'cases' as NavTab,
      label: 'Уголовные дела',
      shortLabel: 'Дела',
      icon: Briefcase,
      badge: activeCasesCount > 0 ? activeCasesCount : null,
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
    },
    {
      id: 'documents' as NavTab,
      label: 'Генератор документов',
      shortLabel: 'Бланки',
      icon: FileText,
      badge: null
    },
    {
      id: 'reports' as NavTab,
      label: 'Рапорты и отчеты',
      shortLabel: 'Рапорты',
      icon: FileSpreadsheet,
      badge: reportsCount > 0 ? reportsCount : null,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
    },
    {
      id: 'lawbook' as NavTab,
      label: 'Справочник УК / УПК',
      shortLabel: 'УК РФ',
      icon: BookOpen,
      badge: null,
      publicAccess: true
    },
    {
      id: 'binder' as NavTab,
      label: 'RP-Биндер отыгровок',
      shortLabel: 'Отыгровки',
      icon: Terminal,
      badge: 'RP',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
    },
    {
      id: 'badge' as NavTab,
      label: 'Удостоверение и профиль',
      shortLabel: 'Удостоверение',
      icon: IdCard,
      badge: null
    }
  ];

  // Filter items based on user role, rank & auth:
  // For staff/employees working in the system, exclude 'home' so the sidebar only shows operational workspaces
  const displayNavItems = activeTab === 'home'
    ? navItems.filter((item) => item.id === 'home')
    : navItems.filter((item) => {
        if (item.id === 'home') return false; // Remove home button for internal employees
        if (item.adminOnly && !isAdmin) return false;
        if (item.juniorOnly && !isJuniorLieutenant) return false;
        return true;
      });

  return (
    <aside className="no-print w-full md:w-64 bg-white border border-slate-200/90 shadow-sm rounded-2xl flex md:flex-col justify-between shrink-0 p-3 overflow-x-auto md:overflow-y-auto">
      {/* Top Navigation Links */}
      <nav className="flex md:flex-col gap-1.5 w-full">
        <div className="hidden md:block px-3 py-2 text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">
          {activeTab === 'home' ? 'Навигация' : 'Служебные модули'}
        </div>

        {displayNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-xs md:text-sm font-semibold transition whitespace-nowrap md:whitespace-normal group cursor-pointer ${
                isActive
                  ? 'bg-[#85181b] text-white shadow-md'
                  : 'text-slate-700 hover:text-[#85181b] hover:bg-red-50/70'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={`w-4 h-4 transition ${
                    isActive
                      ? 'text-white'
                      : 'text-slate-500 group-hover:text-[#85181b]'
                  }`}
                />
                <span className="hidden md:inline">{item.label}</span>
                <span className="md:hidden">{item.shortLabel}</span>
              </div>

              {item.badge && (
                <span
                  className={`hidden sm:inline-flex text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-red-100 text-[#85181b]'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Operational Banner / System status */}
      <div className="hidden md:block mt-6 pt-4 border-t border-slate-100 px-2">
        <div className="bg-red-50/80 border border-red-100 rounded-xl p-3 text-xs shadow-sm">
          <div className="flex items-center gap-1.5 text-[#85181b] font-bold mb-1">
            <Flame className="w-3.5 h-3.5 text-[#85181b]" />
            <span>Спецрежим «Сирена»</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
            Усиленный контроль над оборотом нелегального оружия и пресечением тяжких преступлений.
          </p>
        </div>

        <div className="mt-3 text-center text-[10px] text-slate-400 font-mono font-semibold">
          ГСУ СК РФ © 2026
        </div>
      </div>
    </aside>
  );
};
