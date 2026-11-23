import { createError } from 'h3'
import { isSalaryType, normalizeSalaryAmount, type SalaryType } from '~~/types/salary'

type SalaryParserOptions = {
  preserveNone?: boolean
}

export function parseSalaryConfig(
  body: Record<string, unknown>,
  errorMessage: string,
  options: SalaryParserOptions = {},
) {
  const rawType = body.salaryType
  const isNoPay = options.preserveNone && rawType === 'none'
  const isEmptyType =
    rawType === null ||
    rawType === undefined ||
    rawType === '' ||
    rawType === 'inherit' ||
    (rawType === 'none' && !options.preserveNone)
  const salaryType: SalaryType | 'none' | null = isNoPay
    ? 'none'
    : isEmptyType
      ? null
      : isSalaryType(rawType)
        ? rawType
        : null

  if (!isEmptyType && !salaryType) {
    throw createError({ statusCode: 400, statusMessage: errorMessage })
  }

  const rawAmount = body.salaryAmount
  const salaryAmount = normalizeSalaryAmount(rawAmount)

  if (salaryType && salaryType !== 'none' && salaryAmount === null) {
    throw createError({ statusCode: 400, statusMessage: errorMessage })
  }

  if (salaryType === null && rawAmount !== null && rawAmount !== undefined && rawAmount !== '') {
    throw createError({ statusCode: 400, statusMessage: errorMessage })
  }

  return {
    salaryType,
    salaryAmount: salaryType && salaryType !== 'none' ? salaryAmount : null,
  }
}
