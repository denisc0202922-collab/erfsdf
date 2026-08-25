import { ProceduralDocument, CriminalCase, ReportRecord, Offender } from '../types';

export function documentToBBCode(doc: ProceduralDocument): string {
  const isSecretBadge = doc.isSecret ? '[COLOR=rgb(184, 49, 47)][B][ГРИФ: СОВЕРШЕННО СЕКРЕТНО][/B][/COLOR]\n' : '';
  
  return `[CENTER]${isSecretBadge}[IMG]https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Emblem_of_the_Investigative_Committee_of_Russia.svg/240px-Emblem_of_the_Investigative_Committee_of_Russia.svg.png[/IMG]
[B][SIZE=5]СЛЕДСТВЕННЫЙ КОМИТЕТ РОССИЙСКОЙ ФЕДЕРАЦИИ[/SIZE][/B]
[SIZE=4]ГЛАВНОЕ СЛЕДСТВЕННОЕ УПРАВЛЕНИЕ[/SIZE]
[HR][/HR]
[B][SIZE=4]${doc.docNumber}[/SIZE][/B]
[I]${doc.city} | Дата: ${doc.date}[/I]
[/CENTER]

[B]Следователь:[/B] ${doc.investigatorRank} ${doc.investigatorName}
[B]Должность:[/B] ${doc.investigatorPosition}
${doc.caseNumber ? `[B]Номер уголовного дела:[/B] ${doc.caseNumber}\n` : ''}${doc.suspectName ? `[B]Фигурант / Подозреваемый:[/B] ${doc.suspectName} (${doc.suspectBirth || ''})\n` : ''}${doc.articles?.length ? `[B]Квалификация (ст. УК РФ):[/B] ${doc.articles.join(', ')}\n` : ''}${doc.targetLocation ? `[B]Объект следственного действия:[/B] ${doc.targetLocation}\n` : ''}
[HR][/HR]
[CENTER][B][SIZE=4]ОПИСАТЕЛЬНО-МОТИВИРОВОЧНАЯ ЧАСТЬ (ФАБУЛА):[/SIZE][/B][/CENTER]
[QUOTE]
${doc.crimeDetails}
[/QUOTE]

[CENTER][B][SIZE=4]ПОСТАНОВИЛ / ПРЕДПИСАЛ:[/SIZE][/B][/CENTER]
[QUOTE]
${doc.decisionText}
[/QUOTE]

[HR][/HR]
[TABLE]
[TR]
[TD][B]Старший следователь по ОВД:[/B][/TD]
[TD][B]Подпись / Личный штамп:[/B][/TD]
[/TR]
[TR]
[TD]${doc.investigatorRank} ${doc.investigatorName}[/TD]
[TD][I]___(СК РФ / ${doc.docNumber})___[/I][/TD]
[/TR]
[/TABLE]
[RIGHT][B]М.П. [ ГЕРБОВАЯ ПЕЧАТЬ СЛЕДСТВЕННОГО УПРАВЛЕНИЯ ] [/B][/RIGHT]`;
}

