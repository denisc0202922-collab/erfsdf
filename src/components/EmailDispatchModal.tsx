import React, { useState } from 'react';
import {
  Mail,
  Send,
  FileDown,
  Building,
  User,
  Shield,
  FileText,
  Copy,
  CheckCircle2,
  ExternalLink,
  Lock,
  AlertCircle
} from 'lucide-react';
import { OfficerProfile } from '../types';

interface EmailDispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentTitle: string;
  documentDate: string;
  caseNumber?: string;
  suspectName?: string;
  officer: OfficerProfile;
  onDownloadPdf: () => void;
  onShowToast: (msg: string) => void;
}

interface AgencyPreset {
  id: string;
  name: string;
  email: string;
  category: 'prosecutor' | 'court' | 'police' | 'defense' | 'expert' | 'custom';
  description: string;
  defaultSubject: string;
}

const AGENCY_PRESETS: AgencyPreset[] = [
  {
    id: 'prosecutor-msk',
    name: 'Прокуратура г. Москвы',
    email: 'prosecutor.msk@genproc.gov.ru',
    category: 'prosecutor',
    description: 'Направление копии постановления надзирающему прокурору (ст. 146, 221 УПК РФ)',
    defaultSubject: 'Направление копии процессуального акта'
  },
  {
    id: 'basmanny-court',
    name: 'Басманный районный суд г. Москвы',
    email: 'basmanny.court@mos-gorsud.ru',
    category: 'court',
    description: 'Ходатайство о производстве следственного действия / меры пресечения (ст. 108, 165 УПК РФ)',
    defaultSubject: 'Материалы ходатайства следователя ГСУ СК РФ'
  },
  {
    id: 'gumvd-77',
    name: 'ГУ МВД России по г. Москве (ОУР/УЭБиПК)',
    email: 'gumvd77.rozysk@mvd.ru',
    category: 'police',
    description: 'Отдельное поручение следователя органу дознания (ст. 38, 152 УПК РФ)',
    defaultSubject: 'Отдельное поручение по уголовному делу'
  },
  {
    id: 'defense-bar',
    name: 'Адвокатская палата (Защитник)',
    email: 'advokat.defense@ap-moscow.ru',
    category: 'defense',
    description: 'Уведомление адвоката о процессуальных действиях и окончании следствия (ст. 215 УПК РФ)',
    defaultSubject: 'Уведомление о назначении следственных действий'
  },
  {
    id: 'forensics-center',
    name: 'СЭУ СК РФ (Экспертно-криминалистический центр)',
    email: 'expert.crim@sledcom.ru',
    category: 'expert',
    description: 'Постановление о назначении судебной экспертизы и материалы (ст. 195 УПК РФ)',
    defaultSubject: 'Направление материалов для производства судебной экспертизы'
  }
];

