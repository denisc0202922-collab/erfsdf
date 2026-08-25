import React, { useState, useEffect } from 'react';
import { OfficerProfile } from '../types';
import {
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Award,
  ChevronRight,
  RotateCcw,
  BookOpen,
  Shield,
  Send,
  Sparkles,
  ClipboardList,
  CheckSquare,
  AlertTriangle,
  Trophy,
  ArrowRight,
  Clock,
  FileText,
  UserCheck
} from 'lucide-react';
import {
  QUALIFICATION_QUESTIONS,
  getExamSubmissions,
  saveExamSubmissions,
  ExamSubmission
} from '../data/examQuestions';

interface JuniorExamViewProps {
  officer: OfficerProfile;
  onPromoteToLieutenant?: () => void;
  onShowToast: (msg: string) => void;
}

// Storage Key for Officer's personal local exam answers and progress
const EXAM_STORAGE_KEY = 'sk_rf_junior_exam_answers_v2';

interface TestQuestion {
  id: number;
  question: string;
  options: { key: string; text: string }[];
  correctAnswer: string;
  explanation: string;
}

interface TestData {
  id: number;
  title: string;
  description: string;
  badge: string;
  questions: TestQuestion[];
}

const TESTS: TestData[] = [
  {
    id: 1,
    title: 'Тест №1: Процессуальный кодекс и стадии задержания/допроса',
    description: 'Основы Уголовно-процессуального кодекса РФ, порядок идентификации сотрудника, права задержанных и правила допустимости доказательств.',
    badge: 'УПК РФ',
    questions: [
      {
        id: 1,
        question: 'С какого процессуального действия сотрудник обязан начать взаимодействие при законном задержании подозреваемого?',
        options: [
          { key: 'а', text: 'С составления протокола допроса' },
          { key: 'б', text: 'С надевания наручников и первичного обыска' },
          { key: 'в', text: 'С идентификации себя (назвать звание, должность, показать служебное удостоверение) и оглашения причины задержания' },
          { key: 'г', text: 'С посадки задержанного в служебный автомобиль' }
        ],
        correctAnswer: 'в',
        explanation: 'Согласно процессуальным нормам и ФЗ «О Следственном комитете РФ», сотрудник обязан представиться, назвать должность и специальное звание, предъявить удостоверение и огласить законную причину ограничения свободы.'
      },
      {
        id: 2,
        question: 'В какой момент задержанному гражданину в обязательном порядке зачитывается правило Миранды (его процессуальные права)?',
        options: [
          { key: 'а', text: 'Непосредственно во время задержания/транспортировки до начала допроса' },
          { key: 'б', text: 'Только после вынесения обвинительного приговора' },
          { key: 'в', text: 'Только если гражданин лично об этом попросит' },
          { key: 'г', text: 'Во время передачи дела в архив' }
        ],
        correctAnswer: 'а',
        explanation: 'Права задержанного (право хранить молчание, право на адвоката, телефонный звонок) оглашаются незамедлительно при фактическом задержании до начала процессуального допроса.'
      },
      {
        id: 3,
        question: 'Имеет ли право подозреваемый хранить молчание и отказаться свидетельствовать против самого себя во время следственных действий?',
        options: [
          { key: 'а', text: 'Нет, за отказ от показаний сразу выносится приговор' },
          { key: 'б', text: 'Да, это гарантировано базовыми конституционными и процессуальными правами (ст. 51 Конституции РФ)' },
          { key: 'в', text: 'Только с письменного разрешения следователя' },
          { key: 'г', text: 'Только при наличии статуса свидетеля' }
        ],
        correctAnswer: 'б',
        explanation: 'Статья 51 Конституции РФ и ст. 46-47 УПК РФ прямо гарантируют право не свидетельствовать против себя самого, своего супруга и близких родственников.'
      },
      {
        id: 4,
        question: 'Что является обязательным требованием при проведении личного обыска подозреваемого на месте задержания?',
        options: [
          { key: 'а', text: 'Наличие видеофиксации или понятых, а также соблюдение первичных мер безопасности' },
          { key: 'б', text: 'Присутствие судьи' },
          { key: 'в', text: 'Обязательная передача всех вещей третьим лицам' },
          { key: 'г', text: 'Проведение обыска исключительно в здании суда' }
        ],
        correctAnswer: 'а',
        explanation: 'Личный обыск и выемка проводятся с обязательной непрерывной видеофиксацией либо в присутствии не менее двух понятых с занесением всех изъятых предметов в протокол.'
      },
      {
        id: 5,
        question: 'Каков максимальный допустимый статус доказательства, если оно было получено сотрудником с грубым нарушением процессуальных норм (без фиксации, с применением пыток)?',
        options: [
          { key: 'а', text: 'Допустимое косвенное доказательство' },
          { key: 'б', text: 'Недопустимое доказательство, не имеющее юридической силы в суде' },
          { key: 'в', text: 'Полноценная улика на усмотрение следователя' },
          { key: 'г', text: 'Доказательство средней тяжести' }
        ],
        correctAnswer: 'б',
        explanation: 'Согласно ст. 75 УПК РФ, доказательства, полученные с нарушением требований закона, являются недопустимыми, не имеют юридической силы и не могут быть положены в основу обвинения.'
      }
    ]
  },
  {
    id: 2,
    title: 'Тест №2: Внутриведомственный устав и субординация',
    description: 'Иерархия СК РФ, соблюдение служебной дисциплины, порядок исполнения законных приказов и правила обращения с табельным оружием.',
    badge: 'УСТАВ СК РФ',
    questions: [
      {
        id: 1,
        question: 'Кому непосредственно подчиняется младший лейтенант юстиции в ходе расследования уголовного дела?',
        options: [
          { key: 'а', text: 'Сотрудникам дорожно-патрульной службы' },
          { key: 'б', text: 'Руководителю следственного органа / старшему следователю следственной группы и Председателю СК' },
          { key: 'в', text: 'Гражданским наблюдателям' },
          { key: 'г', text: 'Адвокату подозреваемого' }
        ],
        correctAnswer: 'б',
        explanation: 'Служебная подчиненность следователя строится строго по ведомственной вертикали: руководитель следственного отдела, управление, Главное следственное управление и Председатель СК РФ.'
      },
      {
        id: 2,
        question: 'Допускается ли использование служебного служебно-оперативного транспорта со спецсигналами в личных целях?',
        options: [
          { key: 'а', text: 'Да, если включена только сирена' },
          { key: 'б', text: 'Категорически запрещено и является грубым дисциплинарным проступком' },
          { key: 'в', text: 'Разрешено в выходные дни' },
          { key: 'г', text: 'Разрешено с согласия дежурного диспетчера' }
        ],
        correctAnswer: 'б',
        explanation: 'Служебный транспорт СК РФ используется исключительно для выполнения неотложных служебных задач, оперативных выездов на место преступления и следственных мероприятий.'
      },
      {
        id: 3,
        question: 'Что обязан сделать сотрудник юстиции при получении заведомо незаконного приказа?',
        options: [
          { key: 'а', text: 'Немедленно выполнить приказ любой ценой' },
          { key: 'б', text: 'Отказаться от исполнения, зафиксировать факт и доложить вышестоящему руководству / в УСБ СК РФ' },
          { key: 'в', text: 'Передать приказ другим младшим сотрудникам' },
          { key: 'г', text: 'Игнорировать все служебные обязанности' }
        ],
        correctAnswer: 'б',
        explanation: 'Федеральный закон запрещает исполнение заведомо незаконных приказов. Офицер обязан руководствоваться Конституцией и законами РФ, уведомив руководство или службу собственной безопасности.'
      },
      {
        id: 4,
        question: 'Каков порядок разглашения данных предварительного расследования третьим лицам или в СМИ?',
        options: [
          { key: 'а', text: 'Разрешено только с письменного разрешения следователя/руководителя следственного органа и в допустимом объеме (ст. 161 УПК РФ)' },
          { key: 'б', text: 'Можно публиковать любые материалы в личных соцсетях' },
          { key: 'в', text: 'Разглашение разрешено по первой просьбе журналистов' },
          { key: 'г', text: 'Не регулируется законом' }
        ],
        correctAnswer: 'а',
        explanation: 'Данные предварительного следствия составляют охраняемую тайну. Разглашение влечет уголовную ответственность по ст. 310 УК РФ.'
      },
      {
        id: 5,
        question: 'Какая форма служебного обращения установлена уставом к старшим по званию и должности офицерам?',
        options: [
          { key: 'а', text: 'Неформальное обращение на «ты»' },
          { key: 'б', text: 'Обращение на «Вы» с указанием специального звания (например: «Товарищ капитан юстиции»)' },
          { key: 'в', text: 'Только по имени без звания' },
          { key: 'г', text: 'Произвольное обращение' }
        ],
        correctAnswer: 'б',
        explanation: 'Уставной порядок предусматривает строгое соблюдение субординации и вежливого служебного обращения на «Вы» с указанием звания.'
      }
    ]
  },
  {
    id: 3,
    title: 'Тест №3: Криминалистика и работа на месте преступления',
    description: 'Осмотр места происшествия (ОМП), фиксация улик, изъятие вещдоков, опечатывание и взаимодействие со спецслужбами.',
    badge: 'КРИМИНАЛИСТИКА',
    questions: [
      {
        id: 1,
        question: 'Что является первоочередной задачей следователя по прибытии на место совершения преступления?',
        options: [
          { key: 'а', text: 'Немедленный допрос всех прохожих' },
          { key: 'б', text: 'Оцепление территории, удаление посторонних лиц и обеспечение сохранности следовой обстановки' },
          { key: 'в', text: 'Сбор всех предметов руками без перчаток' },
          { key: 'г', text: 'Оглашение предварительного приговора' }
        ],
        correctAnswer: 'б',
        explanation: 'Первоочередная обязанность — предотвратить уничтожение следов (папиллярных линий, ДНК, гильз, микрочастиц), оцепить периметр и организовать охрану места происшествия.'
      },
      {
        id: 2,
        question: 'Какое правило является обязательным при изъятии вещественных доказательств (оружие, гильзы, наркотические вещества)?',
        options: [
          { key: 'а', text: 'Использование криминалистических перчаток, упаковка в номерной сейф-пакет с опечатыванием и подписями участников' },
          { key: 'б', text: 'Хранение вещдоков в кармане следователя' },
          { key: 'в', text: 'Передача улик родственникам потерпевшего' },
          { key: 'г', text: 'Промывание найденного оружия водой' }
        ],
        correctAnswer: 'а',
        explanation: 'Вещдоки упаковываются в специальные пакеты, опечатываются бирками с подписями следователя, понятых и эксперта во избежание фальсификации и порчи следов.'
      },
      {
        id: 3,
        question: 'Какой вид фотофиксации применяется для масштабного запечатления отпечатков обуви, гильз и мелких улик?',
        options: [
          { key: 'а', text: 'Селфи-съемка' },
          { key: 'б', text: 'Детальная масштабная фотосъемка с криминалистической миллиметровой линейкой' },
          { key: 'в', text: 'Только общая панорамная фотосъемка' },
          { key: 'г', text: 'Фотосъемка не требуется' }
        ],
        correctAnswer: 'б',
        explanation: 'Детальная фотосъемка с масштабной линейкой позволяет экспертам точно вычислить размеры отпечатков, калибр гильзы и форму следа взлома.'
      },
      {
        id: 4,
        question: 'Что фиксируется в вводной части протокола осмотра места происшествия?',
        options: [
          { key: 'а', text: 'Предполагаемый приговор' },
          { key: 'б', text: 'Дата, точное время начала и окончания, координаты/адрес места, погодные условия, освещение и список всех участвующих лиц' },
          { key: 'в', text: 'Список личных покупок следователя' },
          { key: 'г', text: 'Личное мнение прохожих о случившемся' }
        ],
        correctAnswer: 'б',
        explanation: 'Протокол ОМП детально фиксирует статику и динамику обстановки: координаты, освещение, погоду, следы волочения, отпечатки, расположение тел и предметов.'
      },
      {
        id: 5,
        question: 'Что необходимо для установления владельца огнестрельного оружия, найденного на месте преступления?',
        options: [
          { key: 'а', text: 'Проверка серийного номера по базе данных и проведение баллистической экспертизы / снятие отпечатков пальцев' },
          { key: 'б', text: 'Опрос первого встречного прохожего' },
          { key: 'в', text: 'Стрельба в воздух для проверки звука' },
          { key: 'г', text: 'Оценка внешнего вида оружия на глаз' }
        ],
        correctAnswer: 'а',
        explanation: 'Идентификация оружия проводится по криминалистическим пулегильзотекам, проверке номеров в реестре оружия и баллистической судебно-следственной экспертизе.'
      }
    ]
  }
];

