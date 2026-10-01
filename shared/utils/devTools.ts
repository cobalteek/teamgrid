import type { Branch } from "~~/types/utils"
export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
