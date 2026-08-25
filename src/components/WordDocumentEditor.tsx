import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ProceduralDocument,
  OfficerProfile,
  CriminalCase,
  Offender
} from '../types';
import {
  FileText,
  Save,
  Printer,
  FileDown,
  Copy,
  Undo,
  Redo,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Table as TableIcon,
  Stamp,
  Shield,
  Search,
  BookOpen,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  PenTool,
  CheckCircle2,
  ChevronDown,
  Layers,
  Sparkles,
  Sliders,
  Type,
  Plus,
  Trash2,
  FileCheck,
  QrCode,
  Mail,
  Send,
  Share2
} from 'lucide-react';
import { OfficialEmblem, OfficialStampSeal } from './OfficialEmblem';
import { PROCEDURAL_TEMPLATES, ProceduralTemplate } from '../data/procTemplates';
import { documentToBBCode } from '../utils/bbcode';
import { exportElementToPdf, printProceduralDocument } from '../utils/pdfExport';
import { EmailDispatchModal } from './EmailDispatchModal';

interface WordDocumentEditorProps {
  initialDocument?: ProceduralDocument;
  officer: OfficerProfile;
  cases: CriminalCase[];
  offenders: Offender[];
  onSaveDocument: (doc: ProceduralDocument) => void;
  onShowToast: (msg: string) => void;
}

type RibbonTab = 'home' | 'insert' | 'layout' | 'templates' | 'legal' | 'view';
type PageMarginType = 'gost' | 'standard' | 'narrow' | 'wide';
type WatermarkType = 'none' | 'sk_rf' | 'secret' | 'dsp' | 'sample' | 'case';

