import { defineStore } from 'pinia'
import type { Candidate } from '~~/types/candidate'

type RequestError = {
  data?: { message?: string }
  message?: string
}

function getErrorMessage(error: unknown) {
  if (typeof error !== 'object' || error === null) {
    return $t('error.candidate.loadCandidates')
  }

  const requestError = error as RequestError

  return requestError.data?.message ?? requestError.message ?? $t('error.candidate.loadCandidates')
}

export const useCandidateStore = defineStore('candidate', () => {
  const candidates = ref<Candidate[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function getCandidates() {
    isLoading.value = true
    error.value = null

    try {
      const headers = import.meta.server ? useRequestHeaders(['cookie']) : undefined

      candidates.value = await $fetch<Candidate[]>('/api/user/candidate', {
        credentials: 'include',
        method: 'GET',
        headers,
      })

      return candidates.value
    } catch (e: unknown) {
      error.value = getErrorMessage(e)
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function createCandidate(candidateData: Omit<Candidate, 'id'>) {
    try {
      const headers = import.meta.server ? useRequestHeaders(['cookie']) : undefined

      const newCandidate = await $fetch<Candidate>('/api/user/candidate', {
        credentials: 'include',
        method: 'POST',
        headers,
        body: candidateData,
      })

      candidates.value.push(newCandidate)

      return newCandidate
    } catch (e: unknown) {
      error.value = getErrorMessage(e)
      throw e
    }
  }

  return {
    candidates,
    isLoading,
    error,
    getCandidates,
    createCandidate,
  }
})