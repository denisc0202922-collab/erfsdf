import React, { useState, useEffect } from 'react';
import { OfficerProfile, UserAccount, ChairmanOrder, RankType, UserRoleType } from '../types';
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
  UserCheck,
  User,
  Phone,
  FileCheck2,
  Check,
  X,
  Crosshair,
  BadgeCheck,
  ShieldCheck,
  MessageSquare,
  Briefcase,
  Users,
  Building2,
  ThumbsUp,
  ThumbsDown,
  Edit3
} from 'lucide-react';
import {
  QUALIFICATION_QUESTIONS,
  getExamSubmissions,
  saveExamSubmissions,
  ExamSubmission,
  InternshipTask,
  DEFAULT_INTERNSHIP_TASKS
} from '../data/examQuestions';
import { OfficialEmblem, OfficialStampSeal } from './OfficialEmblem';
import { OfficerPhoto } from './OfficerPhoto';
import { saveOfficerProfile, saveAccounts, saveOrders } from '../utils/storage';

interface JuniorExamViewProps {
  officer: OfficerProfile;
  accounts?: UserAccount[];
  orders?: ChairmanOrder[];
  userRole?: UserRoleType;
  onPromoteToLieutenant?: () => void;
  onUpdateOfficer?: (officer: OfficerProfile) => void;
  onUpdateAccounts?: (accounts: UserAccount[]) => void;
  onUpdateOrders?: (orders: ChairmanOrder[]) => void;
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
  accounts = [],
  orders = [],
  userRole = 'investigator',
  onPromoteToLieutenant,
  onUpdateOfficer,
  onUpdateAccounts,
  onUpdateOrders,
  onShowToast
}) => {
  const [selectedSection, setSelectedSection] = useState<'overview' | 'test1' | 'test2' | 'test3' | 'final_exam' | 'internship' | 'mentor_cabinet'>('overview');

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

  // Task notes editing state in internship view
  const [activeTaskNotes, setActiveTaskNotes] = useState<{ [id: number]: string }>({});

  // Mentor Review state for mentor cabinet
  const [selectedSubmissionForReview, setSelectedSubmissionForReview] = useState<ExamSubmission | null>(null);
  const [mentorReviewText, setMentorReviewText] = useState('');

  // Mentor choice during submission
  const availableMentors = accounts && accounts.length > 0
    ? accounts.filter((a) => a.role === 'investigator' || a.role === 'head' || a.role === 'admin' || a.rank !== 'Младший лейтенант юстиции')
    : [
        {
          id: 'acc-voronov',
          fullName: 'Воронов Андрей Сергеевич',
          rank: 'Майор юстиции' as RankType,
          position: 'Старший следователь по особо важным делам',
          departmentName: 'Отдел по расследованию особо важных дел (ОРОВД)',
          badgeNumber: 'СК-77-0482',
          photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
          callsign: 'Следователь-77'
        },
        {
          id: 'acc-chernov',
          fullName: 'Чернов Денис Максимович',
          rank: 'Генерал юстиции РФ' as RankType,
          position: 'Председатель Следственного комитета РФ',
          departmentName: 'Главное следственное управление (ГСУ)',
          badgeNumber: 'СК-77-0001',
          photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80',
          callsign: 'Центр-01'
        }
      ];

  const [selectedMentorName, setSelectedMentorName] = useState<string>(availableMentors[0]?.fullName || 'Воронов Андрей Сергеевич');

  const currentSubmission = allSubmissions.find(
    (s) => s.officerName.toLowerCase() === officer.fullName.toLowerCase() || s.badgeNumber === officer.badgeNumber
  );

  const isExamSubmitted = !!currentSubmission;
  const isOfficerJunior = officer.rank === 'Младший лейтенант юстиции';
  const isMentorOrSenior = officer.rank !== 'Младший лейтенант юстиции' || userRole === 'admin' || userRole === 'head';

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

  // Submit theoretical exam & assign to mentor for practical internship
  const handleSubmitFinalExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allTestsPassed) {
      onShowToast('Для допуска к стажировке необходимо сначала успешно сдать все 3 теоретических теста!');
      return;
    }

    if (writtenQuestionsAnsweredCount < 8) {
      onShowToast(`Для направления на стажировку необходимо ответить минимум на 8 из 10 билетов (сейчас: ${writtenQuestionsAnsweredCount}).`);
      return;
    }

    const mentor = availableMentors.find((m) => m.fullName === selectedMentorName) || availableMentors[0];

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
      status: 'internship',
      mentorName: mentor.fullName,
      mentorRank: mentor.rank,
      mentorPosition: mentor.position,
      mentorBadge: mentor.badgeNumber,
      internshipStartedAt: new Date().toLocaleString('ru-RU'),
      internshipTasks: DEFAULT_INTERNSHIP_TASKS.map((t) => ({ ...t }))
    };

    const existing = getExamSubmissions();
    const updated = [newSubmission, ...existing.filter((s) => s.officerName.toLowerCase() !== officer.fullName.toLowerCase())];
    saveExamSubmissions(updated);
    setAllSubmissions(updated);
    setSelectedSection('internship');

    onShowToast(`Теория сдана! Вы успешно направлены на следственную стажировку к наставнику: ${mentor.rank} ${mentor.fullName}!`);
  };

  // Toggle internship task completion
  const handleToggleTaskCompleted = (taskId: number) => {
    if (!currentSubmission || !currentSubmission.internshipTasks) return;
    const notes = activeTaskNotes[taskId];
    const updatedTasks = currentSubmission.internshipTasks.map((t) => {
      if (t.id === taskId) {
        const nextCompleted = !t.completed;
        return {
          ...t,
          completed: nextCompleted,
          completedAt: nextCompleted ? new Date().toLocaleString('ru-RU') : undefined,
          internNotes: notes !== undefined ? notes : t.internNotes
        };
      }
      return t;
    });

    const updatedSubmission: ExamSubmission = {
      ...currentSubmission,
      internshipTasks: updatedTasks
    };

    const updatedAll = allSubmissions.map((s) => (s.id === currentSubmission.id ? updatedSubmission : s));
    saveExamSubmissions(updatedAll);
    setAllSubmissions(updatedAll);
    onShowToast('Статус практического задания обновлен!');
  };

  // Save intern task report notes
  const handleSaveTaskNotes = (taskId: number) => {
    if (!currentSubmission || !currentSubmission.internshipTasks) return;
    const notes = activeTaskNotes[taskId] || '';
    const updatedTasks = currentSubmission.internshipTasks.map((t) => {
      if (t.id === taskId) {
        return {
          ...t,
          internNotes: notes,
          completed: true,
          completedAt: t.completedAt || new Date().toLocaleString('ru-RU')
        };
      }
      return t;
    });

    const updatedSubmission: ExamSubmission = {
      ...currentSubmission,
      internshipTasks: updatedTasks
    };

    const updatedAll = allSubmissions.map((s) => (s.id === currentSubmission.id ? updatedSubmission : s));
    saveExamSubmissions(updatedAll);
    setAllSubmissions(updatedAll);
    onShowToast(`Отчет по практическому заданию №${taskId} сохранен и передан наставнику!`);
  };

  // Mentor Decision: Give Approval ("Дать добро")
  const handleMentorApprove = (submission: ExamSubmission, customComment?: string) => {
    const feedback =
      customComment ||
      mentorReviewText ||
      'Стажировка пройдена успешно. Практические навыки следственной работы освоены в полном объеме, протоколы составлены грамотно. Даю добро на присвоение звания «Лейтенант юстиции».';

    const updatedSubmissions = allSubmissions.map((s) => {
      if (s.id === submission.id) {
        return {
          ...s,
          status: 'approved' as const,
          mentorApproved: true,
          mentorReview: feedback,
          reviewedAt: new Date().toLocaleString('ru-RU'),
          internshipTasks: s.internshipTasks?.map((t) => ({ ...t, mentorGrade: 'зачтено' as const }))
        };
      }
      return s;
    });
    saveExamSubmissions(updatedSubmissions);
    setAllSubmissions(updatedSubmissions);

    // Promote officer if current officer is the one approved
    if (
      submission.officerName.toLowerCase() === officer.fullName.toLowerCase() ||
      submission.badgeNumber === officer.badgeNumber
    ) {
      if (onPromoteToLieutenant) {
        onPromoteToLieutenant();
      } else if (onUpdateOfficer) {
        const updatedOfficer: OfficerProfile = {
          ...officer,
          rank: 'Лейтенант юстиции',
          awards: [...officer.awards, 'Квалификационный аттестат СК РФ (с отличием)']
        };
        onUpdateOfficer(updatedOfficer);
        saveOfficerProfile(updatedOfficer);
      }
    }

    // Update Accounts
    if (accounts && onUpdateAccounts) {
      const updatedAccounts = accounts.map((acc) => {
        if (
          acc.fullName.toLowerCase() === submission.officerName.toLowerCase() ||
          acc.badgeNumber === submission.badgeNumber
        ) {
          return {
            ...acc,
            rank: 'Лейтенант юстиции' as RankType
          };
        }
        return acc;
      });
      onUpdateAccounts(updatedAccounts);
      saveAccounts(updatedAccounts);
    }

    // Register official Chairman / Department Order
    if (orders && onUpdateOrders) {
      const newOrder: ChairmanOrder = {
        id: `ord-${Date.now()}`,
        orderNumber: `П-СК-${String(orders.length + 1).padStart(2, '0')}/24`,
        date: new Date().toISOString().split('T')[0],
        type: 'rank_promotion',
        title: `О присвоении специального звания «Лейтенант юстиции» (${submission.officerName})`,
        targetOfficerName: submission.officerName,
        targetDepartment: submission.department,
        content: `По результатам успешного прохождения следственной стажировки под кураторством наставника (${submission.mentorName || 'старшего следователя'}) и положительного отзыва:\n\n1. Присвоить очередное специальное звание «Лейтенант юстиции» сотруднику ${submission.officerName} (жетон ${submission.badgeNumber}).\n2. Наставнику (${submission.mentorName}) объявить благодарность за качественную подготовку молодого следователя.`,
        issuedBy: 'Чернов Денис Максимович, Генерал юстиции РФ',
        seal: true,
        status: 'active'
      };
      onUpdateOrders([newOrder, ...orders]);
      saveOrders([newOrder, ...orders]);
    }

    setSelectedSubmissionForReview(null);
    setMentorReviewText('');
    onShowToast(`Наставник дал добро! Стажировка офицера ${submission.officerName} успешно зачтена, присвоено звание «Лейтенант юстиции»!`);
  };

  // Mentor Decision: Reject / Send for Revision ("Отправить на доработку")
  const handleMentorReject = (submission: ExamSubmission, rejectReason: string) => {
    if (!rejectReason.trim()) {
      onShowToast('Укажите замечания и причину направления стажера на доработку!');
      return;
    }

    const updatedSubmissions = allSubmissions.map((s) => {
      if (s.id === submission.id) {
        return {
          ...s,
          status: 'rejected' as const,
          mentorApproved: false,
          mentorReview: rejectReason,
          reviewedAt: new Date().toLocaleString('ru-RU')
        };
      }
      return s;
    });
    saveExamSubmissions(updatedSubmissions);
    setAllSubmissions(updatedSubmissions);

    setSelectedSubmissionForReview(null);
    setMentorReviewText('');
    onShowToast(`Материалы стажировки ${submission.officerName} возвращены на доработку с замечаниями наставника.`);
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
              Программа подготовки: «Младший лейтенант → Стажировка → Лейтенант»
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <GraduationCap className="w-6 h-6 text-[#85181b]" />
            <span>Квалификационная аттестация и следственная стажировка</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-2xl mt-1 leading-relaxed">
            Полный цикл подготовки: теоретические тесты + письменный экзамен + практическая стажировка под кураторством следователя-наставника с итоговой аттестацией.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-3 rounded-2xl shrink-0">
          <div className="text-right">
            <div className="text-[11px] text-slate-500 font-bold">Служебный статус:</div>
            <div className="text-xs font-black text-slate-900">{officer.fullName}</div>
            <div className="text-[10px] text-[#85181b] font-mono font-bold">{officer.rank}</div>
          </div>
          <div className="w-11 h-11 shrink-0">
            <OfficerPhoto
              src={officer.photoUrl}
              alt={officer.fullName}
              className="w-full h-full rounded-xl object-cover border border-slate-300 shadow-sm"
              rank={officer.rank}
              fallbackInitials={officer.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            />
          </div>
        </div>
      </div>

      {/* Navigation Subtabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto pb-0">
        <button
          onClick={() => setSelectedSection('overview')}
          className={`py-2.5 px-4 rounded-t-xl font-bold text-xs transition cursor-pointer flex items-center gap-2 border-b-2 shrink-0 ${
            selectedSection === 'overview'
              ? 'border-[#85181b] text-[#85181b] bg-white shadow-sm'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Обзор программы</span>
        </button>

        <button
          onClick={() => setSelectedSection('test1')}
          className={`py-2.5 px-4 rounded-t-xl font-bold text-xs transition cursor-pointer flex items-center gap-2 border-b-2 shrink-0 ${
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
          className={`py-2.5 px-4 rounded-t-xl font-bold text-xs transition cursor-pointer flex items-center gap-2 border-b-2 shrink-0 ${
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
          className={`py-2.5 px-4 rounded-t-xl font-bold text-xs transition cursor-pointer flex items-center gap-2 border-b-2 shrink-0 ${
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
          className={`py-2.5 px-4 rounded-t-xl font-bold text-xs transition cursor-pointer flex items-center gap-2 border-b-2 shrink-0 ${
            selectedSection === 'final_exam'
              ? 'border-[#85181b] text-[#85181b] bg-white shadow-sm'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Экзамен (10 билетов)</span>
        </button>

        {/* INTERNSHIP TAB */}
        <button
          onClick={() => setSelectedSection('internship')}
          className={`py-2.5 px-4 rounded-t-xl font-bold text-xs transition cursor-pointer flex items-center gap-2 border-b-2 shrink-0 ${
            selectedSection === 'internship'
              ? 'border-[#85181b] text-[#85181b] bg-white shadow-sm'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Следственная стажировка</span>
          {currentSubmission && (
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
              currentSubmission.status === 'approved'
                ? 'bg-emerald-100 text-emerald-800'
                : currentSubmission.status === 'rejected'
                ? 'bg-red-100 text-red-800'
                : 'bg-amber-100 text-amber-900'
            }`}>
              {currentSubmission.status === 'approved' ? 'ДОБРО ДАНО' : currentSubmission.status === 'rejected' ? 'ДОРАБОТКА' : 'НА СТАЖИРОВКЕ'}
            </span>
          )}
        </button>

        {/* MENTOR CABINET TAB */}
        <button
          onClick={() => setSelectedSection('mentor_cabinet')}
          className={`py-2.5 px-4 rounded-t-xl font-bold text-xs transition cursor-pointer flex items-center gap-2 border-b-2 shrink-0 ${
            selectedSection === 'mentor_cabinet'
              ? 'border-[#85181b] text-[#85181b] bg-white shadow-sm'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4 text-amber-600" />
          <span>Кабинет наставника (Кураторство)</span>
          {allSubmissions.filter((s) => s.status === 'internship').length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-bold">
              {allSubmissions.filter((s) => s.status === 'internship').length}
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
                Порядок аттестации и стажировки офицеров
              </span>
              <h3 className="text-lg font-black text-slate-900">
                Инструкция по прохождению испытаний и наставничества
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
                Сдача 3 тестов с результатом не менее 80% (минимум 4 из 5 верных ответов). Охватывают процессуальный кодекс, устав и основы криминалистики.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <div className="w-8 h-8 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-[#85181b] font-bold text-xs">
                2
              </div>
              <h4 className="font-bold text-sm text-slate-900">Письменный экзамен (10 билетов)</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Развернутые ответы на 10 ключевых процессуальных вопросов: правило Миранды, применение оружия, презумпция невиновности, обыск и следственная тактика.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <div className="w-8 h-8 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-[#85181b] font-bold text-xs">
                3
              </div>
              <h4 className="font-bold text-sm text-slate-900">Следственная стажировка (5 заданий)</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Младший лейтенант передается на стажировку к следователю-наставнику. Выполняются 5 практических задач (ОМП, допрос, улики, процессуальный бланк, радиообмен). По итогам наставник пишет отзыв и дает добро на звание.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <div className="text-xs text-slate-500">
              Статус прохождения тестов: <b>{allTestsPassed ? 'Все 3 теста успешно сданы' : 'Требуется завершить тестирование'}</b>
            </div>

            <button
              onClick={() => setSelectedSection('test1')}
              className="px-6 py-2.5 rounded-xl bg-[#85181b] hover:bg-[#6b1316] text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-2"
            >
              <span>Приступить к тестированию</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. TESTS TABS (1, 2, 3)                                                   */}
      {/* ========================================================================= */}
      {(selectedSection === 'test1' || selectedSection === 'test2' || selectedSection === 'test3') && (() => {
        const testId = selectedSection === 'test1' ? 1 : selectedSection === 'test2' ? 2 : 3;
        const test = TESTS.find((t) => t.id === testId)!;
        const isSubmitted = submittedTests[testId];
        const score = calculateTestScore(testId);
        const answers = testAnswers[testId] || {};

        return (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-5 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-lg bg-red-50 border border-red-200 text-[#85181b] font-mono text-[11px] font-bold">
                    {test.badge}
                  </span>
                  {isSubmitted && (
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 ${score.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                      {score.passed ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                      {score.passed ? 'ТЕСТ СДАН' : 'ТЕСТ НЕ СДАН'} ({score.correct}/{score.total})
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-black text-slate-900">{test.title}</h3>
                <p className="text-xs text-slate-500 mt-1">{test.description}</p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-right shrink-0">
                <div className="text-[11px] text-slate-500 font-bold">Проходной балл:</div>
                <div className="text-sm font-black text-slate-900">4 из 5 (80%)</div>
              </div>
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
                        : selectedKey
                        ? 'bg-slate-50/80 border-slate-300'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="w-7 h-7 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div className="space-y-3 flex-1">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                          {q.question}
                        </h4>

                        {/* Options */}
                        <div className="grid grid-cols-1 gap-2">
                          {q.options.map((opt) => {
                            const isChosen = selectedKey === opt.key;
                            let optClass = 'bg-white border-slate-200 hover:border-slate-300 text-slate-700';

                            if (isSubmitted) {
                              if (opt.key === q.correctAnswer) {
                                optClass = 'bg-emerald-100 border-emerald-500 text-emerald-950 font-bold';
                              } else if (isChosen && !isCorrect) {
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
                  ЭКЗАМЕНАЦИОННЫЙ ЛИСТ
                </span>
                {allTestsPassed ? (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Допуск получен (3 теста сданы)
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Требуется успешная сдача 3 тестов
                  </span>
                )}
              </div>
              <h3 className="text-xl font-black text-slate-900">
                Письменный квалификационный экзамен (10 билетов)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                После отправки экзаменационного листа младший лейтенант распределяется на следственную стажировку к наставнику.
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
                <b className="font-bold">Внимание:</b> Для направления на стажировку вы обязаны предварительно сдать Тест №1, Тест №2 и Тест №3 (минимум 4/5 в каждом).
              </div>
            </div>
          )}

          {/* Form to submit exam & choose mentor */}
          <form onSubmit={handleSubmitFinalExam} className="space-y-6">
            
            {/* Mentor Selection Box */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-red-50/70 to-amber-50/50 border border-red-200 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                <UserCheck className="w-4 h-4 text-[#85181b]" />
                <span>Назначение следователя-наставника для стажировки:</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {availableMentors.map((m) => (
                  <label
                    key={m.fullName}
                    className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition ${
                      selectedMentorName === m.fullName
                        ? 'bg-white border-[#85181b] shadow-sm ring-1 ring-[#85181b]'
                        : 'bg-white/60 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="mentorChoice"
                      value={m.fullName}
                      checked={selectedMentorName === m.fullName}
                      onChange={() => setSelectedMentorName(m.fullName)}
                      className="text-[#85181b] focus:ring-[#85181b]"
                    />
                    <div className="w-9 h-9 shrink-0">
                      <OfficerPhoto
                        src={m.photoUrl}
                        alt={m.fullName}
                        className="w-full h-full rounded-lg object-cover border border-slate-200"
                        rank={m.rank}
                        fallbackInitials={m.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      />
                    </div>
                    <div className="text-xs">
                      <div className="font-bold text-slate-900">{m.fullName}</div>
                      <div className="text-[10px] text-[#85181b] font-medium">{m.rank}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* 10 Questions */}
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
                <Briefcase className="w-4 h-4" />
                <span>Завершить теорию и перейти на следственную стажировку</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. INVESTIGATIVE INTERNSHIP TAB (СЛЕДСТВЕННАЯ СТАЖИРОВКА И ПРАКТИКА)      */}
      {/* ========================================================================= */}
      {selectedSection === 'internship' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in">
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-5 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-lg bg-red-50 border border-red-200 text-[#85181b] font-mono text-[11px] font-bold">
                  ПРАКТИЧЕСКАЯ СТАЖИРОВКА
                </span>
                {currentSubmission?.status === 'approved' ? (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Наставник дал добро • Звание присвоено
                  </span>
                ) : currentSubmission?.status === 'rejected' ? (
                  <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-800 text-[10px] font-bold flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Требуется доработка заданий
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-bold flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Прохождение стажировки под кураторством
                  </span>
                )}
              </div>
              <h3 className="text-xl font-black text-slate-900">
                Дневник следственной стажировки младшего лейтенанта
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Выполните 5 практических процессуальных заданий совместно с закрепленным следователем-наставником.
              </p>
            </div>

            {currentSubmission?.mentorName && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3">
                <div className="text-right">
                  <div className="text-[10px] text-slate-500 font-bold uppercase">Следователь-наставник:</div>
                  <div className="text-xs font-bold text-slate-900">{currentSubmission.mentorName}</div>
                  <div className="text-[10px] text-[#85181b] font-medium">{currentSubmission.mentorRank}</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-red-100 border border-red-300 flex items-center justify-center text-[#85181b] font-bold text-xs">
                  СК
                </div>
              </div>
            )}
          </div>

          {!currentSubmission ? (
            <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
              <Briefcase className="w-12 h-12 text-slate-400 mx-auto" />
              <div className="max-w-md mx-auto space-y-1">
                <h4 className="text-base font-bold text-slate-800">Стажировка еще не инициирована</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Для направления на стажировку к следователю-наставнику сдайте 3 теоретических теста и отправьте экзаменационный лист из 10 билетов.
                </p>
              </div>
              <button
                onClick={() => setSelectedSection('final_exam')}
                className="px-6 py-2.5 rounded-xl bg-[#85181b] text-white font-bold text-xs shadow-md hover:bg-[#6b1316] transition cursor-pointer"
              >
                Перейти к экзаменационному листу
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Approval Success Banner if Approved */}
              {currentSubmission.status === 'approved' && (
                <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-2 border-emerald-300 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                      <Trophy className="w-7 h-7" />
                    </div>
                    <div>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-200 text-emerald-950 font-mono text-[10px] font-black uppercase">
                        СТАЖИРОВКА УСПЕШНО ЗАВЕРШЕНА
                      </span>
                      <h4 className="text-lg font-black text-emerald-950">
                        Следователь-наставник дал добро! Приказ подписан!
                      </h4>
                    </div>
                  </div>

                  <div className="p-4 bg-white/80 rounded-xl border border-emerald-200 text-xs text-slate-800 space-y-1.5">
                    <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Служебная характеристика-отзыв наставника ({currentSubmission.mentorName}):</span>
                    </div>
                    <p className="italic text-slate-700">
                      «{currentSubmission.mentorReview || 'Младший лейтенант проявил высокий уровень ответственности, строго соблюдает законность и правила процессуального оформления. Допущен к самостоятельной следственной работе.'}»
                    </p>
                    <div className="text-[10px] text-slate-500 pt-1 font-mono">
                      Дата аттестации: {currentSubmission.reviewedAt || new Date().toLocaleDateString('ru-RU')}
                    </div>
                  </div>
                </div>
              )}

              {/* Rework Banner if Rejected */}
              {currentSubmission.status === 'rejected' && (
                <div className="p-5 rounded-2xl bg-rose-50 border-2 border-rose-300 space-y-2">
                  <div className="flex items-center gap-2 text-rose-900 font-bold text-sm">
                    <AlertCircle className="w-5 h-5 text-rose-600" />
                    <span>Замечания наставника: материалы возвращены на доработку</span>
                  </div>
                  <p className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-rose-200">
                    {currentSubmission.mentorReview || 'Необходимо дополнить описательную часть протоколов и устранить ошибки в фиксации вещественных доказательств.'}
                  </p>
                </div>
              )}

              {/* 5 Practical Tasks List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-[#85181b]" />
                    <span>Практические задачи стажировки (5 этапов):</span>
                  </h4>
                  <span className="text-xs font-bold text-slate-500">
                    Выполнено: {currentSubmission.internshipTasks?.filter((t) => t.completed).length || 0} из 5
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {(currentSubmission.internshipTasks || DEFAULT_INTERNSHIP_TASKS).map((task) => {
                    const isTaskDone = task.completed;
                    const notesValue = activeTaskNotes[task.id] !== undefined ? activeTaskNotes[task.id] : (task.internNotes || '');

                    return (
                      <div
                        key={task.id}
                        className={`p-5 rounded-2xl border transition space-y-3 ${
                          isTaskDone
                            ? 'bg-emerald-50/40 border-emerald-200'
                            : 'bg-slate-50/60 border-slate-200'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <button
                              type="button"
                              onClick={() => handleToggleTaskCompleted(task.id)}
                              className={`w-7 h-7 rounded-xl border flex items-center justify-center font-mono font-bold text-xs shrink-0 transition cursor-pointer ${
                                isTaskDone
                                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                                  : 'bg-white border-slate-300 text-slate-600 hover:border-[#85181b]'
                              }`}
                              title="Отметить задание выполненным"
                            >
                              {isTaskDone ? <Check className="w-4 h-4" /> : task.id}
                            </button>

                            <div>
                              <div className="flex items-center gap-2">
                                <h5 className="text-sm font-bold text-slate-900 leading-snug">
                                  {task.title}
                                </h5>
                                {isTaskDone && (
                                  <span className="px-2 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                    ВЫПОЛНЕНО
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                                {task.description}
                              </p>
                            </div>
                          </div>

                          <div className="shrink-0 text-right">
                            <span className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-200 font-mono text-slate-700 font-bold uppercase">
                              {task.category}
                            </span>
                          </div>
                        </div>

                        {/* RP Instruction Callout */}
                        <div className="p-3 bg-white rounded-xl border border-slate-200/90 text-xs text-slate-600 flex items-start gap-2">
                          <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <b className="text-slate-800">RP-рекомендация:</b> {task.rpInstruction}
                          </div>
                        </div>

                        {/* Intern Report Notes Input */}
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                            <span>Отчет стажера о выполнении (номер дела, протокол, фабула):</span>
                            {task.completedAt && (
                              <span className="text-slate-400 font-mono font-normal">
                                Завершено: {task.completedAt}
                              </span>
                            )}
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={notesValue}
                              onChange={(e) =>
                                setActiveTaskNotes((prev) => ({
                                  ...prev,
                                  [task.id]: e.target.value
                                }))
                              }
                              placeholder="Например: Выезд осуществлен, протокол ОМП составлен по делу № 2026/08-14-УД..."
                              className="flex-1 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#85181b]"
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveTaskNotes(task.id)}
                              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                            >
                              Сохранить отчет
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Notification */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="text-slate-600">
                  Все выполненные пункты и отчеты синхронизируются в режиме реального времени в <b>Кабинете наставника</b>.
                </div>
                {currentSubmission.status === 'internship' && (
                  <button
                    type="button"
                    onClick={() => {
                      onShowToast('Материалы стажировки направлены наставнику на итоговую аттестацию!');
                    }}
                    className="px-6 py-2.5 rounded-xl bg-[#85181b] hover:bg-[#6b1316] text-white font-bold transition cursor-pointer shadow-sm"
                  >
                    Запросить аттестацию у наставника
                  </button>
                )}
              </div>
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MENTOR CABINET TAB (КУРАТОРСТВО И АТТЕСТАЦИЯ НАСТАВНИКА)                */}
      {/* ========================================================================= */}
      {selectedSection === 'mentor_cabinet' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-5 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 font-mono text-[11px] font-bold">
                  КАБИНЕТ НАСТАВНИКА
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 text-[10px] font-bold">
                  Кураторство и присвоение званий
                </span>
              </div>
              <h3 className="text-xl font-black text-slate-900">
                Аттестационная комиссия и кураторство стажеров
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Проверка практических отчетов стажеров, вынесение служебной характеристики и решение о допуске («Дать добро» / «На доработку»).
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-right">
              <div className="text-[11px] text-slate-500 font-bold">Всего стажеров в базе:</div>
              <div className="text-lg font-black font-mono text-slate-900">
                {allSubmissions.length}
              </div>
            </div>
          </div>

          {allSubmissions.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-500 space-y-2">
              <Users className="w-10 h-10 text-slate-400 mx-auto" />
              <div>Нет активных направлений на стажировку. Младшие лейтенанты появятся здесь после сдачи теоретического экзамена.</div>
            </div>
          ) : (
            <div className="space-y-5">
              {allSubmissions.map((sub) => {
                const isApproved = sub.status === 'approved';
                const isRejected = sub.status === 'rejected';
                const completedTasksCount = sub.internshipTasks?.filter((t) => t.completed).length || 0;

                return (
                  <div
                    key={sub.id}
                    className={`p-5 rounded-2xl border transition space-y-4 ${
                      isApproved
                        ? 'bg-emerald-50/30 border-emerald-200'
                        : isRejected
                        ? 'bg-rose-50/30 border-rose-200'
                        : 'bg-slate-50/80 border-slate-200'
                    }`}
                  >
                    {/* Header Info */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-100 text-[#85181b] font-bold text-sm flex items-center justify-center border border-red-200">
                          СК
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900">{sub.officerName}</h4>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isApproved
                                ? 'bg-emerald-100 text-emerald-800'
                                : isRejected
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-900'
                            }`}>
                              {isApproved ? 'ДОБРО ДАНО • ПОВЫШЕН' : isRejected ? 'НА ДОРАБОТКЕ' : 'ПРОХОДИТ СТАЖИРОВКУ'}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 font-medium">
                            {sub.department} • Жетон: <b className="font-mono text-slate-700">{sub.badgeNumber}</b>
                          </div>
                        </div>
                      </div>

                      <div className="text-right text-xs">
                        <div className="text-slate-500">Наставник: <b className="text-slate-800">{sub.mentorName || 'Воронов А.С.'}</b></div>
                        <div className="text-[11px] text-slate-400">Направлен: {sub.submittedAt}</div>
                      </div>
                    </div>

                    {/* Scores & Tasks Summary */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                      <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-0.5">
                        <span className="text-[10px] text-slate-500 font-bold uppercase">Тест №1 (УПК):</span>
                        <div className="font-mono font-bold text-slate-900">{sub.test1Score}</div>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-0.5">
                        <span className="text-[10px] text-slate-500 font-bold uppercase">Тест №2 (Устав):</span>
                        <div className="font-mono font-bold text-slate-900">{sub.test2Score}</div>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-0.5">
                        <span className="text-[10px] text-slate-500 font-bold uppercase">Тест №3 (Крим):</span>
                        <div className="font-mono font-bold text-slate-900">{sub.test3Score}</div>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-0.5">
                        <span className="text-[10px] text-slate-500 font-bold uppercase">Задачи стажировки:</span>
                        <div className="font-mono font-bold text-[#85181b]">{completedTasksCount} из 5 выполнено</div>
                      </div>
                    </div>

                    {/* Tasks Details List */}
                    {sub.internshipTasks && sub.internshipTasks.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-slate-200/80">
                        <div className="text-xs font-bold text-slate-800">Отчеты стажера по 5 практическим заданиям:</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          {sub.internshipTasks.map((t) => (
                            <div key={t.id} className="p-2.5 bg-white rounded-xl border border-slate-200 space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-800">№{t.id} {t.title}</span>
                                <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${t.completed ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                                  {t.completed ? 'Сделано' : 'В процессе'}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-600 italic">
                                {t.internNotes ? `«${t.internNotes}»` : 'Стажер еще не заполнил отчет по данному пункту.'}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Mentor Evaluation Area & Action Buttons */}
                    <div className="pt-3 border-t border-slate-200/80 space-y-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-800 block">
                          Служебная характеристика-отзыв наставника:
                        </label>
                        <textarea
                          rows={2}
                          defaultValue={sub.mentorReview || ''}
                          onChange={(e) => setMentorReviewText(e.target.value)}
                          placeholder="Напишите мотивированный отзыв о работе младшего лейтенанта на стажировке..."
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#85181b] resize-none leading-relaxed"
                        />
                      </div>

                      <div className="flex flex-wrap items-center justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => handleMentorReject(sub, mentorReviewText || 'Недостаточно полные отчеты по заданиям. Отправлено на повторную отработку.')}
                          className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                        >
                          <ThumbsDown className="w-4 h-4 text-rose-600" />
                          <span>Отправить на доработку</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleMentorApprove(sub)}
                          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md transition cursor-pointer flex items-center gap-2"
                        >
                          <ThumbsUp className="w-4 h-4" />
                          <span>Дать добро (Зачесть стажировку и присвоить звание)</span>
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

    </div>
  );
};

export default JuniorExamView;