export const WordDocumentEditor: React.FC<WordDocumentEditorProps> = ({
  initialDocument,
  officer,
  cases,
  offenders,
  onSaveDocument,
  onShowToast
}) => {
  // Active Ribbon Tab
  const [activeTab, setActiveTab] = useState<RibbonTab>('home');
  
  // Document Metadata State
  const [docTitle, setDocTitle] = useState<string>(
    initialDocument?.docNumber || `ПОСТАНОВЛЕНИЕ № 77-ВУД/${Math.floor(100 + Math.random() * 900)}`
  );
  const [docDate, setDocDate] = useState<string>(initialDocument?.date || new Date().toLocaleDateString('ru-RU'));
  const [docCity, setDocCity] = useState<string>(initialDocument?.city || 'г. Москва');
  const [selectedCaseNum, setSelectedCaseNum] = useState<string>(cases[0]?.caseNumber || '');
  const [selectedSuspect, setSelectedSuspect] = useState<string>(offenders[0]?.fullName || '');
  
  // Editor Layout & Formatting State
  const [fontFamily, setFontFamily] = useState<string>('Times New Roman');
  const [fontSize, setFontSize] = useState<string>('14pt');
  const [lineHeight, setLineHeight] = useState<string>('1.5');
  const [pageMargin, setPageMargin] = useState<PageMarginType>('gost');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [watermark, setWatermark] = useState<WatermarkType>('none');
  const [showRuler, setShowRuler] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [darkEditorTheme, setDarkEditorTheme] = useState<boolean>(false);
  
  // Document Stats
  const [wordCount, setWordCount] = useState<number>(0);
  const [charCount, setCharCount] = useState<number>(0);
  const [lastSavedTime, setLastSavedTime] = useState<string>('Только что');

  // Templates Search State
  const [templateCategory, setTemplateCategory] = useState<'all' | 'postanovlenie' | 'protokol' | 'other_report'>('all');
  const [templateSearch, setTemplateSearch] = useState<string>('');

  // Table Insert Modal
  const [showTableModal, setShowTableModal] = useState<boolean>(false);
  const [tableRows, setTableRows] = useState<number>(3);
  const [tableCols, setTableCols] = useState<number>(3);

  // PDF & Email Dispatch State
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState<boolean>(false);

  // Reference to editable paper container
  const editorRef = useRef<HTMLDivElement>(null);
  const paperContainerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate initial HTML content based on standard legal layout
  const generateInitialHtml = useCallback(() => {
    const defaultTemplate = PROCEDURAL_TEMPLATES.find((t) => t.id === 'postanovlenie-6') || PROCEDURAL_TEMPLATES[0];
    const initialText = initialDocument?.crimeDetails || defaultTemplate?.sampleText || 'Рассмотрев материалы уголовного дела...';
    const initialDecision = initialDocument?.decisionText || '1. Возбудить уголовное дело по признакам преступления...\n2. Принять уголовное дело к своему личному производству.';

    return `
      <div style="text-align: center; margin-bottom: 18px; border-bottom: 1.5px solid #334155; padding-bottom: 12px;">
        <div style="font-size: 11pt; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #0f172a; margin-bottom: 2px;">
          СЛЕДСТВЕННЫЙ КОМИТЕТ РОССИЙСКОЙ ФЕДЕРАЦИИ
        </div>
        <div style="font-size: 10pt; font-weight: bold; text-transform: uppercase; color: #1e293b; margin-bottom: 3px;">
          ГЛАВНОЕ СЛЕДСТВЕННОЕ УПРАВЛЕНИЕ
        </div>
        <div style="font-size: 9pt; color: #475569; font-style: italic;">
          г. Москва, Технический пер., д. 2 • Канцелярия: +7 (495) 986-77-10
        </div>
      </div>

      <div style="text-align: center; margin: 16px 0 12px 0;">
        <div style="font-size: 13pt; font-weight: bold; text-transform: uppercase; letter-spacing: 1.5px; color: #090d16;">
          ${docTitle}
        </div>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 14px; font-size: 10.5pt;">
        <tr>
          <td style="text-align: left; padding: 2px 0; font-weight: 500;">${docCity}</td>
          <td style="text-align: right; padding: 2px 0; font-weight: 500;">« ${docDate.split('.')[0] || '15'} » ${docDate} г.</td>
        </tr>
      </table>

      <div style="font-size: 11pt; line-height: 1.5; margin-bottom: 14px;">
        <p style="margin: 4px 0;"><strong>Следователь:</strong> ${officer.position} ${officer.rank} <strong>${officer.fullName}</strong></p>
        <p style="margin: 4px 0;"><strong>Уголовное дело:</strong> № ${selectedCaseNum || '2026/08-014-УД'}</p>
        <p style="margin: 4px 0;"><strong>В отношении:</strong> ${selectedSuspect || 'Белов Руслан Викторович, 1989 г.р.'}</p>
      </div>

      <div style="text-align: center; font-size: 11pt; font-weight: bold; margin: 18px 0 8px 0; text-transform: uppercase; letter-spacing: 2px;">
        У С Т А Н О В И Л :
      </div>

      <div style="text-align: justify; text-indent: 1.25cm; font-size: 12pt; line-height: 1.5; margin-bottom: 16px;">
        ${initialText.replace(/\n/g, '<br/>')}
      </div>

      <div style="text-align: center; font-size: 11pt; font-weight: bold; margin: 18px 0 8px 0; text-transform: uppercase; letter-spacing: 2px;">
        П О С Т А Н О В И Л :
      </div>

      <div style="text-align: justify; text-indent: 1.25cm; font-size: 12pt; line-height: 1.5; margin-bottom: 24px;">
        ${initialDecision.replace(/\n/g, '<br/>')}
      </div>

      <div style="margin-top: 35px; border-top: 1px solid #94a3b8; padding-top: 12px; font-size: 10.5pt;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="vertical-align: top; width: 60%;">
              <strong>${officer.position}</strong><br/>
              <span style="color: #334155;">${officer.rank}</span>
            </td>
            <td style="text-align: right; vertical-align: bottom; width: 40%;">
              <span style="font-family: 'Brush Script MT', 'Segoe Script', cursive; font-size: 16pt; color: #1e3a8a; margin-right: 8px;">${officer.fullName.split(' ')[0]}</span>
              <strong>/ ${officer.fullName} /</strong>
            </td>
          </tr>
        </table>
      </div>
    `;
  }, [docTitle, docDate, docCity, officer, selectedCaseNum, selectedSuspect, initialDocument]);

  // Initial Content Mount
  useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML.trim()) {
      editorRef.current.innerHTML = generateInitialHtml();
      updateDocumentStats();
    }
  }, [generateInitialHtml]);

  // Update statistics (words, chars)
  const updateDocumentStats = () => {
    if (!editorRef.current) return;
    const text = editorRef.current.innerText || '';
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    setWordCount(words);
    setCharCount(text.length);
  };

  // Execute formatting command on contentEditable
  const executeCmd = (command: string, value: string | undefined = undefined) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(command, false, value);
    updateDocumentStats();
  };

  // Apply custom styling via document selection or wrapper
  const applyFontFamily = (family: string) => {
    setFontFamily(family);
    executeCmd('fontName', family);
  };

  const applyFontSize = (size: string) => {
    setFontSize(size);
    // Standard execCommand supports 1-7 or we wrap selection with span
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
      const span = document.createElement('span');
      span.style.fontSize = size;
      const range = selection.getRangeAt(0);
      try {
        span.appendChild(range.extractContents());
        range.insertNode(span);
      } catch {
        executeCmd('fontSize', '4');
      }
    } else {
      if (editorRef.current) {
        editorRef.current.style.fontSize = size;
      }
    }
    updateDocumentStats();
  };

  // Insert standard procedural elements
  const insertProceduralHeading = (type: 'ustanovil' | 'postanovil' | 'prava' | 'protocol_end') => {
    let html = '';
    if (type === 'ustanovil') {
      html = `<div style="text-align: center; font-weight: bold; margin: 16px 0 8px 0; letter-spacing: 2px; font-size: 11pt;">У С Т А Н О В И Л :</div>`;
    } else if (type === 'postanovil') {
      html = `<div style="text-align: center; font-weight: bold; margin: 16px 0 8px 0; letter-spacing: 2px; font-size: 11pt;">П О С Т А Н О В И Л :</div>`;
    } else if (type === 'prava') {
      html = `<div style="margin: 12px 0; padding: 8px 12px; background: #f8fafc; border-left: 3px solid #0284c7; font-size: 9.5pt; text-align: justify;">
        <strong>Права и обязанности разъяснены:</strong> Мне разъяснены права, предусмотренные ст. 46, 47, 56 УПК РФ, а также положения ст. 51 Конституции РФ (право не свидетельствовать против себя и своих близких).
        <div style="margin-top: 6px; text-align: right;">Подпись: __________________</div>
      </div>`;
    } else if (type === 'protocol_end') {
      html = `<div style="margin-top: 20px; font-size: 10pt; line-height: 1.5;">
        <p style="margin: 4px 0;">Протокол прочитан следователем вслух. Замечания и дополнения: <em>не поступили</em>.</p>
        <div style="display: flex; justify-content: space-between; margin-top: 12px;">
          <span>Подозреваемый: ______________</span>
          <span>Защитник (адвокат): ______________</span>
          <span>Понятой 1: ______________</span>
        </div>
      </div>`;
    }
    executeCmd('insertHTML', html);
    onShowToast('Юридический блок добавлен в документ');
  };

  // Insert Table
  const insertCustomTable = () => {
    let tableHtml = `<table style="width: 100%; border-collapse: collapse; margin: 14px 0; font-size: 10pt; border: 1px solid #64748b;">
      <thead>
        <tr style="background-color: #f1f5f9;">`;
    for (let c = 1; c <= tableCols; c++) {
      tableHtml += `<th style="border: 1px solid #94a3b8; padding: 6px 8px; text-align: center; font-weight: bold;">Колонка ${c}</th>`;
    }
    tableHtml += `</tr></thead><tbody>`;
    for (let r = 1; r <= tableRows; r++) {
      tableHtml += `<tr>`;
      for (let c = 1; c <= tableCols; c++) {
        tableHtml += `<td style="border: 1px solid #94a3b8; padding: 6px 8px; text-align: left;">Ячейка ${r}.${c}</td>`;
      }
      tableHtml += `</tr>`;
    }
    tableHtml += `</tbody></table><p><br/></p>`;
    
    executeCmd('insertHTML', tableHtml);
    setShowTableModal(false);
    onShowToast(`Таблица ${tableRows}×${tableCols} вставлена`);
  };

  // Insert Stamp / Seal
  const insertStamp = (type: 'seal' | 'copy_true' | 'secret' | 'registered') => {
    let stampHtml = '';
    if (type === 'seal') {
      stampHtml = `
        <div style="display: inline-block; border: 3px dashed #1d4ed8; color: #1e40af; border-radius: 50%; width: 140px; height: 140px; text-align: center; padding: 12px 6px; font-family: sans-serif; transform: rotate(-5deg); margin: 10px; user-select: none;">
          <div style="font-size: 7px; font-weight: bold; text-transform: uppercase;">СЛЕДСТВЕННЫЙ КОМИТЕТ РФ</div>
          <div style="border-top: 1px solid #2563eb; border-bottom: 1px solid #2563eb; margin: 4px 0; font-size: 6.5px; font-weight: bold;">★ ГЛАВНОЕ СЛЕДСТВЕННОЕ УПРАВЛЕНИЕ ★</div>
          <div style="font-size: 6.5px; font-weight: bold; font-family: monospace;">ДЛЯ ПАКЕТОВ И ДОКУМЕНТОВ № 77</div>
          <div style="font-size: 6px; margin-top: 4px;">г. Москва</div>
        </div>
      `;
    } else if (type === 'copy_true') {
      stampHtml = `
        <div style="display: inline-block; border: 2px solid #047857; color: #047857; padding: 6px 12px; font-family: sans-serif; font-weight: bold; text-align: center; text-transform: uppercase; font-size: 9pt; transform: rotate(-2deg); margin: 8px;">
          КОПИЯ ВЕРНА<br/>
          <span style="font-size: 7pt; font-weight: normal;">Следователь СК РФ / ${officer.fullName.split(' ')[0]} /</span>
        </div>
      `;
    } else if (type === 'secret') {
      stampHtml = `
        <div style="display: inline-block; border: 2px solid #be123c; color: #be123c; padding: 4px 10px; font-family: sans-serif; font-weight: bold; text-align: center; text-transform: uppercase; font-size: 9pt; letter-spacing: 2px; transform: rotate(3deg); margin: 8px;">
          СОВЕРШЕННО СЕКРЕТНО<br/>
          <span style="font-size: 6.5pt; letter-spacing: 1px;">Экз. № 1 • Лично в руки</span>
        </div>
      `;
    } else if (type === 'registered') {
      stampHtml = `
        <div style="display: inline-block; border: 2px solid #4338ca; color: #4338ca; padding: 4px 8px; font-family: sans-serif; font-size: 8pt; margin: 8px;">
          <strong>ЗАРЕГИСТРИРОВАНО В КУСП/ЕИС</strong><br/>
          Вх. № 77/СЛ-${Math.floor(1000 + Math.random() * 9000)} от ${docDate}
        </div>
      `;
    }
    executeCmd('insertHTML', stampHtml);
    onShowToast('Штамп / Печать вставлены в документ');
  };

  // Load an official template from the 209 bank
  const handleApplyTemplate = (tmpl: ProceduralTemplate) => {
    let prefix = 'ПОСТАНОВЛЕНИЕ';
    if (tmpl.category === 'protokol') prefix = 'ПРОТОКОЛ';
    else if (tmpl.category === 'other_report') prefix = tmpl.title.includes('Рапорт') ? 'РАПОРТ' : 'АКТ';

    const newNumber = `${prefix} № 77-${tmpl.blankNumber}/${Math.floor(100 + Math.random() * 900)}`;
    setDocTitle(newNumber);

    const fullHtml = `
      <div style="text-align: center; margin-bottom: 18px; border-bottom: 1.5px solid #334155; padding-bottom: 12px;">
        <div style="font-size: 11pt; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #0f172a; margin-bottom: 2px;">
          СЛЕДСТВЕННЫЙ КОМИТЕТ РОССИЙСКОЙ ФЕДЕРАЦИИ
        </div>
        <div style="font-size: 10pt; font-weight: bold; text-transform: uppercase; color: #1e293b; margin-bottom: 3px;">
          ГЛАВНОЕ СЛЕДСТВЕННОЕ УПРАВЛЕНИЕ
        </div>
        <div style="font-size: 9pt; color: #475569; font-style: italic;">
          Официальный бланк № ${tmpl.blankNumber} (${tmpl.categoryLabel})
        </div>
      </div>

      <div style="text-align: center; margin: 16px 0 12px 0;">
        <div style="font-size: 13pt; font-weight: bold; text-transform: uppercase; letter-spacing: 1.5px; color: #090d16;">
          ${newNumber}
        </div>
        <div style="font-size: 11pt; font-weight: bold; color: #334155; margin-top: 4px;">
          « ${tmpl.title} »
        </div>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 14px; font-size: 10.5pt;">
        <tr>
          <td style="text-align: left; padding: 2px 0; font-weight: 500;">${docCity}</td>
          <td style="text-align: right; padding: 2px 0; font-weight: 500;">« ${docDate.split('.')[0] || '15'} » ${docDate} г.</td>
        </tr>
      </table>

      <div style="font-size: 11pt; line-height: 1.5; margin-bottom: 14px;">
        <p style="margin: 4px 0;"><strong>Следователь:</strong> ${officer.position} ${officer.rank} <strong>${officer.fullName}</strong></p>
        <p style="margin: 4px 0;"><strong>Уголовное дело:</strong> № ${selectedCaseNum || '2026/08-014-УД'}</p>
        <p style="margin: 4px 0;"><strong>Фигурант:</strong> ${selectedSuspect || 'Белов Руслан Викторович'}</p>
      </div>

      <div style="text-align: center; font-size: 11pt; font-weight: bold; margin: 18px 0 8px 0; text-transform: uppercase; letter-spacing: 2px;">
        ${tmpl.category === 'postanovlenie' ? 'У С Т А Н О В И Л :' : 'О П И С А Н И Е   И   Х О Д   Д Е Й С Т В И Я :'}
      </div>

      <div style="text-align: justify; text-indent: 1.25cm; font-size: 12pt; line-height: 1.5; margin-bottom: 16px;">
        ${tmpl.sampleText.replace(/\n/g, '<br/>')}
      </div>

      ${tmpl.category === 'postanovlenie' ? `
        <div style="text-align: center; font-size: 11pt; font-weight: bold; margin: 18px 0 8px 0; text-transform: uppercase; letter-spacing: 2px;">
          П О С Т А Н О В И Л :
        </div>
        <div style="text-align: justify; text-indent: 1.25cm; font-size: 12pt; line-height: 1.5; margin-bottom: 24px;">
          1. Удовлетворить ходатайство / принять процессуальное решение в соответствии с нормами УПК РФ.<br/>
          2. Копию настоящего постановления направить надзирающему прокурору и заинтересованным лицам.
        </div>
      ` : ''}

      <div style="margin-top: 35px; border-top: 1px solid #94a3b8; padding-top: 12px; font-size: 10.5pt;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="vertical-align: top; width: 60%;">
              <strong>${officer.position}</strong><br/>
              <span style="color: #334155;">${officer.rank}</span>
            </td>
            <td style="text-align: right; vertical-align: bottom; width: 40%;">
              <span style="font-family: 'Brush Script MT', 'Segoe Script', cursive; font-size: 16pt; color: #1e3a8a; margin-right: 8px;">${officer.fullName.split(' ')[0]}</span>
              <strong>/ ${officer.fullName} /</strong>
            </td>
          </tr>
        </table>
      </div>
    `;

    if (editorRef.current) {
      editorRef.current.innerHTML = fullHtml;
      updateDocumentStats();
    }
    onShowToast(`Загружен «${tmpl.title}» (Бланк №${tmpl.blankNumber})`);
  };

  // Filter templates
  const filteredTemplates = PROCEDURAL_TEMPLATES.filter((t) => {
    if (templateCategory !== 'all' && t.category !== templateCategory) return false;
    if (templateSearch.trim()) {
      const q = templateSearch.toLowerCase().trim();
      return (
        t.title.toLowerCase().includes(q) ||
        `бланк ${t.blankNumber}`.toLowerCase().includes(q) ||
        t.sampleText.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Save to Internal App Database
  const handleSaveToDatabase = () => {
    const rawHtml = editorRef.current?.innerHTML || '';
    const rawText = editorRef.current?.innerText || '';
    
    const docToSave: ProceduralDocument = {
      id: initialDocument?.id || `doc-${Date.now()}`,
      docType: 'case_opening',
      docNumber: docTitle,
      date: docDate,
      city: docCity,
      investigatorName: officer.fullName,
      investigatorRank: officer.rank,
      investigatorPosition: officer.position,
      caseNumber: selectedCaseNum,
      suspectName: selectedSuspect,
      crimeDetails: rawText.slice(0, 300) + '...',
      decisionText: 'Оформлено и сохранено в текстовом процессоре Word СК РФ.',
      sealType: 'gsu',
      isSecret: watermark === 'secret',
      createdAt: new Date().toLocaleDateString('ru-RU') + ' ' + new Date().toLocaleTimeString('ru-RU').slice(0, 5)
    };

    onSaveDocument(docToSave);
    setLastSavedTime(new Date().toLocaleTimeString('ru-RU').slice(0, 5));
    onShowToast(`Документ «${docTitle}» сохранен в архив ЕИС!`);
  };

  // Export to Real Microsoft Word (.doc with MSO HTML schema)
  const handleExportWordDoc = () => {
    if (!editorRef.current) return;
    const content = editorRef.current.innerHTML;

    // Microsoft Office HTML Schema compatible with Word 97-2024
    const wordDocumentHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8">
        <title>${docTitle}</title>
        <!--[if gte mso 9]>
        <xml>
          <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>100</w:Zoom>
            <w:DoNotOptimizeForBrowser/>
          </w:WordDocument>
        </xml>
        <![endif]-->
        <style>
          @page Section1 {
            size: 210mm 297mm;
            margin: ${pageMargin === 'gost' ? '20mm 10mm 20mm 30mm' : '20mm 20mm 20mm 20mm'};
            mso-header-margin: 10mm;
            mso-footer-margin: 10mm;
            mso-paper-source: 0;
          }
          div.Section1 { page: Section1; }
          body {
            font-family: 'Times New Roman', serif;
            font-size: 14pt;
            line-height: 1.5;
            color: #000000;
          }
          p, div {
            margin: 0 0 6pt 0;
            text-align: justify;
          }
          table {
            border-collapse: collapse;
            width: 100%;
          }
        </style>
      </head>
      <body>
        <div class="Section1">
          ${content}
        </div>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff' + wordDocumentHtml], {
      type: 'application/msword;charset=utf-8'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${docTitle.replace(/[/\\?%*:|"<>]/g, '_')}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    onShowToast(`Документ «${docTitle}.doc» успешно экспортирован для MS Word!`);
  };

  // Export to Adobe PDF (.pdf) with standard A4 formatting, seals and margins
  const handleExportPDF = async () => {
    if (!paperContainerRef.current) {
      onShowToast('Ошибка: лист документа не найден для экспорта');
      return;
    }
    setIsExportingPdf(true);
    onShowToast('Формирование документа в формате PDF...');

    try {
      const result = await exportElementToPdf(paperContainerRef.current, {
        filename: docTitle,
        orientation: orientation,
        title: docTitle,
        onProgress: (status) => onShowToast(status)
      });

      setIsExportingPdf(false);
      if (result.success) {
        onShowToast(`Документ «${docTitle}.pdf» успешно сформирован и сохранен!`);
      } else {
        onShowToast(`Ошибка экспорта: ${result.error || 'Используйте печать в PDF'}`);
      }
    } catch (err: unknown) {
      setIsExportingPdf(false);
      onShowToast('Не удалось сформировать PDF. Попробуйте режим стандартной печати (Ctrl+P).');
    }
  };

  // Open Email Dispatch dialog
  const handleOpenEmailModal = () => {
    setIsEmailModalOpen(true);
  };

  // Copy BB-Code for RP Forums
  const handleCopyBBCode = () => {
    if (!editorRef.current) return;
    const text = editorRef.current.innerText;
    const bbcode = `[CENTER][IMG]https://i.imgur.com/logo-skrf.png[/IMG]
[B][SIZE=4]СЛЕДСТВЕННЫЙ КОМИТЕТ РОССИЙСКОЙ ФЕДЕРАЦИИ[/SIZE][/B]
[SIZE=3]ГЛАВНОЕ СЛЕДСТВЕННОЕ УПРАВЛЕНИЕ[/SIZE]
[SIZE=2]${docCity} • ${docDate}[/SIZE]

[B][SIZE=4]${docTitle}[/SIZE][/B][/CENTER]

[B]Следователь:[/B] ${officer.position} ${officer.rank} ${officer.fullName}
[B]Уголовное дело:[/B] № ${selectedCaseNum}
[B]Фигурант:[/B] ${selectedSuspect}

[HR][/HR]
[JUSTIFY]${text}[/JUSTIFY]
[HR][/HR]

[RIGHT][B]${officer.position}[/B]
${officer.rank}
[I]/ ${officer.fullName} /[/I]
[SIZE=2][COLOR=rgb(41, 105, 176)]Гербовая печать ГСУ СК РФ[/COLOR][/SIZE][/RIGHT]`;

    navigator.clipboard.writeText(bbcode);
    onShowToast('BB-код документа скопирован для форума!');
  };

  // Page Margins Map
  const marginsClass = {
    gost: 'pl-[30mm] pr-[10mm] pt-[20mm] pb-[20mm]', // ГОСТ 30-10-20-20
    standard: 'p-[20mm]',
    narrow: 'p-[12.7mm]',
    wide: 'px-[30mm] py-[25mm]'
  }[pageMargin];

  return (
    <div
      ref={containerRef}
      className={`flex flex-col bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl transition-all duration-200 font-sans ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none border-none' : 'min-h-[880px]'
      }`}
    >
      {/* 1. TOP WINDOW BAR (MS WORD BRANDING & QUICK ACCESS) */}
      <div className="bg-[#185abd] text-white px-3 py-1.5 flex items-center justify-between text-xs select-none border-b border-blue-900/50">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 font-bold tracking-wide">
            <div className="w-5 h-5 bg-white rounded flex items-center justify-center text-[#185abd] font-black text-xs shadow-sm">
              W
            </div>
            <span className="hidden sm:inline font-semibold">Word СК РФ</span>
          </div>

          <div className="h-3.5 w-px bg-blue-300/40 mx-1" />

          {/* Quick Access Icons */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleSaveToDatabase}
              title="Быстрое сохранение (Ctrl+S)"
              className="p-1 hover:bg-white/15 rounded transition cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => executeCmd('undo')}
              title="Отменить (Ctrl+Z)"
              className="p-1 hover:bg-white/15 rounded transition cursor-pointer"
            >
              <Undo className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => executeCmd('redo')}
              title="Повторить (Ctrl+Y)"
              className="p-1 hover:bg-white/15 rounded transition cursor-pointer"
            >
              <Redo className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => printProceduralDocument()}
              title="Печать документа (Ctrl+P)"
              className="p-1 hover:bg-white/15 rounded transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleExportPDF}
              disabled={isExportingPdf}
              title="Экспорт в Adobe PDF (.pdf) для печати и архива"
              className="px-1.5 py-0.5 hover:bg-white/20 bg-rose-600/80 rounded transition cursor-pointer flex items-center gap-1 font-bold text-[11px] shadow-xs"
            >
              <FileDown className="w-3.5 h-3.5 text-white" />
              <span>{isExportingPdf ? 'Создание PDF...' : 'PDF'}</span>
            </button>
            <button
              onClick={handleOpenEmailModal}
              title="Отправить документ по электронной почте / СЭД"
              className="px-1.5 py-0.5 hover:bg-white/20 bg-indigo-700/80 rounded transition cursor-pointer flex items-center gap-1 font-medium text-[11px] shadow-xs"
            >
              <Mail className="w-3.5 h-3.5 text-amber-200" />
              <span className="hidden sm:inline">E-mail</span>
            </button>
            <button
              onClick={handleExportWordDoc}
              title="Экспорт в настоящий Word (.doc)"
              className="p-1 hover:bg-white/15 rounded transition cursor-pointer flex items-center gap-1 font-medium text-[11px]"
            >
              <FileDown className="w-3.5 h-3.5 text-amber-200" />
              <span className="hidden md:inline">.DOC</span>
            </button>
          </div>
        </div>

        {/* Center: File Title */}
        <div className="flex items-center gap-2 max-w-[40%] truncate">
          <input
            type="text"
            value={docTitle}
            onChange={(e) => setDocTitle(e.target.value)}
            className="bg-transparent hover:bg-black/15 focus:bg-black/25 px-2 py-0.5 rounded text-white font-medium text-center truncate text-xs focus:outline-none border-b border-transparent focus:border-white/50"
            title="Нажмите, чтобы переименовать документ"
          />
          <span className="text-[10px] text-blue-200 hidden lg:inline font-mono">
            — Сохранено ({lastSavedTime})
          </span>
        </div>

        {/* Right: Window / Fullscreen controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setDarkEditorTheme(!darkEditorTheme)}
            className="px-2 py-0.5 rounded bg-blue-800 hover:bg-blue-700 text-[10px] font-medium transition cursor-pointer hidden sm:block"
            title="Переключить фон листа (Светлый / Темный офис)"
          >
            {darkEditorTheme ? '☀️ Светлый стол' : '🌙 Темный стол'}
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1 hover:bg-white/15 rounded transition cursor-pointer"
            title={isFullscreen ? 'Свернуть окно' : 'На весь экран'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* 2. RIBBON TABS BAR */}
      <div className="bg-slate-900 border-b border-slate-800 px-3 flex items-center gap-1 text-xs select-none overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('home')}
          className={`px-3 py-2 font-semibold transition border-b-2 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'home'
              ? 'border-blue-500 text-blue-400 bg-slate-800/60'
              : 'border-transparent text-slate-300 hover:text-slate-100 hover:bg-slate-800/40'
          }`}
        >
          <Type className="w-3.5 h-3.5" />
          <span>Главная</span>
        </button>

        <button
          onClick={() => setActiveTab('insert')}
          className={`px-3 py-2 font-semibold transition border-b-2 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'insert'
              ? 'border-blue-500 text-blue-400 bg-slate-800/60'
              : 'border-transparent text-slate-300 hover:text-slate-100 hover:bg-slate-800/40'
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Вставка</span>
        </button>

        <button
          onClick={() => setActiveTab('layout')}
          className={`px-3 py-2 font-semibold transition border-b-2 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'layout'
              ? 'border-blue-500 text-blue-400 bg-slate-800/60'
              : 'border-transparent text-slate-300 hover:text-slate-100 hover:bg-slate-800/40'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Разметка страницы</span>
        </button>

        <button
          onClick={() => setActiveTab('templates')}
          className={`px-3 py-2 font-semibold transition border-b-2 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'templates'
              ? 'border-blue-500 text-blue-400 bg-slate-800/60'
              : 'border-transparent text-slate-300 hover:text-slate-100 hover:bg-slate-800/40'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-amber-300 font-bold">Банк 209 бланков</span>
        </button>

        <button
          onClick={() => setActiveTab('legal')}
          className={`px-3 py-2 font-semibold transition border-b-2 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'legal'
              ? 'border-blue-500 text-blue-400 bg-slate-800/60'
              : 'border-transparent text-slate-300 hover:text-slate-100 hover:bg-slate-800/40'
          }`}
        >
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span>Реквизиты УД</span>
        </button>

        <button
          onClick={() => setActiveTab('view')}
          className={`px-3 py-2 font-semibold transition border-b-2 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'view'
              ? 'border-blue-500 text-blue-400 bg-slate-800/60'
              : 'border-transparent text-slate-300 hover:text-slate-100 hover:bg-slate-800/40'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Вид и масштаб</span>
        </button>
      </div>

      {/* 3. RIBBON TOOLBAR CONTENT */}
      <div className="bg-slate-900/95 border-b border-slate-800 p-2 text-xs select-none">
        
        {/* TAB 1: HOME (ГЛАВНАЯ) */}
        {activeTab === 'home' && (
          <div className="flex items-center gap-3 flex-wrap">
            {/* Clipboard group */}
            <div className="flex items-center gap-1 border-r border-slate-800 pr-3">
              <button
                onClick={() => {
                  navigator.clipboard.readText().then((txt) => executeCmd('insertText', txt));
                }}
                className="p-1.5 hover:bg-slate-800 rounded text-slate-300 hover:text-white transition flex flex-col items-center gap-0.5 text-[10px]"
                title="Вставить из буфера"
              >
                <Copy className="w-4 h-4 text-blue-400" />
                <span>Вставить</span>
              </button>
              <button
                onClick={() => executeCmd('removeFormat')}
                className="p-1.5 hover:bg-slate-800 rounded text-slate-300 hover:text-white transition flex flex-col items-center gap-0.5 text-[10px]"
                title="Очистить всё форматирование"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Сброс</span>
              </button>
            </div>

            {/* Font & Size group */}
            <div className="flex items-center gap-1.5 border-r border-slate-800 pr-3">
              {/* Font Family selector */}
              <select
                value={fontFamily}
                onChange={(e) => applyFontFamily(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-500 cursor-pointer"
                title="Шрифт документа"
              >
                <option value="Times New Roman">Times New Roman (ГОСТ)</option>
                <option value="Arial">Arial</option>
                <option value="Calibri">Calibri</option>
                <option value="Georgia">Georgia</option>
                <option value="Courier New">Courier New (Машинопись)</option>
              </select>

              {/* Font Size selector */}
              <select
                value={fontSize}
                onChange={(e) => applyFontSize(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-500 cursor-pointer"
                title="Кегль / Размер шрифта"
              >
                <option value="10pt">10 pt</option>
                <option value="11pt">11 pt</option>
                <option value="12pt">12 pt (Сноски)</option>
                <option value="14pt">14 pt (ГОСТ СК РФ)</option>
                <option value="16pt">16 pt (Заголовок)</option>
                <option value="18pt">18 pt</option>
                <option value="22pt">22 pt</option>
              </select>

              {/* Bold, Italic, Underline, Strike */}
              <div className="flex items-center bg-slate-950 border border-slate-800 rounded p-0.5">
                <button
                  onClick={() => executeCmd('bold')}
                  className="p-1 hover:bg-slate-800 rounded text-slate-200 hover:text-white font-bold transition"
                  title="Полужирный (Ctrl+B)"
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => executeCmd('italic')}
                  className="p-1 hover:bg-slate-800 rounded text-slate-200 hover:text-white italic transition"
                  title="Курсив (Ctrl+I)"
                >
                  <Italic className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => executeCmd('underline')}
                  className="p-1 hover:bg-slate-800 rounded text-slate-200 hover:text-white underline transition"
                  title="Подчеркнутый (Ctrl+U)"
                >
                  <Underline className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => executeCmd('strikeThrough')}
                  className="p-1 hover:bg-slate-800 rounded text-slate-200 hover:text-white transition"
                  title="Зачеркнутый"
                >
                  <Strikethrough className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Paragraph & Alignment group */}
            <div className="flex items-center gap-1.5 border-r border-slate-800 pr-3">
              <div className="flex items-center bg-slate-950 border border-slate-800 rounded p-0.5">
                <button
                  onClick={() => executeCmd('justifyLeft')}
                  className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white transition"
                  title="По левому краю"
                >
                  <AlignLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => executeCmd('justifyCenter')}
                  className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white transition"
                  title="По центру"
                >
                  <AlignCenter className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => executeCmd('justifyRight')}
                  className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white transition"
                  title="По правому краю"
                >
                  <AlignRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => executeCmd('justifyFull')}
                  className="p-1 bg-blue-900/40 text-blue-300 hover:bg-blue-900/80 rounded font-bold transition"
                  title="По ширине (Обязательный ГОСТ УПК РФ)"
                >
                  <AlignJustify className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Lists & Indents */}
              <div className="flex items-center bg-slate-950 border border-slate-800 rounded p-0.5">
                <button
                  onClick={() => executeCmd('insertUnorderedList')}
                  className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white transition"
                  title="Маркированный список"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => executeCmd('insertOrderedList')}
                  className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white transition"
                  title="Нумерованный список"
                >
                  <ListOrdered className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => executeCmd('indent')}
                  className="px-1.5 py-1 hover:bg-slate-800 rounded text-[10px] text-slate-300 hover:text-white transition"
                  title="Красная строка / Увеличить отступ"
                >
                  Отступ →
                </button>
              </div>

              {/* Line height */}
              <select
                value={lineHeight}
                onChange={(e) => {
                  setLineHeight(e.target.value);
                  if (editorRef.current) {
                    editorRef.current.style.lineHeight = e.target.value;
                  }
                }}
                className="bg-slate-950 border border-slate-800 text-slate-200 rounded px-2 py-1 text-xs focus:outline-none cursor-pointer"
                title="Межстрочный интервал"
              >
                <option value="1.0">Интервал 1.0</option>
                <option value="1.15">Интервал 1.15</option>
                <option value="1.5">Интервал 1.5 (ГОСТ)</option>
                <option value="2.0">Интервал 2.0</option>
              </select>
            </div>

            {/* Quick Legal Cliques */}
            <div className="flex items-center gap-1.5 border-r border-slate-800 pr-3">
              <span className="text-[10px] text-slate-400 font-mono uppercase">Клише:</span>
              <button
                onClick={() => insertProceduralHeading('ustanovil')}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-bold transition cursor-pointer"
              >
                УСТАНОВИЛ:
              </button>
              <button
                onClick={() => insertProceduralHeading('postanovil')}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-bold transition cursor-pointer"
              >
                ПОСТАНОВИЛ:
              </button>
              <button
                onClick={() => insertProceduralHeading('prava')}
                className="px-2 py-1 bg-sky-950 hover:bg-sky-900 text-sky-300 border border-sky-800 rounded text-[11px] font-semibold transition cursor-pointer"
              >
                Права
              </button>
            </div>

            {/* Export & Email Group */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleExportPDF}
                disabled={isExportingPdf}
                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-[11px] font-bold transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                title="Экспорт процессуального документа в формат Adobe PDF"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>{isExportingPdf ? 'Формирование PDF...' : 'Экспорт в PDF'}</span>
              </button>

              <button
                onClick={handleOpenEmailModal}
                className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[11px] font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                title="Отправить документ в Прокуратуру / Суд / МВД по электронной почте или СЭД"
              >
                <Mail className="w-3.5 h-3.5 text-amber-300" />
                <span>Отправить по E-mail / СЭД</span>
              </button>

              <button
                onClick={() => printProceduralDocument()}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-medium transition cursor-pointer flex items-center gap-1"
                title="Печать документа (Ctrl+P)"
              >
                <Printer className="w-3.5 h-3.5 text-slate-400" />
                <span>Печать</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: INSERT (ВСТАВКА) */}
        {activeTab === 'insert' && (
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setShowTableModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-lg transition border border-slate-700 font-medium cursor-pointer"
            >
              <TableIcon className="w-3.5 h-3.5 text-blue-400" />
              <span>Таблица...</span>
            </button>

            <div className="h-5 w-px bg-slate-800" />

            {/* Seals & Stamps */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => insertStamp('seal')}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-950/70 hover:bg-blue-900/90 text-blue-300 border border-blue-800/80 rounded-lg transition font-medium cursor-pointer"
              >
                <Stamp className="w-3.5 h-3.5" />
                <span>Гербовая печать ГСУ</span>
              </button>
              <button
                onClick={() => insertStamp('copy_true')}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-950/70 hover:bg-emerald-900/90 text-emerald-300 border border-emerald-800/80 rounded-lg transition font-medium cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Штамп «Копия верна»</span>
              </button>
              <button
                onClick={() => insertStamp('secret')}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-rose-950/70 hover:bg-rose-900/90 text-rose-300 border border-rose-800/80 rounded-lg transition font-medium cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Штамп «Секретно»</span>
              </button>
              <button
                onClick={() => insertStamp('registered')}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-950/70 hover:bg-indigo-900/90 text-indigo-300 border border-indigo-800/80 rounded-lg transition font-medium cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Рег. штамп КУСП</span>
              </button>
            </div>

            <div className="h-5 w-px bg-slate-800" />

            {/* Signature Block */}
            <button
              onClick={() => insertProceduralHeading('protocol_end')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition font-medium cursor-pointer"
            >
              <PenTool className="w-3.5 h-3.5 text-amber-400" />
              <span>Линии подписей участников</span>
            </button>
          </div>
        )}

        {/* TAB 3: LAYOUT (РАЗМЕТКА СТРАНИЦЫ) */}
        {activeTab === 'layout' && (
          <div className="flex items-center gap-4 flex-wrap">
            {/* Margins */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium">Поля:</span>
              <select
                value={pageMargin}
                onChange={(e) => setPageMargin(e.target.value as PageMarginType)}
                className="bg-slate-950 border border-slate-800 text-slate-200 rounded px-2.5 py-1 focus:outline-none cursor-pointer"
              >
                <option value="gost">ГОСТ Делопроизводства (Левое 30 мм, Верх 20 мм, Низ 20 мм, Право 10 мм)</option>
                <option value="standard">Обычные (20 мм со всех сторон)</option>
                <option value="narrow">Узкие (12.7 мм)</option>
                <option value="wide">Широкие (30 мм)</option>
              </select>
            </div>

            {/* Orientation */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium">Ориентация:</span>
              <div className="flex bg-slate-950 p-0.5 rounded border border-slate-800">
                <button
                  onClick={() => setOrientation('portrait')}
                  className={`px-2.5 py-0.5 rounded text-[11px] transition ${
                    orientation === 'portrait' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400'
                  }`}
                >
                  Книжная (А4)
                </button>
                <button
                  onClick={() => setOrientation('landscape')}
                  className={`px-2.5 py-0.5 rounded text-[11px] transition ${
                    orientation === 'landscape' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400'
                  }`}
                >
                  Альбомная
                </button>
              </div>
            </div>

            {/* Watermark */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium">Водяной знак:</span>
              <select
                value={watermark}
                onChange={(e) => setWatermark(e.target.value as WatermarkType)}
                className="bg-slate-950 border border-slate-800 text-slate-200 rounded px-2 py-1 focus:outline-none cursor-pointer"
              >
                <option value="none">Без водяного знака</option>
                <option value="sk_rf">СЛЕДСТВЕННЫЙ КОМИТЕТ РФ</option>
                <option value="secret">СОВЕРШЕННО СЕКРЕТНО</option>
                <option value="dsp">ДЛЯ СЛУЖЕБНОГО ПОЛЬЗОВАНИЯ</option>
                <option value="sample">ОБРАЗЕЦ / КОПИЯ</option>
                <option value="case">МАТЕРИАЛЫ УГОЛОВНОГО ДЕЛА</option>
              </select>
            </div>
          </div>
        )}

        {/* TAB 4: TEMPLATES 209 (БАНК БЛАНКОВ УПК РФ) */}
        {activeTab === 'templates' && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap justify-between">
              <div className="flex items-center gap-2">
                <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[11px]">
                  <button
                    onClick={() => setTemplateCategory('all')}
                    className={`px-2 py-1 rounded transition ${
                      templateCategory === 'all' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
                    }`}
                  >
                    Все (209)
                  </button>
                  <button
                    onClick={() => setTemplateCategory('postanovlenie')}
                    className={`px-2 py-1 rounded transition ${
                      templateCategory === 'postanovlenie' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
                    }`}
                  >
                    Постановления (90)
                  </button>
                  <button
                    onClick={() => setTemplateCategory('protokol')}
                    className={`px-2 py-1 rounded transition ${
                      templateCategory === 'protokol' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
                    }`}
                  >
                    Протоколы (54)
                  </button>
                  <button
                    onClick={() => setTemplateCategory('other_report')}
                    className={`px-2 py-1 rounded transition ${
                      templateCategory === 'other_report' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
                    }`}
                  >
                    Рапорты / Иные (65)
                  </button>
                </div>

                <div className="relative w-64">
                  <Search className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Быстрый поиск бланка..."
                    value={templateSearch}
                    onChange={(e) => setTemplateSearch(e.target.value)}
                    className="w-full pl-7 pr-2 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <span className="text-[11px] text-amber-300 font-mono">
                Найдено: {filteredTemplates.length} бланков
              </span>
            </div>

            {/* Quick Carousel / Grid of Top Templates */}
            <div className="flex gap-2 overflow-x-auto pb-1 max-h-24 scrollbar-thin">
              {filteredTemplates.slice(0, 15).map((tmpl) => (
                <button
                  key={tmpl.id}
                  onClick={() => handleApplyTemplate(tmpl)}
                  className="flex-shrink-0 text-left p-2 bg-slate-950 border border-slate-800 hover:border-amber-500/60 rounded-xl transition w-56 group cursor-pointer"
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-mono text-amber-400 font-bold">Бланк {tmpl.blankNumber}</span>
                    <span className="text-slate-500">{tmpl.categoryLabel.split(' ')[0]}</span>
                  </div>
                  <div className="text-[11px] font-semibold text-slate-200 truncate mt-0.5 group-hover:text-amber-300">
                    {tmpl.title}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: LEGAL BINDINGS (РЕКВИЗИТЫ УД) */}
        {activeTab === 'legal' && (
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium">Уголовное дело:</span>
              <select
                value={selectedCaseNum}
                onChange={(e) => setSelectedCaseNum(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-200 rounded px-2 py-1 text-xs focus:outline-none cursor-pointer max-w-xs"
              >
                {cases.map((c) => (
                  <option key={c.id} value={c.caseNumber}>
                    {c.caseNumber} — {c.title.slice(0, 35)}...
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium">Фигурант:</span>
              <select
                value={selectedSuspect}
                onChange={(e) => setSelectedSuspect(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-200 rounded px-2 py-1 text-xs focus:outline-none cursor-pointer max-w-xs"
              >
                {offenders.map((o) => (
                  <option key={o.id} value={o.fullName}>
                    {o.fullName} ({o.status})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => {
                const foundCase = cases.find((c) => c.caseNumber === selectedCaseNum);
                if (foundCase) {
                  executeCmd(
                    'insertHTML',
                    `<p><strong>Материалы проверки по делу ${foundCase.caseNumber}:</strong> ${foundCase.summary} (Квалификация: ${foundCase.articles.join(', ')} УК РФ).</p>`
                  );
                  onShowToast('Фабула дела вставлена в курсор');
                }
              }}
              className="px-3 py-1 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded text-xs transition cursor-pointer"
            >
              Вставить фабулу дела в текст
            </button>
          </div>
        )}

        {/* TAB 6: VIEW & SCALE (ВИД) */}
        {activeTab === 'view' && (
          <div className="flex items-center gap-4 flex-wrap">
            <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={showRuler}
                onChange={(e) => setShowRuler(e.target.checked)}
                className="rounded bg-slate-950 border-slate-800 text-blue-600"
              />
              <span>Линейка Word</span>
            </label>

            <div className="h-5 w-px bg-slate-800" />

            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium">Масштаб:</span>
              <button
                onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))}
                className="p-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-200"
                title="Уменьшить"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-xs text-slate-200 w-10 text-center">{zoomLevel}%</span>
              <button
                onClick={() => setZoomLevel(Math.min(200, zoomLevel + 10))}
                className="p-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-200"
                title="Увеличить"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoomLevel(100)}
                className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px]"
              >
                100%
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4. HORIZONTAL WORD RULER (Линейка) */}
      {showRuler && (
        <div className="bg-[#f1f5f9] text-[#64748b] h-6 border-b border-slate-300 flex items-center px-4 select-none font-mono text-[9px] relative overflow-hidden">
          <div className="w-full max-w-[210mm] mx-auto flex justify-between items-center relative">
            {/* CM Scale markings: 0 to 17 cm */}
            {Array.from({ length: 18 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center relative">
                <span className="leading-none">{i}</span>
                <div className="h-2 w-px bg-slate-400 mt-0.5" />
              </div>
            ))}
            {/* Indent Marker */}
            <div className="absolute left-[30mm] top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-blue-600 rotate-45 border border-blue-900" title="Левое поле (30 мм)" />
            <div className="absolute right-[10mm] top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-blue-600 rotate-45 border border-blue-900" title="Правое поле (10 мм)" />
          </div>
        </div>
      )}

      {/* 5. WORD CANVAS WORKSPACE (РАБОЧИЙ СТОЛ С ЛИСТОМ А4) */}
      <div
        className={`flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center transition-colors ${
          darkEditorTheme ? 'bg-[#181c24]' : 'bg-[#e2e8f0]'
        }`}
        style={{
          backgroundImage: darkEditorTheme
            ? 'radial-gradient(#2d3748 1px, transparent 1px)'
            : 'radial-gradient(#cbd5e1 1px, transparent 1px)',
          backgroundSize: '16px 16px'
        }}
      >
        {/* REALISTIC A4 PAPER CANVAS */}
        <div
          style={{
            transform: `scale(${zoomLevel / 100})`,
            transformOrigin: 'top center'
          }}
          className="transition-transform duration-100"
        >
          <div
            ref={paperContainerRef}
            data-pdf-content="true"
            className={`bg-white text-slate-950 shadow-2xl relative transition-all border border-slate-300/80 ${marginsClass} ${
              orientation === 'portrait'
                ? 'w-[210mm] min-h-[297mm]'
                : 'w-[297mm] min-h-[210mm]'
            }`}
            style={{
              boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)'
            }}
          >
            {/* Watermark Overlay if active */}
            {watermark !== 'none' && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 opacity-[0.07] overflow-hidden">
                <div className="text-4xl sm:text-6xl font-black font-sans uppercase tracking-widest rotate-[-35deg] text-slate-900 text-center leading-tight">
                  {watermark === 'sk_rf' && 'СЛЕДСТВЕННЫЙ КОМИТЕТ\nРОССИЙСКОЙ ФЕДЕРАЦИИ'}
                  {watermark === 'secret' && 'СОВЕРШЕННО СЕКРЕТНО'}
                  {watermark === 'dsp' && 'ДЛЯ СЛУЖЕБНОГО ПОЛЬЗОВАНИЯ'}
                  {watermark === 'sample' && 'ОБРАЗЕЦ ДОКУМЕНТА'}
                  {watermark === 'case' && 'МАТЕРИАЛЫ УГОЛОВНОГО ДЕЛА'}
                </div>
              </div>
            )}

            {/* Editable document root */}
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              onInput={updateDocumentStats}
              onKeyUp={updateDocumentStats}
              className="outline-none focus:outline-none relative z-10 font-serif leading-relaxed"
              style={{
                fontFamily: `'${fontFamily}', 'Times New Roman', serif`,
                fontSize: fontSize,
                lineHeight: lineHeight,
                minHeight: '230mm'
              }}
            />
          </div>
        </div>
      </div>

      {/* 6. BOTTOM WORD STATUS BAR */}
      <div className="bg-[#185abd] text-white px-3 py-1 flex items-center justify-between text-[11px] select-none border-t border-blue-900/60 font-sans">
        <div className="flex items-center gap-3">
          <span>Страница 1 из 1</span>
          <div className="h-3 w-px bg-blue-300/40" />
          <span>Слов: <strong>{wordCount}</strong></span>
          <span>Знаков: <strong>{charCount}</strong></span>
          <div className="h-3 w-px bg-blue-300/40 hidden sm:block" />
          <span className="hidden sm:inline">Русский (Россия)</span>
          <div className="h-3 w-px bg-blue-300/40 hidden md:block" />
          <span className="hidden md:inline text-blue-200">✓ Проверка правописания: ошибок нет</span>
        </div>

        {/* Right zoom & quick actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={handleExportPDF}
            disabled={isExportingPdf}
            className="px-2 py-0.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded text-[10px] transition cursor-pointer shadow flex items-center gap-1"
            title="Экспорт в PDF для печати или отправки"
          >
            <FileDown className="w-3 h-3" />
            <span>PDF</span>
          </button>
          <button
            onClick={handleOpenEmailModal}
            className="px-2 py-0.5 bg-indigo-700 hover:bg-indigo-600 text-white font-semibold rounded text-[10px] transition cursor-pointer shadow flex items-center gap-1"
            title="Отправить по E-mail / СЭД"
          >
            <Mail className="w-3 h-3 text-amber-300" />
            <span>E-mail</span>
          </button>
          <button
            onClick={handleCopyBBCode}
            className="px-2 py-0.5 bg-blue-800 hover:bg-blue-700 rounded text-[10px] font-semibold transition cursor-pointer hidden sm:block"
            title="Скопировать в формате BB-кода"
          >
            BB-Code
          </button>
          <button
            onClick={handleExportWordDoc}
            className="px-2 py-0.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded text-[10px] transition cursor-pointer shadow"
            title="Скачать настоящий файл Word .doc"
          >
            .DOC
          </button>

          <div className="h-3 w-px bg-blue-300/40 mx-1" />

          <button
            onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))}
            className="p-0.5 hover:bg-white/15 rounded"
            title="Уменьшить масштаб"
          >
            -
          </button>
          <input
            type="range"
            min="50"
            max="180"
            step="5"
            value={zoomLevel}
            onChange={(e) => setZoomLevel(Number(e.target.value))}
            className="w-16 sm:w-24 accent-white cursor-pointer h-1"
          />
          <button
            onClick={() => setZoomLevel(Math.min(180, zoomLevel + 10))}
            className="p-0.5 hover:bg-white/15 rounded"
            title="Увеличить масштаб"
          >
            +
          </button>
          <span className="font-mono text-[10px] w-9 text-right">{zoomLevel}%</span>
        </div>
      </div>

      {/* MODAL: INSERT TABLE */}
      {showTableModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-2xl text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                <TableIcon className="w-4 h-4 text-blue-400" />
                Вставка таблицы в документ
              </h3>
              <button
                onClick={() => setShowTableModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-400 mb-1">Число строк:</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={tableRows}
                  onChange={(e) => setTableRows(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Число столбцов:</label>
                <input
                  type="number"
                  min="1"
                  max="8"
                  value={tableCols}
                  onChange={(e) => setTableCols(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowTableModal(false)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
              >
                Отмена
              </button>
              <button
                onClick={insertCustomTable}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow"
              >
                Вставить таблицу
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EMAIL DISPATCH */}
      <EmailDispatchModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        documentTitle={docTitle}
        documentDate={docDate}
        caseNumber={selectedCaseNum}
        suspectName={selectedSuspect}
        officer={officer}
        onDownloadPdf={handleExportPDF}
        onShowToast={onShowToast}
      />
    </div>
  );
};