export function reportToBBCode(report: ReportRecord): string {
  const juniorSection = report.juniorOfficerName
    ? `\n[B]Стажер / Помощник следователя:[/B] ${report.juniorOfficerName} (Жетон: ${report.juniorOfficerBadge || 'СК-77-0492'})\n[B]Рекомендация наставника:[/B] ${
        report.internshipRecommendation === 'promote_lieutenant'
          ? '[COLOR=rgb(39, 174, 96)]Ходатайствую о присвоении звания «Лейтенант юстиции» (Дать добро)[/COLOR]'
          : report.internshipRecommendation === 'excellent'
          ? '[COLOR=rgb(39, 174, 96)]С отличием • Ходатайствую о досрочном присвоении звания[/COLOR]'
          : '[COLOR=rgb(230, 126, 34)]Рекомендуется продление практической стажировки[/COLOR]'
      }\n`
    : '';

  return `[CENTER][IMG]https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Emblem_of_the_Investigative_Committee_of_Russia.svg/240px-Emblem_of_the_Investigative_Committee_of_Russia.svg.png[/IMG]
[B][SIZE=5]РАПОРТ О ПРОДЕЛАННОЙ РАБОТЕ[/SIZE][/B]
[SIZE=3]Следственный комитет Российской Федерации[/SIZE]
[HR][/HR]
[/CENTER]
[RIGHT]
[B]Кому:[/B] ${report.targetLeader}
[B]От кого:[/B] ${report.authorRank} ${report.authorName}
[B]Дата подачи:[/B] ${report.date}
[/RIGHT]

[CENTER][B][SIZE=4]${report.reportNumber}: ${report.title}[/SIZE][/B][/CENTER]
${juniorSection}
[B]1. Описание проделанной работы:[/B]
${report.summary}

[B]2. Перечень выполненных процессуальных и следственных действий:[/B]
${report.actionsPerformed.map((act, i) => `[B]${i + 1}.[/B] ${act}`).join('\n')}

[B]3. Статистические показатели и баллы:[/B]
${
  report.type === 'junior_internship'
    ? `- Норматив за кураторство и подготовку стажера: [B]25 баллов[/B]\n- Итоговые расчетные баллы: [B]25 баллов[/B]`
    : `- Проведено допросов: [B]${report.interrogationsCount}[/B]
- Приобщено вещественных доказательств: [B]${report.attachedEvidenceCount}[/B]
- Задержано / арестовано лиц: [B]${report.arrestsCount}[/B]
- Прикрепленные уголовные дела: ${report.attachedCases.join(', ') || 'Нет'}
- Расчетные баллы эффективности: [B]${report.pointsCalculated} баллов[/B]`
}

[HR][/HR]
[RIGHT]
[B]Служебная подпись:[/B] [I]${report.authorName} (СК-77)[/I]
[/RIGHT]`;
}

export function wantedPosterToBBCode(offender: Offender): string {
  return `[CENTER][COLOR=rgb(184, 49, 47)][B][SIZE=6]ВНИМАНИЕ: СЛЕДСТВЕННЫЙ КОМИТЕТ ИЩЕТ ПРЕСТУПНИКА![/SIZE][/B][/COLOR]
[SIZE=4]ОРИЕНТИРОВКА ФЕДЕРАЛЬНОГО РОЗЫСКА ГСУ СК РФ[/SIZE]
[HR][/HR]
[IMG]${offender.photoUrl}[/IMG]

[B][SIZE=5]${offender.fullName} ${offender.alias ? `(${offender.alias})` : ''}[/SIZE][/B]
[COLOR=rgb(226, 80, 65)][B]УРОВЕНЬ ОПАСНОСТИ: ${offender.dangerLevel.toUpperCase()} | УРОВЕНЬ РОЗЫСКА: ${'★'.repeat(offender.wantedLevel)}[/B][/COLOR]
[/CENTER]

[B]Дата рождения:[/B] ${offender.birthDate}
[B]Номер паспорта/ID:[/B] ${offender.passportNumber}
[B]Причастность к бандформированиям / ОПГ:[/B] ${offender.faction || 'Одиночка'}
[B]Инкриминируемые статьи УК РФ:[/B] ${offender.articles.join(', ')}
[B]Особые приметы:[/B] ${offender.distinctiveMarks}
[B]Возможный автотранспорт:[/B] ${offender.vehicle || 'Неизвестен'} (${offender.vehiclePlate || 'Без номеров'})
[B]Фабула розыска:[/B] ${offender.wantedReason || 'Уклонение от следствия и суда'}

[COLOR=rgb(184, 49, 47)][B]ВНИМАНИЕ:[/B] Преступник может быть вооружен автоматическим оружием! При обнаружении незамедлительно свяжитесь с дежурной частью СК РФ или по номеру 112.[/COLOR]`;
}
