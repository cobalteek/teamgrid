import { createError } from 'h3'
import {
  builtInBonusVariables,
  isBonusScope,
  type BonusScope,
  type BonusVariables,
} from '~~/types/bonus'

const automaticVariables = new Set<string>(builtInBonusVariables)
const identifierPattern = /^[A-Za-z_][A-Za-z0-9_]*$/

type FormulaToken =
  | { type: 'number'; value: number }
  | { type: 'identifier'; value: string }
  | { type: 'operator'; value: '+' | '-' | '*' | '/' }
  | { type: 'parenthesis'; value: '(' | ')' }

function tokenizeFormula(formula: string) {
  if (formula.length === 0 || formula.length > 500) {
    throw new Error('Formula length is invalid')
  }

  const tokens: FormulaToken[] = []
  let index = 0

  while (index < formula.length) {
    const character = formula[index]

    if (!character) break
    if (/\s/.test(character)) {
      index += 1
      continue
    }

    const numberMatch = formula.slice(index).match(/^(?:\d+(?:\.\d*)?|\.\d+)/)
    if (numberMatch?.[0]) {
      const value = Number(numberMatch[0])
      if (!Number.isFinite(value)) throw new Error('Number is invalid')
      tokens.push({ type: 'number', value })
      index += numberMatch[0].length
      continue
    }

    const identifierMatch = formula.slice(index).match(/^[A-Za-z_][A-Za-z0-9_]*/)
    if (identifierMatch?.[0]) {
      tokens.push({ type: 'identifier', value: identifierMatch[0] })
      index += identifierMatch[0].length
      continue
    }

    if ('+-*/'.includes(character)) {
      tokens.push({ type: 'operator', value: character as '+' | '-' | '*' | '/' })
      index += 1
      continue
    }

    if (character === '(' || character === ')') {
      tokens.push({ type: 'parenthesis', value: character })
      index += 1
      continue
    }

    throw new Error('Formula contains an unsupported character')
  }

  if (!tokens.length || tokens.length > 100) throw new Error('Formula tokens are invalid')
  return tokens
}

export function getFormulaVariables(formula: string) {
  const variables = new Set<string>()

  for (const token of tokenizeFormula(formula)) {
    if (token.type === 'identifier') variables.add(token.value)
  }

  return [...variables]
}

function evaluateTokens(tokens: FormulaToken[], variables: BonusVariables) {
  let index = 0

  function parseExpression(): number {
    let value = parseTerm()

    while (true) {
      const token = tokens[index]
      if (!token || token.type !== 'operator' || !['+', '-'].includes(token.value)) break
      const operator = token.value
      index += 1
      const nextValue = parseTerm()
      value = operator === '+' ? value + nextValue : value - nextValue
    }

    return value
  }

  function parseTerm(): number {
    let value = parseFactor()

    while (true) {
      const token = tokens[index]
      if (!token || token.type !== 'operator' || !['*', '/'].includes(token.value)) break
      const operator = token.value
      index += 1
      const nextValue = parseFactor()
      if (operator === '/' && nextValue === 0) throw new Error('Division by zero')
      value = operator === '*' ? value * nextValue : value / nextValue
    }

    return value
  }

  function parseFactor(): number {
    const token = tokens[index]
    if (!token) throw new Error('Unexpected end of formula')

    if (token.type === 'operator' && token.value === '-') {
      index += 1
      return -parseFactor()
    }

    if (token.type === 'number') {
      index += 1
      return token.value
    }

    if (token.type === 'identifier') {
      index += 1
      const value = variables[token.value]
      if (value === undefined) throw new Error(`Missing variable: ${token.value}`)
      return value
    }

    if (token.type === 'parenthesis' && token.value === '(') {
      index += 1
      const value = parseExpression()
      const closingToken = tokens[index]
      if (closingToken?.type !== 'parenthesis' || closingToken.value !== ')') {
        throw new Error('Parentheses are unbalanced')
      }
      index += 1
      return value
    }

    throw new Error('Unexpected formula token')
  }

  const result = parseExpression()
  if (index !== tokens.length || !Number.isFinite(result))
    throw new Error('Formula result is invalid')
  return result
}

export function validateFormula(formula: unknown) {
  if (typeof formula !== 'string') throw new Error('Formula is required')
  const variables = getFormulaVariables(formula)

  for (const variable of variables) {
    if (!identifierPattern.test(variable)) throw new Error('Variable name is invalid')
  }

  evaluateTokens(tokenizeFormula(formula), {
    salary: 1,
    hours: 1,
    shifts: 1,
    days: 1,
    ...Object.fromEntries(variables.map((variable) => [variable, 1])),
  })

  return variables
}

export function evaluateFormula(formula: string, variables: BonusVariables) {
  return evaluateTokens(tokenizeFormula(formula), variables)
}

export function parseBonusRule(body: Record<string, unknown>) {
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const formula = typeof body.formula === 'string' ? body.formula.trim() : ''
  const scope = body.scope

  if (name.length < 1 || name.length > 120 || !isBonusScope(scope)) {
    throw createError({ statusCode: 400, statusMessage: 'error.bonus.invalidRule' })
  }

  let variableNames: string[]
  try {
    variableNames = validateFormula(formula)
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'error.bonus.invalidFormula' })
  }

  const positionId =
    body.positionId === null || body.positionId === undefined ? null : Number(body.positionId)
  const employeeId =
    body.employeeId === null || body.employeeId === undefined ? null : String(body.employeeId)

  if (
    scope === 'position' &&
    (positionId === null || !Number.isInteger(positionId) || positionId <= 0)
  ) {
    throw createError({ statusCode: 400, statusMessage: 'error.bonus.targetRequired' })
  }
  if (scope === 'employee' && !employeeId) {
    throw createError({ statusCode: 400, statusMessage: 'error.bonus.targetRequired' })
  }

  return { name, formula, scope: scope as BonusScope, positionId, employeeId, variableNames }
}

export function parseBonusVariables(body: Record<string, unknown>, variableNames: string[]) {
  const input = body.variables
  if (input === null || typeof input !== 'object' || Array.isArray(input)) {
    throw createError({ statusCode: 400, statusMessage: 'error.bonus.invalidVariables' })
  }

  const variables: BonusVariables = {}
  for (const name of variableNames) {
    if (automaticVariables.has(name)) continue
    const rawValue = (input as Record<string, unknown>)[name]
    if (rawValue === '' || rawValue === null || rawValue === undefined) {
      throw createError({ statusCode: 400, statusMessage: 'error.bonus.invalidVariables' })
    }
    const value = Number(rawValue)
    if (!Number.isFinite(value)) {
      throw createError({ statusCode: 400, statusMessage: 'error.bonus.invalidVariables' })
    }
    variables[name] = Math.round(value * 100) / 100
  }

  return variables
}
