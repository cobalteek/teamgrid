export const russianFiveTwoHolidayMonthDays = new Set([
  '01-01',
  '01-02',
  '01-03',
  '01-04',
  '01-05',
  '01-06',
  '01-08',
  '02-23',
  '03-08',
  '05-01',
  '05-09',
  '06-12',
  '11-04',
])

export function isRussianFiveTwoHoliday(date: Date, useUtc = false) {
  const month = useUtc ? date.getUTCMonth() : date.getMonth()
  const day = useUtc ? date.getUTCDate() : date.getDate()
  const monthDay = `${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

  return russianFiveTwoHolidayMonthDays.has(monthDay)
}
