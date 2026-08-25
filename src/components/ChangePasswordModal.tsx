import React, { useState } from 'react';
import { OfficerProfile, UserAccount } from '../types';
import { saveAccounts, queueDatabaseSync } from '../utils/storage';
import {
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  ShieldAlert,
  X,
  ShieldCheck,
  Check
} from 'lucide-react';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentOfficer: OfficerProfile;
  accounts: UserAccount[];
  onUpdateAccounts?: (accounts: UserAccount[]) => void;
  onShowToast: (msg: string) => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  currentOfficer,
  accounts,
  onUpdateAccounts,
  onShowToast
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  // Find linked account
  const currentAccount = accounts.find(
    (a) =>
      a.fullName.toLowerCase() === currentOfficer.fullName.toLowerCase() ||
      a.badgeNumber === currentOfficer.badgeNumber ||
      (currentOfficer.fullName.includes('Чернов') && a.username === 'chernov_d')
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newPassword.trim()) {
      setError('Введите новый пароль');
      return;
    }

    if (newPassword.length < 3) {
      setError('Пароль должен содержать минимум 3 символа');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Новый пароль и подтверждение не совпадают');
      return;
    }

    // Verify current password if account exists
    if (currentAccount && currentAccount.password) {
      if (currentPassword !== currentAccount.password) {
        setError('Неверно указан текущий служебный пароль');
        return;
      }
    }

    // Update account
    let updatedAccounts: UserAccount[];
    if (currentAccount) {
      updatedAccounts = accounts.map((a) =>
        a.id === currentAccount.id ? { ...a, password: newPassword.trim() } : a
      );
    } else {
      // Create account for this officer if not exists
      const newAcc: UserAccount = {
        id: `acc-${Date.now()}`,
        username: `officer_${Math.floor(100 + Math.random() * 900)}`,
        password: newPassword.trim(),
        fullName: currentOfficer.fullName,
        rank: currentOfficer.rank,
        position: currentOfficer.position,
        departmentId: 'dept-orovd',
        departmentName: currentOfficer.department,
        badgeNumber: currentOfficer.badgeNumber,
        serviceId: currentOfficer.serviceId,
        role: currentOfficer.fullName.includes('Чернов') ? 'admin' : 'investigator',
        clearanceLevel: currentOfficer.clearanceLevel,
        status: 'active',
        photoUrl: currentOfficer.photoUrl
      };
      updatedAccounts = [...accounts, newAcc];
    }

    saveAccounts(updatedAccounts);
    if (onUpdateAccounts) {
      onUpdateAccounts(updatedAccounts);
    }
    queueDatabaseSync();

    onShowToast(`Служебный пароль для «${currentOfficer.fullName}» успешно обновлен!`);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-[#85181b]/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#85181b] border border-red-500/40 flex items-center justify-center text-amber-400 shadow-md">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Смена служебного пароля</h3>
              <p className="text-[11px] text-slate-400 font-mono">ЕИС Следственного комитета РФ</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Officer Info Card */}
          <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
            <div>
              <div className="text-[10px] text-slate-500 font-bold uppercase">Сотрудник:</div>
              <div className="font-bold text-slate-200">{currentOfficer.fullName}</div>
              <div className="text-[11px] text-[#85181b] font-medium">{currentOfficer.rank}</div>
            </div>
            {currentAccount && (
              <div className="text-right">
                <div className="text-[10px] text-slate-500 font-bold uppercase">Логин:</div>
                <div className="font-mono font-bold text-amber-400">@{currentAccount.username}</div>
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-800/80 text-red-300 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Current Password Field */}
          {currentAccount && (
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Текущий пароль *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type={showCurrent ? 'text' : 'password'}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Введите ваш действующий пароль..."
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-amber-400 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 transition cursor-pointer"
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* New Password Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Новый пароль *
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type={showNew ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Придумайте надежный новый пароль..."
                className="w-full pl-9 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-amber-400 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 transition cursor-pointer"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm New Password Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Подтверждение нового пароля *
            </label>
            <div className="relative">
              <Check className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type={showConfirm ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Повторите новый пароль..."
                className="w-full pl-9 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-amber-400 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 transition cursor-pointer"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#85181b] hover:bg-[#6b1316] text-white text-xs font-bold shadow-md transition cursor-pointer flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Сохранить пароль</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
