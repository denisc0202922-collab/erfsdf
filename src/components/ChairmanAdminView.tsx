import React, { useState } from 'react';
import {
  DepartmentItem,
  UserAccount,
  ChairmanOrder,
  RankType,
  OfficerProfile,
  CriminalCase,
  ActiveTabType
} from '../types';
import { OfficialEmblem } from './OfficialEmblem';
import {
  Shield,
  ShieldCheck,
  UserPlus,
  Building2,
  FileSignature,
  Settings,
  Users,
  Search,
  Plus,
  Edit,
  Trash2,
  Key,
  Lock,
  Unlock,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  LogIn,
  Eye,
  EyeOff,
  Copy,
  Printer,
  FileText,
  Phone,
  MapPin,
  Briefcase,
  Award,
  Sparkles,
  RefreshCw,
  X,
  ChevronRight,
  Filter,
  BadgeCheck,
  ShieldAlert,
  ArrowRight,
  GraduationCap
} from 'lucide-react';
import {
  QUALIFICATION_QUESTIONS,
  getExamSubmissions,
  saveExamSubmissions,
  ExamSubmission
} from '../data/examQuestions';

interface ChairmanAdminViewProps {
  departments: DepartmentItem[];
  accounts: UserAccount[];
  orders: ChairmanOrder[];
  cases: CriminalCase[];
  currentOfficer: OfficerProfile;
  onUpdateDepartments: (departments: DepartmentItem[]) => void;
  onUpdateAccounts: (accounts: UserAccount[]) => void;
  onUpdateOrders: (orders: ChairmanOrder[]) => void;
  onSwitchOfficer: (account: UserAccount) => void;
  onNavigate: (tab: ActiveTabType) => void;
  onShowToast: (msg: string) => void;
  onClose?: () => void;
}

