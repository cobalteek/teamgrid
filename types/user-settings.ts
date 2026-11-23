export const userLocales = ['ru', 'en'] as const
export const userThemes = ['dark', 'light'] as const
export const timeFormats = ['24h', '12h'] as const
export const dateFormats = ['dmy', 'mdy'] as const
export const weekStartOptions = ['monday', 'sunday'] as const

export type UserLocale = (typeof userLocales)[number]
export type UserTheme = (typeof userThemes)[number]
export type TimeFormat = (typeof timeFormats)[number]
export type DateFormat = (typeof dateFormats)[number]
export type WeekStartsOn = (typeof weekStartOptions)[number]

export type UserSettings = {
  locale: UserLocale
  theme: UserTheme
  timeFormat: TimeFormat
  dateFormat: DateFormat
  weekStartsOn: WeekStartsOn
  excludeRussianFiveTwoHolidays: boolean
}

export type UpdateUserSettings = Partial<UserSettings>

export const defaultUserSettings: UserSettings = {
  locale: 'ru',
  theme: 'dark',
  timeFormat: '24h',
  dateFormat: 'dmy',
  weekStartsOn: 'monday',
  excludeRussianFiveTwoHolidays: false,
}
