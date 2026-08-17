export const ruBetterLocale = {
  code: 'ru',
  week: {
    dow: 1,
    doy: 7
  },
  buttonText: {
    prev: 'Пред',
    next: 'След',
    today: 'Сегодня',
    month: 'Месяц',
    week: 'Неделя',
    day: 'День',
    list: 'Повестка дня'
  },
  weekText: 'Неделя',
  allDayText: 'Весь день',
  moreLinkText(n : number) {
    return '+ ещё ' + n
  },
  
  noEventsText: 'Нет событий для отображения'
}

export const enBetterLocale = {
  code: 'en',
  week: {
    dow: 1,
    doy: 7
  },
  buttonText: {
    prev: 'Prev',
    next: 'Next',
    today: 'Today',
    month: 'Month',
    week: 'Week',
    day: 'Day',
    list: 'List'
  },
  weekText: 'Wk',
  allDayText: 'All-day',
  moreLinkText(n : number) {
    return '+ more ' + n
  },
  
  noEventsText: 'No events to display'
}