const ALL_RANKS: RankType[] = [
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

export const ChairmanAdminView: React.FC<ChairmanAdminViewProps> = ({
  departments,
  accounts,
  orders,
  cases,
  currentOfficer,
  onUpdateDepartments,
  onUpdateAccounts,
  onUpdateOrders,
  onSwitchOfficer,
  onNavigate,
  onShowToast,
  onClose
}) => {
  const [activeAdminTab, setActiveAdminTab] = useState<'accounts' | 'departments' | 'orders' | 'exams' | 'overview'>('accounts');

  // Exam Submissions state
  const [examSubmissions, setExamSubmissions] = useState<ExamSubmission[]>(() => getExamSubmissions());
  const [selectedExamSubmission, setSelectedExamSubmission] = useState<ExamSubmission | null>(null);
  const [chairmanExamComment, setChairmanExamComment] = useState('');

  // Reload submissions on tab change or mount
  const refreshSubmissions = () => {
    setExamSubmissions(getExamSubmissions());
  };

  const handleApproveExam = (submission: ExamSubmission) => {
    // 1. Mark submission approved
    const updatedSubmissions = examSubmissions.map((s) => {
      if (s.id === submission.id) {
        return {
          ...s,
          status: 'approved' as const,
          reviewedAt: new Date().toLocaleString('ru-RU'),
          chairmanComment: chairmanExamComment || 'Экзаменационные ответы проверены и признаны исчерпывающими. Звание «Лейтенант юстиции» присвоено.'
        };
      }
      return s;
    });
    saveExamSubmissions(updatedSubmissions);
    setExamSubmissions(updatedSubmissions);

    // 2. Promote account if exists in accounts list
    const updatedAccounts = accounts.map((acc) => {
      if (acc.fullName.toLowerCase() === submission.officerName.toLowerCase() || acc.badgeNumber === submission.badgeNumber) {
        return {
          ...acc,
          rank: 'Лейтенант юстиции' as RankType
        };
      }
      return acc;
    });
    onUpdateAccounts(updatedAccounts);

    // 3. Issue official Chairman Order
    const newOrder: ChairmanOrder = {
      id: `ord-${Date.now()}`,
      orderNumber: `П-СК-${String(orders.length + 1).padStart(2, '0')}/24`,
      date: new Date().toISOString().split('T')[0],
      type: 'rank_promotion',
      title: `О присвоении очередного специального звания «Лейтенант юстиции» (${submission.officerName})`,
      targetOfficerName: submission.officerName,
      targetDepartment: submission.department,
      content: `В соответствии с Положением о порядке прохождения службы в Следственном комитете РФ и на основании успешной сдачи квалификационного экзамена:\n\n1. Присвоить очередное специальное звание «Лейтенант юстиции» сотруднику ${submission.officerName} (жетон ${submission.badgeNumber}).\n2. Направить выписку из приказа в следственное управление для внесения в личное дело сотрудника.`,
      issuedBy: 'Чернов Денис Максимович, Генерал юстиции РФ',
      seal: true,
      status: 'active'
    };
    const updatedOrders = [newOrder, ...orders];
    onUpdateOrders(updatedOrders);

    setSelectedExamSubmission(null);
    setChairmanExamComment('');
    onShowToast(`Экзамен офицера ${submission.officerName} успешно утвержден! Издан приказ № ${newOrder.orderNumber} о присвоении звания «Лейтенант юстиции».`);
  };

  const handleRejectExam = (submission: ExamSubmission) => {
    if (!chairmanExamComment.trim()) {
      onShowToast('Укажите причину возврата экзаменационной работы на доработку!');
      return;
    }
    const updatedSubmissions = examSubmissions.map((s) => {
      if (s.id === submission.id) {
        return {
          ...s,
          status: 'rejected' as const,
          reviewedAt: new Date().toLocaleString('ru-RU'),
          chairmanComment: chairmanExamComment
        };
      }
      return s;
    });
    saveExamSubmissions(updatedSubmissions);
    setExamSubmissions(updatedSubmissions);

    setSelectedExamSubmission(null);
    setChairmanExamComment('');
    onShowToast(`Экзаменационная работа ${submission.officerName} отправлена на доработку.`);
  };

  // Search & Filters
  const [accountSearch, setAccountSearch] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('all');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');
  const [deptSearch, setDeptSearch] = useState('');

  // Modals
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<UserAccount | null>(null);

  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<DepartmentItem | null>(null);

  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [viewingOrder, setViewingOrder] = useState<ChairmanOrder | null>(null);

  // In-app deletion confirmation states (replaces iframe-blocked window.confirm)
  const [accountToDelete, setAccountToDelete] = useState<UserAccount | null>(null);
  const [deptToDelete, setDeptToDelete] = useState<DepartmentItem | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<ChairmanOrder | null>(null);

  const [visiblePasswords, setVisiblePasswords] = useState<{ [id: string]: boolean }>({});

  // Form State: User Account
  const [accForm, setAccForm] = useState({
    username: '',
    password: '',
    fullName: '',
    rank: 'Старший лейтенант юстиции' as RankType,
    position: 'Следователь по особо важным делам',
    departmentId: departments[0]?.id || 'dept-orovd',
    badgeNumber: '',
    serviceId: '',
    callsign: '',
    role: 'investigator' as UserAccount['role'],
    clearanceLevel: 'Совершенно секретно' as UserAccount['clearanceLevel'],
    status: 'active' as UserAccount['status'],
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    weaponType: 'Пистолет Макарова (ПМ) 9мм',
    weaponSerial: 'ПМ № 48291-СК',
    phone: '+7 (495) 986-77-00',
    notes: ''
  });

  // Form State: Department
  const [deptForm, setDeptForm] = useState({
    name: '',
    shortName: '',
    code: '',
    headName: '',
    headRank: 'Подполковник юстиции',
    address: '',
    phone: '',
    staffCount: 15,
    jurisdiction: '',
    status: 'active' as DepartmentItem['status'],
    badgeColor: 'blue'
  });

  // Form State: Chairman Order
  const [orderForm, setOrderForm] = useState({
    orderNumber: `П-СК-${String(orders.length + 1).padStart(2, '0')}/24`,
    date: new Date().toISOString().split('T')[0],
    type: 'appointment' as ChairmanOrder['type'],
    title: '',
    targetOfficerName: '',
    targetDepartment: departments[0]?.name || '',
    content: ''
  });

  // Toggle Password Visibility
  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Open Create Account Modal
  const handleOpenCreateAccount = () => {
    setEditingAccount(null);
    const randNum = Math.floor(1000 + Math.random() * 9000);
    setAccForm({
      username: `investigator_${Math.floor(10 + Math.random() * 90)}`,
      password: String(Math.floor(1000 + Math.random() * 9000)),
      fullName: '',
      rank: 'Старший лейтенант юстиции',
      position: 'Следователь следственного отдела',
      departmentId: departments[0]?.id || '',
      badgeNumber: `СК-77-${randNum}`,
      serviceId: `ID-${randNum}`,
      callsign: `След-${Math.floor(1 + Math.random() * 20)}`,
      role: 'investigator',
      clearanceLevel: 'Совершенно секретно',
      status: 'active',
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
      weaponType: 'Пистолет Макарова (ПМ) 9мм',
      weaponSerial: `ПМ № ${randNum}-СК`,
      phone: '+7 (495) 986-77-00',
      notes: ''
    });
    setIsAccountModalOpen(true);
  };

  // Open Edit Account Modal
  const handleOpenEditAccount = (acc: UserAccount) => {
    setEditingAccount(acc);
    setAccForm({
      username: acc.username,
      password: acc.password,
      fullName: acc.fullName,
      rank: acc.rank,
      position: acc.position,
      departmentId: acc.departmentId,
      badgeNumber: acc.badgeNumber,
      serviceId: acc.serviceId,
      callsign: acc.callsign,
      role: acc.role,
      clearanceLevel: acc.clearanceLevel,
      status: acc.status,
      photoUrl: acc.photoUrl,
      weaponType: acc.weaponType || 'Пистолет Макарова (ПМ) 9мм',
      weaponSerial: acc.weaponSerial || '',
      phone: acc.phone || '',
      notes: acc.notes || ''
    });
    setIsAccountModalOpen(true);
  };

  // Save Account (Create or Update)
  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accForm.username.trim() || !accForm.password.trim() || !accForm.fullName.trim()) {
      onShowToast('Заполните обязательные поля: логин, пароль, ФИО');
      return;
    }

    const matchedDept = departments.find((d) => d.id === accForm.departmentId);
    const departmentName = matchedDept ? matchedDept.name : 'Главное следственное управление (ГСУ)';

    if (editingAccount) {
      const updatedAccounts = accounts.map((a) =>
        a.id === editingAccount.id
          ? {
              ...a,
              ...accForm,
              departmentName
            }
          : a
      );
      onUpdateAccounts(updatedAccounts);
      onShowToast(`Учетная запись сотрудника ${accForm.fullName} обновлена`);
    } else {
      // Check username collision
      const exists = accounts.some(
        (a) => a.username.toLowerCase() === accForm.username.trim().toLowerCase()
      );
      if (exists) {
        onShowToast('Ошибка: Пользователь с таким логином уже существует в системе');
        return;
      }

      const newAccount: UserAccount = {
        id: `acc-${Date.now()}`,
        ...accForm,
        departmentName,
        createdAt: new Date().toISOString().split('T')[0]
      };
      onUpdateAccounts([newAccount, ...accounts]);
      onShowToast(`Служебная учетная запись ${accForm.username} создана`);
    }

    setIsAccountModalOpen(false);
  };

  // Delete Account
  const handleDeleteAccount = (acc: UserAccount) => {
    if (acc.username === 'chernov_d') {
      onShowToast('Учетная запись Председателя СК РФ защищена от удаления');
      return;
    }
    setAccountToDelete(acc);
  };

  // Confirm Delete Account Action
  const confirmDeleteAccount = () => {
    if (!accountToDelete) return;
    const target = accountToDelete;
    const filtered = accounts.filter((a) => a.id !== target.id);
    onUpdateAccounts(filtered);
    
    // If currently logged-in officer was the deleted account, auto-switch to Chairman
    if (currentOfficer.badgeNumber === target.badgeNumber) {
      const fallback = accounts.find((a) => a.username === 'chernov_d') || filtered[0];
      if (fallback) {
        onSwitchOfficer(fallback);
      }
    }
    onShowToast(`Учетная запись ${target.username} (${target.fullName}) успешно удалена`);
    setAccountToDelete(null);
  };

  // Open Create Department Modal
  const handleOpenCreateDept = () => {
    setEditingDept(null);
    setDeptForm({
      name: '',
      shortName: '',
      code: `СК-ОТДЕЛ-${departments.length + 1}`,
      headName: '',
      headRank: 'Подполковник юстиции',
      address: 'г. Москва, ул. ',
      phone: '+7 (495) ',
      staffCount: 15,
      jurisdiction: '',
      status: 'active',
      badgeColor: 'blue'
    });
    setIsDeptModalOpen(true);
  };

  // Open Edit Department Modal
  const handleOpenEditDept = (dept: DepartmentItem) => {
    setEditingDept(dept);
    setDeptForm({
      name: dept.name,
      shortName: dept.shortName,
      code: dept.code,
      headName: dept.headName,
      headRank: dept.headRank,
      address: dept.address,
      phone: dept.phone,
      staffCount: dept.staffCount,
      jurisdiction: dept.jurisdiction,
      status: dept.status,
      badgeColor: dept.badgeColor || 'blue'
    });
    setIsDeptModalOpen(true);
  };

  // Save Department
  const handleSaveDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptForm.name.trim()) {
      onShowToast('Введите наименование отдела');
      return;
    }

    if (editingDept) {
      const updatedDepts = departments.map((d) =>
        d.id === editingDept.id ? { ...d, ...deptForm } : d
      );
      onUpdateDepartments(updatedDepts);
      onShowToast(`Структурное подразделение «${deptForm.shortName || deptForm.name}» обновлено`);
    } else {
      const newDept: DepartmentItem = {
        id: `dept-${Date.now()}`,
        ...deptForm,
        shortName: deptForm.shortName || deptForm.name,
        createdAt: new Date().toISOString().split('T')[0]
      };
      onUpdateDepartments([...departments, newDept]);
      onShowToast(`Новый следственный отдел «${newDept.shortName}» успешно создан`);
    }

    setIsDeptModalOpen(false);
  };

  // Delete Department
  const handleDeleteDepartment = (dept: DepartmentItem) => {
    if (departments.length <= 1) {
      onShowToast('В системе должно оставаться как минимум одно следственное управление');
      return;
    }
    setDeptToDelete(dept);
  };

  // Confirm Delete Department Action
  const confirmDeleteDepartment = () => {
    if (!deptToDelete) return;
    const target = deptToDelete;
    const filtered = departments.filter((d) => d.id !== target.id);
    onUpdateDepartments(filtered);
    onShowToast(`Подразделение «${target.shortName}» исключено из реестра структуры`);
    setDeptToDelete(null);
  };

  // Delete Order
  const handleDeleteOrder = (ord: ChairmanOrder) => {
    setOrderToDelete(ord);
  };

  // Confirm Delete Order Action
  const confirmDeleteOrder = () => {
    if (!orderToDelete) return;
    const target = orderToDelete;
    const filtered = orders.filter((o) => o.id !== target.id);
    onUpdateOrders(filtered);
    onShowToast(`Приказ № ${target.orderNumber} удален из реестра`);
    setOrderToDelete(null);
  };

  // Save Order
  const handleSaveOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderForm.title.trim() || !orderForm.content.trim()) {
      onShowToast('Заполните тему и текст приказа Председателя СК');
      return;
    }

    const newOrder: ChairmanOrder = {
      id: `ord-${Date.now()}`,
      orderNumber: orderForm.orderNumber,
      date: orderForm.date,
      type: orderForm.type,
      title: orderForm.title,
      targetOfficerName: orderForm.targetOfficerName,
      targetDepartment: orderForm.targetDepartment,
      content: orderForm.content,
      issuedBy: 'Чернов Денис Максимович, Генерал юстиции РФ',
      seal: true,
      status: 'active'
    };

    onUpdateOrders([newOrder, ...orders]);
    onShowToast(`Приказ Председателя СК № ${orderForm.orderNumber} издан и внесен в реестр`);
    setIsOrderModalOpen(false);
  };

  // Filtered Accounts
  const filteredAccounts = accounts.filter((acc) => {
    const matchesSearch =
      acc.fullName.toLowerCase().includes(accountSearch.toLowerCase()) ||
      acc.username.toLowerCase().includes(accountSearch.toLowerCase()) ||
      acc.badgeNumber.toLowerCase().includes(accountSearch.toLowerCase()) ||
      acc.position.toLowerCase().includes(accountSearch.toLowerCase());

    const matchesDept = selectedDeptFilter === 'all' || acc.departmentId === selectedDeptFilter;
    const matchesRole = selectedRoleFilter === 'all' || acc.role === selectedRoleFilter;

    return matchesSearch && matchesDept && matchesRole;
  });

  // Filtered Departments
  const filteredDepts = departments.filter((d) =>
    d.name.toLowerCase().includes(deptSearch.toLowerCase()) ||
    d.shortName.toLowerCase().includes(deptSearch.toLowerCase()) ||
    d.headName.toLowerCase().includes(deptSearch.toLowerCase()) ||
    d.code.toLowerCase().includes(deptSearch.toLowerCase())
  );

  const isAdmin = currentOfficer.rank === 'Генерал юстиции РФ' || currentOfficer.fullName.includes('Чернов');

  if (!isAdmin) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto py-12 px-4 animate-in fade-in font-sans">
        <div className="bg-slate-950 border border-red-900/80 rounded-3xl p-8 sm:p-10 text-center text-white shadow-2xl space-y-6">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-red-950/80 border-2 border-red-600 flex items-center justify-center text-red-400 shadow-xl shadow-red-900/40">
            <ShieldAlert className="w-10 h-10" />
          </div>
          
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-bold font-mono">
              ОТКАЗ В ДОСТУПЕ • 403 FORBIDDEN
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Панель управления Председателя СК РФ
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed max-w-xl mx-auto">
              Раздел высшей категории секретности предназначен исключительно для <b>Председателя Следственного комитета Российской Федерации</b> (Генерал юстиции РФ Чернов Денис Максимович). Для рядовых сотрудников доступ закрыт.
            </p>
          </div>

          <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 text-left text-xs text-slate-400 space-y-2 max-w-md mx-auto">
            <div className="flex items-center justify-between text-slate-300 font-medium border-b border-slate-800 pb-2">
              <span>Текущая учетная запись:</span>
              <span className="text-amber-400 font-bold">{currentOfficer.rank}</span>
            </div>
            <div className="text-slate-200 font-semibold">{currentOfficer.fullName}</div>
            <div className="text-[11px] text-slate-500">Должность: {currentOfficer.position}</div>
            <div className="text-[11px] text-slate-500">Подразделение: {currentOfficer.department}</div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('dashboard')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg transition cursor-pointer"
            >
              Вернуться в рабочий кабинет следователя
            </button>
            <button
              onClick={() => onNavigate('home')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition cursor-pointer"
            >
              Вход под учетной записью Председателя
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans animate-in fade-in">
      
      {/* 1. TOP OFFICIAL CHAIRMAN BANNER */}
      <div className="bg-gradient-to-r from-[#85181b] via-[#6f1215] to-[#490b0d] text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-red-950 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        {/* Background Crest Watermark */}
        <div className="absolute right-3 -bottom-6 opacity-10 pointer-events-none">
          <OfficialEmblem size={240} />
        </div>

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left z-10">
          <div className="relative shrink-0">
            <img
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80"
              alt="Чернов Денис Максимович"
              className="w-20 h-24 sm:w-24 sm:h-28 rounded-2xl object-cover border-2 border-amber-400/80 shadow-2xl"
            />
            <span className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] shadow border border-white">
              ГЕНЕРАЛ
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-xs font-bold text-amber-300">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Панель высшего управления • Председатель СК России</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              Чернов Денис Максимович
            </h1>
            <p className="text-xs sm:text-sm text-red-100/90 font-medium max-w-2xl leading-relaxed">
              Генерал юстиции РФ • Административное руководство Следственным комитетом, кадровый реестр учетных записей, утверждение отделов и нормативных актов.
            </p>
          </div>
        </div>

        {/* Quick Top Stats & Actions */}
        <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 z-10 shrink-0">
          <div className="bg-black/30 backdrop-blur-sm border border-white/10 px-4 py-2.5 rounded-2xl text-center">
            <div className="text-lg font-black text-amber-400">{accounts.length}</div>
            <div className="text-[10px] text-slate-300 uppercase tracking-wider font-semibold">Учётных записей</div>
          </div>
          <div className="bg-black/30 backdrop-blur-sm border border-white/10 px-4 py-2.5 rounded-2xl text-center">
            <div className="text-lg font-black text-amber-400">{departments.length}</div>
            <div className="text-[10px] text-slate-300 uppercase tracking-wider font-semibold">Отделов в структуре</div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              title="Закрыть панель"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. ADMIN NAVIGATION TABS */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'accounts', label: 'Управление учетными записями', icon: Users, count: accounts.length },
            { id: 'departments', label: 'Следственные отделы и управления', icon: Building2, count: departments.length },
            { id: 'orders', label: 'Приказы Председателя СК', icon: FileSignature, count: orders.length },
            { id: 'exams', label: 'Аттестация и экзамены мл. лейтенантов', icon: GraduationCap, count: examSubmissions.filter(s => s.status === 'pending').length },
            { id: 'overview', label: 'Сводка и аудит безопасности', icon: ShieldAlert }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeAdminTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveAdminTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                  isActive
                    ? 'bg-[#85181b] text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Global Quick Action */}
        <div className="flex items-center gap-2">
          {activeAdminTab === 'accounts' && (
            <button
              onClick={handleOpenCreateAccount}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Создать учётку сотрудника</span>
            </button>
          )}
          {activeAdminTab === 'departments' && (
            <button
              onClick={handleOpenCreateDept}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#85181b] hover:bg-red-800 text-white font-bold text-xs shadow-md transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Добавить отдел / управление</span>
            </button>
          )}
          {activeAdminTab === 'orders' && (
            <button
              onClick={() => {
                setOrderForm({
                  orderNumber: `П-СК-${String(orders.length + 1).padStart(2, '0')}/24`,
                  date: new Date().toISOString().split('T')[0],
                  type: 'appointment',
                  title: '',
                  targetOfficerName: '',
                  targetDepartment: departments[0]?.name || '',
                  content: ''
                });
                setIsOrderModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#85181b] hover:bg-red-800 text-white font-bold text-xs shadow-md transition cursor-pointer"
            >
              <FileSignature className="w-4 h-4" />
              <span>Издать приказ Председателя</span>
            </button>
          )}
        </div>
      </div>

      {/* ================= TAB 1: ACCOUNTS MANAGEMENT ================= */}
      {activeAdminTab === 'accounts' && (
        <div className="space-y-4">
          
          {/* Filter & Search Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={accountSearch}
                onChange={(e) => setAccountSearch(e.target.value)}
                placeholder="Поиск по ФИО, логину, жетону..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#85181b] focus:bg-white"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Filter className="w-3.5 h-3.5" />
                <span>Отдел:</span>
              </div>
              <select
                value={selectedDeptFilter}
                onChange={(e) => setSelectedDeptFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#85181b]"
              >
                <option value="all">Все следственные отделы ({departments.length})</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.shortName}
                  </option>
                ))}
              </select>

              <select
                value={selectedRoleFilter}
                onChange={(e) => setSelectedRoleFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#85181b]"
              >
                <option value="all">Все роли</option>
                <option value="investigator">Следователи</option>
                <option value="forensic">Криминалисты</option>
                <option value="head">Руководители отделов</option>
                <option value="admin">Председатель / Администраторы</option>
              </select>
            </div>
          </div>

          {/* Accounts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAccounts.map((acc) => {
              const isChairman = acc.username === 'chernov_d';
              const isCurrent = currentOfficer.badgeNumber === acc.badgeNumber;
              const showPass = visiblePasswords[acc.id];

              return (
                <div
                  key={acc.id}
                  className={`bg-white rounded-2xl border p-5 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between ${
                    isCurrent
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                      : isChairman
                      ? 'border-amber-400 bg-amber-50/20'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Header with Avatar and Badges */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={acc.photoUrl}
                          alt={acc.fullName}
                          className="w-12 h-14 rounded-xl object-cover border border-slate-200 shadow-sm shrink-0"
                        />
                        <div className="space-y-0.5">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                              acc.role === 'admin'
                                ? 'bg-red-100 text-[#85181b]'
                                : acc.role === 'head'
                                ? 'bg-amber-100 text-amber-800'
                                : acc.role === 'forensic'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {acc.rank}
                          </span>
                          <h3 className="text-sm font-bold text-slate-900 leading-tight">
                            {acc.fullName}
                          </h3>
                          <div className="text-[11px] text-slate-500 font-medium">
                            {acc.position}
                          </div>
                        </div>
                      </div>

                      {isCurrent && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] shrink-0">
                          АКТИВЕН ВЫ
                        </span>
                      )}
                    </div>

                    {/* Department and Requisites */}
                    <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs text-slate-600 border border-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Подразделение:</span>
                        <span className="font-semibold text-slate-800 truncate max-w-[180px]">
                          {acc.departmentName}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Номер жетона:</span>
                        <span className="font-mono font-bold text-slate-800">{acc.badgeNumber}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Позывной:</span>
                        <span className="font-mono text-slate-700">{acc.callsign}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Допуск:</span>
                        <span className="font-medium text-amber-700">{acc.clearanceLevel}</span>
                      </div>
                    </div>

                    {/* Credentials Box (Login + Password) */}
                    <div className="p-3 bg-slate-900 text-slate-100 rounded-xl space-y-1 text-xs border border-slate-800 font-mono">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-[11px]">Логин:</span>
                        <span className="text-amber-400 font-bold">{acc.username}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-[11px]">Пароль:</span>
                        <div className="flex items-center gap-1.5">
                          <span>{showPass ? acc.password : '••••••••'}</span>
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility(acc.id)}
                            className="text-slate-400 hover:text-slate-200"
                          >
                            {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Buttons */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => {
                        onSwitchOfficer(acc);
                        onShowToast(`Выполнен вход под сотрудником: ${acc.rank} ${acc.fullName}`);
                        onNavigate('dashboard');
                      }}
                      className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-[#85181b] text-slate-700 hover:text-white font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                      title="Войти в рабочий кабинет под этой учетной записью"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>Войти</span>
                    </button>

                    <button
                      onClick={() => handleOpenEditAccount(acc)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-amber-100 text-slate-600 hover:text-amber-800 transition cursor-pointer"
                      title="Редактировать сотрудника"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    {!isChairman ? (
                      <button
                        onClick={() => handleDeleteAccount(acc)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 transition cursor-pointer"
                        title="Удалить учетную запись"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => onShowToast('Учетная запись Председателя защищена от удаления')}
                        className="p-2 rounded-xl bg-slate-100 text-slate-300 hover:text-slate-400 transition cursor-not-allowed opacity-50"
                        title="Учетная запись Председателя СК РФ защищена от удаления"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= TAB 2: DEPARTMENTS MANAGEMENT ================= */}
      {activeAdminTab === 'departments' && (
        <div className="space-y-4">
          
          {/* Search & Top Action */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={deptSearch}
                onChange={(e) => setDeptSearch(e.target.value)}
                placeholder="Поиск подразделения по названию, коду, начальнику..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#85181b] focus:bg-white"
              />
            </div>

            <div className="text-xs text-slate-500 font-medium">
              Всего в штатной структуре: <b>{departments.length}</b> подразделений
            </div>
          </div>

          {/* Departments Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDepts.map((dept) => {
              const staffInDept = accounts.filter((a) => a.departmentId === dept.id);
              const isGsu = dept.id === 'dept-gsu';

              return (
                <div
                  key={dept.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 text-[#85181b] flex items-center justify-center font-bold text-xs shrink-0">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">
                              {dept.code}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                              ШТАТ: {dept.staffCount} чел.
                            </span>
                          </div>
                          <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug pt-0.5">
                            {dept.name}
                          </h3>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl space-y-2 text-xs border border-slate-100">
                      <div className="flex items-start gap-2">
                        <UserCheck className="w-4 h-4 text-[#85181b] shrink-0 mt-0.5" />
                        <div>
                          <span className="text-slate-400">Начальник отдела: </span>
                          <span className="font-bold text-slate-800">
                            {dept.headRank} {dept.headName}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-slate-400">Дислокация: </span>
                          <span className="text-slate-700">{dept.address}</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <Phone className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-slate-400">Дежурная часть: </span>
                          <span className="font-mono text-slate-700">{dept.phone}</span>
                        </div>
                      </div>

                      {dept.jurisdiction && (
                        <div className="text-[11px] text-slate-600 pt-1 border-t border-slate-200/60 leading-relaxed">
                          <b>Юрисдикция:</b> {dept.jurisdiction}
                        </div>
                      )}
                    </div>

                    {/* Assigned Officers List in this Department */}
                    <div className="space-y-1.5">
                      <div className="text-[11px] text-slate-500 font-medium flex items-center justify-between">
                        <span>Сотрудники в ЕИС ({staffInDept.length}):</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {staffInDept.length > 0 ? (
                          staffInDept.map((st) => (
                            <span
                              key={st.id}
                              className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-800 text-[11px] font-medium border border-slate-200 flex items-center gap-1"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              <span>{st.fullName.split(' ')[0]} ({st.rank.split(' ')[0]})</span>
                            </span>
                          ))
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Сотрудники не назначены</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleOpenEditDept(dept)}
                      className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-[#85181b] text-slate-700 hover:text-white font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Редактировать структуру</span>
                    </button>

                    {!isGsu && (
                      <button
                        onClick={() => handleDeleteDepartment(dept)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 transition cursor-pointer"
                        title="Удалить подразделение"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= TAB 3: CHAIRMAN ORDERS & DECREES ================= */}
      {activeAdminTab === 'orders' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Реестр приказов Председателя СК РФ</h3>
                <p className="text-xs text-slate-500">Нормативно-правовые акты и кадровые решения Генерала юстиции РФ Чернова Д.М.</p>
              </div>
              <OfficialEmblem size={32} />
            </div>

            <div className="space-y-3">
              {orders.map((ord) => (
                <div
                  key={ord.id}
                  className="p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200 transition space-y-2"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold px-2.5 py-0.5 bg-[#85181b] text-white text-xs rounded-lg">
                        {ord.orderNumber}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">от {ord.date}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setViewingOrder(ord)}
                        className="text-xs text-[#85181b] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Открыть бланк приказа</span>
                      </button>

                      <button
                        onClick={() => handleDeleteOrder(ord)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        title="Аннулировать / удалить приказ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900">{ord.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{ord.content}</p>

                  <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-200/60 font-medium">
                    <span>Подписал: <b>{ord.issuedBy}</b></span>
                    <span className="text-emerald-700 font-semibold">Гербовая печать СК РФ проставлена</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 4: EXAM SUBMISSIONS REVIEW (CHAIRMAN ONLY) ================= */}
      {activeAdminTab === 'exams' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Аттестационная комиссия: Проверка экзаменов на звание «Лейтенант юстиции»
                </h3>
                <p className="text-xs text-slate-500">
                  Исключительная компетенция Председателя СК России: рассмотрение ответов на 10 билетов и утверждение приказа о присвоении звания.
                </p>
              </div>
              <button
                onClick={refreshSubmissions}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition shrink-0"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Обновить реестр</span>
              </button>
            </div>

            {examSubmissions.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-2">
                <GraduationCap className="w-10 h-10 text-slate-400 mx-auto" />
                <div className="text-sm font-bold text-slate-700">Нет поданных экзаменационных работ</div>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Когда младший лейтенант сдаст 3 теоретических теста и заполнит 10 квалификационных билетов, его работа появится здесь для проверки.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {examSubmissions.map((sub) => {
                  const isPending = sub.status === 'pending';
                  const isApproved = sub.status === 'approved';

                  return (
                    <div
                      key={sub.id}
                      className={`p-5 rounded-2xl border transition space-y-3 ${
                        isApproved
                          ? 'bg-emerald-50/30 border-emerald-200'
                          : isPending
                          ? 'bg-amber-50/30 border-amber-300 shadow-sm'
                          : 'bg-rose-50/30 border-rose-200'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className={`p-2.5 rounded-xl ${
                            isApproved
                              ? 'bg-emerald-100 text-emerald-800'
                              : isPending
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-rose-100 text-rose-900'
                          }`}>
                            <GraduationCap className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-slate-900">{sub.officerName}</h4>
                              <span className="font-mono text-[11px] text-slate-500">[{sub.badgeNumber}]</span>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
                                isApproved
                                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                                  : isPending
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                                  : 'bg-rose-100 text-rose-900 border border-rose-200'
                              }`}>
                                {isApproved ? 'Утверждено (Приказ издан)' : isPending ? 'Ожидает проверки Председателя' : 'Возвращено на доработку'}
                              </span>
                            </div>
                            <div className="text-xs text-slate-500">
                              <b>Подразделение:</b> {sub.department} • <b>Звание:</b> {sub.currentRank}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-[11px] text-slate-400 font-mono">Дата подачи: {sub.submittedAt}</div>
                          {sub.reviewedAt && (
                            <div className="text-[10px] text-emerald-700 font-mono">Проверено: {sub.reviewedAt}</div>
                          )}
                        </div>
                      </div>

                      {/* Test badges */}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Тест №1 (УПК): <b>{sub.test1Score}</b></span>
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Тест №2 (Устав): <b>{sub.test2Score}</b></span>
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Тест №3 (Криминалистика): <b>{sub.test3Score}</b></span>
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-red-50 border border-red-200 text-[#85181b] text-xs font-bold">
                          Письменных билетов: {Object.keys(sub.answers || {}).length} / 10
                        </span>
                      </div>

                      {sub.chairmanComment && (
                        <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-700">
                          <b>Резолюция Председателя СК РФ:</b> {sub.chairmanComment}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="pt-2 border-t border-slate-200/70 flex items-center justify-end gap-2.5">
                        <button
                          onClick={() => {
                            setSelectedExamSubmission(sub);
                            setChairmanExamComment(sub.chairmanComment || '');
                          }}
                          className="px-4 py-2 rounded-xl bg-[#85181b] hover:bg-[#6b1316] text-white font-bold text-xs shadow-sm transition cursor-pointer flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Проверить ответы на 10 билетов</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 5: SYSTEM OVERVIEW & AUDIT ================= */}
      {activeAdminTab === 'overview' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <div className="text-xs text-slate-500 font-bold uppercase">Сотрудники ведомства</div>
              <div className="text-2xl font-black text-slate-900">{accounts.length}</div>
              <div className="text-[11px] text-emerald-600 font-semibold">Все учетки активны</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <div className="text-xs text-slate-500 font-bold uppercase">Следственные отделы</div>
              <div className="text-2xl font-black text-slate-900">{departments.length}</div>
              <div className="text-[11px] text-slate-600">Центральный и региональные аппараты</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <div className="text-xs text-slate-500 font-bold uppercase">Дел в производстве</div>
              <div className="text-2xl font-black text-[#85181b]">{cases.length}</div>
              <div className="text-[11px] text-slate-600">Под надзором Председателя</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <div className="text-xs text-slate-500 font-bold uppercase">Издано приказов</div>
              <div className="text-2xl font-black text-amber-600">{orders.length}</div>
              <div className="text-[11px] text-slate-600">Электронный документооборот</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Журнал безопасности и шифрования</h3>
            <div className="p-4 bg-slate-900 text-slate-200 rounded-2xl font-mono text-xs space-y-2 border border-slate-800">
              <div className="text-emerald-400">✓ Система защиты информации ГОСТ Р 34.12-2015 активна</div>
              <div>• Протокол авторизации: Единая система СК РФ v3.0</div>
              <div>• Администратор сессии: Генерал юстиции РФ Чернов Д.М.</div>
              <div>• Контроль целостности базы данных: 100% OK</div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: CREATE / EDIT USER ACCOUNT ================= */}
      {isAccountModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white text-slate-900 rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl p-6 sm:p-7 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-red-50 text-[#85181b]">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingAccount ? 'Редактирование учетной записи' : 'Создание служебной учётной записи сотрудника'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Назначение логина, пароля, звания и следственного подразделения
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAccountModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAccount} className="space-y-4">
              
              {/* Credentials Section */}
              <div className="p-4 bg-slate-900 text-slate-100 rounded-2xl space-y-3 border border-slate-800">
                <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <Key className="w-4 h-4" />
                  <span>Данные для служебной авторизации (Вход в ЕИС) *</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-300 font-medium">Логин / Идентификатор *</label>
                    <input
                      type="text"
                      required
                      value={accForm.username}
                      onChange={(e) => setAccForm({ ...accForm, username: e.target.value })}
                      placeholder="morozov_d"
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-300 font-medium">Пароль доступа *</label>
                    <input
                      type="text"
                      required
                      value={accForm.password}
                      onChange={(e) => setAccForm({ ...accForm, password: e.target.value })}
                      placeholder="1234"
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Officer Profile Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-700">ФИО сотрудника *</label>
                  <input
                    type="text"
                    required
                    value={accForm.fullName}
                    onChange={(e) => setAccForm({ ...accForm, fullName: e.target.value })}
                    placeholder="Морозов Дмитрий Алексеевич"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#85181b]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Специальное звание *</label>
                  <select
                    value={accForm.rank}
                    onChange={(e) => setAccForm({ ...accForm, rank: e.target.value as RankType })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#85181b]"
                  >
                    {ALL_RANKS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Следственное подразделение *</label>
                  <select
                    value={accForm.departmentId}
                    onChange={(e) => setAccForm({ ...accForm, departmentId: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#85181b]"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.shortName} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Должность</label>
                  <input
                    type="text"
                    value={accForm.position}
                    onChange={(e) => setAccForm({ ...accForm, position: e.target.value })}
                    placeholder="Старший следователь по ОВД"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#85181b]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Служебная роль / профиль</label>
                  <select
                    value={accForm.role}
                    onChange={(e) => setAccForm({ ...accForm, role: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#85181b]"
                  >
                    <option value="investigator">Следователь по ОВД</option>
                    <option value="forensic">Следователь-криминалист</option>
                    <option value="head">Руководитель следственного отдела</option>
                    <option value="operative">Оперативный сотрудник / УСБ</option>
                    <option value="admin">Председатель СК РФ / Администратор</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Номер служебного жетона</label>
                  <input
                    type="text"
                    value={accForm.badgeNumber}
                    onChange={(e) => setAccForm({ ...accForm, badgeNumber: e.target.value })}
                    placeholder="СК-77-0492"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#85181b] font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Позывной в радиоэфире</label>
                  <input
                    type="text"
                    value={accForm.callsign}
                    onChange={(e) => setAccForm({ ...accForm, callsign: e.target.value })}
                    placeholder="Следопыт-1"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#85181b]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Уровень допуска к тайне</label>
                  <select
                    value={accForm.clearanceLevel}
                    onChange={(e) => setAccForm({ ...accForm, clearanceLevel: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#85181b]"
                  >
                    <option value="Секретно">Секретно</option>
                    <option value="Совершенно секретно">Совершенно секретно</option>
                    <option value="Особой важности">Особой важности</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Табельное оружие</label>
                  <input
                    type="text"
                    value={accForm.weaponType}
                    onChange={(e) => setAccForm({ ...accForm, weaponType: e.target.value })}
                    placeholder="Пистолет Макарова (ПМ) 9мм"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#85181b]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAccountModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-100 transition cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#85181b] hover:bg-red-800 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{editingAccount ? 'Сохранить изменения' : 'Создать учетную запись'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: CREATE / EDIT DEPARTMENT ================= */}
      {isDeptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white text-slate-900 rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl p-6 sm:p-7 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-red-50 text-[#85181b]">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingDept ? 'Редактирование следственного отдела' : 'Создание нового следственного отдела / управления'}
                  </h3>
                  <p className="text-xs text-slate-500">Внесение изменений в структуру Следственного комитета РФ</p>
                </div>
              </div>
              <button
                onClick={() => setIsDeptModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDepartment} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Полное наименование подразделения *</label>
                <input
                  type="text"
                  required
                  value={deptForm.name}
                  onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                  placeholder="Следственный отдел по Западному административному округу"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#85181b]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Краткое наименование</label>
                  <input
                    type="text"
                    value={deptForm.shortName}
                    onChange={(e) => setDeptForm({ ...deptForm, shortName: e.target.value })}
                    placeholder="СО по ЗАО"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#85181b]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Код подразделения</label>
                  <input
                    type="text"
                    value={deptForm.code}
                    onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })}
                    placeholder="СО-ЗАО-77"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#85181b] font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">ФИО Руководителя / Начальника отдела</label>
                  <input
                    type="text"
                    value={deptForm.headName}
                    onChange={(e) => setDeptForm({ ...deptForm, headName: e.target.value })}
                    placeholder="Смирнов Алексей Викторович"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#85181b]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Звание начальника</label>
                  <input
                    type="text"
                    value={deptForm.headRank}
                    onChange={(e) => setDeptForm({ ...deptForm, headRank: e.target.value })}
                    placeholder="Полковник юстиции"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#85181b]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Адрес дислокации</label>
                  <input
                    type="text"
                    value={deptForm.address}
                    onChange={(e) => setDeptForm({ ...deptForm, address: e.target.value })}
                    placeholder="г. Москва, ул. Удальцова, д. 85"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#85181b]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Телефон дежурной части</label>
                  <input
                    type="text"
                    value={deptForm.phone}
                    onChange={(e) => setDeptForm({ ...deptForm, phone: e.target.value })}
                    placeholder="+7 (495) 932-11-20"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#85181b] font-mono"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700">Штатная численность сотрудников</label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={deptForm.staffCount}
                    onChange={(e) => setDeptForm({ ...deptForm, staffCount: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#85181b]"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700">Территориальная юрисдикция / Специфика работы</label>
                  <textarea
                    rows={3}
                    value={deptForm.jurisdiction}
                    onChange={(e) => setDeptForm({ ...deptForm, jurisdiction: e.target.value })}
                    placeholder="Осуществление предварительного следствия на территории районов ЗАО..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#85181b]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsDeptModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-100 transition cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#85181b] hover:bg-red-800 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingDept ? 'Сохранить изменения' : 'Создать подразделение'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ISSUE CHAIRMAN ORDER ================= */}
      {isOrderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white text-slate-900 rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl p-6 sm:p-7 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-red-50 text-[#85181b]">
                  <FileSignature className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Издание приказа Председателя СК России</h3>
                  <p className="text-xs text-slate-500">Генерал юстиции РФ Чернов Денис Максимович</p>
                </div>
              </div>
              <button
                onClick={() => setIsOrderModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveOrder} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Номер приказа</label>
                  <input
                    type="text"
                    required
                    value={orderForm.orderNumber}
                    onChange={(e) => setOrderForm({ ...orderForm, orderNumber: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Дата издания</label>
                  <input
                    type="date"
                    required
                    value={orderForm.date}
                    onChange={(e) => setOrderForm({ ...orderForm, date: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Тип приказа</label>
                <select
                  value={orderForm.type}
                  onChange={(e) => setOrderForm({ ...orderForm, type: e.target.value as any })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                >
                  <option value="appointment">О назначении на должность</option>
                  <option value="rank_promotion">О присвоении специального звания</option>
                  <option value="department_creation">Об изменении структуры / создании отдела</option>
                  <option value="award">О поощрении и награждении</option>
                  <option value="disciplinary">О дисциплинарном взыскании</option>
                  <option value="general">Общий приказ по ведомству</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Тема приказа *</label>
                <input
                  type="text"
                  required
                  value={orderForm.title}
                  onChange={(e) => setOrderForm({ ...orderForm, title: e.target.value })}
                  placeholder="О назначении руководителя следственного отдела..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">ФИО сотрудника (при кадровом решении)</label>
                <input
                  type="text"
                  value={orderForm.targetOfficerName}
                  onChange={(e) => setOrderForm({ ...orderForm, targetOfficerName: e.target.value })}
                  placeholder="Морозов Дмитрий Алексеевич"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Текст постановляющей части приказа *</label>
                <textarea
                  rows={4}
                  required
                  value={orderForm.content}
                  onChange={(e) => setOrderForm({ ...orderForm, content: e.target.value })}
                  placeholder="В соответствии с ФЗ № 403-ФЗ «О Следственном комитете РФ» ПРИКАЗЫВАЮ: ..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsOrderModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-100 transition cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#85181b] hover:bg-red-800 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-1.5"
                >
                  <FileSignature className="w-4 h-4" />
                  <span>Подписать и опубликовать приказ</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: VIEW OFFICIAL ORDER SHEET ================= */}
      {viewingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white text-slate-900 rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl p-8 space-y-6 border border-slate-300 font-serif">
            
            {/* Order Header */}
            <div className="text-center space-y-2 border-b-2 border-slate-900 pb-5">
              <div className="flex justify-center">
                <OfficialEmblem size={55} />
              </div>
              <div className="font-sans font-bold text-xs tracking-widest text-[#85181b] uppercase">
                СЛЕДСТВЕННЫЙ КОМИТЕТ РОССИЙСКОЙ ФЕДЕРАЦИИ
              </div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 uppercase pt-1">
                П Р И К А З
              </h2>
              <div className="flex items-center justify-between text-xs font-mono font-bold pt-2">
                <span>№ {viewingOrder.orderNumber}</span>
                <span>г. Москва</span>
                <span>{viewingOrder.date} г.</span>
              </div>
            </div>

            {/* Order Body */}
            <div className="space-y-4 text-xs sm:text-sm text-slate-800 leading-relaxed font-serif">
              <div className="font-bold text-center text-sm font-sans">{viewingOrder.title}</div>
              <p className="indent-8 leading-relaxed">
                На основании Федерального закона от 28 декабря 2010 г. № 403-ФЗ «О Следственном комитете Российской Федерации» и Положения о Следственном комитете РФ:
              </p>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 font-sans text-xs">
                <div className="font-bold text-[#85181b]">П Р И К А З Ы В А Ю :</div>
                <p className="leading-relaxed whitespace-pre-wrap">{viewingOrder.content}</p>
              </div>
            </div>

            {/* Order Signature & Seal */}
            <div className="pt-6 border-t border-slate-300 flex items-center justify-between">
              <div className="space-y-1 font-sans">
                <div className="text-xs font-bold text-slate-900">Председатель Следственного комитета РФ</div>
                <div className="text-[11px] text-[#85181b] font-semibold">Генерал юстиции Российской Федерации</div>
              </div>
              <div className="text-right font-sans">
                <div className="text-xs font-bold text-slate-900">Д.М. Чернов</div>
                <div className="text-[10px] text-emerald-700 font-mono">ЭЦП СК-ГОСТ-ВЕРНА</div>
              </div>
            </div>

            {/* Close / Print */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between font-sans text-xs">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`ПРИКАЗ СК РФ № ${viewingOrder.orderNumber}\n${viewingOrder.title}\n\n${viewingOrder.content}\n\nПредседатель СК РФ Чернов Д.М.`);
                  onShowToast('Текст приказа скопирован в буфер обмена');
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Скопировать текст</span>
              </button>

              <button
                onClick={() => setViewingOrder(null)}
                className="px-4 py-1.5 rounded-xl bg-[#85181b] hover:bg-red-800 text-white font-bold cursor-pointer"
              >
                Закрыть
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ================= MODAL: CONFIRM DELETE ACCOUNT ================= */}
      {accountToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white text-slate-900 rounded-3xl max-w-md w-full shadow-2xl p-6 sm:p-7 space-y-5 border border-slate-200">
            <div className="flex items-start gap-3.5">
              <div className="p-3 rounded-2xl bg-rose-100 text-rose-600 shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 leading-tight">
                  Удалить учетную запись сотрудника?
                </h3>
                <p className="text-xs text-slate-500">
                  Подтвердите исключение следователя из Единой Информационной Системы СК РФ
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
              <div className="flex items-center gap-3">
                <img
                  src={accountToDelete.photoUrl}
                  alt={accountToDelete.fullName}
                  className="w-12 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
                />
                <div className="space-y-0.5">
                  <div className="text-[11px] font-bold text-[#85181b]">{accountToDelete.rank}</div>
                  <div className="text-sm font-bold text-slate-900">{accountToDelete.fullName}</div>
                  <div className="text-xs text-slate-500 font-mono">Логин: @{accountToDelete.username}</div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/80 text-xs text-slate-600 space-y-1">
                <div><b>Подразделение:</b> {accountToDelete.departmentName}</div>
                <div><b>Номер жетона:</b> {accountToDelete.badgeNumber}</div>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
              <div className="font-bold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                <span>Внимание</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Служебный логин, пароль и доступ сотрудника к системе будут безвозвратно удалены.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setAccountToDelete(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-100 transition cursor-pointer"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={confirmDeleteAccount}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Удалить учетную запись</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: CONFIRM DELETE DEPARTMENT ================= */}
      {deptToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white text-slate-900 rounded-3xl max-w-md w-full shadow-2xl p-6 sm:p-7 space-y-5 border border-slate-200">
            <div className="flex items-start gap-3.5">
              <div className="p-3 rounded-2xl bg-rose-100 text-rose-600 shrink-0">
                <Building2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 leading-tight">
                  Исключить подразделение?
                </h3>
                <p className="text-xs text-slate-500">
                  Удаление следственного управления из штатного расписания
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-1.5">
              <div className="font-bold text-slate-900 text-sm">{deptToDelete.name}</div>
              <div className="font-mono text-slate-500">{deptToDelete.code}</div>
              <div><b>Начальник:</b> {deptToDelete.headRank} {deptToDelete.headName}</div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeptToDelete(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-100 transition cursor-pointer"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={confirmDeleteDepartment}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Исключить отдел</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: CONFIRM DELETE ORDER ================= */}
      {orderToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white text-slate-900 rounded-3xl max-w-md w-full shadow-2xl p-6 sm:p-7 space-y-5 border border-slate-200">
            <div className="flex items-start gap-3.5">
              <div className="p-3 rounded-2xl bg-rose-100 text-rose-600 shrink-0">
                <FileSignature className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 leading-tight">
                  Аннулировать приказ?
                </h3>
                <p className="text-xs text-slate-500">
                  Удаление приказа Председателя СК из официального реестра
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-1">
              <div className="font-mono font-bold text-[#85181b]">№ {orderToDelete.orderNumber} от {orderToDelete.date}</div>
              <div className="font-bold text-slate-900">{orderToDelete.title}</div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setOrderToDelete(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-100 transition cursor-pointer"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={confirmDeleteOrder}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Аннулировать</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: EXAM SUBMISSION REVIEW (CHAIRMAN ONLY) ================= */}
      {selectedExamSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white text-slate-900 rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl p-6 sm:p-7 space-y-5 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-red-50 text-[#85181b]">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Проверка квалификационного экзамена
                  </h3>
                  <p className="text-xs text-slate-500">
                    Аттестуемый: <b>{selectedExamSubmission.officerName}</b> ({selectedExamSubmission.currentRank})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedExamSubmission(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Candidate Summary Box */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">ПОДРАЗДЕЛЕНИЕ</span>
                <span className="font-bold text-slate-800">{selectedExamSubmission.department}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">ЖЕТОН / ДАТА</span>
                <span className="font-bold text-slate-800">{selectedExamSubmission.badgeNumber} • {selectedExamSubmission.submittedAt}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">НАСТАВНИК</span>
                <span className="font-bold text-[#85181b]">{selectedExamSubmission.mentorName || 'Воронов А.С.'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">СТАТУС СТАЖИРОВКИ</span>
                <span className="font-bold text-emerald-700">
                  {selectedExamSubmission.internshipTasks?.filter((t) => t.completed).length || 0} из 5 заданий выполнено
                </span>
              </div>
            </div>

            {/* Internship Practical Tasks Reports */}
            {selectedExamSubmission.internshipTasks && selectedExamSubmission.internshipTasks.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#85181b] flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4" />
                  <span>Отчеты о прохождении 5 практических заданий стажировки:</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[25vh] overflow-y-auto pr-1 text-xs">
                  {selectedExamSubmission.internshipTasks.map((t) => (
                    <div key={t.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">№{t.id} {t.title}</span>
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${t.completed ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                          {t.completed ? 'Выполнено' : 'В процессе'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 italic">
                        {t.internNotes ? `Отчет: «${t.internNotes}»` : 'Отчет стажером еще не заполнен.'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mentor Review if present */}
            {selectedExamSubmission.mentorReview && (
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs space-y-1">
                <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Служебный отзыв наставника ({selectedExamSubmission.mentorName}):</span>
                </div>
                <p className="italic text-emerald-900">«{selectedExamSubmission.mentorReview}»</p>
              </div>
            )}

            {/* 10 Written Questions & Answers */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Ответы сотрудника на 10 квалификационных билетов:
              </h4>

              <div className="space-y-2.5 max-h-[30vh] overflow-y-auto pr-1">
                {QUALIFICATION_QUESTIONS.map((q) => {
                  const candidateAnswer = selectedExamSubmission.answers[q.id];
                  return (
                    <div key={q.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                      <div className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-lg bg-red-50 border border-red-200 text-[#85181b] font-bold text-[11px] flex items-center justify-center shrink-0">
                          {q.id}
                        </span>
                        <div>
                          <div className="text-xs font-bold text-slate-900">{q.text}</div>
                        </div>
                      </div>

                      <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                        {candidateAnswer ? (
                          candidateAnswer
                        ) : (
                          <span className="text-rose-500 italic">Ответ не предоставлен</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Chairman Resolution Section */}
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <label className="text-xs font-bold text-slate-800 block">
                Резолюция и комментарий Председателя Следственного комитета РФ:
              </label>
              <textarea
                rows={2}
                value={chairmanExamComment}
                onChange={(e) => setChairmanExamComment(e.target.value)}
                placeholder="Стажировка зачтена, экзамен сдан. Даю добро на присвоение специального звания «Лейтенант юстиции»..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#85181b]"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-end gap-3 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setSelectedExamSubmission(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-100 transition cursor-pointer"
              >
                Закрыть
              </button>

              <button
                type="button"
                onClick={() => handleRejectExam(selectedExamSubmission)}
                className="px-5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition cursor-pointer flex items-center gap-1.5"
              >
                <X className="w-4 h-4" />
                <span>Отклонить (на доработку)</span>
              </button>

              <button
                type="button"
                onClick={() => handleApproveExam(selectedExamSubmission)}
                className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Дать добро и издать приказ о звании «Лейтенант»</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