export const EmailDispatchModal: React.FC<EmailDispatchModalProps> = ({
  isOpen,
  onClose,
  documentTitle,
  documentDate,
  caseNumber = '2026/08-014-УД',
  suspectName = 'Белов Р.В.',
  officer,
  onDownloadPdf,
  onShowToast
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('prosecutor-msk');
  const [recipientEmail, setRecipientEmail] = useState<string>(AGENCY_PRESETS[0].email);
  const [recipientName, setRecipientName] = useState<string>(AGENCY_PRESETS[0].name);
  const [emailSubject, setEmailSubject] = useState<string>(
    `[СК РФ] ${documentTitle} по УД № ${caseNumber}`
  );
  const [outNumber, setOutNumber] = useState<string>(
    `№ 77/ИСХ-${Math.floor(1000 + Math.random() * 9000)} от ${documentDate}`
  );

  const initialBody = `Уважаемые коллеги!

Главное следственное управление Следственного комитета Российской Федерации направляет Вам для сведения и исполнения в установленном законом порядке процессуальный документ:
• Наименование: ${documentTitle}
• Уголовное дело: № ${caseNumber}
• В отношении: ${suspectName}
• Исходящий рег. номер: ${outNumber}

Официальная электронная копия документа в формате PDF с усиленной квалифицированной подписью и реквизитами ГСУ СК РФ прилагается к настоящему сообщению.

Прошу подтвердить получение настоящего уведомления ответным письмом либо через СЭД.

С уважением,
${officer.position}
${officer.rank}
${officer.fullName}
Канцелярия ГСУ СК РФ: +7 (495) 986-77-10
Эл. почта: gsu.investigation@sledcom.ru`;

  const [emailBody, setEmailBody] = useState<string>(initialBody);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isSentSuccess, setIsSentSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSelectPreset = (preset: AgencyPreset) => {
    setSelectedPresetId(preset.id);
    setRecipientEmail(preset.email);
    setRecipientName(preset.name);
    setEmailSubject(`[СК РФ] ${preset.defaultSubject}: ${documentTitle} (УД № ${caseNumber})`);
  };

  const handleOpenMailClient = () => {
    const subjectEncoded = encodeURIComponent(emailSubject);
    const bodyEncoded = encodeURIComponent(emailBody);
    const mailtoUrl = `mailto:${recipientEmail}?subject=${subjectEncoded}&body=${bodyEncoded}`;
    
    // Trigger PDF download so user has file to attach in email client
    onDownloadPdf();
    
    // Open system default mail client (Outlook / Thunderbird / Mail)
    window.open(mailtoUrl, '_blank');
    onShowToast('PDF скачан, почтовый клиент открыт для отправки');
  };

  const handleSendViaSedGateway = () => {
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setIsSentSuccess(true);
      onShowToast(`Документ успешно отправлен адресату «${recipientName}» через СЭД СК РФ!`);
      setTimeout(() => {
        setIsSentSuccess(false);
        onClose();
      }, 1800);
    }, 1200);
  };

  const handleCopyLetter = () => {
    const fullText = `КОМУ: ${recipientName} <${recipientEmail}>\nТЕМА: ${emailSubject}\n\n${emailBody}`;
    navigator.clipboard.writeText(fullText);
    onShowToast('Текст сопроводительного письма скопирован в буфер!');
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900/80 via-slate-900 to-indigo-950 p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600/20 border border-blue-500/40 rounded-xl text-blue-400">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                Отправка документа по электронной почте / СЭД
              </h3>
              <p className="text-[11px] text-slate-400">
                Официальный межведомственный шлюз Следственного комитета РФ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs select-text">
          
          {/* Quick Agency Preset Selector */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-blue-400" />
              <span>Быстрый выбор адресата (Ведомственные шлюзы):</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {AGENCY_PRESETS.map((preset) => {
                const isSelected = selectedPresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-blue-950/60 border-blue-500 text-blue-200 shadow-sm'
                        : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="font-bold text-xs flex items-center justify-between">
                      <span>{preset.name}</span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5 font-mono">
                      {preset.email}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Email Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">E-mail получателя:</label>
              <input
                type="email"
                value={recipientEmail}
                onChange={(e) => {
                  setRecipientEmail(e.target.value);
                  setSelectedPresetId('custom');
                }}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono text-xs focus:outline-none focus:border-blue-500"
                placeholder="recipient@domain.ru"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Наименование адресата:</label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                placeholder="Например: Адвокатское бюро"
              />
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Тема сообщения:</label>
            <input
              type="text"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Attachment Box */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-rose-950/60 border border-rose-800/60 rounded-lg text-rose-400">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-slate-200 text-xs truncate max-w-[280px] sm:max-w-md">
                  {documentTitle}.pdf
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  Формат: Adobe PDF • ГОСТ СК РФ • ЭЦП ГСУ
                </div>
              </div>
            </div>
            <button
              onClick={onDownloadPdf}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg transition flex items-center gap-1 text-[11px] cursor-pointer"
              title="Скачать файл PDF на устройство"
            >
              <FileDown className="w-3.5 h-3.5 text-blue-400" />
              <span>Скачать PDF</span>
            </button>
          </div>

          {/* Accompanying Letter Body */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-400 font-medium">Текст сопроводительного письма:</label>
              <button
                onClick={handleCopyLetter}
                className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-[10px] font-semibold cursor-pointer"
              >
                <Copy className="w-3 h-3" />
                <span>Копировать текст</span>
              </button>
            </div>
            <textarea
              rows={6}
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-sans text-xs focus:outline-none focus:border-blue-500 leading-relaxed"
            />
          </div>

          {/* Security Banner */}
          <div className="bg-blue-950/40 border border-blue-900/60 rounded-xl p-2.5 flex items-start gap-2 text-[11px] text-blue-300">
            <Lock className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <strong>Шлюз конфиденциальной связи СК РФ:</strong> отправление подписывается электронной подписью следователя и регистрируется в журналах ЕИС.
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-950 p-4 border-t border-slate-800 flex items-center justify-between gap-3 flex-wrap">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl text-xs transition cursor-pointer"
          >
            Закрыть
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenMailClient}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer border border-slate-700"
              title="Открыть Outlook / почтовую программу с готовым письмом"
            >
              <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
              <span>Почтовый клиент (mailto:)</span>
            </button>

            <button
              onClick={handleSendViaSedGateway}
              disabled={isSending || isSentSuccess}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg cursor-pointer ${
                isSentSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white'
              }`}
            >
              {isSending ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Передача в СЭД...</span>
                </>
              ) : isSentSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Отправлено успешно!</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Отправить через СЭД</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
