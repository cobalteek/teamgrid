import {
  dateFormats,
  timeFormats,
  userLocales,
  userThemes,
  weekStartOptions,
  type UserSettings,
} from '~~/types/user-settings'

const settingsKeys = ['locale', 'theme', 'timeFormat', 'dateFormat', 'weekStartsOn'] as const
const booleanSettingsKeys = ['excludeRussianFiveTwoHolidays'] as const

type SettingsKey = (typeof settingsKeys)[number]

const allowedValues: Record<SettingsKey, readonly string[]> = {
  locale: userLocales,
  theme: userThemes,
  timeFormat: timeFormats,
  dateFormat: dateFormats,
  weekStartsOn: weekStartOptions,
}

export function parseUserSettings(body: Record<string, unknown>) {
  const update: Partial<UserSettings> = {}

  for (const key of settingsKeys) {
    if (body[key] === undefined) continue

    if (typeof body[key] !== 'string' || !allowedValues[key].includes(body[key])) {
      throw createError({
        statusCode: 400,
        statusMessage: 'error.user.settingsInvalid',
      })
    }

    update[key] = body[key] as never
  }

  for (const key of booleanSettingsKeys) {
    if (body[key] === undefined) continue

    if (typeof body[key] !== 'boolean') {
      throw createError({
        statusCode: 400,
        statusMessage: 'error.user.settingsInvalid',
      })
    }

    update[key] = body[key]
  }

  return update
}
