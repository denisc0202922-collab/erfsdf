import React, { useState, useMemo, useRef } from 'react';
import {
  ProceduralDocument,
  DocumentType,
  OfficerProfile,
  CriminalCase,
  Offender
} from '../types';
import {
  FileText,
  Printer,
  Copy,
  Save,
  Check,
  Shield,
  Stamp,
  Sliders,
  Sparkles,
  FileCheck,
  ChevronDown,
  Trash2,
  Search,
  BookOpen,
  Filter,
  FolderOpen,
  CheckCircle2,
  ExternalLink,
  Layers,
  PenTool,
  FileDown,
  Mail,
  Send,
  Share2
} from 'lucide-react';
import { OfficialEmblem, OfficialStampSeal } from './OfficialEmblem';
import { documentToBBCode } from '../utils/bbcode';
import { PROCEDURAL_TEMPLATES, ProceduralTemplate } from '../data/procTemplates';
import { WordDocumentEditor } from './WordDocumentEditor';
import { exportElementToPdf, printProceduralDocument } from '../utils/pdfExport';
import { EmailDispatchModal } from './EmailDispatchModal';

interface DocumentGeneratorViewProps {
  documents: ProceduralDocument[];
  officer: OfficerProfile;
  cases: CriminalCase[];
  offenders: Offender[];
  onSaveDocument: (doc: ProceduralDocument) => void;
  onDeleteDocument: (id: string) => void;
  onShowToast: (msg: string) => void;
}

