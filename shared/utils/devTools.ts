import type { Branch } from "~~/types/utils"
export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
export const activeBranch: Branch = process.env.NODE_ENV === 'production' ? 'master' : 'develop'