export const JuniorExamView: React.FC<JuniorExamViewProps> = ({
  officer,
  onPromoteToLieutenant,
  onShowToast
}) => {
  const [selectedSection, setSelectedSection] = useState<'overview' | 'test1' | 'test2' | 'test3' | 'final_exam'>('overview');

  // Test Answers State
  const [testAnswers, setTestAnswers] = useState<Record<number, Record<number, string>>>(() => {
    try {
      const raw = localStorage.getItem(`${EXAM_STORAGE_KEY}_tests`);
      return raw ? JSON.parse(raw) : { 1: {}, 2: {}, 3: {} };
    } catch {
      return { 1: {}, 2: {}, 3: {} };
    }
  });

  // Submitted Tests
  const [submittedTests, setSubmittedTests] = useState<Record<number, boolean>>(() => {
    try {
      const raw = localStorage.getItem(`${EXAM_STORAGE_KEY}_tests_submitted`);
      return raw ? JSON.parse(raw) : { 1: false, 2: false, 3: false };
    } catch {
      return { 1: false, 2: false, 3: false };
    }
  });

  // Written Answers for 10 questions
  const [examAnswers, setExamAnswers] = useState<Record<number, string>>(() => {
    try {
      const raw = localStorage.getItem(`${EXAM_STORAGE_KEY}_written`);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  // Officer's personal submission record from global submissions list
  const [allSubmissions, setAllSubmissions] = useState<ExamSubmission[]>(() => getExamSubmissions());

  const currentSubmission = allSubmissions.find(
    (s) => s.officerName.toLowerCase() === officer.fullName.toLowerCase() || s.badgeNumber === officer.badgeNumber
  );

  const isExamSubmitted = !!currentSubmission;

  // Persist locally
  useEffect(() => {
    try {
      localStorage.setItem(`${EXAM_STORAGE_KEY}_tests`, JSON.stringify(testAnswers));
      localStorage.setItem(`${EXAM_STORAGE_KEY}_tests_submitted`, JSON.stringify(submittedTests));
      localStorage.setItem(`${EXAM_STORAGE_KEY}_written`, JSON.stringify(examAnswers));
    } catch {
      // ignore
    }
  }, [testAnswers, submittedTests, examAnswers]);

  // Calculate scores for each test
  const calculateTestScore = (testId: number) => {
    const test = TESTS.find((t) => t.id === testId);
    if (!test) return { correct: 0, total: 5, passed: false };
    const answers = testAnswers[testId] || {};
    let correct = 0;
    test.questions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) {
        correct++;
      }
    });
    return {
      correct,
      total: test.questions.length,
      passed: correct >= 4
    };
  };

  const test1Score = calculateTestScore(1);
  const test2Score = calculateTestScore(2);
  const test3Score = calculateTestScore(3);

  const allTestsPassed =
    submittedTests[1] && test1Score.passed &&
    submittedTests[2] && test2Score.passed &&
    submittedTests[3] && test3Score.passed;

  const writtenQuestionsAnsweredCount = QUALIFICATION_QUESTIONS.filter(
    (q) => typeof examAnswers[q.id] === 'string' && examAnswers[q.id].trim().length > 10
  ).length;

  const handleSelectOption = (testId: number, questionId: number, answerKey: string) => {
    if (submittedTests[testId]) return;
    setTestAnswers((prev) => ({
      ...prev,
      [testId]: {
        ...(prev[testId] || {}),
        [questionId]: answerKey
      }
    }));
  };

  const handleSubmitTest = (testId: number) => {
    const test = TESTS.find((t) => t.id === testId);
    if (!test) return;
    const answeredCount = Object.keys(testAnswers[testId] || {}).length;
    if (answeredCount < test.questions.length) {
      onShowToast(`Внимание: Вы ответили только на ${answeredCount} из ${test.questions.length} вопросов!`);
      return;
    }

    setSubmittedTests((prev) => ({ ...prev, [testId]: true }));
    const score = calculateTestScore(testId);
    if (score.passed) {
      onShowToast(`Поздравляем! Тест №${testId} успешно сдан (${score.correct}/${score.total})!`);
    } else {
      onShowToast(`Тест №${testId} не сдан (${score.correct}/${score.total}). Необходимый минимум — 4 правильных ответа.`);
    }
  };

  const handleResetTest = (testId: number) => {
    setSubmittedTests((prev) => ({ ...prev, [testId]: false }));
    setTestAnswers((prev) => ({ ...prev, [testId]: {} }));
    onShowToast(`Результаты теста №${testId} сброшены. Вы можете пройти его заново.`);
  };

  const handleExamAnswerChange = (qId: number, value: string) => {
    if (isExamSubmitted && currentSubmission?.status === 'pending') return;
    setExamAnswers((prev) => ({ ...prev, [qId]: value }));
  };

  const handleSubmitFinalExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allTestsPassed) {
      onShowToast('Для сдачи экзамена необходимо сначала успешно сдать все 3 теоретических теста!');
      return;
    }

    if (writtenQuestionsAnsweredCount < 8) {
      onShowToast(`Для отправки экзамена на проверку необходимо дать развернутые ответы минимум на 8 из 10 вопросов (сейчас: ${writtenQuestionsAnsweredCount}).`);
      return;
    }

    const newSubmission: ExamSubmission = {
      id: `exam-sub-${Date.now()}`,
      officerId: officer.badgeNumber,
      officerName: officer.fullName,
      currentRank: officer.rank,
      department: officer.department,
      badgeNumber: officer.badgeNumber,
      submittedAt: new Date().toLocaleString('ru-RU'),
      test1Passed: test1Score.passed,
      test1Score: `${test1Score.correct}/${test1Score.total}`,
      test2Passed: test2Score.passed,
      test2Score: `${test2Score.correct}/${test2Score.total}`,
      test3Passed: test3Score.passed,
      test3Score: `${test3Score.correct}/${test3Score.total}`,
      answers: examAnswers,
      status: 'pending'
    };

    const existing = getExamSubmissions();
    const updated = [newSubmission, ...existing.filter((s) => s.officerName !== officer.fullName)];
    saveExamSubmissions(updated);
    setAllSubmissions(updated);

    onShowToast('Экзаменационная работа успешно направлена лично Председателю СК России на проверку!');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-lg bg-red-50 border border-red-200 text-[#85181b] font-mono text-xs font-bold">
              УЧЕБНО-АТТЕСТАЦИОННЫЙ ЦЕНТР СК РФ
            </span>
            <span className="px-2.5 py-0.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5 text-amber-700" />
              Программа повышения квалификации: «Младший лейтенант → Лейтенант»
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <GraduationCap className="w-6 h-6 text-[#85181b]" />
            <span>Квалификационная аттестация на звание «Лейтенант юстиции»</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-2xl mt-1 leading-relaxed">
            Официальная программа аттестации: 3 теоретических теста + 10 билетов квалификационного экзамена. Проверка ответов осуществляется исключительно <b>Председателем СК РФ</b>.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-3 rounded-2xl shrink-0">
          <div className="text-right">
            <div className="text-[11px] text-slate-500 font-bold">Аттестуемый офицер:</div>
            <div className="text-xs font-black text-slate-900">{officer.fullName}</div>
            <div className="text-[10px] text-[#85181b] font-mono font-bold">{officer.rank}</div>
          </div>
          <img
            src={officer.photoUrl}
            alt={officer.fullName}
            className="w-11 h-11 rounded-xl object-cover border border-slate-300 shadow-sm"
          />
        </div>
      </div>

      {/* Navigation Subtabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto pb-0">
        <button
          onClick={() => setSelectedSection('overview')}
          className={`py-2.5 px-4 rounded-t-xl font-bold text-xs transition cursor-pointer flex items-center gap-2 border-b-2 ${
            selectedSection === 'overview'
              ? 'border-[#85181b] text-[#85181b] bg-white shadow-sm'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Обзор программы и регламент</span>
        </button>

        <button
          onClick={() => setSelectedSection('test1')}
          className={`py-2.5 px-4 rounded-t-xl font-bold text-xs transition cursor-pointer flex items-center gap-2 border-b-2 ${
            selectedSection === 'test1'
              ? 'border-[#85181b] text-[#85181b] bg-white shadow-sm'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>Тест №1 (УПК)</span>
          {submittedTests[1] && (
            <span className={`px-1.5 py-0.2 rounded text-[10px] ${test1Score.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
              {test1Score.correct}/5
            </span>
          )}
        </button>

        <button
          onClick={() => setSelectedSection('test2')}
          className={`py-2.5 px-4 rounded-t-xl font-bold text-xs transition cursor-pointer flex items-center gap-2 border-b-2 ${
            selectedSection === 'test2'
              ? 'border-[#85181b] text-[#85181b] bg-white shadow-sm'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>Тест №2 (Устав)</span>
          {submittedTests[2] && (
            <span className={`px-1.5 py-0.2 rounded text-[10px] ${test2Score.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
              {test2Score.correct}/5
            </span>
          )}
        </button>

        <button
          onClick={() => setSelectedSection('test3')}
          className={`py-2.5 px-4 rounded-t-xl font-bold text-xs transition cursor-pointer flex items-center gap-2 border-b-2 ${
            selectedSection === 'test3'
              ? 'border-[#85181b] text-[#85181b] bg-white shadow-sm'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>Тест №3 (Криминалистика)</span>
          {submittedTests[3] && (
            <span className={`px-1.5 py-0.2 rounded text-[10px] ${test3Score.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
              {test3Score.correct}/5
            </span>
          )}
        </button>

        <button
          onClick={() => setSelectedSection('final_exam')}
          className={`py-2.5 px-4 rounded-t-xl font-bold text-xs transition cursor-pointer flex items-center gap-2 border-b-2 ${
            selectedSection === 'final_exam'
              ? 'border-[#85181b] text-[#85181b] bg-white shadow-sm'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Квалификационный экзамен (10 вопросов)</span>
          {currentSubmission && (
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
              currentSubmission.status === 'approved'
                ? 'bg-emerald-100 text-emerald-800'
                : currentSubmission.status === 'rejected'
                ? 'bg-red-100 text-red-800'
                : 'bg-amber-100 text-amber-900'
            }`}>
              {currentSubmission.status === 'approved' ? 'СДАНО' : currentSubmission.status === 'rejected' ? 'ОТКЛОНЕНО' : 'НА ПРОВЕРКЕ'}
            </span>
          )}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. OVERVIEW TAB                                                           */}
      {/* ========================================================================= */}
      {selectedSection === 'overview' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-sm space-y-6 animate-in fade-in">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-5 border-b border-slate-200">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase text-[#85181b] tracking-wider">
                Порядок аттестации офицеров юстиции
              </span>
              <h3 className="text-lg font-black text-slate-900">
                Инструкция по прохождению квалификационных испытаний
              </h3>
            </div>
            <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3">
              <Trophy className="w-6 h-6 text-[#85181b]" />
              <div>
                <div className="text-xs font-bold text-slate-900">Целевое звание:</div>
                <div className="text-sm font-black text-[#85181b]">Лейтенант юстиции</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <div className="w-8 h-8 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-[#85181b] font-bold text-xs">
                1
              </div>
              <h4 className="font-bold text-sm text-slate-900">Три теоретических теста</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Необходимо сдать все 3 теста с результатом не менее 80% (минимум 4 из 5 верных ответов в каждом). Тесты охватывают процессуальное право, уставную субординацию и криминалистику.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <div className="w-8 h-8 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-[#85181b] font-bold text-xs">
                2
              </div>
              <h4 className="font-bold text-sm text-slate-900">Письменный экзамен (10 билетов)</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Развернутые ответы на 10 ключевых вопросов: правило Миранды, применение оружия, презумпция невиновности, этапы допроса, обыск без ордера, фиксация улик и практическая задача.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <div className="w-8 h-8 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-[#85181b] font-bold text-xs">
                3
              </div>
              <h4 className="font-bold text-sm text-slate-900">Проверка у Председателя СК РФ</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Экзаменационная работа поступает в кабинет Председателя Следственного комитета РФ. Только после его личного утверждения издается приказ о присвоении звания «Лейтенант юстиции».
              </p>
            </div>
          </div>

          {/* Call to action button */}
          <div className="pt-3 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100">
            <div className="text-xs text-slate-500 font-medium">
              Текущий прогресс: <b>{Number(submittedTests[1] && test1Score.passed) + Number(submittedTests[2] && test2Score.passed) + Number(submittedTests[3] && test3Score.passed)} / 3 тестов пройдено</b>
            </div>

            <button
              onClick={() => setSelectedSection('test1')}
              className="px-6 py-2.5 bg-[#85181b] hover:bg-[#6b1316] text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer flex items-center gap-2"
            >
              <span>Начать тестирование (Тест №1)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. TESTS 1, 2, 3 RENDERER                                                 */}
      {/* ========================================================================= */}
      {(selectedSection === 'test1' || selectedSection === 'test2' || selectedSection === 'test3') && (() => {
        const testId = selectedSection === 'test1' ? 1 : selectedSection === 'test2' ? 2 : 3;
        const test = TESTS.find((t) => t.id === testId)!;
        const isSubmitted = submittedTests[testId];
        const answers = testAnswers[testId] || {};
        const score = calculateTestScore(testId);

        return (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-sm space-y-6 animate-in fade-in">
            {/* Test Top Banner */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
              <div>
                <span className="px-2.5 py-0.5 rounded-lg bg-red-50 border border-red-200 text-[#85181b] font-mono text-[11px] font-bold">
                  {test.badge}
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">
                  {test.title}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {test.description}
                </p>
              </div>

              {isSubmitted && (
                <div className={`p-3 rounded-2xl border text-right ${score.passed ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-red-50 border-red-200 text-red-900'}`}>
                  <div className="text-[11px] font-bold">Результат:</div>
                  <div className="text-lg font-black font-mono">
                    {score.correct} / {score.total} {score.passed ? '(СДАНО)' : '(НЕ СДАНО)'}
                  </div>
                </div>
              )}
            </div>

            {/* Questions List */}
            <div className="space-y-6">
              {test.questions.map((q, idx) => {
                const selectedKey = answers[q.id];
                const isCorrect = selectedKey === q.correctAnswer;

                return (
                  <div
                    key={q.id}
                    className={`p-5 rounded-2xl border transition ${
                      isSubmitted
                        ? isCorrect
                          ? 'bg-emerald-50/40 border-emerald-200'
                          : 'bg-red-50/40 border-red-200'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="w-7 h-7 rounded-xl bg-white border border-slate-300 text-slate-800 font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                        {idx + 1}
                      </span>
                      <div className="space-y-3 w-full">
                        <div className="text-sm font-bold text-slate-900 leading-snug">
                          {q.question}
                        </div>

                        <div className="grid grid-cols-1 gap-2">
                          {q.options.map((opt) => {
                            const isChosen = selectedKey === opt.key;
                            const isRight = opt.key === q.correctAnswer;

                            let optClass = 'bg-white border-slate-200 text-slate-700 hover:border-[#85181b]';

                            if (isSubmitted) {
                              if (isRight) {
                                optClass = 'bg-emerald-100 border-emerald-500 text-emerald-950 font-bold';
                              } else if (isChosen && !isRight) {
                                optClass = 'bg-red-100 border-red-500 text-red-950 font-semibold';
                              } else {
                                optClass = 'bg-white/60 border-slate-200 text-slate-400 opacity-60';
                              }
                            } else if (isChosen) {
                              optClass = 'bg-red-50 border-[#85181b] text-[#85181b] font-bold shadow-sm';
                            }

                            return (
                              <button
                                key={opt.key}
                                type="button"
                                disabled={isSubmitted}
                                onClick={() => handleSelectOption(testId, q.id, opt.key)}
                                className={`w-full text-left p-3 rounded-xl border text-xs transition cursor-pointer flex items-start gap-2.5 ${optClass}`}
                              >
                                <span className="w-5 h-5 rounded-lg border flex items-center justify-center text-[11px] font-mono shrink-0 uppercase">
                                  {opt.key}
                                </span>
                                <span className="leading-snug">{opt.text}</span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Explanation after submission */}
                        {isSubmitted && (
                          <div className={`p-3 rounded-xl border text-xs space-y-1 ${isCorrect ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-red-50 border-red-200 text-red-900'}`}>
                            <div className="font-bold flex items-center gap-1.5">
                              {isCorrect ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
                              <span>{isCorrect ? 'Правильный ответ!' : 'Неверный ответ!'}</span>
                            </div>
                            <p className="text-[11px] leading-relaxed text-slate-700">
                              <b>Правовое обоснование:</b> {q.explanation}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-slate-500 font-medium">
                Отвечено: <b>{Object.keys(answers).length} из {test.questions.length}</b> вопросов
              </div>

              {isSubmitted ? (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleResetTest(testId)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-100 transition cursor-pointer flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Пересдать тест</span>
                  </button>

                  <button
                    onClick={() => {
                      if (testId === 1) setSelectedSection('test2');
                      else if (testId === 2) setSelectedSection('test3');
                      else setSelectedSection('final_exam');
                    }}
                    className="px-6 py-2.5 rounded-xl bg-[#85181b] hover:bg-[#6b1316] text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-2"
                  >
                    <span>{testId === 3 ? 'К экзаменационному листу' : `Перейти к тесту №${testId + 1}`}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleSubmitTest(testId)}
                  className="w-full sm:w-auto px-8 py-3 rounded-xl bg-[#85181b] hover:bg-[#6b1316] text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Завершить и проверить тест №{testId}</span>
                </button>
              )}
            </div>
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* 3. FINAL QUALIFICATION EXAM (10 QUESTIONS)                                */}
      {/* ========================================================================= */}
      {selectedSection === 'final_exam' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-5 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-lg bg-red-50 border border-red-200 text-[#85181b] font-mono text-[11px] font-bold">
                  ИТОГОВЫЙ ЭКЗАМЕН
                </span>
                {allTestsPassed ? (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Допуск к экзамену получен
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Требуется успешная сдача 3 тестов
                  </span>
                )}
              </div>
              <h3 className="text-xl font-black text-slate-900">
                Квалификационный экзамен на звание «Лейтенант юстиции»
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Официальный письменный экзаменационный лист из 10 билетов. Проверка проводится лично <b>Председателем СК РФ</b> в панели управления.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-right">
              <div className="text-[11px] text-slate-500 font-bold">Заполнено билетов:</div>
              <div className="text-lg font-black font-mono text-slate-900">
                {writtenQuestionsAnsweredCount} / 10
              </div>
            </div>
          </div>

          {!allTestsPassed && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-amber-900 text-xs">
              <AlertTriangle className="w-5 h-5 shrink-0 text-amber-700 mt-0.5" />
              <div>
                <b className="font-bold">Внимание:</b> Для направления результатов экзамена Председателю СК РФ вы обязаны предварительно сдать Тест №1, Тест №2 и Тест №3 (минимум 4/5 в каждом).
              </div>
            </div>
          )}

          {/* If the officer has already submitted the exam */}
          {currentSubmission ? (
            <div className={`p-6 rounded-2xl border text-center space-y-4 animate-in zoom-in-95 ${
              currentSubmission.status === 'approved'
                ? 'bg-emerald-50 border-emerald-200'
                : currentSubmission.status === 'rejected'
                ? 'bg-rose-50 border-rose-200'
                : 'bg-amber-50 border-amber-200'
            }`}>
              {currentSubmission.status === 'approved' ? (
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              ) : currentSubmission.status === 'rejected' ? (
                <AlertCircle className="w-12 h-12 text-rose-600 mx-auto" />
              ) : (
                <Clock className="w-12 h-12 text-amber-600 mx-auto animate-pulse" />
              )}

              <div className="space-y-1.5 max-w-xl mx-auto">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono ${
                  currentSubmission.status === 'approved'
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : currentSubmission.status === 'rejected'
                    ? 'bg-rose-100 text-rose-900 border border-rose-300'
                    : 'bg-amber-100 text-amber-900 border border-amber-300'
                }`}>
                  {currentSubmission.status === 'approved'
                    ? 'ЭКЗАМЕН ПРИНЯТ • ПРИКАЗ ПОДПИСАН'
                    : currentSubmission.status === 'rejected'
                    ? 'ЭКЗАМЕН ОТКЛОНЕН ПРЕДСЕДАТЕЛЕМ'
                    : 'НА ПРОВЕРКЕ У ПРЕДСЕДАТЕЛЯ СК РФ'}
                </span>

                <h4 className="text-base font-bold text-slate-900">
                  {currentSubmission.status === 'approved'
                    ? 'Поздравляем! Квалификационный экзамен успешно утвержден!'
                    : currentSubmission.status === 'rejected'
                    ? 'Экзаменационная работа возвращена на доработку'
                    : 'Экзаменационная работа направлена Председателю СК России'}
                </h4>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {currentSubmission.status === 'approved'
                    ? 'Председатель СК РФ проверил ваши ответы на 10 билетов и подписал приказ о присвоении вам специального звания «Лейтенант юстиции».'
                    : currentSubmission.status === 'rejected'
                    ? `Комментарий Председателя: ${currentSubmission.chairmanComment || 'Недостаточно подробные ответы. Изучите нормативную базу и пересдайте экзамен.'}`
                    : 'Ваша работа из 10 вопросов ожидает резолюции и проверки в Панели Председателя СК РФ (Генерал юстиции Чернов Д. М.).'}
                </p>
              </div>

              {currentSubmission.status === 'rejected' && (
                <div className="pt-2">
                  <button
                    onClick={() => {
                      const updated = allSubmissions.filter((s) => s.id !== currentSubmission.id);
                      saveExamSubmissions(updated);
                      setAllSubmissions(updated);
                      onShowToast('Экзаменационный лист разблокирован для повторного заполнения.');
                    }}
                    className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition cursor-pointer"
                  >
                    Пересдать и внести исправления в билеты
                  </button>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmitFinalExam} className="space-y-6">
              <div className="space-y-5">
                {QUALIFICATION_QUESTIONS.map((q) => (
                  <div
                    key={q.id}
                    className="p-4 sm:p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5 focus-within:border-[#85181b] transition"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-red-50 border border-red-200 text-[#85181b] font-mono font-bold text-xs flex items-center justify-center shrink-0">
                        {q.id}
                      </span>
                      <div className="space-y-1">
                        <label className="text-xs sm:text-sm font-bold text-slate-900 pt-0.5 leading-snug block">
                          {q.text}
                        </label>
                        <span className="text-[11px] text-slate-400 italic block">
                          Ориентир для ответа: {q.hint}
                        </span>
                      </div>
                    </div>

                    <textarea
                      rows={3}
                      value={examAnswers[q.id] || ''}
                      onChange={(e) => handleExamAnswerChange(q.id, e.target.value)}
                      placeholder="Введите развернутый мотивированный ответ со ссылками на закон, порядок действий и процессуальные нормы..."
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#85181b] resize-none leading-relaxed"
                    />
                  </div>
                ))}
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-slate-500 font-medium">
                  Заполнено <b>{writtenQuestionsAnsweredCount} из 10</b> билетов (минимум 8 для отправки)
                </div>

                <button
                  type="submit"
                  disabled={!allTestsPassed}
                  className="px-8 py-3 rounded-xl bg-[#85181b] hover:bg-[#6b1316] text-white font-bold text-xs shadow-md transition cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Отправить работу Председателю СК РФ на проверку</span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