export const DocumentGeneratorView: React.FC<DocumentGeneratorViewProps> = ({
  documents,
  officer,
  cases,
  offenders,
  onSaveDocument,
  onDeleteDocument,
  onShowToast
}) => {
  // Mode: word_editor (Редактор как в Word) | form_builder (Быстрый мастер) | archive (Архив)
  const [activeTabMode, setActiveTabMode] = useState<'word_editor' | 'form_builder' | 'archive'>('word_editor');

  // Category & search state for the 209 official templates
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'postanovlenie' | 'protokol' | 'other_report'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('postanovlenie-6'); // Default: ВУД (Бланк 6)

  // Document Editor Form State
  const [formData, setFormData] = useState<ProceduralDocument>(() => {
    const defaultTmpl = PROCEDURAL_TEMPLATES.find((t) => t.id === 'postanovlenie-6') || PROCEDURAL_TEMPLATES[0];
    return {
      id: `doc-${Date.now()}`,
      docType: 'case_opening',
      docNumber: 'ПОСТАНОВЛЕНИЕ № 77-ВУД/' + Math.floor(100 + Math.random() * 900),
      date: new Date().toLocaleDateString('ru-RU'),
      city: 'г. Москва',
      investigatorName: officer.fullName,
      investigatorRank: officer.rank,
      investigatorPosition: officer.position,
      caseNumber: cases[0]?.caseNumber || '№ 2026/08-014-УД',
      suspectName: offenders[0]?.fullName || 'Белов Руслан Викторович',
      suspectBirth: offenders[0]?.birthDate || '14.05.1989 г.р.',
      suspectAddress: offenders[0]?.address || 'г. Москва, ул. Тверская, д. 18, кв. 42',
      articles: ['105 ч.2', '162 ч.2'],
      targetLocation: 'г. Москва, ул. Тверская, д. 18, кв. 42',
      crimeDetails: defaultTmpl?.sampleText || 'Рассмотрев материалы проверки сообщения о преступлении, следователь установил факт совершения уголовно наказуемого деяния при следующих обстоятельствах: совершен разбой и посягательство на жизнь граждан.',
      decisionText: '1. Возбудить уголовное дело по признакам преступления, предусмотренного статьями 105 ч.2, 162 ч.2 УК РФ.\n2. Уголовное дело принять к своему личному производству и приступить к расследованию.\n3. Копию настоящего постановления направить прокурору.',
      sealType: 'gsu',
      isSecret: false,
      createdAt: new Date().toLocaleDateString('ru-RU')
    };
  });

  const [fullCustomBody, setFullCustomBody] = useState<string>('');

  // PDF & Email Dispatch State
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState<boolean>(false);
  const previewPaperRef = useRef<HTMLDivElement>(null);

  // PDF Export for Master Form preview
  const handleExportFormPdf = async () => {
    if (!previewPaperRef.current) {
      onShowToast('Ошибка: бланк документа не найден для экспорта');
      return;
    }
    setIsExportingPdf(true);
    onShowToast('Формирование документа в формате PDF...');
    try {
      const res = await exportElementToPdf(previewPaperRef.current, {
        filename: formData.docNumber,
        orientation: 'portrait',
        title: formData.docNumber,
        onProgress: (status) => onShowToast(status)
      });
      setIsExportingPdf(false);
      if (res.success) {
        onShowToast(`Документ «${formData.docNumber}.pdf» успешно сформирован!`);
      } else {
        onShowToast(`Ошибка экспорта: ${res.error || 'Используйте печать'}`);
      }
    } catch {
      setIsExportingPdf(false);
      onShowToast('Не удалось сформировать PDF. Попробуйте режим стандартной печати.');
    }
  };

  // Filter templates list
  const filteredTemplates = useMemo(() => {
    return PROCEDURAL_TEMPLATES.filter((t) => {
      if (selectedCategory !== 'all' && t.category !== selectedCategory) {
        return false;
      }
      if (selectedTag !== 'all' && !t.tags.includes(selectedTag)) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchBlank = `бланк ${t.blankNumber}`.toLowerCase().includes(q) || `№ ${t.blankNumber}`.includes(q);
        const matchText = t.sampleText.toLowerCase().includes(q);
        const matchTags = t.tags.some((tag) => tag.toLowerCase().includes(q));
        if (!matchTitle && !matchBlank && !matchText && !matchTags) return false;
      }
      return true;
    });
  }, [selectedCategory, selectedTag, searchQuery]);

  // Tags list
  const availableTags = [
    'Все',
    'Возбуждение дела',
    'Обыск / Выемка',
    'Допрос',
    'Задержание / Арест',
    'Экспертиза',
    'Осмотр',
    'Рапорт',
    'Розыск',
    'Меры пресечения',
    'Повестка',
    'Опознание'
  ];

  // Select a template from the 209 archive
  const handleSelectTemplate = (template: ProceduralTemplate) => {
    setSelectedTemplateId(template.id);
    
    // Auto format title and number
    let prefix = 'ПОСТАНОВЛЕНИЕ';
    let docType: DocumentType = 'case_opening';
    if (template.category === 'protokol') {
      prefix = 'ПРОТОКОЛ';
      docType = template.title.toLowerCase().includes('допрос') ? 'interrogation_form' : 'crime_scene_form';
    } else if (template.category === 'other_report') {
      prefix = template.title.toLowerCase().includes('рапорт') ? 'РАПОРТ' : 'АКТ';
      docType = 'investigative_order';
    } else {
      if (template.title.toLowerCase().includes('обыск') || template.title.toLowerCase().includes('выемк')) {
        docType = 'search_warrant';
      } else if (template.title.toLowerCase().includes('задержан') || template.title.toLowerCase().includes('страж')) {
        docType = 'arrest_warrant';
      } else if (template.title.toLowerCase().includes('обвиняем')) {
        docType = 'charge_indictment';
      } else if (template.title.toLowerCase().includes('экспертиз')) {
        docType = 'forensic_assignment';
      } else if (template.title.toLowerCase().includes('прекращен') || template.title.toLowerCase().includes('суд')) {
        docType = 'case_closure_doc';
      }
    }

    const docNumber = `${prefix} № 77-${template.blankNumber}/${Math.floor(100 + Math.random() * 900)}`;
    
    // Populate form with template body
    setFormData((prev) => ({
      ...prev,
      docType,
      docNumber,
      crimeDetails: template.sampleText,
      decisionText: template.category === 'postanovlenie' 
        ? `1. Удовлетворить ходатайство / принять процессуальное решение в соответствии со ст. УПК РФ.\n2. Копию настоящего постановления направить надзирающему прокурору.`
        : `Следственное действие проведено в строгом соответствии с требованиями ст. 164, 166, 177 УПК РФ. Замечаний и дополнений к протоколу не поступило.`
    }));

    setFullCustomBody(template.sampleText);
    onShowToast(`Выбран «${template.title}» (Бланк №${template.blankNumber})`);
  };

  const handleCaseSelectChange = (caseNum: string) => {
    const foundCase = cases.find((c) => c.caseNumber === caseNum);
    if (foundCase) {
      setFormData((prev) => ({
        ...prev,
        caseNumber: foundCase.caseNumber,
        articles: foundCase.articles,
        suspectName: foundCase.suspects[0] || prev.suspectName,
        crimeDetails: `В производстве следователя находится уголовное дело ${foundCase.caseNumber}.\nФабула: ${foundCase.summary}\n\n` + prev.crimeDetails
      }));
      onShowToast(`Данные дела ${caseNum} подставлены в бланк`);
    }
  };

  const handleSave = () => {
    const docToSave: ProceduralDocument = {
      ...formData,
      id: `doc-${Date.now()}`,
      createdAt: new Date().toLocaleDateString('ru-RU') + ' ' + new Date().toLocaleTimeString('ru-RU').slice(0, 5)
    };
    onSaveDocument(docToSave);
    onShowToast(`Документ «${docToSave.docNumber}» сохранен в архив ЕИС!`);
  };

  const handleCopyBBCode = () => {
    const bb = documentToBBCode(formData);
    navigator.clipboard.writeText(bb);
    onShowToast('BB-код документа скопирован в буфер обмена!');
  };

  const handleCopyText = () => {
    const plain = `СЛЕДСТВЕННЫЙ КОМИТЕТ РОССИЙСКОЙ ФЕДЕРАЦИИ\nГЛАВНОЕ СЛЕДСТВЕННОЕ УПРАВЛЕНИЕ\n\n${formData.docNumber}\n${formData.city} | Дата: ${formData.date}\n\nСледователь: ${formData.investigatorRank} ${formData.investigatorName}\nДело: ${formData.caseNumber}\nФигурант: ${formData.suspectName}\nСтатьи: ${formData.articles?.join(', ')}\n\nФАБУЛА / СОДЕРЖАНИЕ:\n${formData.crimeDetails}\n\nРЕШЕНИЕ / ПОСТАНОВЛЕНИЕ:\n${formData.decisionText}\n\n${formData.investigatorPosition}: ${formData.investigatorName} (Подпись, Гербовая печать СК РФ)`;
    navigator.clipboard.writeText(plain);
    onShowToast('Чистый текст процессуального документа скопирован!');
  };

  return (
    <div className="space-y-6 animate-in fade-in font-sans">
      {/* Top Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono text-[10px] font-bold uppercase">
              База 209 бланков УПК РФ
            </span>
            <span className="text-xs text-slate-500 font-mono">Архивы: Постановления • Протоколы • Рапорты</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center gap-2 mt-1">
            <FileText className="w-5 h-5 text-amber-400" />
            Генератор процессуальных документов и бланков СК РФ
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Полный электронный банк официальных бланков уголовного судопроизводства с автозаполнением реквизитов и гербовой печатью
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTabMode('word_editor')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTabMode === 'word_editor'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="w-3.5 h-3.5 bg-white text-blue-600 rounded font-black text-[9px] flex items-center justify-center">
                W
              </div>
              <span>Редактор Word</span>
            </button>
            <button
              onClick={() => setActiveTabMode('form_builder')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTabMode === 'form_builder'
                  ? 'bg-amber-500 text-slate-950 shadow font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Мастер полей
            </button>
            <button
              onClick={() => setActiveTabMode('archive')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                activeTabMode === 'archive'
                  ? 'bg-amber-500 text-slate-950 shadow font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>Архив ({documents.length})</span>
            </button>
          </div>

          <button
            onClick={handleCopyBBCode}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition border border-slate-700 shadow-sm cursor-pointer"
            title="Скопировать в формате BB-кода для форумных отчетов"
          >
            <Copy className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">BB-Code</span>
          </button>

          <button
            onClick={() => setIsEmailModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition shadow-sm cursor-pointer"
            title="Отправить документ по электронной почте в Прокуратуру, МВД, Суд или СЭД"
          >
            <Mail className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">E-mail / СЭД</span>
          </button>

          <button
            onClick={() => printProceduralDocument()}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
            title="Распечатать или сохранить в PDF бланк А4"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Печать</span>
          </button>
        </div>
      </div>

      {activeTabMode === 'word_editor' && (
        <WordDocumentEditor
          initialDocument={formData}
          officer={officer}
          cases={cases}
          offenders={offenders}
          onSaveDocument={onSaveDocument}
          onShowToast={onShowToast}
        />
      )}

      {activeTabMode === 'archive' && (
        /* Saved Documents Archive */
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-slate-100 flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-amber-400" />
              Сохраненные процессуальные акты ({documents.length})
            </h3>
            <span className="text-xs text-slate-400 font-mono">Электронный архив канцелярии ГСУ СК РФ</span>
          </div>

          {documents.length === 0 ? (
            <div className="text-center py-12 text-slate-500 space-y-2">
              <FileText className="w-12 h-12 mx-auto text-slate-600 opacity-40" />
              <p>В архиве пока нет сохраненных документов.</p>
              <button
                onClick={() => setActiveTabMode('word_editor')}
                className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl text-xs"
              >
                Создать первый процессуальный документ в Word
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-slate-950 border border-slate-800/90 hover:border-amber-500/50 rounded-xl p-4 space-y-3 transition group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-amber-400 uppercase font-semibold">
                        {doc.date} • {doc.city}
                      </span>
                      <h4 className="font-bold text-sm text-slate-100 group-hover:text-amber-300 transition">
                        {doc.docNumber}
                      </h4>
                    </div>
                    <button
                      onClick={() => onDeleteDocument(doc.id)}
                      className="text-slate-500 hover:text-rose-400 p-1 transition cursor-pointer"
                      title="Удалить из архива"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                    {doc.crimeDetails}
                  </p>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 flex-wrap gap-2">
                    <span>Следователь: {doc.investigatorName}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setFormData(doc);
                          setIsEmailModalOpen(true);
                        }}
                        className="p-1 hover:bg-indigo-900/50 text-indigo-400 hover:text-indigo-300 rounded transition cursor-pointer"
                        title="Отправить по электронной почте"
                      >
                        <Mail className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setFormData(doc);
                          setActiveTabMode('word_editor');
                          onShowToast(`Документ «${doc.docNumber}» открыт в редакторе Word`);
                        }}
                        className="px-2 py-0.5 bg-blue-950 hover:bg-blue-900 text-blue-400 hover:text-blue-300 border border-blue-800/60 rounded font-semibold flex items-center gap-1 cursor-pointer"
                        title="Открыть в редакторе Word"
                      >
                        <span>Word</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </button>
                      <button
                        onClick={() => {
                          setFormData(doc);
                          setActiveTabMode('form_builder');
                          onShowToast(`Документ «${doc.docNumber}» открыт в мастере полей`);
                        }}
                        className="px-2 py-0.5 bg-amber-950 hover:bg-amber-900 text-amber-400 hover:text-amber-300 border border-amber-800/60 rounded font-semibold flex items-center gap-1 cursor-pointer"
                        title="Открыть в мастере полей"
                      >
                        <span>Мастер</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTabMode === 'form_builder' && (
        /* Document Constructor & Catalog */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: 209 Templates Browser & Form Config (5 cols) */}
          <div className="lg:col-span-5 space-y-4 no-print">
            
            {/* 1. Official Templates Catalog Picker (209 Blanks) */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-mono font-bold text-slate-200 uppercase">
                    Банк бланков УПК РФ ({filteredTemplates.length} из {PROCEDURAL_TEMPLATES.length})
                  </span>
                </div>
              </div>

              {/* Category selector pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px]">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`py-1.5 px-2 rounded-lg font-medium transition text-center ${
                    selectedCategory === 'all'
                      ? 'bg-amber-500 text-slate-950 font-bold shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Все (209)
                </button>
                <button
                  onClick={() => setSelectedCategory('postanovlenie')}
                  className={`py-1.5 px-2 rounded-lg font-medium transition text-center ${
                    selectedCategory === 'postanovlenie'
                      ? 'bg-amber-500 text-slate-950 font-bold shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="90 бланков постановлений"
                >
                  Постановления (90)
                </button>
                <button
                  onClick={() => setSelectedCategory('protokol')}
                  className={`py-1.5 px-2 rounded-lg font-medium transition text-center ${
                    selectedCategory === 'protokol'
                      ? 'bg-amber-500 text-slate-950 font-bold shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="54 бланка протоколов"
                >
                  Протоколы (54)
                </button>
                <button
                  onClick={() => setSelectedCategory('other_report')}
                  className={`py-1.5 px-2 rounded-lg font-medium transition text-center ${
                    selectedCategory === 'other_report'
                      ? 'bg-amber-500 text-slate-950 font-bold shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="65 бланков рапортов, повесток и поручений"
                >
                  Рапорты (65)
                </button>
              </div>

              {/* Search within templates */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Поиск бланка (например: обыск, допрос, Бланк 6, рапорт, арест)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Fast tag filter chips */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 text-[10px] scrollbar-thin">
                {availableTags.map((tag) => {
                  const tagKey = tag === 'Все' ? 'all' : tag;
                  const isSelected = selectedTag === tagKey;
                  return (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(tagKey)}
                      className={`px-2 py-1 rounded-lg whitespace-nowrap transition cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                          : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>

              {/* Scrollable List of Templates */}
              <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1 text-xs">
                {filteredTemplates.length === 0 ? (
                  <div className="text-center py-6 text-slate-500 text-xs">
                    Бланков по запросу «{searchQuery}» не найдено
                  </div>
                ) : (
                  filteredTemplates.map((tmpl) => {
                    const isSelected = selectedTemplateId === tmpl.id;
                    return (
                      <button
                        key={tmpl.id}
                        onClick={() => handleSelectTemplate(tmpl)}
                        className={`w-full text-left p-2.5 rounded-xl border transition flex items-start justify-between gap-2 group cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500/15 border-amber-500/50 text-amber-200 shadow-sm'
                            : 'bg-slate-950/80 border-slate-800/90 text-slate-300 hover:bg-slate-900 hover:border-slate-700'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-amber-400 font-bold">
                              Бланк {tmpl.blankNumber}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {tmpl.categoryLabel.split(' ')[0]}
                            </span>
                          </div>
                          <div className="font-semibold text-xs text-slate-100 mt-1 line-clamp-1 group-hover:text-amber-300 transition">
                            {tmpl.title}
                          </div>
                        </div>

                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-1" />
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* 2. Interactive Auto-fill Form Inputs */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-4 text-xs shadow-lg">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-slate-200 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-amber-400" />
                  Реквизиты и участники
                </span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isSecret}
                    onChange={(e) => setFormData({ ...formData, isSecret: e.target.checked })}
                    className="rounded bg-slate-950 border-slate-800 text-rose-500 focus:ring-0"
                  />
                  <span className="text-rose-400 font-bold font-mono text-[11px]">СОВЕРШЕННО СЕКРЕТНО</span>
                </label>
              </div>

              {/* Number & Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Номер процессуального акта *</label>
                  <input
                    type="text"
                    value={formData.docNumber}
                    onChange={(e) => setFormData({ ...formData, docNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Дата и город составления</label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-1/2 px-2 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono text-[11px]"
                    />
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-1/2 px-2 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-[11px]"
                    />
                  </div>
                </div>
              </div>

              {/* Quick Case Binding */}
              <div>
                <label className="block text-slate-400 mb-1">Привязать уголовное дело (автозаполнение)</label>
                <select
                  value={formData.caseNumber}
                  onChange={(e) => handleCaseSelectChange(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 cursor-pointer"
                >
                  {cases.map((c) => (
                    <option key={c.id} value={c.caseNumber}>
                      {c.caseNumber} — {c.title.slice(0, 45)}...
                    </option>
                  ))}
                </select>
              </div>

              {/* Suspect / Offender Info */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">ФИО фигуранта / заявителя</label>
                  <input
                    type="text"
                    value={formData.suspectName || ''}
                    onChange={(e) => setFormData({ ...formData, suspectName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Статьи УК РФ</label>
                  <input
                    type="text"
                    value={formData.articles?.join(', ') || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        articles: e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono"
                  />
                </div>
              </div>

              {/* Main Body Text (Editable) */}
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">
                  Текст бланка / Описательно-мотивировочная часть *
                </label>
                <textarea
                  rows={6}
                  value={formData.crimeDetails}
                  onChange={(e) => setFormData({ ...formData, crimeDetails: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 leading-relaxed font-sans text-xs"
                />
              </div>

              {/* Decision Text */}
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">
                  Постановил / Резолютивная часть *
                </label>
                <textarea
                  rows={3}
                  value={formData.decisionText}
                  onChange={(e) => setFormData({ ...formData, decisionText: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 leading-relaxed font-sans text-xs"
                />
              </div>

              {/* Bottom Actions */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleCopyText}
                  className="text-slate-400 hover:text-slate-200 text-xs cursor-pointer"
                >
                  Копировать чистый текст
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow"
                >
                  <Save className="w-4 h-4" />
                  <span>Сохранить в архив ЕИС</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Realistic Paper Document Preview (7 cols) */}
          <div className="lg:col-span-7 space-y-3 printable-document">
            {/* Quick action bar above preview */}
            <div className="no-print bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                <FileCheck className="w-4 h-4 text-emerald-400" />
                <span>Предпросмотр бланка (А4 ГОСТ)</span>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={handleExportFormPdf}
                  disabled={isExportingPdf}
                  className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-xs transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                  title="Экспорт в Adobe PDF для печати"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>{isExportingPdf ? 'Формирование PDF...' : 'Экспорт в PDF'}</span>
                </button>

                <button
                  onClick={() => setIsEmailModalOpen(true)}
                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-xs transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                  title="Отправить по E-mail или в СЭД"
                >
                  <Mail className="w-3.5 h-3.5 text-amber-300" />
                  <span>E-mail / СЭД</span>
                </button>

                <button
                  onClick={() => printProceduralDocument()}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg text-xs transition cursor-pointer flex items-center gap-1"
                  title="Печать (Ctrl+P)"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-400" />
                  <span>Печать</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTabMode('word_editor');
                    onShowToast('Документ перенесен в редактор Word для свободного редактирования');
                  }}
                  className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg text-xs transition cursor-pointer flex items-center gap-1"
                  title="Открыть в полноэкранном Word редакторе"
                >
                  <span>В Word →</span>
                </button>
              </div>
            </div>

            <div
              ref={previewPaperRef}
              data-pdf-content="true"
              className="bg-[#fcfbf9] text-slate-950 rounded-2xl p-8 sm:p-10 shadow-2xl border border-slate-300 relative overflow-hidden min-h-[820px] flex flex-col justify-between select-text font-serif"
            >
              
              {/* Secret Stamp Badge */}
              {formData.isSecret && (
                <div className="absolute top-6 right-8 border-2 border-rose-700 text-rose-800 px-3 py-1 text-xs font-bold tracking-widest uppercase rotate-3 font-sans shadow-sm">
                  ГРИФ: СОВЕРШЕННО СЕКРЕТНО
                </div>
              )}

              {/* Document Header */}
              <div>
                <div className="text-center space-y-1 pb-4 border-b border-slate-400/80">
                  <div className="flex justify-center mb-1">
                    <OfficialEmblem size={56} />
                  </div>
                  <h3 className="text-sm sm:text-base font-bold uppercase tracking-wider text-slate-900">
                    Следственный комитет Российской Федерации
                  </h3>
                  <h4 className="text-xs font-bold uppercase tracking-tight text-slate-700">
                    Главное следственное управление
                  </h4>
                  <div className="text-[11px] text-slate-600 font-sans">
                    {formData.city}, Технический пер., д. 2 • Тел. канцелярии: +7 (495) 986-77-10
                  </div>
                </div>

                {/* Document Title & Date */}
                <div className="text-center my-6 space-y-1">
                  <h2 className="text-base sm:text-lg font-bold uppercase tracking-widest text-slate-950">
                    {formData.docNumber}
                  </h2>
                  <div className="flex justify-between items-center text-xs font-sans text-slate-700 px-4 pt-1">
                    <span>{formData.city}</span>
                    <span>« {formData.date.split('.')[0] || '14'} » {formData.date} г.</span>
                  </div>
                </div>

                {/* Investigator & Case Preamble */}
                <div className="text-xs leading-relaxed space-y-2 font-sans text-slate-800">
                  <p>
                    <strong>Следователь: </strong>
                    {formData.investigatorPosition} {formData.investigatorRank} {formData.investigatorName}
                  </p>

                  {formData.caseNumber && (
                    <p>
                      <strong>Уголовное дело: </strong>
                      <span className="font-mono font-bold text-slate-900">{formData.caseNumber}</span>
                    </p>
                  )}

                  {formData.suspectName && (
                    <p>
                      <strong>В отношении гражданина: </strong>
                      {formData.suspectName} ({formData.suspectBirth || ''})
                      {formData.suspectAddress ? `, прож.: ${formData.suspectAddress}` : ''}
                    </p>
                  )}

                  {formData.articles && formData.articles.length > 0 && (
                    <p>
                      <strong>Квалификация деяния: </strong>
                      <span className="font-mono font-bold">
                        {formData.articles.map((a) => `ст. ${a}`).join(', ')} УК РФ
                      </span>
                    </p>
                  )}

                  {formData.targetLocation && (
                    <p>
                      <strong>Место проведения следственного действия: </strong>
                      {formData.targetLocation}
                    </p>
                  )}
                </div>

                {/* Separator */}
                <div className="my-4 border-t border-slate-300" />

                {/* Motivated Part (Фабула / Бланк) */}
                <div className="space-y-2 text-xs leading-relaxed">
                  <div className="text-center font-bold uppercase tracking-wider text-slate-900 font-sans text-[11px]">
                    УСТАНОВИЛ / ОПИСАНИЕ:
                  </div>
                  <div className="text-justify indent-6 text-slate-900 text-sm leading-relaxed whitespace-pre-wrap">
                    {formData.crimeDetails}
                  </div>
                </div>

                {/* Decision Part (Постановил) */}
                {formData.decisionText && (
                  <div className="mt-5 space-y-2 text-xs leading-relaxed">
                    <div className="text-center font-bold uppercase tracking-wider text-slate-900 font-sans text-[11px]">
                      ПОСТАНОВИЛ / РЕШЕНИЕ:
                    </div>
                    <div className="text-justify text-slate-900 text-sm leading-relaxed whitespace-pre-wrap pl-2">
                      {formData.decisionText}
                    </div>
                  </div>
                )}
              </div>

              {/* Document Bottom Signatures & Seal */}
              <div className="mt-10 pt-4 border-t-2 border-slate-400/80 relative">
                <div className="flex items-end justify-between text-xs font-sans">
                  <div className="space-y-1">
                    <div className="font-bold text-slate-900">{formData.investigatorPosition}</div>
                    <div className="text-slate-700">{formData.investigatorRank}</div>
                  </div>

                  <div className="text-right">
                    <div className="italic text-base text-slate-800 mb-0.5">
                      / {formData.investigatorName} /
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      Личная подпись следователя
                    </div>
                  </div>
                </div>

                {/* Official Stamp Seal Placement */}
                <OfficialStampSeal className="absolute right-24 -top-8 pointer-events-none" />

                {/* Document Barcode / Security tracking code */}
                <div className="mt-6 flex items-center justify-between text-[9px] font-mono text-slate-500">
                  <span>ЕИС СК РФ • ДОКУМЕНТООБОРОТ</span>
                  <span>БЛАНК № {formData.docNumber}</span>
                  <span>КОПИЯ ВЕРНА</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EMAIL DISPATCH */}
      <EmailDispatchModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        documentTitle={formData.docNumber}
        documentDate={formData.date}
        caseNumber={formData.caseNumber}
        suspectName={formData.suspectName}
        officer={officer}
        onDownloadPdf={handleExportFormPdf}
        onShowToast={onShowToast}
      />
    </div>
  );
};
